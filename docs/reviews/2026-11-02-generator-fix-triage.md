# Generator fix spec — triage against generator 2.3.1 (2026-11-02)

Source: external "Filing Package Generator — Fix Specification" (2 Nov 2026,
kept outside the repo because it quotes real client data). Branch
`fix/generator-spec-2026-11` from `origin/main` 5260393. Every row was checked
against the CURRENT code and, where marked "render", against a synthetic
package generated and rasterised at 150 DPI (EXAMPLE IMPACT LLC twin, see §6
fixture below).

Status key: **ALREADY CORRECT** (code + test cited), **LIVE DEFECT**, **PARTIAL**.
Line numbers are for `origin/main` 5260393 unless the action names a new file.

House rule applied throughout (CLAUDE.md, owner 2026-10-14): a customer is
never blocked from paying. Wherever the spec says "required" or "reject at
generation time" this branch implements a **non-blocking customer warning**
plus a **staff-side blocking pre-flight A-code** (release/fax gate), never a
wizard error, checkout error or generation throw.

## §2 Priority 0

| Item | Status | Evidence | Action |
|---|---|---|---|
| P0-1 line 8a clipped | ALREADY CORRECT (2.1.0, 58b8069) | `generatePackage.ts:1080-1099` 4a and 8a both get the same `nameAndAddressLine(...)` with `singleLine: true`; `fillForm.ts:33` drops the multiline flag. Tests: `generatePackage.test.ts:630` (one fitted line), `:648` (over-long 8a shrinks + R02), `render.test.ts:82-91` (PyMuPDF finds the 8a string on 5472 page 2). Render: 8a prints `Name, street, city, region, postal, France` inside the 540x12 box (Tm y = 2.41). | No generator change. New PDF clip-box check A39 (validator) proves it on the produced bytes. |
| P0-2 formation state from mailing address | LIVE DEFECT | `generatePackage.ts:2178` `stateNameForProse(displayCaseAddressPart(f.llcState,...))` — `llcState` is the LLC *mailing* state (wizard "State", `FilingWizard.tsx:1007`). No formation-state column exists. Render of the twin: "formed ... on October 28, 2025 in Delaware". | New `Filing.llcFormationState` (additive migration), wizard field (optional + warning), admin-editable, `packageInput` pass-through; narrative uses ONLY it and omits the clause when missing; validator A45 (narrative state == intake) + W46 (missing on a package that prints the sentence). |
| P0-3 PBA code not on i1120 list | PARTIAL | Stored i1120 tables exist: `src/lib/irsCodes/pba-2023/2024/2025.json` (source i1120.pdf, retrieved 2026-09-21), `isValidPbaCode` (`irsCodes/index.ts:33`). Wizard picker only offers table codes (`FilingWizard.tsx:879-930`), PATCH rejects off-list codes (`api/filings/[id]/route.ts:353`), admin badge (`admin/filings/[id]/page.tsx:240`), pre-flight A05 (`preflight.ts:200`, test `preflight.test.ts:414`). All 17 codes in spec §2 P0-3 verified present in `pba-2025.json` with matching descriptions; 541613 is absent. **Not enforced:** the 1d/8c description vs 1e/8d code pairing. 8c/8d mirror 1d/1e (`generatePackage.ts:1103-1106`). | Validator A42 re-checks 1e/8d against the stored table on the produced PDF; new warning W47 when the 1d text shares no meaningful word with the table description of the printed code. No new codes added to the table (it is the extracted i1120 list). |

## §3 Priority 1

