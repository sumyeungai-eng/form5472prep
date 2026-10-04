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
