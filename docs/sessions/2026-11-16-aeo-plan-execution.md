# 2026-11-16 — AEO plan execution (batch 1 shipped, batch 2 held)

## Ownership
| Checkout / branch | Owns |
|---|---|
| `~/Developer/f5472-wt/moz-1104-fix`, `seo/aeo-1116` → main `6b17a93` | batch 1: faq.ts/llms.ts SERVICE_FACT_FAQS, /pricing, /compare, home, /security, /about, one blog post; docs/seo/aeo, docs/seo/links, docs/seo/moz-data-2026-11-15 |
| `seo/aeo-batch2` (pushed, NOT merged) `4892a32`+`c2066d2` | services-pages.ts (12 prepended paragraphs), form-7004-extension page, landing-pages.ts provider guides, 2 blog posts, new is-form5472-prep-legit post, cp-notice-guard test, outreach drafts |
| this branch `docs/aeo-log` → main | plan execution log + this file |

## Shipped (verified)
Batch 1 on main `6b17a93`: vitest pass on touched areas, tsc 0, build 589/589, Codex review "nothing material", live-checked (/compare "at a glance", /pricing + /llms.txt "Is Form5472 Prep tax software?", /security safety Q&A), IndexNow 200.

## Contracts
- Pages ChatGPT cites (docs/seo/aeo/protected-pages.md: /, /compare, /about, /security, /pricing, /services/form-5472-filing-service, …) are ADD-ONLY: never delete/reword existing sentences, titles, H1s, URLs.
- Service pages: new copy goes through `prependIntro` above the original intro; services-pages.test word caps are now 800–1,300 / 400–800.
- cp-notice-guard allows exactly one sourced CP15 paragraph (individual-account notice vs business CP215); every other CP15 mention still fails.
- Questions in docs/seo/aeo/questions.md are never reworded; weekly re-test appends to tracking.tsv.

## Open
Owner-gated: connect Claude in Chrome (GSC steps 3/12a/18/22); sign in to /admin and Bing in the in-app browser (steps 5/6); send Phase C drafts (docs/seo/aeo/outreach-drafts.md, links/vendor-brief.md); named accountant, legal name on /about, more reviews.
Follow-ups: re-run the 14 questions ≥2026-11-20, then merge seo/aeo-batch2 if no protected question was lost; GSC indexing requests for batch 1+2 pages; week-5 review ~2026-12-20.

## Lane notes
Codex lanes (fable-advisor:codex-implementer, default model) built both batches; first service-page pass rewrote intros on ranking pages and repeated one block on 12 pages — redone add-only with ≤6-word overlap check. ChatGPT baseline ran logged-out (no source panel, so some cited URLs are inferred).
