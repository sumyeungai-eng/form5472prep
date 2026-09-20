---
title: "Building Your Form 5472 Figures From Mercury, Wise or Relay Statements"
description: "Turn a Mercury, Wise or Relay export into Form 5472 numbers: separate revenue from owner movements, categorize, total, and reconcile."
date: 2026-09-20
updated: 2026-09-20
author: "Form5472 Prep"
tags: ["form-5472", "mercury", "wise", "relay", "foreign-owned-llc"]
draft: false
---

**Your Form 5472 figures come from your bank export, not your revenue. Download the year's transactions from Mercury, Wise or Relay, pull out every movement between the LLC and its foreign owner, sort those into categories, total each one, and check the totals against Part IV and the Part V statement. Customer payments and unrelated vendor bills stay off the form.**

Most foreign-owned single-member LLCs bank with one of a handful of fintech-style providers built for non-resident founders, and Mercury, Wise and Relay are three of the most common. Their exports are clean compared with a legacy bank PDF — but the export itself does not sort transactions into "reportable" and "not reportable." You still have to do that.

This post walks through the same reconciliation whichever bank you use: export the year, separate revenue from owner activity, categorize what's left, total it, and tie the totals back to the form. [We prepare and fax the complete package from $149](/start) once you have the figures, and a qualified tax accountant reviews the classification before it goes out.

## Do transaction exports already tell you what's reportable?

No. A Mercury, Wise or Relay export lists dates, amounts, counterparties and memos — it does not know which counterparty is the foreign owner. The [IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472) require identifying transactions with foreign related parties and describing them by category; that happens in your bookkeeping, not the bank's software.

Two gaps matter for a first-time filer. Customer receipts and the owner's own transfers sit in the same list with nothing visually separating them. And an owner-paid LLC expense — the owner buying something for the business on a personal card — never appears in the export at all, since the money never touched the LLC account. A process built only around "read the bank export" will miss that second category every time.

## How do you turn an export into Form 5472 figures?

Work in this order, whichever bank you use:

1. **Export the year's statements.** Pull the full tax year from the bank in one file rather than stitching monthly PDFs together, so nothing falls between two exports.
2. **Separate customer revenue from owner movements.** Mark every deposit from a customer, marketplace or payment processor, and every payment to an unrelated vendor, as ordinary business activity, and set it aside.
3. **Categorize what is left.** Name the counterparty and the nature of each remaining line: owner contribution, distribution, loan to or from the owner, owner-paid expense, or payment to a related company.
4. **Total each category.** Add every line in a category to one figure, in US dollars, noting the source currency and conversion basis for anything not already in dollars.
5. **Reconcile to Part IV and the Part V statement.** Match each total to the Form 5472 line it belongs on, and confirm the totals explain the account's cash movements for the year.

Step 2 is where most of the effort goes. Step 5 is where mistakes get caught: a total that won't reconcile to the bank's net change usually means something was miscategorized or missed.

## Which Form 5472 category does each movement belong to?

Part IV lists specific transaction types with a foreign related party; Part V is the catch-all for a disregarded entity's own formation, contribution and distribution transactions not already on a Part IV line ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472); [Form 5472](https://www.irs.gov/pub/irs-pdf/f5472.pdf)).

| What you see in the export | Typical category | Where it's reported |
|---|---|---|
| Customer or marketplace payout | Not a related-party transaction | Not reportable |
| Unrelated vendor or software bill | Not a related-party transaction | Not reportable |
| Owner wires money into the LLC account | Contribution | Part V statement |
| LLC wires money to the owner's personal account | Distribution | Part V statement |
| Owner sends the LLC a bridge loan | Amount borrowed from a related party | Part IV, line 17, or the Part V statement |
| LLC repays owner loan principal | Repayment of a related-party loan | Part V statement |
| Owner's personal card pays an LLC bill | Owner-paid expense (contribution in kind) | Part V statement |
| LLC pays a related foreign company for genuine services | Compensation, rents, royalties or similar | Part IV |

