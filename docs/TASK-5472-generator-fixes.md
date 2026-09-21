# TASK — Fix the Form 5472 / pro forma 1120 package generator

**For:** Claude Code, run from the root of the form5472prep repository
**Written:** 21 September 2026
**Owner:** Sum (approves checkpoints and answers decisions)

**How to start:** save this file in the repo as `docs/TASK-5472-generator-fixes.md`, open Claude Code at the repo root, and say:
*"Read docs/TASK-5472-generator-fixes.md and follow it exactly. Start with Phase 0 and stop where it tells you to stop."*

---

## 1. What this is and why

The site sells a filing package to foreign owners of U.S. single-member LLCs (disregarded entities). A questionnaire collects the facts; a generator produces a PDF package:

1. Cover letter to the IRS
2. Pro forma Form 1120 (cover page only, by design)
3. Form 5472
4. Part V supporting statement (and a Part VI sheet when there is a non-cash transaction)
5. Reasonable cause statement — **late filings only**

A human reviewer checks every package before it is signed and faxed to the IRS. Across six reviewed orders the reviewer made the **same corrections every time**. One "corrected" package came back byte-identical to the original, so nobody could tell a fix had not deployed.

**Goal:** a package generated from clean questionnaire data passes review with **zero edits**, and a package that would fail review is **blocked by an automated check before a human sees it**.

You are fixing software, not giving tax advice. Every tax rule you need is in §5. Do not reinterpret, extend or "improve" those rules. If something in the code contradicts §5, §5 wins. If §5 seems wrong or does not cover a case, stop and ask.

---

## 2. Ground rules

1. **Work on a branch** named `fix/generator-review-defects`. Never commit to the main branch. Never deploy. Never run anything against the production database or production storage.
2. **Customer data is confidential.** Do not print, log, copy into fixtures, paste into commit messages, or send to any external service any real name, EIN, address, tax ID, bank figure or uploaded document. All fixtures are synthetic (e.g. EIN `12-3456789`, "Example Holdings LLC").
3. **Never alter or regenerate a package that has already been signed or faxed.** Those are filed records.
4. **Do not change prices, checkout, payment, email-sending or auth code.** If a fix seems to need it, stop and ask.
5. **Schema changes are additive only**: new nullable columns / new tables. No drops, no renames, no backfills that overwrite existing answers.
6. **One commit per numbered item** (G-01, R-02, …), message format `G-01: check Form 5472 line 2 for foreign-owned DE`. Tests in the same commit as the fix.
7. **Verify against the IRS source, not against memory.** Official files (all confirmed reachable on 21 Sep 2026):
   - Form 5472: `https://www.irs.gov/pub/irs-pdf/f5472.pdf` (Rev. December 2023)
   - Instructions 5472: `https://www.irs.gov/pub/irs-pdf/i5472.pdf`
   - Form 1120, current year: `https://www.irs.gov/pub/irs-pdf/f1120.pdf`
   - Form 1120, prior years: `https://www.irs.gov/pub/irs-prior/f1120--YYYY.pdf`
   - Instructions 1120: `https://www.irs.gov/pub/irs-pdf/i1120.pdf`, prior years `https://www.irs.gov/pub/irs-prior/i1120--YYYY.pdf`
8. Several items below may **already be fixed** (an earlier plan, `PLAN-5472-system-improvements-20260729.md`, and a note, `NOTE-5472-extension-gate-20260825.md`, were given to a developer). For each item: check first. If it is already correct, add the test, note "already correct" in your report, and move on. Where those older documents differ from this file, **this file wins**.

---

## 3. Decisions already made — put these in one config file

Create a single config module (name to fit the codebase, e.g. `config/filing_package`) and read these values from it everywhere. No hard-coded copies elsewhere.

