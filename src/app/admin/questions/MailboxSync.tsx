"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { History, RefreshCw } from "lucide-react";

type Result = {
  questionsImported: number;
  questionsMatched: number;
  answersImported: number;
  followUpsImported: number;
  oldUnansweredArchived: number;
};

export function MailboxSync({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [running, setRunning] = useState<"recent" | "full" | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  async function sync(full: boolean) {
    if (running) return;
    if (full && !window.confirm("Import every website question and email answer from the support@ mailbox since June 2026? This can take a minute.")) return;
    setRunning(full ? "full" : "recent");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/questions/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<Result> & { error?: string };
      if (!res.ok) {
        setMessage({ tone: "error", text: data.error ?? "Mailbox check failed." });
        return;
      }
      const parts = [
        data.questionsImported ? `${data.questionsImported} past question${data.questionsImported === 1 ? "" : "s"} imported` : "",
        data.answersImported ? `${data.answersImported} email answer${data.answersImported === 1 ? "" : "s"} linked` : "",
        data.followUpsImported ? `${data.followUpsImported} customer follow-up${data.followUpsImported === 1 ? "" : "s"} linked` : "",
        data.oldUnansweredArchived ? `${data.oldUnansweredArchived} old question${data.oldUnansweredArchived === 1 ? "" : "s"} with no answer found archived` : "",
      ].filter(Boolean);
      setMessage({ tone: "ok", text: parts.length ? `${parts.join(" · ")}.` : "Up to date. Nothing new in the mailbox." });
      startTransition(() => router.refresh());
    } catch {
      setMessage({ tone: "error", text: "Mailbox check failed. Check your connection and try again." });
    } finally {
      setRunning(null);
    }
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className={btn} disabled={!connected || running !== null} onClick={() => void sync(false)}>
          <RefreshCw className={`h-4 w-4 ${running === "recent" ? "animate-spin" : ""}`} />
          {running === "recent" ? "Checking…" : "Check mailbox now"}
        </button>
        <button type="button" className={btn} disabled={!connected || running !== null} onClick={() => void sync(true)}>
          <History className={`h-4 w-4 ${running === "full" ? "animate-spin" : ""}`} />
          {running === "full" ? "Importing…" : "Import past emails"}
        </button>
      </div>
      {message ? (
        <p className={`max-w-md text-right text-xs ${message.tone === "ok" ? "text-emerald-700" : "text-red-700"}`}>{message.text}</p>
      ) : null}
    </div>
  );
}
