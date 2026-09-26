import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import {
  environment,
  permissions,
  PlatformError,
  uuid,
  type Context,
  type Environment,
  type Permission,
} from "./policy.ts";

export type Credential = {
  id: string;
  businessId: string;
  environment: Environment;
  scopes: Permission[];
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
  businessActive: boolean;
};

export function tokenDigest(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function equalHex(actual: string, expected: string) {
  if (!/^[a-f0-9]{64}$/.test(actual) || !/^[a-f0-9]{64}$/.test(expected)) return false;
  return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

// Resolve by the public key ID; raw tokens must never enter database queries or logs.
export function credentialId(authorization: string | null) {
  const match = /^Bearer elv_([a-f0-9-]{36})\.([A-Za-z0-9_-]{43})$/.exec(authorization ?? "");
  if (!match)
    throw new PlatformError(401, "UNAUTHENTICATED", "Valid API credentials are required.");
  return { id: uuid(match[1]), token: `elv_${match[1]}.${match[2]}` };
}

export function credentialContext(
  authorization: string | null,
  record: Credential | null,
  selectedEnvironment: Environment,
  now = Date.now(),
): Context {
  const supplied = credentialId(authorization);
  if (
    !record ||
    record.id !== supplied.id ||
    record.revokedAt !== null ||
    !record.businessActive ||
    !Number.isFinite(Date.parse(record.expiresAt)) ||
    Date.parse(record.expiresAt) <= now ||
    record.environment !== environment(selectedEnvironment) ||
    !record.scopes.length ||
    record.scopes.some((scope) => !permissions.includes(scope)) ||
    !equalHex(tokenDigest(supplied.token), record.tokenHash)
  ) {
    throw new PlatformError(401, "UNAUTHENTICATED", "Valid API credentials are required.");
  }
  return {
    businessId: uuid(record.businessId),
    environment: selectedEnvironment,
    actorType: "credential",
    actorId: record.id,
    permissions: record.scopes,
  };
}

export function verifyWebhook(input: {
  secret: string;
  timestamp: string | null;
  signature: string | null;
  method: string;
  path: string;
  body: Uint8Array;
  now?: number;
}) {
  if (Buffer.byteLength(input.secret) < 32 || !/^\d{10}$/.test(input.timestamp ?? "")) return false;
  const timestamp = input.timestamp!;
  if (Math.abs((input.now ?? Date.now()) / 1000 - Number(timestamp)) > 300) return false;
  const digest = createHash("sha256").update(input.body).digest("hex");
  const canonical = [timestamp, input.method.toUpperCase(), input.path, digest].join("\n");
  const signature = createHmac("sha256", input.secret).update(canonical).digest("hex");
  return equalHex((input.signature ?? "").replace(/^sha256=/, ""), signature);
}
