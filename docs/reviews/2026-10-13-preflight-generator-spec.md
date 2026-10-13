# Codex task: fix the reviewed-PDF upload flow, pre-flight checks and package generator (form5472prep.com)

**Source:** issues found while correcting a live client order (tax years 2024 and 2025, express tier), 10–13 Oct 2026.
**Generator:** 2.1.0, commit `ec0f98ffd39cc4aac444d434ea9a7c9d66bb3c9d`.
**Admin page:** (live order, id withheld)

Work in priority order. Use synthetic data in all tests. Do not copy client personal data (names, tax IDs, addresses) into fixtures, logs or commits. Before changing anything, find where pre-flight codes A26, W15 and W33 are defined and where the RCS, cover letter and Part V statement templates live, and confirm the stack.

---

## House rules: invariants the generator must always satisfy

1. **Owner's voice.** Every document we author (reasonable cause statement (RCS), Part V supporting statement, cover letter) is written in the first person, as if the owner wrote it ("I formed…").
   - Never mix "I" with "the Owner".
   - Never use wording that reveals a third party prepared it ("entered by customer", "the Owner arranged for…").
2. **Perjury wording.**
   - The RCS and Part V statements keep the signature heading **"Signed under penalties of perjury:"**.
   - The cover letter uses **"Signed:"** only, with no perjury wording.
   - The printed jurat on Form 1120 page 1 stays as printed.
3. **No unconfirmed facts in signed statements.** The generator must not assert a fact whose source field is "Not recorded". (Example: "I have not received any IRS notice" when *No IRS notice confirmed* is not "Yes".)
4. **No raw customer free text in IRS-facing documents.** Customer messages and intake text are source material for an admin, never template input.
5. **Paid preparer is optional per order.** Do not assume every job has a paid preparer. When one is shown, statements must not claim the owner prepared the returns.
6. **Cover letter subject wording:** "pro forma Form 1120 with Form 5472 attached".

---

## P0 — Workflow blockers

### 1. A stale pre-flight result blocks the reviewed-PDF upload, and there is no way to re-run it
**Observed:**
- Pre-flight ran once at order creation (2026-10-10 12:14 UTC).
- The admin uploaded a corrected, reviewed PDF on 13 Oct, and the upload failed.
- The only explanation is a line further down the page: "Pre-flight has failed and no override is recorded — the reviewed PDF can't be sent yet."
- Pre-flight evaluates the order's stored fields, not the uploaded PDF, so fixing the PDF can never clear it.
- There is no "re-run" control. Saving a field does not re-run it.

**Expected:**
- A **Re-run pre-flight** action on the filing page. Pre-flight also re-runs automatically after any change-logged field save and after Regenerate PDF.
- The pre-flight card shows its own timestamp. It also shows a "stale" badge when any field has changed since the last run.
- The **Upload reviewed PDF** control is visibly disabled while blocked, with the reason shown inline next to it and a link to the override. If it stays enabled, a failed upload returns an explicit error message.
- Recording "Approve despite pre-flight failures" requires a non-empty reason, which is saved to the change log with the admin user and timestamp.

**Acceptance:**
- Editing a field, then re-running, updates the timestamp and findings.
- Upload while blocked shows the reason. Upload after a recorded override succeeds.
- The override reason appears in the change log.

### 2. A26 is opaque
**Observed:** "A26: Tax year 2024: RCS contains unsupported operations wording." It does not say which words or which field triggered it.

**Expected:** The finding names the source field (e.g. *2024 → Why missed*), quotes each matched phrase (truncated to about 80 characters), and states the rule. For example: "claims about operations, expenses, employees or transactions that the order data does not support or contradicts".

**Acceptance:** A fixture whose *Why missed* text contains "No operating expenses, employees, or transactions" while the order has Part V amounts produces an A26 finding that quotes that phrase and names the field.

### 3. Customer free text is injected verbatim into the RCS
**Observed:**
- The 2024 *Why missed* field held the customer's whole message.
- The generator prefixed one template sentence and pasted the rest into RCS Section 2, including:
  - a question addressed to us ("Could you please review whether Form 5472 … are required…");
  - "My objective is to maintain the LLC … at minimal cost";
  - a mix of first person and "the Owner".
