import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { MessagesPanel } from "@/components/MessagesPanel";
import { ApplicationSignatureCard } from "@/components/applications/ApplicationSignatureCard";
import { signState } from "@/lib/applicationSignature";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { EinStatus } from "@prisma/client";

const EIN_STATUSES: Record<EinStatus, { label: string; color: string; icon: "check" | "clock" | "x" }> = {
  RECEIVED:        { label: "domain.status.received",                color: "bg-slate-100 text-slate-700",       icon: "clock" },
  IN_REVIEW:       { label: "domain.status.inReview",               color: "bg-amber-100 text-amber-700",       icon: "clock" },
  DOCS_REQUESTED:  { label: "domain.status.documentsRequested",     color: "bg-amber-100 text-amber-700",       icon: "clock" },
  PAYMENT_PENDING: { label: "domain.status.paymentPending",         color: "bg-amber-100 text-amber-700",       icon: "clock" },
  PROCESSING:      { label: "domain.status.processing",     color: "bg-blue-100 text-blue-700",         icon: "clock" },
  COMPLETED:       { label: "domain.status.einCompleted",  color: "bg-emerald-100 text-emerald-700",   icon: "check" },
  CANCELLED:       { label: "domain.status.cancelled",               color: "bg-red-100 text-red-700",           icon: "x" },
};

export default async function EinApplicationPage({ params }: { params: { id: string } }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const user = await requireUser();
  const app = await prisma.einApplication.findFirst({
    where: { id: params.id, userId: user.id },
    select: {
      id: true,
      createdAt: true,
      fullName: true,
      llcName: true,
      llcState: true,
      businessPurpose: true,
      paidAt: true,
      preparedPdfKey: true,
      signaturePngKey: true,
      signedAt: true,
      signerName: true,
      signedPdfKey: true,
      status: true,
      adminNotes: true,
      ein: true,
    },
  });
  if (!app) notFound();

  const s = EIN_STATUSES[app.status] ?? EIN_STATUSES.RECEIVED;
  const signatureState = signState(app);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-8">
        <ArrowLeft className="h-3.5 w-3.5" /> {t("portal.applications.dashboard")}
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("portal.applications.eINApplication")}</h1>
          <p className="text-slate-500 mt-1">{app.llcName}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.color}`}>
          {s.icon === "check" && <CheckCircle2 className="h-3.5 w-3.5" />}
          {s.icon === "clock" && <Clock className="h-3.5 w-3.5" />}
          {s.icon === "x" && <XCircle className="h-3.5 w-3.5" />}
          {t(s.label)}
        </span>
      </div>

      {app.adminNotes && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">{t("portal.applications.messageFromOurTeam")}</p>
          <p className="text-sm text-blue-900 leading-relaxed">{app.adminNotes}</p>
        </div>
      )}

      {app.ein && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">{t("portal.applications.yourEIN")}</p>
          <p className="text-2xl font-mono font-semibold text-emerald-900">{app.ein}</p>
        </div>
      )}

      {app.paidAt && (
        <div className="mb-6">
          <ApplicationSignatureCard
            type="ein"
            id={app.id}
            state={signatureState}
            signedAt={app.signedAt}
            signerName={app.signerName}
          />
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">{t("portal.applications.applicationDetails")}</p>
          <dl className="space-y-2 text-sm">
            <div className="flex"><dt className="w-40 text-slate-500 shrink-0">{t("portal.applications.lLCName")}</dt><dd className="text-slate-900">{app.llcName}</dd></div>
            {app.llcState && <div className="flex"><dt className="w-40 text-slate-500 shrink-0">{t("portal.applications.state")}</dt><dd className="text-slate-900">{app.llcState}</dd></div>}
            {app.businessPurpose && <div className="flex"><dt className="w-40 text-slate-500 shrink-0">{t("portal.applications.businessPurpose")}</dt><dd className="text-slate-900">{app.businessPurpose}</dd></div>}
            <div className="flex"><dt className="w-40 text-slate-500 shrink-0">{t("portal.applications.submitted")}</dt><dd className="text-slate-900">{app.createdAt.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })}</dd></div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <MessagesPanel apiBase={`/api/applications/ein/${app.id}/messages`} isAdmin={false} />
      </div>

      <p className="mt-8 text-sm text-slate-500"> {t("portal.applications.questionsEmailUsAt")}{" "}
        <a href="mailto:support@form5472prep.com" className="text-accent hover:underline">support@form5472prep.com</a>
      </p>
    </div>
  );
}
