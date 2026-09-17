// Decides which "start your order" CTA (EIN, ITIN, both, or neither) shows on
// a blog post. Fully automatic — driven by the post's own tags and slug, so a
// future EIN/ITIN post gets the CTA without anyone touching this file.

export type OrderProduct = "ein" | "itin";

// Slugs where the automatic tag/slug match would otherwise turn a product on,
// but the article's own argument would be undercut by an "apply now" button
// for that product. Kept as an explicit map (rather than a tag) because it's
// a property of what the article ARGUES, not what it's ABOUT.
export const ORDER_CTA_EXCLUSIONS: Record<string, OrderProduct[]> = {
  // This post argues an ITIN is usually NOT required to file Form 5472 (the
  // LLC's EIN covers it) — an "apply for an ITIN" CTA would contradict the
  // article's own point.
  "itin-required-form-5472": ["itin"],
};

const EIN_TAGS = new Set(["ein", "form-ss-4"]);
const ITIN_TAGS = new Set(["itin", "form-w-7", "caa"]);

function hasTag(tags: string[] | undefined, matchTags: Set<string>): boolean {
  if (!tags) return false;
  return tags.some((tag) => matchTags.has(tag.toLowerCase()));
}

function slugMatchesEin(slug: string): boolean {
  return slug.startsWith("ein-") || slug.includes("-ein-");
}

function slugMatchesItin(slug: string): boolean {
  return slug.startsWith("itin-") || slug.includes("-itin-") || slug.includes("form-w-7");
}

// Returns a de-duplicated array in the stable order ["ein", "itin"], filtered
// to whichever products apply to this post.
export function orderProductsForPost(post: { slug: string; tags?: string[] }): OrderProduct[] {
  const excluded = new Set(ORDER_CTA_EXCLUSIONS[post.slug] ?? []);
  const products: OrderProduct[] = [];

  if (!excluded.has("ein") && (hasTag(post.tags, EIN_TAGS) || slugMatchesEin(post.slug))) {
    products.push("ein");
  }
  if (!excluded.has("itin") && (hasTag(post.tags, ITIN_TAGS) || slugMatchesItin(post.slug))) {
    products.push("itin");
  }

  return products;
}

// Clean URLs only — no query string, no utm parameters. Site attribution is
// first-touch via cookie, so internal utm tags on this link add nothing and
// would create duplicate URLs for the same destination.
export function orderCtaHref(product: OrderProduct): string {
  return product === "ein" ? "/ein/apply" : "/itin/apply";
}
