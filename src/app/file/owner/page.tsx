"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type AnswerKey = "single" | "noUsTb" | "individual";

const QUESTIONS: { key: AnswerKey; label: string; detail: string }[] = [
  {
    key: "individual",
    label: "Your LLC is owned by a single foreign individual (a person, not another company or trust).",
    detail:
      "Form 5472 requirements differ when the owner is a foreign corporation, partnership, or trust.",
  },
  {
    key: "noUsTb",
    label: "The LLC has no US trade or business income.",
    detail:
      "If the LLC actually does business in the US (US employees, US-based services, US inventory sold from a US warehouse, etc.) it needs a full Form 1120, not a pro forma — outside our scope.",
  },
  {
    key: "single",
    label: "You can provide all transaction amounts in US dollars.",
    detail:
      "The IRS requires Form 5472 amounts in USD. If your records are in foreign currency, convert using the IRS yearly average rate before entering.",
  },
];

export default function OwnerStepPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<AnswerKey, boolean | null>>({
    individual: null,
    noUsTb: null,
    single: null,
  });

  const allYes = QUESTIONS.every((q) => answers[q.key] === true);
  const anyNo = QUESTIONS.some((q) => answers[q.key] === false);
  const allAnswered = QUESTIONS.every((q) => answers[q.key] !== null);

  function setAnswer(key: AnswerKey, val: boolean) {
    setAnswers((a) => ({ ...a, [key]: val }));
  }

  function continueOn() {
    router.push("/file/years");
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <StepBar current={1} total={3} onBack={() => router.push("/file")} />

        <div className="mt-10">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider">Step 1 of 3</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-balance leading-tight">
            Quick eligibility check
          </h1>
          <p className="mt-3 text-slate-500">
            Our service handles the standard foreign-owned single-member LLC case. Confirm each item below.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {QUESTIONS.map((q) => (
            <div
              key={q.key}
              className="rounded-2xl border-2 border-slate-200 bg-white p-5"
            >
              <p className="font-medium text-slate-900 leading-snug">{q.label}</p>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{q.detail}</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAnswer(q.key, true)}
                  className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                    answers[q.key] === true
                      ? "border-accent bg-accent text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Check className="inline h-4 w-4 mr-1.5" />
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer(q.key, false)}
                  className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                    answers[q.key] === false
                      ? "border-slate-700 bg-slate-700 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  No / Not sure
                </button>
              </div>
            </div>
          ))}
        </div>

        {anyNo && (
          <div className="mt-6 rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <AlertTriangle className="flex-none h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Your filing has extra complexity</p>
                <p className="mt-1.5 text-sm text-amber-800 leading-relaxed">
                  We&apos;re built for the standard case above. Filings involving foreign-entity owners,
                  US trade or business income, or unconverted foreign-currency records need a CPA who
                  handles international tax. We don&apos;t want to take your money and give you a wrong
                  filing.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <Button
            type="button"
            size="lg"
            disabled={!allAnswered || !allYes}
            onClick={continueOn}
            className="w-full h-12 text-sm font-semibold rounded-xl shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {!allAnswered && (
            <p className="mt-2 text-xs text-slate-400 text-center">Answer all three to continue</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBar({ current, total, onBack }: { current: number; total: number; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex-none w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all flex items-center justify-center"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <div className="flex-1 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${
              i < current ? "bg-accent" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="flex-none text-xs font-medium text-slate-400 tabular-nums">{current} / {total}</span>
    </div>
  );
}
