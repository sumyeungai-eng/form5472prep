"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignaturePad } from "@/components/SignaturePad";

// Client surface for the in-portal signing page. Shows a preview of the
// unsigned generated PDF in an iframe, the signature pad, and a "Apply
// signature" CTA that POSTs to /api/filings/[id]/sign. On success, redirects
// to /filings/[id] where the status banner will reflect SIGNED_UPLOADED.
export function SignClient({
  filingId,
  llcName,
  taxYears,
  priorSignatureDataUrl,
}: {
  filingId: string;
  llcName: string | null;
  taxYears: number[];
  priorSignatureDataUrl: string | null;
}) {
  const router = useRouter();
  const [dataUrl, setDataUrl] = useState<string | null>(priorSignatureDataUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!dataUrl) {
      setError("Please draw or keep a signature before continuing.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/filings/${filingId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pngDataUrl: dataUrl }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${r.status}`);
      }
      router.push(`/filings/${filingId}?signed=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign failed");
      setBusy(false);
    }
  }

  const label = llcName ?? `tax year ${taxYears.join(", ")}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/filings/${filingId}`} className="text-sm text-slate-500 hover:underline">
            ← Back to filing
          </Link>
          <span className="text-xs uppercase tracking-wider text-slate-400">Sign your filing</span>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">Acknowledge & sign — {label}</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Review the package on the left and draw your signature below to acknowledge
          you&apos;ve checked it. Our tax accountant will then sign the final IRS package
          on your behalf and fax it to the IRS Ogden PIN Unit.
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold tracking-wider uppercase text-blue-900">
              Unsigned package
            </div>
            <h2 className="mt-1 text-lg font-semibold">Review before signing</h2>
            <p className="mt-1 text-xs text-slate-500">
              Confirm the entity name, EIN, owner details, and totals look right. If anything is off,
              go back to your filing and message us in the portal thread.
            </p>
            <iframe
              src={`/api/filings/${filingId}/pdf#toolbar=0`}
              className="mt-3 w-full h-[480px] rounded-lg border border-slate-200"
              title="Unsigned filing package"
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold tracking-wider uppercase text-blue-900">
              Signature
            </div>
            <h2 className="mt-1 text-lg font-semibold">Acknowledge with your signature</h2>
            <p className="mt-1 text-xs text-slate-500">
              We keep this for our records as your acknowledgment that the package
              above looks right. Our accountant will sign the IRS forms before fax.
              {priorSignatureDataUrl && " We've pre-loaded the signature you used on a previous filing — keep it or clear and re-draw."}
            </p>
            <div className="mt-3">
              <SignaturePad
                initialPngDataUrl={priorSignatureDataUrl ?? undefined}
                onChange={setDataUrl}
                height={180}
              />
            </div>

            {error && (
              <p className="mt-3 text-xs text-rose-600">{error}</p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={busy || !dataUrl}
              className="mt-5 w-full rounded-full bg-blue-900 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Acknowledge & continue"}
            </button>
            <p className="mt-2 text-xs text-slate-400 text-center">
              By clicking, you confirm the package above looks correct and authorize
              Form5472 Prep&apos;s accountant to sign and submit on your behalf.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
