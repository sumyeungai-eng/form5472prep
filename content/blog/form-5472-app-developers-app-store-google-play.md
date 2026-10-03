---
title: "Form 5472 for App Developers Selling on the App Store and Google Play"
description: "App Store and Google Play payouts are customer revenue, not Form 5472 items. See a worked two-store example of what your owner transfers report."
date: 2026-10-03
publishAt: auto
updated: 2026-10-03
author: "Form5472 Prep"
tags: ["form-5472", "app-developers", "app-store", "google-play", "foreign-owned-llc"]
draft: false
---

**If your single-member US LLC earns from the App Store and Google Play, it files Form 5472 with a pro forma Form 1120 for each year it had a reportable transaction with its foreign owner. App sales, in-app purchases and the commission each store retains are not reported. Money you move between the LLC and yourself is.**

The setup is common: form a US LLC, enrol it in both developer programmes, point the payout details at a US business bank account, and ship. Two stores then deposit money on two schedules, net of amounts you never see.

Neither store's payments dashboard tells you what belongs on Form 5472, because the form reports dealings between the LLC and its foreign owner, not units sold. The [IRS Instructions for Form 5472](https://www.irs.gov/instructions/i5472) set a **$25,000 penalty** for failure to file when due and in the manner prescribed, and treat a substantially incomplete form as a failure to file. [We prepare and fax the package from $149](/start).

## Does an app developer's US LLC have to file Form 5472?

Yes, in most years. A foreign-owned US single-member LLC files when three things hold: it is a disregarded entity for US tax purposes, its owner is a foreign person, and it had a reportable transaction during the year with that owner or another foreign related party.

Under **Treas. Reg. § 1.6038A-1**, for tax years beginning on or after 1 January 2017 and ending on or after 13 December 2017, a foreign-owned US disregarded entity is treated as a corporation separate from its owner **solely** for the § 6038A reporting rules. An app LLC with no US tax to pay therefore still lodges a corporate-style information return.

App developers meet the third condition almost automatically: funding the LLC so it can pay a developer-programme fee is reportable, and so is the first withdrawal once the stores pay.

Whether the LLC owes US income tax is a separate question, covered in [does a foreign-owned LLC pay US tax](/blog/does-foreign-owned-llc-pay-us-tax). Form 5472 is due either way, including in a loss year.

## Which app-business money movements are reportable on Form 5472?

Sort every movement by who stands on the other side. Users, the stores and your vendors are unrelated counterparties; you, and any company you own, are related parties.

| App-business movement | Counterparty | Form 5472 treatment |
|---|---|---|
| User buys a paid app or in-app subscription | Unrelated user | Not reportable; business revenue |
| Store retains its commission or service fee | Unrelated store | Not reportable; operating expense |
| Store's payout lands in the LLC's bank account | The LLC's own funds | Not reportable; money stays inside the LLC |
| LLC transfers money to your personal account | Foreign owner | **Reportable** (distribution, loan or payment) |
| You send personal savings into the LLC's account | Foreign owner | **Reportable** (contribution or loan) |
| You buy a build machine or tool subscription on a personal card | Foreign owner | **Reportable** (contribution, loan or reimbursable amount) |
| LLC pays a studio you own in your home country | Foreign related party | **Reportable**; may need its own Form 5472 |

Part V covers amounts "including contributions to, and distributions from, the entity," described on an attached statement — for an app LLC, the cash you send in and the withdrawals you take later. See [reportable transactions examples](/blog/form-5472-reportable-transactions-examples) and [the Part V statement example](/blog/form-5472-part-v-statement-example).

## Are App Store and Google Play payouts reportable?

No. A store collecting from users and settling the balance into the LLC's own bank account is not a transaction with the foreign owner, so no part of it is reported: not the gross sales, not the retained commission, not the net deposit.

Three practical points:

- **Whose name is on the account.** Keep the developer account, payout details and bank account in the LLC's name. If a store pays you personally and you forward the money, that forwarding transfer is itself an owner movement.
- **Three different numbers.** The user's price, the store's cut and the bank deposit are three figures, none a Form 5472 amount.
- **Merchant of record.** In some territories a store acts as merchant of record and sells in its own name; that changes nothing on Form 5472, because none of it is a related-party transaction.

