# Platform setup and deployment

## Environments

Create a temporary **elevate-platform-staging** Supabase project and a separate staging application deployment. Never use the existing production Elevate or Feather database for experiments. Use synthetic people and a temporary test identity before Hanna's real account is invited. A placeholder email is not an actual working login.

Server variables:

```
PLATFORM_ENVIRONMENT=staging
PLATFORM_ORIGIN=https://<staging-app-host>
PLATFORM_SUPABASE_URL=https://<staging-project>.supabase.co
PLATFORM_SUPABASE_ANON_KEY=<encrypted hosting value>
PLATFORM_SUPABASE_SERVICE_ROLE_KEY=<encrypted hosting value>
```

Do not prefix server credentials with NEXT_PUBLIC. Production uses another Supabase project and another variable set. Local uses `PLATFORM_ENVIRONMENT=local`, localhost Origin and a local database/Auth stack. Database `platform_settings.environment` must agree with the runtime environment; mismatch fails intake closed.

## Migration order

On the empty staging project, apply `supabase-schema.sql`, then `202609200001_feather_change_requests.sql`, then `202609250001_platform_foundation.sql`, then `202609250002_platform_support.sql`. Track applied filenames in your migration runner. Do not replay the baseline migration on an established project blindly. PostgreSQL tests exercise this exact sequence on an ephemeral database.

The seed creates Feather by Hanna business `81c437f5-f64e-47c0-a71a-cc84da8914db`, but grants no users access. Configure the Supabase Auth site URL and allowlisted staging redirect URLs, disable public signup if invitations are the intended enrollment, set provider sign-in rate limits, and create/invite the test user. Add a `platform_memberships` row using its actual Auth UUID. Use business_owner for the synthetic Hanna role. Internal staff use explicit elevate_admin assignments. Never guess a user UUID or give access based on email domain.

The legacy `/admin` remains configured by its original `SUPABASE_*` variables. Platform staging records are visible through `/portal`; do not mix keys or silently redirect production admin to staging. Assigned Elevate staff can update platform request statuses there using the same support model.

## Credentials

Generate a cryptographically random 32-byte token body with a UUID key ID and the documented token format. Insert only its SHA-256 digest, business, environment, name, `['create:submission']`, and expiration into `platform_credentials`. Store the raw value directly in the Feather staging host's encrypted `ELEVATE_API_TOKEN` secret. Never print it in task messages. Use a second valid credential for rotation, verify delivery, then revoke the old one; external request IDs remain unchanged.

No credential-management endpoint is public in V1. Provision/revoke through a trusted database administrator with an audited procedure. The baseline membership and credential provisioning audit still needs a dedicated administrative workflow before delegation to business owners.

## Pilot verification

1. Deploy the API and portal to staging, with real Auth configuration and migrations.
2. Configure an isolated Feather preview's bindings/secrets and enable the outbox. No historical import.
3. Submit one synthetic consultation through Feather's existing form. Confirm the original local request still exists.
4. Drain the outbox with the authenticated endpoint or configured scheduler. Confirm an accepted response and persisted remote ID.
5. Sign in through `/portal`; verify the customer, lead, submission and activity. Repeat with another business's identity and verify the records cannot be read.
6. Repeat the same request to confirm idempotency. Change its payload to verify 409. Revoke the credential and verify delivery fails closed.
7. Create a change request as business_owner; verify only assigned Elevate staff can change status, and another business cannot read it.
8. Verify expired/invalid sessions, provider outages, rate limits, phone layout and cookie-origin rejection.

Production activation remains separate until all steps pass. No production traffic was switched just by committing this branch. Domain `app.elevatesystems.us` is not configured by source code alone.

## Remaining limitations

- Portal support attachments and provider-backed billing/orders/appointments are not implemented in this slice.
- Team/integration management pages use honest unavailable states; role provisioning is administrator-controlled.
- The legacy Feather ticket endpoint remains separately configured; explicit ownership migration is required for older tickets.
- Hosted Auth/Storage, live scheduling, and live data delivery must be tested after access is available. Unit/database tests cannot certify them.
- Supabase logout revokes refresh sessions; previously issued access JWTs may remain valid until expiry under the provider's token rules. No claim of immediate JWT revocation is made.
- Set data retention/deletion requirements before production expansion. Logs intentionally omit sensitive payloads.
