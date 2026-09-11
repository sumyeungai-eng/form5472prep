// Shared SEO/AEO/GEO primitives. Import from here instead of re-declaring
// site facts in each page so schema, metadata and llms.txt never drift.
import type { Metadata } from "next";
import { env } from "@/lib/env";

export const SITE_NAME = "Form5472 Prep";
export const SITE_URL = env.appUrl; // always the www form
// IRS Ogden PIN Unit fax line for Form 5472 — NOT our phone; never emit as Organization.telephone
export const IRS_OGDEN_FAX = "+1-855-887-7737";
export const ORG_EMAIL = "support@form5472prep.com";
export const TRUSTPILOT_PROFILE_URL = "https://www.trustpilot.com/review/form5472prep.com";
export const ORG_SAME_AS = [TRUSTPILOT_PROFILE_URL];

// Date the evergreen service pages (home, pricing, EIN, ITIN, partners,
// about) and the programmatic landing pages were last reviewed for accuracy.
// Bump this whenever pricing/process copy changes. Blog posts carry their own
// `updated:` frontmatter and must NOT use this constant.
export const CONTENT_LAST_REVIEWED = "2026-08-16";

export const DEFAULT_OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630 };

export type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  alt?: string;
  publishedTime?: string;
  modifiedTime?: string;
};

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

// Page-level metadata helper. Next.js does NOT deep-merge `alternates` from
// the root layout into a page that sets its own `alternates` — the page's
// object wins wholesale, which is why the layout's RSS link
// (src/app/layout.tsx:43-46) never renders. Every page-level `alternates`
// must therefore carry `types` itself.
export function pageMeta(input: PageMetaInput): Metadata {
  const canonical = `${SITE_URL}${input.path}`;
  const type = input.type ?? "website";
  const image = input.image ?? `${SITE_URL}${DEFAULT_OG_IMAGE.url}`;
  const alt = input.alt ?? SITE_NAME;
  const articleDates =
    type === "article"
      ? {
          publishedTime: input.publishedTime,
          modifiedTime: input.modifiedTime,
        }
      : {};

  return {
    alternates: {
      canonical,
      types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: "en_US",
      title: input.title,
      description: input.description,
      url: canonical,
      images: [{ url: image, width: DEFAULT_OG_IMAGE.width, height: DEFAULT_OG_IMAGE.height, alt }],
      ...articleDates,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
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

export type HowToStepInput = { name: string; text: string; anchor: string; image?: string };

// HowTo JSON-LD. `url` is the absolute page URL and each step's `anchor`
// must resolve to an on-page heading id so answer engines can deep-link to the
// exact visible instruction they quote.
export function howTo(input: {
  name: string;
  description: string;
  url: string;
  totalTime: string;
  steps: HowToStepInput[];
  tools?: string[];
  supplies?: string[];
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    totalTime: input.totalTime,
    ...(input.tools && input.tools.length > 0
      ? { tool: input.tools.map((name) => ({ "@type": "HowToTool", name })) }
      : {}),
    ...(input.supplies && input.supplies.length > 0
      ? { supply: input.supplies.map((name) => ({ "@type": "HowToSupply", name })) }
      : {}),
    step: input.steps.map((step, i) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      url: `${input.url}${step.anchor}`,
      position: i + 1,
      ...(step.image ? { image: step.image } : {}),
    })),
  };
}

// Canonical Organization node reused by every page's schema (and by llms.txt).
// Organization is enriched for knowledge-panel + E-E-A-T signals. knowsAbout
// is the key field for AI engines deciding whether to cite us as a topical
// source on a Form 5472 / DIIRSP question. These fields were lost and restored
// on 2026-09-11; keep them here so nobody prunes them again.
export function organizationNode(extra: Record<string, unknown> = {}) {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-mark.svg`,
    description:
      "Done-for-you IRS Form 5472 + pro forma Form 1120 filing for foreign-owned US single-member LLCs. Every package reviewed by a qualified tax accountant before fax delivery to the IRS Ogden PIN Unit.",
    foundingDate: "2025",
    areaServed: { "@type": "Country", name: "United States" },
    knowsAbout: [
      "IRS Form 5472",
      "IRS Form 1120 (pro forma)",
      "Foreign-owned US single-member LLC tax compliance",
      "DIIRSP — Delinquent International Information Return Submission Procedure",
      "IRC § 6038A reportable transactions",
      "Treasury Regulation § 1.6038A-1",
      "$25,000 IRS information-return penalty abatement",
    ],
    slogan: "Flat-rate Form 5472 filing. No hidden fees.",
    email: ORG_EMAIL,
    sameAs: ORG_SAME_AS,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: ORG_EMAIL,
        availableLanguage: ["en"],
      },
      {
        "@type": "ContactPoint",
        contactType: "billing support",
        email: ORG_EMAIL,
        availableLanguage: ["en"],
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
