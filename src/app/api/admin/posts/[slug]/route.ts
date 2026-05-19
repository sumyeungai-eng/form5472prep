import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import {
  writePost,
  deletePost,
  getPostIncludingDraft,
  renamePost,
  slugify,
} from "@/lib/blog";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await getPostIncludingDraft(params.slug);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const desiredSlug = (body.slug?.trim() || slugify(body.title ?? params.slug)) as string;

  try {
    if (desiredSlug !== params.slug) {
      const clash = await getPostIncludingDraft(desiredSlug);
      if (clash) {
        return NextResponse.json(
          { error: `A post with slug "${desiredSlug}" already exists` },
          { status: 409 },
        );
      }
      await renamePost(params.slug, desiredSlug);
    }

    await writePost(
      desiredSlug,
      {
        title: body.title ?? existing.title,
        description: body.description ?? existing.description,
        date: body.date ?? existing.date,
        author: body.author ?? existing.author,
        tags: Array.isArray(body.tags) ? body.tags : existing.tags ?? [],
        draft: typeof body.draft === "boolean" ? body.draft : existing.draft,
      },
      body.content ?? existing.body,
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Write failed" },
      { status: 400 },
    );
  }

  return NextResponse.json({ slug: desiredSlug });
}

export async function DELETE(_: Request, { params }: { params: { slug: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await deletePost(params.slug);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
