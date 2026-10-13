# Lane A → Lane B contract: generator 2.3.0 record fields

Date: 2026-10-13. Branch `fix/preflight-generator-spec`. Spec: `2026-10-13-preflight-generator-spec.md`; decisions: `2026-10-13-preflight-generator-plan.md` (D1-D14); rules: `docs/filing-package-rules.md` (H1-H10, A06/A24/A25/A26 notes).

This file says what Lane B's pre-flight checks and admin workflow can read. Everything below is produced by `generatePackage()` in `src/lib/pdf/generatePackage.ts` and lands on the `PackageRecord` that `runPreflight(record, pdfBytes)` already receives. All new record fields are **optional in the type** (so the hand-built `goodRecord` in `preflight.test.ts` compiles) but **always set by `generatePackage`**. Treat `undefined` as "record predates 2.3.0" and skip the check (or warn), never as a pass/fail signal.

## 1. Schema (migration `20261013120000_preflight_generator_spec`, additive, nullable)

| Model.field | Type | Meaning | Who writes it |
|---|---|---|---|
| `FilingYearData.rcsAdminNarrative` | `String?` | The ONLY cause narrative the RCS renders. First person, admin-authored. Paragraphs separated by a blank line. | Admin UI (Lane B) |
| `FilingYearData.rcsLearnedOn` | `DateTime? @db.Date` | Date the owner learned of the requirement. Drives the "still unaware" sentence and one small-corp condition. Prisma returns a `Date` at UTC midnight; the adapter also accepts `"YYYY-MM-DD"`. | Admin UI |
| `FilingYearData.rcsSmallCorpParagraph` | `Boolean?` | `null` = automatic (on when conditions are met), `true`/`false` = admin override. | Admin UI |
| `Filing.paidPreparerMode` | `String?` | `null` or `"none"` = no preparer (default); `"house"` = fill the 1120 Paid Preparer block from config. Anything else is treated as `"none"`. | Admin UI |
| `Filing.irsMayDiscussWithPreparer` | `String?` | `null` = blank (default), `"yes"`, `"no"`. Anything else = blank. | Admin UI |

No `Filing.llcUsPresenceRegisteredAgentOnly` was added: the existing `Filing.llcAddressIsRegisteredAgentOnly Boolean?` (intake Q-05, already admin-editable) is the "registered-agent-only / no other U.S. presence" flag.

Customer exposure: all five fields are stripped from customer JSON by `toClientFiling` (`STAFF_ONLY_FILING_FIELDS` + new `STAFF_ONLY_YEAR_FIELDS`, applied to every `yearData` row) in `src/lib/session.ts`. Tests: `src/lib/session.test.ts`, `src/app/api/filings/[id]/route.test.ts`.

Adapter/select: `filingToPackageInput` (`src/lib/pdf/packageInput.ts`) maps all five. `packageFilingSelect` in `src/lib/admin/filingActions.ts` now selects them (the only Lane A edit in that file: 5 select keys). The OTHER select in that file (the admin page/`updateField` select, ~L240-327, which lists `rcsWhyMissed`/`rcsWhenLearned`/`rcsNoIrsNoticeConfirmed`) was NOT touched: add the new fields there when Lane B builds the UI and allowlists.

House preparer config: `src/config/housePreparer.ts` reads `HOUSE_PREPARER_NAME`, `HOUSE_PREPARER_PTIN` (`P` + 8 digits), `HOUSE_PREPARER_FIRM_NAME`, `HOUSE_PREPARER_FIRM_EIN` (`NN-NNNNNNN`), `HOUSE_PREPARER_FIRM_ADDRESS`, optional `HOUSE_PREPARER_PHONE`. Exports `housePreparerConfigStatus(env?) → { complete, missing[], invalid[] }` and `housePreparerFromEnv(env?) → HousePreparer | null`. Lane B can call `housePreparerConfigStatus()` directly in the admin UI. `generatePackage(f, finalisedAt, { env })` accepts an env override (tests use synthetic values).

## 2. Order-level fields on `PackageRecord`

