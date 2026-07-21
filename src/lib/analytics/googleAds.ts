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

// Purchase conversion — created in Google Ads UI (Goals → Conversions →
// New conversion action → Website → Purchase). To activate, set the full
// send_to label as the NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_PURCHASE env var in
// Vercel (e.g. "AW-18127544007/XxYyZzAaBbCc") and redeploy — no code change.
// NEXT_PUBLIC_ vars are inlined at build time. While unset this is "", so
// firePurchaseConversion() stays a safe no-op and the code ships as-is.
export const GOOGLE_ADS_CONVERSION_PURCHASE =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_PURCHASE ?? "";

// Fire the Google Ads purchase conversion after a verified Stripe payment.
// transaction_id lets Google deduplicate: if the customer refreshes or
// revisits the ?paid=1 URL, repeat pings with the same ID are dropped.
// When amountCents is missing/0 (webhook race), omit value so the default
// value configured on the conversion action in Google Ads applies instead.
export function firePurchaseConversion(opts: {
  amountCents?: number;
  transactionId: string;
}): void {
  if (!GOOGLE_ADS_CONVERSION_PURCHASE) return;
  if (typeof window === "undefined") return;
  const params: Record<string, unknown> = {
    send_to: GOOGLE_ADS_CONVERSION_PURCHASE,
    transaction_id: opts.transactionId,
  };
  if (typeof opts.amountCents === "number" && opts.amountCents > 0) {
    params.value = opts.amountCents / 100;
    params.currency = "USD";
  }
  // If gtag.js hasn't finished loading yet (deferred script vs a fast paid
  // redirect), queue the event on dataLayer so the tag replays it on load
  // instead of dropping the conversion.
  if (typeof window.gtag !== "function") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(["event", "conversion", params]);
    return;
  }
  window.gtag("event", "conversion", params);
}
