import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getAllPosts } from "@/lib/blog";
import { LANDING_PAGES } from "@/lib/landing-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl;
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/start`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/sign-in`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/data-retention`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const posts = await getAllPosts();
  const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  // SEO landing pages — high priority since these target the highest-intent queries.
  const landingUrls: MetadataRoute.Sitemap = LANDING_PAGES.map((p) => ({
    url: `${base}/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  return [...staticUrls, ...landingUrls, ...postUrls];
}
