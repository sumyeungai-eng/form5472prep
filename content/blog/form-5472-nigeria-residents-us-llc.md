---
title: "Form 5472 for Nigeria Residents With a US LLC"
description: "Nigeria owners may need Form 5472 even without US tax. Learn the Nigerian Tax ID, no-treaty position, payout tracing, and NGN conversion."
date: 2026-08-28
updated: 2026-08-28
author: "Form5472 Prep"
tags: ["form-5472", "nigeria", "foreign-owned-llc", "tax-id", "freelancers"]
draft: false
---

**A Nigeria resident who wholly owns a US single-member LLC generally files Form 5472 with a pro forma Form 1120 when the LLC transacts with the owner or another foreign related party. Use the owner’s Nigerian Tax ID as the FTIN, trace Payoneer, Grey, Wise, and bank payouts by counterparty, and convert reportable NGN movements to US dollars.**

The payment platform is not the reporting category. A client payment routed through Payoneer can remain ordinary revenue, while a transfer from the LLC to the owner through the same platform can be a reportable distribution. The classification follows who paid whom and why.

The [IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472) state that failure to file can trigger a **$25,000 penalty per form, per year**. If agency income and owner withdrawals are mixed in one payout history, [start a reviewed filing](/start?utm_source=blog&utm_medium=internal&utm_campaign=form-5472-nigeria-residents-us-llc) before using the net cash received in Nigeria as the Form 5472 total.

## When does a Nigeria resident’s US LLC file Form 5472?

A Nigeria owner generally has this filing when a US single-member LLC is wholly owned by a foreign person, treated as a disregarded entity for federal tax purposes, and had a transaction with the owner or another foreign related party.

Reportable movements commonly include formation funding, later contributions, owner draws, loans, owner-paid expenses, reimbursements, and payments to a Nigerian company under common ownership. The LLC’s unrelated customer receipts and vendor costs are not automatically included.

| Payout-chain event | Typical Form 5472 treatment | Record to keep |
|---|---|---|
| US client pays the LLC for agency work | Customer revenue; not an owner transaction | Contract, invoice, platform receipt |
| Platform settles that client payment to LLC bank | Settlement of revenue; not a new owner transaction | Payout reconciliation |
| Owner adds money to cover an LLC bill | Contribution or loan; reportable | Both account statements |
| LLC sends money to owner’s Nigerian account | Distribution, repayment, or other owner payment; reportable | Transfer and owner ledger |
| LLC pays owner’s Nigerian company | Foreign related-party payment | Contract, invoice, separate schedule |

One client payment can generate several rows: gross invoice, platform charge, currency conversion, USD settlement, and NGN transfer. That chain is not five Form 5472 transactions. Reconcile it first, then isolate the points where value crossed between the LLC and a related party.

## What Nigerian Tax ID goes in the FTIN field?

