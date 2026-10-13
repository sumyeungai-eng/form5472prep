# 2026-10-14 — Pre-flight + generator spec (generator 2.3.0)

Spec: `docs/reviews/2026-10-13-preflight-generator-spec.md` (owner: "fix everything"; client data scrubbed).
Decisions D1-D14 + code map: `docs/reviews/2026-10-13-preflight-generator-plan.md`.
Record contract between generator and pre-flight: `docs/reviews/2026-10-13-preflight-generator-contract.md`.

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/preflight-gen`, branch `fix/preflight-generator-spec` (from origin/main 0e7f8cd), pushed to `main` | Lane A (generator + schema): `prisma/schema.prisma`, `prisma/migrations/20261013120000_preflight_generator_spec/`, `src/lib/pdf/{generatePackage,packageInput,fieldMaps}.ts`, `src/config/{filingPackage,housePreparer}.ts`, `src/lib/schemas.ts` (package lateness), fixtures/snapshots, `src/lib/session.ts` (strip). Lane B (pre-flight + admin): `src/lib/pdf/{preflight,persistPreflight}.ts`, `src/lib/admin/filingActions.ts`, `src/app/admin/filings/[id]/*`, stripe-webhook / checkout / generate-pdf persistence, admin PDF route `?variant=draft`. Orchestrator: `src/lib/completeness.ts` fax gate, corrective-action fix. |
| Main checkout `~/Documents/Claude work/form5472` (`feat/seo-geo-aeo-sprint`, dirty) | NOT touched. |

## What shipped (commits c4ff526..HEAD on main)
- Generator 2.3.0: first-person RCS (Background / Cause / Filing history / Corrective action), cause text ONLY from the new admin field `FilingYearData.rcsAdminNarrative` (customer `rcsWhyMissed` / `rcsWhenLearned` / legacy `reasonableCauseNarrative` never print); one RCS per late year after its own Part V; "not sure" extension = no extension for the PACKAGE (`isYearDelinquentForPackage`); "remained unaware" sentence from `rcsLearnedOn`; notice sentence only when confirmed Yes; first-tax-year sentence only in the formation year; small-corporation paragraph (spec text, Treas. Reg. 1.6038A-4(b)(2)(ii)) with per-year Auto/On/Off; cover letter closes "Signed:" (no perjury wording); Part V first person, schedule + total, "Form 5472 lines 1f and 1h: $X.", citation 1.6038A-2(b)(3)(xi) (verified); 1120 header MM/DD; paid preparer block per order (`Filing.paidPreparerMode` none/house, `irsMayDiscussWithPreparer` blank/yes/no) from `HOUSE_PREPARER_*` env, mapped and visually checked for 2018-2025 revisions; signature/date/self-employed stay blank.
- Pre-flight: one persistence helper at all 5 trigger sites; `rerunPreflight` action + auto re-run after every `updateField`/`updateYearField` and Regenerate; stale badge (latest change-log edit vs check time); override kept only while new failures ⊆ approved failures; upload control disabled with inline reason + link to override; A26 names the field and quotes phrases; A32 narrative missing; A33 blocked phrases; A34 Part V total = 1f/1h; A35 preparer config / "I prepared"; W15 suppressed for formation year / 1j; W26b customer-text context; W34 learned-on missing; W35 notice not confirmed; W36 extension not sure; W37/W38 SIN (Luhn) / CPF / swapped fields; W39 address quality; A22 wrapped-name fix.
- Regenerate while a reviewed PDF is current: draft only (`${id}_unsigned.pdf`), client version untouched, "Download latest generated draft".
- Fax gate (`retryFax`) now requires the admin narrative for each package-late year (`hasAdminReasonableCauseForFax`); customer-wizard gate unchanged (Codex finding).
- Evidence: 706 targeted tests (40 files) + fax-gate/admin/pdf re-run 553 pass; tsc 0; eslint 0; `next build` 0; rendered synthetic two-year late package inspected (owner voice, 0 "the Owner"/"I prepared", cover letter "Signed:", Part V $424/$49, two RCS, pre-flight ok with only a genuine W35). Codex reviews: c4ff526 (1 finding fixed: corrective action named timely years) and full branch (1 finding fixed: fax gate).

## Contracts a future editor must respect
- Customer free text never renders into IRS-facing documents. RCS cause = `rcsAdminNarrative` only. No fallback.
- Every new late order fails pre-flight at payment (A32) until an admin writes the narrative — by design. Customer flows are unaffected (findings are staff-only and stripped from customer APIs).
- Package lateness ≠ customer-wizard lateness for "not sure" extensions (`isYearDelinquentForPackage` vs `isYearDelinquent`). The admin page shows "Late years (package)".
- Client signs `generatedPdfKey`; fax sends `signedPdfKey` (copied to `${id}_faxed.pdf`).
- New staff-only fields (narrative, learned-on, small-corp toggle, preparer settings, pre-flight findings) must stay out of `toClientFiling`/customer & partner APIs.
- House preparer details live ONLY in env vars (never in code or tests).
- Rules doc `docs/filing-package-rules.md` updated (H1-H10 + pre-flight rows); follow its change procedure.

## Open
Owner-gated:
- Set Vercel env vars `HOUSE_PREPARER_NAME`, `HOUSE_PREPARER_PTIN`, `HOUSE_PREPARER_FIRM_NAME`, `HOUSE_PREPARER_FIRM_EIN`, `HOUSE_PREPARER_FIRM_ADDRESS`, optional `HOUSE_PREPARER_PHONE` before choosing "House preparer" on any order (A35 blocks otherwise).
- Keep or drop the extra forward-looking corrective-action sentence ("I will file … by the due date for each later tax year …") — not in the spec.
- In-flight late orders generated under 2.1/2.2: a field save now re-runs pre-flight and will fail A32 until a narrative is written; on SIGNED_UPLOADED orders that holds the fax (override or write narrative + regenerate/re-sign).
Follow-ups:
- Customer wizard edits aren't change-logged, so the stale badge can't see them.
- `extensionUnclear` amber chips and W36 are separate signals.
- Regenerate still refused at SIGNED_UPLOADED (existing guard).
- Admin UI verified by server-rendered unit tests only (no local DB); first live use should be watched.

## Lane notes
- Two sequential deep-reasoner lanes in one worktree with a written contract worked; the orchestrator's own one-line fix broke tsc (Set spread, TS2802) — run `npx tsc --noEmit` after ANY own edit before committing.
