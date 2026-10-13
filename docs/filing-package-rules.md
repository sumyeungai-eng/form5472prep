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
- The "tax year beginning" field prints `MM/DD` only (e.g. `11/02`, `01/01`). The form already prints the year after it ("tax year beginning ______, 2024"), so a full date printed `11/02/2024, 2024` (generator 2.3.0, spec item 9). Source: the header line of every Form 1120 revision in `public/forms/` (2018-2025) prints the beginning year itself. Exception: under the short-year prior-revision exception below, the printed year is the wrong year, so that one case keeps `MM/DD/YYYY` to show the year-N date.
- For a first year, the period begins on the formation date, not January 1.
- For a final year, the period ends on the dissolution date, meaning the effective date on the certificate of dissolution or cancellation, not December 31.
- Complete name, address, item B EIN, and item E. Tick E(1) Initial return in the first year and E(2) Final return on a final return.
- Items C and D may remain filled as today. Item D must equal Form 5472 line 1c.
- Put the signer's title in the Title field on the Sign Here line.
- Nothing may be drawn over the printed declaration.
- Paid preparer block (generator 2.3.0, spec item 8): optional per order. `Filing.paidPreparerMode` null or `"none"` (the default) leaves the "Paid Preparer Use Only" block blank. `"house"` fills it on every Form 1120 in the order from the house preparer config (env vars `HOUSE_PREPARER_NAME`, `HOUSE_PREPARER_PTIN`, `HOUSE_PREPARER_FIRM_NAME`, `HOUSE_PREPARER_FIRM_EIN`, `HOUSE_PREPARER_FIRM_ADDRESS`, optional `HOUSE_PREPARER_PHONE`; read by `src/config/housePreparer.ts`, never hard-coded). If any required value is missing the block stays blank and the record says the config is incomplete (pre-flight error, Lane B). The preparer signature, preparer date and "Check if self-employed" box always stay blank; the signature is stamped later by the place-signature tool. Field names are mapped per revision (2018; 2019-2024; 2025) in `form1120PaidPreparerFieldMaps` and were confirmed by rendering filled forms (2026-10-13).
- "May the IRS discuss this return with the preparer shown below?" (`Filing.irsMayDiscussWithPreparer`): null = blank (default), `"yes"` ticks Yes, `"no"` ticks No. It is answered only when a preparer is shown; with no preparer the boxes stay blank.
- When a preparer is shown, no statement may say the owner prepared the returns (pre-flight, Lane B).

### LLC address

Do not use the registered agent's address. If the client says the LLC genuinely receives mail at the U.S. address, such as its own suite number or mail-forwarding unit, use it. If the U.S. address is only the registered agent's address, use the owner's real address, usually foreign, so IRS notices reach the owner.

### Filing status and reasonable cause statement

- Original due date is the 15th day of the 4th month after the tax year ends. For a calendar year this is April 15. For a dissolved entity, it is the 15th day of the 4th month after the dissolution date. Never hard-code April 15.
- A valid Form 7004 adds six months to the original due date, subject to the amendment and source caveat for a final short year ending June 30 before 2026.
- If a due date falls on a Saturday, Sunday, or U.S. federal legal holiday, move it to the next business day.
- Accept the client's statement that an extension was filed as given. Do not demand proof, transmission dates, or destination. Optional follow-up fields may remain optional, never required.
- If the return is timely or validly extended, do not generate, offer, attach, or mention a reasonable cause statement. Attaching one to a timely return mislabels it as late.
- If the return is late, a reasonable cause statement is required, one per tax year.
- If the client is unsure whether an extension was filed ("not_sure"), the package treats that year as having NO extension for lateness (generator 2.3.0, spec item 4, orchestrator decision D2): a year past its original due date is late and gets its own reasonable cause statement. The order keeps the amber "Extension unclear - confirm with customer before fax" flag, and the record marks the year `extensionUnclear` so pre-flight can warn before upload. Customer-facing screens keep the neutral holding message (`isYearDelinquent` is unchanged; the package uses `isYearDelinquentForPackage`). The reviewer-only June 30 short-year 7004 edge case (R8 addendum) still records the year as `unresolved` with no statement.

### Wording rules for documents we write

