import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import type { PostMeta } from "@/lib/blog";
import { SITE_URL, breadcrumbList, pageMeta } from "@/lib/seo";
import { seoTitle } from "@/lib/seo-title";
import { buildTagIndex, MIN_INDEXABLE_TAG_POSTS, tagHref, type TagEntry } from "@/lib/blog-tags";
import { pageRange, pageSlice, POSTS_PER_PAGE, topicPagePath, totalPages } from "@/lib/blog-pagination";
import { Pager } from "./Pager";
import { PostCard } from "./PostCard";

// One page of a topic hub. Page 1 is /blog/topics/<tag>; older posts live at
// /blog/topics/<tag>/page/<n>, paginated exactly like /blog (POSTS_PER_PAGE per
// page, newest first, every post on exactly one page, each page
// self-canonical). Thin hubs (< MIN_INDEXABLE_TAG_POSTS posts) stay
// noindex,follow on every page.

export const OTHER_TOPIC_LINKS = 6;

export type TopicPage = { entry: TagEntry; entries: TagEntry[]; page: number; pages: number };

/** Resolve a hub page, or null when the tag or the page number does not exist. */
export function resolveTopicPage(posts: PostMeta[], tag: string, page: number): TopicPage | null {
  const entries = buildTagIndex(posts);
  const entry = entries.find((candidate) => candidate.tag === tag);
  if (!entry) return null;
  const pages = totalPages(entry.count);
  if (!Number.isInteger(page) || page < 1 || page > pages) return null;
  return { entry, entries, page, pages };
}

function hubCopy({ entry, page, pages }: TopicPage) {
  const title = page === 1 ? `${entry.label} guides` : `${entry.label} guides – page ${page}`;
  const { from, to } = pageRange(page, entry.count);
  const description =
    page === 1
      ? `${entry.count} practical guides on ${entry.label} for foreign-owned US LLC owners.`
      : `Page ${page} of ${pages}: guides ${from}–${to} of ${entry.count} on ${entry.label} for foreign-owned US LLC owners.`;
  return { title, description, path: topicPagePath(entry.tag, page), from, to };
}

export function topicHubMetadata(resolved: TopicPage): Metadata {
  const { title, description, path } = hubCopy(resolved);
  return {
    title: seoTitle(title),
    description,
    ...pageMeta({ title: `${title} · Form5472 Prep`, description, path }),
    ...(resolved.entry.count < MIN_INDEXABLE_TAG_POSTS ? { robots: { index: false, follow: true } } : {}),
  };
}

export function TopicHubView(resolved: TopicPage) {
  const { entry, entries, page, pages } = resolved;
  const { title, description, path, from, to } = hubCopy(resolved);
  const pagePosts = pageSlice(entry.posts, page);
  const offset = (page - 1) * POSTS_PER_PAGE;
  // Cross-links go to indexable hubs only; thin topic pages are noindex. Six,
  // like the /blog topic chips (was 12): with 24 post cards, the pager and the
  // site chrome a hub page measured 97-99 anchors at 12 (build 2026-10-16), too
  // close to the ~100 Moz flags; the full list lives on /blog/topics.
  const otherTopics = entries
    .filter((topic) => topic.tag !== entry.tag && topic.count >= MIN_INDEXABLE_TAG_POSTS)
    .slice(0, OTHER_TOPIC_LINKS);
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: `${SITE_URL}${path}`,
    description,
    dateModified: pagePosts[0]?.updated ?? pagePosts[0]?.date,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: pagePosts.map((post, index) => ({
        "@type": "ListItem",
        position: offset + index + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/blog" },
    { name: "Topics", path: "/blog/topics" },
    { name: entry.label, path: topicPagePath(entry.tag, 1) },
    ...(page > 1 ? [{ name: `Page ${page}`, path }] : []),
  ];

  return (
    <div className="bg-[#f8f9fb]">
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbList(crumbs)} />
      <section className="relative overflow-hidden border-b border-slate-200 bg-paper">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(circle, #1e3a8a 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div aria-hidden className="absolute -right-24 -top-40 h-[520px] w-[520px] rounded-full bg-accent-100/70 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-20">
          <Link href="/blog/topics" className="inline-flex items-center text-sm font-semibold text-accent transition hover:text-ink">
            <ArrowLeft className="mr-2 h-4 w-4" />
            All topics
          </Link>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
            <BookOpen className="h-3.5 w-3.5 text-accent" />
            Topic library · {entry.count} articles
            {pages > 1 && ` · page ${page} of ${pages}`}
          </div>
          <h1 className="mt-7 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.35rem]">
            {entry.label} guides
            {page > 1 && <span className="text-accent">, page {page}</span>}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {page === 1 ? description : `Guides ${from}–${to} of ${entry.count} on ${entry.label}, newest first.`}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {pagePosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        <Pager
          page={page}
          pages={pages}
          pathFor={(n) => topicPagePath(entry.tag, n)}
          label={`${entry.label} guide pages`}
        />

        {otherTopics.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-9" aria-labelledby="other-topics-heading">
            <h2 id="other-topics-heading" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              Browse other topics
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {otherTopics.map((topic) => (
                <Link
                  key={topic.tag}
                  href={tagHref(topic.tag)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs text-slate-700 transition hover:border-accent/30 hover:text-accent hover:shadow-sm"
                >
                  {topic.label}
                  <span className="font-mono text-[10px] text-slate-400">{topic.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16">
          <Link href="/start" className="inline-flex h-12 items-center justify-center rounded-lg bg-ink px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent">
            Start your filing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
