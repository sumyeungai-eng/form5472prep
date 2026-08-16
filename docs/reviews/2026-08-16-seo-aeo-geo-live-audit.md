# form5472prep.com — Live SEO / AEO / GEO Audit

Date: 2026-08-16
Method: Read-only shell tools (curl, node, python3) against the live production site `https://www.form5472prep.com`. No code in `/Users/sumyeung/Documents/Codex/form5472/src` was read or modified. Evidence files (raw HTTP responses, fetched HTML, node analysis JSON) are in the scratchpad at `/private/tmp/claude-501/.../scratchpad/` and are not persisted — key excerpts are quoted below.

---

## 1. Core discovery files

| File | Status | Notes |
|---|---|---|
| `/robots.txt` | 200 | Allows `/`, disallows `/dashboard`, `/filings`, `/admin`, `/api/`. Explicitly names 16 user-agents including `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `ClaudeBot`, `Claude-Web`, `Anthropic-AI`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`, `Applebot-Extended`, `Bytespider`, `CCBot`, `Meta-ExternalAgent`, `MistralAI-User`, `cohere-ai` — all `Allow: /`. Declares `Host:` and `Sitemap: https://www.form5472prep.com/sitemap.xml`. |
| `/sitemap.xml` | 200 | 56 `<url>` entries, all with `<lastmod>` (56/56). Root/utility pages stamped `2026-08-16T17:42:26.713Z`; blog posts carry per-post publish dates (oldest `2026-05-19`, newest `2026-08-15`). |
| `/llms.txt` | 200 | Exists, 8150 bytes. Exceptionally complete for an llms.txt: one-sentence entity definition, full pricing ($149/$199, $99/extra year), penalty amount ($25,000/form), DIIRSP explanation, fax number, Ogden mailing address, deadline rule, contact emails, and a linked page index (Pricing, About, Editorial Policy, EIN, ITIN, Terms, Privacy, Data Retention, Security, Blog). This is a strong AEO/GEO asset — few sites have one this thorough. |
| `/feed.xml` | 200 | Valid RSS 2.0, 23 `<item>` entries, each with `title`, `link`, `guid`, `pubDate`, `description`, multiple `<category>` tags. `atom:link rel="self"` present. |
| `/site.webmanifest` | 200 | Valid, has name/short_name/description/icons (192/512)/theme_color/background_color/display/start_url. |

## 2. Sitemap URL health + domain canonicalization

- **All 56 sitemap URLs returned HTTP 200** (checked in parallel, `xargs -P 8`, `--max-redirs 0`, no redirects followed). Zero 3xx/4xx/5xx found in the sitemap.
- **Non-www → www:** `https://form5472prep.com/` → `307 Temporary Redirect` → `https://www.form5472prep.com/` (200). **Issue:** a permanent canonicalization (apex→www) should be a 301 or 308, not a 307 — 307 signals "temporary" to crawlers and doesn't consolidate ranking signals as reliably.
- **http → https:** `http://form5472prep.com/` → `308` → `https://form5472prep.com/` → `307` → `https://www.form5472prep.com/`. That's **2 redirect hops** (verified via `curl -w num_redirects` = 2) to reach the canonical URL, and the final hop is the same 307 issue above. `http://www.form5472prep.com/` is a single `308` hop straight to https — that path is fine.
- **404 handling:** `/this-does-not-exist-xyz` → `404` (correct). `/blog/some-fake-slug` → `404` (correct, not a soft-404 200).

## 3. Page-level SEO metadata (12 pages sampled)

Sampled: `/`, `/pricing`, `/ein`, `/itin`, `/partners`, `/about`, `/blog`, 3 blog posts (`amended-form-5472-correcting-errors`, `form-5472-deadline-2026`, `what-is-form-5472`), and 2 depth-1 `[seoSlug]` pages (`/form-5472-penalty`, `/form-5472-fax-number`).

