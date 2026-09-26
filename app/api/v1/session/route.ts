import { cookies } from "next/headers";
import { configuration, endpoint, json, provider, sameOrigin, sessionCookie } from "@/lib/platform/server";
import { PlatformError } from "@/lib/platform/policy";

export async function POST(request: Request) {
  return endpoint(async (requestId) => {
    sameOrigin(request);
    if (Number(request.headers.get("content-length")) > 4096) throw new PlatformError(413, "BODY_TOO_LARGE", "The request is too large.");
    const reader = request.body?.getReader();
    if (!reader) throw new PlatformError(400, "INVALID_LOGIN", "Email and password are required.");
    const chunks: Uint8Array[] = []; let size = 0;
    try {
      for (;;) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > 4096) { await reader.cancel(); throw new PlatformError(413,"BODY_TOO_LARGE","The request is too large."); } chunks.push(part.value); }
    } finally { reader.releaseLock(); }
    let input: { email?: unknown; password?: unknown };
    try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new PlatformError(400,"INVALID_LOGIN","Email and password are required."); }
    if (!input || typeof input.email !== "string" || typeof input.password !== "string" || input.email.length > 254 || input.password.length > 1024) throw new PlatformError(400,"INVALID_LOGIN","Email and password are required.");
    const result = await provider<{ access_token: string; expires_in: number; user: { email_confirmed_at?: string } }>("auth/v1/token?grant_type=password", { method: "POST", body: { email: input.email, password: input.password } });
    if (!result.user.email_confirmed_at || !result.access_token) throw new PlatformError(401,"UNAUTHENTICATED","Please verify your email.");
    (await cookies()).set(sessionCookie, result.access_token, { httpOnly: true, secure: configuration().environment !== "local", sameSite: "strict", path: "/", maxAge: Math.min(result.expires_in, 3600) });
    return json({ signedIn: true }, requestId);
  });
}
export async function DELETE(request: Request) {
  return endpoint(async (requestId) => { sameOrigin(request); (await cookies()).delete(sessionCookie); return json({ signedOut: true }, requestId); });
}
