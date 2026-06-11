# Elevate Systems

Premium Next.js website for Elevate Systems with AI chat, AI website audit lead capture, and booking flow.

## Product Demo Routing

The main site exposes a stable `/elevateorders` link while keeping the product
application in a separate codebase. Configure:

`ELEVATE_ORDERS_URL=https://orders.elevatesystems.us/elevateorders`

The company website redirects `/elevateorders` to that deployment. A redirect
is used instead of proxying because two Next.js applications otherwise compete
for `/_next` assets under the same host. For local development, run Elevate
Orders on port 3010.

## Lead Capture Setup

The website audit and booking forms work best with these Vercel environment variables:

- `OPENAI_API_KEY` for AI-generated website audits.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for storing leads in Supabase.
- `SUPABASE_LOGO_BUCKET` for optional logo uploads. Default: `lead-assets`.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `LEAD_NOTIFICATION_EMAIL` for email notifications.
- `MAKE_WEBHOOK_URL` as an optional automation webhook.

Run `supabase-schema.sql` in Supabase SQL Editor to create the lead tables and private logo bucket.

## Stripe AI Solutions Checkout

Create one-time Stripe Prices for the AI Launch and AI Growth packages, then configure:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_AI_LAUNCH_PRICE_ID`
- `STRIPE_AI_GROWTH_PRICE_ID`

Set the Stripe webhook endpoint to:

`https://elevatesystems.us/api/stripe/webhook`

Subscribe it to `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed`, and `checkout.session.expired`.
