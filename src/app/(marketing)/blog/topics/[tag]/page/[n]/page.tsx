import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/blog";
import { parsePageParam, totalPages } from "@/lib/blog-pagination";
import { buildTagIndex, MIN_INDEXABLE_TAG_POSTS } from "@/lib/blog-tags";
import { resolveTopicPage, topicHubMetadata, TopicHubView } from "../../../../_components/TopicHubView";

// Older pages of a topic hub: /blog/topics/[tag] is page 1, /page/2.. hold the
// rest (same POSTS_PER_PAGE and URL rules as /blog/page/[n]). Same ISR window
// as the hub itself so a new post shifts every page within a minute.
export const revalidate = 60;

// A page that did not exist at build time (a hub crossed a multiple of the page
// size) renders on demand instead of 404ing until the next deploy. Keep this
// true: resolveTopicPage() still 404s page numbers that do not exist yet.
export const dynamicParams = true;

// Prerender pages 2..N of every indexable hub. Thin hubs never reach a second
// page (they have fewer posts than POSTS_PER_PAGE), but any that did would
// render on demand, noindex like their page 1.
export async function generateStaticParams(): Promise<{ tag: string; n: string }[]> {
  return buildTagIndex(await getAllPosts())
    .filter((entry) => entry.count >= MIN_INDEXABLE_TAG_POSTS)
    .flatMap((entry) =>
      Array.from({ length: Math.max(0, totalPages(entry.count) - 1) }, (_, i) => ({ tag: entry.tag, n: String(i + 2) })),
    );
}

/** The requested hub page, or null unless it is an existing page >= 2. */
async function resolve(params: { tag: string; n: string }) {
  const page = parsePageParam(params.n);
  if (page === null) return null;
  return resolveTopicPage(await getAllPosts(), params.tag, page);
}

export async function generateMetadata({ params }: { params: { tag: string; n: string } }): Promise<Metadata> {
  const resolved = await resolve(params);
  if (!resolved) return { title: "Page not found", robots: { index: false, follow: false } };
  return topicHubMetadata(resolved);
}

export default async function TopicHubOlderPage({ params }: { params: { tag: string; n: string } }): Promise<JSX.Element> {
  const resolved = await resolve(params);
  if (!resolved) notFound();
  return <TopicHubView {...resolved} />;
}
