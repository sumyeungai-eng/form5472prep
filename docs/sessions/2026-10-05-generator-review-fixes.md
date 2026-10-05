# 2026-10-05 — generator fixes from an external package review (generator 2.1.0)

**Checkout/branch:** worktree `~/Developer/f5472-wt/genfix`, branch `fix/generator-review-findings` → `main`.

**Owned files:**
- `src/lib/pdf/{generatePackage,fillForm,preflight,fitText,textFormat}.ts`, plus tests (`generatePackage.test.ts`, `preflight.test.ts`, `render.test.ts`, `fitText.test.ts`, `textFormat.test.ts`) and `src/lib/pdfText.test.ts`
- Fixtures F10 / F10NoExtension in `src/lib/pdf/__fixtures__/filings.ts`
- `src/config/filingPackage.ts` (version + header constant)
- `src/components/wizard/TransactionsReview.tsx` (one hint line)
- this log

## Trigger
The owner ran an independent AI check (form-5472-check style) on generated package `cmuvfn1n10001jv04kyuts721_unsigned.pdf` (HK owner, TY2023–2025, $0). Verdict: NEEDS CORRECTION.

## What shipped (generator 2.1.0)
1. **5472 lines 8a/4a:** they print "Name, address" on ONE line with a comma. The font auto-fits from 10pt down to a 6pt minimum (`fitText.ts`; per-glyph width because pdf-lib's kerned measure under-reads). If the text still can't fit at 6pt it shrinks to stay inside the box, and pre-flight R02 fails. 8a is forced single-line in `fillForm.ts`. The same fit applies to the 1120 and 5472 Part I name/address lines.
2. **Header:** reads exactly "Foreign-owned U.S. DE" on the 1120 and 5472 (`FOREIGN_OWNED_DE_HEADER`); "— DIIRSP" is removed. New pre-flight failure A31 blocks any DIIRSP or "Delinquent International Information Return" text in generated documents.
3. **Nationality wording (RCS):** `ownerNationalityClause`. Hong Kong/Macau → "a Hong Kong permanent resident". Otherwise "a citizen and resident of X" or "a citizen of X and a resident of Y".
4. **RCS cause section:** adds a no-US-source-income / no-US-tax sentence only when `hasUsSourceIncome === false`. No invented "learned on" date.
5. **Late determination:** now uses `finalisedAt` instead of the wall clock. The extension answer applies to the latest tax year only (the wizard asks once). A timely year gets no RCS page and no late wording. The original package's 2025 RCS means that filing's stored `extensionFiled` is probably not a valid "yes" → check in admin.
6. **$0 Part V statement:** one sentence. Also fixed table rows overlapping (`TABLE_ROW_ADVANCE`).
7. **City/region casing:** all-lower or all-upper values are title-cased for print (`displayCaseAddressPart`). Mixed case is untouched; apostrophe particles are handled (O'Fallon, Coeur d'Alene, Val-d'Oise).
8. **Region repeats country** ("Kowloon, Hong Kong, Hong Kong") is dropped in joined single-line addresses only. A state equal to the CITY is kept ("New York, New York 10001"). The 1120 separate state box is unchanged.
9. **New non-blocking warnings:**
   - W31: no foreign tax ID (e.g. HKID).
   - W32: street with no number/flat.
   - W33: $0 Part V in the formation year.

   Admin already renders warnings.
10. **Wizard:** the transactions hint names the state filing fee, registered agent fee and annual report fee.

## Verification
- **Tests:** vitest 1923/1923; tsc 0 errors; `next build` passes.
- **Independent review, Codex gpt-5.5 (×2):**
  - Pass 1: one LOW apostrophe issue, fixed.
  - Pass 2: flagged "New York, New York" state dropping and "Coeur D'Alene"; both fixed with tests.
- **Visual check:** ext-yes/ext-no packages rendered and inspected:
  - 8a/4a fit with the comma; "Kowloon" casing; no "DIIRSP"; Hong Kong permanent-resident wording.
  - 2025 RCS present only when there was no extension.
  - Pre-flight: 0 failures, W31/W32/W33 fire.

## Contracts
- Every printed address goes through the accessor helpers in `generatePackage.ts`; never print raw `ownerAddressCity`/`State`.
- Generated documents must never contain DIIRSP wording (A31 enforces this).
- RCS sentences must be backed by intake data (signed under penalties of perjury).

## Open
**Owner / this customer (filing cmuvfn1n10001jv04kyuts721):**
- Regenerate the package in admin after deploy (it is unsigned).
- Ask the client for:
  - their HKID number (FTIN);
  - flat and floor at their building;
  - who paid the 2023 formation / registered agent / annual report fees (Part V contributions);
  - whether a 7004 was filed for 2025 (check the stored `extensionFiled`).

**Owner:**
- The Paid Preparer block on the 1120 is still blank. It needs the PTIN, firm name, firm EIN and address before it can be filled.

**Follow-ups:**
- Marketing pages (`landing-pages.ts`, `faq.ts`) still describe DIIRSP as a live procedure.
- The wizard's 7004 question doesn't name the tax year.
