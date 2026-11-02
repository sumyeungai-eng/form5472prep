## Imported Claude Cowork project instructions

## Never block a customer from paying (owner rule, 2026-10-14)
- A customer must **always** be able to finish the wizard and pay, even when
  their information is incomplete, wrong or badly formatted. Owner's words:
  "make them pay first and then we can solve the issues after order is placed
  by correcting the details."
- Customer-side checks (wizard steps, the review / pre-flight step, the
  checkout API) may **warn and guide**, but must never block saving a step,
  advancing, or paying. Data problems are caught by staff after payment
  (admin pre-flight, Edit filing fields, reviewed-PDF upload).
- Anything that could make package generation throw at payment must be
  sanitised or defaulted so payment still succeeds and staff see a pre-flight
  finding instead. Staff-side gates (admin pre-flight, upload and fax gates)
  are fine.
- Every change touching the wizard, `src/lib/schemas.ts`, `src/lib/completeness.ts`,
  `src/app/api/checkout` or the customer pre-flight step must keep the pay
  path open — test that a deliberately bad-data order still reaches Stripe.

## Deploying — mandatory (mirrors CLAUDE.md)
Production = `origin/main`, auto-deployed by Vercel's git integration.
**Deploy by `git push origin main` only. NEVER run `vercel --prod` / `vercel deploy --prod`** —
a CLI deploy publishes the local tree (branches, uncommitted files) and is silently
reverted by the next push; this wiped live pages on 2026-08-27 and 2026-09-04.
The `hktax/` app must never be deployed to the form5472prep.com project.

## Release gate — the client sees nothing until staff release it (2026-10-31, P0-1)
- A client (customer or partner) may only ever receive `Filing.reviewApprovedPdfKey`, and only while
  `reviewApprovedAt` is set (`releasedPdfKey()` in `src/lib/pdf/packageKeys.ts`). No status exemption.
- Releasing (`approveForSignature` with `expectedPdfKey`, or `uploadReviewedPdf`) goes through
  `canReleaseToClient()` in `src/lib/admin/filingActions.ts`. A32 is never overridable for release.
- Every generation writes a NEW key (`newUnsignedPdfKey()`); never overwrite released bytes, and every
  write of `generatedPdfKey` must clear `reviewApprovedAt/By/PdfKey` (or set them to the new key).
- `toClientFiling` nulls package keys before release; never pass a raw key to a client component.
- Spec: `docs/reviews/2026-10-30-system-update-plan.md` (PR 1); handoff: `docs/sessions/2026-10-31-release-gate-p0-1.md`.
