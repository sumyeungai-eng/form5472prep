---
title: "Form 5472 Reportable Transactions: 15 Examples"
description: "Form 5472 reports transactions between a foreign-owned U.S. LLC and related parties—not every sale or expense. See 15 practical examples."
date: 2026-07-27
publishAt: "2026-07-27T09:00:00-04:00"
updated: 2026-08-19
author: "Form5472 Prep"
tags: ["form-5472", "reportable-transactions", "foreign-owned-llc", "filing-guide"]
draft: false
---

**Form 5472 reports transactions between a foreign-owned U.S. LLC and a related party, usually the foreign owner. Capital contributions, owner withdrawals, loans, reimbursements, formation payments, and dissolution distributions can qualify. Ordinary sales to unrelated customers and payments to unrelated vendors generally do not belong on Form 5472 solely because money crossed a border.**

Form 5472 is an information return, not a profit-and-loss statement. You start with the counterparty, then classify the movement. That is why a customer payment through Stripe can be outside the form while a small owner reimbursement can be reportable.

The IRS instructions state that failing to file Form 5472 when due, filing it in the wrong manner, or failing to maintain required records can trigger a **$25,000** penalty under IRC Section 6038A(d) ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)). If you want the complete package prepared and faxed to the IRS, [start your Form 5472 filing](/start?utm_source=blog&utm_medium=internal&utm_campaign=form-5472-reportable-transactions-examples).

## What counts as a reportable transaction on Form 5472?

A reportable transaction is a listed or described transaction with a related party. The [IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472) include monetary transactions listed in Part IV, transactions involving a foreign-owned U.S. disregarded entity listed in Part V, and certain nonmonetary or below-market transactions listed in Part VI.

The practical test has two gates:

1. **Was the other person a related party?** Any foreign shareholder with at least 25% direct or indirect ownership is a related party under the IRS Form 5472 instructions ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)). In the 100%-owner setup used throughout this article, that threshold is met automatically. An unrelated customer, contractor, processor, or landlord usually is not.
2. **Did money, property, a right, or an obligation move between the LLC and that related party?** If yes, classify and total the transaction in U.S. dollars.

The IRS instructions expressly include amounts connected with formation, dissolution, acquisition, and disposition, including contributions to and distributions from a foreign-owned U.S. disregarded entity ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)).

## Which owner transactions are commonly reportable?

The following examples assume a foreign individual owns 100% of a U.S. single-member LLC treated as a disregarded entity. The 100% assumption keeps the examples simple; it is not the statutory threshold for related-party status.

| Transaction | Usually reportable? | Why |
|---|---:|---|
| Owner deposits startup cash | Yes | Capital contribution connected with formation or funding |
| Owner pays the LLC's formation fee personally | Yes | Owner paid an entity obligation |
| Owner pays the registered agent personally | Yes | Payment or contribution involving the related owner |
| LLC transfers cash to the owner | Yes | Distribution from the entity |
| Owner lends money to the LLC | Yes | Related-party loan or advance |
| LLC repays the owner's loan | Yes | Related-party payment |
| LLC pays interest to the owner | Yes | Interest paid to a foreign related party |
| Owner reimburses an LLC expense | Yes | Related-party reimbursement |
| LLC reimburses the owner | Yes | Related-party reimbursement or payment |
| Owner contributes a laptop or other property | Yes | Nonmonetary contribution; use supportable fair market value |
| LLC distributes property to the owner | Yes | Nonmonetary distribution |
| LLC pays the owner for services | Yes | Related-party service payment |
| Owner receives cash when the LLC closes | Yes | Distribution connected with dissolution |
| Unrelated customer pays an invoice | Generally no | The customer is not a related party |
| LLC pays an unrelated software vendor | Generally no | The vendor is not related merely because it is foreign |

The IRS instructions say foreign-owned disregarded entities describe Part V transactions on an attached statement ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)). A clean statement should identify the date, parties, type, amount, currency, conversion method, and business purpose.

If your facts are SaaS-heavy, read [Form 5472 for SaaS founders](/blog/form-5472-saas-founders) after this section. SaaS founders often need the same owner-transfer analysis, but their processor exports make the records look more complicated than the Form 5472 issue really is.

## Do ordinary revenue and expenses go on Form 5472?

Ordinary revenue and expenses do not automatically go on Form 5472. Form 5472 focuses on related-party transactions. A Stripe customer payment, hosting bill, advertising charge, or contractor invoice is not reportable merely because it appears in the LLC bank account.

Ordinary transactions can become relevant when the counterparty is related. For example, a design invoice from an unrelated foreign freelancer is generally outside Form 5472, while an invoice from a foreign company controlled by the LLC owner may require a separate Form 5472 for that related company.

The useful comparison is this:

| Question | Ordinary bookkeeping answer | Form 5472 answer |
|---|---|---|
| Did the LLC earn revenue? | Relevant to accounting and income-tax analysis | Not enough by itself |
| Did the owner fund the LLC? | Balance sheet or equity tracking | Usually reportable |
| Did the LLC pay an unrelated vendor? | Expense record | Usually not reportable |
| Did the LLC pay the owner's foreign company? | Expense and intercompany record | Potentially reportable |
| Did money move in a foreign currency? | Needs conversion support | Report in U.S. dollars with support |

