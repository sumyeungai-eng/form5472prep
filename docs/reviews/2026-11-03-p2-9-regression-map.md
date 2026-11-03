# P2-9 PDF regression map (PR 9, 2026-11-03)

**Caveat, read first.** The owner's original `form5472prep-system-update.md` is not committed (it holds house-preparer identifiers), so the numbered list of the "12 checks" is not on disk. Items **4, 5, 9, 10 and 12** are numbered in the PR 9 brief and are exact. Items **1, 2, 3, 6, 7, 8 and 11** are my reconstruction from the validator codes and the §6 table. Owner: please confirm or renumber them against the original.

Paths are under `src/lib/pdf/`. Line numbers are at commit time. "PDF-level" means the check reads the produced bytes through `validatePackage` / `readPrintedFields` / `readPageLines`.

| # | Check | Existing test (file:line) | Gap filled (new) |
|---|---|---|---|
| 1 | Form 5472 lines 2 and 3 ticked; 43a/43b blank (A43) | `validatePackage.test.ts:42` (§6 table, positive); `generatePackage.test.ts:87`, `:94` (G-01, G-02, record level) | `pdfRegression.test.ts:130` A43 negatives: line 2 unticked, line 3 unticked, 43a marked |
| 2 | Form 1120 header: begin MM/DD, end, 2-digit year (A46) | `validatePackage.test.ts:42`; `generatePackage.test.ts:101` (G-04), `:1275` (item 9) | `pdfRegression.test.ts:163` A46 negatives: begin / end / year blank, and a wrong year (A40) |
| 3 | Business code 1e/8d and description 1d/8c (A42, W47) | `validatePackage.test.ts:42` (541800 and "Advertising services"), `:159` (A42 off-list, W47 mismatch) | none |
| 4 | 4a and 8a: same single line, no clipped second line, LONG foreign address | `generatePackage.test.ts:633` (about 75 chars, fitted), `:651` (over-long shrinks, R02), `validatePackage.test.ts:202` (A39 clip box, synthetic field) | `pdfRegression.test.ts:68` a 110+ character line prints identically on 4a and 8a, one line, no A39/A44/A49. `:146` A44 negatives: 8a differs, 8a wraps, 8a blank |
| 5 | Foreign address includes province and postal code when supplied | `validatePackage.test.ts:42` (Var, 83600, France), `:170` (A49 abbreviated country, missing postal) | `pdfRegression.test.ts:86` Canadian owner: province name and postal code printed, country in full |
| 6 | 1f = 1h = printed Part V total (A41) | `validatePackage.test.ts:42` (254 / 254 / $253.94); `partVLineItems.test.ts:36` (spec fixture, A41 passes); `generatePackage.test.ts:156` (G-08) | none |
| 7 | FTIN unspaced; "None" only when the owner has none (A50) | `validatePackage.test.ts:42` (unspaced), `:179` (A50 negative); `generatePackage.test.ts:139` (no-FTIN gives None) | none |
| 8 | RCS formation state from `Filing.llcFormationState` only (A45, W46) | `validatePackage.test.ts:92` (omitted + W46, never the mailing state), `:103`, `:110` (A45 negative) | none |
| 9 | W43: a contribution or loan under $100, not a small personal fee | `partVLineItems.test.ts:149` | none (the P0 lane's test pins it) |
| 10 | LLC designator on Form 1120, Form 5472 line 1a, cover letter and statements | A40 compares name and EIN across forms and authored docs (`validatePackage.test.ts:117`, `:132`), but no test pinned the designator itself | `pdfRegression.test.ts:107` "EXAMPLE IMPACT LLC" printed in all four places (cover letter whitespace-normalised, it wraps). `:121` a record name without "LLC" fails A40 |
| 11 | Cover letter has no perjury wording; statements keep the signature block (A47) | `validatePackage.test.ts:42`, `:184` (A47 negative); `generatePackage.test.ts:1312` (DoD, signed statements, cover letter clean), `:278` (C-03) | none |
| 12 | Owner's voice in statements and cover letter | `generatePackage.test.ts:828` `VOICE_BANS` via `expectOwnerVoice` (statements); `:1312` DoD | `generatePackage.test.ts:834` adds `prepared by` to `VOICE_BANS` ("entered by customer" was already there). `:1285` applies the bans to every authored document including the cover letter, and exempts a `CUSTOMER_VERBATIM` RCS body (only text outside the body is held to the bans) |

## Notes
- A negative test that edits the PDF uses `overwriteField` in `pdfRegression.test.ts`: it replaces what one flattened widget draws, found by the same rectangle the validator uses, so the check is proven to fail on the printed page and not on the record.
- The A43 "43a marked" case also trips A39 because the stand-in tick has a made-up BBox; the test asserts the A43 message only.
- Everything uses the synthetic `EXAMPLE_IMPACT` fixture or `F11`. No real names, EINs, PTINs or addresses.
- Not covered by a new PDF-level test: render (rasterised ink) checks stay in `render.test.ts` (V-02), unchanged.
