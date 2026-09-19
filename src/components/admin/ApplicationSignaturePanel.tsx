"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { PREPARED_PDF_MAX_BYTES } from "@/lib/applicationSignatureLimits";

type Props = {
  type: "ein" | "itin";
  id: string;
  formLabel: string;
  paid: boolean;
  preparedUploadedAt: string | null;
  preparedSha256: string | null;
  requestedAt: string | null;
  signedAt: string | null;
  signerName: string | null;
  signatureIp: string | null;
  signatureUserAgent: string | null;
  consentVersion: string | null;
  signedDocSha256: string | null;
  signedPdfAt: string | null;
};

export function ApplicationSignaturePanel(props: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<"upload" | "request" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const base = `/api/admin/applications/${props.type}/${props.id}`;
  const preparedUrl = `${base}/prepared-pdf`;
  const signatureUrl = `${base}/signature-png`;
  const signedUrl = `${base}/signed-pdf`;
  const hasPrepared = !!props.preparedUploadedAt || !!props.preparedSha256;
  const hasSignature = !!props.signedAt;
  const hashesMatch = !!props.preparedSha256 && !!props.signedDocSha256 && props.preparedSha256 === props.signedDocSha256;
  const canRequest = hasPrepared && props.paid && busy === null;
  const canPlace = hasSignature && hashesMatch;

  async function uploadPrepared() {
    if (!file) return;
    if (file.size > PREPARED_PDF_MAX_BYTES) {
      setError("That PDF is larger than 4 MB. Export a smaller copy and try again.");
      setNotice(null);
      return;
    }
    if (hasSignature) {
      const ok = window.confirm("Uploading a new version discards the current signature. The customer will need to sign again.");
      if (!ok) return;
    }

    setBusy("upload");
    setError(null);
    setNotice(null);
    const form = new FormData();
    form.set("file", file);
    try {
      const res = await fetch(preparedUrl, { method: "POST", body: form });
      const body = await readJson(res);
      if (!body) throw new Error(`Upload failed (HTTP ${res.status}). The file may be too large.`);
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setNotice(`Uploaded prepared ${props.formLabel}.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(null);
    }
  }

  async function requestSignature() {
    setBusy("request");
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`${base}/request-signature`, { method: "POST" });
      const body = await readJson(res);
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      setNotice(`Signature request sent to ${body?.sentTo ?? "customer"}.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Digital signature
          </h2>
          <p className="mt-1 text-sm text-slate-600">Prepared {props.formLabel}, customer signature, and stamped PDF.</p>
        </div>
        <MatchBadge signed={hasSignature} matches={hashesMatch} />
      </div>

      <ol className="grid gap-2 sm:grid-cols-2">
        <Step label="Prepared form uploaded" at={props.preparedUploadedAt} />
        <Step label="Signature requested" at={props.requestedAt} />
        <Step label="Customer signed" at={props.signedAt} />
        <Step label="Signed PDF produced" at={props.signedPdfAt} />
      </ol>

      <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
        <label className="block text-xs font-medium text-slate-600">
          Prepared {props.formLabel} PDF
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={uploadPrepared}
            disabled={!file || busy !== null}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "upload" && <Loader2 className="h-4 w-4 animate-spin" />}
            Upload prepared {props.formLabel}
          </button>
        </div>
        <p className="text-xs text-slate-500">PDF, 4 MB or smaller.</p>
        <div className="flex flex-wrap gap-3 text-sm">
          {hasPrepared && (
            <a href={preparedUrl} target="_blank" rel="noopener" className="text-accent hover:underline">
              View prepared PDF
            </a>
          )}
          {props.signedPdfAt && (
            <a href={signedUrl} target="_blank" rel="noopener" className="text-accent hover:underline">
              Download signed PDF
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={requestSignature}
          disabled={!canRequest}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === "request" && <Loader2 className="h-4 w-4 animate-spin" />}
          {props.requestedAt ? "Resend signature request" : "Email signature request"}
        </button>
        {canPlace ? (
          <Link
            href={`/admin/applications/${props.type}/${props.id}/place-signature`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Place signature on form
          </Link>
        ) : (
          <span className="inline-flex h-10 items-center justify-center rounded-md bg-slate-100 px-4 text-sm font-medium text-slate-400">
            Place signature on form
          </span>
        )}
      </div>

      {!props.paid && hasPrepared && (
        <p className="text-xs text-amber-700">Payment is required before emailing the signature request.</p>
      )}
      {notice && <p className="text-sm text-emerald-700">{notice}</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      {hasSignature && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="w-full rounded-md border border-slate-200 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- Admin preview of a private signature PNG served by an authenticated route. */}
            <img src={signatureUrl} alt="Customer signature" className="max-h-28 max-w-full object-contain" />
          </div>
          <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
            <Audit label="Signer name" value={props.signerName} />
            <Audit label="Signed at" value={formatDate(props.signedAt)} />
            <Audit label="IP" value={props.signatureIp} />
            <Audit label="User agent" value={props.signatureUserAgent} />
            <Audit label="Consent version" value={props.consentVersion} />
            <Audit label="Prepared hash" value={shortHash(props.preparedSha256)} />
            <Audit label="Signed doc hash" value={shortHash(props.signedDocSha256)} />
          </dl>
        </div>
      )}
    </div>
  );
}

function Step({ label, at }: { label: string; at: string | null }) {
  return (
    <li className="rounded-md border border-slate-200 px-3 py-2">
      <div className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-1 text-sm ${at ? "text-slate-900" : "text-slate-400"}`}>
        {formatDate(at) ?? "Pending"}
      </div>
    </li>
  );
}

function Audit({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className="mt-0.5 break-words text-slate-800">{value || "Not recorded"}</dd>
    </div>
  );
}

function MatchBadge({ signed, matches }: { signed: boolean; matches: boolean }) {
  if (!signed) return null;
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        matches ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
      }`}
    >
      {matches ? "matches current form" : "signed a different version"}
    </span>
  );
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleString("en-US");
}

function shortHash(value: string | null): string | null {
  return value ? value.slice(0, 12) : null;
}

async function readJson(res: Response): Promise<{ error?: string; sentTo?: string } | null> {
  return res.json().catch(() => null);
}