## How should a foreign-owned LLC organize the numbers?

A foreign-owned LLC should organize the numbers by related-party bucket first, then by form category. Do not start with a full general ledger export and hope the reportable items reveal themselves.

Use the Form5472 Prep four-bucket review:

1. **Owner money in:** contributions, loans, and owner-paid LLC costs.
2. **Owner money out:** distributions, reimbursements, loan repayments, interest, and fees.
3. **Other related parties:** family-controlled or commonly controlled people and entities.
4. **Noncash events:** property, debt assumptions, below-market transfers, formation, and dissolution.

Then reconcile:

1. Tie owner money in to bank deposits and personal-payment receipts.
2. Tie owner money out to bank withdrawals, Wise transfers, PayPal withdrawals, or checks.
3. Match related-company invoices to contracts and payment proof.
4. Convert foreign-currency amounts to U.S. dollars using a documented method. The IRS instructions require amounts in U.S. dollars and an exchange-rate schedule for relevant foreign-currency reporting ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)).
5. Keep the support file with the return workpapers.

## How does an owner-paid supplier reimbursement work?

Here is an illustrative short case study.

Assume a foreign owner uses a personal card to pay an unrelated software supplier **$1,200** for the LLC because the LLC card is not active. Two months later, the LLC reimburses the owner **$1,200** from its U.S. bank account. The supplier is unrelated, so the supplier invoice itself is not a related-party transaction. The owner payment and owner reimbursement are the related-party facts.

The support file should show:

| Step | Counterparty | Amount | Treatment |
|---|---|---:|---|
| Owner paid software supplier | Owner acting for LLC | **$1,200** | Owner-paid LLC obligation |
| LLC reimbursed owner | LLC to foreign owner | **$1,200** | Reimbursement or owner payment |

The Part V statement might describe the owner-paid cost and reimbursement together so the IRS can see that the LLC obligation was paid personally and then cleared. The statement should not turn the supplier into a related party. The reporting point is the movement between the LLC and the owner.

If the LLC never reimburses the owner by year-end, the owner-paid cost still belongs in the related-party review. The open balance may support treating the amount as a contribution, payable, or loan depending on the records. That classification should match the books.

## How does Form5472 Prep handle reportable transactions?

Form5472 Prep is the answer when you have owner funding, withdrawals, loans, reimbursements, or related-company activity and need the information return package prepared cleanly. We prepare Form 5472, the pro forma Form 1120, and the Part V statement; a qualified tax accountant reviews the package; and we fax it to the IRS Ogden PIN Unit at **855-887-7737** with a timestamped receipt. The IRS instructions list that fax number for foreign-owned U.S. disregarded entities ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)).

The Standard package is **$149** and ready in 5-7 business days. Express is **$199** and ready in 3 business days. Each additional past tax year is **+$99**. IRS fax delivery is included. EIN service is **$149** at [/ein](/ein).

We are not a CPA firm and we do not give tax advice. Unusual ownership, U.S. trade or business, real estate, employees, or entity-classification elections may require a qualified tax professional.

## Frequently asked questions

### Is an owner contribution reportable on Form 5472?

Yes. The IRS instructions include contributions to a foreign-owned U.S. disregarded entity among Part V reportable transactions.

### Are payments from Stripe reportable on Form 5472?

Customer payments processed by Stripe are not automatically reportable because Stripe and the customers are ordinarily unrelated. Transfers between the LLC and its foreign owner remain reportable.

### Do I attach every receipt to Form 5472?

No. Keep evidence supporting the totals, but do not attach every invoice or bank statement unless an instruction specifically requires it. Foreign-owned disregarded entities generally attach a Part V transaction statement.

### What happens if a transaction is omitted?

The IRS treats a substantially incomplete Form 5472 as a failure to file. The stated penalty is **$25,000** (IRC Section 6038A(d); [IRS Form 5472 instructions](https://www.irs.gov/instructions/i5472)).

### Is a loan from the foreign owner reportable?

Usually yes. A loan from the owner to the LLC is a related-party movement. Keep the loan agreement, funding proof, repayment history, and interest details.

### Is a payment to an unrelated foreign contractor reportable?

Generally no, not solely because the contractor is foreign. The Form 5472 issue changes if the contractor is related to the owner or the LLC.

### Does a personally paid LLC expense count?

Usually yes. If the foreign owner paid an LLC obligation personally, include it in the related-party review even if the LLC never reimbursed the owner.

## What is the bottom line?

Form 5472 is a related-party transaction report, not a list of every LLC payment. Start with the owner, identify other related parties, total every monetary and nonmonetary transfer, and keep a clear audit trail. [Prepare your Form 5472 package](/start?utm_source=blog&utm_medium=internal&utm_campaign=form-5472-reportable-transactions-examples-close), or read the [SaaS founder guide](/blog/form-5472-saas-founders) if payment processors are making the owner-transfer trail harder to see.

*Educational content only; not tax or legal advice.*
