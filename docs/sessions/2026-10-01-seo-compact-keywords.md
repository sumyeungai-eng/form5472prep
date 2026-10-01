# 2026-10-01 — Compact-keywords SEO pass (form5472prep.com)

Method: `~/Downloads/COMPACT-KEYWORDS-PLAYBOOK.md` (Sturm). Plan: `docs/seo/plan-2026-10-01-compact-keywords.md`.
Branches: `feat/seo-compact` (hub + pages, coordinator merges) + `feat/seo-tech` (technical fixes) → main.

## Evidence (docs/seo/)
- `audit-2026-10-01.{md,csv}` — crawl of 514 URLs: 133 titles >60, root canonical "/", /blog/topics 404 with
  280 children, 7 orphans, 23 thin indexable tag pages, apex 307.
- `candidates-2026-10-01.csv` — 297 phrases (127 BOFU). Moz: total monthly volume of 100 BOFU phrases = 14.
- `serp-results-2026-10-01.md`, `keyword-sheet.csv` — Moz SERP Page Scores: best page-one score 66–81, DA 1–17
  sites ranking; our DA 10 (form5472.online 17, form5472.us 11).
- `link-building-2026-10-01.md` — 53 directory/launch/quote targets + copy kit (owner submits).

## Shipped
- `/services` hub (footer-linked, links the 7 former orphans) + 8 BOFU pages under `/services/*`
  (data `src/lib/services-pages.ts`; on-page rules enforced by a test).
- Titles ≤60 via `src/lib/seo-title.ts` (brand only if it fits) + `seoTitle`/`seoDescription` front-matter;
  root canonical removed; `/blog/topics` index (+ link from /blog); tag aliases; MIN_INDEXABLE_TAG_POSTS 7;
  sitemap real lastmod dates (+ services fixed date 2026-10-01).

## Contracts
- Services pages: keyword at start of title/meta, exact-order in H1, first 6 words, an H2; 4 FAQs; 4 related links.
- Never add state/nationality clone pages (rejected as scaled page-per-keyword).
- Bump sitemap dates only on real edits.

## Open (owner-gated)
- Apex 307→308 (Vercel domain settings). GSC: submit /services + 8 children. Directory submissions (accounts).
- Moz paid plan starts in 6 days — re-grade pages before then if copy changes.
