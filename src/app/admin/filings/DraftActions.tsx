"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  filingId: string;
  hidden: boolean;
  /** Whether the draft captured a customer email — nothing to remind without one. */
  hasEmail: boolean;
  /** ISO timestamp of the last "finish your filing" nudge (cron or manual), if any. */
  remindedAt: string | null;
};

/**
 * Row-level actions for abandoned wizard drafts: chase the customer with the
 * standard "pick up where you left off" email, or archive/destroy the row. Only
 * ever rendered for DRAFT rows — the API re-checks that guard server-side.
 */
export function DraftActions({ filingId, hidden, hasEmail, remindedAt }: Props) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Sticky for the life of the row so the confirmation survives the refresh
  // that follows a send (and reads better than a re-computed "0m ago").
  const [justSent, setJustSent] = useState(false);
  const disabled = busy || refreshing;

  async function run(
    action: "hideDraft" | "unhideDraft" | "deleteDraft" | "sendDraftReminder",
  ): Promise<boolean> {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/filings/${filingId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        // Surface the server's reason (e.g. the DRAFT-only guard, or an
        // unsubscribed customer) rather than leaving the row looking as if the
        // click did nothing.
        setErr((await readError(res)) ?? `HTTP ${res.status}`);
        return false;
      }
      startTransition(() => router.refresh());
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Network error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function onDelete() {
    if (!window.confirm("Permanently delete this draft? This cannot be undone.")) return;
    void run("deleteDraft");
  }

  // No confirm dialog: one recoverable email, and the admin clicked the row's
  // most obvious action on purpose. `disabled` is the only guard needed — it
  // debounces the double-click into a single send.
  async function onRemind() {
    if (await run("sendDraftReminder")) setJustSent(true);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-3">
        {/* The productive action first — Hide/Delete are cleanup. */}
        {justSent ? (
          <span className="text-xs text-slate-400">Reminded just now</span>
        ) : remindedAt ? (
          // Already nudged: state the fact instead of offering a fresh-looking
          // button, but keep re-sending one small click away (admin judgment).
          <span className="text-xs text-slate-400" suppressHydrationWarning>
            Reminded {formatAgo(remindedAt)}{" "}
            <button
              type="button"
              onClick={() => void onRemind()}
              disabled={disabled || !hasEmail}
              title={hasEmail ? undefined : "No email on this draft"}
              className="underline hover:text-slate-900 disabled:opacity-50 disabled:no-underline"
            >
              again
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => void onRemind()}
            disabled={disabled || !hasEmail}
            title={hasEmail ? undefined : "No email on this draft"}
            className="text-xs text-slate-500 hover:text-slate-900 disabled:opacity-50"
          >
            Send reminder
          </button>
        )}
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

/**
 * Coarse "how long ago" for the last-reminded stamp. Deliberately low
 * precision — the row only needs to answer "did we already chase this one?".
 */
function formatAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "earlier";
  const diffMin = Math.round((Date.now() - then) / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
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
