# 2026-10-08 — Pre-flight step reset to incomplete after Save and exit

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/preflight-persist` / `preflight-status-persist` → `origin/main` | `src/components/wizard-v3/FilingWizardV3.tsx`, `src/components/wizard-v3/preflightResume.test.ts` (new) |

## What shipped
- Customer report: every Save and exit marked "Pre-flight check" incomplete. Its 3 answers are client-only; on reload only isMultiMember was rebuilt (from llcMemberCount).
- `initialPreflightAnswers(filing)`: a draft with saved data (same `hasStartedFiling` predicate `resumeStep` uses to skip pre-flight) rebuilds the passing answers; brand-new drafts stay blank; saved member count 2 still flags multi-member.
- Evidence: 4 new tests pass, tsc 0, eslint 0, build OK. Codex review: no findings, "ship it" (checkout is gated server-side by filingCompletionIssues, EIN by entity completeness).

## Contracts
- Pre-flight answers remain unpersisted; status for returning drafts is derived from saved data.

## Open
- None.

## Lane notes
Single lane + Codex review; targeted tests only.
