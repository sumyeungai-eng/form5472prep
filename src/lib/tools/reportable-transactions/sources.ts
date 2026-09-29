// Primary sources behind the reportable-transactions checker — this file is
// the research record. Every rule in ./transactions.ts cites one or more of
// these keys, and each `quote` was copied verbatim (ellipses mark omissions)
// from the URL beside it on 2026-09-29:
//   - Instructions for Form 5472, Rev. 12/2024 (irs.gov/instructions/i5472)
//   - Form 5472, Rev. December 2023 (irs.gov/pub/irs-pdf/f5472.pdf)
//   - Treas. Reg. §§1.6038A-1, 1.6038A-2, 1.482-1 — text read via the eCFR
//     renderer API and matched against Cornell LII (eCFR's HTML pages block
//     scripted fetches; the #p-… anchors come from eCFR's own markup)
//   - 26 U.S.C. §267 (Cornell LII); T.D. 9796, IRB 2017-3 (irs.gov)
// Only irs.gov, eCFR and Cornell LII are allowed (enforced by the tests).

export const TX_CHECKER_LAST_REVIEWED = "2026-09-29";
export const TX_CHECKER_LAST_REVIEWED_LABEL = "29 September 2026";

const ECFR = "https://www.ecfr.gov/current/title-26";
const I5472 = "https://www.irs.gov/instructions/i5472";

export type SourceKey =
  | "reg2A1"
  | "reg2B3Sales"
  | "reg2B3Services"
  | "reg2B3Loans"
  | "reg2B3Interest"
  | "reg2B3Xi"
  | "reg2B4"
  | "reg2C"
  | "reg2Examples"
  | "reg1RelatedParty"
  | "reg1DisregardedEntity"
  | "reg482Transaction"
  | "reg482Control"
  | "irc267"
  | "i5472Definitions"
  | "i5472PartIV"
  | "i5472PartV"
  | "i5472PartVI"
  | "i5472Penalties";

export type Source = {
  /** Short citation shown next to a verdict. */
  label: string;
  url: string;
};

export type QuotedSource = Source & {
  /** Verbatim text relied on (research record; not all of it is rendered). */
  quote: string;
};

