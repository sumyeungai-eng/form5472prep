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

## Contracts
- Quiet upload still sets aside any earlier signature and resets to PDF_GENERATED — the client only ever signs the exact current version (2026-10-05 check-and-sign rule). Only the email is optional.
- Default stays email-on: omitted or non-boolean `notifyClient` emails (iOS/v1 callers unchanged).

## Open
- Owner tells the client themselves when they upload quietly; the portal shows the new version to sign.

## Lane notes
Single lane + Codex review. Note: the shared main-checkout node_modules had a stale Prisma client (tsc errors in questions pages) — use a copied node_modules + `prisma generate` in worktrees.
