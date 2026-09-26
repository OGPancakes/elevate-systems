import test from "node:test";
import assert from "node:assert/strict";
import { encodeCursor, decodeCursor } from "../../lib/platform/pagination.ts";

test("pagination preserves a stable timestamp and ID pair", () => {
  const row = {
    id: "81c437f5-f64e-47c0-a71a-cc84da8914db",
    created_at: "2026-09-25T12:00:00+00:00",
  };
  assert.deepEqual(decodeCursor(encodeCursor(row)), row);
});

test("pagination rejects malformed cursors and filter injection", () => {
  for (const value of [
    "",
    "x".repeat(257),
    "bad!cursor",
    Buffer.from(
      JSON.stringify(["2026-09-25T12:00:00Z),id.gt.any", "81c437f5-f64e-47c0-a71a-cc84da8914db"]),
    ).toString("base64url"),
    Buffer.from(JSON.stringify(["2026-09-25T12:00:00Z", "anything"])).toString("base64url"),
  ]) {
    assert.throws(() => decodeCursor(value), { code: "INVALID_CURSOR" });
  }
});
