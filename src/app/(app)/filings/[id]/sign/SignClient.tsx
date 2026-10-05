"use client";

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
  const router = useRouter();
  const [dataUrl, setDataUrl] = useState<string | null>(priorSignatureDataUrl);
  const [confirmed, setConfirmed] = useState(false);
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
      setError("Please confirm you've checked your forms first.");
      return;
    }
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
        body: JSON.stringify({ pngDataUrl: dataUrl, confirmed: true, pdfKey }),
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
      setError(e instanceof Error ? e.message : "Sign failed");
      setBusy(false);
    }
  }

  async function requestChange() {
    const text = changeText.trim();
    if (text.length < 5) {
      setChangeError("Tell us briefly what needs changing.");
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
      setChangeError(e instanceof Error ? e.message : "Could not send your note");
    } finally {
      setChangeBusy(false);
    }
  }

  const label = llcName ?? `tax year ${taxYears.join(", ")}`;

  if (signedDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-xl font-semibold text-slate-900">Thank you — your forms are signed</h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            We&apos;ll now send them to the IRS by fax and email you the confirmation once they&apos;re delivered.
          </p>
        </div>
      </div>
    );
  }

  if (changeSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-xl font-semibold text-slate-900">Thanks — we&apos;ve got your note</h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            We&apos;ll correct your forms and email you a new version to check and sign. Nothing is sent to
            the IRS until you&apos;ve signed.
          </p>
          {showFilingLink && (
            <Link
              href={`/filings/${filingId}`}
              className="mt-6 inline-flex items-center justify-center h-11 rounded-xl bg-accent px-4 text-white text-sm font-semibold"
            >
              Back to filing
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          {showFilingLink ? (
            <Link href={`/filings/${filingId}`} className="text-sm text-slate-500 hover:underline">
              ← Back to filing
            </Link>
          ) : (
            <span />
          )}
          <span className="text-xs uppercase tracking-wider text-slate-400">Check &amp; sign</span>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">Check &amp; sign — {label}</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          A qualified accountant has reviewed your forms. Please check them, and if everything is correct,
          sign below. Nothing is sent to the IRS until you sign.
        </p>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold tracking-wider uppercase text-blue-900">Step 1</div>
            <h2 className="mt-1 text-lg font-semibold">Check your forms</h2>
            <ul className="mt-2 list-disc pl-5 text-xs text-slate-600 space-y-0.5">
              <li>LLC name, EIN and address</li>
              <li>Your name, address and foreign tax ID</li>
              <li>The amounts and the tax year(s)</li>
            </ul>
            <iframe
              src={`/api/filings/${filingId}/pdf?v=${encodeURIComponent(pdfKey)}#toolbar=0`}
              className="mt-3 w-full h-[480px] rounded-lg border border-slate-200"
              title="Your forms to check"
            />
            <a
              href={`/api/filings/${filingId}/pdf?v=${encodeURIComponent(pdfKey)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-slate-500 hover:underline"
            >
              Open the PDF in a new tab
            </a>

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
              <span>I&apos;ve checked my forms and everything is correct.</span>
            </label>

            <div className="mt-3">
              {!changeOpen ? (
                <button
                  type="button"
                  onClick={() => setChangeOpen(true)}
                  className="text-sm font-medium text-blue-900 hover:underline"
                >
                  Something&apos;s not right? Request a change
                </button>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="change-text">
                    What needs changing?
                  </label>
                  <textarea
                    id="change-text"
                    rows={4}
                    value={changeText}
                    onChange={(e) => setChangeText(e.target.value)}
                    placeholder="E.g. The LLC address should be Suite 200, not Suite 100."
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
                      {changeBusy ? "Sending…" : "Send to our team"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChangeOpen(false)}
                      className="text-sm text-slate-500 hover:underline"
                    >
                      Cancel
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
            <div className="text-xs font-semibold tracking-wider uppercase text-blue-900">Step 2</div>
            <h2 className="mt-1 text-lg font-semibold">Sign</h2>
            <p className="mt-1 text-xs text-slate-500">
              {confirmed
                ? "Draw your signature below."
                : "Tick “everything is correct” in step 1 first."}
              {priorSignatureDataUrl && " We've pre-loaded the signature you used before — keep it or clear and re-draw."}
            </p>
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
              disabled={busy || !dataUrl || !confirmed}
              className="mt-5 w-full rounded-full bg-blue-900 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-950 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Confirm & sign"}
            </button>
            <p className="mt-2 text-xs text-slate-400 text-center">
              By signing, you confirm the forms above are correct and authorize us to submit them to the
              IRS by fax.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
