"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminTestOrderPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createTestFiling() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/test-filing", { method: "POST" });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }
      const { editUrl } = (await res.json()) as { id: string; editUrl: string };
      startTransition(() => router.push(editUrl));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create test filing");
      setCreating(false);
    }
  }

  const busy = creating || pending;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">$0 Test Order</h1>
        <p className="mt-2 text-sm text-slate-600">
          Admin-only. Creates a DRAFT filing with the internal{" "}
          <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">tier=test</code>{" "}
          flag, hands you the wizard, and skips Stripe at checkout. Exercises the
          full post-payment flow (PDF generation, AI validation, sign link
          email, fax) end-to-end without any money moving.
        </p>
      </div>

      <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside bg-slate-50 border border-slate-200 rounded-md p-4">
        <li>Click <strong>Start test order</strong> below — opens the wizard at /filings/[id]/edit.</li>
        <li>Fill in any test LLC + owner data you want.</li>
        <li>At Review step click <strong>Pay $0</strong> — bypasses Stripe and marks the filing PAID instantly.</li>
        <li>PDF auto-generates + AI validation runs + sign-link email sends to the email you put in Review step (use your own).</li>
        <li>Sign in the portal, admin clicks <strong>Send fax to IRS</strong> from /admin/filings if you want to test the fax path too.</li>
      </ol>

      <button
        type="button"
        onClick={createTestFiling}
        disabled={busy}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating…
          </>
        ) : (
          "Start test order →"
        )}
      </button>

      {error && (
        <div className="text-sm px-3 py-2 rounded-md bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <p className="text-xs text-slate-500 pt-4 border-t border-slate-200">
        Test filings show up in /admin/filings tagged with{" "}
        <code className="font-mono">funnelSource = admin_test</code>. Safe to delete
        from there when done.
      </p>
    </div>
  );
}
