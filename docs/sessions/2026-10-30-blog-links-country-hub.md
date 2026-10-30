# 2026-10-30 — Blog internal links, "Form 5472 by country" hub, card alts, hub brand

Plan: `docs/seo/plan-2026-10-30-improvement.md` items **P0-1, P1-2, P1-5 (blog cards), P1-6 (blog/hub brand)**,
plus two coordinator add-ons (partner/white-label post alignment, Form 7004 service links).
Evidence: `docs/seo/moz-data-2026-10-30/page-audit/` and `campaign.md`.

**Status: committed on the branch, NOT merged, NOT deployed.** The architect merges to `main` and pushes.

Commits: `3d5de49` (items 1–5: hub, related guides, links, alts, brand) and the commit that adds this log
(items 6–7: partner-post alignment, Form 7004 links).

## Ownership

| Checkout / branch | Owns |
|---|---|
| `~/Developer/f5472-wt/blogx`, branch `seo/blogx-2026-10-30` (cut from `a1d9c6d`) | `src/lib/related-posts.ts` (+test), `src/lib/blog-countries.ts` (+test, new), `src/app/(marketing)/form-5472-by-country/page.tsx` (new), `src/app/(marketing)/blog/**` (PostCard, BlogIndexView, TopicHubView, topics/page, [slug]/page), `src/app/sitemap.ts` (+test), 47 `content/blog/*.md` (link insertions; partner-post alignment), `docs/seo/protect-rankings-2026-10-30.md`, this log |
| Other lanes (parallel, untouched here) | `src/lib/landing-pages.ts`, `src/lib/services-pages.ts`, `(marketing)/layout.tsx`, faq/pricing/ein/itin/7004/partners pages |

`origin/main` moved to `d2aed8e` (ten drip-scheduled posts + `src/lib/blog.ts` ARTWORK_ALTS) after this branch was
cut. No file overlap with this branch; a plain merge is expected to be clean.

## What shipped (on the branch)

1. **Related guides, same series first** (`src/lib/related-posts.ts`). Ranking is now: same series
   (`topicFamily`: country/city residency guides, US-state guides, by slug pattern) → shared specific tags →
   nearest post in release order → newer. The old newest-first tiebreak sent every post's fallback links to the
   few newest posts (uk-company-car 69, electric-car 55, filing-service-comparison 77 inbound) and left older
   country guides with 0–1.
