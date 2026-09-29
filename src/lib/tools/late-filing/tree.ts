// Form 5472 late-filing checker: decision tree + pure evaluator.
//
// No React, no DOM, no I/O. The page's client component and the unit tests both
// drive this module. Every rule stated here comes from a primary source listed
// in ./sources.ts; the quotes are in docs/research/late-filing.md.
//
// Accuracy contract (do not weaken without re-reading the research note):
// - Never say or imply the penalty will be removed. The DIIRSP page itself says
//   "Penalties may be assessed" and that a reasonable-cause statement may be
//   ignored during processing.
// - If a branch isn't clearly covered by the sources, it routes to a review
//   ("Talk to us") or a professional instead of a specific IRS route.

import {
  CONTINUATION_GRACE_DAYS,
  CONTINUATION_PER_PERIOD_CENTS,
  PENALTY_PER_FORM_CENTS,
} from "@/lib/penalty";
import { MULTI_YEAR_ADDON_CENTS, TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import type { SourceId } from "./sources";

const PENALTY = formatPrice(PENALTY_PER_FORM_CENTS);
const CONTINUATION = formatPrice(CONTINUATION_PER_PERIOD_CENTS);
const GRACE = CONTINUATION_GRACE_DAYS;

// Exact IRS wording of who the DIIRSP route is for (DIIRSP page, reviewed 19-Apr-2026).
export const DIIRSP_ELIGIBILITY_QUOTE =
  "Taxpayers who have identified the need to file delinquent international information returns who are not under a civil examination or a criminal investigation by the IRS and have not already been contacted by the IRS about the delinquent information returns should file the delinquent information returns through normal filing procedures.";

export const DIIRSP_PENALTY_QUOTE = "Penalties may be assessed in accordance with existing procedures.";

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export const QUESTION_ORDER = ["exam", "notice", "tax", "years", "reason"] as const;
export type QuestionId = (typeof QUESTION_ORDER)[number];

export const OUTCOME_IDS = [
  "exam-or-investigation",
  "needs-review",
  "penalty-assessed",
  "irs-letter-no-penalty",
  "unreported-tax",
  "diirsp-reasonable-cause",
  "diirsp-cause-unclear",
  "diirsp-no-reasonable-cause",
] as const;
export type OutcomeId = (typeof OUTCOME_IDS)[number];

export type Next = { question: QuestionId } | { outcome: OutcomeId };

export type Option = { value: string; label: string; next: Next };

export type Question = {
  id: QuestionId;
  prompt: string;
  help?: string;
  options: Option[];
};

export const START: QuestionId = "exam";

export const QUESTIONS: Record<QuestionId, Question> = {
  exam: {
    id: "exam",
    prompt: "Is the LLC or its owner under IRS examination (an audit) or criminal investigation?",
    help: "An examination is an IRS audit of a return. If you can't tell whether one is open, choose Not sure.",
    options: [
      { value: "no", label: "No", next: { question: "notice" } },
      { value: "yes", label: "Yes", next: { outcome: "exam-or-investigation" } },
      { value: "unsure", label: "Not sure", next: { outcome: "needs-review" } },
    ],
  },
  notice: {
    id: "notice",
    prompt: "Has the IRS sent you a notice, letter or penalty about these missing Form 5472 returns?",
    options: [
      { value: "no", label: "No — the IRS hasn't contacted us about them", next: { question: "tax" } },
      {
        value: "penalty",
        label: "Yes — a penalty has already been charged",
        next: { outcome: "penalty-assessed" },
      },
      {
        value: "letter",
        label: "Yes — a letter about the returns, but no penalty yet",
        next: { outcome: "irs-letter-no-penalty" },
      },
      { value: "unsure", label: "Not sure", next: { outcome: "needs-review" } },
    ],
  },
  tax: {
    id: "tax",
    prompt: "Did the LLC have U.S. income on which U.S. income tax was owed but not reported or paid?",
    help: "Form 5472 is an information return. This question is about income tax, a separate obligation.",
    options: [
      { value: "no", label: "No", next: { question: "years" } },
      { value: "yes", label: "Yes", next: { outcome: "unreported-tax" } },
      { value: "unsure", label: "Not sure", next: { outcome: "needs-review" } },
    ],
  },
  years: {
    id: "years",
    prompt: "How many tax years of Form 5472 are late?",
    options: [
      { value: "1", label: "1 year", next: { question: "reason" } },
      { value: "2", label: "2 years", next: { question: "reason" } },
      { value: "3", label: "3 years", next: { question: "reason" } },
      { value: "4plus", label: "4 or more years", next: { question: "reason" } },
    ],
  },
  reason: {
    id: "reason",
    prompt: "Is there a reason the returns were late that you can explain and support?",
    help: "Examples people give: you didn't know a foreign-owned LLC had to file, a formation agent or adviser told you nothing was due, or serious illness or missing records got in the way. Whether a reason qualifies is decided case by case.",
    options: [
      { value: "yes", label: "Yes", next: { outcome: "diirsp-reasonable-cause" } },
      { value: "unsure", label: "Not sure it counts", next: { outcome: "diirsp-cause-unclear" } },
      {
        value: "no",
        label: "No — we knew and didn't file",
        next: { outcome: "diirsp-no-reasonable-cause" },
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Outcomes
// ---------------------------------------------------------------------------

export type OutcomeTone = "route" | "caution" | "stop";
export type OutcomeCta = "start" | "review" | "professional";

export type Outcome = {
  id: OutcomeId;
  tone: OutcomeTone;
  /** Route name, shown as the card title. */
  route: string;
  /** One line for the server-rendered "routes at a glance" list. */
  appliesWhen: string;
  /** Plain-English explanation. */
  meaning: string[];
  submitHeading: string;
  /** What you'd submit — high level only, never fill-in reasonable-cause text. */
  submit: string[];
  /** Honest risk note. */
  risk: string;
  sources: SourceId[];
  cta: OutcomeCta;
  /** Show the late-years exposure + package price block (DIIRSP routes only). */
  usesYears: boolean;
  /** Internal pages worth reading next. */
  related: Array<{ label: string; href: string }>;
};

const PENALTY_CALCULATOR = { label: "Form 5472 penalty calculator", href: "/form-5472-penalty-calculator" };
const NOTICE_GUIDE = {
  label: "Got a Form 5472 penalty notice? What to do",
  href: "/blog/form-5472-penalty-notice-what-to-do",
};
const LATE_GUIDE = {
  label: "Filed late or never filed Form 5472? What to do now",
  href: "/blog/form-5472-filed-late-never-filed",
};

const DIIRSP_MEANING =
  "This is the IRS's Delinquent International Information Return Submission Procedures (DIIRSP). The IRS says taxpayers who are not under a civil examination or criminal investigation, and have not already been contacted by the IRS about the delinquent returns, should file them through normal filing procedures.";

const DIIRSP_FILING =
  "For each late year: a pro forma Form 1120 with Form 5472 attached, faxed or mailed to the IRS the way the Form 5472 instructions direct for foreign-owned U.S. disregarded entities.";

const ALL_YEARS_TOGETHER =
  "Every late year at the same time. The IRS manual recommends that reasonable cause not be considered for any year until all delinquent returns have been filed.";

const DIIRSP_RISK =
  "Filing this way does not remove the penalty by itself. The IRS page says penalties may be assessed during processing without considering an attached reasonable-cause statement, and you may need to answer IRS letters and resubmit your reasonable-cause information. Relief is decided case by case.";

export const OUTCOMES: Record<OutcomeId, Outcome> = {
  "exam-or-investigation": {
    id: "exam-or-investigation",
    tone: "stop",
    route: "Under IRS exam or investigation: talk to a professional first",
    appliesWhen: "The LLC or its owner is under IRS civil examination or criminal investigation.",
    meaning: [
      "The IRS describes its delinquent-return route (DIIRSP) only for taxpayers who are not under a civil examination or a criminal investigation. It does not describe a route for your situation.",
      "Before you file anything, speak to a qualified professional who can represent you before the IRS. With a criminal investigation, speak to a lawyer first.",
    ],
    submitHeading: "What you'd submit",
    submit: [
      "Decided with your representative: what to file, when and how depends on the examination or investigation.",
    ],
    risk: `The IRC §6038A(d) penalty of ${PENALTY} per Form 5472 per year can still apply. This tool can't assess an open examination or investigation.`,
    sources: ["diirsp", "irc6038a"],
    cta: "professional",
    usesYears: false,
    related: [PENALTY_CALCULATOR],
  },
  "needs-review": {
    id: "needs-review",
    tone: "caution",
    route: "Talk to us — we'll review your situation",
    appliesWhen:
      "You're not sure whether you're under exam, whether the IRS has contacted you, or whether U.S. tax was owed.",
    meaning: [
      "The right route turns on the answer you weren't sure about. DIIRSP is described only for taxpayers who aren't under examination or investigation and haven't been contacted by the IRS about the missing returns, and unpaid U.S. tax brings in other IRS programmes.",
      "Check your IRS mail for anything about the LLC, then send us what you have. We'll review which route fits before anything is filed.",
    ],
    submitHeading: "What to gather first",
    submit: [
      "Any IRS letters or notices about the LLC or its owner",
      "The tax years you think are late",
      "A summary of the LLC's income and money moving between you and the LLC in those years",
    ],
    risk: `Choosing the wrong route can cost time that matters: if a failure continues more than ${GRACE} days after the IRS mails notice of it, another ${CONTINUATION} can apply for each 30-day period.`,
    sources: ["diirsp", "irc6038a"],
    cta: "review",
    usesYears: false,
    related: [LATE_GUIDE, PENALTY_CALCULATOR],
  },
  "penalty-assessed": {
    id: "penalty-assessed",
    tone: "caution",
    route: "Penalty already charged: respond to the notice and request abatement",
    appliesWhen: "The IRS has already charged (assessed) a Form 5472 penalty.",
    meaning: [
      "DIIRSP is for taxpayers the IRS hasn't already contacted about the missing returns, so it isn't your route now. The penalty is handled through the notice.",
      "The IRS says to follow any instructions and deadlines in the notice, and to call the number on it or write explaining why the penalty should be removed. If you have paid, you can claim a refund on Form 843.",
      `If any Form 5472 is still unfiled, act quickly: if a failure continues more than ${GRACE} days after the IRS mails notice of it, another ${CONTINUATION} can apply for each 30-day period, and the IRS manual says reasonable cause can't reach past that ${GRACE}-day point.`,
    ],
    submitHeading: "What you'd submit",
    submit: [
      "Any Form 5472 and pro forma Form 1120 still missing, for every late year",
      "A written reasonable-cause statement setting out all the facts, with a declaration that it is made under penalties of perjury",
      "A copy of the notice and your supporting documents, sent the way the notice directs",
    ],
    risk: "Abatement is decided case by case, and the notice's deadlines matter. First Time Abate generally doesn't apply to Form 5472 penalties; the IRS manual describes only a narrow exception tied to relief on a late-filed Form 1120.",
    sources: ["intlPenalties", "reg6038a4", "irm20_1_9", "irc6038a"],
    cta: "review",
    usesYears: false,
    related: [NOTICE_GUIDE, PENALTY_CALCULATOR],
  },
  "irs-letter-no-penalty": {
    id: "irs-letter-no-penalty",
    tone: "caution",
    route: "IRS letter, no penalty yet: answer it before the 90-day mark",
    appliesWhen: "The IRS has written to you about the missing returns but hasn't charged a penalty.",
    meaning: [
      "DIIRSP is described for taxpayers who have not already been contacted by the IRS about the delinquent returns, so it isn't your route. Answer the letter by its deadline and follow its instructions.",
      `Timing matters: if a failure continues more than ${GRACE} days after the IRS mails notice of it, the statute adds ${CONTINUATION} for each 30-day period or part of one. For small corporations, the regulation counts promptly and fully complying with IRS requests to file Form 5472 among the facts that support reasonable cause.`,
    ],
    submitHeading: "What you'd submit",
    submit: [
      "The missing Form 5472 and pro forma Form 1120 for the years in the letter, and any other late years",
      "A reasonable-cause statement signed under penalties of perjury, if you are asking for penalty relief",
      "Your reply to the letter, sent the way the letter directs",
    ],
    risk: `The IRS may still assess ${PENALTY} per Form 5472 per year. Relief depends on the IRS accepting reasonable cause.`,
    sources: ["diirsp", "irc6038a", "reg6038a4"],
    cta: "review",
    usesYears: false,
    related: [NOTICE_GUIDE, PENALTY_CALCULATOR],
  },
  "unreported-tax": {
    id: "unreported-tax",
    tone: "stop",
    route: "U.S. tax owed but not reported: this is bigger than Form 5472",
    appliesWhen: "The LLC had U.S. income on which U.S. tax was owed but not reported or paid.",
    meaning: [
      "Late Form 5472s are information returns. Unreported U.S. income tax is a separate problem with its own returns, tax, interest and penalties, and it changes which IRS programme may fit.",
      "The IRS's DIIRSP page points to two other options. The Streamlined Filing Compliance Procedures are designed only for individual taxpayers who certify their conduct was not willful. The Voluntary Disclosure Practice is for willful non-compliance. For mistakes that were not willful, the IRS says to consider filing amended or past-due returns.",
    ],
    submitHeading: "What you'd submit",
    submit: [
      "The late or amended U.S. income tax returns and the tax, alongside the late Form 5472 filings. Which programme applies, and in what order, should be settled in a professional review first.",
    ],
    risk: "Filing only the Form 5472s leaves the tax problem open. If the failure was deliberate, speak to a tax lawyer before filing anything: the Voluntary Disclosure Practice is run by IRS Criminal Investigation.",
    sources: ["diirsp", "streamlined", "vdp"],
    cta: "review",
    usesYears: false,
    related: [PENALTY_CALCULATOR],
  },
  "diirsp-reasonable-cause": {
    id: "diirsp-reasonable-cause",
    tone: "route",
    route: "DIIRSP: file the late returns with a reasonable-cause statement",
    appliesWhen:
      "Not under exam or investigation, not contacted by the IRS, no unreported U.S. tax, and a reason for filing late you can explain.",
    meaning: [
      DIIRSP_MEANING,
      "You can attach a reasonable-cause statement to each late return. Treasury Regulation §1.6038A-4(b) allows a late Form 5472 to be excused for reasonable cause, judged case by case. It tells the IRS to apply that liberally to a small corporation that didn't know the rule, has limited U.S. presence and contact, and promptly complies with IRS requests.",
    ],
    submitHeading: "What you'd submit",
    submit: [
      DIIRSP_FILING,
      "A reasonable-cause statement for each return, setting out all the facts, with a declaration that it is made under penalties of perjury",
      ALL_YEARS_TOGETHER,
    ],
    risk: DIIRSP_RISK,
    sources: ["diirsp", "reg6038a4", "i5472", "irm20_1_9"],
    cta: "start",
    usesYears: true,
    related: [LATE_GUIDE, PENALTY_CALCULATOR],
  },
  "diirsp-cause-unclear": {
    id: "diirsp-cause-unclear",
    tone: "route",
    route: "DIIRSP: file the late returns, and have your reason reviewed first",
    appliesWhen:
      "Not under exam or investigation, not contacted by the IRS, no unreported U.S. tax, but unsure your reason counts.",
    meaning: [
      DIIRSP_MEANING,
      "Whether your reason is reasonable cause is decided case by case on all the facts. The regulation gives, as examples, an honest misunderstanding of fact or law that is reasonable given your experience, and reliance on professional advice where that reliance was reasonable.",
    ],
    submitHeading: "What you'd submit",
    submit: [
      DIIRSP_FILING,
      "A reasonable-cause statement signed under penalties of perjury, if a review shows your facts support one",
      ALL_YEARS_TOGETHER,
    ],
    risk: `${DIIRSP_RISK} If your reason doesn't amount to reasonable cause, the ${PENALTY} penalty per Form 5472 per year can stand.`,
    sources: ["diirsp", "reg6038a4", "i5472", "irm20_1_9"],
    cta: "start",
    usesYears: true,
    related: [LATE_GUIDE, PENALTY_CALCULATOR],
  },
  "diirsp-no-reasonable-cause": {
    id: "diirsp-no-reasonable-cause",
    tone: "caution",
    route: "Late filing without reasonable cause: expect the penalty, and get advice first",
    appliesWhen:
      "Not under exam or investigation, not contacted by the IRS, no unreported U.S. tax, but you knew about the filing and didn't file.",
    meaning: [
      "The DIIRSP page still says to file late returns through normal filing procedures, and a reasonable-cause statement is optional. But relief under the regulation needs an affirmative showing of reasonable cause and good faith. Without one, the penalty can be assessed and stand.",
      "If not filing was a deliberate choice, note that the IRS's Voluntary Disclosure Practice is aimed at willful non-compliance. Talk it through before you file.",
    ],
    submitHeading: "What you'd submit",
    submit: [
      DIIRSP_FILING,
      "Only after a review of whether any reasonable cause exists for any of the years",
    ],
    risk: `Filing late without reasonable cause doesn't stop the ${PENALTY}-per-return penalty. Waiting doesn't help either: if a failure continues more than ${GRACE} days after the IRS mails notice of it, another ${CONTINUATION} can apply for each 30-day period.`,
    sources: ["diirsp", "reg6038a4", "vdp", "irc6038a"],
    cta: "review",
    usesYears: true,
    related: [LATE_GUIDE, PENALTY_CALCULATOR],
  },
};

// ---------------------------------------------------------------------------
// Evaluator
// ---------------------------------------------------------------------------

export type Answers = Partial<Record<QuestionId, string>>;

export type Step =
  | { kind: "question"; question: QuestionId; path: QuestionId[] }
  | { kind: "outcome"; outcome: OutcomeId; path: QuestionId[] };

function optionFor(questionId: QuestionId, value: string | undefined): Option | undefined {
  if (value === undefined) return undefined;
  return QUESTIONS[questionId].options.find((option) => option.value === value);
}

/**
 * Walk the tree from START using `answers`. Returns the first unanswered (or
 * invalidly answered) question, or the outcome the answers lead to. `path`
 * lists the questions answered on the way, in order. Answers to questions
 * off that path are ignored.
 */
export function evaluate(answers: Answers): Step {
  const path: QuestionId[] = [];
  let current: QuestionId = START;

  // The tree is acyclic, so it can never take more steps than there are questions.
  for (let guard = 0; guard <= QUESTION_ORDER.length; guard += 1) {
    const option = optionFor(current, answers[current]);
    if (!option) return { kind: "question", question: current, path };
    path.push(current);
    if ("outcome" in option.next) return { kind: "outcome", outcome: option.next.outcome, path };
    current = option.next.question;
  }

  throw new Error("late-filing tree: cycle detected");
}

/** Keep only valid answers that lie on the evaluated path. */
export function canonicalAnswers(answers: Answers): Answers {
  const step = evaluate(answers);
  const out: Answers = {};
  for (const id of step.path) out[id] = answers[id];
  return out;
}

/** Drop the most recent answer on the path (the checker's Back button). */
export function withoutLastAnswer(answers: Answers): Answers {
  const canonical = canonicalAnswers(answers);
  const path = evaluate(canonical).path;
  const last = path[path.length - 1];
  if (!last) return canonical;
  const next = { ...canonical };
  delete next[last];
  return next;
}

// ---------------------------------------------------------------------------
// Shareable URL (query-string codec)
// ---------------------------------------------------------------------------

/** Read answers from a query string. Unknown keys and invalid values are dropped. */
export function parseAnswers(search: string | URLSearchParams): Answers {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const out: Answers = {};
  for (const id of QUESTION_ORDER) {
    const value = params.get(id);
    if (value !== null && optionFor(id, value)) out[id] = value;
  }
  return canonicalAnswers(out);
}

/**
 * Write the canonical answers into `existing` (other params such as utm_* are
 * kept) and return the query string without a leading "?".
 */
export function answersToQuery(answers: Answers, existing?: string | URLSearchParams): string {
  const params = new URLSearchParams(existing ?? "");
  for (const id of QUESTION_ORDER) params.delete(id);
  const canonical = canonicalAnswers(answers);
  for (const id of QUESTION_ORDER) {
    const value = canonical[id];
    if (value !== undefined) params.set(id, value);
  }
  return params.toString();
}

// ---------------------------------------------------------------------------
// Late-years figures (DIIRSP outcomes)
// ---------------------------------------------------------------------------

export type LateYears = { count: number; orMore: boolean };

export function lateYears(answers: Answers): LateYears | null {
  const value = canonicalAnswers(answers).years;
  if (value === undefined) return null;
  if (value === "4plus") return { count: 4, orMore: true };
  return { count: Number(value), orMore: false };
}

/** Initial §6038A(d)(1) penalty for one Form 5472 per late year (one foreign related party). */
export function initialExposureCents(years: LateYears): number {
  return PENALTY_PER_FORM_CENTS * years.count;
}

/** Standard late-filing package: first year at the Standard tier + the multi-year add-on per extra year. */
export function packagePriceCents(years: LateYears): number {
  return TIERS.standard.priceCents + MULTI_YEAR_ADDON_CENTS * (years.count - 1);
}
