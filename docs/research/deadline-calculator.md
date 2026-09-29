# Research note: Form 5472 deadline calculator

Tool: `/form-5472-deadline-calculator`. URL state: `src/lib/tools/deadline/params.ts`; sources:
`src/lib/tools/deadline/sources.ts`. The date math is the shared due-date code the filing workflow
uses (`filingDueDateUtc` / `effectiveDueDateUtc` in `src/lib/schemas.ts`, holidays in
`src/lib/federalHolidays.ts`); this work did not change it. Researched and last reviewed
2026-09-29; all sources fetched live that day.

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

## Known gap in the shared due-date code (flagged, not changed)

i1120 (2025 instructions): "However, a corporation with a fiscal tax year ending June 30 must file by
the 15th day of the 3rd month after the end of its tax year. A corporation with a short tax year
ending anytime in June will be treated as if the short year ended on June 30, and must file by the
15th day of the 3rd month after the end of its tax year."
i7004: "C corporations with tax years ending June 30 and beginning before January 1, 2026, are
eligible for an automatic 7-month extension of time to file ... For tax years beginning in 2026, the
automatic extension period is 6 months."

`filingDueDateUtc` always uses the 4th month, so for an LLC that dissolved in June of a tax year that
began before 2026 the unextended date shown is one month later than the instructions' date (with an
extension both land on April 15). The brief did not allow changing the shared code or the
calculator's results, so the result now shows a caution for that case
(`isJuneShortYearBefore2026`) and the page lists it under "What the calculator does not cover".
Whether the June rule applies to a pro forma Form 1120 filed by a disregarded entity is an
interpretation question for the owner/accountant. (`extensionUnclear` in `schemas.ts` only checks a
June 30 date, while i1120 says "anytime in June".)

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