- The cover letter says what is enclosed, for which entity, EIN, and tax years, and nothing else. It must not contain a sentence about timeliness, lateness, or compliance.
- Use the exact configured enclosure wording in the body and in the Re line.
- The cover letter date is the date the package is finalized for signing and fax, not the order creation date.
- Write U.S. state names in full in prose, such as `Florida`, not `FL`. Postal abbreviations are fine inside address blocks.
- Never promise or imply that penalty relief is automatic or guaranteed.
- Customer-facing screens and emails do not use the words `DIIRSP` or `delinquent`. Use: `This return is being filed after its due date. We include a reasonable-cause statement explaining why.`

### House rules for authored documents (generator 2.3.0)

Source: `docs/reviews/2026-10-13-preflight-generator-spec.md` (house rules 1-6, items 3-7) and the orchestrator decisions in `docs/reviews/2026-10-13-preflight-generator-plan.md` (D1-D7). These are wording rules for documents we write; they need no IRS citation except where one is given.

| ID | Rule | Implemented |
|---|---|---|
| H1 | Owner's voice. The reasonable cause statement (RCS), the Part V statement and the Part VI statement are written in the first person, as the owner ("I formed..."). They never mix "I" with "the Owner", and never use wording that shows a third party prepared them ("entered by customer", "the Owner arranged for...", "arranged for this return to be prepared", "qualified assistance", "I prepared"). | Yes (generatePackage.test.ts "voice" tests; render.test.ts DoD check) |
| H2 | Perjury wording. The RCS, Part V and Part VI statements keep the heading `Signed under penalties of perjury:`. The cover letter closes with `Signed:` only and never carries perjury wording (D1, replaces the 2026-10-10 "Sincerely,"). The printed Form 1120 jurat stays as printed. | Yes (C-03, C-06, A25) |
| H3 | No unconfirmed facts in signed statements. A sentence is printed only when its source field supports it: the IRS-notice sentence needs `rcsNoIrsNoticeConfirmed === true`; the first-tax-year sentence needs the formation year; the "still unaware" sentence needs `rcsLearnedOn` after that year's due date; the small-corporation paragraph needs its conditions (H8). | Yes |
| H4 | No raw customer free text in IRS-facing documents. The customer's explanation (`FilingYearData.rcsWhyMissed`, `rcsWhenLearned`, legacy `Filing.reasonableCauseNarrative`, wizard presets) is source material shown to the admin only and is never rendered. The RCS cause narrative comes only from the admin field `FilingYearData.rcsAdminNarrative`. With no admin narrative the cause section has no narrative text (no fallback) and the record marks it missing so pre-flight fails. | Yes |
| H5 | One RCS per late tax year, each placed after its own year's Part V (and Part VI) statement, using that year's data and that year's narrative. | Yes (C-05, two-year late fixture) |
| H6 | For a late year after the first late year in the package, when `rcsLearnedOn` is after that year's due date, the RCS adds: `I remained unaware of the requirement when the [year] return was due on [Month D, YYYY].` | Yes |
| H7 | RCS content. Sections: 1. Background, 2. Cause of the Delinquency, 3. Filing History and Notice Status, 4. Corrective Action. `This is the LLC's first tax year.` only for the year containing the formation date. `I have not received any IRS notice about this return.` only per H3. Corrective action: `As soon as I learned of the requirement, I took steps to file the outstanding returns for [years], which I am now filing together.` (single-year package: `...the outstanding return for [year], which I am now filing.`). Signature block: `Signed under penalties of perjury:`, a signature line, the owner's name, `Sole Member, [LLC name]`, `Date: ____`. | Yes |
| H8 | Small-corporation paragraph (spec text verbatim, Treas. Reg. sec. 1.6038A-4(b)(2)(ii)). Per-year admin toggle `FilingYearData.rcsSmallCorpParagraph`: null = automatic, true/false = admin override. Automatic means on when all of: the year is late; the LLC address is registered-agent-only (`Filing.llcAddressIsRegisteredAgentOnly === true`, the existing intake flag); no gross-receipts signal (Form 1120 line 1a is always blank on our pro forma, `hasUsSourceIncome` is not true, and the year's transactions show no customers, sales or payment processors); and `rcsLearnedOn`, when recorded, is not on or before that year's due date (the paragraph says "I had no knowledge"). The record exposes each condition so pre-flight can warn when an admin forces it on with conditions unmet. | Yes |
| H9 | Part V statement (spec item 7). First person. Heading citation `Treas. Reg. sec. 1.6038A-2(b)(3)(xi)` (D6: (b)(3)(xi) covers "any other transaction" of a sec. 301.7701-2(c)(2)(vi) entity, including contributions to and distributions from the entity; verified on law.cornell.edu by the orchestrator 2026-10-13). Each owner-paid cost gets the sentence `During tax year [year], I paid $[amount] of [description] for [LLC] from my personal funds.` followed by `This amount is a capital contribution to the LLC.` (or `These amounts are capital contributions to the LLC.`). Date / Description / Amount (USD) schedule with a total row. The statement ends with `Form 5472 lines 1f and 1h: $[total].` in whole dollars (= line 1f). Schedule descriptions stay on one line: shrink to 8pt if needed, otherwise wrap without leaving a single word alone on the last line. Owner-paid costs already flow into Part V rows and lines 1f/1h; Part IV lines 22 and 36 stay `0`; line 1c is unchanged. | Yes |
| H10 | Part VI statement opening is first person. | Yes |

## Assertion List

| ID | What it checks | Implemented |
|---|---|---|
| A01 | Form 5472 line 2 is checked for each tax year. | Yes |
| A02 | Form 5472 line 3 is checked for each tax year. | Yes |
| A03 | Form 5472 lines 43a, 43b(1), and 43b(2) are completely blank. | Yes |
| A04 | Form 5472 lines 37 through 42 are each answered. | Yes |
| A05 | Lines 1e and 8d use valid Form 1120 activity codes for the tax year, line 1d is not blank, and the codes match. | Yes |
| A06 | Form 1120 and Form 5472 header begin and end dates are populated and match. Since generator 2.3.0 the Form 1120 "tax year beginning" value is `MM/DD` only and must equal the Form 5472 begin month/day; under the short-year prior-revision exception it is `MM/DD/YYYY` and must equal the full Form 5472 begin date. | Yes |
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
| A22 | Cover letter enclosure wording is exact, the reversed phrase is absent, and removed timeliness words are absent as whole words. The LLC and owner names are taken out whitespace-flexibly first, so a name containing "Late" that wraps across two cover-letter lines is not a false failure (2026-10-14). | Yes |
| A23 | Cover letter addressee matches the configured IRS address and the date matches `finalisedAt`. | Yes |
| A24 | Reasonable cause statements exist if and only if the tax year is late, with exactly one per late year naming that year. A "not_sure" Form 7004 answer counts as no extension (generator 2.3.0). | Yes |
| A25 | Authored statements use the configured signature heading exactly; the cover letter closes with `Signed:` and never carries the perjury heading. | Yes |
| A26 | Reasonable cause text makes no claim about operations, expenses, employees or transactions that the order data does not support or contradicts (dormant, inactive, no customers/vendors, "no operating expenses, employees, or transactions", ...), and does not deny U.S. income when the order records U.S.-source income. Spec item 2 / D8: each finding names its source field ("Tax year 2024 → RCS narrative (admin)", or "→ reasonable cause statement (generated text)"), quotes each matched phrase with about 80 characters of context, states the rule, and adds the year's Part V total when it has one. A missing admin narrative is reported by A32, not A26 (the generic "answers missing" message stays only for records older than generator 2.3.0). | Yes |
| A27 | Every Part V and Part VI statement page includes LLC name, EIN, and tax year. | Yes |
| A28 | The final PDF has zero AcroForm fields and zero widget annotations. | Yes |
| A29 | The render check V-02 passed. Per Amendment 1, V-02 cannot run in-process on Vercel because it uses native render dependencies, so it is enforced by CI as a separate check and not inside `runPreflight`. | CI only |
| A30 | PDF metadata carries package title, generator version, commit hash, and generation timestamp. | Yes |
| R02 | Package print addresses fit their narrowest target fields, or validation fails. | Yes |
| A32 | A late tax year has an admin-authored RCS narrative (`FilingYearData.rcsAdminNarrative`, rule H4). Message: `RCS narrative not written for tax year X.` The customer's explanation is never a fallback (spec item 3). | Yes |
| A33 | Admin-authored or other free text that renders into an IRS-facing document carries no question or note addressed to us: a question mark, "could you", "can you", "would you", "please review", "please advise", "please let me know", "my objective", "minimal cost", "[CPA Name]" or any `[Placeholder]`. Checked in the RCS narrative, Part V row descriptions, owner-paid cost notes, Part VI descriptions and valuation methods (each named), then in the rendered Part V / Part VI / RCS text for anything else (e.g. the "other transactions" note). Each finding quotes the phrase and names the field (spec item 3, D9). | Yes |
| A34 | Per tax year, the Part V statement's closing total (`Form 5472 lines 1f and 1h: $X.`) equals line 1f and line 1h as written on Form 5472, and equals the rounded Part V plus Part VI total (spec item 7). | Yes |
| A35 | Paid preparer (spec item 8): `paidPreparerMode = "house"` with incomplete or invalid `HOUSE_PREPARER_*` config fails (names the missing/invalid settings); when a preparer is shown on any Form 1120, no RCS, Part V or Part VI statement may say "I prepared". | Yes |

Implementation status is based on reading `src/lib/pdf/preflight.ts`: `runPreflight` calls `checkW02`, `checkA01` through `checkA28` except `checkA29`, `checkR02`, `checkA30`, `checkA31` through `checkA35`, and the warning checks W31 to W41. `checkA29` is intentionally absent because render verification runs in CI only.

## Warnings (non-blocking) referenced in preflight.ts

| ID | Condition | Message |
|---|---|---|
| W02 | A transaction category has no rows and was not explicitly confirmed as zero. | `Tax year [year]: Some transaction categories were never confirmed ([categories]).` |
| W15b | `priorForm5472Filed` is missing. | `Prior-filing question not answered.` |
| W15 | In formation year, prior Form 5472 answer is `yes` or `not_sure`; after formation year, prior Form 5472 answer is `no` or `not_sure`. | `Formation-year prior Form 5472 answer needs reviewer confirmation.` or `An earlier year may not have been filed.` |
| W16 | Line 1o source is `default_us`. | `Tax year [year]: line 1o defaulted to United States.` |
| W17 | Owner address is an older single-line address without structured state, postal, or no-postal-code answer. | `Tax year [year]: Owner address not in structured form (older order).` |
| W18 | FTIN is blank and `ownerHasFtin` is not structured. | `Tax year [year]: Owner FTIN answer not in structured form (older order).` |
| W26 | Reasonable cause statement uses fallback text predating per-year questions. Since generator 2.3.0 the generator never falls back to customer text (rule H4), so `rcsFallbackUsed` is always false and W26 no longer fires. | `Reasonable cause text predates the per-year questions.` |
| W26b | A late year has no admin narrative yet and the customer's own explanation (why missed / when learned / the legacy order-level message; never printed) makes an A26-type claim. Context for the admin who is about to write the narrative; not shown once a narrative exists (D8). | `Tax year X → Customer's explanation: why missed (customer text, never printed): "…" — Context only: …` |
| W34 | A late year after the first late year has no "Learned of requirement on" date, so its RCS cannot say whether the owner was still unaware at that year's due date (spec item 4, D4). | `Tax year X: "Learned of requirement on" is not recorded, …` |
| W35 | "No IRS notice confirmed" is not Yes for a late year, so the notice sentence was left out of that RCS (spec item 5, rule H3). | `Tax year X: "No IRS notice confirmed" is not recorded, …` |
| W36 | The Form 7004 answer for a year is "not sure" (`extensionUnclear`): the package treats it as no extension. Same wording as the admin page chip, raised before upload (spec item 14). | `Tax year X: Extension unclear — confirm with customer before fax. …` |
| W37 | FTIN format by country of tax residence (spec item 11): Canada = SIN, 9 digits passing Luhn; Brazil = CPF, 11 digits with two check digits; other countries = 5 to 20 characters after removing separators. Warning only. | `Owner FTIN (Form 5472 line 4b(3)) does not look like a …` |
| W38 | Possible swapped fields: the Reference ID passes the national-ID test for the country of tax residence but the FTIN does not. The numbers themselves are never printed in the message. | `Possible swapped fields: …` |
| W39 | Owner address quality (spec item 13): the street line (printed exactly as entered) is all lowercase, or ends in a bare number with no unit label ("12 Main St 5"; Apt/Unit/Suite/Flat/#/Room/... and numbered roads are fine). The address is never rewritten automatically. Missing state/postal stays A17. | `Owner street address "…" is all lowercase …` / `… has no unit label …` |
| W40 | The admin forced the small-corporation paragraph On while some of its conditions (rule H8) are not met. | `Tax year X: the small-corporation paragraph is switched On but these conditions are not met: …` |
| W41 | "May the IRS discuss with the preparer?" is answered but no preparer is shown, or a preparer field printed below 6pt. | `"May the IRS discuss with the preparer?" is set to …` |

W02 is implemented in `src/lib/pdf/preflight.ts` as a warning, not a blocking assertion.

W15 suppression (spec item 10, 2026-10-14): `An earlier year may not have been filed.` is not raised when the EARLIEST tax year in the package contains the formation date (`isFormationYear`) or has Form 5472 line 1j checked; then no earlier year exists. The formation-year W15 (`Formation-year prior Form 5472 answer needs reviewer confirmation.`) is unchanged.

## Pre-flight lifecycle (spec items 1 and 12, decisions D10 and D11)

| Rule | Implemented |
|---|---|
| Pre-flight evaluates the ORDER DATA: the package is rebuilt in memory and checked. It never inspects an uploaded (reviewed or signed) PDF. | Yes |
| Every trigger persists the result through one helper (`src/lib/pdf/persistPreflight.ts`): the Stripe webhook, the $0 checkout tier, the customer generate-pdf route, admin Regenerate and Resend order confirmation (new package: result stored, override cleared, generator version stamped), and the admin re-run (no new package). | Yes |
| "Re-run pre-flight" (`rerunPreflight` action) and an automatic re-run after every change-logged `updateField` / `updateYearField` save and after Regenerate store status, failures, warnings and `preflightCheckedAt`, write NO PDF, and add a `preflight` change-log row (trigger, status, failure and warning IDs). An automatic re-run never fails the save it follows; it is skipped for DRAFT, FAXED and CONFIRMED filings. | Yes |
| Override rule on a re-run: a recorded "Approve despite pre-flight failures" survives only while every current failure (ID and message) is one it approved. The approved failures are stored on the override's change-log row (`approvedFailures`); otherwise the override is cleared and a `preflightOverride` change-log row records why. Recording an override needs a reason of at least 10 non-space characters, logged with the admin and the time. | Yes |
| The admin page shows the check time, a "Stale" badge when a change-logged data edit (`FilingChangeLog.changedAt`, not `Filing.updatedAt`) is newer than `preflightCheckedAt`, and a "Re-run pre-flight" button. While pre-flight failed with no override, "Upload reviewed PDF" is visibly disabled with the reason inline and a link to the override form; the server still answers 409 `preflight_failed` with the failing check IDs and what to do. | Yes |
| Which file is which: the client checks and signs the current client version, `generatedPdfKey` (the accountant-reviewed upload `*_reviewed_*` when there is one, otherwise the generated PDF). The fax sends the signed PDF (`signedPdfKey`), copied byte-for-byte to the faxed snapshot (`faxedPdfKey`). | Yes (admin page help text) |
| While a reviewed PDF is the client version, Regenerate asks for confirmation ("A reviewed PDF is the current client version. Regenerating will not replace it unless you upload again."), writes the new package as a draft to `${id}_unsigned.pdf` only, leaves `generatedPdfKey`, review approval, signature and status unchanged, and re-runs pre-flight (override rule above). The admin downloads it with "Download latest generated draft" (admin-only `/api/admin/filings/[id]/pdf?variant=draft`). | Yes |
| Pre-flight findings are staff-only: `preflightFailures` / `preflightWarnings` are stripped from every customer API (`STAFF_ONLY_FILING_FIELDS`), and a failed pre-flight at payment changes nothing the customer sees or is sent. | Yes |
| An admin who enters owner-paid costs for a year clears that year's display-only `noReportableTransactions` ("customer declared none") flag in the same write, with its own change-log row (spec item 7). | Yes |

## Review before signature

Customers cannot sign a newly generated package until a qualified accountant approves it. Approval records `reviewApprovedAt` and `reviewApprovedBy`, then emails the customer a secure sign link. Uploading a reviewed package is also an approval.

Every stored package generation or regeneration clears `reviewApprovedAt` and `reviewApprovedBy`, so approval never carries across to changed bytes. Filings already at `SIGNATURE_PENDING` or later are grandfathered for compatibility with pre-existing data.

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

Note: A29 is a CI-only render check by design. It must not run inside `runPreflight` because Vercel cannot rely on the native render dependencies used by V-02.

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
