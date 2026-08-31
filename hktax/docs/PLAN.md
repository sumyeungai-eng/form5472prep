# Plan: Hong Kong Personal Tax Filing Assistant (香港個人報稅計算助手)

Version: 1 | Status: AWAITING APPROVAL | Date: 2026-08-31

## 1. Goal

Build a complete, user-friendly, bilingual (繁體中文 + English) Hong Kong personal tax
website that helps individuals understand, calculate, and prepare their tax filing across
all three heads of personal taxation — 薪俸稅 (Salaries Tax), 物業稅 (Property Tax on
rental income), 利得稅 (Profits Tax on sole-proprietorship / side-business income) — plus
個人入息課稅 (Personal Assessment, which is what "入息稅" refers to in the HK system:
the elective aggregation of all three). The site handles everyone from a simple
single-salary employee up to complex cases (salary + rental property + side business +
family deductions), computes every statutory deduction and 免稅額 (allowance),
automatically compares Separate Assessment vs Joint Assessment vs Personal Assessment and
recommends the cheapest legal filing option, and maps the results to the parts of the
BIR60 tax return so the user can file confidently.

**Whole-project acceptance statement:** A user with any combination of salary, rental,
and sole-proprietorship income, plus any set of dependants and deductible expenses, can
complete a guided interview in Chinese or English and receive (a) tax payable under each
applicable head, (b) a recommendation of the optimal assessment election with the dollar
saving, (c) a full line-by-line computation breakdown including provisional tax, and
(d) a BIR60 filing guide — with engine results matching the official GovHK tax calculator
on a golden suite of at least 25 cross-checked scenarios, all engine unit tests passing,
and the site passing a human-test QA round with no critical or major findings.

## 2. Scope and non-goals

**In scope (v1):**

- Years of assessment 2024/25 and 2025/26 (selectable), with per-year parameter files so
  future years are a config change, not a code change.
- **薪俸稅 Salaries Tax:** all income types (salary, bonus, commission, director's fees,
  perquisites, share option gains, back pay/gratuities with the ≤36-month spread-back
  election, pensions, termination sums), rental value of employer-provided accommodation
  (10% / 8% / 4% rules and rateable-value election), the full deduction set (see §5 Step 2
  parameter table), all personal allowances, progressive rates vs two-tiered standard rate
  (whichever is lower), the year's tax reduction (寬減), and provisional salaries tax.
- **物業稅 Property Tax:** per-property NAV computation (rent + lease premium spread −
  irrecoverable rent − owner-paid rates − 20% statutory repairs allowance), 15% rate,
  co-ownership shares, multiple properties, provisional property tax.
- **利得稅 Profits Tax (unincorporated only):** sole proprietorship and partnership share
  for individuals; two-tiered rates 7.5% (first $2M) / 15%, the one-election-per-connected-
  entities rule as an interview question, loss carry-forward, provisional profits tax.
  Assessable profits are computed from user-entered revenue/expenses with a guided list of
  common non-deductible items and simplified capital allowances (60% initial + pooled
  annual allowances for plant & machinery; commercial/industrial building allowances as
  advanced inputs).
