"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, Pencil, CheckCircle2, Copy, Archive, ArchiveRestore, UserPlus } from "lucide-react";

const TONE: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  emerald: "bg-emerald-100 text-emerald-800",
  red: "bg-red-100 text-red-800",
};

// Statuses where the unsigned PDF exists and no signature has been captured —
// i.e. it's the right time to send/copy the client's sign link.
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
  archived,
  clientInvitedAgo,
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
  archived: boolean;
  clientInvitedAgo: string | null;
}) {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState(clientEmail ?? "");
  const [showSend, setShowSend] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCopy, setShowCopy] = useState(false);
  const [copyEmailInput, setCopyEmailInput] = useState(clientEmail ?? "");
  const [copying, setCopying] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copyConfirmed, setCopyConfirmed] = useState(false);

  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const [showClientSend, setShowClientSend] = useState(false);
  const [clientSendEmailInput, setClientSendEmailInput] = useState(clientEmail ?? "");
  const [clientSending, setClientSending] = useState(false);
  const [clientSent, setClientSent] = useState(false);
  const [clientSendError, setClientSendError] = useState<string | null>(null);

  const [showClientCopy, setShowClientCopy] = useState(false);
  const [clientCopyEmailInput, setClientCopyEmailInput] = useState(clientEmail ?? "");
  const [clientCopying, setClientCopying] = useState(false);
  const [clientCopyError, setClientCopyError] = useState<string | null>(null);
  const [clientCopiedLink, setClientCopiedLink] = useState<string | null>(null);
  const [clientCopyConfirmed, setClientCopyConfirmed] = useState(false);

  const isDraft = status === "DRAFT";
  const canSendSignLink = CAN_SEND_SIGN_LINK.includes(status) && !hasSignature;
  const canInviteClient = isDraft && !archived;

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

  async function copySignLink() {
    if (!copyEmailInput.includes("@")) {
      setCopyError("Enter a valid client email");
      return;
    }
    setCopying(true);
    setCopyError(null);
    try {
      const res = await fetch(`/api/partner/filings/${id}/sign-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: copyEmailInput }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not create link");
      }
      const body = await res.json();
      const url: string = body.url;
      try {
        await navigator.clipboard.writeText(url);
        setCopyConfirmed(true);
        setCopiedLink(null);
        setTimeout(() => setCopyConfirmed(false), 4000);
      } catch {
        // Clipboard write failed (e.g. no permission) — fall back to a
        // readonly input the user can select and copy manually.
        setCopiedLink(url);
      }
    } catch (err) {
      setCopyError(err instanceof Error ? err.message : "Could not create link");
    } finally {
      setCopying(false);
    }
  }

  async function sendClientLink() {
    if (!clientSendEmailInput.includes("@")) {
      setClientSendError("Enter a valid client email");
      return;
    }
    setClientSending(true);
    setClientSendError(null);
    try {
      const res = await fetch(`/api/partner/filings/${id}/send-client-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clientSendEmailInput }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not send");
      }
      setClientSent(true);
      setShowClientSend(false);
      router.refresh();
    } catch (err) {
      setClientSendError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setClientSending(false);
    }
  }

  async function copyClientLink() {
    if (!clientCopyEmailInput.includes("@")) {
      setClientCopyError("Enter a valid client email");
      return;
    }
    setClientCopying(true);
    setClientCopyError(null);
    try {
      const res = await fetch(`/api/partner/filings/${id}/client-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clientCopyEmailInput }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not create link");
      }
      const body = await res.json();
      const url: string = body.url;
      try {
        await navigator.clipboard.writeText(url);
        setClientCopyConfirmed(true);
        setClientCopiedLink(null);
        setTimeout(() => setClientCopyConfirmed(false), 4000);
      } catch {
        // Clipboard write failed (e.g. no permission) — fall back to a
        // readonly input the user can select and copy manually.
        setClientCopiedLink(url);
      }
      router.refresh();
    } catch (err) {
      setClientCopyError(err instanceof Error ? err.message : "Could not create link");
    } finally {
      setClientCopying(false);
    }
  }

  async function toggleArchive(nextArchived: boolean) {
    setArchiving(true);
    setArchiveError(null);
    try {
      const res = await fetch(`/api/partner/filings/${id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: nextArchived }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not update");
      }
      router.refresh();
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : "Could not update");
    } finally {
      setArchiving(false);
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
          {clientInvitedAgo && (
            <p className="text-xs text-slate-400 mt-1">Client invited {clientInvitedAgo}</p>
          )}
        </div>
        <span
          className={`flex-none text-xs font-medium rounded-full px-2.5 py-1 ${TONE[statusTone]}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isDraft && !archived && (
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

        {clientSent && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Invite sent
          </span>
        )}

        {canInviteClient && !clientSent && !showClientSend && (
          <button
            type="button"
            onClick={() => setShowClientSend(true)}
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Invite client to fill in
          </button>
        )}

        {canInviteClient && !showClientCopy && (
          <button
            type="button"
            onClick={() => setShowClientCopy(true)}
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy client link
          </button>
        )}

        {clientCopyConfirmed && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Link copied
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

        {canSendSignLink && !showCopy && (
          <button
            type="button"
            onClick={() => setShowCopy(true)}
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy sign link
          </button>
        )}

        {copyConfirmed && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Link copied
          </span>
        )}

        {isDraft && !archived && (
          <button
            type="button"
            onClick={() => toggleArchive(true)}
            disabled={archiving}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 hover:underline disabled:opacity-50"
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
          </button>
        )}

        {archived && (
          <button
            type="button"
            onClick={() => toggleArchive(false)}
            disabled={archiving}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 hover:underline disabled:opacity-50"
          >
            <ArchiveRestore className="h-3.5 w-3.5" />
            Restore
          </button>
        )}
      </div>

      {archiveError && <p className="mt-2 text-xs text-red-600">{archiveError}</p>}

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

      {showCopy && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Client email — used to bind the sign link before you paste it into your own email
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              value={copyEmailInput}
              onChange={(e) => setCopyEmailInput(e.target.value)}
              placeholder="client@example.com"
              className="flex-1 min-w-[200px] text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
            <button
              type="button"
              onClick={copySignLink}
              disabled={copying}
              className="text-sm font-medium px-3 py-2 rounded-md bg-accent text-white hover:opacity-90 disabled:opacity-50"
            >
              {copying ? "Creating…" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCopy(false);
                setCopyError(null);
                setCopiedLink(null);
              }}
              className="text-sm px-3 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
          {copyError && <p className="mt-2 text-xs text-red-600">{copyError}</p>}
          {copiedLink && (
            <div className="mt-2">
              <p className="text-xs text-slate-600 mb-1">
                Couldn&apos;t copy automatically — select and copy this link:
              </p>
              <input
                type="text"
                readOnly
                value={copiedLink}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 bg-white"
              />
            </div>
          )}
        </div>
      )}

      {showClientSend && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Client email — they&apos;ll get a secure link to fill in this filing and upload documents
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              value={clientSendEmailInput}
              onChange={(e) => setClientSendEmailInput(e.target.value)}
              placeholder="client@example.com"
              className="flex-1 min-w-[200px] text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
            <button
              type="button"
              onClick={sendClientLink}
              disabled={clientSending}
              className="text-sm font-medium px-3 py-2 rounded-md bg-accent text-white hover:opacity-90 disabled:opacity-50"
            >
              {clientSending ? "Sending…" : "Send invite"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowClientSend(false);
                setClientSendError(null);
              }}
              className="text-sm px-3 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
          {clientSendError && <p className="mt-2 text-xs text-red-600">{clientSendError}</p>}
        </div>
      )}

      {showClientCopy && (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Client email — used to bind the client link before you paste it into your own message
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              value={clientCopyEmailInput}
              onChange={(e) => setClientCopyEmailInput(e.target.value)}
              placeholder="client@example.com"
              className="flex-1 min-w-[200px] text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
            <button
              type="button"
              onClick={copyClientLink}
              disabled={clientCopying}
              className="text-sm font-medium px-3 py-2 rounded-md bg-accent text-white hover:opacity-90 disabled:opacity-50"
            >
              {clientCopying ? "Creating…" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowClientCopy(false);
                setClientCopyError(null);
                setClientCopiedLink(null);
              }}
              className="text-sm px-3 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-white"
            >
              Cancel
            </button>
          </div>
          {clientCopyError && <p className="mt-2 text-xs text-red-600">{clientCopyError}</p>}
          {clientCopiedLink && (
            <div className="mt-2">
              <p className="text-xs text-slate-600 mb-1">
                Couldn&apos;t copy automatically — select and copy this link:
              </p>
              <input
                type="text"
                readOnly
                value={clientCopiedLink}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 bg-white"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
