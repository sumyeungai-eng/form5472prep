"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Props = {
  campaign: "january" | "march";
  taxYear: number;
};

export function CampaignControls({ campaign, taxYear }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"dry" | "send" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function call(dryRun: boolean) {
    setBusy(dryRun ? "dry" : "send");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/reminders/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign, taxYear, dryRun }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg({ kind: "err", text: json.error ?? `HTTP ${res.status}` });
        return;
      }
      const label = dryRun ? "Dry run" : "Sent";
      const detail =
        json.failed > 0
          ? `${label}: ${json.sent} ok, ${json.failed} failed`
          : `${label}: ${json.sent} ${json.sent === 1 ? "email" : "emails"}`;
      setMsg({ kind: "ok", text: detail });
      if (!dryRun) startTransition(() => router.refresh());
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Network error" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => call(true)}
          disabled={!!busy || pending}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white hover:bg-slate-50 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {busy === "dry" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Dry run
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Send ${campaign} reminder for tax year ${taxYear}? This will email all eligible customers immediately.`)) {
              call(false);
            }
          }}
          disabled={!!busy || pending}
          className="px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {busy === "send" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Send now
        </button>
      </div>
      {msg && (
        <div
          className={`text-xs px-3 py-2 rounded-md ${
            msg.kind === "ok"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}
    </div>
  );
}
