# 2026-10-30 — Guides / tools AEO structure (plan P0-2, P0-3, P1-3, P1-4, P1-5, P1-6)

Plan: `docs/seo/plan-2026-10-30-improvement.md`. Evidence: `docs/seo/moz-data-2026-10-30/page-audit/`
(`summary.md`, `pages.tsv`, `risky.tsv`). Not pushed; the orchestrator merges.

## Checkout / ownership

| Checkout | Branch | Owns |
|---|---|---|
| `~/Developer/f5472-wt/guidex` | `seo/guidex-2026-10-30` | `src/lib/landing-pages.ts` (+ `landing-pages`, `landing-body`, `landing-prices` tests), `src/app/(marketing)/[seoSlug]/**`, the tool routes (`llc-annual-fees-by-state`, `irs-yearly-average-exchange-rates`, `foreign-owned-llc-compliance-calendar`, `form-5472-reportable-transactions-checker`, `form-5472-late-filing-checker`, `form-5472-deadline-calculator`, `form-5472-penalty-calculator`, `do-i-need-to-file-form-5472`), `faq/**`, `about/**`, `form-5472-statistics/**`, `(marketing)/layout.tsx` (footer line only) |

Parallel lanes own services/ein/itin/7004/partners/pricing/compare pages, `services-pages.ts`,
`llms.ts` and all blog files — none were touched here.

## What shipped (one commit on this branch; see `git log -1`)

- **P0-2 FAQ schema = visible questions.** The 8 audit "mismatches" were all detection misses:
  tool FAQs put the question in a `<summary>` next to a `+`/`▾` glyph, so the text read as
  "Question?+". Every tool/statistics FAQ now wraps the question in an `<h3>` inside the
  `<summary>` and the glyph is `aria-hidden` (8 pages + do-i-need). In-scope mismatches fixed: 5
  (llc-annual-fees, exchange-rates, compliance-calendar, reportable-transactions, late-filing).
  `/about` gained FAQPage JSON-LD from its 14 visible question H2s. Landing-page JSON-LD now
  strips `[label](/path)` markdown so FAQ answers and HowTo steps carry the text a reader sees.
- **P0-3 "online filer"** — gone from all landing copy (3 strings; the `file-form-5472` intro was
  shown on ~20 pages via "Related guides" cards). New wording: questionnaire → Form5472 Prep
  prepares → a tax accountant who holds an IRS PTIN reviews → we fax. Rail CTA "We generate…"
  → "We prepare, a tax accountant reviews, you sign, we fax." Footer: "IRS fax +1-855-887-7737".
- **P1-3** deadline-calculator capsule 72 → 57 words; meta descriptions to 120–160 on
  `/do-i-need-to-file-form-5472` (176→149), `/form-5472-penalty` (176→154),
  `/form-5472-instructions` (161→153), `/file-form-5472` (dropped "File online"); `/about`
  title 19 → 57 chars (not ranking for its phrase). `/faq` kept `<dt>` questions (schema already
  1:1; now test-enforced).
- **P1-4 how-to pages.** `/file-form-5472`: 8-step section moved to the top with a lead linking
  the other two; step 8 adds the 300 DPI fax rule and the mail option. `/form-5472-instructions`:
  bullet TOC replaced by a 10-step "How do you fill out Form 5472 step by step?" at the top +
  HowTo JSON-LD. `/form-5472-example`: 10 steps using the sample's own entries at the top +
  HowTo. All three `updated: 2026-10-30`, cross-linked inline and via `relatedSlugs`. Every
  landing page now shows "Updated <date>" under the intro. Facts checked against irs.gov
  i5472 (Revised 12/2024, page reviewed 30-Apr-2026) and f5472 (Rev. December 2023). Fixed a
  contradiction: the instructions FAQ said write "NOT LEGALLY REQUIRED" for a missing FTIN; the
  instructions say "None" or "N/A".
- **P1-6 brand.** Landing mid-page CTA now reads "Form5472 Prep prepares every form…" (all 31
  landing pages); tool CTAs/usage text name Form5472 Prep (6 brand-absent tools); the
  instructions Part II and help FAQ name the questionnaire.
- **P1-5 alt text.** No `<img>` exists on guide/tool/home/about pages (only inline SVG with
  aria-label); nothing to change in this lane. Empty alts are blog-card thumbnails (blog lane).
- **Price guard gap.** `landing-prices.test.ts` ignored "$149," (comma lookahead), hiding 6
  literal prices; regex fixed and all 6 now come from pricing.ts.

Verified: targeted vitest (15 files, 1138 tests) incl. new
`src/app/(marketing)/[seoSlug]/page.test.tsx` (renders all landing pages) and
`src/app/(marketing)/faq/faq-schema-pages.test.tsx` (11 FAQ pages); `tsc --noEmit` clean;
`next lint --file` clean on every touched file. Rendered `/form-5472-instructions` inspected.

## Contracts for the next editor

- FAQPage JSON-LD must list only questions visible as `h2`/`h3`/`dt` on the page. Tool FAQ
  questions live in `<summary><h3>…</h3><span aria-hidden>…</span></summary>`; don't put the
  glyph back inside the question text. Enforced by `faq/faq-schema-pages.test.tsx` and
  `[seoSlug]/page.test.tsx`.
- Landing JSON-LD text goes through `plainText()` in `[seoSlug]/page.tsx`.
- HowTo is allow-listed in `landing-pages.test.ts`; steps must start with an
  `IMPERATIVE_VERBS` word, keep step leads before the colon ≤ 8 words, and end with a
  keep/receipt/confirm step. `file-form-5472#step-N` anchors still resolve.
- "Updated <date>" = `page.updated ?? CONTENT_LAST_REVIEWED` — bump `updated` on real content
  changes only.
- "online filer" is banned in landing copy (test). Never hard-code our prices, including
  before a comma.

## Open

Owner-gated:
- "Reasonable cause statement auto-generated" / "the wizard generates" phrasing (~20 places in
  `landing-pages.ts`) may no longer match generator 2.3.0 (RCS cause comes from the admin
  narrative). Needs a product decision before rewording; left as is.
- Money-back guarantee lines untouched (pending owner decision).

Follow-ups (other lanes):
- `/pricing` (schema 9 vs 7 visible), `/compare/form-5472-filing-services` (9 vs 8) and
  `/contact` (5 vs 1) FAQ mismatches — outside this lane; likely the same `<summary>`+glyph or
  hidden-question cause, worth checking.
- `pro-form-5472` (noindex) title 65 chars / description 162 — left.
- Blog/topic-hub items from the same audit (27 no-q-H2, 16 weak capsules, short topic metas,
  empty thumbnail alts) belong to the blog lane.

## Lane notes

- rtk truncates/garbles `vitest` and `grep` output; use `rtk proxy …` or write logs to the
  scratchpad. `next lint` via rtk printed "Errors: 1" while the raw run was clean.
- tsc target needs `Array.from(str.matchAll())`, not `[...str.matchAll()]`.
