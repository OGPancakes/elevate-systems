import { createHmac, createHash, timingSafeEqual } from "node:crypto";

export const FEATHER_ALLOWED_STATUSES = [
  "Submitted",
  "In Progress",
  "Needs Information",
  "Completed",
  "Cancelled"
] as const;

export type FeatherStatus = (typeof FEATHER_ALLOWED_STATUSES)[number];
export type FeatherPriority = "Low" | "Normal" | "High" | "Urgent";

export type FeatherRequester = {
  name: string;
  email: string | null;
  businessName: string;
};

export type FeatherChangeRequest = {
  externalSiteId: string;
  requestId: string;
  title: string;
  category: string;
  description: string;
  priority: FeatherPriority;
  affectedArea: string | null;
  createdAt: string;
  requester: FeatherRequester;
};

export type ValidatedAttachment = {
  bytes: Uint8Array;
  contentType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
  name: string;
  size: number;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const idPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const MAX_CLOCK_SKEW_SECONDS = 300;

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function requiredText(value: unknown, label: string, max: number) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${label} is required.`);
  if (text.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return text;
}

function optionalText(value: unknown, label: string, max: number) {
  if (value === undefined || value === null || value === "") return null;
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  if (text.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return text;
}

export function validateFeatherPayload(value: unknown): FeatherChangeRequest {
  const payload = asObject(value);
  if (!payload) throw new Error("Request payload must be a JSON object.");

  const requester = asObject(payload.requester);
  if (!requester) throw new Error("requester is required.");

  const externalSiteId = requiredText(payload.externalSiteId, "externalSiteId", 100);
  const requestId = requiredText(payload.requestId, "requestId", 128);
  if (!idPattern.test(externalSiteId) || !idPattern.test(requestId)) {
    throw new Error("externalSiteId and requestId may only use letters, numbers, dots, colons, underscores, and hyphens.");
  }

  const priorityInput = requiredText(payload.priority, "priority", 20).toLowerCase();
  const priorities: Record<string, FeatherPriority> = {
    low: "Low",
    normal: "Normal",
    high: "High",
    urgent: "Urgent"
  };
  const priority = priorities[priorityInput];
  if (!priority) throw new Error("priority must be Low, Normal, High, or Urgent.");

  const createdAtInput = requiredText(payload.createdAt, "createdAt", 40);
  const createdAt = new Date(createdAtInput);
  if (Number.isNaN(createdAt.getTime())) throw new Error("createdAt must be an ISO-8601 timestamp.");
  if (createdAt.getTime() > Date.now() + 5 * 60 * 1000) {
    throw new Error("createdAt cannot be more than five minutes in the future.");
  }

  const email = optionalText(requester.email, "requester.email", 254);
  if (email && !emailPattern.test(email)) throw new Error("requester.email must be a valid email address.");

  return {
    externalSiteId,
    requestId,
    title: requiredText(payload.title, "title", 200),
    category: requiredText(payload.category, "category", 100),
    description: requiredText(payload.description, "description", 10000),
    priority,
    affectedArea: optionalText(payload.affectedArea, "affectedArea", 200),
    createdAt: createdAt.toISOString(),
    requester: {
      name: requiredText(requester.name, "requester.name", 160),
      email,
      businessName: requiredText(requester.businessName, "requester.businessName", 160)
    }
  };
}

export function bodySha256(body: Uint8Array) {
  return createHash("sha256").update(body).digest("hex");
}

export function createSignature(input: {
  body: Uint8Array;
  method: string;
  pathWithQuery: string;
  secret: string;
  timestamp: string;
}) {
  const canonical = [
    input.timestamp,
    input.method.toUpperCase(),
    input.pathWithQuery,
    bodySha256(input.body)
  ].join("\n");
  return createHmac("sha256", input.secret).update(canonical).digest("hex");
}

export function verifySignedRequest(input: {
  body: Uint8Array;
  method: string;
  pathWithQuery: string;
  secret: string;
  signature: string | null;
  timestamp: string | null;
  nowSeconds?: number;
}) {
  if (!input.secret || !input.signature || !input.timestamp) return false;
  const timestampNumber = Number(input.timestamp);
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (!Number.isInteger(timestampNumber) || Math.abs(now - timestampNumber) > MAX_CLOCK_SKEW_SECONDS) {
    return false;
  }

  const expected = createSignature({
    body: input.body,
    method: input.method,
    pathWithQuery: input.pathWithQuery,
    secret: input.secret,
    timestamp: input.timestamp
  });
  const supplied = input.signature.replace(/^sha256=/i, "").toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(supplied)) return false;
  return timingSafeEqual(Buffer.from(supplied, "hex"), Buffer.from(expected, "hex"));
}

export function detectAttachmentType(bytes: Uint8Array): ValidatedAttachment["contentType"] | null {
  if (bytes.length >= 5 && Buffer.from(bytes.subarray(0, 5)).toString("ascii") === "%PDF-") {
    return "application/pdf";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    Buffer.from(bytes.subarray(0, 4)).toString("ascii") === "RIFF" &&
    Buffer.from(bytes.subarray(8, 12)).toString("ascii") === "WEBP"
  ) return "image/webp";
  return null;
}

export function validateAttachment(input: { bytes: Uint8Array; name: string }): ValidatedAttachment {
  const name = input.name.trim().slice(0, 180);
  if (!name) throw new Error("Every attachment needs a file name.");
  if (input.bytes.length === 0) throw new Error(`${name} is empty.`);
  if (input.bytes.length > 8 * 1024 * 1024) throw new Error(`${name} exceeds the 8 MB file limit.`);
  const contentType = detectAttachmentType(input.bytes);
  if (!contentType) throw new Error(`${name} is not a supported PDF, PNG, JPEG, or WebP file.`);
  return { bytes: input.bytes, contentType, name, size: input.bytes.length };
}

export function safeAttachmentName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "attachment";
}

export async function insertIdempotently<T>(input: {
  findExisting: () => Promise<T | null>;
  insert: () => Promise<T>;
}) {
  const existing = await input.findExisting();
  if (existing) return { record: existing, duplicate: true };
  try {
    return { record: await input.insert(), duplicate: false };
  } catch (error) {
    const raced = await input.findExisting();
    if (raced) return { record: raced, duplicate: true };
    throw error;
  }
}
