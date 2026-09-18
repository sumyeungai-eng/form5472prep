# Nomad batch 3 — primary-source claim audit (2026-09-18)

Scope: highest-risk claims in five batch-3 posts plus the existing `new-mexico-llc-foreign-owner-tax-filing.md`.
Report only. No post was edited. Severity: P0 = must fix before publishing; P1 = correct but badly or weakly cited; P2 = wording; VERIFIED = correct and sourced.

**Tally: P0 0 | P1 3 | P2 1**

---

## 1. New Mexico LLC annual report (HIGHEST PRIORITY): verdict VERIFIED, no LLC report exists

Files: `wyoming-vs-new-mexico-vs-delaware-llc-digital-nomads.md` (lines 39–40, 46, 60–64, 93, 128–130); `new-mexico-llc-foreign-owner-tax-filing.md` (lines 3, 11, 13, 23, 31–37, 53, 99, 103, 135–137, 161).

**Verdict: correct as of 18 Sep 2026.** A New Mexico LLC has no annual, biennial, triennial or other periodic report.

Evidence:
- **The third-party claim traces to 2023 HB 281, and that bill died.** HB 281 (2023 Regular Session, Rep. Nibert) was the "Revised Uniform LLC Act". Its § 212 would have required LLCs and registered foreign LLCs to file a **triennial report**. The bill was introduced 1 Feb 2023 and got a House committee "Do Pass". On **16 Feb 2023** it was "Action Postponed Indefinitely" and never enacted. Source: https://fastdemocracy.com/bill-search/nm/2023/bills/NMB00009352/ (bill text: https://www.nmlegis.gov/Sessions/23%20Regular/bills/house/HB0281.pdf).
  - I could not read nmlegis.gov itself. Its Check Point WAF blocked curl, WebFetch and both browsers ("Attack blocked by web application protection"). LegiScan and Justia sat behind Cloudflare bot checks, which I did not bypass. The bill status therefore comes from FastDemocracy plus a search-index summary of LegiScan, and both say "Introduced – Dead".
  - Sites such as LLCBuddy say a "$20 triennial report under HB0281, effective July 1, 2024" is in force. They describe the dead bill as if it had passed. **Do not rely on them.**
- **The current official statutes have no such report.** I checked NMOneSource.com (NM Compilation Commission, official publisher; site "last modified 09/18/2026"):
  - A full-text search for `"triennial report"` gets **0** hits in NMSA and **1** hit in all databases (an unrelated NMAC medical-CE rule).
  - `"registered foreign limited liability company"` (a RULLCA-only term) gets **0** hits.
  - `"Uniform Limited Liability Company Act"` gets **0** hits.
  - Control search `"Limited Liability Company Act"` gets hits, and a report query returns NMSA Chapter 53, so the search does cover the current statutes.
  - The LLC Act in force is still **53-19-1 to 53-19-74 NMSA 1978**, and no section in it prescribes a periodic report.
