# 2026-10-07 — Upload reviewed PDF without emailing the client

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/silent-upload` / `silent-reviewed-upload` → `origin/main` | `src/lib/admin/filingActions.ts` (uploadReviewedPdf only), `src/lib/admin/filingActions.test.ts`, `src/app/admin/filings/[id]/AdminActions.tsx` |

## What shipped
- Owner request: upload a new version for signing on a filing without emailing the client to review.
- Admin filing page: "Email the client to check and sign" checkbox next to "Upload reviewed PDF" (ticked by default). Unticked → button reads "Upload reviewed PDF (no email)…", body `notifyClient: false`.
- Server: `notifyClient === false` (strict) skips the ready-to-sign email and returns `emailSkipped: true`; the change log `afterJson` records `clientEmailed`.
- Evidence: filingActions + admin filing tests 107/107, tsc 0, eslint 0, `next build` OK. Codex review (gpt-5.5, read-only): no findings, "Ship".

### Part 2 — replace a signed, never-faxed package (owner-approved 2026-10-07)
- Owner asked to put a corrected file on DATAPROD CONSULTANTS LLC (status SIGNED_UPLOADED) and reuse the client's existing signature. **Declined the signature reuse** (the 1120 is signed under penalties of perjury for the version the client saw; staff never sign). Owner approved the alternative.
- `uploadReviewedPdf` now allows SIGNED_UPLOADED when the fax path was never touched (`faxJobId`, `faxedAt`, `faxStatus` all null and status not FAXED/CONFIRMED); otherwise 409 `already_faxed`.
- Conditional `updateMany` pinned on that fax state (races a `retryFax` claim safely → 409 `filing_state_changed`), wrapped with the change-log write in one `$transaction` so the set-aside `signedPdfKey`/`signaturePngKey` are always recorded (Codex MEDIUM, fixed + re-checked "Ship it").
- UI confirm now also fires when only a signed PDF exists, and says the old signature is never reused.
- Evidence: filingActions + admin filing tests 115/115, tsc 0, eslint 0, build OK.

## Contracts
- Never apply a client's existing signature to a new package version. Replacement always clears the signature and sends the filing back to PDF_GENERATED.
- Anything that has touched the fax path is never replaced (approveForSignature / regeneratePdf keep their own SIGNED_UPLOADED guards).
- Quiet upload still sets aside any earlier signature and resets to PDF_GENERATED — the client only ever signs the exact current version (2026-10-05 check-and-sign rule). Only the email is optional.
- Default stays email-on: omitted or non-boolean `notifyClient` emails (iOS/v1 callers unchanged).

## Open
- Owner tells the client themselves when they upload quietly; the portal shows the new version to sign.

## Lane notes
Single lane + Codex review. Note: the shared main-checkout node_modules had a stale Prisma client (tsc errors in questions pages) — use a copied node_modules + `prisma generate` in worktrees.
