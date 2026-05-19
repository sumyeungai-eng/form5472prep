"use client";

import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Landmark, Loader2 } from "lucide-react";
import type { CategorizedTransaction } from "@/lib/bank/categorize";

// Renders a single "Connect bank with Plaid" button. On click we mint a
// link_token, hand it to Plaid Link (their hosted modal), and on success
// exchange the public_token for an access_token server-side, then pull the
// tax-year's transactions back into the wizard via onTransactions().

export function PlaidConnectButton({
  filingId,
  taxYear,
  ownerName: _ownerName,
  disabled,
  enabled = true,
  onTransactions,
}: {
  filingId: string;
  taxYear: number;
  ownerName: string | null;
  disabled?: boolean;
  // When false, render the button in a disabled visual state and show the
  // "not configured" message inline — without making the user click first.
  enabled?: boolean;
  onTransactions: (args: {
    institutionName: string | null;
    transactions: CategorizedTransaction[];
  }) => void;
}) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the link_token lazily — only when the user clicks Connect.
  const ensureLinkToken = useCallback(async () => {
    if (linkToken) return linkToken;
    const res = await fetch("/api/plaid/link-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filingId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `link-token failed: ${res.status}`);
    }
    const { linkToken: t } = await res.json();
    setLinkToken(t);
    return t as string;
  }, [filingId, linkToken]);

  const onSuccess = useCallback(
    async (publicToken: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/plaid/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filingId, publicToken, taxYear }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `exchange failed: ${res.status}`);
        }
        const data = await res.json();
        onTransactions({
          institutionName: data.institutionName ?? null,
          transactions: data.transactions ?? [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Plaid exchange failed");
      } finally {
        setLoading(false);
      }
    },
    [filingId, taxYear, onTransactions],
  );

  // usePlaidLink requires a non-null token at hook init time, but we want to
  // mint one only on click. Workaround: keep a placeholder until we have one,
  // then re-init the hook by passing the real token.
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken) => onSuccess(publicToken),
  });

  // When the user clicks Connect and we just received a fresh token,
  // wait until Plaid Link is ready then open it.
  const [shouldOpen, setShouldOpen] = useState(false);
  useEffect(() => {
    if (shouldOpen && ready && linkToken) {
      setShouldOpen(false);
      open();
    }
  }, [shouldOpen, ready, linkToken, open]);

  async function handleClick() {
    setError(null);
    setLoading(true);
    try {
      await ensureLinkToken();
      setShouldOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't connect to Plaid");
    } finally {
      setLoading(false);
    }
  }

  if (!enabled) {
    return (
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          disabled
          title="Plaid isn't configured on this server"
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
        >
          <Landmark className="h-4 w-4" />
          Connect bank with Plaid
          <span className="ml-1 text-[10px] uppercase tracking-wide bg-slate-200 text-slate-600 rounded px-1.5 py-0.5">
            Unavailable
          </span>
        </button>
        <p className="text-xs text-amber-700">
          Plaid isn&apos;t configured on this server. Set <code>PLAID_CLIENT_ID</code> +{" "}
          <code>PLAID_SECRET</code> in your <code>.env.local</code> to enable bank connections.
        </p>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="inline-flex items-center gap-2.5 rounded-lg bg-accent px-5 py-3 text-base font-semibold text-white shadow-md shadow-accent/30 hover:bg-accent-700 hover:shadow-lg hover:shadow-accent/40 transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Landmark className="h-5 w-5" />
        )}
        {loading ? "Opening Plaid…" : "Connect bank with Plaid"}
        {!loading && (
          <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
            Fastest
          </span>
        )}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
