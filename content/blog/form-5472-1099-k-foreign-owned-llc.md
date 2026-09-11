---
title: "My Foreign-Owned LLC Received a 1099-K: Does It Go on Form 5472?"
description: "Reconcile Form 1099-K gross payments to payouts, separate owner withdrawals for Form 5472, and check errors without assuming U.S. income tax is due."
date: 2026-09-11
updated: 2026-09-11
author: "Form5472 Prep"
tags: ["form-5472", "1099-k", "foreign-owned-llc", "payment-processors"]
draft: false
---

No—not merely because the LLC received a Form 1099-K. That form reports payment activity; Form 5472 reports qualifying transactions with related parties. Gross customer payments do not become owner transactions when a platform reports them. But the 1099-K still needs to be checked against the business records and considered in a separate income-tax review. [IRS overview of Form 1099-K](https://www.irs.gov/businesses/understanding-your-form-1099-k), [IRS Form 5472 instructions](https://www.irs.gov/instructions/i5472).

For a U.S. single-member LLC wholly owned by a foreign person and treated as disregarded, separate three jobs: verify the platform's report, reconcile the money, and decide which filings the facts require. Neither “ignore it because I live abroad” nor “put the entire amount on Form 5472” does those jobs.

## What does the 1099-K amount actually represent?

Box 1a shows gross payment volume before adjustments such as fees, credits, and refunds. It is not a statement of net deposits or profit. A difference between box 1a and your bank receipts is therefore not, by itself, an error. [IRS guidance, “Gross payment amount (Box 1a)”](https://www.irs.gov/businesses/what-to-do-with-form-1099-k).

Treat the form as one source document. Reconcile it to the processor's transaction export and settlement reports, then match settlements to the bank. If multiple platforms were used, keep their reports distinct until you have checked which payments each covers.

## Worked example: USD 30,000 gross is not USD 30,000 of owner activity

This hypothetical calendar-year 2025 example assumes all customers and the processor are unrelated to the LLC and its owner. Every amount is in USD. There are no reserves, chargebacks beyond the listed refunds, timing differences, currency conversions, or other settlement adjustments.

| Payment reconciliation | USD |
|---|---:|
| Gross customer payments reported in box 1a | 30,000 |
| Less customer refunds | −2,000 |
| Less processor fees | −900 |
| **Net payout deposited in the LLC bank account** | **27,100** |

Calculation: **USD 30,000 − USD 2,000 − USD 900 = USD 27,100**.

The USD 27,100 is a settlement amount, not necessarily profit. The business might also have inventory costs, software bills, wages, or other expenses not shown in this reconciliation. An income-tax return may also require accounting adjustments beyond cash deposits.

Now assume the LLC transfers **USD 5,000 to its foreign owner's personal account as an owner distribution**, its only related-party transaction in this simplified example. That transfer is separately relevant to Form 5472 Part V. The instructions expressly include contributions and distributions in the DE transaction review. [IRS Form 5472 instructions, Part V](https://www.irs.gov/instructions/i5472).

| Movement | What the record supports |
|---|---|
| USD 30,000 customer payments | Gross platform activity |
| USD 27,100 processor-to-LLC payout | Settlement of those customer payments |
| USD 5,000 LLC-to-owner distribution | Separate related-party transaction |

Do not count the gross customer payments and the bank payout as two rounds of revenue. Equally, do not count both as owner funding: the money belonged to the LLC throughout the processor-to-bank movement. The later distribution is a different event.

If the USD 5,000 was actually loan repayment, reimbursement, or compensation, investigate that classification instead of calling every withdrawal a distribution. For the broader payment workflow, see [Stripe, PayPal, and Wise activity](/blog/stripe-paypal-wise-form-5472).

## Is the form accurate, wrong, or duplicated?

Separate an unexplained difference from a demonstrated reporting error.

| Situation | Useful next step |
|---|---|
| Gross amount reconciles, but exceeds deposits | Retain the reconciliation; do not request a correction merely for fees or refunds |
| Payee name or TIN appears wrong | Compare the account's tax documentation and ownership classification; ask the issuer to investigate |
| Same payments appear on two forms | Match transaction IDs and reporting periods before identifying the duplicate to the issuer |
| Gross amount cannot be explained | Obtain the detailed payment report and isolate missing, unrelated, or duplicated entries |
| Amount is accurate but U.S. tax treatment is unclear | Give the reconciled records and operating facts to a qualified international tax adviser |

For an incorrect form, the IRS directs recipients to the issuer listed as the filer; the IRS cannot correct it. Keep the original, any corrected form, and correspondence. Do not let the correction request cause you to miss an otherwise applicable filing deadline. [IRS correction guidance](https://www.irs.gov/businesses/what-to-do-with-form-1099-k).

Two forms are not necessarily duplicates: different processors or different payment categories can cover different transactions. Conversely, receiving two reports for the same sale does not create a second sale in the books. Preserve the transaction-level explanation rather than simply deleting whichever form is inconvenient.

## Does a foreign-owned LLC need different payee documentation?

Yes, its disregarded status matters. The W-8BEN instructions treat the foreign individual owner as the beneficial owner of income received by the disregarded entity. They also address providing W-8BEN when requested by a payment settlement entity, with W-8ECI instead where the payments are effectively connected income. This is not a rule that every foreign-owned LLC should submit the same W-form. [IRS W-8BEN instructions](https://www.irs.gov/instructions/iw8ben).

Review what the platform actually has: owner identity, tax residence, entity classification, and any W-8 or W-9 certification. A U.S. EIN alone is not a reason for a foreign individual to certify U.S.-person status on W-9. [IRS requester instructions for W-9](https://www.irs.gov/instructions/iw9).

Do not blindly apply generic advice about correcting a corporation's Form 1099-K to its corporate return TIN. This LLC's **pro forma** Form 1120 is not a corporate income-tax return reporting its business revenue. The correct documentation depends on the owner and payment facts. Our [W-8BEN versus W-9 guide](/blog/w8ben-vs-w9-foreign-owned-llc) explains that separate classification step.

## Does receiving a 1099-K mean U.S. income tax is due?

No automatic conclusion follows from receiving the form. The income's character and source, the owner's status, U.S. business activities, and any applicable treaty position need their own review.

For services, the IRS generally sources income where the work is performed—not simply where the payer lives or the bank account sits. [IRS personal-service sourcing guidance](https://www.irs.gov/individuals/international-taxpayers/source-of-income-personal-service-income).

An Amazon FBA or other inventory business needs additional facts: inventory locations, purchase versus production, sales terms, fulfillment arrangements, and U.S. personnel or agents. It should not inherit a services-only “all work performed abroad” conclusion. The IRS's [effectively connected income guidance](https://www.irs.gov/individuals/international-taxpayers/effectively-connected-income-eci) explains why U.S. business activity and inventory sales matter.

For an individual nonresident owner, [Form 1040-NR is a separate question from Form 5472](/blog/form-5472-vs-1040-nr). Do not file it merely to copy a platform total, or assume a protective return is automatically required. An entity owner may need a different analysis altogether.

## What should you bring to the preparer?

Bring every original/corrected 1099-K, annual and monthly processor exports, settlement reports, bank statements, refunds and fee records, and the platform's tax certifications. Separately list owner contributions, distributions, loans, and personally paid LLC expenses, including movements outside the platform.

Also describe where services were performed or inventory was held and sold. A neat payment reconciliation cannot answer missing operational facts.

When the LLC has reportable related-party activity, [start the Form 5472 filing](/start). Form5472 Prep prepares that information-return package; it does not thereby correct the issuer's 1099-K or resolve the owner's income-tax position.

## Frequently asked questions

### Should I put gross 1099-K payments or net payouts on Form 5472?

Neither automatically. Identify related-party transactions first. In the example, unrelated customer receipts and processor settlements stay in the business reconciliation; the separate USD 5,000 owner distribution belongs in the Form 5472 review.

### What if the platform did not issue a 1099-K?

Keep and reconcile the payment records anyway. The absence of an information form does not determine whether income is taxable or whether related-party transactions require Form 5472. Review each obligation on its own facts.

### Does an owner withdrawal reduce the amount on the 1099-K?

No. In this example, the later distribution does not change the earlier USD 30,000 gross customer payments. It is recorded separately from processor fees, customer refunds, and the settlement calculation.