| Page | Title (len) | Meta desc (len) | Canonical | Robots meta | og:title/image/type | Twitter card | lang | H1 | JSON-LD types | Internal / External / irs.gov links | Visible FAQ | Images missing alt |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | 51 | 298 (long) | `https://www.form5472prep.com` (no trailing slash) | index,follow | ✓ / ✓ (`/opengraph-image`) / **null** | summary_large_image | en | 1 | Organization, WebSite, Service, FAQPage, BreadcrumbList, WebPage | 27 / 0 / **0** | Yes ("Common questions") | 0 (no `<img>`, SVG icons only) |
| `/pricing` | 65 | 198 | `/pricing` ✓ | index,follow | ✓ / **null** / null | summary_large_image | en | 1 | Product | 24 / 0 / 0 | Yes ("Pricing FAQ") | 0 |
| `/ein` | 60 | 194 | `/ein` ✓ | index,follow | ✓ / **null** / null | summary_large_image | en | 1 | Service, FAQPage, BreadcrumbList, WebPage | 24 / 0 / 0 | Yes | 0 |
| `/itin` | 60 | 234 (long) | `/itin` ✓ | index,follow | ✓ / **null** / null | summary_large_image | en | 1 | Service, FAQPage, BreadcrumbList, WebPage | 24 / 0 / 0 | Yes | 0 |
| `/partners` | 74 | 207 | `/partners` ✓ | index,follow | ✓ / **null** / null | summary_large_image | en | 1 | Service, FAQPage, BreadcrumbList | 23 / 0 / 0 | Yes ("Partner FAQ") | 0 |
| `/about` | 35 | 190 | `/about` ✓ | index,follow | ✓ / **null** / null | summary_large_image | en | 1 | AboutPage | 25 / 1 / **1** | No | 0 |
| `/blog` (index) | 20 | 99 | `/blog` ✓ | index,follow | ✓ / **null** / null | summary_large_image | en | 1 | **none (0 JSON-LD blocks)** | 44 / 0 / 0 | No | 0/24 |
| `/blog/amended-form-5472-correcting-errors` | 61 | 255 (long) | ✓ | index,follow | ✓ / ✓ / article | summary_large_image | en | 1 | BlogPosting, BreadcrumbList, FAQPage | 34 / 2 / **2** | Yes | 0/6 |
| `/blog/form-5472-deadline-2026` | **91 (long)** | 193 | ✓ | index,follow | ✓ / ✓ / article | summary_large_image | en | 1 | BlogPosting, BreadcrumbList, FAQPage | 36 / 2 / 2 | Yes | 0/6 |
| `/blog/what-is-form-5472` | 87 (long) | 232 (long) | ✓ | index,follow | ✓ / ✓ / article | summary_large_image | en | 1 | BlogPosting, BreadcrumbList, FAQPage | 29 / 0 / **0** | Yes | 0/6 |
| `/form-5472-penalty` | 53 | 156 | ✓ | **null (no explicit tag)** | ✓ / **null** / article | summary_large_image | en | 1 | Article, FAQPage, BreadcrumbList, HowTo | 28 / 0 / **0** | Yes | 0 |
| `/form-5472-fax-number` | 41 | 175 | ✓ | **null (no explicit tag)** | ✓ / **null** / article | summary_large_image | en | 1 | Article, FAQPage, BreadcrumbList, HowTo | 28 / 0 / **0** | Yes | 0 |

