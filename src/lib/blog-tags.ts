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

/**
 * Near-duplicate topic hubs: weaker hub slug -> the stronger hub it duplicates.
 * The weaker hub keeps rendering (posts still link it by tag) but is
 * noindex,follow with its canonical on the stronger hub, and is left out of the
 * sitemap and every hub link list. Moz flagged /blog/topics/itin +
 * /blog/topics/form-w-7 as Duplicate Content (crawls 2026-10-16 and 10-25):
 * 13 shared posts = 87% of the larger list (itin 15, form-w-7 14). No other
 * indexable pair reached 80% on 2026-10-26 (next: form-5472 ~ foreign-owned-llc
 * at 76%). Don't delete the tag.
 */
export const DUPLICATE_TAG_HUBS: Record<string, string> = {
  "form-w-7": "itin",
};

/**
 * Optional hand-written intro for a topic hub's page 1 (never /page/N). `answer`
 * is the <=60-word direct answer AI engines lift; `body` is plain text where
 * `[label](/path)` internal links render as <Link>s. When a hub has one it
 * replaces the generic "N practical guides..." line. Added 2026-11-04: the
 * deadline, penalty and late-filing hubs measured 378-400 words (thin).
 */
export type TopicHubIntro = { question: string; answer: string; body: string };

export const TOPIC_HUB_INTROS: Partial<Record<string, TopicHubIntro>> = {
  deadline: {
    question: "When is Form 5472 due?",
    answer:
      "Form 5472 is filed with the entity's pro forma Form 1120 and is due on the 15th day of the 4th month after its tax year ends, so April 15 for calendar-year LLCs. A timely Form 7004 extends the deadline by six months, to October 15.",
    body: "Form 7004 must be filed by the regular due date; a later one extends nothing. These guides cover how the deadline works, when an extension helps and what to do when the date has passed. Start with the [Form 5472 deadline guide](/form-5472-deadline), then use the [deadline calculator](/form-5472-deadline-calculator) to find your date. If it has already passed, read [what to do about a late Form 5472](/late-form-5472) and the comparison of [extending versus filing late](/blog/form-5472-extension-vs-late-filing).",
  },
  penalty: {
    question: "How much is the Form 5472 penalty?",
    answer:
      "The penalty is $25,000 per form, per year under IRC section 6038A(d). If the failure continues more than 90 days after the IRS mails a notice, a further $25,000 applies for each 30-day period or part of one.",
    body: "The penalty attaches to each form and year, not to each transaction. Relief is not automatic and is not guaranteed; the IRS decides each abatement request on its facts. These guides explain how the penalty is assessed, what a notice means and which relief routes exist. Start with the [Form 5472 penalty guide](/form-5472-penalty), estimate your exposure with the [penalty calculator](/form-5472-penalty-calculator), check whether [First Time Abate applies](/blog/form-5472-first-time-penalty-abatement), and if you hold a notice read [what to do with a penalty notice](/blog/form-5472-penalty-notice-what-to-do).",
  },
  "late-filing": {
    question: "What happens if Form 5472 is filed late or never filed?",
    answer:
      "The $25,000 per form, per year penalty can apply to a late or missing Form 5472. The usual route is to file the delinquent returns with a reasonable-cause statement requesting abatement; the IRS decides each request on its facts.",
    body: "Filing promptly and completely matters, because the continuation penalty stops growing once you file. Not knowing about the requirement is not, on its own, reasonable cause. These guides walk through catching up on missed years, from what a reasonable-cause statement needs to what happens after the package is sent. Start with [what to do about a late Form 5472](/late-form-5472) and the [late or never-filed guide](/blog/form-5472-filed-late-never-filed), then check your exposure with the [penalty calculator](/form-5472-penalty-calculator).",
  },
};

/** The intro for a hub, else undefined (hasOwn: a tag named "constructor" must not match). */
export function topicHubIntro(tag: string): TopicHubIntro | undefined {
  return Object.hasOwn(TOPIC_HUB_INTROS, tag) ? TOPIC_HUB_INTROS[tag] : undefined;
}

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
  return new Set(buildTagIndex(posts).filter(isIndexableHub).map((entry) => entry.tag));
}

/** The stronger hub a near-duplicate hub canonicalises to, else undefined. */
export function duplicateHubTarget(tag: string): string | undefined {
  return Object.hasOwn(DUPLICATE_TAG_HUBS, tag) ? DUPLICATE_TAG_HUBS[tag] : undefined;
}

/** A hub page 1 that may be indexed, linked and listed in the sitemap: big enough and not a near-duplicate. */
export function isIndexableHub(entry: Pick<TagEntry, "tag" | "count">): boolean {
  return entry.count >= MIN_INDEXABLE_TAG_POSTS && duplicateHubTarget(entry.tag) === undefined;
}

/** Exact lookup by URL segment; returns undefined when the tag has no posts. */
export function findTag(posts: PostMeta[], slug: string): TagEntry | undefined {
  return buildTagIndex(posts).find((entry) => entry.tag === slug);
}