Enter the actual Tax ID assigned to the person or company identified as the foreign owner. Nigeria’s tax-identification system changed for 2026: the [Joint Revenue Board’s official Tax ID announcement](https://www.jtb.gov.ng/media-center/taxpayers-hail-new-tax-id-portal) says the central portal launched on 1 January 2026 and enables individuals to retrieve a unique 13-digit Tax ID using their National Identity Number, while businesses retrieve theirs using designated registration numbers.

That current identifier belongs on line 4b(3) as the FTIN. Do not enter the NIN itself unless it is also the Tax ID actually issued or retrieved for the owner. Do not enter the LLC’s EIN or a Nigerian company’s Tax ID on a form that identifies the individual owner.

| Form 5472 field | Nigeria-resident individual owner |
|---|---|
| Line 4b(1) | Existing US identifying number, if any |
| Line 4b(2) | LLC-created reference ID if line 4b(1) is blank |
| Line 4b(3) | Owner’s Nigerian Tax ID |
| Owner address | Actual Nigerian address, not the US registered agent |

The reference ID and Nigerian Tax ID serve different purposes. When line 4b(1) has no US identifying number, the IRS instructions require a reference ID on line 4b(2). Use only letters and numbers, keep it within the IRS length limit, and reuse the same ID for the same owner every year.

If an owner genuinely has no FTIN, enter “None” or “N/A” in the FTIN block rather than leaving it blank. Because Nigeria now provides a retrieval route, confirm the owner’s current Tax ID before relying on that exception.

## Is there a US–Nigeria income tax treaty?

No. Nigeria does not appear on the [IRS income-tax-treaty A-to-Z page](https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z), so there is no US–Nigeria income tax treaty in force. A Nigeria resident cannot rely on treaty permanent-establishment protection or a treaty rate that does not exist.

No treaty does not mean that every Nigerian-owned LLC owes US federal income tax. The owner still applies US domestic rules. Services physically performed in Lagos, Abuja, Port Harcourt, or elsewhere outside the United States can produce a different answer from goods held in US warehouses or work performed through US people or premises.

Separate the questions:

1. **US income tax:** Determine where work happens, where inventory sits, and whether there are US employees, premises, or an attributable agent.
2. **Form 5472:** Identify value moving between the LLC and the owner or another foreign related party, even if the income-tax answer is zero.

Nigeria’s own taxation and business-registration rules are a home-country matter. A Nigerian adviser should decide how the US LLC and its profit are treated locally; the lack of a US treaty does not answer that question.

## How should Payoneer, Grey, Wise, and bank payouts be traced?

Trace the economic origin rather than treating every payout as a new category. Payoneer, Grey, Wise, and banks can sit between a customer, the LLC, and the owner. Their statements are evidence of movement, but the platform name does not decide whether the counterparty is related.

Wise’s [official NGN transfer guide](https://wise.com/help/articles/2jVJxXsvpfBLkvb6RpOGk5/guide-to-ngn-transfers) confirms that NGN can be sent to personal and business bank accounts in Nigeria. Do not generalise that source into a claim that every Wise feature is available to every Nigerian user. Product access changes; use the actual statements from the service the business used.

Apply this payout-chain procedure:

1. Export client invoices and the platform’s transaction-level history.
2. Reconcile gross client receipts to fees, conversions, and the amount settled to the LLC.
3. Identify the legal account holder at each stage: LLC, owner, or Nigerian company.
4. Mark every transfer where value crosses between the LLC and a related party.
5. Record the original currency, date, purpose, direction, and destination.
6. Convert reportable non-USD amounts under a documented, consistent method.
7. Group each related party separately and tie the totals to Form 5472.

Separating the two ledgers prevents a common double count: reporting both the client receipt and the later processor settlement, then reporting the owner draw a third time. Usually only the final transfer from LLC value to the owner is the related-party movement in that chain.

## How does an NGN conversion example work?

Keep gross inflows and outflows separate and show the arithmetic. The original-element example below uses invented figures and rates only to demonstrate the workpaper; it is not a current foreign-exchange quote or market statistic.

Assume the owner contributes NGN at an illustrative rate of NGN 1,500 per USD, later receives a draw at NGN 1,600 per USD, and personally pays an LLC bill when the illustrative rate is NGN 1,550 per USD.

| Related-party movement | Original amount | Illustrative arithmetic | USD workpaper amount |
|---|---:|---:|---:|
| Owner contribution | NGN 15,000,000 | 15,000,000 ÷ 1,500 | USD 10,000 |
| LLC draw to owner | NGN 8,000,000 | 8,000,000 ÷ 1,600 | USD 5,000 |
| Owner-paid LLC bill | NGN 775,000 | 775,000 ÷ 1,550 | USD 500 |

The workpaper preserves USD 10,000 received, USD 5,000 paid, and USD 500 of owner-funded cost. It does not report a single net USD 5,500. Keep the rate source captured for each real transaction and explain any annual method applied consistently.

## What do four Nigeria-owner scenarios look like?

Four scenarios, worked through, show why a payout export is only the beginning of the analysis.

### Scenario 1: Freelancer or agency working from Nigeria

The owner and team perform all design, development, or marketing work from Nigeria. Clients pay the US LLC through a platform or bank. Customer receipts generally stay off Form 5472; owner funding, draws, loans, and reimbursements remain reportable. With no treaty, any US income-tax conclusion rests on domestic sourcing and business-presence rules.

### Scenario 2: Ecommerce with US inventory

The LLC stores products in US fulfilment centres and sells to US customers. Those sales are not owner transactions, but the US inventory can materially change federal and state tax analysis. The owner’s contributions and distributions still belong in the Form 5472 workpaper.

### Scenario 3: A dormant LLC

The LLC earned nothing, yet the owner funded the account and paid a renewal cost personally. Both movements can be reportable. “No clients” is not the same as “no transactions with the owner.”

### Scenario 4: The LLC pays the owner’s Nigerian company

The individual also owns a Nigerian agency, and the US LLC pays it for staff or subcontracting. That company is a separate foreign related party. Do not combine its invoices with the individual’s draws; build a separate schedule and test a second Form 5472.

## How is the 2025 package filed in 2026?

The 2025 calendar-year package was due **15 April 2026**, or **15 October 2026** after a timely Form 7004 extension. It includes the pro forma Form 1120, one Form 5472 for each reportable foreign related party, and a Part V statement where required.

Write “Foreign-owned U.S. DE” across the top of the pro forma Form 1120. The IRS says a foreign-owned US disregarded entity cannot e-file this package. Fax it at **300 DPI or higher** to **855-887-7737**, or mail it to the dedicated Ogden PIN Unit address in the current instructions. Retain the signed package, payout reconciliation, conversion workpapers, and timestamped delivery receipt.

A substantially incomplete return counts as a failure to file. After 90 days from IRS notice, a continuing failure can add **$25,000 for each 30-day period or fraction** under IRC §6038A(d)(2).

## How can Form5472 Prep handle a Nigeria-owner filing?

Form5472 Prep prepares Form 5472, the pro forma Form 1120, and the Part V statement from the related-party ledger. A qualified tax accountant reviews the package, and we fax it to the IRS Ogden PIN Unit with a timestamped receipt.

Standard is **$149** and ready in **5-7 business days**. Express is **$199** and ready in **3 business days**. Each additional past tax year is **+$99**, and fax delivery is included. EIN service is **$149** at [/ein](/ein).

We are not a CPA firm and do not give tax advice. We prepare and submit the US information return; US income tax and Nigerian tax treatment require the appropriate advisers.

## Frequently asked questions

### Do Nigeria residents file Form 5472 for a US LLC?

They generally do when a foreign-owned US disregarded LLC transacts with its owner or another foreign related party. Funding, withdrawals, loans, reimbursements, and related-company payments are common triggers.

### What Nigerian number is the FTIN?

Use the owner’s current Nigerian Tax ID, not merely the NIN used to retrieve it. The identifier must belong to the individual or company named on that Form 5472.

### Is there a US–Nigeria income tax treaty?

No. Nigeria is not on the IRS list of US income-tax treaties in force. US income-tax analysis therefore depends on domestic rules rather than treaty permanent-establishment protection.

### Are Payoneer or Grey receipts reportable?

Not merely because of the platform. A client receipt is generally customer revenue; a later transfer of LLC value to the owner can be a reportable distribution. Trace the counterparty and purpose.

### Can Wise send NGN to Nigeria?

Wise’s official guide says NGN transfers can go to personal and business bank accounts in Nigeria. Check current feature access for the actual account and keep the resulting transfer statement.

### Does a dormant Nigeria-owned LLC still file?

It can. Opening funding, owner-paid costs, or money returned to the owner can create reportable transactions even when the LLC has no revenue.

### Can I report only the net amount received in naira?

No. Reconcile the payout chain and preserve gross related-party movements by direction. Customer revenue, platform settlement, and owner withdrawal are not interchangeable categories.

---

For a Nigerian owner, the strongest filing trail connects the current Tax ID to a reconciled payout chain and gross owner movements. [Prepare and fax the Form 5472 package](/start?utm_source=blog&utm_medium=internal&utm_campaign=form-5472-nigeria-residents-us-llc-close), or review [Stripe, PayPal, and Wise Form 5472 treatment](/blog/stripe-paypal-wise-form-5472) before classifying transfers.
