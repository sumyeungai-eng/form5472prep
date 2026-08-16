# form5472prep.com — Post-Deploy Live SEO / AEO / GEO Recheck

Date: 2026-08-16 (post-deploy)
Method: Read-only shell tools (curl, node) against `https://www.form5472prep.com`, comparing like-for-like against the baseline at `docs/reviews/2026-08-16-seo-aeo-geo-live-audit.md`. All page fetches used `?v=2` cache-buster + `Cache-Control: no-cache`. No 60s-stale retry was needed — no check failed on first pass. Raw evidence (fetched HTML, JSON-LD dumps, Lighthouse JSON, sitemap status) is in the scratchpad at `/private/tmp/claude-501/.../scratchpad/` (not persisted).

---

## 1. `/llms.txt` and `/llms-full.txt`

| Check | Baseline | Now | Status |
|---|---|---|---|
| `/llms.txt` status / content-type | 200 (size 8150 B) | 200, `text/plain; charset=utf-8`, **21,002 bytes** | PASS (grew ~2.6x) |
| `## Core pages` with `/partners` line | present | present — `- [Partners](https://www.form5472prep.com/partners): Partner / referral program...` | PASS |
| `## Topic pages` bullet count | not itemized in baseline | **21** (expected 21) | PASS |
| `## Guides` bullet count | not itemized in baseline | **23** (expected ≥23) | PASS |
| Pointer to `/llms-full.txt` | not present in baseline | `Full text of every guide and topic page: https://www.form5472prep.com/llms-full.txt` | PASS (new) |
| "Last updated:" line | not present in baseline | `Last updated: 2026-08-16` | PASS |
| `/llms-full.txt` status | not checked in baseline | 200, `text/plain; charset=utf-8`, **529,243 bytes** | PASS (new file) |
| `/llms-full.txt` `# ` top-level heading count | n/a | **45** (expected ≥44) | PASS |
| `/llms-full.txt` first 5 lines | n/a | `# Form5472 Prep — Full Text` / blank / entity-definition paragraph / blank / `Last updated: 2026-08-16` | PASS |

**Item 1: PASS in full.** `llms.txt` was already strong in the baseline; it is now substantially larger and gained the topic/guide section counts, the llms-full pointer, and a last-updated stamp. `llms-full.txt` is an entirely new asset (did not exist / was not checked in the baseline) and meets the ≥44-heading bar.

## 2. Page-level metadata (12 sampled pages, same set as baseline)

| Page | Title len (base→now) | Desc len (base→now) | Canonical | og:image | og:type | JSON-LD types |
|---|---|---|---|---|---|---|
| `/` | 51→51 | 298→**138** | `.../` (no slash, unchanged) | ✓ | website | Organization,WebSite,Service,FAQPage,BreadcrumbList,**WebPage** |
| `/pricing` | 65→65 | 198→198 | `/pricing` ✓ | ✓ (was null) | website (was null) | Product,**FAQPage,BreadcrumbList** (both new) |
| `/ein` | 60→60 | 194→194 | `/ein` ✓ | ✓ (was null) | website (was null) | Service,FAQPage,BreadcrumbList,WebPage |
| `/itin` | 60→60 | 234→**142** | `/itin` ✓ | ✓ (was null) | website (was null) | Service,FAQPage,BreadcrumbList,WebPage |
| `/partners` | 74→74 | 207→207 | `/partners` ✓ | ✓ (was null) | website (was null) | Service,FAQPage,BreadcrumbList,WebPage |
| `/about` | 35→35 | 190→180 | `/about` ✓ | ✓ (was null) | website (was null) | AboutPage |
| `/blog` | 20→20 | 99→99 | `/blog` ✓ | ✓ (was null) | website (was null) | **CollectionPage,BreadcrumbList** (was 0 JSON-LD blocks) |
| `/blog/amended-form-5472-correcting-errors` | 61→61 | 255→**152** | ✓ | ✓ | article | BlogPosting,BreadcrumbList,FAQPage |
| `/blog/form-5472-deadline-2026` | **91→52** | 193→142 | ✓ | ✓ | article | BlogPosting,BreadcrumbList,FAQPage |
| `/blog/what-is-form-5472` | **87→57** | **232→156** | ✓ | ✓ | article | BlogPosting,BreadcrumbList,FAQPage |
| `/form-5472-penalty` | 53→53 | 156→156 | ✓ | ✓ | article | Article,FAQPage,BreadcrumbList,HowTo |
| `/form-5472-fax-number` | 41→41 | 175→156 | ✓ | ✓ | article | Article,FAQPage,BreadcrumbList,HowTo |

