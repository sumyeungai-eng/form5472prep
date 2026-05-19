import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { getAllPosts, getPost, formatPostDate } from "@/lib/blog";
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
    <article className="max-w-3xl mx-auto px-6 py-16">
      <JsonLd data={articleJsonLd} />
      <Link
        href="/blog"
        className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        All posts
      </Link>

      <header className="mt-8 mb-10">
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

      <aside className="mt-16 rounded-lg bg-accent-50 border border-accent/20 p-6 text-center">
        <h2 className="font-semibold text-slate-900">Ready to file your Form 5472?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Get the package generated, signed, and faxed to the IRS in 15 minutes.
        </p>
        <Link
          href="/start"
          className="inline-flex items-center justify-center mt-4 h-10 px-4 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-700"
        >
          Start filing — $169 plus a flat $29
        </Link>
      </aside>
    </article>
  );
}
