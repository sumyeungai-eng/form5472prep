// Copy for the checker's result banner and the page FAQ. Kept here (not in
// the page) so tests can enforce length and wording rules.

import type { Overall } from "./classify";

export const OVERALL_MESSAGES: Record<Overall, { title: string; body: string }> = {
  none: {
    title: "Tick everything that happened in one tax year",
    body: "Your answer, where each item goes on Form 5472, and a link you can share will appear here.",
  },
  reportable: {
    title: "Form 5472 is required for this year",
    body: "At least one item is a reportable transaction, so the LLC files Form 5472 attached to a pro forma Form 1120 for that tax year. Every reportable item has to be included: a substantially incomplete Form 5472 counts as a failure to file.",
  },
  depends: {
    title: "Needs a closer look",
    body: "Nothing you ticked is clearly reportable, but at least one item depends on the facts. We check it for you before anything is filed.",
  },
  "not-reportable": {
    title: "Nothing you ticked is reportable",
    body: "If nothing else moved between the LLC and you, your family or a company you control during the year, the LLC has no Form 5472 to file for it. Double-check LLC fees you paid personally — they are easy to overlook.",
  },
};

export type Faq = { q: string; a: string };

export const TX_CHECKER_FAQS: ReadonlyArray<Faq> = [
  {
    q: "Is paying my LLC's state fee personally a reportable transaction?",
    a: "Yes. When a foreign owner pays the LLC's formation or annual state fee from personal funds, money has moved from the owner to the LLC. Treas. Reg. §1.6038A-2(b)(3)(xi) makes formation payments and contributions reportable, generally in Part V of Form 5472.",
  },
  {
    q: "Are payments from my customers reportable on Form 5472?",
    a: "Not when the customers are unrelated to you. Form 5472 covers transactions with related parties: you, close family members and companies you own or control. Ordinary customer payments, including through Stripe or Amazon, are not reportable, even from customers outside the US.",
  },
  {
    q: "Is a loan between me and my LLC reportable?",
    a: "Yes, in either direction. Amounts loaned and borrowed, and interest, are listed reportable transactions that go in Part IV. The balance is reported every year the loan is outstanding, including a balance carried in from an earlier year with no new transfers.",
  },
  {
    q: "Is there a minimum amount before a transaction is reportable?",
    a: "No. Neither Treas. Reg. §1.6038A-2 nor the Form 5472 instructions set a dollar threshold for a foreign-owned single-member LLC's reportable transactions. A small fee you paid personally counts just as a large transfer does.",
  },
  {
    q: "What if I leave a reportable transaction off Form 5472?",
    a: "Leaving transactions off can make the form substantially incomplete, which the IRS treats as not filing. The penalty is $25,000 per year under IRC §6038A(d), plus $25,000 per 30-day period the failure continues more than 90 days after an IRS notice.",

  },
  {
    q: "Does my LLC file if none of its transactions are reportable?",
    a: "No. A foreign-owned single-member LLC with no reportable transactions in a tax year is not required to file Form 5472 for that year. Check carefully first: LLC fees you paid personally and money moved in or out are easy to overlook.",
  },
];
