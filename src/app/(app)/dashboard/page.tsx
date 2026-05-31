import Link from "next/link";
import { FileText, Plus, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { getTiersForSource } from "@/lib/pricing";
import { DashboardRow } from "./DashboardRow";
import type { EinStatus, ItinStatus } from "@prisma/client";

const STATUS: Record<string, { label: string; tone: "slate" | "amber" | "blue" | "emerald" | "red" }> = {
  DRAFT: { label: "Draft", tone: "slate" },
  PAID: { label: "Paid — ready to generate", tone: "amber" },
  PDF_GENERATED: { label: "Ready to sign", tone: "amber" },
  SIGNATURE_PENDING: { label: "Awaiting signature", tone: "amber" },
  SIGNED_UPLOADED: { label: "Ready to fax", tone: "blue" },
  FAXED: { label: "Faxed", tone: "blue" },
  CONFIRMED: { label: "Confirmed", tone: "emerald" },
  FAILED: { label: "Failed", tone: "red" },
};

const EIN_STATUS_CONFIG: Record<EinStatus, { label: string; classes: string }> = {
  RECEIVED:        { label: "Received",              classes: "bg-slate-100 text-slate-700" },
  IN_REVIEW:       { label: "In review",              classes: "bg-amber-100 text-amber-700" },
  DOCS_REQUESTED:  { label: "Documents requested",    classes: "bg-amber-100 text-amber-700" },
  PAYMENT_PENDING: { label: "Payment pending",        classes: "bg-amber-100 text-amber-700" },
  PROCESSING:      { label: "Processing with IRS",    classes: "bg-blue-100 text-blue-700" },
  COMPLETED:       { label: "Completed — EIN issued", classes: "bg-emerald-100 text-emerald-700" },
  CANCELLED:       { label: "Cancelled",              classes: "bg-red-100 text-red-700" },
};

const ITIN_STATUS_CONFIG: Record<ItinStatus, { label: string; classes: string }> = {
  RECEIVED:        { label: "Received",                classes: "bg-slate-100 text-slate-700" },
  IN_REVIEW:       { label: "In review",               classes: "bg-amber-100 text-amber-700" },
  DOCS_REQUESTED:  { label: "Documents requested",     classes: "bg-amber-100 text-amber-700" },
  PAYMENT_PENDING: { label: "Payment pending",         classes: "bg-amber-100 text-amber-700" },
  CAA_SCHEDULED:   { label: "CAA appointment set",     classes: "bg-blue-100 text-blue-700" },
  W7_SUBMITTED:    { label: "W-7 submitted to IRS",    classes: "bg-blue-100 text-blue-700" },
  COMPLETED:       { label: "Completed — ITIN issued", classes: "bg-emerald-100 text-emerald-700" },
  CANCELLED:       { label: "Cancelled",               classes: "bg-red-100 text-red-700" },
};

function EinStatusBadge({ status }: { status: EinStatus }) {
  const cfg = EIN_STATUS_CONFIG[status] ?? EIN_STATUS_CONFIG.RECEIVED;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

function ItinStatusBadge({ status }: { status: ItinStatus }) {
  const cfg = ITIN_STATUS_CONFIG[status] ?? ITIN_STATUS_CONFIG.RECEIVED;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const filings = await prisma.filing.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  const [einApps, itinApps] = await Promise.all([
    prisma.einApplication.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.itinApplication.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Unread admin → customer message counts per filing, so the dashboard
  // surfaces "you have a message" without an extra round-trip per row.
  const unreadCounts = filings.length
    ? await prisma.message.groupBy({
        by: ["filingId"],
        where: {
          filingId: { in: filings.map((f) => f.id) },
          fromAdmin: true,
          readAt: null,
        },
        _count: { _all: true },
      })
    : [];
  const unreadByFiling = new Map(unreadCounts.map((u) => [u.filingId, u._count._all]));

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Your filings</h1>
          <p className="text-sm text-slate-500 mt-1">{user.email}</p>
        </div>
        <Link href="/filings/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New filing
          </Button>
        </Link>
      </div>

      {filings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No filings yet</p>
          <p className="mt-1 text-sm text-slate-500">Start your first Form 5472 filing.</p>
          <Link href="/filings/new" className="inline-block mt-4">
            <Button>Start filing</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {filings.map((f) => {
            const s = STATUS[f.status] ?? { label: f.status, tone: "slate" as const };
            return (
              <DashboardRow
                key={f.id}
                id={f.id}
                href={`/filings/${f.id}`}
                llcName={f.llcName}
                taxYears={f.taxYears}
                tierLabel={getTiersForSource(f.funnelSource)[f.tier as "single_year" | "two_year_diirsp" | "multi_year_diirsp"]?.label ?? f.tier}
                updatedAt={f.updatedAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                amountPaid={f.amountPaid}
                statusLabel={s.label}
                statusTone={s.tone}
                canDelete={f.status === "DRAFT"}
                unreadMessages={unreadByFiling.get(f.id) ?? 0}
              />
            );
          })}
        </div>
      )}

      {einApps.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">EIN Applications</h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            {einApps.map((app) => (
              <Link
                key={app.id}
                href={`/applications/ein/${app.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{app.llcName}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    EIN Application &middot;{" "}
                    {app.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <EinStatusBadge status={app.status} />
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {itinApps.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">ITIN Applications</h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            {itinApps.map((app) => (
              <Link
                key={app.id}
                href={`/applications/itin/${app.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{app.fullName}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    ITIN Application &middot;{" "}
                    {app.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <ItinStatusBadge status={app.status} />
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
