# Human-Test Report — HK Tax Assistant 香港報稅助手 (localhost:3211) — 2026-08-31
Mode: A (browser + scripts) | Personas: first-time single filer (zh/EN), married single-earner parent | Pages covered: 15 of 15 discovered | Journeys run: wizard persona (a) single-salary EN, wizard persona (b) married+2kids+rent zh, quick-calculator + wizard handoff, adversarial validation, mid-wizard language switch, 404, full link crawl

## Verdict
The site is in strong shape: every link resolves, every computation checked by hand was exact to the dollar (persona (a) $58,560; persona (b) $7,120 with MPA / $28,300 without; calculator $55,500 / $27,360), Lighthouse scores are 91–100 performance and 96–100 accessibility, all 15 routes are overflow-free at 375px, and the bilingual toggle switches everything without losing state. Two High findings block a clean ship: the married-person-allowance control defaults to "do not claim" (silently inflating a single-earner couple's bill by $21,180 in the test case), and form validation blocks progression with zero visible feedback. **Ship after the two High fixes.**

## Scorecard (1–10)
| Area | Score | One-line justification |
|---|---|---|
| First impression & clarity | 9 | Hero answers what/why instantly, disclaimer prominent, clear CTAs |
| Navigation & findability | 9 | All nav/footer links correct; guides index links all 9 pages |
| Speed | 10 | TTFB ~2ms local, Lighthouse perf 91–100, wizard CLS 0 |
| Links & buttons integrity | 10 | 47 URLs, 0 broken, 0 redirect chains, 0 slow |
| Forms & core journey | 6 | Computations exact, flow works, but H1+H2 below |
| Mobile | 9 | 15/15 routes exactly 375px wide, no overflow |
| Trust & polish | 8 | Consistent design system; default 404 and raw line-labels detract |

## Findings

### [H1] High — Married person's allowance defaults to "not claimed", silently inflating tax
- What: `claimMarriedAllowanceBy` defaults to `none`. A married single-earner couple that misses the control (bottom of step 1, appears only after selecting 已婚) gets $28,300 instead of $7,120 — a $21,180 silent overstatement with no warning anywhere.
- Where: /wizard step 1 (是否申索已婚人士免稅額); verified via full persona (b) run both ways.
- Why it matters: this is the single most common married-filing situation in HK; a silently wrong headline number destroys trust in the whole tool.
- Fix: default to the sole earner when exactly one spouse has income; otherwise keep explicit but add a review-step warning when married + MPA unclaimed. Effort: S.

### [H2] High — Validation failures are completely silent
- What: entering an invalid amount (e.g. −5000) blocks "Next" with no error message, no aria-invalid, no role=alert — the user is stuck with no explanation.
- Where: /wizard step 3 amount field; likely all zod-validated fields (same submit path).
- Why it matters: users cannot tell why the wizard won't advance; abandonment risk.
- Fix: render field-level error text from RHF errors + set aria-invalid/aria-describedby. Effort: S–M.

### [M1] Medium — Unbranded default 404
- What: /nonexistent shows Next.js's raw "404: This page could not be found" — no shell, no nav, English-only.
- Fix: add `not-found.tsx` using the site shell with a bilingual message + home link. Effort: S.

### [M2] Medium — Wizard returns to step 1 on refresh
- What: data survives refresh (verified) but the current step doesn't; a user on step 5 restarts at step 1 and must click Next 4× (fields stay filled).
- Fix: persist step index in the versioned localStorage state. Effort: S.

### [L1] Low — Raw item ids shown as line labels
- What: computation breakdown and review show "income-1" instead of a human label (項目代碼/中文名稱/英文名稱 default to the id when the user doesn't rename them).
- Fix: default labels to 薪金/Salary for the first item, or hide the code fields behind an "advanced" toggle. Effort: S.

### [L2] Low — Register inconsistency in Chinese copy
- What: guides index intro uses spoken Cantonese register (喺/嘅/睇下) while guide bodies and the rest of the site use 書面語.
- Fix: one-pass copy edit of the guides index (and grep 喺/嘅/咗 sitewide). Effort: S.

### [L3] Low — "?" help buttons lack aria-labels
- What: wizard help popover buttons render bare "?" with no accessible name (Lighthouse still passes; found by manual tree read).
- Fix: aria-label from the question label. Effort: S.

## ✅ What already works well
- Every hand-checked computation exact to the dollar, including allowance caps ($130k rent → $100k cap applied) and the scenario availability reasons (joint salaries correctly unavailable for a one-earner couple, PA correctly gated on eligibility answers, with clear bilingual reasons).
- Language toggle switches every string incl. mid-wizard without data loss; year switcher updates caps live on /deductions.
- Persistence: full wizard state survives refresh; results survive reload; calculator → wizard handoff carries values.
- Link integrity, speed, mobile, print button, disclaimer coverage on every page.

## ⚡ Performance data
| Page | Lighthouse perf | a11y | Notes |
|---|---|---|---|
| / | 91 | 100 | |
| /wizard | 99 | 100 | CLS 0 after height reservation |
| /deductions | 100 | 100 | |
| /guides/salaries-tax | 100 | 100 | |
| /calculators | 99 | 96 | |
TTFB 1.8–3.1ms local (3 runs); home payload 22.6 KB HTML. PSI/CWV not available for localhost.

## 🔗 Link & button audit summary
15 pages crawled, 47 URLs checked, 0 broken, 0 redirect chains, 0 slow (>2s). Buttons: wizard controls, calculators, deduction disclosures, FAQ accordions, language/year toggles all respond visibly. No dead controls found.

## Top 5 next actions (impact ÷ effort)
1. H1 — smart MPA default + review-step warning
2. H2 — visible validation errors
3. M1 — branded bilingual 404
4. M2 — persist wizard step index
5. L1 — human-friendly default income-item labels

## Test data created (cleanup list)
localStorage only (hktax:wizard:v1, hktax:lang, hktax:year) in the test browser — no server data exists by design.

## Not covered
Safari/Firefox rendering; real-device touch; full WCAG audit (surface pass + Lighthouse only); persona (c) salary+rental+sole-prop ran at unit-test level (mapping.test.ts asserts its exact engine inputs) and via the property/profits calculators, not as a full browser wizard walk; print output verified as stylesheet + button only, not pixel-checked; eTAX submission impossible by design.
