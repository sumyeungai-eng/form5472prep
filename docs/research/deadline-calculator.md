# Research note: Form 5472 deadline calculator

Tool: `/form-5472-deadline-calculator`. URL state: `src/lib/tools/deadline/params.ts`; sources:
`src/lib/tools/deadline/sources.ts`. The date math is the shared due-date code the filing workflow
uses (`filingDueDateUtc` / `effectiveDueDateUtc` in `src/lib/schemas.ts`, holidays in
`src/lib/federalHolidays.ts`). Since 2026-09-30 the Form 1120 rule itself (general 4th month / 6
months, and the pre-2026 June rule) lives in `src/lib/form1120DueDate.ts`, shared with the
compliance calendar (`src/lib/tools/compliance-calendar/federal.ts`). Researched 2026-09-29; the
June rule sources below re-fetched live and re-quoted 2026-09-30.

## Shareable URL

`?year=2025&dissolved=2025-06-30&ext=1`

- `year`: tax year, one of the seven the form offers (this UTC year and the six before). Always
  written, because the default year moves every January.
- `dissolved`: final short-year dissolution date, `YYYY-MM-DD`, must fall inside `year`. Omitted when
  not dissolved (a ticked box with no date gives the same result as unticked, so it is not stored).
- `ext`: `1` when a timely Form 7004 was filed. Omitted otherwise.

Invalid or out-of-range values fall back to the defaults. A plain visit keeps the plain URL until
the visitor changes an input. Other params (utm_*) are kept. Tests: `params.test.ts` (round trip,
fallbacks, and the due dates the page states).

## Rules and sources

### Regular due date
- Form 5472 instructions (Rev. 12/2024), <https://www.irs.gov/instructions/i5472> ("Last Reviewed or
  Updated: 30-Apr-2026"): "it will now be required to file a pro forma Form 1120, U.S. Corporation
  Income Tax Return, with Form 5472 attached by the due date (including extensions) of that Form
  1120."
- Form 1120 instructions, When To File, <https://www.irs.gov/instructions/i1120> ("Last Reviewed or
  Updated: 30-Apr-2026"): "Generally, a corporation must file its income tax return by the 15th day
  of the 4th month after the end of its tax year."
- IRC §6072(a), <https://www.law.cornell.edu/uscode/text/26/6072>: "returns made on the basis of a
  fiscal year shall be filed on or before the 15th day of the fourth month following the close of the
  fiscal year". (The corporate rule is in (a) since the 2015 amendment; (b) now covers partnerships
  and S corporations.)

### Weekend and legal-holiday roll
- IRC §7503, <https://www.law.cornell.edu/uscode/text/26/7503>: "When the last day prescribed under
  authority of the internal revenue laws for performing any act falls on Saturday, Sunday, or a legal
  holiday, the performance of such act shall be considered timely if it is performed on the next
  succeeding day"; "the term 'legal holiday' means a legal holiday in the District of Columbia".
- i1120: "If the due date falls on a Saturday, Sunday, or legal holiday, the corporation can file on
  the next business day."
- IRS Publication 509 (2026), Tax Calendars, <https://www.irs.gov/publications/p509> ("Last Reviewed
  or Updated: 30-Apr-2026"), legal holidays for 2026 include "April 16—District of Columbia
  Emancipation Day".

### Dissolution short year
- i1120: "A corporation that has dissolved must generally file by the 15th day of the 4th month after
  the date it dissolved." The calculator reads this as the 15th of the 4th month after the month of
  dissolution.

### Form 7004 extension
- Form 7004 instructions, <https://www.irs.gov/instructions/i7004> ("Last Reviewed or Updated:
  30-Apr-2026"): "Generally, Form 7004 must be filed on or before the due date of the applicable tax
  return." / "The automatic extension period for time to file is generally 6 months."
- i5472: "The DE must file Form 7004 by the regular due date of the return."

### June year-ends that began before 2026 (applied 2026-09-30)
Owner decision 2026-09-30: apply the rule to the pro forma Form 1120, including a dissolution
short year ending in June. Sources fetched with curl (browser User-Agent) on 2026-09-30:
- Instructions for Form 1120 (2025), When To File, <https://www.irs.gov/instructions/i1120> ("Page
  Last Reviewed or Updated: 30-Apr-2026"): "However, a corporation with a fiscal tax year ending
  June 30 must file by the 15th day of the 3rd month after the end of its tax year. A corporation
  with a short tax year ending anytime in June will be treated as if the short year ended on June
  30, and must file by the 15th day of the 3rd month after the end of its tax year."
- Instructions for Form 7004 (Rev. 12/2025), Extension Period, <https://www.irs.gov/instructions/i7004>:
  "C corporations with tax years ending June 30 and beginning before January 1, 2026, are eligible
  for an automatic 7-month extension of time to file (6-month extension if filing Form 1120-POL).
  For tax years beginning in 2026, the automatic extension period is 6 months." and "Note: A
  corporation with a short tax year ending anytime in June is treated as if the short tax year
  ended on June 30."
