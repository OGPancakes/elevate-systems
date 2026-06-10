# Elevate Systems

Premium Next.js website for Elevate Systems with AI chat, AI website audit lead capture, and booking flow.

## Lead Capture Setup

The website audit and booking forms work best with these Vercel environment variables:

- `OPENAI_API_KEY` for AI-generated website audits.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for storing leads in Supabase.
- `SUPABASE_LOGO_BUCKET` for optional logo uploads. Default: `lead-assets`.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `LEAD_NOTIFICATION_EMAIL` for email notifications.
- `MAKE_WEBHOOK_URL` as an optional automation webhook.

Run `supabase-schema.sql` in Supabase SQL Editor to create the lead tables and private logo bucket.
