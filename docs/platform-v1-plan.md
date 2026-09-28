# Elevate Platform V1: assessment and implementation plan

Status: architecture established; implementation proceeds in reviewable phases. This document is not a claim of production readiness.

## Current architecture

Elevate is a Next.js 15 / React 19 application deployed on Vercel, using Supabase Postgres and private Storage through server-side REST requests. Existing leads, inquiries, bookings and purchases belong to Elevate's own sales workflow. They have no tenant boundary. The admin session is a signed expiry, not a user identity, and stored roles do not establish multi-business authorization. It must not authorize the new client portal.

The `codex/feather-change-request-integration` work is incorporated into this platform branch. It adds signed Feather intake to existing inquiries with private attachments and status polling. The portal reuses inquiries with explicit business/environment ownership; legacy records are not automatically assigned or exposed. Hosted migration and delivery verification remain required before activation.

Feather by Hanna uses React 19, Vinext on Cloudflare Workers, D1 database and private R2 uploads. Supabase Auth verifies explicit admin user IDs. Server handlers enforce same-origin writes and independently protect private reads. Its database holds customers, virtual/in-person consultations, photos, notes, follow-ups, managed website content, internal change requests and activity. Consultations use idempotent local persistence with recovery. Scheduling is a request/preference, not a confirmed appointment. No order fulfillment, message delivery, or external Elevate synchronization should be inferred from these records.

Inspected boundaries: `lib/server/request-endpoint.ts`, `consultation-store.ts`, `customer-store.ts`, `change-request-service.ts`, `admin-auth.ts`, `runtime.ts`; public consultation/appointment routes and protected admin routes. Deployment uses the existing Sites project, D1/R2 bindings, private GitHub repository, and `hanna.elevatesystems.us`. Existing notes identify real authentication activation and live smoke tests as pending; local code alone cannot establish their deployed status.

## Proposed architecture and repository structure

Keep a modular backend in the existing Elevate repository: `lib/platform/` for policies and service boundaries, `app/api/v1/` for HTTP adapters, `app/portal/` for the client portal, `supabase/migrations/` for additive database changes, `tests/platform/` for boundary tests, and `docs/platform/` for contracts/runbooks. Keep legacy `/admin` and the marketing site operational. A future `app.elevatesystems.us` host can route to the same application after cookie, origin, and hosting configuration is verified.

Use Supabase Auth's verified user identity. Never interpret an email domain, browser-selected organization, JWT decoded without verification, or the legacy admin cookie as tenant authorization. Every selected business requires an active membership. Elevate owner/admin roles use explicit assignments too; an owner provisioning tool may grant assignments with an audit record. No automatic all-tenant access from a browser role.

The request context contains user or credential identity, business ID, environment, and permissions. Shared policy code denies unknown roles/scopes. Database RLS reinforces business memberships for user tokens. Credentials are restricted to one business and one environment; the service-role path requires independently verified context and mandatory business predicates. Cross-business foreign keys prevent incorrectly associated resources.

## Schema plan

- Businesses: stable UUID, unique slug, display name, active flag.
- Memberships: verified Auth user ID, business ID, role, active flag. Elevate owner/admin and business owner/admin/member are explicit roles with centralized permissions.
- API credentials: business/environment, key identifier, token digest, scopes, expiry and revocation. Store only token hashes; distribute raw generated tokens using encrypted hosting secrets. Rotation creates a second credential, verifies delivery, then revokes the old one.
- Customers: business/environment, external customer identity, name/contact fields. No wig-specific columns. Never merge on email alone.
- Leads/submissions: business/environment, external ID, source, customer relation, schema identifier/version, validated data. Keep private measurements/photos/reason-for-wig in Feather for the initial pilot.
- Activity: business/environment, actor, type, resource ID, creation time and allowlisted metadata; immutable from business users.
- Change requests: business/environment, stable ID, requester, title/body, priority, relevant page, versioned status. Attachments require separate private storage authorization and real-content validation.
- Billing: external provider/customer/subscription references, service and invoice projections. No card numbers or security codes. Only verified provider events may assert paid status.
- Integrations and delivery receipts: business/environment, provider-neutral integration type, external event key, payload digest and delivery state. Transactionally insert customer/submission/lead/activity plus receipt; retries return the same result and changed payloads return conflict.

