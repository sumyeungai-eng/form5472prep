import { useTranslations } from "next-intl";
import { getTranslations, getLocale } from "next-intl/server";
import Link from "next/link";
import { FileText, Plus, ArrowRight } from "lucide-react";
import { claimAccountFilings, requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { getTiersForSource } from "@/lib/pricing";
import { taxYearForSend } from "@/lib/reminders";
import { DashboardRow } from "./DashboardRow";
import type { EinStatus, ItinStatus } from "@prisma/client";

const STATUS: Record<string, { label: string; tone: "slate" | "amber" | "blue" | "emerald" | "red" }> = {
  DRAFT: { label: "domain.status.draft", tone: "slate" },
  PAID: { label: "domain.status.paid", tone: "amber" },
  PDF_GENERATED: { label: "domain.status.readyToSign", tone: "amber" },
  SIGNATURE_PENDING: { label: "domain.status.awaitingSignature", tone: "amber" },
  SIGNED_UPLOADED: { label: "domain.status.readyToFax", tone: "blue" },
  FAXED: { label: "domain.status.faxed", tone: "blue" },
  CONFIRMED: { label: "domain.status.confirmed", tone: "emerald" },
  FAILED: { label: "domain.status.failed", tone: "red" },
};

const EIN_STATUS_CONFIG: Record<EinStatus, { label: string; classes: string }> = {
  RECEIVED:        { label: "domain.status.received",              classes: "bg-slate-100 text-slate-700" },
  IN_REVIEW:       { label: "domain.status.inReview",              classes: "bg-amber-100 text-amber-700" },
  DOCS_REQUESTED:  { label: "domain.status.documentsRequested",    classes: "bg-amber-100 text-amber-700" },
  PAYMENT_PENDING: { label: "domain.status.paymentPending",        classes: "bg-amber-100 text-amber-700" },
  PROCESSING:      { label: "domain.status.processing",    classes: "bg-blue-100 text-blue-700" },
  COMPLETED:       { label: "domain.status.einCompleted", classes: "bg-emerald-100 text-emerald-700" },
  CANCELLED:       { label: "domain.status.cancelled",              classes: "bg-red-100 text-red-700" },
};

const ITIN_STATUS_CONFIG: Record<ItinStatus, { label: string; classes: string }> = {
  RECEIVED:        { label: "domain.status.received",                classes: "bg-slate-100 text-slate-700" },
  IN_REVIEW:       { label: "domain.status.inReview",               classes: "bg-amber-100 text-amber-700" },
  DOCS_REQUESTED:  { label: "domain.status.documentsRequested",     classes: "bg-amber-100 text-amber-700" },
  PAYMENT_PENDING: { label: "domain.status.paymentPending",         classes: "bg-amber-100 text-amber-700" },
  CAA_SCHEDULED:   { label: "domain.status.caaScheduled",     classes: "bg-blue-100 text-blue-700" },
  W7_SUBMITTED:    { label: "domain.status.w7Submitted",    classes: "bg-blue-100 text-blue-700" },
  COMPLETED:       { label: "domain.status.itinCompleted", classes: "bg-emerald-100 text-emerald-700" },
  CANCELLED:       { label: "domain.status.cancelled",               classes: "bg-red-100 text-red-700" },
};

const RENEWAL_ELIGIBLE_STATUSES = [
  "PAID",
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
];

function EinStatusBadge({ status }: { status: EinStatus }) {
  const t = useTranslations();
  const cfg = EIN_STATUS_CONFIG[status] ?? EIN_STATUS_CONFIG.RECEIVED;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}>
      {t(cfg.label)}
    </span>
  );
}

function ItinStatusBadge({ status }: { status: ItinStatus }) {
  const t = useTranslations();
  const cfg = ITIN_STATUS_CONFIG[status] ?? ITIN_STATUS_CONFIG.RECEIVED;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}>
      {t(cfg.label)}
    </span>
  );
}

export default async function DashboardPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const user = await requireUser();
  const filings = await prisma.filing.findMany({
    where: { ...await claimAccountFilings(user.id), supersededAt: null },
    orderBy: { updatedAt: "desc" },
  });
  const taxYear = taxYearForSend();
  const showRenewalBanner =
    filings.some((f) => RENEWAL_ELIGIBLE_STATUSES.includes(f.status)) &&
    !filings.some((f) => f.taxYears.includes(taxYear));

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
          <h1 className="text-2xl font-semibold">{t("portal.dashboard.yourFilings")}</h1>
          <p className="text-sm text-slate-500 mt-1">{user.email}</p>
        </div>
        <Link href="/filings/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            {t("portal.dashboard.newFiling")}
          </Button>
        </Link>
      </div>

      {showRenewalBanner && (
        <div className="mb-6 bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t("portal.dashboard.timeToFileFor", { year: taxYear })}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("portal.dashboard.yourLLCAndOwnerDetailsCarryOverFromLast")}
              </p>
            </div>
            <Link href="/start">
              <Button>{t("portal.dashboard.startYearFiling", { year: taxYear })}</Button>
            </Link>
          </div>
        </div>
      )}

      {filings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">{t("portal.dashboard.noFilingsYet")}</p>
          <p className="mt-1 text-sm text-slate-500">{t("portal.dashboard.startYourFirstForm5472Filing")}</p>
          <Link href="/filings/new" className="inline-block mt-4">
            <Button>{t("portal.dashboard.startFiling")}</Button>
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
                tierLabel={t.has(`domain.tier.${f.tier}`) ? t(`domain.tier.${f.tier}`) : getTiersForSource(f.funnelSource)[f.tier as "single_year" | "two_year_diirsp" | "multi_year_diirsp"]?.label ?? f.tier}
                updatedAt={f.updatedAt.toLocaleDateString(locale, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
                amountPaid={f.amountPaid}
                includedInOrder={Boolean(f.linkedToFilingId)}
                statusLabel={t.has(s.label) ? t(s.label) : s.label}
                statusTone={s.tone}
                canDelete={f.status === "DRAFT"}
                unreadMessages={unreadByFiling.get(f.id) ?? 0}
                hasFiledDocuments={f.status === "FAXED" || f.status === "CONFIRMED"}
              />
            );
          })}
        </div>
      )}

      {einApps.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-4">{t("portal.dashboard.eINApplications")}</h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            {einApps.map((app) => (
              <Link
                key={app.id}
                href={`/applications/ein/${app.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{app.llcName}</p>
                  <p className="text-sm text-slate-500 mt-0.5"> {t("portal.dashboard.eINApplication")}{" "}
                    {app.createdAt.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}
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
          <h2 className="text-lg font-semibold mb-4">{t("portal.dashboard.iTINApplications")}</h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
            {itinApps.map((app) => (
              <Link
                key={app.id}
                href={`/applications/itin/${app.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{app.fullName}</p>
                  <p className="text-sm text-slate-500 mt-0.5"> {t("portal.dashboard.iTINApplication")}{" "}
                    {app.createdAt.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}
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
