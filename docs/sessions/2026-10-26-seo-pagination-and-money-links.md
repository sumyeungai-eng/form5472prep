# 2026-10-26 — SEO lane A: noindex listing pages 2+, near-duplicate topic hub, money-keyword links

Evidence: Moz re-read of 2026-10-25 in `~/Developer/f5472-wt/moz-1026/`
(`campaign.md` §2b/§2c/§4, `rankings.tsv`, `crawl-issues.tsv`, `page-optimization.tsv`).

## Ownership

| Checkout / branch | Files owned by this lane |
|---|---|
| `~/Developer/f5472-wt/seoa`, branch `seo/seoa-2026-10-26` (not pushed; orchestrator merges + deploys) | `src/app/(marketing)/blog/**` (index/topic pagination + topic routes, `_components/BlogIndexView.tsx`, `_components/TopicHubView.tsx`, `topics/page.tsx`), `src/app/sitemap.ts` (+ new `src/app/sitemap.test.ts`), `src/lib/blog-tags.ts` (+ test), `src/app/(marketing)/do-i-need-to-file-form-5472/page.tsx` (+ test), `content/blog/form-5472-in-house-vs-outsourced-firm.md`, one sentence in `content/blog/form-5472-filing-service-comparison.md` |

Not touched (parallel lane): home page, pricing, about, `faq.ts`, `llms.ts`, `seo.ts`, `REPO-STATE.md`.

## What shipped

1. **Listing pages 2+ are `noindex, follow`, self-canonical.** `/blog/page/[n]` and
   `/blog/topics/[tag]/page/[n]` (Moz: `/blog/page/7` ranked #1 for "form 5472 vietnam
   residents" over the dedicated post; `/blog/page/3` + `/blog/topics/form-5472/page/3`
   flagged Duplicate Content). Pager links stay, so every post remains crawlable. Page 1
   (`/blog`, `/blog/topics/<tag>`) stays indexable (inherits root robots).
2. **Sitemap lists page 1 only**: no `/page/` URL, and no noindex hub (thin or near-duplicate).
3. **Near-duplicate hub**: `DUPLICATE_TAG_HUBS = { "form-w-7": "itin" }` in `src/lib/blog-tags.ts`.
   `/blog/topics/form-w-7` renders but is `noindex, follow` with canonical
   `/blog/topics/itin`; it is dropped from the sitemap, the /blog topic chips, the
   "Browse other topics" chips, post tag-chip links and the /blog/topics "Main topics"
   grid (listed as a plain label under "More topics"). The tag is not deleted.
   New predicate `isIndexableHub(entry)` replaces every `count >= MIN_INDEXABLE_TAG_POSTS` check.
4. **Money-keyword links (exact anchors, no title/H1 changes):**
   - `/do-i-need-to-file-form-5472` (final CTA band): "Form 5472 preparer" ->
     `/services/form-5472-preparer`, "hire someone to file Form 5472" ->
     `/services/hire-someone-to-file-form-5472`.
   - `/blog/form-5472-in-house-vs-outsourced-firm` and `/blog/form-5472-filing-service-comparison`:
     one sentence each, "compare Form 5472 filing services" -> `/compare/form-5472-filing-services`
     ("our full sourced price table"). No other copy, frontmatter or `updated` date changed.

### Hub overlap computed 2026-10-26 (197 file posts, 13 hubs with >= 7 posts)

Metric = shared posts / size of the larger list (symmetric; containment in the smaller
list would flag every narrow sub-hub of form-5472 at 100%, which is not duplication).

| Pair | Shared | Shared / larger | Page-1 (newest 24) overlap |
|---|---|---|---|
| itin (15) ~ form-w-7 (14) | 13 | **0.87 -> deduped** | 0.87 |
| form-5472 (168) ~ foreign-owned-llc (143) | 128 | 0.76 (below) | **0.88** — watch |
| ein (15) ~ form-ss-4 (8) | 8 | 0.53 | 0.53 |

## Verification

- `npx vitest run` on blog routes, `src/lib/blog*`, sitemap, robots, do-i-need page,
  llms, services-pages, seo-title, cp-notice-guard: all pass. New tests fail on the old code.
- `npx tsc --noEmit` clean; `next lint --file <touched>` clean.
- `npm run build` exit 0 (558/558 static pages). Built HTML: `/blog/page/2` and
  `/blog/topics/form-5472/page/2` = `noindex, follow` + self-canonical; `/blog`,
  `/blog/topics/form-5472`, `/blog/topics/itin` = `index, follow` + self-canonical;
  `/blog/topics/form-w-7` = `noindex, follow` + canonical `/blog/topics/itin`; sitemap has 0
  `/page/` URLs and 12 hubs (no form-w-7); 0 built pages link `/blog/topics/form-w-7`; both
  posts and the checker carry the exact-anchor links.

## Contracts for future editors

- Only **page 1** of `/blog` and of a hub where `isIndexableHub()` is true may be indexed or
  appear in the sitemap. Do not re-add `/page/` URLs to `sitemap.ts`.
- Any "indexable hub" check goes through `isIndexableHub`, never a raw count comparison.
- To dedupe another hub: add `weak: strong` to `DUPLICATE_TAG_HUBS` (strong must not itself be a key).
- `/do-i-need-to-file-form-5472` must keep the two exact-anchor service links (tested).

## Open

Owner-gated / orchestrator decisions:
- `form-5472` ~ `foreign-owned-llc` page 1 shares 21 of 24 posts. Not deduped (full lists 0.76,
  Moz has not flagged it). If Moz flags it, add `"foreign-owned-llc": "form-5472"` (one line).
- `noindex` + cross-page canonical on `/blog/topics/form-w-7` was specified by the brief;
  Google calls the two signals conflicting. Fallback if it misbehaves: drop the noindex and keep the canonical.

Follow-ups (other lanes / owner):
- The comparison post still has an older anchor "compare Form 5472 filing services" -> `/compare`
  (hub) a few lines above the new link; two identical anchors now point at two URLs. Owner of
  that post should re-word the `/compare` anchor.
- The comparison post says Snapfile and Form5472 Prep are "the same team"; `src/lib/provider-prices.ts`
  excludes Snapfile for "possible affiliation, unconfirmed". One of them is stale.
- See the report for other Moz items that need code (service pages still unranked, image alt, etc.).

## Lane notes

- Hub overlap was computed with a throwaway vitest file calling the real `getAllPosts()` (DB
  unavailable locally -> files only, 197 posts, matching Moz's 197). Production DB posts could shift
  counts slightly.
- `rtk` wraps `next lint` output as "Errors: 1"; `rtk proxy npx next lint ...` shows the real (clean) result.
