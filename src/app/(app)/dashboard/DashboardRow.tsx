"use client";
import { useTranslations, useLocale } from "next-intl";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, MessageSquare, Download } from "lucide-react";

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
  includedInOrder = false,
  statusLabel,
  statusTone,
  canDelete,
  unreadMessages = 0,
  hasFiledDocuments = false,
}: {
  id: string;
  href: string;
  llcName: string | null;
  taxYears: number[];
  tierLabel: string;
  updatedAt: string;
  amountPaid: number;
  // An extra return added to an existing order: no separate price.
  includedInOrder?: boolean;
  statusLabel: string;
  statusTone: "slate" | "amber" | "blue" | "emerald" | "red";
  canDelete: boolean;
  unreadMessages?: number;
  hasFiledDocuments?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const label = llcName ?? t("portal.dashboard.thisDraftFiling");
    if (!confirm(t("portal.dashboard.deleteConfirm", { label }))) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/filings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(t("portal.dashboard.deleteError", { error: body?.error ?? res.statusText }));
        setDeleting(false);
        return;
      }
      router.refresh();
    } catch (err) {
      alert(t("portal.dashboard.deleteError", { error: err instanceof Error ? err.message : t("portal.dashboard.unknownError") }));
      setDeleting(false);
    }
  }

  return (
    <div className="relative">
      <Link
        href={href}
        className="flex flex-col gap-3 p-5 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Phones: details on top, status/price row underneath, so a long LLC
            name or many tax years never get squeezed into a narrow column. */}
        <div className="min-w-0">
          <p className="font-medium text-slate-900 break-words sm:truncate">
            {llcName ?? <em className="text-slate-400">{t("portal.dashboard.unnamedFiling")}</em>}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            {taxYears.length > 0 ? t("domain.taxYears", { years: taxYears.join(", ") }) : t("portal.dashboard.noYears")}
            {" · "}
            {tierLabel}
          </p>
          <p className="text-xs text-slate-400 mt-1">{t("portal.dashboard.lastUpdated", { date: updatedAt })}</p>
        </div>
        <div className="flex flex-none items-center gap-3 sm:ml-4 sm:text-right">
          {unreadMessages > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-blue-900 text-white text-xs font-medium px-2.5 py-1"
              title={t("portal.dashboard.newMessages", { count: unreadMessages })}
            >
              <MessageSquare className="h-3 w-3" />
              {unreadMessages}
            </span>
          )}
          <div className="flex items-center gap-2 sm:block">
            <span
              className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${TONE[statusTone]}`}
            >
              {statusLabel}
            </span>
            <p className="text-xs text-slate-500 sm:mt-2">
              {includedInOrder ? t("portal.dashboard.included") : new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amountPaid / 100)}
            </p>
          </div>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              aria-label={t("portal.dashboard.deleteDraftFiling")}
              title={t("portal.dashboard.deleteDraftFiling")}
              className="ml-auto p-2 -mr-2 rounded-md text-slate-400 sm:ml-0 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </Link>
      {hasFiledDocuments && (
        <div className="px-5 pb-4 -mt-1 sm:-mt-2">
          <Link
            href={`/filings/${id}#documents`}
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            <Download className="h-3.5 w-3.5" />
            {t("portal.dashboard.filedDocuments")}
          </Link>
        </div>
      )}
    </div>
  );
}
