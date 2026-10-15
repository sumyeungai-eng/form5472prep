# 2026-10-15 — GEO lane: brand-attributed answers, price re-survey

Lane log for the GEO/AEO specialist pass (Moz AI Visibility read of 2026-10-12:
AI Mode and Gemini cited our pages in 10 of 17 answers without naming us).

## Ownership

| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/geo` · `seo/geo-2026-10-15` | `src/lib/landing-pages.ts`, `src/lib/provider-prices.ts` (+test), `src/app/(marketing)/compare/**`, `src/lib/form5472-stats.ts`, `src/app/(marketing)/form-5472-statistics/**`, `src/app/(marketing)/pricing/**`, `src/lib/faq.ts`, `src/lib/llms.ts`, `content/blog/final-form-5472-closing-foreign-owned-llc.md`, `content/blog/form-5472-dormant-llc-no-income.md`, new `docs/seo/form5472-price-survey-2026-10-15.md` |

Not pushed; merge to `main` is the orchestrator's call.

## What shipped (this commit)

- **Brand-attributed capsules** (one "Form5472 Prep" per capsule): statistics hero +
  enforcement and filer-count intros (H2 now "How many foreign-owned companies file
  Form 5472?"); compare-page capsule ("Form5472 Prep's survey …"); pricing H2
  "How much does Form5472 Prep cost?" with a pricing.ts-derived capsule; fax-number,
  reasonable-cause, penalty and deadline pages; FAQ cost and e-file answers.
- **Prompt-worded question H2s with ≤60-word capsules**: can it be faxed, fax-receipt
  service, e-file or fax/mail (FAQ), penalty and how to avoid it, deadline for a
  foreign-owned SMLLC, not a US resident, who can file (file-form-5472), reasonable
  cause statement, alternatives to doola (doola page), doola vs Firstbase (/compare hub),
  final 5472 on dissolution and no-income (blog), and four buyer prompts on
  /compare/form-5472-filing-services (flat fee, cheapest way, hire someone, best preparer).
- **Price re-survey 2026-10-15** (curl, providers' own pages; quotes self-checked):
  Simple5472 added; quotes refreshed for 5472Direct, Laramie, tax-usa.net, Firstbase,
  Stripe Atlas, form5472.io, Edetax; Northwest note corrected (page loads, no price).
- llms.txt/llms-full: compare-page summary and a price-comparison document, both computed
  from provider-prices.ts.
- Fixes found on the way: pricing page no longer implies the fee "avoids" the penalty;
  dormant post no longer claims "most foreign owners qualify" for abatement or a
  "no transactions" checkbox; deadline page's wrong June 30 example; one literal `$149`
  in landing-pages.ts (`$149,` slipped past landing-prices.test's regex); FAQ prices now
  come from pricing.ts.

Evidence: targeted vitest suites (landing-*, faq, llms, provider-prices, cp-notice-guard,
blog, form5472-stats, services-pages, service-links) pass; `tsc --noEmit` clean; lint clean
on touched files; all 13 touched routes rendered 200 on a local dev server.

## Contracts

- Competitor rows change only with a new dated survey file; `PRICE_SURVEY_FILE` points at it
  and every `sourceQuote` must be a whitespace-normalised substring of it.
- **Edetax shows its announced $79.99 (`priceFromLabel: "16 October 2026"`)**; its page said
  $49.99 until 15 October. Its late-year rows were removed because the post-rise late price
  is unpublished.
- Landing/doola/hub answers read competitor figures from provider-prices.ts (no literals).
- `landing-body.test.ts` pins file-form-5472 section indices 2 and 5; new sections there
  were added after index 5 on purpose.
- llms-full.txt is ~453 KB of its 460 KB budget.

## Open

Follow-ups:
- Re-fetch edetax.com/pricing on or after 16 October 2026 to confirm $79.99 and the
  late-year price; add a dated addendum to the survey.
- Firstbase's tax page still carries 2025 text; re-check $899 next survey.
- `/form-5472-penalty-calculator` page copy (not in this lane) still has no brand capsule.
- The landing-prices test regex misses `$149,`; tighten it (owner of that test).

Owner-gated: none.

## Lane notes

Price survey delegated to a sonnet research agent; diff reviewed read-only by an opus
agent (must-fix on Edetax wording and six should-fixes, all addressed). Codex lane not used
(ChatGPT login rejected as of 2026-10-15).
