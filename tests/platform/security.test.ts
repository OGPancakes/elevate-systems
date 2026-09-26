import assert from "node:assert/strict";
import { test } from "node:test";
import { createHmac, createHash } from "node:crypto";
import { assertOwnership, authorize, environment, memberContext, PlatformError, type Membership } from "../../lib/platform/policy.ts";
import { credentialContext, tokenDigest, verifyWebhook, type Credential } from "../../lib/platform/credentials.ts";
import { readSubmission, submissionDigest, validateSubmission } from "../../lib/platform/submission.ts";

const businessA = "81c437f5-f64e-47c0-a71a-cc84da8914db";
const businessB = "41c437f5-f64e-47c0-a71a-cc84da8914db";
const membership: Membership = { userId: "user-a", businessId: businessA, role: "business_owner", active: true, businessActive: true };
const principal = memberContext("user-a", businessA, "staging", membership);
const keyId = "a1c437f5-f64e-47c0-a71a-cc84da8914db";
const token = `elv_${keyId}.${"a".repeat(43)}`;
const credential: Credential = { id: keyId, businessId: businessA, environment: "staging", scopes: ["create:submission"], tokenHash: tokenDigest(token), expiresAt: "2099-01-01T00:00:00Z", revokedAt: null, businessActive: true };
const payload = { externalId: "consultation-1", externalCustomerId: "customer-1", schema: "consultation.v1", kind: "virtual", createdAt: "2026-01-01T00:00:00Z", customer: { name: "Test Customer", email: "pilot@example.invalid", phone: null } };
const denied = (error: unknown) => error instanceof PlatformError && [401,403,404].includes(error.status);

test("business A user cannot select business B or access its customer", () => {
  assert.throws(() => memberContext("user-a", businessB, "staging", membership), denied);
  assert.throws(() => assertOwnership(principal, { businessId: businessB, environment: "staging" }), denied);
});
test("identity mismatch, absent, inactive and revoked memberships fail closed", () => {
  assert.throws(() => memberContext("user-b", businessA, "staging", membership), denied);
  assert.throws(() => memberContext("user-a", businessA, "staging", null), denied);
  for (const field of ["active", "businessActive"]) assert.throws(() => memberContext("user-a", businessA, "staging", { ...membership, [field]: false }), denied);
});
test("Elevate staff also require an explicit membership for the selected business", () => {
  assert.throws(() => memberContext("user-a", businessB, "staging", { ...membership, role: "elevate_owner" }), denied);
});
test("business members cannot access billing, team controls or create requests", () => {
  const member = memberContext("user-a", businessA, "staging", { ...membership, role: "business_member" });
  authorize(member, "read:customers");
  for (const scope of ["read:billing", "manage:team", "create:change-request"] as const) assert.throws(() => authorize(member, scope), denied);
});
test("credentials enforce business ownership, scope, environment, expiry and revocation", () => {
  const service = credentialContext(`Bearer ${token}`, credential, "staging");
  assert.equal(service.businessId, businessA);
  authorize(service, "create:submission");
  assert.throws(() => authorize(service, "read:billing"), denied);
  assert.throws(() => credentialContext(`Bearer ${token}`, credential, "production"), denied);
  for (const patch of [{ revokedAt: new Date().toISOString() }, { businessActive: false }, { expiresAt: "2000-01-01" }, { expiresAt: "invalid" }, { tokenHash: "b".repeat(64) }]) {
    assert.throws(() => credentialContext(`Bearer ${token}`, { ...credential, ...patch }, "staging"), denied);
  }
  assert.throws(() => credentialContext(null, credential, "staging"), denied);
});
test("unknown environment and cross-environment reads fail closed", () => {
  assert.throws(() => environment(undefined));
  assert.throws(() => assertOwnership(principal, { businessId: businessA, environment: "production" }), denied);
});
test("intake rejects tenant injection, private photos and unsupported data", () => {
  for (const field of ["businessId", "photos", "reasonForWig", "metadata"]) assert.throws(() => validateSubmission({ ...payload, [field]: "private" }));
  assert.throws(() => validateSubmission({ ...payload, customer: { ...payload.customer, cardNumber: "test" } }));
  assert.throws(() => validateSubmission({ ...payload, schema: "unknown.v1" }));
  assert.throws(() => validateSubmission({ ...payload, createdAt: "not-a-date" }));
});
test("normalized retries have equal digests, changes have different digests", () => {
  const first = validateSubmission(payload);
  assert.equal(submissionDigest(first), submissionDigest(validateSubmission(Object.fromEntries(Object.entries(payload).reverse()))));
  assert.notEqual(submissionDigest(first), submissionDigest(validateSubmission({ ...payload, kind: "in-person" })));
});
test("bounded input rejects chunked oversize bodies and invalid content type", async () => {
  await assert.rejects(readSubmission(new Request("https://example.invalid", { method: "POST", headers: { "Content-Type": "application/json" }, body: " ".repeat(16385) })), (error: unknown) => error instanceof PlatformError && error.status === 413);
  await assert.rejects(readSubmission(new Request("https://example.invalid", { method: "POST", headers: { "Content-Type": "application/json-malicious" }, body: JSON.stringify(payload) })));
  assert.equal((await readSubmission(new Request("https://example.invalid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }))).externalId, payload.externalId);
});
test("webhook verifies raw body, path, timestamp and secret", () => {
  const body = Buffer.from('{"event":"test"}'); const now = 1800000000000; const timestamp = String(now / 1000); const secret = "test-only-secret-value-with-32-bytes";
  const path = "/api/v1/webhooks/test";
  const signature = "sha256=" + createHmac("sha256", secret).update([timestamp, "POST", path, createHash("sha256").update(body).digest("hex")].join("\n")).digest("hex");
  const input = { secret, timestamp, signature, method: "POST", path, body, now };
  assert.equal(verifyWebhook(input), true);
  for (const patch of [{ body: Buffer.from("changed") }, { path: "/other" }, { now: now + 301000 }, { signature: "bad" }, { secret: "short" }]) assert.equal(verifyWebhook({ ...input, ...patch }), false);
});
