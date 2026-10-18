# 2026-10-17/18 — PTIN credential across the site (SEO / AEO / GEO)

Owner: "did we mention our reviewers are holding PTIN?" → "ok put it on, and mention to all seo aeo geo". Rule doc: `docs/reviews/2026-10-17-ptin-credential-copy.md`.

## Ownership
Worktree `~/Developer/f5472-wt/ptin-copy` (branch feat/ptin-credential) → main. Lane A (Sonnet): marketing pages, landing-pages.ts, services-pages.ts, faq.ts (+ new FAQ "Who reviews my Form 5472 filing?"), llms.ts, seo.ts JSON-LD, pricing.ts, chat route prompt, stripeCheckoutBranding.ts, tests. Lane B (Sonnet): 115 content/blog posts. Orchestrator: footer (marketing layout), services hub, contact, start, late-filing checker, statistics, editorial policy, file layout, wizard/sign UI, email copy.

## What shipped
- First mention per page/post: "reviewed by a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN)"; later "PTIN-holding tax accountant". 272 added lines; no "qualified accountant" left describing us (one general-advice blog sentence kept).
- Titles/H1s/slugs/URLs unchanged; 3 meta descriptions that already mentioned review gained PTIN (≤160 chars).
- Chatbot: reviewer holds a PTIN; never CPA/EA/attorney/IRS approval; no names/PTIN numbers.
- Evidence: 2605 related tests pass; tsc 0; eslint 0; next build 0; Codex review "ship it".

## Contracts
- Never write IRS-approved/certified/licensed/registered, licensed by the IRS, endorsed; a PTIN is an ID every paid preparer needs. Keep "not a CPA firm / not tax advice" disclaimers.
- New pages/posts describing the review must use the approved forms.

## Open
- Terms page "last updated" date left at 2026-09-21 (owner may bump).
