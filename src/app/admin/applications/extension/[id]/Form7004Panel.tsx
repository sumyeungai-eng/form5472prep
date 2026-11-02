"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export type Form7004PanelProps = {
  id: string;
  generatedAt: string | null;
  warnings: string[];
  // From extensionFaxDecision on the server (the fax route re-checks everything).
  faxRefusal: string | null;
  faxNeedsReason: string | null;
  fax: {
    jobId: string | null;
    status: string | null;
    sentAt: string | null;
    deliveredAt: string | null;
    attempts: number;
    hasReceipt: boolean;
  };
  irsFaxNumber: string;
};

export function Form7004Panel(props: Form7004PanelProps) {
  const { id, generatedAt, warnings, faxRefusal, fax } = props;
  const router = useRouter();
  const [busy, setBusy] = useState<"generate" | "fax" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [needsReason, setNeedsReason] = useState<string | null>(props.faxNeedsReason);
  const [reason, setReason] = useState("");
  const pdfUrl = `/api/admin/applications/extension/${id}/form-7004`;

  async function call(kind: "generate" | "fax", url: string, body?: unknown) {
    setBusy(kind);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        if (json?.needsReason && typeof json.error === "string") setNeedsReason(json.error);
        throw new Error(typeof json?.error === "string" ? json.error : `HTTP ${res.status}`);
      }
      return json;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function generate() {
    const json = await call("generate", pdfUrl);
    if (!json) return;
    setNotice("Generated Form 7004. Open it and check every line before faxing.");
    router.refresh();
  }

  async function sendFax() {
    const prompt = needsReason
      ? `${needsReason}\n\nSend Form 7004 to the IRS (${props.irsFaxNumber}) again with your reason?`
      : `Fax the generated Form 7004 to the IRS (${props.irsFaxNumber}) now? Check the PDF first — this cannot be undone.`;
    if (!window.confirm(prompt)) return;
    const json = await call("fax", `/api/admin/applications/extension/${id}/fax`, needsReason ? { reason } : {});
    if (!json) return;
    setNeedsReason(null);
    setReason("");
    setNotice(json.sandbox ? `Sandbox fax recorded (${json.faxJobId}) — nothing reached the IRS.` : `Fax queued (${json.faxJobId}). The client is emailed automatically once Telnyx confirms delivery.`);
    router.refresh();
  }

  const faxDisabled = !!busy || !!faxRefusal || (!!needsReason && reason.replace(/\s/g, "").length < 10);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Form 7004</h2>
        <p className="mt-1 text-xs text-slate-500">
          Generated from the order: &quot;Foreign-owned U.S. DE&quot; across the top, Form 1120 code 12, calendar tax year,
          lines 6–8 = 0. Faxed to the IRS Ogden PIN Unit at {props.irsFaxNumber}.
        </p>
      </div>

      {warnings.length > 0 ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">Missing or doubtful — fix in “Edit order details”, then regenerate:</p>
          <ul className="mt-1 list-disc pl-5">
            {warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-emerald-700">No missing fields.</p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={generate}
          disabled={!!busy}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-700 disabled:opacity-60"
        >
          {busy === "generate" && <Loader2 className="h-4 w-4 animate-spin" />}
          {generatedAt ? "Regenerate Form 7004" : "Generate Form 7004"}
        </button>
        {generatedAt && (
          <a href={pdfUrl} target="_blank" rel="noopener" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
            View / download
          </a>
        )}
        <span className="text-xs text-slate-500">
          {generatedAt ? `Generated ${new Date(generatedAt).toUTCString()}` : "Not generated yet"}
        </span>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <dl className="grid grid-cols-[10rem_1fr] gap-y-1 text-sm">
          <dt className="text-slate-500">Fax status</dt>
          <dd className="text-slate-900">{fax.status ?? "Not faxed"}</dd>
          {fax.jobId && (<><dt className="text-slate-500">Telnyx fax ID</dt><dd className="font-mono text-xs text-slate-900">{fax.jobId}</dd></>)}
          {fax.sentAt && (<><dt className="text-slate-500">Sent</dt><dd className="text-slate-900">{new Date(fax.sentAt).toUTCString()}</dd></>)}
          {fax.deliveredAt && (<><dt className="text-slate-500">Delivered</dt><dd className="text-slate-900">{new Date(fax.deliveredAt).toUTCString()}</dd></>)}
          <dt className="text-slate-500">Attempts</dt>
          <dd className="text-slate-900">{fax.attempts}</dd>
        </dl>
        {(fax.jobId || fax.hasReceipt) && (
          <div className="flex flex-wrap gap-3 text-sm">
            {fax.jobId && <a href={`${pdfUrl}?doc=faxed`} target="_blank" rel="noopener" className="text-accent hover:underline">Form as faxed</a>}
            {fax.hasReceipt && <a href={`${pdfUrl}?doc=receipt`} target="_blank" rel="noopener" className="text-accent hover:underline">Fax transmission receipt</a>}
          </div>
        )}

        {faxRefusal && <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">{faxRefusal}</p>}
        {!faxRefusal && needsReason && (
          <div className="space-y-2">
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{needsReason}</p>
            <label htmlFor="refax-reason" className="block text-xs font-medium text-slate-600">Reason for sending again (kept in the internal notes)</label>
            <textarea
              id="refax-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        )}
        <button
          type="button"
          onClick={sendFax}
          disabled={faxDisabled}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy === "fax" && <Loader2 className="h-4 w-4 animate-spin" />}
          {needsReason ? "Fax to IRS again" : "Fax to IRS"}
        </button>
      </div>

      {notice && <p role="status" className="text-sm text-emerald-700">{notice}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
