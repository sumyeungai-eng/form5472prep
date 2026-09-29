# Research note — LLC annual fees by state

Tools: `/llc-annual-fees-by-state` (table) and `/foreign-owned-llc-compliance-calendar` (state dates).
Data: `src/lib/tools/state-fees/data.ts` · date engine: `src/lib/tools/state-fees/rules.ts`.
Scope: a **domestic LLC** (formed in that state), not a corporation and not a foreign-registered LLC.
All sources retrieved **2026-09-29**; quotes are verbatim (quotes marked † were read through
WebFetch because the site returns HTTP 403 to curl).

Legend: **V** = verified on a primary source today · **U** = could not be verified → the page says
"verify with the state" and the calendar does not date it.

Archived copies: where an official server refused this machine (connection refused / 403 /
bot wall) the quote was read from a web.archive.org capture of the **same official URL**, marked
"[WB yyyy-mm-dd]". The page links to the official URL. Re-check these in a normal browser.

## Delaware (V)

| Fact | Source | Quote |
|---|---|---|
| $400 annual tax, no annual report | [Division of Corporations — LLC/LP/GP tax instructions](https://corp.delaware.gov/alt-entitytaxinstructions/) | "All Domestic and Foreign Limited Liability Companies … formed or registered in Delaware are required to pay an annual tax of $400.00. There is no requirement to file an Annual Report." |
| Due 1 June for the prior year | same | "The annual taxes for the prior year are due on or before June 1st." |
| Late penalty | same | "a penalty of $200.00 plus 1.5% interest per month on tax and penalty." |
| No proration; formation year taxed | same | "There is no proration on alternative entity taxes. Annual taxes are assessed if the entity is active in the records of the Division of Corporations anytime during January 1st through December 31st of the current tax year." |
| Statute | [6 Del. C. § 18-1107](https://delcode.delaware.gov/title6/c018/sc11/index.html) | "due and payable on the first day of June following the close of the calendar year" |
| HB 400: $300 → $400 from 1 Jan 2026 | [HB 400 bill detail](https://legis.delaware.gov/BillDetail/143069) (85 Del. Laws c. 273, signed 21 May 2026) | "in the amount of $300. $400." (§ 23) · "Sections 9, 16, and 23 of this Act take effect January 1, 2026." |
| Annual-tax info page now agrees | [Division of Corporations — Annual report and tax information](https://corp.delaware.gov/frtax/) | "they are required to pay an annual tax of $400.00. Taxes for these entities are due on or before June 1st of each year." (the earlier $300 discrepancy is resolved as of today) |
| Cancellation after 3 years | 6 Del. C. § 18-1108(a) | "not paid for a period of 3 years from the date it is due" |

Consistency with the already-verified fact: 1 June 2026 paid tax year 2025 at $300; 1 June 2027 is
the first $400 payment (tax year 2026). Calendar: `fixed-date 6/1, offset 1`.

## Wyoming (V; first-year timing inferred)

| Fact | Source | Quote |
|---|---|---|
| License tax $60 or $0.0002 × Wyoming assets | [WY SOS fee schedule (PDF)](https://sos.wyo.gov/Business/Docs/BusinessFees.pdf) [WB 2026-09-25, "Effective July 1st, 2026"] | "Annual Report License tax is $60 or two-tenths of one mill on the dollar ($.0002) whichever is greater" |
| Statute + due date | [W.S. § 17-29-209(a)](https://wyoleg.gov/statutes/compress/title17.pdf) [WB 2026-09-25] | "sixty dollars ($60.00) or two-tenths of one mill on the dollar ($.0002), whichever is greater" · "on or before the first day of the month of organization of every year" |
| Anniversary-month example | [WY SOS FAQ](https://sos.wyo.gov/faqs.aspx?root=BUS) [WB 2025-11-09] | "if your business registers or qualifies on January 15th, your annual report due date will be January 1st of each year." |
| Late consequence | same | "The entity will be deemed delinquent on the second day of the month following its due date. If the annual report is not filed within sixty (60) days following the due date, the entity will be administratively dissolved." |

First report: the source does not say "the year after formation" in words; because the formation
year's due date (1st of the formation month) is on or before the formation date, the first report
falls in the anniversary month of the following year. Calendar: `anniversary-month first, every 1,
offset 1`. (wyobiz.wyo.gov, sos.wyo.gov and wyoleg.gov refused connections from this machine.)

## New Mexico (V by the statute's fee schedule)

| Fact | Source | Quote |
|---|---|---|
| No annual report / no annual fee | [NMSA § 53-19-63 (official NMSA, NM Compilation Commission)](https://nmonesource.com/nmos/nmsa/en/4400/1/document.do) | "53-19-63. Filing, service and copying fees. The secretary of state shall charge and collect: A. for filing the original articles of organization … fifty dollars ($50.00); …" — the list (A–M) contains formation, amendment, merger, dissolution, certificate, name, agent-change and foreign-registration fees and **no annual report or annual fee**. |

Caveat: no live SOS page states "no annual report" in words (enterprise.sos.nm.gov 403;
businessportal.nm.gov unreachable / expired certificate; old SOS LLC FAQ URLs 404; an archived SOS
LLC maintenance page [WB 2024-12-17] lists no annual report). The page words this as "no annual
report and no annual fee" and cites the statute.

## Florida (V)

| Fact | Source | Quote |
|---|---|---|
| $138.75 total | [Sunbiz — Annual report](https://dos.fl.gov/sunbiz/manage-business/efile/annual-report/) [WB 2026-08-18] | "Annual Report - Limited Liability Company $138.75" |
| = $50 report fee | [Fla. Stat. § 605.0213(5)](https://www.flsenate.gov/Laws/Statutes/2025/605.0213) | "For filing an annual report, $50." |
| + $88.75 supplemental fee; $400 late charge | [Fla. Stat. § 607.193](https://www.flsenate.gov/Laws/Statutes/2025/607.193) | "an annual supplemental corporate fee of $88.75 is imposed on each business entity … required to file an annual report … under s. 605.0212" · "a late charge of $400 shall be imposed if the supplemental corporate fee is remitted after May 1" |
| Window + first year | [Fla. Stat. § 605.0212(3)](https://www.flsenate.gov/Laws/Statutes/2025/605.0212) | "first annual report must be delivered … between January 1 and May 1 of the year following the calendar year in which … articles of organization became effective" |
| Sunbiz late fee wording | Sunbiz [WB] | "until 11:59 PM EST on Friday May 1, 2026, before a $400 late fee is assessed. Annual reports are due by the third Friday in September to avoid administrative dissolution." |

Calendar: `fixed-date 5/1, offset 1`.

## Nevada (V from NRS; SOS site unreachable)

| Fact | Source | Quote |
|---|---|---|
| Annual list $150 | [NRS 86.263(4)(b)](https://www.leg.state.nv.us/NRS/NRS-086.html) [WB 2026-08-28, "Rev. 4/15/2026"] | "Each annual list … a fee of $150." |
| Due last day of anniversary month | NRS 86.263(2) | "on or before the last day of the month in which the anniversary date of its organization occurs" |
| Initial list at formation; alternative due date | NRS 86.263(1) | "at the time of the filing of its articles of organization with the Secretary of State, or, if the limited-liability company has selected an alternative due date pursuant to subsection 12, on or before that alternative due date" |
| List penalty $75 | NRS 86.272(3) | "there must be added to the amount of the fee a penalty of $75" |
| Business license $200 with the list | [NRS 76.130(1)](https://www.leg.state.nv.us/NRS/NRS-076.html) [WB 2026-09-17] | "a fee in the amount of $200 … at the time the person submits the annual list" |
| License penalty $100 | NRS 76.130(4)(a)(1) | "Shall pay a penalty of $100 in addition to the annual state business license fee" |

nvsos.gov (Incapsula bot wall) and leg.state.nv.us (403 live) could not be fetched directly; the
already-verified fact ($150 + $200; NRS 86.263 / 76.100) matches. Calendar: `anniversary-month
last, every 1, offset 1` for both items.


## Texas (V)

| Fact | Source | Quote |
|---|---|---|
| No-tax-due threshold $2,650,000 for 2026 and 2027 reports | [Comptroller — Franchise tax](https://comptroller.texas.gov/taxes/franchise/) | "2026 and 2027 Item Amount No Tax Due Threshold $2,650,000" |
| Due 15 May; weekend/holiday → next business day | same | "The annual franchise tax report is due May 15. If May 15 falls on a weekend or holiday, the due date will be the next business day." |
| Statute | [Tax Code § 171.202](https://tcss.legis.texas.gov/resources/TX/htm/TX.171.htm) | "before May 16 of each year after the beginning of the regular annual period" |
| First report = year after SOS registration | [Comptroller — Franchise tax FAQ](https://comptroller.texas.gov/taxes/franchise/faq/) | "registered with the SOS on Dec. 20, 2023 … on its 2024 'first annual' franchise tax report" |
| SMLLCs are covered | [Comptroller publication 98-806](https://comptroller.texas.gov/taxes/publications/98-806.php) | "limited liability companies (LLCs), including single member LLCs (SMLLCs)" |
| No No-Tax-Due report from 2024, but PIR still required | [Comptroller — NTD report updates](https://comptroller.texas.gov/taxes/franchise/ntd-rpt-updates-2024.php) | "is not required to file a No Tax Due Report. However, the entity is required to file Form 05-102, Public Information Report" |
| PIR due with the report | [Comptroller — PIR/OIR requirements](https://comptroller.texas.gov/taxes/franchise/pir-oir-filing-req.php) | "The PIR is due on the annual franchise tax report due date." |
| Late penalty $50 | publication 98-806 | "There is a $50 penalty for a franchise tax report filed after the due date, even if no tax is due" |
| No SOS annual report | [Texas SOS — formation FAQs](https://www.sos.state.tx.us/corp/formationfaqs.shtml) | "LLCs … that are subject to state franchise tax laws file annually with the Comptroller of Public Accounts." |

Calendar rule: 15 May every year from the year after formation (`fixed-date 5/15, offset 1`). The
date is shown unrolled with the Comptroller's next-business-day wording in the text.

## New York (V)

| Fact | Source | Quote |
|---|---|---|
| Biennial statement fee $9 | [NY DOS — Biennial statements](https://dos.ny.gov/biennial-statements-business-corporations-and-limited-liability-companies) † | "The fee for filing a Biennial Statement for a business corporation or LLC is $9." |
| Filing period = formation month, every two years | same † | "The filing period for a business corporation or LLC is the calendar month in which its original Certificate of Incorporation, Articles of Organization, or Application for Authority was filed … The Biennial Statement must be filed every two years." |
| Consequence | same † | "will be reflected in the New York Department of State's records as past due in the filing of its Biennial Statement." |
| Statute | [NY LLC Law § 301(e)](https://www.nysenate.gov/legislation/laws/LLC/301) † | "biennially in the calendar month during which its articles of organization … were filed" |
| Publication within 120 days (one time) | [NY LLC Law § 206](https://www.nysenate.gov/legislation/laws/LLC/206) † | "Within one hundred twenty days after the effectiveness of the initial articles of organization … shall be published once in each week for six successive weeks, in two newspapers of the county" |
| Suspension if not done | same † | "the authority of such limited liability company to carry on, conduct or transact any business in this state shall be suspended" |
| Certificate of Publication fee $50 | [NY DOS — FAQs](https://dos.ny.gov/faqs-corporations-business-entities) † | "The fee for filing the Certificate of Publication is $50." |
| LLC filing fee $25 (disregarded SMLLC), only with NY-source items | [IT-204-LL instructions](https://www.tax.ny.gov/pdf/current_forms/it/it204lli.pdf) | "If your LLC is treated as a disregarded entity … the filing fee is $25." (applies if the LLC "has any income, gain, loss, or deduction from New York sources") |
| IT-204-LL due date | same | "on or before the 15th day of the third month following the close of your calendar or fiscal tax year" |

Calendar: biennial statement dated at the last day of the formation month every 2 years from
formation + 2 (inference from "every two years" + "calendar month"; the page says so); publication
dated formation + 120 days (only shown if still in the window). IT-204-LL is conditional → "Also check".

## California (V)

| Fact | Source | Quote |
|---|---|---|
| $800 annual tax | [FTB — LLC](https://www.ftb.ca.gov/file/business/types/limited-liability-company/index.html) | "Every LLC that is doing business or organized in California must pay an annual tax of $800. This yearly tax will be due, even if you are not conducting business, until you cancel your LLC." |
| First-year due date | same | "You have until the 15th day of the 4th month from the date you file with the SOS to pay your first-year annual tax." Example: "register with SOS on June 18, 2020. Your annual LLC tax will be due on September 15, 2020" |
| Later years | same | "Your subsequent annual tax payments will continue to be due on the 15th day of the 4th month of your taxable year." |
| First-year exemption expired (2021–2023 only) | same | "For tax years beginning on or after January 1, 2021, and before January 1, 2024, LLCs that organize, register, or file with the Secretary of State to do business in California are not subject to the annual tax of $800 for their first tax year." |
| 15-day rule | [FTB — Single-member LLC](https://www.ftb.ca.gov/file/business/types/limited-liability-company/single-member-llc.html) | "They did not conduct any business in California during the tax year Their tax year was 15 days or fewer" |
| SMLLC files Form 568 | same | "We require an SMLLC to file Form 568 , even though they are considered a disregarded entity for tax purposes." |
| Form 568 due (SMLLC owned by an individual) | [FTB — Business due dates](https://www.ftb.ca.gov/file/when-to-file/due-dates-business.html) | "Single member LLC (owned by an individual or a non-pass through entity) Return due date 15th day of the 4th month after the close of your tax year. Extended filing due date 15th day of the 10th month" |
| LLC fee (FTB 3536) $900–$11,790 from $250,000 income; estimate by 15th day of 6th month | FTB — LLC; Business due dates | "You must estimate and pay the fee by the 15th day of the 6th month of the current tax year." |
| Statement of Information $20, 90 days then every 2 years | [CA SOS — LLC Statement of Information](https://www.sos.ca.gov/business-programs/business-entities/forms/limited-liability-companies-statement-information) | "Due within 90 days of initial registration and every two years thereafter. Form LLC-12 (PDF) $20.00" |
| SOI filing window | [Corp. Code § 17702.09](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CORP&sectionNum=17702.09) | "the calendar month during which its original articles of organization was filed … and the immediately preceding five calendar months" |
| SOI penalty $250 | [Corp. Code § 17713.07](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CORP&sectionNum=17713.07) | "within 60 days after providing notice of the delinquency … a penalty of two hundred fifty dollars ($250)" |

Calendar: $800 via `tax-year-month 4/15` (first year counted from formation, matches FTB's June 18 →
September 15 example); Form 568 via `after-tax-year-end 4/15`; initial SOI formation + 90 days;
biennial SOI at the end of the formation month every 2 years. LLC fee is conditional → "Also check".

## Colorado (fee V, report month U)

| Fact | Source | Quote |
|---|---|---|
| Periodic report $25, late $50 | [CO SOS — Business fees](https://www.sos.state.co.us/pubs/info_center/fees/business.html) | "Periodic Report $25.00 n/a Periodic Report Late Filing Penalty $50.00" |
| Every year | [CO SOS — Periodic reports FAQ](https://www.sos.state.co.us/pubs/business/FAQs/reports.html) | "required by law to submit a Periodic Report each year to the Secretary of State" |
| Filing window around the report month | same | "You can find your reporting month on the entity's Summary page under 'Periodic report month'. The Periodic Report can be filed two months prior to the Periodic Report month or two months after without any penalty." |
| Fee change | CO SOS press release, 17 June 2024 | "Beginning July 1, 2024, the Periodic Report filing fee will increase to $25." |

**U:** how the Periodic Report Month is assigned (commonly said to be the formation month) and the
year of the first report. Tried: C.R.S. Title 7 PDFs on leg.colorado.gov / content.leg.colorado.gov
(HTTP 403), CO SOS help pages (REPORT_HELP, LLC checklist), glossary and filing FAQs. The table says
"verify with the state"; the calendar lists Colorado under "Also check" without a date.

## Montana (V)

| Fact | Source | Quote |
|---|---|---|
| $20 on time, $35 after 15 April | [MT SOS — fee schedule PDF](https://sosmt.gov/wp-content/uploads/business_filing_fees.pdf) | "Annual report prior to April 15th … $20.00 Annual report after April 15th … $35.00" |
| On-time fee currently waived | [MT SOS — Fees](https://sosmt.gov/business/fees/) | "Annual Report – Prior To April 15th WAIVED Annual Report – After April 15th $35.00" |
| Waived in 2026 and 2027 | [MT SOS press release](https://sosmt.gov/secretary-christi-jacobsen-continues-montana-business-support-by-waiving-fees-once-again/) | "waiving the annual report filing fee in 2026. She also announced that it will be waived again in 2027" |
| First report the year after formation, 1 Jan – 15 Apr | [MCA § 35-8-208(3)](https://mca.legmt.gov/bills/mca/title_0350/chapter_0080/part_0020/section_0080/0350-0080-0020-0080.html) | "The first annual report must be delivered … between January 1 and April 15 of the year following the calendar year in which a domestic limited liability company is organized" |

Calendar: 15 April every year from formation + 1.
