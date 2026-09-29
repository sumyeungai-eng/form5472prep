"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Link2 } from "lucide-react";
import type { StateCode, StateFees } from "@/lib/tools/state-fees/types";
import { isStateCode } from "@/lib/tools/state-fees/types";

type SortKey = "name" | "cost-asc" | "cost-desc";
type ReportFilter = "all" | "yes" | "no";

const PAGE_PATH = "/llc-annual-fees-by-state";

const REPORT_LABEL: Record<StateFees["annualReport"], string> = {
  yes: "Yes",
  no: "No",
  biennial: "Every 2 years",
};

export function FeesTable({ rows }: { rows: StateFees[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [report, setReport] = useState<ReportFilter>("all");
  const [highlight, setHighlight] = useState<StateCode | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Read ?state= after hydration (not via useSearchParams) so the full table
  // stays in the static HTML that crawlers and answer engines read.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("state")?.toUpperCase();
    if (param && isStateCode(param)) {
      setHighlight(param);
      // After the router's own initial scroll handling has run.
      const timer = window.setTimeout(() => {
        document.getElementById(`state-${param}`)?.scrollIntoView({ block: "center" });
      }, 150);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (q && !row.name.toLowerCase().includes(q) && row.code.toLowerCase() !== q) return false;
      if (report === "yes" && row.annualReport === "no") return false;
      if (report === "no" && row.annualReport !== "no") return false;
      return true;
    });
    const sorted = [...filtered];
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "cost-asc") sorted.sort((a, b) => a.minYearlyUsd - b.minYearlyUsd || a.name.localeCompare(b.name));
    if (sort === "cost-desc") sorted.sort((a, b) => b.minYearlyUsd - a.minYearlyUsd || a.name.localeCompare(b.name));
    return sorted;
  }, [query, report, rows, sort]);

  function shareUrl(code: StateCode | null): string {
    const base = `${window.location.origin}${PAGE_PATH}`;
    return code ? `${base}?state=${code}` : base;
  }

  async function copyLink(code: StateCode | null) {
    const url = shareUrl(code);
    if (code) {
      setHighlight(code);
      window.history.replaceState(null, "", `${PAGE_PATH}?state=${code}`);
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(code ?? "page");
    } catch {
      // Clipboard can be blocked (permissions, insecure context). The row link
      // is already in the address bar via replaceState, so nothing is lost.
      setCopied(null);
    }
    window.setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div id="fees-table">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Find a state</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Wyoming or WY"
            className="mt-1 block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Annual report</span>
          <select
            value={report}
            onChange={(e) => setReport(e.target.value as ReportFilter)}
            className="mt-1 block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 sm:w-44"
          >
            <option value="all">All states</option>
            <option value="yes">Report required</option>
            <option value="no">No report</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="mt-1 block h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 sm:w-48"
          >
            <option value="name">State A–Z</option>
            <option value="cost-asc">Lowest yearly cost</option>
            <option value="cost-desc">Highest yearly cost</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => copyLink(highlight)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
        >
          {copied === (highlight ?? "page") ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied === (highlight ?? "page") ? "Copied" : "Copy link"}
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Recurring state fees, due dates and annual report requirements for a domestic LLC, by state
          </caption>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-slate-50 px-4 py-3 font-semibold">State</th>
              <th scope="col" className="px-4 py-3 font-semibold">Recurring fee or tax</th>
              <th scope="col" className="px-4 py-3 font-semibold">Amount</th>
              <th scope="col" className="px-4 py-3 font-semibold">Due</th>
              <th scope="col" className="px-4 py-3 font-semibold">Annual report</th>
              <th scope="col" className="px-4 py-3 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const isHighlighted = highlight === row.code;
              return (
                <tr
                  key={row.code}
                  id={`state-${row.code}`}
                  className={`scroll-mt-24 border-t border-slate-100 align-top transition-colors ${
                    isHighlighted ? "bg-accent-50" : ""
                  }`}
                  aria-current={isHighlighted ? "true" : undefined}
                >
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 px-4 py-4 font-semibold text-ink ${
                      isHighlighted ? "bg-accent-50" : "bg-white"
                    }`}
                  >
                    <span className="block">{row.name}</span>
                    <button
                      type="button"
                      onClick={() => copyLink(row.code)}
                      className="mt-1 inline-flex min-h-8 items-center gap-1 text-xs font-medium text-accent hover:underline"
                      aria-label={`Copy link to ${row.name}`}
                    >
                      {copied === row.code ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
                      {copied === row.code ? "Copied" : "Link"}
                    </button>
                  </th>
                  <td className="px-4 py-4 text-slate-700">{row.feeName}</td>
                  <td className="px-4 py-4 font-mono text-[13px] text-ink">{row.headlineAmount}</td>
                  <td className="px-4 py-4 text-slate-700">{row.headlineDue}</td>
                  <td className="px-4 py-4 text-slate-700">
                    {REPORT_LABEL[row.annualReport]}
                    {row.reportName ? <span className="block text-xs text-slate-500">{row.reportName}</span> : null}
                  </td>
                  <td className="px-4 py-4">
                    {[row.primarySource, ...(row.moreRowSources ?? [])].map((src) => (
                      <a
                        key={src.url}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={src.label}
                        className="flex items-center gap-1 text-accent hover:underline"
                      >
                        {new URL(src.url).hostname.replace(/^www\./, "")}
                        <ExternalLink className="h-3 w-3 flex-none" />
                      </a>
                    ))}
                    <a href={`#notes-${row.code}`} className="mt-1 block text-xs text-slate-500 hover:text-accent">
                      All {row.name} details
                    </a>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No state matches that filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
