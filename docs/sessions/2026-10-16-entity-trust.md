# 2026-10-16 — Entity/trust lane: Organization schema, About page, llms split, Edetax re-check

Lane log for the entity/trust pass. Why: Google treats tax content as YMYL, and AI
engines weigh "who is behind this". The brand query "form5472prep" fell from #1 to #8,
and Gemini and Google AI Mode rarely name us.

## Ownership

| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/entity` · `seo/entity-2026-10-16` | `src/lib/seo.ts` (+ `seo.test.ts`), new `public/logo-mark-512.png`, `src/app/(marketing)/about/**` (new `content.ts` + `content.test.ts`), `src/lib/llms.ts` (+ `llms.test.ts`), new `src/app/llms-services.txt/route.ts`, `src/lib/provider-prices.ts` (comment only), `docs/seo/form5472-price-survey-2026-10-15.md` (new section 7), this log |

This lane did not push. Merging to `main` is the orchestrator's call.

Untracked file left alone: `docs/seo/gsc-reindex-2026-10-16.md`. It was already in this worktree and was not written by this lane.

## What shipped (this commit)

1. **Organization logo is now a raster.** It was `logo-mark.svg`, which Google ignores. It is now an `ImageObject` pointing to `/logo-mark-512.png` (512x512 PNG on white, rendered from `logo-mark.svg` with sharp). The regeneration command is in `seo.ts` next to `ORG_LOGO_PATH`. The UI still uses the SVG.
2. **`areaServed` is now worldwide.** It was the United States; it is now `AREA_SERVED = { "@type": "Place", name: "Worldwide" }`, exported from `seo.ts`.
3. **`legalName` removed.** The value was the brand name, not a verified registered entity. The `TODO(owner-gated)` comment in `organizationNode()` explains why. `ORG_SAME_AS` is now a documented constant, so adding a LinkedIn, X or Crunchbase profile is a one-line change.
4. **`/about` rewritten as a trust page.**
   - Copy lives in `about/content.ts`:
     - a lead line and a key-facts list
     - 10 question-form H2 sections, each opening with an answer of 60 words or fewer
     - the 6-step filing flow
     - data protection, editorial sourcing, founding year (2025), contact, reviews and press
   - Every price is interpolated from `pricing.ts`; the old hard-coded "$149"/"$199" CTA is gone.
   - JSON-LD is now:
     - an `AboutPage` with `@id`, `dateModified` 2026-10-16, `about: ORG_REF`, the full Organization as `mainEntity`, and `speakable`
     - plus a separate `BreadcrumbList`
   - `content.test.ts` enforces:
     - question H2s and answers of 60 words or fewer
     - the trust line, verbatim
     - prices only from `pricing.ts`
     - no "licensed" or "IRS-approved", and "CPA" only in "not a CPA firm"
     - the IRS fax number labelled as the IRS's
5. **llms split.**
   - The 12 `/services/*` bodies and the 7 formation-provider landing pages (`PROVIDER_LANDING_SLUGS` in `llms.ts`) moved to a new `/llms-services.txt`, which `/llms.txt` and `/llms-full.txt` both link to.
   - Sizes (local build of the generators):

     | File | Before | After |
     |---|---|---|
     | `llms-full.txt` | 452,924 B | 339,905 B |
     | `llms-services.txt` | — | 116,927 B |
     | `llms.txt` | 55,569 B | 55,735 B |

   - Tests now apply the banned-phrase and money-back checks to all three files.
   - New size budgets: `llms-full` must stay under 400 KB, `llms-services` under the 460 KB fetcher limit.
   - Every indexable landing page must appear in exactly one of the two corpus files.
6. **Edetax re-check.**
   - At 2026-10-16 02:22 HKT (2026-10-15 18:22 UTC) `edetax.com/pricing` still showed $49.99 and the same banner. The rise was not live because it was still 15 October in the US.
   - Kept $79.99 "from 16 October 2026" with its dated note.
   - Recorded the re-check in survey section 7 and in a `provider-prices.ts` comment.

Verification:
- `npx vitest run` on seo, seo-title, llms, provider-prices, cp-notice-guard, services-pages and about/content: 7 files, all pass.
- `npx tsc --noEmit`: clean.
- `next lint --file` on the touched files: clean.
- Ran `next dev` on :3477 (started and stopped by this lane).
- Fetched `/` and `/about` from that server. All JSON-LD blocks parse, the Organization carries the ImageObject logo, Worldwide `areaServed` and no `legalName`, and `/about` shows the trust line, prices from code and `dateModified` 2026-10-16.
- `/logo-mark-512.png` returns 200 as image/png. `/llms-services.txt` returns 200 as text/plain with `x-robots-tag: noindex`.
- Codex ran a read-only review (default model, low effort) and made three findings. Two were fixed:
  - The signing step said "Only you sign", which the services copy contradicts. It now reads "you or another person authorized for the LLC signs it; our staff never sign for you", as in `services-pages.ts`.
  - The guarantee test was too loose. It is now tightened to allow only "do not guarantee".
  - The third finding was the Service-node `areaServed`, which is out of scope and listed under Open.

## Contracts for future editors

- Any Organization or Service node uses `AREA_SERVED` and the `ORG_LOGO_PATH` raster from `seo.ts`. Never put an SVG in `logo`.
- Add `legalName` only with the owner-supplied registered name. Add to `ORG_SAME_AS` only real profiles we control.
- `/about` copy goes in `about/content.ts` only. Use facts already on the site, keep the H2s as questions with answers of 60 words or fewer, and bump `ABOUT_LAST_REVIEWED` when the copy changes.
- llms files:
  - `llms-full.txt` is the core corpus, under 400 KB. When that budget trips, move another self-contained group out (as `llms-services.txt` did); do not raise the budget past 460 KB.
  - A new provider-customer landing page goes in `PROVIDER_LANDING_SLUGS`.

## Open

Owner-gated:
- The registered legal name, needed for `legalName`.
- LinkedIn, X and Crunchbase profile URLs for `ORG_SAME_AS`.

Follow-ups outside this lane's files:
- **Service nodes.** Four still say `areaServed: United States`: `src/app/(marketing)/page.tsx:945`, `ein/page.tsx:351`, `itin/page.tsx:356` and `partners/page.tsx:287`. Each is a one-line swap to `AREA_SERVED` from `@/lib/seo`. `services/[slug]/page.tsx` has a Service node with no `areaServed`.
- **Sitemap date.** `src/app/sitemap.ts:32` still dates `/about` 2026-09-21. It should be 2026-10-16 to match the page's `dateModified`.
- **Edetax.** Re-fetch `edetax.com/pricing` after 2026-10-16 08:00 UTC and record the post-rise price, including late years, in a new dated survey section.
- **Home-page claims.** The facts sweep flagged copy for the owner to confirm:
  - "Trusted by founders in 40+ countries" (home page, around line 300)
  - "we handle the response with the IRS at no charge" (around line 81), which conflicts with "we do not represent you before the IRS" in `llms.ts`
  - hard-coded EIN and ITIN prices (around lines 201 and 207)

## Lane notes

- Running Vitest through the rtk proxy suppresses `console.log`. For ad-hoc size measurements, write to a scratch file.
- The repo's TS target needs `Array.from()` around Set or `matchAll` iteration in tests.