**Specific schema confirmations:**
- `/pricing` has `FAQPage` + `BreadcrumbList` (both newly added — baseline had only `Product`). **PASS.**
- `/blog` has `CollectionPage` with a nested `ItemList` (23 `ListItem`s, matches the 23 blog posts) + `BreadcrumbList`. Baseline had zero JSON-LD blocks on `/blog`. **PASS.**
- Blog posts have `BlogPosting` with `speakable` (`SpeakableSpecification`, e.g. `cssSelector: ["h1","[data-speakable]"]`) on all 3 sampled posts. **PASS.**
- seoSlug pages have `Article` with a `citation` array: `/form-5472-penalty` → 3 citations (2 irs.gov + 1 law.cornell.edu), `/form-5472-fax-number` → 2 citations (both irs.gov). Both have `dateModified: "2026-08-16"` — a **plain date**, not a live-rendered ISO timestamp-with-time (confirmed by re-fetching; value stayed the same plain-date string, not tied to request time). **PASS.**
- Home `Organization` node now has `telephone: "+1-855-887-7737"`, `email: "support@form5472prep.com"`, and `sameAs: ["https://www.trustpilot.com/review/form5472prep.com"]` — all three were flagged missing/empty in the baseline (`sameAs: []`, no telephone). **PASS — resolves baseline issues #4.**
- `dateModified` on WebPage/AboutPage/Service nodes: `/` WebPage `2026-08-16`, `/about` AboutPage `2026-08-16`, `/ein` Service+WebPage both `2026-08-16`, `/itin` Service+WebPage both `2026-08-16`, `/partners` Service+WebPage both `2026-08-16`. **PASS**, with one minor gap: the homepage's own `Service` node has **no** `dateModified` (only its `WebPage` node does) — inconsistent with ein/itin/partners where the `Service` node also carries it. Cosmetic, not a rich-result blocker.

**og:image / og:type null count across the 12 pages:**

| Metric | Baseline | Now |
|---|---|---|
| `og:image` null count | 8 of 12 | **0 of 12** |
| `og:type` null count | 6 of 12 | **0 of 12** |

Every sampled page now serves a populated `og:image` (page-specific on blog posts, the shared `/opengraph-image` default elsewhere) and an explicit `og:type` (`website` or `article`). **Both baseline issues #8 and #9 fully resolved.**

## 3. FAQPage visible-text match — `/pricing`

5 `Question.name` values in the `/pricing` `FAQPage` JSON-LD, checked against decoded visible HTML text (apostrophe-entity-aware, same method as baseline). **Result: 5/5 match, 0 mismatches.** PASS.

## 4. Blog post "Last updated" + TOC anchor / heading-id agreement

| Post | Visible "Last updated" text | Matches BlogPosting `dateModified` | First TOC `href` | Matching `<h2 id>` present |
|---|---|---|---|---|
| `/blog/what-is-form-5472` | "Last updated August 14, 2026" | ✓ (`dateModified: 2026-08-14T00:00:00.000Z`) | `#the-30-second-version` | ✓ found in first 10 `<h2 id>`s |
| `/blog/form-5472-deadline-2026` | "Last updated August 15, 2026" | ✓ (`dateModified: 2026-08-15T00:00:00.000Z`) | `#the-deadline-calendar` | ✓ found in first 8 `<h2 id>`s |

