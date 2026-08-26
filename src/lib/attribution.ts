// FIRST-TOUCH traffic attribution.
//
// `Filing.funnelSource` answers "which landing PAGE did they enter through?"
// (the ?src= slug on /start). This module answers a different question:
// "where did this visitor come FROM?" — Google Ads, Meta, an organic search,
// a referring site, or nothing at all.
//
// The channel is derived once, on the visitor's very first request to any
// page (see src/middleware.ts), and stored in the `f5472_attr` cookie. That
// cookie is NEVER overwritten while it lives, because what we want to know is
// which click *acquired* the customer. A visitor typically clicks an ad,
// leaves, then comes back days later via a Google search or by typing the
// domain — last-touch would credit "direct"/"organic" for a sale the ad
// actually paid for. First touch wins; everything after it is noise here.
//
// Every value below originates in an attacker-controllable URL or Referer
// header and is later rendered in the admin UI, so all fields are sanitized
// and truncated on the way in AND on the way back out of the cookie.

/** Field cap. Real utm values are short; anything longer is junk or an attack. */
const MAX_FIELD_LEN = 120;

/** 90 days — long enough to cover the research-then-buy gap on a tax filing. */
export const ATTR_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

/** Cookie holding the first-touch payload (JSON, httpOnly, set in middleware). */
export const ATTR_COOKIE = "f5472_attr";

export type Attribution = {
  /** Normalised channel: "google-ads", "meta-ads", "google-organic", "referral", "direct", or a raw utm_source. */
  source: string | null;
  /** cpc | organic | referral | email | ... (from utm_medium when present). */
  medium: string | null;
  campaign: string | null;
  /** Referring HOST only — never a full URL (that would carry third-party tracking params). */
  referrer: string | null;
  /** First landing PATHNAME only — never the query string. */
  landing: string | null;
};

export const EMPTY_ATTRIBUTION: Attribution = {
  source: null,
  medium: null,
  campaign: null,
  referrer: null,
  landing: null,
};

// ---- Sanitizers ----

/** Characters we never store from user input: markup-adjacent or quoting. */
const UNSAFE_TEXT = /[<>"'`\\]+/g;

// Replaces C0 controls, DEL and C1 controls with spaces. Written as a code-point
// scan rather than a regex so no literal control characters live in this file.
function stripControlChars(value: string): string {
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    const isControl = code < 32 || (code >= 127 && code <= 159);
    out += isControl ? " " : ch;
  }
  return out;
}

function clean(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const stripped = stripControlChars(raw).replace(/\s+/g, " ").trim();
  if (!stripped) return null;
  return stripped.slice(0, MAX_FIELD_LEN);
}

// Channel-ish values (source, medium, referrer host): lowercase and restrict
// to a slug/host-safe charset so nothing exotic reaches the DB or the admin
// HTML. Runs of anything else collapse to a single dash.
function cleanToken(raw: string | null | undefined): string | null {
  const base = clean(raw);
  if (!base) return null;
  const token = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return token ? token.slice(0, MAX_FIELD_LEN) : null;
}

// Campaign names legitimately contain spaces and mixed case; keep them
// readable but stripped of control chars and anything markup-ish, then
// lowercase for consistency with the rest of the row.
function cleanCampaign(raw: string | null | undefined): string | null {
  const base = clean(raw);
  if (!base) return null;
  const value = base.replace(UNSAFE_TEXT, "").trim().toLowerCase();
  return value ? value.slice(0, MAX_FIELD_LEN) : null;
}

// Landing paths are our own routes, but a crafted request can still send a
// very long or control-char-laden path, so run it through the same guard.
function cleanPath(raw: string | null | undefined): string | null {
  const base = clean(raw);
  if (!base) return null;
  const path = base.replace(UNSAFE_TEXT, "").replace(/\s+/g, "");
  if (!path) return null;
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.slice(0, MAX_FIELD_LEN);
}

// ---- Host helpers ----

// "www.Form5472Prep.com:443" -> "form5472prep.com". Used for the is-this-our-
// own-domain check so an internal navigation is never logged as a referral.
function normalizeHost(host: string | null | undefined): string | null {
  const value = cleanToken(host);
  if (!value) return null;
  return value.replace(/:\d+$/, "").replace(/^www\./, "") || null;
}

// Referer header -> host only. Returns null on anything unparseable. We never
// keep the path or query: third-party tracking params must not be persisted.
function refererHost(referer: string | null | undefined): string | null {
  if (!referer) return null;
  try {
    return normalizeHost(new URL(referer).hostname);
  } catch {
    return null;
  }
}

