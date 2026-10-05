import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getAllPosts } from "@/lib/blog";
import { buildTagIndex, MIN_INDEXABLE_TAG_POSTS } from "@/lib/blog-tags";
import { LANDING_PAGES } from "@/lib/landing-pages";
import { CONTENT_LAST_REVIEWED } from "@/lib/seo";
import { LAST_REVIEWED_ISO as DEADLINE_REVIEWED } from "@/lib/tools/deadline/sources";
import { LAST_REVIEWED_ISO as FILING_CHECKER_REVIEWED } from "@/lib/tools/filing-checker/sources";
import { LAST_REVIEWED_ISO as LATE_FILING_REVIEWED } from "@/lib/tools/late-filing/sources";
import { LAST_REVIEWED_ISO as PENALTY_REVIEWED } from "@/lib/tools/penalty/sources";
import { TX_CHECKER_LAST_REVIEWED } from "@/lib/tools/reportable-transactions/sources";
import { LAST_REVIEWED as STATE_FEES_REVIEWED } from "@/lib/tools/state-fees/data";
import { serviceSitemapEntries } from "@/lib/services-pages";

// ISR: the post list comes partly from the database, so the sitemap has to
// refresh between deploys as admins publish.
export const revalidate = 60;

// Real last-modified dates for static pages. The sitemap used to stamp every
// URL with the build time, which tells crawlers nothing (crawl 2026-10-01).
// Bump a page's date here ONLY when its visible content really changes.
// Tool pages read the "last reviewed" constant their page already displays.
const STATIC_PAGE_UPDATED: Record<string, string> = {
  "/": "2026-09-30",
  "/pricing": "2026-09-30",
  "/faq": "2026-09-11",
  "/ein": "2026-09-14",
  "/itin": "2026-09-14",
  "/partners": "2026-09-18",
  "/contact": "2026-09-21",
  "/about": "2026-09-21",
  "/editorial-policy": "2026-09-21",
  "/terms": "2026-09-21",
  "/privacy": "2026-09-21",
  "/cookies": "2026-09-21",
  "/data-retention": "2026-09-21",
  "/security": "2026-09-21",
  // New hub pages, written 2026-10-04.
  "/press": "2026-10-04",
  "/compare": "2026-10-04",
  // Statistics page; mirrors STATS_LAST_REVIEWED in src/lib/form5472-stats.ts.
  "/form-5472-statistics": "2026-10-05",
  // Price comparison; mirrors PRICES_CHECKED_ON in src/lib/provider-prices.ts.
  "/compare/form-5472-filing-services": "2026-10-05",
};

const TOOL_PAGE_REVIEWED: Record<string, string> = {
  "/form-5472-deadline-calculator": DEADLINE_REVIEWED,
  "/do-i-need-to-file-form-5472": FILING_CHECKER_REVIEWED,
  "/form-5472-penalty-calculator": PENALTY_REVIEWED,
  // Mirrors PAGE_LAST_REVIEWED in irs-yearly-average-exchange-rates/page.tsx.
  "/irs-yearly-average-exchange-rates": "2026-09-29",
  "/form-5472-reportable-transactions-checker": TX_CHECKER_LAST_REVIEWED,
  "/form-5472-late-filing-checker": LATE_FILING_REVIEWED,
  "/foreign-owned-llc-compliance-calendar": STATE_FEES_REVIEWED,
  "/llc-annual-fees-by-state": STATE_FEES_REVIEWED,
};

function day(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl;
  const posts = await getAllPosts();
  const postDate = (p: (typeof posts)[number]) => day(p.updated ?? p.publishAt ?? p.date);
  const newestPost = posts
    .map(postDate)
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const at = (path: string) => day(STATIC_PAGE_UPDATED[path] ?? TOOL_PAGE_REVIEWED[path]);

  // NOTE: /start and /sign-in are intentionally omitted — /start is noindex
  // (paid-funnel entry) and /sign-in is a login page; neither should be
  // advertised to crawlers via the sitemap.
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: at("/"), changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/pricing`, lastModified: at("/pricing"), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/faq`, lastModified: at("/faq"), changeFrequency: "monthly", priority: 0.7 },
    ...Object.keys(TOOL_PAGE_REVIEWED).map((path) => ({
      url: `${base}${path}`,
      lastModified: at(path),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${base}/ein`, lastModified: at("/ein"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/itin`, lastModified: at("/itin"), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/partners`, lastModified: at("/partners"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: newestPost, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog/topics`, lastModified: newestPost, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: at("/contact"), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/about`, lastModified: at("/about"), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/editorial-policy`, lastModified: at("/editorial-policy"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: at("/terms"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: at("/privacy"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookies`, lastModified: at("/cookies"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/data-retention`, lastModified: at("/data-retention"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/security`, lastModified: at("/security"), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/compare`, lastModified: at("/compare"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/press`, lastModified: at("/press"), changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/form-5472-statistics`, lastModified: at("/form-5472-statistics"), changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${base}/compare/form-5472-filing-services`,
      lastModified: at("/compare/form-5472-filing-services"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Service pages: written 2026-10-01; bump this date only on real edits.
    ...serviceSitemapEntries(base, new Date("2026-10-01T00:00:00Z")),
  ];

  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: postDate(p),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  // Tag hubs below MIN_INDEXABLE_TAG_POSTS are noindex, so they stay out of the
  // sitemap. lastmod = newest post in the topic (posts arrive newest-first).
  const tagUrls: MetadataRoute.Sitemap = buildTagIndex(posts)
    .filter((entry) => entry.count >= MIN_INDEXABLE_TAG_POSTS)
    .map((entry) => ({
      url: `${base}/blog/topics/${entry.tag}`,
      lastModified: entry.posts
        .map(postDate)
        .filter((d): d is Date => !!d)
        .sort((a, b) => b.getTime() - a.getTime())[0],
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  // SEO landing pages — high priority since these target the highest-intent
  // queries. Noindex pages (paid-ad landings) are excluded so Google doesn't
  // discover them via the sitemap. lastmod = the page's own `updated` date,
  // else the shared CONTENT_LAST_REVIEWED date for evergreen pages.
  const landingUrls: MetadataRoute.Sitemap = LANDING_PAGES
    .filter((p) => !p.noindex)
    .map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: day(p.updated ?? CONTENT_LAST_REVIEWED),
      changeFrequency: "monthly",
      priority: 0.9,
    }));

  return [...staticUrls, ...landingUrls, ...postUrls, ...tagUrls];
}
