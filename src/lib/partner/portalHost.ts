// Neutral domain that serves partner clients' invite, intake and sign pages,
// so a client never sees form5472prep.com. Unset = feature off: partner pages
// stay on the main site. A host, e.g. "sign.example.com" or
// "portal.localhost:3000". next.config.mjs parses the same env var.
const RAW = (process.env.NEXT_PUBLIC_PARTNER_PORTAL_HOST || "").trim().toLowerCase();
export const PORTAL_HOSTNAME = RAW.split(":")[0];

export function isPortalHost(hostOrHostname: string | null | undefined): boolean {
  return !!PORTAL_HOSTNAME && !!hostOrHostname && hostOrHostname.toLowerCase().split(":")[0] === PORTAL_HOSTNAME;
}

export function portalOrigin(): string | null {
  if (!RAW) return null;
  const local = PORTAL_HOSTNAME === "localhost" || PORTAL_HOSTNAME.endsWith(".localhost");
  return `${local ? "http" : "https"}://${RAW}`;
}

// For client components: true when the page is being viewed on the portal.
export function onPortalHost(): boolean {
  return typeof window !== "undefined" && isPortalHost(window.location.hostname);
}
