# Feather by Hanna Change Request API

This contract connects Feather's server-side `lib/server/change-request-service.ts` boundary to Elevate Systems. The shared credential must only exist in each hosting provider's encrypted server environment. It must never be prefixed with `NEXT_PUBLIC_`, returned to a browser, committed, or pasted into a task prompt.

## Endpoints

- Submit: `POST https://elevatesystems.us/api/integrations/feather/change-requests`
- Poll status: `GET https://elevatesystems.us/api/integrations/feather/change-requests/{requestId}`

Elevate manages these external statuses: `Submitted`, `In Progress`, `Needs Information`, `Completed`, and `Cancelled`.

## Authentication

Every request requires:

- `X-Elevate-Client: feather-by-hanna`
- `X-Elevate-Timestamp: <current Unix timestamp in seconds>`
- `X-Elevate-Signature: sha256=<lowercase hex HMAC-SHA256>`

Build the canonical message exactly as four newline-delimited values:

```text
<timestamp>
<UPPERCASE HTTP method>
<URL pathname including query string>
<lowercase hex SHA-256 of the exact HTTP body bytes>
```

Sign that UTF-8 message using HMAC-SHA256 and `FEATHER_ELEVATE_INTEGRATION_SECRET`. GET requests use the SHA-256 digest of an empty body. Timestamps more than five minutes from Elevate's clock are rejected.

## JSON submission

Use `Content-Type: application/json` when there are no attachments.

```json
{
  "externalSiteId": "feather-by-hanna",
  "requestId": "feather-request-uuid",
  "title": "Update the bridal collection page",
  "category": "Content",
  "description": "Replace the hero copy and add the supplied collection image.",
  "priority": "Normal",
  "affectedArea": "/collections/bridal",
  "createdAt": "2026-09-20T14:00:00.000Z",
  "requester": {
    "name": "Hanna Example",
    "email": "hanna@example.com",
    "businessName": "Feather by Hanna"
  }
}
```

`priority` accepts `Low`, `Normal`, `High`, or `Urgent`. `affectedArea` and `requester.email` may be `null` or omitted. All other fields are required.

## Protected attachments

For attachments, send `multipart/form-data` with:

- `payload`: the full JSON document above as a string field.
- `attachments`: up to five repeated file fields.

Accepted content is PDF, PNG, JPEG, or WebP. Elevate checks file signatures rather than trusting names or supplied MIME types. Each file is limited to 8 MB, all files to 20 MB, and the complete request to 25 MB. Files are stored in a private Supabase bucket and are only exposed to an authenticated Elevate admin through one-minute signed URLs.

The HMAC body digest must cover the exact serialized multipart bytes and boundary sent over the network. Build the complete body first, sign its bytes, then send those same bytes.

## Response

New requests return HTTP `202`:

```json
{
  "ticketId": "ELV-123456789ABC",
  "status": "Submitted",
  "accepted": true,
  "createdAt": "2026-09-20T14:00:03.000Z",
  "duplicate": false
}
```

Retrying the same `requestId` for the same integration client returns the original ticket with HTTP `200` and `duplicate: true`. Feather should persist `ticketId` only after receiving `accepted: true`. Any non-2xx response means delivery was not accepted and may be retried with backoff.

## Status polling

Sign and send a GET request to the polling endpoint. A successful response is:

```json
{
  "ticketId": "ELV-123456789ABC",
  "requestId": "feather-request-uuid",
  "status": "In Progress",
  "createdAt": "2026-09-20T14:00:03.000Z",
  "updatedAt": "2026-09-20T15:30:00.000Z"
}
```

No outbound webhook is enabled yet. Feather must treat polling as the only supported status synchronization mechanism; it must not imply live synchronization in the UI.

## Errors and retry behavior

- `400`: invalid payload or attachment; correct the request before retrying.
- `401`: invalid client, signature, timestamp, or secret.
- `403`: the Feather integration has been disabled in Elevate.
- `404`: no matching request exists for status polling.
- `413`: request or attachments are too large.
- `429`: rate limit reached; honor `Retry-After`.
- `500`/`503`: temporary Elevate configuration or persistence failure; retry with exponential backoff.

## Deployment

1. Apply `supabase/migrations/202609200001_feather_change_requests.sql` to the Elevate Supabase project.
2. Generate a 32-byte or longer random secret locally. Do not print or commit it after creation.
3. Add these encrypted variables to the Elevate Vercel project for Production, Preview, and Development as appropriate:
   - `FEATHER_INTEGRATION_CLIENT_ID=feather-by-hanna`
   - `FEATHER_INTEGRATION_SECRET=<generated secret>`
   - `FEATHER_RATE_LIMIT_PER_10_MINUTES=60`
   - `SUPABASE_SUPPORT_BUCKET=support-attachments`
4. Add the same secret to Feather's encrypted hosting environment as `FEATHER_ELEVATE_INTEGRATION_SECRET`. Add `FEATHER_ELEVATE_API_URL=https://elevatesystems.us/api/integrations/feather/change-requests` and `FEATHER_ELEVATE_CLIENT_ID=feather-by-hanna`.
5. Redeploy Elevate after its variables and migration are present. Deploy the separate Feather integration only after Elevate's endpoint returns a signed test request successfully.
6. Rotate a compromised secret by updating both encrypted environments and redeploying both services. During rotation, submissions should fail closed rather than falling back to unsigned delivery.
