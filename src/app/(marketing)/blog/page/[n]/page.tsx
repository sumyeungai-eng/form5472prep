import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/blog";
import { blogPagePath, pageRange, parsePageParam, totalPages } from "@/lib/blog-pagination";
import { pageMeta } from "@/lib/seo";
import { BlogIndexView } from "../../_components/BlogIndexView";

// Older pages of the blog index: /blog is page 1, /blog/page/2.. hold the rest.
// Same ISR window as /blog so a newly published post shows up everywhere
// within a minute.
export const revalidate = 60;

// A page that did not exist at build time (the post count crossed a multiple
// of the page size, e.g. page 9 at 8 x 24 + 1 posts) renders on demand instead
// of 404ing until the next deploy. Keep this true: resolvePage() still
// 404s page numbers that do not exist yet.
export const dynamicParams = true;

// Prerender every page that exists at build time; a page created later (the
// post count crossed a multiple of the page size) renders on demand.
export async function generateStaticParams(): Promise<{ n: string }[]> {
  const pages = totalPages((await getAllPosts()).length);
  return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({ n: String(i + 2) }));
}

/** The requested page number, or null if it is not an existing page >= 2. */
async function resolvePage(raw: string) {
  const page = parsePageParam(raw);
  if (page === null) return null;
  const posts = await getAllPosts();
  const pages = totalPages(posts.length);
  return page <= pages ? { page, pages, posts } : null;
}

export async function generateMetadata({ params }: { params: { n: string } }): Promise<Metadata> {
  const resolved = await resolvePage(params.n);
  if (!resolved) return { title: "Page not found", robots: { index: false, follow: false } };

  const { page, pages, posts } = resolved;
  const { from, to } = pageRange(page, posts.length);
  const description = `Page ${page} of ${pages}: guides ${from}–${to} of ${posts.length} on Form 5472, pro forma Form 1120, EINs, ITINs, penalties and deadlines for foreign-owned US LLC owners.`;

  return {
    title: `Blog – page ${page}`,
    description,
    ...pageMeta({
      title: `Blog – page ${page} · Form5472 Prep`,
      description,
      path: blogPagePath(page),
    }),
  };
}

export default async function BlogIndexPage({ params }: { params: { n: string } }) {
  const resolved = await resolvePage(params.n);
  if (!resolved) notFound();
  return <BlogIndexView posts={resolved.posts} page={resolved.page} />;
}
