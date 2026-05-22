"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, MessageSquare } from "lucide-react";
import { formatUsd } from "@/lib/utils";

const TONE: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  emerald: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
};

export function DashboardRow({
  id,
  href,
  llcName,
  taxYears,
  tierLabel,
  updatedAt,
  amountPaid,
  statusLabel,
  statusTone,
  canDelete,
  unreadMessages = 0,
}: {
  id: string;
  href: string;
  llcName: string | null;
  taxYears: number[];
  tierLabel: string;
  updatedAt: string;
  amountPaid: number;
  statusLabel: string;
  statusTone: "slate" | "amber" | "blue" | "emerald" | "red";
  canDelete: boolean;
  unreadMessages?: number;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const label = llcName ?? "this draft filing";
    if (!confirm(`Delete "${label}"? This can't be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/filings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(`Could not delete: ${body?.error ?? res.statusText}`);
        setDeleting(false);
        return;
      }
      router.refresh();
    } catch (err) {
      alert(`Could not delete: ${err instanceof Error ? err.message : "unknown error"}`);
      setDeleting(false);
    }
  }

  return (
    <div className="relative">
      <Link href={href} className="flex items-center justify-between p-5 hover:bg-slate-50">
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate">
            {llcName ?? <em className="text-slate-400">Unnamed filing</em>}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            {taxYears.length > 0 ? `Tax years ${taxYears.join(", ")}` : "No years selected"}
            {" · "}
            {tierLabel}
          </p>
          <p className="text-xs text-slate-400 mt-1">Last updated {updatedAt}</p>
        </div>
        <div className="flex-none text-right ml-4 flex items-center gap-3">
          {unreadMessages > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-blue-900 text-white text-xs font-medium px-2.5 py-1"
              title={`${unreadMessages} new message${unreadMessages === 1 ? "" : "s"}`}
            >
              <MessageSquare className="h-3 w-3" />
              {unreadMessages}
            </span>
          )}
          <div>
            <span
              className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${TONE[statusTone]}`}
            >
              {statusLabel}
            </span>
            <p className="text-xs text-slate-500 mt-2">{formatUsd(amountPaid)}</p>
          </div>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete draft filing"
              title="Delete draft filing"
              className="p-2 -mr-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </Link>
    </div>
  );
}
