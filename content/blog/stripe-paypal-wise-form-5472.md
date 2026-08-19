---
title: "Form 5472 for Stripe, PayPal, and Wise Activity"
description: "Stripe, PayPal and Wise activity is not automatically reportable on Form 5472. The key is whether the transaction involved a related party."
date: 2026-08-03
publishAt: "2026-08-03T09:00:00-04:00"
updated: 2026-08-19
author: "Form5472 Prep"
tags: ["form-5472", "stripe", "paypal", "wise", "foreign-owned-llc"]
draft: false
---

**Stripe, PayPal, and Wise transactions do not belong on Form 5472 merely because they pass through a U.S. LLC account. Form 5472 reports transactions with related parties, usually the foreign owner. Customer receipts and unrelated processor fees are generally outside the form, while owner deposits, withdrawals, loans, and reimbursements usually belong in Part V.**

Payment platforms create noise. A single month can show gross sales, refunds, reserves, fee reversals, currency conversions, and payouts. The filing question is narrower: who was on the other side of the transaction? If the counterparty was the foreign owner or another related party, slow down. If the counterparty was an unrelated customer or processor, keep the record but usually keep it outside Form 5472.

The IRS instructions state that a failure to file Form 5472 when due, filing in the wrong manner, or failing to maintain required records can trigger a **$25,000** penalty ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)). If payment-platform statements are mixed with owner transfers, [start an accountant-reviewed filing](/start?utm_source=blog&utm_medium=internal&utm_campaign=stripe-paypal-wise-form-5472) and provide the year's totals through the guided intake.

## Do Stripe customer payments go on Form 5472?

Stripe customer payments generally do not go on Form 5472 when the customer and Stripe are unrelated to the LLC owner. The [IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472) define reportable transactions by transaction type and related-party status.

The same distinction applies to PayPal sales, Wise customer receipts, Amazon payouts, card-processing fees, hosting charges, and ordinary supplier invoices. Form 5472 is not the LLC's income statement. It is a related-party information return.

That distinction matters because platform exports are often much larger than the related-party schedule. A founder may have **$80,000** of Stripe gross volume and only **$12,000** of owner withdrawals. The platform total supports bookkeeping. The owner withdrawals are the Form 5472 focus.

## Which payment-platform movements are reportable?

Use the counterparty, not the app name, to classify each movement.

| Movement | Counterparty | Form 5472 treatment |
|---|---|---|
| Stripe pays customer sales into LLC bank | Unrelated customers / processor | Generally not a related-party transaction |
| PayPal charges processing fees | Unrelated processor | Generally not reportable |
| Owner tops up Wise Business from a personal account | Foreign owner | Usually a contribution or loan |
| LLC sends Wise funds to owner's personal account | Foreign owner | Usually a distribution or repayment |
| Owner pays a Stripe chargeback personally | Foreign owner | Usually an owner-paid LLC obligation |
| LLC pays a foreign sister company through PayPal | Related foreign company | Potentially reportable on a separate Form 5472 |

The payment rail never decides the answer. A **$2,000** Wise transfer can be an unrelated contractor payment, an owner distribution, or an intercompany service payment. Each classification produces a different result. For a broader checklist, see [Form 5472 reportable transactions examples](/blog/form-5472-reportable-transactions-examples).

## How do you separate revenue from owner transfers?

Separate revenue from owner transfers by reconciling platforms to the bank first, then reconciling the bank to the owner ledger. Do not start by copying every Stripe line into a Form 5472 worksheet.

Apply the Form5472 Prep platform-reconciliation method:

1. Export the annual transaction file from each platform.
2. Mark customer receipts and refunds as ordinary operations.
3. Mark processor fees, reserves, and unrelated vendor payments as ordinary operations.
4. Reconcile platform net payouts to the LLC bank account.
5. Identify every bank transfer whose sender or recipient is the owner.
6. Identify companies controlled by the owner or the owner's family.
7. Build the Part V statement from owner and related-party movements only.

Keep the source-currency amount, U.S.-dollar amount, date, and conversion method. The IRS requires line amounts in U.S. dollars and an exchange-rate schedule for relevant foreign-currency reporting ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)).

## How does a Stripe reconciliation land in Part V?

Here is an illustrative worked example for one month, not a real filing or platform statistic.

Assume the LLC's Stripe activity for May shows:

| Stripe activity | Amount |
|---|---:|
| Gross card charges | **$18,000** |
| Customer refunds | **$1,200** |
| Processor fees | **$720** |
| Net Stripe payouts to LLC bank | **$16,080** |

The arithmetic is:

**$18,000 gross charges - $1,200 refunds - $720 processor fees = $16,080 net payouts.**

The LLC bank statement then shows:

| Bank activity | Amount |
|---|---:|
| Stripe payouts received | **$16,080** |
| Software vendors paid | **$2,400** |
| Owner draw to foreign personal account | **$5,000** |
| Ending cash retained in LLC | **$8,680** |

The Part V figure in this simplified example is not **$18,000**, **$16,080**, or the month-end profit. It is the **$5,000** owner draw, assuming the owner draw is the only related-party transaction for the month.

The Part V statement line might read:

