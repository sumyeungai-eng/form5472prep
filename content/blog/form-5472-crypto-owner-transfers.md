---
title: "Form 5472 for Crypto Transfers Between an LLC and Its Owner"
description: "Trace crypto contributions and withdrawals between a foreign owner and a US LLC, document dollar values, and separate owner transfers from wallet moves."
date: 2026-09-11
updated: 2026-09-11
author: "Form5472 Prep"
tags: ["form-5472", "crypto", "foreign-owned-llc", "recordkeeping"]
draft: false
---

A crypto transfer between a foreign owner and their US single-member disregarded LLC can belong in the Form 5472 review even if neither party uses a bank account. The first question is who owned the asset before and after the transfer—not whether the blockchain calls it a withdrawal, deposit, or swap.

This guide covers owner-to-LLC transfers and the records needed for disclosure. It does not determine the income-tax treatment of trading, staking, mining, lending, or decentralized finance.

## Why crypto cannot be left out of the transaction file

The IRS treats convertible virtual currency as property for federal tax purposes. Separately, the Form 5472 rules for a foreign-owned US disregarded entity include owner contributions, distributions, and other specified transactions. Applying those rules together means a crypto-funded contribution needs review just as another property contribution would. That is a synthesis of the rules, not a special IRS crypto exemption or separate crypto filing regime. See [IRS Notice 2014-21](https://www.irs.gov/pub/irs-drop/n-14-21.pdf) and the [Form 5472 instructions, Parts V and VI](https://www.irs.gov/instructions/i5472).

Part V addresses certain disregarded-entity transactions not already entered in Part IV. Part VI addresses nonmonetary or less-than-full-consideration transactions with a foreign related party. The preparer must decide which descriptions are required without double-counting the same event in summary totals.

## The wallet-ownership decision table

Use this research-based triage table before importing exchange exports into your filing worksheet.

| Movement | What to establish | Filing review |
|---|---|---|
| Owner's personal wallet sends tokens to an LLC-owned wallet | Whether ownership actually passed to the LLC; contribution, loan, purchase, or another arrangement | Foreign-related-party transaction review |
| LLC wallet sends tokens to the owner's personal wallet | Whether the owner received a distribution, repayment, compensation, or another benefit | Foreign-related-party transaction review |
| One LLC wallet sends tokens to another wallet owned by the same LLC | Evidence both wallets belong to the LLC and no other party received value | Not an owner transfer merely because the wallet address changed |
| An unrelated customer pays the LLC in crypto | Customer relationship and invoice purpose | Not an owner transaction merely because payment used crypto |
| Tokens move through a bridge, custodian, or protocol | Beneficial ownership, counterparties, fees, and any rights exchanged | Separate analysis; do not automatically label every movement an internal transfer |

A wallet controlled by the owner is not necessarily the owner's personal property: an owner can hold keys for the LLC. Conversely, naming an exchange account after the LLC is not enough to explain every asset in it. Preserve agreements, account records, and bookkeeping that establish whose assets are involved.

## Build a dollar-value trail, not just a token total

The Form 5472 instructions require US-dollar reporting and specify valuation information for nonmonetary exchanges. Keep the quantity and the dollar calculation together. Notice 2014-21 also explains using a reasonable, consistently applied exchange-rate method to establish dollar fair market value in the situations it covers. [IRS sources: Form 5472 instructions](https://www.irs.gov/instructions/i5472), [Notice 2014-21, questions 1 and 5](https://www.irs.gov/pub/irs-drop/n-14-21.pdf).

For each owner transfer, retain:

- asset name, network, quantity, transaction hash, and timestamp with timezone;
- sending and receiving wallet ownership, not just addresses;
- the transaction's purpose and any agreement;
- the price source, observation time, USD conversion, and calculation;
- network fees separately, including who paid them; and
- the proposed contribution, distribution, or other classification.

**Illustrative calculation:** an owner transfers 2 tokens to the LLC. A documented, appropriate market price at the transfer time is $1,500 per token. The gross reference value is 2 × $1,500 = $3,000, before separately analyzing fees. This is an example, not a token price or a tax-basis conclusion. Do not assume a stablecoin was worth exactly $1 simply from its name.

## Resolve missing records before choosing a filing package

A year-end balance cannot reconstruct gross owner activity. An LLC could receive and return the same number of tokens while still having two events to classify. Reconcile wallet activity to the ledger, preserve both directions, and explain unmatched transfers.

If the records cannot distinguish personal and company holdings, ask a qualified adviser to resolve ownership and classification first. Material valuations, token loans, protocol transactions, and compensation paid in crypto can need work beyond a standard information-return package. Our [noncash property guide](/blog/form-5472-noncash-property-transfers) explains the broader disclosure framework.

## Frequently asked questions

### Does holding crypto alone create an owner transfer?

No. A balance alone does not show a transfer between the LLC and its foreign owner. Review how the LLC acquired it and whether related-party transactions occurred during the year.

### Can I report only net deposits less withdrawals?

Do not use a net balance as a substitute for transaction analysis. Keep gross transfers and their purposes so the preparer can apply the correct form categories.

### Does Form 5472 decide whether my crypto gains are taxable?

No. Information-return disclosure does not settle the owner's income-tax liability, source of income, tax basis, or other digital-asset reporting obligations.

---

Have a reconciled owner-transfer file? [Contact Form5472 Prep about filing fit](/contact) before ordering if crypto classification or valuation remains uncertain. Explain the activity in general terms; do not send private keys, seed phrases, or wallet credentials.

*Educational content only; not tax, legal, or investment advice.*
