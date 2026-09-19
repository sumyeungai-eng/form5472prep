"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignaturePad } from "@/components/SignaturePad";
import type { ApplicationType } from "@/lib/applicationSignature";

export function ApplicationSignClient({
  type,
  id,
  docSha256,
  documentUrl,
  consentText,
  defaultName,
  alreadySigned,
}: {
  type: ApplicationType;
  id: string;
  docSha256: string;
  documentUrl: string;
  consentText: string;
  defaultName: string;
  alreadySigned: boolean;
}) {
  const router = useRouter();
  const [signaturePngDataUrl, setSignaturePngDataUrl] = useState<string | null>(null);
  const [signerName, setSignerName] = useState(defaultName);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = signerName.trim().length > 0 && consent && !!signaturePngDataUrl && !busy;
  const label = type === "ein" ? "Form SS-4" : "Form W-7";

  async function submit() {
    if (!canSubmit) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/applications/${type}/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signaturePngDataUrl, signerName, consent, docSha256 }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.push(`/applications/${type}/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign failed");
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-900">Step 1</div>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Review the {label}</h2>
        <p className="mt-3 text-sm text-slate-600">
          On a phone, open the form in a new tab to read it comfortably.
        </p>
        <Link
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center justify-center rounded-full border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
        >
          Open the form in a new tab
        </Link>
        <iframe
          src={`${documentUrl}#toolbar=0`}
          className="mt-4 h-[60vh] w-full rounded-lg border border-slate-200 lg:h-[70vh]"
          title={`Prepared ${label}`}
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-900">Step 2</div>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Sign after review</h2>

        {alreadySigned && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            You already signed this form. Submitting again replaces your earlier signature.
          </p>
        )}

        <label htmlFor="signerName" className="mt-4 block text-sm font-medium text-slate-700">
          Full legal name
        </label>
        <input
          id="signerName"
          value={signerName}
          onChange={(event) => setSignerName(event.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
          autoComplete="name"
        />

        <label className="mt-4 flex gap-3 text-sm leading-6 text-slate-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
          />
          <span>{consentText}</span>
        </label>

        <div className="mt-4">
          <SignaturePad onChange={setSignaturePngDataUrl} height={180} />
        </div>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="mt-5 w-full rounded-full bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving..." : "Sign and submit"}
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          If anything on the form looks wrong, do not sign. Reply to our email and we will correct it.
        </p>
      </section>
    </div>
  );
}
