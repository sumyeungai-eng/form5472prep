// Decision tree for /do-i-need-to-file-form-5472 plus its shareable-URL state.
// Every rule the tree applies is sourced in ./sources.ts and
// docs/research/filing-checker.md.
//
// Shareable URL: each question has a short query key and each option a short
// value, e.g.
//   ?llc=yes&owners=one&owner=foreign&corp=no&existed=yes&moved=yes
// Parsing walks the tree from START and stops at the first missing or invalid
// answer, so a bad or tampered link falls back to the last valid question
// (or the first question) instead of a wrong result.

import type { SourceId } from "./sources";

export type NodeId = string;

export type QuestionNode = {
  kind: "question";
  id: NodeId;
  /** Query-string key for this question's answer. */
  param: string;
  question: string;
  help?: string;
  options: Array<{ label: string; value: string; next: NodeId }>;
};

export type ResultNode = {
  kind: "result";
  id: NodeId;
  verdict: "must-file" | "likely-must-file" | "no-filing" | "different-rules";
  title: string;
  explanation: string;
  links: Array<{ label: string; href: string }>;
  showCta: boolean;
  sources: SourceId[];
};

export const START: NodeId = "has-us-llc";

export const NODES: Record<NodeId, QuestionNode | ResultNode> = {
  "has-us-llc": {
    kind: "question",
    id: "has-us-llc",
    param: "llc",
    question: "Do you have a US LLC?",
    options: [
      { label: "No", value: "no", next: "no-us-llc" },
      { label: "Yes", value: "yes", next: "owner-count" },
    ],
  },
  "owner-count": {
    kind: "question",
    id: "owner-count",
    param: "owners",
    question: "How many owners (members) does the LLC have?",
    options: [
      { label: "Just me — one owner", value: "one", next: "foreign-owner" },
      { label: "Two or more", value: "multi", next: "multi-member-different-rules" },
    ],
  },
  "foreign-owner": {
    kind: "question",
    id: "foreign-owner",
    param: "owner",
    question: "Is the owner a non-US person or a foreign company?",
    help: "A non-US citizen/resident individual, or a company formed outside the United States.",
    options: [
      { label: "No — I'm a US person", value: "us", next: "us-owned-no-filing" },
      { label: "Yes", value: "foreign", next: "corporate-election" },
    ],
  },
  "corporate-election": {
    kind: "question",
    id: "corporate-election",
    param: "corp",
    question:
      "Has the LLC elected to be taxed as a corporation (filed Form 8832 and files Form 1120 as a C-corp)?",
    options: [
      { label: "Yes", value: "yes", next: "corp-election-different-rules" },
      { label: "No / Not sure", value: "no", next: "existed-during-year" },
    ],
  },
  "existed-during-year": {
    kind: "question",
    id: "existed-during-year",
    param: "existed",
    question: "Did the LLC exist at any point during the tax year?",
    options: [
      { label: "No", value: "no", next: "not-formed-no-filing" },
      { label: "Yes", value: "yes", next: "money-or-property-moved" },
    ],
  },
  "money-or-property-moved": {
    kind: "question",
    id: "money-or-property-moved",
    param: "moved",
    question:
      "During that year, did ANY money or property move between you (or related parties) and the LLC — including the deposit that opened its bank account, formation costs you paid, loans, or owner draws?",
    options: [
      { label: "Yes", value: "yes", next: "must-file-reportable-transaction" },
      { label: "No, truly nothing", value: "no", next: "protective-filing" },
      { label: "Not sure", value: "unsure", next: "uncertain-transactions" },
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
    sources: ["i5472", "reg6038a1"],
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
    sources: ["reg7701_3", "i1065", "i5472"],
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
    sources: ["reg7701_2", "i5472"],
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
    sources: ["i5472", "irc6038a"],
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
    sources: ["i5472"],
  },
  "must-file-reportable-transaction": {
    kind: "result",
    id: "must-file-reportable-transaction",
    verdict: "must-file",
    title: "Yes — you must file Form 5472 + pro forma 1120",
    explanation:
      "A foreign-owned US single-member LLC with reportable transactions generally must file Form 5472 attached to a pro forma Form 1120. For a calendar-year LLC, the deadline is April 15 unless an extension applies. The penalty for not filing Form 5472 when due, or for filing a substantially incomplete one, is $25,000.",
    links: [
      { label: "How to fill out Form 5472", href: "/blog/how-to-fill-out-form-5472" },
      { label: "Form 5472 deadline calculator", href: "/form-5472-deadline-calculator" },
    ],
    showCta: true,
    sources: ["i5472", "reg6038a2", "i1120", "irc6038a"],
  },
  "protective-filing": {
    kind: "result",
    id: "protective-filing",
    verdict: "likely-must-file",
    title: "Probably still safer to file",
    explanation:
      "The Form 5472 instructions excuse a foreign-owned LLC from filing for a year with no reportable transactions. Before you rely on that, check the year again: formation-year costs, initial capital contributions, owner-paid registered-agent fees, loans, and reimbursements can all count as reportable transactions, and missing a required Form 5472 can cost $25,000.",
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
    sources: ["i5472", "reg6038a2"],
  },
  "uncertain-transactions": {
    kind: "result",
    id: "uncertain-transactions",
    verdict: "likely-must-file",
    title: "Probably yes — check the year's records",
    explanation:
      "Formation funding alone can be a reportable transaction, including an initial bank deposit or a registered-agent fee paid by the owner: the Form 5472 instructions count contributions to the LLC and amounts paid in connection with forming it. If you can't rule those out, plan on filing. The practical next step is to list the year's owner payments, reimbursements, deposits, loans, and draws and prepare the disclosure from that record.",
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
    sources: ["i5472", "reg6038a2"],
  },
};

// ---------------------------------------------------------------------------
// Shareable-URL state
// ---------------------------------------------------------------------------

/** Answers keyed by each question's query key (e.g. { llc: "yes" }). */
export type Answers = Partial<Record<string, string>>;

export type Walk = {
  /** Questions answered on the way to `current`, in order. */
  path: Array<{ nodeId: NodeId; param: string; value: string }>;
  /** The question to ask next, or the result reached. */
  current: NodeId;
};

export const QUESTION_PARAMS: readonly string[] = Object.values(NODES).flatMap((node) =>
  node.kind === "question" ? [node.param] : [],
);

// The tree is acyclic; the cap only guards against a future editing mistake.
const MAX_STEPS = Object.keys(NODES).length;

/** Follow the answers from START until a result or the first unanswered/invalid question. */
export function walk(answers: Answers): Walk {
  const path: Walk["path"] = [];
  let current: NodeId = START;
  for (let step = 0; step < MAX_STEPS; step += 1) {
    const node = NODES[current];
    if (!node || node.kind === "result") break;
    const value = answers[node.param];
    const option = node.options.find((o) => o.value === value);
    if (!option) break;
    path.push({ nodeId: node.id, param: node.param, value: option.value });
    current = option.next;
  }
  return { path, current };
}

/** Keep only the answers that lie on the path the tree actually follows. */
export function canonicalAnswers(answers: Answers): Answers {
  const out: Answers = {};
  for (const step of walk(answers).path) out[step.param] = step.value;
  return out;
}

/** Record an answer to `nodeId` and drop anything that is no longer on the path. */
export function withAnswer(answers: Answers, nodeId: NodeId, value: string): Answers {
  const node = NODES[nodeId];
  if (!node || node.kind !== "question") return canonicalAnswers(answers);
  return canonicalAnswers({ ...canonicalAnswers(answers), [node.param]: value });
}

/** Undo the most recent answer (the Back button). */
export function withoutLastAnswer(answers: Answers): Answers {
  const { path } = walk(answers);
  const out: Answers = {};
  for (const step of path.slice(0, -1)) out[step.param] = step.value;
  return out;
}

export function parseAnswers(search: string | URLSearchParams): Answers {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const raw: Answers = {};
  for (const key of QUESTION_PARAMS) {
    const value = params.get(key);
    if (value !== null) raw[key] = value.trim().toLowerCase();
  }
  return canonicalAnswers(raw);
}

/**
 * Write the canonical answers into `existing` (other params such as utm_* are
 * kept) and return the query string without a leading "?". Keys follow the
 * order the questions are asked.
 */
export function answersToQuery(answers: Answers, existing?: string | URLSearchParams): string {
  const params = new URLSearchParams(existing ?? "");
  for (const key of QUESTION_PARAMS) params.delete(key);
  for (const step of walk(answers).path) params.set(step.param, step.value);
  return params.toString();
}
