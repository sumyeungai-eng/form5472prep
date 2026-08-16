# SEO / AEO / GEO Code Audit — form5472prep.com

Date: 2026-08-16 · Scope: repo `form5472` (read-only sweep by Explore agent, saved by architect). Companion: `2026-08-16-seo-aeo-geo-live-audit.md` (live-site probe).

## A. Inventory by area

### 1. Global config
- `src/app/layout.tsx:30-90` — `metadataBase: new URL(env.appUrl)`, title template `"%s · Form5472 Prep"` (:34), OG (:46-54), Twitter (:55-60), `robots` index/follow + googleBot max-snippet (:61-65), Google/Bing verification env vars (:71-76), icons + manifest (:83-89). `<html lang="en">` :95.
- `src/app/robots.ts:47-65` — `*` allow `/`, disallow `/dashboard,/filings,/admin,/api/`. Explicit allow-list of 17 AI crawler UAs (:27-45). `sitemap` + `host` from `env.appUrl`.
- `src/app/sitemap.ts:10-53` — `revalidate=60`; 12 static routes (:17-30) + `LANDING_PAGES.filter(!noindex)` (21/23, :43-50) + `getAllPosts()` with `lastModified = updated ?? publishAt ?? date` (:32-38). `/start`, `/sign-in` excluded by design.
- `src/app/feed.xml/route.ts` — RSS 2.0, force-static, revalidate 3600, built for AI-crawler discovery.
- `src/app/opengraph-image.tsx` — default 1200×630 OG; per-post variant at `blog/[slug]/opengraph-image.tsx`.
- `public/llms.txt` (87 lines) — strong: entity summary, pricing, legal citations, contact, "Last updated: 2026-08-14". **No `llms-full.txt`.** Documents list omits `/partners`, doesn't enumerate the 30 posts / 23 landing pages.
- `next.config.mjs` — headers only. **No `images`, no `redirects()`, no `trailingSlash`.**

### 2. Structured data (JSON-LD) — shared emitter `src/components/JsonLd.tsx`
| Page | File | Types | Notes |
|---|---|---|---|
| Home | `(marketing)/page.tsx:742-870` | Organization (:747, knowsAbout, contactPoint), WebSite+SearchAction, Service+Offer×2, FAQPage (9, from `FAQS` :36-73), BreadcrumbList (1 item), WebPage+Speakable | no dateModified; Organization has no telephone/address/sameAs |
| Pricing | `pricing/page.tsx:32-56` | Product+Offer×2 (raw `<script>`, not `<JsonLd>`) | **Visible "Pricing FAQ" (5 Q&A, :175-201) has NO FAQPage schema.** No BreadcrumbList |
| EIN / ITIN | `ein/page.tsx:307-369`, `itin/page.tsx:308-369` | Service+Offer, FAQPage, BreadcrumbList, WebPage+Speakable | complete; no dateModified |
| Partners | `partners/page.tsx:230-272` | Service+Audience, FAQPage, BreadcrumbList | no WebPage/Speakable |
| About | `about/page.tsx:29-41` | AboutPage + Organization | no Person, no dateModified |
| Blog post | `blog/[slug]/page.tsx:65-102` | BlogPosting (dateModified = updated ?? date :72, author Organization :73), BreadcrumbList, FAQPage (if `extractFaqs` ≥2) | author never Person; no speakable |
| `[seoSlug]` | `[seoSlug]/page.tsx:607-713` | Article+Speakable, FAQPage, BreadcrumbList, HowTo (≥3 sections, `#step-N` anchors) | most complete; dateModified = build-time `new Date()` (:611,:619) |
| `/blog` index | `blog/page.tsx` | **none** | |
No AggregateRating/Review/Person/LocalBusiness anywhere.

### 3. Per-route metadata
All 20 marketing routes export metadata/generateMetadata. `start`, `sign-in`, `ein/apply`, `itin/apply` correctly noindex. Inconsistency: relative vs hard-coded absolute canonicals (`about:17`, `pricing:19,24`, `editorial-policy:15`, `ein/apply/layout:12`, `itin/apply/layout:12`). Per-page `openGraph` objects replace the layout's → many pages lose og:image/og:type (confirmed live).

