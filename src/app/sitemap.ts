import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getAllPosts } from "@/lib/blog";
import { LANDING_PAGES } from "@/lib/landing-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl;
  const now = new Date();

  // NOTE: /start and /sign-in are intentionally omitted — /start is noindex
  // (paid-funnel entry) and /sign-in is a login page; neither should be
  // advertised to crawlers via the sitemap.
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/ein`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/itin`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/partners`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/editorial-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/data-retention`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/security`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const posts = await getAllPosts();
  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  // SEO landing pages — high priority since these target the highest-intent
  // queries. Noindex pages (paid-ad landings) are excluded so Google doesn't
  // discover them via the sitemap.
  const landingUrls: MetadataRoute.Sitemap = LANDING_PAGES
    .filter((p) => !p.noindex)
    .map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    }));

  return [...staticUrls, ...landingUrls, ...postUrls];
}