- The result asked the IRS whether a filing was even required.

**Expected:**
- Customer intake text is stored in a separate field (e.g. *Customer's explanation*). It is shown to the admin and never rendered into the PDF.
- The RCS cause section is built from **structured fields** plus an **admin-authored narrative** field.
- If the admin narrative is empty for a late year, pre-flight raises an **error**: "RCS narrative not written for tax year X". Do not fall back to the customer's text.
- Before the narrative renders, block text containing a question mark addressed to us, or phrases such as "could you", "please review", "my objective", "minimal cost" or "[CPA Name]". Raise these as a pre-flight error.

**Acceptance:** A fixture with customer text but no admin narrative produces no RCS body text and fails pre-flight with the new error. A fixture with an admin narrative renders that narrative only.

### 4. No RCS was generated for a later late year
**Observed:**
- 2025 was due 15 Apr 2026. Form 7004 was "Not sure" and the effective due date was 15 Apr 2026, so 2025 was late. *DIIRSP* showed "Yes — delinquent submission".
- The package contained an RCS for 2024 only.

**Expected:** Generate one RCS per tax year that is classified late.
- Each year's RCS uses that year's transactions and that year's narrative.
- A year after the first one says whether the owner was still unaware at that year's due date. This comes from the year's *When learned* field: if *When learned* is after the due date, add "I remained unaware of the requirement when the [year] return was due on [date]."
- If *When learned* is empty, pre-flight raises a warning.

**Acceptance:** A two-year fixture with both years late produces two RCS pages, each placed after its own year's Part V statement.

---

## P1 — Package correctness

### 5. RCS template voice and claims
- Rewrite every RCS section (Background, Cause, Filing history and notice status, Corrective action) in the first person. Remove "the Owner" everywhere.
- Corrective action wording:
  - Use: "As soon as I learned of the requirement, I took steps to file the outstanding returns for [years], which I am now filing together."
  - Never use: "I prepared…", "arranged for this return to be prepared", "will retain qualified assistance".
- Include "I have not received any IRS notice about this return" **only** when *No IRS notice confirmed* = Yes for that year. Otherwise, raise a pre-flight warning and omit the sentence.
- Include "This is the LLC's first tax year" only for the year containing the formation date.
- **Optional paragraph (admin toggle, default ON when conditions are met):**
  - Conditions: gross receipts are $0 (or 1120 line 1a is blank), the LLC address is flagged registered-agent-only or there is no other U.S. presence, and the year is late.
  - Text: "The LLC is a small corporation for purposes of Treas. Reg. sec. 1.6038A-4(b)(2)(ii): it has no gross receipts, its only presence in the United States is its registered agent, and I had no knowledge of the requirements of section 6038A. I acted in good faith throughout and will respond promptly and fully to any IRS request relating to these filings."
- RCS signature block:
  - "Signed under penalties of perjury:"
  - signature line
  - owner name
  - "Sole Member, [LLC name]"
  - "Date: ____"

**Acceptance:** Snapshot tests of the rendered RCS text for these cases:
- the formation year;
- a later year;
- a notice-confirmed year;
- a notice not recorded;
- the small-corporation paragraph on and off.

In all cases, "the Owner" and "I prepared" appear 0 times.

### 6. Cover letter perjury wording
**Observed:** The cover letter signature heading reads "Signed under penalties of perjury:".
**Expected:** "Signed:". Add a regression test that the cover-letter text never contains "penalties of perjury".

### 7. Owner-paid costs do not reach Part V, lines 1f/1h or the year-by-year data
**Observed:**
- The per-year *Owner-paid costs* field exists.
- The year-by-year block still showed "Contributions $0.00" and "Customer declared: no reportable transactions".
- The Part V statement said "There were no reportable transactions…", with the Part V box ticked.

**Expected:**
- *Owner-paid costs* (amount, description and date or month) are summed into contributions for that year.
- They are listed on the Part V statement and flow to Form 5472 lines **1f and 1h** (whole dollars).
- Part IV lines 22 and 36 stay unchanged; contributions belong in Part V.
- An admin entry overrides the "customer declared none" flag, and the change log records it.

Part V statement template:
- Write in the first person, e.g. "During tax year [year], I paid $[amount] of [description] for [LLC] from my personal funds. This amount is a capital contribution to the LLC."
- Include a Description / Amount (USD) schedule with a Total row.
- End with "Form 5472 lines 1f and 1h: $[total]."
- Set the heading citation to **Treas. Reg. sec. 1.6038A-2(b)(3)(xi)**, replacing the current `1.6038A-2(b)(3)`.
- Keep schedule descriptions on one line: truncate or wrap cleanly with no orphaned single words.

**Acceptance:** A fixture with $424 for year 1 and $49 for year 2 gives the following results:
- Each Part V statement lists its year's amount.
- Lines 1f and 1h show 424 and 49.
- Line 1c is unchanged.
- A new pre-flight check confirms the Part V total equals 1f and 1h.

### 8. Paid preparer block is all-or-nothing and hard-coded blank
**Expected:**
- A per-order setting: **Paid preparer: None / House preparer**.
- The House preparer details live in config, not in code: preparer name, PTIN, firm name, firm EIN, firm address and an optional phone.
- When set, these fill the "Paid Preparer Use Only" block on every Form 1120 in the order. The 2024 and 2025 form layouts differ, so map each revision separately.
- The preparer signature, preparer date and self-employed box stay blank.
- Add a per-order **"May the IRS discuss this return with the preparer?"** setting: Yes / No / Blank. The default is Blank.
- Add a pre-flight error if a preparer is shown and any RCS contains "I prepared".

### 9. Form 1120 header prints the year twice
**Observed:** The "tax year beginning" field rendered `11/02/2024`, so the header read "11/02/2024, 2024".
**Expected:** Render `MM/DD` only (e.g. `11/02`, `01/01`). Keep the existing behaviour of populating the header for full calendar years.

### 10. W15 false positive
**Observed:** "W15: An earlier year may not have been filed." This fired on an order whose earliest year (2024) contains the formation date (2024-11-02).
**Expected:** Suppress W15 when the earliest tax year in the order contains the date incorporated. Suppress it also when that year's 5472 has line 1j (initial year) checked.

---

## P2 — Validation and safeguards

### 11. Foreign tax ID (FTIN) format check by country of tax residence
**Observed:**
- The FTIN held a 12-digit number that was not a tax ID.
- The owner's real Canadian Social Insurance Number (SIN) had been entered as the Reference ID.

**Expected:** Pre-flight warnings, not errors:
- **Canada:** a SIN is 9 digits and passes the Luhn checksum. Flag an FTIN that fails this test.
- **Brazil:** a CPF is 11 digits with two check digits.
- **Other countries:** a length sanity check only.
- Warn when the Reference ID passes the national-ID test for the country of tax residence but the FTIN does not ("possible swapped fields").

### 12. Regenerate overwrites a reviewed PDF
**Expected:** If a reviewed PDF has been uploaded, **Regenerate PDF** must show a confirmation dialog: "A reviewed PDF is the current client version. Regenerating will not replace it unless you upload again." Document which file the client signs and which file is faxed.

### 13. Owner address quality
**Expected:** A pre-flight warning if the owner address is all lowercase, or has a bare number after the street with no unit label. Also warn if the province/state or postal code is missing; that case already exists, so keep it. Never rewrite the address automatically.

### 14. Extension status "Not sure"
The page correctly flags "Extension unclear — confirm with customer before fax". Keep this. Also show it as a pre-flight warning, so the admin sees it before upload, not only at the fax step.

---

## Out of scope

- IRS form templates (the official 1120 and 5472 PDFs).
- Fax provider, Stripe and Resend integrations.
- Correcting the live order data. The admin does that by hand.

## Definition of done

- All acceptance tests above pass in CI.
- A synthetic two-year late-filing fixture with owner-paid costs in both years produces a package that passes pre-flight with no errors. Warnings appear only where data is genuinely missing.
- A rendered-text check of that package finds:
  - "the Owner": 0
  - "I prepared": 0
  - "penalties of perjury" on the cover letter: 0
  - "Signed under penalties of perjury:" on every RCS and Part V statement
- Change log entries exist for every field save, re-run and override.
