# 2026-10-10 — Reasonable-cause step would not save ("Invalid input")

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/reasonable-cause-save` (`fix/reasonable-cause-save`, pushed to `origin/main`) | `src/lib/schemas.ts`, `src/components/wizard/ReasonableCauseStep.tsx` (+ `.test.ts`), `src/components/wizard/FilingWizard.tsx`, `src/lib/pdfInputs.test.ts`, this log |

Main checkout (`~/Documents/Codex/form5472`) not touched (another session's
uncommitted blog work lives there).

## Report
A customer on the wizard's Step 5 (Reasonable cause) got "Couldn't save:
Invalid year data — Invalid input" for every reason, including "Other", and
the step reset after each attempt. Steps 1–4 saved normally. The admin page
showed formation date 2025-08-13, tax year 2025, not a final return and no
per-year rows. The production database was not queried; the facts came from
the admin filing page in the owner's signed-in Chrome.

## Root causes (three, compounding)
1. **zod's English messages were not in the production bundle.** zod 4
   declares `"sideEffects": false`, so webpack drops the import that installs
   its English messages. Every built-in check (type, min/max, length) therefore
   reached customers as a bare "Invalid input", with no field or reason. Custom
   messages (e.g. `PDF_TEXT_MESSAGE`) were unaffected. Verified: the pre-fix
   build has no chunk loaded by `api/filings/[id]` containing zod's English
   messages; after the fix, chunk 4873 does.
2. **Over-long answer, no client check.** `rcsWhyMissed` is capped at 2,000
   chars server-side (`optionalTrimmedString`). The step stores the reason's
   built-in sentence plus the customer's detail text, and the detail textarea
   keeps its text when the dropdown changes. A long pasted statement
   therefore failed for **every** option. The browser never checked length.
   (Most likely trigger here: the customer says they have a "full" statement.
   The exact submitted text was not recoverable, because failed PATCHes aren't
   logged with bodies.)
3. **Step state wiped on every save attempt.** `FilingWizard` declared
   `const Outer: React.FC = …` inside its render body, so every parent state
   change (`setSaving`, `setSaveError`) remounted the whole step and discarded
   unsaved input. That was the "page resets".

## What shipped
- `schemas.ts`: `z.config(z.locales.en())` at module scope; `RCS_TEXT_MAX`
  (2000) + `rcsTooLongMessage()` shared by server and client; rcs fields give
  "Keep this to 2,000 characters or fewer (it is N)."
- `ReasonableCauseStep.tsx`: `validateReasonableCauseYears` checks length
  before saving; a live "N / 2,000 characters" counter under the detail box
  (red when over).
- `FilingWizard.tsx`: `Outer` replaced by a plain `<div>` with the same
  classes. No layout change.

Evidence: related tests 11 files / 134 passed (new: wizard-shaped rcs PATCH
accepted, over-long → readable 400 with no write, built-in check not "Invalid
input", client length check). `tsc` 0; `next build` 0 (with a local throwaway
`SESSION_SECRET`, see the previous log). Read-only Codex review (gpt-5.5 low):
NO FINDINGS. It noted that a long non-Latin answer reports both the length
message and the English-letters message server-side; that is acceptable.

## Contracts
- Never declare a React component inside another component's render body.
  It remounts the subtree on every render.
- Keep `z.config(z.locales.en())` in `schemas.ts`. Removing it silently turns
  all server validation messages back into "Invalid input".
- Any new length cap on a customer field needs the same check in the browser,
  with the shared constant.

## Open
- Owner-gated: the customer asked us to mark Step 5 complete and to use a
  separately emailed full statement "as agreed". Nothing was marked or
  changed in their filing. After deploy, they can retry with an answer under
  2,000 characters. Whether a longer statement goes into the admin "Reasonable
  cause narrative (DIIRSP)" field (20,000 cap), and whether that was agreed,
  is the owner's call.
- Owner-gated: whether 2,000 is the right cap for `rcsWhyMissed` (PDF layout
  impact not assessed).
- Follow-up: other wizard banners still show only messages, not field names.
- Follow-up (from the earlier session today): refresh the main checkout's
  `node_modules`.
