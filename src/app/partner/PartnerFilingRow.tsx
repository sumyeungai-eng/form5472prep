"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Pencil, CheckCircle2 } from "lucide-react";

const TONE: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  emerald: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
};

// Statuses where the unsigned PDF exists and no signature has been captured —
// i.e. it's the right time to send the client their sign link.
const CAN_SEND_SIGN_LINK = ["PDF_GENERATED", "PAID"];

export function PartnerFilingRow({
  id,
  llcName,
  clientEmail,
  taxYears,
  tierLabel,
  updatedAt,
  statusLabel,
  statusTone,
  status,
  hasSignature,
}: {
  id: string;
  llcName: string | null;
  clientEmail: string | null;
  taxYears: number[];
  tierLabel: string;
  updatedAt: string;
  statusLabel: string;
  statusTone: "slate" | "amber" | "blue" | "emerald" | "red";
  status: string;
  hasSignature: boolean;
}) {
  const [emailInput, setEmailInput] = useState(clientEmail ?? "");
  const [showSend, setShowSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDraft = status === "DRAFT";
  const canSendSignLink = CAN_SEND_SIGN_LINK.includes(status) && !hasSignature;

  async function sendSignLink() {
    if (!emailInput.includes("@")) {
      setError("Enter a valid client email");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/partner/filings/${id}/send-sign-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not send");
      }
      setSent(true);
      setShowSend(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate">
            {llcName ?? <em className="text-slate-400">Unnamed filing</em>}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">
            {taxYears.length > 0 ? `Tax years ${taxYears.join(", ")}` : "No years selected"}
            {" · "}
            {tierLabel}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {clientEmail ? `Client: ${clientEmail} · ` : ""}Updated {updatedAt}
          </p>
        </div>
        <span
          className={`flex-none text-xs font-medium rounded-full px-2.5 py-1 ${TONE[statusTone]}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isDraft && (
          <Link
            href={`/filings/${id}/edit`}
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" />
            Continue editing
          </Link>
        )}

        {!isDraft && (
          <Link
            href={`/filings/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 hover:underline"
          >
            View filing
          </Link>
        )}

        {hasSignature && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Signed by client
          </span>
        )}

        {sent && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sign link sent to {emailInput}
          </span>
        )}

        {canSendSignLink && !sent && !showSend && (
          <button
            type="button"
            onClick={() => setShowSend(true)}
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            <Send className="h-3.5 w-3.5" />
            Send sign link to client
          </button>
        )}
      </div>

      {showSend && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Client email — they&apos;ll get a secure link to review &amp; sign this filing
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="client@example.com"
              className="flex-1 min-w-[200px] text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
            <button
              type="button"
              onClick={sendSignLink}
              disabled={sending}
              className="text-sm font-medium px-3 py-2 rounded-md bg-accent text-white hover:opacity-90 disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSend(false);
                setError(null);
              }}
              className="text-sm px-3 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
