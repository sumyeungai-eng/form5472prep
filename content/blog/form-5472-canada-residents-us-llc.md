---
title: "Form 5472 for Canada Residents Who Own a US LLC: What You Need to File"
description: "If you're based in Canada and own a US single-member LLC, the IRS requires you to file Form 5472 every year — even with zero revenue. Here's the complete guide including your SIN as the FTIN."
date: 2026-06-19
author: "Form5472 Prep"
tags: ["form-5472", "canada-residents", "foreign-owned-llc", "disregarded-entity"]
readingMinutes: 7
draft: false
---

If you're based in Canada and own a US single-member LLC — whether it's a Delaware, Wyoming, or any other state entity — the IRS almost certainly requires you to file **Form 5472** every year. This is not an income tax return. You don't pay US federal income tax on your business profits simply because you own a US LLC. But you do have an **information return** filing obligation, and the penalty for missing it is **$25,000 per form, per year** under IRC §6038A(d).

This guide covers what's specific to Canadian residents: what Form 5472 requires from you, what your Social Insurance Number has to do with it, whether the Canada-US tax treaty eliminates the obligation (it doesn't), and what counts as a reportable transaction when you're funding a US business from a Canadian bank account.

---

## TL;DR — What Canadian LLC Owners Need to Know

- **You must file Form 5472** attached to a pro forma Form 1120 if you're a Canadian resident who owns a US single-member LLC and had any money move between you and the LLC during the year.
- **Your SIN (Social Insurance Number) is your FTIN** — the Foreign Taxpayer Identification Number required on Form 5472 Part II.
- **The Canada-US tax treaty** reduces withholding on certain income types but does not eliminate the Form 5472 obligation. These are separate regimes.
- **Zero revenue ≠ zero filing.** The wire transfer you made from your TD or RBC account to open your US LLC bank account is a reportable capital contribution.
- **BOI reporting to FinCEN is NOT required** for US-formed LLCs as of March 26, 2025 — many online guides haven't caught up with this.
- **The deadline** is April 15, extendable to October 15 by filing Form 7004 in advance.

---

## Does this apply to you?

Three conditions must all be true:

1. You own a US single-member LLC.
2. You are not a US person — not a US citizen, green card holder, or US tax resident.
3. There was at least one **reportable transaction** between you and the LLC during the tax year.

The second condition is automatically met if you're a Canadian resident with no US immigration status. The tricky part is the third — most Canadians who think their LLC is "quiet" actually had at least one reportable transaction.

---

## What counts as a reportable transaction if you're in Canada?

Reportable transactions under 26 CFR §1.6038A-4 cover any money, property, or services exchanged between the LLC and you as the foreign related party.

**Common examples for Canadian LLC owners:**

- **Sending a wire from your TD, RBC, Scotiabank, or other Canadian bank account** to fund the LLC's Mercury, Relay, or US bank account — a capital contribution, reportable
- **Using Wise or Interac e-Transfer** routed into a US-linked account — still a capital contribution if it ends up in the LLC
- **Any time the LLC pays you back** — distributions from the LLC to your Canadian account, reportable
- **Paying the LLC's registered agent fee or state renewal** from your personal Canadian credit card — the LLC owes you that money back, making it either a capital contribution or a loan, both reportable
- **Loans in either direction** — you lending to the LLC, or the LLC lending to you

**What is not a reportable transaction:**

Your Stripe revenue, your client invoices, any payments from third-party customers into the LLC — that is the LLC's business income and is not reported on Form 5472. The form only cares about money moving between *you personally* and the LLC.

---

## Your Social Insurance Number is your FTIN

Form 5472 Part II asks for your **Foreign Taxpayer Identification Number (FTIN)**. For Canadian individuals, the FTIN is your **Social Insurance Number (SIN)** — the nine-digit number issued by Service Canada and used for tax filing with the Canada Revenue Agency.

Enter your SIN in the FTIN field on Part II. If you are a Canadian corporation (not an individual) that owns the US LLC, then the FTIN for the corporation is its **Business Number (BN)** — the 9-digit registration number assigned by the CRA.

A few things worth clarifying about the SIN on US forms:

- Your SIN **is not** the same as a US Individual Taxpayer Identification Number (ITIN). You don't need to apply for an ITIN just to file Form 5472.
- Your SIN **is not** sufficient for claiming treaty benefits on a W-8BEN for US withholding purposes. But that's a different regime from Form 5472 — on Form 5472, your SIN is the correct identifier for Part II.
- If you genuinely don't have a SIN (rare for a Canadian resident), Form 5472 has a checkbox to explain why no FTIN is available, along with a reason. Always provide the SIN if you have one.

---

## What about the Canada-US tax treaty?

The Convention Between Canada and the United States of America with Respect to Taxes on Income and on Capital (the "Canada-US Treaty") is a comprehensive double-taxation agreement. It covers things like: reduced withholding rates on dividends (typically 15% rather than 30%), interest (often 0%), and royalties between the two countries; tie-breaker rules for determining residency; and relief from double-taxation on income.

**What the treaty doesn't do:** eliminate the Form 5472 filing obligation. Form 5472 is an **information return**, not a mechanism for calculating or paying tax. The treaty negotiates tax rates between two countries; the IRS's requirement to know about related-party transactions between a US LLC and its foreign owner is separate and not subject to treaty override.