Use tenant-composite references, indexed tenant/time queries, and constrained environments (`local`, `staging`, `production`). Use physically separate Supabase projects for staging and production; an environment column supplements separation, not replaces it.

## API strategy

Implement V1 businesses/current memberships, customers (read), submissions (intake/read), leads (read), activity (read), and change requests first. Defer orders, payments, calendars and automations until there is an actual working integration. Unsupported functionality returns an honest unavailable state, never synthetic records.

Use JSON envelopes `{data, requestId}` and `{error:{code,message}, requestId}`; bounded JSON bodies, validated IDs and schemas, fixed maximum page sizes with opaque cursors, no-store private responses and request IDs. Authenticated write requests require permission checks. Cookie mutations additionally require same-origin/CSRF defenses. Rate limiting must use shared persistent state, not process-local memory on Vercel. Submission writes require an external event ID and payload-bound idempotency.

## Hannah migration plan

1. Keep D1 the source of truth during the pilot. Add an outbox row in the same D1 transaction that marks a consultation ready.
2. Send only an approved minimal projection: external request/customer IDs, request kind, timestamps and contact details. Do not forward photographs or sensitive intake answers by default.
3. A server worker drains the outbox to the scoped Elevate submissions endpoint. Retry timeouts/429/5xx with backoff; quarantine permanent validation/auth failures. Customer confirmation depends on local persistence, not external availability.
4. Elevate atomically persists the linked records and activity; return stable IDs. Persist acknowledgement only after a successful verified response. Use the local request ID as idempotency identity.
5. Test staging with synthetic people. Verify duplicate delivery, changed payload, tenant access, revoked credentials and network failure. Verify Feather intake and admin still work.
6. Configure Hanna's confirmed Auth identity and explicit membership. Verify she sees the mirrored staging data and no other business.
7. Enable production delivery only after staging passes, credentials are stored encrypted, and minimal data transfer is approved. Backfill is a separate authorized migration; never silently copy historical customers/photos.

## Phases and acceptance

1. Architecture and security foundation: assessment, migration model, policy implementation and tests. No production behavior changes.
2. Database-backed API: Auth verification, scoped credentials, persistent limits, transactional ingestion, real database integration tests including RLS.
3. Portal: working sign-in, business selector, overview/customer/lead/submission/activity pages and change requests; empty states for unimplemented modules.
4. Feather pilot: additive outbox integration, staging delivery, provider-authenticated portal smoke test and failure recovery.
5. Production activation: migration backup, least-privilege credentials, confirmed memberships, deployment, audit trail and live pilot verification.

## Security and operations

Log request IDs, code/status, integration ID and tenant ID after verification. Never log request bodies, contact details, attachments, cookies, passwords or raw tokens. Fail closed if authentication, tenant configuration, environment or database is unavailable. No wildcard CORS. Use bounded request timeouts. Session expiry/revocation must be checked through the provider; user role/membership must be loaded from current database state, not trusted browser claims.

Webhook signatures use raw body bytes, key ID, timestamp, method/path and digest with a short replay window. Persist provider event IDs so timestamp-valid replay is harmless. Do not expose an outbound-sync switch until delivery/retry handling exists. Until then use authenticated polling.

## Decisions and external prerequisites

- The user authorized a temporary staging project and test identity. Supabase sign-in authorization is still required before provisioning; never deliver access to an invented real email address. Hanna's actual confirmed identity is required for eventual live access.
- The user approved customer name, email, phone, request type, IDs and submission time for the pilot. Photos and sensitive consultation answers stay in Feather.
- Set retention/deletion policy before copying real records, especially sensitive consultation data.
- Confirm business-member permissions; initial least-privilege model permits operational reads, excludes billing/team management and private photos.
- Billing provider selection can wait; no payment handling is required to start the intake pilot.

No live migration, credential creation, real customer transfer or portal-access claim has been completed merely by writing this plan. Track each phase's evidence separately.
