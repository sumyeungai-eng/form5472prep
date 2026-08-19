---
title: "Form 5472 for SaaS Founders With a Foreign-Owned U.S. LLC"
description: "Non-U.S. SaaS founders may need Form 5472 even when the LLC owes no entity-level income tax. Here is what the filing reports."
date: 2026-08-10
publishAt: "2026-08-10T09:00:00-04:00"
updated: 2026-08-19
author: "Form5472 Prep"
tags: ["form-5472", "saas", "foreign-founders", "foreign-owned-llc"]
draft: false
---

**A non-U.S. SaaS founder who wholly owns a U.S. single-member LLC usually files Form 5472 with a pro forma Form 1120 when the LLC has a reportable transaction with the owner. Startup funding, founder withdrawals, owner-paid software bills, loans, reimbursements, and payments to related foreign companies can all create the filing requirement.**

SaaS founders often have clean accounting for revenue and weak accounting for owner movements. Stripe shows customers. The bank shows payouts. The founder remembers taking money out later. Form 5472 cares about the founder link, not the whole revenue chain.

The IRS instructions state that failing to file Form 5472 when due, filing it in the wrong manner, or failing to maintain required records can trigger a **$25,000** penalty under IRC Section 6038A(d) ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)). If your SaaS LLC already has its year-end owner-transfer totals, [start the filing here](/start?utm_source=blog&utm_medium=internal&utm_campaign=form-5472-saas-founders).

## Why does a SaaS LLC file Form 5472?

A SaaS LLC files Form 5472 because it is a foreign-owned U.S. disregarded entity with reportable related-party transactions. For U.S. income-tax purposes, a default single-member LLC is generally disregarded from its owner. The [IRS single-member LLC guidance](https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies) explains the default classification. For Section 6038A reporting, however, a wholly foreign-owned U.S. disregarded entity is treated as a reporting corporation and files Form 5472 when reportable transactions exist.

Form 5472 is still required when the LLC has no entity-level income-tax bill. Information reporting and income taxation are separate questions, and this guide is focused on the information-return side.

## Which SaaS transactions belong on Form 5472?

The transactions that belong on Form 5472 are the related-party movements, not ordinary subscription activity. The [IRS Form 5472 instructions](https://www.irs.gov/instructions/i5472) include contributions, distributions, formation amounts, and other Part V transactions of a foreign-owned U.S. disregarded entity. For more examples outside SaaS, see [Form 5472 reportable transactions examples](/blog/form-5472-reportable-transactions-examples).

The most common SaaS fact pattern separates into three lanes:

| Lane | Examples | Form 5472 relevance |
|---|---|---|
| Customer operations | Subscriptions, refunds, processor fees | Usually unrelated-party activity |
| Founder activity | Capital, withdrawals, founder-paid bills, reimbursements | Usually Part V reportable transactions |
| Related-company activity | Development or support bought from the founder's foreign company | Potential separate related-party reporting |

A founder who paid AWS, a registered agent, incorporation costs, design software, or contractor costs from a personal card should not ignore those payments merely because the LLC later reimbursed, or never reimbursed, the founder. The owner paid something for the LLC's benefit. That is the point Form 5472 is trying to surface.

## How does a Stripe payout differ from a founder withdrawal?

A Stripe payout and a founder withdrawal are different links in the chain. Only the founder withdrawal is usually the Form 5472 transaction when Stripe, the customers, and the bank are unrelated to the owner.

Here is an illustrative worked example, not a claimed real filing.

Assume the SaaS LLC has one month of activity:

1. Customers pay **$10,000** through Stripe.
2. Stripe processes **$600** of refunds.
3. Stripe keeps **$350** of processor fees.
4. Stripe pays **$9,050** net to the LLC's U.S. bank account.
5. The founder later transfers **$3,000** from the LLC bank account to the founder's personal foreign account.

The math is:

**$10,000 gross customer volume - $600 refunds - $350 processor fees = $9,050 net bank payout.**

That **$9,050** payout explains how revenue reached the LLC bank account. It is not usually the Form 5472 Part V item because the movement is from unrelated customers and an unrelated processor into the LLC. The processor fee is also not usually reportable because Stripe is not related merely because it is a payment platform.

The **$3,000** transfer from the LLC to the founder is different. It is money moving between the reporting entity and the foreign owner. In a simple single-owner SaaS case, that is the amount you isolate for Part V and describe as a distribution, owner draw, repayment, or other owner payment depending on the books and documents.

The reconciliation should still keep every link:

| Step | Amount | Why it matters |
|---|---:|---|
| Gross Stripe volume | **$10,000** | Supports revenue ledger, not usually Part V |
| Refunds | **$600** | Supports net revenue and cash reconciliation |
| Processor fees | **$350** | Supports bank payout reconciliation |
| Net payout to LLC bank | **$9,050** | Ties platform to bank statement |
| Owner draw | **$3,000** | Usually the reportable Part V transaction |

If the Part V statement is only for this one owner draw, the statement might say:

| Date | Related party | Transaction type | Amount | Description |
|---|---|---|---:|---|
| Month-end transfer | Foreign owner | Distribution / owner draw | **$3,000** | LLC cash transferred from U.S. bank to owner's personal account |

Do not net the founder draw against customer refunds or Stripe fees. They are different counterparties. Form 5472 is counterparty-driven.

## Do subscription sales go on Form 5472?

Subscription sales to unrelated customers generally do not go on Form 5472. Form 5472 is not a sales ledger. The important SaaS entries are the transactions between the LLC and the founder or another related party.

Revenue sourcing, effectively connected income, withholding, sales tax, and Form 1040-NR are separate issues. A founder with U.S. employees, a U.S. office, dependent agents, or other complex facts should obtain individualized tax advice.

This distinction also keeps the filing usable. A SaaS company may have thousands of subscription events, upgrades, refunds, disputes, and failed payments. The Form 5472 question is narrower: did the owner or a related entity put money in, take money out, pay an LLC bill, lend money, forgive debt, provide services, or receive a payment?

## What records should a SaaS founder collect?

A SaaS founder should collect records that prove both sides of the separation: ordinary platform activity and related-party activity. The IRS instructions require records sufficient to establish the correctness of the return and records relevant to related-party transactions ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)).

