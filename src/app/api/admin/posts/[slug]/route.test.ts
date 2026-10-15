import { beforeEach, describe, expect, it, vi } from "vitest";

// In-memory Post table standing in for Prisma, so the real blog.ts write paths
// (validatePostInput, updatePost, deletePost) run end to end.
type Row = Record<string, unknown> & { slug: string; deleted: boolean };
const { store, failDeleteFor } = vi.hoisted(() => ({
  store: new Map<string, Row>(),
  failDeleteFor: new Set<string>(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findMany: async () => Array.from(store.values()),
      findUnique: async ({ where }: { where: { slug: string } }) => store.get(where.slug) ?? null,
      upsert: async ({ where, create, update }: { where: { slug: string }; create: Row; update: Partial<Row> }) => {
        const prior = store.get(where.slug);
        const next = prior ? { ...prior, ...update } : { ...create };
        store.set(where.slug, next as Row);
        return next;
      },
      update: async ({ where, data }: { where: { slug: string }; data: Partial<Row> }) => {
        const prior = store.get(where.slug);
        if (!prior) throw new Error("no row");
        store.set(where.slug, { ...prior, ...data });
        return store.get(where.slug);
      },
      delete: async ({ where }: { where: { slug: string } }) => {
        if (failDeleteFor.has(where.slug)) throw new Error("database went away");
        const prior = store.get(where.slug);
        if (!prior) throw new Error("no row");
        store.delete(where.slug);
        return prior;
      },
    },
  },
}));
vi.mock("@/lib/admin/auth", () => ({ isAdmin: async () => true }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { getPostIncludingDraft } from "@/lib/blog";
import { PATCH } from "./route";

const ROW: Row = {
  slug: "old-admin-post",
  title: "Old title",
  description: "Costs {{price.standard}}",
  date: "2026-10-01",
  publishAt: null,
  updated: null,
  author: null,
  tags: ["form-5472"],
  draft: false,
  body: "Body {{price.express}}",
  deleted: false,
};

const patch = (slug: string, payload: Record<string, unknown>) =>
  PATCH(
    new Request(`http://localhost/api/admin/posts/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
    { params: { slug } },
  );

describe("PATCH /api/admin/posts/[slug]", () => {
  beforeEach(() => {
    store.clear();
    failDeleteFor.clear();
    store.set(ROW.slug, { ...ROW });
  });

  it("bad price token + slug change -> 400 and the slug is unchanged", async () => {
    const res = await patch(ROW.slug, { slug: "new-admin-post", content: "Now {{price.bogus}}" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Unknown price token "price.bogus"/);
    expect(await getPostIncludingDraft("new-admin-post")).toBeNull();
    expect((await getPostIncludingDraft(ROW.slug))?.body).toBe(ROW.body);
    expect(Array.from(store.keys())).toEqual([ROW.slug]);
  });

  it("missing required field + slug change -> 400 before any write", async () => {
    const res = await patch(ROW.slug, { slug: "new-admin-post", title: "" });
    expect(res.status).toBe(400);
    expect(Array.from(store.keys())).toEqual([ROW.slug]);
    expect(store.get(ROW.slug)).toEqual(ROW);
  });

  it("rolls the new slug back when retiring the old slug fails", async () => {
    failDeleteFor.add(ROW.slug);
    const res = await patch(ROW.slug, { slug: "new-admin-post", content: "Edited {{price.itin}}" });
    expect(res.status).toBe(400);
    expect(await getPostIncludingDraft("new-admin-post")).toBeNull();
    expect(store.get(ROW.slug)).toEqual(ROW);
  });

  it("restores a pre-existing tombstone at the new slug on rollback", async () => {
    const tombstone: Row = { ...ROW, slug: "new-admin-post", title: "Retired", deleted: true };
    store.set(tombstone.slug, { ...tombstone });
    failDeleteFor.add(ROW.slug);
    const res = await patch(ROW.slug, { slug: "new-admin-post" });
    expect(res.status).toBe(400);
    expect(store.get("new-admin-post")).toEqual(tombstone);
    expect(store.get(ROW.slug)).toEqual(ROW);
  });

  it("a valid rename moves the post and keeps raw tokens", async () => {
    const res = await patch(ROW.slug, { slug: "new-admin-post", content: "Edited {{price.itin}}" });
    expect(res.status).toBe(200);
    expect(await getPostIncludingDraft(ROW.slug)).toBeNull();
    const moved = await getPostIncludingDraft("new-admin-post");
    expect(moved?.body).toBe("Edited {{price.itin}}");
    expect(moved?.description).toBe(ROW.description);
  });

  it("a same-slug edit with a bad token is refused and leaves the row as it was", async () => {
    const res = await patch(ROW.slug, { description: "{{price.standard" });
    expect(res.status).toBe(400);
    expect(store.get(ROW.slug)).toEqual(ROW);
  });
});
