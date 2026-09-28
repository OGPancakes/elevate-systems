# Elevate API V1

Base path: `/api/v1`. Server-side secrets only. JSON replies use `{data, requestId}` or `{error:{code,message}, requestId}` and `Cache-Control: no-store`. `X-Request-ID` correlates redacted logs. No permissive CORS policy exists.

## Website intake

`POST /submissions` requires `Authorization: Bearer elv_<credential UUID>.<32 random bytes encoded base64url>` and `Content-Type: application/json`. The database stores only the SHA-256 digest of the complete token. Credentials bind one business/environment, explicit scopes, expiration and revocation. Required scope: `create:submission`. Do not send a business ID in the body.

Maximum body 16 KiB. Contract:

```json
{
  "externalId": "stable-local-consultation-id",
  "externalCustomerId": "stable-local-customer-id",
  "schema": "consultation.v1",
  "kind": "virtual",
  "createdAt": "2026-09-25T12:00:00Z",
  "customer": {"name":"Synthetic Pilot","email":"pilot@example.invalid","phone":null}
}
```

`kind` is `virtual` or `in-person`. IDs are 1–128 characters; name up to 160, email up to 254, phone optional up to 40. Unknown fields are rejected. Private photos, medical/intake answers, tenant IDs, generic unrestricted metadata and attachments are unsupported by this endpoint.

New intake returns 201, retry returns 200:

```json
{"data":{"id":"submission-uuid","customerId":"customer-uuid","createdAt":"timestamp","duplicate":false,"accepted":true},"requestId":"trace-uuid"}
```

The unique tenant/environment/external ID is the receipt. The normalized payload digest must match on retry; changed input returns 409. Customer, lead, submission and activity persist atomically. No email/SMS is implied by activity creation.

## Portal

`POST /session` accepts email/password, verifies them using Supabase Auth, and sets an HttpOnly, SameSite=Strict cookie (Secure outside local). Passwords are never locally hashed or stored. Sessions expire after at most one hour; this version requires signing in again and has no refresh-token persistence. `DELETE /session` revokes the provider session and clears the cookie. Cookie mutations require an exact `PLATFORM_ORIGIN` header match. Supabase provider rate controls must be configured for password sign-in.

`GET /businesses` returns businesses authorized by active membership and RLS. No automatic cross-tenant Elevate staff access exists. Operational endpoints additionally require `X-Elevate-Business: <UUID>` for cookie sessions.

- `GET /customers` and `/customers/{id}`
- `GET /leads`
- `GET /submissions`
- `GET /activity`

Lists accept `limit` 1–100 (default 25) and an opaque `cursor` returned as `nextCursor`. Result is `{items,nextCursor}`. Ordering is descending creation time with ID as the tie-breaker. Business/environment filtering applies before pagination. Inaccessible IDs return 404.

## Change requests

Portal sign-in is required; website credentials cannot call these routes yet. Requests use the existing `inquiries` support storage, with explicit platform business/environment ownership. Legacy internal notes and attachment paths are excluded.

`GET /change-requests` returns the most recent 100 requests, `canCreate`, and `canManage`. `POST` accepts `{requestId:<stable UUID>,title,description,priority,area}`. Title is 1–160 characters; description 1–8000; priority is Low/Normal/High/Urgent; area is optional up to 500. Unknown fields are rejected. Business owners/admins and assigned Elevate staff may create. Members can read only.

`PATCH /change-requests` accepts `{id,status,version}` and is restricted to explicitly assigned Elevate staff. Version conflict returns 409. Supported statuses: Submitted, Reviewing, Approved, In Progress, Needs Information, Ready for Review, Completed, Declined, Cancelled. Creation and updates write activity atomically.

Portal attachments are not exposed yet. The pre-existing signed Feather API retains its private attachment contract, but its records must be explicitly assigned platform ownership before portal visibility. Do not assume its separate legacy environment configuration points at the platform database.

## Errors and rate limits

401 missing/invalid identity, 403 missing permission, 404 absent/inaccessible resource, 409 duplicate payload or version conflict, 413 body too large, 415 media type, 422 validation, 429 shared rate limit, 503 missing configuration/provider/persistence failure. Authenticated API calls are limited to 60 per minute per identity through an atomic PostgreSQL counter. Honor `Retry-After`; retry timeout/429/5xx with backoff and the same payload identity.

## Extension boundaries

Billing stores external provider references only, with no card data. Orders, calendars, messaging, automations, public credential management and payment webhooks are not active endpoints. `verifyWebhook` is a tested raw-body HMAC verifier with a five-minute timestamp window, not a deployed webhook receiver or delivery mechanism. Until a complete webhook pipeline exists, use authenticated reads for status checks.
