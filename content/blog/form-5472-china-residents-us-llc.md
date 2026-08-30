---
title: "Form 5472 for China Residents With a US LLC"
description: "Mainland China owners may need Form 5472 for a US LLC. Learn the Chinese TIN, treaty position, RMB conversion, and reportable transfers."
date: 2026-08-28
updated: 2026-08-28
author: "Form5472 Prep"
tags: ["form-5472", "china", "foreign-owned-llc", "ftin", "us-china-tax-treaty"]
draft: false
---

**A mainland China resident who wholly owns a US single-member LLC generally files Form 5472 with a pro forma Form 1120 when the LLC transacts with the owner or another foreign related party. Use the owner’s Chinese TIN, convert RMB transactions to US dollars, and keep the filing separate from any US–China treaty analysis.**

The common mistake is to treat every dollar entering a US account as reportable. Form 5472 does not duplicate the LLC’s sales ledger. It focuses on money, property, or services exchanged with the foreign owner and other related parties: formation funding, later contributions, draws, loans, reimbursements, and payments to an owner-controlled Chinese company.

The [IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472) state that failure to file can trigger a **$25,000 penalty per form, per year**. If reconstructing RMB owner movements is the difficult part, [start a reviewed filing](/start?utm_source=blog&utm_medium=internal&utm_campaign=form-5472-china-residents-us-llc) before treating zero US tax as zero US filing.

## When does a China resident’s US LLC file Form 5472?

A mainland China owner’s filing duty usually turns on the entity and its transactions, not the owner’s nationality. This guide covers a US single-member LLC wholly owned by a non-US person and treated as a foreign-owned US disregarded entity for federal tax purposes.

Form 5472 is generally required when that LLC had at least one reportable transaction with its owner or another foreign related party during the tax year. Contributions and distributions are included, as are amounts connected with formation, dissolution, acquisition, or disposition. An LLC can therefore have a filing duty before making its first sale.

| Money movement | Typical treatment | Evidence to retain |
|---|---|---|
| Chinese customer pays an invoice | Ordinary customer revenue; not an owner transaction | Invoice and processor statement |
| Owner wires RMB-funded cash into the LLC | Contribution or loan; reportable | Chinese and US bank records |
| LLC sends money to the owner | Distribution, repayment, or other owner payment; reportable | Transfer receipt and owner ledger |
| Owner pays an LLC bill personally | Owner-funded expense; reportable | Vendor invoice and personal payment proof |
| LLC pays the owner’s Chinese company | Foreign related-party transaction; separate analysis | Contract, invoice, and payment record |

Classify the counterparty first and the payment rail second. A transfer through Stripe, PayPal, Wise, or a bank does not become reportable merely because the provider is American or the balance is denominated in US dollars.

## What Chinese TIN belongs in Part II?