- The NM SOS statute index (https://www.sos.nm.gov/business-services/statutes-governing-business-in-nm/) still lists "Limited Liability Companies 53-19-1 to 53-19-74" separately from "Corporate Reports 53-5-1 to 53-5-10". The SOS portal describes e-filing "corporate and partnership reports", with no LLC report.
- I found no later session (2024–2026) enacting RULLCA or an LLC report. The zero NMSA hits above cover any enactment codified by Sept 2026.

**P1 (both NM files): weak citation.** Both posts rest "no annual report" only on the SOS index listing the LLC Act apart from "Corporate Reports". That is an inference from a table of contents. Suggested fix:
- Cite the LLC Act itself (53-19-1 to 53-19-74 NMSA 1978 on nmonesource.com) as prescribing no periodic report.
- Optionally add one line: "A 2023 bill (HB 281) would have created a triennial LLC report; it did not pass." This pre-empts readers who see the third-party claims.
- The Wyoming post's "confirm in the portal, state law can change" caveat is good. Keep it.

---

## 2. `us-llc-tax-free-digital-nomads-myth.md`

| Claim | Verdict | Source |
|---|---|---|
| (a) Personal-services income sourced where performed (line 64) | VERIFIED. Pub 519: "All wages and any other compensation for services performed in the United States are considered to be from sources in the United States" (IRC 861(a)(3); foreign side 862(a)(3)). Short-visit exception: ≤90 days, ≤$3,000, foreign employer. | https://www.irs.gov/publications/p519 |
| (b) FDAP flat 30% or lower treaty rate, no deductions (line 25) | VERIFIED, verbatim match. | https://www.irs.gov/individuals/international-taxpayers/taxation-of-nonresident-aliens |
| (c) NRA engaged in US T/B files 1040-NR even with no income (lines 37, 66) | VERIFIED. i1040NR: "You must file even if: a. You have no income from a trade or business conducted in the United States, b. You have no U.S. source income, or c. Your income is exempt…" | https://www.irs.gov/instructions/i1040nr |
| (d) $25,000 plus $25,000 per 30-day period after 90 days from IRS notification (line 58; line 141 summary) | VERIFIED. i5472 Penalties also says the extra penalty applies per related party. The post omits that, which is acceptable. | https://www.irs.gov/instructions/i5472 |

**P1 — line 64, the USTB test is framed too loosely for an individual.** The post says foreign persons are engaged in a US trade or business when services are performed in the US, "provided the activity is 'considerable, continuous and regular'". The ECI page does contain both sentences. For individuals, however, Pub 519 is more specific: "If you perform personal services in the United States at any time during the tax year, you are usually considered engaged in a trade or business in the United States." A nomad could read "considerable, continuous and regular" as a safe harbour for occasional US work.
- Suggested fix: quote the Pub 519 sentence as the rule for personal services. Mention the ≤90-day/≤$3,000/foreign-employer exception instead of the "considerable, continuous and regular" proviso.
- Source: https://www.irs.gov/publications/p519 (Chapter 4, "Personal Services").

---

## 3. `stripe-atlas-doola-firstbase-form-5472.md`: VERIFIED

I checked each company's live page on 18 Sep 2026.

- **Stripe Atlas** (https://docs.stripe.com/atlas/business-taxes). Both quotes are verbatim: "Stripe Atlas doesn't provide tax or legal accounting advice", and Atlas "partners with startup-focused tax and accounting services who can help you with corporate income taxes". The page also says "These services offer discounts to Atlas users", which the post omits (neutral). The page does not mention Form 5472. The supporting claim that the Atlas guide says "an LLC owned solely by a non-US individual requires filing Form 5472 with the IRS" is verified at https://stripe.com/atlas/guides/business-taxes.
  - Side note: this Stripe page still shows the Delaware LLC tax as "300 USD", due June 1 2025. It is stale for tax year 2026, but this post does not quote it, so no action is needed.
- **doola** (https://www.doola.com/tax-filing/). Verified:
  - Form 1120 and Form 5472 are listed "For US Non-Residents with a SMLLC and C-Corporations".
  - Tax and Compliance ($1,999/yr) lists "Federal (IRS) + State Tax Filing".
  - Business-in-a-Box lists "Everything in Tax and Compliance".
  - Starter ($297/yr) does not list federal filing.
  - Nothing is overstated or understated.
- **Firstbase** (https://www.firstbase.io/tax-software). Verified:
  - The package for "Non-US owned Single-Member LLCs" lists "Forms 5472", "Pro Forma Form 1120" and "Obtain 6-month deadline extension", "For Single-Member LLC owned by a non-US citizen or resident". It is priced $899, billed "Annually · Per package".
  - The page also lists "Unlimited Forms 1099-NEC or 1099-MISC", which the post omits. That omission understates nothing material.
  - `firstbase.io/tax-filing` returns 301 → `/tax-software` (confirmed with curl).
- **Tone:** no disparaging wording found. "None of this is a ranking" and "each gives its customers a route to the filing" are neutral. Other details verified against i5472: fax 855-887-7737, and the Ogden M/S 6112 PIN Unit mailing address.

---

## 4. `form-5472-freelancers-upwork-fiverr-us-llc.md`: VERIFIED

I read these in Chrome. WebFetch got a 403.

- **Upwork, "How to complete Form W-8BEN or W-8BEN-E"** (https://support.upwork.com/hc/en-us/articles/211063938):
  - "What happens if I don't complete the W-8BEN or W-8BEN-E? You won't be able to withdraw earnings from Upwork. Upwork may be required to withhold up to 30% of your future earnings on Upwork and send it to the IRS."
  - For an entity that is not an individual, corporation or partnership, or one claiming treaty benefits, the article says to select "other entity type or claiming treaty benefits" and submit the IRS form to the Upwork tax team.
  - All match line 58.
- **Upwork, "Learn about the Freelancer Service Fee"** (https://support.upwork.com/hc/en-us/articles/211062538): "The fee ranges from 0% to 15% per contract". Matches. The worked example's 10% ($6,000 on $60,000) sits inside that range.
- **Fiverr, "W-9 collection"** (https://help.fiverr.com/hc/en-us/articles/360011135837), FAQ text: "All freelancers on Fiverr—both existing and new—will have to declare if they are a U.S. person. If so, they will have to go through the W-9 process." Matches.
- **Fiverr, "Freelancer taxes"** (https://help.fiverr.com/hc/en-us/articles/360010561178): freelancers are responsible for local tax obligations, and statements of earnings are issued for completed years under My business → Earnings → Financial documents. This comes from the search-index text of the official article, not a direct page read.

---

## 5. `us-llc-vs-estonia-ou-vs-uae-company-digital-nomads.md`: VERIFIED

- **Estonia, RIK** (https://www.rik.ee/en/e-business-register/annual-report): the report is due "within six (6) months of the end of the financial year" and "must be submitted even if there was no economic activity". The page covers fines and supervisory procedure leading to deletion or compulsory dissolution, and refers to the Auditors Activities Act thresholds. All match.
- **Estonia, EMTA** (https://www.emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes/taxation-dividends): "declare and pay income tax on the basis of form TSD Annex 7 and INF 1 by the 10th day of the calendar month following the month in which the dividend was paid." Matches.
- **UAE, MoF** (https://mof.gov.ae/en/public-finance/tax/corporate-tax-in-the-uae/): "All Taxable Persons (including Free Zone Persons) will be required to register…". The return is due "within 9 months from the end of the relevant period", with the same deadline generally for payment. Matches.
- **UAE, Ministerial Decision No. 84 of 2025** (PDF at the mof.gov.ae URL cited in the post; text extracted):
  - Art. 2(1)(a) covers "A Taxable Person that is not a Tax Group and that derives Revenue exceeding AED 50,000,000".
  - Art. 2(1)(b) covers "A Qualifying Free Zone Person".
  - Art. 4: "Tax Periods commencing on or after 1 January 2025".
  - The post's "non-group" wording is accurate. Tax Groups instead prepare audited special-purpose statements (Art. 2(2)).
- **UAE, FTA Decision No. 3 of 2024** (https://tax.gov.ae/en/media.centre/news/federal.tax.authority.issues.new.decision.on.specified.timeframes.for.corporate.tax.registration.aspx): a resident juridical person (Free Zone Persons included) incorporated on or after 1 March 2024 registers "within three months from the date of incorporation". Late registration draws administrative penalties under Cabinet Decision No. 75 of 2023. Matches.

---

## 6. `wyoming-vs-new-mexico-vs-delaware-llc-digital-nomads.md`: figures VERIFIED; one P1 and one P2

- **Wyoming** (https://sos.wyo.gov/faqs.aspx?root=BUS):
  - "The tax is $60 or two-tenths of one mill on the dollar ($.0002), whichever is greater."
  - "An entity with $300,000 or less in assests [sic] pays $60."
  - The report is due the first day of the anniversary month.
  - The entity is delinquent "on the second day of the month following its due date", and administratively dissolved if the report is not filed within 60 days of the due date.
  - All match lines 40–52.
- **Delaware** (https://corp.delaware.gov/alt-entitytaxinstructions/): "annual tax of $400.00", due "on or before June 1st". Late payment brings "a penalty of $200.00 plus 1.5% interest per month on tax and penalty", and "There is no requirement to file an Annual Report." All match lines 40–42 and 68.

**P1 — lines 70 and 132–134: the Delaware "$300 vs $400 discrepancy" is presented as unresolved, but it has a known cause.**
- Delaware **HB 400** (153rd GA) was **signed 21 May 2026 as Chapter 85:273**. It raised the LLC annual tax from $300 to $400, and its synopsis says the LLC annual-tax changes "will take effect on January 1, 2026" (https://legis.delaware.gov/BillDetail/143069).
- So $400 applies from **tax year 2026**, first payable by **1 June 2027**. The payment due 1 June 2026 was for tax year 2025 at $300.
- `corp.delaware.gov/frtax/` (still $300) is the stale page. The two official pages do not truly conflict.
- The existing `new-mexico-llc-foreign-owner-tax-filing.md` line 55 already says "$400 … (from tax year 2026; $300 for 2025)". The new post currently says the opposite: it states the start year is unknown.
- Suggested fix: replace the "discrepancy" paragraph and FAQ with the HB 400 explanation and citation. Consider adding "(tax year 2026 onward)" wherever $400 appears in the table and the 3-year cost row.

**P2 — line 72:** "$400 tax plus the $200 penalty is $600 before interest" is correct only for tax year 2026 onward. For a missed 2025-year payment the figure is $300 + $200. Add "(tax year 2026 onward)".

---

## What could not be read directly

- nmlegis.gov: every page returned a Check Point CloudGuard WAF block, in curl, WebFetch, the preview browser and Chrome.
- legiscan.com and law.justia.com: Cloudflare bot check (not bypassed).
- The NM verdict therefore rests on the official statute publisher (NMOneSource), the NM SOS statute index, and FastDemocracy's bill history. These all agree.
