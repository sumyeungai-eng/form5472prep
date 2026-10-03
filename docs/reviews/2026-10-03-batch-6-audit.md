# Batch 6 primary-source audit — 2026-10-03

Scope: the ten batch-6 slugs on the daily drip (commits `96ed888` → `1f754a3`, branch
`blog-batch6-1003`). Auditor read the on-disk state on 2026-10-03. No post was edited.

**Score: P0 0 | P1 2 | P2 3**

> **Re-checked at end of audit.** All ten posts went from 3 modified to 10 modified while this
> audit ran — a concurrent session is editing the batch. The one P0 (FBAR post, continuation
> penalty) was **partially fixed mid-audit**: the 90-day trigger now correctly runs from IRS
> notification, which clears the P0. What remains is the missing recurrence, now P1-1 below.
> Every other finding was re-verified against the current on-disk text and still stands.

Note on a moving target: `form-5472-vs-fbar-vs-form-8938.md` and
`single-member-to-multi-member-llc-what-changes.md` were `M` in `git status` and
`foreign-owned-llc-irs-records-request-6038a-3.md` was untracked while this audit ran; the
FBAR post's comparison table was visibly re-edited mid-audit (quote wording changed between
two reads). Findings below describe the **current** on-disk text. Re-check the FBAR table
after any further edit — the P0 is in a cell that was being touched.

---

## 1. form-5472-vs-fbar-vs-form-8938.md — VERDICT: two P1, one P2; no P0; otherwise verified

### Comparison table, cell by cell

