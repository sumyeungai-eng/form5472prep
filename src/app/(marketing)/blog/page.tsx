import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { getAllPosts, formatPostDate, type PostMeta } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides and explainers for foreign-owned US LLC owners filing IRS Form 5472 and pro forma Form 1120.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog · Form5472 Prep",
    description:
      "Guides and explainers for foreign-owned US LLC owners filing IRS Form 5472 and pro forma Form 1120.",
    url: "/blog",
  },
};

export default async function BlogIndex() {
  const posts = await getAllPosts();
  const [featured, ...rest] = posts;
  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }
  const popularTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="bg-[#f8f9fb]">
      <BlogHeader postCount={posts.length} tags={popularTags} />
      <div className="mx-auto max-w-6xl px-6 pb-24">
        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {featured && <FeaturedCard post={featured} />}
            {rest.length > 0 && (
              <section className="mt-16" aria-labelledby="all-guides-heading">
                <div className="mb-7 flex items-end justify-between gap-6">
                  <div>
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                      Knowledge library
                    </p>
                    <h2 id="all-guides-heading" className="mt-2 font-serif text-3xl font-semibold tracking-tight text-ink">
                      More practical guides
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
            <FilingPanel />
          </>
        )}
      </div>
    </div>
  );
}

function BlogHeader({ postCount, tags }: { postCount: number; tags: [string, number][] }) {
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
          {tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map(([tag, count]) => (
                <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs text-slate-700">
                  {formatTag(tag)}
                  <span className="font-mono text-[10px] text-slate-400">{count}</span>
                </span>
              ))}
            </div>
          )}
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
            Educational content, not tax advice. Every guide links back to primary IRS guidance where relevant.
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

function PostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_-32px_rgba(15,23,42,0.5)] transition duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_24px_55px_-32px_rgba(30,58,138,0.35)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image
          src={post.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <PostMetaLine post={post} compact />
        <h3 className="mt-4 font-serif text-xl font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{post.description}</p>
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-xs font-medium text-slate-500">{formatTag(post.tags?.[1] ?? post.tags?.[0] ?? "Filing guide")}</span>
          <span className="inline-flex items-center text-xs font-semibold text-accent">
            Read <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostMetaLine({ post, compact = false }: { post: PostMeta; compact?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${compact ? "text-[11px]" : "text-xs"} font-medium text-slate-500`}>
      <span className="inline-flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5 text-accent" />
        {formatPostDate(post.date)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-accent" />
        {post.readingMinutes} min read
      </span>
    </div>
  );
}

function AuthorChip({ author }: { author: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-accent/15 bg-accent-50 p-1.5">
        <Image src="/logo-mark.svg" alt="" fill sizes="32px" className="object-contain p-1.5" />
      </div>
      <span className="text-sm text-slate-700">{author}</span>
    </div>
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

function formatTag(tag: string): string {
  return tag.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