export const SOURCES: Record<SourceKey, QuotedSource> = {
  reg2A1: {
    label: "Treas. Reg. §1.6038A-2(a)(1)",
    url: `${ECFR}/section-1.6038A-2#p-1.6038A-2(a)(1)`,
    quote:
      "Each reporting corporation … shall make a separate annual information return on Form 5472 with respect to each related party as defined in § 1.6038A-1(d) with which the reporting corporation … has had any reportable transaction during the taxable year.",
  },
  reg2B3Sales: {
    label: "Treas. Reg. §1.6038A-2(b)(3)(i)–(iv)",
    url: `${ECFR}/section-1.6038A-2#p-1.6038A-2(b)(3)`,
    quote:
      "(i) Sales and purchases of stock in trade (inventory); (ii) Sales and purchases of tangible property other than stock in trade; (iii) Rents and royalties paid and received …; (iv) Sales, purchases, and amounts paid and received as consideration for the use of all intangible property",
  },
  reg2B3Services: {
    label: "Treas. Reg. §1.6038A-2(b)(3)(v)",
    url: `${ECFR}/section-1.6038A-2#p-1.6038A-2(b)(3)(v)`,
    quote:
      "Consideration paid and received for technical, managerial, engineering, construction, scientific, or other services",
  },
  reg2B3Loans: {
    label: "Treas. Reg. §1.6038A-2(b)(3)(vii)",
    url: `${ECFR}/section-1.6038A-2#p-1.6038A-2(b)(3)(vii)`,
    quote:
      "Amounts loaned and borrowed (except open accounts resulting from sales and purchases … that arise and are collected in full in the ordinary course of business), to be reported as monthly averages or outstanding balances at the beginning and end of the taxable year",
  },
  reg2B3Interest: {
    label: "Treas. Reg. §1.6038A-2(b)(3)(viii)",
    url: `${ECFR}/section-1.6038A-2#p-1.6038A-2(b)(3)(viii)`,
    quote: "Interest paid and received",
  },
  reg2B3Xi: {
    label: "Treas. Reg. §1.6038A-2(b)(3)(xi)",
    url: `${ECFR}/section-1.6038A-2#p-1.6038A-2(b)(3)(xi)`,
    quote:
      "With respect to an entity that is a reporting corporation as a result of being treated as a corporation under § 301.7701-2(c)(2)(vi) of this chapter, any other transaction as defined by § 1.482-1(i)(7), such as amounts paid or received in connection with the formation, dissolution, acquisition and disposition of the entity, including contributions to and distributions from the entity.",
  },
  reg2B4: {
    label: "Treas. Reg. §1.6038A-2(b)(4)",
    url: `${ECFR}/section-1.6038A-2#p-1.6038A-2(b)(4)`,
    quote:
      "If the related party is a foreign person, the reporting corporation must provide on Form 5472 a description of any reportable transaction, or group of reportable transactions, listed in paragraph (b)(3) of this section, for which any part of the consideration paid or received was not monetary consideration, or for which less than full consideration was paid or received. … (iii) A reasonable estimate of the fair market value of all properties and services exchanged",
  },
  reg2C: {
    label: "Treas. Reg. §1.6038A-2(c)",
    url: `${ECFR}/section-1.6038A-2#p-1.6038A-2(c)`,
    quote:
      "All amounts required to be reported under paragraph (b) of this section must be expressed in United States currency, with a statement of the exchange rates used",
  },
  reg2Examples: {
    label: "Treas. Reg. §1.6038A-2(b)(11), Example 1",
    url: `${ECFR}/section-1.6038A-2#p-1.6038A-2(b)(11)`,
    quote:
      "In year 1, W, a foreign corporation, forms and contributes assets to X … In year 2, W contributes funds to X. In year 3, X makes a payment to W. In year 4, X, in liquidation, distributes its assets to W. … each of the transactions in years 1 through 4 is a reportable transaction with respect to X.",
  },
  reg1RelatedParty: {
    label: "Treas. Reg. §1.6038A-1(d)",
    url: `${ECFR}/section-1.6038A-1#p-1.6038A-1(d)`,
    quote:
      "The term “related party” means— (1) Any direct or indirect 25-percent foreign shareholder of the reporting corporation, (2) Any person who is related within the meaning of sections 267(b) or 707(b)(1) to the reporting corporation or to a 25-percent foreign shareholder of the reporting corporation, or (3) Any other person who is related to the reporting corporation within the meaning of section 482",
  },
  reg1DisregardedEntity: {
    label: "Treas. Reg. §1.6038A-1(c)(1)",
    url: `${ECFR}/section-1.6038A-1#p-1.6038A-1(c)(1)`,
    quote:
      "A domestic business entity that is wholly owned by one foreign person and that is otherwise classified under § 301.7701-3(b)(1)(ii) of this chapter as disregarded as an entity separate from its owner is treated as an entity separate from its owner and classified as a domestic corporation for purposes of section 6038A.",
  },
  reg482Transaction: {
    label: "Treas. Reg. §1.482-1(i)(7)",
    url: `${ECFR}/section-1.482-1#p-1.482-1(i)(7)`,
    quote:
      "Transaction means any sale, assignment, lease, license, loan, advance, contribution, or any other transfer of any interest in or a right to use any property (whether tangible or intangible, real or personal) or money, however such transaction is effected, and whether or not the terms of such transaction are formally documented. A transaction also includes the performance of any services for the benefit of, or on behalf of, another taxpayer.",
  },
  reg482Control: {
    label: "Treas. Reg. §1.482-1(i)(4)",
    url: `${ECFR}/section-1.482-1#p-1.482-1(i)(4)`,
    quote:
      "Controlled includes any kind of control, direct or indirect, whether legally enforceable or not, and however exercisable or exercised",
  },
  irc267: {
    label: "IRC §267(b) and (c)(4)",
    url: "https://www.law.cornell.edu/uscode/text/26/267",
    quote:
      "(b)(1) Members of a family, as defined in subsection (c)(4); (2) An individual and a corporation more than 50 percent in value of the outstanding stock of which is owned, directly or indirectly, by or for such individual … (c)(4) The family of an individual shall include only his brothers and sisters (whether by the whole or half blood), spouse, ancestors, and lineal descendants",
  },
  i5472Definitions: {
    label: "Form 5472 instructions — Definitions",
    url: I5472,
    quote:
      "A reportable transaction is: Any type of transaction listed in Part IV … for which monetary consideration (including U.S. and foreign currency) was the sole consideration paid or received …; Any transaction listed in Part V; or Any transaction or group of transactions listed in Part VI. Transactions with a U.S. related party, however, are not required to be specifically identified in Parts IV, V, and VI.",
  },
  i5472PartIV: {
    label: "Form 5472 instructions — Part IV",
    url: I5472,
    quote:
      "Do not complete Part IV for transactions with a domestic related party. … Report amounts borrowed (including borrowings in place at the beginning of the tax year) … Report amounts loaned (including loans in place at the beginning of the tax year)",
  },
  i5472PartV: {
    label: "Form 5472 instructions — Part V",
    url: I5472,
    quote:
      "You must check the box in Part V if you are a foreign-owned DE that had any other transaction, as defined by Regulations section 1.482-1(i)(7) not already entered in Part IV. These transactions include amounts paid or received in connection with the formation, dissolution, acquisition, and disposition of the entity, including contributions to, and distributions from, the entity. Describe these on an attached statement.",
  },
  i5472PartVI: {
    label: "Form 5472 instructions — Part VI",
    url: I5472,
    quote:
      "If the related party is a foreign person, the reporting corporation must attach a schedule describing each reportable transaction or group of reportable transactions. … A reasonable estimate of the FMV of all properties and services exchanged, if possible, or some other reasonable indicator of value.",
  },
  i5472Penalties: {
    label: "Form 5472 instructions — Penalties",
    url: I5472,
    quote:
      "A penalty of $25,000 will be assessed on any reporting corporation that fails to file Form 5472 when due and in the manner prescribed. … Filing a substantially incomplete Form 5472 constitutes a failure to file Form 5472. … If the failure continues for more than 90 days after notification by the IRS, an additional penalty of $25,000 will apply … for each 30-day period (or part of a 30-day period)",
  },
};

