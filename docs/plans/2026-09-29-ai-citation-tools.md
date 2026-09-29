# Plan — five AI-citable tools (2026-09-29)

Owner request: "let's build 1 to 5 … skip the one you think should skip" (skipped: free
reasonable-cause statement builder; fill-it-yourself line-by-line Form 5472 guide — both give away
the paid deliverable).

## Tools (slug → purpose)
1. `/irs-yearly-average-exchange-rates` — IRS yearly average currency rates table + converter.
2. `/form-5472-reportable-transactions-checker` — "is this a reportable related-party transaction?"
3. `/foreign-owned-llc-compliance-calendar` — personal federal + state deadline list, .ics download.
4. `/form-5472-late-filing-checker` — DIIRSP eligibility / which late-filing route applies.
5. `/llc-annual-fees-by-state` — annual fee / franchise tax / due dates for the states foreign
   owners actually use (initial set: DE, WY, NM, FL, TX, NV, NY, CA, CO, MT).

## Every tool must have (definition of done)
- Answer-first intro, the working tool, shareable result URL (state in query params + "Copy link"),
  "How we calculate this" with primary-source links + "Last reviewed 2026-09-29", 4–6 FAQs
  (≤50-word answers) with FAQPage JSON-LD, WebApplication + BreadcrumbList JSON-LD, CTA to /start.
- Every fact from a primary source (irs.gov, eCFR / Cornell LII, state .gov); source notes in
  `docs/research/<tool>.md`. Unverifiable facts are omitted, never guessed.
- Pure logic in `src/lib/tools/<tool>/` with vitest tests; no DB, no schema, no new API routes.
- No licensure / "CPA" / "IRS-approved" / guaranteed-outcome / tax-advice claims.

## Waves
- W1 (parallel, one worktree + branch each, disjoint files): L1 = tool 1, L2 = tool 2, L3 = tool 4,
  L4 = tools 3 + 5 (shared state data).
- W2: independent fact-check of every stated fact against its source (different agent from the
  builders); integration by coordinator (sitemap, llms.txt, nav/footer tool lists, related links);
  merged tests + production build; browser check desktop + 375px; deploy (git push origin main).

## Completion condition
All five pages live on production, each meeting the definition of done, fact-check has no open
errors, tests + build green, browser-checked, session log written.

## Owner-gated / out of scope
- Search Console: request indexing / resubmit sitemap (owner's Google account).
- Yearly data refresh (IRS rates each January; state fees when laws change).
- Existing three tools' upgrades (shareable links / methodology) — follow-up, not in this goal.
- Public data feed / MCP endpoint and embeddable widgets — follow-up.