Use the SaaS year-end packet:

1. LLC bank statements for the full tax year.
2. Stripe, Paddle, PayPal, or merchant-processor balance, payout, fee, refund, and dispute exports.
3. Founder-to-LLC and LLC-to-founder transfer list.
4. Receipts for LLC bills paid personally by the founder.
5. Agreements and invoices involving related foreign companies.
6. Opening and year-end balances for related-party loans.
7. Formation and dissolution costs, if applicable.
8. Currency-conversion support for non-dollar items.

Then mark each transaction with three labels: counterparty, business reason, and Form 5472 treatment. A clean SaaS file does not ask a preparer to infer that a transfer to "Ahmed personal" was an owner draw or that a transfer from "DevCo Ltd" was a related-company loan. Label it.

## How does Form5472 Prep fit a SaaS founder's workflow?

Form5472 Prep is the answer when the SaaS business has ordinary platform activity but the filing problem is the owner and related-party schedule. We prepare Form 5472, the pro forma Form 1120, and the Part V statement; a qualified tax accountant reviews the package; and we fax it to the IRS Ogden PIN Unit at **855-887-7737** with a timestamped receipt. The IRS instructions list that fax number for foreign-owned U.S. disregarded entities ([IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472)).

The Standard package is **$149** and ready in 5-7 business days. Express is **$199** and ready in 3 business days. Each additional past tax year is **+$99**. IRS fax delivery is included. EIN service is **$149** at [/ein](/ein).

We are not a CPA firm and we do not give tax advice. For an ECI, treaty, sales-tax, or home-country tax determination on your specific SaaS facts, use a qualified adviser. What we do is prepare and submit the Form 5472 information-return package.

## Frequently asked questions

### Does a pre-revenue SaaS LLC file Form 5472?

Often yes. Startup capital, formation fees, registered-agent charges paid by the founder, or other owner-funded costs can be reportable even before the first customer.

### Do I report every Stripe subscription?

No. Unrelated customer receipts are not reported individually on Form 5472. Focus on related-party activity and keep the sales ledger for other tax and accounting purposes.

### Is a Stripe payout to the LLC reportable?

Usually no, if Stripe and the customers are unrelated to the owner. The later transfer from the LLC bank account to the foreign founder is the usual Part V issue.

### Is an ITIN required for the SaaS founder?

An ITIN is not automatically required just to file Form 5472. The LLC needs an EIN, and the foreign owner can generally use an FTIN and a consistent reference ID when required.

### What if my foreign company invoices my U.S. LLC?

A commonly controlled foreign company may be a related party. The U.S. LLC may need a separate Form 5472 for that company, and transfer-pricing questions may require specialist advice.

### Do processor fees reduce owner draws?

No. Processor fees reconcile platform cash to the bank account. Owner draws are separate transfers between the LLC and the founder, so they should not be netted against unrelated processor fees.

## What is the bottom line?

SaaS does not change the Form 5472 rule. Separate ordinary customer activity from founder and intercompany transfers, document the latter carefully, and file the information return on time. [Get the complete package prepared and faxed](/start?utm_source=blog&utm_medium=internal&utm_campaign=form-5472-saas-founders-close), or use the [reportable transactions examples](/blog/form-5472-reportable-transactions-examples) to classify edge cases first.

*Educational content only; not tax or legal advice.*
