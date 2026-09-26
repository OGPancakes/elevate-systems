import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { credentialContext, credentialId, type Credential } from "./credentials";
import { authorize, environment, memberContext, PlatformError, uuid, type Context, type Permission, type Role } from "./policy";

export const sessionCookie = "elevate_platform_session";
export function configuration() {
  const url = process.env.PLATFORM_SUPABASE_URL;
  const publicKey = process.env.PLATFORM_SUPABASE_ANON_KEY;
  const serviceKey = process.env.PLATFORM_SUPABASE_SERVICE_ROLE_KEY;
  const env = environment(process.env.PLATFORM_ENVIRONMENT);
  if (!url || !publicKey || !serviceKey || (env !== "local" && !url.startsWith("https://"))) throw new PlatformError(503, "NOT_CONFIGURED", "The platform is not connected yet.");
  return { url: url.replace(/\/$/, ""), publicKey, serviceKey, environment: env };
}

export async function provider<T>(path: string, options: { token?: string; method?: string; body?: unknown; admin?: boolean } = {}): Promise<T> {
  const config = configuration();
  const key = options.admin ? config.serviceKey : config.publicKey;
  let response: Response;
  try {
    response = await fetch(`${config.url}/${path}`, {
      method: options.method ?? "GET", headers: { apikey: key, Authorization: `Bearer ${options.token ?? key}`, "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body), cache: "no-store", signal: AbortSignal.timeout(12000)
    });
  } catch { throw new PlatformError(503, "PROVIDER_UNAVAILABLE", "The platform is temporarily unavailable."); }
  if (!response.ok) {
    const failure = await response.json().catch(() => ({})) as { code?: string };
    if (failure.code === "23505") throw new PlatformError(409, "IDEMPOTENCY_CONFLICT", "This request ID was already used with different information.");
    if (response.status === 401 || response.status === 403 || failure.code === "42501") throw new PlatformError(403, "ACCESS_DENIED", "Access could not be verified.");
    throw new PlatformError(503, "PERSISTENCE_UNAVAILABLE", "The platform could not complete the request.");
  }
  return await response.json() as T;
}

export async function userSession() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token || token.length > 8000) throw new PlatformError(401, "UNAUTHENTICATED", "Please sign in.");
  const user = await provider<{ id: string; email_confirmed_at?: string }>("auth/v1/user", { token });
  if (!user.email_confirmed_at) throw new PlatformError(401, "UNAUTHENTICATED", "Please verify your email.");
  return { id: uuid(user.id), token };
}

export async function context(request: Request, permission: Permission): Promise<{ principal: Context; token?: string }> {
  const config = configuration();
  const authorization = request.headers.get("authorization");
  if (authorization) {
    const supplied = credentialId(authorization);
    const records = await provider<Array<{ id: string; business_id: string; environment: Credential["environment"]; scopes: Permission[]; token_hash: string; expires_at: string; revoked_at: string | null; platform_businesses: { active: boolean } }>>(
      `rest/v1/platform_credentials?select=*,platform_businesses!inner(active)&id=eq.${supplied.id}&limit=1`, { admin: true });
    const row = records[0];
    const principal = credentialContext(authorization, row ? { id: row.id, businessId: row.business_id, environment: row.environment, scopes: row.scopes, tokenHash: row.token_hash, expiresAt: row.expires_at, revokedAt: row.revoked_at, businessActive: row.platform_businesses.active } : null, config.environment);
    authorize(principal, permission);
    await rateLimit(`credential:${principal.actorId}`);
    return { principal };
  }
  const session = await userSession();
  const businessId = uuid(request.headers.get("x-elevate-business"));
  const memberships = await provider<Array<{ role: Role; active: boolean; platform_businesses: { active: boolean } }>>(
    `rest/v1/platform_memberships?select=role,active,platform_businesses!inner(active)&business_id=eq.${businessId}&user_id=eq.${session.id}`, { token: session.token });
  const member = memberships[0];
  const principal = memberContext(session.id, businessId, config.environment, member ? { businessId, userId: session.id, role: member.role, active: member.active, businessActive: member.platform_businesses.active } : null);
  authorize(principal, permission);
  await rateLimit(`user:${session.id}`);
  return { principal, token: session.token };
}

export async function rateLimit(actor: string) {
  const accepted = await provider<boolean>("rest/v1/rpc/platform_rate_limit", { admin: true, method: "POST", body: { p_actor: actor, p_limit: 60 } });
  if (!accepted) throw new PlatformError(429, "RATE_LIMITED", "Please wait before trying again.");
}

export function sameOrigin(request: Request) {
  const expected = process.env.PLATFORM_ORIGIN;
  if (!expected || request.headers.get("origin") !== expected) throw new PlatformError(403, "INVALID_ORIGIN", "This request is not permitted.");
}

export function json(data: unknown, requestId: string, status = 200) {
  return Response.json({ data, requestId }, { status, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } });
}

export async function endpoint(work: (requestId: string) => Promise<Response>) {
  const requestId = randomUUID();
  try { return await work(requestId); }
  catch (error) {
    const failure = error instanceof PlatformError ? error : new PlatformError(500, "INTERNAL_ERROR", "The request could not be completed.");
    console.error(JSON.stringify({ event: "platform.request_failed", requestId, code: failure.code, status: failure.status }));
    return Response.json({ error: { code: failure.code, message: failure.message }, requestId }, { status: failure.status, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId, ...(failure.status === 429 ? { "Retry-After": "60" } : {}) } });
  }
}
