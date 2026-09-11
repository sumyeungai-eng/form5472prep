# Claude handoff — five uncommon blog topics, September 11, 2026

## Status

Five articles and original hero images completed using the requested Codex Orchestration skill, the sales-blog-geo-aeo workflow and built-in image generation. Release/live evidence will be appended after the Git-linked deployment. This file is a handoff, not an instruction to resend or rewrite existing content.

## Ownership

| Checkout / branch | Owned paths |
|---|---|
| `/Users/sumyeung/Documents/Codex/form5472`, `main` | Five new article Markdown files and matching WebP files below |
| Same | Five alt-text entries in `src/lib/blog.ts` |
| Same | Optional slug arguments in `scripts/verify-blog-batch-20260911.mjs`; prior default batch preserved |
| Same | `docs/reviews/2026-09-11-uncommon-posts-editorial.md` and this log |

Starting prior-content HEAD was `25572f0`; concurrent confirmation-email work advanced the shared main checkout to `0da36ae`. That session's log was read and its files left untouched. Existing untracked owner images, email artwork and `src/lib/wizard/` remain untouched. No hktax, migrations, pricing, payments, email, ads or crawler edits.

## New articles

1. `/blog/form-5472-outstanding-owner-loan-no-transfers` — old debt balances can matter despite no new cash movement; loan direction and record map.
2. `/blog/form-5472-cash-accrual-year-end-cutoff` — December charge versus January settlement; conditional accrual rule, not universal accrual advice.
3. `/blog/form-5472-nonresident-spouse-joint-return-election` — section 6013(g)/(h) foreign-person exception; establish validity and effective years with an adviser.
4. `/blog/irsn-vs-itin-rejected-w7` — return processing is not ITIN approval; prior temporary number disclosure.
5. `/blog/tax-extension-without-itin` — separate paper extension, estimated payment and W-7 package; payment deadline is not extended.

Each has September 11, 2026 publication/update dates, `draft: false`, an organizational author, useful decision tables, three visible FAQs, primary-source links, and scoped CTAs. Each `/blog/<slug>.webp` is 1280×720, 58–77 KB. Prompt set and final/original paths are recorded in the editorial document; originals remain outside repo.

## Editorial evidence and boundaries

Two independent research/writing agents and a separate content reviewer were routed through native Codex Orchestration. Explicit requests were Sol/high for research writers and Astra/high for review; route accepted, actual runtime model metadata unavailable. No persistent provider or orchestration configuration changes. This is AI editorial/source review, not a qualified tax professional's sign-off.

The independent reviewer found no blocker in the five article theses. Fixed: first-time W-7 blank-TIN rule versus renewal's existing ITIN; separate accrued interest from principal; notice-specific return-copy instructions; renewal clarification and existing repair-guide link. Mobile review found a four-column loan table causing 16px overflow; converted it to three columns without changing its meaning.

No search-volume, demand, low-competition, rankings, indexing, AI citation or sales uplift claimed. The topics address observed gaps in this site's library, not proven exclusivity. Research briefs, observed search context, claim ledger and image prompts are in `docs/reviews/2026-09-11-uncommon-posts-editorial.md`. Never move editorial notes or GEO/AEO comments into article bodies.

## Verification and release

- TypeScript passed; Vitest 14 files / 217 tests passed.
- Initial production build passed; expected missing-local-Postgres fallback noise only, plus the pre-existing MessagesPanel image lint warning.
- Initial local five-page verifier passed: responses, titles/dates, canonical, indexability, tables, Article/FAQ schema, images, body links, index, sitemap and RSS.
- Desktop hero inspected; mobile 390×844 layout inspected on all five, with the loan-table fix described above. Final checks recorded below after release.

Production must remain `origin/main` deployed by `git push origin main` only. Do not use a Vercel production CLI deployment. Hybrid blog database entries can override/hide filesystem posts; public URL checks are required after alias promotion.

## Separate follow-ups (not changed)

- Older `content/blog/form-5472-dormant-llc-no-income.md` appears to incorrectly suggest a pro forma 1120 is still expected in a genuinely no-reportable-transaction year and refers to a Part III no-transactions checkbox. Review against current instructions before reusing that guidance; also account for outstanding loan balances.
- Existing `/itin` page claims about broad bank-account/W-8BEN eligibility, mandatory passport mailing without CAA, passport return timing and remote certification need a separate source-backed review. The new body CTAs use narrower eligibility/service language.
- Existing generic blog sidebar/author strapline uses Form 5472 language on ITIN posts. No template expansion in this batch.
- No owner decision blocks these new articles. No recurring monitor, search submission or outreach was created.
