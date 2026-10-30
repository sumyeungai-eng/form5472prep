import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import type { PostMeta } from "@/lib/blog";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, breadcrumbList } from "@/lib/seo";
import { buildTagIndex, formatTag, isIndexableHub, tagHref, type TagEntry } from "@/lib/blog-tags";
import { blogPagePath, pageRange, pageSlice, POSTS_PER_PAGE, totalPages } from "@/lib/blog-pagination";
import { COUNTRY_HUB_PATH } from "@/lib/blog-countries";
import { AuthorChip, PostCard, PostMetaLine } from "./PostCard";
import { Pager } from "./Pager";

export const BLOG_DESCRIPTION =
  "Practical guides for foreign-owned US LLC owners filing Form 5472, pro forma Form 1120, EINs, ITINs, penalties, deadlines, and catch-up returns.";

/**
 * The blog index, shared by /blog (page 1) and /blog/page/[n] (older posts).
 * `posts` is the full newest-first list; this slices out the page. The caller
 * has already validated that `page` exists.
 */
export function BlogIndexView({ posts, page }: { posts: PostMeta[]; page: number }) {
  const pages = totalPages(posts.length);
  const pagePosts = pageSlice(posts, page);
  const offset = (page - 1) * POSTS_PER_PAGE;
  const range = pageRange(page, posts.length);
  // Page 1 leads with one featured card; older pages are a plain grid.
  const [featured, rest] = page === 1 ? [pagePosts[0], pagePosts.slice(1)] : [undefined, pagePosts];
  // Only indexable topic hubs are linked (thin topic pages are noindex).
  const popularTags = buildTagIndex(posts)
    .filter(isIndexableHub)
    .slice(0, 6);
  const path = blogPagePath(page);
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page === 1 ? "The Form 5472 Guide" : `The Form 5472 Guide, page ${page}`,
    url: `${SITE_URL}${path}`,
    description: BLOG_DESCRIPTION,
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
    ...(page > 1 ? [{ name: `Page ${page}`, path }] : []),
  ];

  return (
    <div className="bg-[#f8f9fb]">
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={breadcrumbList(crumbs)} />
      {page === 1 ? (
        <BlogHeader postCount={posts.length} tags={popularTags} />
      ) : (
        <PagedHeader page={page} pages={pages} from={range.from} to={range.to} count={posts.length} tags={popularTags} />
      )}
      <div className="mx-auto max-w-6xl px-6 pb-24">
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {featured && <FeaturedCard post={featured} />}
            {rest.length > 0 && (
              <section className={page === 1 ? "mt-16" : "mt-12"} aria-labelledby="all-guides-heading">
                <div className="mb-7 flex items-end justify-between gap-6">
                  <div>
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                      Knowledge library
                    </p>
                    <h2 id="all-guides-heading" className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink">
                      {page === 1 ? "More practical guides" : `Guides ${range.from}\u2013${range.to}`}
                    </h2>
                  </div>
                  <p className="hidden max-w-sm text-right text-sm leading-6 text-slate-500 md:block">
                    Written for international founders who need a clear answer, not another page of tax jargon.
                  </p>
                </div>
                <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            )}
            <Pager page={page} pages={pages} pathFor={blogPagePath} />
            <FilingPanel />
          </>
        )}
      </div>
    </div>
  );
}

function TopicChips({ tags }: { tags: TagEntry[] }) {
  if (tags.length === 0) return null;
  return (
  <div className="mt-8 flex flex-wrap gap-2">
    {tags.map((entry) => (
      <Link
        key={entry.tag}
        href={tagHref(entry.tag)}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs text-slate-700 transition hover:border-accent/30 hover:text-accent hover:shadow-sm"
      >
        {formatTag(entry.tag)}
        <span className="font-mono text-[10px] text-slate-400">{entry.count}</span>
      </Link>
    ))}
    <Link
      href={COUNTRY_HUB_PATH}
      className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-accent hover:underline"
    >
      Form 5472 by country →
    </Link>
    <Link
      href="/blog/topics"
      className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-accent hover:underline"
    >
      All topics →
    </Link>
  </div>
  );
}

function PagedHeader({
  page,
  pages,
  from,
  to,
  count,
  tags,
}: {
  page: number;
  pages: number;
  from: number;
  to: number;
  count: number;
  tags: TagEntry[];
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-paper">
      <div className="relative mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
          <BookOpen className="h-3.5 w-3.5 text-accent" />
          The Form 5472 guide · page {page} of {pages}
        </div>
        <h1 className="mt-6 max-w-3xl font-serif text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
          Form 5472 guides, <span className="text-accent">page {page}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Guides {from}&ndash;{to} of {count}, newest first. Practical explainers for foreign-owned US LLCs covering Form 5472, pro forma Form 1120, deadlines, and penalties.
        </p>
        <TopicChips tags={tags} />
      </div>
    </section>
  );
}

function BlogHeader({ postCount, tags }: { postCount: number; tags: TagEntry[] }) {
  return (
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
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
            <BookOpen className="h-3.5 w-3.5 text-accent" />
            The Form 5472 guide · {postCount} articles
          </div>
          <h1 className="mt-7 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.65rem]">
            US tax guidance for <span className="text-accent">international LLC owners.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Practical, carefully researched explainers for foreign-owned US LLCs—covering Form 5472, pro forma Form 1120, deadlines, and the edge cases that matter.
          </p>
          <TopicChips tags={tags} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            Built for confident filing
          </p>
          <ul className="mt-5 space-y-4">
            {[
              "Plain-English explanations",
              "Country-specific filing guidance",
              "Deadlines, costs, and penalty prevention",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
            General information, not personalised tax planning. For advice on your own situation, speak to a tax professional.
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group mt-12 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)] transition duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_30px_80px_-40px_rgba(30,58,138,0.38)] lg:grid-cols-[1.08fr_0.92fr]"
    >
      <div className="relative min-h-[290px] overflow-hidden lg:min-h-[420px]">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          priority
          sizes="(min-width: 1024px) 600px, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
        <span className="absolute left-5 top-5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-accent shadow-sm backdrop-blur">
          Latest guide
        </span>
      </div>
      <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-11">
        <PostMetaLine post={post} />
        <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-tight text-ink transition-colors group-hover:text-accent sm:text-4xl">
          {post.title}
        </h2>
        <p className="mt-5 text-base leading-7 text-slate-600">{post.description}</p>
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          <AuthorChip author={post.author ?? "Form5472 Prep"} />
          <span className="inline-flex items-center text-sm font-semibold text-accent">
            Read guide
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function FilingPanel() {
  return (
    <section className="relative mt-20 overflow-hidden rounded-2xl bg-ink px-7 py-10 text-white shadow-[0_30px_80px_-45px_rgba(14,27,51,0.8)] sm:px-10 lg:px-14 lg:py-14">
      <div aria-hidden className="absolute -right-20 -top-32 h-96 w-96 rounded-full border-[70px] border-white/[0.04]" />
      <div className="relative grid items-center gap-9 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Secure, guided preparation
          </div>
          <h2 className="mt-5 max-w-2xl font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Turn what you learned into a complete filing package.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Answer a guided questionnaire and receive your Form 5472 plus pro forma Form 1120, ready for review, signature, and submission.
          </p>
        </div>
        <Link href="/start" className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-ink shadow-sm transition hover:bg-accent-50">
          Start your filing
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="mt-20 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <FileText className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-4 font-medium text-slate-900">No posts published yet.</p>
      <p className="mt-1 text-sm text-slate-500">New filing guides will appear here.</p>
    </div>
  );
}
