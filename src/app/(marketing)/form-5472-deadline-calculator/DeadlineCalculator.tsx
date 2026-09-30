"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  effectiveDueDateUtc,
  filingDueDateUtc,
  filingDueRule,
  formatDueDate,
  lastCompletedTaxYear,
} from "@/lib/schemas";
import { TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import {
  DEADLINE_PARAMS,
  deadlineQuery,
  defaultTaxYear as pickDefaultTaxYear,
  hasDeadlineParams,
  parseDeadlineParams,
  taxYearOptions as buildTaxYearOptions,
  type DeadlineInput,
} from "@/lib/tools/deadline/params";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type DeadlineState = "upcoming" | "urgent" | "overdue";

export function DeadlineCalculator() {
  const currentUtcYear = new Date().getUTCFullYear();
  const taxYearOptions = useMemo(() => buildTaxYearOptions(currentUtcYear), [currentUtcYear]);
  const defaultTaxYear = pickDefaultTaxYear(taxYearOptions, lastCompletedTaxYear);

  const [taxYear, setTaxYear] = useState(defaultTaxYear);
  const [isDissolved, setIsDissolved] = useState(false);
  const [dissolvedAt, setDissolvedAt] = useState("");
  const [hasExtension, setHasExtension] = useState(false);
  const [loadedFromUrl, setLoadedFromUrl] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");
  // Only start writing ?year=… into the address bar once the visitor has
  // changed something (or arrived on a shared link), so a plain visit keeps
  // the plain URL.
  const syncUrl = useRef(false);

  const minDissolvedAt = `${taxYear}-01-01`;
  const maxDissolvedAt = `${taxYear}-12-31`;

  useEffect(() => {
    if (!isDissolved) {
      setDissolvedAt("");
      return;
    }
    if (dissolvedAt && (dissolvedAt < minDissolvedAt || dissolvedAt > maxDissolvedAt)) {
      setDissolvedAt("");
    }
  }, [dissolvedAt, isDissolved, maxDissolvedAt, minDissolvedAt]);

  // Read a shared result from the URL once, after hydration.
  useEffect(() => {
    const search = window.location.search;
    if (hasDeadlineParams(search)) {
      const parsed = parseDeadlineParams(search, {
        years: taxYearOptions,
        defaultYear: defaultTaxYear,
      });
      setTaxYear(parsed.taxYear);
      setIsDissolved(parsed.dissolvedAt !== null);
      setDissolvedAt(parsed.dissolvedAt ?? "");
      setHasExtension(parsed.extension);
      syncUrl.current = true;
    }
    setLoadedFromUrl(true);
    // Read once on mount; afterwards the inputs drive the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const input: DeadlineInput = {
    taxYear,
    dissolvedAt: isDissolved && dissolvedAt ? dissolvedAt : null,
    extension: hasExtension,
  };
  const query = deadlineQuery(input);

  // Keep the address bar in step with the inputs so the result is shareable.
  // replaceState: no new history entry and no scroll jump. Other params
  // (utm_* and the like) are kept.
  useEffect(() => {
    if (!loadedFromUrl || !syncUrl.current) return;
    const next = new URLSearchParams(window.location.search);
    for (const key of DEADLINE_PARAMS) next.delete(key);
    new URLSearchParams(query).forEach((value, key) => next.set(key, value));
    const url = `${window.location.pathname}?${next.toString()}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [loadedFromUrl, query]);

  function edited() {
    syncUrl.current = true;
    setCopyState("idle");
  }

  function shareUrl(): string {
    return `${window.location.origin}${window.location.pathname}?${query}`;
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

  const result = useMemo(() => {
    const dissolvedAtOrNull = isDissolved && dissolvedAt ? dissolvedAt : null;
    const originalDueMs = filingDueDateUtc(taxYear, dissolvedAtOrNull);
    // Use the original due date as the Form 7004 transmitted date so
    // isExtensionValid passes, while effectiveDueDateUtc owns all date math.
    const extension = hasExtension
      ? { filed: "yes" as const, transmittedAt: new Date(originalDueMs) }
      : null;
    const dueMs = effectiveDueDateUtc(taxYear, dissolvedAtOrNull, extension);
    const nowUtc = new Date();
    const todayUtc = Date.UTC(
      nowUtc.getUTCFullYear(),
      nowUtc.getUTCMonth(),
      nowUtc.getUTCDate(),
    );
    const days = Math.round((dueMs - todayUtc) / ONE_DAY_MS);
    const state: DeadlineState = days < 0 ? "overdue" : days < 30 ? "urgent" : "upcoming";
    // Only to explain the date: the shared due-date code already applied the rule.
    const juneRule = filingDueRule(taxYear, dissolvedAtOrNull).june30Transition;

    return { dueMs, days, state, juneRule };
  }, [dissolvedAt, hasExtension, isDissolved, taxYear]);

  const stateStyles = {
    upcoming: {
      icon: CalendarDays,
      band: "border-slate-200 bg-slate-50 text-slate-700",
      badge: "bg-slate-100 text-slate-700",
      title: `${result.days} days away`,
      body: "The deadline is not immediate, but preparing before the final month gives time for review and signature.",
    },
    urgent: {
      icon: Clock3,
      band: "border-amber-200 bg-amber-50 text-amber-900",
      badge: "bg-amber-100 text-amber-900",
      title: result.days === 0 ? "Due today" : `${result.days} days left`,
      body: "The deadline is inside the final month. Start now so the package can be reviewed and faxed on time.",
    },
    overdue: {
      icon: AlertTriangle,
      band: "border-red-200 bg-red-50 text-red-900",
      badge: "bg-red-100 text-red-900",
      title: `${Math.abs(result.days)} days overdue`,
      body: "The deadline has passed. If the IRS hasn't contacted you, its DIIRSP procedures say to file the late return through normal filing procedures, optionally with a reasonable-cause statement. Penalties may still be assessed.",
    },
  }[result.state];

  const StatusIcon = stateStyles.icon;
  const ctaLabel =
    result.state === "overdue"
      ? `Fix a late filing — ${formatPrice(TIERS.standard.priceCents)}`
      : `File before the deadline — ${formatPrice(TIERS.standard.priceCents)}`;

  return (
    <section
      id="calculator"
      aria-labelledby="deadline-calculator-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-2xl shadow-black/25 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
            Deadline check
          </p>
          <h2 id="deadline-calculator-heading" className="mt-2 font-serif text-2xl font-semibold text-ink">
            Calculate your filing date
          </h2>
        </div>
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-accent-50 text-accent">
          <CalendarDays className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <label htmlFor="tax-year" className="block">
          <span className="text-sm font-medium text-ink">Tax year</span>
          <select
            id="tax-year"
            value={taxYear}
            onChange={(event) => {
              edited();
              setTaxYear(Number(event.target.value));
            }}
            className="mt-2 block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
          >
            {taxYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label htmlFor="is-dissolved" className="flex cursor-pointer items-start gap-3">
            <input
              id="is-dissolved"
              type="checkbox"
              checked={isDissolved}
              onChange={(event) => {
                edited();
                setIsDissolved(event.target.checked);
              }}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            />
            <span>
              <span className="block text-sm font-medium text-ink">
                LLC dissolved during that year?
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                Use this only for a final short-year return.
              </span>
            </span>
          </label>

          {isDissolved && (
            <label htmlFor="dissolved-at" className="mt-4 block">
              <span className="text-sm font-medium text-ink">Dissolution date</span>
              <input
                id="dissolved-at"
                type="date"
                min={minDissolvedAt}
                max={maxDissolvedAt}
                value={dissolvedAt}
                onChange={(event) => {
                  edited();
                  setDissolvedAt(event.target.value);
                }}
                className="mt-2 block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
              />
            </label>
          )}
        </div>

        <label htmlFor="has-extension" className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <input
            id="has-extension"
            type="checkbox"
            checked={hasExtension}
            onChange={(event) => {
              edited();
              setHasExtension(event.target.checked);
            }}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
          />
          <span>
            <span className="block text-sm font-medium text-ink">
              Filed a Form 7004 extension for this year?
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-slate-600">
              Count it only if it was filed by the original due date.
            </span>
          </span>
        </label>
      </div>

      <div className={`mt-6 rounded-xl border p-5 ${stateStyles.band}`}>
        <div className="flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${stateStyles.badge}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {stateStyles.title}
          </span>
          <CheckCircle2 className="h-5 w-5 opacity-70" />
        </div>
        <p className="mt-4 font-serif text-4xl font-semibold tracking-tight text-ink">
          {formatDueDate(result.dueMs)}
        </p>
        <p className="mt-3 text-sm leading-relaxed">{stateStyles.body}</p>
        {result.juneRule ? (
          <p className="mt-3 text-xs leading-relaxed">
            Final year ending in June, begun before 2026: it is treated as ending June 30, so it is
            due on the 15th day of the 3rd month (September 15, or the next business day), and a
            timely Form 7004 adds 7 months instead of 6.
          </p>
        ) : null}
        <div className="mt-4 border-t border-black/10 pt-4">
          <Button type="button" variant="outline" size="sm" onClick={copyLink} className="gap-2 bg-white">
            {copyState === "copied" ? (
              <Check className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Link2 className="h-3.5 w-3.5" aria-hidden />
            )}
            {copyState === "copied" ? "Link copied" : "Copy link to this result"}
          </Button>
          {copyState === "manual" ? (
            <label className="mt-3 block text-xs text-slate-700">
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

      <Link
        href="/start?src=tool-deadline"
        className="group mt-5 inline-flex h-12 w-full items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-700"
      >
        {ctaLabel}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </section>
  );
}
