# 2026-09-13 — Featured-snippet readiness (GEO/AEO wave 4) + EIN apply page

Plan of record: `docs/plans/PLAN-snippet-readiness-20260913.md` (status, per-step execution log).
Measurement: `docs/reviews/2026-09-13-snippet-readiness-audit.md` (Before / After tables).

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `main`. This session owned:
`scripts/snippet-audit.mjs`, `package.json` (one script), `src/lib/landing-body.ts` (+test),
`src/lib/landing-pages.ts` (+test), `src/lib/faq.ts` (+test), `src/app/(marketing)/[seoSlug]/page.tsx`,
`src/app/(marketing)/{page,pricing/page,ein/page,itin/page,partners/page,form-5472-penalty-calculator/page,form-5472-deadline-calculator/page,ein/apply/page}.tsx`,
`src/lib/einApplicationFaq.ts`, `src/components/{ComparisonTable,EinItinTable}.tsx`, the docs above,
`REPO-STATE.md` index line. Untracked files from a concurrent session (public/email banners,
docs/marketing brief, src/lib/wizard/, root PNGs) were left untouched.

## What shipped (commits ff7b94b, a3f0619, 8335d73, 4f5c4e9; docs commit follows)
- **Audit tooling** — `npm run audit:snippets -- --base <url>`: per page, question headings and the
  word count of the first paragraph after each, `<ol>/<ul>` with ≥ 4 items, `<table>` with thead/tbody.
- **Markup** — landing sections render real `<p>/<ol>/<ul>` via `parseLandingBody` (HowTo JSON-LD
  step extraction proven byte-identical over 250 sections); `LandingSection.table` renders
  caption/thead/tbody with scoped `<th>`; EIN/ITIN/partner step grids are `<ol>`; `ComparisonTable`
  (home table reused on /pricing); `EinItinTable` on /ein and /itin.
- **Copy** — 20 landing intros to 40–60 words; 66 section leads to 40–60; 23 landing tables;
  all 51 FAQ-hub answers 40–70; 12 calculator/home explanations 40–60. Rule: no fact not already
  on the same page. Advisor drift review: 7 findings, 5 fixed, 2 accepted as deliberate reuse of our
  own copy across pages (/pricing table = home table; /ein/apply timing = /ein page).
- **EIN apply page** (owner request) — header band with stat chips, Contact/Company/Owner fieldsets,
  sticky card: "1–5 business days", 5-step timeline, deliverables; two FAQ items copied from /ein.
  Form logic byte-for-byte untouched.

Verified: 274/274 vitest, tsc clean, production build clean; dev-server DOM checks and screenshots
(lists, tables, apply page desktop + mobile). Production evidence (deployment form5472prep-kvpr4vqco, Ready): audit TOTAL 40-60 = 312 (Before 146), tables 36 (Before 10), /ein /itin /partners each 1 `<ol>`, every landing page ≥ 1 `<ol>` and the mapped pages 1 `<table>`, /faq 51/51 in 40–70, /ein/apply 3 fieldsets + timing copy. Full table in the review doc "After".

## Contracts (tests enforce these — read before editing copy)
- `src/lib/landing-pages.test.ts`: intros 40–60 words; every `?`-heading section's first paragraph
  40–60 words unless a list block follows, and ≤ 80 always; tables 2–3 columns, 3–8 rows, cells ≤ 12
  words, caption required; heading-ratio and first-sentence rules from earlier waves.
- `src/lib/faq.test.ts`: answers 40–70 words.
- `src/lib/landing-body.test.ts`: `orderedListItems` must stay legacy-equal (JSON-LD contract).
- Body syntax in `landing-pages.ts`: blank line = paragraph; `1. ` lines = `<ol>`; `• `/`- ` lines =
  `<ul>`; a bullet inside an open numbered item is continuation text (legacy behaviour).
- No new facts in copy without a source on the same page; competitor tables restate page text only.
- Never run `npm run build` while `next dev` is serving the same checkout (it clobbers `.next/`).

## Open
Owner-gated: none blocking. Optional: if the /pricing comparison table or the apply-page timing copy
should NOT reuse home/EIN-page text, say so and they revert (advisor findings #6/#7).
Follow-ups: blog leads (other agent) per the brief in the review doc; `/do-i-need-to-file-form-5472`
checker cards and `/pricing` short leads were out of scope; GSC snippet/PAA impressions to be checked
in 4–6 weeks against the Before/After tables.

## Lane notes
codex-implementer for all implementation (grok headless still cancels edits). Three wrapper agents
died on the account's Sonnet session limit mid-run with their codex work already on disk — verify the
tree, don't re-dispatch. Codex again split a word (`requ{"ired"}`) and nested fieldsets with CSS
`order-N` to satisfy grep-shaped checks: verify structure from the rendered DOM. Lesson entries added
to `~/.claude/doctrine/lessons.md`.
