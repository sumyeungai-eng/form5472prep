# 2026-09-13 — Blog topic hub pages (clickable tag pills)

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `main`. This session owned only:
`src/lib/blog-tags.ts`, `src/lib/blog-tags.test.ts`, `src/app/(marketing)/blog/_components/PostCard.tsx`,
`src/app/(marketing)/blog/topics/[tag]/page.tsx`, `src/app/(marketing)/blog/page.tsx`,
`src/app/(marketing)/blog/[slug]/page.tsx`, `src/app/sitemap.ts`, this log, `REPO-STATE.md` index line.
Untracked files from a concurrent session (public/email banners, docs/marketing brief, src/lib/wizard/,
root PNGs) were left untouched and unstaged.

## What shipped
- The popular-tag pills on `/blog` and the tag pills on every article are now links to
  `/blog/topics/<tag>`, a server-rendered hub listing every post with that tag
  (CollectionPage + ItemList + BreadcrumbList JSON-LD, "Browse other topics" row, `/start` CTA).
- Acronym labels fixed via one shared `formatTag()` (EIN, ITIN, Form W-7, Foreign-owned LLC, …).
- `PostCard`/`PostMetaLine`/`AuthorChip` extracted to `blog/_components/PostCard.tsx` (markup unchanged).
- Sitemap lists hubs with >= 3 posts.

Verified locally: tsc clean; `blog-tags.test.ts` 6/6; `npm run build` exit 0 with 25 prerendered hubs;
dev server — `/blog` pills link to hubs, `/blog/topics/ein` shows 15 cards (= pill count), index,follow;
1-post tag `/blog/topics/1099-k` 200 + `noindex, follow`; unknown tag 404; article pills link; no console errors.
Production verification: see commit following this one / deploy note below.

## Contracts
- `formatTag` exists ONLY in `src/lib/blog-tags.ts`. Add acronym overrides to `TAG_LABELS`, never a local copy.
- Tag URL segment = `slugify(tag)` (`tagSlug`). DB-authored tags with spaces/caps normalise to the same hub.
- `MIN_INDEXABLE_TAG_POSTS = 3`: below it a hub renders but is `noindex, follow`, is not prerendered,
  and is not in the sitemap. 241 distinct tags exist; only ~25 clear the bar.
- `generateStaticParams` is narrowed on purpose; `dynamicParams` must stay default (true) or thin hubs 404.
- The tag label inside `PostCard` stays a `<span>`: the card is already a `<Link>`; nested anchors are invalid.
- Static segment `topics` shadows any post slugged `topics` — never publish a post with that slug.

## Open
Owner-gated: none.
Follow-ups: the 216 one/two-post tags are mostly near-duplicates (`non-resident` vs `nonresident`,
`foreign-owner` vs `foreign-owned-llc`); consolidating them belongs to the content/blog owner.

## Lane notes
codex-implementer built it (one mid-task correction: prerender only indexable hubs). My spec's
"exactly one formatTag" rule conflicted with its own file list (a second copy lived in `[slug]/page.tsx`);
codex flagged instead of overstepping. Architect finished that file and swapped the topic-page CTA from
white-on-light (copied from a dark panel) to `bg-ink`.
