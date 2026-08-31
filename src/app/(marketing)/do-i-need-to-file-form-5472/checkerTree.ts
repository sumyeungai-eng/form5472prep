export type NodeId = string;

export type QuestionNode = {
  kind: "question";
  id: NodeId;
  question: string;
  help?: string;
  options: Array<{ label: string; next: NodeId }>;
};

export type ResultNode = {
  kind: "result";
  id: NodeId;
  verdict: "must-file" | "likely-must-file" | "no-filing" | "different-rules";
  title: string;
  explanation: string;
  links: Array<{ label: string; href: string }>;
  showCta: boolean;
};

export const START: NodeId = "has-us-llc";

export const NODES: Record<NodeId, QuestionNode | ResultNode> = {
  "has-us-llc": {
    kind: "question",
    id: "has-us-llc",
    question: "Do you have a US LLC?",
    options: [
      { label: "No", next: "no-us-llc" },
      { label: "Yes", next: "owner-count" },
    ],
  },
  "owner-count": {
    kind: "question",
    id: "owner-count",
    question: "How many owners (members) does the LLC have?",
    options: [
      { label: "Just me — one owner", next: "foreign-owner" },
      { label: "Two or more", next: "multi-member-different-rules" },
    ],
  },
  "foreign-owner": {
    kind: "question",
    id: "foreign-owner",
    question: "Is the owner a non-US person or a foreign company?",
    help: "A non-US citizen/resident individual, or a company formed outside the United States.",
    options: [
      { label: "No — I'm a US person", next: "us-owned-no-filing" },
      { label: "Yes", next: "corporate-election" },
    ],
  },
  "corporate-election": {
    kind: "question",
    id: "corporate-election",
    question:
      "Has the LLC elected to be taxed as a corporation (filed Form 8832 and files Form 1120 as a C-corp)?",
    options: [
      { label: "Yes", next: "corp-election-different-rules" },
      { label: "No / Not sure", next: "existed-during-year" },
    ],
  },
  "existed-during-year": {
    kind: "question",
    id: "existed-during-year",
    question: "Did the LLC exist at any point during the tax year?",
    options: [
      { label: "No", next: "not-formed-no-filing" },
      { label: "Yes", next: "money-or-property-moved" },
    ],
  },
  "money-or-property-moved": {
    kind: "question",
    id: "money-or-property-moved",
    question:
      "During that year, did ANY money or property move between you (or related parties) and the LLC — including the deposit that opened its bank account, formation costs you paid, loans, or owner draws?",
    options: [
      { label: "Yes", next: "must-file-reportable-transaction" },
      { label: "No, truly nothing", next: "protective-filing" },
      { label: "Not sure", next: "uncertain-transactions" },
    ],
  },
  "no-us-llc": {
    kind: "result",
    id: "no-us-llc",
    verdict: "no-filing",
    title: "Form 5472 for foreign-owned LLCs doesn't apply to you",
    explanation:
      "Form 5472 for a foreign-owned disregarded entity is aimed at certain US entities, especially foreign-owned US single-member LLCs. Based on your answers you likely have no Form 5472 obligation. This tool is general guidance, not a professional determination, so confirm unusual facts through /contact.",
    links: [{ label: "What is Form 5472?", href: "/blog/what-is-form-5472" }],
    showCta: false,
  },
  "multi-member-different-rules": {
    kind: "result",
    id: "multi-member-different-rules",
    verdict: "different-rules",
    title: "Multi-member LLCs usually follow partnership rules first",
    explanation:
      "A US LLC with two or more members is normally taxed as a partnership by default and files Form 1065, not the pro forma Form 1120 package used by foreign-owned single-member LLCs. Form 5472 can still apply if the LLC elected corporate tax treatment, but the mechanics are different. Review the multi-member rules before assuming this checker applies to your filing.",
    links: [
      {
        label: "Multi-member LLC: Form 5472 or 1065?",
        href: "/blog/multi-member-llc-form-5472-or-1065",
      },
    ],
    showCta: false,
  },
  "us-owned-no-filing": {
    kind: "result",
    id: "us-owned-no-filing",
    verdict: "no-filing",
    title: "A US-owned single-member LLC normally has no Form 5472 duty",
    explanation:
      "Form 5472 for this scenario generally applies when the single owner is a foreign person or foreign company. Based on your answers you likely have no Form 5472 obligation. Because residency and ownership facts can be nuanced, confirm through /contact if you want someone to review your facts.",
    links: [
      {
        label: "W-8BEN vs W-9 for foreign-owned LLCs",
        href: "/blog/w8ben-vs-w9-foreign-owned-llc",
      },
    ],
    showCta: false,
  },
  "corp-election-different-rules": {
    kind: "result",
    id: "corp-election-different-rules",
    verdict: "different-rules",
    title: "A corporate election changes how Form 5472 is filed",
    explanation:
      "Form 5472 can still apply, but it is filed through the corporation's own Form 1120 rather than the disregarded-entity pro forma 1120 process. The questions, attachments, and filing workflow can be different once Form 8832 corporate treatment is in place. We can still help you scope the right filing path through /contact.",
    links: [
      {
        label: "Form 8832 election for a foreign-owned LLC",
        href: "/blog/form-8832-election-foreign-owned-llc",
      },
    ],
    showCta: true,
  },
  "not-formed-no-filing": {
    kind: "result",
    id: "not-formed-no-filing",
    verdict: "no-filing",
    title: "No Form 5472 filing for a year before the LLC existed",
    explanation:
      "If the LLC did not exist at any point during that tax year, there is no Form 5472 filing for that year. Based on your answers you likely have no Form 5472 obligation for that year, and the first filing will be due for the year the LLC is formed. Confirm timing details through /contact if formation, dissolution, or short-year facts are unclear.",
    links: [
      {
        label: "Form 5472 for a brand-new LLC (first year)",
        href: "/blog/first-year-form-5472-new-llc",
      },
    ],
    showCta: false,
  },
  "must-file-reportable-transaction": {
    kind: "result",
    id: "must-file-reportable-transaction",
    verdict: "must-file",
    title: "Yes — you must file Form 5472 + pro forma 1120",
    explanation:
      "A foreign-owned US single-member LLC with reportable transactions generally must file Form 5472 attached to a pro forma Form 1120. For a calendar-year LLC, the deadline is April 15 unless an extension applies. The IRS penalty for missing Form 5472 or an incomplete reportable transaction disclosure is generally $25,000.",
    links: [
      { label: "How to fill out Form 5472", href: "/blog/how-to-fill-out-form-5472" },
      { label: "Form 5472 deadline calculator", href: "/form-5472-deadline-calculator" },
    ],
    showCta: true,
  },
  "protective-filing": {
    kind: "result",
    id: "protective-filing",
    verdict: "likely-must-file",
    title: "Probably still safer to file",
    explanation:
      "A genuinely zero-transaction year is rare for a foreign-owned LLC. Formation-year costs, initial capital contributions, owner-paid registered-agent fees, loans, and reimbursements can all count as reportable transactions. Many owners file protectively because the penalty for a missed reportable transaction is $25,000.",
    links: [
      {
        label: "Form 5472 for a dormant LLC with no income",
        href: "/blog/form-5472-dormant-llc-no-income",
      },
      {
        label: "Reportable transaction examples",
        href: "/blog/form-5472-reportable-transactions-examples",
      },
    ],
    showCta: true,
  },
  "uncertain-transactions": {
    kind: "result",
    id: "uncertain-transactions",
    verdict: "likely-must-file",
    title: "Almost certainly yes",
    explanation:
      "Formation funding alone can be a reportable transaction, including an initial bank deposit or a registered-agent fee paid by the owner. If you are not sure whether money or property moved, that usually means a filing obligation exists. The practical next step is to list the year's owner payments, reimbursements, deposits, loans, and draws and prepare the disclosure from that record.",
    links: [
      {
        label: "Form 5472 for a dormant LLC with no income",
        href: "/blog/form-5472-dormant-llc-no-income",
      },
      {
        label: "Reportable transaction examples",
        href: "/blog/form-5472-reportable-transactions-examples",
      },
    ],
    showCta: true,
  },
};