2. **`/form-5472-by-country`** (new, indexable, in the sitemap). Question H2 + 54-word capsule sourced to the IRS
   Instructions for Form 5472, 36 country guides in 5 regions (one line each: country, linked post title, the
   post's own description), 10 city guides nested under their country, BreadcrumbList + CollectionPage/ItemList
   JSON-LD, intro names "Form5472 Prep" once. Linked from `/blog` (and its pages), `/blog/topics`, topic hubs
   ftin / digital-nomad / non-resident / foreign-owned-llc / tax-treaty, and the sidebar of every country/city post.
3. **Contextual links** (natural anchors, max 3 new per source post): 9 protected posts (list and sources in
   `docs/seo/protect-rankings-2026-10-30.md`), 4 non-country orphans, and the weakly linked posts left after (1)+(2).
   One wrong href fixed: the Delaware post's "Form 5472 recordkeeping checklist" anchor pointed at the
   filing-requirements checklist.
4. **Card alts (P1-5).** All 1,000 empty alts are blog card / related-guide thumbnails whose post title sits inside
   the same link, so `alt=""` stays (decorative duplicate) with a code comment in `PostCard.tsx` and the post
   sidebar. Hero and featured images use `post.imageAlt`; all 197 posts have their own `ARTWORK_ALTS` entry,
   so none is empty or generic. No change needed.
5. **Brand (P1-6).** Topic hub page 1 intro: "N practical guides from Form5472 Prep on …"; `/blog/topics` intro:
   "Every Form5472 Prep guide …"; country hub intro.
6. **Partner posts aligned to the live white-label offer** (coordinator add-on): every partner filing is
   white-label; we never email the partner's clients; partners copy intake/signing links from the dashboard;
   filing emails go to the partner; partner pays per filing, clients see no prices; the partner's name shows in
   intake and on the fax receipt; client pages stay on form5472prep.com. Edited:
   `form-5472-white-label-vs-standard-partner` (lead, dated update note, table, withdrawn "standard" section,
   selection test removed), `form-5472-partner-program-how-it-works`, `-company-formation-agents`,
   `-registered-agents`, `white-label-form-5472-filing-accounting-firms`, `offer-form-5472-filing-as-a-service`.
   No titles, slugs or dates changed.
7. **Form 7004 service link** (coordinator add-on): `form-5472-deadline-2026` and
   `form-5472-deadline-tomorrow-urgent-filing` now link `/form-7004-extension` ("Form 7004 extension filing");
   `form-5472-extension` already linked it.

## Evidence

Inbound = distinct sitemap pages linking to a URL, counted from the prerendered HTML of local production builds
(`.next/server/app/**.html`, script in the session scratchpad). The baseline build of `a1d9c6d` reproduced the
page audit's `inlinks_from_sitemap_pages` for 196 of 197 posts (stripe-atlas post: 1 vs 0).

| Group | Before | After |
|---|---|---|
| Protected: vietnam / estonia / france / recordkeeping / indonesia / switzerland / spain / germany / owner-becomes-resident | 3 / 2 / 1 / 22 / 1 / 1 / 1 / 2 / 3 | 8 / 7 / 8 / 26 / 7 / 12 / 10 / 13 / 8 |
| Orphans: stripe-atlas / operating-agreement / cash-accrual / airbnb / brazil / italy / japan / new-zealand / netherlands | 1 / 0 / 0 / 0 / 0 / 0 / 0 / 0 / 0 | 3 / 4 / 5 / 3 / 5 / 5 / 5 / 6 / 9 |
| Blog posts with ≤2 inbound (incl. the 9 orphans) | 62 | 0 (every post now has ≥3) |
| `/form-5472-by-country` | — | 53 outbound post links, in sitemap (282 URLs) |

Checks: `npx tsc --noEmit` clean; `npx vitest run` on related-posts, blog-countries, sitemap, blog page tests and
the `src/lib/blog*` suites: 341 passed, 0 failed; `next lint` on every touched source file: no warnings or errors;
`npm run build` exit 0 (route `○ /form-5472-by-country`). Local DB is unreachable, so builds read files only.

## Contracts for future editors

- **Do not go back to newest-first in `relatedPosts`.** It concentrates fallback links on the newest posts and
  re-orphans older ones. Same series → shared tags → release-order distance is the order the tests pin.
- **A new country or city residency post must be added to `COUNTRIES` / `CITY_GUIDES` in
  `src/lib/blog-countries.ts`.** `blog-countries.test.ts` fails if a `*-residents-us-llc` or
  `<city>-digital-nomad-*` file in `content/blog` is missing (DB-only posts are not covered by the test).
- The hub URL is `/form-5472-by-country` (a real route, not a `landing-pages.ts` slug). Keep the capsule to what
  the IRS instructions say; cite them.
- Card/sidebar thumbnails keep `alt=""` while the title sits inside the same link.
- Brand spelling in hub copy: "Form5472 Prep" only.
- Partner copy: the single offer above. There is no "standard" partner flow; do not reintroduce "white-label on
  request" or "the client pays".

## Open

Owner-gated / architect:
- Merge to `main` and push; then Search Console Request indexing for the 10 URLs in
  `docs/seo/protect-rankings-2026-10-30.md` (quota ~10/day).
- If production has a database row for any edited post, the row wins over the `.md` file and the edit will not
  show. Not checked (no production DB access from this lane); spot-check two live posts after deploy.
- `/partners` on `origin/main` (`d2aed8e`) still says clients get our emails and white-label is on request; the
  coordinator says the partners lane updates it. The blog now follows the new offer, so confirm both ship together.
- Rebalancing moved off-topic fallback links away from the newest posts: `form-5472-filing-service-comparison`
  77 → 8, the three car posts 69/55/32 → 6. Decide whether the comparison post needs deliberate links.

Follow-ups:
- Portugal (#18), owner loans (#11) and "do I need an ITIN" (#12) also rank via paginated pages; they gained hub /
  related links but no hand-placed links.

## Lane notes

- Baseline crawl via `next start` stalled (ISR re-renders retry the unreachable DB, ~90 s per post); reading the
  prerendered HTML from `.next/server/app` is instant and matches the audit.
- `rtk` output filtering truncates `grep`/`head` output in this environment; use `rtk proxy <cmd>` for raw output.
