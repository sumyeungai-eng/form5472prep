import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, Calendar, ChevronLeft, Clock, ShieldCheck } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts, getPost, formatPostDate, type PostMeta } from "@/lib/blog";
import { env } from "@/lib/env";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  const url = `${env.appUrl}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: new Date(post.date).toISOString(),
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    keywords: post.tags,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // Surface up to 5 other posts in the right-side rail. Ordering is whatever
  // getAllPosts returns (newest-first based on date frontmatter), filtered to
  // exclude the current article.
  const allPosts = await getAllPosts();
  const otherPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 5);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    author: { "@type": "Organization", name: post.author ?? "Form5472 Prep" },
    publisher: {
      "@type": "Organization",
      name: "Form5472 Prep",
      logo: { "@type": "ImageObject", url: `${env.appUrl}/logo-mark.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${env.appUrl}/blog/${post.slug}` },
    keywords: post.tags?.join(", "),
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <JsonLd data={articleJsonLd} />
      <Link
        href="/blog"
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        All posts
      </Link>

      <div className="mt-8 grid lg:grid-cols-[minmax(0,1fr)_320px] gap-12">
        <article>
          <header className="mb-10">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 text-balance">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-slate-600">{post.description}</p>
            <p className="mt-4 text-sm text-slate-500">
              {formatPostDate(post.date)} · {post.readingMinutes} min read
              {post.author ? ` · ${post.author}` : ""}
            </p>
          </header>

          <div className="prose prose-slate max-w-none prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-headings:tracking-tight">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="text-xs text-slate-600 bg-slate-100 rounded-full px-3 py-1">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Mobile CTA — sidebar collapses on small screens, so repeat the
              "start filing" prompt under the article on phones/tablets. */}
          <aside className="lg:hidden mt-12 rounded-lg bg-accent-50 border border-accent/20 p-6 text-center">
            <h2 className="font-semibold text-slate-900">Ready to file your Form 5472?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Generated, signed, and faxed to the IRS in 15 minutes.
            </p>
            <Link
              href="/start"
              className="inline-flex items-center justify-center mt-4 h-10 px-4 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-700"
            >
              Start filing
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </aside>
        </article>

        {/* Right rail — sticky on desktop so the CTA + post list stays in
            view as the reader scrolls through the article. */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-6">
            <BlogCta />
            {otherPosts.length > 0 && <OtherPosts posts={otherPosts} />}
          </div>
        </aside>
      </div>
    </div>
  );
}

function BlogCta() {
  return (
    <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent-50 to-white p-6">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700">
        <ShieldCheck className="h-3 w-3 text-accent" />
        Accountant-reviewed
      </div>
      <h2 className="mt-4 font-semibold text-slate-900 text-lg leading-snug">
        File your Form 5472 in 15 minutes.
      </h2>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
        We generate the full package, you sign once on screen, our accountant reviews it, and we fax
        it to the IRS Ogden PIN Unit.
      </p>
      <Link
        href="/start"
        className="mt-5 inline-flex w-full items-center justify-center h-10 px-4 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-700 shadow-sm transition-colors"
      >
        Start filing
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Link>
      <p className="mt-3 text-[11px] text-slate-500 text-center">
        From $199 · 100% money-back guarantee
      </p>
    </div>
  );
}

function OtherPosts({ posts }: { posts: PostMeta[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        More from the blog
      </h3>
      <ul className="mt-4 space-y-4">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="group block">
              <p className="text-sm font-medium text-slate-900 group-hover:text-accent transition-colors leading-snug">
                {p.title}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatPostDate(p.date)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {p.readingMinutes} min
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/blog"
        className="mt-5 inline-flex items-center text-xs font-medium text-accent hover:underline"
      >
        See all posts
        <ArrowRight className="ml-1 h-3 w-3" />
      </Link>
    </div>
  );
}
