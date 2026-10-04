// "Continue reading" / "Related guides" picker for blog posts. The blog page
// used to show the four NEWEST posts regardless of topic; this ranks by shared
// tags instead so a penalty article links to other penalty/late-filing
// articles (internal links that carry topical relevance).
import { isPubliclyAvailable, type PostMeta } from "@/lib/blog";
import { tagSlug } from "@/lib/blog-tags";

// Every post carries these; sharing them says nothing about topical overlap.
const GENERIC_TAGS = new Set(["form-5472", "foreign-owned-llc"]);

const releaseTime = (p: PostMeta) => new Date(p.publishAt ?? p.date).getTime();

function specificTags(p: PostMeta): Set<string> {
  return new Set((p.tags ?? []).map(tagSlug).filter((t) => !GENERIC_TAGS.has(t)));
}

/**
 * Up to `limit` posts related to `current`, never including `current` itself
 * or anything not publicly available (draft / scheduled for the future).
 * Ranking: number of shared specific tags (descending), then newer first.
 * Posts with no shared specific tag fill any remaining slots newest-first, so
 * the list is never shorter than `limit` while enough posts exist.
 */
export function relatedPosts(
  current: Pick<PostMeta, "slug" | "tags">,
  all: PostMeta[],
  limit = 4,
  now = new Date(),
): PostMeta[] {
  const mine = specificTags(current as PostMeta);
  const scored = all
    .filter((p) => p.slug !== current.slug && isPubliclyAvailable(p, now))
    .map((p) => {
      let shared = 0;
      Array.from(specificTags(p)).forEach((t) => {
        if (mine.has(t)) shared += 1;
      });
      return { post: p, shared, time: releaseTime(p) };
    });
  scored.sort((a, b) => b.shared - a.shared || b.time - a.time);
  return scored.slice(0, limit).map((s) => s.post);
}