- Pub. L. 114-41 §2006(a)(3)(B),
  <https://www.govinfo.gov/content/pkg/PLAW-114publ41/html/PLAW-114publ41.htm>: "In the case of any
  C corporation with a taxable year ending on June 30, the amendments made by this subsection shall
  apply to returns for taxable years beginning after December 31, 2025." (The subsection is the one
  that moved C corporations to the 4th month under IRC §6072.)
- Pub. L. 114-41 §2006(c)(1)(B), same URL, adding to IRC §6081(b): "In the case of any return for a
  taxable year of a C corporation which ends on June 30 and begins before January 1, 2026, the
  first sentence of this subsection shall be applied by substituting `7 months' for `6 months'."

What the code does (`form1120DueRule` / `form1120StatutoryDue`): a tax year whose end month is June
and whose first day is before 2026-01-01 is due on the 15th of the 3rd month after June (September
15) and a timely Form 7004 adds 7 months to that unrolled date (April 15); every other year uses the
4th month and 6 months. The day inside June never matters ("anytime in June"). In the calculator's
calendar-year model the year starts in `taxYear`, so the test is simply `taxYear < 2026` with a
June dissolution date. The §7503 roll is applied last, as before.

Tests: `src/lib/form1120DueDate.test.ts` (FYE 30 Jun 2025 begun 1 Jul 2024 → 15 Sep 2025 / 15 Apr
2026; dissolved 30 Jun 2025 → 15 Sep 2025; FYE 30 Jun 2026 begun 1 Jul 2025 → 15 Sep 2026; June
years begun in 2026 → 15 Oct / 6 months; every other month and calendar year pinned to the old
formula; calculator and compliance calendar equal for every month-end short year 2018–2035) and
`src/lib/tools/deadline/params.test.ts` ("June rule shown on the page").

### Missed deadline
- IRS, Delinquent international information return submission procedures,
  <https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures>
  ("Last Reviewed or Updated: 19-Apr-2026"): eligible taxpayers are those "not under a civil
  examination or a criminal investigation by the IRS and have not already been contacted by the IRS
  about the delinquent information returns"; "Penalties may be assessed in accordance with existing
  procedures."

### Filing method (FAQ)
- i5472: "If you are a foreign-owned U.S. DE, you cannot file Form 5472 electronically." Fax to
  855-887-7737 or mail to the Ogden PIN Unit.

## Former gap, closed 2026-09-30

Until 2026-09-30 `filingDueDateUtc` always used the 4th month, and the calculator showed a caution
(`isJuneShortYearBefore2026`, now removed) for a June dissolution in a year that began before 2026.
The shared code now applies the June rule (section above) and the result shows a short note saying
which rule produced the date. Still open for the owner: `extensionUnclear` in `schemas.ts` keeps
routing a final year ending exactly June 30 before 2026 with "Form 7004 filed = yes" to reviewer
review (it predates the owner's decision, and checks June 30 only while the rule covers any June
day); the filing workflow's delinquency answer for that case is therefore still "defer".

## Other limits stated on the page
- Calendar tax year assumed. i5472: "The foreign-owned U.S. DE has the same tax year used by its
  owner for U.S. tax filing requirements or, if none, the calendar year."
- The calculator takes the visitor's word that the Form 7004 was filed on time.

## Claims softened / corrected on the page (old → new)

| Where | Old | New | Why |
|---|---|---|---|
| "How does the weekend roll work?" card | "moves a Saturday or Sunday due date to the next Monday" | Saturday, Sunday or DC legal holiday → next business day, incl. DC Emancipation Day | The code already rolls past DC holidays (§7503); the copy under-described it. |
| Section subtitle | "move weekend dates to the next Monday, and extend timely Form 7004 filings to October 15" | "add six months for a timely Form 7004, and move a date that lands on a weekend or DC legal holiday to the next business day" | Same; October 15 is only the calendar-year case. |
| Form 7004 card and FAQ | "extends the Form 5472 package to October 15"; "filed by the original April 15 deadline" | "generally 6 months: October 15 for a calendar year, or six months after a short-year due date"; "filed by the regular due date" | i7004 / i5472 wording. |
| FAQ "What if the deadline already passed?" | "DIIRSP … with a reasonable-cause statement is the standard remedy" | DIIRSP eligibility conditions, statement optional, "Penalties may still be assessed" | No source for "standard remedy". |
| Overdue result text | "Late filing under DIIRSP with a reasonable-cause statement is the standard path." | "If the IRS hasn't contacted you, its DIIRSP procedures say to file the late return through normal filing procedures, optionally with a reasonable-cause statement. Penalties may still be assessed." | Same. |
| Hero answer | "is due April 15 … handles weekend rolls and dissolution short-years" | "for a calendar-year … LLC is due April 15 … handles weekend and holiday rolls, dissolution short years and Form 7004 extensions" | Precision. |
