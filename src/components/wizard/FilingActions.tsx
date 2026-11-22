"use client";
import { useTranslations, useLocale } from "next-intl";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Filing = {
  id: string;
  status: string;
  // Booleans, never the storage key: no package key reaches the browser
  // before staff release it (release gate).
  hasGeneratedPdf: boolean;
  // Staff released the package (reviewApprovedAt + reviewApprovedPdfKey).
  released: boolean;
  reviewApprovedAt: string | null;
  unreadTeamMessages: number;
  // R2 key for the customer's signature PNG, captured on the in-portal sign
  // page. Populated immediately when the customer hits "Acknowledge & sign";
  // the admin later embeds it into a finalized PDF (signedPdfKey). For the
  // "Step 2: Sign in your portal" gate we use this — NOT signedPdfKey —
  // because signedPdfKey only becomes non-null after admin processing and
  // would otherwise bounce the customer back to "needs signing" forever.
  signaturePngKey: string | null;
  signedPdfKey: string | null;
  faxJobId: string | null;
  faxStatus: string | null;
  faxService: boolean;
  // R2 key for the generated IRS Fax Transmission Receipt PDF. Populated
  // once the fax delivers (set by telnyx-webhook / fax-status-poll cron).
  faxConfirmationKey: string | null;
};

export function FilingActions({ filing }: { filing: Filing }) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const reviewApproved = filing.released;
  const canSign = filing.hasGeneratedPdf && filing.released;
  const signed = !!filing.signaturePngKey || !!filing.signedPdfKey;
  const approvedDate = filing.reviewApprovedAt
    ? new Date(filing.reviewApprovedAt).toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  async function generate() {
    setBusy("generate");
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filingId: filing.id }),
      });
      if (!res.ok) {
        alert(t("portal.filing.generationFailed", { error: await res.text() }));
        return;
      }
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  // uploadSigned removed — replaced by in-portal signing at /filings/[id]/sign.
  // The /api/upload-signed endpoint stays available as an internal fallback
  // for admin use but is no longer reachable from the customer UI.

  return (
    <div className="space-y-6">
      <Step
        n={1}
        title={t("portal.filing.generateYourForms")}
        done={filing.hasGeneratedPdf}
        active={filing.status === "PAID" && !filing.hasGeneratedPdf}
      >
        <p className="text-sm text-slate-600 mb-3">
          {t("portal.filing.coverLetterReasonableCauseStatementLateFilingsFilledForm")}
        </p>
        {!filing.hasGeneratedPdf ? (
          <Button onClick={generate} disabled={busy === "generate"}>
            {busy === "generate" ? t("portal.filing.generating") : t("portal.filing.generatePDF")}
          </Button>
        ) : (
          <p className="text-sm text-slate-700">
            <span className="font-medium">{t("portal.filing.pDFGenerated")}</span> {t("portal.filing.yourFormsAreReadyForReview")}
          </p>
        )}
      </Step>

      <Step
        n={2}
        title={t("portal.filing.accountantReview")}
        done={reviewApproved}
        active={filing.hasGeneratedPdf && !reviewApproved}
      >
        {filing.unreadTeamMessages > 0 ? (
          <p className="text-sm text-slate-700">
            <span className="font-medium text-amber-800">{t("portal.filing.weHaveAQuestionForYou")}</span>{" "}
            <a href="#messages" className="text-accent hover:underline">{t("portal.filing.openMessages")}</a>
          </p>
        ) : reviewApproved ? (
          <p className="text-sm text-slate-700">
            <span className="font-medium text-emerald-700">{t("portal.filing.approvedOn", { date: approvedDate ?? "" })}</span>
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            {t("portal.filing.aPTINHoldingTaxAccountantIsReviewingYourForms")}
          </p>
        )}
      </Step>

      <Step
        n={3}
        title={t("portal.filing.signDigitally")}
        done={signed}
        active={canSign && !signed}
      >
        <>
          {filing.released && (
            <a
              href={`/api/filings/${filing.id}/pdf`}
              target="_blank"
              rel="noopener"
              className="mb-3 inline-block text-sm text-accent hover:underline"
            >
              {t("portal.filing.viewYourFilingPackagePDF")}
            </a>
          )}
          {filing.signedPdfKey ? (
            <>
              <p className="text-sm text-slate-600 mb-3">
                {filing.faxJobId
                  ? t("portal.filing.signedSent")
                  : filing.faxService
                    ? t("portal.filing.signedPreparing")
                    : t("portal.filing.selfFax")}
              </p>
              <a
                href={`/api/filings/${filing.id}/signed-pdf`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-accent hover:underline"
              >
                {t("portal.filing.viewSignedPDF")}
              </a>
            </>
          ) : filing.signaturePngKey ? (
            <p className="text-sm text-slate-600">
              <span className="font-medium text-emerald-700">{t("portal.filing.signatureReceived")}</span>{" "}
              {t("portal.filing.weWillFaxItToTheIRSOgdenPIN")}
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-3">
                {canSign
                  ? t("portal.filing.readyCheck")
                  : t("portal.filing.emailCheck")}
              </p>
              <Button
                onClick={() => router.push(`/filings/${filing.id}/sign`)}
                disabled={!canSign}
              >
                {canSign ? t("portal.filing.checkSign") : t("portal.filing.afterReview")}
              </Button>
            </>
          )}
        </>
      </Step>

      {filing.faxService ? (
        <Step
          n={4}
          title={t("portal.filing.weFaxToTheIRS")}
          done={!!filing.faxJobId}
          active={!!filing.signedPdfKey && !filing.faxJobId}
        >
          {filing.faxJobId ? (
            <>
              {/* Plain-language fax status; the job id stays as a small reference. */}
              <p className="text-sm">
                {filing.faxStatus === "delivered" ? (
                  <span className="font-medium text-emerald-700">{t("portal.filing.deliveredToTheIRS")}</span>
                ) : filing.faxStatus?.startsWith("failed") ? (
                  <span className="text-slate-700">
                    {t("portal.filing.theLastFaxAttemptDidnTGoThroughOur")}
                  </span>
                ) : (
                  <span className="text-slate-700">
                    {t("portal.filing.sendingToTheIRSWeLlEmailYouAs")}
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-slate-400 break-all">{t("portal.filing.faxReference", { reference: filing.faxJobId })}</p>
              {filing.faxConfirmationKey && (
                <a
                  href={`/api/filings/${filing.id}/fax-receipt`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm text-accent hover:underline"
                >
                  {t("portal.filing.downloadIRSFaxReceiptPDF")}
                </a>
              )}
            </>
          ) : (
            <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
              <p className="font-medium">
                {filing.signaturePngKey || filing.signedPdfKey ? t("portal.filing.preparingFax") : t("portal.filing.afterSign")}
              </p>
              <p className="mt-1 text-slate-600">
                {filing.signaturePngKey || filing.signedPdfKey
                  ? t("portal.filing.faxingSigned")
                  : t("portal.filing.signThenFax")}
              </p>
            </div>
          )}
        </Step>
      ) : (
        <Step
          n={4}
          title={t("portal.filing.weFaxToTheIRS")}
          done={false}
          active={!!filing.signedPdfKey}
        >
          <p className="text-sm text-slate-600 mb-3">
            {t("portal.filing.youChoseToHandleTheFaxTransmissionYourselfFax")}
          </p>
          <div className="rounded-md bg-slate-50 border border-slate-200 p-3 mb-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">{t("portal.filing.iRSOgdenPINUnitFaxNumber")}</span>
              <span className="font-mono font-medium text-slate-900">+1-855-887-7737</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {t("portal.filing.recommendedOnlineFaxServicesEFaxFaxZeroOrGoogleVoice")}
            </p>
          </div>
          {filing.signedPdfKey ? (
            <a
              href={`/api/filings/${filing.id}/signed-pdf`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline">{t("portal.filing.downloadSignedPDFToFax")}</Button>
            </a>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {t("portal.filing.uploadYourSignedPDFAboveFirstThenDownloadIt")}
            </p>
          )}
        </Step>
      )}
    </div>
  );
}

function Step({
  n,
  title,
  done,
  active,
  children,
}: {
  n: number;
  title: string;
  done: boolean;
  active: boolean;
  children: React.ReactNode;
}) {
  const tone = done
    ? "border-emerald-200 bg-emerald-50"
    : active
      ? "border-accent bg-accent-50"
      : "border-slate-200 bg-white";
  return (
    <section className={`rounded-lg border p-5 ${tone}`}>
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center ${
            done ? "bg-emerald-600 text-white" : active ? "bg-accent text-white" : "bg-slate-200 text-slate-600"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <h2 className="font-medium">{title}</h2>
      </div>
      {children}
    </section>
  );
}
