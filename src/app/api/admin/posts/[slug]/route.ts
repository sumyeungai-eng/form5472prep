import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin/auth";
import {
  writePost,
  deletePost,
  getPostIncludingDraft,
  renamePost,
  slugify,
} from "@/lib/blog";

export const runtime = "nodejs";

// Posts live in the database now, but the public blog is statically rendered.
// Bust every surface that lists or renders a post so an edit shows up in
// seconds instead of waiting out the 60s ISR window (or a redeploy). On a
// rename, pass both slugs so the retired URL stops serving the old copy.
function revalidateBlog(...slugs: string[]) {
  revalidatePath("/blog");
  for (const slug of slugs) revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
}

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
        publishAt: body.publishAt ?? existing.publishAt,
        // Carried through explicitly: a file-backed post can have `updated` in
        // its frontmatter, and editing it here must not silently drop it.
        updated: body.updated ?? existing.updated,
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

  revalidateBlog(desiredSlug, params.slug);
  return NextResponse.json({ slug: desiredSlug });
}

export async function DELETE(_: Request, { params }: { params: { slug: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    await deletePost(params.slug);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  revalidateBlog(params.slug);
  return NextResponse.json({ ok: true });
}
