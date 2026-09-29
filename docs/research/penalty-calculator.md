# Research note: Form 5472 penalty calculator

Tool: `/form-5472-penalty-calculator`. URL state: `src/lib/tools/penalty/params.ts`; sources:
`src/lib/tools/penalty/sources.ts`. The arithmetic is the shared `src/lib/penalty.ts` (unchanged).
Researched and last reviewed 2026-09-29; all sources fetched live that day. The 2026-09-29
fact-check corrections (no "frequently successful", CP 215, "can assess, often automatically when a
late return is processed") are kept.

## Shareable URL

`?llcs=2&years=3&notice=2026-03-02`

- `llcs`: number of LLCs, 1-10 (omitted when 1).
- `years`: unfiled tax years per LLC, 1-6 (omitted when 1).
- `notice`: IRS notice date `YYYY-MM-DD`, not after the viewer's today (omitted when none).

Anything outside the form's own choices falls back to the default. A shared link with a notice date
is re-estimated as of the viewer's today, because continuation periods keep accruing. Other params
(utm_*) are kept. Tests: `params.test.ts` (round trip, fallbacks, and the arithmetic the page
states).

## Rules and sources

### Initial penalty
- IRC §6038A(d)(1), <https://www.law.cornell.edu/uscode/text/26/6038A>: "such corporation shall pay a
  penalty of $25,000 for each taxable year with respect to which such failure occurs."
- Treas. Reg. §1.6038A-4(a)(1), <https://www.ecfr.gov/current/title-26/section-1.6038A-4>: "a penalty
  of $25,000 shall be assessed for each taxable year with respect to which such failure occurs." /
  "The filing of a substantially incomplete Form 5472 constitutes a failure to file Form 5472."
- IRS, International information reporting penalties,
  <https://www.irs.gov/payments/international-information-reporting-penalties> ("Last Reviewed or
  Updated: 20-Aug-2026"): "You may be subject to a penalty of $25,000 for each failure to file a
  complete and correct Form 5472 by the due date."
- IRM 20.1.9.5.4, <https://www.irs.gov/irm/part20/irm_20-001-009> ("Last Reviewed or Updated:
  30-Apr-2026"): "The initial penalty is asserted once per related party per taxable year even if
  multiple infractions have occurred".
- Form 5472 instructions, <https://www.irs.gov/instructions/i5472>: "File a separate Form 5472 for
  each foreign or U.S. person who is a related party with which the reporting corporation had a
  reportable transaction." / "A penalty of $25,000 will be assessed on any reporting corporation that
  fails to file Form 5472 when due and in the manner prescribed."

Method: initial = $25,000 × LLCs × unfiled years, i.e. one Form 5472 (one related party) per LLC
per year. The page says an LLC with more related parties can face more.

### Continuation penalty
- IRC §6038A(d)(2): "If any failure described in paragraph (1) continues for more than 90 days after
  the day on which the Secretary mails notice of such failure to the reporting corporation, such
  corporation shall pay a penalty" of $25,000 "for each 30-day period (or fraction thereof)".
- Reg. §1.6038A-4(d)(1): "continues for more than 90 days after the day on which the District
  Director or the Director of the Internal Revenue Service Center ... mails notice of the failure to
  the reporting corporation".
- i5472: "If the failure continues for more than 90 days after notification by the IRS, an
  additional penalty of $25,000 will apply. This penalty applies with respect to each related party
  for which a failure occurs for each 30-day period (or part of a 30-day period) during which the
  failure continues after the 90-day period ends."
- IRS international penalties page: "There is no maximum penalty amount."

Method (`continuationPeriods`): from the notice date entered, day 91 starts period 1; periods =
ceil(days after day 90 / 30); multiplied by LLCs × years; as of today. The page says the statute
counts from the mailing date and we use the date entered.

### How it is assessed
- IRM 20.1.9.5.3: "Penalties may be systemically asserted during initial processing of a late-filed
  Form 5472 that is attached to a late-filed Form 1120".
- IRM 20.1.9.5.2: "Once a penalty is assessed (systemically, by the campus, or via processing of Form
  8278 in field cases) a BMF, CP 215, Notice of Penalty Charge, for penalties assessed on MFT 13 with
  PRN 625 is generated and sent to the taxpayer."
