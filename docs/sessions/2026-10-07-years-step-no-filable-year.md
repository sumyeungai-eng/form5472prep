# 2026-10-07 — Tax years step: LLC formed this year saw an empty picker

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/years-empty` / `years-step-no-years` → `origin/main` | `src/components/wizard/FilingWizard.tsx` (YearsStep only; `YearsStep` now exported for tests), `src/components/wizard/YearsStep.test.tsx` (new) |

## What shipped
- Customer report: "I can't select a year to continue". Their draft's date incorporated was 2026-04-10, so `selectableTaxYears` = [] (min formation year 2026 > max last completed year 2025). The step showed no buttons, yet defaulted to [2025] and rendered the Form 7004 block + "timely filing" text for a year it would reject.
- Now: a notice explains there is no tax year to file yet (first return covers the formation year, filable from January of the next year), with a "Fix the formation date" button that jumps to the Entity step; the final-return box still unlocks the current year. Default selection is filtered to selectable years; the 7004 block is hidden when nothing is filable.
- Evidence: YearsStep render tests (3) + FilingWizard tests pass (6/6), tsc 0, eslint 0, `next build` OK. Codex review (gpt-5.5, read-only): no findings, "ship it".

## Contracts
- Never pre-select a tax year the picker can't show.
- Year bounds stay in `src/lib/schemas.ts` (`selectableTaxYears` / `makeYearScopeSchema`) — unchanged.

## Open
- Owner: reply to the customer (formation date 2026-04-10 → confirm the date; if correct, nothing to file until 2027 unless the LLC closed).

## Lane notes
Single lane + Codex review. Targeted tests only (owner rule).
