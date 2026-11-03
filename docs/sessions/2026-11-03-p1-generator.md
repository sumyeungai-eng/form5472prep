# 2026-11-03 — P1 generator lane: PR 5 house preparer config, PR 6 W39, PR 9 PDF regression tests

Spec: `docs/reviews/2026-10-30-system-update-plan.md` → PR 5, PR 6, PR 9, decision D10. Builds on generator 2.4.0 (`2026-11-02-generator-fix-spec.md`) and P0 / 2.5.0 (`2026-11-04-system-update-p0-2-4.md`). Generator is now **2.5.1**.

**Status:** committed locally on `feat/p1-generator` (from origin/main `e4837aa`). **NOT pushed.** The parallel lane (PR 7, 8, 10) works on disjoint files.

## Ownership
| Checkout / branch | Owns |
|---|---|
| `~/Developer/f5472-wt/p1-gen`, `feat/p1-generator` | This lane. Files: `src/config/housePreparer.ts` (+ new `housePreparer.test.ts`), the preparer block of `src/lib/pdf/generatePackage.ts`, A35/W39/W41 area of `src/lib/pdf/preflight.ts`, `.env.example`, tests under `src/lib/pdf/`, `docs/reviews/2026-11-03-p2-9-regression-map.md`. |
| Outside the owned list (version bump only) | `src/config/filingPackage.ts` (`GENERATOR_VERSION` 2.5.1 + comment), and the two tests that assert the version: `src/lib/pdf/persistPreflight.test.ts`, `src/lib/pdf/validatePackage.test.ts`. |
| `~/Documents/Claude work/form5472` (main) and other worktrees | Not touched. |

## What shipped (commits)
| Commit | PR | Change |
|---|---|---|
| `a2ce0dd` | PR 5 | `HOUSE_PREPARER_NAME` optional (blank box, no A35). PTIN, firm name, firm EIN, firm address required. `HOUSE_PREPARER_FIRM_PHONE` with fallback to `HOUSE_PREPARER_PHONE`. `HOUSE_PREPARER_IRS_DISCUSS` (`blank`/`yes`/`no`). `.env.example` placeholders. Version 2.5.1. |
| `6250a63` | PR 6 | W39 scans the whole street for a unit label, exempts Thai/Japanese numbering terms, and flags a trailing house number without needing a leading number. |
| `bf56fc9` | PR 9 | Regression map doc, `pdfRegression.test.ts`, `prepared by` in `VOICE_BANS` plus the cover-letter/verbatim-exempt voice test. |

## Evidence
- **Full vitest (`rtk proxy npx vitest run`), once:** 193 files, 4504 tests, all passed (no flakes this run); `pdfRegression.test.ts` then grew from 7 to 10 tests and was re-run alone: 10 passed.
- **`npx tsc --noEmit -p .`:** exit 0.
- **`next build`** (`MAGIC_LINK_SECRET=x SESSION_SECRET=placeholder-…`): exit 0. It compiled and generated 574/574 pages; the Prisma "database unavailable" lines are the usual local noise.
- **Mutation check:** the PR 5 fit test fails when the firm address is lengthened until it overflows.

## Contracts a future editor must respect
- **House preparer config** (`src/config/housePreparer.ts`): required = PTIN (`P\d{8}`), firm name, firm EIN (`NN-NNNNNNN`), firm address. Name is optional and `HousePreparer.name` is `""` when unset (the generator skips the name box). Phone = `FIRM_PHONE`, else `PHONE`.
- **IRS_DISCUSS precedence:** the order's own `irsMayDiscussWithPreparer` (`"yes"`/`"no"`) always wins. `Filing.irsMayDiscussWithPreparer` is `String?`, so null already means "unset": the env default is applied at generation time (no schema change, not "new orders only"). It applies **only in house mode**, so a `none` order never gets the boxes and never trips W41. An unrecognised env value is reported by `housePreparerConfigStatus` as invalid (A35 fails, block blank): a consent box is never guessed.
- **Signature, date and self-employed boxes stay blank. The per-order paid-preparer choice stays default None.**
- **W39 predicate** (`preflight.ts`): a unit label (Room, Rm, Apt, Unit, Suite, Ste, Flat, Fl, Floor, `#x`, plus the older block/tower/bldg/no/lot/box set) in ANY comma part silences the bare-trailing-number warning. A comma part holding `Moo|Mu|Moo Ban|Soi|Tambon|chome` or `N-ban|N-go` (whole words) is skipped. Otherwise a last word like `5`/`5B` after a non-numeric word warns, except after Route/Hwy/Interstate/Road/Rd. The all-lowercase warning is unchanged. The address is never rewritten.
- **Behaviour change to know about:** `Calle Mayor 5` (a house number after the street name, common in Spanish and other formats) now warns W39 because the spec requires `Main Street 5` to warn. W39 is a staff warning, never a block.
- **Version:** any change to what the generator prints for a given (filing, env) bumps `GENERATOR_VERSION` and the two version-asserting tests. This lane bumped it because a name-less config and the IRS_DISCUSS default change output. It makes existing pre-flight results show as stale, as 2.5.0 did.

## 12-check map (PR 9)
`docs/reviews/2026-11-03-p2-9-regression-map.md`, built from section 9 of the owner's `~/Downloads/form5472prep-system-update.md` (kept outside the repo). Gaps filled: item 1 (A46 negatives), 2 (printed "Sole Member"), 3 (A43 negatives), 4 (110+ char address, A44 negatives), 5 (Canadian province + postal), 8 (PDF-level lines 37-42), 10 (designator in all four places), 11 (signature block is last), 12 (`prepared by`, cover letter, verbatim exemption). Items 6, 7 and 9 were already covered.

## Open
### Owner-gated
- **D9, Vercel Production env (owner only; never in the repo).** Set in Vercel Production:
  - `HOUSE_PREPARER_PTIN` = `P00000000` (placeholder; the real PTIN)
  - `HOUSE_PREPARER_FIRM_NAME` = `Example Firm LLC`
  - `HOUSE_PREPARER_FIRM_EIN` = `00-0000000`
  - `HOUSE_PREPARER_FIRM_ADDRESS` = `1 Example Street, Example City, ST 00000`
  - `HOUSE_PREPARER_NAME` = optional; leave unset for a blank name box
  - `HOUSE_PREPARER_FIRM_PHONE` = optional (`HOUSE_PREPARER_PHONE` still works as the fallback)
  - `HOUSE_PREPARER_IRS_DISCUSS` = `blank` | `yes` | `no` (default `blank`; leave `blank` unless the owner decides the firm may discuss)
  
  An admin then sets "Paid preparer" to House preparer per order. A long firm name or address shrinks to fit (6 to 8 pt); only an extreme value raises W41.
- Push to `main` (one push, after the other lane merges) is the orchestrator's and owner's call. No migrations in this lane.

### Follow-ups
- After merge, regenerate a real house-preparer order with the production env and eyeball the rendered 1120 block (the fit test is synthetic).
- If `Calle Mayor 5`-style addresses produce W39 noise, add a country-aware exemption (not done: out of the spec).

## Lane notes
- Worktree setup: `cp -Rc` node_modules, `npm install`, `prisma generate`, `git checkout -- package-lock.json`.
- Pre-commit secret grep (`secret|password|client_id|Bearer|P0350|30-1337|Furness|Gloucester`) printed CLEAN for all three commits. No real preparer data anywhere in the repo.
