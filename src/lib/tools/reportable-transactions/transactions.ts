// Rules data for /form-5472-reportable-transactions-checker.
//
// Scope: a US single-member LLC wholly owned by one foreign person and not
// electing corporate treatment (a "foreign-owned U.S. DE"). Treas. Reg.
// §1.6038A-1(c)(1) treats that LLC as a separate corporation for Form 5472
// purposes, so "you" (the owner) are its related party.
//
// Every verdict must trace to a primary source in ./sources.ts; the quotes are
// recorded in docs/research/reportable-transactions.md. Where the sources do
// not settle a case, the verdict is "depends" — never a guess.
//
// Deliberately NOT here: Form 5472 line numbers or how to fill the attached
// statements (that is the paid service).
//
// Judgement calls (flag these to any fact-checker):
// 1. owner-works-unpaid is "depends": §1.482-1(i)(7) literally includes "the
//    performance of any services for the benefit of … another taxpayer" and
//    §1.6038A-2(b)(4) covers below-value services with a foreign related party,
//    but no source addresses an owner-manager of their own single-member LLC.
// 2. Interest-free loans: the loan is clearly reportable (Part IV); whether the
//    missing interest also makes it a (b)(4) less-than-full-consideration item
//    (Part VI) is unsettled, so the copy says "may also need … we check that".
// 3. Owner-paid LLC costs sit in Part V (formation payments / contributions,
//    §1.6038A-2(b)(3)(xi)); if repayment was expected they are an advance
//    (Part IV). llc-reimburses-owner carries both parts for that reason.
// 4. Property contributions carry Parts V and VI: a (b)(3)(xi) contribution
//    whose consideration is not money, so (b)(4) asks for a description + FMV.
//    The sources do not say whether one statement serves both parts.
// 5. "No minimum amount" rests on the absence of any threshold in
//    §1.6038A-2(a)(2)/(b)(3) and the instructions. §1.6038A-1(h)–(i) exceptions
//    exclude foreign-owned DEs but concern record keeping, so are not cited.
// 6. The brief framed placement as "Part V vs Part VI"; the sources put money-
//    only loans, interest and service fees in Part IV, so all three are used.

import type { SourceKey } from "./sources";

export type Verdict = "reportable" | "not-reportable" | "depends";

export type FormPart = "IV" | "V" | "VI";

export const PART_DESCRIPTIONS: Record<FormPart, { title: string; plain: string }> = {
  IV: {
    title: "Part IV — money-only dealings",
    plain:
      "Transactions with a foreign related party where money was the only thing exchanged: loans, interest, sales, purchases and payments for services.",
  },
  V: {
    title: "Part V — the part for foreign-owned US LLCs",
    plain:
      "Only for foreign-owned US disregarded entities: other money or property moving between the LLC and a related party, such as contributions, distributions and formation or closing payments. Described on an attached statement.",
  },
  VI: {
    title: "Part VI — non-cash or below-value dealings",
    plain:
      "Transactions with a foreign related party paid for with property or services instead of money, or for less than full value. Described on an attached statement with an estimated value.",
  },
};

export type GroupId =
  | "money-in"
  | "money-out"
  | "loans"
  | "costs-paid-personally"
  | "property-services"
  | "third-parties";

export const GROUPS: ReadonlyArray<{ id: GroupId; title: string }> = [
  { id: "money-in", title: "Money in" },
  { id: "money-out", title: "Money out" },
  { id: "loans", title: "Loans" },
  { id: "costs-paid-personally", title: "LLC costs you paid personally" },
  { id: "property-services", title: "Property & services" },
  { id: "third-parties", title: "Other people & companies" },
];

export type TransactionType = {
  /** URL-safe slug used in ?t= and as the on-page anchor. Never rename. */
  id: string;
  group: GroupId;
  /** What the owner would recognise, in their words. */
  label: string;
  /** Examples that help the owner decide whether this item is theirs. */
  hint: string;
  verdict: Verdict;
  /** Parts of Form 5472 the item normally lands in. Empty = not on the form / undecided. */
  parts: FormPart[];
  /** Plain-English "where it goes". No line numbers. */
  where: string;
  /** One-paragraph plain-English reason. */
  reason: string;
  sources: SourceKey[];
};

