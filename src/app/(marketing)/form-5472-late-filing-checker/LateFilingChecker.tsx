"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PENALTY_PER_FORM_CENTS } from "@/lib/penalty";
import { MULTI_YEAR_ADDON_CENTS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { SOURCES } from "@/lib/tools/late-filing/sources";
import {
  OUTCOMES,
  QUESTIONS,
  QUESTION_ORDER,
  answersToQuery,
  canonicalAnswers,
  evaluate,
  initialExposureCents,
  lateYears,
  packagePriceCents,
  parseAnswers,
  withoutLastAnswer,
  type Answers,
  type Outcome,
  type OutcomeTone,
  type QuestionId,
} from "@/lib/tools/late-filing/tree";

const START_HREF = "/start?src=tool-latefile";
const CONTACT_HREF = "/contact";

const toneStyles: Record<OutcomeTone, { card: string; eyebrow: string; label: string }> = {
  route: {
    card: "border-emerald-200 bg-emerald-50/70",
    eyebrow: "text-emerald-700",
    label: "Your late-filing route",
  },
  caution: {
    card: "border-amber-200 bg-amber-50/80",
    eyebrow: "text-amber-700",
    label: "Handle with care",
  },
  stop: {
    card: "border-rose-200 bg-rose-50/70",
    eyebrow: "text-rose-700",
    label: "Get help before you file",
  },
};

export function LateFilingChecker() {
  const [answers, setAnswers] = useState<Answers>({});
  const [loadedFromUrl, setLoadedFromUrl] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const userActed = useRef(false);

  // Read a shared result from the URL once, after hydration (the server
  // renders the first question so the page works without JavaScript).
  useEffect(() => {
    setAnswers(parseAnswers(window.location.search));
    setLoadedFromUrl(true);
  }, []);

  // Keep the URL in step with the answers so any step can be shared.
  useEffect(() => {
    if (!loadedFromUrl) return;
    const query = answersToQuery(answers, window.location.search);
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [answers, loadedFromUrl]);

  const step = evaluate(answers);
  const stepKey = step.kind === "question" ? `q:${step.question}` : `o:${step.outcome}`;

  // Move focus to the new heading after the visitor answers, for keyboard and
  // screen-reader users. Not on first load.
  useEffect(() => {
    if (userActed.current) headingRef.current?.focus();
  }, [stepKey]);

  function answer(questionId: QuestionId, value: string) {
    userActed.current = true;
    setCopyState("idle");
    setAnswers((previous) => canonicalAnswers({ ...canonicalAnswers(previous), [questionId]: value }));
  }

  function goBack() {
    userActed.current = true;
    setCopyState("idle");
    setAnswers((previous) => withoutLastAnswer(previous));
  }

  function startOver() {
    userActed.current = true;
    setCopyState("idle");
    setAnswers({});
  }

  function shareUrl(): string {
    const query = answersToQuery(answers);
    return `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ""}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopyState("copied");
      window.setTimeout(() => setCopyState((s) => (s === "copied" ? "idle" : s)), 2500);
    } catch {
      setCopyState("manual");
    }
  }

  const answeredCount = step.path.length;

  return (
    <section id="checker" className="border-b border-slate-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p
              className={`font-mono text-[11px] font-medium uppercase tracking-[0.18em] ${
                step.kind === "question" ? "text-accent" : toneStyles[OUTCOMES[step.outcome].tone].eyebrow
              }`}
            >
              {step.kind === "question"
                ? `Question ${answeredCount + 1} of up to ${QUESTION_ORDER.length}`
                : toneStyles[OUTCOMES[step.outcome].tone].label}
            </p>
            <div className="flex items-center gap-2">
              {answeredCount > 0 ? (
                <Button type="button" variant="outline" size="sm" onClick={goBack}>
                  Back
                </Button>
              ) : null}
              {answeredCount > 0 ? (
                <Button type="button" variant="ghost" size="sm" onClick={startOver}>
                  Start over
                </Button>
              ) : null}
            </div>
          </div>

          <div aria-live="polite">
            {step.kind === "question" ? (
              <QuestionView
                questionId={step.question}
                headingRef={headingRef}
                onAnswer={(value) => answer(step.question, value)}
              />
            ) : (
              <OutcomeView
                outcome={OUTCOMES[step.outcome]}
                answers={answers}
                headingRef={headingRef}
                copyState={copyState}
                onCopy={copyLink}
                manualUrl={copyState === "manual" ? shareUrl() : null}
              />
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
          General information, not tax advice. The IRS decides whether any penalty is removed. For
          advice on your own situation, speak to a tax professional.
        </p>
      </div>
    </section>
  );
}

function QuestionView({
  questionId,
  headingRef,
  onAnswer,
}: {
  questionId: QuestionId;
  headingRef: React.RefObject<HTMLHeadingElement>;
  onAnswer: (value: string) => void;
}) {
  const question = QUESTIONS[questionId];
  const headingId = `late-q-${questionId}`;

  return (
    <div>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="font-serif text-2xl font-semibold leading-tight text-ink outline-none sm:text-3xl"
      >
        {question.prompt}
      </h2>
      {question.help ? (
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{question.help}</p>
      ) : null}
      <div role="group" aria-labelledby={headingId} className="mt-7 grid gap-3">
        {question.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onAnswer(option.value)}
            className="group flex min-h-14 w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-base font-medium text-slate-900 transition-colors hover:border-accent/40 hover:bg-accent-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-5"
          >
            <span>{option.label}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
          </button>
        ))}
      </div>
    </div>
  );
}

function OutcomeView({
  outcome,
  answers,
  headingRef,
  copyState,
  onCopy,
  manualUrl,
}: {
  outcome: Outcome;
  answers: Answers;
  headingRef: React.RefObject<HTMLHeadingElement>;
  copyState: "idle" | "copied" | "manual";
  onCopy: () => void;
  manualUrl: string | null;
}) {
  const style = toneStyles[outcome.tone];
  const years = outcome.usesYears ? lateYears(answers) : null;

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${style.card}`}>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-serif text-2xl font-semibold leading-tight text-ink outline-none sm:text-3xl"
      >
        {outcome.route}
      </h2>

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        What it means
      </h3>
      <div className="mt-2 space-y-3 text-base leading-relaxed text-slate-700">
        {outcome.meaning.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {outcome.submitHeading}
      </h3>
      <ul className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
        {outcome.submit.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {years ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
          <p className="font-semibold text-slate-900">
            Your numbers: {years.count}
            {years.orMore ? " or more" : ""} late {years.count === 1 && !years.orMore ? "year" : "years"}
          </p>
          <p className="mt-1">
            Initial penalty under IRC §6038A(d)(1): {formatPrice(PENALTY_PER_FORM_CENTS)} per Form 5472
            per year, so {formatPrice(initialExposureCents(years))}
            {years.orMore ? " or more" : ""} with one foreign related party, before any continuation
            penalty.{" "}
            <Link
              href="/form-5472-penalty-calculator"
              className="font-medium text-accent underline underline-offset-4 hover:no-underline"
            >
              Estimate the full exposure
            </Link>
          </p>
        </div>
      ) : null}

      <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-800">
          Honest risk note
        </p>
        <p className="mt-1 text-sm leading-relaxed text-amber-950">{outcome.risk}</p>
      </div>

      <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        Sources
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm">
        {outcome.sources.map((id) => (
          <li key={id} className="min-w-0">
            <a
              href={SOURCES[id].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-start gap-1.5 break-words text-accent underline underline-offset-4 hover:no-underline"
            >
              <span className="min-w-0">{SOURCES[id].label}</span>
              <ExternalLink className="mt-1 h-3 w-3 shrink-0" aria-hidden />
            </a>
          </li>
        ))}
      </ul>

      <OutcomeCta outcome={outcome} years={years} />

      {outcome.related.length > 0 ? (
        <div className="mt-5 space-y-2">
          {outcome.related.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-2 text-sm font-medium text-accent hover:underline"
            >
              {link.label}
              <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-6 border-t border-slate-200/80 pt-4">
        <Button type="button" variant="outline" size="sm" onClick={onCopy} className="gap-2">
          {copyState === "copied" ? (
            <Check className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Link2 className="h-3.5 w-3.5" aria-hidden />
          )}
          {copyState === "copied" ? "Link copied" : "Copy link to this result"}
        </Button>
        {manualUrl ? (
          <label className="mt-3 block text-xs text-slate-600">
            Copy this link:
            <input
              readOnly
              value={manualUrl}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-1 block w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs text-slate-800"
            />
          </label>
        ) : null}
      </div>
    </div>
  );
}

function OutcomeCta({
  outcome,
  years,
}: {
  outcome: Outcome;
  years: ReturnType<typeof lateYears>;
}) {
  const linkClass =
    "mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-700 sm:w-auto";

  if (outcome.cta === "start") {
    return (
      <div>
        <Link href={START_HREF} className={linkClass}>
          Start my late filing
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Form 5472 + pro forma 1120 for each late year and a reasonable-cause statement, reviewed by a
          qualified accountant before it is submitted.
          {years
            ? ` Standard package for ${years.count} ${years.count === 1 ? "year" : "years"}: ${formatPrice(
                packagePriceCents(years),
              )}${years.orMore ? `, plus ${formatPrice(MULTI_YEAR_ADDON_CENTS)} for each further year` : ""}.`
            : ""}
        </p>
      </div>
    );
  }

  if (outcome.cta === "review") {
    return (
      <Link href={CONTACT_HREF} className={linkClass}>
        Talk to us — we&apos;ll review your situation
        <ArrowRight className="h-4 w-4 shrink-0" />
      </Link>
    );
  }

  return (
    <p className="mt-6 text-sm leading-relaxed text-slate-700">
      This needs someone who can represent you before the IRS. If you have general questions first,{" "}
      <Link href={CONTACT_HREF} className="font-medium text-accent underline underline-offset-4">
        contact us
      </Link>
      .
    </p>
  );
}
