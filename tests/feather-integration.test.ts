import assert from "node:assert/strict";
import test from "node:test";

import {
  createSignature,
  detectAttachmentType,
  insertIdempotently,
  validateAttachment,
  validateFeatherPayload,
  verifySignedRequest
} from "../lib/feather-integration.ts";

const payload = {
  externalSiteId: "feather-by-hanna",
  requestId: "req_123",
  title: "Update homepage copy",
  category: "Content",
  description: "Replace the seasonal headline.",
  priority: "High",
  affectedArea: "/",
  createdAt: "2026-09-20T14:00:00.000Z",
  requester: {
    name: "Hanna",
    email: "hanna@example.com",
    businessName: "Feather by Hanna"
  }
};

test("authorization accepts a valid HMAC signature", () => {
  const body = new TextEncoder().encode(JSON.stringify(payload));
  const timestamp = "1789912800";
  const signature = createSignature({
    body,
    method: "POST",
    pathWithQuery: "/api/integrations/feather/change-requests",
    secret: "test-secret",
    timestamp
  });
  assert.equal(verifySignedRequest({
    body,
    method: "POST",
    pathWithQuery: "/api/integrations/feather/change-requests",
    secret: "test-secret",
    signature: `sha256=${signature}`,
    timestamp,
    nowSeconds: 1789912800
  }), true);
});

test("unauthorized and replayed requests are rejected", () => {
  const body = new TextEncoder().encode("{}");
  const timestamp = "1789912800";
  const signature = createSignature({
    body,
    method: "POST",
    pathWithQuery: "/api/integrations/feather/change-requests",
    secret: "correct-secret",
    timestamp
  });
  assert.equal(verifySignedRequest({
    body,
    method: "POST",
    pathWithQuery: "/api/integrations/feather/change-requests",
    secret: "wrong-secret",
    signature,
    timestamp,
    nowSeconds: 1789912800
  }), false);
  assert.equal(verifySignedRequest({
    body,
    method: "POST",
    pathWithQuery: "/api/integrations/feather/change-requests",
    secret: "correct-secret",
    signature,
    timestamp,
    nowSeconds: 1789913401
  }), false);
});

test("validation normalizes supported input and rejects malformed data", () => {
  const result = validateFeatherPayload(payload);
  assert.equal(result.priority, "High");
  assert.equal(result.requester.businessName, "Feather by Hanna");
  assert.throws(() => validateFeatherPayload({ ...payload, requestId: "bad/request" }), /requestId/);
  assert.throws(() => validateFeatherPayload({ ...payload, priority: "Critical" }), /priority/);
  assert.throws(() => validateFeatherPayload({ ...payload, requester: { ...payload.requester, email: "bad" } }), /email/);
});

test("duplicate retries return the persisted ticket without inserting twice", async () => {
  const persisted = { ticketId: "ELV-ABC123" };
  let record: typeof persisted | null = null;
  let inserts = 0;
  const repository = {
    findExisting: async () => record,
    insert: async () => {
      inserts += 1;
      record = persisted;
      return persisted;
    }
  };
  const first = await insertIdempotently(repository);
  const retry = await insertIdempotently(repository);
  assert.equal(first.duplicate, false);
  assert.equal(retry.duplicate, true);
  assert.equal(retry.record.ticketId, persisted.ticketId);
  assert.equal(inserts, 1);
});

test("persistence races resolve to the record created by the competing request", async () => {
  const raced = { ticketId: "ELV-RACE123" };
  let lookups = 0;
  const result = await insertIdempotently({
    findExisting: async () => (++lookups > 1 ? raced : null),
    insert: async () => { throw new Error("unique constraint"); }
  });
  assert.equal(result.duplicate, true);
  assert.equal(result.record.ticketId, raced.ticketId);
});

test("attachments are identified from bytes rather than claimed MIME type", () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  assert.equal(detectAttachmentType(png), "image/png");
  assert.equal(validateAttachment({ bytes: png, name: "proof.exe" }).contentType, "image/png");
  assert.throws(
    () => validateAttachment({ bytes: new TextEncoder().encode("not really a pdf"), name: "fake.pdf" }),
    /not a supported/
  );
});
