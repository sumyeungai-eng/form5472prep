# Claude handoff — five new blog posts, 2026-09-11

## Status

User asked for five new posts and publication today, using sales-blog-geo-aeo. All five posts and original images are complete. Final local production build, TypeScript, 217 tests, and the full local batch verifier passed. Production deployment and verification are pending at this checkpoint. Do not treat this checkpoint as evidence of publication. This file will be updated with the actual release result.

## Ownership

| Checkout / branch | Owned paths |
|---|---|
| `/Users/sumyeung/Documents/Codex/form5472`, `main` | Five new `content/blog/` Markdown files and matching `public/blog/` WebP files listed below |
| Same | Five new alt-text entries in shared `src/lib/blog.ts`; no other behavior changes |
| Same | `docs/reviews/2026-09-11-five-posts-*`, this session log, `scripts/verify-blog-batch-20260911.mjs` |

Starting commit: `a7b0c65`. Remote fetched and matched HEAD before staging. Existing untracked owner images, email artwork, and `src/lib/wizard/` were left untouched and must not be committed with this batch. No `hktax/`, migrations, payment flows, advertising, prices, or crawler configuration changes.

## Articles

All have `date` and `updated` 2026-09-11, `draft: false`, organizational author Form5472 Prep, unique descriptions, decision tables, three visible FAQs, source citations, and service-fit CTAs.

1. `/blog/form-5472-crypto-owner-transfers` — wallet ownership and USD recordkeeping; no crypto-income-tax advice.
2. `/blog/form-5472-llc-pays-personal-expenses` — indirect owner benefits, deductibility/reporting distinction, linked repayments.
3. `/blog/ein-address-change-form-8822-b` — correct address record, existing EIN, responsible-party 60-day distinction.
4. `/blog/itin-name-change-marriage-passport` — correction versus renewal, legal-name evidence, existing ITIN details.
5. `/blog/itin-without-passport-alternative-documents` — identity/foreign-status combinations, validity, certification, route limits.

Each has a matching `/blog/<slug>.webp` hero: 1280×720, about 69–88 KB. Prompts, mode, asset paths and sizes: `docs/reviews/2026-09-11-five-posts-image-prompts.md`. Built-in image generation; originals retained outside repo. Meaningful alt text in `src/lib/blog.ts`.

## Contracts to preserve

- Production only through `git push origin main`, never Vercel production CLI. This is the form5472prep app, not hktax.
- Hybrid blog database rows can override files; tombstones can hide them. Verify live URLs after deploy, not just local Markdown.
- Never include GEO/AEO comments or research notes in article bodies; the site previously exposed them to readers.
- Do not add internal UTM query strings; preserve original acquisition attribution.
- Do not sell a new EIN solely for an address change or imply that every name-only correction is an advertised ITIN service.
- CAA assistance does not waive federal tax eligibility or identity rules. Complex crypto, undocumented loans and disputed deductions require separate advice, not promised package coverage.
- Figures in the crypto example are hypothetical calculation inputs, not service prices. No service prices were hardcoded.

## Local review evidence

- Vitest: 14 files / 217 tests passed.
- `tsc --noEmit`: exit 0.
- Initial production build: exit 0 and Compiled successfully. Known missing localhost Postgres fallback and unrelated MessagesPanel img lint warning only.
- Browser desktop preview inspected (1280-wide default), plus 390×844 mobile checks on all five pages: document scrollWidth 390, one decision table per page, expected H1. Crypto table inspected at its anchor; mobile headings and content fit, no horizontal overflow. Crypto and passport hero loading visually confirmed; remaining image HTTP/content checks in batch verifier. Temporary viewport reset.
- Read-only batch verifier checks article/image HTTP, title/date, canonical, indexability, decision table, Article and 3-FAQ schema, every article-body internal destination, blog index, sitemap and RSS. Local canonical is correctly localhost; production must use www.form5472prep.com.
- Evidence-led editorial brief and 16-row claim ledger under `docs/reviews/`. No professional sign-off, analytics baseline, volume, rankings, indexing or conversion uplift claimed.

## Release evidence

Final release build exited 0; log at `/tmp/form5472-blog-build-20260911.log`. Local batch verifier passed at 2026-09-10T17:22:12Z (September 11 in Asia/Seoul). All 11 unique external citations returned HTTP 200 in separate checks; CSV ledger parsed with 16 rows and no errors. Pending scoped commit/push, Git-linked Vercel readiness, live batch verifier and the three production markers. Update this section after actual verification.

## Open follow-ups

No owner decision required for this batch. No recurring monitor or search-engine submission created.

Separate follow-up, not changed here: live `/itin` copy has broad tax-purpose and passport-mailing statements worth reviewing against current W-7/IRS document guidance. Generic blog sidebar CTA/author strapline still uses existing Form 5472 language on ITIN/EIN articles; article-body CTAs are correctly scoped. These are pre-existing template/product-copy issues, not part of this five-post release.

Suggested future review: recheck operative IRS instructions when forms change and assess page outcomes after sufficient Search Console/analytics data exists. This is not a scheduled automation.
