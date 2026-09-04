# Plan: Conversion tools + provider-integration pages
Version: 1 | Status: APPROVED v1 — EXECUTING | Date: 2026-08-28

## 1. Goal
Ship the four commercial-intent assets from the growth plan (items 1–4; item 5
"CPA cost / best-services comparison" is explicitly excluded): a **deadline
calculator**, a **"Do I need to file Form 5472?" checker**, a **penalty
calculator**, and **7 provider-integration landing pages** (doola, Firstbase,
Clemta, StartGlobal, Zenind, Northwest Registered Agent, Stripe Atlas) — all in
the site's house style, indexable, schema-marked, attribution-tagged, cross-linked
from existing content, and deployed via git push.
**Whole-project acceptance:** all three tool pages and 7 provider pages return
200 in production, appear in sitemap.xml and llms.txt, every CTA carries a
distinct `?src=` tag, penalty math passes unit tests, and a live click-through
from each tool reaches `/start` with the tag intact.

## 2. Scope and non-goals
**In scope**
- `/form-5472-deadline-calculator` (reuses `filingDueDateUtc`/`formatDueDate` from `src/lib/schemas.ts` — verified pure, zod-only, client-safe)
- `/do-i-need-to-file-form-5472` — 6-question decision-tree checker
- `/form-5472-penalty-calculator` + new pure lib `src/lib/penalty.ts` with vitest unit tests
- 7 provider pages added to `LANDING_PAGES` in `src/lib/landing-pages.ts` (inherits Article/FAQ/HowTo/Breadcrumb schema, sitemap + llms.txt auto-enumeration, "Official sources" block)
- Fact-research pass for provider pages (web, read-only) with a dated facts file
- Sitemap + llms.txt "Core pages" entries for the 3 tool pages; footer "Free tools" links
- Internal links to each tool from the ~10 most relevant existing guides
- Build, typecheck, tests, commit, **git push** (production deploys from `main` — never `vercel --prod`; that cost us /contact once)
- Live post-deploy verification (status, schema, attribution click-through, mobile overflow)
**Non-goals**
- Item 5: CPA-cost article, "best services" comparison content (excluded by owner)
- Reportable-transaction checker (listed as tool #4 in the analysis; NOT requested — "build all except 5" is read as items 1–4 of the sequencing list, which the transaction checker was not part of; see Open question Q1)
- Paid ads changes, partner commission page, renewal engine, reviews engine
- Any change to pricing, checkout, wizard, or emails

## 3. Assumptions
- A1: "build all except 5. cpa cost" = sequencing-list items 1–4 (deadline calc, checker, penalty calc, provider pages). If false → adjust scope per Q1 answer; only step list changes, architecture identical.
- A2: The 7 providers above are the right set. If false → swap names in Step 1/6; no structural change.
- A3: Provider pages are lawful nominative use: descriptive titles ("Form 5472 for your doola-formed LLC"), factual, with a "not affiliated with or endorsed by X" disclaimer. If the owner objects to naming any provider → drop that page.
- A4: Tool pages are indexable (they target search demand), unlike the noindex ads LP. If false → flip `robots` per page.
- A5: Penalty math per IRC §6038A(d)/§6038A regs: $25,000 initial per form per year; if failure continues >90 days after IRS notice, +$25,000 per 30-day period, no statutory cap. Calculator shows "notice received?" as an explicit input and labels continuation amounts as estimates. If review finds nuance beyond this → Step 2's cited-sources check catches it before UI work.
- A6: Vitest is configured and runnable (`npm run test` exists). If the config is missing/broken → fix config as part of Step 2 (minor deviation).
- A7: Another session may push to `main` during execution. Mitigation: pull before every push; tools own disjoint new files so merges are trivial.

## 4. Open questions
- Q1: Should the **reportable-transaction checker** be included too? (It was tool #4 in the tools analysis but not in the numbered sequencing list the "except 5" refers to.) Plan currently EXCLUDES it.
- Q2: Provider list confirm/edit: doola, Firstbase, Clemta, StartGlobal, Zenind, Northwest RA, Stripe Atlas — any to add (e.g. Bizee/Incfile, Registered Agents Inc) or remove?

## 5. Step-by-step instructions

### Step 1 — Provider fact research (read-only)
- **Action:** general-purpose subagent (sonnet) with WebSearch/WebFetch researches each of the 7 providers: what they sell (formation/RA/mailbox/banking), whether they offer any 5472/tax filing themselves (and its price if public), their typical customer profile, and 2–3 citable URLs (their own docs/help pages) per provider. Output: `docs/marketing/provider-facts-2026-08.md`, one dated section per provider, every claim with a URL. Delegation trio: goal = accurate per-provider facts for landing copy; acceptance = every factual claim carries a working source URL (curl 200); report = ≤20-line summary + file path.
- **Acceptance criteria:** facts file exists; spot-check 3 random source URLs return 200; each provider section states whether they offer in-house 5472 filing (yes/no/unclear).
- **Executor:** general-purpose subagent (sonnet), background.
- **Depends on:** None.

### Step 2 — Penalty math library + unit tests
- **Action:** codex-implementer lane. Create `src/lib/penalty.ts`: pure functions `initialPenaltyCents(formCount, yearCount)` (= 25_000_00 × forms × years), `continuationPenaltyCents({noticeDate, asOfDate})` (25_000_00 per started 30-day period beginning 90 days after notice; 0 if no notice), `totalExposureCents(...)`, plus exported constants and citation strings (IRC §6038A(d)(1)–(2), Instructions for Form 5472 "Penalties"). Create `src/lib/penalty.test.ts` (vitest): ≥8 cases incl. 1 form/1 year = $25k, 2 LLCs × 3 years = $150k, notice + 0/89/90/91/150 days, invalid dates.
- **Acceptance criteria:** `npm run test` passes; `npx tsc --noEmit` clean; no imports beyond TS stdlib.
- **Executor:** codex-implementer (sonnet driver), background.
- **Depends on:** None.

### Step 3 — Deadline calculator page
- **Action:** codex-implementer lane. New `src/app/(marketing)/form-5472-deadline-calculator/page.tsx` (server shell: metadata via `pageOpenGraph`, canonical, `JsonLd` WebApplication + FAQPage + breadcrumb, intro copy, FAQ from a `const` array, CTA band) + `DeadlineCalculator.tsx` (`"use client"`): inputs = tax year (select, from `lastCompletedTaxYear` back ~6 years + current), "LLC dissolved during that year?" (optional date), "filed Form 7004 extension?" (checkbox → shows Oct 15 extended date with weekend roll). Computes via `filingDueDateUtc`/`formatDueDate` imported from `@/lib/schemas`; shows days-remaining/overdue and a contextual CTA (overdue → late-filing copy linking `/start?src=tool-deadline`; else standard CTA same tag). House style; no new deps.
- **Acceptance criteria:** tsc clean; page renders in `npm run build` route table as `○`; grep confirms `src=tool-deadline` on every CTA and zero hardcoded prices; unit spot-check in a tsx script: 2025 → April 15 2026 (rolled if weekend).
- **Executor:** codex-implementer, background (parallel with Steps 4–5 — disjoint files).
- **Depends on:** None.

### Step 4 — "Do I need to file?" checker page
- **Action:** codex-implementer lane. New `src/app/(marketing)/do-i-need-to-file-form-5472/page.tsx` + `FilingChecker.tsx` (`"use client"`). Decision tree (data-driven `const QUESTIONS`, not JSX spaghetti): (1) US LLC? (2) single-member or multi-member? → multi-member routes to a 1065/8865 info result, not a sale; (3) owner a non-US person or foreign company? → US owner routes to "you likely don't file 5472" honest result; (4) LLC existed at any point during the tax year? (5) any reportable transaction incl. formation funding/bank deposit? "not sure" allowed → treated as likely-yes with explanation; (6) C-corp election (8832/1120 filer)? → different-rules result. Each terminal result: clear verdict, 2–3 sentence explanation, relevant guide links, CTA `/start?src=tool-checker` only on must-file/likely results. Progress indicator, back button, restart. FAQPage JSON-LD from visible FAQ; WebApplication schema; disclaimer line (not tax advice).
- **Acceptance criteria:** tsc clean; every terminal node reachable (tsx script walks the tree data and asserts all leaves reachable + every leaf has verdict text); `src=tool-checker` on all CTAs; honest non-sale paths exist for multi-member and US-owner branches.
- **Executor:** codex-implementer, background (parallel).
- **Depends on:** None.

### Step 5 — Penalty calculator page
- **Action:** codex-implementer lane. New `src/app/(marketing)/form-5472-penalty-calculator/page.tsx` + `PenaltyCalculator.tsx` (`"use client"`) using `src/lib/penalty.ts` ONLY (no local math). Inputs: number of LLCs (1–10), years unfiled (1–6), IRS notice received? (+date). Output: itemised breakdown (initial per form/year, continuation if notice), total exposure, prominently paired with the DIIRSP path ("filing now under DIIRSP with a reasonable-cause statement is how this is normally resolved — penalties are frequently abated") and CTA `/start?src=tool-penalty`. Tone: factual, cited (renders the citation strings from the lib + links to the vetted IRS URLs already in `landing-pages.ts` sources), explicitly NOT scaremongering; numbers labelled "statutory exposure, not a prediction". FAQPage + WebApplication schema.
- **Acceptance criteria:** tsc clean; page shows $25,000 for 1×1 and $150,000 for 2×3 (verified via rendered-HTML grep in `next build` output or tsx render test); `src=tool-penalty` on CTAs; the only dollar literals are penalty constants imported from the lib (grep page file: no `$149`/`$199`).
- **Executor:** codex-implementer, background (parallel).
- **Depends on:** Step 2.

### Step 6 — Provider landing pages (7)
- **Action:** codex-implementer lane, AFTER Step 1's facts file exists. Add 7 entries to `LANDING_PAGES` (slugs: `doola-form-5472`, `firstbase-form-5472`, `clemta-form-5472`, `startglobal-form-5472`, `zenind-form-5472`, `northwest-registered-agent-form-5472`, `stripe-atlas-form-5472`). Each: title ≤60, metaDescription 120–160, h1 "Form 5472 for your <Provider>-formed LLC" (or natural variant), intro + 4–6 sections (what provider does / what it does NOT file for you [only if facts file supports it — otherwise "check what your package includes"], what the owner must file (5472+1120), first-year timeline from formation month, how we file it, provider-specific FAQ ×4), `sources` = 2–3 provider URLs from the facts file + the standard IRS URLs, `updated: "2026-08-28"`, `startSrc: "<slug>"` so funnelSource attributes per provider. MANDATORY in every page body: a visible disclaimer sentence "Form5472 Prep is not affiliated with or endorsed by <Provider>." No copied provider marketing text; no claims not backed by the facts file; genuinely different section content per provider (differing product facts, not a find-replace template — the anti-scaled-content constraint).
- **Acceptance criteria:** tsc clean; `LANDING_PAGES` count 22→29; lengths script (title ≤60, desc 120–160) passes for the 7; each has ≥1 provider-domain source URL that curls 200; disclaimer grep = 7 hits; diff review confirms per-provider content actually differs beyond the name.
- **Executor:** codex-implementer, background.
- **Depends on:** Step 1.

### Step 7 — Wiring: sitemap, llms.txt, footer, internal links
- **Action:** codex-implementer lane (single lane, serial — touches shared files). (a) `src/app/sitemap.ts`: add the 3 tool URLs (priority 0.8). (b) `src/lib/llms.ts`: add the 3 tools to the Core pages list. (c) Footer (`(marketing)/layout.tsx`): add "Free tools" group or fold 3 links into Services column (match existing column style). (d) Internal links: for each tool, edit the ~10 most relevant existing posts (grep-selected: deadline posts → deadline calc; penalty/late posts → penalty calc; what-is/first-year/checklist posts → checker) adding ONE contextual sentence + link each — no link walls. Provider pages need no linking work (auto-enumerated in llms.txt + sitemap via LANDING_PAGES; related content already exists via `relatedSlugs` if trivially addable, else skip).
- **Acceptance criteria:** sitemap builder output contains the 3 tool URLs (tsx dry-run); llms.txt builder output lists them; footer renders 3 links (grep); ≥24 post files gained exactly one tool link each (grep count before/after); tsc clean.
- **Executor:** codex-implementer, background.
- **Depends on:** Steps 3, 4, 5, 6 (needs final slugs).

### Step 8 — Integration: build, test, review, ship
- **Action:** architect (main session). `git pull --rebase` first (A7). Read every lane's diff; `npx tsc --noEmit`; `npm run test`; `npm run build` (expect route table: 3 new ○ tool pages, `/[seoSlug]` path count +7). Commit in logical units; secret-scan staged diff; **`git push origin main`** and wait for the git deployment to reach READY (Vercel API), then verify live: all 10 new URLs 200; JSON-LD parses on one tool + one provider page; click-through `/form-5472-penalty-calculator` → CTA → `/start?src=tool-penalty` reaches the form with tag; mobile 375px no horizontal overflow on all 3 tools; sitemap.xml + llms.txt contain the new URLs.
- **Acceptance criteria:** every check above passes with command evidence; deployment source shows `git`, state READY.
- **Executor:** main session.
- **Depends on:** Step 7.

### Step 9 — Post-ship pass
- **Action:** fable-advisor skeptic review (read-only, <300 words) of the three highest-risk surfaces: penalty math + its on-page framing, checker tree honesty (non-sale branches), provider-page claims vs facts file. Fix anything material via a follow-up codex lane, re-push. Update `docs/marketing/growth-plan-2026-09.md` marking items 1–4 shipped; append memory note (tool src tags for /admin/sources reading).
- **Acceptance criteria:** advisor verdict recorded in Execution log; any CONFIRMED material issue fixed and re-verified; growth plan updated.
- **Executor:** main session + fable-advisor agent.
- **Depends on:** Step 8.

## 6. Risks and rollback
- **Penalty math wrong** (likelihood low, impact high — a wrong dollar figure on a YMYL page): mitigated by lib+tests+citations before UI (Step 2 gate) and the Step 9 skeptic pass. Rollback: revert the page commit; lib is inert if unused.
- **Provider pages read as trademark abuse or scaled content** (medium/medium): nominative-use rules in Step 6 (disclaimer, factual, no logos, per-provider substance) + A3. Rollback: remove the entry from `LANDING_PAGES` (single-array edit, auto-drops from sitemap/llms).
- **Checker gives a wrong verdict** (low/high): tree is data-driven and reviewed leaf-by-leaf in Step 9; "not sure" paths always err toward "likely must file + talk to us", never toward "you're fine".
- **Concurrent-session push collision** (medium/low): pull-before-push; new files are disjoint; shared-file edits confined to Step 7's single lane.
- **Codex lane unavailable** (low/medium): re-route the same spec to a Claude subagent and state the downgrade (grok lane remains unusable headless).

## 7. Estimates
S1 research M · S2 penalty lib S · S3 deadline calc M · S4 checker M/L (tree + honest branches) · S5 penalty calc M · S6 provider pages L (7 × distinct content) · S7 wiring M · S8 integration M · S9 review S.
Blow-up risks: Step 6 content quality (biggest token/time item); Step 4 tree edge-cases; a mid-execution push from the other session forcing rebases.

## 8. Changelog
v1 — initial plan.

## 9. Execution log
- 2026-08-28: Approved v1 verbatim (Q1: transaction checker stays excluded; Q2: provider list unchanged). Owner directive: route implementation to codex lanes.
- 2026-08-28: MINOR DEVIATION (logged per §3-A7): the shared checkout at ~/Documents/Codex/form5472 is occupied by another live session (branch claude/hk-tax-filing-website-m97q8g, uncommitted hktax work). Executing in isolated git worktree ~/Documents/Codex/form5472-tools on branch tools/commercial-assets off origin/main; ship = rebase on origin/main + push HEAD:main. Protects both sessions; no scope/architecture change.
- 2026-08-28: Steps 1 (research), 2 (penalty lib), 3 (deadline calc), 4 (checker) launched in parallel — S2/S3/S4 on codex lanes, S1 general-purpose web research. S5 gated on S2; S6 gated on S1; S7 gated on S3–S6.
- 2026-08-28: Step 2 COMPLETE — src/lib/penalty.ts + penalty.test.ts; evidence: tsc clean, `npm run test -- penalty` 16/16 (full suite 166/166), 0 imports, day-91/121/150/151 boundaries independently recomputed by the lane. Step 5 launched (codex). Steps 3/4 codex jobs still running under resumed poll loops; Step 1 research in flight.
- 2026-08-28: Step 1 COMPLETE — provider-facts-2026-08.md (8 sections, URLs verified; doola+Northwest behind bot-WAFs, browser-verified and documented). Key facts: doola/Firstbase DO bundle 5472 ($1.5–2.4k/yr plans); Clemta/StartGlobal UNCLEAR (must be framed 'check your plan'); Zenind/Northwest/Atlas do not file it; Atlas still forms both LLCs and C-corps. Step 6 launched (codex) with facts-file-is-law constraint.
- 2026-08-28: Step 3 COMPLETE — deadline calculator; tsc clean, 3× src=tool-deadline, 0 price literals, dates spot-checked (2025→Apr 15 2026; dissolved 2025-06-10→Oct 15 2025). ACCEPTED DESIGN IMPROVEMENT over spec: extension computed via effectiveDueDateUtc with synthetic transmittedAt instead of duplicating rollWeekendToMonday — zero date-math duplication; architect independently verified extension output = October 15, 2026.
- 2026-08-28: Step 4 COMPLETE — checker; tsc clean, independent BFS: 14 nodes, all reachable, 8 leaves, showCta=false ×4, no-filing ×3; 10/10 blog hrefs exist; disclaimer present. Minor accepted deviation: rendered title 61 chars (spec ≤60) — cosmetic. NOTE: codex sandbox lacked network for tsx; lane re-ran real verification unsandboxed — acceptable, evidence independent.
- 2026-08-28: Step 5 COMPLETE — penalty calculator page; tsc clean, penalty tests still 16/16 (lib untouched), only the two allowed statute mentions as dollar literals (no 149/199), CTAs tagged src=tool-penalty, DIIRSP relief panel + citations rendered, 1×1=$25k / 2×3=$150k independently recomputed. Awaiting Step 6 (provider pages) → then Step 7 wiring.
- 2026-08-28/29: Step 6 COMPLETE (6 new provider pages; stripe-atlas already existed — left as pre-existing, not upgraded). Step 7 COMPLETE (sitemap/llms/footer + 16 guide links). Step 8 COMPLETE — pushed 6227bd0 + afa1257 via git deploy; live verification: 9 URLs 200, tags present, disclaimers ×6, sitemap 123, llms 3, footer 3. Minor hand fix logged: removed unused `CheckCircle2` import that failed lint.
- 2026-09-04/05: INCIDENT — production overwritten by a sibling session's `vercel --prod` from branch claude/hk-tax-filing-website-* (deploy f1fc2dc, 20:22, 8 min after main's 8d2cc93). All tool + provider pages 404 for ~8 h. Restored 2026-09-05 04:37 by pushing main (6ffcea1 adds repo CLAUDE.md deploy rule; 0cbeffa mirrors into AGENTS.md). Verified: all pages 200, sitemap tools 3, total 134.
- Step 9 (skeptic review) still OPEN — folded into the 2026-09-05 full SEO/AEO/GEO audit now running.

