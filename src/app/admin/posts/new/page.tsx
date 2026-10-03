import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { getAllPosts } from "@/lib/blog";
import { nextFreeSlots } from "@/lib/blogSchedule";
import { PostEditor } from "../PostEditor";

export const metadata = { title: "New post · Admin" };

export default async function NewPostPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const today = new Date().toISOString().slice(0, 10);
  const posts = await getAllPosts({ includeDrafts: true });
  const [nextSlot] = nextFreeSlots(posts.map((p) => p.publishAt), 1);
  return (
    <PostEditor
      mode="create"
      nextSlot={nextSlot}
      initial={{
        title: "",
        description: "",
        date: today,
        author: "Form5472 Prep team",
        tags: "",
        draft: true,
        content: "",
        schedule: false,
        publishDate: "",
        publishTime: "09:00",
      }}
    />
  );
}