| Item | Status | Evidence | Action |
|---|---|---|---|
| P1-1 1120 tax-year fields blank | ALREADY CORRECT (2.3.0 item 9) | `generatePackage.ts:1220-1224` fills begin MM/DD, end MM/DD, year YY; A06 (`preflight.ts:227`). Tests `generatePackage.test.ts:100` (G-04), `:1210` (item 9). Render of the twin: header shows `10/28`, `12/31`, `25`. | Validator A46 asserts the three widgets are non-empty on the produced PDF. |
| P1-2 "Sole Member" over the jurat | ALREADY CORRECT | Stamped in the measured Title column at baseline 90 (2025) / 108 (2024): `generatePackage.ts:1300-1375`; A11 (`preflight.ts:328`, test `preflight.test.ts:159`). Render: "Sole Member" sits in the Title box, clear of the perjury paragraph. Colour is black 10pt, the spec suggests 8pt navy — cosmetic, not changed. | None. |
| P1-3 line 2 unchecked | ALREADY CORRECT | `generatePackage.ts:1059` unconditional; A01; tests `generatePackage.test.ts:86` (G-01), `render.test.ts:107` (pixel). | Validator A43 reads the flattened checkbox appearance. |
| P1-4 43a/43b answered | ALREADY CORRECT | Never written (`generatePackage.ts:1120-1128`); A03; test `generatePackage.test.ts:93` (G-02). | Validator A43 asserts both rows carry no mark. |
| P1-5 cover letter enclosure backwards | ALREADY CORRECT | `filingPackage.ts:34` "pro forma Form 1120 with Form 5472 attached"; A22; test `generatePackage.test.ts:277` (C-03). | None. |
| P1-6 Part V free text dates | LIVE DEFECT | `describeTx` prints the client description verbatim; A13 only checks the row's own date column (`preflight.ts:343`). Render of the twin: "Creation of my LLC - Oct 27 2026" printed in a 2025 statement. | Staff-blocking A48 (validator): any date in the Part V statement text outside the tax period. Client text is never rewritten. |
| P1-7 foreign province / postal | ALREADY CORRECT (intake + staff gate) | Wizard owner step: State/Province and Postal "Required" unless "no postal codes" ticked, country is a select of full names (`FilingWizard.tsx:79-105`, `:1370-1385`). Order street, city, region, postal, country (`generatePackage.ts:649-658`). A17 staff-blocking (`preflight.ts:425`). | Validator A49 checks the PRINTED 4a line: postal code present (unless "no postal code") and the country not abbreviated. |
| P1-8 FTIN spaced | LIVE DEFECT | `ownerFtinForForms` prints `f.ownerFtin` as typed (`generatePackage.ts:724`). Render of the twin: `12 34 567 890 123` on 4b(3)/8b(3). "None" only when `ownerHasFtin === false` — already correct (test `generatePackage.test.ts:138`). | Strip internal whitespace when printing. Validator A50: printed FTIN has whitespace, or "None" while the owner said they have one. |

## §4 Field rules

| Field | Status | Evidence | Action |
|---|---|---|---|
| 1120 header "Foreign-owned U.S. DE" | ALREADY CORRECT | `fillForm.ts:64`, `generatePackage.ts:2538`; A09; test `generatePackage.test.ts:668`. | — |
| 1120 box B EIN as on CP 575 | ALREADY CORRECT (as entered) | `generatePackage.ts:1233`; A20. Matching the CP 575 itself is a staff review step (no CP 575 data in the system). | Validator A40 checks EIN identical on every page. |
| 1120 box E initial/final | ALREADY CORRECT | `generatePackage.ts:1257-1272`; A10. Name/address change boxes are never ticked (no intake data) — owner-gated. | — |
| 1120 Title "Sole Member" | ALREADY CORRECT | see P1-2. | — |
| 5472 1c vs 1120 D | ALREADY CORRECT | A21 (`preflight.ts:508`). | — |
| 5472 1d/1e | PARTIAL | see P0-3. | A42 + W47. |
| 5472 1f (IV+V+VI) | ALREADY CORRECT | `generatePackage.ts:2513`; A12; tests `:155`, `:1080`, `:1117`. | Validator A41 on the produced PDF. |
| 5472 1g | ALREADY CORRECT | prints "1"; A12. | — |
| 5472 1h | ALREADY CORRECT | = 1f; A12. | A41. |
| 5472 1j | ALREADY CORRECT | `shouldCheckLine1j`; A15. | — |
| 5472 1l "United States" | ALREADY CORRECT | `generatePackage.ts:1052` (no dedicated test). | Asserted in the §6 acceptance test. |
| 5472 1m formation date | ALREADY CORRECT | `generatePackage.ts:1053`. | — |
| 5472 1o as entered | ALREADY CORRECT | `line1oCountry` maps demonyms only; default "United States" raises W16; test G-06 `:122`. | — |
| line 2 / line 3 | ALREADY CORRECT | see P1-3. | A43. |
| 4a / 8a identical single line | ALREADY CORRECT | see P0-1. | A44 (strings read from the PDF must be equal and non-empty). |
| 4b(2)/8b(2) reference ID | PARTIAL | A19 checks alphanumeric ≤ 50 and equal to the stored ID. "Identical every year / never reused for another person" is not checked across filings. | Follow-up (needs a cross-filing DB query); not in this branch. |
| 4b(3)/8b(3) FTIN | LIVE DEFECT | see P1-8. | Fixed. |
| 8c/8d related party's activity | PARTIAL (deliberate) | Mirrors 1d/1e for the sole individual owner (`generatePackage.ts:1103-1106`); the §6 acceptance table expects the same value on both. | No change; flagged as an IRS-content question for the owner (an individual's own trade may differ from the LLC's). |
| 8e "25% foreign shareholder" | ALREADY CORRECT | `generatePackage.ts:1095` (no dedicated test). | Asserted in the §6 acceptance test. |
| Part V box / statement / total | ALREADY CORRECT | A13, A34, A12. | A41. |
| 43a/43b blank | ALREADY CORRECT | see P1-4. | A43. |
| Cover letter: no perjury wording | ALREADY CORRECT (2.2.0) | tests `generatePackage.test.ts:286`, `:1070`, `render.test.ts:150`. | Validator A47. |
| RCS keeps perjury wording | ALREADY CORRECT | `AUTHORED_DOC_SIGNATURE_HEADING`; A25; test `generatePackage.test.ts:545` (C-06). | A47. |
| Drafted documents in the client's voice | ALREADY CORRECT (2.3.0) | first-person statements; A33 voice bans; `render.test.ts:156-165`. | — |

