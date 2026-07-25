import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin/auth";
import { writePost, getPostIncludingDraft, slugify } from "@/lib/blog";

export const runtime = "nodejs";

// Posts live in the database now, but the public blog is statically rendered.
// Bust every surface that lists or renders a post so a publish shows up in
// seconds instead of waiting out the 60s ISR window (or a redeploy).
function revalidateBlog(...slugs: string[]) {
  revalidatePath("/blog");
  for (const slug of slugs) revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
}

// Create a new post. Auto-generates the slug from the title if not supplied.
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { title, description, date, author, tags, draft, content } = body;
  const slug = body.slug?.trim() || slugify(title ?? "");

  if (!slug) return NextResponse.json({ error: "Need a title or slug" }, { status: 400 });

  const existing = await getPostIncludingDraft(slug);
  if (existing) {
    return NextResponse.json(
      { error: `A post with slug "${slug}" already exists` },
      { status: 409 },
    );
  }

  try {
    await writePost(
      slug,
      {
        title,
        description,
        date: date || new Date().toISOString().slice(0, 10),
        author,
        tags: Array.isArray(tags) ? tags : [],
        draft: !!draft,
      },
      content ?? "",
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Write failed" },
      { status: 400 },
    );
  }

  revalidateBlog(slug);
  return NextResponse.json({ slug });
}
