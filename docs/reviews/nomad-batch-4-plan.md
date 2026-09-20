# Plan — nomad batch 4: ten topics (2026-09-20) — NOT APPROVED, NOTHING WRITTEN

Conversion target `/start`. Rules, template and gate: `docs/reviews/new-posts-nomad-batch-spec.md`.
Priority is judgement from corpus gaps (154 posts) and query intent; no keyword-tool
volumes (Ahrefs not authorised). Treaty status below was read from the IRS A-to-Z list
on 2026-09-20; each writer lane must re-confirm.

## Seven country posts (template: `form-5472-<country>-residents-us-llc`)

| # | Slug | Treaty (IRS list) | Distinct angle to verify at write time |
|---|---|---|---|
| 1 | `form-5472-turkey-residents-us-llc` | listed | Istanbul/Antalya nomad base; Turkish tax ID; digital nomad visa status from a gov.tr source |
| 2 | `form-5472-hungary-residents-us-llc` | **listed with "CAUTION Treaty Terminated"** | The only hot nomad country whose US treaty ended — state termination date from Treasury/IRS; White Card from a Hungarian government source |
| 3 | `form-5472-costa-rica-residents-us-llc` | not listed | Digital nomad law/visa from a Costa Rican government source; territorial tax in outline only |
| 4 | `form-5472-argentina-residents-us-llc` | not listed | Buenos Aires; CUIT/CUIL; peso amounts only at a dated official rate; no claims about exchange controls unless officially sourced |
| 5 | `form-5472-south-korea-residents-us-llc` | listed (Korea) | Workation (F-1-D) visa from a Korean government source; resident registration/tax number |
| 6 | `form-5472-croatia-residents-us-llc` | not listed | A US–Croatia treaty was signed (2022) — confirm not in force; nomad temporary-stay permit from mup.gov.hr |
| 7 | `form-5472-taiwan-residents-us-llc` | not listed | Employment Gold Card; no comprehensive treaty — check whether any US–Taiwan double-tax relief law has taken effect and say "unverified" if unclear |

## Three topic posts

| # | Slug | Query | Own asset | Risk |
|---|---|---|---|---|
| 8 | `pay-yourself-from-us-llc-non-resident` | "how to pay yourself from us llc non resident" | Table: owner draw vs "salary" vs loan vs reimbursement — and which line each lands on Form 5472 | Do not advise on home-country tax; link `does-foreign-owned-llc-pay-us-tax` and the Part V statement example |
| 9 | `form-5472-from-mercury-wise-relay-statements` | "form 5472 mercury wise transactions" | Step-by-step: export statements → tag owner movements → totals per category, with a worked ledger | Any bank feature claim only from that bank's own help centre; overlap with `stripe-paypal-wise-form-5472` — link, don't restate |
| 10 | `form-5472-coaches-consultants-course-creators` | "us llc online coach non resident tax" | Worked example: course-platform payouts (not reportable) vs owner withdrawals (reportable) | Same pattern as the freelancer post — must differ in examples and platform facts |

Reserve if one fails sourcing: `form-5472-affiliate-marketers-content-sites`.

## Execution (only after approval)
1. Ten parallel writer lanes, disjoint files, draft-to-disk before gate; Claude subagents
   unless codex credits are back (exhausted until 2026-09-19 — smoke-test first) — state the lane used.
2. Orchestrator: artwork + ARTWORK_ALTS, hub table rows + backlinks.
3. One fact-audit lane; Hungary (termination date), Croatia and Taiwan (treaty status) first.
4. tsc, vitest, build, `git push origin main`, live checks, session log.
Suggested order if partially approved: 8, 2, 9, 1, 5, 3, 6, 10, 4, 7.
