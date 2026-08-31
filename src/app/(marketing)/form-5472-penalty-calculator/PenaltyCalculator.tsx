"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Calculator, FileWarning, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CONTINUATION_GRACE_DAYS,
  PENALTY_CITATIONS,
  PENALTY_PER_FORM_CENTS,
  continuationPenaltyCents,
  continuationPeriods,
  initialPenaltyCents,
  totalExposureCents,
} from "@/lib/penalty";
import { TIERS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

const FORM_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const YEAR_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

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

export function PenaltyCalculator() {
  const [formCount, setFormCount] = useState(1);
  const [yearCount, setYearCount] = useState(1);
  const [noticeReceived, setNoticeReceived] = useState(false);
  const [noticeDateValue, setNoticeDateValue] = useState("");

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
    <section className="border-b border-slate-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-6">
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
                      Received an IRS penalty notice (e.g. CP15)?
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
              </div>
            </div>

            <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                The fix
              </div>
              <p className="mt-3 text-sm leading-relaxed text-emerald-950">
                Filing now under the IRS Delinquent International Information
                Return Submission Procedures (DIIRSP), with a reasonable-cause
                statement, is the standard resolution path for many late Form
                5472 cases. These penalties are frequently abated for first-time
                late filers who can document reasonable cause, though the IRS
                decides each case on its facts.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-emerald-950">
                Read the late-filing overview{" "}
                <Link
                  href="/blog/form-5472-filed-late-never-filed"
                  className="font-medium underline decoration-emerald-700/40 underline-offset-4 hover:text-emerald-800"
                >
                  here
                </Link>{" "}
                and the reasonable-cause letter guide{" "}
                <Link
                  href="/blog/form-5472-reasonable-cause-letter"
                  className="font-medium underline decoration-emerald-700/40 underline-offset-4 hover:text-emerald-800"
                >
                  here
                </Link>
                .
              </p>
              <Link href="/start?src=tool-penalty" className="group mt-5 inline-block">
                <Button className="min-h-12 gap-2 bg-emerald-700 px-5 text-white hover:bg-emerald-800">
                  File the late years — {formatPrice(TIERS.standard.priceCents)}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-xs leading-relaxed text-slate-500">
                Statutory exposure under IRC §6038A(d), not a prediction of what
                the IRS will assess.
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                {PENALTY_CITATIONS.map((citation) => (
                  <li key={citation.url}>
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-accent hover:underline"
                    >
                      {citation.label}
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
