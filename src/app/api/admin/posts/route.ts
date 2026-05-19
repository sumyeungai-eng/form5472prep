import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { writePost, getPostIncludingDraft, slugify } from "@/lib/blog";

export const runtime = "nodejs";

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

  return NextResponse.json({ slug });
}
