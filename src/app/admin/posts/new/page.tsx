import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { PostEditor } from "../PostEditor";

export default async function NewPostPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const today = new Date().toISOString().slice(0, 10);
  return (
    <PostEditor
      mode="create"
      initial={{
        title: "",
        description: "",
        date: today,
        author: "Form5472 Prep team",
        tags: "",
        draft: true,
        content: "",
      }}
    />
  );
}
