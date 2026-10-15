# Handoff — Moz technical fixes (robots, blog pagination, link trim, slug length)

## Ownership

Checkout: `/Users/sumyeung/Developer/f5472-wt/tech`, branch `seo/tech-2026-10-15` (own `node_modules`), from `287b194`. Not pushed. Two other lanes edit other files in parallel worktrees; none of their files were touched.

| Files | What |
|---|---|
| `src/app/robots.ts`, `src/app/robots.test.ts` | Hidden-route list + test |
| `src/app/(marketing)/blog/page.tsx`, `_components/BlogIndexView.tsx`, `page/[n]/page.tsx` | Paginated blog index (page.tsx is now thin; the view is shared) |
| `src/lib/blog-pagination.ts` + `.test.ts` | Pure pagination helpers (new files) |
| `src/app/sitemap.ts` | `/blog/page/N` entries |
| `content/blog/form-5472-digital-nomad-us-llc.md` | Link trim only |
| 3 queued posts, `public/blog/*.webp`, `ARTWORK_ALTS` in `src/lib/blog.ts`, `scripts/render-blog-artwork.mjs`, `scripts/verify-company-car-blogs-20261009.mjs` | Slug renames |
| `src/lib/blog-slug-length.test.ts` | Guard: posts dated after 2026-10-15 must have a full URL <= 75 chars |

## What shipped (Moz crawl of 2026-10-11, Page Optimization of 2026-10-15)

1. **Meta Noindex (4 left + 1 added by the coordinator).** `robots.ts` now also disallows `/sign-in`, `/partner/sign-in`, `/ein/apply`, `/itin/apply` and `/applications/` (auth-gated `/applications/ein/<id>`, fetched by Googlebot 2026-10-13). `/start` itself stays crawlable. All five already carry a meta noindex and are not in the sitemap.
2. **`/blog` 252 links.** Index paginated, 24 posts per page: `/blog` = page 1 (featured card + 23), `/blog/page/2..N` older. Statically generated (`generateStaticParams`), `revalidate = 60`, self-canonical, `index, follow`, title `Blog – page N · Form5472 Prep`, unique description, visible Newer/Older links with `rel=prev/next` plus a windowed number pager (max 5 numbers), topic-hub chips kept on every page, per-page ItemList/Breadcrumb JSON-LD. `/blog/page/1`, `/blog/page/02`, out-of-range -> 404 (no redirect, so Moz never sees another 3xx). Sitemap lists pages 2..N. Built anchors: page 1 = 92 (was 257), pages 2-8 = 91-95. All 191 posts published at build time are reachable through pagination.
3. **`/blog/form-5472-digital-nomad-us-llc` 148 links.** Cause: the three link tables in the body (22 country guides, 10 city guides, 8 nomad-question guides = 40 anchors) on top of ~58 chrome anchors, 12 TOC anchors and the related/tag blocks. The tables became plain-text lists (same facts, same headings) plus two hub links (`/blog/topics/ftin`, `/blog/topics/digital-nomad`); repeat IRS-instruction links, `/pricing` and the checklist link were unlinked. Kept: pro-forma-1120, `/start` x2, reportable-transactions, FTIN, address, owner-becomes-US-resident, dormant LLC, deadline, late-filing guides, 4 IRS sources. Built anchors 149 -> 106 (internal non-fragment 131 -> 88, unique internal 103 -> 64).
4. **URL too long.** Published slugs untouched. Queued posts (all still future `publishAt`) renamed; artwork file, `ARTWORK_ALTS` key, render-script entry and cross-links updated:
   - `business-car-mileage-vs-actual-expenses-2026` -> `business-car-mileage-vs-actual-2026` (69-char URL)
   - `company-car-deductions-foreign-owned-us-llc` -> `foreign-owned-llc-company-car-deduction` (73)
   - `electric-company-car-us-llc-tax-credits-2026` -> `electric-company-car-llc-tax-2026` (67)
5. http->https 308 hop and the apex redirect chain: not touched (Vercel-forced).

## Contracts a future editor must respect

