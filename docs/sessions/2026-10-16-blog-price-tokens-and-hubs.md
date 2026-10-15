# Handoff — blog price tokens + paginated topic hubs

## Ownership

Checkout: `/Users/sumyeung/Developer/f5472-wt/blog2`, branch `seo/blog2-2026-10-16` (own `node_modules`), from `a1db9ca`. Not pushed. Other lanes own `src/lib/llms.ts`, `src/lib/seo.ts`, the root/marketing layouts and the components they use; none of those were edited.

| Files | What |
|---|---|
| `src/lib/blog-price-tokens.ts` + `.test.ts` (new) | Token renderer + content guard |
| `src/lib/blog.ts` | Loader renders tokens; `validatePostInput`, `updatePost` (rollback-safe rename) |
| `content/blog/*.md` (129 files) | Our own prices -> tokens (no other copy changed) |
| `src/lib/seo-title.test.ts` | Length guard measures rendered front-matter |
| `src/app/(marketing)/blog/_components/{Pager,TopicHubView}.tsx` (new), `BlogIndexView.tsx` | Shared pager; topic hub view |
| `src/app/(marketing)/blog/topics/[tag]/page.tsx`, `topics/[tag]/page/[n]/page.tsx` + `page.test.ts` (new) | Hub page 1 + older pages |
| `src/lib/blog-pagination.ts` + test | `topicPagePath` |
| `src/lib/blog-revalidate.ts` + test | Route-group-qualified revalidation, topics included |
| `src/app/sitemap.ts` | Every page of each indexable hub |
| `src/app/api/admin/posts/[slug]/route.ts` + `route.test.ts` (new) | Validate before rename; rollback |

## What shipped

1. **`b024a8c` — price tokens + hub pagination.**
   - 543 hard-coded prices of our own services in 129 posts became tokens. This covers body, front-matter descriptions and FAQs, plus the partner worked example, whose totals are now computed.
   - Verified: every post rendered at current prices is byte-identical to the pre-change text (independent Python renderer vs `git show HEAD`).
   - Built HTML spot-checked:
     - Posts: `offer-form-5472-filing-as-a-service`, `ein-cost-irs-free-vs-service`, `form-5472-deadline-tomorrow-urgent-filing` and `itin-cost-irs-fee-caa-service` have correct amounts, and their meta descriptions and FAQ JSON-LD are rendered.
     - Feed and llms files: `feed.xml`, `llms.txt`, `llms-full.txt` and `llms-guides.txt` contain 0 `{{`.
   - Hubs:
     - Before, the `form-5472` hub was about 236 anchors (165 post cards on one page) and `foreign-owned-llc` about 209.
     - Now every hub page has 72–94 anchors. Cross-topic chips went from 12 to 6.
     - `/blog/topics` is 71 anchors and is unchanged.
2. **Follow-up commit — admin rename safety.**
   - PATCH `/api/admin/posts/[slug]` now validates the whole payload before any write: slug shape, required fields and price tokens.
   - Renames go through `updatePost`. It writes the new slug first and only then retires the old one. If retiring fails, it restores the new slug's prior row, or removes it.
   - Tests: bad token + slug change -> 400 with the slug unchanged; a missing title is refused the same way; rollback, including a pre-existing tombstone at the new slug; a valid rename keeps raw tokens. The first two tests fail against the old route.

Evidence: vitest on the blog, admin-posts, llms, seo-title and cp-notice suites passed (14 files / 1161 tests); `tsc --noEmit` 0 errors; `next lint` reported 0 issues on touched files. `npm run build` exited 0; the first attempt timed out at load average ~90 from concurrent lane builds, including unrelated `/dashboard` and `/admin/login`.

## Contracts a future editor must respect

- **Never type our price in a post.** Use one of these tokens:

  | Token | Source in `src/lib/pricing.ts` |
  |---|---|
  | `{{price.standard}}` | `TIERS.standard` |
  | `{{price.express}}` | `TIERS.express` |
  | `{{price.additionalYear}}` | `MULTI_YEAR_ADDON_CENTS` |
  | `{{price.ein}}` | `EIN_PRICE_CENTS` |
  | `{{price.itin}}` | `ITIN_PRICE_CENTS` |

- Tokens also allow arithmetic: `+ - * /`, parentheses and dollar literals, for example `{{(399 - price.standard) * 20}}`.
- The renderer fails closed. Each of these throws: an unknown name, bad syntax, a stray `{{` or `}}`, division by zero, or a negative result.
  - For file posts, that fails both the build and the tests.
  - For admin saves, it returns a 400.
- **Guard test:** `src/lib/blog-price-tokens.test.ts` ("content/blog price guard") fails on any literal equal to a current price outside a token. That includes `$149`, `$199`, `$99`, `$349`, `$149.00` and `USD 149`.
  - `ALLOWED_LITERALS` lists the non-our-price exceptions (currently Apple's $99 developer fee, 2 lines). Stale entries fail.
  - Never allowlist our own price.
- **Who sees rendered vs raw tokens:**
  - Public readers `getAllPosts()` and `getPost()` render tokens.
  - `getPostIncludingDraft()` (admin editor, rename, delete) stays raw so a save never bakes a price in.
  - `getAllPosts({ includeDrafts: true })` (admin lists only) falls back to raw text for a post whose tokens fail, instead of crashing the admin.
- **Revalidation path form:** Next 14.2 tags cached pages with the app path including the route group, e.g. `/(marketing)/blog/page/[n]/page`. A pattern revalidation must name the group:
  - `revalidatePath("/(marketing)/blog/page/[n]", "page")`
  - `revalidatePath("/(marketing)/blog/topics", "layout")`

  `revalidateBlogIndex()` does both, keeping the group-less forms as harmless no-ops. Plain concrete URLs (`/blog`, `/blog/<slug>`) match without the group. `cron/blog-release`'s own `revalidatePath("/blog/topics", "layout")` matches nothing, but the cron also calls `revalidateBlogIndex()`.
- **Topic hubs:**
  - They paginate with `POSTS_PER_PAGE` (24): `/blog/topics/<tag>` is page 1, `/blog/topics/<tag>/page/<n>` is n >= 2.
  - Every page is self-canonical. Hubs with fewer than 7 posts are noindex,follow on every page.
  - `dynamicParams = true`; `/page/1`, `/page/02` and out-of-range pages return 404.
  - `OTHER_TOPIC_LINKS = 6` keeps pages at 94 anchors or fewer with the current ~57-anchor chrome.

## Open

- **Owner-gated:** none.
- **Follow-ups:**
  - The admin PostEditor preview shows raw tokens (admin-only).
  - The turnaround strings ("5-7 business days", "24 hours") are still literal in posts. A `{{turnaround.*}}` token from `STANDARD_TURNAROUND`/`EXPRESS_TURNAROUND` would follow the same pattern.
  - `cron/blog-release` could drop its no-op group-less topics call.

## Lane notes

- Machine load from parallel lane builds can push `next build` past the 60 s per-page limit. Re-run when the load average drops; it is not a code fault.
- The local DB is unreachable by design, so the `[blog] database unavailable` logs during build are expected.
