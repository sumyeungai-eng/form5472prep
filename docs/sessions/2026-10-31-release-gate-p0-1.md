# 2026-10-31 — P0-1 release gate: the client sees nothing until staff release it

Spec: `docs/reviews/2026-10-30-system-update-plan.md` → "PR 1" (approved 2026-10-30, D3 gate partners,
D11 backfill). That plan file currently lives on the `sign-reedit` worktree branch, not on this branch.

## Ownership
| Checkout / branch | Owns |
|---|---|
| `~/Developer/f5472-wt/sys-p0`, `feat/system-update-p0` | P0 integration branch: PR1 (this) → PR2–4 follow on the same branch. NOT pushed; P0 ships as one push after PR4 + owner approval of the migration. |
| separate generator-fix lane | `generatePackage.ts`, `preflight.ts`, `packageInput.ts`, wizard intake. PR1 touched none of them. |

## What shipped (local commits on `feat/system-update-p0`, not pushed)
- `Filing.reviewApprovedPdfKey` + migration `20261104100000_release_gate` (additive column + D11 backfill;
  also stamps the key on filings that were already approved).
- `src/lib/pdf/packageKeys.ts`: `newUnsignedPdfKey` (versioned `{id}_unsigned_{ts}.pdf`), `releasedPdfKey`,
  `isReviewedPdfKey` (moved here, re-exported from filingActions), `latestGeneratedDraftKey` (admin draft download).
- `canReleaseToClient()` in `filingActions.ts`, used by `approveForSignature` (now requires `expectedPdfKey`,
  409 `stale_pdf_key` otherwise) and `uploadReviewedPdf`; the admin page uses it to disable the new
  "Release generated PDF to client" button with the reason.
- Data edits after release (updateField / updateYearField / admin setOwnerSsn): generated+unsigned →
  release cleared first, PDF regenerated, "Re-release needed"; signed → warning; reviewed upload → warning.
- Client gates: `/api/filings/[id]/pdf` (customers + partners), sign page + sign API, request-change,
  partner sign-link + send-sign-link; `REVIEW_GATE_GRANDFATHERED_STATUSES` deleted everywhere.
- `toClientFiling` nulls `generatedPdfKey`/`reviewApprovedPdfKey` before release; `generate-pdf` returns `{ ok: true }`.
- Portal: "In review" banner + screen (`FilingReviewSummary`, `SendCorrection` → filing message thread);
  `FilingActions` takes booleans, never a key.
- Emails: order_confirmation intro = "Our team is reviewing your package. We'll email you a link to check and
  sign it when it's ready."; stale "view the generated package" lines removed; magic_link copy fixed; webhook
  order-time magic link carries `?next=/filings/{id}` (existing auth route rule, no new whitelist).
- Evidence: targeted vitest 31 files / 494 tests passed before commit (plus new tests); `tsc` exit 0;
  `next build` result in the commit report.

## Codex review fixes (2026-11-03)
- P1 signed copy: `/api/filings/[id]/signed-pdf`, `toClientFiling.signedPdfKey`, the portal page prop and
  `loadFaxClientCopy` now require `reviewApprovedAt` OR `faxedAt` (`clientMaySeeSignedPdf`).
- P1 stale bytes: new `Filing.preflightPdfKey` (same unpushed migration; `migrate diff` = two ADD COLUMNs).
  `persistNewPackagePreflight` records it; a pre-flight re-run on an unreleased, unsigned GENERATED package
  stores the checked bytes under a new versioned key and points `generatedPdfKey` + `preflightPdfKey` at them
  (pinned update: never replaces a reviewed upload or a release that landed meanwhile). Releasing a generated
  PDF requires `preflightPdfKey === generatedPdfKey` (`preflight_other_pdf`); reviewed uploads keep the old rules.
  NOT backfilled: each unreleased order needs one "Re-run pre-flight" before release.
- P2 v1 API: the detail response now returns `generatedPdfKey`, to send back as `payload.expectedPdfKey`.
  Missing key stays a 400; the iOS UI has no approve action today.

## Contracts a future editor must respect
- Clients only ever get `reviewApprovedPdfKey`, only while `reviewApprovedAt` is set. No status exemption.
- Every write of `generatedPdfKey` must either clear `reviewApprovedAt/By/PdfKey` or set the key as released.
- Never overwrite a released key: always `newUnsignedPdfKey()`.
- A32 is never overridable for release (same rule as the fax gate).
- Never pass a raw package key to a client component.
- Pre-flight approves bytes, not data: any path that persists a pre-flight result for a generated PDF must also
  record `preflightPdfKey` for the exact bytes it checked.
- A client's signed/faxed copy is visible only after release or fax (`clientMaySeeSignedPdf`).

## Open
- Owner-gated: before the P0 push, list PDF_GENERATED orders without approval (`awaitingReview`) — those
  clients lose PDF access until staff release. Migration applies on the push (`vercel-build`).
- Owner-gated: the iOS admin app must send `payload.expectedPdfKey` with `approveForSignature`
  (v1 API now answers 400 `expected_pdf_key_required` without it).
- Follow-up: PR3 adds verbatim RCS text; extend `canReleaseToClient`'s A32 rule to accept it then.
- Follow-up: the order_confirmation text snapshot prints "Standard filing — $149.00"; the Task 0 lane may need
  to update `src/lib/__snapshots__/email.test.ts.snap`.

## Lane notes
- Worktree restarted twice mid-lane; all work was re-checked from `git status` before continuing.
- `timeout` is not on macOS; run vitest without it.
