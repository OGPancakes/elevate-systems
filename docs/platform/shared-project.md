# Existing Elevate project deployment

Decision (2026-09-28): use the existing Elevate Systems Supabase project, not another paid project. This supersedes the separate-project provisioning requirement in the original plan. It does not turn the production database into a test environment.

## Inspected live state

Project reference: `fvnpoahaozftmedkbjpr`. Nine public tables were present and all had RLS enabled: admin_users, booking_leads, bookings, bot_conversations, inquiries, leads, notification_recipients, purchases, website_audit_leads. No platform tables were present. The inquiry status constraint allows New, Contacted, Closed and Spam. Supabase showed a scheduled backup from roughly ten hours earlier and a project health warning; verify current health and backup availability immediately before migration.

## Deployment safeguards

- Never replay `supabase-schema.sql` on this existing database.
- Run local PostgreSQL regression tests first, including preservation of existing inquiry fields.
- Inspect existing inquiry policies and grants. Unknown permissive policies must block deployment rather than be silently removed.
- Apply only the reviewed Feather support, platform foundation and platform support migrations, together in one transaction with a short lock timeout. Set platform_settings.environment to production before commit. Abort if platform tables already exist; do not rerun blindly.
- The platform tables are new and empty. Existing inquiries remain unassigned and therefore unavailable to portal users. No customer records are backfilled.
- Preserve service-role access for the existing server-side admin. Client access is limited to safe columns and explicit business memberships. Internal notes remain private.
- Configure PLATFORM_ENVIRONMENT=production and the existing project URL/keys in encrypted hosting settings. Keep the old SUPABASE variables unchanged. Never point a deployed staging app at these production credentials.
- Provision the owner using the confirmed address support@elevatesystems.us through Supabase Auth. Do not reuse the old admin password or assign privileges by email domain. Invite-based password setup must be completed by the user.
- No Feather production delivery switch until authenticated portal access and ownership have been verified. Use isolated local tests for synthetic delivery; a real production pilot requires controlled rollout.

## Shared infrastructure risks

Marketing, admin and platform share database resources and Auth configuration. A database outage, project-level change or exhausted quota can affect them all. Tenant RLS separates client records but does not provide infrastructure isolation. Avoid project-wide Auth/SMTP changes without inspecting existing usage. A separately funded staging environment can be added later.

Inspection and this runbook alone do not mean the migration, invitation or deployment has been performed.