| Date | Related party | Transaction type | Amount | Description |
|---|---|---|---:|---|
| May transfer | Foreign owner | Distribution / owner draw | **$5,000** | Transfer from LLC U.S. bank account to owner's personal foreign account |

The Stripe records still matter. They prove why the bank received **$16,080** and help show that the **$5,000** was an owner draw from LLC cash, not a direct customer payment to the owner. But Form 5472 reports the related-party movement.

## How should Wise multi-currency activity be documented?

Wise multi-currency activity should be documented with both source currency and U.S.-dollar reporting amounts. Wise can show balances, conversions, and payouts in several currencies, so a preparer needs the original currency, conversion date, rate or method, U.S.-dollar amount, and counterparty for each related-party movement.

Do not combine three different facts into one line called "Wise." For example, owner funding in euros, a conversion into U.S. dollars, and a payout to an unrelated vendor are separate bookkeeping facts. The Form 5472 item is the owner funding, not the internal currency conversion or the unrelated vendor payment.

For exchange-rate handling, read [Form 5472 currency conversion and exchange rates](/blog/form-5472-currency-conversion-exchange-rates). The IRS Form 5472 instructions require U.S.-dollar amounts, and the support file should make the conversion method easy to follow.

## What documentation should you keep for Stripe, PayPal, and Wise?

Keep the exports and statements that let someone rebuild the totals. The IRS instructions say records should be sufficient to establish the correctness of the return and should include records relevant to related-party transactions; the instructions also say books or records relating to a form must be retained as long as their contents may become material in administering internal revenue law ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)).

Keep these files in a year folder:

1. Stripe balance, payout, fee, refund, dispute, and transaction exports.
2. PayPal activity, balance, fee, refund, and withdrawal exports.
3. Wise statement, balance, conversion, recipient, and transfer exports.
4. LLC bank statements for every account.
5. Owner personal transfer evidence for money in and money out.
6. Receipts for LLC costs paid personally by the owner.
7. Any related-company invoices, contracts, or support agreements.

The goal is not to attach every export to Form 5472. The goal is to keep enough support that the Form 5472 totals can be explained later without guessing.

## Does Form 5472 report the LLC's profit?

Form 5472 does not calculate the LLC's profit. A foreign-owned single-member LLC treated as a disregarded entity uses a pro forma Form 1120 as the attachment vehicle for Form 5472. The IRS says only limited identifying items are completed on that pro forma return ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)).

Whether the foreign owner separately owes U.S. income tax or must file Form 1040-NR depends on facts such as income sourcing and a U.S. trade or business. Form5472 Prep prepares the Form 5472 information-return package; individualized income-tax advice belongs with a qualified tax professional.

## How can Form5472 Prep help with mixed platform activity?

Form5472 Prep is the answer when the hard part is turning noisy platform records into a clean owner and related-party schedule. We prepare Form 5472, the pro forma Form 1120, and the Part V statement; a qualified tax accountant reviews the package; and we fax it to the IRS Ogden PIN Unit at **855-887-7737** with a timestamped receipt. The IRS instructions list that fax number for foreign-owned U.S. disregarded entities ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)).

The Standard package is **$149** and ready in 5-7 business days. Express is **$199** and ready in 3 business days. Each additional past tax year is **+$99**. IRS fax delivery is included. EIN service is **$149** at [/ein](/ein).

We are not a CPA firm and we do not give tax advice. We prepare and submit the information return accurately, and you or your adviser remain responsible for income-tax, sales-tax, and home-country tax positions.

## Frequently asked questions

### Are Stripe fees reportable on Form 5472?

Stripe fees are generally not reportable when Stripe is an unrelated service provider. A different analysis applies if the payee is related to the LLC or its foreign owner.

### Is a Wise transfer to the owner reportable?

Usually yes. A transfer from the LLC to its foreign owner may be a distribution, reimbursement, loan repayment, interest payment, or service payment.

### Does PayPal revenue go on the pro forma Form 1120?

The pro forma Form 1120 for a foreign-owned disregarded entity contains limited identifying information; it is not ordinarily completed as a full corporate profit-and-loss return.

### Should I attach Stripe or PayPal statements?

Keep statements as support, but do not attach every platform statement unless specifically required. The filing normally reports categorized totals and a Part V statement.

### Are Wise currency conversions reportable by themselves?

Usually no. A conversion inside the LLC's own Wise account is bookkeeping support. The related-party transfer into or out of the account is the usual Form 5472 issue.

### What if the owner paid a refund personally?

Treat it as an owner-paid LLC obligation unless the records show another classification. Keep the refund evidence, owner payment proof, and any later reimbursement from the LLC.

## What is the bottom line?

Stripe, PayPal, and Wise are payment rails, not Form 5472 categories. Classify the person on the other side of each transfer, then report movements involving the foreign owner or another related party. [Prepare and fax the complete filing](/start?utm_source=blog&utm_medium=internal&utm_campaign=stripe-paypal-wise-form-5472-close), or review [currency conversion for Form 5472](/blog/form-5472-currency-conversion-exchange-rates) before totaling non-dollar transfers.

*Educational content only; not tax or legal advice.*
