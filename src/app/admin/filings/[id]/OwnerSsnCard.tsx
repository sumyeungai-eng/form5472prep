"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { maskSsn, normalizeSsn, validateSsn } from "@/lib/crypto/ssn";

// Masked text input rather than type="password": password managers and
// browsers then never offer to save the SSN as a password. Never prefilled.
const MASKED_INPUT = { WebkitTextSecurity: "disc" } as React.CSSProperties;

// Admin view of the owner's SSN (spec docs/reviews/2026-10-15-ssn-capture-spec.md).
// The page renders only the masked form; the number reaches this component
// only as the response to an explicit Reveal click (change-logged server-side)
// and is held in component state for REVEAL_MS, never in the page HTML.

const REVEAL_MS = 60_000;

export type OwnerSsnCardProps = {
  filingId: string;
  last4: string | null;
  submittedAt: string | null;
  // "client" | "admin" (display only — who typed it in).
  submittedBy: "client" | "admin" | null;
  requestedAt: string | null;
  // PII_ENCRYPTION_KEY set on the server.
  configured: boolean;
  // "open" | "locked" (FAXED/CONFIRMED) | "not_paid" (DRAFT).
  entryState: "open" | "locked" | "not_paid";
  customerEmail: string | null;
  // The SSN was saved after the package with the client was reviewed/signed,
  // so that package does not show it (retryFax refuses until it is replaced).
  addedAfterPackage?: boolean;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type Msg = { kind: "ok" | "err"; text: string } | null;

async function postAction(filingId: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/admin/filings/${filingId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, json };
}

export function OwnerSsnCard({
  filingId,
  last4,
  submittedAt,
  submittedBy,
  requestedAt,
  configured,
  entryState,
  customerEmail,
  addedAfterPackage = false,
}: OwnerSsnCardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<null | "reveal" | "request" | "save">(null);
  const [revealed, setRevealed] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [ssn, setSsn] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  function hide() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
    setRevealed(null);
  }

  async function reveal() {
    setBusy("reveal");
    setMsg(null);
    try {
      const { ok, json } = await postAction(filingId, { action: "revealOwnerSsn" });
      if (!ok || typeof json.ssn !== "string") {
        setMsg({ kind: "err", text: String(json.error ?? "Could not reveal the SSN.") });
        return;
      }
      setRevealed(json.ssn);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setRevealed(null), REVEAL_MS);
    } catch {
      setMsg({ kind: "err", text: "Network error — could not reveal the SSN." });
    } finally {
      setBusy(null);
    }
  }

  async function requestFromClient() {
    if (!window.confirm(`Email ${customerEmail ?? "the client"} a sign-in link to add their SSN on their order page?`)) return;
    setBusy("request");
    setMsg(null);
    try {
      const { ok, json } = await postAction(filingId, { action: "requestOwnerSsn" });
      if (!ok) {
        setMsg({ kind: "err", text: String(json.error ?? "Could not send the request.") });
        return;
      }
      setMsg({ kind: "ok", text: `Request sent to ${String(json.emailTo ?? customerEmail ?? "the client")}.` });
      startTransition(() => router.refresh());
    } catch {
      setMsg({ kind: "err", text: "Network error — the request was not sent." });
    } finally {
      setBusy(null);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const checked = validateSsn(ssn);
    if (!checked.ok) {
      setMsg({ kind: "err", text: checked.error });
      return;
    }
    if (normalizeSsn(confirm) !== checked.ssn) {
      setConfirm("");
      setMsg({ kind: "err", text: "The two numbers don't match. Type the SSN again in both boxes." });
      return;
    }
    setBusy("save");
    try {
      const { ok, json } = await postAction(filingId, { action: "setOwnerSsn", ssn, confirm });
      if (!ok) {
        setMsg({ kind: "err", text: String(json.error ?? "Could not save the SSN.") });
        return;
      }
      hide();
      setFormOpen(false);
      const rerun = json.preflightRerun as { ran?: boolean; status?: string } | undefined;
      setMsg({
        kind: "ok",
        text:
          `Saved ${maskSsn(String(json.last4 ?? ""))}. Regenerate the package so lines 4b(1)/8b(1) show it.` +
          (rerun?.ran ? ` Pre-flight re-run: ${rerun.status}.` : ""),
      });
      startTransition(() => router.refresh());
    } catch {
      setMsg({ kind: "err", text: "Network error — the SSN was not saved." });
    } finally {
      setSsn("");
      setConfirm("");
      setBusy(null);
    }
  }

  const onFile = !!last4;
  const canEdit = configured && entryState === "open";

  return (
    <div className="space-y-3 text-sm">
      <p className="text-slate-900">
        {onFile ? (
          <>
            SSN: on file <span className="font-mono">{revealed ?? maskSsn(last4)}</span>
            {submittedAt && (
              <span className="text-slate-500">
                {" "}
                (added by {submittedBy === "client" ? "client" : "admin"} {formatDate(submittedAt)})
              </span>
            )}
          </>
        ) : (
          <>SSN: not on file</>
        )}
      </p>
      {addedAfterPackage && entryState === "open" && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          The SSN was added after this package was built, so it may not show it and the fax is held. Regenerate the
          package with the SSN, then upload it as the reviewed PDF (the client checks and signs again) or, if the client
          already signed the rebuilt package, upload that signed PDF. If the package being faxed does show the SSN,
          confirm that in the fax section with a reason.
        </p>
      )}
      {requestedAt && (
        <p className="text-slate-500">Client was asked for it on {formatDate(requestedAt)}.</p>
      )}
      {!configured && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
          PII_ENCRYPTION_KEY is not set (or is not base64 of 32 bytes), so SSNs cannot be stored or shown and the
          client&apos;s box says secure entry is unavailable. Set it in Vercel (<code>openssl rand -base64 32</code>).
        </p>
      )}
      {entryState === "locked" && (
        <p className="text-slate-500">Faxed to the IRS — the SSN can no longer be changed.</p>
      )}

      <div className="flex flex-wrap gap-2">
        {onFile && configured && (
          revealed ? (
            <button
              type="button"
              onClick={hide}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
            >
              Hide
            </button>
          ) : (
            <button
              type="button"
              onClick={reveal}
              disabled={busy !== null}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
              title="Shows the full number for 60 seconds. Every reveal is recorded in the change log."
            >
              {busy === "reveal" && <Loader2 className="h-3 w-3 animate-spin" />}
              Reveal
            </button>
          )
        )}
        {canEdit && customerEmail && (
          <button
            type="button"
            onClick={requestFromClient}
            disabled={busy !== null}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === "request" && <Loader2 className="h-3 w-3 animate-spin" />}
            Ask client for SSN
          </button>
        )}
        {canEdit && !formOpen && (
          <button
            type="button"
            onClick={() => {
              setFormOpen(true);
              setMsg(null);
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            {onFile ? "Replace SSN" : "Enter SSN"}
          </button>
        )}
      </div>

      {canEdit && formOpen && (
        <form onSubmit={save} autoComplete="off" className="space-y-2 rounded-md border border-slate-200 p-3">
          <p className="text-xs text-slate-500">
            Only for a number the client sent another way. It is stored encrypted and change-logged (masked).
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              type="text"
              style={MASKED_INPUT}
              name="admin-owner-ssn"
              autoComplete="off"
              inputMode="numeric"
              spellCheck={false}
              maxLength={20}
              placeholder="SSN"
              aria-label="SSN"
              data-1p-ignore
              data-lpignore="true"
              value={ssn}
              onChange={(e) => setSsn(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm"
              required
            />
            <input
              type="text"
              style={MASKED_INPUT}
              name="admin-owner-ssn-confirm"
              autoComplete="off"
              inputMode="numeric"
              spellCheck={false}
              maxLength={20}
              placeholder="Type it again"
              aria-label="Confirm SSN"
              data-1p-ignore
              data-lpignore="true"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 font-mono text-sm"
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy !== null}
              className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {busy === "save" && <Loader2 className="h-3 w-3 animate-spin" />}
              Save SSN
            </button>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setSsn("");
                setConfirm("");
              }}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {msg && (
        <p className={msg.kind === "ok" ? "text-emerald-700" : "text-red-700"} role={msg.kind === "err" ? "alert" : undefined}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
