import { createHash } from "node:crypto";
import { PlatformError } from "./policy.ts";

export type Submission = {
  externalId: string;
  externalCustomerId: string;
  schema: "consultation.v1";
  kind: "virtual" | "in-person";
  createdAt: string;
  customer: { name: string; email: string; phone: string | null };
};

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new PlatformError(422, "INVALID_SUBMISSION", "A submission object is required.");
  return value as Record<string, unknown>;
}

function exactKeys(value: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) throw new PlatformError(422, "UNKNOWN_FIELD", "The submission contains unsupported fields.");
}

function text(value: unknown, maximum: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > maximum || /[\u0000-\u001f]/.test(value)) throw new PlatformError(422, "INVALID_SUBMISSION", "A required field is missing or invalid.");
  return value.trim();
}

export function validateSubmission(input: unknown, now = Date.now()): Submission {
  const row = object(input);
  exactKeys(row, ["externalId", "externalCustomerId", "schema", "kind", "createdAt", "customer"]);
  const customer = object(row.customer);
  exactKeys(customer, ["name", "email", "phone"]);
  if (row.schema !== "consultation.v1" || !["virtual", "in-person"].includes(String(row.kind))) throw new PlatformError(422, "INVALID_SCHEMA", "This submission schema or kind is unsupported.");
  const createdAt = text(row.createdAt, 40);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(createdAt) || !Number.isFinite(Date.parse(createdAt)) || Date.parse(createdAt) > now + 300000) throw new PlatformError(422, "INVALID_TIMESTAMP", "A valid submission time is required.");
  const email = text(customer.email, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new PlatformError(422, "INVALID_EMAIL", "A valid email is required.");
  return {
    externalId: text(row.externalId, 128), externalCustomerId: text(row.externalCustomerId, 128),
    schema: "consultation.v1", kind: row.kind as Submission["kind"], createdAt: new Date(createdAt).toISOString(),
    customer: { name: text(customer.name, 160), email, phone: customer.phone == null ? null : text(customer.phone, 40) }
  };
}

// Hash the normalized contract in a fixed key order, not the incoming JSON order.
export function submissionDigest(submission: Submission) {
  return createHash("sha256").update(JSON.stringify(submission)).digest("hex");
}

export async function readSubmission(request: Request) {
  if ((request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase() !== "application/json") throw new PlatformError(415, "UNSUPPORTED_MEDIA", "Use application/json.");
  const reader = request.body?.getReader();
  if (!reader) throw new PlatformError(400, "INVALID_JSON", "A JSON body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.length;
      if (size > 16384) { await reader.cancel(); throw new PlatformError(413, "BODY_TOO_LARGE", "The submission is too large."); }
      chunks.push(next.value);
    }
  } finally { reader.releaseLock(); }
  let body: unknown;
  try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new PlatformError(400, "INVALID_JSON", "The JSON body is invalid."); }
  return validateSubmission(body);
}
