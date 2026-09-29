# Research note: Form 5472 late-filing checker

Tool: `/form-5472-late-filing-checker`. Logic: `src/lib/tools/late-filing/`.
Researched and last reviewed 2026-09-29. Every rule the tool states is listed below with its
primary source and a short quote. Anything we could not verify is listed at the end and is
**not** stated on the page.

## 1. DIIRSP: who it is for, and what it promises (and doesn't)

Source: IRS, *Delinquent international information return submission procedures*
<https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures>
(page "Last Reviewed or Updated: 19-Apr-2026"; fetched 2026-09-29).

- **Eligibility (exact wording, used verbatim on the page):** "Taxpayers who have identified the
  need to file delinquent international information returns who are not under a civil
  examination or a criminal investigation by the IRS and have not already been contacted by the
  IRS about the delinquent information returns should file the delinquent information returns
  through normal filing procedures."
- **No promise of relief:** "Penalties may be assessed in accordance with existing procedures."
- **Reasonable-cause statement is optional and may be ignored during processing:** "Taxpayers may
  attach a reasonable cause statement to each delinquent information return filed for which
  reasonable cause is being asserted. During the processing of the delinquent information
  return, penalties may be assessed without considering the attached reasonable cause
  statement. It may be necessary for taxpayers to respond to specific correspondence from the
  IRS and submit or resubmit reasonable cause information."
- **How to file:** "All delinquent international information returns, other than Forms 3520 and
  3520-A, should be attached to an amended income tax return and filed according to the
  applicable instructions for the amended return."
- **Audit:** "Amended returns … will not be automatically subject to audit but may be selected for
  audit through the existing audit selection processes …"
- **Other options listed on the page:** "Your offshore compliance options" links to the IRS
  Criminal Investigation Voluntary Disclosure Practice and the Streamlined filing compliance
  procedures.
- **FAQs:** the current page links no DIIRSP FAQ. (The pre-2026 wording, which required
  "reasonable cause" as an eligibility condition and excluded taxpayers needing to report
  additional tax, is **no longer on the page**. The tool follows the current wording.)

**Interpretation flag.** For a foreign-owned U.S. disregarded entity (DE) that never filed, the
"income tax return" the information return goes with is the pro forma Form 1120 (see §3). The
DIIRSP page does not address DEs explicitly. The tool says "a pro forma Form 1120 with Form 5472
attached, faxed or mailed as the Form 5472 instructions direct". That is our reading of "normal
filing procedures" for a DE, not IRS wording.

## 2. The penalty: IRC §6038A(d)

Source: 26 U.S.C. §6038A(d), <https://www.law.cornell.edu/uscode/text/26/6038A>.

- (d)(1): a reporting corporation that fails to furnish the information "shall pay a penalty of
  $25,000 for each taxable year with respect to which such failure occurs."
- (d)(2): if the failure "continues for more than 90 days after the day on which the Secretary
  mails notice of such failure", an additional "$25,000 for each 30-day period (or fraction
  thereof)".
- (d)(3): the time to furnish information (and the start of the 90-day period) is "treated as not
  earlier than the last day on which (as shown to the satisfaction of the Secretary) reasonable
  cause existed".

Figures on the page come from `src/lib/penalty.ts` (`PENALTY_PER_FORM_CENTS`,
`CONTINUATION_PER_PERIOD_CENTS`, `CONTINUATION_GRACE_DAYS`), not new literals.

## 3. Form 5472 instructions (Rev. 12/2024)

Source: <https://www.irs.gov/instructions/i5472> (page "Last Reviewed or Updated: 30-Apr-2026").

- DEs: "it will now be required to file a pro forma Form 1120 … with Form 5472 attached by the due
  date (including extensions) of that Form 1120."
- Filing method: "Foreign-owned U.S. DEs are required to use the following dedicated mailing
  address" and "File these forms by: Fax (300 DPI or higher) to 855-887-7737, or Mail to: Internal
  Revenue Service, 1973 Rulon White Blvd, M/S 6112 Attn: PIN Unit, Ogden, UT 84201". Also "you
  cannot file Form 5472 electronically." (The page does not print the fax number or address. It
  links to the instructions.)
