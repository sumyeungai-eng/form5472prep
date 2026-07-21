# Form5472 Prep — Engineering Handoff

A practical orientation for anyone (human or AI) picking up this project. Read this top-to-bottom before making changes.

---

## 1. What this is

A done-for-you web service that prepares and files **IRS Form 5472 + a pro forma Form 1120** for **foreign-owned US single-member LLCs** (disregarded entities). The customer answers a short wizard, pays, signs in-portal, and we fax the package to the IRS Ogden PIN Unit and email a timestamped receipt. Secondary products: EIN and ITIN acquisition (lead-capture only), and a partner/reseller portal.

- **Live site:** https://www.form5472prep.com (production, always online)
- **Business-critical facts** (keep consistent everywhere — copy, schema, emails):
  - Pricing: **Standard $199 / Rush $279 / Premium $449**, **+$149 per additional past year**, IRS fax delivery included on every plan. Source of truth = `src/lib/pricing.ts`. Never hardcode prices elsewhere.
  - IRS fax number: **+1-855-887-7737** (Ogden PIN Unit).
  - Deadline: **April 15** (Oct 15 with Form 7004 extension). Penalty: **$25,000** (IRC §6038A(d)).
  - BOI/FinCEN: **US-formed entities are EXEMPT since March 26, 2025.** Do not tell customers to file a BOI report.
  - You **cannot e-file** a foreign-owned DE return; it must be faxed/mailed.

---

## 2. Stack & where things live

| Concern | Choice |
|---|---|
| Framework | **Next.js 14.2.35**, App Router, TypeScript, React 18 |
| Styling | Tailwind CSS 3.4 |
| ORM / DB | **Prisma 6.19** → **PostgreSQL** (cloud, hosted) |
| Payments | **Stripe** (Checkout Sessions + webhook) |
| Email | **Resend** (transactional; templates in `src/lib/email.ts`) |
| Fax | **Telnyx** (programmatic fax + webhooks) |
| Bank import | **Plaid** (optional transaction import in the wizard) |
| File storage | **Cloudflare R2** (S3 API via `@aws-sdk/client-s3`); PDFs + signature PNGs |
| AI | **Anthropic SDK** (`/api/chat` advisory widget only) |
| Hosting | **Vercel** (prod deploys via `vercel --prod`) |
| Source | Local: `/Users/sumyeung/Documents/Codex/form5472` · GitHub: `github.com/sumyeungai-eng/form5472prep` (remote is SSH, token-free) |

- **Code** is edited locally, committed to GitHub, and deployed to Vercel.
- **DB and R2 are cloud services.** Their credentials are **sealed Vercel secrets** — not retrievable via `vercel env pull` (they pull empty). This is intentional.

---

## 3. Running, building, deploying

```bash
npm install
npm run dev                # local dev server (localhost:3000)
npm run build              # prisma generate + next build  (LOCAL — no migrate)
npm run lint               # next lint (ESLint runs during build too; unescaped ' / " in JSX fail the build)
npm run test               # vitest
npx tsc --noEmit           # typecheck
vercel --prod --yes        # deploy to production (www.form5472prep.com)
```

**Critical local gotcha:** the app instantiates `PrismaClient` at import time, which throws if `DATABASE_URL` is empty. For local `npm run build`/`tsc` to work, put a *dummy but well-formed* URL in `.env.local` (gitignored):
```
DATABASE_URL="postgresql://u:p@localhost:5432/devnull?schema=public"
```
DB-reading pages (e.g. the homepage filings counter) catch the connection error and render a fallback, so the build succeeds without a real DB.

