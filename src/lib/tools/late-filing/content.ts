// Static copy for /form-5472-late-filing-checker that must stay in step with
// the tree and the research note (docs/research/late-filing.md). FAQ answers
// are capped at 50 words (enforced in tree.test.ts) so answer engines can
// quote them whole.

import { CONTINUATION_GRACE_DAYS, CONTINUATION_PER_PERIOD_CENTS, PENALTY_PER_FORM_CENTS } from "@/lib/penalty";
import { formatPrice } from "@/lib/utils";

const PENALTY = formatPrice(PENALTY_PER_FORM_CENTS);
const CONTINUATION = formatPrice(CONTINUATION_PER_PERIOD_CENTS);

/** Answer-first lead. Rendered with data-speakable. */
export const ANSWER_FIRST =
  "There is no guaranteed penalty-free way to file Form 5472 late. If you are not under IRS examination or investigation and the IRS has not contacted you about the missing returns, the IRS says to file them through normal filing procedures (DIIRSP), where you may attach a reasonable-cause statement. Penalties may still be assessed.";

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "Can I file Form 5472 late without a penalty?",
    a: "There's no guaranteed penalty-free route. If you're not under IRS examination or investigation and haven't been contacted about the missing returns, the IRS says to file them through normal procedures, optionally with a reasonable-cause statement. Penalties may still be assessed; relief depends on the IRS accepting reasonable cause.",
  },
  {
    q: "What is DIIRSP?",
    a: "The Delinquent International Information Return Submission Procedures are the IRS's instructions for filing late international information returns such as Form 5472. They cover taxpayers who aren't under civil examination or criminal investigation and haven't already been contacted by the IRS about the delinquent returns.",
  },
  {
    q: "Does First-Time Abatement apply to the Form 5472 penalty?",
    a: "Generally no. The IRS manual says First Time Abate doesn't apply to event-based filings such as Form 5472, with a narrow exception tied to relief on a late-filed Form 1120. The usual route is reasonable cause under Treasury Regulation §1.6038A-4(b).",
  },
  {
    q: "What counts as reasonable cause for a late Form 5472?",
    a: "It's decided case by case on all the facts. Examples include an honest, reasonable misunderstanding of fact or law, and reasonable reliance on professional advice. The IRS must apply it liberally to small corporations that didn't know the rule, have limited U.S. presence and promptly comply with IRS requests.",
  },
  {
    q: "What if the IRS already sent a penalty notice?",
    a: `Then DIIRSP no longer fits, because it covers taxpayers not yet contacted. Follow the notice's instructions and deadlines, file any missing returns, and request abatement with a written reasonable-cause statement signed under penalties of perjury. Continuation penalties can start ${CONTINUATION_GRACE_DAYS} days after the notice.`,
  },
  {
    q: "How much is the penalty for a late Form 5472?",
    a: `${PENALTY} for each Form 5472 not filed when due, for each tax year, under IRC §6038A(d). If the failure continues more than ${CONTINUATION_GRACE_DAYS} days after the IRS mails a notice, another ${CONTINUATION} applies for each 30-day period or part of one.`,
  },
];

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
