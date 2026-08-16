---
title: "Foreign-Owned US LLC Tax: What Non-Residents Owe"
description: "Foreign-owned US LLC tax depends on US trade or business and income sourcing, but Form 5472 filing can still apply when no federal income tax is due."
date: 2026-08-15
updated: 2026-08-15
author: "Form5472 Prep"
tags: ["form-5472", "foreign-owned-llc", "us-tax", "eci", "non-resident"]
draft: false
---

**A foreign-owned US single-member LLC pays no US federal income tax on its own — it is a disregarded entity, so its income is treated as the non-US owner's income. The owner owes US tax only on income effectively connected with a US trade or business, or on US-source FDAP income. Owing no tax does not remove the Form 5472 filing requirement, which carries a $25,000 penalty.**

This is the single most confused question in the foreign-owned LLC world, and the confusion runs in both directions. Some owners believe a US LLC is a tax-free structure with nothing to file. Others believe having a US company means paying US corporate tax on everything. Both are wrong, and the second group usually overpays while the first group gets penalized.

The two questions have to be answered separately: **do you owe US tax**, and **do you owe a US filing**. Very often the answers are no and yes. If you already know you need Form 5472, [we prepare and fax the complete package from $149](/start?utm_source=blog&utm_medium=internal&utm_campaign=does-foreign-llc-pay-us-tax).

## Does a single-member LLC pay US corporate tax?

No. A single-member LLC is by default a **disregarded entity** for US federal income tax purposes. It has no separate tax existence, files no income tax return of its own, and pays no entity-level tax. Everything it earns is treated as earned directly by its owner.

That means the question "how much tax does my LLC pay" has no answer. The real question is: **how much US tax does the owner pay on that income?** And that depends entirely on the character and source of the income — not on the fact that a US entity was involved.

Three notes before going further:

- **Multi-member LLCs are different.** Two or more owners makes the LLC a partnership by default: it files Form 1065, issues K-1s, and if it has US-effectively-connected income it must withhold under IRC § 1446. See [multi-member LLCs with foreign owners](/blog/multi-member-llc-form-5472-or-1065).
- **Electing corporate treatment is different.** If you filed Form 8832 or 2553 to be taxed as a corporation, the LLC does pay entity-level tax and files a real Form 1120 — a different regime from everything below.
- **State tax is separate.** Franchise taxes and annual report fees are owed regardless of income tax.

## When does a non-resident owner owe US income tax?

A non-resident owner owes US federal income tax in two situations.

**1. Effectively connected income (ECI).** Income from carrying on a trade or business within the United States is taxed at graduated US rates on a net basis. The owner reports it on **Form 1040-NR** (individual) or **Form 1120-F** (foreign corporation) and can deduct related expenses.

**2. US-source FDAP income.** Fixed, determinable, annual or periodical income from US sources — dividends, certain interest, rents, royalties — is generally taxed at a flat 30% on the gross amount, usually collected by withholding at source, and often reduced by an income tax treaty.

If your income is neither ECI nor US-source FDAP, there is generally no US federal income tax and no US income tax return. That is the position most internet-business owners with US LLCs are in.

## What actually makes income "effectively connected"?

This is the whole question, and it is a facts-and-circumstances test rather than a checklist. Two elements have to line up: you must be **engaged in a US trade or business**, and the income must be **effectively connected** with it.

Being engaged in a US trade or business generally requires activity in the United States that is considerable, continuous and regular. What tends to matter:

| Factor | Points toward US trade or business | Points away |
|---|---|---|
| Where you perform the work | You or your staff work physically inside the US | All work performed from your home country |
| People | US employees or dependent agents acting for you | No US personnel; independent contractors abroad |
| Fixed place of business | US office, warehouse, or leased space | None |
| Inventory | Goods stored in US warehouses and sold from them | Drop-ship or fulfilment abroad |
| Sales activity | Sales concluded by people in the US | Sales concluded online or from abroad |

What generally does **not**, by itself, create a US trade or business:

- Forming a US LLC
- Holding a US business bank account
- Having a US registered agent and a registered-agent address
- Using US payment processors such as Stripe or PayPal
- Selling to US customers over the internet
- Using a US server or SaaS vendors

That list is why so many location-independent founders with Wyoming or Delaware LLCs conclude they have no ECI — the entity is American, but the business activity is not.

Two important qualifications. First, **US-based inventory changes the analysis materially** — Amazon FBA sellers whose stock sits in US fulfilment centres are in a genuinely contested area, which is why we cover it separately in [Form 5472 for Amazon FBA sellers](/blog/amazon-fba-foreign-sellers-form-5472). Second, if you spend meaningful time working inside the US, personal services performed in the United States are the clearest case of ECI there is.

## What does a tax treaty change?

If your country of residence has an income tax treaty with the United States, the treaty's **permanent establishment** article can override the domestic ECI answer. Broadly: business profits are taxable in the US only if attributable to a permanent establishment there — a fixed place of business, or a dependent agent habitually concluding contracts.

Two practical consequences that catch people out:

1. **A treaty position is claimed, not assumed.** Relying on a treaty to exempt business profits generally means filing the relevant US return with **Form 8833** disclosing the position. Silently not filing is not the same as claiming treaty relief.
2. **Treaty relief does nothing for Form 5472.** Form 5472 is an information return under IRC § 6038A. No treaty article exempts you from it. The $25,000 penalty applies to a treaty-protected owner exactly as it applies to anyone else.

The United States has treaties with the UK, Canada, India, Germany, and many others — but notably **not** with the UAE, Hong Kong, Singapore, Brazil, or most of Africa and Southeast Asia. Owners in those places rely on the domestic ECI analysis alone.