**Migrations:** `package.json` has a `vercel-build` script = `prisma generate && prisma migrate deploy && next build`. Vercel runs `vercel-build` (with the real prod `DATABASE_URL`), so **pending migrations auto-apply on every production deploy.** The plain `build` script (used locally) does NOT migrate. To add a schema change: edit `prisma/schema.prisma`, create a migration under `prisma/migrations/<timestamp>_<name>/migration.sql`, and it applies on the next deploy. (You cannot `migrate deploy` locally — you don't have the prod URL.)

---

## 4. Architecture map

**48 API routes** under `src/app/api/`. Key ones:
- `checkout` — creates the Stripe Checkout Session. Server-derives the price from `filing.tier` + `taxYears` (client never sets amount). Has a completeness gate + session-reuse idempotency.
- `stripe-webhook` — fulfillment on `checkout.session.completed`. **Idempotency is keyed on `stripePaymentId` (NOT status)** because the success page also promotes DRAFT→PAID. Rejects stale/superseded sessions; records real `amount_total`.
- `filings/[id]` (PATCH) — the wizard's incremental save. Validates every field server-side against the shared zod schemas in `src/lib/schemas.ts`.
- `generate-pdf` — builds the PDF package; only allowed from `PAID`/`PDF_GENERATED`.
- `filings/[id]/sign` — stores the customer signature PNG.
- `admin/filings/[id]` — admin actions incl. `retryFax` (snapshots the exact faxed bytes to `faxedPdfKey`).
- `telnyx-webhook` — fax delivered/failed events; atomic claims dedupe against the poll cron; retries re-fax the immutable snapshot.
- `cron/*` — Vercel Cron: `fax-status-poll` (daily), `january-reminder`, `march-reminder`, `abandoned-draft-reminder`. Schedules in `vercel.json`.
- `ask`, `chat`, `auth/send-link`, `partner/send-link`, `ein-application`, `itin-application` — public endpoints, now **rate-limited** (see `src/lib/rateLimit.ts`).

**Key libraries** (`src/lib/`):
- `pricing.ts` — **the** pricing source of truth (tiers, multi-year add-on).
- `schemas.ts` — zod schemas shared client (wizard) + server (PATCH/checkout validation).
- `session.ts` — three identities: anonymous (`fs_session` cookie), customer (`fs_user` magic-link cookie), plus `getOwnedFiling`/`getFilingAccess`. `magicLink.ts`, `admin/auth.ts`, `partner/auth.ts` are the other auth surfaces.
- `pdf/` — `generatePackage.ts` fills the Form 5472 + pro forma 1120 (pdf-lib); `fieldMaps.ts` is the AcroForm field map; `faxReceipt.ts` builds the receipt.
- `storage.ts` — R2/local file storage (`makeKey` sanitizes keys).
- `email.ts` — ~20 Resend templates (shared layout helpers).
- `rateLimit.ts` — Postgres fixed-window limiter (fails **open** on DB error).

**Frontend:** marketing pages under `src/app/(marketing)/` (mostly static/ISR — do NOT read cookies in the shared marketing layout or you force every page dynamic; auth state is a client island via `useSignedIn` + `/api/me`). The filing wizard is `src/components/wizard/FilingWizard.tsx` (steps) wrapped by `src/components/wizard-v3/FilingWizardV3.tsx` (sidebar + preflight). SEO landing pages are data-driven from `src/lib/landing-pages.ts` (~23 pages via the `[seoSlug]` route). Blog is file-based markdown in `content/blog/*.md`.

**Data model** (`prisma/schema.prisma`): `User`, `Partner`, `Filing` (the central entity, with a `FilingStatus` enum: DRAFT → PAID → PDF_GENERATED → SIGNATURE_PENDING → SIGNED_UPLOADED → FAXED → CONFIRMED / FAILED), `FilingYearData`, `Message`, `FilingChangeLog`, `ReminderSent`, `EinApplication`, `ItinApplication`, `RateLimit`, `PlaidConnection`, `BankStatement`.

---

## 5. Conventions & gotchas (read before editing)

- **Pricing:** only `src/lib/pricing.ts`. Grep for stale `$` amounts after any pricing change.
- **Money:** integer cents everywhere at the Stripe boundary. No float math on amounts.
- **Idempotency pattern:** state-changing webhook/cron handlers use an atomic `updateMany({ where: { …precondition }, data })` "claim" and no-op when `count === 0`. Reuse this pattern; don't do read-then-write.
- **Static rendering:** marketing pages must stay static/ISR. Never read `cookies()` in the marketing layout.
- **ESLint blocks the build** on unescaped `'`/`"` in JSX text — use `&apos;`/`&ldquo;` etc.
- **Fax audit trail:** `faxedPdfKey`/`faxedAt` must reflect the exact bytes faxed. `retryFax` re-snapshots the current signed PDF; the Telnyx retry re-faxes the snapshot, not the mutable `signedPdfKey`.
- **Anonymous drafts:** a filing can have `userId = null` (anonymous, tracked by `fs_session`) until the user enters an email at Review (`bindFilingToEmail`). Authz on `/api/filings/[id]/*` goes through `getOwnedFiling` (userId OR sessionId).
- **AI loop is retired.** The `validationStatus`/`aiHandoff`/`aiTurnsUsed` columns and some code comments reference an old AI compliance/conversation loop that is no longer wired. Don't re-enable it; an accountant reviews every package before fax.
- **Deploys auto-migrate** (see §3). A bad migration fails the build (safe — previous deploy stays live).

---

## 6. Current state (recent work)

The codebase recently went through a full security/logic/UX review (report at `docs/reviews/2026-07-21-system-review.md`) and a fix wave. Shipped and live: Stripe webhook idempotency + stale-session rejection + amount reconciliation, checkout completeness gate + double-charge protection, server-side PATCH validation (taxYears/transactions/fields), fax retry-race + snapshot integrity, generate-pdf state guard, reminder double-send guards, signature-IDOR fix, path-traversal + admin-email HTML escaping, Google Ads conversion firing + dataLayer fallback, ChatWidget mobile fix, form a11y, auth revalidation, SignaturePad resize, Filing perf indexes, and **Postgres-backed rate limiting** on the public endpoints (active in prod). AEO/SEO: question-form headings, FAQPage/BlogPosting/HowTo schema, RSS feed, /about + /editorial-policy, llms.txt.

---

## 7. Open action items

1. **Set `TELNYX_PUBLIC_KEY` in Vercel (production).** It's currently unset, so the Telnyx fax webhook **skips signature verification** (the code is fail-closed once the key is present). Value is in the Telnyx Portal → your Fax/Messaging app → Public Key (base64). Set via Vercel dashboard or `vercel env add TELNYX_PUBLIC_KEY production`, then redeploy.
2. **Google Ads purchase conversion** — set `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_PURCHASE` in Vercel to the conversion label (e.g. `AW-18127544007/XxYy…`) to activate purchase-conversion reporting (safe no-op until set).

### Deferred design decisions (need a product/tax call, not just code)
- **DIIRSP inference** (`FilingWizard.tsx`, `filings/[id]/route.ts`): `isDiirsp` is currently inferred as "multi-year OR any tax year < current year." This over-flags on-time current-cycle filings as late. The *safe* default is the current over-flagging (an extra reasonable-cause statement is harmless; under-flagging risks a missed statement = penalty exposure). Proper fix = add a wizard question "did you file an extension (Form 7004)?" and derive DIIRSP from the actual per-year deadline. Don't reduce DIIRSP flagging without that question.
- **Per-LLC reminders** (`src/lib/reminders.ts`): reminder exclusion is user-wide, so a customer with two LLCs who files one gets no reminder for the other. Needs per-entity obligation tracking (a data-model change).
- **Webhook outbox/resumability** (`stripe-webhook`): if fulfillment (PDF gen / emails) fails after the payment claim, it isn't auto-retried. Proper fix = an outbox/event table with per-step completion timestamps.

---

## 8. Environment variables (production, in Vercel)

Set (sealed): `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `SESSION_SECRET`, `ADMIN_SESSION_SECRET`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` (routes admin/chatbox notifications — currently `support@form5472prep.com`), `CRON_SECRET`, `INTERNAL_API_SECRET`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `TELNYX_API_KEY`, `TELNYX_CONNECTION_ID`, `TELNYX_FAX_NUMBER`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID`.

Not set (see §7): `TELNYX_PUBLIC_KEY`, `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_PURCHASE`.

Optional fallbacks: magic-link/partner secrets fall back to `SESSION_SECRET` if their own vars are unset (fine, since `SESSION_SECRET` is set). `src/lib/env.ts` documents required vs optional.

---

## 9. Working effectively with an AI assistant here

- **Verify before trusting.** This is a real production app handling PII (names, foreign tax IDs, EINs, signatures) and money. Read the actual code at a `file:line` before accepting any claim about it.
- **Build is the gate:** `npx tsc --noEmit` then `npm run build` must both pass before deploying. Remember the dummy `DATABASE_URL` for local builds.
- **Money/tax code is high-stakes:** changes to pricing, checkout, the webhook, the PDF field maps, or DIIRSP logic deserve extra care and a second read.
- **Deploy = `vercel --prod --yes`**, which auto-applies pending migrations. Watch the build output for the `prisma migrate deploy` result.
- **Don't reintroduce** the retired AI compliance loop, and don't put BOI-required language back into any customer copy.
