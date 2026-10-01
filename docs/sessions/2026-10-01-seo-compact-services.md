# 2026-10-01 — Compact-keywords: /services hub + 8 service pages

Plan: `docs/seo/plan-2026-10-01-compact-keywords.md` (step 6). Keywords: `docs/seo/keyword-sheet.csv`.

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/seo-compact` · `feat/seo-compact` | `src/lib/services-pages.ts` (+ `.test.ts`), `src/app/(marketing)/services/**`, one footer `<li>` in `src/app/(marketing)/layout.tsx`, one import + one spread line in `src/app/sitemap.ts`, services section in `src/lib/llms.ts` |
| other lane (separate worktree) | `src/app/layout.tsx`, blog pages, `src/lib/blog-tags.ts`, `next.config.mjs`, rest of `src/app/sitemap.ts` — not touched here |

Untracked `docs/seo/link-building-2026-10-01.md` was present in this worktree and is NOT part of this commit (not ours).

## What shipped (local commit only, not pushed / not deployed)
- `/services` hub (H1 "Form 5472 filing services"): 5 H2 categories with card panels (anchor = child H1), incl. "For clients of formation services" (6 formation-provider pages + `/form-5472-fax-number`, previously orphans) and "EIN & ITIN"; CTA at bottom; CollectionPage + BreadcrumbList JSON-LD.
- 8 children under `/services/<slug>` (static, `dynamicParams = false`): Service + FAQPage + BreadcrumbList JSON-LD, CTA after intro and at bottom, 4 FAQs, 4–5 related links.
- Footer "Services" column links `/services` → every child is 2 clicks from home.
- Sitemap: `serviceSitemapEntries()` (hub + 8). llms.txt "## Services" section; llms-full.txt includes the 8 service documents.
- Evidence: vitest 1494/1494; tsc 0; eslint 0 on changed files; `npm run build` 0 with `○ /services` and `● /services/[slug]` (8 SSG); 375px: scrollWidth = 375 on all 9 pages.

## Contracts
- Copy, keywords, titles, metas live only in `src/lib/services-pages.ts`; `services-pages.test.ts` enforces the playbook §6 checklist (title starts with keyword ≤60, meta starts with keyword ≤160, exact-order H1, keyword in first 6 words and an H2, 4 FAQs ≤50 words, ≥4 related links, 800–1,200 words, banned terms, prices only from `pricing.ts`, internal links resolve).
- Prices are interpolated from `pricing.ts`; partner pricing is never published on the white-label page (`showOffer: false`).
- `<meta description>` = short; `longDescription` → og:/twitter:/JSON-LD/llms.

## Open
- Owner-gated: merge `feat/seo-compact` → `main` and push (deploy); GSC submission; Moz On-Page Grader on production URLs (96–98 target) and `docs/seo/optimisation-log.csv`.
- Follow-ups: IndexNow ping for the 9 URLs after deploy; plan steps 7–9.