- IRS, Understanding your CP215 notice,
  <https://www.irs.gov/individuals/understanding-your-cp215-notice> ("Last Reviewed or Updated:
  29-Jan-2026"): "We sent you this notice because we charged you a civil penalty."
- A CP15 page does not exist on irs.gov (`/individuals/understanding-your-cp15-notice` returns 404);
  IRM 20.1.9 shows a sample CP 15 for other (IMF) penalties. The page therefore names CP 215 only.

### What the estimate leaves out
- Reasonable cause, Reg. §1.6038A-4(b): "Certain failures may be excused for reasonable cause,
  including not timely filing Form 5472"; (b)(2)(ii): "The District Director shall apply the
  reasonable cause exception liberally in the case of a small corporation that had no knowledge of
  the requirements imposed by section 6038A; has limited presence in and contact with the United
  States; and promptly and fully complies with all requests". (Quotes verified for the late-filing
  checker the same day: docs/research/late-filing.md §4.)
- IRC §6038A(d)(3): the time and the start of the 90-day period are "treated as not earlier than the
  last day on which (as shown to the satisfaction of the Secretary) reasonable cause existed".
- First Time Abate: IRS, Administrative penalty relief,
  <https://www.irs.gov/payments/administrative-penalty-relief>: the eligible-penalty list contains
  only IRC 6651(a)(1), 6698(a)(1), 6699(a)(1), 6651(a)(2), 6651(a)(3) and 6656 (see
  docs/research/late-filing.md §5; IRM 20.1.9.5.5 "The first time abatement (FTA) penalty relief
  provisions do not apply to event-based filing requirements such as with Form 5472").

### Filing late before contact
- DIIRSP page ("Last Reviewed or Updated: 19-Apr-2026"): "not under a civil examination or a criminal
  investigation by the IRS and have not already been contacted by the IRS about the delinquent
  information returns"; "Penalties may be assessed in accordance with existing procedures."

### Assessment period
- IRC §6501(c)(8)(A), <https://www.law.cornell.edu/uscode/text/26/6501>: for information required
  under section 6038A, "the time for assessment of any tax imposed by this title with respect to any
  tax return, event, or period to which such information relates shall not expire before the date
  which is 3 years after the date on which the Secretary is furnished the information required to be
  reported under such section." (B): if the failure "is due to reasonable cause and not willful
  neglect, subparagraph (A) shall apply only to the item or items related to such failure."

## Claims softened / corrected on the page (old → new)

| Where | Old | New | Why |
|---|---|---|---|
| FAQ "Is the Form 5472 penalty really automatic?" | "Yes. IRC §6038A(d) provides …" | "It can be. … The IRS manual says the penalty may be assessed systemically when a late Form 5472 is processed with a late Form 1120." | IRM says "may be systemically asserted"; matches the corrected hero ("can assess"). |
| FAQ "What is a CP15 notice?" | Question named CP15; "It is an IRS notice assessing a civil penalty." | "What is a CP 215 notice?" — "the IRS's Notice of Penalty Charge … generated and sent once a Form 5472 penalty is assessed" | No CP15 page on irs.gov; IRM names CP 215 for Form 5472. |
| Calculator checkbox | "(e.g. CP15)" | "(e.g. CP 215)" | Same. |
| FAQ "Is there a statute of limitations?" | "There effectively is not one until a complete or substantially complete return is filed." | IRC §6501(c)(8) wording: assessment time doesn't expire until 3 years after the information is furnished. | "Effectively none" is an inference; stated what the statute says. |
| "The fix" box | "…is the standard resolution path for many late Form 5472 cases." | DIIRSP eligibility conditions + "may attach a reasonable-cause statement" | No source for "standard … for many". |
| Hero card | "…paired with the relief path late filers commonly use." | "…paired with the IRS's route for filing late information returns." | No source for "commonly use". |
| "What happens after a notice?" card | "for each 30-day period" | "for each 30-day period or part of one" | Statute: "(or fraction thereof)". |
| Citations under the estimate | §6038A, i5472, IRS "Penalty relief for reasonable cause" page | §6038A(d), i5472, IRS international penalties page, Reg. §1.6038A-4 | The reasonable-cause page's information-return section covers §6721/6722 returns, not §6038A (late-filing.md §6). `PENALTY_CITATIONS` in `src/lib/penalty.ts` is unchanged. |
