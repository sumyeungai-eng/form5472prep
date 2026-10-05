import { slugify, type PostMeta } from "@/lib/blog";

export type TagEntry = { tag: string; label: string; count: number; posts: PostMeta[] };

/**
 * Tags with fewer posts than this render but are noindex AND left out of the
 * sitemap (thin content). Raised 3 -> 7 on 2026-10-01: the crawl found 23
 * indexable tag pages of 168-288 words, all with 3-6 posts.
 */
export const MIN_INDEXABLE_TAG_POSTS = 7;

/**
 * Spelling variants that must collapse onto one canonical tag slug, so two
 * near-identical topic pages never compete (crawl 2026-10-01: /nonresident and
 * /non-resident both rendered "Non-resident guides"). Each alias also needs a
 * permanent redirect in next.config.mjs (see TAG_SLUG_ALIASES there).
 */
export const TAG_SLUG_ALIASES: Record<string, string> = {
  nonresident: "non-resident",
  "digital-nomads": "digital-nomad",
};

const TAG_LABELS: Record<string, string> = {
  ein: "EIN",
  itin: "ITIN",
  ftin: "FTIN",
  caa: "CAA",
  eci: "ECI",
  boi: "BOI",
  irs: "IRS",
  llc: "LLC",
  diirsp: "DIIRSP",
  "us-tax": "US tax",
  "form-w-7": "Form W-7",
  "form-ss-4": "Form SS-4",
  "form-1040-nr": "Form 1040-NR",
  "form-568": "Form 568",
  "form-7004": "Form 7004",
  "form-5472": "Form 5472",
  "form-1120": "Form 1120",
  "pro-forma-1120": "Pro forma 1120",
  "foreign-owned-llc": "Foreign-owned LLC",
  "non-resident": "Non-resident",
  "amazon-fba": "Amazon FBA",
  "delaware-llc": "Delaware LLC",
  "california-llc": "California LLC",
  ecommerce: "E-commerce",
  "white-label": "White label",
};

/** Normalise a raw frontmatter/DB tag to its URL segment. */
export function tagSlug(tag: string): string {
  const slug = slugify(tag);
  return TAG_SLUG_ALIASES[slug] ?? slug;
}

/** Human label. Applies TAG_LABELS overrides first, else title-cases the slug. */
export function formatTag(tag: string): string {
  const slug = tagSlug(tag);
  return TAG_LABELS[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function tagHref(tag: string): string {
  return `/blog/topics/${tagSlug(tag)}`;
}

/** Group posts by normalised tag, sorted by count desc then label asc. Posts inside each entry keep the order they arrived in. */
export function buildTagIndex(posts: PostMeta[]): TagEntry[] {
  const byTag = new Map<string, TagEntry>();

  for (const post of posts) {
    const seen = new Set<string>();
    for (const rawTag of post.tags ?? []) {
      const tag = tagSlug(rawTag);
      if (!tag || seen.has(tag)) continue;
      seen.add(tag);

      const entry = byTag.get(tag);
      if (entry) {
        entry.count += 1;
        entry.posts.push(post);
      } else {
        byTag.set(tag, { tag, label: formatTag(tag), count: 1, posts: [post] });
      }
    }
  }

  return Array.from(byTag.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/**
 * Tag slugs whose topic page is indexable (>= MIN_INDEXABLE_TAG_POSTS posts).
 * Only these get a rendered <Link>: sub-threshold topic pages are
 * noindex,follow, and linking every post to them wasted ~300 internal links on
 * pages Google is told to ignore (Moz crawl 2026-10-05).
 */
export function indexableTagSlugs(posts: PostMeta[]): Set<string> {
  return new Set(
    buildTagIndex(posts)
      .filter((entry) => entry.count >= MIN_INDEXABLE_TAG_POSTS)
      .map((entry) => entry.tag),
  );
}

/** Exact lookup by URL segment; returns undefined when the tag has no posts. */
export function findTag(posts: PostMeta[], slug: string): TagEntry | undefined {
  return buildTagIndex(posts).find((entry) => entry.tag === slug);
}
