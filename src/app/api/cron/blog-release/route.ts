import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllPosts } from "@/lib/blog";
import { parsePublishAt } from "@/lib/blogSchedule";
import { INDEXNOW_SITE, submitToIndexNow } from "@/lib/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Daily at 09:05 UTC (vercel.json) — after the 09:00 London slot in both GMT
// and BST. Scheduled posts already go live on their own (publishAt + 60s ISR);
// this job makes the release visible straight away: it refreshes every blog
// listing and tells IndexNow about posts released in the last 26 hours (the
// 2h overlap tolerates a late or retried run; resubmitting is harmless).
const WINDOW_MS = 26 * 60 * 60 * 1000;

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const posts = await getAllPosts(); // public posts only
  const released = posts.filter((p) => {
    const at = parsePublishAt(p.publishAt);
    return !!at && at.getTime() <= now && at.getTime() > now - WINDOW_MS;
  });

  if (released.length === 0) {
    return NextResponse.json({ released: [], indexnow: null });
  }

  revalidatePath("/blog");
  revalidatePath("/blog/topics", "layout");
  for (const p of released) revalidatePath(`/blog/${p.slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");

  const indexnow = await submitToIndexNow([
    ...released.map((p) => `${INDEXNOW_SITE}/blog/${p.slug}`),
    `${INDEXNOW_SITE}/blog`,
  ]);
  if (!indexnow.ok) console.error("[cron blog-release] IndexNow submit failed", indexnow);

  return NextResponse.json({ released: released.map((p) => p.slug), indexnow });
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev fallback
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}
