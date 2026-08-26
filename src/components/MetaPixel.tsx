"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { META_CONSENT_KEY, META_PIXEL_ID } from "@/lib/analytics/meta";

type Consent = "granted" | "denied" | null;

function initializePixel(): void {
  if (!META_PIXEL_ID || window.__form5472MetaPixelInitialized) return;

  const fbq = function (...args: unknown[]) {
    const queue = fbq as unknown as {
      callMethod?: (...values: unknown[]) => void;
      queue?: unknown[][];
    };
    if (typeof queue.callMethod === "function") {
      queue.callMethod(...args);
    } else {
      (queue.queue ||= []).push(args);
    }
  };
  Object.assign(fbq, { push: fbq, loaded: true, version: "2.0", queue: [] });
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq("consent", "grant");
  window.fbq("init", META_PIXEL_ID);
  window.__form5472MetaPixelInitialized = true;
}

export function MetaPixel() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);

  useEffect(() => {
    if (!META_PIXEL_ID) return;
    const saved = window.localStorage.getItem(META_CONSENT_KEY);
    if (saved === "granted" || saved === "denied") setConsent(saved);
  }, []);

  useEffect(() => {
    if (consent !== "granted") return;
    initializePixel();
    window.fbq?.("track", "PageView");
  }, [consent, pathname]);

  if (!META_PIXEL_ID || consent !== null) return null;

  function choose(value: Exclude<Consent, null>) {
    window.localStorage.setItem(META_CONSENT_KEY, value);
    document.cookie = `${META_CONSENT_KEY}=${value}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
    setConsent(value);
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-3xl items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xl sm:text-sm">
      <p className="min-w-0 flex-1 leading-tight text-slate-700">
        Optional Meta advertising cookies help us measure ad performance. We never send tax or bank information.{" "}
        <Link href="/privacy" className="font-medium text-blue-900 underline">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => choose("denied")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:text-sm"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => choose("granted")}
          className="rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 sm:text-sm"
        >
          Allow
        </button>
      </div>
    </div>
  );
}
