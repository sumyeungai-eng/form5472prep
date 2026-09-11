# 2026-09-11 — Confirmation emails: review + admin test-email endpoint

## Ownership

| File | Change |
|---|---|
| `src/app/api/admin/test-email/route.ts` | NEW — `POST { to, templates? }`, admin-gated, sends the order / EIN / ITIN confirmation emails with fake sample data to a named address |

Nothing else touched. Commit `e39918d` on `main`; deployed (route 404 → 401 marker, valid because a brand-new route cannot pre-exist).

## Why the endpoint exists

`RESEND_API_KEY` is marked sensitive in Vercel and `.env.local` holds an empty value, so no email can be
sent from a laptop. Reviewing copy in a real inbox (Gmail/Apple Mail render differently from a local
HTML preview) therefore needs a production-side sender. The route reads no real filing/application
and never marks anything as sent, so it cannot leak customer data or disturb the Stripe-driven flow.

Triggered 2026-09-11 from the owner's signed-in admin session: `{"to":"hkdcec@gmail.com","sent":["order","ein","itin"],"failed":[]}`.

## Finding — EIN/ITIN confirmation copy is stale (owner decision pending)

`sendEinApplicationConfirmationEmail` (`src/lib/email.ts:1473`) and `sendItinApplicationConfirmationEmail`
(`:1562`) still say "Our team will reach out within 1 business day with a document checklist **and payment
link**" — but since 2026-09-02 applicants pay at submission and these emails are only sent by
`notifyApplicationPaid` AFTER payment. Every applicant now reads a promise of a payment link right after
paying $149 / $349. Both emails also omit the amount paid, a receipt link and any "what happens next"
steps, unlike the filing order confirmation (`sendOrderConfirmationEmail`, `:422`), which is in good shape.

Proposed rewrite (not started): mirror the filing email — confirm what was paid, plain next steps with
the timelines already published on `/ein` (SS-4 by fax, IRS 1–5 business days) and `/itin` (checklist →
CAA certification → W-7, IRS 6–11 weeks), portal link. No new claims.

## Still open

- Owner: approve the EIN/ITIN rewrite above (drafts on request).
- Owner: confirm the three test emails rendered correctly in hkdcec@gmail.com (Gmail) — logo, spacing, links.

## Shipped 2026-09-11 — EIN/ITIN confirmation emails rewritten (owner-approved copy)

Commit `955b790`. `sendEinApplicationConfirmationEmail` / `sendItinApplicationConfirmationEmail`
(`src/lib/email.ts`) now take `amountPaidCents` (passed from `app.amountPaid` in
`src/lib/applicationNotifications.ts`), confirm the amount paid and that no separate payment request
follows, and list the four next steps with the timelines published on `/ein` and `/itin`. Subjects:
"EIN application received — {llcName}" / "ITIN application received — {fullName}".
`scripts/preview-emails.ts` and the admin test-email route updated to the new signatures.
`src/lib/applicationEmails.test.ts` renders both via `EMAIL_PREVIEW_DIR` (mkdtemp) and asserts amounts,
key phrases, the portal href, and the absence of "payment link".

Accepted house-style deviations from the approved draft: greeting "Hello {name}," and close
"Thank you, / The Form5472 Prep team" — both hard-coded in the shared `customerShell`/`customerText`
helpers used by every customer email; forking them for two emails was not worth the inconsistency.

Lane note: the codex lane edited `scripts/preview-emails.ts` outside its owned list because `tsc` could
not pass otherwise (call site of the changed signatures) — disclosed, minimal, kept. Its test shipped
with a session-specific absolute path and a copy-out block; removed before commit (a lane must never
commit paths from its own scratch space).

Deploy: watched the deployment object (newer than the pre-push one) to Ready. Test copies of both new
emails sent to hkdcec@gmail.com from the owner's admin session via `/api/admin/test-email`:
`{"sent":["ein","itin"],"failed":[]}`. Owner to confirm inbox rendering.
