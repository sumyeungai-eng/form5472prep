# Form 5472 / Pro Forma Form 1120 Filing Package Rules

This document is the authoritative written rule set for the Form 5472 / pro forma Form 1120 generator. Update this document before changing code that implements a rule, then update the assertion list and tests to match the new rule.

## Domain Rules

### Form 5472, Part I: the LLC

| Line | Rule |
|---|---|
| Header tax year beginning / ending | Always populate these dates. They must match the Form 1120 header dates. |
| 1a | Print the LLC legal name and address. Use one address, identical on every page of the package, following the LLC address rule below. |
| 1b | Print the EIN in `NN-NNNNNNN` format. |
| 1c | Print total assets at period end, in whole U.S. dollars. If Form 1120 item D is filled, it must equal this value. |
| 1d / 1e | Print the activity description and principal business activity code. The code must appear in the Principal Business Activity Codes list in the Form 1120 instructions for the tax year. A real NAICS code is not enough. Known bad outputs are `541611`, `541510`, and `000000`. Known good outputs are `541600`, `541512`, and `523900`. For unclassified or no activity, use `999000`, not `999999`. |
| 1f | Print the total reported on this Form 5472. It equals the Part V monetary total plus Part IV lines 22 and 36 plus Part VI fair market value where used. It is computed in whole dollars and is never typed by hand. |
| 1g | Print the number of Forms 5472 filed for the year. This equals the number of related parties with reportable transactions. |
| 1h | Print the sum of line 1f across all Forms 5472 for the year. With one related party, 1h equals 1f. |
| 1i | Leave unchecked. This is not a consolidated filing. |
| 1j | Check only when this is the first year the LLC files Form 5472. Derive this from tax year equals formation year and the client answered that no earlier Form 5472 was filed. If an earlier year existed but was never filed, do not guess. Flag it for reviewer handling. |
| 1k | Print `0` for number of Parts VIII attached. |
| 1l / 1m | Print country of incorporation as `United States` and print the formation date. |
| 1n | Print `United States`. |
| 1o | Print the principal country where the LLC conducts business. This must come from the LLC's own questionnaire field and must never be auto-filled from the owner's country of residence. |
| Line 2 | Check this line. A foreign person owns at least 50 percent of vote and value of every entity this product serves. |
| Line 3 | Check this line for foreign-owned U.S. DE. |

### Form 5472, Parts II and III: the owner

| Line | Rule |
|---|---|
| 4a and 8a | Print the owner name and complete foreign address: street, city, province/state, postal code, and country. The address must physically print. |
| 4b(1) / 8b(1) | Print the U.S. identifying number if the owner has one, such as an ITIN. Otherwise leave blank. |
| 4b(2) / 8b(2) | Print the reference ID. It must be alphanumeric only, with no spaces or special characters, maximum 50 characters. Generate it once per owner, store it, and reuse it unchanged every tax year. Never regenerate it. |
| 4b(3) / 8b(3) | Print the owner's foreign tax ID if one exists. If the owner has none, print `None`. A U.S. ITIN is not an FTIN and must not be accepted here. |
| 4c / 8f | Print the principal country where the owner conducts business. |
| 4d | Print the owner's country of citizenship, or incorporation if the owner is a company. |
| 4e / 8g | Print the country where the owner files as a tax resident. |
| Part III heading | Check the `Foreign person` box. |
| 8c / 8d | Print the related party activity and code. Use the same Form 1120 code-list rule as line 1e. |
| 8e | Leave the generator's current relationship boxes as they are unless audit shows none is ticked. |

### Parts IV through VII

| Part | Rule |
|---|---|
| Part IV | Leave the generator's current treatment unchanged. Do not fix it as part of these rules. |
| Part V | Check the box. Attach a statement listing every transaction between the LLC and its foreign owner, including contributions, distributions, loans either way, and amounts the owner paid personally on the LLC's behalf. Each row must include its actual date, description, and amount. Third-party customer receipts, vendor payments, and cashback do not belong here. |
| Part VI | Check this part and attach a description only when something other than cash moved between owner and LLC, such as securities transferred in. The description states what was transferred, the date, the fair market value, and how it was valued. Count the value once in 1f and 1h. If the same transfer is also listed in the Part V statement, say so on the Part VI sheet and do not add it twice. |
| Lines 37-42 | Answer each line, normally `No`. |
| Lines 43a, 43b(1), 43b(2) | Leave these lines completely blank. Complete them only if the reporting corporation is a domestic corporation. Do not complete them for a foreign-owned U.S. DE. Ticking `No` is wrong. |
| Related parties | Prepare one Form 5472 per related party with reportable transactions. The generator currently assumes one. Minimum rule: if the questionnaire ever indicates more than one, block generation and route to the reviewer. Optional later rule: generate one form per party and set 1g accordingly. |