export const TRANSACTIONS: ReadonlyArray<TransactionType> = [
  // ── Money in ──────────────────────────────────────────────────────────
  {
    id: "owner-funds-llc",
    group: "money-in",
    label: "You transfer money into the LLC's bank account",
    hint: "Start-up money, top-ups, or covering a shortfall — from your personal account or any other account of yours.",
    verdict: "reportable",
    parts: ["V"],
    where: "Part V, as a contribution to the LLC.",
    reason:
      "For a foreign-owned single-member LLC, the regulation names “contributions to … the entity” as a reportable transaction. It does not matter that it is your own money, that the LLC had no income, or how small the transfer was — the rules set no minimum. The regulation’s own example treats an owner’s later transfer of funds to its LLC as reportable in the year it happens. If the money is a loan you expect back, see the loan item instead.",
    sources: ["reg2B3Xi", "reg2Examples", "reg1DisregardedEntity", "i5472PartV"],
  },

  // ── Money out ─────────────────────────────────────────────────────────
  {
    id: "llc-pays-owner",
    group: "money-out",
    label: "The LLC transfers money to you",
    hint: "Owner draws, profit distributions, moving money to your personal account, or a final payout when the LLC closes.",
    verdict: "reportable",
    parts: ["V"],
    where: "Part V, as a distribution from the LLC.",
    reason:
      "“Distributions from the entity” are named in the regulation as reportable for a foreign-owned single-member LLC, and the regulation’s example treats both a payment from the LLC to its owner and a final distribution when it is liquidated as reportable. Moving money to your own account counts, even though for income tax the LLC and you are otherwise treated as one taxpayer.",
    sources: ["reg2B3Xi", "reg2Examples", "reg1DisregardedEntity", "i5472PartV"],
  },
  {
    id: "llc-pays-personal-expenses",
    group: "money-out",
    label: "The LLC pays your personal expenses",
    hint: "Your personal rent, travel, card bill or shopping paid from the LLC's account or card.",
    verdict: "reportable",
    parts: ["V"],
    where: "Part V, as money moving from the LLC to you (like a distribution).",
    reason:
      "Money that leaves the LLC for your benefit is a transfer to you, even though it went to a shop or landlord rather than your own bank account. The definition of “transaction” the regulation uses covers any transfer of money “however such transaction is effected”, and distributions from the LLC are expressly reportable.",
    sources: ["reg2B3Xi", "reg482Transaction", "i5472PartV"],
  },

  // ── Loans ─────────────────────────────────────────────────────────────
  {
    id: "loan-to-llc",
    group: "loans",
    label: "You lend money to the LLC",
    hint: "Including the LLC paying you back and any interest it pays you. A balance still owed from an earlier year counts too.",
    verdict: "reportable",
    parts: ["IV"],
    where: "Part IV, as money the LLC borrowed (the loan balance) plus any interest paid.",
    reason:
      "Amounts loaned and borrowed, and interest paid and received, are listed reportable transactions. The instructions ask for the balance “including borrowings in place at the beginning of the tax year”, so a loan from you is reported every year it is outstanding — even a year with no new transfers or repayments. If no interest is charged, it may also need a Part VI description as a less-than-full-consideration transaction; we check that.",
    sources: ["reg2B3Loans", "reg2B3Interest", "i5472PartIV", "reg2B4"],
  },
  {
    id: "loan-to-owner",
    group: "loans",
    label: "The LLC lends money to you",
    hint: "Including you paying it back and any interest you pay. A balance you still owe from an earlier year counts too.",
    verdict: "reportable",
    parts: ["IV"],
    where: "Part IV, as money the LLC loaned (the loan balance) plus any interest received.",
    reason:
      "The regulation lists amounts loaned and interest received as reportable, and the instructions ask for the balance “including loans in place at the beginning of the tax year”. So a loan from the LLC to you is reported every year a balance is outstanding, whether or not anything was repaid. If no interest is charged, it may also need a Part VI description as a less-than-full-consideration transaction; we check that.",
    sources: ["reg2B3Loans", "reg2B3Interest", "i5472PartIV", "reg2B4"],
  },

  // ── LLC costs you paid personally ─────────────────────────────────────
  {
    id: "owner-paid-state-fee",
    group: "costs-paid-personally",
    label: "You paid the LLC's state fees personally",
    hint: "The state formation (filing) fee, annual report fee or franchise tax, paid from your own card or account.",
    verdict: "reportable",
    parts: ["V"],
    where: "Part V, as a formation payment or a contribution to the LLC.",
    reason:
      "Paying the LLC’s bill with your own money is a transfer from you to the LLC. The regulation lists “amounts paid or received in connection with the formation” of the LLC and “contributions to” it as reportable, and counts transfers of money “however such transaction is effected”. It is easy to miss: an LLC with no bank activity at all still has a reportable transaction if its owner paid the state.",
    sources: ["reg2B3Xi", "reg482Transaction", "i5472PartV"],
  },
  {
    id: "owner-paid-registered-agent",
    group: "costs-paid-personally",
    label: "You paid the registered agent personally",
    hint: "The registered-agent fee or a formation-service package, paid from your own card or account.",
    verdict: "reportable",
    parts: ["V"],
    where: "Part V, as a contribution to the LLC (a formation payment in the first year).",
    reason:
      "The registered agent serves the LLC, so when you pay its fee you cover an LLC cost with your own money — a transfer to the LLC that the regulation treats as a reportable transaction however it is carried out. In the formation year it is also an amount paid in connection with forming the LLC. If the LLC paid the agent from its own account instead, that payment is not reportable (see the unrelated-vendors item).",
    sources: ["reg2B3Xi", "reg482Transaction", "i5472PartV"],
  },
  {
    id: "owner-paid-other-costs",
    group: "costs-paid-personally",
    label: "You paid other LLC costs personally",
    hint: "Software, website, bank or payment-processor fees, bookkeeping, advertising — anything the LLC uses.",
    verdict: "reportable",
    parts: ["V"],
    where: "Part V, as a contribution to the LLC.",
    reason:
      "Same rule as state and agent fees: each time you pay an LLC expense with your own money, value moves from you to the LLC, and for a foreign-owned single-member LLC any such transfer is a reportable transaction. Amounts are reported in US dollars with the exchange rates used, so keep receipts showing the date and currency of each payment.",
    sources: ["reg2B3Xi", "reg482Transaction", "reg2C", "i5472PartV"],
  },
  {
    id: "llc-reimburses-owner",
    group: "costs-paid-personally",
    label: "The LLC pays you back for costs you paid",
    hint: "The LLC reimburses you for an LLC expense you first paid from your own money.",
    verdict: "reportable",
    parts: ["IV", "V"],
    where: "Usually Part V, alongside your original payment; Part IV if your payment was really a loan to the LLC. We work out which.",
    reason:
      "Your original payment moved money from you to the LLC, and the reimbursement moves money from the LLC back to you. Each is a transfer under the regulation’s definition of a transaction, so they do not cancel each other out just because the amounts match. How they are presented depends on whether the payment was a contribution or an advance you expected back.",
    sources: ["reg2B3Xi", "reg482Transaction", "reg2B3Loans", "i5472PartV"],
  },

  // ── Property & services ───────────────────────────────────────────────
  {
    id: "owner-contributes-property",
    group: "property-services",
    label: "You put non-cash property into the LLC",
    hint: "Crypto, equipment, a car, inventory, shares, a domain name or other intellectual property.",
    verdict: "reportable",
    parts: ["V", "VI"],
    where: "Part V as a contribution, plus a Part VI description because no money changed hands. We confirm the split.",
    reason:
      "Contributions are reportable whether they are cash or property: the definition of a transaction covers transfers of “any property (whether tangible or intangible, real or personal)”, and the regulation’s example has the owner forming the LLC and contributing assets. When property rather than money moves with a foreign owner, the rules also ask for a description of what was transferred and a reasonable estimate of its fair market value.",
    sources: ["reg2B3Xi", "reg482Transaction", "reg2B4", "reg2Examples", "i5472PartVI"],
  },
  {
    id: "llc-pays-owner-for-services",
    group: "property-services",
    label: "The LLC pays you for work you do",
    hint: "A management fee, consulting fee or salary-style payment from the LLC to you.",
    verdict: "reportable",
    parts: ["IV"],
    where: "Part IV, as a payment for services (Part V instead if it is really a draw of profits).",
    reason:
      "“Consideration paid and received for technical, managerial, … or other services” is a listed reportable transaction, and the person paid here is you — a related party. Calling the payment a fee rather than a distribution does not take it off Form 5472; it only changes where it is shown.",
    sources: ["reg2B3Services", "reg1RelatedParty", "i5472PartIV"],
  },
  {
    id: "owner-works-unpaid",
    group: "property-services",
    label: "You work for the LLC without being paid",
    hint: "You run the business yourself and take no fee or salary for it.",
    verdict: "depends",
    parts: [],
    where: "Possibly Part VI (services for less than full value). We check it for you.",
    reason:
      "The definition of a transaction includes “the performance of any services for the benefit of, or on behalf of, another taxpayer”, and non-cash or below-value dealings with a foreign related party must be described on Form 5472. But neither the regulation nor the instructions say how an owner running their own single-member LLC should be treated, so we look at what you actually did before deciding. If the LLC has any other reportable transaction that year, it files Form 5472 either way.",
    sources: ["reg482Transaction", "reg2B3Xi", "reg2B4"],
  },

  // ── Other people & companies ──────────────────────────────────────────
  {
    id: "related-company",
    group: "third-parties",
    label: "The LLC deals with another company you own or control",
    hint: "Buying from, selling to, lending to, or paying fees to your foreign company or another LLC of yours.",
    verdict: "reportable",
    parts: ["IV", "VI"],
    where:
      "On a separate Form 5472 for that company. If it is foreign: Part IV for money-only dealings, Part VI for non-cash or below-value ones. If it is a US company, the instructions do not require the amounts to be itemised in Parts IV–VI.",
    reason:
      "A company you own more than 50% of, or otherwise control, is a related party of your LLC (through IRC §267(b) and the §482 control test). The regulation requires a separate Form 5472 for each related party the LLC had reportable transactions with, so this usually means a second Form 5472 in the same filing. Sales, purchases, fees, loans and interest with that company are all listed reportable transactions.",
    sources: ["reg1RelatedParty", "irc267", "reg482Control", "reg2A1", "reg2B3Sales", "i5472Definitions"],
  },
  {
    id: "family-member",
    group: "third-parties",
    label: "The LLC pays or receives money from your family",
    hint: "Your spouse, parents, grandparents, children, grandchildren, brothers or sisters.",
    verdict: "reportable",
    parts: [],
    where: "On a separate Form 5472 for that family member; which part depends on what the payment was for.",
    reason:
      "Under IRC §267(b)(1) and (c)(4), your brothers and sisters, spouse, ancestors and lineal descendants are related to you, which makes them related parties of your LLC. Paying them for work, buying from them, lending to them or sending them money are reportable transactions, and each family member the LLC dealt with gets their own Form 5472.",
    sources: ["reg1RelatedParty", "irc267", "reg2A1", "reg2B3Xi"],
  },
  {
    id: "unrelated-customers",
    group: "third-parties",
    label: "Customers you're not related to pay the LLC",
    hint: "Sales through Stripe, PayPal, Amazon or Shopify, or client invoices — from customers anywhere in the world.",
    verdict: "not-reportable",
    parts: [],
    where: "Not on Form 5472.",
    reason:
      "Form 5472 covers transactions with related parties — you, your close family, and companies you own or control. An ordinary customer is not a related party, even if they are outside the US, so their payments are not reportable transactions. The exception: if the “customer” is you, a relative or a company you control, see those items.",
    sources: ["reg2A1", "reg1RelatedParty", "i5472Definitions"],
  },
  {
    id: "unrelated-vendors",
    group: "third-parties",
    label: "The LLC pays vendors or contractors you're not related to",
    hint: "Paid from the LLC's own account or card: software, freelancers, advertising, the registered agent.",
    verdict: "not-reportable",
    parts: [],
    where: "Not on Form 5472.",
    reason:
      "Payments from the LLC’s own funds to unrelated businesses and freelancers are not related-party transactions, so they do not go on Form 5472 — even when the contractor is abroad. What matters is who paid: if you paid the vendor with your own money, that is a reportable transfer from you to the LLC (see the costs-you-paid-personally items).",
    sources: ["reg2A1", "reg1RelatedParty", "i5472Definitions"],
  },
];

export const VERDICT_LABELS: Record<Verdict, string> = {
  reportable: "Reportable",
  "not-reportable": "Not reportable",
  depends: "Depends — we'll check it for you",
};
