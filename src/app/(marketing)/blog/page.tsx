import type { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";
import { pageMeta } from "@/lib/seo";
import { BLOG_DESCRIPTION, BlogIndexView } from "./_components/BlogIndexView";

// ISR: posts published from /admin live in the database, so the index has to
// re-render without a redeploy. Admin writes also revalidatePath("/blog") for
// an immediate refresh; this is the safety net.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: BLOG_DESCRIPTION,
  ...pageMeta({
    title: "Blog · Form5472 Prep",
    description: BLOG_DESCRIPTION,
    path: "/blog",
  }),
};

// Page 1 of the paginated index: the newest posts. Older posts are at
// /blog/page/[n] (see ./page/[n]/page.tsx); both render BlogIndexView.
export default async function BlogIndex() {
  const posts = await getAllPosts();
  return <BlogIndexView posts={posts} page={1} />;
}