- Penalties: "A penalty of $25,000 will be assessed on any reporting corporation that fails to file
  Form 5472 when due and in the manner prescribed." "Filing a substantially incomplete Form 5472
  constitutes a failure to file Form 5472." Continuation: "$25,000 … for each 30-day period (or
  part of a 30-day period) during which the failure continues after the 90-day period ends."
- The instructions do **not** discuss reasonable cause or late-filing procedure; those come from
  the regulation (§4) and DIIRSP (§1).

## 4. Reasonable cause: Treas. Reg. §1.6038A-4(b)

Source: eCFR <https://www.ecfr.gov/current/title-26/section-1.6038A-4> (text confirmed via the
eCFR renderer API and the LII mirror <https://www.law.cornell.edu/cfr/text/26/1.6038A-4>).

- (b)(1): "Certain failures may be excused for reasonable cause, including not timely filing Form
  5472 …" and the showing must be that "the taxpayer acted in good faith and there is reasonable
  cause".
- (b)(2)(i): "the reporting corporation must make an affirmative showing of all the facts alleged
  as reasonable cause for the failure in a written statement containing a declaration that it is
  made under penalties of perjury."
- (b)(2)(ii) small corporations: "The District Director shall apply the reasonable cause exception
  liberally in the case of a small corporation that had no knowledge of the requirements imposed
  by section 6038A; has limited presence in and contact with the United States; and promptly and
  fully complies with all requests … to file Form 5472 …". "A small corporation is a corporation
  whose gross receipts for a taxable year are $20,000,000 or less."
- (b)(2)(iii): "made on a case-by-case basis, taking into account all pertinent facts and
  circumstances." Examples: "an honest misunderstanding of fact or law that is reasonable in
  light of the experience and knowledge of the taxpayer". Reliance on a professional "does not
  necessarily demonstrate reasonable cause" but "constitutes reasonable cause and good faith if,
  under all the circumstances, the reliance was reasonable."

Supporting (why a DE is a "corporation" here): Treas. Reg. §301.7701-2(c)(2)(vi)(A),
<https://www.law.cornell.edu/cfr/text/26/301.7701-2>: a disregarded entity "is treated as an
entity separate from its owner and classified as a corporation for purposes of section 6038A if
…" (wholly owned by one foreign person). Not quoted on the page.

## 5. First-Time Abatement (FTA): does it apply to the §6038A(d) penalty? **Generally no.**

- IRS, *Administrative penalty relief*, <https://www.irs.gov/payments/administrative-penalty-relief>
  ("Last Reviewed or Updated: 14-Jul-2026"). The "Penalties eligible for relief … under FTA or the
  new AEP" list contains only IRC 6651(a)(1), 6698(a)(1), 6699(a)(1), 6651(a)(2), 6651(a)(3) and
  6656. §6038A is not listed. The page also says: "You cannot receive this relief for: Returns filed
  once or infrequently (i.e., event-based filing requirements) … Information reporting dependent
  on another filing." New in 2026: "FTA is transitioning to a new relief called Automatic
  Exemption from Penalty (AEP), starting Summer 2026", covering the same penalty list.
- IRM 20.1.1.3.3.2.1(7) (03-29-2023), <https://www.irs.gov/irm/part20/irm_20-001-001r>: in its
  list of returns where "penalty relief under the FTA waiver is NOT applicable", it names "Form
  5472 … (See IRM 20.1.9 for exception.)"
- IRM 20.1.9.5.5 (01-29-2021), <https://www.irs.gov/irm/part20/irm_20-001-009>: "The first time
  abatement (FTA) penalty relief provisions do not apply to event-based filing requirements such
  as with Form 5472". **Narrow exception:** when the penalty was *systemically* assessed because
  Form 5472 was attached to a late-filed Form 1120, and the Form 1120 failure-to-file penalty is
  abated under FTA "(or would have been eligible for FTA abatement but a failure to file penalty
  wasn't assessed because there was $0 tax due …)", the Form 5472 penalty "may be abated … as
  well". This requires no similar penalties, and no late Form 1120, in the three prior periods.
