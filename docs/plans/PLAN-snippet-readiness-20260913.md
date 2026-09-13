# Plan: Featured Snippet readiness (GEO/AEO wave 4)
Version: 1 | Status: COMPLETE | Date: 2026-09-13

Audit item: 「Featured Snippet 就緒度」 — current 80/100, expected +10–20.
Three extractable shapes: a 40–60-word direct answer under each question heading,
real `<ol>`/`<ul>` markup for processes, real `<table>` markup for comparisons.

## 0. What the measurement actually found (read this first)

I fetched all 44 non-blog URLs in the sitemap plus 3 blog posts and parsed the
rendered HTML (script in the session scratchpad; it becomes `scripts/snippet-audit.mjs`
in Step 1). The audit's 80/100 flatters the site. The real state:

| Shape | State on production | Root cause |
|---|---|---|
| Lists | **0** ordered lists on all 28 landing pages, even though 35 sections contain numbered steps ("1. Gather…") and 112 contain bullets. `/ein`, `/itin`, `/partners` HowTo steps are `<div>` grids, not `<ol>`. Only the home page has a real `<ol>`. | The landing renderer drops the whole section body into one `<div class="whitespace-pre-line">` (`[seoSlug]/page.tsx:251`). Numbers and bullets are literal text. |
| Paragraphs | Same root cause: a landing section is ONE text block of 100–180 words, not paragraphs. Google's median paragraph snippet is 42 words; over ~80 is truncated. Landing intros (the H1 answer): 20 of 28 are 65–97 words. Question-section leads: 81 of 231 in range; 61 are under 40 words with no list after them. FAQ hub: 13 of 51 answers under 35 words. Calculator pages: all 11 explanatory answers 17–32 words. `/ein` and `/itin` are already good (12/21 and 7/13 in range). | Copy was written for the old single-block renderer; nobody was counting. |
| Tables | **1** content table on the whole marketing site (home: Form5472 Prep vs CPA vs DIY). 0 on landing pages, including `/form-5472-vs-1120`, whose H2 literally says "side-by-side comparison". Blog: 121 of 127 posts already have markdown tables with `<thead>`/`<tbody>` — the blog is fine. | `LandingSection` has only `heading` + `body`; there is no way to author a table. |
| Schema | Article on posts, FAQPage on FAQ/landing, HowTo on home/EIN/ITIN/partners/landing — all present from earlier waves. | No gap. There is no schema.org type for comparison tables; `Dataset`/"ComparisonTable" in the audit text are not applicable. We use `<caption>` + scoped `<th>` instead. |

Fixing the renderer alone converts 35 numbered processes and 112 bullet groups into
real lists and splits every section into real paragraphs, with zero copy changes.
That is the highest-value, lowest-risk step and it goes first.

## 1. Goal

Every informational page presents its answers in the three shapes that Google's
featured-snippet extractor and AI engines pull from: a 40–60-word direct answer under
the H1 and under every question heading, real list markup for every process, and real
table markup for every comparison — without introducing a single fact that is not
already on the page today.

**Acceptance statement:** after deploy, `npm run audit:snippets -- --base https://www.form5472prep.com`
reports (a) all 28 landing intros at 40–60 words, (b) zero question-section first
paragraphs over 80 words anywhere, (c) every section in Appendix A at 40–60 words,
(d) `<ol>` present on `/ein`, `/itin`, `/partners` and on every landing page listed with
a numbered section in Appendix C, (e) at least 15 `<table>` elements with `<thead>` and
`<tbody>` across the pages in Appendix B, (f) all 51 FAQ answers at 40–70 words — and
the fable-advisor drift review (Step 11) finds no new figure, date, or legal claim.

## 2. Scope and non-goals

In scope:
- Landing renderer (`src/app/(marketing)/[seoSlug]/page.tsx`) + a shared body parser.
- Landing data (`src/lib/landing-pages.ts`): 20 intros, 61 section leads, ~17 tables.
- Service pages: EIN/ITIN/partner steps as `<ol>`; EIN-vs-ITIN table on `/itin` and `/ein`.
- Home: 2 short informational answers; comparison table reused on `/pricing`.
- Calculator pages: 11 short explanatory answers.
- FAQ hub data (`src/lib/faq.ts`): 13 short answers, 1 long answer; tighter test bounds.
- A re-runnable audit script + before/after report in `docs/reviews/`.
- Tests that lock every rule so the next content wave cannot regress it.

Not in scope:
- `content/blog/**` — owned by the other agent. The review doc carries a one-page brief
  for them (blog leads are 0–3 of 5–9 in range per post; the tables are already right).
- Any new factual claim: no new penalty figures, dates, state fees, or competitor facts.
  Every sentence and every table cell must trace to text already on that page.
- Pricing, tiers, CTAs, the `/do-i-need-to-file-form-5472` checker cards (their "answers"
  are decision-tree UI, not prose), legal pages (`/privacy`, `/terms`, …).
- Table schema markup (none exists that Google consumes).
- Guaranteeing snippets. This work raises eligibility; Google still chooses.

## 3. Assumptions

