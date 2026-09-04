# Content inventory, cannibalization & gap analysis — 2026-09-05

Source: read-only Explore lane over `main` (worktree form5472-tools @ 0cbeffa). Persisted by the architect from the lane's report.

## Counts
- Blog posts: 95 files → **91 live, 4 scheduled** (`publishAt` after 2026-09-05: recordkeeping-checklist 09-07, ftin-reference-id 09-14, multiple-related-parties 09-21, final-form-5472-closing 09-28). No `draft: true`.
- Landing pages: 28 (`src/lib/landing-pages.ts`); all ≥6 sections / 4 FAQs; 1 `noindex` (`pro-form-5472`, paid-ads page).
- Thin posts (<800 body words): 7 — recordkeeping-checklist 696, owner-loans-contributions 707, multiple-related-parties 727, ftin-reference-id 736, itin-required 743, reasonable-estimates-small-amounts 767, final-form-5472-closing 782.
- Stale (>120 days): **0** — oldest `updated` is 2026-07-06. Freshness is good.
- **22 of 28 landing pages carry no `updated` field** (only the 6 provider pages do) → dateModified falls back to the site constant.

## Cannibalization clusters (worst first)
1. **Pro forma 1120 — 5-way.** Landing `pro-forma-1120`, `form-1120-foreign-owned-llc`, `form-1120-disregarded-entity`, `1120-pro-forma-instructions` + blog `pro-forma-form-1120-foreign-owned-llc`. Winner `/pro-forma-1120`. Consolidate `form-1120-disregarded-entity` + `1120-pro-forma-instructions` into it (301); differentiate `form-1120-foreign-owned-llc` toward "who must file the 1120 cover"; blog stays as support linking in. (`/1120-pro-forma-instructions` is also an orphan per the technical crawl.)
2. **Late / DIIRSP / reasonable cause — 5-way.** Landing `late-form-5472`, `diirsp`, `form-5472-reasonable-cause-statement` + blog `form-5472-filed-late-never-filed`, `form-5472-reasonable-cause-letter`. Winners: `/diirsp` (procedure), `/form-5472-reasonable-cause-statement` (letter). Merge `late-form-5472` → `/diirsp` (301).
3. **Deadline — 3-way.** Blog `form-5472-deadline-2026`, landing `form-5472-deadline`, tool `/form-5472-deadline-calculator`. Winner: the calculator for transactional intent; landing gets a prominent calculator CTA; blog = evergreen explainer.
4. **Penalty — 3-way.** Blog `form-5472-penalty-notice-what-to-do`, landing `form-5472-penalty`, tool `/form-5472-penalty-calculator`. Winner: calculator for "what does it cost"; landing keeps $25k authority; blog = "I got a notice" narrative. Cross-link all three (only 5/95 posts link the penalty calculator).
5. **Instructions / how-to / what-is — 3-way + 2-way.** Landing `file-form-5472`, `form-5472-instructions`, blog `how-to-fill-out-form-5472`; landing `irs-form-5472` vs blog `what-is-form-5472`. Winners `/file-form-5472` (how-to) and `/irs-form-5472` (definitional). Differentiate `form-5472-instructions` into a literal line-by-line field reference.
- State pairs (Wyoming/Delaware landing vs blog): 2-way, low severity — title/H1 differentiation only, no consolidation.

## Money-page linking
- `/pricing`: **2/95** posts (extension, cost). `/start`: 86/95. `/ein`: 43. `/itin`: 11. Deadline calc 5, penalty calc 5, checker 6.
- 15 highest-intent posts missing a `/pricing` link: penalty-notice-what-to-do, filed-late-never-filed, deadline-2026, diy-vs-preparer, filing-requirements-checklist, wyoming/delaware/florida/texas/california/nevada/new-mexico state pages, change-of-ownership, dormant-llc-no-income, amended-form-5472.

## Gap list (vs 40 target queries)
MISSING: form 5472 **crypto**; form 5472 **Turkey** (only uncovered country); **"best form 5472 filing service"** roundup; **zenbusiness / legalzoom / bizee-incfile / tailor brands** provider pages; **"form 5472 filing service"** organic page (the only page built for it, `pro-form-5472`, is noindex).
PARTIAL: IRS CP15 notice (subsection only); e-file question (inside file-form-5472); fax vs mail comparison; complete filled-form example; FBAR/8938 bank-account reporting angle.
COVERED: everything else on the list, incl. all other countries and doola/firstbase/atlas/northwest/clemta/startglobal/zenind. No off-topic drift.

## AEO structure
- FAQ section present: 85/95 (89%). Missing: multiple-llcs-one-owner, noncash-property-transfers, reasonable-estimates-small-amounts, related-party-services-management-fees, royalties-license-fees, short-tax-year, vs-1040-nr, vs-1120-f, oregon-llc, washington-llc.
- Question-form H2s: 20/20 sampled. Direct-answer lead: 14/15 — outlier `itin-required-form-5472` opens with "**Last updated: August 2026**".

## Ranked recommendations
| # | Type | Item | Effort |
|---|---|---|---|
| 1 | Link | `/pricing` CTA in the 15 posts above | S |
| 2 | Refresh | FAQ sections for the 10 posts lacking one; direct-answer lead for itin-required | S |
| 3 | Consolidate | `1120-pro-forma-instructions` + `form-1120-disregarded-entity` → `/pro-forma-1120` (301) | M |
| 4 | Consolidate | `late-form-5472` → `/diirsp` (301) | M |
| 5 | Refresh | indexable "Form 5472 filing service" page (or un-noindex a non-promo variant) | S |
| 6 | Create | crypto post; Turkey country post | S/M |
| 7 | Create | "best Form 5472 filing services" comparison cross-linking provider pages | M |
| 8 | Create | zenbusiness / legalzoom / bizee provider pages (same facts-file discipline) | M |
| 9 | Differentiate | `form-5472-instructions` → line-by-line reference; state landing vs blog titles | S |
| 10 | Refresh | `updated` on 22 landing pages; calculator CTAs on deadline/penalty landings | S |
