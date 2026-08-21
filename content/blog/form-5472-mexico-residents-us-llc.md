---
title: "Form 5472 for Mexico Residents With a US LLC"
description: "Mexico residents with US LLCs usually file Form 5472 using an RFC as the FTIN. See treaty, transaction, conversion and deadline rules."
date: 2026-08-19
updated: 2026-08-19
author: "Form5472 Prep"
tags: ["form-5472", "mexico", "foreign-owned-llc", "rfc", "ftin"]
draft: false
---

**A Mexico resident who owns a US single-member LLC generally files Form 5472 with a pro forma Form 1120 whenever the LLC has a reportable transaction with its owner or another related party. Enter the owner's RFC as the FTIN, and treat Mexican income-tax classification and treaty eligibility as separate questions.**

This is the English guide for the search *residente en México LLC Estados Unidos Form 5472*. It applies to consultants, ecommerce operators, and investors who use a single-member LLC formed in a US state while living in Mexico.

The filing is driven by related-party transactions, not by whether the LLC showed a profit. Formation funding or an owner-paid expense can create the obligation before the first sale. To have the federal package prepared and faxed, [start a Mexico Form 5472 filing](/start?utm_source=blog&utm_medium=internal&utm_campaign=form-5472-mexico-residents-us-llc).

## When must a Mexico resident file Form 5472?

A Mexico-owned LLC generally files when three facts align: it is a US disregarded entity, its sole owner is a foreign person for US tax purposes, and it had a reportable transaction with the owner or another related party during the tax year.

Apply the test in order:

1. **Confirm the US classification.** A single-member LLC is normally disregarded unless it elected another federal tax status.
2. **Confirm the owner's US status.** Mexican residence alone is not decisive; verify that the owner is not a US citizen, green-card holder, or US tax resident.
3. **Review every related-party movement.** Include contributions, distributions, loans, owner-paid expenses, services, property, and transactions with another business controlled by the owner.

The return consists of Form 5472 attached to a pro forma Form 1120. It is an information package, not a calculation of Mexican or US income tax.

The [IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472) put the failure-to-file penalty at **$25,000 per form, per year** under IRC §6038A(d). A substantially incomplete form is treated as unfiled. After an IRS notice, an additional $25,000 applies for every 30-day period, or fraction, continuing after the 90-day response period (IRC §6038A(d)(2)).

## Which transactions belong on the form?

Report value moving between the LLC and a foreign related party; do not turn the form into a copy of the LLC's profit-and-loss statement.

| LLC event | Form 5472 result | Usual reporting path |
|---|---|---|
| Owner sends MXN to fund the US account | Reportable contribution | Part V statement |
| LLC sends cash to the owner's Mexican account | Reportable distribution | Part V statement |
| Owner lends funds to the LLC | Reportable borrowing | Part IV loan category |
| Owner pays an LLC invoice personally | Reportable owner-funded amount | Part V statement |
| Unrelated customer buys from the LLC | Not an owner transaction | Business records only |
| LLC pays an unrelated supplier | Not related-party activity | Business records only |
| LLC pays the owner's Mexican company | Reportable with that company | Separate Form 5472 for the related party |

Record contributions and distributions separately. Gross related-party activity cannot be replaced by the net change in the owner's balance. A Stripe payout from unrelated shoppers is customer revenue; a later bank transfer from the LLC to the owner is a distribution. Our [Stripe, PayPal, and Wise guide](/blog/stripe-paypal-wise-form-5472) explains the account-ownership distinction.

## What identifier goes in Part II for a Mexican owner?

Enter the Registro Federal de Contribuyentes, or RFC, as the foreign taxpayer identification number on line 4b(3). Use the RFC belonging to the person or entity identified as the foreign owner.

