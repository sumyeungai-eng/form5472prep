import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  Clock,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { BlogToc, extractH2Headings } from "@/components/BlogToc";
import {
  getAllPosts,
  getPost,
  formatPostDate,
  extractFaqs,
  extractHowTo,
  blogSlugFromHref,
  type PostMeta,
} from "@/lib/blog";
import { env } from "@/lib/env";
import { SPEAKABLE, pageOpenGraph } from "@/lib/seo";

// ISR: prerender the slugs known at build time, but `dynamicParams` lets a post
// published from /admin (DB-only, so absent from the build) render on first
// request instead of 404ing until the next deploy.
export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  const image = `/blog/${post.slug}/opengraph-image`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      ...pageOpenGraph({
        title: post.title,
        description: post.description,
        path: `/blog/${post.slug}`,
        type: "article",
        images: [{ url: image, width: 1200, height: 630 }],
      }),
      publishedTime: new Date(post.publishAt ?? post.date).toISOString(),
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
    } as NonNullable<Metadata["openGraph"]>,
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image],
    },
    keywords: post.tags,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const allPosts = await getAllPosts();
  const publishedSlugs = new Set(allPosts.map((p) => p.slug));
  const otherPosts = allPosts.filter((candidate) => candidate.slug !== post.slug).slice(0, 4);
  const articleJsonLd = {
    "@type": "BlogPosting",
    "@id": `${env.appUrl}/blog/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    image: `${env.appUrl}${post.image}`,
    datePublished: new Date(post.publishAt ?? post.date).toISOString(),
    dateModified: new Date(post.updated ?? post.publishAt ?? post.date).toISOString(),
    speakable: SPEAKABLE,
    author: { "@id": `${env.appUrl}#organization` },
    publisher: { "@id": `${env.appUrl}#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${env.appUrl}/blog/${post.slug}` },
    keywords: post.tags?.join(", "),
  };
  const breadcrumbJsonLd = {
    "@type": "BreadcrumbList",
    "@id": `${env.appUrl}/blog/${post.slug}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: env.appUrl },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${env.appUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${env.appUrl}/blog/${post.slug}` },
    ],
  };
  const faqs = extractFaqs(post.body);
  const howTo = extractHowTo(post.body);
  const tocHeadings = extractH2Headings(post.body);
  const faqJsonLd = faqs.length >= 2
    ? {
        "@type": "FAQPage",
        "@id": `${env.appUrl}/blog/${post.slug}#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      }
    : null;
  const howToJsonLd = howTo
    ? {
        "@type": "HowTo",
        "@id": `${env.appUrl}/blog/${post.slug}#howto`,
        name: howTo.name,
        step: howTo.steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      }
    : null;
  const organizationJsonLd = {
    "@type": "Organization",
    "@id": `${env.appUrl}#organization`,
    name: "Form5472 Prep",
    url: env.appUrl,
    logo: { "@type": "ImageObject", url: `${env.appUrl}/logo-mark.svg` },
  };
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      articleJsonLd,
      organizationJsonLd,
      breadcrumbJsonLd,
      ...(faqJsonLd ? [faqJsonLd] : []),
      ...(howToJsonLd ? [howToJsonLd] : []),
    ],
  };

  return (
    <div className="bg-[#f8f9fb] pb-24">
      <JsonLd data={schemaGraph} />

      <article>
        <header className="relative overflow-hidden border-b border-slate-200 bg-paper">
          <div aria-hidden className="absolute -right-24 -top-48 h-[520px] w-[520px] rounded-full bg-accent-100/70 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-10 lg:pb-16">
            <Link href="/blog" className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-accent">
              <ChevronLeft className="mr-1 h-4 w-4" />
              All guides
            </Link>

            <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)]">
              <div>
                {post.tags && post.tags.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full border border-accent/15 bg-white px-3 py-1 text-[11px] font-semibold text-accent shadow-sm">
                        {formatTag(tag)}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.35rem]">
                  {post.title}
                </h1>
                <p data-speakable className="mt-6 text-lg leading-8 text-slate-600">{post.description}</p>
                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent" />
                    {formatPostDate(post.date)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    {post.readingMinutes} min read
                  </span>
                </div>
                <div className="mt-7 flex items-center gap-3 border-t border-slate-200 pt-6">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-accent/15 bg-white">
                    <Image src="/logo-mark.svg" alt="" fill sizes="40px" className="object-contain p-2" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{post.author ?? "Form5472 Prep"}</p>
                    <p className="text-xs text-slate-500">Reviewed filing guidance for foreign-owned LLCs</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/80 bg-slate-100 shadow-[0_28px_70px_-35px_rgba(15,23,42,0.5)]">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 600px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5" />
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-12 lg:grid-cols-[minmax(0,1fr)_310px] lg:gap-14">
          <div className="min-w-0">
            <div className="mb-8 grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
              {[
                ["Plain English", "No dense tax-code language"],
                ["Actionable", "Clear next steps and deadlines"],
                [
                  "Current",
                  post.updated
                    ? `Last updated ${formatPostDate(post.updated)}`
                    : `Published ${formatPostDate(post.publishAt ?? post.date)}`,
                ],
              ].map(([label, detail]) => (
                <div key={label} className="flex items-start gap-3 sm:border-r sm:border-slate-100 sm:last:border-0">
                  <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-ink">{label}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <BlogToc headings={tocHeadings} />

            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-9 shadow-[0_18px_55px_-45px_rgba(15,23,42,0.45)] sm:px-10 sm:py-12">
              <div className="prose prose-slate max-w-none prose-p:leading-8 prose-li:leading-7 prose-a:font-medium prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-headings:font-serif prose-headings:tracking-tight prose-headings:text-ink prose-h2:mt-12 prose-h2:border-t prose-h2:border-slate-100 prose-h2:pt-10 prose-h2:text-3xl prose-h3:mt-8 prose-h3:text-xl prose-blockquote:rounded-r-lg prose-blockquote:border-l-accent prose-blockquote:bg-accent-50/60 prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:not-italic prose-table:text-sm prose-th:bg-slate-50">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSlug]}
                  components={{
                    a: ({ href, children, node: _node, ...props }) => {
                      const slug = blogSlugFromHref(href);
                      // Scheduled sibling posts 404 until publishAt; ISR will restore the link after release.
                      if (slug && !publishedSlugs.has(slug)) return <span>{children}</span>;
                      return <a href={href} {...props}>{children}</a>;
                    },
                  }}
                >
                  {post.body}
                </ReactMarkdown>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                      {formatTag(tag)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <aside className="mt-10 rounded-2xl bg-ink p-7 text-center text-white lg:hidden">
              <h2 className="font-serif text-2xl font-semibold">Ready to prepare your Form 5472?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Complete the guided questionnaire and receive a filing-ready package.</p>
              <Link href="/start" className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-ink">
                Start your filing <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </aside>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-8 space-y-6">
              <BlogCta />
              {otherPosts.length > 0 && <OtherPosts posts={otherPosts} />}
              <div className="px-2 text-[11px] leading-5 text-slate-500">
                This article is educational and does not constitute tax or legal advice. Your facts may require professional review.
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}

function BlogCta() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white shadow-[0_24px_55px_-35px_rgba(14,27,51,0.85)]">
      <div aria-hidden className="absolute -right-16 -top-16 h-44 w-44 rounded-full border-[34px] border-white/[0.04]" />
      <div className="relative">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/80">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          Guided preparation
        </div>
        <h2 className="mt-5 font-serif text-2xl font-semibold leading-tight">Prepare your filing with confidence.</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          We turn your answers into a Form 5472 and pro forma Form 1120 package ready for review and signature.
        </p>
        <Link href="/start" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-ink transition hover:bg-accent-50">
          Start your filing <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <p className="mt-3 text-center text-[11px] text-slate-400">Secure online intake · Clear fixed pricing</p>
      </div>
    </div>
  );
}

function OtherPosts({ posts }: { posts: PostMeta[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Continue reading</h3>
      <ul className="mt-4 space-y-5">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group grid grid-cols-[72px_1fr] gap-3">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                <Image src={post.image} alt="" fill sizes="72px" className="object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-3 text-sm font-semibold leading-snug text-ink transition-colors group-hover:text-accent">{post.title}</p>
                <p className="mt-1.5 text-[11px] text-slate-500">{post.readingMinutes} min read</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/blog" className="mt-5 inline-flex items-center text-xs font-semibold text-accent hover:underline">
        Browse all guides <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function formatTag(tag: string): string {
  return tag.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
