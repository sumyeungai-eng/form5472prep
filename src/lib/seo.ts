// Shared SEO/AEO/GEO primitives. Import from here instead of re-declaring
// site facts in each page so schema, metadata and llms.txt never drift.
import type { Metadata } from "next";
import { env } from "@/lib/env";

export const SITE_NAME = "Form5472 Prep";
export const SITE_URL = env.appUrl; // always the www form
export const ORG_TELEPHONE = "+1-855-887-7737";
export const ORG_EMAIL = "support@form5472prep.com";
export const TRUSTPILOT_PROFILE_URL = "https://www.trustpilot.com/review/form5472prep.com";
export const ORG_SAME_AS = [TRUSTPILOT_PROFILE_URL];

// Date the evergreen service pages (home, pricing, EIN, ITIN, partners,
// about) and the programmatic landing pages were last reviewed for accuracy.
// Bump this whenever pricing/process copy changes. Blog posts carry their own
// `updated:` frontmatter and must NOT use this constant.
export const CONTENT_LAST_REVIEWED = "2026-08-16";

export const DEFAULT_OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630 };

// Per-page OpenGraph block. Next.js does NOT deep-merge a page's `openGraph`
// with the root layout's, so every page that sets its own must re-supply
// type + images or they vanish (confirmed live 2026-08-16: og:image missing
// on 8/12 pages). Use this everywhere instead of hand-writing the object.
export function pageOpenGraph(input: {
  title: string;
  description: string;
  path: string; // "/pricing"
  type?: "website" | "article";
  images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
}): NonNullable<Metadata["openGraph"]> {
  return {
    type: input.type ?? "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: input.title,
    description: input.description,
    url: input.path,
    images: input.images ?? [DEFAULT_OG_IMAGE],
  };
}

// BreadcrumbList JSON-LD. `items` are ordered root→leaf; paths are relative.
export function breadcrumbList(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

// Canonical Organization node reused by every page's schema (and by
// llms.txt). Keep this the single source of truth for org facts.
export function organizationNode(extra: Record<string, unknown> = {}) {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
    email: ORG_EMAIL,
    telephone: ORG_TELEPHONE,
    sameAs: ORG_SAME_AS,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: ORG_EMAIL,
        availableLanguage: ["English"],
      },
    ],
    ...extra,
  };
}

// Speakable spec for answer engines / voice: point at the H1 and the
// direct-answer lead. Pages must render elements matching these selectors.
export const SPEAKABLE = {
  "@type": "SpeakableSpecification",
  cssSelector: ["h1", "[data-speakable]"],
};
