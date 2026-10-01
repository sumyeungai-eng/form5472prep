import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, BookOpen, Tags } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL, breadcrumbList, pageMeta } from "@/lib/seo";
import { seoTitle } from "@/lib/seo-title";
import { buildTagIndex, MIN_INDEXABLE_TAG_POSTS, tagHref } from "@/lib/blog-tags";

// Parent of every /blog/topics/[tag] page. Until 2026-10-01 this path 404'd
// while 280 child pages existed. Same ISR cadence as the tag pages.
export const revalidate = 60;

const PATH = "/blog/topics";
const TITLE = "Form 5472 Guide Topics";
const DESCRIPTION =
  "Browse every Form5472 Prep guide by topic: Form 5472, EINs, ITINs, FTINs, penalties, deadlines and records for foreign-owned US LLC owners.";

export const metadata: Metadata = {
  title: seoTitle(TITLE),
  description: DESCRIPTION,
  ...pageMeta({ title: `${TITLE} · Form5472 Prep`, description: DESCRIPTION, path: PATH }),
};

export default async function TopicsIndexPage(): Promise<JSX.Element> {
  const posts = await getAllPosts();
  const entries = buildTagIndex(posts);
  const hubs = entries.filter((entry) => entry.count >= MIN_INDEXABLE_TAG_POSTS);
  const more = entries
    .filter((entry) => entry.count < MIN_INDEXABLE_TAG_POSTS && entry.count > 1)
    .sort((a, b) => a.label.localeCompare(b.label));

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    url: `${SITE_URL}${PATH}`,
    description: DESCRIPTION,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: hubs.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}${tagHref(entry.tag)}`,
        name: `${entry.label} guides`,
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
          { name: "Topics", path: PATH },
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
            <Tags className="h-3.5 w-3.5 text-accent" />
            {entries.length} topics · {posts.length} articles
          </div>
          <h1 className="mt-7 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.35rem]">
            Form 5472 guides by topic
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Every guide in our library is tagged by the form, the filing problem or the kind of owner it is written
            for. Start with a topic below to see all the related guides in one place, from first-year Form 5472 and
            pro forma 1120 filings to EIN and ITIN applications, late-filing relief and the records a foreign owner
            should keep.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12">
        <section aria-labelledby="main-topics-heading">
          <h2 id="main-topics-heading" className="font-serif text-2xl font-semibold tracking-tight text-ink">
            Main topics
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            The subjects we cover in the most depth, each with at least {MIN_INDEXABLE_TAG_POSTS} guides.
          </p>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hubs.map((entry) => (
              <li key={entry.tag}>
                <Link
                  href={tagHref(entry.tag)}
                  className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-accent/30 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 font-serif text-xl font-semibold text-ink group-hover:text-accent">
                      <BookOpen className="h-4 w-4 text-accent" />
                      {entry.label}
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
                      {entry.count} guides
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                    {entry.posts.slice(0, 3).map((post) => (
                      <li key={post.slug} className="line-clamp-2">
                        {post.title}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center pt-5 text-sm font-semibold text-accent">
                    See all {entry.label} guides
                    <ArrowRight className="ml-1.5 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {more.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-9" aria-labelledby="more-topics-heading">
            <h2 id="more-topics-heading" className="font-serif text-2xl font-semibold tracking-tight text-ink">
              More topics
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Narrower subjects with a handful of guides each.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {more.map((topic) => (
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
          <Link
            href="/start"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-ink px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent"
          >
            Start your filing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
