import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { EinStatus } from "@prisma/client";

const EIN_STATUSES: Record<EinStatus, { label: string; color: string; icon: "check" | "clock" | "x" }> = {
  RECEIVED:        { label: "Received",                color: "bg-slate-100 text-slate-700",       icon: "clock" },
  IN_REVIEW:       { label: "In review",               color: "bg-amber-100 text-amber-700",       icon: "clock" },
  DOCS_REQUESTED:  { label: "Documents requested",     color: "bg-amber-100 text-amber-700",       icon: "clock" },
  PAYMENT_PENDING: { label: "Payment pending",         color: "bg-amber-100 text-amber-700",       icon: "clock" },
  PROCESSING:      { label: "Processing with IRS",     color: "bg-blue-100 text-blue-700",         icon: "clock" },
  COMPLETED:       { label: "Completed — EIN issued",  color: "bg-emerald-100 text-emerald-700",   icon: "check" },
  CANCELLED:       { label: "Cancelled",               color: "bg-red-100 text-red-700",           icon: "x" },
};

export default async function EinApplicationPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const app = await prisma.einApplication.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!app) notFound();

  const s = EIN_STATUSES[app.status] ?? EIN_STATUSES.RECEIVED;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8">
        <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">EIN Application</h1>
          <p className="text-slate-500 mt-1">{app.llcName}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.color}`}>
          {s.icon === "check" && <CheckCircle2 className="h-3.5 w-3.5" />}
          {s.icon === "clock" && <Clock className="h-3.5 w-3.5" />}
          {s.icon === "x" && <XCircle className="h-3.5 w-3.5" />}
          {s.label}
        </span>
      </div>

      {app.adminNotes && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">Message from our team</p>
          <p className="text-sm text-blue-900 leading-relaxed">{app.adminNotes}</p>
        </div>
      )}

      {app.ein && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">Your EIN</p>
          <p className="text-2xl font-mono font-semibold text-emerald-900">{app.ein}</p>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Application details</p>
          <dl className="space-y-2 text-sm">
            <div className="flex"><dt className="w-40 text-slate-500 shrink-0">LLC name</dt><dd className="text-slate-900">{app.llcName}</dd></div>
            {app.llcState && <div className="flex"><dt className="w-40 text-slate-500 shrink-0">State</dt><dd className="text-slate-900">{app.llcState}</dd></div>}
            {app.businessPurpose && <div className="flex"><dt className="w-40 text-slate-500 shrink-0">Business purpose</dt><dd className="text-slate-900">{app.businessPurpose}</dd></div>}
            <div className="flex"><dt className="w-40 text-slate-500 shrink-0">Submitted</dt><dd className="text-slate-900">{app.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</dd></div>
          </dl>
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Questions? Email us at{" "}
        <a href="mailto:support@form5472prep.com" className="text-accent hover:underline">support@form5472prep.com</a>
      </p>
    </div>
  );
}
