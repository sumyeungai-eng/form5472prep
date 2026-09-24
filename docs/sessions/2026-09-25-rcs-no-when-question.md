# 2026-09-25 — Reasonable-cause step: "when did you learn" question removed

## Ownership
- Built in worktree `~/Documents/Claude work/form5472-rcs`, branch `feat/rcs-no-when`
  (from `origin/main` 2ffc9ee), merged to `main`. The shared checkout
  `~/Documents/Claude work/form5472` is still on another session's `feat/seo-geo-aeo-sprint`
  with uncommitted work — not touched.
- Files: `src/components/wizard/ReasonableCauseStep.tsx` (+ test),
  `src/lib/reasonableCauseOptions.ts` (+ test), `src/lib/completeness.ts`,
  `src/components/wizard-v3/status.ts`, `src/lib/filingStatus.test.ts`,
  `src/lib/pdf/generatePackage.ts` (+ test), this log, REPO-STATE.md index line.

## What shipped
- Owner: "How and when did you find out…" is useless — removed from the form. After a reason is
  picked, a green note says we'll turn the answer into a formal reasonable-cause statement for
  the filing package, reviewed by a qualified accountant before submission.
- `rcsWhenLearned` is no longer required (wizard validation, `completeness.ts`, wizard-v3
  status). Old saved values are passed through untouched and still print in the PDF.
- PDF: when there is no when-learned answer, section 2 closes with "Upon learning of the filing
  requirement, the Owner promptly arranged for this return and the accompanying Form 5472 to be
  prepared and submitted."
- Fixed the "No U.S. tax was owed" preset wording, which would have tripped pre-flight A26
  ("no U.S. income" pattern) on filings with U.S.-source income; answers saved with the old
  wording still reopen on that option (`previousSentences`).
- Evidence: full suite 742/742 (incl. new generator + wording-safety tests), tsc + eslint
  clean, production build checked in the browser (no when question, note shows, submit saves
  `rcsWhenLearned: ""` and keeps legacy values).

## Contracts
- Preset sentences must never match the A26 regexes in `src/lib/pdf/preflight.ts`
  (`reasonableCauseOptions.test.ts` enforces this). If you reword a preset, add the old sentence
  to `previousSentences`.
- Do not reintroduce `rcsWhenLearned` as a required field without the owner.

## Open
- Owner-gated: preset wording review by the qualified accountant (optional).
- Follow-up: none.