1. **One tokenizer.** Word count = `text.trim().split(/\s+/).filter(Boolean).length`
   (what `faq.test.ts` already uses). The audit script and every new test use it.
   If the landing test's `wordCount` differs, it is switched to this one in Step 6.
2. **`LandingSection` has no consumer other than `[seoSlug]/page.tsx` and its tests.**
   Adding an optional `table` field breaks nothing. If false: fix the consumer in Step 4.
3. **Splitting the section body into blocks does not change the look.** The wrapper
   already has `space-y-3`; paragraphs will inherit it. If false: adjust classes in
   Step 3 and re-screenshot; no copy changes.
4. **HowTo JSON-LD on landing pages is derived from numbered lines by `orderedListItems`
   (`[seoSlug]/page.tsx:723`).** The renderer will reuse the same parser so DOM and
   JSON-LD cannot disagree. A test pins `/file-form-5472` to its current 8 steps.
5. **Competitor pages contain enough already-stated facts for a 3-row table.** If a page
   does not, it gets no table; the lane reports which.
6. **`vercel` CLI and `origin/main` auto-deploy behave as in every prior wave**
   (deploy = `git push origin main`; never `vercel --prod`).

## 4. Open questions

1. Competitor comparison tables (doola, Firstbase, Stripe Atlas, Clemta, Zenind,
   StartGlobal, Northwest): each cell would only restate a claim those pages already
   make in prose, so the risk profile is unchanged — but a table is more quotable.
   **Default: include them.** Say "no competitor tables" and Step 8 skips those 7 pages.

## 5. Step-by-step instructions

Lane routing: `fable-advisor:codex-implementer` for every implementation step (the grok
lane still cancels headless edits, per memory). `fable-advisor:fable-advisor` for the
drift review. Architect writes specs, reads every diff, runs every verification, takes
screenshots. Steps on the same file are serial; nothing else overlaps.

### Wave 0 — measurement

**Step 1 — Audit script and baseline report**
- **Action:** Create `scripts/snippet-audit.mjs` (Node 22, no dependencies). It reads
  the sitemap at `--base`, keeps non-blog URLs plus the 3 newest posts, fetches each
  page, and reports per page: H2/H3/`<dt>`/`<summary>` question headings; word count of
  the first `<p>`/`<dd>`/`<div>` block after each; counts in 40–60, 35–70, <35, >80;
  `<ol>`/`<ul>` with ≥4 `<li>` (excluding nav/header/footer/aria-hidden); `<table>` with
  `<thead>`+`<tbody>`. Prints a markdown table; `--json <file>` dumps details.
  Add `"audit:snippets": "node scripts/snippet-audit.mjs"` to `package.json`.
  Run it against production and save the output as the "Before" section of
  `docs/reviews/2026-09-13-snippet-readiness-audit.md`, followed by the blog-owner
  brief (rule: first paragraph under each question H2 = 40–60 words; tables already OK).
- **Acceptance:** `npm run audit:snippets -- --base https://www.form5472prep.com` prints
  47 rows; the `tables`/`thead` and `ol4` columns match the scratchpad baseline exactly
  (home: 1 table, 1 ol4; `/data-retention`: 2 tables; all landing pages: 0 ol4, 0 tables);
  question counts within ±2 per page. Script exits 0.
- **Executor:** codex-implementer (spec carries the parser rules above and the baseline
  table for comparison). Report: command output + the review file path.
- **Depends on:** None.

### Wave 1 — markup (no copy changes)

