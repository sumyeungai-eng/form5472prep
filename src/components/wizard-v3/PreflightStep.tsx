"use client";

import { useState } from "react";
import { HelpCircle, ArrowRight } from "lucide-react";

// Three-question quick eligibility check. Sits as Step 0 of the v3 wizard.
// Pure client state — answers don't persist anywhere (the workflow doesn't
// need them after this screen). Purpose is to short-circuit users whose
// situation clearly doesn't fit before they invest time filling the form.
//
// Answers come back to the parent via `onAnswers` so the parent can compute
// sidebar status (complete / missing / untouched) and disable Next if the
// user picked a blocking combination.

export type PreflightAnswers = {
  isForeignOwnedSmllc: boolean | null;
  isMultiMember: boolean | null;
  hasEin: boolean | null;
};

export const EMPTY_PREFLIGHT_ANSWERS: PreflightAnswers = {
  isForeignOwnedSmllc: null,
  isMultiMember: null,
  hasEin: null,
};

export function preflightStatus(a: PreflightAnswers): "complete" | "missing" | "untouched" {
  const total = Object.values(a);
  const answered = total.filter((v) => v !== null).length;
  if (answered === 0) return "untouched";
  if (answered === total.length) return "complete";
  return "missing";
}

export function preflightBlocked(a: PreflightAnswers): { blocked: boolean; reason: string | null } {
  if (a.isForeignOwnedSmllc === false) {
    return { blocked: true, reason: "This workflow is only for foreign-owned U.S. single-member LLCs (disregarded entities)." };
  }
  if (a.isMultiMember === true) {
    return { blocked: true, reason: "Multi-member LLCs file a different return (Form 1065 partnership). This workflow doesn't support them." };
  }
  if (a.hasEin === false) {
    return { blocked: true, reason: "You'll need an EIN before filing Form 5472. Apply at irs.gov/ein, then come back." };
  }
  return { blocked: false, reason: null };
}

// One question row with a "?" toggle that expands an explainer below.
// Click the icon to open/close; click again or anywhere outside to leave it
// closed. Independent state per row so toggling one doesn't collapse others.
function PreflightQuestionRow({
  q,
  value,
  onChange,
}: {
  q: { id: keyof PreflightAnswers; text: string; explainer: string };
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      {/* `?` sits inline right after the question text — not floated to the
          right edge. `flex-wrap` lets it wrap naturally on narrow screens. */}
      <div className="flex items-center flex-wrap gap-1.5">
        <p className="text-sm font-medium text-slate-800">{q.text}</p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`Explain: ${q.text}`}
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
            open
              ? "bg-blue-900 border-blue-900 text-white"
              : "bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100"
          }`}
        >
          <HelpCircle className="h-3 w-3" />
        </button>
      </div>
      {open && (
        <div className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs leading-relaxed text-slate-700">
          {q.explainer}
        </div>
      )}
      <div className="mt-3 inline-flex items-center rounded-full border border-slate-200 bg-white text-sm">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-full px-4 py-1 transition-colors ${
            value === true ? "bg-blue-900 text-white" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-full px-4 py-1 transition-colors ${
            value === false ? "bg-blue-900 text-white" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

type QDef = {
  id: keyof PreflightAnswers;
  text: string;
  // Plain-English explainer that expands when the customer taps the "?"
  // icon next to the question. Kept short so a non-tax-person can read it
  // in one scan.
  explainer: string;
};

const QUESTIONS: QDef[] = [
  {
    id: "isForeignOwnedSmllc",
    text: "Is this for a foreign-owned U.S. single-member LLC?",
    explainer:
      'A "U.S. single-member LLC" means a U.S. limited liability company with exactly one owner. ' +
      '"Foreign-owned" means that one owner is NOT a U.S. citizen, U.S. green-card holder, or U.S. company. ' +
      "If you're a person living outside the U.S. and you opened a U.S. LLC by yourself (no other owners), the answer is Yes. " +
      "If the LLC has 2 or more owners, or the owner is a U.S. citizen/resident, the answer is No.",
  },
  {
    id: "isMultiMember",
    text: "Is the entity multi-member?",
    explainer:
      '"Multi-member" means the LLC has 2 or more owners (members). ' +
      "Multi-member LLCs file a totally different tax return (Form 1065 partnership return), so this service can't help with those. " +
      "If only one person or one company owns the LLC, answer No.",
  },
  {
    id: "hasEin",
    text: "Does this entity already have an EIN?",
    explainer:
      "EIN = Employer Identification Number. It's a 9-digit U.S. tax ID for businesses, formatted like 12-3456789. " +
      "Every U.S. LLC needs one to file Form 5472. " +
      "If you already opened the LLC and got a confirmation letter from the IRS (CP 575 / 147C), you have an EIN. " +
      "If you don't have one yet, apply free at irs.gov/ein — takes about a week internationally — and come back.",
  },
];

export function PreflightStep({
  answers,
  onAnswers,
  onContinue,
}: {
  answers: PreflightAnswers;
  onAnswers: (next: PreflightAnswers) => void;
  onContinue: () => void;
}) {
  const status = preflightStatus(answers);
  const { blocked, reason } = preflightBlocked(answers);
  const canContinue = status === "complete" && !blocked;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-8">
      <div className="text-xs font-semibold tracking-wider text-blue-900 uppercase">Step 1</div>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900 tracking-tight">
        Quick eligibility check
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Three quick questions to confirm this workflow fits your filing.
      </p>

      <hr className="my-6 border-slate-200" />

      <div className="space-y-3">
        {QUESTIONS.map((q) => (
          <PreflightQuestionRow
            key={q.id}
            q={q}
            value={answers[q.id]}
            onChange={(v) => onAnswers({ ...answers, [q.id]: v })}
          />
        ))}
      </div>

      {blocked && reason && (
        <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          <strong>This workflow may not fit your filing.</strong> {reason} If you&apos;d still like
          help, email{" "}
          <a href="mailto:support@form5472prep.com" className="underline">support@form5472prep.com</a>{" "}
          before paying.
        </div>
      )}

      <hr className="my-6 border-slate-200" />

      <div className="flex items-center justify-end gap-3">
        {!canContinue && status !== "complete" && (
          <p className="text-xs text-slate-500">Answer all three questions to continue.</p>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue}
          title={
            !canContinue && status !== "complete"
              ? "Answer all three questions to continue"
              : blocked
                ? "Resolve the eligibility issue above to continue"
                : ""
          }
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to filing <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
