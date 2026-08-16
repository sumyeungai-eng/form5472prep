# SEO / AEO / GEO optimisation — plan & results (2026-08-16)

Inputs: `2026-08-16-seo-aeo-geo-code-audit.md`, `2026-08-16-seo-aeo-geo-live-audit.md`.
Baseline was already strong (AI-crawler allow-list, FAQ/HowTo/Article schema on landing pages, RSS, llms.txt, question-form H2s, 56/56 sitemap URLs 200 with lastmod). This pass closes the specific gaps.

## Decisions (architect)
- **Google-guideline check on AggregateRating**: marking up Trustpilot ratings as self-serving Organization/Product review snippets violates Google's review-snippet policy (third-party sourced). Decision: keep Trustpilot as a visible link + Review Collector only; no AggregateRating schema.
- **Named author / Person schema**: YMYL E-E-A-T's biggest lever, but requires a real credentialed reviewer (name, EA/CPA, PTIN). Owner-gated — infrastructure not built until the data exists (avoid inventing credentials).
- **Apex→www 307**: set at Vercel edge (project domain `redirectStatusCode` null → 307). Changing to 308 is an account setting (API PATCH blocked by permission policy in this session). Owner toggle: Vercel → Project → Settings → Domains → form5472prep.com → Edit → Redirect status 308.
- **dateModified honesty**: landing pages used build-time `new Date()`; replaced with `page.updated ?? CONTENT_LAST_REVIEWED` (single constant in `src/lib/seo.ts`, bumped when service copy changes). Blog posts keep per-post `updated:` frontmatter, backfilled from git where missing.
- **llms.txt**: converted from static file to generated route + new `/llms-full.txt` corpus so it never drifts from posts/landing pages again.

## Work waves (disjoint file sets, parallel)
| Lane | Producer | Files | Scope |
|---|---|---|---|
| A | grok | fixed marketing pages, blog index, blog post, apply layouts | Pricing FAQPage+Breadcrumb; blog CollectionPage; blog speakable + full "Last updated" + TOC (rehype-slug); dateModified + organizationNode (telephone/email/sameAs) on home/about/ein/itin/partners; og:image/og:type restored via `pageOpenGraph`; home & itin descriptions ≤160; relative canonicals |
| B | codex | `landing-pages.ts`, `[seoSlug]/page.tsx`, `content/blog/*.md` | `sources[]` (vetted irs.gov/eCFR/LII URLs, curl-verified 200) rendered as "Official sources" + Article `citation`; honest dateModified; landing titles ≤60 / descriptions 120–160; blog titles ≤60, descriptions 120–160, `updated:` backfill (8 posts), irs.gov citation in the 5 posts lacking one |
| C | grok | `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts`, delete `public/llms.txt` | generated llms.txt (core pages incl. /partners, 21 topic pages, 30 guides) + llms-full.txt (full markdown corpus, 51 docs) |
| Architect | — | `src/lib/seo.ts` (new shared primitives), this doc | interface design, verification, build, deploy, live re-probe |

## Results (live, verified — see `2026-08-16-seo-aeo-geo-live-recheck.md`)
- Commits: `5f725df` (main pass), `4ebdd75` (skeptic-review fixes), `28505a2` (promo page). All deployed to prod.
- og:image null 8/12 → 0; og:type null 6/12 → 0. `/pricing` FAQPage+Breadcrumb ✔; `/blog` CollectionPage ✔; blog speakable + full "Last updated" + TOC (anchor ids verified against h2 ids) ✔; landing "Official sources" + Article `citation` + honest dates + visible "Last reviewed" ✔; Organization: email + Trustpilot sameAs (telephone removed — it was the IRS fax line, caught by the advisor) ✔.
- `/llms.txt` 8 KB → 21 KB generated (12 core incl. /partners + 21 topic + 23 guides); `/llms-full.txt` 529 KB, `X-Robots-Tag: noindex`.
- Titles/descriptions: worst offenders fixed (91→52, 87→57; home 298→138, itin 234→142, pricing/ein/partners/about trimmed). Remaining: 12 blog `<title>`s exceed 60 only because of the ` · Form5472 Prep` suffix (frontmatter ≤60) — accepted.
- Lighthouse mobile: home perf 85 / SEO 100 (LCP 3.4s, CLS 0); blog post 93 / 100.
- Sitemap 56/56 → 200 with lastmod. Blog irs.gov citation coverage 100%; landing pages 23/23 with sources.
- Lane note: grok-implementer unusable headless (PermissionCancelled) → all implementation went through codex-implementer; recorded in doctrine/lessons.md.

## Still open (owner-gated)
1. Vercel apex→www redirect is 307: Project → Settings → Domains → form5472prep.com → Edit → status 308.
2. Named credentialed reviewer (name, EA/CPA, PTIN, bio) → Person schema + author page. Highest remaining YMYL lever.
3. Organization `legalName` + postal address, and a link to the IRS Acceptance Agent list entry proving the CAA claim.
