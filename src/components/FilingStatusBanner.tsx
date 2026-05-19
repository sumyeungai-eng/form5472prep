import Link from "next/link";
import { CheckCircle2, Clock, AlertCircle, FileCheck2 } from "lucide-react";

type Props = {
  filingId: string;
  status: string;
  updatedAt: Date;
};

// Top-of-page banner that gives the customer a clear "where are we right now"
// summary, so they don't have to interpret which 3-step card is highlighted.
export function FilingStatusBanner({ filingId, status, updatedAt }: Props) {
  const view = viewFor(status);

  return (
    <div className={`rounded-lg border p-4 ${view.bg} ${view.border}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${view.icon}`}>{view.iconNode}</div>
        <div className="flex-1 min-w-0">
          <div className={`font-medium ${view.title}`}>{view.headline}</div>
          <div className={`text-sm mt-0.5 ${view.body}`}>
            {view.detail}
            <span className="text-slate-400"> · updated {formatRelative(updatedAt)}</span>
          </div>
          {view.action && (
            <div className="mt-3">
              <Link
                href={view.action.href.replace(":id", filingId)}
                className={`inline-flex items-center text-sm font-medium ${view.actionStyle ?? "text-accent"} hover:underline`}
              >
                {view.action.label} →
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
        headline: "Draft — payment pending",
        detail: "Complete checkout to start the filing process.",
      };
    case "PAID":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        title: "text-blue-900",
        body: "text-blue-800",
        icon: "text-blue-500",
        iconNode: <Clock className="h-5 w-5" />,
        headline: "Payment received — generating your PDF",
        detail: "We're preparing Form 5472 and pro forma 1120. Usually takes under 2 minutes.",
      };
    case "PDF_GENERATED":
    case "SIGNATURE_PENDING":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        title: "text-amber-900",
        body: "text-amber-800",
        icon: "text-amber-600",
        iconNode: <FileCheck2 className="h-5 w-5" />,
        headline: "Awaiting your signature",
        detail: "Download the unsigned PDF, sign on the marked pages, and upload the signed copy below.",
      };
    case "SIGNED_UPLOADED":
      return {
        bg: "bg-violet-50",
        border: "border-violet-200",
        title: "text-violet-900",
        body: "text-violet-800",
        icon: "text-violet-600",
        iconNode: <Clock className="h-5 w-5" />,
        headline: "Signed copy received — ready to fax",
        detail: "Click \"Send fax\" below to transmit to the IRS Ogden PIN Unit.",
      };
    case "FAXED":
      return {
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        title: "text-cyan-900",
        body: "text-cyan-800",
        icon: "text-cyan-600",
        iconNode: <Clock className="h-5 w-5" />,
        headline: "Faxing to the IRS",
        detail: "Transmission in progress. You'll get an email the moment it's delivered.",
      };
    case "CONFIRMED":
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        title: "text-emerald-900",
        body: "text-emerald-800",
        icon: "text-emerald-600",
        iconNode: <CheckCircle2 className="h-5 w-5" />,
        headline: "Delivered to the IRS ✓",
        detail: "Your filing was successfully faxed. The IRS doesn't acknowledge faxed 5472 filings, so no further action is needed.",
        action: { label: "Save proof of filing", href: "/filings/:id/confirmation" },
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
        headline: "We hit a snag",
        detail: "The fax didn't go through. Our team has been notified and will reach out within one business day.",
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

function formatRelative(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}
