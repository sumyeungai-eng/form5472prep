// "Continue reading" / "Related guides" picker for blog posts. The blog page
// used to show the four NEWEST posts regardless of topic; this ranks by shared
// tags instead so a penalty article links to other penalty/late-filing
// articles (internal links that carry topical relevance).
import { isPubliclyAvailable, type PostMeta } from "@/lib/blog";
import { tagSlug } from "@/lib/blog-tags";

// Every post carries these; sharing them says nothing about topical overlap.
const GENERIC_TAGS = new Set(["form-5472", "foreign-owned-llc"]);

// Post series recognised by slug: a country or city residency guide, or a US
// state guide, is most useful next to its siblings whatever tags it carries.
// shortcut: slug patterns, not a frontmatter field; add a `series` field if a third series appears.
const FAMILIES: Array<[RegExp, string]> = [
  [/-residents-us-llc$|^[a-z]+(?:-[a-z]+)?-digital-nomad-/, "residence"],
  [/-llc-foreign-owner-tax-filing$/, "us-state"],
];

/** The slug's post series ("residence", "us-state"), else undefined. */
export function topicFamily(slug: string): string | undefined {
  return FAMILIES.find(([pattern]) => pattern.test(slug))?.[1];
}

const releaseTime = (p: Pick<PostMeta, "date" | "publishAt">) => new Date(p.publishAt ?? p.date).getTime();

function specificTags(p: Pick<PostMeta, "tags">): Set<string> {
  return new Set((p.tags ?? []).map(tagSlug).filter((t) => !GENERIC_TAGS.has(t)));
}

/**
 * Up to `limit` posts related to `current`, never including `current` itself
 * or anything not publicly available (draft / scheduled for the future).
 * Ranking: same series first (topicFamily), then number of shared specific
 * tags, then the nearest posts in release order, newer first on a tie.
 * Nearest, not newest: when every country guide picked the four newest
 * country guides, older ones were left with 0-1 inbound links (page audit
 * 2026-10-30). Neighbours spread the links so each post is picked by the posts
 * around it. Unrelated posts fill any remaining slots the same way, so the list
 * is never shorter than `limit` while enough posts exist.
 */
export function relatedPosts(
  current: Pick<PostMeta, "slug" | "tags" | "date" | "publishAt">,
  all: PostMeta[],
  limit = 4,
  now = new Date(),
): PostMeta[] {
  const mine = specificTags(current);
  const family = topicFamily(current.slug);
  const pool = all.filter((p) => p.slug !== current.slug && isPubliclyAvailable(p, now));
  const position = new Map(
    [...pool, current]
      .sort((a, b) => releaseTime(a) - releaseTime(b) || a.slug.localeCompare(b.slug))
      .map((p, index) => [p.slug, index]),
  );
  const at = position.get(current.slug) ?? 0;
  const scored = pool.map((p) => {
    let shared = 0;
    Array.from(specificTags(p)).forEach((t) => {
      if (mine.has(t)) shared += 1;
    });
    return {
      post: p,
      same: family !== undefined && topicFamily(p.slug) === family ? 1 : 0,
      shared,
      distance: Math.abs((position.get(p.slug) ?? 0) - at),
      time: releaseTime(p),
    };
  });
  scored.sort((a, b) => b.same - a.same || b.shared - a.shared || a.distance - b.distance || b.time - a.time);
  return scored.slice(0, limit).map((s) => s.post);
}
