import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { getAllPosts, getPostIncludingDraft } from "@/lib/blog";
import { londonHhmm, londonYmd, nextFreeSlots, parsePublishAt } from "@/lib/blogSchedule";
import { PostEditor } from "../PostEditor";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostIncludingDraft(params.slug);
  return { title: post ? `${post.title} · Blog posts · Admin` : "Edit post · Admin" };
}

export default async function EditPostPage({ params }: { params: { slug: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const post = await getPostIncludingDraft(params.slug);
  if (!post) notFound();
  const posts = await getAllPosts({ includeDrafts: true });
  const [nextSlot] = nextFreeSlots(posts.map((p) => p.publishAt), 1);
  // A valid publishAt (past or future) is kept as a schedule so re-saving
  // doesn't move the post's release time; an unresolved "auto" opens on
  // Schedule with no date so the admin must pick one.
  const releaseAt = parsePublishAt(post.publishAt);
  return (
    <PostEditor
      mode="edit"
      nextSlot={nextSlot}
      originalSlug={post.slug}
      initial={{
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date.slice(0, 10),
        author: post.author ?? "",
        tags: (post.tags ?? []).join(", "),
        draft: !!post.draft,
        content: post.body,
        schedule: !!post.publishAt,
        publishDate: releaseAt ? londonYmd(releaseAt) : "",
        publishTime: releaseAt ? londonHhmm(releaseAt) : "09:00",
      }}
    />
  );
}