## So why do I still have to file Form 5472?

Because Form 5472 is not a tax return. It is an **information return** that exists to give the IRS a record of transactions between a US entity and its foreign owner — regardless of whether any tax is due.

For tax years beginning on or after 1 January 2017, Treasury Regulation § 1.6038A-1 treats a foreign-owned US disregarded entity as a corporation separate from its owner **solely** for the purposes of the § 6038A reporting rules. That single regulatory change is what put every foreign-owned single-member LLC in scope.

The filing is required whenever there was at least one **reportable transaction** during the year between the LLC and its foreign owner or another foreign related party. Reportable transactions include:

- Capital you contributed to the LLC
- Distributions the LLC made to you
- Loans in either direction
- Amounts paid for goods or services between you and the LLC

**Revenue from customers is not a reportable transaction.** Money moving between you and your own LLC is.

That distinction produces the outcome that surprises people most: a completely dormant LLC that earned nothing usually still has a reportable transaction, because the owner wired money in to open the bank account. See [Form 5472 for a dormant LLC with no income](/blog/form-5472-dormant-llc-no-income).

The penalty for not filing is **$25,000 per form, per year** under IRC § 6038A(d) — confirmed in the [IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472), which also state that a substantially incomplete form counts as a failure to file, and that continued failure more than 90 days after IRS notification adds another $25,000.

Note the asymmetry that makes this regime so punishing for small businesses: the penalty is a fixed dollar amount with no relationship to income. A business with $0 of revenue and a business with $10 million of revenue face exactly the same $25,000 charge for the same missing form.

## Four scenarios, worked through

**A UK-resident consultant, Wyoming LLC, all work done from London, US clients.**
No US office, no US staff, services performed entirely outside the United States. Generally no ECI, so generally no US income tax and no Form 1040-NR. The £-to-$ transfers into the LLC and the draws back out are reportable transactions. **Form 5472 required.**

**A UAE-resident SaaS founder, Delaware LLC, servers on AWS, customers worldwide.**
Software delivered digitally, all development and support performed from Dubai. No US permanent presence. Generally no ECI. No US-UAE income tax treaty, so the domestic analysis stands on its own. **Form 5472 required.**

**An Indian-resident seller, Florida LLC, inventory in Amazon US warehouses, US customers.**
US-based inventory sold to US customers is the fact pattern most likely to be treated as a US trade or business. The India-US treaty's permanent establishment article may or may not help, depending on the details. This owner needs an actual professional determination — and **Form 5472 is required either way.**

**A German-resident owner, New Mexico LLC, no activity at all, funded with $500 in 2024, dormant since.**
No income, therefore no US income tax. The $500 contribution in 2024 was a reportable transaction. **Form 5472 required for 2024**, and for any later year with any money movement.

The pattern across all four: the tax answer varies; the filing answer does not.

## Getting the filing part right

If you concluded you owe no US income tax, that is very likely correct — and it changes nothing about Form 5472. The filing is annual, cannot be e-filed, is not supported by any consumer tax software, and carries a fixed $25,000 penalty that ignores how small your business is.

[Form5472 Prep](/) prepares the complete package — Form 5472, the pro forma Form 1120 stamped "Foreign-owned U.S. DE", and the Part V supporting statement — has it reviewed by a qualified tax accountant, and faxes it to the IRS Ogden PIN Unit, returning the timestamped confirmation as your proof of filing.

**$149** standard (5-7 business days), **$199** express (3 business days), **+$99** per additional past tax year. IRS fax delivery included. We are not a CPA firm and do not give tax advice — for an ECI or treaty determination on your specific facts, use a qualified adviser. What we do is prepare and submit the information return accurately.

[Start your filing](/start?utm_source=blog&utm_medium=internal&utm_campaign=does-foreign-llc-pay-us-tax-cta) — about 15 minutes.

## Frequently asked questions

### Do I pay US tax on my LLC's profit if I live abroad?

Generally only if the profit is effectively connected with a US trade or business, or is US-source FDAP income. Profit from services performed entirely outside the United States for a business with no US premises or personnel is generally not US-taxable to a non-resident owner.

### Is a US LLC tax-free for non-residents?

Not as a rule, and not in the sense of having no obligations. A single-member LLC pays no entity-level US tax, and many non-resident owners owe no US income tax. But Form 5472 is still required, state franchise taxes are still due, and your home country almost certainly taxes the income.

### Do I have to file Form 1040-NR if I own a US LLC?

Only if you have US-source or effectively connected income to report, or you are claiming a treaty position. Owning a US LLC alone does not create a Form 1040-NR obligation for a non-resident.

### Does my home country tax the LLC's income?

Almost always, yes. Most countries tax residents on worldwide income, and many treat a US disregarded-entity LLC as transparent, taxing the profit to you personally. A few treat it as opaque, which creates mismatches. This needs local advice in your country of residence.

### Does a tax treaty exempt me from Form 5472?

No. Form 5472 is an information return under IRC § 6038A. Treaties allocate taxing rights over income; they do not remove US information reporting obligations. The $25,000 penalty applies regardless of treaty protection.

### If I owe no US tax, why does the IRS want Form 5472?

Because the form exists to record related-party transactions so the IRS can see money moving between a US entity and its foreign owner. Its purpose is visibility, not tax collection. That is why zero-tax and zero-revenue entities are still in scope.

---

Owing no US tax is common. Owing no US filing is rare. If your LLC exists and money has moved between you and it, Form 5472 is due.

[File it here](/start?utm_source=blog&utm_medium=internal&utm_campaign=does-foreign-llc-pay-us-tax-close), or read the [full list of what a foreign-owned LLC must file](/blog/foreign-owned-llc-filing-requirements-checklist) first.
