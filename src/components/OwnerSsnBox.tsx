"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeSsn, validateSsn } from "@/lib/crypto/ssn";

// Masked text input rather than type="password": password managers and
// browsers then never offer to save the SSN as a password. Never prefilled.
const MASKED_INPUT = { WebkitTextSecurity: "disc" } as React.CSSProperties;

// The client's secure SSN box on the order page (spec
// docs/reviews/2026-10-15-ssn-capture-spec.md S1/S4). The full number is never
// sent to this component and never prefilled: the server only ever tells it
// the last four digits and when it was added. Inputs are cleared after every
// save attempt so the number does not linger in the page.

export type OwnerSsnBoxProps = {
  filingId: string;
  last4: string | null;
  submittedAt: string | null;
  // An admin asked for it (ownerSsnRequestedAt) — highlight while none is on file.
  requested: boolean;
  // FAXED / CONFIRMED: the package has gone to the IRS.
  locked: boolean;
  // PII_ENCRYPTION_KEY is set on the server.
  configured: boolean;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function OwnerSsnBox({ filingId, last4: initialLast4, submittedAt: initialSubmittedAt, requested, locked, configured }: OwnerSsnBoxProps) {
  const [last4, setLast4] = useState(initialLast4);
  const [submittedAt, setSubmittedAt] = useState(initialSubmittedAt);
  const [editing, setEditing] = useState(false);
  const [ssn, setSsn] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onFile = !!last4;
  const highlight = requested && !onFile && !locked;
  const showForm = configured && !locked && (!onFile || editing);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const checked = validateSsn(ssn);
    if (!checked.ok) {
      setError(checked.error);
      return;
    }
    if (normalizeSsn(confirm) !== checked.ssn) {
      setConfirm("");
      setError("The two numbers don't match. Please type your SSN again in both boxes.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/filings/${filingId}/ssn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ssn, confirm }),
        cache: "no-store",
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        last4?: string;
        submittedAt?: string;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.last4 || !body.submittedAt) {
        setError(body.error || "We couldn't save your SSN. Please try again, or contact support.");
        return;
      }
      setLast4(body.last4);
      setSubmittedAt(body.submittedAt);
      setEditing(false);
      setSaved(true);
    } catch {
      setError("We couldn't reach the server. Please check your connection and try again.");
    } finally {
      setSsn("");
      setConfirm("");
      setSaving(false);
    }
  }

  return (
    <section
      id="ssn"
      className={`scroll-mt-24 rounded-lg border p-5 ${highlight ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}
      aria-labelledby="ssn-heading"
    >
      <h2 id="ssn-heading" className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
        <Lock className="h-4 w-4 text-slate-500" aria-hidden="true" />
        U.S. Social Security Number — only if you have one
      </h2>
      {highlight && (
        <p className="mt-2 text-sm font-medium text-amber-900">
          We asked for this: please add your SSN below so we can finish your forms.
        </p>
      )}
      <p className="mt-1 text-sm text-slate-600">
        Most foreign owners don&apos;t have an SSN. If you don&apos;t, you can skip this. If you do, add it here and we&apos;ll
        put it on your Form 5472 as your U.S. identifying number. It is encrypted as soon as you save it and is used
        only on your IRS forms. Please don&apos;t send it to us by email.
      </p>

      {onFile && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm text-slate-900">
            SSN on file ending <span className="font-mono">{last4}</span>
            {submittedAt ? ` — added ${formatDate(submittedAt)}` : ""}
          </p>
          {configured && !locked && !editing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(true);
                setSaved(false);
                setError(null);
              }}
            >
              Replace
            </Button>
          )}
        </div>
      )}
      {saved && <p className="mt-2 text-sm text-emerald-700">Saved. Thank you — we&apos;ll use it on your forms.</p>}

      {locked && (
        <p className="mt-3 text-sm text-slate-600">
          This filing has already been sent to the IRS — please contact support if something needs changing.
        </p>
      )}
      {!configured && !locked && (
        <p className="mt-3 text-sm text-slate-600">
          Secure entry is temporarily unavailable — please contact support.
        </p>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="mt-3 space-y-3" autoComplete="off">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-slate-700">{onFile ? "New SSN" : "SSN"}</span>
              <input
                type="text"
                style={MASKED_INPUT}
                name="owner-ssn-entry"
                autoComplete="off"
                inputMode="numeric"
                spellCheck={false}
                maxLength={20}
                placeholder="123-45-6789"
                data-1p-ignore
                data-lpignore="true"
                value={ssn}
                onChange={(e) => setSsn(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-slate-700">Type it again</span>
              <input
                type="text"
                style={MASKED_INPUT}
                name="owner-ssn-confirm"
                autoComplete="off"
                inputMode="numeric"
                spellCheck={false}
                maxLength={20}
                data-1p-ignore
                data-lpignore="true"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                required
              />
            </label>
          </div>
          {error && (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Saving…" : onFile ? "Save new SSN" : "Save SSN securely"}
            </Button>
            {onFile && editing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={saving}
                onClick={() => {
                  setEditing(false);
                  setSsn("");
                  setConfirm("");
                  setError(null);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
