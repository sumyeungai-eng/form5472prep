import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, FileText } from "lucide-react";
import { isAdmin } from "@/lib/admin/auth";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { Button } from "@/components/ui/button";

export default async function AdminPostsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const posts = await getAllPosts({ includeDrafts: true });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Blog posts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Posts are saved as markdown files in <code>content/blog/</code>.
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-4 font-medium text-slate-900">No posts yet</p>
          <p className="mt-1 text-sm text-slate-500">Write the first one.</p>
          <Link href="/admin/posts/new" className="inline-block mt-4">
            <Button>New post</Button>
          </Link>
        </div>
      ) : (
        <ul className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/admin/posts/${p.slug}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 truncate">{p.title}</p>
                    {p.draft && (
                      <span className="text-[11px] font-medium rounded-full bg-amber-100 text-amber-800 px-2 py-0.5">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <code className="text-slate-600">{p.slug}</code> · {formatPostDate(p.date)} ·{" "}
                    {p.readingMinutes} min
                  </p>
                </div>
                <span className="text-xs text-slate-400">Edit →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