// Anchored on the registrable domain (with a TLD-shaped suffix) so a hostile
// host like "google.evil.com" is not mislabelled as organic Google traffic.
const SEARCH_ENGINES: ReadonlyArray<readonly [RegExp, string]> = [
  [/(^|\.)google\.[a-z]{2,3}(\.[a-z]{2,3})?$/, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo"],
  [/(^|\.)yahoo\.[a-z]{2,3}(\.[a-z]{2,3})?$/, "yahoo"],
  [/(^|\.)ecosia\.org$/, "ecosia"],
  [/(^|\.)brave\.com$/, "brave"],
];

function searchEngineFor(host: string): string | null {
  for (const [pattern, engine] of SEARCH_ENGINES) {
    if (pattern.test(host)) return engine;
  }
  return null;
}

/** utm_source values that mean "this came off Meta's ad network". */
const META_SOURCES = new Set([
  "facebook",
  "facebook.com",
  "fb",
  "instagram",
  "instagram.com",
  "ig",
  "meta",
]);

/** utm_medium values that still mean "paid" — anything else is honoured verbatim. */
const PAID_MEDIUMS = new Set([
  "cpc",
  "ppc",
  "cpm",
  "cpv",
  "paid",
  "paidsocial",
  "paid-social",
  "paid_social",
  "display",
  "ads",
  "ad",
]);

// ---- Derivation ----

export type DeriveInput = {
  /** Full request URL (absolute string or URL). Only searchParams + pathname are read. */
  url: string | URL;
  /** Raw Referer header. */
  referer?: string | null;
  /** Our own host for this request (Host header), used to ignore internal referrers. */
  host?: string | null;
};

// Maps URL params + referrer onto a channel. Pure and synchronous — this runs
// in middleware on every first request, so: no I/O, no awaits.
export function deriveAttribution(input: DeriveInput): Attribution {
  let url: URL;
  try {
    url = typeof input.url === "string" ? new URL(input.url) : input.url;
  } catch {
    return { ...EMPTY_ATTRIBUTION, source: "direct" };
  }
  const params = url.searchParams;

  const landing = cleanPath(url.pathname);
  const selfHost = normalizeHost(input.host) ?? normalizeHost(url.hostname);
  const refHost = refererHost(input.referer);
  // An internal navigation (our own host, incl. www/apex and port variants)
  // is not a referral — treat it as if there were no referrer at all.
  const external = refHost && refHost !== selfHost ? refHost : null;

  const utmSource = cleanToken(params.get("utm_source"));
  const utmMedium = cleanToken(params.get("utm_medium"));
  const campaign = cleanCampaign(params.get("utm_campaign"));
  // Google Ads sends gclid normally, but gbraid/wbraid instead when the click
  // happens with restricted cookies (iOS/consent-mode) — treating those as
  // "direct" would silently under-credit paid search.
  const hasGclid =
    !!clean(params.get("gclid")) ||
    !!clean(params.get("gbraid")) ||
    !!clean(params.get("wbraid"));
  const hasFbclid = !!clean(params.get("fbclid"));
  // Microsoft Advertising (Bing) auto-tagging.
  const hasMsclkid = !!clean(params.get("msclkid"));

  const base: Attribution = { ...EMPTY_ATTRIBUTION, campaign, referrer: external, landing };

  // 1. Google Ads: the click id is authoritative; the utm pair is the fallback
  //    for campaigns tagged by hand with auto-tagging off.
  if (hasGclid || (utmSource?.includes("google") && utmMedium === "cpc")) {
    return { ...base, source: "google-ads", medium: "cpc" };
  }

  // 2. Microsoft Ads: click id is authoritative, same reasoning as Google.
  if (hasMsclkid) {
    return { ...base, source: "microsoft-ads", medium: "cpc" };
  }

  // 3. Meta. A click id means paid, full stop. A Meta-owned utm_source WITHOUT
  //    a click id is ambiguous — a page post or bio link is organic social, so
  //    only call it "meta-ads" when the medium actually looks paid; otherwise
  //    label it meta-social so the ad spend report isn't inflated by free
  //    traffic.
  if (hasFbclid) {
    const medium = utmMedium && !PAID_MEDIUMS.has(utmMedium) ? utmMedium : "cpc";
    return { ...base, source: "meta-ads", medium };
  }
  if (utmSource && META_SOURCES.has(utmSource)) {
    const paid = !utmMedium || PAID_MEDIUMS.has(utmMedium);
    return {
      ...base,
      source: paid ? "meta-ads" : "meta-social",
      medium: utmMedium ?? "cpc",
    };
  }

  // 3. Any other tagged campaign — newsletters, partners, affiliates. Keep the
  //    marketer's own labels verbatim rather than guessing at a channel.
  if (utmSource) {
    return { ...base, source: utmSource, medium: utmMedium };
  }

  // 4. Untagged arrival with an external referrer: search engine or plain link.
  if (external) {
    const engine = searchEngineFor(external);
    if (engine) return { ...base, source: `${engine}-organic`, medium: "organic" };
    return { ...base, source: "referral", medium: "referral" };
  }

  // 5. Typed the domain, a bookmark, or a stripped referrer.
  return { ...base, source: "direct" };
}

// ---- Cookie codec ----

// Short keys keep the cookie small — it rides along on every request for 90
// days. Null fields are omitted entirely rather than serialised.
type CookiePayload = { s?: string; m?: string; c?: string; r?: string; l?: string };

export function encodeAttributionCookie(attr: Attribution): string {
  const payload: CookiePayload = {};
  if (attr.source) payload.s = attr.source;
  if (attr.medium) payload.m = attr.medium;
  if (attr.campaign) payload.c = attr.campaign;
  if (attr.referrer) payload.r = attr.referrer;
  if (attr.landing) payload.l = attr.landing;
  return JSON.stringify(payload);
}

// Never throws: a malformed or truncated cookie yields all-nulls, so creating
// a filing can never fail because of attribution. Re-sanitizes on read too —
// the cookie is httpOnly, but defence in depth is free here.
export function parseAttributionCookie(raw: string | null | undefined): Attribution {
  if (!raw) return { ...EMPTY_ATTRIBUTION };
  try {
    // Next's cookie store percent-encodes on write and decodes on read, but
    // don't depend on that: accept both encoded and plain JSON.
    let text = raw.trim();
    for (let i = 0; i < 3 && !text.startsWith("{"); i += 1) {
      text = decodeURIComponent(text);
    }
    const obj = JSON.parse(text) as CookiePayload;
    if (!obj || typeof obj !== "object") return { ...EMPTY_ATTRIBUTION };
    return {
      source: cleanToken(obj.s),
      medium: cleanToken(obj.m),
      campaign: cleanCampaign(obj.c),
      referrer: normalizeHost(obj.r),
      landing: cleanPath(obj.l),
    };
  } catch {
    // Never log the value itself — it can carry third-party params.
    console.warn(`[attribution] ignoring unparseable ${ATTR_COOKIE} cookie`);
    return { ...EMPTY_ATTRIBUTION };
  }
}

// ---- Display ----

/** True when we know anything at all about where this visitor came from. */
export function hasAttribution(attr: Partial<Attribution> | null | undefined): boolean {
  if (!attr) return false;
  return !!(attr.source || attr.medium || attr.campaign || attr.referrer || attr.landing);
}

const SOURCE_LABELS: Record<string, string> = {
  "google-ads": "Google Ads",
  "meta-ads": "Meta Ads",
  "meta-social": "Meta (organic social)",
  "microsoft-ads": "Microsoft Ads",
  "google-organic": "Google (organic)",
  "bing-organic": "Bing (organic)",
  "duckduckgo-organic": "DuckDuckGo (organic)",
  "yahoo-organic": "Yahoo (organic)",
  "ecosia-organic": "Ecosia (organic)",
  "brave-organic": "Brave (organic)",
  referral: "Referral",
  direct: "Direct",
};

// One-line human summary for the admin UI — and anywhere else we later want to
// show provenance (order emails, CSV export). Filings created before
// attribution shipped have all-null columns and must read as "unknown", not
// blank and never "null".
export function formatAttribution(attr: Partial<Attribution> | null | undefined): string {
  if (!hasAttribution(attr)) return "Unknown (pre-dates tracking)";
  const { source = null, medium = null, campaign = null, referrer = null } = attr ?? {};
  const parts: string[] = [];

  parts.push(source ? SOURCE_LABELS[source] ?? source : "Unknown source");

  // Skip the medium when the label already says it ("Referral · referral",
  // "Google (organic) · organic"); keep it otherwise (cpc, email, affiliate…).
  const mediumIsRedundant =
    !!source &&
    ((source === "referral" && medium === "referral") ||
      (source.endsWith("-organic") && medium === "organic"));
  if (medium && !mediumIsRedundant) parts.push(medium);

  // The referring host only adds information when the source doesn't already
  // name the channel (plain referrals and raw utm_source values).
  const sourceNamesChannel =
    !!source && source !== "referral" && (source in SOURCE_LABELS || source.endsWith("-organic"));
  if (referrer && !sourceNamesChannel) parts.push(referrer);

  if (campaign) parts.push(`campaign "${campaign}"`);

  return parts.join(" · ");
}

// Session-scoped funnel source used by client-side links. This is deliberately
// separate from the long-lived acquisition cookie above: it carries the
// landing-page src slug into /start without changing the original attribution.
const SESSION_SRC_KEY = "form5472:first-touch-src";

export function sanitizeSrc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
  return cleaned || null;
}

export function rememberSrc(src: string): void {
  if (typeof window === "undefined") return;

  try {
    if (window.sessionStorage.getItem(SESSION_SRC_KEY) !== null) return;
    window.sessionStorage.setItem(SESSION_SRC_KEY, src);
  } catch {
    // Storage can be unavailable in private browsing or blocked environments.
  }
}

export function recallSrc(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return sanitizeSrc(window.sessionStorage.getItem(SESSION_SRC_KEY));
  } catch {
    return null;
  }
}

export function startHref(): string {
  if (typeof window === "undefined") return "/start";

  const currentSrc = sanitizeSrc(new URLSearchParams(window.location.search).get("src"));
  const src = currentSrc ?? recallSrc();
  return src ? `/start?src=${encodeURIComponent(src)}` : "/start";
}
