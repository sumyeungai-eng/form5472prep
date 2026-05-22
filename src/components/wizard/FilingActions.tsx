"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Filing = {
  id: string;
  status: string;
  generatedPdfKey: string | null;
  signedPdfKey: string | null;
  faxJobId: string | null;
  faxStatus: string | null;
  faxService: boolean;
  // R2 key for the generated IRS Fax Transmission Receipt PDF. Populated
  // once the fax delivers (set by telnyx-webhook / fax-status-poll cron).
  faxConfirmationKey: string | null;
};

export function FilingActions({ filing }: { filing: Filing }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function generate() {
    setBusy("generate");
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filingId: filing.id }),
      });
      if (!res.ok) {
        alert(`Generation failed: ${await res.text()}`);
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
        title="Generate filing PDFs"
        done={!!filing.generatedPdfKey}
        active={filing.status === "PAID" && !filing.generatedPdfKey}
      >
        <p className="text-sm text-slate-600 mb-3">
          Cover letter, reasonable cause statement (if DIIRSP), filled Form 1120 and Form 5472,
          plus the Part V supporting statement — combined into one PDF.
        </p>
        {!filing.generatedPdfKey ? (
          <Button onClick={generate} disabled={busy === "generate"}>
            {busy === "generate" ? "Generating…" : "Generate PDF"}
          </Button>
        ) : (
          <p className="text-sm text-slate-700">
            <span className="font-medium">PDF generated.</span> You&apos;ll be able to preview and
            sign it in the next step. The complete signed package is available for download once
            it&apos;s been reviewed by our accountant and is ready to fax.
          </p>
        )}
      </Step>

      <Step
        n={2}
        title="Sign in your portal"
        done={!!filing.signedPdfKey}
        active={!!filing.generatedPdfKey && !filing.signedPdfKey}
      >
        <p className="text-sm text-slate-600 mb-3">
          Draw your signature once — we embed it into every required box automatically. No printing,
          scanning, or uploading needed.
        </p>
        {filing.signedPdfKey ? (
          <a
            href={`/api/filings/${filing.id}/signed-pdf`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-accent hover:underline"
          >
            View signed PDF
          </a>
        ) : (
          <Button
            onClick={() => router.push(`/filings/${filing.id}/sign`)}
            disabled={!filing.generatedPdfKey}
          >
            {filing.generatedPdfKey ? "Sign my filing" : "Generate PDF first"}
          </Button>
        )}
      </Step>

      {filing.faxService ? (
        <Step
          n={3}
          title="IRS submission"
          done={!!filing.faxJobId}
          active={!!filing.signedPdfKey && !filing.faxJobId}
        >
          {filing.faxJobId ? (
            <>
              <p className="text-sm">
                <span className="font-medium">Fax job:</span>{" "}
                <span className="font-mono">{filing.faxJobId}</span> ·{" "}
                <span className="font-medium">Status:</span> {filing.faxStatus}
              </p>
              {filing.faxConfirmationKey && (
                <div className="mt-3 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm">
                  <p className="font-medium text-emerald-900">Proof of filing ready</p>
                  <p className="mt-1 text-emerald-800 text-xs leading-relaxed">
                    Timestamped IRS Fax Transmission Receipt — keep with your tax records as
                    proof of on-time filing under IRC § 6038A.
                  </p>
                  <a
                    href={`/api/filings/${filing.id}/fax-receipt`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block"
                  >
                    <Button variant="outline">Download fax receipt (PDF)</Button>
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <p className="font-medium">Under review</p>
              <p className="mt-1 text-amber-700">
                Our team will submit your forms to the IRS once reviewed by our accountant.
                You&apos;ll receive an email confirmation once it&apos;s been faxed.
              </p>
            </div>
          )}
        </Step>
      ) : (
        <Step
          n={3}
          title="Fax to the IRS yourself"
          done={false}
          active={!!filing.signedPdfKey}
        >
          <p className="text-sm text-slate-600 mb-3">
            You chose to handle the fax transmission yourself. Fax the signed PDF to the
            IRS Ogden PIN Unit at the number below — use any online fax service or a fax
            machine.
          </p>
          <div className="rounded-md bg-slate-50 border border-slate-200 p-3 mb-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">IRS Ogden PIN Unit fax number:</span>
              <span className="font-mono font-medium text-slate-900">+1-855-887-7737</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Recommended online fax services: eFax, FaxZero, or Google Voice (Workspace).
              Keep your fax confirmation receipt — it&apos;s your proof of timely filing.
            </p>
          </div>
          {filing.signedPdfKey ? (
            <a
              href={`/api/filings/${filing.id}/signed-pdf`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline">Download signed PDF to fax</Button>
            </a>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Upload your signed PDF above first, then download it here to fax.
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
