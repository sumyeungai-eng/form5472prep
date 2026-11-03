# Staff changelog — November 2026 system update (P0)

What changes for staff when this update goes live, and what to do about it.

## 1. Nothing reaches the client until you release it

- **The release button.** On an order page, "Release generated PDF to client" hands the package to the client. Until then the client sees an "In review" screen, with no PDF and no sign button.
- **Why the button may be greyed out.** The reason shows next to it. The common reasons are:
  - *Pre-flight has not run on this data* — click **Re-run pre-flight**.
  - *Pre-flight last ran on a different PDF* — click **Re-run pre-flight** (it rebuilds the PDF from the current data), check the new PDF, then release.
  - *The order data changed after pre-flight* — click **Re-run pre-flight**.
  - *A32: a late year has no reasonable cause* — write the admin narrative, or choose "Customer's own words" with text (see section 4). A32 can never be overridden for the generated PDF.
  - **Exception (2026-11-03): Upload reviewed PDF.** A reviewed PDF you upload carries its own reasonable-cause statement, so A32 does not block it (or its fax). You still need **Approve despite pre-flight failures** with a reason first. Checking that the uploaded PDF really contains the statement is on you.
  - *Pre-flight failed* — fix the finding, or record an override with a reason (except A32).
- **Orders already waiting for review when the update goes live:** click **Re-run pre-flight once on each of them** before releasing. The button stays disabled until you do.

## 2. Re-release after edits

- If you change package data after release and the client has **not** signed, the PDF is rebuilt, the release is cleared and the page says **"Re-release needed"**. Check the new PDF and release it again.
- If the client **already signed**, nothing is rebuilt. A warning says the data changed after signing; regenerate deliberately.
- If you released a **reviewed upload**, it stays released and you get a warning. You own that file.
- Saving the reasonable cause source, the verbatim text or the Part V line items counts as a package-data change.

## 3. The client's "In review" screen

- The client sees what they told us: LLC, owner and address, company address, each year's Part V rows (a missing amount shows as "amount missing") and their step-5 text.
- "Send a correction" posts into the order's message thread, which you read in the admin as usual.

## 4. Reasonable cause source (per late year)

- In **Edit filing fields → Per-year fields**, each year has **Reasonable cause source**:
  - **Admin narrative (default):** the templated statement, with your narrative as the cause section. After the narrative, "I remained unaware…" and the small-corporation paragraph still print when they apply.
  - **Customer's own words (verbatim):** the statement body is the **Verbatim text** box, printed as written between the unchanged heading and the "Signed under penalties of perjury" block. Accents and curly quotes print as typed.
- Choosing verbatim records who chose it, and fills an empty box from the client's raw text. Older orders fall back to the normalised answer, then the order message; for these the page says "formatting not recoverable (captured before 2026-10-31)".
- You may edit the verbatim text. Every edit is change-logged, and every stored PDF keeps a snapshot of the exact text it printed.
- With **no narrative and no verbatim text**, the cause section prints a red **"DRAFT — cause narrative missing"** marker. Pre-flight fails A32, and the package cannot be released or faxed.
- The "No U.S.-source income" sentence now sits in section 1 (Background), not under the cause heading.

## 5. Part V line items

- Clients now enter **one row per payment**: date, amount in USD, currency and original amount for foreign payments, how it was paid (paid personally, bank transfer, other) and a category, including the new **Other**.
- A checklist (state fee, registered agent, mailroom or address, EIN or formation service, initial bank funding) adds rows for the client to complete.
- Clients are **never** blocked. They see warnings and can always continue and pay. You catch problems in pre-flight.
- **Per-year table:** Edit filing fields → **Part V line items**. Add, edit or remove rows, then Save. The save is logged, pre-flight re-runs and the release rule in section 2 applies.
- **Convert to line items:** older orders may still have "owner-paid costs" (the earlier format). They print exactly as before. Click **Convert to line items** under the table to move them into rows: one save, logged, nothing matched by amount. Do it only when you want to edit them as rows.
- **The statement now:**
  - prints one row per item, described in the owner's voice ("…, paid from my personal funds");
  - adds an Other section;
  - prints a conversion sentence for each foreign-currency row: "92.00 EUR converted to $100.00 at 1.0870 USD per EUR";
  - adds "I received no distributions…" only when the client answered and took nothing out.

## 6. New pre-flight codes

| Code | Blocks? | Meaning and what to do |
|---|---|---|
| **A37** | Yes | The verbatim text has characters the PDF font cannot print (for example Thai or Chinese script). They print as "?". Edit the verbatim text. |
| **A38** | Yes | A Part V row has no USD amount. It prints "MISSING" and is left out of the totals. Enter the amount in the line-item table. |
| **W42** | No | The verbatim text looks like a note to us: "?", "please", "can you", "your team", an email address or a link. Edit it, or switch the source to the admin narrative. |
| **W43** | No | A contribution or loan row under $100, excluding fees paid personally. Check the client did not type "5.000" meaning 5,000. |
| **W44** | No | Part V has only a year total. Ask the client for line items. |
| **W45** | No | A foreign-currency row is missing a valid 3-letter currency or a positive original amount, so no conversion sentence prints. Complete the row. |

A32 now also says when the source is verbatim but the box is empty.

## 7. Review queue, due chips and the "Late filing" label (P1, PR 8 + PR 10)
- **Review queue:** on Filings, click **Review queue** (or open `/admin/filings?queue=1`). It lists orders waiting for review (paid, not yet released), most urgent first: express orders, then orders whose pre-flight failed, then the oldest payment. The normal Filings list is unchanged.
- **Due chip:** each unreleased paid order shows "due in 5h", "due in 3d" or "overdue 2d". Express is due 72 hours after payment. Standard is due 7 business days after payment (weekends and U.S. federal holidays don't count). The chip disappears once you release the package.
- **"—" instead of a due time:** we only started recording the payment time now. Older orders show "—" and sort after orders with a known payment time; check their order date.
- **Not released:** a grey badge on any order whose package exists but has not been released, so the client can't see or sign it yet.
- **Late filing:** the order page now says **Late filing: Yes** where it used to say "DIIRSP: Yes — delinquent submission". Same meaning. Customer-facing app text, the chat assistant and the contact page now say "late filing with a reasonable-cause statement" instead of "DIIRSP". The marketing pages and blog posts still mention DIIRSP; that is deliberate.
- **Check & sign page:** clients now see a short "Why some lines are blank" note under their forms (pro forma 1120 lines, 5472 lines 43a–43b, Part IV vs Part V, Parts VIII–IX).