| Field | Type | Meaning / suggested check |
|---|---|---|
| `lateYears` | `number[]` | Late tax years ascending (one RCS each). |
| `paidPreparerMode` | `"none" \| "house"` | Normalised `Filing.paidPreparerMode`. |
| `housePreparer` | `{ configComplete: boolean; missing: string[]; invalid: string[] }` | Env config status regardless of mode. **Item 8 error:** `paidPreparerMode === "house" && !housePreparer.configComplete` (name the `missing`/`invalid` env vars). The block is left blank in that case. |
| `irsMayDiscussWithPreparer` | `"yes" \| "no" \| null` | Normalised. The boxes are ticked only when a preparer is shown; a value with mode `"none"` is ignored (possible warning). |
| `customerReasonableCauseNarrative` | `string \| null` | Legacy `Filing.reasonableCauseNarrative` (customer text). Context only; never rendered. |
| `authoredDocuments[]` | existing | Rendered text of every authored page, line by line (`lines`, and `pages` for Part V/VI). Use these for any "text that actually renders" scan (cover letter, Part V, Part VI, RCS). |

## 3. Per-year fields on `PackageRecordYear` (`record.taxYears[i]`)

| Field | Type | Meaning / suggested check |
|---|---|---|
| `status` | `"timely" \| "late" \| "unresolved"` | Semantics changed (D2): a `"not_sure"` Form 7004 is NO extension, so that year is `"late"` once past its ORIGINAL due date. `"unresolved"` now only for the reviewer-only June 30 short-year edge (answer `"yes"`). |
| `reasonableCauseIncluded` | `boolean` | Unchanged: true exactly for late years. |
| `isFormationYear` | `boolean` | Tax year contains the formation date (true even when formation is Jan 1, unlike `isInitialYear`). **Item 10 / W15:** suppress W15 when the earliest package year has `isFormationYear` or `line1jChecked`. |
| `line1jChecked` | `boolean` | Existing. |
| `dueDate` | `string` (YYYY-MM-DD) | Effective due date used for lateness (extension applied only when valid; `"not_sure"` = none). |
| `extensionFiled` | `string \| null` | The 7004 answer applied to THIS year (latest year only; earlier years `null`). |
| `extensionUnclear` | `boolean` | **Item 14 warning:** true for the latest year when the answer is `"not_sure"` (or the June 30 edge). "Extension unclear - confirm with customer before fax". |
| `partVTotalCents`, `partVTotalRounded`, `partVICentsAddedToLine1f`, `line1f`, `line1h` | existing numbers | Owner-paid costs are already Part V contribution rows (`partVRows`, category `"contribution"`), so they are inside `partVTotalCents` and `line1f`. Part IV lines 22/36 stay `"0"`. |
| `partVStatementLine1fPrinted` | `number` (whole $) | The value printed on the Part V statement's last line `Form 5472 lines 1f and 1h: $X.` **Item 7 check:** `partVStatementLine1fPrinted === line1f === line1h === round(partVTotalCents + partVICentsAddedToLine1f)`, and both form fields (`form5472.fields` for `1f_totalPaymentsThisForm` / `1h_totalPaymentsAllForms`) equal `String(line1f)`. |
| `ownerPaidCosts` | existing | Raw owner-paid cost rows for the year. |
| `paidPreparer` | `{ shown: boolean; discuss: "yes"\|"no"\|null; fitFailures: string[] }` | `shown` = block filled on this 1120. `fitFailures` = preparer fields that needed < 6pt (warning/error at Lane B's discretion). The written values are also in `form1120.fields` under `form1120PaidPreparerFieldMaps[revision]` (`src/lib/pdf/fieldMaps.ts`). |
| `rcs` | `RcsYearRecord` (below) | Present for EVERY year; rendered flags are false for non-late years. |

### `RcsYearRecord` (`year.rcs`)

| Field | Type | Meaning / suggested check |
|---|---|---|
| `narrativeSource` | `"admin" \| null` | `"admin"` when `rcsAdminNarrative` has text. **Item 3 error** for a late year with `null`: "RCS narrative not written for tax year X". (Until Lane B rewords it, the existing A26 already fails with "Reasonable cause answers missing for X." because the authored doc's `rcsMissingAnswers` is now `narrativeSource === null`.) |
| `narrative` | `string \| null` | The admin narrative exactly as rendered (paragraphs joined by `"\n\n"`). **D8 / D9:** run A26's unsupported-operations regex and the blocked-phrase check (`?` addressed to us, "could you", "please review", "my objective", "minimal cost", "[CPA Name]") on THIS text; name the source as "Tax year X → RCS narrative (admin)". |
| `customerExplanation` | `{ whyMissed: string \| null; whenLearned: string \| null }` | Customer intake text (`rcsWhyMissed`, `rcsWhenLearned`). **Never rendered.** D8: scan it and report matches as admin context (warning only). |
| `learnedOn` | `string \| null` (YYYY-MM-DD) | **Item 4 warning:** `stillUnaware.needed && learnedOn === null` ("When learned not recorded for tax year X"). |
| `dueDate` / `dueDateProse` | `string` | Same due date as `year.dueDate`, plus prose ("April 15, 2026") as printed. |
| `isFirstLateYear` | `boolean` | Earliest late year in the package. |
| `stillUnaware` | `{ needed: boolean; rendered: boolean }` | `needed` = late year after the first late year; `rendered` = needed and `learnedOn > dueDate`. |
| `noticeConfirmed` | `boolean \| null` | Raw `rcsNoIrsNoticeConfirmed`. **Item 5 warning:** late year with `noticeConfirmed !== true` ("No IRS notice not confirmed for tax year X; the sentence was omitted"). |
| `noticeSentence` | `boolean` | "I have not received any IRS notice about this return." printed (late and confirmed Yes). |
| `firstTaxYearSentence` | `boolean` | "This is the LLC's first tax year." printed (late formation year). |
| `smallCorpParagraph` | `{ setting: boolean\|null; conditionsMet: boolean; conditions: { lateYear, registeredAgentOnly, noGrossReceiptsSignal, notKnownBeforeDueDate }; rendered: boolean }` | `rendered` = late and (`setting === null ? conditionsMet : setting`). Suggested warning: `setting === true && !conditionsMet` (admin forced on; list the false conditions). `noGrossReceiptsSignal` = `hasUsSourceIncome !== true` and no trading signal in the year's transactions (1120 line 1a is always blank on our pro forma). `notKnownBeforeDueDate` = not (`learnedOn` recorded and on/before `dueDate`) — a Lane A safety addition, since the paragraph says "I had no knowledge". |

### Authored documents (`record.authoredDocuments`)

- `kind: "reasonableCauseStatement"`: `rcsFallbackUsed` is always `false` (W26 can no longer fire); `rcsMissingAnswers === (rcs.narrativeSource === null)`; new `rcsNarrativeSource`.
- Signature blocks: RCS ends `["Signed under penalties of perjury:", "________________________________________", ownerName, "Sole Member, <LLC>", "Date: ______________________"]` (`AUTHORED_DOC_DATE_LINE`). Part V / Part VI keep the heading + line + name + `Sole Member`. Cover letter closes with `COVER_LETTER_CLOSING === "Signed:"` and must never contain "penalties of perjury" (existing A25 reads the config, so it already enforces this).
- **Item 8 error ("I prepared" with a preparer shown):** `record.taxYears.some(y => y.paidPreparer?.shown) && authoredDocuments.some(d => d.kind === "reasonableCauseStatement" && /\bI prepared\b/i.test(d.lines.join(" ")))`. The generator never writes "I prepared"; the only route is an admin narrative.

## 4. Behaviour changes Lane B must know

1. `isYearDelinquent` (customer screens, wizard, `completeness.ts`, `isDiirsp` recompute in `updateField` and the PATCH route) is UNCHANGED: "not sure" still defers there. The package uses the new `isYearDelinquentForPackage` / `packageExtensionFacts` in `src/lib/schemas.ts`. So for a "not sure" order the admin `isDiirsp` flag can read false while the package has an RCS. Decide in Lane B whether the admin page should show the package view (`record.taxYears[].status`).
2. A06 (the only Lane A edit in `preflight.ts`): the 1120 "tax year beginning" is `MM/DD` and must equal the 5472 begin month/day; under the short-year prior-revision exception (`shortYearException`) it stays `MM/DD/YYYY` because the prior-revision form prints the previous year.
3. `GENERATOR_VERSION` is `2.3.0`; `PAID_PREPARER_BLOCK` was removed from `src/config/filingPackage.ts` (unused). New config constants: `AUTHORED_DOC_DATE_LINE`, `PART_V_STATEMENT_CITATION`, `SMALL_CORPORATION_PARAGRAPH`, `COVER_LETTER_CLOSING = "Signed:"`.
4. Fixtures: `src/lib/pdf/__fixtures__/filings.ts` adds `F11` (two-year late, owner-paid $424 / $49, "not sure" extension, admin narratives, customer intake text in `rcsWhyMissed`), `lateCatchUpFinalisedAt`, `CUSTOMER_INTAKE_TEXT`, and `adminNarrative(year)`; F5/F6/F8/F10 now carry admin narratives so they still pass pre-flight. F11 currently raises W15 on 2025 (the item 10 false positive Lane B fixes).

## 5. Not done in Lane A (Lane B scope)

No new pre-flight checks (only A06 changed), no admin UI, no `updateField`/`updateYearField` allowlist changes, no pre-flight persistence changes, no "customer declared none" override (item 7 admin part).
