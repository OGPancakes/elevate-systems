import { PlatformError } from "./policy";
export async function readJson(
  request: Request,
  maximum = 16384,
): Promise<Record<string, unknown>> {
  if ((request.headers.get("content-type") ?? "").split(";")[0].trim() !== "application/json")
    throw new PlatformError(415, "UNSUPPORTED_MEDIA", "Use application/json.");
  const reader = request.body?.getReader();
  if (!reader) throw new PlatformError(400, "INVALID_JSON", "A JSON object is required.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      length += next.value.length;
      if (length > maximum) {
        await reader.cancel();
        throw new PlatformError(413, "BODY_TOO_LARGE", "The request is too large.");
      }
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new PlatformError(400, "INVALID_JSON", "A JSON object is required.");
  }
}
