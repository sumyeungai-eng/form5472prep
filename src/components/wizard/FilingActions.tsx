"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Filing = {
  id: string;
  status: string;
  generatedPdfKey: string | null;
  reviewApprovedAt: string | null;
  reviewApprovedBy: string | null;
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

const SIGNING_STARTED_STATUSES = new Set([
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
  "FAILED",
]);

export function FilingActions({ filing }: { filing: Filing }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const reviewApproved = !!filing.reviewApprovedAt;
  const signingStarted = SIGNING_STARTED_STATUSES.has(filing.status);
  const canSign = !!filing.generatedPdfKey && (reviewApproved || signingStarted);
  const signed = !!filing.signaturePngKey || !!filing.signedPdfKey;
  const approvedDate = filing.reviewApprovedAt
    ? new Date(filing.reviewApprovedAt).toLocaleDateString(undefined, {
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
        title="Generate your forms"
        done={!!filing.generatedPdfKey}
        active={filing.status === "PAID" && !filing.generatedPdfKey}
      >
        <p className="text-sm text-slate-600 mb-3">
          Cover letter, reasonable-cause statement (late filings), filled Form 1120 and Form 5472,
          plus the Part V supporting statement — combined into one PDF.
        </p>
        {!filing.generatedPdfKey ? (
          <Button onClick={generate} disabled={busy === "generate"}>
            {busy === "generate" ? "Generating…" : "Generate PDF"}
          </Button>
        ) : (
          <p className="text-sm text-slate-700">
            <span className="font-medium">PDF generated.</span> Your forms are ready for review.
          </p>
        )}
      </Step>

      <Step
        n={2}
        title="Accountant review"
        done={reviewApproved}
        active={!!filing.generatedPdfKey && !reviewApproved}
      >
        {filing.unreadTeamMessages > 0 ? (
          <p className="text-sm text-slate-700">
            <span className="font-medium text-amber-800">We have a question for you</span>{" "}
            <a href="#messages" className="text-accent hover:underline">Open messages</a>
          </p>
        ) : reviewApproved ? (
          <p className="text-sm text-slate-700">
            <span className="font-medium text-emerald-700">Approved on {approvedDate}</span>
          </p>
        ) : (
          <p className="text-sm text-slate-600">
            A qualified accountant is reviewing your forms. If anything needs clarifying, we will message you here.
          </p>
        )}
      </Step>

      <Step
        n={3}
        title="Sign digitally"
        done={signed}
        active={canSign && !signed}
      >
        <>
          {filing.generatedPdfKey && (
            <a
              href={`/api/filings/${filing.id}/pdf`}
              target="_blank"
              rel="noopener"
              className="mb-3 inline-block text-sm text-accent hover:underline"
            >
              View your filing package (PDF)
            </a>
          )}
          {filing.signedPdfKey ? (
            <>
              <p className="text-sm text-slate-600 mb-3">
                Signed PDF is ready. The complete package is being prepared for fax.
              </p>
              <a
                href={`/api/filings/${filing.id}/signed-pdf`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-accent hover:underline"
              >
                View signed PDF
              </a>
            </>
          ) : filing.signaturePngKey ? (
            <p className="text-sm text-slate-600">
              <span className="font-medium text-emerald-700">Signature received.</span>{" "}
              We will fax it to the IRS Ogden PIN Unit shortly. You&apos;ll get an email the moment it&apos;s sent.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-3">
                Draw your signature once. No printing, scanning, or uploading needed.
              </p>
              <Button
                onClick={() => router.push(`/filings/${filing.id}/sign`)}
                disabled={!canSign}
              >
                {canSign ? "Sign my filing" : "Available after review"}
              </Button>
            </>
          )}
        </>
      </Step>

      {filing.faxService ? (
        <Step
          n={4}
          title="We fax to the IRS"
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
            <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
              <p className="font-medium">
                {filing.signaturePngKey || filing.signedPdfKey ? "Preparing to fax" : "After you sign"}
              </p>
              <p className="mt-1 text-slate-600">
                {filing.signaturePngKey || filing.signedPdfKey
                  ? "We are faxing your signed forms to the IRS. We will email you the fax confirmation as soon as it goes through."
                  : "Once you sign, we fax your forms to the IRS and email you the fax confirmation."}
              </p>
            </div>
          )}
        </Step>
      ) : (
        <Step
          n={4}
          title="We fax to the IRS"
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