### Pro forma Form 1120

- Use the Form 1120 for the tax year being filed, such as the 2023 form for a 2023 return. Exception: a short year that begins and ends in year N may go on the year N-1 form if the year N form is not yet released. The tax-year fields must still show the year-N dates.
- Print `Foreign-owned U.S. DE` across the top of page 1.
- Always populate the header fields for tax year beginning and ending, including for a full calendar year.
- For a first year, the period begins on the formation date, not January 1.
- For a final year, the period ends on the dissolution date, meaning the effective date on the certificate of dissolution or cancellation, not December 31.
- Complete name, address, item B EIN, and item E. Tick E(1) Initial return in the first year and E(2) Final return on a final return.
- Items C and D may remain filled as today. Item D must equal Form 5472 line 1c.
- Put the signer's title in the Title field on the Sign Here line.
- Nothing may be drawn over the printed declaration.
- Use the configured paid preparer block rule.

### LLC address

Do not use the registered agent's address. If the client says the LLC genuinely receives mail at the U.S. address, such as its own suite number or mail-forwarding unit, use it. If the U.S. address is only the registered agent's address, use the owner's real address, usually foreign, so IRS notices reach the owner.

### Filing status and reasonable cause statement

- Original due date is the 15th day of the 4th month after the tax year ends. For a calendar year this is April 15. For a dissolved entity, it is the 15th day of the 4th month after the dissolution date. Never hard-code April 15.
- A valid Form 7004 adds six months to the original due date, subject to the amendment and source caveat for a final short year ending June 30 before 2026.
- If a due date falls on a Saturday, Sunday, or U.S. federal legal holiday, move it to the next business day.
- Accept the client's statement that an extension was filed as given. Do not demand proof, transmission dates, or destination. Optional follow-up fields may remain optional, never required.
- If the return is timely or validly extended, do not generate, offer, attach, or mention a reasonable cause statement. Attaching one to a timely return mislabels it as late.
- If the return is late, a reasonable cause statement is required, one per tax year.
- If the client is unsure whether an extension was filed, do not classify the return. Route it to the reviewer with a neutral holding message to the client.

### Wording rules for documents we write

- The cover letter says what is enclosed, for which entity, EIN, and tax years, and nothing else. It must not contain a sentence about timeliness, lateness, or compliance.
- Use the exact configured enclosure wording in the body and in the Re line.
- The cover letter date is the date the package is finalized for signing and fax, not the order creation date.
- Write U.S. state names in full in prose, such as `Florida`, not `FL`. Postal abbreviations are fine inside address blocks.
- Never promise or imply that penalty relief is automatic or guaranteed.
- Customer-facing screens and emails do not use the words `DIIRSP` or `delinquent`. Use: `This return is being filed after its due date. We include a reasonable-cause statement explaining why.`

## Assertion List

| ID | What it checks | Implemented |
|---|---|---|
| A01 | Form 5472 line 2 is checked for each tax year. | Yes |
| A02 | Form 5472 line 3 is checked for each tax year. | Yes |
| A03 | Form 5472 lines 43a, 43b(1), and 43b(2) are completely blank. | Yes |
| A04 | Form 5472 lines 37 through 42 are each answered. | No |
| A05 | Lines 1e and 8d use valid Form 1120 activity codes for the tax year, line 1d is not blank, and the codes match. | Yes |
| A06 | Form 1120 and Form 5472 header begin and end dates are populated and match. | Yes |
| A07 | First-year start date equals the formation date, and final-year end date equals the dissolution date. | Yes |
| A08 | The Form 1120 revision year matches the tax year or the documented short-year exception. | Yes |
| A09 | `Foreign-owned U.S. DE` appears on Form 1120 page 1. | Yes |
| A10 | Form 1120 item E(1) and E(2) are checked exactly when the year is initial or final. | Yes |
| A11 | The signer title stays inside the Title field and does not overlap the printed declaration. | Yes |
| A12 | Part V and Part VI totals compute line 1f, line 1h equals the sum of 1f, and line 1g equals the number of forms. | Yes |
| A13 | The Part V box is checked and every Part V row has a real date in the tax period, description, and nonzero amount. | Yes |
| A14 | The Part VI box and statement are present if and only if a non-cash transfer exists. | Yes |
| A15 | Line 1j matches formation year and the prior Form 5472 filing answer. | Yes |
| A16 | Line 1o uses a permitted LLC-country source and is not sourced from the owner country. | Yes |
| A17 | Owner address includes province/state and postal code, unless a no-postal-code flag is explicit. | Yes |
| A18 | FTIN fields are either a real FTIN or exactly `None`, and are never blank or duplicated from the U.S. ID. | Yes |
| A19 | Reference ID fields are alphanumeric, at most 50 characters, and equal the stored owner reference ID. | Yes |
| A20 | LLC name, EIN, and print address are identical everywhere the generator writes them. | Yes |
| A21 | Form 1120 item D equals Form 5472 line 1c. | Yes |
| A22 | Cover letter enclosure wording is exact, the reversed phrase is absent, and removed timeliness words are absent as whole words. | Yes |
| A23 | Cover letter addressee matches the configured IRS address and the date matches `finalisedAt`. | Yes |
| A24 | Reasonable cause statements exist if and only if the tax year is late, with exactly one per late year naming that year. | Yes |
| A25 | Authored documents use the configured signature heading exactly. | Yes |
| A26 | Reasonable cause text does not contradict questionnaire facts and required per-year answers are present. | Yes |
| A27 | Every Part V and Part VI statement page includes LLC name, EIN, and tax year. | Yes |
| A28 | The final PDF has zero AcroForm fields and zero widget annotations. | Yes |
| A29 | The render check V-02 passed. Per Amendment 1, V-02 cannot run in-process on Vercel because it uses native render dependencies, so it is enforced by CI as a separate check and not inside `runPreflight`. | No |
| A30 | PDF metadata carries package title, generator version, commit hash, and generation timestamp. | Yes |
| R02 | Package print addresses fit their narrowest target fields, or validation fails. | Yes |