For a mainland Chinese individual using a Chinese identity card, the TIN is the identity-card number. The [OECD’s China TIN profile](https://www.oecd.org/tax/automatic-exchange/crs-implementation-and-assistance/tax-identification-numbers/china-tin.pdf) says that this number consists of 18 characters. Individuals identified through a passport or another document can follow a different issuance pattern, so use the actual tax identifier assigned to that owner rather than copying another person’s format.

| Form 5472 field | Entry for an individual owner in mainland China |
|---|---|
| Line 4b(1) | Existing US identifying number, if the owner has one |
| Line 4b(2) | LLC-created reference ID when line 4b(1) is blank |
| Line 4b(3) | Owner’s Chinese TIN |
| Owner address | Actual mainland China address, not the US registered agent |

The reference ID and Chinese TIN are different entries. When no US identifying number appears on line 4b(1), the IRS instructions require a reference ID on line 4b(2). It must be alphanumeric, contain no spaces or special characters, and remain consistent for that owner from year to year.

If the owner genuinely has no FTIN, enter “None” or “N/A” in the FTIN block; do not leave it blank. That exception should not be used merely because the TIN is inconvenient to locate. A mainland identity-card holder normally has the identifier described by the OECD profile.

Hong Kong and Macau residents should not use the mainland analysis automatically. The US treaty list treats those jurisdictions separately; Hong Kong readers should use the [Form 5472 guide for Hong Kong residents](/blog/form-5472-hong-kong-residents-us-llc).

## Does the US–China treaty remove the filing?

No. The [IRS income-tax-treaty A-to-Z page](https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z) lists China, confirming that a US–China income tax treaty exists. The list does not extend that treaty to Hong Kong or Macau. Treaty residence follows the owner, not the LLC’s state of formation.

The treaty can matter to an income-tax position, but Form 5472 is a separate information return. A treaty claim does not erase related-party reporting. Treaty relief also is not automatic: the owner must establish eligibility and claim the position through the appropriate return and disclosure where required.

Keep two questions separate:

1. **Does the owner owe US income tax?** Services performed entirely in Shenzhen or another mainland location may be foreign-source, while US inventory, US personnel, a US office, or work physically performed in the United States can change the analysis.
2. **Must the LLC file Form 5472?** Owner funding, draws, loans, reimbursements, and related-company payments can require the information return even when no US federal income tax is due.

A China tax adviser should review the Chinese treatment of the LLC and its profit. The US treaty conclusion alone does not answer mainland tax, foreign-asset reporting, or business-registration questions.

## How should RMB transactions be converted to US dollars?

Convert reportable transactions individually or under a documented, consistently applied method that produces supportable US-dollar amounts. Do not convert only the year-end net cash movement; Form 5472 distinguishes amounts paid from amounts received.

Use this RMB-to-USD evidence bridge:

1. Export every LLC bank, processor, and card statement for the tax year.
2. Mark transfers involving the owner or a company the owner controls.
3. Identify the original CNY/RMB amount, date, direction, and business purpose.
4. Select and preserve the exchange-rate source used for that transaction or consistent accounting method.
5. Calculate the USD amount and keep the arithmetic in a workpaper.
6. Group transactions by related party and reporting category without netting opposite directions.
7. Tie the totals to Part IV or the Part V attachment and retain the source documents.

Illustrative example only: assume a documented workpaper rate of CNY 7.20 per USD on the contribution date and CNY 7.25 per USD on the draw date. These are invented example rates, not market quotations.

| Transaction | Original amount | Illustrative arithmetic | Workpaper amount |
|---|---:|---:|---:|
| Owner contribution | CNY 72,000 | 72,000 ÷ 7.20 | USD 10,000 |
| Owner draw | CNY 36,250 | 36,250 ÷ 7.25 | USD 5,000 |
| Owner-paid LLC cost | CNY 3,600 | 3,600 ÷ 7.20 | USD 500 |

The contribution, draw, and owner-paid cost remain separate. Do not report a net USD 5,500 and discard the directions. The Part V statement should explain what moved, when, with whom, and how the conversion was made.

China’s [State Administration of Foreign Exchange describes](https://www.safe.gov.cn/en/2007/0105/819.html) bank administration and verification of individual foreign-exchange transactions. Without giving a view on Chinese exchange-control law, the practical lesson is simple: preserve the transfer purpose, invoices, contracts, and both sides of the bank trail. A US workpaper does not replace records a Chinese bank or adviser may request.

## What do four China-owner scenarios look like?

Four scenarios, worked through, show why business model and counterparty matter more than the payment app.

### Scenario 1: Cross-border ecommerce with US inventory

The LLC buys goods and stores inventory in US fulfilment centres. Customer sales are not owner transactions, but US inventory can materially change the US trade-or-business and income-tax analysis. Owner contributions and draws still go on the related-party schedule. The owner needs separate advice on US income tax and state obligations.

### Scenario 2: Digital services performed from Shenzhen

The owner performs design, software, or agency work entirely from Shenzhen with no US office or personnel. US clients pay the LLC. Customer revenue generally stays off Form 5472; transfers between the LLC and owner remain reportable. The services location supports a different income-tax analysis from the ecommerce inventory scenario.

### Scenario 3: A dormant LLC

The LLC has no customers and no revenue, but the owner funded its account and paid a software bill personally. Both are owner transactions. “Dormant” describes operating activity, not the absence of reportable transactions, so the LLC can still need the filing.

### Scenario 4: The LLC pays the owner’s Chinese company

The individual owns both the US LLC and a mainland Chinese company. The LLC pays the company for sourcing, development, or management. The Chinese company is a second foreign related party and may require its own Form 5472. Keep its invoices separate from the individual owner’s draws and funding.

## How is the 2025 filing package submitted in 2026?

A calendar-year foreign-owned US disregarded entity filed its 2025 package by **15 April 2026**, or by **15 October 2026** after a timely Form 7004 extension. The package consists of a pro forma Form 1120, Form 5472 for each foreign related party, and any required Part V statement.

Write “Foreign-owned U.S. DE” across the top of the pro forma Form 1120. The IRS instructions say the LLC cannot e-file this package. Fax it at **300 DPI or higher** to **855-887-7737**, or use the dedicated Ogden PIN Unit mailing address in the current instructions. Keep the signed copy, conversion workpapers, and timestamped delivery evidence.

A substantially incomplete form counts as failure to file. If a failure continues beyond 90 days after IRS notice, IRC §6038A(d)(2) adds **$25,000 for each 30-day period or fraction** during which the failure continues after that window.

## How can Form5472 Prep handle a China-owner filing?

Form5472 Prep prepares Form 5472, the pro forma Form 1120, and the Part V statement from the LLC’s related-party records. A qualified tax accountant reviews the package, and we fax it to the IRS Ogden PIN Unit with a timestamped receipt.

Standard is **$149** and ready in **5-7 business days**. Express is **$199** and ready in **3 business days**. Each additional past tax year is **+$99**, and fax delivery is included. EIN service is **$149** at [/ein](/ein).

We are not a CPA firm and do not give tax advice. We prepare and submit the US information return; US income-tax positions, treaty claims, and mainland China obligations need the appropriate adviser.

## Frequently asked questions

### Do China residents file Form 5472 for a US LLC?

They generally do when a foreign-owned US disregarded LLC has a reportable transaction with its owner or another foreign related party. Contributions, draws, loans, reimbursements, and related-company payments are common triggers.

### What Chinese TIN goes on Form 5472?

For a mainland Chinese individual using a Chinese identity card, the TIN is normally that 18-character identity-card number. Use the owner’s actual assigned identifier and enter it on line 4b(3).

### Does the US–China treaty cancel Form 5472?

No. The treaty can affect income taxation, but Form 5472 is a separate information return. Any treaty position must be evaluated and claimed through the proper tax filing.

### Does the China treaty cover Hong Kong or Macau?

No. The IRS treaty list treats China separately and does not list Hong Kong or Macau under the treaty. Hong Kong owners should use the dedicated Hong Kong guide.

### Are US customer payments reported on Form 5472?

Not merely because the customers are American. Ordinary unrelated-customer revenue is different from transactions with the foreign owner or another related party.

### Does a dormant China-owned LLC still file?

It can. Formation funding, owner-paid expenses, a bank top-up, or a later refund to the owner can create reportable transactions even when the LLC has no sales.

### Can RMB contributions and withdrawals be netted?

No. Preserve direction and gross amounts. Convert each movement under a documented method, then report contributions and distributions in their proper categories rather than one unexplained net figure.

---

For a mainland China owner, the clean filing starts with the Chinese TIN and a complete RMB owner-movement ledger. [Prepare and fax the Form 5472 package](/start?utm_source=blog&utm_medium=internal&utm_campaign=form-5472-china-residents-us-llc-close), or review [owner loans, contributions, and reimbursements](/blog/form-5472-owner-loans-contributions-reimbursements) before reconciling the year.
