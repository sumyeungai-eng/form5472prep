# 2026-09-14 — HowTo structure (GEO/AEO wave 5)

Audit item 「HowTo 結構」 60/100. Measured first with `scripts/howto-audit.mjs` (new, `npm run audit:howto`).

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `main`. This session owned:
`scripts/howto-audit.mjs`, `package.json` (one script), `vitest.config.ts` (jsx automatic for .tsx tests),
`src/lib/seo.ts` (+test), `src/components/HowToSummary.tsx`, `src/lib/landing-howto.ts` (+test),
`src/lib/landing-pages.ts` (+test), `src/app/(marketing)/[seoSlug]/page.tsx`,
`src/app/(marketing)/{page,ein/page,itin/page,partners/page}.tsx`, this log, `REPO-STATE.md` line.
Untracked files from a concurrent session left untouched.

## What was wrong (production, before)
31 pages emitted HowTo JSON-LD. The 4 service pages were sound. On all 27 landing pages the "steps" were
the page's section headings ("Pricing", "What is not involved?"): 0 imperative names, 0 verification
steps, `estimatedCost` $149 attached to non-purchasable outlines, `totalTime` derived from word count.
No page showed its time/tools/supplies in the DOM.

## What shipped (da38f7e, 5aa7896; docs commit follows)
- `HowToSummary` "Before you start" box (time · what you need · tools · cost) rendered from the SAME object
  that feeds `howTo()` on /, /ein, /itin, /partners and on every landing page that emits a HowTo.
- `howTo()` helper: `totalTime` optional, `estimatedCost` (MonetaryAmount) input. Prices added only where
  the page states them (/ $149, /ein $149, /itin $349, /partners from $149). EIN step "We prepare Form
  SS-4" → "Receive the prepared Form SS-4" (sourced).
- Landing pages: `LandingPage.howTo = { section, tools?, supplies?, totalTime?, cost? }` names the real
  process section; `deriveHowTo()` takes steps from that section's first ordered list (name = clause
  before the colon / first sentence, text = full item, url = `#step-N` on the `<li>`s). H2 ids are now
  slugified headings; TOC follows. 11 pages opt in (file-form-5472, diirsp, late-form-5472, wyoming,
  delaware, germany, uae, irs-form-5472, form-5472-deadline, form-5472-fax-number, pro-form-5472).
  16 pages emit NO HowTo (document manifests or no list; the 7 competitor pages). form-5472-penalty's
  list is a prevention checklist, not a filing process — excluded on purpose.
- Copy: 13 list items reworded to imperative verbs inside the named sections only; late-form-5472 list
  reordered so the receipt step is last. No new facts.

Production after deploy (form5472prep-ja97weh1l): `audit:howto` → 14 pages with HowTo (4 service + 10
landing in the sitemap; pro-form-5472 is noindex/off-sitemap), verbFirstAll 14/14, verifyLast 14/14,
box 14/14; `/file-form-5472` has 8 `<li id="step-N">`, 0 H2 step ids, absolute step URLs; vs-1120 and
doola emit no HowTo. Before: 31 pages, 3/31 imperative, 5/31 verification, 0 boxes.

## Contracts
- A landing page gets a HowTo ONLY via `howTo.section`; never derive from headings. Tests: the named
  section exists once, ≥ 3 steps, every step name starts with a word in `IMPERATIVE_VERBS`
  (`src/lib/landing-howto.ts`), the last step matches /keep|receipt|confirm|verify|check|record|preserve/i,
  tools/supplies ≤ 6 words, `totalTime` ISO 8601; the 11-slug set is guarded both ways.
- `scripts/howto-audit.mjs` VERBS must stay identical to `IMPERATIVE_VERBS`.
- `totalTime`/`cost` only where the page states a duration/price for THAT process; tools name "Form5472
  Prep online filer" only on our-flow pages (deadline, pro-form-5472).
- `#step-N` ids live on the process list's `<li>`s; H2 ids are `slugify(heading)` (deduped).

## Open
Owner-gated: none. Follow-ups: form-5472-penalty could opt in by reordering its list so "keep your fax
receipt" is last (pure reorder); blog posts emit no HowTo (`extractHowTo` finds none in the sample) —
blog owner's call; `/form-5472-instructions` would need a real numbered walkthrough to qualify.

## Lane notes
codex-implementer ×4 + fable-advisor ×1 (its amendment — explicit `howTo.section` instead of a
render-time heuristic — was decisive: the vs-1120 "How are these forms filed together?" list is a
package manifest that the heuristic would have picked). Wrappers again stalled "waiting for a
background codex process" that had already exited — check `ps` and resume with an explicit phase list.
