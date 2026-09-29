# Research note — foreign-owned LLC compliance calendar (federal rules)

Tool: `/foreign-owned-llc-compliance-calendar` · logic: `src/lib/tools/compliance-calendar/`
State rules: see `docs/research/state-fees.md` (shared data in `src/lib/tools/state-fees/`).
All sources retrieved **2026-09-29** (curl with a browser User-Agent). Quotes are verbatim.

## 1. What is due, and when

| Fact used in the tool | Source | Verbatim quote |
|---|---|---|
| A foreign-owned DE files a pro forma Form 1120 with Form 5472 attached, due on the Form 1120 due date | [Instructions for Form 5472 (Rev. December 2024)](https://www.irs.gov/instructions/i5472), "When and Where To File" | "it will now be required to file a pro forma Form 1120 … with Form 5472 attached by the due date (including extensions) of that Form 1120." |
| The DE's tax year = the owner's US tax year, or the calendar year if the owner has none (why the tool defaults to 31 December) | same | "The foreign-owned U.S. DE has the same tax year used by its owner for U.S. tax filing requirements or, if none, the calendar year." |
| Filing channel: fax or mail to the Ogden PIN Unit | same | "File these forms by: Fax (300 DPI or higher) to 855-887-7737, or Mail to: Internal Revenue Service 1973 Rulon White Blvd M/S 6112 Attn: PIN Unit Ogden, UT 84201" |
| Form 1120 due date: 15th day of the 4th month after year end; short first year the same, counted from the short period's end | [Instructions for Form 1120 (2025)](https://www.irs.gov/instructions/i1120), "When To File" | "Generally, a corporation must file its income tax return by the 15th day of the 4th month after the end of its tax year. A new corporation filing a short-period return must generally file by the 15th day of the 4th month after the short period ends." |
| June 30 fiscal year exception | same | "However, a corporation with a fiscal tax year ending June 30 must file by the 15th day of the 3rd month after the end of its tax year." |
| …which ends for tax years beginning after 2025 | [Pub. L. 114-41 § 2006(a)(3)(B)](https://www.govinfo.gov/content/pkg/PLAW-114publ41/html/PLAW-114publ41.htm) | "In the case of any C corporation with a taxable year ending on June 30, the amendments made by this subsection shall apply to returns for taxable years beginning after December 31, 2025." |
| Statutory general rule (fiscal years) | [26 U.S.C. § 6072(a)](https://www.law.cornell.edu/uscode/text/26/6072) | "returns made on the basis of a fiscal year shall be filed on or before the 15th day of the fourth month following the close of the fiscal year" |
| Weekend / holiday roll (IRS wording) | Instructions for Form 1120 (2025), "When To File" | "If the due date falls on a Saturday, Sunday, or legal holiday, the corporation can file on the next business day." |
| Weekend / holiday roll (statute; DC holidays) | [26 U.S.C. § 7503](https://www.law.cornell.edu/uscode/text/26/7503) | "the performance of such act shall be considered timely if it is performed on the next succeeding day which is not a Saturday, Sunday, or a legal holiday" … "the term “legal holiday” means a legal holiday in the District of Columbia" |

## 2. Extension (Form 7004)

| Fact | Source | Verbatim quote |
|---|---|---|
| DE files Form 7004 by the regular due date, marked "Foreign-owned U.S. DE", by fax or mail | [Instructions for Form 5472](https://www.irs.gov/instructions/i5472), "Extension of time to file" | "The DE must file Form 7004 by the regular due date of the return." … "“Foreign-owned U.S. DE” should be written across the top of Form 7004." |
| Extension length: 6 months | [Instructions for Form 7004 (Rev. December 2025)](https://www.irs.gov/instructions/i7004), "Extension Period" | "The automatic extension period for time to file is generally 6 months." |
| June 30 years beginning before 2026: 7 months; from 2026: 6 months | same | "C corporations with tax years ending June 30 and beginning before January 1, 2026, are eligible for an automatic 7-month extension of time to file … For tax years beginning in 2026, the automatic extension period is 6 months." |
| Regulation (6-month automatic extension) | [Treas. Reg. § 1.6081-3(a) (eCFR)](https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/section-1.6081-3) | "will be allowed an automatic 6-month extension of time to file its income tax return after the date prescribed for filing the return" |

Note: the statute (26 U.S.C. § 6081(b)) still contains a "5 months" substitution for calendar-year
C corporations with years beginning before 2026, but the regulation and current IRS instructions
grant 6 months (April 15 → October 15). The tool follows the IRS instructions / regulation, as does
the site's existing Form 5472 deadline calculator (`src/lib/schemas.ts` `effectiveDueDateUtc`).

## 3. Which years need a Form 5472

| Fact | Source | Verbatim quote |
|---|---|---|
| Formation-year and owner contributions/distributions are reportable for a DE | [Instructions for Form 5472](https://www.irs.gov/instructions/i5472), Part V | "These transactions include amounts paid or received in connection with the formation, dissolution, acquisition, and disposition of the entity, including contributions to, and distributions from, the entity." |
| Penalty (context only, not used in date math) | same, "Penalties" | "A penalty of $25,000 will be assessed on any reporting corporation that fails to file Form 5472 when due and in the manner prescribed." |

## 4. BOI (FinCEN) — no calendar entry

| Fact | Source | Verbatim quote |
|---|---|---|
| Interim final rule (published 26 March 2025) exempted all US-created entities | [FinCEN — BOI](https://www.fincen.gov/boi) | "all entities created in the United States — including those previously known as “domestic reporting companies” — and their beneficial owners will be exempt from the requirement to report BOI to FinCEN." |
| Final rule issued 11 August 2026, effective 14 August 2026, made it permanent | same (banner "ALERT [Updated August 11, 2026]") | "U.S. companies are exempt from the Beneficial Ownership Information (BOI) reporting requirements and therefore, are no longer required to file BOI reports." … "The final rule became effective on August 14, 2026." |

The calendar therefore lists **no** BOI deadline and says so. Foreign-formed companies registered to
do business in a US state remain reporting companies — outside this tool's audience (US-formed LLCs).

## 5. Implementation contract

- Federal math: `federalDueFor()` in `src/lib/tools/compliance-calendar/federal.ts`.
  Original = 15th of (FYE month + 4) (+3 for June FYE years beginning before 2026-01-01);
  extended = original statutory + 6 months (7 for the June transition), day 15; both rolled with
  `nextBusinessDay()` from `src/lib/federalHolidays.ts` (shared with the existing deadline calculator).
- Unit test `federal.test.ts` asserts equality with `filingDueDateUtc` / `effectiveDueDateUtc` for
  every calendar year 2018–2035, so the two tools cannot drift.
- State dates are never rolled (the federal §7503 rule does not govern state deadlines); where a
  state's own source allows the next business day (Texas, California FTB), the entry's text says so.
- Window: the reader's local "today" through 18 months (minus a day). A recurring state filing with
  no date inside the window (e.g. a biennial report due just after it) is listed as "Next, just after
  this window" and included in the .ics. One-time filings already past are dropped.
- Conditional state items (NY IT-204-LL, CA LLC fee) are listed under "Also check" without a date.
  Colorado's periodic report is dated from C.R.S. § 7-90-501(4)(c)(I) (see state-fees.md).
- .ics: RFC 5545 all-day VEVENTs (DTSTART;VALUE=DATE + exclusive DTEND), stable UIDs
  (`<event-id>-<state>-<formed>@form5472prep.com`), escaped TEXT, 75-octet folding, CRLF, one
  14-day VALARM per event; generated client-side (`ics.ts`, tested in `ics.test.ts`).
- Shareable URL: `?state=DE&formed=2024-03-10&fye=12-31&ext=0` (`params.ts`); only month-end
  `fye` values are accepted, invalid parameters are reported in the UI and fall back to defaults.
- Fiscal years are month-end only; 52–53-week years are not supported.
- Not modelled: dissolution short years (use the deadline calculator), FBAR or other conditional
  federal filings, state income/franchise tax returns other than those listed in `state-fees.md`.
