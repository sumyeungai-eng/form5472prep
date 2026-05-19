import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileText, BookOpen, Calendar, Clock } from "lucide-react";
import { getAllPosts, formatPostDate, type PostMeta } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides and explainers for foreign-owned US LLC owners filing IRS Form 5472 and pro forma Form 1120.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndex() {
  const posts = await getAllPosts();
  const [featured, ...rest] = posts;

  // Count tag frequency across all posts so we can show the most-used as chips.
  const tagCounts = new Map<string, number>();
  for (const p of posts) for (const t of p.tags ?? []) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const popularTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <>
      <Header postCount={posts.length} tags={popularTags} />
      <div className="max-w-5xl mx-auto px-6 pb-24">
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {featured && <FeaturedCard post={featured} />}
            {rest.length > 0 && (
              <section className="mt-14">
                <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500 mb-6">
                  More posts
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {rest.map((p) => (
                    <PostCard key={p.slug} post={p} />
                  ))}
                </div>
              </section>
            )}
            <NewsletterPanel />
          </>
        )}
      </div>
    </>
  );
}

function Header({
  postCount,
  tags,
}: {
  postCount: number;
  tags: [string, number][];
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-accent-50 to-white">
      {/* subtle dotted background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #1e3a8a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
          <BookOpen className="h-3.5 w-3.5 text-accent" />
          {postCount} {postCount === 1 ? "post" : "posts"}
        </div>
        <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 text-balance">
          Form 5472 and Form 1120 guides,<br />
          <span className="text-accent">written for humans.</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl">
          Practical explainers for foreign-owned US LLC owners. The IRS rules in plain English,
          with the edge cases that actually trip people up.
        </p>
        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500 mr-2 self-center">
              Topics:
            </span>
            {tags.map(([t, count]) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-full px-3 py-1"
              >
                {t}
                <span className="text-slate-400">{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block mt-12 rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-accent transition-colors"
    >
      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent text-white px-2.5 py-0.5 font-medium">
              Latest
            </span>
            <span className="text-slate-500 inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatPostDate(post.date)}
            </span>
            <span className="text-slate-500 inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingMinutes} min read
            </span>
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 group-hover:text-accent transition-colors text-balance">
            {post.title}
          </h2>
          <p className="mt-4 text-slate-600">{post.description}</p>
          <div className="mt-6 flex items-center justify-between">
            <AuthorChip author={post.author ?? "Form5472 Prep team"} />
            <span className="inline-flex items-center text-sm font-medium text-accent">
              Read post
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>

        {/* Decorative side panel — accent gradient with the "5472" mark */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-accent to-accent-700 p-8">
          <svg viewBox="0 0 64 64" className="h-32 w-32 text-white/20">
            <path d="M10 6 H42 L58 22 V58 H10 Z" fill="currentColor" />
            <path
              d="M42 6 V22 H58"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
              opacity="0.7"
            />
            <text
              x="34"
              y="48"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontWeight="800"
              fontSize="16"
              fill="white"
              opacity="0.95"
            >
              5472
            </text>
          </svg>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-lg border border-slate-200 bg-white p-6 hover:border-accent hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatPostDate(post.date)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {post.readingMinutes} min
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-accent transition-colors text-balance">
        {post.title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 line-clamp-3">{post.description}</p>
      {post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[11px] text-slate-600 bg-slate-100 rounded px-2 py-0.5"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <AuthorChip author={post.author ?? "Form5472 Prep team"} compact />
        <span className="inline-flex items-center text-xs text-accent">
          Read
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function AuthorChip({ author, compact = false }: { author: string; compact?: boolean }) {
  // Simple text-initial avatar — no third-party image dep, no GDPR mess.
  const initials = author
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const size = compact ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <div className="flex items-center gap-2">
      <div
        className={`${size} rounded-full bg-accent-50 text-accent font-semibold flex items-center justify-center border border-accent/20`}
      >
        {initials || "F"}
      </div>
      <span className={`${compact ? "text-xs" : "text-sm"} text-slate-700`}>{author}</span>
    </div>
  );
}

function NewsletterPanel() {
  return (
    <section className="mt-20 rounded-xl border border-slate-200 bg-slate-50 p-8 sm:p-12 text-center">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
        Ready to file?
      </h2>
      <p className="mt-3 text-slate-600 max-w-xl mx-auto">
        Reading is one thing — filing is what avoids the $25,000 penalty. Get your Form 5472
        and pro forma Form 1120 prepared, signed, and faxed to the IRS in about 15 minutes.
      </p>
      <Link
        href="/start"
        className="inline-flex items-center justify-center mt-6 h-11 px-5 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-700"
      >
        Start filing — $169 plus a flat $29
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
      <p className="mt-3 text-xs text-slate-500">
        100% money-back guarantee if we fail to submit.
      </p>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="mt-20 rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
      <FileText className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-4 font-medium text-slate-900">No posts published yet.</p>
      <p className="mt-1 text-sm text-slate-500">
        Drop a markdown file in <code>content/blog/</code> or use the admin editor.
      </p>
    </div>
  );
}
