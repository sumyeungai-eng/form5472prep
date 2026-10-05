# 2026-10-05 — Compact Keywords course → site gap pass

Owner request: apply the whole Compact Keywords course (20 transcripts) to make
form5472prep.com strong on SEO / AEO / GEO. Follows `2026-10-01-seo-compact-keywords.md`.

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/seo-schema` (`seo-schema`) | `src/lib/seo.ts`, home/`[seoSlug]`/`blog/[slug]`/`services/[slug]` pages, `services-pages.ts`(+test), `landing-pages.ts` (`published`), new `service-links.ts`, `related-posts.ts`, `components/seo/ServiceCard.tsx` |
| `~/Developer/f5472-wt/seo-pages` (`seo-pages`) | `(marketing)/press/**`, `(marketing)/compare/**`, `public/press/**`, `components/press/CopyButton.tsx`, `(marketing)/layout.tsx` footer, `sitemap.ts`, `llms.ts` |
| `~/Developer/f5472-wt/seo-embed` (`seo-embed`) | `next.config.mjs` headers, `src/app/embed/**`, `components/embed/**`, `components/tools/{Penalty,Deadline}Calculator.tsx` (moved), the two tool pages, root `layout.tsx` (ad-tag guard) |
| `~/Developer/f5472-wt/seo-course` (`seo-course-1004`) | integration branch + `docs/seo/course-notes-A..E.md`, `plan-2026-10-04-course-gaps.md`, `offsite-kit-2026-10-04.md`, this log |

## What shipped
- One Organization entity: `ORG_ID`/`ORG_REF`/`organizationDocument()` in `seo.ts`; every page embeds the node once and references it by `@id` (blog previously used a different id; landing/services used anonymous orgs).
- Removed the home WebSite SearchAction (no site search exists).
- Landing pages: real `published` dates (git first-seen) + Article `image`.
- Blog Speakable now targets the bold answer lead.
- Service pages: visible "Last reviewed", "Official IRS sources" (2–3 dofollow irs.gov links each, test-enforced), HowTo JSON-LD only where the page has a numbered list (3 of 8).
- Contextual service card on landing pages (after first section) and blog posts (end of article) via `service-links.ts`; related posts by shared tags, also on mobile.
- `/press` press kit (blurb, boilerplate, facts, logos in `public/press/`, colours, tools, contact) and `/compare` hub over the 7 provider pages; footer "Filing services" band links all 8 service pages + Compare + Press kit; sitemap + llms.txt updated; llms.txt feed count now computed.
- Embeddable calculators: `/embed/form-5472-penalty-calculator` (iframe height 1620) and `/embed/form-5472-deadline-calculator` (960), noindex,follow, canonical to the tool page, "Powered by" link; "Embed this calculator" snippet on both tool pages.
- Off-site kit `docs/seo/offsite-kit-2026-10-04.md` (expert quotes, podcasts, directory blurbs, Product Hunt, press release, Reddit, Meetup, video, AI-visibility prompts).
- Verified locally on the merged tree: tsc clean, vitest 1734/1734, `npm run build` OK; `next start` → all new routes 200; `/embed/*` sends `frame-ancestors *` and no XFO, `/` keeps `SAMEORIGIN` + `frame-ancestors 'self'`; mobile 375px no horizontal scroll. Live verification: see commit/deploy notes below.

## Contracts
- Never emit an anonymous or differently-spelled Organization; use `ORG_REF` / `organizationDocument()`.
- HowTo schema only when the page visibly has the steps.
- Every service page keeps ≥2 irs.gov links (`services-pages.test.ts`).
- `next.config.mjs`: the global frame-blocking rule's source is `/((?!embed(?:/|$)).*)`; only `/embed/*` may be framed. Embed pages must stay noindex and free of the ad config (root layout guard) — VisitPing and Vercel Analytics still record embed views (paths start `/embed/`, referrer = host site — useful to see who embeds).
- Press page: only repo-verifiable facts; no invented founders, numbers or "as seen in".

## Open
Owner-gated: GSC (Domain + URL-prefix properties, sitemap, request indexing for /press, /compare, services), Bing Webmaster Tools, a real named reviewer/author with verifiable credentials, postal address/phone (NAP), directory/Product Hunt/quote-platform/podcast/Reddit accounts, real reviews before any Review schema, apex 307→308.
Follow-ups: audience pages (accountants/tax preparers, outsourcing, bulk filing, holding-company, rental-property LLC) once Moz is reachable — Claude-in-Chrome blocked every site with "Could not verify this site's safety category" on 2026-10-05; most other audience angles already have blog posts. Image SEO (keyword-named hero image per service page) and a sourced statistics page remain from the plan's Wave 2.

## Part 2 (same day) — owner said "use chrome to complete all"
- GSC (sumyeungai@ = Chrome authuser 2, property `sc-domain:form5472prep.com`): 193 indexed / 137 not (86 noindex by design, 40 discovered-not-indexed). Requested indexing: /compare, /press, /blog, and 4 discovered-not-indexed posts (in-house-vs-outsourced, first-year, reportable-transactions-examples, ein-without-ssn). /services + 7 service pages already indexed. GSC throttled further requests.
- Vercel: apex `form5472prep.com` redirect → www now **308** (was 307) via API; verified `curl -I` 308.
- Branches `seo-img` (8 keyword-named service hero images, `scripts/render-service-artwork.mjs`, `heroImage` field + tests) and `seo-stats` (`/form-5472-statistics`, 25 facts, evidence `docs/seo/stats-sources-2026-10-05.md`) merged; tsc clean, vitest 1790/1790, build OK.
- Contracts: every stat in `src/lib/form5472-stats.ts` needs an official-domain https source (test-enforced) and a row in the evidence file; service hero alt must contain the page keyword (test-enforced).
- Still owner-gated: account-based off-site work (directories, Product Hunt, quote platforms, podcasts, Reddit), named reviewer, NAP, real reviews.

## Part 3 — audience pages, Bing, Moz tracking
- New service pages (branch `seo-audience`, Moz research `docs/seo/audience-keywords-2026-10-05.md`): /services/hire-someone-to-file-form-5472, /services/form-5472-preparer, /services/form-5472-for-accountants (covers tax preparers, CPA firms, outsourcing), /services/form-5472-for-bookkeepers. Per-page `lastReviewed` (fallback `SERVICES_LAST_REVIEWED`) via `serviceLastReviewed()`; these 4 use a 400–700-word body band in the test (others 800–1,200).
- Bing Webmaster Tools (apex property, logged in via Chrome): 14 URLs submitted 2026-10-05; sitemap healthy (250 URLs, last crawl 10/3). AI Performance + competitor backlinks recorded in `docs/seo/competitor-backlinks-2026-10-05.md` (we: 1 referring domain; form5472.online: 43).
- Moz Pro campaign "Form5472 Prep" (account 25501479, campaign 3235940): site form5472prep.com incl. subdomains, Google desktop US national, 46 keywords labelled services(16)/guides(16)/tools(7)/alternatives(4)/branded(3), competitors form5472.online, doola.com, firstbase.io, GA skipped (no GA4 on this site). Crawl limit selection may still show 50,000 — set to 1,000 in campaign settings if it didn't stick. Account keyword cap 1,500 shared with the Taxley campaign (~34 free).
- Moz AI Visibility: all 6 dashboards / 300 prompts are used by Taxley — owner must free a slot before a Form5472 Prep dashboard can be created.

## Part 4 — Moz account sharing (coordinated with the Taxley "seo" session)
- Moz AI Visibility (shared 6 dashboards / 300 prompts): Form5472 dashboard 3465 = 40 prompts (agreed cap; prompts must contain no commas or quotes). Taxley 3395 + 3375 archived (owner/Taxley session); MileMarketplace has the 6th dashboard.
- Moz rank tracking (shared 1,500 keywords): Form5472 Prep campaign 3235940 = 196 keywords (agreed ≤ ~246); full list + labels in `docs/seo/moz-tracked-keywords.tsv`. Ask the Taxley session before adding more; never edit the Taxley campaign/dashboards from a Form5472 session.