## What do Apple's and Google's own developer pages say about fees and payouts?

We checked Apple's and Google's own developer pages on **3 October 2026** and repeat only what they state. We give no standard commission rate for either store.

| Item | What the company's own page states |
|---|---|
| [Apple Developer Program](https://developer.apple.com/programs/) | Advertises a "$99 annual membership" |
| [App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/) | "features a reduced commission rate of 15% on paid apps and Apple In-App Purchases" for developers "who made up to 1 million USD in proceeds in the prior calendar year" |
| Apple's standard rate | Not given as a figure; the Small Business Program page refers only to "the standard commission rate" applying above the threshold |
| [Apple payment timing](https://developer.apple.com/help/app-store-connect/getting-paid/overview-of-receiving-payments) | "payments are made to the bank account and the currency you provided within 45 days of the last day of the fiscal month in which the transaction was completed" |
| [Google Play registration](https://support.google.com/googleplay/android-developer/answer/6112435) | "There is a US$25 one-time registration fee" |
| [Google Play payout timing](https://support.google.com/googleplay/android-developer/answer/137997) | "Any orders processed, refunded, or charged-back from the 1st of a given month to the end of the month will get paid out around the 15th of the following month" |

Google Play's service-fee tiers changed on 30 June 2026, so we quote no percentage for them.

What matters for the filing is the shape, not the rate: both stores collect from unrelated users and settle a net balance into the LLC's own account. That settlement is not an owner transaction; what you do with the balance can be.

## How does a two-store app year reach Form 5472?

Consider this **illustrative example created for this guide**, not client data. A non-US developer owns a disregarded Wyoming LLC publishing a paid app and a subscription app on both stores, every account in the LLC's name. Its bank balance opens at **$9,400**.

**The percentage below is an assumption chosen to keep the arithmetic easy to follow. It is not Apple's rate, not Google's rate, and not a figure either publishes.** Assume each store retains **20%** of gross sales.

| Movement during the year | Amount (USD) | Reportable? |
|---|---:|---|
| Gross App Store sales and in-app purchases | 128,000 | No; user revenue |
| Commission retained by the App Store at the assumed 20% | (25,600) | No; unrelated store |
| Gross Google Play sales and in-app purchases | 52,000 | No; user revenue |
| Service fee retained by Google Play at the assumed 20% | (10,400) | No; unrelated store |
| **Net payouts reaching the LLC's bank account** | **144,000** | No |
| Cloud hosting, analytics and crash reporting paid by the LLC | (7,200) | No; unrelated vendors |
| Apple Developer Program membership paid by the LLC | (99) | No; unrelated store |
| Google Play registration fee paid by the LLC | (25) | No; unrelated store |
| Owner's personal savings sent into the LLC in January | 12,000 | **Yes; contribution or loan from owner** |
| Four quarterly transfers of $22,000 to owner's personal account | (88,000) | **Yes; distributions to owner** |
| Mac mini build machine bought on owner's personal card | 1,400 | **Yes; owner-paid LLC cost** |
| App-analytics subscription bought on owner's personal card | 780 | **Yes; owner-paid LLC cost** |

**Revenue arithmetic.** Gross sales are $128,000 + $52,000 = **$180,000**. Retained commission at the assumed rate is $25,600 + $10,400 = **$36,000**. Net payouts are $180,000 − $36,000 = **$144,000**, matching $102,400 from the App Store plus $41,600 from Google Play.

**Bank arithmetic.** Opening $9,400 + net payouts $144,000 + owner cash in $12,000 − vendor and store fees $7,324 ($7,200 + $99 + $25) − owner transfers out $88,000 = **$70,076** closing balance. The two personally bought items never touch the LLC's bank account, so they are absent here.

**Form 5472 arithmetic.** Owner movements for the filing are $88,000 out, $12,000 in, and $2,180 of LLC costs the owner paid ($1,400 + $780) — **$102,180** in total, reported in their proper categories and directions. Do not net the $14,180 in against the $88,000 out, and do not report the $180,000, the $144,000 or the $36,000 at all. A later reimbursement of the machine is a second reportable movement.

## What records should an app developer keep for the filing?

Assemble the file once a year.

1. Download each store's annual payout reports and the LLC's bank and card statements for the year.
2. Reconcile gross sales, retained commission and net payouts to the deposits that landed, store by store.
3. List every transfer between the LLC and your personal accounts, with date, direction and amount.
4. List every LLC cost you paid personally, with the invoice and the card statement line.
5. Write down whether each owner movement is a contribution, distribution, loan or reimbursement.
6. Convert non-USD proceeds to US dollars and record the rate and its source.
7. Keep the signed package, the Part V statement and the fax receipt together.

The penalty also covers failure to maintain the records the rules require, so the schedule matters as much as the form. A fuller list sits at [Form 5472 recordkeeping](/blog/form-5472-recordkeeping-checklist).

## When and how is an app LLC's filing made?

For a calendar-year LLC, the 2025 package is generally due **15 April 2026**; a timely [Form 7004](https://www.irs.gov/forms-pubs/about-form-7004) filed under the special disregarded-entity instructions extends it.

The package is Form 5472 attached to a **pro forma Form 1120** with **"Foreign-owned U.S. DE"** across the top of page 1, where only the LLC's name and address and items B and E are required.

1. Prepare Form 5472 and the Part V statement from the owner-movement schedule.
2. Prepare the pro forma Form 1120 with the "Foreign-owned U.S. DE" header, then sign and date it.
3. Fax it to **855-887-7737**, or mail it to Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201. It cannot be e-filed.
4. Keep the fax receipt: transmission evidence, not IRS acceptance.

The [About Form 5472 page](https://www.irs.gov/forms-pubs/about-form-5472) links the current form and instructions.

## How can Form5472 Prep handle an app developer's filing?

We build Form 5472, the pro forma Form 1120 and the Part V statement from your store reports and owner-movement schedule, have a qualified tax accountant review it, fax it to the IRS, and send you the timestamped receipt. Standard is **$149** (5–7 business days), Express **$199** (within 3 business days), each extra past tax year **+$99**, IRS fax delivery included.

We are not a CPA firm and we do not give tax advice; we prepare and submit the information return. Whether your app income is effectively connected with a US trade or business, and what your home country taxes, are adviser questions.

## Frequently asked questions

### Do App Store sales go on Form 5472?

No. Payments from users, collected by Apple and settled into the LLC, are business revenue. Form 5472 reports transactions with the foreign owner or another foreign related party, not units sold.

### Is the commission a store keeps a related-party transaction?

No. Each store is an unrelated counterparty, so what it retains is an ordinary operating expense — in the LLC's books, nowhere on Form 5472.

### Do I file two Form 5472s because I sell on two stores?

No. The form is filed per foreign related party, not per store. A sole foreign owner normally files one Form 5472 covering all owner movements for the year, whatever mix of stores earned the revenue.

### I paid the developer-programme fee on my personal card. Does that count?

Generally yes. Funding an LLC cost from personal money is a movement between owner and LLC. Record it as a contribution, loan or reimbursable amount, and keep the receipt.

### My app earned nothing this year. Do I still file?

Possibly. Paying the LLC's bills personally, funding it, or withdrawing from it is reportable even with no downloads. A year with no owner movements at all may not require the form.

### Does a store acting as merchant of record change my filing?

No. Whether the store or the LLC is treated as selling to the user, neither is the LLC's foreign owner, so that arrangement creates no reportable transaction.

---

Your store dashboards show what users paid; your owner transfers show what Form 5472 reports. The mechanics match a service business selling programmes rather than software — see [Form 5472 for coaches, consultants and course creators](/blog/form-5472-coaches-consultants-course-creators) — with one difference: two stores on two payout cycles make year-end reconciliation the step worth doing carefully. [Start your Form 5472 package](/start).

*Educational content only; not tax or legal advice.*