That last row is its own topic; see [Form 5472 for related-party services and management fees](/blog/form-5472-related-party-services-management-fees) if the LLC pays a related company rather than the owner. For telling a customer payment from an owner transfer through the same processor, see [Form 5472 for Stripe, PayPal and Wise activity](/blog/stripe-paypal-wise-form-5472) — not repeated here.

## What do Mercury, Wise and Relay exports actually give you?

Each platform describes its export options a little differently, and screens change over time, so confirm the current steps on the bank's own site.

Wise's help centre states that statements can be downloaded in PDF, XLSX, CSV, MT940, QIF or CAMT.053 format for a chosen balance or currency, for a period of up to 365 days at a time, with multiple periods combined for a longer year ([Wise: How do I download a statement?](https://wise.com/help/articles/2736049/how-do-i-download-a-statement)).

Relay's help centre states that statements export as PDF, CSV or OFX, that you choose the month(s) and account before exporting, and that CSV and OFX suit spreadsheet and accounting-software use, unlike the PDF format ([Relay: Downloading and emailing bank statements](https://relayfi.com/hc/en-us/articles/360038797251-Downloading-and-emailing-bank-statements/)).

Mercury's own help centre blocks automated access, so we could not read it to confirm its current menu labels or export formats, and we do not restate them here from second-hand sources. Work from whatever transaction export and monthly statements your Mercury account offers for the tax year. Check Mercury's current help pages for exact steps before relying on them.

Whichever export you pull, the same fields matter: date, counterparty, and amount in both source currency and US dollars. If a counterparty isn't clear, check the wire detail in the bank's own transaction screen before categorizing it.

## A worked illustrative ledger, from export to totals

This ledger is illustrative only — invented dates and amounts to show the method, not a real filing or client data. It represents one year of a single LLC's bank activity, the kind of list a Mercury, Wise or Relay export gives you before any sorting.

| Date | Description | Counterparty | Amount | Category |
|---|---|---:|---:|---|
| Jan 15 | Customer payout, online store | Unrelated customers | $22,000 | Not reportable — revenue |
| Feb 3 | Initial capital wire | Foreign owner | $5,000 | Contribution |
| Mar 10 | Client payment, EU invoice | Unrelated customer | $9,500 | Not reportable — revenue |
| Apr 2 | Software subscription paid on owner's personal card | Foreign owner | $180 | Owner-paid expense |
| Apr 20 | Contractor invoice paid | Unrelated contractor | ($3,000) | Not reportable — operating cost |
| May 5 | Bridge loan to the LLC | Foreign owner | $10,000 | Loan, owner to LLC |
| Jun 18 | Customer payout, marketplace | Unrelated customers | $14,750 | Not reportable — revenue |
| Jul 1 | Owner distribution | Foreign owner | ($6,000) | Distribution |
| Aug 9 | Bank and processor fees | Unrelated processor | ($260) | Not reportable — operating cost |
| Sep 14 | Partial loan repayment | Foreign owner | ($4,000) | Loan repayment |
| Oct 22 | Customer refund issued | Unrelated customer | ($500) | Not reportable — revenue adjustment |
| Nov 30 | Year-end owner distribution | Foreign owner | ($3,500) | Distribution |
| Dec 15 | Reimbursement for travel the owner paid personally | Foreign owner | ($620) | Reimbursement to owner |

Notice the April 2 line never moves the LLC's bank balance — the owner paid that bill directly, so it only shows up if you track owner-paid expenses outside the bank export too, the gap described earlier. For a fuller checklist of records to keep, see [Form 5472 recordkeeping checklist](/blog/form-5472-recordkeeping-checklist).

### Totaling the owner-movement categories

Setting aside the revenue and operating-cost lines above, the owner movements total as follows:

| Category | Direction | Amount |
|---|---|---:|
| Contribution (initial capital) | Owner → LLC | $5,000.00 |
| Owner-paid LLC expense | Owner → LLC | $180.00 |
| Loan to the LLC | Owner → LLC | $10,000.00 |
| Distribution (July) | LLC → Owner | $6,000.00 |
| Distribution (November) | LLC → Owner | $3,500.00 |
| Loan repayment | LLC → Owner | $4,000.00 |
| Reimbursement (travel) | LLC → Owner | $620.00 |
| **Total reportable owner movements** | | **$29,300.00** |