| Key | Value | Notes |
|---|---|---|
| `AUTHORED_DOC_SIGNATURE_HEADING` | `"Signed under penalties of perjury:"` | **Current instruction from Sum: keep penalties-of-perjury wording for the signature.** The only other permitted value is `"Signed:"`. It must be a one-line change. Applies to documents *we* write (reasonable cause statement, cover letter, statements). |
| `IRS_JURAT_UNTOUCHED` | `true` | The printed declaration on Form 1120 page 1 ("Under penalties of perjury, I declare…") is part of the IRS form. Nothing may be drawn over it, removed from it, or added to it. Not configurable in practice — assert it. |
| `PAID_PREPARER_BLOCK` | `"blank"` | Current behaviour. Centralise it so a later policy change is one line. Do not invent preparer names, PTINs or firm details. |
| `SIGNER_TITLE` | `"Sole Member"` | Printed in the **Title** field of the Form 1120 Sign Here line, and under the signer's name on authored documents. |
| `IRS_FAX_NUMBER` | `855-887-7737` | |
| `IRS_MAIL_ADDRESS` | `Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112 Attn: PIN Unit, Ogden, UT 84201` | Cover letter addressee. |
| `COVER_LETTER_ENCLOSURE_PHRASE` | `"pro forma Form 1120 with Form 5472 attached"` | Exact wording, body and Re line. |
| `FAX_RENDER_DPI` | `300` | i5472 requires fax at 300 DPI or higher. Used by the render test. |

---

## 4. Phase 0 — Discovery. **STOP at the end of this phase.**

You have not seen this codebase and neither has the author of this file. Do not change any code in Phase 0.

Find and document, in `docs/generator-audit.md`:

1. **Stack**: language, framework, database, where PDFs are produced (in-process library, CLI tool such as pdftk/qpdf, or a separate service).
2. **The generator**: entry point, the files that fill Form 1120 and Form 5472, where the blank IRS PDFs live, how fields are addressed (AcroForm field names vs. x/y coordinates), and how the output is flattened and merged.
3. **Authored documents**: templates for the cover letter, Part V statement and reasonable cause statement.
4. **The questionnaire**: every question, its storage field, and which form line each answer feeds. Produce this as a table — it is the most useful artefact of Phase 0.
5. **Filing-status logic**: where "late / timely" is decided and what inputs it uses.
6. **Tax-year handling**: how the list of selectable tax years is built; how period start and end dates are derived.
7. **Reviewer tooling**: can a reviewer edit order data and regenerate, or only download the PDF?
8. **Existing tests** and how to run them.
9. **For every item in §6**: current behaviour as you read it in the code — `BROKEN`, `ALREADY CORRECT`, or `UNCLEAR` — with file and line.

Then write a short implementation plan (what you will change, in what order, risks, anything in this file that does not fit the codebase) and **stop. Post the audit summary and the plan, and wait for Sum to reply "approved" before Phase 1.**

---

## 5. Domain rules — authoritative

Line numbers are Form 5472 (Rev. 12-2023) and the Form 1120 cover page. They were checked against the IRS PDFs on 21 Sep 2026.

### 5.1 Form 5472, Part I — the LLC

| Line | Rule |
|---|---|
| Header "tax year beginning / ending" | Always populated. Same dates as the Form 1120 header (§5.4). |
| 1a | LLC legal name and address. Address rule in §5.5. One address, identical on every page of the package. |
| 1b | EIN, format `NN-NNNNNNN`. |
| 1c | Total assets at period end, whole USD. Must equal Form 1120 item D if the generator fills D. |
| 1d / 1e | Activity description and **principal business activity code**. The code must appear in the *Principal Business Activity Codes* list at the back of the **Form 1120 instructions** for that tax year. A NAICS code is **not** acceptable just because it is a real NAICS code. Known bad outputs: `541611`, `541510`, `000000`. Known good: `541600`, `541512`, `523900`. "Unclassified / no activity" is **`999000`** on the Form 1120 list — **not** `999999` (that code belongs to other forms and is not on this list). |
| 1f | Total reported on **this** Form 5472 = Part V monetary total (+ Part IV lines 22 and 36 + Part VI fair market value, where used). Whole dollars. Computed, never typed. |
| 1g | Number of Forms 5472 filed for the year = number of related parties with reportable transactions (§5.3). |
| 1h | Sum of 1f across all Forms 5472 for the year. With one related party, 1h = 1f. |
| 1i | Unchecked (not a consolidated filing). |
| 1j | Checked **only** when this is the first year the LLC files a Form 5472. Derive from: tax year = formation year **and** the client answered that no earlier Form 5472 was filed. If an earlier year existed but was never filed, do not guess — flag for the reviewer. |
| 1k | Number of Parts VIII attached: `0`. |
| 1l, 1m | Country of incorporation (`United States`) and formation date. |
| 1n | `United States`. |
| 1o | Principal country where **the LLC** conducts business. This is a fact about the LLC. It must come from its own questionnaire field and must **never** be auto-filled from the owner's country of residence. |
| **Line 2** | **Checked.** A foreign person owns ≥50% of vote and value of every entity this product serves. |
| **Line 3** | **Checked** (foreign-owned U.S. DE). |