**Step 2 — Shared body parser**
- **Action:** Create `src/lib/landing-body.ts` exporting
  `type Block = { type: "p"; text: string } | { type: "ol" | "ul"; items: string[] }`,
  `parseLandingBody(body: string): Block[]`, and `orderedListItems(body: string): string[]`
  (= all `ol` items in order, byte-identical to today's `[seoSlug]/page.tsx:723` output).
  Rules: split on blank lines into chunks; inside a chunk, a line matching
  `^\s*\d+\.\s+` starts an `ol` item, `^\s*[•\-–]\s+` starts a `ul` item, other lines
  continue the current item or paragraph; a chunk whose first line is prose and whose
  later lines are list items yields a `p` block then a list block; single newlines inside
  a paragraph become `\n` in `text` (rendered as `<br />`). Markers are stripped from items.
  Create `src/lib/landing-body.test.ts`: fixtures = `file-form-5472` section 3 body
  (→ 8 `ol` items, first begins "Gather your LLC info"), section 6 (→ `p`, then a 5-item
  `ul`), a plain two-paragraph body (→ 2 `p`), an inline-link body (link syntax preserved
  in `text`). Plus: `orderedListItems` over EVERY section of EVERY landing page equals a
  snapshot generated from the old implementation (the lane copies the old function into
  the test as `legacyOrderedListItems` and asserts equality for all sections).
- **Acceptance:** `npx vitest run src/lib/landing-body.test.ts` passes; the legacy-equality
  test covers all 231+ sections.
- **Executor:** codex-implementer. **Depends on:** None (parallel with Step 1).

**Step 3 — Landing renderer uses blocks**
- **Action:** In `[seoSlug]/page.tsx`: delete the local `orderedListItems`, import from
  `@/lib/landing-body`. Replace the `whitespace-pre-line` div (line ~251) with a block
  renderer: `<p>` per paragraph (existing `renderInlineLinks` per text run, `<br />` for
  inner newlines), `<ol className="list-decimal pl-5 space-y-2">` / `<ul className="list-disc pl-5 space-y-2">`
  with `<li>` per item (inline links applied). Apply the same renderer to FAQ answers
  (`f.a`, line ~361). Keep the outer `space-y-3 text-slate-700 leading-relaxed` wrapper.
- **Acceptance:** `npx tsc --noEmit` clean; `npm run build` ok; dev-server audit shows
  `ol4 ≥ 2` on `/file-form-5472`, `ol4 ≥ 1` on every page in Appendix C; JSON-LD HowTo
  for `/file-form-5472` still has 8 steps with the same names (Step 2 test guards the
  parser; architect diffs the live JSON-LD before/after). Screenshots of
  `/file-form-5472` §"How do you file step by step" and `/form-5472-instructions`
  §"common mistakes": numbered/bulleted lists indented, no doubled markers, no literal "1."
- **Executor:** codex-implementer. **Depends on:** 2.

**Step 4 — Table support on landing pages**
- **Action:** Extend `LandingSection` with
  `table?: { caption: string; columns: string[]; rows: string[][] }`. Render after the
  body blocks: `<div className="mt-4 overflow-x-auto"><table className="min-w-[28rem] text-sm">
  <caption className="text-left text-xs font-medium text-slate-500 mb-2">…</caption>
  <thead><tr><th scope="col" className="bg-slate-50 …">…</tr></thead>
  <tbody><tr><th scope="row">first cell</th><td>…</td></tr>…</tbody></table></div>`,
  styled to match the blog's tables. Add to `src/lib/landing-pages.test.ts`:
  every `table` has 2–3 columns, 3–8 rows, every row length equals `columns.length`,
  every cell ≤ 12 words, caption non-empty.
- **Acceptance:** tsc clean; test passes with zero tables present (data comes in Step 8);
  a temporary fixture in the test proves the constraints fire.
- **Executor:** codex-implementer. **Depends on:** 3 (same file).

**Step 5 — Service-page steps become ordered lists**
- **Action:** In `src/app/(marketing)/ein/page.tsx` (~line 196), `itin/page.tsx` (~193),
  `partners/page.tsx` (~184): the steps grid `<div className="grid …">` becomes
  `<ol className="list-none grid …">` (same grid classes) and each step `<div key>`
  becomes `<li>`; keep `<h3 id="step-N">`, icons, text. Mirror the home page's pattern
  (`page.tsx:472`).
- **Acceptance:** audit shows `ol4 = 1` (5 items) on `/ein`, `/itin`, `/partners`;
  screenshots identical to before apart from nothing visible; HowTo JSON-LD unchanged.
- **Executor:** codex-implementer. **Depends on:** None (parallel with 2–4; disjoint files).

### Wave 2 — copy (single data file, serial)

**Step 6 — Landing intros to 40–60 words**
- **Action:** In `src/lib/landing-pages.ts`, rewrite the `intro` of the 20 pages in
  Appendix A.1 to 40–60 words. Rules: keep the first sentence's claim; keep at least one
  concrete anchor already in the intro (form number, $ figure, date, fax number); cut
  restatement, do not add facts. Add to `landing-pages.test.ts`:
  `it("keeps every intro between 40 and 60 words")` using the shared tokenizer.
- **Acceptance:** test passes for all 28; `git diff` shows only `intro:` lines changed;
  architect reads all 20 diffs against HEAD for dropped or added facts.
- **Executor:** codex-implementer. **Depends on:** 3 (so the lane can preview).

**Step 7 — Section leads to 40–60 words (Appendix A.2, 61 sections)**
- **Action:** For each listed section, make the first paragraph 40–60 words by pulling
  a fact already in that section's body up into the lead (or restating the section's
  own figure); the first sentence must still directly answer the heading (existing
  ≤40-word first-sentence test stays). No sentence may introduce a figure, date, form
  number, or legal claim absent from the section's current text. Add
  `it("answers every question heading with a 40-60 word lead unless a list follows")`:
  for sections whose heading ends in `?`, if the first block is a paragraph and the
  second block is not a list, first block ∈ [40, 60]; and for ALL sections the first
  paragraph ≤ 80 words.
- **Acceptance:** test passes; diff touches only the 61 sections' bodies (architect
  checks the changed-section set equals Appendix A.2); architect samples 10 diffs for
  drift; Step 11 reviews all.
- **Executor:** codex-implementer, in two serial batches (pages 1–14, 15–28) so each
  diff stays reviewable. **Depends on:** 6.

