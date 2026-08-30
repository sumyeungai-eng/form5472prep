"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  filingId: string;
  inReview: boolean;
};

/** Internal row-level coordination flag, independent of filing status. */
export function ReviewToggle({ filingId, inReview }: Props) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const [checked, setChecked] = useState(inReview);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const disabled = busy || refreshing;

  // Re-sync when the server sends a different value — another admin may have
  // ticked or cleared this row since the page rendered. Skipped mid-request so
  // an in-flight optimistic toggle is not clobbered by a stale prop.
  useEffect(() => {
    if (!busy) setChecked(inReview);
  }, [inReview, busy]);

  async function onChange(nextChecked: boolean) {
    const previous = checked;
    setChecked(nextChecked);
    setErr(null);
    setBusy(true);

    try {
      const res = await fetch(`/api/admin/filings/${filingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextChecked ? "startReview" : "endReview" }),
      });
      if (!res.ok) {
        setChecked(previous);
        setErr((await readError(res)) ?? `HTTP ${res.status}`);
        return;
      }
      startTransition(() => router.refresh());
    } catch (error) {
      setChecked(previous);
      setErr(error instanceof Error ? error.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <label className="flex items-center gap-2 text-xs text-slate-600 whitespace-nowrap">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => void onChange(event.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 disabled:opacity-50"
        />
        In review
      </label>
      {err && <span className="text-xs text-red-600 max-w-[180px]">{err}</span>}
    </div>
  );
}

/** Pull the `error` field out of the API's JSON body, falling back to raw text. */
async function readError(res: Response): Promise<string | null> {
  const text = await res.text().catch(() => "");
  if (!text) return null;
  try {
    const parsed = JSON.parse(text) as { error?: unknown };
    if (typeof parsed.error === "string") return parsed.error;
  } catch {
    // Not JSON — fall through to the raw body.
  }
  return text;
}