- `POSTS_PER_PAGE` (24) in `src/lib/blog-pagination.ts` is what keeps each index page near 95 anchors including the ~58-anchor header/footer. Raising it re-opens the Moz `avoid_excessive_internal_links` failure on `/blog`.
- `/blog/page/[n]` must stay a static segment; `[slug]` would otherwise treat `page` as a post slug. Never name a post `page`.
- New posts: full URL `https://www.form5472prep.com/blog/<slug>` <= 75 chars, i.e. slug <= 41 chars. `blog-slug-length.test.ts` enforces this for posts dated after 2026-10-15 (older ones are grandfathered because renaming indexed posts costs rankings).
- `robots.test.ts` pins the hidden list; `/start` (without `?`), `/blog`, `/blog/page/N` must stay crawlable.
- Moz's `avoid_excessive_internal_links` threshold is not published. Evidence from the 2026-10-15 read: pages with 103 and 107 anchors pass, 148 and 252 fail. Keep blog posts and index pages at or below ~107 anchors (every anchor counts, including TOC fragments and externals).

## Verification

- `npx vitest run` blog.test, blog-tags.test, blog-order-cta.test, blogSchedule.test, related-posts.test, blog-pagination.test, blog-slug-length.test, robots.test: 8 files / 85 tests pass. Negative check: a copy of a queued post under its old 44-char slug made `blog-slug-length` fail (78 chars), then was removed.
- `npx tsc --noEmit` clean; `next lint` on all touched files clean.
- `npm run build` exit 0 (twice; DB-unavailable fallback logs expected locally). `next start`: `/blog`, `/blog/page/2`, `/blog/page/8` 200; `/blog/page/9`, `/blog/page/1`, `/blog/page/02`, `/blog/page` 404; served robots.txt showed the four sign-in/apply Disallow lines (`/applications/` was added afterwards and is pinned by `robots.test.ts`); sitemap lists `/blog/page/2..8` and none of the queued posts. Pages 2-8 titled `Blog – page N · Form5472 Prep`, canonical self, `index, follow`.
- Renamed queued posts return 404 before their release (correct). With `publishAt` temporarily moved into the past (dev server, then restored and byte-checked) all three rendered 200 with one H1, correct canonical, cover image 200 and cross-links pointing at the new slugs.

## Follow-up commit (coordinator request, same day)

- **Freshness.** New `src/lib/blog-revalidate.ts` (`revalidateBlogIndex()` = `revalidatePath("/blog")` + `revalidatePath("/blog/page/[n]", "page")`, the pattern matches the `[n]` folder name) now runs in all three places that used to revalidate only `/blog`: `api/admin/posts/route.ts`, `api/admin/posts/[slug]/route.ts`, `api/cron/blog-release/route.ts`. `/blog/page/[n]` has the same `revalidate = 60` as `/blog` and an explicit `dynamicParams = true`, so a new last page (page 9 once posts pass 8 x 24) renders on demand with no deploy. Tests: `blog-revalidate.test.ts`, `page/[n]/page.test.ts` (same ISR window, dynamicParams, page 8 -> 9 at the boundary).
- **Duplicate sidebar.** `blog/[slug]/page.tsx` rendered the CTA and the related guides twice (desktop-only sidebar + mobile-only copies). Now one `<aside>` for all breakpoints (sticky at `lg`), headed "Related guides". Nomad post: 106 -> 100 anchors, one related block; ein-pending post 101 anchors.

## Open

Owner-gated:
- Deploy is `git push origin main` after merge (never `vercel --prod`). Check the 2026-10-18 Moz crawl: Meta Noindex should drop to 0, URL Too Long should stop growing, `/blog` and the nomad post should pass the internal-links factor.

Follow-ups (outside this lane's files):
- `/blog/topics/form-5472` (230 links) and `/blog/topics/foreign-owned-llc` (203) are unpaginated and will hit the same Moz factor if graded.
- `scripts/verify-nomad-blogs-20260922.mjs` (one-off, not in CI) asserts the nomad hub text contains each city slug; that no longer holds by design. `docs/sessions/2026-10-09-company-car-blogs.md` and `docs/marketing/2026-10-09-company-car-*` still name the old queued slugs (historical records, left as is).
- The 52 over-length published slugs stay as they are (indexed); only 301-renaming them would clear the Moz count, at a ranking cost.

## Lane notes

New files were added under `src/lib/` (`blog-pagination*`, `blog-slug-length.test.ts`) and `src/app/robots.test.ts`; names are unique to this lane. Local builds used throwaway random values for the two required env vars; no credentials were used or committed.
