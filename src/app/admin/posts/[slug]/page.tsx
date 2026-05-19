import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { getPostIncludingDraft } from "@/lib/blog";
import { PostEditor } from "../PostEditor";

export default async function EditPostPage({ params }: { params: { slug: string } }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const post = await getPostIncludingDraft(params.slug);
  if (!post) notFound();
  return (
    <PostEditor
      mode="edit"
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
      }}
    />
  );
}