### 4. Blog system
- Hybrid: `content/blog/*.md` (30) + Postgres `Post` (DB wins; `deleted:true` tombstones) — `src/lib/blog.ts:9-30,155-227`.
- `PostFrontmatter {title, description, date, publishAt?, updated?, author?, tags?, draft?}` (:35-47); `PostMeta` adds slug/readingMinutes/image/imageAlt.
- `extractFaqs(body)` (:277-311): `## Frequently asked questions` → `###`/bold pairs.
- Rendering (`blog/[slug]/page.tsx`): H1 :130; byline :144-152 (brand only); date + reading time :134-143; only "Updated for {year}" chip :176 (no full last-updated date); no TOC; related posts :250-274; breadcrumb schema only. `react-markdown` + `remark-gfm`, no rehype-slug (headings have no ids).
- 65% of sampled H2s are question-form. **22/30 posts have `updated:`; 8 do not.** 29/30 link `/start`; 2/30 link `/pricing`; 25/30 cite irs.gov.

### 5. `[seoSlug]` pages
`src/lib/landing-pages.ts` (2,321 lines), `LandingPage {slug,title,metaDescription,h1,intro,sections[],faqs[],relatedSlugs?,noindex?,pricingMode?,startSrc?}` (:12-40). 23 entries; 2 noindex (`pro-form-5472`, `form-5472-50-off`). `dynamicParams=false`. Full schema set. TOC + `#step-N` (:183-238).

### 6. E-E-A-T
- `about/page.tsx` says "reviewed by a qualified tax accountant" (:24,:127) but names no one; no Person schema; no `/authors/*`. `seo-engine/author-eeat.md` already flags this as the top fix — **owner must supply name + credential (EA/CPA) + PTIN**.
- `editorial-policy/page.tsx` promises a visible "Last updated" date on each guide (:53-59) — only partly true.
- No postal address anywhere (Terms: Wyoming law). Trustpilot profile exists (`TrustpilotWidget.tsx`).

### 7. Technical
1 H1 per page everywhere; `next/image` only; alt text everywhere; no SEO-critical client rendering. `env.ts:19-22` normalises apex→www only in the canonical string, no HTTP redirect in code (Vercel does a 307 at the edge — see live audit).

### 8. Existing docs / prior work (don't redo)
- `seo-engine/*` (May 2026) — stale ($79 pricing, dead `/file`). Historical only.
- `IMPROVEMENT_PLAYBOOK.md`, `website-review-recommendations.md` (:29 review schema, :58 named author — still open), `reviews/review-20260725-whole-website.md` (:68 aggregateRating open).
- Shipped commits: AI-crawler robots (4a5dd1e/b74e48d), llms.txt rewrite (0e74baf/cb5396d), direct-answer blocks + FAQ schema + /about + /editorial-policy (7daac76), question-form headings (e5a59dd), static shell + RSS + blog schema (2fed209), sitemap/EIN/ITIN schema (3dcd8d0), 10 new guides (7e74214), Trustpilot (edbd111).

## B. Gap list (ranked)
**High**
1. Pricing FAQ has no FAQPage schema (`pricing/page.tsx:175-201`).
2. No named credentialed author/reviewer (Person schema) — YMYL. Owner-gated data.
3. No AggregateRating — but Google forbids marking up third-party (Trustpilot) ratings as self-serving review snippets; keep as visible link only.
4. Apex→www is a 307 at Vercel edge, not 308/301; no code-level redirect.
5. 8/30 posts lack `updated:` → dateModified == datePublished.
**Medium**
6. Home/About/EIN/ITIN/Partners schema lack `dateModified`.
7. Blog posts show no full "Last updated" date.
8. `llms.txt` omits `/partners`, no enumeration, no `llms-full.txt`.
9. `/blog` index has zero JSON-LD.
10. Per-page `openGraph` overrides drop og:image/og:type (8/12 and 6/12 pages live).
11. Titles > 60 / descriptions > 160 on several pages (home desc 298 chars; two blog titles 87–91).
12. 9/12 sampled pages have zero irs.gov outbound citations (home, `/form-5472-penalty`, `/form-5472-fax-number`…).
13. Organization schema: no telephone, no sameAs.
**Low**
14. Canonical style inconsistent; pricing raw `<script>`; blog lacks speakable + TOC; `/partner` noindex pattern inconsistent; stale `seo-engine/` docs.

## C. Quick facts for specs
- Sitemap: `export default async function sitemap(): Promise<MetadataRoute.Sitemap>` concatenating static + landing + posts.
- Blog data: `getAllPosts()`, `getPost(slug)`, `extractFaqs(body)`, `formatPostDate` in `src/lib/blog.ts`.
- Landing data: `LANDING_PAGES` in `src/lib/landing-pages.ts`.
- JSON-LD emitter: `<JsonLd data={...}/>` from `src/components/JsonLd.tsx`.
- Env: `env.appUrl` (normalised to www).
