import crypto from "node:crypto";

export function isBotUserAgent(ua: string | null): boolean {
  if (!ua) return false;
  return /(bot|crawler|spider|slurp|headless|lighthouse|pingdom|facebookexternalhit|preview|monitor|uptime|validator|scrapy|python|curl|wget|okhttp|semrush|ahrefs|bingpreview|twitterbot|linkedinbot|whatsapp|telegrambot|discordbot|baiduspider|yandexbot|duckduckbot|applebot|gptbot|oai-searchbot|claudebot|perplexitybot)/i.test(
    ua,
  );
}

export function deviceFromUserAgent(ua: string | null): "desktop" | "mobile" | "tablet" {
  if (!ua) return "desktop";
  if (/\b(ipad|tablet|kindle|silk|playbook)\b/i.test(ua)) return "tablet";
  if (/\bandroid\b/i.test(ua) && !/\bmobile\b/i.test(ua)) return "tablet";
  if (/\b(mobi|iphone|ipod)\b/i.test(ua)) return "mobile";
  if (/\bandroid\b/i.test(ua)) return "mobile";
  return "desktop";
}

export function clientIpFromHeaders(h: Headers): string | null {
  const xff = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (xff) return xff;
  return h.get("x-real-ip")?.trim() || null;
}

export function geoFromHeaders(h: Headers): {
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
} {
  return {
    country: h.get("x-vercel-ip-country") || null,
    region: h.get("x-vercel-ip-country-region") || null,
    city: decodeHeader(h.get("x-vercel-ip-city")),
    timezone: h.get("x-vercel-ip-timezone") || null,
  };
}

export function isTrackablePath(path: string): boolean {
  if (!path.startsWith("/") || path.length > 512) return false;
  if (
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.startsWith("/_vercel")
  ) {
    return false;
  }
  return !/\/?[^/]+\.[^/]+$/.test(path);
}

export function externalReferrerHost(referrer: string | null, ownHost: string): string | null {
  if (!referrer) return null;
  try {
    const refHost = normalizeHost(new URL(referrer).hostname);
    const selfHost = normalizeHost(ownHost);
    if (!refHost || refHost === selfHost) return null;
    return refHost;
  } catch {
    return null;
  }
}

export function hashIp(ip: string, salt: string | undefined): string | null {
  if (!salt) return null;
  return crypto.createHmac("sha256", salt).update(ip).digest("hex");
}

function decodeHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const normalized = host.trim().toLowerCase().replace(/:\d+$/, "").replace(/^www\./, "");
  return normalized || null;
}
