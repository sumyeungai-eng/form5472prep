# PR: hktax — Hong Kong personal tax filing assistant (香港報稅助手) v1

Open at: https://github.com/sumyeungai-eng/form5472prep/compare/main...claude/hk-tax-filing-website-m97q8g?expand=1
(mark as Draft; paste the body below)

## Summary
Self-contained bilingual (繁中/EN) Next.js app under `hktax/` — a complete HK personal
tax calculator covering 薪俸稅, 物業稅, 利得稅 (unincorporated) and 個人入息課稅, with an
assessment-election optimizer, guided interview wizard, quick calculators, deduction
eligibility checker, and nine guide pages. 100% client-side; no data leaves the browser.
Zero changes to the root form5472prep app.

## Verification
- **120 unit tests green**, including a **29-test golden acceptance suite** independently
  hand-derived from statute (double-derived + third-pass rule engine), 5 scenarios anchored
  to official IRD/GovHK worked examples — it caught and led to fixing two real legal errors
  (pre-2018/19 married-PA election gating; MPA cross-spouse condition under amended s.29(1)).
- All 2024/25 + 2025/26 statutory parameters verified online against ird.gov.hk / gov.hk
  with per-group sources (`hktax/src/lib/tax/params/SOURCES.md`); 2025/26 reduction cap
  $3,000 (Feb 2026 Budget) encoded; property tax correctly excluded from the reduction.
- BIR60 part mapping verified against the 2025/26 eGuide (Last-Modified 2026-03-31).
- Lighthouse: perf 91–100, a11y 96–100 across key pages; wizard CLS 0; all 15 routes
  overflow-free at 375px; link crawl 47 URLs, 0 broken.
- Human-test QA round: report + all findings fixed
  (`hktax/docs/reviews/human-test-report-20260831-hktax.md`); persona walkthroughs
  browser-verified against independent hand arithmetic ($58,560 / $7,120 cases exact).
- Fresh-copy acceptance: `npm ci && npm run build && npm run test` green from a clean copy.

## Known v1 limitations (documented in-app)
- Provisional tax estimated at current-year allowances (IRD uses following-year);
  caveated in UI + guide, noted in golden suite (G24).
- Non-resident / time-apportionment and corporate profits tax out of scope by design.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