/** Reference list shown in the "How we decide" section, in reading order. */
export const METHOD_SOURCES: ReadonlyArray<Source & { note: string }> = [
  {
    label: "Instructions for Form 5472 (Rev. December 2024)",
    url: I5472,
    note: "Definitions of reportable transaction and related party; Parts IV, V and VI; penalties.",
  },
  {
    label: "Form 5472 (Rev. December 2023)",
    url: "https://www.irs.gov/pub/irs-pdf/f5472.pdf",
    note: "Wording of Part V (foreign-owned U.S. DEs) and Part VI (nonmonetary transactions).",
  },
  {
    label: "Treas. Reg. §1.6038A-2 (eCFR)",
    url: `${ECFR}/section-1.6038A-2`,
    note: "What is reportable: (b)(3) monetary categories, (b)(3)(xi) the extra rule for foreign-owned disregarded entities, (b)(4) non-cash and below-value transactions.",
  },
  {
    label: "Treas. Reg. §1.6038A-1 (eCFR)",
    url: `${ECFR}/section-1.6038A-1`,
    note: "(c)(1) treats a foreign-owned single-member LLC as a corporation for this reporting; (d) defines related party.",
  },
  {
    label: "Treas. Reg. §1.482-1(i)(7) (eCFR)",
    url: `${ECFR}/section-1.482-1#p-1.482-1(i)(7)`,
    note: "The definition of “transaction” that §1.6038A-2(b)(3)(xi) borrows.",
  },
  {
    label: "IRC §267 (Cornell LII)",
    url: "https://www.law.cornell.edu/uscode/text/26/267",
    note: "Which family members and companies count as related to you.",
  },
  {
    label: "T.D. 9796 (Internal Revenue Bulletin 2017-3)",
    url: "https://www.irs.gov/irb/2017-03_IRB#TD-9796",
    note: "The final regulations that brought foreign-owned single-member LLCs into Form 5472 reporting (tax years beginning on or after 1 January 2017 and ending on or after 13 December 2017).",
  },
];
