// Meta Pixel browser events. All helpers are safe no-ops until the visitor
// grants marketing consent and NEXT_PUBLIC_META_PIXEL_ID is configured.

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
export const META_CONSENT_KEY = "form5472_marketing_consent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    __form5472MetaPixelInitialized?: boolean;
  }
}

export function hasMetaMarketingConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(META_CONSENT_KEY) === "granted";
}

function fire(
  kind: "track" | "trackCustom",
  name: string,
  params: Record<string, unknown>,
  eventId: string,
): void {
  if (!META_PIXEL_ID || !hasMetaMarketingConsent()) return;
  window.fbq?.(kind, name, params, { eventID: eventId });
}

export function fireMetaLead(filingId: string): void {
  fire("trackCustom", "StartFiling", {}, `start_filing_${filingId}`);
}

export function fireMetaInitiateCheckout(opts: {
  filingId: string;
  amountCents: number;
}): void {
  fire(
    "track",
    "InitiateCheckout",
    { value: opts.amountCents / 100, currency: "USD" },
    `initiate_checkout_${opts.filingId}`,
  );
}

export function fireMetaPurchase(opts: {
  filingId: string;
  amountCents: number;
}): void {
  if (opts.amountCents <= 0) return;
  fire(
    "track",
    "Purchase",
    { value: opts.amountCents / 100, currency: "USD" },
    `purchase_${opts.filingId}`,
  );
}
