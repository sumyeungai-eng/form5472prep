// Google Ads conversion tracking helper.
//
// Loader (`AW-18127544007`) is injected once site-wide via
// src/app/layout.tsx; this file just dispatches the conversion event.
// Safe to call before the loader has finished initialising — gtag's own
// internal queue swallows pre-load calls and replays them.

export const GOOGLE_ADS_TAG_ID = "AW-18127544007";
export const GOOGLE_ADS_CONVERSION_LEAD = "AW-18127544007/TFriCN3piLEcEMe98cNd";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type FireConversionOptions = {
  // Optional callback fired after the conversion ping leaves the browser
  // (or after a ~1s timeout if it stalls). Use this to gate a navigation
  // so the conversion has time to dispatch before the page unloads.
  onDone?: () => void;
  // Per-conversion override (we currently only have the lead-submit
  // conversion, but this lets us add purchase/sign-up conversions later
  // without touching call sites).
  sendTo?: string;
  // Optional value passed through to gtag (rarely used for lead events;
  // useful for purchase conversions later).
  value?: number;
  currency?: string;
};

// Fire the "Form 5472 Lead" Google Ads conversion. Always safe to call:
//   - SSR guard (typeof window) so it no-ops on the server
//   - Tolerant of gtag being absent (loader blocked by ad-blocker, cookie
//     consent declined, etc.) — onDone still fires so the caller's redirect
//     isn't blocked
export function fireLeadConversion(opts: FireConversionOptions = {}): void {
  const { onDone, sendTo = GOOGLE_ADS_CONVERSION_LEAD, value, currency } = opts;
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    onDone?.();
    return;
  }
  // Watchdog: if gtag never invokes event_callback (network block, slow
  // load, etc.), don't leave the caller hanging forever. 1.2s matches
  // Google's recommended cap.
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onDone?.();
  };
  window.setTimeout(finish, 1200);
  const params: Record<string, unknown> = { send_to: sendTo, event_callback: finish };
  if (typeof value === "number") params.value = value;
  if (currency) params.currency = currency;
  window.gtag("event", "conversion", params);
}
