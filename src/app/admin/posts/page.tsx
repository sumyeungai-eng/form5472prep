import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, FileText, CalendarClock } from "lucide-react";
import { isAdmin } from "@/lib/admin/auth";
import { getAllPosts, formatPostDate } from "@/lib/blog";
import { formatLondon, isUnresolvedPublishAt, nextFreeSlots, parsePublishAt } from "@/lib/blogSchedule";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "../_components/AdminPageHeader";

export const metadata = { title: "Blog posts · Admin" };

export default async function AdminPostsPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const posts = await getAllPosts({ includeDrafts: true });
  const now = Date.now();
  const releaseOf = (p: (typeof posts)[number]) => parsePublishAt(p.publishAt)?.getTime() ?? null;
  const queue = posts
    .filter((p) => !p.draft && (releaseOf(p) ?? 0) > now)
    .sort((a, b) => releaseOf(a)! - releaseOf(b)!);
  const unresolved = posts.filter((p) => isUnresolvedPublishAt(p.publishAt));
  const [nextSlot] = nextFreeSlots(posts.map((p) => p.publishAt), 1);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <AdminPageHeader
        title="Blog posts"
        description="Guides published on /blog. Scheduled posts go live by themselves at their time (09:00 London, one a day). Drafts are never public."
        actions={
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New post
          </Button>
        </Link>
        }
      />

      <section className="mb-6 bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <CalendarClock className="h-4 w-4 text-slate-500" />
            Publishing queue
          </h2>
          <p className="text-xs text-slate-500">
            {queue.length === 0
              ? "Nothing scheduled."
              : `${queue.length} scheduled · last one goes live ${formatLondon(queue[queue.length - 1].publishAt!)}`}
            {" · "}next free day {formatLondon(nextSlot)}
          </p>
        </div>
        {unresolved.length > 0 && (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
            {unresolved.length} post{unresolved.length === 1 ? " has" : "s have"} no valid publish time
            (e.g. <code>publishAt: auto</code> not yet assigned) and will never go live:{" "}
            {unresolved.map((p) => p.slug).join(", ")}. Run <code>npm run blog:schedule</code> or set a
            date in the editor.
          </p>
        )}
        {queue.length > 0 && (
          <ol className="mt-3 divide-y divide-slate-100 text-sm">
            {queue.map((p) => (
              <li key={p.slug} className="flex flex-wrap items-baseline gap-x-3 py-1.5">
                <span className="w-56 shrink-0 tabular-nums text-slate-500">{formatLondon(p.publishAt!)}</span>
                <Link href={`/admin/posts/${p.slug}`} className="min-w-0 truncate text-slate-900 hover:underline">
                  {p.title}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

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
                    {p.draft ? (
                      <span className="text-[11px] font-medium rounded-full bg-amber-100 text-amber-800 px-2 py-0.5">
                        Draft
                      </span>
                    ) : isUnresolvedPublishAt(p.publishAt) ? (
                      <span className="text-[11px] font-medium rounded-full bg-red-100 text-red-800 px-2 py-0.5">
                        Not scheduled
                      </span>
                    ) : (releaseOf(p) ?? 0) > now ? (
                      <span className="text-[11px] font-medium rounded-full bg-sky-100 text-sky-800 px-2 py-0.5">
                        Scheduled
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <code className="text-slate-600">{p.slug}</code> ·{" "}
                    {(releaseOf(p) ?? 0) > now ? `goes live ${formatLondon(p.publishAt!)}` : formatPostDate(p.date)} ·{" "}
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
