import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/blog";
import { buildTagIndex, MIN_INDEXABLE_TAG_POSTS } from "@/lib/blog-tags";
import { resolveTopicPage, topicHubMetadata, TopicHubView } from "../../_components/TopicHubView";

// Page 1 of a topic hub. Older posts of a large hub live at
// /blog/topics/[tag]/page/[n] (see ./page/[n]/page.tsx); both render through
// TopicHubView so the two stay identical apart from the post slice.
export const revalidate = 60;

// Prerender the hubs worth indexing, let the long tail render on demand.
export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const entries = buildTagIndex(await getAllPosts());
  return entries.filter((entry) => entry.count >= MIN_INDEXABLE_TAG_POSTS).map((entry) => ({ tag: entry.tag }));
}

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const resolved = resolveTopicPage(await getAllPosts(), params.tag, 1);
  if (!resolved) return { title: "Topic not found" };
  return topicHubMetadata(resolved);
}

export default async function TopicPage({ params }: { params: { tag: string } }): Promise<JSX.Element> {
  const resolved = resolveTopicPage(await getAllPosts(), params.tag, 1);
  if (!resolved) notFound();
  return <TopicHubView {...resolved} />;
}
