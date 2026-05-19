"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Renders Google's official "Sign in with Google" button via the GIS (Google
// Identity Services) script. When the user picks an account, Google gives us
// a credential (JWT) which we POST to /api/auth/google for server-side
// verification.
//
// If NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID is unset we render a disabled
// placeholder so users see exactly what's missing — same pattern as Plaid.

// Minimal typing for the GIS surface we use.
type GsiCallback = (resp: { credential: string }) => void;
interface GsiAccountsId {
  initialize(opts: { client_id: string; callback: GsiCallback }): void;
  renderButton(
    parent: HTMLElement,
    opts: { theme?: string; size?: string; width?: number | string; text?: string; shape?: string; logo_alignment?: string },
  ): void;
}
declare global {
  interface Window {
    google?: { accounts: { id: GsiAccountsId } };
  }
}

export function GoogleLoginButton({
  onCredential,
}: {
  onCredential: (credential: string) => void;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!clientId || !scriptLoaded || !window.google || !buttonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp) => onCredential(resp.credential),
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
    });
  }, [clientId, scriptLoaded, onCredential]);

  if (!clientId) {
    return (
      <div className="flex flex-col gap-1.5">
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-2 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-400 cursor-not-allowed"
        >
          <GoogleGlyph muted />
          Continue with Google
          <span className="ml-1 text-[10px] uppercase tracking-wide bg-slate-200 text-slate-600 rounded px-1.5 py-0.5">
            Unavailable
          </span>
        </button>
        <p className="text-[11px] text-amber-700 text-center">
          Set <code>NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID</code> in <code>.env.local</code> to enable.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="flex justify-center">
        <div ref={buttonRef} />
      </div>
    </>
  );
}

// Inline SVG of the Google "G" so the disabled fallback button looks right
// without depending on the GIS script being loaded.
function GoogleGlyph({ muted = false }: { muted?: boolean }) {
  const op = muted ? "0.5" : "1";
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden style={{ opacity: op }}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}
