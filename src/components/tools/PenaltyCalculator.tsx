"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calculator,
  Check,
  FileWarning,
  Link2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CONTINUATION_GRACE_DAYS,
  PENALTY_PER_FORM_CENTS,
  continuationPenaltyCents,
  continuationPeriods,
  initialPenaltyCents,
  totalExposureCents,
} from "@/lib/penalty";
import { TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";
import { SOURCES, type SourceId } from "@/lib/tools/penalty/sources";
import {
  FORM_COUNT_OPTIONS,
  YEAR_COUNT_OPTIONS,
  parsePenaltyParams,
  penaltyQuery,
} from "@/lib/tools/penalty/params";

// Cited under the estimate; the full list is in "How we calculate this".
const RESULT_SOURCES: SourceId[] = ["irc6038a", "i5472", "intlPenalties", "reg6038a4"];

function dateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseNoticeDate(value: string): Date | null {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

type PenaltyCalculatorProps = {
  /** Embed mode (iframe on third-party sites): compact padding, no share-link
   *  button, and every link is absolute and opens in a new tab. */
  embedded?: boolean;
  /** Absolute site origin used for links in embed mode. */
  siteUrl?: string;
};

export function PenaltyCalculator({ embedded = false, siteUrl = "" }: PenaltyCalculatorProps = {}) {
  const linkBase = embedded ? siteUrl : "";
  const linkTarget = embedded ? ({ target: "_blank", rel: "noopener" } as const) : {};
  const [formCount, setFormCount] = useState(1);
  const [yearCount, setYearCount] = useState(1);
  const [noticeReceived, setNoticeReceived] = useState(false);
  const [noticeDateValue, setNoticeDateValue] = useState("");
  const [loadedFromUrl, setLoadedFromUrl] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">("idle");

  // Read a shared result from the URL once, after hydration.
  useEffect(() => {
    const parsed = parsePenaltyParams(window.location.search, dateInputValue(new Date()));
    setFormCount(parsed.formCount);
    setYearCount(parsed.yearCount);
    setNoticeReceived(parsed.noticeDate !== null);
    setNoticeDateValue(parsed.noticeDate ?? "");
    setLoadedFromUrl(true);
  }, []);

  const sharedNoticeDate = noticeReceived && noticeDateValue ? noticeDateValue : null;
  const query = penaltyQuery({ formCount, yearCount, noticeDate: sharedNoticeDate });

  // Keep the address bar in step with the inputs so the estimate is
  // shareable. replaceState: no new history entry and no scroll jump. Other
  // params (utm_* and the like) are kept.
  useEffect(() => {
    if (!loadedFromUrl) return;
    const next = penaltyQuery(
      { formCount, yearCount, noticeDate: sharedNoticeDate },
      window.location.search,
    );
    const url = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`;
    if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [formCount, loadedFromUrl, sharedNoticeDate, yearCount]);

  // A changed estimate needs a fresh copy.
  useEffect(() => {
    setCopyState("idle");
  }, [query]);

  function shareUrl(): string {
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

  const asOf = new Date();
  const maxNoticeDate = dateInputValue(asOf);
  const noticeDate = noticeReceived ? parseNoticeDate(noticeDateValue) : null;
  const continuationPeriodCount = noticeDate
    ? continuationPeriods(noticeDate, asOf)
    : 0;
  const initialPenalty = initialPenaltyCents(formCount, yearCount);
  const continuationPenalty = continuationPenaltyCents(
    formCount,
    yearCount,
    noticeDate,
    asOf,
  );
  const totalExposure = totalExposureCents(
    formCount,
    yearCount,
    noticeDate,
    asOf,
  );

  return (
    <section
      className={
        embedded
          ? "bg-white py-3"
          : "border-b border-slate-100 bg-white py-12 sm:py-16"
      }
    >
      <div className={embedded ? "mx-auto max-w-6xl px-3" : "mx-auto max-w-6xl px-6"}>
        <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              <Calculator className="h-3.5 w-3.5" />
              Calculator inputs
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-slate-900">
                  Number of LLCs
                </span>
                <select
                  value={formCount}
                  onChange={(event) => setFormCount(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  {FORM_COUNT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-900">
                  Tax years unfiled per LLC
                </span>
                <select
                  value={yearCount}
                  onChange={(event) => setYearCount(Number(event.target.value))}
                  className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  {YEAR_COUNT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={noticeReceived}
                    onChange={(event) =>
                      setNoticeReceived(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-900">
                      Received an IRS penalty notice (e.g. CP 215)?
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                      Turn this on only if the IRS has already sent a penalty
                      notice for the late filing.
                    </span>
                  </span>
                </label>

                {noticeReceived ? (
                  <label className="mt-4 block">
                    <span className="text-sm font-medium text-slate-900">
                      Notice date
                    </span>
                    <input
                      type="date"
                      value={noticeDateValue}
                      max={maxNoticeDate}
                      onChange={(event) =>
                        setNoticeDateValue(event.target.value)
                      }
                      className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </label>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              <FileWarning className="h-3.5 w-3.5" />
              Statutory exposure estimate
            </div>

            <div className="mt-6 divide-y divide-slate-100">
              <div className="flex items-start justify-between gap-5 py-4 first:pt-0">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Initial penalty
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {formCount} × {yearCount} ×{" "}
                    {formatPrice(PENALTY_PER_FORM_CENTS)}
                  </p>
                </div>
                <p className="shrink-0 font-serif text-2xl font-semibold tracking-tight text-ink">
                  {formatPrice(initialPenalty)}
                </p>
              </div>

              {noticeReceived && continuationPeriodCount > 0 ? (
                <div className="flex items-start justify-between gap-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Continuation penalty
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      {continuationPeriodCount} × 30-day period(s) since{" "}
                      {CONTINUATION_GRACE_DAYS} days after your notice
                    </p>
                    <p className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      statutory exposure — accrues until filed
                    </p>
                  </div>
                  <p className="shrink-0 font-serif text-2xl font-semibold tracking-tight text-ink">
                    {formatPrice(continuationPenalty)}
                  </p>
                </div>
              ) : null}

              <div className="py-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Total statutory exposure
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">
                      Based on the counts and notice status entered above.
                    </p>
                  </div>
                  <p className="font-serif text-5xl font-semibold tracking-tight text-ink">
                    {formatPrice(totalExposure)}
                  </p>
                </div>
                <div className={embedded ? "hidden" : "mt-4"}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyLink}
                    className="gap-2"
                  >
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
            </div>

            <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                The fix
              </div>
              <p className="mt-3 text-sm leading-relaxed text-emerald-950">
                If you&apos;re not under IRS examination and the IRS hasn&apos;t
                contacted you about the missing returns, its Delinquent
                International Information Return Submission Procedures (DIIRSP)
                say to file them through normal filing procedures, and you may
                attach a reasonable-cause statement. The IRS can excuse these penalties for reasonable
                cause, deciding each case on its facts; there is no guarantee, and
                First Time Abate generally does not apply.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-emerald-950">
                Read the late-filing overview{" "}
                <Link
                  href={`${linkBase}/blog/form-5472-filed-late-never-filed`}
                  {...linkTarget}
                  className="font-medium underline decoration-emerald-700/40 underline-offset-4 hover:text-emerald-800"
                >
                  for DIIRSP late-filing steps
                </Link>{" "}
                and the reasonable-cause letter guide{" "}
                <Link
                  href={`${linkBase}/blog/form-5472-reasonable-cause-letter`}
                  {...linkTarget}
                  className="font-medium underline decoration-emerald-700/40 underline-offset-4 hover:text-emerald-800"
                >
                  for abatement letter requirements
                </Link>
                .
              </p>
              <Link
                href={`${linkBase}/start?src=${embedded ? "embed-penalty" : "tool-penalty"}`}
                {...linkTarget}
                className="group mt-5 inline-block"
              >
                <Button className="min-h-12 gap-2 bg-emerald-700 px-5 text-white hover:bg-emerald-800">
                  File the late years — {formatPrice(TIERS.standard.priceCents)}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-xs leading-relaxed text-slate-500">
                Statutory exposure under IRC §6038A(d), not a prediction of what
                the IRS will assess.{" "}
                <a
                  href={embedded ? `${siteUrl}/form-5472-penalty-calculator#how-we-calculate` : "#how-we-calculate"}
                  {...linkTarget}
                  className="font-medium text-accent underline underline-offset-4 hover:no-underline"
                >
                  How we calculate this
                </a>
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                {RESULT_SOURCES.map((id) => (
                  <li key={id} className="min-w-0">
                    <a
                      href={SOURCES[id].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-words font-medium text-accent hover:underline"
                    >
                      {SOURCES[id].label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