If you're thinking "but my LLC is taxed in Canada, not the US, so I shouldn't need to file anything in the US" — that's a misunderstanding of what Form 5472 is. It reports *transactions*, not taxable income. The US doesn't assert income tax over your LLC profits simply because it's a disregarded entity. It does assert the right to information about money flowing between you and the US entity you own.

---

## What if you own your US LLC through a Canadian holding company?

Some Canadian founders use a structure like: Canadian corporation (e.g., a holding company or operating company) → owns 100% of a US LLC. This is a legitimate structure, especially for founders who have already incorporated in Canada and want a US entity for US business.

In this structure:

- The **foreign related party** on Form 5472 is the **Canadian corporation**, not you as an individual.
- The **FTIN** in Part II is the Canadian corporation's **Business Number (BN)**.
- Reportable transactions include any money flowing between the US LLC and the Canadian corporation (intercompany loans, service fees, management fees, distributions upward to the Canadian parent).
- The Canadian corporation is the "25% foreign shareholder" even though it is 100% owned by you, a Canadian individual.

This structure is more complex and often warrants a tax professional who handles cross-border work. The Form 5472 filing itself follows the same mechanics — pro forma 1120 + Form 5472 faxed to Ogden — but the transaction analysis is more nuanced.

---

## What to actually file

For each tax year your Canadian-owned US LLC existed, you need:

1. **Pro forma Form 1120**: LLC name, EIN, address, date incorporated, total assets at year end. Write "Foreign-Owned U.S. DE" across the top of page 1. Leave income fields blank.

2. **Form 5472**:
   - Part I: LLC's information (EIN, name, address, tax year)
   - Part II: Your information as the foreign shareholder (name, country — Canada — and your SIN as the FTIN)
   - Part III: Check the applicable transaction type boxes
   - Part V: If you had monetary transactions, list each type with the total dollar amount for the year

3. **Part V supporting statement**: "Capital contributions from foreign shareholder: $X,XXX" — line items for each transaction category.

The complete package — Form 1120 cover plus Form 5472 — gets faxed to the **IRS Ogden PIN Unit at +1-855-887-7737**. There is no e-file option. Do not mail it to a regular IRS service center.

The deadline is **April 15** of the following year (so April 15, 2026 for tax year 2025), extendable to **October 15** by filing Form 7004.

---

## What if you haven't filed for previous years?

The fix is the **Delinquent International Information Return Submission Procedure (DIIRSP)**. You prepare returns for all missing years, attach a reasonable cause statement, and fax the complete package to the IRS Ogden PIN Unit.

Most Canadian founders who didn't know about the requirement qualify for reasonable cause abatement — the IRS recognizes that non-US residents are often unaware of this obligation when they form a US LLC. Earlier is better: the continuation penalty ($25,000 per 30-day period after an IRS notice) runs on top of the initial penalty.

See our [complete guide to filing late Form 5472 returns](/blog/form-5472-filed-late-never-filed) for the full DIIRSP walkthrough.

---

## Frequently asked questions

**Do I need a US address to file Form 5472?**

No. Your Canadian address goes on Part II as the foreign shareholder's address. The LLC's registered agent address in the US state goes on the Form 1120 cover. You don't need a US personal address.

**My US LLC has a Canadian accountant. Can they file Form 5472?**

Yes, if they're familiar with the filing workflow for a foreign-owned disregarded entity. The key requirement is knowing that the return goes to the IRS Ogden PIN Unit by fax (not e-file, not mail to a general IRS address) and that it must be attached to a pro forma Form 1120. Not every accountant knows this workflow — it's not a standard Canadian tax filing.

**Does my LLC need to file a state tax return in addition to the federal Form 5472?**

Possibly. State filing requirements vary. Delaware, for example, has an annual franchise tax report. Wyoming has an annual report fee. These are state-level obligations separate from the federal Form 5472, and they're typically much simpler. Check the requirements for the state where your LLC is formed.

**I used a Wyoming LLC registered agent service. Does the registered agent file Form 5472 for me?**

No. Registered agent services handle service of process and annual report filings — they're not tax preparers and they don't file Form 5472. You or your tax preparer must handle the Form 5472 filing separately.

**Can I file jointly for multiple tax years in one package?**

No, but you can fax all years in one transmission. Each year requires its own pro forma Form 1120 and Form 5472. You package them all together with a single cover letter (the DIIRSP statement) and fax the complete bundle to the IRS at once.

---

## The bottom line

If you're a Canadian resident who owns a US single-member LLC, your Form 5472 obligation is the same as any other non-US person who owns a US disregarded entity. The form is not complex, the filing process is straightforward, and the Canada-US treaty doesn't change any of it. Your SIN is your FTIN, your initial bank transfer to the LLC was a reportable capital contribution, and the penalty for not filing is $25,000 per year.

For a broader overview, see [what Form 5472 is and who must file](/blog/what-is-form-5472). If you need to catch up on prior years, the [DIIRSP guide](/blog/form-5472-filed-late-never-filed) covers the process step by step.

Ready to file? [Start your filing here — takes about 15 minutes, fax to the IRS included.](/start?utm_source=blog&utm_medium=internal&utm_campaign=form-5472-canada-residents-us-llc)
