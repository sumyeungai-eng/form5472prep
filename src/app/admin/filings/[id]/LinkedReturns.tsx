"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export type LinkedReturnRow = {
  id: string;
  taxYears: number[];
  status: string;
  isOriginal: boolean;
  isCurrent: boolean;
};

// "Returns on this order": lists the original order and any extra returns
// linked to it (each with its own signing + fax), and adds a new one.
export function LinkedReturns({
  filingId,
  rows,
  canAdd,
}: {
  filingId: string;
  rows: LinkedReturnRow[];
  canAdd: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [years, setYears] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function add() {
    const taxYears = years
      .split(/[\s,]+/)
      .map((y) => y.trim())
      .filter(Boolean)
      .map(Number);
    if (taxYears.length === 0) {
      setError("Enter the tax year this return covers, e.g. 2025.");
      return;
    }
    if (!window.confirm(`Add another return for ${taxYears.join(", ")} to this order? It is paid under this order and gets its own review, signing and fax.`)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/filings/${filingId}/linked-return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxYears }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error ?? "Could not add the return.");
        return;
      }
      startTransition(() => router.push(`/admin/filings/${data.id}`));
    } catch {
      setError("Could not add the return. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
      <h2 className="text-sm font-semibold text-slate-900">Returns on this order</h2>
      <p className="mt-1 text-xs text-slate-500">
        Each return has its own reviewed PDF, client signature and fax. Extra returns are paid under the original
        order and aren&apos;t counted as new sales.
      </p>
      {rows.length > 1 ? (
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span className="text-slate-800">
                {r.isOriginal ? "Original return" : "Additional return"} · {r.taxYears.join(", ") || "—"}
                {r.isCurrent ? <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">this page</span> : null}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{r.status}</span>
                {!r.isCurrent && (
                  <Link href={`/admin/filings/${r.id}`} className="text-xs text-accent hover:underline">
                    Open
                  </Link>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-600">This order has one return.</p>
      )}
      {canAdd &&
        (open ? (
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <label className="text-xs text-slate-600">
              <span className="block mb-1">Tax year(s) of the other return</span>
              <input
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="e.g. 2025"
                className="w-40 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void add()}
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Adding…" : "Add return"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-500 hover:underline">
              Cancel
            </button>
            {error ? <p className="w-full text-xs text-red-700">{error}</p> : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" /> Add another return to this order
          </button>
        ))}
      {canAdd && (
        <p className="mt-2 text-xs text-slate-500">
          The new return copies the client and LLC details only. Add its forms with &ldquo;Upload reviewed PDF&rdquo;
          on the new return&apos;s page; the client then checks and signs it, and it is faxed separately.
        </p>
      )}
    </div>
  );
}