- Same IRM section: "It is recommended that reasonable cause not be considered for any year until
  all delinquent returns have been filed". On continuation penalties: "the latest date reasonable
  cause can exist is 90 days from the date of notification … As such, there is no reasonable cause
  exception for this penalty."

Page wording: "Generally no … with a narrow exception tied to relief on the related Form 1120."
We do not tell anyone they qualify for the exception.

## 6. Penalty already assessed: dispute / abatement path

Source: IRS, *International information reporting penalties*,
<https://www.irs.gov/payments/international-information-reporting-penalties> ("Last Reviewed or
Updated: 20-Aug-2026").

- Form 5472 row: "You may be subject to a penalty of $25,000 for each failure to file a complete
  and correct Form 5472 by the due date." "There is no maximum penalty amount."
- "We may be able to remove or reduce some penalties if you acted in good faith and can show
  reasonable cause." "Not all International Information Reporting Penalties qualify for
  reasonable cause."
- Dispute: "Call us at the toll-free number at the top right corner of your notice or letter or
  write us a letter stating why we should reconsider the penalty." "If a notice or letter we sent
  you has instructions or deadlines for disputing the penalty, pay careful attention."
- Refund: "If you pay the penalty, you may file Form 843, Claim for Refund and Request for
  Abatement".

Not used: the reasonable-cause criteria on <https://www.irs.gov/payments/penalty-relief-for-reasonable-cause>
("Information return penalties" section) cite Treas. Reg. 301.6724-1. That section covers
§6721/6722 returns (1099s and similar), not §6038A, so we don't apply it to Form 5472.

## 7. Unreported U.S. tax: other programmes

- Streamlined: <https://www.irs.gov/individuals/international-taxpayers/streamlined-filing-compliance-procedures>
  ("Last Reviewed or Updated: 11-Jul-2026"): "designed only for individual taxpayers, including
  estates of individual taxpayers"; taxpayers must certify "that conduct was not willful"; not
  available if "the IRS has initiated a civil examination".
- Voluntary Disclosure Practice: <https://www.irs.gov/compliance/criminal-investigation/irs-criminal-investigation-voluntary-disclosure-practice>
  ("Last Reviewed or Updated: 20-Jul-2026"): "a compliance option if you have willfully failed to
  comply …"; "If your failure … was not willful … you should consider other options including
  correcting past mistakes by filing amended or past due returns." The page notes a proposed VDP
  update (Dec 22, 2025 comment period). The tool does not describe VDP terms.

The tool routes "unpaid/unreported U.S. tax" to a professional review ("Talk to us"). The right
programme depends on facts the tool can't test: willfulness, whether the owner is an individual
U.S. taxpayer, and which income tax returns are involved.

## Routing decisions that go beyond the sources (deliberately conservative)

| Branch | Why we route to review/professional rather than a specific IRS route |
|---|---|
| Under exam / investigation | DIIRSP excludes it; no IRS page we found states the in-exam procedure for late 5472s. |
| IRS letter, no penalty yet | DIIRSP excludes "already contacted". The statute's 90-day clock is sourced. What to send is set by the letter. |
| Any "Not sure" on exam / contact / tax | Eligibility can't be determined. |
| Unreported tax | See §7. |
| Knew and didn't file (no reasonable cause) | DIIRSP still applies as a filing route, but relief needs reasonable cause and willfulness questions arise (VDP). |

## Unverifiable, not stated on the page

- Any success rate or likelihood of abatement.
- Whether the IRS treats a specific letter as the "notice" that starts the §6038A(d)(2) 90-day
  clock. The page says "if a failure continues more than 90 days after the IRS mails notice of
  it", which is statutory wording.
- Which notice number (e.g. CP15) the IRS uses for Form 5472 penalties.
- Whether the IRM 20.1.9.5.5 FTA-derivative exception has been applied to foreign-owned DE pro
  forma filings in practice.
