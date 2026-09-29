# 2026-09-29 — Fax completion + email audit trail hardening

Trigger: a customer (filing `cmu6pgo49000di304vbiwnggd`) said he never got the
"delivered to the IRS" email. Resend had accepted it, but we had no record of
what we sent or whether it was delivered. The investigation also found that the
backup poll missed in-progress fax statuses and that unsigned Telnyx webhooks were
trusted.

## Ownership

| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/fax-hardening` · `feat/fax-email-hardening` (from `origin/main` 2f67882) | `prisma/schema.prisma` (EmailLog model + `Filing.emailLogs` relation), `prisma/migrations/20260929000326_email_log/`, `src/lib/email.ts`, `src/lib/emailLog.test.ts`, `src/lib/resendWebhook.ts`(+test), `src/app/api/resend-webhook/route.ts`, `src/lib/fax/{telnyxStatus,finalize,pollCandidates}.ts`, `src/lib/fax/{telnyxStatus,faxFlow}.test.ts`, `src/app/api/telnyx-webhook/route.ts`, `src/app/api/cron/fax-status-poll/route.ts`, `vercel.json` (poll schedule), `src/lib/admin/filingActions.ts`(+test), `src/app/admin/filings/[id]/{page,AdminActions,EmailLogTable}.tsx`, `EmailLogTable.test.tsx`, one-line `filingId` pass-through in `src/app/api/stripe-webhook/route.ts` and `src/app/api/partner/filings/[id]/send-sign-link/route.ts`, `HANDOFF.md` (cron line), `.env.example` (`RESEND_WEBHOOK_SECRET`, `TELNYX_PUBLIC_KEY` note), this log |

Not touched: `src/app/(app)/**`, `src/components/wizard/**`, `content/**`.

## What shipped (committed locally on the branch, NOT pushed / NOT deployed)

1. **EmailLog** table (additive migration: new table, unique `resendId`, index on
   `filingId`, FK `ON DELETE SET NULL`). `sendEmail()` writes one row after every
   Resend call: `sent` + Resend id, or `failed` + error, then rethrows the original
   error. The write is best-effort (try/catch, 5 s cap). An unknown `filingId`
   (FK error P2003, e.g. the test-email route's `"sample"`) is retried unlinked. Every
   sender now passes a `kind`. Senders that already know a filing also pass `filingId`
   (fax delivered/failed, order confirmation, ready-to-sign, magic link, admin
   order/fax/message alerts). Preview and sandbox sends are not logged because no
   Resend call happens.
2. **Resend webhook** `POST /api/resend-webhook`. It verifies the Svix signature
   with node `crypto`, rejects timestamps more than 5 minutes off, and returns 503
   when `RESEND_WEBHOOK_SECRET` is unset. It maps delivered, bounced, complained and
   delivery_delayed onto the EmailLog row by `resendId`, using a rank guard so a late
   `delivery_delayed` never overwrites `delivered` or a bounce.
3. **One finalize path**: `src/lib/fax/finalize.ts` (`finalizeFaxDelivered`,
   `finalizeFaxFailed`). Both the webhook and the poll call it. Each function starts
   with an atomic `updateMany` claim, and only the caller with `count === 1` stores the
   receipt and sends email. It adds a `FilingChangeLog` entry (`source: "system"`).
   It also passes the partner brand for customer email. The poll already did this;
   the webhook did not.
4. **Webhook confirms with Telnyx**: `fax.delivered`, `fax.failed` and
   `fax.sending.failed` act only if `GET /v2/faxes/{id}` (with `TELNYX_API_KEY`)
   reports the same status. If Telnyx is unreachable or reports a different status,
   the webhook answers 200 and waits for the poll. In non-production with no API key
   it trusts the payload, for sandbox development. Proof facts come from the API
   record; the payload only fills gaps. In-progress events are display-only. They no
   longer overwrite `retry_N`/`retrying_N` labels, which was a pre-existing bug: the
   label is the retry ceiling. They also no longer overwrite a CONFIRMED/FAILED filing.
5. **Poll**: runs hourly (`17 * * * *`). It selects filings with a `faxJobId`, a
   status other than CONFIRMED, and a non-terminal `faxStatus`, touched in the last
   14 days. It skips sandbox ids and fresh `retrying_N` claims. It never re-faxes, and
   it leaves failures less than 10 minutes old to the webhook, which may still retry.
6. **Admin**: a "Resend fax confirmation" button, shown only when
   `faxConfirmationKey` is set. It sends to the customer email on file with the receipt
   PDF attached, logs EmailLog kind `fax_delivered_resend`, writes a FilingChangeLog
   entry, and shows success or error inline. The admin filing page also has an
   "Emails" card listing EmailLog rows, newest first.

The automatic delivered email is still sent **without** an attachment, on purpose:
commit 4e7160c (2026-07-03) removed customer PDF attachments and changed the copy to
"saved in your portal". The attachment is opt-in (`attachReceipt`) and only the admin
resend uses it.

Verification: see the commit message and the lane report (vitest, tsc, eslint and
`npm run build` all exit 0).

## Review fixes (second commit on the branch, after the coordinator's merge f16a53a)

An independent review of ca9c583 said "ship after fixes". The fixes:

1. HIGH — a transient Telnyx API failure could turn an automatic retry into a
   customer-facing FAILED. Now:
   - The webhook answers **503** when it cannot confirm a terminal event with Telnyx,
     and also when a resubmission is rejected.
   - Retry-or-give-up moved into `src/lib/fax/retry.ts` (`handleConfirmedFaxFailure`),
     which both the webhook and the poll use. The poll now re-faxes a confirmed
     failure while retries remain, and marks FAILED only once they are exhausted. The
     old 10-minute grace window is gone.
   - The resubmission claim is one `updateMany` pinned on the failed `faxJobId` and
     the exact observed non-`retrying_` `faxStatus`, so only one caller can resubmit.
   - A `retrying_N` claim is released only when the fax provably did not go out: the
     media URL failed, or Telnyx rejected it (new `TelnyxSubmitRejectedError` in
     `src/lib/fax.ts`).
   - After an ambiguous submit error the claim is kept, `AMBIGUOUS_FAX_SUBMIT` is
     logged, and the admin gets an attention email.
   - The poll never polls a `retrying_N` row. Once a claim is older than 15 minutes it
     logs `STUCK_RETRY_CLAIM` on every run.
2. MEDIUM — the delivered and failed finalize claims now pin `faxJobId` to the job the
   outcome is about. The failed claim also pins the observed `faxStatus`, so a late
   result for a replaced job does nothing.
3. MEDIUM — if the customer email fails after the claim, the admin delivered email
   subject reads "[Fax delivered — customer email FAILED]". Its body line says to use
   Resend fax confirmation, and the push notification says the same. The resend
   action and button are available when a receipt exists OR the filing is CONFIRMED
   with a `faxJobId` (`canResendFaxConfirmation`, shared by the page and the server).
   With no receipt, the email is sent without an attachment.
4. LOW — the webhook payload fills receipt, proof, failure-reason and attempt-count
   gaps only when `TELNYX_PUBLIC_KEY` verified its signature; otherwise facts come from
   the Telnyx API alone.
5. LOW — if the new job id cannot be recorded after `submitFax` (one retry of the DB
   write), the code logs `[fax-retry] UNTRACKED_FAX_JOB filing=… newFaxId=…`, keeps
   the claim, and sends an admin attention email containing the new fax id.
6. UI — in the Emails card, the "To" column no longer wraps (`whitespace-nowrap`; the
   table scrolls in `overflow-x-auto`) and Subject takes the remaining width.

Coordinator-owned, not touched: merge f16a53a (`src/app/(app)/**`) and the
untracked `src/app/design-preview/fax/page.tsx`. At the coordinator's request this pass
did not run `npm run build`; vitest, tsc and eslint were run.

## Contracts a future editor must respect

- Never move a filing to CONFIRMED/FAILED or send a fax outcome email outside
  `lib/fax/finalize.ts`. Keep the claim-first, side-effects-after order.
- Never resubmit a fax outside `lib/fax/retry.ts` (the admin "Retry fax" button is the
  only manual exception). Release a `retrying_N` claim only when the fax provably did
  not go out.
- Finalize claims stay pinned to `faxJobId`.
- A terminal Telnyx event must be confirmed by `fetchTelnyxFax` before it is acted on.
  Unsigned payload fields never reach the customer's receipt.
- Never overwrite `retry_N` / `retrying_N` in `faxStatus`.
- `sendEmail` must stay throw-compatible: a log failure never changes its return value
  or error.
- Do not schedule the poll more often than hourly (Neon scale-to-zero).

## Open

Owner-gated:
- Merge `feat/fax-email-hardening` to `main` and push. The migration runs via
  `prisma migrate deploy` in `vercel-build`.
- Resend dashboard → Webhooks → Add endpoint
  `https://www.form5472prep.com/api/resend-webhook` for the events email.delivered,
  email.bounced, email.complained and email.delivery_delayed. Copy the signing secret
  (`whsec_…`) into Vercel as `RESEND_WEBHOOK_SECRET` (Production), then redeploy.
- Optional but recommended: Telnyx Mission Control portal → Keys & Credentials →
  API Keys page, "Public Key" section. That base64 Ed25519 key goes into Vercel as
  `TELNYX_PUBLIC_KEY`. It turns on signature checks and is also required for inbound
  faxes. Verify the menu path in the portal.
- Decide whether the automatic delivered email should attach the receipt. That is a
  one-line `attachReceipt: true` in `finalizeFaxDelivered`.

Follow-ups:
- Whether Telnyx redelivers webhooks after a non-2xx answer could not be verified
  offline. The hourly poll is the guaranteed backstop either way.
- A `STUCK_RETRY_CLAIM` / `UNTRACKED_FAX_JOB` filing needs a human. Check Telnyx for
  the resubmitted fax, then set `faxJobId` / `faxStatus` by hand before anyone presses
  "Retry fax".
- Possible improvement: when the receipt is missing, "Resend fax confirmation" could
  regenerate it from the Telnyx record instead of sending without an attachment.
- Filing `cmu6pgo49000di304vbiwnggd`: after deploy, use "Resend fax confirmation".
  The Emails card will then show the attempt and, once the webhook is configured, its
  delivery outcome.

## Lane notes

- The UI was checked by typecheck, lint, build and a static render test of the Emails
  table. It was not clicked through in a browser: the admin needs the production
  password, and `.env.local` points at the production database.
- The migration SQL was generated offline (`prisma migrate diff` from a copy of the
  old schema, with `DATABASE_URL` overridden to a dead localhost URL). No command
  connected to the database.