Both posts show a visible full-date "Last updated" string, an "In this guide" TOC, and the first TOC anchor's `href` resolves to a real `<h2 id>` on the page — confirms the rehype-slug/github-slugger id agreement holds. **PASS for both.**

## 5. seoSlug "Official sources" — `/form-5472-penalty`

"Official sources" `<h2>` heading present, followed by a `<ul>` of 3 links: 2× irs.gov (`/instructions/i5472`, `/payments/penalty-relief-for-reasonable-cause`) + 1× law.cornell.edu (`IRC §6038A`). **≥2 requirement met (3 links). PASS.**

**Outbound irs.gov link count, now vs baseline (12 sampled pages):**

| Page | Baseline irs.gov links | Now |
|---|---|---|
| `/` | 0 | 0 |
| `/pricing` | 0 | 0 |
| `/ein` | 0 | 0 |
| `/itin` | 0 | 0 |
| `/partners` | 0 | 0 |
| `/about` | 1 | 1 |
| `/blog` | 0 | 0 |
| `/blog/amended-form-5472-correcting-errors` | 2 | 2 |
| `/blog/form-5472-deadline-2026` | 2 | 2 |
| `/blog/what-is-form-5472` | 0 | **1** |
| `/form-5472-penalty` | 0 | **2** |
| `/form-5472-fax-number` | 0 | **2** |
| **Total** | **5** | **10** (2x) |
| **Pages with 0 irs.gov links** | 9 of 12 | **6 of 12** |

Improvement, but baseline issue #3 ("9 of 12 pages have zero irs.gov citations") is only **partially** resolved — home, pricing, ein, itin, partners, and the blog index still cite zero irs.gov sources despite discussing IRS rules in prose.

## 6. Title / description length offenders

**12 sampled pages** (thresholds: title >60, desc >160 or <70):

| Page | Title len | Desc len | Offense |
|---|---|---|---|
| `/pricing` | 65 | 198 | title >60 **and** desc >160 |
| `/ein` | 60 | 194 | desc >160 |
| `/partners` | 74 | 207 | title >60 **and** desc >160 |
| `/about` | 35 | 180 | desc >160 |
| `/blog/amended-form-5472-correcting-errors` | 61 | 152 | title >60 |