Notes on the table:
- **Title length:** Google typically truncates around ~55-60 characters (~600px). Flagged "long": `/blog/form-5472-deadline-2026` (91), `/blog/what-is-form-5472` (87).
- **Meta description length:** recommended ≤155-160 chars for reliable full display. Flagged "long": `/` (298), `/blog/amended-form-5472-correcting-errors` (255), `/itin` (234), `/blog/what-is-form-5472` (232), `/partners` (207), `/pricing` (198).
- **Visible FAQ column correction:** an early automated pass (whitespace-naive text extraction) mis-flagged `/`, `/pricing`, `/partners` as lacking a visible FAQ section. Manual check confirmed all three do have one, just labeled "Common questions" / "Pricing FAQ" / "Partner FAQ" rather than the literal string "FAQ" — corrected in the table above. `/about` genuinely has no FAQPage schema and no FAQ section (expected — it's a company-info page).
- **Images:** homepage and most utility/seoSlug pages render zero `<img>` tags (icons are inline SVG, which don't need `alt`). The `/blog` index and the 3 sampled blog posts together have 42 `<img>` tags and **0 missing `alt` attributes** — clean.
- **H1 count:** every sampled page has exactly 1 `<h1>` — good, no duplicate/missing H1s found.
- **Duplicate H1:** `/` and `/pricing` share the identical H1 text "Flat-rate Form 5472 filing. No hidden fees." — not a crawl error, but a missed differentiation opportunity between the two most commercially important pages.

## 4. FAQ rich-result validity (visible-text match check)

Checked all `FAQPage` JSON-LD blocks across the 12 sampled pages: **72 total `Question.name` values**, checked against the page's decoded visible text.

**Result: 0 mismatches (72/72 match).** An initial regex pass reported several false mismatches (e.g. "What's the difference between the two tiers?") — root-caused to the analysis script not decoding the `&#x27;` (hex) apostrophe HTML entity used in the rendered page, while the JSON-LD used a literal `'`. After fixing the entity-decoding bug and re-running, every FAQ question's name string is a verbatim substring of the page's visible text. This is good news: no rich-result eligibility risk from FAQ text mismatches was found.

## 5. PageSpeed Insights (PSI) API

Called `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://www.form5472prep.com/&strategy=mobile&category=performance&category=seo` (no API key).

**Result: HTTP 429 — quota exceeded.** Response body: `"Quota exceeded for quota metric 'Queries' and limit 'Queries per day'... quota_limit_value: 0"`. The unauthenticated/shared quota for this environment's default GCP consumer project is capped at 0 queries/day — this is a hard block, not a transient rate limit, so a retry would not help. **Skipped per instructions.** Recommend re-running with a personal `PAGESPEED_API_KEY` or via the PSI web UI (https://pagespeed.web.dev/) for real performance/SEO scores, LCP/CLS/INP/TBT, and the top flagged audits.

## 6. GEO probes (homepage `/` and blog post `/blog/what-is-form-5472`)

| Signal | `/` (homepage) | `/blog/what-is-form-5472` |
|---|---|---|
| Clear one-sentence entity definition near top | ✓ — "Done-for-you Form 5472 + pro forma 1120 for foreign-owned US LLCs. Avoid the $25,000-per-form IRS penalty — with fax delivery to the IRS Ogden PIN Unit included on every plan." (appears in first screen of visible text) | ✓ — has a "The 30-second version" H2 as an explicit direct-answer block |
| Concrete price | ✓ $149 / $199 | ✓ (referenced) |
| Penalty amount ($25,000) | ✓ 10 occurrences | ✓ 12 occurrences |
| Deadline (April 15) | ✗ 0 occurrences on homepage | ✓ 8 occurrences |
| Fax number (+1-855-887-7737) | ✓ 13 occurrences | ✓ 8 occurrences |
| Turnaround time | ✓ "5-7 business days" × 19 | referenced |
| Outbound citation to irs.gov | ✗ **0 links** | ✗ **0 links** |
| Named author (Person) | ✗ — byline is "Form5472 Prep" (brand/logo avatar), subtitle "Reviewed filing guidance for foreign-owned LLCs" — no person's name anywhere on the page | ✗ same pattern |
| Org name in schema | ✓ "Form5472 Prep" (Organization schema) | ✓ (Organization as `author`/`publisher`) |
| Org address/contact in schema | Partial — `contactPoint` has 2 entries (support@, billing@, both routing to the same `support@form5472prep.com`), but **no `PostalAddress`, no `telephone`, and `sameAs: []`** (no social profile links) anywhere in the Organization schema across the whole site | same Organization block reused |

**Site-wide irs.gov citation check** (12 sampled pages): only **2 of 12** pages (`/about`, `/blog/amended-form-5472-correcting-errors`) link out to `www.irs.gov`; `/blog/form-5472-deadline-2026` also links out (2 links). The remaining 9 sampled pages — including the homepage, `/pricing`, `/ein`, `/itin`, `/partners`, `/blog` index, `/blog/what-is-form-5472`, `/form-5472-penalty`, `/form-5472-fax-number` — have **zero** outbound hyperlinks to irs.gov despite extensively discussing IRS rules, forms, and penalties in prose.

## 7. 404 behavior (re-confirmed)

- `GET /this-does-not-exist-xyz` → **404** ✓
- `GET /blog/some-fake-slug` → **404** ✓ (not a soft-404 200 — correctly not indexable)

## 8. Additional observations (bonus, from response headers)

- HSTS enabled (`strict-transport-security: max-age=63072000`), `x-frame-options: DENY`, `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin` — solid security header baseline, indirectly helps trust signals.
- Served via Vercel/Next.js; homepage response was `x-vercel-cache: STALE` at fetch time (not a defect, just a cache-state note).

---

## Ranked issues (full list, see chat summary for top 10 condensed)

1. **Apex→www redirect is 307, not 301/308** — `https://form5472prep.com/` returns `307` before reaching `https://www.form5472prep.com/`; the `http://` path adds a second hop through the same 307. Recommend a single 301/308 straight to the canonical `https://www.` URL.
2. **No named human author/reviewer anywhere on the site** — all `author`/`publisher` JSON-LD is `Organization` ("Form5472 Prep"); visible bylines say "Reviewed by a qualified tax accountant" but never a name or credential (no CPA/EA name, no `Person` schema anywhere in 12 pages sampled). This is a YMYL E-E-A-T gap for Google and reduces citability for AI answer engines.
3. **9 of 12 sampled pages have zero outbound citations to irs.gov**, including the homepage and the flagship `/form-5472-penalty` and `/form-5472-fax-number` pages, despite heavy IRS-rule discussion in prose. Only `/about` and 2 blog posts link out.
4. **Organization schema has no `PostalAddress`/`telephone` and empty `sameAs`** — no physical address, no social profiles linked anywhere in the site's Organization JSON-LD.
5. **Title tags too long for full SERP display** on `/blog/form-5472-deadline-2026` (91 chars) and `/blog/what-is-form-5472` (87 chars).
6. **Meta descriptions too long** (>200 chars) on `/` (298), `/blog/amended-form-5472-correcting-errors` (255), `/itin` (234), `/blog/what-is-form-5472` (232).
7. **`/blog` index page has zero JSON-LD** — no CollectionPage/ItemList/BreadcrumbList despite linking to 20+ articles.
8. **`og:image` is null on 8 of 12 sampled pages** (`/pricing`, `/ein`, `/itin`, `/partners`, `/about`, `/blog`, `/form-5472-penalty`, `/form-5472-fax-number`) — only the homepage and the 3 blog posts have a page-specific social preview image; the rest will show no/blank image card when shared.
9. **`og:type` is null on 6 of 12 sampled pages** (`/`, `/pricing`, `/ein`, `/itin`, `/partners`, `/about`, `/blog`) — should be `website` for correct semantic typing.
10. **Canonical/sitemap trailing-slash mismatch on homepage** — `<link rel="canonical">` = `https://www.form5472prep.com` (no trailing slash) vs `sitemap.xml` `<loc>https://www.form5472prep.com/</loc>` (with slash). Functionally equivalent to Google but worth normalizing.
11. **`robots` meta tag absent (not explicitly declared)** on `/form-5472-penalty` and `/form-5472-fax-number`, while every other sampled page explicitly declares `index, follow` — defaults to indexable either way, but the inconsistency is a lint/regression risk.
12. **PSI quota exhausted (0/day)** for this environment — no live Core Web Vitals / performance score could be captured; needs a keyed re-run.
13. **Duplicate H1 text** between `/` and `/pricing` ("Flat-rate Form 5472 filing. No hidden fees.") — minor.

## What's already strong (for balance)

- 56/56 sitemap URLs return 200; sitemap has `<lastmod>` on every entry and is referenced from robots.txt.
- robots.txt explicitly allows every major AI crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, etc.) — excellent AEO/GEO posture.
- `llms.txt` is unusually complete: entity definition, pricing, penalty amount, deadline rule, fax number, contact emails, page index — a genuine GEO asset.
- 404s behave correctly (real 404, no soft-404s).
- 72/72 FAQPage question strings match visible page text — no rich-result eligibility risk found.
- Article/BlogPosting schema on blog posts and seoSlug pages includes `dateModified`, `author`, and `publisher` consistently.
- HowTo schema present on `/form-5472-penalty` and `/form-5472-fax-number` (good AEO target for step-by-step answer boxes).
- 0 images missing `alt` across all sampled pages with `<img>` tags.
- Homepage and one sampled blog post both open with a clear one-sentence entity definition and concrete numbers (price, penalty, fax number) — strong for LLM-answer extraction.
