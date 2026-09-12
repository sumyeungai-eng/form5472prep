import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL, breadcrumbList, pageMeta } from "@/lib/seo";
import { buildTagIndex, findTag, MIN_INDEXABLE_TAG_POSTS, tagHref } from "@/lib/blog-tags";
import { PostCard } from "../../_components/PostCard";

export const revalidate = 60;

// Prerender the hubs worth indexing, let the long tail render on demand.
export async function generateStaticParams(): Promise<{ tag: string }[]> {
  const entries = buildTagIndex(await getAllPosts());
  return entries.filter((entry) => entry.count >= MIN_INDEXABLE_TAG_POSTS).map((entry) => ({ tag: entry.tag }));
}

export async function generateMetadata({ params }: { params: { tag: string } }): Promise<Metadata> {
  const entry = findTag(await getAllPosts(), params.tag);
  if (!entry) return { title: "Topic not found" };

  const title = `${entry.label} guides`;
  const description = `${entry.count} practical guides on ${entry.label} for foreign-owned US LLC owners.`;
  const path = `/blog/topics/${entry.tag}`;

  return {
    title,
    description,
    ...pageMeta({
      title: `${title} · Form5472 Prep`,
      description,
      path,
    }),
    ...(entry.count < MIN_INDEXABLE_TAG_POSTS ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function TopicPage({ params }: { params: { tag: string } }): Promise<JSX.Element> {
  const posts = await getAllPosts();
  const entry = findTag(posts, params.tag);
  if (!entry) notFound();

  const entries = buildTagIndex(posts);
  const otherTopics = entries.filter((topic) => topic.tag !== entry.tag).slice(0, 12);
  const path = `/blog/topics/${entry.tag}`;
  const description = `${entry.count} practical guides on ${entry.label} for foreign-owned US LLC owners.`;
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${entry.label} guides`,
    url: `${SITE_URL}${path}`,
    description,
    dateModified: entry.posts[0]?.updated ?? entry.posts[0]?.date,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: entry.posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <div className="bg-[#f8f9fb]">
      <JsonLd data={collectionJsonLd} />
      <JsonLd
        data={breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/blog" },
          { name: entry.label, path },
        ])}
      />
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
          <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-accent transition hover:text-ink">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to guides
          </Link>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
            <BookOpen className="h-3.5 w-3.5 text-accent" />
            Topic library · {entry.count} articles
          </div>
          <h1 className="mt-7 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.35rem]">
            {entry.label} guides
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {entry.posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

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