- **個人入息課稅 Personal Assessment:** eligibility check, aggregation of all three heads,
  mortgage-loan interest on let property (capped at that property's NAV), business loss
  set-off against other income, deductions and allowances, progressive vs standard-rate
  cap, and the optimizer that enumerates every legally available election combination for
  a single person or married couple (separate / joint assessment / PA individually / PA
  jointly) and recommends the minimum-total-tax option with an explanation.
- **Married-couple handling** throughout, including which elections are available when
  only one spouse has income.
- **Deduction/allowance eligibility checker** (慳稅檢查): plain-language Q&A for every
  deduction and allowance, with caps and common IRD pitfalls.
- **Provisional tax tools:** how the bill is assembled (final + provisional), and a
  holdover (緩繳) eligibility checker with the statutory grounds.
- **Filing guidance content:** BIR60 walkthrough mapping computed figures to return parts,
  deadlines calendar (paper vs eTAX extensions, sole-prop extension), payment dates,
  objection/holdover basics, FAQ, glossary (中英對照).
- **UX:** guided interview wizard with progress save (localStorage only), quick standalone
  calculators, results dashboard with printable/PDF summary, fully responsive, accessible,
  Traditional Chinese default with full English toggle.
- **Privacy:** 100% client-side computation; no tax data ever leaves the browser; no
  accounts, no database.
- Prominent disclaimer: educational tool, not tax advice, not affiliated with IRD.

**Non-goals (explicitly NOT in v1):**

- No actual submission to IRD / eTAX integration (technically impossible for third parties).
- No corporate profits tax (limited companies), stamp duty, estate matters, or CRS/FATCA.
- No non-resident / time-apportionment computation (60-day rule and days-in-days-out
  apportionment covered as informational content with a "seek advice" flag, not computed).
- No user accounts, server-side storage, or payment features.
- No Simplified Chinese in v1 (structure will support adding it later).
- No changes of any kind to the existing form5472prep application, its dependencies,
  routes, database, or Vercel deployment.

## 3. Assumptions

1. **The site lives in this repository as a self-contained app at `hktax/`** (own
   `package.json`, own build), because this session's designated branch is here. If the
   user instead wants a separate repository, only Step 1 changes (scaffold location) and
   the deployment step targets a new repo; all other steps are unaffected.
2. **Stack mirrors the repo's conventions:** Next.js 14 (App Router) + TypeScript +
   Tailwind CSS + Vitest. If the user prefers something else, Steps 1 and 8–13 are
   re-planned; the tax engine (Steps 2–7) is pure TypeScript and survives any UI choice.
3. **Target years are 2024/25 and 2025/26**, defaulting to 2025/26 (the return season
   running now, August 2026). If the user wants older years, the parameter-file design
   absorbs them as additional configs.
4. **2025/26 parameters (from the February 2026 Budget) must be verified online during
   execution** — the planning model's knowledge ends January 2026. Step 2 includes a
   mandatory verification pass against ird.gov.hk / gov.hk. If any figure differs from the
   table in Step 2, the parameter file is corrected and the golden tests re-derived; no
   other step changes.
5. **Bilingual = 繁體中文 (default) + English.** If the user wants Chinese-only or
   English-only, Step 8 shrinks; nothing else changes.
6. **Deployment target is a new, separate Vercel project** (the account already deploys
   this repo to Vercel), under a Vercel-provided URL until the user supplies a domain. If
   the user has a domain or another host in mind, only Step 16 changes.
7. **The product name is provisionally "HK Tax Assistant 香港報稅助手"** pending the
   user's choice (Open question 2). A rename touches copy only.

## 4. Open questions

1. Should the app live in this repo under `hktax/` (planned default), or in a brand-new
   repository?
2. What product name and domain do you want? (Placeholder name and Vercel URL used until
   then.)
3. Do you want me to deploy to Vercel at the end (Step 16), or stop at a locally verified
   build you deploy yourself?
4. Any monetization/CTA to include (e.g., referral to an accountant service, contact
   form), or pure free tool for v1?

*(None of these block execution — the stated assumptions apply until answered.)*

## 5. Step-by-step instructions

### Milestone A — Foundation

**Step 1. Scaffold the standalone app**
- **Action:** Create `hktax/` at the repo root containing a fresh Next.js 14.2 App Router
  + TypeScript project configured with Tailwind CSS, Vitest, ESLint (same major versions
  as the root app), `src/` layout (`src/app`, `src/components`, `src/lib`), a placeholder
  home page, and its own `package.json`/`tsconfig.json`/`tailwind.config.ts`. Add
  `hktax/README.md` describing the app and how to run it. Root app files are not touched;
  add `hktax` to root `.gitignore` only if build artifacts would otherwise leak (they
  won't — `hktax/.gitignore` handles `node_modules`/`.next`).
- **Acceptance criteria:** `cd hktax && npm install && npm run build` completes clean;
  `npm run test` runs Vitest (0 tests, exit 0); `npm run lint` passes; `git status` shows
  no modifications to any pre-existing file except the root README (not even that unless
  needed).
- **Executor:** Main session.
- **Depends on:** None.

**Step 2. Tax parameter module + online verification**
- **Action:** Create `hktax/src/lib/tax/params/` with one typed config per year of
  assessment (`ya2024_25.ts`, `ya2025_26.ts`) exporting a single `TaxYearParams` object:
  progressive bands (4 × $50,000 at 2%/6%/10%/14%, remainder 17%), two-tiered standard
  rate (15% on first $5M net income, 16% above), tax reduction (2024/25: 100% capped at
  $1,500), all allowances (basic $132,000; married $264,000; child $130,000 each for
  1st–9th + additional $130,000 in year of birth; dependent parent/grandparent aged 60+ or
  disabled $50,000, aged 55–59 $25,000, each doubled if residing with taxpayer throughout
  the year; dependent sibling $37,500; single parent $132,000; disabled dependant $75,000;
  personal disability $75,000), all deduction caps (self-education $100,000; approved
  charitable donations 35% of qualifying income; mandatory MPF $18,000; home loan interest
  $100,000 with the $120,000 ceiling for eligible taxpayers residing with a first child
  born on/after 25 Oct 2023, 20-year entitlement counter; domestic rent $100,000/$120,000
  same newborn rule, mutually exclusive with home loan interest in the same year; elderly
  residential care $100,000 per parent; qualifying annuity premiums + MPF TVC combined
  $60,000; VHIS $8,000 per insured person; assisted reproductive services $100,000),
  property tax rate 15% and 20% statutory repairs allowance, unincorporated profits tax
  7.5%/$2,000,000/15%, MPF mandatory contribution formula (5%, $1,500/month cap, min/max
  relevant income) for the convenience auto-calculator. THEN verify every figure for BOTH
  years against ird.gov.hk / gov.hk (WebSearch/WebFetch), explicitly hunting for
  February 2026 Budget changes to 2025/26 (tax reduction amount, any new/changed
  allowances or caps, standard-rate tiers). Record each verified figure's source URL in a
  `SOURCES.md` beside the params.
- **Acceptance criteria:** Both param files type-check; `SOURCES.md` lists an ird.gov.hk
  or gov.hk source next to every parameter group; any figure that differs from this plan's
  table is corrected in code and flagged in the Execution log.
- **Executor:** Main session (accuracy-critical; web research inline).
- **Depends on:** Step 1.

### Milestone B — Calculation engine (pure TypeScript, no UI)

**Step 3. Salaries Tax engine**
- **Action:** Implement `hktax/src/lib/tax/salaries.ts`: typed inputs (employment income
  items, rental value computation for employer accommodation — 10% residence / 8%
  two-room hotel / 4% one-room hotel with rateable-value election picking the lower,
  share option gains, lump-sum spread-back election over up to 36 months, less allowable
  outgoings), deductions in statutory order, allowances, then
  `min(progressive on net chargeable income, two-tier standard rate on net assessable
  income after deductions but before allowances)`, minus the capped tax reduction; output
  a `Computation` object carrying every intermediate line (assessable income, NAI, NCI,
  tax at each band, which basis won, reduction applied) so the UI can render a full
  breakdown. Include joint assessment: merge two spouses' computations per the statute
  (combine NAI, single married allowance, combined deductions) and report per-spouse
  apportionment. Unit tests alongside (`salaries.test.ts`) covering: single no-deduction
  case, standard-rate-wins high earner, rental value with election, spread-back, married
  joint vs separate, reduction cap, zero/negative NCI.
- **Acceptance criteria:** `npm run test` green; at least 12 salaries-tax unit tests
  including one case hand-verified in the test comment line-by-line against the IRD
  published computation method.
- **Executor:** Main session.
- **Depends on:** Step 2.

**Step 4. Property Tax engine**
- **Action:** Implement `property.ts`: per-property inputs (rent, lease premium spread
  over lease term capped at 36 months, irrecoverable rent recovered/written off,
  owner-paid rates, ownership share), NAV = (consideration − irrecoverable rent − rates) ×
  80%, tax at 15%, aggregation across properties, per-owner share for co-owned property.
  Output full breakdown lines. Tests: sole owner, 50% co-owner, irrecoverable rent, rates
  paid by tenant vs owner, premium spreading.
- **Acceptance criteria:** Tests green; ≥8 property unit tests; one hand-verified case.
- **Executor:** Main session.
- **Depends on:** Step 2.

**Step 5. Profits Tax engine (unincorporated)**
- **Action:** Implement `profits.ts`: inputs for sole-prop revenue, deductible expenses,
  guided add-backs (private/domestic portion, capital expenditure, salaries drawn by
  proprietor/spouse, non-charitable donations), simplified capital allowances (P&M 60%
  initial allowance + 10/20/30% annual allowance pools; building allowances as direct
  advanced inputs), loss brought forward and carry-forward, two-tier 7.5%/15% with an
  `eligibleForTwoTier` flag (interview asks the connected-entities question), year's tax
  reduction, provisional profits tax. Multiple businesses supported. Tests: profit below
  and above $2M, two-tier ineligible, loss year producing carry-forward, capital allowance
  pooling.
- **Acceptance criteria:** Tests green; ≥10 profits unit tests; one hand-verified case.
- **Executor:** Main session.
- **Depends on:** Step 2.

**Step 6. Personal Assessment engine + election optimizer**
- **Action:** Implement `personalAssessment.ts`: eligibility (age ≥18 or both parents
  deceased, HK resident/temporary resident), aggregate NAV + net assessable salary income
  + assessable profits, deduct let-property mortgage interest (capped at that property's
  NAV), business losses, then the same deduction/allowance/progressive-vs-standard/
  reduction pipeline as salaries tax. Implement `optimizer.ts`: given one person or a
  couple with full inputs, enumerate every legally available scenario — separate
  assessments; joint salaries assessment; PA (individual); PA (joint, when both have
  income — including the rule that spouses electing PA when both have chargeable income
  must elect together) — compute total family tax under each, and return a ranked result
  with the winning election, the saving vs default, and a plain-language reason (e.g.
  "PA wins because mortgage interest on your rental flat and your business loss become
  deductible"). Tests: the classic salary+rental case where PA wins, a high-income case
  where PA loses (standard-rate payer), business-loss offset case, couple where joint
  assessment wins, couple where elections diverge.
- **Acceptance criteria:** Tests green; ≥12 PA/optimizer tests; optimizer output includes
  scenario table with per-scenario totals that the tests assert exactly.
- **Executor:** Main session.
- **Depends on:** Steps 3, 4, 5.

**Step 7. Golden cross-check suite + provisional tax assembly**
- **Action:** Implement `provisional.ts` (final tax demand = current-year final +
  next-year provisional at current-year figures with statutory adjustments; holdover
  grounds checklist as data). Then build `golden.test.ts`: ≥25 end-to-end scenarios
  spanning simple salary → full complex family, each cross-checked against the official
  GovHK tax computation tool (run manually via browser/WebFetch during execution) with the
  expected figures and the GovHK check date recorded in the test file. Any mismatch is
  root-caused before proceeding (parameter error vs engine error vs GovHK scope
  difference; a documented scope difference is allowed only with an explanatory comment).
- **Acceptance criteria:** All ≥25 golden tests pass; each carries a comment with its
  GovHK-verified expected values and verification date; full engine coverage report shows
  every branch of §B files exercised.
- **Executor:** Main session.
- **Depends on:** Step 6.

### Milestone C — User interface

**Step 8. Design system, layout, and bilingual i18n**
- **Action:** Build the app shell: header/footer, disclaimer banner, year-of-assessment
  switcher, language toggle. Implement lightweight dictionary-based i18n (`zh-HK` default,
  `en`) with a typed `t()` helper and per-page dictionaries — no heavy i18n dependency.
  Define the design system in Tailwind (palette, type scale, form controls, cards,
  result tables) targeting a clean, trustworthy government-adjacent look; every terminology
  string shows 中文 with English toggle (e.g. 免稅額/Allowances).
- **Acceptance criteria:** Build passes; toggling language switches all shell strings;
  axe-core (via vitest or manual devtools run) reports no critical violations on the
  shell; mobile 375px viewport renders without horizontal scroll.
- **Executor:** Main session.
- **Depends on:** Step 1.

**Step 9. Guided interview wizard**
- **Action:** Build the multi-step interview at `/wizard`: (1) basics — year, marital
  status, residency/PA eligibility; (2) income sources checklist (salary / rental /
  business, per spouse); (3) per-source detail forms with inline explanations and the MPF
  auto-calculator; (4) dependants & family (children with birth years, parents with
  age/residence, siblings, disability); (5) deductions with eligibility sub-questions and
  live cap feedback; (6) review screen. State in React context persisted to localStorage
  (with a "clear my data" button); react-hook-form + zod validation (HKD amounts,
  sensible bounds); every question carries a 中/EN help popover written in plain language.
  Conditional flow: sections the user doesn't need never appear.
- **Acceptance criteria:** A scripted walkthrough (documented in the Execution log) of
  three personas — (a) single employee, salary only; (b) married, salary + 2 kids + rent
  deduction; (c) salary + rental property + sole prop + parents — reaches the results page
  with correct engine inputs (verified via a debug JSON view); refreshing mid-wizard
  restores state; validation blocks nonsense (negative income, future birth years).
- **Executor:** Main session.
- **Depends on:** Steps 6, 8.

**Step 10. Results dashboard + BIR60 filing guide**
- **Action:** Build `/results`: headline card (recommended election + total tax + saving),
  scenario comparison table from the optimizer, per-head full computation breakdown
  (expandable line-by-line, matching IRD computation layout), provisional tax and total
  demand, marginal-rate note, and a "next steps" panel mapping every computed figure to
  the corresponding part of the BIR60 return (property → Part 3, salaries → Part 4,
  sole-prop profits → Part 5, PA/joint elections and deductions/allowances parts —
  numbering verified against the current-year BIR60 specimen fetched from ird.gov.hk
  during execution). Add print stylesheet + "Print / Save as PDF" producing a clean
  one-to-two-page summary.
- **Acceptance criteria:** For the three Step 9 personas, on-screen totals equal the
  engine test expectations exactly; the BIR60 mapping matches the current specimen (source
  URL logged); browser print preview yields a legible summary without cut-off tables.
- **Executor:** Main session.
- **Depends on:** Step 9.

**Step 11. Quick standalone calculators**
- **Action:** Build `/calculators` with three single-page tools reusing the engine and
  wizard components: Salaries Tax quick calculator, Rental (Property Tax) calculator,
  Sole-prop Profits Tax calculator — each with instant results as inputs change, plus a
  link "situation more complex? use the full wizard" carrying entered data into the
  wizard state.
- **Acceptance criteria:** Each calculator reproduces the corresponding golden-test
  figures for at least 2 scenarios (checked manually, logged); data handoff into the
  wizard preserves entered values.
- **Executor:** Main session.
- **Depends on:** Steps 7, 8.

**Step 12. Deduction & allowance eligibility checker (慳稅檢查)**
- **Action:** Build `/deductions`: an interactive checklist where each deduction/allowance
  is a card with plain-language eligibility questions, the cap for the selected year,
  required evidence (receipts, annuity policy docs, tenancy stamp duty for rent
  deduction), and common IRD pitfalls (e.g. rent deduction unavailable if you or spouse
  own domestic property; home-loan interest 20-year count; TVC vs mandatory MPF
  distinction; donation 35% ceiling and $100 minimum). Content is data-driven from a
  typed content file, bilingual.
- **Acceptance criteria:** Every deduction and allowance present in the Step 2 parameter
  file has a card; caps shown always come from the parameter file (no hardcoded amounts —
  verified by grep); language toggle covers all card text.
- **Executor:** Main session.
- **Depends on:** Steps 2, 8.

**Step 13. Educational content pages**
- **Action:** Write bilingual guide pages: Salaries Tax guide, Property Tax guide,
  Profits Tax (sole prop) guide, Personal Assessment explained, provisional tax &
  holdover, filing deadlines calendar (BIR60 issue ~early May; +1 month paper / auto
  eTAX extension; ~+3 months sole-prop cases; typical Jan/Apr payment dates — all stated
  as "typical, check your notice"), objections basics, 20-entry FAQ, and a 中英 glossary
  of every tax term used on the site. Each page ends with the disclaimer. Draft content
  may be produced by subagents; the main session reviews every tax statement against the
  engine/parameter files before inclusion.
- **Acceptance criteria:** All pages build and render in both languages; no numeric tax
  figure appears hardcoded in prose where it could come from the parameter file (grep
  check); main-session review pass logged confirming technical accuracy of each page.
- **Executor:** Subagents for drafting (general-purpose, Sonnet-class; delegation per
  page: goal = draft the named bilingual guide following the site glossary and the
  parameter file values supplied in the prompt; acceptance = covers the listed topics,
  both languages, no invented figures; report = the two markdown/TSX drafts), then main
  session for technical review and integration.
- **Depends on:** Steps 8, 12.

### Milestone D — Quality and launch

**Step 14. Accessibility, mobile, and performance pass**
- **Action:** Audit every page: keyboard navigation through the full wizard, labels/aria
  on all form controls, color contrast, focus states; test at 375px/768px/1280px;
  Lighthouse run on the built app (target ≥90 performance, ≥95 accessibility on key
  pages); fix findings; static-export or standalone build sized sensibly (no unused heavy
  deps).
- **Acceptance criteria:** Lighthouse scores logged meeting targets; full wizard
  completable with keyboard only (walkthrough logged); no console errors on any page.
- **Executor:** Main session.
- **Depends on:** Steps 10, 11, 12, 13.

**Step 15. Full QA round (human-test protocol) and fixes**
- **Action:** Run the human-test skill against the local build: click every link/button,
  run the three personas end-to-end, try adversarial inputs (0s, huge numbers, switching
  year mid-wizard, language switch mid-wizard, localStorage disabled), verify computation
  displays against golden expectations. Triage the findings report; fix all critical and
  major findings; log deliberate wont-fixes with reasons.
- **Acceptance criteria:** Findings report saved under `docs/reviews/`; zero open
  critical/major findings; re-run of the failing checks passes; full `npm run test` +
  `npm run build` + `npm run lint` green.
- **Executor:** Main session (human-test skill).
- **Depends on:** Step 14.

**Step 16. Ship: commit history, PR, and (pending answer) deployment**
- **Action:** Ensure work is committed in logical commits on
  `claude/hk-tax-filing-website-m97q8g` and pushed; open/refresh the draft PR with a
  summary, screenshots, and the golden-suite cross-check note. If Open question 3 is
  answered "deploy": create a separate Vercel project rooted at `hktax/`, deploy, smoke-
  test the production URL (wizard persona (b) end-to-end), and report the URL. Otherwise
  deliver exact self-deploy instructions in `hktax/README.md`.
- **Acceptance criteria:** PR open with green working tree; if deploying — production URL
  returns the app, persona (b) walkthrough passes on production; if not — README deploy
  section verified by a clean `npm ci && npm run build` from a fresh checkout of `hktax/`.
- **Executor:** Main session.
- **Depends on:** Step 15.

## 6. Risks and rollback

1. **Tax-parameter accuracy (esp. Feb 2026 Budget changes to 2025/26).**
   Likelihood: medium. Impact: high (wrong tax figures destroy trust).
   Mitigation: Step 2 mandatory online verification with per-figure sources; Step 7
   golden suite cross-checked against the official GovHK calculator; single-source-of-
   truth parameter files so a wrong figure is a one-line fix.
   Rollback: correct the parameter file, re-run tests; no structural change needed.
2. **Legal/liability exposure (perceived tax advice).**
   Likelihood: low. Impact: high.
   Mitigation: persistent disclaimer, "educational tool" framing, no IRD branding,
   "seek professional advice" flags on out-of-scope situations (non-resident days, share
   option cross-border vesting).
   Rollback: content-only edits.
3. **Scope creep — HK tax has infinite edge cases.**
   Likelihood: high. Impact: medium (schedule).
   Mitigation: §2 non-goals list is binding; edge cases outside it get an informational
   "advanced situation" flag, not computation. Material additions trigger the deviation
   rule and a plan amendment.
   Rollback: cut to the documented v1 scope.
4. **Optimizer legal correctness (election combination rules for couples).**
   Likelihood: medium. Impact: high.
   Mitigation: rules encoded as data with cited IRD source in comments; dedicated tests;
   cross-check couple scenarios against GovHK's couple mode in the golden suite.
   Rollback: constrain optimizer to fewer, certainly-legal scenarios and label others
   "discuss with an advisor".
5. **Accidental impact on the production form5472prep app sharing this repo.**
   Likelihood: low. Impact: high.
   Mitigation: everything under `hktax/` with its own package.json; Step 1 acceptance
   explicitly asserts no pre-existing file modified; root Vercel project config untouched.
   Rollback: `git revert` of the offending commit — the app is additive by construction.
6. **GovHK calculator unavailable/changed during golden-suite building.**
   Likelihood: low. Impact: medium.
   Mitigation: fall back to IRD's published worked examples and hand computation with the
   verified parameters; log the substitution.
   Rollback: none needed.

## 7. Estimates

| Step | Effort | Notes |
|---|---|---|
| 1 Scaffold | S | |
| 2 Parameters + verification | M | Budget-change hunt is the variable |
| 3 Salaries engine | L | Rental value + spread-back are the fiddly parts |
| 4 Property engine | S | |
| 5 Profits engine | M | Capital allowances simplified deliberately |
| 6 PA + optimizer | L | Couple election matrix is the hard core |
| 7 Golden suite | M–L | 25 manual GovHK cross-checks take real time |
| 8 Shell + i18n | M | |
| 9 Wizard | L | Largest UI step |
| 10 Results + BIR60 | M | |
| 11 Quick calculators | S–M | Reuses engine + components |
| 12 Eligibility checker | M | Mostly content modeling |
| 13 Content pages | M | Subagent drafting parallelizes it |
| 14 A11y/perf | S–M | |
| 15 QA + fixes | M | Unknown until findings land |
| 16 Ship | S | |

Blow-up risks: Feb 2026 Budget introducing a structurally new deduction (adds engine
work, not just a constant); golden-suite mismatches forcing engine rework; bilingual copy
volume in Steps 12–13.

## 8. Changelog

v1 — 2026-08-31 — initial plan.

## 9. Execution log

(Empty until Phase 2.)
