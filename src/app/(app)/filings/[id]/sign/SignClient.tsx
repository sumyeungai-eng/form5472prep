"use client";
import { useTranslations } from "next-intl";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignaturePad } from "@/components/SignaturePad";

// Client surface for the in-portal check-and-sign page (reached from the
// "Check & sign my forms" email sent when admin uploads the reviewed PDF).
// Step 1: the client checks the exact reviewed PDF and ticks "everything is
// correct" — or asks for a change instead (POST /api/filings/[id]/request-change).
// Step 2: they sign; POST /api/filings/[id]/sign requires `confirmed: true`.
// Copy is brand-neutral ("we"/"us") because white-label partner clients land here.
export function SignClient({
  filingId,
  llcName,
  taxYears,
  priorSignatureDataUrl,
  pdfKey,
  showFilingLink,
}: {
  filingId: string;
  llcName: string | null;
  taxYears: number[];
  priorSignatureDataUrl: string | null;
  // generatedPdfKey of the PDF shown here; the sign API refuses any other.
  pdfKey: string;
  // False for a partner's client who arrived by sign link only: they can't
  // open /filings/{id}, so don't offer a link that dead-ends.
  showFilingLink: boolean;
}) {
  const t = useTranslations();
  const router = useRouter();
  const [dataUrl, setDataUrl] = useState<string | null>(priorSignatureDataUrl);
  const [confirmed, setConfirmed] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [changeOpen, setChangeOpen] = useState(false);
  const [changeText, setChangeText] = useState("");
  const [changeBusy, setChangeBusy] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSent, setChangeSent] = useState(false);
  const [signedDone, setSignedDone] = useState(false);

  async function submit() {
    if (!confirmed) {
      setError(t("portal.sign.confirmFirst"));
      return;
    }
    if (!signerName.trim()) {
      setError(t("portal.sign.typeName"));
      return;
    }
    if (!dataUrl) {
      setError(t("portal.sign.signatureRequired"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/filings/${filingId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pngDataUrl: dataUrl, confirmed: true, pdfKey, signerName: signerName.trim() }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${r.status}`);
      }
      if (showFilingLink) {
        router.push(`/filings/${filingId}?signed=1`);
      } else {
        setSignedDone(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("portal.sign.failed"));
      setBusy(false);
    }
  }

  async function requestChange() {
    const text = changeText.trim();
    if (text.length < 5) {
      setChangeError(t("portal.sign.changeBriefly"));
      return;
    }
    setChangeBusy(true);
    setChangeError(null);
    try {
      const r = await fetch(`/api/filings/${filingId}/request-change`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${r.status}`);
      }
      setChangeSent(true);
    } catch (e) {
      setChangeError(e instanceof Error ? e.message : t("portal.sign.noteFailed"));
    } finally {
      setChangeBusy(false);
    }
  }

  const label = llcName ?? t("domain.taxYear", { years: taxYears.join(", ") });

  if (signedDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-xl font-semibold text-slate-900">{t("portal.sign.thankYouYourFormsAreSigned")}</h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {t("portal.sign.weLlNowSendThemToTheIRSBy")}
          </p>
        </div>
      </div>
    );
  }

  if (changeSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-xl font-semibold text-slate-900">{t("portal.sign.thanksWeVeGotYourNote")}</h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {t("portal.sign.weLlCorrectYourFormsAndEmailYouA")}
          </p>
          {showFilingLink && (
            <Link
              href={`/filings/${filingId}`}
              className="mt-6 inline-flex items-center justify-center h-11 rounded-xl bg-accent px-4 text-white text-sm font-semibold"
            >
              {t("portal.sign.backToFiling")}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* pb-28: room below the content so the floating "Ask a question"
          button never covers the signing note on phones. */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-28">
        <div className="mb-6 flex items-center justify-between">
          {showFilingLink ? (
            <Link href={`/filings/${filingId}`} className="text-sm text-slate-500 hover:underline">
              {t("portal.sign.backToFiling2")}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-xs uppercase tracking-wider text-slate-400">{t("portal.sign.checkSign")}</span>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">{t("portal.sign.checkSign2", { label })}</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          {t("portal.sign.aPTINHoldingTaxAccountantHasReviewedYourForms")}
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold tracking-wider uppercase text-blue-900">{t("portal.sign.step1")}</div>
            <h2 className="mt-1 text-lg font-semibold">{t("portal.sign.checkYourForms")}</h2>
            <ul className="mt-2 list-disc pl-5 text-xs text-slate-600 space-y-0.5">
              <li>{t("portal.sign.lLCNameEINAndAddress")}</li>
              <li>{t("portal.sign.yourNameAddressAndForeignTaxID")}</li>
              <li>{t("portal.sign.theAmountsAndTheTaxYearS")}</li>
            </ul>
            {/* iPhone Safari often renders only page 1 of an embedded PDF, so
                the full-PDF button sits above the preview where it's seen. */}
            <a
              href={`/api/filings/${filingId}/pdf?v=${encodeURIComponent(pdfKey)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-900 px-4 py-2.5 text-sm font-semibold text-blue-900 hover:bg-blue-50"
            >
              {t("portal.sign.viewFullFormsAllPages")}
            </a>
            <p className="mt-1.5 text-xs text-slate-500 sm:hidden">
              {t("portal.sign.onAPhoneThePreviewBelowMayShowOnly")}
            </p>
            <iframe
              src={`/api/filings/${filingId}/pdf?v=${encodeURIComponent(pdfKey)}#toolbar=0`}
              className="mt-3 w-full h-[360px] sm:h-[480px] rounded-lg border border-slate-200"
              title={t("portal.sign.yourFormsToCheck")}
            />
            <BlankLinesPanel />

            <label className="mt-4 flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4"
                checked={confirmed}
                onChange={(e) => {
                  setConfirmed(e.target.checked);
                  setError(null);
                }}
              />
              <span>
                {t("portal.sign.iVeCheckedMyFormsAndEverythingIsCorrect")}
                <span className="mt-1 block text-xs text-slate-600">{t("portal.sign.declaration")}</span>
              </span>
            </label>

            <div className="mt-3">
              {!changeOpen ? (
                <button
                  type="button"
                  onClick={() => setChangeOpen(true)}
                  className="text-sm font-medium text-blue-900 hover:underline"
                >
                  {t("portal.sign.somethingSNotRightRequestAChange")}
                </button>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="change-text">
                    {t("portal.sign.whatNeedsChanging")}
                  </label>
                  <textarea
                    id="change-text"
                    rows={4}
                    value={changeText}
                    onChange={(e) => setChangeText(e.target.value)}
                    placeholder={t("portal.sign.eGTheLLCAddressShouldBeSuite200")}
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20"
                  />
                  {changeError && <p className="text-xs text-rose-600">{changeError}</p>}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={requestChange}
                      disabled={changeBusy}
                      className="rounded-full border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-60"
                    >
                      {changeBusy ? t("common.sending") : t("portal.sign.sendTeam")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChangeOpen(false)}
                      className="text-sm text-slate-500 hover:underline"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section
            className={`rounded-2xl border border-slate-200 bg-white p-5 transition-opacity ${
              confirmed ? "" : "opacity-60"
            }`}
          >
            <div className="text-xs font-semibold tracking-wider uppercase text-blue-900">{t("portal.sign.step2")}</div>
            <h2 className="mt-1 text-lg font-semibold">{t("portal.sign.sign")}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {confirmed
                ? t("portal.sign.drawBelow")
                : t("portal.sign.tickFirst")}
              {priorSignatureDataUrl && t("portal.sign.priorSignature")}
            </p>
            <label className="mt-3 block text-sm font-medium text-slate-700" htmlFor="signer-name">
              {t("portal.sign.fullLegalName")}
            </label>
            <input
              id="signer-name"
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              maxLength={200}
              autoComplete="name"
              disabled={!confirmed}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
            />
            <div className={`mt-3 ${confirmed ? "" : "pointer-events-none"}`} aria-disabled={!confirmed}>
              <SignaturePad
                initialPngDataUrl={priorSignatureDataUrl ?? undefined}
                onChange={setDataUrl}
                height={180}
              />
            </div>

            {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={busy || !dataUrl || !confirmed || !signerName.trim()}
              className="mt-5 w-full rounded-full bg-blue-900 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60"
            >
              {busy ? t("common.saving") : t("portal.sign.confirmSign")}
            </button>
            <p className="mt-2 text-xs text-slate-400 text-center">
              {t("portal.sign.yourSignatureIsPlacedOnTheOwnerSSignature")}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// PR 7: static explainer for the blank lines clients ask about. Keep it
// factual (i5472/i1120): no "doesn't apply to you" claims for Parts VIII–IX (O6).
export function BlankLinesPanel() {
  const t = useTranslations();
  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
      <div className="font-semibold text-slate-900">{t("portal.sign.whySomeLinesAreBlank")}</div>
      <ul className="mt-1.5 list-disc space-y-1 pl-4">
        <li>
          <strong>Form 1120:</strong> {t("portal.sign.theIncomeDeductionAndTaxLinesAndTheSchedules")}
        </li>
        <li>
          <strong>{t("portal.sign.lines43")}</strong> {t("portal.sign.theIRSInstructionsSayNotToCompleteTheseLines")}
        </li>
        <li>
          <strong>{t("portal.sign.partIV")}</strong> {t("portal.sign.partIVBody")} <strong>Part V</strong>{t("portal.sign.partVSuffix")} </li>
        <li>
          <strong>{t("portal.sign.partsVIIIAndIX")}</strong> {t("portal.sign.coverCostSharingArrangementsAndBaseErosionPaymentsThey")}
        </li>
      </ul>
    </div>
  );
}