**Step 8 — Tables (Appendix B)**
- **Action:** Author `table` data for each section in Appendix B, following the shape
  given there. Every cell must restate a fact present in that page's `intro`, `sections`,
  or `faqs` text at HEAD — the lane quotes the source sentence for each row in its report.
  Cells ≤ 12 words; 2–3 columns; 3–8 rows; first column is the item name. Skip a table
  when fewer than 3 rows can be sourced, and say so. Also: extract the home comparison
  table into `src/components/ComparisonTable.tsx` and render it on `/pricing` under
  "Why use Form5472 Prep instead of CPA or DIY?"-equivalent copy; add an EIN-vs-ITIN
  table (rows: Who it identifies · Who issues it · Needed for Form 5472? · How you apply ·
  Typical timing) to `/itin` under "What is the difference between an EIN and an ITIN?"
  and to `/ein` under "What is an EIN?", sourced only from those pages' current text.
- **Acceptance:** Step 4 test passes; dev audit shows `tables ≥ 1` and `thead = tables`
  on every Appendix B page; ≥ 15 tables total; lane report lists a source sentence per row;
  architect verifies 5 tables' sources against HEAD text.
- **Executor:** codex-implementer (two batches: landing data; JSX pages). **Depends on:** 4, 7.

**Step 9 — Calculator and home short answers**
- **Action:** `form-5472-penalty-calculator/page.tsx` (5 headings: how the rule works,
  initial penalty, after a notice, common triggers, relief path),
  `form-5472-deadline-calculator/page.tsx` (5: how the rule works, April 15 rule, weekend
  roll, dissolution short year, Form 7004), home (`page.tsx`: "How does Form 5472 filing
  work?" 36w, "What free tools and guides help before filing?" 20w): each answer → 40–60
  words using only figures already on that page ($25,000; 30 days; April 15; October 15;
  Form 7004; fax number).
- **Acceptance:** dev audit shows all 12 headings' answers at 40–60 words.
- **Executor:** codex-implementer. **Depends on:** None (disjoint files; can run with 6).

**Step 10 — FAQ hub answers**
- **Action:** In `src/lib/faq.ts`, extend the 13 answers under 35 words (Appendix A.3)
  to 40–60 words and trim the one 72-word answer ("I've received an IRS notice…") to ≤ 70,
  using only facts present elsewhere on the site (fax number, Ogden, April 15, Form 7004,
  $25,000, DIIRSP). Tighten `faq.test.ts` bounds from 25–110 to 40–70.
- **Acceptance:** `npx vitest run src/lib/faq.test.ts` passes (all existing voice/brand
  tests included).
- **Executor:** codex-implementer. **Depends on:** None (parallel with 6–9).

### Wave 3 — review, ship, verify

**Step 11 — Factual-drift review**
- **Action:** `fable-advisor` reads `git diff HEAD~N -- src/lib/landing-pages.ts src/lib/faq.ts`
  and the JSX copy diffs with one question: does any added or changed sentence or table
  cell state a figure, date, form number, fee, or legal/procedural claim that does not
  appear in the pre-change text of the same page? Verdict lists each offending line.
  Any flagged line is reverted to HEAD wording (codex, then re-run tests).
- **Acceptance:** advisor verdict = none remaining, or every flagged line reverted and a
  second verdict = none.
- **Executor:** fable-advisor (read-only), then codex for reverts. **Depends on:** 6–10.

**Step 12 — Deploy, measure, log**
- **Action:** `npm run build`; commit in three commits (tooling; markup; copy);
  `git push origin main`; guarded deploy watch (record newest deployment before push,
  wait for a new one to reach Ready); run the audit against production; append the
  "After" table to `docs/reviews/2026-09-13-snippet-readiness-audit.md`; write
  `docs/sessions/2026-09-13-snippet-readiness.md`; index it in `REPO-STATE.md`; commit.
- **Acceptance:** the §1 acceptance statement, verified from the production audit
  output pasted into the review doc; tracked tree clean; session log committed.
- **Executor:** architect. **Depends on:** 11.

## 6. Risks and rollback

| Risk | Likelihood | Impact | Mitigation | Rollback |
|---|---|---|---|---|
| Copy drift: a lane "improves" a lead with a fact not on the page (the heading wave did this) | High | High — this is a tax site | No-new-facts rule in every spec; source sentence per table row; architect samples; Step 11 advisor review | Revert the copy commit (single data file + 2 JSX files) |
| Renderer changes layout on 28 pages | Medium | Medium | Same wrapper classes; screenshots of 3 pages; audit counts | Revert markup commit |
| Parser change alters HowTo JSON-LD | Low | Medium | Legacy-equality test over every section (Step 2) | Revert Step 3 |
| Competitor tables read as unfair comparison | Low | Medium | Restate-only rule; Open question 1 | Remove `table` from those 7 sections |
| Tests too strict, blocking the blog/content agent's future edits | Medium | Low | Rules are per-section with the list exemption; documented in the session log contracts | Loosen bounds in one test |
| No snippet gain despite eligibility | Medium | Low | Stated as a non-guarantee; measurement doc gives the before/after for GSC follow-up | n/a |

## 7. Estimates

| Step | Effort | Could blow up if |
|---|---|---|
| 1 audit script | M | HTML parsing edge cases (nested lists, aria-hidden); baseline is the check |
| 2 parser + tests | M | Bodies with irregular markers ("1)" or "a.") — treat as prose |
| 3 renderer | S | Assumption 3 false → class tuning |
| 4 table support | M | Assumption 2 false |
| 5 service `<ol>` | S | — |
| 6 intros (20) | M | — |
| 7 leads (61) | L | Drift; two batches keep diffs reviewable |
| 8 tables (~17) | L | Pages lacking 3 sourceable rows → fewer tables (acceptable, reported) |
| 9 calculators/home | S | — |
| 10 FAQ | S | Brand-reference / hedging tests conflict with new wording |
| 11 drift review | S | Many flags → a revert pass |
| 12 deploy + docs | M | Deploy watch as in prior waves |

## 8. Changelog
v1 — 2026-09-13 — initial plan.

## 9. Execution log
- 2026-09-13 approved v1 ("work on it"); Open question 1 defaulted to include competitor tables.

---

## Appendix A — Enumerated copy targets

### A.1 Intros outside 40–60 words (20 pages; current word count)
file-form-5472 70 · form-5472-penalty 75 · diirsp 79 · late-form-5472 80 ·
form-5472-vs-1120 71 · wyoming-llc-form-5472 72 · delaware-llc-form-5472 82 ·
form-5472-germany 80 · form-5472-uae 82 · pro-forma-1120 70 ·
form-1120-foreign-owned-llc 78 · form-1120-disregarded-entity 79 ·
1120-pro-forma-instructions 65 · irs-form-5472 97 · form-5472-deadline 78 ·
form-5472-fax-number 71 · single-member-llc-foreign-owner 82 · stripe-atlas-form-5472 80 ·
form-5472-reasonable-cause-statement 81 · pro-form-5472 82.
(Already in range: form-5472-instructions 60, foreign-owned-llc-tax 54, doola 59,
firstbase 50, clemta 55, startglobal 59, zenind 57, northwest 49.)

### A.2 Question sections whose lead is under 40 words and not followed by a list (61)
Format: slug · section number · current words · heading.
- file-form-5472 · s4 · 28 · What goes on each part of Form 5472?
- file-form-5472 · s9 · 39 · What happens after you file Form 5472?
- form-5472-penalty · s10 · 33 · What is the bottom line on Form 5472 penalties?
- diirsp · s1 · 28 · What is DIIRSP, really?
- diirsp · s8 · 39 · What happens after you file under DIIRSP?
- form-5472-instructions · s2 · 20 · What goes at the top of Form 5472?
- form-5472-instructions · s9 · 28 · How do you sign the Form 5472 package?
- foreign-owned-llc-tax · s1 · 39 · What forms make up the complete federal filing?
- foreign-owned-llc-tax · s2 · 35 · Do you owe US federal income tax?
- late-form-5472 · s1 · 26 · How late can you actually file?
- late-form-5472 · s7 · 39 · How long until you hear back from the IRS?
- late-form-5472 · s8 · 37 · What are real-world late-filing scenarios?
- late-form-5472 · s9 · 35 · Does the IRS notice if you do not file?
- form-5472-vs-1120 · s6 · 17 · Does this trigger US corporate income tax?
- wyoming-llc-form-5472 · s2 · 18 · What is the Wyoming-specific tax timeline?
- wyoming-llc-form-5472 · s6 · 22 · What Wyoming registered agent address do you use?
- wyoming-llc-form-5472 · s10 · 39 · What is the bottom line for Wyoming LLC owners?
- delaware-llc-form-5472 · s2 · 24 · What is the Delaware-specific tax timeline?
- delaware-llc-form-5472 · s3 · 37 · How do Stripe Atlas LLCs interact with Form 5472?
- delaware-llc-form-5472 · s6 · 36 · What is the Stripe Atlas, Mercury, and Form 5472 stack?
- form-5472-germany · s1 · 20 · Why do German founders use US LLCs?
- form-5472-uae · s1 · 23 · Why do UAE-based founders use US LLCs?
- pro-forma-1120 · s4 · 24 · What is the 'Foreign-Owned U.S. DE' stamp?
- pro-forma-1120 · s8 · 31 · What's the difference between pro forma 1120 and regular Form 1120?
- form-1120-foreign-owned-llc · s1 · 38 · Why does a foreign-owned LLC file 1120 at all?
- form-1120-foreign-owned-llc · s2 · 16 · What does 'pro forma' mean in this context?
- form-1120-foreign-owned-llc · s5 · 28 · How do you sign the pro forma 1120?
- form-1120-foreign-owned-llc · s8 · 30 · How are foreign-owned multi-member LLCs different?
- form-1120-disregarded-entity · s2 · 16 · Why does a disregarded entity file Form 1120?
- form-1120-disregarded-entity · s5 · 27 · What does 'solely for purposes of' mean in practice?
- form-1120-disregarded-entity · s8 · 3 · What if you elect S-corp taxation?
- form-1120-disregarded-entity · s9 · 33 · What are common confusions about these forms?
- 1120-pro-forma-instructions · s5 · 34 · What tax and payment section details do you leave blank?
- 1120-pro-forma-instructions · s7 · 28 · How do you complete the signature block?
- irs-form-5472 · s1 · 38 · What is IRS Form 5472?
- irs-form-5472 · s5 · 17 · When is Form 5472 due?
- irs-form-5472 · s7 · 18 · What is the difference between Form 5472 and Form 1120?
- irs-form-5472 · s10 · 16 · Why use Form5472 Prep instead of a CPA or DIY?
- form-5472-deadline · s2 · 26 · How do you file Form 7004 for an extension?
- form-5472-deadline · s3 · 39 · What counts as "on time"?
- form-5472-fax-number · s1 · 7 · What is the fax number?
- form-5472-fax-number · s6 · 29 · What if the fax fails?
- form-5472-fax-number · s9 · 20 · Which is better: mail or fax?
- single-member-llc-foreign-owner · s1 · 38 · Why does the IRS single out foreign-owned LLCs?
- single-member-llc-foreign-owner · s3 · 10 · What do you owe, and what do you file?
- single-member-llc-foreign-owner · s7 · 21 · When and how do you file?
- stripe-atlas-form-5472 · s3 · 16 · What is the typical Stripe Atlas compliance stack?
- stripe-atlas-form-5472 · s5 · 12 · What are common Stripe Atlas LLC scenarios?
- form-5472-reasonable-cause-statement · s4 · 16 · What is a sample structure for a Reasonable Cause Statement?
- form-5472-reasonable-cause-statement · s7 · 39 · What happens after you file Form 5472?
- doola-form-5472 · s1 · 36 · What does doola do for you?
- doola-form-5472 · s2 · 39 · What does doola leave with you?
- doola-form-5472 · s5 · 35 · How do we file it?
- firstbase-form-5472 · s1 · 39 · What does Firstbase do for you?
- firstbase-form-5472 · s4 · 32 · What is your first-year filing timeline?
- startglobal-form-5472 · s3 · 34 · Does StartGlobal name Form 5472?
- startglobal-form-5472 · s4 · 28 · What is your first-year filing timeline?
- startglobal-form-5472 · s5 · 39 · How do we file it?
- zenind-form-5472 · s1 · 36 · What does Zenind do for you?
- zenind-form-5472 · s2 · 38 · What does Zenind leave with you?
- zenind-form-5472 · s4 · 35 · What is your first-year filing timeline?

Exempt by rule (no edit): 19 sections whose first block is a list; 70 sections whose
short lead is immediately followed by a list (the list is the answer).

### A.3 FAQ hub answers under 35 words (13) + one long
What counts as a reportable transaction? 33 · Can Form 5472 be e-filed? 34 ·
Does a first-year LLC still have to file? 34 · What is the Form 5472 deadline? 34 ·
What happens if Form 5472 is missed? 34 · Is the penalty really automatic? 31 ·
Can the penalty be abated? 33 · What is a CP15 notice? 34 · Do I need an EIN to file
Form 5472? 25 · Do I need a US Social Security Number or ITIN to get an EIN? 34 ·
What if my LLC already has an EIN? 26 · How quickly will you reply to a message? 31 ·
What is your refund policy? 33 · (long) I've received an IRS notice — can you still help? 72.

### A.4 JSX short answers (Step 9)
Penalty calculator (5): How does the Form 5472 penalty rule work? 17 · What is the
initial penalty? 22 · What happens after a notice? 32 · What are common triggers? 23 ·
What is the relief path? 22. Deadline calculator (5): How does the deadline rule work? 21 ·
What is the April 15 rule? 25 · How does the weekend roll work? 19 · When does a
dissolution short year apply? 27 · How does a Form 7004 extension work? 22.
Home (2): How does Form 5472 filing work? 36 · What free tools and guides help before filing? 20.

## Appendix B — Table map (section → shape; cells sourced from that page only)

| Page · section | Columns | Rows (3–8) |
|---|---|---|
| form-5472-vs-1120 · s4 side-by-side | Item · Pro forma Form 1120 · Form 5472 | Purpose · What you complete · Signature · Where it is filed · Penalty if missing |
| irs-form-5472 · s7 difference 5472 vs 1120 | same shape as above | same rows, sourced from this page |
| form-5472-penalty · s1/s2 | Penalty · Amount · When it applies | Initial · Continuation per 30 days · Incomplete return |
| form-5472-penalty · s6 scenarios | Scenario · Exposure · What to do | the scenarios already narrated (3–5) |
| form-5472-deadline · s1/s3 | Situation · Due date · Note | Calendar-year LLC · With Form 7004 · Weekend/holiday · Dissolution short year |
| form-5472-fax-number · s9 mail or fax | Method · Send to · Proof you keep | Fax · Certified mail · E-file (not available) |
| late-form-5472 · s8 scenarios | Years late · What you file · Relief route | as narrated (3–4) |
| diirsp · s1 or s3 | Requirement · What it means · Where it goes | if ≥3 sourceable rows |
| form-5472-instructions · s3–s8 parts | Part · What it reports · Foreign-owned SMLLC entry | I · II · III · IV · V · VII |
| foreign-owned-llc-tax · s3 states | State · Annual state filing · Cost or due date | states named in the section |
| foreign-owned-llc-tax · s9 profiles | Business type · Federal forms · Extra filings | profiles named in the section |
| wyoming-llc-form-5472 · s2 timeline | Obligation · Due · Cost | as stated on page |
| delaware-llc-form-5472 · s2 timeline | Obligation · Due · Cost | as stated on page (no fee figure unless already on the page) |
| single-member-llc-foreign-owner · s3 | Item · Do you owe it? · Do you file it? | Federal income tax · Form 5472 · Pro forma 1120 · State filings |
| pro-forma-1120 · s8 | Aspect · Pro forma 1120 · Regular 1120 | 3–5 aspects as narrated |
| form-1120-foreign-owned-llc · s8 | Entity · Federal return · Form 5472? | Single-member foreign-owned · Multi-member · (as stated) |
| 7 competitor pages · "What does X leave with you?" (Open question 1) | Task · X · Form5472 Prep | Formation · Registered agent · EIN · Form 5472 + 1120 · IRS fax filing · Catch-up years — only cells the page already states |
| /itin (JSX) · EIN vs ITIN | Question · EIN · ITIN | Who it identifies · Who issues it · Needed for Form 5472? · How you apply · Typical timing |
| /ein (JSX) · EIN vs ITIN | same | same, sourced from /ein text |
| /pricing (JSX) | reuse home's Form5472 Prep · CPA · DIY table via `ComparisonTable` | unchanged rows |

## Appendix C — Landing pages with numbered sections (must show `<ol>` after Step 3)
file-form-5472 (4) · form-5472-penalty (2) · diirsp (1) · late-form-5472 (2) ·
form-5472-vs-1120 (1) · wyoming-llc-form-5472 (2) · delaware-llc-form-5472 (2) ·
form-5472-germany (3) · form-5472-uae (2) · pro-forma-1120 (1) ·
form-1120-foreign-owned-llc (1) · 1120-pro-forma-instructions (1) · irs-form-5472 (3) ·
form-5472-deadline (1) · form-5472-fax-number (2) · single-member-llc-foreign-owner (2) ·
stripe-atlas-form-5472 (1) · form-5472-reasonable-cause-statement (2) · pro-form-5472 (2).
Bullet sections (112 across 28 pages) must render `<ul>`.

## Appendix D — Baseline (production, 2026-09-13)
643 question headings measured across 47 pages; 140 answers in 40–60 words, 232 in
35–70; 10 tables site-wide (home 1, data-retention 2, three blog posts 7); ordered lists
with ≥4 items: home 1, about 1, everything else 0. Full per-page table is regenerated by
Step 1 into `docs/reviews/2026-09-13-snippet-readiness-audit.md`.
- Step 5 DONE — ein/itin/partners step grids are `<ol class="list-none …">` + `<li>`; tsc clean; diff = 4 tag swaps per file, verified by architect; DOM check deferred to Step 12 audit.
- Step 9 DONE — 12 answers rewritten (penalty calc 4+subtitle, deadline calc 4+subtitle, home 2); lane recount 42–53 words each; tsc clean; architect read all 12 and spot-checked "six-question", "browser signature", "no-income" against HEAD text: all sourced. Lane's "scope violation" flag was the other parallel lanes' files — no action.
- Step 1 DONE — `scripts/snippet-audit.mjs` + `npm run audit:snippets`; architect's live run = 47 rows, byte-identical to the scratchpad baseline and to the doc's Before table (TOTAL q=643 40-60=140 35-70=232 tables=10 thead=10). Codex's sandbox lacked network; doc provenance note added. Output is an aligned text table, not pipe-markdown (accepted).
- Step 10 DONE — faq.ts: 14 named answers + 9 others at 35–39 words (needed for the 40-word floor) now all in 40–70; faq.test bounds 40–70; 10/10 tests pass; sources quoted for the 14, the 9 go to Step 11 review.
- Step 2 DONE — `src/lib/landing-body.ts` + test; legacy parity over 250 sections; 6/6 pass; tsc clean. Edge: a bullet line inside an open numbered item stays continuation text (legacy behaviour), affects one section on reasonable-cause-statement.
- Steps 3+4 dispatched as one lane (same file); Step 8b (JSX tables: ComparisonTable, EinItinTable, /pricing) dispatched in parallel on disjoint files.
- Steps 3+4 DONE — `[seoSlug]/page.tsx` renders blocks via `renderBody` (p/ol/ul) for sections and FAQ answers; `LandingTable` type + `<table>` renderer; table-shape test appended; tsc clean, 10/10 tests, build ok; lane's local server: /file-form-5472 has 7 `<ol>`, 2 `<ul>`, HowTo 10 steps — production also emits 10 (my spec's "8" was wrong, no drift). Visual check by architect follows.
- Step 3 visual check (dev server, /file-form-5472 §step-3): body wrapper no longer `whitespace-pre-line`; one `<ol class="list-decimal">` with 8 `<li>`, first "Gather your LLC info…", last "Fax the complete package to +1-855-887-7737…"; inline link inside item 7 renders; no doubled markers. Screenshot reviewed by architect.
- Step 6 DONE — 20 intros now 44–52 words; intro test added (5/5 pass); architect read all 20 diffs: no added facts, anchors kept, only guide-scope filler removed.
- Step 7 batch 1 DONE on disk (wrapper died on the account's Sonnet session limit after codex finished): SHORT count 61 → 29, the 29 remaining are all batch-2 sections; 21/21 tests pass; tsc clean. Lane's per-section source lines were lost with the wrapper — Step 11 advisor review covers the full diff.
- Step 8b DONE — `ComparisonTable` + `EinItinTable`; tables on /, /pricing, /itin, /ein (1 each, thead present); home table text identical to production (27 cells); ITIN timing cells traced to itin page ("allow 7 weeks…, or 9–11 weeks…"). Step 7 batch 2 dispatched.
- Step 7 batch 1 architect sample: "six-figure" (penalty s10) traces to HEAD. DEFECTS for a Step 7c cleanup lane (after batch 2, same file): (1) near-duplicate lead sentences left in place — file-form-5472 s9, diirsp s8, late-form-5472 s7, form-1120-foreign-owned-llc s1, form-1120-disregarded-entity s8, single-member-llc-foreign-owner s5 (pre-existing); (2) form-5472-instructions s2 lead added unsourced "form count is 1" and "total gross payments should match … Parts IV and V" — replace with sourced wording. Detector: /tmp/claude-501/dupes2.ts (8-word-prefix match).
- EIN apply redesign (owner request, outside this plan) dispatched on `ein/apply/page.tsx` + `einApplicationFaq.ts`.
- Step 7 batch 2 DONE — 29 leads at 42–53 words; lead test appended. One failure outside both batches: file-form-5472 s2 "What forms do you actually file?" lead is 67 words (pre-existing) → cleanup. Step 7c cleanup + Step 8 landing tables dispatched as one serial lane.
- EIN apply redesign: layout landed (header band, 2-col, sticky timing card, timeline, deliverables, FAQ grid; logic untouched; 2 FAQ items added verbatim). REJECTED as delivered: Owner fieldset nested in Company with CSS `order-N` reordering (tab order ≠ visual order) and `requ{"ired"}` string split to dodge a grep. Correction pass sent to the same lane.
- EIN apply redesign ACCEPTED after correction: 3 flat fieldsets (Contact/Company/Owner) in DOM order = visual order; no `order-N`, no `contents`, no split strings; logic lines untouched; desktop screenshot reviewed (header band + chips, grouped form, sticky "1–5 business days" card with 5-step timeline and deliverables).
- Step 7c DONE — 5 of 6 near-duplicates removed (single-member-llc-foreign-owner s5 remains, pre-existing → fix lane); instructions s2 unsourced claims gone; file-form-5472 s2 lead ≤ 60; 12/12 landing tests pass.
- Step 8 DONE on disk — 23 landing tables (16 informational + 7 competitor), all 3 columns, 3–7 rows; renderer confirmed on dev server after restart (dev `.next` had been clobbered by lane builds — lesson recorded): /form-5472-vs-1120, /doola-form-5472, /form-5472-instructions, /delaware-llc-form-5472 each 1 table with thead/tbody/caption/scope="row". Cell sourcing is under Step 11 advisor review.
- Preview audit on dev (pre-fix script): TOTAL q=646 40-60=174 (was 140) tables=36 (was 10) thead=36; /faq 50/51 in 40–60; penalty calc 5/7. Artifact: landing answers captured as the wrapper `div` (whole section) → script fix lane dispatched (prefer p/li/dd/td, div only as fallback). Step 11 advisor review running on the diff bundle.
- Step 7c/8 lane final report received: matches architect checks. Extra in-class fixes it made (>60-word leads unmasked once the test loop stopped failing early): form-5472-uae ×2, pro-forma-1120 s?, pro-form-5472, zenind s?, northwest s1. One unsourced "EIN" row dropped from the stripe-atlas table. All inside the advisor's diff bundle.
- Step 11 advisor verdict: 7 findings. #1–5 (multi-member "Form 5472?" cell; deadline "on time" definition; Zenind "not reviewed filer" cells; Northwest "package never filed" cell; Clemta fax row) → fix lane dispatched with the last duplicate (single-member s5). #6 (/pricing table = verbatim home table) and #7 (/ein/apply timing + CP 575 + FAQ items = verbatim /ein page) are architect-specified cross-page reuse of our own copy, not drift — ACCEPTED, no change. Advisor confirmed clean: all faq.ts extensions, calculator/home leads, EinItinTable, penalty/DIIRSP/deadline/vs-1120/pro-forma/fax/single-member/Stripe/doola/Firstbase/StartGlobal tables.
- Audit script fix DONE (div wrapper only as fallback); corrected dev preview TOTAL q=646 40-60=312 35-70=379 tables=36. Review doc "Before" regenerated against production with the fixed script for a like-for-like comparison.
- Step 12 DONE — 274/274 tests, tsc, build clean; commits ff7b94b (tooling), a3f0619 (markup), 8335d73 (copy), 4f5c4e9 (apply page) pushed; deployment form5472prep-kvpr4vqco Ready; production audit: TOTAL q=646 40-60=312 (Before 146) tables=36 (Before 10) thead=36; >80 site-wide = 0; /ein /itin /partners ol4=1; all landing pages ol4≥1; /faq 51/51 in 40–70; /ein/apply live with 3 fieldsets and timing copy. §1 acceptance statement met. Status COMPLETE.
