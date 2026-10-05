# 2026-10-05 — AEO structure pass (answer capsules, question H2s, Speakable, prices)

**Checkout/branch:** worktree `~/Developer/f5472-wt/aeo-structure`, branch `aeo-structure` (one commit on top of `58b8069`). Not pushed, not merged.
**Source of the work list:** `docs/seo/aeo-audit-2026-10-05.md` (the audit; left untracked in this checkout, it belongs to whoever commits the audit). This lane did the *structure* items. The sibling lane (`aeo-facts`, worktree `~/Developer/f5472-wt/aeo-facts`) owns the facts items.

## Ownership (this lane only)
| Files | Change |
|---|---|
| `src/lib/services-pages.ts` (+`.test.ts`) | P0-2 (address), P1-3, P1-4, P1-14 hub copy; new `servicesHubLastModified()` |
| `src/app/(marketing)/services/[slug]/page.tsx` | `data-speakable` on the intro, new `WebPage` JSON-LD node with Speakable |
| `src/app/(marketing)/services/page.tsx` | hub: question H2s, Speakable, dateModified, Organization `provider` |
| `src/app/(marketing)/faq/page.tsx` | P1-5 |
| `src/app/(marketing)/page.tsx` | P1-6, P1-7, Service-schema description (P2) |
| `src/app/(marketing)/pricing/page.tsx` | P1-8 |
| `src/app/(marketing)/press/page.tsx` | P1-9 |
| `src/app/(marketing)/compare/page.tsx` | P1-13 |
| `src/app/(marketing)/form-5472-statistics/page.tsx`, `src/lib/form5472-stats.ts` (+test) | P1-11 |

Not touched by this lane: `llms.ts`, `landing-pages.ts`, `layout.tsx`, `[seoSlug]/page.tsx`, `seo.ts`, `faq.ts` (the pricing FAQ text lives in `pricing/page.tsx`, not `faq.ts`).

## What shipped
- **Service pages (12 pages, 74 sections):** every section H2 is now a question ending in "?" (0/74 before) and every section opens with a standalone prose answer of 12-60 words (19/74 before). The colon lead-ins ("With white-label delivery on:" etc.) are gone. The keyword still appears in an H2 on every page.
- **P0-2:** the fax page mail address is now "Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201". Stop 6273 is gone from `/services/*`.
- **P1-4:** white-label, for-accountants (FAQ) and for-bookkeepers now state the Standard/Express prices and turnarounds (the partner pages keep `showOffer: false`, so no Offer markup).
- **Speakable:** `/services/*` (h1 + intro, 1 match each), services hub, `/pricing`, `/compare`, `/` (`["h1","[data-speakable]"]`, 3 matches: hero summary, "When is Form 5472 due?", "How does Form 5472 filing work?"), `/faq` (the 6 `#id` selectors now select the wrapper `<div>` holding the question and the answer), `/press` (schema only; the elements already existed).
- **Home:** new H2 "When is Form 5472 due?" with the audit's capsule; the 13-word "CPA or DIY?" capsule is now a priced capsule; Service schema description says done-for-you with accountant review.
- **Pricing:** first H2 "How much does Form 5472 filing cost?" with a priced capsule, Product `brand`/`manufacturer`/`seller` = Organization `@id`, the +add-on as a third Offer, `WebPage` node with dateModified and Speakable, visible "Last reviewed", Organization embedded, the fax FAQ now says "evidence of transmission, not IRS acceptance".
- **Press:** key facts state prices (from `pricing.ts`), EIN and ITIN prices, "Founded: 2025" (read from `organizationNode().foundingDate`); three H2s are questions.
- **Compare:** priced capsule under the H1, five FAQs with FAQPage markup (provider statements repeat only what the provider pages already say), dateModified, Organization embedded.
- **Statistics:** the five section openers are answers built only from facts already in `FORM5472_STATS`; the other four H2s are questions.
- **Tests added:** every service-page H2 and FAQ ends in "?"; every section opens with a 12-60 word standalone answer (not a list, no trailing colon, no pointer word); every page states both prices and turnarounds; the mail address is only the current one; the hub intro is a priced capsule of at most 60 words and the hub category H2s are questions; every stats category intro is a 12-60 word answer with a figure.

## Contracts a future editor must respect
- **Answer-capsule contract** (`services-pages.test.ts`): section H2 ends in "?", first block under it is prose, 12-60 words, not a list, not ending in ":", not starting "This/These/Here/Below". The word band (800-1,200; 400-700 for the four audience pages) still applies and the audience pages are now within about 10 words of the 700 cap.
- **One changed assertion:** `if (!page.showOffer) expect(prices).toEqual([])` was replaced by "every page states the Standard and Express prices". It encoded "partner pages quote no prices", which P1-4 reverses on purpose.
- Prices and turnarounds in this lane's files come from `pricing.ts`; do not type dollar figures.
- Speakable selectors must match real elements. `[data-speakable]` is set only on the answer paragraphs; the `/faq` ids sit on the wrapper `<div>`, not the `<dt>`.
- The home FAQ line about handling the IRS response (P0-6) and all money-back-guarantee wording were NOT touched (owner decisions).

## Open
**Owner-gated:** P0-5 (money-back guarantee vs Terms) and P0-6 (home FAQ "we handle the response") exactly as in the audit; P1-10 (entity details, sameAs, reviewer description).
**Follow-ups:**
- Service-page `lastModified` and `lastReviewed` were deliberately not bumped: `services-pages.test.ts` pins the sitemap dates. All 12 pages changed, so bump them (and update that test) in the next services pass.
- `/faq` H2s are category labels from `FAQ_CATEGORIES` in `faq.ts` (not in this lane); turning them into questions needs a `faq.ts` edit.
- CTA/boilerplate H2 demotion ("Ready to file?", "Frequently asked questions", etc.) is still open (P2).
- `/press` Speakable and the new press H2s were checked by `tsc` and the earlier build's DOM, not by a second build.

## Lane notes
- The scratchpad directory is shared between concurrent agents, so two builds that both wrote `build.log` interleaved their output. Use a lane-specific log name.
- `pkill -f "next build"` kills every lane's build. Kill by PID or directory instead.
