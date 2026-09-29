"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Link2, ListChecks, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  QUERY_PARAM,
  buildShareSearch,
  classify,
  normalizeSelection,
  parseSelection,
  type Overall,
} from "@/lib/tools/reportable-transactions/classify";
import { OVERALL_MESSAGES } from "@/lib/tools/reportable-transactions/content";
import {
  GROUPS,
  PART_DESCRIPTIONS,
  TRANSACTIONS,
} from "@/lib/tools/reportable-transactions/transactions";
import { VerdictBadge } from "./VerdictBadge";

const BANNER_STYLES: Record<Overall, string> = {
  none: "border-slate-200 bg-slate-50",
  reportable: "border-blue-200 bg-blue-50/80",
  depends: "border-amber-200 bg-amber-50/80",
  "not-reportable": "border-emerald-200 bg-emerald-50/70",
};

type CopyState = "idle" | "copied" | "manual";

export function TransactionsChecker({ ctaLabel }: { ctaLabel: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [shareUrl, setShareUrl] = useState("");

  // Read the shared selection (?t=...) once, after hydration, so the page
  // itself stays statically rendered.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelected(parseSelection(params.get(QUERY_PARAM)));
    setReady(true);
  }, []);

  // Keep the address bar in sync so the URL is always the shareable result.
  useEffect(() => {
    if (!ready) return;
    const search = buildShareSearch(window.location.search, selected);
    const next = `${window.location.pathname}${search}${window.location.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) window.history.replaceState(window.history.state, "", next);
    setShareUrl(`${window.location.origin}${window.location.pathname}${buildShareSearch("", selected)}`);
    setCopyState("idle");
  }, [selected, ready]);

  const result = useMemo(() => classify(selected), [selected]);
  const message = OVERALL_MESSAGES[result.overall];
  const selectedSet = new Set(selected);

  function toggle(id: string) {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((value) => value !== id)
        : normalizeSelection([...previous, id]),
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState("copied");
    } catch {
      setCopyState("manual");
    }
  }

  return (
    <section id="checker" className="scroll-mt-4 border-b border-slate-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                <ListChecks className="h-3.5 w-3.5" />
                What happened this tax year?
              </p>
              {selected.length > 0 ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelected([])} className="gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear
                </Button>
              ) : null}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Tick every item that applies to your LLC for one tax year. &ldquo;You&rdquo; means
              the foreign owner of a US single-member LLC.
            </p>

            <div className="mt-6 space-y-7">
              {GROUPS.map((group) => (
                <fieldset key={group.id} className="min-w-0">
                  <legend className="text-sm font-semibold text-ink">{group.title}</legend>
                  <div className="mt-3 grid gap-2.5">
                    {TRANSACTIONS.filter((item) => item.group === group.id).map((item) => {
                      const checked = selectedSet.has(item.id);
                      return (
                        <label
                          key={item.id}
                          className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 transition-colors focus-within:ring-2 focus-within:ring-accent/40 ${
                            checked
                              ? "border-accent/50 bg-accent-50"
                              : "border-slate-200 bg-white hover:border-accent/30 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(item.id)}
                            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-accent focus:ring-accent"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium leading-snug text-slate-900">
                              {item.label}
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                              {item.hint}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:sticky lg:top-4">
            <div
              aria-live="polite"
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                Your result
              </p>

              <div className={`mt-4 rounded-xl border p-4 ${BANNER_STYLES[result.overall]}`}>
                <h2 className="font-serif text-xl font-semibold leading-tight text-ink sm:text-2xl">
                  {message.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{message.body}</p>
                {result.items.length > 0 ? (
                  <p className="mt-3 text-xs font-medium text-slate-600">
                    {result.counts.reportable} reportable · {result.counts.depends} to check ·{" "}
                    {result.counts["not-reportable"]} not reportable
                  </p>
                ) : null}
              </div>

              {result.parts.length > 0 ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-paper p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Parts of Form 5472 involved
                  </p>
                  <ul className="mt-2 space-y-2">
                    {result.parts.map((part) => (
                      <li key={part} className="text-sm leading-relaxed text-slate-700">
                        <span className="font-semibold text-ink">{PART_DESCRIPTIONS[part].title}.</span>{" "}
                        {PART_DESCRIPTIONS[part].plain}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result.items.length > 0 ? (
                <ol className="mt-5 space-y-4">
                  {result.items.map((item) => (
                    <li key={item.id} className="rounded-xl border border-slate-200 p-4">
                      <VerdictBadge verdict={item.verdict} />
                      <p className="mt-2 text-sm font-semibold leading-snug text-slate-900">{item.label}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700">
                        <span className="font-medium text-ink">Where: </span>
                        {item.where}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.reason}</p>
                      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        {item.sources.map((source) => (
                          <a
                            key={source.label}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-words font-medium text-accent hover:underline"
                          >
                            {source.label}
                          </a>
                        ))}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyLink}
                  disabled={result.items.length === 0}
                  className="min-h-11 gap-2"
                >
                  {copyState === "copied" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                  {copyState === "copied" ? "Link copied" : "Copy link to this result"}
                </Button>
              </div>
              {copyState === "manual" ? (
                <label className="mt-3 block">
                  <span className="text-xs text-slate-500">Copy this link:</span>
                  <input
                    readOnly
                    value={shareUrl}
                    onFocus={(event) => event.currentTarget.select()}
                    className="mt-1 h-10 w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700"
                  />
                </label>
              ) : null}

              {result.overall === "reportable" || result.overall === "depends" ? (
                <div className="mt-5 rounded-xl border border-accent/20 bg-accent-50 p-4">
                  <p className="text-sm font-semibold text-ink">We report all of these for you.</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    We prepare Form 5472 with the pro forma Form 1120, including the attached
                    statements, from the answers you give us.
                  </p>
                  <Link
                    href="/start?src=tool-txcheck"
                    className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-700"
                  >
                    {ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              General information, not tax advice. Your own facts decide the answer; for advice on
              your situation, speak to a tax professional.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