## §5 Validator checks (new module `src/lib/pdf/validatePackage.ts`)

None of these existed as checks on the PRODUCED PDF: every existing pre-flight
check reads `PackageRecord` (what the generator says it wrote), which is
exactly the blind spot P0-1 exploited. All rows below are **LIVE (missing)**
and are implemented on this branch; the code reads the flattened widget
XObjects and authored-page text out of the PDF bytes.

| Check | Code | Severity |
|---|---|---|
| Text drawn inside each flattened widget's clip box (y in [BBox.y0+1, BBox.y1-1]) | A39 | fail |
| Entity name, EIN, tax year identical on every page | A40 | fail |
| 1f == 1h == Part V statement total (whole dollars) | A41 | fail |
| 1e and 8d on the stored i1120 table; 1d / 8c not blank | A42 | fail |
| 1d text pairs with the code's table description | W47 | warn |
| Line 2 and line 3 checked; 43a/43b empty | A43 | fail |
| 8a string == 4a string | A44 | fail |
| Narrative formation state == intake `llcFormationState` | A45 | fail |
| Formation state missing on a package that prints the formation sentence | W46 | warn |
| 1120 tax-year beginning / ending / year non-empty | A46 | fail |
| No "penalties of perjury" on the cover letter; RCS signature block has it | A47 | fail |
| No date in the Part V statement outside the tax period | A48 | fail |
| Foreign address has a postal code and a non-abbreviated country | A49 | fail |
| FTIN printed unspaced; "None" only when the owner has no FTIN | A50 | fail |
| Validator itself could not read the package | A51 | fail (never throws) |
| Visual render kept per order (`pdftoppm -r 150`) | — | Skipped: follow-up (storage + retention decision). |

Codes: A37/A38 and W42–W45 are reserved by the parallel `sys-p0` lane, so this
branch uses **A39–A51 and W46–W47**.

## §6 acceptance fixture

The real client data in the spec stays out of the repo. The synthetic twin
`src/lib/pdf/__fixtures__/exampleImpact.ts` has the same shape: EXAMPLE IMPACT
LLC, formed 2025-10-28 in WY, Wilmington DE 19806 mailing address, short year
10/28–12/31/2025, French individual owner at "101 rue des Exemples, Fréjus,
Var, 83600, France", 13-digit synthetic FTIN typed with spaces, alphanumeric
reference ID, "Advertising services" / 541800, Part V contributions $253.94,
total assets $0. Assertions live in `src/lib/pdf/validatePackage.test.ts`.

Known deviation: the generator prints PDF-safe ASCII (`toPdfSafe`, NFKD), so
"Fréjus" prints "Frejus" on 4a and 8a (identical on both). Unchanged house
behaviour; the spec's expected string with "é" is not reproduced.
