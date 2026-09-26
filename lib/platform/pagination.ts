import { PlatformError, uuid } from "./policy.ts";
export function encodeCursor(row: { id: string; created_at: string }) {
  return Buffer.from(JSON.stringify([row.created_at, row.id])).toString("base64url");
}
export function decodeCursor(value: string) {
  try {
    if (value.length > 256 || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error();
    const parts: unknown = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (
      !Array.isArray(parts) ||
      parts.length !== 2 ||
      typeof parts[0] !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})$/.test(parts[0]) ||
      !Number.isFinite(Date.parse(parts[0]))
    )
      throw new Error();
    return { created_at: parts[0], id: uuid(parts[1]) };
  } catch {
    throw new PlatformError(400, "INVALID_CURSOR", "The page cursor is invalid.");
  }
}
