import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FiledDocumentsCard } from "@/components/FiledDocumentsCard";
import { getOwnedFiling, partnerOwnsFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "./PrintButton";
import { PartnerFilingBar } from "@/components/PartnerFilingBar";
import { requiresReasonableCause } from "@/lib/completeness";

export const dynamic = "force-dynamic";

// Printable proof-of-filing page, with the same downloads as the filing page.
export default async function FilingConfirmationPage({ params }: { params: { id: string } }) {
  const t = await getTranslations();
  const locale = await getLocale();
  const owned = await getOwnedFiling(params.id);
  if (!owned) notFound();

  const filing = await prisma.filing.findUnique({ where: { id: owned.id } });
  if (!filing) notFound();

  const isDelivered = filing.status === "CONFIRMED";
  const owningPartner = await partnerOwnsFiling(filing.id);
  const needsReasonableCause = requiresReasonableCause(
    {
      taxYears: filing.taxYears,
      isFinalReturn: filing.isFinalReturn,
      dissolvedAt: filing.dissolvedAt,
      extensionFiled: filing.extensionFiled,
      extensionTransmittedAt: filing.extensionTransmittedAt,
    },
    new Date(),
  );

  return (
    <>
      {owningPartner && (
        <PartnerFilingBar
          filingId={filing.id}
          partnerName={owningPartner.name}
          llcName={filing.llcName}
        />
      )}
      <div className="max-w-2xl mx-auto px-6 py-10">
      {/* On-screen header — hidden when printing */}
      <div className="print:hidden mb-6 flex items-center justify-between">
        <Link href={`/filings/${filing.id}`} className="text-sm text-slate-500 hover:underline">
          {t("portal.filing.backToFiling")}
        </Link>
        <PrintButton />
      </div>

      <div className="print:hidden mb-6">
        <FiledDocumentsCard
          filingId={filing.id}
          isFiled={filing.status === "FAXED" || filing.status === "CONFIRMED"}
          hasFiledForms={!!filing.faxedAt && !!(filing.faxedPdfKey || filing.signedPdfKey)}
          hasFaxedPdf={!!filing.faxedPdfKey}
          hasFaxReceipt={!!filing.faxedAt && !!filing.faxConfirmationKey}
          hasDistinctSignedCopy={!!filing.faxedAt && !!filing.faxedPdfKey && !!filing.signedPdfKey && filing.faxedPdfKey !== filing.signedPdfKey}
        />
      </div>

      {/* Printable card */}
      <div className="bg-white border border-slate-200 rounded-lg p-8 print:border-0 print:p-0">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div className="text-lg font-semibold">
            <span className="text-slate-900">Form</span>
            <span className="text-blue-900">5472</span>
            <span className="text-slate-900"> Prep</span>
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-500 font-medium">
            {t("portal.filing.proofOfSubmission")}
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          {isDelivered ? t("portal.filing.filingDelivered") : t("portal.filing.filingProgress")}
        </h1>
        <p className="text-slate-600 mb-8">
          {isDelivered
            ? t("portal.filing.submissionConfirmation")
            : t("portal.filing.notDelivered")}
        </p>

        <dl className="space-y-3 text-sm border-t border-slate-200 pt-6">
          <Row label={t("portal.filing.filingID")} value={filing.id} mono />
          <Row label="LLC" value={filing.llcName} />
          <Row label="EIN" value={filing.llcEin} mono />
          <Row label={t("portal.filing.taxYearS")} value={filing.taxYears.join(", ")} />
          <Row
            label={t("portal.filing.filingType")}
            value={
              needsReasonableCause
                ? t("portal.filing.lateReturn")
                : "Form 5472 + pro forma Form 1120"
            }
          />
          <Row label={t("portal.filing.foreignOwner")} value={filing.ownerName} />
          <Row label={t("portal.filing.ownerCountry")} value={filing.ownerCountryTaxResidence} />
          <Row label={t("portal.filing.faxedTo")} value="IRS Ogden PIN Unit · +1 855-887-7737" />
          <Row label={t("portal.filing.faxJobID")} value={filing.faxJobId} mono />
          <Row label={t("portal.filing.status")} value={t.has(`domain.filingStatus.${filing.status}`) ? t(`domain.filingStatus.${filing.status}`) : filing.status} />
          {isDelivered && <Row label={t("portal.filing.delivered")} value={filing.updatedAt.toLocaleString(locale, { timeZone: "UTC" })} />}
        </dl>

        <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 leading-relaxed">
          <p className="mb-2">
            <strong className="text-slate-700">{t("portal.filing.note")}</strong> {t("portal.filing.theIRSDoesNotIssueAcknowledgmentsForFaxedForm")}
          </p>
          <p> {t("portal.filing.retainThisConfirmationWithYourTaxRecordsGeneratedBy", { date: new Date().toLocaleDateString(locale, { timeZone: "UTC" }) })}
          </p>
        </div>
      </div>
      </div>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
      <dt className="text-slate-500 text-xs uppercase tracking-wider sm:text-sm sm:normal-case sm:tracking-normal">{label}</dt>
      <dd className={`sm:col-span-2 text-slate-900 break-words ${mono ? "font-mono text-xs" : ""}`}>
        {value && value.trim().length > 0 ? value : <span className="text-slate-400">—</span>}
      </dd>
    </div>
  );
}
