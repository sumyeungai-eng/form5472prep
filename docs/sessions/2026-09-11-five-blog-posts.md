# Claude handoff — five new blog posts, 2026-09-11

## Status

Published and checked on 2026-09-11 (Asia/Seoul). User asked for five new posts and publication today, using sales-blog-geo-aeo. All five articles and original images are live. Final local production build, TypeScript, 217 tests, the local/live batch verifier, and all three production markers passed. This handoff records the actual release; no publication steps remain for the articles.

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

Content commit: `1a4c5e4` (`a7b0c65..1a4c5e4`), pushed to `origin/main`. Git-linked production deployment `dpl_5xi3W4yTHJdCb7JueL9qWpPEsXor`, URL `https://form5472prep-fkp6tnxwe-form5472prep.vercel.app`, reached Ready and was aliased to `https://www.form5472prep.com`. No production CLI deploy was used. This final evidence update is a separate documentation-only commit after the content release.

Final release build exited 0 and printed Compiled successfully; log at `/tmp/form5472-blog-build-20260911.log`. Local batch verifier passed again at 2026-09-10T17:24:45Z. All 11 unique external citations returned HTTP 200 in separate checks; CSV ledger parsed with 16 rows and no errors.

Live batch verification completed at **2026-09-10T17:27:23.769Z = September 11, 02:27 Asia/Seoul**:

- All five article URLs: HTTP 200, expected title, single H1, visible September 11 date, correct production canonical, no page/header noindex, rendered decision table, Article dates and three-question FAQ structured data.
- All five matching WebP URLs: HTTP 200, image/webp, nonempty image payloads.
- All 11 unique body-internal links: HTTP 200, including /start, /contact, /itin and /ein.
- All five discoverable in /blog, /sitemap.xml and /feed.xml; robots.txt did not block blog crawling.
- Mandatory markers passed together after deployment: empty EIN checkout POST returned **400**; /ein/apply returned **200** with **Owner date of birth**; /form-5472-penalty-calculator returned **200**. The empty validation probe did not submit a valid application or create a checkout.
- Production browser preview of the personal-expenses article confirmed expected H1, date, canonical and fully loaded optimized hero. A 390×844 live viewport had scrollWidth 390; temporary viewport reset. Additional local desktop checks confirmed the EIN and name-change heroes fully loaded.

An initial live probe returned 404 while Vercel was still Building, as expected before alias promotion. It was rerun only after Ready and passed. The local verifier initially assumed a production canonical in localhost; corrected the verifier to respect local environment origin. No site metadata change was needed.

Verification is publication/access evidence, not proof of search indexing, rich-result eligibility, AI citations, or sales performance. Production database contents were not queried directly; the public results confirm no tombstone or DB override prevented these pages from appearing.

## Open follow-ups

No owner decision required for this batch. No recurring monitor or search-engine submission created.

Separate follow-up, not changed here: live `/itin` copy has broad tax-purpose and passport-mailing statements worth reviewing against current W-7/IRS document guidance. Generic blog sidebar CTA/author strapline still uses existing Form 5472 language on ITIN/EIN articles; article-body CTAs are correctly scoped. These are pre-existing template/product-copy issues, not part of this five-post release.

Suggested future review: recheck operative IRS instructions when forms change and assess page outcomes after sufficient Search Console/analytics data exists. This is not a scheduled automation.
