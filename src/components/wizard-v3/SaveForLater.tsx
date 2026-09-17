"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Save, X } from "lucide-react";
import type { SaveForLaterMode } from "@/lib/saveForLater";

// Secondary-button look shared by every mode of this control (partner/user
// exit link, and the anonymous "Save for later" toggle button), per spec.
const BUTTON_CLASS =
  "inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50";

const REASSURANCE = "Your progress is saved as you complete each step.";

// Renders in the wizard chrome for all three audiences (see saveForLaterMode
// in @/lib/saveForLater): a partner or signed-in customer gets a plain link
// out (no email flow — their identity already gives them a way back in); an
// anonymous customer gets a button that reveals an inline "email me a link"
// panel, since there is no dashboard for them to be sent to.
export function SaveForLater({
  filingId,
  mode,
  defaultEmail,
}: {
  filingId: string;
  mode: SaveForLaterMode;
  defaultEmail?: string | null;
}) {
  if (mode.kind === "anonymous") {
    return <AnonymousSaveForLater filingId={filingId} label={mode.label} defaultEmail={defaultEmail} />;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={mode.href} className={BUTTON_CLASS}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {mode.label}
      </Link>
      <span className="text-xs text-slate-500">{REASSURANCE}</span>
    </div>
  );
}

type SubmitStatus = "idle" | "submitting" | "sent" | "error";

function AnonymousSaveForLater({
  filingId,
  label,
  defaultEmail,
}: {
  filingId: string;
  label: string;
  defaultEmail?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch(`/api/filings/${filingId}/save-for-later`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setStatus("error");
        setError("Too many requests. Try again in a few minutes.");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        setError("Something went wrong. Please try again.");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => setOpen(true)} className={BUTTON_CLASS}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {label}
        </button>
        <span className="text-xs text-slate-500">{REASSURANCE}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-slate-500">{REASSURANCE}</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Dismiss"
          className="shrink-0 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {status === "sent" ? (
        <p className="mt-2 text-sm font-medium text-slate-700">
          Link sent. Check your inbox to continue this filing.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-slate-700">
            Your answers so far are already saved. Enter your email and we will send you a link to
            come back to this filing.
          </p>
          <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="block min-w-[200px] flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className={`${BUTTON_CLASS} disabled:opacity-50`}
            >
              {status === "submitting" ? "Sending..." : "Email me a link"}
            </button>
          </form>
          <div className="mt-2 min-h-[1.25rem] text-sm text-red-600">{status === "error" ? error : null}</div>
        </>
      )}
    </div>
  );
}
