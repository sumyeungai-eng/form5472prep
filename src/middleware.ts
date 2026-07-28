// No middleware-level auth: route handlers and pages enforce their own
// access checks via getCurrentUser() / getOwnedFiling() from lib/session.
//
// The one thing middleware does is FIRST-TOUCH attribution capture: on a
// visitor's very first page request we derive the acquisition channel from the
// URL params + Referer header and drop it in the `f5472_attr` cookie. It has
// to happen here because it's the only place that sees the entry request to
// *any* page (marketing pages, /blog, the SEO landing slugs) before the
// referrer is lost to internal navigation.
//
// The cookie is written ONLY when absent — first touch must never be
// overwritten (see the long explanation in lib/attribution.ts). Everything in
// here stays synchronous and DB-free; this runs on every page request.

import { NextResponse, type NextRequest } from "next/server";
import {
  ATTR_COOKIE,
  ATTR_COOKIE_MAX_AGE,
  deriveAttribution,
  encodeAttributionCookie,
} from "@/lib/attribution";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Already attributed? Leave it alone. This is the whole first-touch rule.
  if (req.cookies.has(ATTR_COOKIE)) return res;

  try {
    const attr = deriveAttribution({
      url: req.nextUrl,
      referer: req.headers.get("referer"),
      host: req.headers.get("host") ?? req.nextUrl.host,
    });
    res.cookies.set({
      name: ATTR_COOKIE,
      value: encodeAttributionCookie(attr),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ATTR_COOKIE_MAX_AGE,
    });
  } catch {
    // Attribution is analytics, not a feature the customer paid for: a weird
    // URL or header must never keep a visitor from reaching the site.
  }

  return res;
}

export const config = {
  // Every real page, nothing else. The negative lookahead keeps out Next
  // internals (`/_next/*`), Vercel internals (`/_vercel/*`), API routes (never
  // an entry point — the entry page already set the cookie), the admin console
  // (owner-only, never an acquisition path) and the generated OG image; the
  // trailing `\\..*` clause excludes any path containing a file extension, so
  // static assets (favicon.ico, robots.txt, sitemap.xml, feed.xml, /blog/*.png,
  // the PDFs under /forms) are never pushed through the matcher.
  matcher: ["/((?!_next/|_vercel/|api/|admin(?:/|$)|opengraph-image|.*\\..*).*)"],
};