| Cell | Source checked | Result |
|---|---|---|
| FBAR — who files | [IRS FBAR page](https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar) | VERIFIED. "A U.S. person, including a citizen, resident, corporation, partnership, limited liability company, trust and estate, must file an FBAR" — the post's claim that the list expressly includes an LLC is exact. |
| FBAR — aggregate threshold | same | Substance VERIFIED: "the aggregate value of those foreign financial accounts exceeded $10,000 at any time during the calendar year reported". Post elides to "aggregate value … exceeded $10,000 at any time during the calendar year" — drops the source's closing "reported". See P2-1. |
| FBAR — filed with | same | VERIFIED. FinCEN, BSA E-Filing System; "You don't file the FBAR with your federal tax return." verbatim. |
| FBAR — deadline | same | VERIFIED. "due April 15 following the calendar year reported. You're allowed an automatic extension to October 15". |
| FBAR — penalty | same | VERIFIED. "You may be subject to civil monetary penalties and/or criminal penalties for FBAR reporting and/or recordkeeping violations." Inflation adjustment is right (31 CFR § 1010.821). The post deliberately quotes no civil figure — correct and safe, since the comparison page's non-willful/willful figures are pre-Aug-2016 framing. |
| FBAR — authority | same | VERIFIED. Bank Secrecy Act; Title 31 USC and 31 CFR. |
| Form 8938 — who files | [IRS 8938/FBAR comparison](https://www.irs.gov/businesses/comparison-of-form-8938-and-fbar-requirements) | Quote VERIFIED verbatim, but cited to the wrong page. See P1-1. |
| Form 8938 — what it reports / filed with / deadline | [Instructions for Form 8938](https://www.irs.gov/instructions/i8938) | VERIFIED. "Attach Form 8938 to your annual return and file by the due date (including extensions) for that return." |
| Form 8938 — penalty | same | VERIFIED. "you may be subject to a penalty of $10,000"; further amounts after IRS notice ($10,000 per 30 days per the comparison page). |
| Form 8938 — authority | same | VERIFIED. Section 6038D. |
| Form 5472 — who files / what / filed with / deadline | [Instructions for Form 5472](https://www.irs.gov/instructions/i5472) | VERIFIED. |
| Form 5472 — penalty | same | **P1-1.** Accurate but incomplete. See below. |
| Form 5472 — authority | same | VERIFIED. §§ 6038A, 6038C; Treas. Reg. § 1.6038A-1. |

### P1-1 — Form 5472 penalty cell omits that the continuation penalty recurs
Current text: `"$25,000 will be assessed on any reporting corporation that fails to file Form
5472 when due and in the manner prescribed," plus a further $25,000 for failures continuing
beyond 90 days after IRS notification`.

Nothing here is now **wrong** — the earlier revision made the trigger 90 days of lateness, and
that was corrected to "after IRS notification" during this audit, which is what the
instructions provide. The remaining gap is the recurrence: the additional $25,000 applies
**per related party for each 30-day period (or fraction of one)** the failure continues, so the
cell as written reads as a one-off and implies a $50,000 ceiling. The real continuation penalty
is uncapped, which is the whole reason a three-year gap is urgent rather than merely expensive.

The batch's own `foreign-owned-llc-irs-records-request-6038a-3.md:24` states it in full ("more
than 90 days after IRS notification … per related party for each 30-day period it continues").
Borrow that clause, or add "per related party, for each 30-day period it continues" to the cell.
Source: https://www.irs.gov/instructions/i5472

### P1-2 — Form 8938 "who files" quote cited to the wrong IRS page
The quoted sentence "Specified individuals and specified domestic entities that have an
interest in specified foreign financial assets and meet the reporting threshold" is verbatim
from the **IRS comparison of Form 8938 and FBAR requirements** page, not from the Instructions
for Form 8938 named in the Authority column (the instructions read "you must file Form 8938 if
you are a specified person … that has an interest in specified foreign financial assets").
The fact is right; the citation is wrong. The comparison page is already linked later in the
post, so the fix is a pointer change only.
Source: https://www.irs.gov/businesses/comparison-of-form-8938-and-fbar-requirements

### P2-1 — two quotes open or close mid-phrase (both re-confirmed in the current text)
(a) FBAR threshold quote drops the source's final word "reported" behind an ellipsis —
the source reads "exceeded $10,000 at any time during the calendar year **reported**";
(b) the Form 5472 penalty quote starts at `"$25,000 will be assessed`, dropping the source's
opening "A penalty of". An earlier revision of this file quoted both in full. Restore both.

### Thresholds, framing and the no-advice requirement — VERIFIED
- **FBAR aggregate threshold** is given in the aggregate, not per account, and the
  misconception table's "Each account holds under $10,000" row states this correctly.
- **Form 8938 thresholds are described as varying and are deliberately not enumerated**:
  "The thresholds vary, and we deliberately do not reproduce them," supported by the verbatim
  instruction sentence that the threshold "depends upon whether you are married, file a joint
  federal income tax return, and live inside (or outside) the United States." Correct — the
  comparison page's $50,000–$400,000 range would have been the wrong thing to print.
- **No place tells a reader whether FBAR or Form 8938 applies to them.** Checked by grep for
  directive constructions and by full read: zero hits. The post says "Whether you personally
  owe an FBAR or a Form 8938 is not something we can tell you," "nothing here says you do or
  do not have an FBAR to file," and "We also will not tell you that you must file either, or
  that you need not," and routes to a CPA/EA/tax attorney in body, step 5, and two FAQs. The
  one structural statement (8938 attaches to a return, so no return means nothing to attach it
  to) is immediately hedged as an adviser question rather than an inference. **No P0 here.**
- **LLC as a US person for FBAR, owner a separate question** — VERIFIED and correctly split.
  The post grounds the LLC side on the IRS FBAR page's express inclusion of a "limited
  liability company" among US persons, then treats the owner as a distinct determination
  ("A nonresident owner is not automatically a US person for this purpose") and makes the
  LLC's actual obligation conditional on its accounts and their aggregate value. The FAQ
  repeats the split without resolving either side.

---

## 2. foreign-owned-llc-irs-records-request-6038a-3.md — VERDICT: VERIFIED, no findings

The post exists (untracked at audit time) and was audited in full. Every quoted provision was
read against the Legal Information Institute CFR text, which is also the source the post
itself discloses (eCFR redirected to an access interstitial on this project, as the post's own
source note states — that disclosure is accurate and worth keeping).

| Claim | Source | Result |
|---|---|---|
| $25,000 penalty also applies to failure to maintain records under § 1.6038A-3 | [i5472](https://www.irs.gov/instructions/i5472) | VERIFIED — the instructions carry exactly that second sentence. This is the post's central claim and it holds. |
| Continuation penalty: >90 days after IRS notification, additional $25,000, per related party, each 30-day period; criminal penalties under §§ 7203, 7206, 7207 | i5472 | VERIFIED, including the three criminal sections ("Criminal penalties under sections 7203, 7206, and 7207 may also apply for failure to submit information or for filing false or fraudulent information."). |
| § 1.6038A-3(a)(1) permanent books under § 6001, sufficient to establish correctness, records relevant to correct US tax treatment of related-party transactions | [LII § 1.6038A-3](https://www.law.cornell.edu/cfr/text/26/1.6038A-3) | VERIFIED verbatim. |
| (a)(2) safe harbor by reference to the (c)(2) records, "will be deemed to have met the record maintenance requirements of section 6038A" | same | VERIFIED verbatim. |
| Six (c)(2) categories (i)–(vi) | same | VERIFIED — six categories, headings match. Row (vi) is paraphrased "Loans, services and other transactions"; the reg heading is "Records of loans, services, and other non-sales transactions". See P2-2. |
| (f)(1) US maintenance default; (f)(2) 60 days to deliver or move, 30 days for translations, index + named US custodian + US address; 120 days for material profit and loss statements | same | VERIFIED, all four figures. |
| (e) District Director agreements covering what records, how maintained, retention period, by whom | same | VERIFIED. |
| § 1.6038A-1(h) small-corporation exception: <$10,000,000 US gross receipts, exempts from §§ 1.6038A-3 and 1.6038A-5, **parenthetical excluding entities treated as corporations under § 301.7701-2(c)(2)(vi)** | [LII § 1.6038A-1](https://www.law.cornell.edu/cfr/text/26/1.6038A-1) | VERIFIED. The post's load-bearing argument — that the rule pulling a foreign-owned US DE into the regime is the same rule disqualifying it from size relief — is correct. |
| § 1.6038A-1(i) de minimis exception: not more than $5,000,000 and under 10 percent of US gross income, identical parenthetical | same | VERIFIED. |
| Both exceptions leave § 1.6038A-2 reporting and § 6001 general record maintenance intact | same | VERIFIED verbatim. |

### Retention period — declines a figure, and declines it consistently (VERIFIED)
§ 1.6038A-3(g) "Period of retention" was read in full and the post's block quote is verbatim:
records kept "as long as they may be relevant or material … but in no case less than the
applicable statute of limitations on assessment and collection with respect to the taxable
year in which the transaction or item to which the records relate affects the U.S. tax
liability of the reporting corporation."

The post states no number of years anywhere. It says so in the heading answer ("The regulation
gives no number of years"), refuses to compute a limitations period ("we do not compute a
limitations period for anyone"), and repeats the refusal in the FAQ ("Does § 1.6038A-3 name
the number of years to keep records? No."). Consistent in all three places, and correct —
the regulation genuinely states a relevance test with a limitations-period floor, not a term.

### P2-2 — (c)(2)(vi) row label
Table row reads "Loans, services and other transactions"; the regulation's heading is "Records
of loans, services, and other non-sales transactions". The dropped "non-sales" is the part
that distinguishes the category. Cosmetic, in a "what it looks like" column, not a quote.

---

## 3. single-member-to-multi-member-llc-what-changes.md — VERIFIED, no findings

| Claim | Source | Result |
|---|---|---|
| "A domestic LLC with at least two members is classified as a partnership for federal income tax purposes unless it files Form 8832 and elects to be treated as a corporation." | [IRS SMLLC page](https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies) | VERIFIED verbatim. |
| "For income tax purposes, an LLC with only one member is treated as an entity disregarded as separate from its owner, unless it files Form 8832 and affirmatively elects to be treated as a corporation." | same | VERIFIED verbatim. |
| A second member therefore ends default disregarded-entity treatment and moves the LLC toward a partnership return, by default, with nothing filed | both sentences read together | VERIFIED. The "number of members, not nationality or split" reading and the "partnership is the default, the election is the override" reading both follow from the quoted text. |
| DE treated as a corporation for the limited purposes of § 6038A requirements applying to 25% foreign-owned domestic corporations; reporting-corporation definition | [i5472](https://www.irs.gov/instructions/i5472) | VERIFIED. The inference that a partnership matches no limb of the reporting-corporation definition is sound. |
| Corporate-election exception: a ≥25% foreign-owned LLC with a live Form 8832 election stays a reporting corporation regardless of member count | i5472 | VERIFIED. |
| Form 1065: "partnerships file an information return to report their income, gains, losses, deductions, credits, etc." | [About Form 1065](https://www.irs.gov/forms-pubs/about-form-1065) | VERIFIED. |
| SS-4: "If the disregarded entity is requesting an EIN because it has acquired one or more additional owners and its classification has changed to partnership under the default rules of Regulations section 301.7701-3(f), check the Partnership box for line 9a." | [iss4](https://www.irs.gov/instructions/iss4) | VERIFIED verbatim. |

### Mid-year split / effective date / election outcome — correctly declined (VERIFIED)
The post computes none of the three and labels all three adviser questions, in four places:
the standfirst ("The effective date and any mid-year split are adviser questions"); a whole
section headed "Who decides the effective date and the mid-year split?" that answers "A
qualified tax adviser does, on your documents — not this post, and not us" and adds "we have
not found one stated on an IRS page in terms we can quote, and a confident-sounding rule here
would be worse than none"; the change-year paragraph ("the one we will not answer"); and the
FAQ "When exactly does the change take effect?". The following table's rows are framed as
questions to ask, with the explicit note "Every row is a question — none is a rule." The "after"
column of the before/after table is likewise flagged conditional. Also correctly keeps prior
DE years alive ("A partner joining in 2026 does nothing about 2024 or 2025").

---

## 4. form-5472-newsletter-membership-creators.md — VERIFIED, no findings

| Claim | Source | Result |
|---|---|---|
| Ghost: a tier "can have its own name, description, monthly and yearly prices, and list of benefits" | [ghost.org/help/tiers](https://ghost.org/help/tiers/) | VERIFIED ("Each tier can have its own name, …"). Page states no fee percentage. |
| Ghost: "If you have Stripe connected, tiers can be created from the Settings → Membership → Tiers area in Ghost Admin." | same | VERIFIED verbatim. |
| Buy Me a Coffee: "you get paid directly to your bank account" | [buymeacoffee.com/faq](https://buymeacoffee.com/faq) | VERIFIED verbatim. |
| Buy Me a Coffee: payout schedule, minimum balance and whether funds are held first are "not stated on that FAQ" | same | VERIFIED — none of the three appears. (The FAQ *does* state a 5% transaction fee; the post correctly quotes no fee figure, so nothing to fix. Do not "improve" this by adding it.) |
| Substack and Patreon: help centres returned an access error, nothing quoted | — | VERIFIED as handled: the post quotes no mechanic from either and tells the reader to read them signed in. Correct response to a blocked source. |
| **No fee percentage asserted anywhere** | — | VERIFIED across the whole post. |
| Part IV heading "Monetary Transactions Between Reporting Corporations and Foreign Related Party"; Part V covers transactions "not already entered in Part IV", "including contributions to, and distributions from, the entity" | [i5472](https://www.irs.gov/instructions/i5472) | VERIFIED verbatim, both. |
| Record-maintenance quote: records "sufficient to establish the correctness of the reporting corporation's federal income tax return, including information or records that might be relevant to determine the correct treatment of transactions with related parties" | i5472 | VERIFIED **verbatim from the instructions**. Flagging note: this differs from § 1.6038A-3(a)(1)'s own wording ("may be relevant", "correct U.S. tax treatment"), so it looks wrong against the regulation — but the post attributes it to "the instructions", and the instructions say exactly this. Not a defect. Do not "correct" it to the regulation's wording. |

### Core claim — VERIFIED
Deferred, held, refunded and charged-back subscription money is customer revenue and not a
related-party transaction, while the owner's withdrawal is reportable. This follows directly
from the reportable-transaction definition: the counterparty on every one of those flows
(subscriber, card network, platform, processor) is unrelated, and Part V's own text makes
contributions to and distributions from the entity the reportable set. The post's three
refinements are also right and non-obvious: an up-front annual charge is never reportable but
a single withdrawal of it is reportable **in full in the year made, not spread**; a reversal
changes the revenue figure and is never netted against the owner column; and a personally
funded top-up after a chargeback is itself a fresh owner contribution or loan.

---

## 5. form-5472-kdp-authors-royalties.md — VERIFIED, no findings

| Claim | Source | Result |
|---|---|---|
| Most types of US source income received by a foreign person are subject to US tax of 30%; a reduced rate including exemption may apply under a Code section or a treaty with the country of residence | [IRS NRA withholding](https://www.irs.gov/individuals/international-taxpayers/nra-withholding) | VERIFIED verbatim, both sentences. |
| KDP: royalty payments for eBook sales on Amazon.com and print book sales on Amazon.com, Amazon.co.jp, Amazon.com.au and Amazon.ca are subject to 30% US tax withholding | [KDP Tax Withholding](https://kdp.amazon.com/en_US/help/topic/G201274690) | VERIFIED verbatim, including the exact marketplace list. |
| KDP: may be eligible for a reduced rate if your country of permanent residence has an income tax treaty with the United States; TIN in the tax profile | same | VERIFIED verbatim. |
| ACX: non-US publishers have US source income reported annually on IRS Form 1042-S, issued on or before March 15; US publishers get Form 1099-MISC on or before January 31 | [ACX tax forms](https://help.acx.com/s/article/acx-tax-forms) | VERIFIED verbatim, both dates. |
| ACX "states no withholding percentage, so we state none" | same | VERIFIED — the page gives none. |
| **No treaty rate asserted as fact** | — | VERIFIED. The post goes further and marks the territory: "we fetched no individual country's treaty rate, so any specific treaty percentage you have seen quoted elsewhere is **unverified** here". It also keeps US-source characterisation an adviser question. Correct. |
| Withholding is not a Form 5472 item | i5472 reportable-transaction definition | VERIFIED — a withholding agent is an unrelated party; the deduction reduces cash reaching the LLC. |

---

## 6. Platform spot-checks — all VERIFIED, no findings

### form-5472-app-developers-app-store-google-play.md

| Quote | Source | Result |
|---|---|---|
| "$99 annual membership" | [Apple Developer Program](https://developer.apple.com/programs/) | VERIFIED verbatim. |
| "features a reduced commission rate of 15% on paid apps and Apple In-App Purchases" for developers "who made up to 1 million USD in proceeds in the prior calendar year" | [App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/) | VERIFIED. Both fragments verbatim. |
| Apple's standard rate "not given as a figure; the Small Business Program page refers only to 'the standard commission rate'" | same | VERIFIED — the page says only "the standard commission rate will apply to future sales" with no percentage. The post's characterisation is exactly right. |
| "payments are made to the bank account and the currency you provided within 45 days of the last day of the fiscal month in which the transaction was completed" | [Apple payment timing](https://developer.apple.com/help/app-store-connect/getting-paid/overview-of-receiving-payments) | VERIFIED verbatim. |
| "There is a US$25 one-time registration fee" | [Google Play registration](https://support.google.com/googleplay/android-developer/answer/6112435) | VERIFIED verbatim. |
| "Any orders processed, refunded, or charged-back from the 1st of a given month to the end of the month will get paid out around the 15th of the following month" | [Google Play payout timing](https://support.google.com/googleplay/android-developer/answer/137997) | VERIFIED verbatim. |

**Neither prohibited rate is stated.** No Apple standard commission rate and no Google Play
service-fee percentage appears anywhere in the post. The post says so twice ("We give no
standard commission rate for either store"; "Google Play's service-fee tiers changed on
30 June 2026, so we quote no percentage for them"). The 20% in the worked example is flagged
in bold as an arithmetic assumption — "It is not Apple's rate, not Google's rate, and not a
figure either publishes" — which is the right handling. Arithmetic previously reconciled by
the orchestrator; spot-re-checked and consistent ($180,000 gross, $36,000 retained, $144,000
net, $70,076 closing, $102,180 reportable, no netting).

### form-5472-affiliate-marketers-content-sites.md

| Quote | Source | Result |
|---|---|---|
| AdSense: "if your current balance reaches the payment threshold by the end of the month, and there are no other payment holds, you'll be issued a payment between the 21st and the 26th of the month" | [AdSense steps to getting paid](https://support.google.com/adsense/answer/1709858) | VERIFIED verbatim. |
| AdSense "does not state one universal payment threshold, pointing instead to a separate reference, so we state no threshold figure" | same | VERIFIED — the page links a separate "Payment thresholds" article and uses $100 only as an illustration. Correctly declined. |
| Amazon Associates Operating Agreement, updated October 15, 2025 | [Associates agreement](https://affiliate-program.amazon.com/help/operating/agreement) | VERIFIED — Last Updated October 15, 2025. |
| "You may not assign this Agreement, by operation of law or otherwise, without our express prior written approval." | same | VERIFIED verbatim. |
| Agreement "refers to commission income 'paid or payable to you' and sets out no payout mechanics, so we describe none" | same | VERIFIED — phrase appears; no payment schedule or threshold in the agreement. |

No fee or commission percentage is asserted in this post.

---

## 7. Shared US facts across all ten — VERIFIED

Checked by grep across the whole batch, then against the instructions.

- **$25,000 penalty wording** — consistent in all nine posts that state it; all track "fails to
  file Form 5472 when due and in the manner prescribed". The only defect is the continuation
  clause in the FBAR post (P1-1).
- **"Substantially incomplete constitutes a failure to file"** — present and correctly worded in
  7 of 10. Source: "Filing a substantially incomplete Form 5472 constitutes a failure to file
  Form 5472." Absent (not misstated) from the records post, the notice decoder and the FBAR
  post; no fix required.
- **Pro forma Form 1120, "Foreign-owned U.S. DE", items B and E** — VERIFIED against the
  instructions: write "Foreign-owned U.S. DE" across the top, complete only name, address and
  items B and E on page 1. Consistent wherever stated.
- **Fax 855-887-7737** — VERIFIED, consistent in all six posts that give it.
- **Ogden address** — VERIFIED exactly: Internal Revenue Service, 1973 Rulon White Blvd,
  M/S 6112, Attn: PIN Unit, Ogden, UT 84201. Consistent in all five posts that give it in full.
- **No e-filing** — VERIFIED; electronic filing is prohibited for a foreign-owned US DE.
  Correctly stated in every post that raises it, including the notice decoder's CP162 point.
- **15 April plus Form 7004** — VERIFIED as the general calendar-year position with the
  special disregarded-entity extension route; consistently hedged "generally".
- **§ 1.6038A-1 applicability** — "beginning on or after 1 January 2017 and ending on or after
  13 December 2017" appears identically in all seven posts that state it. **VERIFIED, and
  deliberately not flagged**: the Instructions for Form 5472 use exactly this phrasing, while
  the CFR text at § 1.6038A-1(n)(1) says "beginning after December 31, 2016, and ending on or
  after December 13, 2017". The two are mathematically identical and the posts cite the
  instructions. This is precisely the shape of the earlier false positive on this project —
  do not "fix" it against the CFR wording.

### Notice decoder cross-check — no contradictions
`form-5472-irs-notice-numbers-decoder.md` agrees with every item the orchestrator pre-verified:
"Notice 972CG" (not Letter), the 45-day / 60-day-for-a-foreign-filer response window, CP162
described as an electronic-filing penalty rather than late filing, and the LT11 page shared
with Letter 1058 under the title "Understanding your LT11 notice or letter 1058". It also
correctly declines to assert a day count for CP504/LT11 and declines to claim any published
IRS mapping between Form 5472 and a notice number.

### P2-3 — stale check date in the notice decoder
Line 58 says the information-return-penalties page was "reviewed 11 May 2026", where the rest
of the batch says "checked 3 October 2026". The content verifies; only the date is stale, and
it is the one visible freshness signal on that section.

### FBAR / Form 8938 exposure outside the comparison post
Grepped all nine other posts for `fbar`, `8938`, `fincen`: **zero mentions**. No other post in
the batch creates the P0 risk. Re-grepped after the concurrent edits: still zero.
