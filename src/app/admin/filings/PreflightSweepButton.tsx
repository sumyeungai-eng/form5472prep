"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type SweepResult = "passed" | "needs_review" | "failed" | "error";

type SweepResponse = {
  checkedAt: string;
  totalChecked: number;
  cappedAt200: boolean;
  results: Array<{
    filingId: string;
    storedPreflightStatus: string | null;
    sweepResult: SweepResult;
    failedAssertionIds: string[];
    warningIds: string[];
    errorMessage?: string;
  }>;
};

const RESULT_TONES: Record<SweepResult, { bg: string; text: string; label: string }> = {
  passed: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Passed" },
  needs_review: { bg: "bg-amber-100", text: "text-amber-800", label: "Needs review" },
  failed: { bg: "bg-red-100", text: "text-red-800", label: "Failed" },
  error: { bg: "bg-slate-100", text: "text-slate-700", label: "Error" },
};

export function PreflightSweepButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SweepResponse | null>(null);

  async function runSweep() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/preflight-sweep", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        setError((await readError(res)) ?? `HTTP ${res.status}`);
        return;
      }
      setData((await res.json()) as SweepResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Open-order pre-flight sweep</h2>
          {data ? (
            <p className="mt-1 text-xs text-slate-500">
              Checked {data.totalChecked} filing{data.totalChecked === 1 ? "" : "s"} at{" "}
              {new Date(data.checkedAt).toLocaleString()}
              {data.cappedAt200 ? ". Results are capped at 200 oldest updated filings." : "."}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              Rebuilds generated packages in memory and reports pre-flight status drift.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => void runSweep()}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Run pre-flight sweep
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      {data && data.results.length > 0 && (
        <div className="mt-4 overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full min-w-[760px] text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left font-semibold px-3 py-2">Filing</th>
                <th className="text-left font-semibold px-3 py-2">Stored</th>
                <th className="text-left font-semibold px-3 py-2">Sweep</th>
                <th className="text-left font-semibold px-3 py-2">Failures</th>
                <th className="text-left font-semibold px-3 py-2">Warnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.results.map((row) => (
                <tr key={row.filingId}>
                  <td className="px-3 py-2 font-mono">
                    <Link href={`/admin/filings/${row.filingId}`} className="text-accent hover:underline">
                      {row.filingId}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{row.storedPreflightStatus ?? "not recorded"}</td>
                  <td className="px-3 py-2">
                    <ResultBadge result={row.sweepResult} />
                    {row.errorMessage && (
                      <div className="mt-1 max-w-[240px] text-red-700 whitespace-normal">
                        {row.errorMessage}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{formatIds(row.failedAssertionIds)}</td>
                  <td className="px-3 py-2 text-slate-600">{formatIds(row.warningIds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ResultBadge({ result }: { result: SweepResult }) {
  const tone = RESULT_TONES[result];
  return (
    <span className={`inline-block text-[11px] font-medium rounded-full px-2 py-0.5 ${tone.bg} ${tone.text}`}>
      {tone.label}
    </span>
  );
}

function formatIds(ids: string[]): string {
  return ids.length > 0 ? ids.join(", ") : "None";
}

async function readError(res: Response): Promise<string | null> {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    const parsed = JSON.parse(text) as { error?: unknown };
    if (typeof parsed.error === "string") return parsed.error;
  } catch {
    // Not JSON, so return the raw body.
  }
  return text;
}
