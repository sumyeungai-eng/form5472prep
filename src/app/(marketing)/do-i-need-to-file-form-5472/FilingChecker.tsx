"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOURCES } from "@/lib/tools/filing-checker/sources";
import {
  NODES,
  answersToQuery,
  parseAnswers,
  walk,
  withAnswer,
  withoutLastAnswer,
  type Answers,
  type ResultNode,
} from "@/lib/tools/filing-checker/tree";

const resultStyles: Record<
  ResultNode["verdict"],
  { card: string; eyebrow: string; label: string }
> = {
  "no-filing": {
    card: "border-emerald-200 bg-emerald-50/70",
    eyebrow: "text-emerald-700",
    label: "Likely no filing",
  },
  "different-rules": {
    card: "border-slate-200 bg-slate-50",
    eyebrow: "text-slate-600",
    label: "Different rules",
  },
  "likely-must-file": {
    card: "border-amber-200 bg-amber-50/80",
    eyebrow: "text-amber-700",
    label: "Likely filing",
  },
  "must-file": {
    card: "border-blue-200 bg-blue-50/80",
    eyebrow: "text-blue-700",
    label: "Filing required",
  },
};

type CopyState = "idle" | "copied" | "manual";

export function FilingChecker() {
  const [answers, setAnswers] = useState<Answers>({});
  const [loadedFromUrl, setLoadedFromUrl] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const userActed = useRef(false);

  // Read a shared result from the URL once, after hydration (the server
  // renders the first question so the page works without JavaScript).
  useEffect(() => {
    setAnswers(parseAnswers(window.location.search));
    setLoadedFromUrl(true);
  }, []);

  // Keep the address bar in step with the answers so any step can be shared.
  // replaceState: no new history entry and no scroll jump.
  useEffect(() => {
    if (!loadedFromUrl) return;
    const query = answersToQuery(answers, window.location.search);
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [answers, loadedFromUrl]);

  const { path, current } = walk(answers);
  const node = NODES[current];

  // Move focus to the new heading after the visitor answers, for keyboard and
  // screen-reader users. Not on first load.
  useEffect(() => {
    if (userActed.current) headingRef.current?.focus();
  }, [current]);

  function goTo(value: string) {
    userActed.current = true;
    setCopyState("idle");
    setAnswers((previous) => withAnswer(previous, current, value));
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

  return (
    <section id="checker" className="border-b border-slate-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              {node.kind === "question" ? (
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                  Question {path.length + 1}
                </p>
              ) : (
                <p className={`font-mono text-[11px] font-medium uppercase tracking-[0.18em] ${resultStyles[node.verdict].eyebrow}`}>
                  {resultStyles[node.verdict].label}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {path.length > 0 ? (
                <Button type="button" variant="outline" size="sm" onClick={goBack}>
                  Back
                </Button>
              ) : null}
              <Button type="button" variant="ghost" size="sm" onClick={startOver}>
                Start over
              </Button>
            </div>
          </div>

          <div aria-live="polite">
            {node.kind === "question" ? (
              <div>
                <h2
                  id={`checker-q-${node.id}`}
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-serif text-2xl font-semibold leading-tight text-ink outline-none sm:text-3xl"
                >
                  {node.question}
                </h2>
                {node.help ? (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{node.help}</p>
                ) : null}
                <div role="group" aria-labelledby={`checker-q-${node.id}`} className="mt-7 grid gap-3">
                  {node.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => goTo(option.value)}
                      className="group flex min-h-14 w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-base font-medium text-slate-900 transition-colors hover:border-accent/40 hover:bg-accent-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-5"
                    >
                      <span>{option.label}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`rounded-xl border p-4 sm:p-6 ${resultStyles[node.verdict].card}`}>
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-serif text-2xl font-semibold leading-tight text-ink outline-none sm:text-3xl"
                >
                  {node.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-700">{node.explanation}</p>
                <div className="mt-5 space-y-2">
                  {node.links.map((link) => (
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
                {node.showCta ? (
                  <Link
                    href="/start?src=tool-checker"
                    className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
                  >
                    File it now — done for you
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}

                <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Sources
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {node.sources.map((id) => (
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

                <div className="mt-6 border-t border-slate-200/80 pt-4">
                  <Button type="button" variant="outline" size="sm" onClick={copyLink} className="gap-2">
                    {copyState === "copied" ? (
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Link2 className="h-3.5 w-3.5" aria-hidden />
                    )}
                    {copyState === "copied" ? "Link copied" : "Copy link to this result"}
                  </Button>
                  {copyState === "manual" ? (
                    <label className="mt-3 block text-xs text-slate-600">
                      Copy this link:
                      <input
                        readOnly
                        value={shareUrl()}
                        onFocus={(event) => event.currentTarget.select()}
                        className="mt-1 block w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 py-1.5 font-mono text-xs text-slate-800"
                      />
                    </label>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
          General information, not personalised tax planning. For advice on your own situation, speak to a tax professional.
        </p>
      </div>
    </section>
  );
}
