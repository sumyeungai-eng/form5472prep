import { getAllPosts } from "@/lib/blog";
import { env } from "@/lib/env";

export const dynamic = "force-static";
export const revalidate = 3600;

// RSS 2.0 feed at /feed.xml. Two audiences: human RSS readers, and AI crawlers
// (GPTBot, ClaudeBot, PerplexityBot) that poll feeds to discover fresh content
// faster than re-crawling the sitemap — shortening the lag before a new post is
// citable in AI answers.

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const base = env.appUrl;
  const posts = await getAllPosts();
  const latest = posts[0]?.date ? new Date(posts[0].date) : new Date(0);

  const items = posts
    .map((p) => {
      const url = `${base}/blog/${p.slug}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
${(p.tags ?? []).map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Form5472 Prep — Guides</title>
    <link>${base}/blog</link>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Guides on filing IRS Form 5472 and pro forma Form 1120 for foreign-owned US LLCs.</description>
    <language>en-us</language>
    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
