# 2026-09-06 — Central `/faq` page (SEO / AEO / GEO)

## Ownership

| File | Change |
|---|---|
| `src/lib/faq.ts` | NEW — `FAQ_CATEGORIES` (6), `FAQ_ITEMS` (51), `FAQ_LAST_REVIEWED` |
| `src/lib/faq.test.ts` | NEW — 10 tests (content rules, see Contracts) |
| `src/app/(marketing)/faq/page.tsx` | NEW — server component, static, JSON-LD |
| `src/app/(marketing)/layout.tsx` | footer: `FAQ` link under Services, before Contact |
| `src/app/(marketing)/page.tsx` | "See all questions →" under the homepage FAQ |
| `src/app/sitemap.ts` | `/faq` monthly 0.7 |
| `src/lib/llms.ts` | `/faq` in `CORE_PAGES` |
| `docs/reviews/2026-09-06-faq-inventory.md` | NEW — verbatim inventory of all 310 existing site FAQs with `path:line` |

Untouched, deliberately: `content/blog/`, `hktax/`, `src/lib/landing-pages.ts`, the `/itin` page.

## What shipped

Commit `14faa50` on `main`. Deploy evidence: see "Deploy" below.

`/faq` — six journey-stage sections (before-you-order · the-filing · deadlines-penalties ·
ein-itin · how-our-service-works · after-we-file), 51 answer-first questions, always-visible
answers (no client JS, no `<details>`), sticky section nav, `FAQPage` + `BreadcrumbList` +
`WebPage.speakable` (`h1` + 6 anchors) JSON-LD, "Last reviewed 2026-09-06".

Verified before push, personally: `tsc` clean; vitest **183 passed** (173 baseline + 10 new);
`npm run build` "Compiled successfully" with `/faq` in the static route list; 51
`"@type":"Question"` nodes in `.next/server/app/faq.html`; 2 `href="/faq"` on the built homepage.

Independent accuracy audit (`fable-advisor`, read-only, all 51 items against their cited
sources): verdict SHIP WITH FIXES, 45/51 clean, 6 clause-level findings — all applied:
CP-15 scope (we prepare the late filing, we do not handle appeals), signing flow reconciled
with the wet-ink/upload path, records-retention leads with the general rule, penalty citation
corrected to `src/lib/penalty.ts:1`, CAA sources extended, March reminder added.

## Contracts a future editor must respect

1. **Every answer is a condensation of copy that already exists on the site**, cited in
   `source` (`path:line`). No tax claim may be added here first. If a source page changes,
   the FAQ answer must change with it.
2. **Answer-first, first person.** Sentence one fully answers the question. Facts are stated,
   never attributed ("the pricing page says…" is a test failure).
3. **Not a CPA firm; we forward ITIN applications to a CAA — we are not one.** Enforced by
   `faq.test.ts` forbidden-phrase and CAA tests.
4. `id`s are anchors and appear in the Speakable selector — do not rename casually.
5. `learnMore.href` must resolve to a real route or a `LANDING_PAGES` slug (tested).
6. 25–110 words per answer; 35–55 items; ≥3 per category; 4–8 speakable.

## Deploy

DEPLOY_PLACEHOLDER

## Still open

**Owner decisions**

- **Signing copy contradiction across the site.** Homepage `page.tsx:444` says "sign in your
  browser — no printing, scanning, or uploading"; `landing-pages.ts:425` says pen/ink is
  safest and most customers print and sign on top of the embedded signature. The FAQ now
  states the reconciled truth (browser signature embedded in the printable PDF; print-and-
  upload as the wet-ink option). Decide which the marketing pages should say, then align them.
- **CP-15 scope across the site.** `form-5472-filing/page.tsx:71` and `contact/page.tsx:38`
  say "we can help" after a notice; `landing-pages.ts:644` says "Not currently… preventative
  DIIRSP only". The FAQ says both precisely (late filing yes, appeal no). Align the two pages.
- Google Search Console: request indexing of `/faq` (IndexNow covers Bing/Copilot/etc.).

**Follow-ups for an agent**

- The 95 blog-post FAQ sections were not inventoried; if `/faq` is ever expanded, start there.
- `statute-of-limitations` has a single-sentence source; its second sentence is a
  restatement. If a sourced consequence is ever published elsewhere on the site, use it.

## Lane notes

- Inventory: `general-purpose` (sonnet) — 310 rows, byte-verified verbatim. Clean.
- Build: `codex-implementer` — 51/51 found sources, zero omissions. **Defect:** citation
  discipline leaked into voice (~40% of answers said "the site says…"). Two further copy
  passes fixed it; the second was needed because my first regex was phrase-based, not
  semantic. Lesson: specify voice as a *rule* ("never attribute a fact to a page") with a
  broad test, not a phrase list.
- Audit: `fable-advisor` earned its cost — caught the CP-15 over-promise no lane and no test
  could have.
- `SendMessage` to a running lane is disabled in this session; corrections had to wait for
  the lane to return. Architect applied the 6 audit fixes directly (fewer steps than a lane).
- Grok lane not used: headless edits were permission-cancelled on 2026-08-16.
