# P2-9 PDF regression map (PR 9, 2026-11-03)

The 12 checks are the list in section 9 of the owner's `form5472prep-system-update.md` (kept outside the repo because it holds house-preparer identifiers). Paths are under `src/lib/pdf/`; line numbers are at commit time. "PDF-level" means the check reads the produced bytes through `validatePackage` / `readPrintedFields` / `readPageLines`.

| # | Check | Existing test (file:line) | Gap filled (new, `pdfRegression.test.ts` unless noted) |
|---|---|---|---|
| 1 | 1120 header dates populated (e.g. `04/18`, `12/31`, `25`) | `validatePackage.test.ts:42` (§6: 10/28, 12/31, 25, PDF-level); `generatePackage.test.ts:101` (G-04), `:1275` (item 9, 11/02 not 11/02/2024) | `:164` A46 negatives: begin / end / year blank on the printed page, and a wrong year (A40) |
| 2 | "Sole Member" inside the Title box, not over the perjury paragraph | `validatePackage.test.ts:42` (record rects vs measured Title column and jurat); `preflight.test.ts:162` (A11 negative) | `:177` "Sole Member" is drawn on the printed 1120 pages, with the rect bounds asserted |
| 3 | 5472 lines 2 and 3 checked | `validatePackage.test.ts:42` (PDF-level ticks); `generatePackage.test.ts:87` (G-01, record level) | `:131` A43 negatives: line 2 unticked, line 3 unticked |
| 4 | 4a and 8a one line in their box, no clipped second line | `generatePackage.test.ts:633` (about 75 chars), `:651` (over-long shrinks, R02); `validatePackage.test.ts:202` (A39 clip box) | `:69` a 110+ character line prints identically on 4a and 8a, one line, no A39/A44/A49. `:147` A44 negatives: 8a differs, 8a wraps, 8a blank |
| 5 | Foreign address has province/state and postal code | `validatePackage.test.ts:42` (Var, 83600, France), `:170` (A49) | `:87` Canadian owner: province name and postal code printed, country in full |
| 6 | Cover letter: "pro forma Form 1120 with Form 5472 attached", `Signed:`, no perjury wording | `generatePackage.test.ts:278` (C-03), `:1083` (item 6, every fixture); `validatePackage.test.ts:184` (A47 negative); `render.test.ts:175` (printed) | none |
| 7 | 1e/8d code from the IRS list, not an off-list NAICS code | `validatePackage.test.ts:42` (541800), `:159` (A42: 541613 blocks release, W47 mismatch) | none |
| 8 | Part VII: 43a-43b blank, lines 37-42 answered | `preflight.test.ts:333` (A04 passes), `:155`, `:353` (A04 negatives, record level); `validatePackage.test.ts:42` (43a) | `:191` PDF-level: lines 37, 39-42 print No, 38a/38c and 43a stay blank; `:131` A43 negative for a marked 43a |
| 9 | Decimal-separator check: contributions under $100 | `partVLineItems.test.ts:149` (W43, plus a fee paid personally is not flagged) | none |
| 10 | "LLC" designator on Form 1120, Form 5472 line 1a, cover letter, statements | A40 compares name and EIN across forms and authored docs (`validatePackage.test.ts:117`, `:132`) but nothing pinned the designator | `:108` "EXAMPLE IMPACT LLC" printed in all four places (cover letter whitespace-normalised, it wraps). `:122` a record name without "LLC" fails A40 |
| 11 | Part V statement and RCS end with `Signed under penalties of perjury:` | `generatePackage.test.ts:1312` (DoD, every statement carries it); `validatePackage.test.ts:42` | `:200` on the printed pages the heading is the last block and only the signature block follows |
| 12 | Owner's first person; no "prepared by" / "entered by customer" / mixed "the Owner"; `CUSTOMER_VERBATIM` body exempt | `generatePackage.test.ts:828` `VOICE_BANS` via `expectOwnerVoice` (statements) | `generatePackage.test.ts:834` adds `prepared by` ("entered by customer" was already in the list). `:1285` applies the bans to every authored document including the cover letter and exempts a `CUSTOMER_VERBATIM` RCS body (only text outside the body is held to the bans) |

## Notes
- Negative tests that edit the PDF use `overwriteField`: it replaces what one flattened widget draws (found by the same blank-form rectangle the validator uses), so a check is shown to fail on the printed page, not on the record.
- The A43 "43a marked" case also trips A39 (the stand-in tick has a made-up BBox); the test asserts the A43 message only.
- Everything uses the synthetic `EXAMPLE_IMPACT` fixture or `F11`. No real names, EINs, PTINs or addresses.
- Rasterised-ink checks stay in `render.test.ts` (V-02), unchanged.
