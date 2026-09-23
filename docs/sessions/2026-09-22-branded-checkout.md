# 2026-09-22 — Branded Stripe checkout (live, merge d931f76)

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `feat/branded-checkout` merged to main.
Files: `src/lib/stripeCheckoutBranding.ts` (+test), `scripts/build-brand-assets.mjs`, `public/brand/*.png`,
and ONLY the session-create parameters of `src/app/api/checkout/route.ts` and
`src/app/api/applications/[type]/checkout/route.ts`.

## What shipped
Owner request: "a dedicated checkout page on Stripe that looks professional". Stripe-hosted Checkout now
gets, per session: `branding_settings` (display name Form5472 Prep, logo and icon by URL to
`/brand/checkout-logo.png` and `/brand/checkout-icon.png`, button #1e3a8a, white background, Inter,
rounded), product images (`/brand/product-5472.png`, `/brand/product-ein-itin.png`) and descriptions,
`custom_text.submit` (filing: "Every filing is reviewed by a qualified accountant before it is submitted.
You sign only after the review."; EIN/ITIN: "Your application is prepared from your answers and reviewed
by our team before anything is sent."), and `locale: "auto"`. Payment method (card, which also shows
Apple Pay / Google Pay / Link when enabled in Stripe), prices, discounts, URLs and metadata unchanged.
Verified: tsc, vitest 725/725, build; brand PNGs return 200 image/png on production. Independent review
found a blocking idempotency-key collision (fixed by versioning keys `checkout_v2_...` /
`appcheckout_v2_...`) and an ITIN overclaim (fixed with per-route text).
NOT verified: a real Stripe Checkout page render (no Stripe key on this machine).

## Contracts
- `createBrandedSession` retries ONCE without branding if Stripe rejects `branding_settings`/`custom_text`
  (invalid-request errors naming them), with key suffix `_plain`. Never let branding block a payment.
- If session params change again, bump the idempotency key version.
- Regenerate brand PNGs with `node scripts/build-brand-assets.mjs`; Stripe needs PNG/JPG, not SVG.

## Open
- Owner to open one checkout and look. If Vercel logs show "[checkout] Stripe rejected checkout branding
  settings", the account refused per-session branding and the Stripe Dashboard branding page is the
  alternative.
- Optional: a custom checkout domain (checkout.form5472prep.com) is a Stripe Dashboard setting.

## 2026-09-23 Neon compute allowance exhausted (resolved)
Neon free plan (100 CU-hours/month) hit 100% for project File5472form; owner upgraded to the Launch plan
the same day. Cause: the database never scaled to zero. Each page-view ping did several writes (rate
limit, daily budget, visitor, page view) including bots, and an open admin tab polled counters every
minute. Commit dbccca9: bot/crawler pings return before any database work (test proves zero DB calls);
admin counters poll every 5 minutes. Owner advised to cap compute at 0.25 CU with scale-to-zero on.
Hosting decision: stay on Vercel + Neon through the 15 October deadline; a database-only move to the
owner's Hostinger VPS is an option afterwards (Hostinger Business shared plan is MySQL-only: not viable).
