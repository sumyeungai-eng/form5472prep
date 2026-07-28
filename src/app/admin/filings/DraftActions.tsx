"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  filingId: string;
  hidden: boolean;
};

/**
 * Row-level housekeeping for abandoned wizard drafts: archive one out of the
 * list (reversible) or destroy it for good. Only ever rendered for DRAFT rows —
 * the API re-checks that guard server-side.
 */
export function DraftActions({ filingId, hidden }: Props) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const disabled = busy || refreshing;

  async function run(action: "hideDraft" | "unhideDraft" | "deleteDraft") {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/filings/${filingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        // Surface the server's reason (e.g. the DRAFT-only guard) rather than
        // leaving the row looking as if the click did nothing.
        setErr((await readError(res)) ?? `HTTP ${res.status}`);
        return;
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  function onDelete() {
    if (!window.confirm("Permanently delete this draft? This cannot be undone.")) return;
    void run("deleteDraft");
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-3">
        {hidden ? (
          <button
            type="button"
            onClick={() => void run("unhideDraft")}
            disabled={disabled}
            className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-50"
          >
            Unhide
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void run("hideDraft")}
              disabled={disabled}
              className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-50"
            >
              Hide
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={disabled}
              className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Delete
            </button>
          </>
        )}
      </div>
      {err && <span className="text-xs text-red-600 max-w-[180px] text-right">{err}</span>}
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