That $29,300 total is the sum of every individual owner movement, not a net figure — the Part V statement lists transactions individually and totals them, the way the [Part V statement example](/blog/form-5472-part-v-statement-example) shows.

### Checking the arithmetic against the bank balance

The categorized totals should also explain the account's cash movement for the year. Excluding the $180 owner-paid expense that never touched the bank account:

- Net customer revenue: $22,000 + $9,500 + $14,750 − $500 = **$45,750**
- Unrelated operating costs: $3,000 + $260 = **($3,260)**
- Owner cash into the LLC (contribution + loan): $5,000 + $10,000 = **$15,000**
- Owner cash out of the LLC (distributions + loan repayment + reimbursement): $6,000 + $3,500 + $4,000 + $620 = **($14,120)**

$45,750 − $3,260 + $15,000 − $14,120 = **$43,370**, matching the account's actual net increase for the year, before the $180 is added back as a non-cash contribution. If your reconciliation doesn't land on the bank's real year-end change, a transaction was miscategorized, duplicated, or missed — go back to the export before totaling anything for the form.

## How do you handle non-US-dollar lines in the export?

Wise and similar multi-currency accounts show balances and transfers in more than one currency inside the same export. Convert each foreign-currency owner movement to US dollars using a consistent method, and keep a record of the rate used — the IRS instructions require dollar amounts and support for the conversion. A full walkthrough is in [Form 5472 currency conversion and exchange rates](/blog/form-5472-currency-conversion-exchange-rates); this post assumes that step is done once the ledger above shows dollar figures.

## Getting the figures into a filed return

Once your categories and totals reconcile the way the worked example above does, the remaining work is drafting the Part V statement, completing the pro forma Form 1120 cover, and filing — the return cannot be e-filed, so it goes by fax to 855-887-7737 or by mail to the IRS in Ogden, Utah.

Form5472 Prep turns your categorized totals into the complete package: Form 5472, the pro forma Form 1120, and a matching Part V statement, reviewed by a qualified tax accountant before it's filed. Standard is **$149** in 5–7 business days; Express is **$199** in 3 business days; each additional past year is **+$99**; fax delivery is included. [Start your filing](/start) with the totals you've built.

We are not a CPA firm and do not give tax advice. We prepare and submit the information return accurately; you or your adviser remain responsible for income-tax positions.

## Frequently asked questions

### Can I just export a statement and attach it to Form 5472?

No. Form 5472 requires categorized, totaled figures and a Part V statement describing each transaction, not a raw bank export. Keep the export as support, not the filing itself.

### Do processor fees and refunds need their own line?

Usually no. Fees to an unrelated processor and refunds to unrelated customers are ordinary business activity, not related-party transactions, so they generally stay off the form.

### What if the owner paid an LLC bill from a personal account?

Treat it as an owner-paid expense, generally a contribution in kind. It won't appear in the LLC's bank export at all, so track it separately in your own records.

### Does it matter which of the three banks I use?

No. The categorization method is the same regardless of platform; only the export screen and file formats differ. Confirm current steps on your own bank's help centre.

### How many years of exports do I need?

At minimum, the tax year you're filing for. If filing late or for the first time, pull each year separately rather than one combined export.

### What if a transfer's counterparty isn't clear from the export?

Open the transaction in the bank's own dashboard for the wire detail, or contact the bank, before assigning it a category.

### Should loan and distribution amounts be combined into one total?

No. Keep them separate even though both may involve the same related party; the Part V statement should show each transaction type distinctly.

---

Whichever bank holds your LLC's account, the method is the same: export, separate, categorize, total, reconcile. [Start your Form 5472 filing](/start) once your totals check out, or read how a Stripe, PayPal or Wise mix gets sorted in [Form 5472 for Stripe, PayPal, and Wise activity](/blog/stripe-paypal-wise-form-5472).

Splitting the year across several countries? The [Form 5472 guide for digital nomads](/blog/form-5472-digital-nomad-us-llc) covers filing when you have no single tax residence.

*Educational content only; not tax or legal advice.*
