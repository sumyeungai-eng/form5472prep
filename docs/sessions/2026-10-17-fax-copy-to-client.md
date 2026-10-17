# 2026-10-17 — Optional faxed forms copy for the client

## Ownership

| Checkout / branch | Files |
| --- | --- |
| `fax-copy` / `feat/fax-copy-to-client` | Prisma schema and additive migration; admin filing actions, detail page and UI; fax client-copy loader and finalize path; delivered email; related tests; this session log |

The feature spec was already untracked at session start and was left unchanged. No other pre-existing changes were present.

## Result

F1: Independent, initially unchecked send/resend checkboxes; disabled and unchecked with the specified portal note when either SSN marker exists.
F2: Strict boolean opt-in, server-side SSN override, nullable `faxCopyToClient` column, and retryFax before/after audit data. Ciphertext stays outside the shared admin select/API response.
F3: Delivery email optionally attaches frozen `faxedPdfKey` bytes, falling back to signed PDF only for legacy filings without a snapshot. Uses `downloadFileName(..., "filed")`; HTML and text describe the attachment and retain portal access. Storage failures log only the error name and leave confirmation available.
F4: Resend has an independent per-request choice and uses the same guarded loader, alongside existing receipt behavior.
F5: Existing branding and admin notification behavior retained, with ciphertext also respected by the existing admin SSN guard.
F6: Copies above 20 MiB are omitted; exactly 20 MiB is allowed.
F7: No wizard, checkout, payment, or customer pre-flight files changed.
F8: Suppress the Trustpilot invite BCC whenever a faxed forms copy is attached; direct customer emails without the copy retain the invite, with regression coverage for both cases.

## Contracts

Never attach a package when either owner SSN marker is present. Never use a newer signed PDF after a frozen-snapshot read error. Resending does not overwrite the saved future-delivery preference. The migration adds a nullable column only; no migration was applied locally. Prisma Client was regenerated.

## Validation

- `npx prisma generate`: passed.
- `npx tsc --noEmit`: passed.
- `npx vitest run src/lib/fax src/lib/admin src/lib/email.test.ts 'src/app/admin/filings'`: 18 files, 397 tests passed. Earlier runs stalled on a deep equality assertion over a 20 MiB fixture; replaced that assertion with byte identity and reran the exact suite successfully.
- `npx eslint` on all ten changed TypeScript/TSX files: passed.
- `git diff --check`: passed.

Synthetic tests cover request persistence/audit, strict boolean input, both SSN markers, false/null preferences, exact snapshot selection, legacy fallback, storage read failure with name-only logging, oversize omission and the exact size boundary, email attachment filename/content/text, resend opt-in/out, and checkbox rendering/SSN disabling.

## Release / open work

No commit, push, deployment, or live verification: explicitly requested local work only. Apply the migration through the normal release process before using the new column in production. No owner decisions outstanding.

## Orchestrator verification
- Code written by Codex (gpt-6.1-sol, workspace-write); independent Claude review found one critical issue (Trustpilot invite BCC would have received the attached forms) — fixed by Codex: no BCC when the copy is attached. Remaining low-confidence notes from review (pre-existing snapshot design): `${id}_faxed.pdf` is overwritten before a forced re-fax is submitted, so an in-flight earlier fax's delivery email could attach the newer bytes; a DB-write failure after Telnyx accepts a fax leaves `faxCopyToClient` from the previous send. Follow-up: per-job snapshot keys.
- Evidence: tsc 0; eslint 0; 397–399 targeted tests pass; next build 0.
