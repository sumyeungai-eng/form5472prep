import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { CheckCircle2, Clock, AlertCircle, FileCheck2 } from "lucide-react";

type Props = {
  filingId: string;
  status: string;
  updatedAt: Date;
  // Staff released the package to the client (release gate).
  released: boolean;
};

// Top-of-page banner that gives the customer a clear "where are we right now"
// summary, so they don't have to interpret which 3-step card is highlighted.
export function FilingStatusBanner({ filingId, status, updatedAt, released }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const view = !released && (status === "PAID" || status === "PDF_GENERATED") ? IN_REVIEW_VIEW : viewFor(status);

  return (
    <div className={`rounded-lg border p-4 ${view.bg} ${view.border}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${view.icon}`}>{view.iconNode}</div>
        <div className="flex-1 min-w-0">
          <div className={`font-medium ${view.title}`}>{t.has(view.headline) ? t(view.headline) : view.headline}</div>
          <div className={`text-sm mt-0.5 ${view.body}`}>
            {view.detail ? t(view.detail) : ""}
            <span className="text-slate-400"> {t("portal.banners.updated", { date: formatRelative(updatedAt, t, locale) })}</span>
          </div>
          {view.action && (
            <div className="mt-3">
              <Link
                href={view.action.href.replace(":id", filingId)}
                className={`inline-flex items-center text-sm font-medium ${view.actionStyle ?? "text-accent"} hover:underline`}
              >
                {t(view.action.label)} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type View = {
  bg: string;
  border: string;
  title: string;
  body: string;
  icon: string;
  iconNode: React.ReactNode;
  headline: string;
  detail: string;
  action?: { label: string; href: string };
  actionStyle?: string;
};

// Before release the client sees no PDF and no sign step, only this.
const IN_REVIEW_VIEW: View = {
  bg: "bg-blue-50",
  border: "border-blue-200",
  title: "text-blue-900",
  body: "text-blue-800",
  icon: "text-blue-500",
  iconNode: <Clock className="h-5 w-5" />,
  headline: "portal.banners.inReviewTitle",
  detail: "portal.banners.inReviewDetail",
};

function viewFor(status: string): View {
  switch (status) {
    case "DRAFT":
      return {
        bg: "bg-slate-50",
        border: "border-slate-200",
        title: "text-slate-900",
        body: "text-slate-600",
        icon: "text-slate-400",
        iconNode: <Clock className="h-5 w-5" />,
        headline: "portal.banners.draftTitle",
        detail: "portal.banners.draftDetail",
      };
    case "PAID":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        title: "text-blue-900",
        body: "text-blue-800",
        icon: "text-blue-500",
        iconNode: <Clock className="h-5 w-5" />,
        headline: "portal.banners.paidTitle",
        detail: "portal.banners.paidDetail",
      };
    case "PDF_GENERATED":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        title: "text-amber-900",
        body: "text-amber-800",
        icon: "text-amber-600",
        iconNode: <FileCheck2 className="h-5 w-5" />,
        headline: "portal.banners.readyTitle",
        detail: "portal.banners.readyDetail",
      };
    case "SIGNATURE_PENDING":
      // Customer has signed; the package is queued for accountant review and
      // fax. NO action is needed on their part — previously this status fell
      // through to the same "Awaiting your signature" copy, which made paying
      // customers think their signature hadn't been received and re-sign on
      // a loop.
      return {
        bg: "bg-violet-50",
        border: "border-violet-200",
        title: "text-violet-900",
        body: "text-violet-800",
        icon: "text-violet-600",
        iconNode: <FileCheck2 className="h-5 w-5" />,
        headline: "portal.banners.signatureTitle",
        detail: "portal.banners.signatureDetail",
      };
    case "SIGNED_UPLOADED":
      return {
        bg: "bg-violet-50",
        border: "border-violet-200",
        title: "text-violet-900",
        body: "text-violet-800",
        icon: "text-violet-600",
        iconNode: <Clock className="h-5 w-5" />,
        headline: "portal.banners.signedTitle",
        detail: "portal.banners.signedDetail",
      };
    case "FAXED":
      return {
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        title: "text-cyan-900",
        body: "text-cyan-800",
        icon: "text-cyan-600",
        iconNode: <Clock className="h-5 w-5" />,
        headline: "portal.banners.faxedTitle",
        detail: "portal.banners.faxedDetail",
        action: { label: "portal.banners.download", href: "/filings/:id#documents" },
      };
    case "CONFIRMED":
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        title: "text-emerald-900",
        body: "text-emerald-800",
        icon: "text-emerald-600",
        iconNode: <CheckCircle2 className="h-5 w-5" />,
        headline: "portal.banners.confirmedTitle",
        detail: "portal.banners.confirmedDetail",
        action: { label: "portal.banners.download", href: "/filings/:id#documents" },
        actionStyle: "text-emerald-700",
      };
    case "FAILED":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        title: "text-red-900",
        body: "text-red-800",
        icon: "text-red-600",
        iconNode: <AlertCircle className="h-5 w-5" />,
        headline: "portal.banners.failedTitle",
        detail: "portal.banners.failedDetail",
      };
    default:
      return {
        bg: "bg-slate-50",
        border: "border-slate-200",
        title: "text-slate-900",
        body: "text-slate-600",
        icon: "text-slate-400",
        iconNode: <Clock className="h-5 w-5" />,
        headline: status,
        detail: "",
      };
  }
}

function formatRelative(d: Date, t: ReturnType<typeof useTranslations>, locale: string): string {
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return t("common.justNow");
  if (diffMin < 60) return t("common.minutesAgo", { count: diffMin });
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return t("common.hoursAgo", { count: diffHr });
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return t("common.daysAgo", { count: diffDay });
  return d.toLocaleDateString(locale, { timeZone: "UTC" });
}