Implementation status is based on reading `src/lib/pdf/preflight.ts`: `runPreflight` calls `checkA01` through `checkA03`, `checkA05` through `checkA27`, `checkR02`, and awaits `checkA28` and `checkA30`. No `checkA04` or `checkA29` function is defined or called there.

## Warnings (non-blocking) referenced in preflight.ts

| ID | Condition | Message |
|---|---|---|
| W15b | `priorForm5472Filed` is missing. | `Prior-filing question not answered.` |
| W15 | In formation year, prior Form 5472 answer is `yes` or `not_sure`; after formation year, prior Form 5472 answer is `no` or `not_sure`. | `Formation-year prior Form 5472 answer needs reviewer confirmation.` or `An earlier year may not have been filed.` |
| W16 | Line 1o source is `default_us`. | `Tax year [year]: line 1o defaulted to United States.` |
| W17 | Owner address is an older single-line address without structured state, postal, or no-postal-code answer. | `Tax year [year]: Owner address not in structured form (older order).` |
| W18 | FTIN is blank and `ownerHasFtin` is not structured. | `Tax year [year]: Owner FTIN answer not in structured form (older order).` |
| W26 | Reasonable cause statement uses fallback text predating per-year questions. | `Reasonable cause text predates the per-year questions.` |

W02 was requested for this document but does not exist anywhere in the codebase as of this writing; nothing is implemented under that ID. Confirm with Sum whether it was meant to be a different ID or is still pending implementation.

## Amendments

These amendments were approved by Sum on 21 September 2026. They override anything earlier in this document where they conflict.

1. The PDF pipeline must fit the TypeScript and pdf-lib stack on Vercel. V-01 is the in-process production validator and may use only data-model checks, pdf-lib structural checks, and pure-JS extraction if needed. It must not depend on native binaries. V-02 is a render test for developer machines and CI only, using poppler and PyMuPDF/fitz. R-03 is replaced by filling with pdf-lib, generating appearances, calling `form.flatten()`, and asserting zero widgets remain. A failed flatten must fail generation.

2. CI did not exist when the task was written. S-02 means creating a GitHub Actions workflow that runs typecheck, Vitest, fixtures F1 through F7 through V-01, and V-02 with poppler installed on the runner. Until that exists, any claim that deploys are CI-gated is not true.

3. The email and UI out-of-scope rule is relaxed only for C-01, C-02, C-07, T4, and T7. The allowed changes are suppressing reasonable-cause mentions in screens and emails when the year is not late, plus the neutral extension-status holding message. No other email, pricing, checkout, payment, or auth change is allowed.

4. Remove `DIIRSP` from the cover letter and customer-facing screens and emails by default until Sum decides otherwise. Leave the header stamp on IRS forms exactly as it is today. Marketing pages remain out of scope. The final report must flag this as a decision for Sum.

5. Compute one `print address` in the data model and use it everywhere. If the full address does not fit the narrowest field, apply standard abbreviations once to that single value. Per-field abbreviation is not allowed.

6. Part V rows today can come from categorized bank transactions, including Plaid imports, not only typed entry. Discovery and later questionnaire work must document and preserve how imported transactions become, or do not become, Part V owner transactions.

7. Ship in approved waves on `fix/generator-review-defects`, merging each wave to `main` only after typecheck, full test suite, production build, relevant fixtures green, and independent review. Wave 1 covers P0 form logic, extension gate, reasonable-cause suppression, fail-loud flatten, version stamp, fixtures, and validator core. Wave 2 covers remaining P0/P1 form and rendering items. Wave 3 covers reasonable-cause content and multi-year ordering. Wave 4 covers questionnaire work. Wave 5 covers CI, reviewer overrides, open-order sweep, and this rules doc. Packages already signed or faxed are never regenerated.

