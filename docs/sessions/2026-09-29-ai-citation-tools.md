# 2026-09-29 — Five AI-citable free tools

Plan: `docs/plans/2026-09-29-ai-citation-tools.md` (owner: "build 1 to 5"; skipped the free
reasonable-cause builder and the fill-it-yourself line guide — they give away the paid product).

## Ownership
- Integration branch `feat/ai-tools` in `~/Developer/f5472-wt/ai-tools`, merged to `main`.
  Lanes (own worktree/branch each, disjoint files): tool-rates (sonnet), tool-txcheck (opus),
  tool-latefile (opus), tool-states (opus: fees + calendar). Coordinator did integration + fixes.
- New pages under `src/app/(marketing)/`: `irs-yearly-average-exchange-rates`,
  `form-5472-reportable-transactions-checker`, `form-5472-late-filing-checker`,
  `foreign-owned-llc-compliance-calendar`, `llc-annual-fees-by-state`. Logic/data in
  `src/lib/tools/{exchange-rates,reportable-transactions,late-filing,state-fees,compliance-calendar}`.
  Source notes in `docs/research/*.md` (reportable-transactions note is generated from `sources.ts`).
- Wiring: `src/app/sitemap.ts`, `src/lib/llms.ts`, homepage `ToolsAndGuides` (4-wide grid),
  footer "Free tools" column in `src/app/(marketing)/layout.tsx`.

## Verification
- Two independent fact-checkers (not the builders): federal — 0 WRONG (195 IRS rate cells, all
  regulation/instruction/IRM quotes verbatim); states — 0 wrong amounts/rules. Fixed every
  OVERSTATED/UNVERIFIABLE item (76c5ebd federal, 41756f5 states).
- Also corrected the EXISTING penalty calculator: removed "first-time late filers are frequently
  successful" (no source; §1.6038A-4(b) is case-by-case; FTA generally n/a per IRM), CP15 → CP 215,
  "assesses automatically" → "can assess, often automatically when a late return is processed".
- vitest 1186/1186, tsc 0, production build 0 (all five static). Browser (prod build): every page
  has JSON-LD (WebApplication/Dataset + FAQPage + BreadcrumbList), "Last reviewed", CTA; shareable
  URLs hydrate results (GBP 2025 £1,000 → $1,317.52); no horizontal scroll at 375px after fixing the
  converter grid (min-w-0 + smaller result on phones).

## Contracts
- Every stated fact must stay traceable to a primary source in `docs/research/` or `sources.ts`;
  tests enforce allowed source domains for the reportable-transactions checker.
- IRS rate table has two IRS-published typos corrected (EUR 2024 "0,924", RUB 2021 ".73.686");
  keep the footnote when refreshing.
- "Last reviewed 29 September 2026" dates are hard-coded per tool; bump them when data is re-verified.

## Open
- Owner-gated: Search Console — request indexing for the five URLs / resubmit sitemap.
- Yearly refresh: IRS rates (when IRS adds 2026), state fees (DE $400 from TY2026 already in).
- Follow-ups: existing three tools could get shareable URLs + methodology sections; public data
  feed / embeddable widgets; blog posts still quote Delaware $300 and pre-Aug-2026 BOI wording
  (owned by the blog session — `content/blog/**`).