### 5.2 Form 5472, Parts II and III — the owner

| Line | Rule |
|---|---|
| 4a and 8a | Owner name and **complete** foreign address: street, city, **province/state, postal code**, country. Must physically print (§6 R-02). |
| 4b(1) / 8b(1) | U.S. identifying number if the owner has one (e.g. an ITIN). Otherwise blank. |
| 4b(2) / 8b(2) | Reference ID. Alphanumeric only, no spaces or special characters, max 50 characters. Generated **once** per owner, stored, and **reused unchanged every tax year**. Never regenerated. |
| 4b(3) / 8b(3) | Owner's **foreign** tax ID (FTIN) if one exists. If the owner has none, print `None`. A U.S. ITIN is **not** an FTIN and must not be accepted in this field. |
| 4c / 8f | Principal country where the **owner** conducts business. |
| 4d | Owner's country of citizenship (or incorporation, if a company). |
| 4e / 8g | Country where the **owner** files as a tax resident. |
| Part III heading | "Foreign person" box checked. |
| 8c / 8d | Related party's activity and code. Same code list rule as 1e. |
| 8e | Leave the generator's current relationship boxes as they are unless the audit shows none is ticked. |

### 5.3 Parts IV–VII

| Part | Rule |
|---|---|
| Part IV | Leave the generator's current treatment unchanged. Do not "fix" it. |
| Part V | Box checked. Attached statement lists every transaction **between the LLC and its foreign owner** (contributions, distributions, loans either way, amounts the owner paid personally on the LLC's behalf, etc.), each with its **actual date**, description and amount. Third-party items (customer receipts, vendor payments, cashback) do **not** belong here. |
| Part VI | Checked, with an attached description, **only** when something other than cash moved between owner and LLC (e.g. securities transferred in). The description states what was transferred, the date, the fair market value and how it was valued. The value is counted **once** in 1f/1h — if the same transfer is also listed in the Part V statement, say so on the Part VI sheet and do not add it twice. |
| Lines 37–42 | Answered (normally `No`). |
| **Lines 43a, 43b(1), 43b(2)** | **Left completely blank.** i5472: complete these lines only if the reporting corporation is a domestic corporation; do not complete them for a foreign-owned U.S. DE. Ticking "No" is wrong. |
| Related parties | One Form 5472 **per related party** with reportable transactions. Today the generator assumes one. Minimum fix: if the questionnaire ever indicates more than one, block generation and route to the reviewer. Full fix (optional, P2): generate one form per party and set 1g accordingly. |

### 5.4 Pro forma Form 1120

- Use the Form 1120 **for the tax year being filed** (2023 return → 2023 form). Exception, from i1120: a short year that begins and ends in year N may go on the year N−1 form if the year N form is not yet released; the tax-year fields must then show the year-N dates.
- "**Foreign-owned U.S. DE**" printed across the top of page 1.
- Header fields "tax year beginning ___, ending ___, 20__" are **always populated**, including for a full calendar year.
  - First year: begins on the **formation date**, not 1 January.
  - Final year: ends on the **dissolution date** (the effective date on the certificate of dissolution/cancellation), not 31 December.
- Completed: name, address, item B (EIN), item E — **E(1) Initial return** ticked in the first year, **E(2) Final return** ticked on a final return. Items C and D may remain filled as today; D must equal 5472 line 1c.
- Sign Here line: signer's title goes in the **Title** field. Nothing is drawn over the printed declaration.
- Paid preparer block: per config.

### 5.5 LLC address

i1120: do not use the address of the registered agent. If the client says the LLC genuinely receives mail at the U.S. address (own suite number, mail-forwarding unit), use it. If it is the registered agent's address only, use the owner's real address — usually foreign — so IRS notices reach them.

### 5.6 Filing status and the reasonable cause statement

- Original due date = 15th day of the 4th month after the tax year ends (calendar year → 15 April). For a dissolved entity, the 15th day of the 4th month after the dissolution date. **Never hard-code "April 15".**
- A valid Form 7004 adds six months to the original due date.
- If a due date falls on a Saturday, Sunday or U.S. federal legal holiday, it moves to the next business day.
- The client's statement that an extension was filed is **accepted as given**. Do not demand proof, transmission dates or destination. (This supersedes the follow-up fields in the August note: keep them only as optional, never required.)
- **Timely or validly extended → no reasonable cause statement is generated, offered or mentioned.** Attaching one to a timely return mislabels it as late.
- **Late → reasonable cause statement required**, one per tax year.
- **Client unsure whether an extension was filed → do not classify.** Route to the reviewer with a neutral holding message to the client.

### 5.7 Wording rules for documents we write

- Cover letter says what is enclosed, for which entity, EIN and tax year(s) — and nothing else. **No sentence about timeliness, lateness, or compliance.**
- Enclosure wording exactly per config, in the body and in the Re line.
- Cover letter date = the date the package is finalised for signing/fax, not the date the order was created.
- U.S. state names written in full in prose ("Florida", not "FL"). Postal abbreviations are fine inside address blocks.
- Never promise or imply that penalty relief is automatic or guaranteed.
- Customer-facing screens and emails do not use the words "DIIRSP" or "delinquent". Use: "This return is being filed after its due date. We include a reasonable-cause statement explaining why."

---

## 6. Work items

Priority: **P0** = wrong on every package or legally wrong; **P1** = frequent reviewer edit; **P2** = improvement.

### Phase 1 — Build the safety net first (test-first)

**V-00 (P0) Synthetic fixtures.** Create questionnaire fixtures covering these shapes. They are the regression set for everything below.

| Fixture | Shape |
|---|---|
| F1 | Full calendar year, timely, one owner, cash contributions and one distribution, owner has an FTIN |
| F2 | **First year**, formed mid-year, owner paid formation costs personally, no FTIN (→ `None` + reference ID), long foreign address (≥ 90 characters) |
| F3 | **Short first-and-final year** that begins and ends in the same year, no business activity, dissolved mid-year |
| F4 | Calendar year, **Form 7004 filed**, order placed after the original due date |
| F5 | **Three late years in one order**, non-cash contribution (securities) in year 1, U.S.-source dividends with tax withheld, investment-holding LLC with no customers or vendors |
| F6 | Client **unsure** whether an extension was filed |
| F7 | LLC address is registered-agent-only |

**V-01 (P0) Pre-flight validator.** A function/command that takes a generated package (the data model **and** the final flattened PDF) and returns pass/fail with a list of failed assertions. It runs automatically at the end of every generation. **A failing package is not released to the reviewer queue as "ready"; it is marked `validation_failed` with the reasons shown.**

Assertions (each gets a test that proves it fails on bad input):

| ID | Assertion |
|---|---|
| A01 | 5472 line 2 checked |
| A02 | 5472 line 3 checked |
| A03 | 5472 lines 43a, 43b(1), 43b(2) have no mark and no text |
| A04 | 5472 lines 37–42 each answered |
| A05 | 1e and 8d codes exist in the IRS code list for the tax year; 1e description is non-empty |
| A06 | 1120 header begin/end populated; 5472 header begin/end populated; both pairs identical |
| A07 | First-year begin date = formation date; final-year end date = dissolution date |
| A08 | Form 1120 revision year matches the tax year (or the documented short-year exception) |
| A09 | "Foreign-owned U.S. DE" present on 1120 page 1 |
| A10 | 1120 item E(1) / E(2) ticked exactly when first / final year |
| A11 | Signer title is inside the Title field; **no text overlaps the printed declaration's bounding box** |
| A12 | Part V statement total (rounded once) = 1f; sum of 1f across forms = 1h; 1g = number of forms |
| A13 | Part V box checked; every Part V row has a real date inside the tax period, a description and an amount > 0 |
| A14 | Part VI box checked **iff** a non-cash transaction exists; its sheet is present |
| A15 | 1j consistent with formation year and the prior-filing answer |
| A16 | 1o is sourced from the LLC's own field (data-lineage check in the model, not the PDF) |
| A17 | 4a and 8a contain province/state and postal code (or the explicit "country has none" flag) |
| A18 | 4b(3)/8b(3) is an FTIN or exactly `None`; never blank; never equal to the value in 4b(1) |
| A19 | Reference ID alphanumeric, ≤ 50 chars, equal to the stored ID for this owner |
| A20 | LLC name, EIN and address byte-identical everywhere they appear in the package |
| A21 | 1120 item D = 5472 line 1c |
| A22 | Cover letter contains the exact enclosure phrase in body and Re line; does not contain the reversed phrase "Form 5472 with attached pro forma"; contains none of these as **whole words, case-insensitive** (so "related" must not trigger "late"): `timely`, `late`, `delinquent`, `DIIRSP` |
| A23 | Cover letter is addressed to the config address and dated the finalisation date |
| A24 | Reasonable cause statement present **iff** status = LATE; exactly one per late tax year; each names its own tax year |
| A25 | Authored-document signature heading = config value, exactly |
| A26 | Reasonable cause text contains no sentence that contradicts the questionnaire (see C-04): no "customer payments"/"vendor invoices" unless the LLC trades; no "no U.S. income"/"no tax owed" if U.S.-source income was reported |
| A27 | Every statement page carries LLC name, EIN and tax year |
| A28 | Final PDF has **zero** remaining form fields/widget annotations |
| A29 | Render check (V-02) passed |
| A30 | PDF metadata carries generator version + commit hash (S-01) |

**V-02 (P0) Render test.** Rasterise every page of the final PDF at `FAX_RENDER_DPI` using a renderer that ignores AcroForm data (e.g. poppler `pdftoppm`), extract page text with two independent engines (e.g. poppler `pdftotext` and PDFium), and confirm that **every value the data model says was written is present in page content on the expected page**. For checkboxes, confirm ink inside the box rectangle (dark-pixel ratio above a threshold) for every box that should be ticked and none for every box that should be empty. This is the test that catches text that exists in a field but does not print or fax.

Run V-01 and V-02 against the current generator with fixtures F1–F7 and record the failures in `docs/generator-audit.md`. That red list is your work queue. Then fix until green.

### Phase 2 — Form logic

| ID | P | Fix | Done when |
|---|---|---|---|
| G-01 | P0 | Line 2 always checked | A01 green on F1–F7 |
| G-02 | P0 | Lines 43a/43b never written | A03 green; 37–42 still answered |
| G-03 | P0 | Activity codes: build `irs_pba_codes_<year>.json` by extracting the code list from the official i1120 PDF for each supported year (do **not** type codes from memory). Replace free-text/NAICS entry with a searchable picker limited to that list. Keep the generator's current behaviour of writing the same code to 1e and 8d. "No activity" maps to `999000`. Existing orders holding an off-list code are flagged to the reviewer, never silently remapped. | A05 green; unit tests: `541611`, `541510`, `000000`, `999999` rejected; `541600`, `541512`, `523900`, `999000` accepted |
| G-04 | P0 | 1120 and 5472 header dates always populated; first-year start = formation date; final-year end = dissolution date | A06, A07 green on F2, F3 |
| G-05 | P0 | Form library keyed by tax year; correct 1120 revision selected; short-year exception implemented; remove any coloured banner workaround | A08 green on F3, F5 |
| G-06 | P0 | 1o fed only from the LLC's country-of-business field | A16 green; F2 (owner abroad, LLC trades in U.S.) prints `United States` in 1o and the owner's country in 4c/8f |
| G-07 | P1 | 1j derived per §5.1 | A15 green |
| G-08 | P0 | 1f/1h computed from the Part V rows; one rounding step (sum the cents, then round half-up to whole dollars) | A12 green; unit test: 13,009.36 + 14,871.00 → 27,880 |
| G-09 | P1 | Part VI path for non-cash transactions | A14 green on F5 |
| G-10 | P1 | More than one related party → block and route to reviewer (full multi-form support is P2) | Test with two parties produces `needs_review`, no PDF |
| G-11 | P1 | 1120 item E(1)/E(2) | A10 green on F2, F3 |
| G-12 | P1 | Paid preparer block and signer title read from config | No literals left in generator code |

### Phase 3 — PDF rendering

| ID | P | Fix | Done when |
|---|---|---|---|
| R-01 | P0 | Signer title written to the Title field of the Sign Here line; nothing drawn over the declaration | A11 green |
| R-02 | P0 | 8a, 4a, 1a and the 1120 address must fit their fields on **one line per field line**: auto-shrink font to a floor of 6.5pt; if still too long, apply standard address abbreviations; if still too long, fail validation rather than wrap outside the clip box | A17 + V-02 green on F2's long address |
| R-03 | P0 | Flattening: generate appearance streams, bake them into page content, then remove widget annotations and the AcroForm dictionary. Draw check marks as vector strokes, not as a ZapfDingbats glyph (it fails to resolve in some renderers). Known-good reference pipeline if the stack allows: fill with pypdf (`auto_regenerate=False`) → `qpdf --flatten-annotations=all --generate-appearances` → strip remaining widgets → verify. Merging PDFs **before** flattening drops the AcroForm and blanks the pages in some viewers — flatten each form first, then merge. | A28, A29 green in both text engines |
| R-04 | P1 | Part V statement: descriptions wrap within their column; header with LLC name, EIN, tax year on every page | A27 green; F5 long descriptions do not touch the amount column |
| R-05 | P1 | Part V rows print the actual transaction date | A13 green |

### Phase 4 — Cover letter, reasonable cause, filing status

| ID | P | Fix | Done when |
|---|---|---|---|
| C-01 | P0 | **Extension gate.** Before any late/timely branch, ask: "Did you file Form 7004 (an extension) for this tax year?" — Yes / No / I'm not sure (my formation agent may have). Optional, never required: date filed. Implement §5.6. Inject the clock so tests can set "today". Persist the raw answers with the order. | Tests T1–T7 below |
| C-02 | P0 | Reasonable cause statement generated only when LATE; suppressed everywhere (PDF, UI, emails) otherwise | A24 green on F1, F4, F5, F6 |
| C-03 | P0 | Cover letter: exact enclosure wording; remove any timeliness sentence; date stamped at finalisation | A22, A23 green |
| C-04 | P1 | Reasonable cause template made conditional. Paragraphs about how the LLC operates are chosen from questionnaire facts (trading business / holding-investment / dormant). If U.S.-source income with withholding was reported, use: "no U.S. income tax return was required, and U.S. tax on the dividends was satisfied by withholding at source" instead of any "no U.S. income" wording. The "why it was missed" and "when I learned of the requirement" sections use the client's own answers, lightly cleaned — never generic filler. If those answers are empty, fail validation. | A26 green on F5 |
| C-05 | P1 | Multi-year orders: one reasonable cause statement per late year, placed directly after that year's forms | A24 green on F5; page order per year = 1120, 5472, Part V statement, (Part VI sheet), reasonable cause |
| C-06 | P1 | Signature heading from config on every authored document | A25 green |
| C-07 | P2 | State names in full in prose; remove "DIIRSP"/"delinquent" from customer-facing copy | grep of templates and UI strings clean |

Filing-status tests (clock injected):

| # | Case | Expect |
|---|---|---|
| T1 | TY2025, no extension, today 21 Sep 2026 | LATE, statement required |
| T2 | TY2025, extension = Yes, today 21 Sep 2026 | ON TIME, no statement, due date shown as 15 Oct 2026 |
| T3 | Same as T2, today 16 Oct 2026 | LATE, statement required |
| T4 | TY2025, extension = Not sure | No status; order → reviewer; neutral client message |
| T5 | Final year, dissolved 14 Jul 2026, no extension | Due 15 Nov 2026 is a Sunday → **16 Nov 2026** |
| T6 | Same as T5 with extension | 15 May 2027 is a Saturday → **17 May 2027** |
| T7 | TY2025, extension = Yes, optional date given and it is after 15 Apr 2026 | Extension invalid → LATE; client told why in plain words |

### Phase 5 — Questionnaire (where most reviewer emails start)

Every change is additive. Existing orders keep their answers; new questions are null for old orders and the reviewer is told which are unanswered.

| ID | P | Change |
|---|---|---|
| Q-01 | P0 | **Owner-paid costs**, asked explicitly with amounts and dates: state filing fee, registered agent, formation or EIN service, software/subscriptions, initial bank funding, other. Each is a capital contribution row in Part V. Explain why in one line: "Costs you paid personally for the LLC count as money you put into it." |
| Q-02 | P0 | Every transaction category requires a **number or an explicit zero** — no skipping. Plain-language help: money you moved to yourself, personal spending from the LLC account, and card or Zelle payments to yourself are **distributions**. Customer receipts and vendor payments are **not** asked for and not reported. |
| Q-03 | P0 | **FTIN**: "Do you have a tax number in your country of residence?" Yes → required, with a per-country format hint and a soft warning (not a block) when the length looks wrong. No → `None` is printed and a reference ID is generated once and stored. Reject values matching the ITIN pattern (`9NN-NN-NNNN`) in this field. |
| Q-04 | P0 | Owner address as **structured fields**: street, city, province/state (required), postal code (required, with a "my country has no postal codes" tick), country. |
| Q-05 | P1 | "Does the LLC receive mail at this U.S. address, or is it your registered agent's address?" → §5.5. |
| Q-06 | P1 | "Has a Form 5472 been filed for this LLC for any earlier year?" Yes / No / Not sure. Drives 1j. If the LLC existed in an earlier year and the answer is No, show the reviewer a flag (unfiled prior year). |
| Q-07 | P1 | "Did the LLC receive any U.S.-source income, such as dividends from U.S. shares, or have U.S. tax withheld?" Drives C-04 and a reviewer scope flag. |
| Q-08 | P1 | "Did you transfer anything other than cash into or out of the LLC (shares, crypto, equipment)?" → Part VI path, asks for date and value. |
| Q-09 | P1 | Total assets: ask for the balance of all LLC accounts at the last day of the tax period. |
| Q-10 | P1 | Separate fields: country where **the LLC** does business vs. country where **the owner** does business. No defaulting of one from the other. |
| Q-11 | P1 | EIN: format validation `NN-NNNNNNN`; reject obviously invalid values (all zeros, all one digit). Do not hard-code an IRS prefix list. |
| Q-12 | P1 | Formation and dissolution dates labelled "the effective date shown on your state certificate". Block a final return when the dissolution date is in the future; offer to save the order and resume. |
| Q-13 | P1 | Late orders: per late year — why the filing was missed, when the owner learned of the requirement, confirmation that no IRS notice has been received. Free text, in the client's words. |
| Q-14 | P1 | Tax-year list built from the current date, never a hard-coded array: every year from the formation year to the current year is selectable. Clock-shifted test across 31 Dec → 1 Jan. |
| Q-15 | P2 | Multi-year orders: one set of entity/owner answers, a separate transaction table per year. |

### Phase 6 — Make fixes stick

| ID | P | Item |
|---|---|---|
| S-01 | P0 | **Version stamp.** Write generator semantic version + git commit hash + generation timestamp into PDF metadata and show them on the reviewer's order screen. Two outputs from different code must never be indistinguishable. |
| S-02 | P0 | **CI.** Fixtures F1–F7 through V-01 + V-02 on every push. Red = no merge. |
| S-03 | P1 | **Edit-and-regenerate for reviewers.** Reviewer overrides (activity code, address choice, Part V rows, reasonable cause text, cover-letter date) are stored against the order with who/when, and the package is regenerated from data. The goal is that nobody hand-patches a flattened PDF again. If this already exists, make sure overrides survive regeneration. |
| S-04 | P1 | **Open-order sweep — report only.** A read-only command that runs V-01 across orders that are generated but not yet faxed and writes a report listing order ID and failed assertion IDs (no customer data in the report). It changes nothing. Sum decides what to regenerate. |
| S-05 | P2 | `docs/filing-package-rules.md`: §5 of this file plus the assertion list, so the next change has a written standard. |

---

## 7. Order of work

1. Phase 0 → **stop for approval**
2. Phase 1 (fixtures, validator, render test — expect red)
3. Phase 2 and Phase 3, P0 items first
4. Phase 4 — **C-01 and C-02 are time-critical: extended 2025 returns are due 15 October 2026**
5. **Checkpoint:** post validator results for F1–F7 plus rendered crops of line 2/3, lines 43a–b, the 1120 Sign Here line, 8a, and both headers. Wait for approval.
6. Phase 5, then Phase 6
7. Final report (§9)

If you are blocked for more than a short investigation, or a fix would need something §2 forbids, stop and ask. Do not work around it.

---

## 8. Out of scope

- Tax positions, pricing, checkout, marketing pages, email sending
- Anything that touches filed packages
- EIN (SS-4) product, partner/reseller features
- Hosting or deployment changes

---

## 9. Final report

Write `docs/generator-fixes-report.md` and summarise it in chat:

1. Table of every ID in §6: `FIXED` / `ALREADY CORRECT` / `NOT DONE` (with reason), commit hash
2. Validator result per fixture, before and after
3. Schema changes and how to roll them back
4. Anything in §5 you could not verify against the IRS source, or that the IRS source appears to contradict
5. Decisions Sum still needs to make
6. Exact commands to run the test suite, the validator on one order, and the open-order sweep

**Definition of done:** F1–F7 all green on V-01 and V-02 in CI; every P0 item `FIXED` or `ALREADY CORRECT`; no real customer data anywhere in the branch; nothing deployed.

---

## 10. Amendments (approved by Sum, 21 September 2026) — these override anything above

1. **PDF pipeline fits the stack.** The app is TypeScript + pdf-lib on Vercel, where pypdf, qpdf, poppler and PDFium cannot run. So:
   - **V-01 (in-process validator)** runs after every generation in production using only what runs on Vercel: the data model, pdf-lib structural checks (field count, widget annotations, AcroForm presence, page count/order) and text extraction with a pure-JS library if one is needed. It must not depend on native binaries.
   - **V-02 (render test)** runs on developer machines and in CI only, using poppler (`pdftoppm`, `pdftotext`) and a second engine (PyMuPDF/`fitz`). It is a test, not a production gate.
   - R-03's "known-good reference pipeline" is replaced by: fill with pdf-lib, generate appearances, `form.flatten()`, then assert zero widgets remain. A failed flatten must FAIL generation, never be swallowed.
2. **CI does not exist yet.** S-02 means creating a GitHub Actions workflow (typecheck, vitest, fixtures F1-F7 through V-01, and V-02 with poppler installed on the runner). Until it exists, the Security page's "CI-gated deploys" claim is untrue; S-02 fixes that.
3. **Email and UI carve-out.** Ground rule 4 and §8 are relaxed only as far as C-01, C-02, C-07, T4 and T7 require: suppressing reasonable-cause mentions in customer screens and emails when the year is not late, and the neutral "we are checking your extension status" message. No other email, pricing, checkout, payment or auth change.
4. **"DIIRSP".** Default until Sum decides otherwise: the word is removed from the cover letter (A22) and from customer-facing screens and emails (C-07). The header stamp on the IRS forms themselves is left exactly as it is today. Marketing pages stay out of scope. Flag this in the final report as a decision for Sum.
5. **One address, applied once.** A20 (identical everywhere) and R-02 (abbreviate when too long) are reconciled by computing a single "print address" in the data model: if the full address does not fit the narrowest field it will be printed in, the standard abbreviations are applied to that single value, and every page uses it. Per-field abbreviation is not allowed.
6. **Bank imports.** Part V rows today come from categorised bank transactions, including Plaid imports, not only typed entry. Phase 0 must document exactly how an imported transaction becomes (or does not become) a Part V owner transaction, and Q-01/Q-02 must work alongside that flow rather than replace it.
7. **Ship in approved waves, not one final merge.** Work stays on `fix/generator-review-defects`; each wave is merged to `main` (which auto-deploys) only after: typecheck, the full test suite, a production build, the relevant fixtures green, and an independent review. Wave order: (1) P0 form-logic fixes + extension gate + reasonable-cause suppression + fail-loud flatten + version stamp, with fixtures and the validator core; (2) remaining P0/P1 form and rendering items; (3) reasonable-cause content and multi-year ordering; (4) questionnaire; (5) CI, reviewer overrides, open-order sweep, rules doc. Packages already signed or faxed are never regenerated.
8. **Cite the IRS source before coding three rules.** Before any code depends on them, `docs/reviews/5472-irs-rule-citations.md` must quote the exact IRS instruction (document, revision, page) for: lines 43a/43b left blank for a foreign-owned U.S. DE; `999000` as the Form 1120 "unclassified" code; and printing `None` when the owner has no foreign tax ID. If the source does not support a rule, stop and report instead of coding it.
9. **Validation status is a new nullable column**, not a new value of the filing status enum: payment, cron and webhook code switch on status.
10. The two older documents named in §2 item 8 are not in the repository; "already fixed?" is judged from the code alone.