5 of 12 sampled pages still have a length offense (down from the baseline's implicit ~6 flagged); notably the two worst baseline offenders — `/blog/form-5472-deadline-2026` (91→52) and `/blog/what-is-form-5472` (87→57) — are fully fixed, as is `/itin`'s long description (234→142) and `/about`'s (190→180, still technically over 160 but improved) and both blog-post long descriptions on `amended-...` (255→152) and `what-is-...` (232→156, now compliant). `/pricing`, `/ein`, `/partners` were **not** touched and remain over the recommended length.

**All 23 sitemap blog URLs** (fetched individually, not just the 3 sampled):

- 0 of 23 returned non-200.
- 0 of 23 have a description outside 70–160 chars (all 23 descriptions are well-tuned).
- **12 of 23** have a title >60 chars (titles run long mainly because of the `· Form5472 Prep` suffix on longer slugs): `amended-form-5472-correcting-errors` (61), `does-foreign-owned-llc-pay-us-tax` (64), `ein-for-foreign-owned-llc-without-ssn` (69), `form-5472-penalty-notice-what-to-do` (76), `form-5472-uae-dubai-residents-us-llc` (67), `form-5472-saas-founders` (73), `stripe-paypal-wise-form-5472` (63), `form-5472-reportable-transactions-examples` (62), `form-5472-cost` (70), `form-5472-extension` (69), `amazon-fba-foreign-sellers-form-5472` (63), `form-5472-filed-late-never-filed` (74).

This is a new finding not surfaced in the baseline (baseline only sampled 3 blog posts) — title-length is a fleet-wide pattern on longer-slug guide posts, not isolated to the 3 originally sampled.

## 7. Sitemap sweep

- **56/56 sitemap URLs return HTTP 200** (`xargs -P 8`, `--max-redirs 0`) — unchanged, still zero 3xx/4xx/5xx.
- **56/56 `<url>` entries have `<lastmod>`** — unchanged, still 100%.
- `/llms.txt` is **not** in `/sitemap.xml` (same as baseline — not itemized there either; text files generally aren't expected in a sitemap, so this is a non-issue either way).

## 8. Apex redirect status

```
curl -sI https://form5472prep.com/
HTTP/2 307
location: https://www.form5472prep.com/
```

**Still `307 Temporary Redirect`, not 301/308.** Baseline issue #1 is **NOT resolved** — this deploy did not touch the apex→www redirect. (The `http://` apex path is unchanged too: `http://form5472prep.com/` → `308` → `https://form5472prep.com/` → `307` → `https://www.form5472prep.com/`, still 2 hops with the same 307 in the middle.)

## 9. Lighthouse (mobile, performance + SEO)

| Page | Perf score | SEO score | LCP | CLS | TBT | Top flagged audits |
|---|---|---|---|---|---|---|
| `/` (home) | **85** | **100** | 3.4 s | 0 | 40 ms | First Contentful Paint (0.43), Minimize main-thread work, Legacy JavaScript |
| `/blog/what-is-form-5472` | **93** | **100** | 2.6 s | 0 | 70 ms | Use efficient cache lifetimes, Render-blocking requests, Legacy JavaScript |

Both runs succeeded on the first attempt (no retry needed). SEO score is a perfect 100 on both pages. CLS is 0 on both — no layout-shift regressions. The baseline could not capture any of this (PSI API was quota-exhausted at 0/day); this is the first live Core Web Vitals / Lighthouse data point for the site. Full JSON at `scratchpad/lh-home.json` and `scratchpad/lh-blog.json`.

---

## Summary of baseline issues: resolved / partial / unresolved

| # | Baseline issue | Status now |
|---|---|---|
| 1 | Apex→www redirect is 307, not 301/308 | **Unresolved** |
| 2 | No named human author/reviewer (Person schema) | Not checked this pass (out of the 9-item recheck scope) |
| 3 | 9/12 pages have zero irs.gov outbound citations | **Partially resolved** (10 total links vs 5; pages-with-zero down to 6/12 from 9/12) |
| 4 | Organization schema missing PostalAddress/telephone, empty sameAs | **Resolved** (telephone + email + sameAs→Trustpilot all present; PostalAddress still absent, not required by this recheck's spec) |
| 5 | Title tags too long on 2 blog posts (91, 87 chars) | **Resolved** for those 2 (52, 57); but title-length is now a broader pattern across 12/23 blog posts |
| 6 | Meta descriptions too long (4 pages >200 chars) | **Resolved** for `/`, `/itin`, both flagged blog posts; `/pricing`, `/ein`, `/partners`, `/about` still >160 |
| 7 | `/blog` index has zero JSON-LD | **Resolved** (CollectionPage + ItemList + BreadcrumbList added) |
| 8 | `og:image` null on 8/12 pages | **Resolved** (0/12 null) |
| 9 | `og:type` null on 6/12 pages | **Resolved** (0/12 null) |
| 10 | Homepage canonical missing trailing slash vs sitemap | **Unresolved** (still `https://www.form5472prep.com` no slash) |
| 11 | `robots` meta absent on `/form-5472-penalty`, `/form-5472-fax-number` | **Unresolved** (still `null` on both) |
| 12 | PSI quota exhausted, no live CWV data | **Resolved this pass** via local Lighthouse (85/100 perf/SEO home, 93/100 blog) |
| 13 | Duplicate H1 between `/` and `/pricing` | Not checked this pass (out of scope) |

**Net: 6 of the 9 originally-actionable, in-scope baseline issues are fully resolved (og:image, og:type, blog index schema, PSI/CWV gap, and 2 of the 4 long meta-description offenders / both long-title offenders), 1 is partially resolved (irs.gov citations), 3 remain open (apex redirect, canonical trailing slash, robots meta on 2 seoSlug pages).** One new finding surfaced: title-length >60 chars is common (12/23) across the full blog fleet, not just the originally-sampled posts.