The [OECD TIN portal](https://www.oecd.org/en/topics/sub-issues/tax-identification-numbers.html) identifies the RFC as Mexico's TIN. Its Mexico material describes an individual RFC as 13 characters and an entity RFC as 12 characters. Do not use a CURP in place of an RFC, and do not enter the LLC's EIN as the owner's foreign identifier.

| Part II line | Mexican individual entry | Required handling |
|---|---|---|
| 4b(1) | Existing SSN or ITIN, if any | Leave blank when the owner has no US identifying number |
| 4b(2) | LLC-assigned alphanumeric reference ID | Required if 4b(1) is blank; reuse it every year |
| 4b(3) | Owner's RFC | If the owner has no FTIN, enter "None" or "N/A"; never leave it blank |
| 4a | Owner's name and actual address in Mexico | Do not use the LLC's US registered-agent address |

Providing the RFC does not remove the line 4b(2) requirement. When no US TIN appears on line 4b(1), the LLC must also assign a reference ID and use that same identifier in every filing year. An owner does not need an ITIN solely for Form 5472.

## Does the US-Mexico treaty remove the filing requirement?

No. Mexico appears on the [IRS income tax treaty A-to-Z list](https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z), confirming that a US-Mexico income tax treaty is in force. The treaty may affect the income-tax treatment of a qualifying resident and item of income, but it does not exempt a foreign-owned LLC from Form 5472.

Treaty entitlement requires its own factual analysis. The place of services, US inventory, real property, personnel, fixed places of business, and the owner's eligibility can matter. None of those issues is decided merely by attaching Form 5472.

Mexican law is also separate from the US disregarded-entity label. SAT maintains an information-return system for foreign entities subject to REFIPRE, as confirmed in its [official filing-platform announcement](https://www.gob.mx/sat/prensa/sat-implementa-nuevo-aplicativo-para-la-presentacion-de-declaraciones-informativas-066-2024). Mexico also has rules for foreign transparent entities. A Mexican adviser should determine the LLC's local classification, income inclusion, REFIPRE position, and reporting; do not assume US tax treatment carries across the border.

## How should MXN transactions be converted to US dollars?

Convert reportable transactions to US dollars with a reasonable, consistently applied method and attach a schedule showing each exchange rate used. Keep the bank or platform evidence supporting the transaction-date rate.

The following is an **illustrative workpaper**, not a statement of a historical market rate. Assume the owner's records show MXN 18 per USD on each example date:

| Illustrative transaction | MXN amount | Arithmetic | USD amount |
|---|---:|---|---:|
| Capital contribution | MXN 36,000 | 36,000 ÷ 18 | USD 2,000 |
| Distribution to owner | MXN 9,000 | 9,000 ÷ 18 | USD 500 |
| Owner-paid expense | MXN 1,800 | 1,800 ÷ 18 | USD 100 |
| Gross related-party value |  | 2,000 + 500 + 100 | USD 2,600 |

The Part V statement would show all three movements separately, with their dates, direction, rate basis, and dollar amounts. The USD 2,600 gross value supports line 1f for that related party. It is neither business profit nor the net cash transferred.

## How do four common Mexico scenarios work?

Four scenarios, worked through, show how the filing follows transactions rather than business labels.

**1. A cross-border ecommerce seller uses US fulfilment.** Unrelated customer receipts and supplier costs are ordinary business activity. Owner funding and withdrawals are reportable. Inventory stored in the United States can raise separate federal and state tax issues, so the seller should not use a clean Form 5472 filing as proof that no tax return is due.

**2. A consultant works from Mexico.** Client payments to the LLC are revenue, not owner transactions. Transfers from the LLC to the consultant's personal Mexican account are reportable distributions. The place where services are performed matters to the separate source and treaty analysis.

**3. A US LLC holds real estate.** Cash the Mexican owner contributes for a deposit, purchase, mortgage cost, or repair is reportable even before the property earns rent. Rental income, deductions, withholding, and a later sale belong to separate US tax analyses and may require other returns; a real-estate tax adviser should review them.

**4. A dormant LLC had no revenue.** Formation funding, a bank deposit, a registered-agent fee paid personally, or a final withdrawal can still trigger Form 5472. If the LLC truly had no reportable transaction with any related party, it may not have a filing for that year; verify the ledger rather than relying on the word "dormant."

## How does a Mexico owner prepare and deliver the filing?

The foreign-owned US disregarded entity must fax or mail the package to the dedicated IRS Ogden PIN Unit; it cannot e-file Form 5472.

1. **Collect the complete ledger.** Gather US and Mexican bank records, card statements, processor exports, contracts, and owner-paid receipts.
2. **Identify every related party.** Separate the owner and controlled businesses from unrelated customers, suppliers, banks, and platforms.
3. **Prepare the pro forma Form 1120.** Complete the limited identifying items, sign the return, and write **"Foreign-owned U.S. DE"** across the top.
4. **Prepare one Form 5472 for each transacting related party.** Enter the correct RFC and the line 4b(2) reference ID whenever line 4b(1) has no US TIN.
5. **Attach Part V and currency schedules.** State dates, descriptions, directions, MXN amounts, exchange-rate bases, and USD results without netting opposite flows.
6. **Fax at 300 DPI or higher to 855-887-7737, or mail the package.** The address is Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201.
7. **Preserve proof.** Keep the exact signed package, supporting records, and timestamped fax receipt or mailing evidence.

The 2025 package for a calendar-year LLC was due **15 April 2026**. A Form 7004 faxed or mailed to the same PIN Unit by the regular due date extended Form 5472 to **15 October 2026**. See our [deadline guide](/blog/form-5472-deadline-2026) for the extension sequence.

US-formed LLCs have been exempt from FinCEN BOI reporting since the interim final rule effective 26 March 2025. The BOI exemption does not cancel Form 5472 or replace state, federal income-tax, real-estate, sales-tax, or Mexican obligations.

## What should a Mexico owner do after a missed filing?

Prepare the missing return promptly and consider whether the facts support a reasonable-cause statement under Treasury Regulation §1.6038A-4(b). Relief is decided on the evidence and is not automatic. A useful statement gives a truthful timeline, identifies the cause, documents corrective steps, and explains safeguards against recurrence.

Each missing form and year has its own $25,000 exposure. If the IRS has issued a notice, the continuation-penalty timetable makes delay more dangerous. Our [late Form 5472 guide](/blog/form-5472-filed-late-never-filed) sets out the catch-up workflow, but penalty and income-tax questions should go to a qualified adviser.

## How can Form5472 Prep handle the Mexico filing?

Form5472 Prep prepares Form 5472, the pro forma Form 1120, and the Part V supporting statement. A qualified tax accountant reviews the package, and we fax it to the IRS Ogden PIN Unit with a timestamped confirmation receipt returned to you.

Standard filing is **$149** and is ready in **5-7 business days**. Express filing is **$199** and is ready in **3 business days**. Each additional past tax year is **+$99**. IRS fax delivery is included.

We are not a CPA firm and do not give tax advice. We prepare and submit the US information return; US-Mexico treaty positions, federal or state tax, real-estate filings, and Mexican classification require the appropriate adviser.

## Frequently asked questions

### Does a Mexico resident need Form 5472 for a US LLC?

Yes, when a foreign-owned US single-member LLC has a reportable transaction with its owner or another related party. Contributions, distributions, loans, and owner-paid costs commonly create the filing obligation.

### What Mexican FTIN goes on Form 5472?

Enter the owner's RFC on Part II line 4b(3). If the owner genuinely has no FTIN, enter "None" or "N/A" instead of leaving the block blank.

### Do I need a reference ID if I enter my RFC?

Yes, when no US identifying number appears on line 4b(1). Assign an alphanumeric reference ID on line 4b(2), use it alongside the RFC, and keep it consistent every year.

### Does the US-Mexico treaty eliminate Form 5472?

No. The treaty can affect income-tax treatment for qualifying residents and income, but it does not waive the LLC's related-party information return. Form 5472 depends on ownership and transactions.

### Is Stripe revenue reported on Form 5472?

Ordinary payments from unrelated customers are not owner transactions. A later transfer from the LLC to the owner's Mexican account is a reportable distribution, regardless of whether Stripe originally collected the sale.

### Does a dormant Mexico-owned LLC still file?

Often, because formation money, owner-paid fees, bank funding, and closing transfers are reportable. No revenue does not mean no transaction. Review the complete related-party ledger before deciding.

### Can a foreign-owned US LLC e-file Form 5472?

No. A foreign-owned US disregarded entity must fax or mail Form 5472 with a pro forma Form 1120 to the IRS Ogden PIN Unit.

---

For a Mexico owner, the RFC, gross related-party ledger, and separate treaty and Mexican-law analyses keep the filing in the right lane. [Start your Mexico Form 5472 package](/start?utm_source=blog&utm_medium=internal&utm_campaign=form-5472-mexico-residents-us-llc-close), or read [what Form 5472 is](/blog/what-is-form-5472) first.
