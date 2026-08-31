"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NODES, START, type NodeId, type ResultNode } from "./checkerTree";

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

export function FilingChecker() {
  const [currentId, setCurrentId] = useState<NodeId>(START);
  const [history, setHistory] = useState<NodeId[]>([]);
  const node = NODES[currentId];

  function goTo(next: NodeId) {
    setHistory((previous) => [...previous, currentId]);
    setCurrentId(next);
  }

  function goBack() {
    const previousId = history[history.length - 1];

    if (!previousId) {
      return;
    }

    setCurrentId(previousId);
    setHistory((previous) => previous.slice(0, -1));
  }

  function startOver() {
    setCurrentId(START);
    setHistory([]);
  }

  return (
    <section className="border-b border-slate-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              {node.kind === "question" ? (
                <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                  Question {history.length + 1}
                </p>
              ) : (
                <p className={`font-mono text-[11px] font-medium uppercase tracking-[0.18em] ${resultStyles[node.verdict].eyebrow}`}>
                  {resultStyles[node.verdict].label}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 ? (
                <Button type="button" variant="outline" size="sm" onClick={goBack}>
                  Back
                </Button>
              ) : null}
              <Button type="button" variant="ghost" size="sm" onClick={startOver}>
                Start over
              </Button>
            </div>
          </div>

          {node.kind === "question" ? (
            <div>
              <h2 className="font-serif text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                {node.question}
              </h2>
              {node.help ? (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{node.help}</p>
              ) : null}
              <div className="mt-7 grid gap-3">
                {node.options.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => goTo(option.next)}
                    className="group flex min-h-14 w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-base font-medium text-slate-900 transition-colors hover:border-accent/40 hover:bg-accent-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-5"
                  >
                    <span>{option.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`rounded-xl border p-5 sm:p-6 ${resultStyles[node.verdict].card}`}>
              <h2 className="font-serif text-2xl font-semibold leading-tight text-ink sm:text-3xl">
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
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
          General information, not tax advice. Use this checker as a starting point for your own facts.
        </p>
      </div>
    </section>
  );
}
