"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isPortalHost } from "@/lib/partner/portalHost";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [portalHost, setPortalHost] = useState(false);

  useEffect(() => {
    setPortalHost(isPortalHost(window.location.host));
  }, []);

  useEffect(() => {
    fetch("/api/client-error", {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ digest: error.digest, path: location.pathname }),
    }).catch(() => {});
    // Report once when this boundary is displayed, including via GlobalError.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" aria-labelledby="error-heading">
        <h1 id="error-heading" className="text-xl font-semibold text-slate-900">Something went wrong loading this page.</h1>
        <p className="mt-3 text-sm text-slate-600">Your filing and documents are safe.</p>
        {portalHost ? (
          <p className="mt-3 text-sm text-slate-600">Please try again, or contact the provider who sent you this link.</p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="button" onClick={reset} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
            Try again
          </button>
          {!portalHost ? <Link href="/dashboard" className="text-sm font-medium text-accent underline">Back to dashboard</Link> : null}
        </div>
        {!portalHost ? <p className="mt-6 text-sm text-slate-600 break-words">
          Email <a href="mailto:support@form5472prep.com" className="text-accent underline">support@form5472prep.com</a>
          {error.digest ? <> and quote reference <span className="font-mono">{error.digest}</span></> : null}.
        </p> : null}
      </section>
    </div>
  );
}