8. Before code depends on them, cite the IRS source for lines 43a/43b being blank for a foreign-owned U.S. DE, `999000` as the Form 1120 unclassified code, and printing `None` when the owner has no foreign tax ID. If the source does not support a rule, stop and report instead of coding it.

9. Validation status must be a new nullable column, not a new filing-status enum value, because payment, cron, and webhook code switch on status.

10. The two older documents named in the task are not in the repository. Whether something is already fixed is judged from the code alone.

## IRS Source Citations

| Rule | Verdict | Source document | Page | Notes |
|---|---|---|---|---|
| R1: lines 43a/43b blank for foreign-owned U.S. DE | Confirmed | Instructions for Form 5472, Rev. December 2024 | 7 | The instructions say to complete lines 43a, 43b(1), and 43b(2) only for a domestic corporation, not for a foreign-owned U.S. DE. |
| R2: `999000` is unclassified and `999999` is not on the Form 1120 list | Confirmed | 2025 Instructions for Form 1120; 2024 Instructions for Form 1120; 2023 Instructions for Form 1120 | 33; 32; 31 | Confirmed for all three years checked. `999000` appears as Unclassified Establishments. `999999` was not found. |
| R3: no FTIN prints `None` or `N/A`; reference ID format and consistency | Partly confirmed | Instructions for Form 5472, Rev. December 2024; Form 5472, Rev. December 2023 | 4-5; Form page 2 | The FTIN and `None` rule is confirmed for lines 4b(3), 5b(3), 6b(3), and 7b(3). The form has line 8b(3), but the instructions do not contain line-level text for 8b(3). Reference ID alphanumeric format, no spaces or special characters, 50-character limit, and year-to-year consistency are confirmed. |
| R4: line 2 and line 3 text | Partly confirmed | Form 5472, Rev. December 2023; Instructions for Form 5472, Rev. December 2024 | Form page 1; instructions pages 3-4 | The text of line 2, line 3, and their instructions is confirmed. The instructions do not explicitly say whether a foreign-owned U.S. DE also checks line 2. |
| R5: fax number and Ogden PIN Unit mailing address | Confirmed | Instructions for Form 5472, Rev. December 2024 | 2 | Confirms fax at 300 DPI or higher to 855-887-7737 or mail to the dedicated Ogden PIN Unit address. |
| R6: line 1o asks where business is conducted | Confirmed | Form 5472, Rev. December 2023; Instructions for Form 5472, Rev. December 2024 | Form page 1; instructions page 3 | Confirms line 1o asks for principal country or countries where business is conducted and says not to enter `worldwide`. |
| R7: fax resolution is 300 DPI or higher | Confirmed | Instructions for Form 5472, Rev. December 2024 | 2 | Confirms the minimum fax resolution. |
| R8: due date and Form 7004 extension | Partly confirmed | 2025, 2024, and 2023 Instructions for Form 1120; Instructions for Form 5472, Rev. December 2024 | i1120 pages 4, 3, and 4; i5472 pages 2-3 | The 15th-day-of-4th-month rule and dissolved-entity rule are confirmed in Form 1120 instructions. The DE filing due date is tied to the pro forma Form 1120 due date by Form 5472 instructions. The reviewed Form 1120 and Form 5472 instructions did not state the extension length. |
| R8 addendum: extension length | Confirmed, with one edge case | Instructions for Form 7004, Rev. December 2025 | 1 | The automatic extension is generally six months. A C corporation with a tax year ending June 30 and beginning before January 1, 2026 may receive seven months. Whether that reaches a foreign-owned disregarded entity filing a pro forma 1120 is not addressed, so that exact final-year June 30 edge case must route to reviewer. |
| R4 note: line 2 for a foreign-owned DE | Partly confirmed | Form 5472, Rev. December 2023; Instructions for Form 5472, Rev. December 2024 | Form page 1; instructions pages 3-4 | The instructions still do not answer the interaction directly. Because line 2 itself asks whether one foreign person owned at least 50 percent of vote or value and every entity this product serves is wholly owned by one foreign person, G-01 follows from the form text rather than an explicit instruction. |

## How to Change a Rule

1. Change the rule in this document first, and cite the IRS source by document, revision, and page. If no source was found, add a note that the rule needs verification before shipping.
2. Add or change the corresponding assertion in the assertion list above. Add a new ID if needed.
3. Write a failing test that proves the old behavior was wrong and the new assertion catches it.
4. Only then change the generator code, including `preflight.ts` and/or the relevant form-filling code, to make the test pass.
5. Update the Implemented column in this document to match reality.
