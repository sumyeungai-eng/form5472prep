# 2026-11-03 — Reviewed PDF upload no longer blocked by A32

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/reviewed-upload-a32` (`fix/reviewed-upload-a32`, pushed to `origin/main`) | `src/lib/admin/filingActions.ts`, `src/lib/admin/filingActions.test.ts`, `docs/staff-changelog-2026-11-system-update.md`, `CLAUDE.md`, this log |

## Trigger
A late three-year order had the client's own formatted reasonable-cause
statement. Staff built a reviewed PDF from it, recorded a pre-flight override
("human reviewed") and uploaded it. The upload was refused because A32 (no
admin RCS narrative / verbatim text for 2023–2025) was "never overridable" for
release, reviewed upload and fax alike. The order stayed "Awaiting review".

## Owner decision (2026-11-03)
"Make the system accept it." A staff-reviewed upload carries its own
statement, so A32 no longer blocks it.

## What shipped
- `canReleaseToClient(filing, { reviewedUpload: true })` skips the A32 check.
  The generated-PDF release (`approveForSignature`) still enforces it.
- The `retryFax` gate treats a package whose released key
  (`reviewApprovedPdfKey ?? generatedPdfKey`) is a `_reviewed_` upload as
  having its cause. A generated package still needs A32, or force + reason.
- Unchanged: a failed pre-flight still needs "Approve despite pre-flight
  failures" with a reason before a reviewed upload is accepted.

Evidence: `filingActions.test.ts` 164 passed. The old test asserting the
refusal was flipped to an acceptance. A new fax test covers a generated
package refused and a reviewed package faxed. Full suite: 4,527 passed, plus
one blog-loader timeout under load that passes alone (236/236). CI on main is
green. `tsc`, `next lint` and `next build` all exit 0.

Read-only Codex review raised one point. After a reviewed upload, staff could
"Upload already-signed PDF" with a signed *generated* draft, and the fax would
still be exempt. Accepted as a known edge: both are staff-uploaded files,
which staff vouch for.

## Contracts
- A32 guards only packages the system generated and nobody uploaded.
- Do not reintroduce A32 in `canReleaseToClient` for `reviewedUpload`.
  The owner chose this.

## Open
- Owner-gated: whether to record the client's statement as verbatim text on
  such orders anyway (audit trail in the system, not only in the PDF).
- Follow-up: none required.
