# Elevate Platform development

## Architecture
The marketing website and legacy Elevate sales admin remain in this Next.js repository. Platform code is additive under `lib/platform`, `/api/v1` and `/portal`. Identity is verified through Supabase Auth. Platform credentials and membership queries must never use the legacy signed-expiry admin cookie. Supabase project separation is required for local/staging/production. Feather has a separate repository and D1/R2 source of truth.

## Commands
Install with `npm ci`. Run `npm run dev`, `npx tsc --noEmit`, `npm run test:platform`, `npm run test:feather`, and `npm run build`. PostgreSQL tests use the development-only PGlite engine and synthetic data; they do not replace hosted Supabase Auth/Storage smoke tests.

## Conventions and security
- Start with `docs/platform-v1-plan.md`, `docs/platform/api.md`, and `docs/platform/setup.md`.
- All business-specific rows and queries need business and environment ownership. Resource IDs are never sufficient authorization.
- API credentials derive their business from the verified credential record. Never trust body/query tenant IDs or browser roles. Recheck current memberships and credential revocation.
- User reads use user-token PostgREST with RLS. Service-role reads additionally require mandatory scoped predicates. Mutating SQL functions recheck current roles and ownership.
- Use bounded bodies, validated schemas, consistent JSON envelopes, no-store responses, persistent rate limits and payload-bound idempotency. Cookie writes require exact configured Origin.
- Never log bodies, passwords, access tokens, API tokens, private attachment paths, payment details or contact information. Never introduce fixture-login bypasses into production.
- Shared support records remain in `inquiries`; do not create another unrelated change-request queue. Do not expose internal notes through portal reads.
- Migrations are additive and reviewed against existing data. Never apply development migrations to production to test them.
- Do not copy private Feather photos/medical/intake details into common customer fields. The approved pilot payload contains only contact fields, request type, external IDs and timestamp.
- Store generated live secrets in encrypted hosting environments, never prompts, source files or committed fixtures. Credential rotation must preserve stable external IDs.
- No billing charge, confirmed appointment, successful delivery, or status sync may be displayed without verified persistence/provider evidence.

## Definition of done
The relevant automated suites and builds pass; tenant boundaries are verified in PostgreSQL; configuration-dependent tests are explicitly recorded as pending until run; real staging sign-in and delivery are verified before production activation. Keep the deployment runbook and remaining limitations current. Never describe a code-complete or fixture-tested feature as a live integration.
