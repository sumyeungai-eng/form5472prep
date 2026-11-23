# Plan: translated public pages (Phase 3d), 2026-11-23

The code was mapped at origin/main `02dd908` (a read-only sweep). **Status: PLAN.** Nothing gets built until the owner approves.

## Goal
Visitors from the largest non-English customer groups land on a homepage, pricing page and FAQ in their own language at their own web address, and Google can find and index those pages. The English pages must not lose rankings or speed.

**Not in scope:**
- the blog (100+ posts);
- the 15 `/services/[slug]` pages;
- the 49 `[seoSlug]` landing pages;
- llms*.txt;
- the admin side and IRS forms.

## Scope (v1)
| Page | English | Translated |
|---|---|---|
| Homepage | `/` | `/zh-hans`, `/de` |
| Pricing | `/pricing` | `/zh-hans/pricing`, `/de/pricing` |
| Services overview | `/services` | `/zh-hans/services`, `/de/services` |
| FAQ (all items) | `/faq` | `/zh-hans/faq`, `/de/faq` |
| Late-filing penalty calculator | `/form-5472-penalty-calculator` | `/zh-hans/…`, `/de/…` |
| Header, menu, footer | shared | translated |

Links on translated pages go to the translated version where one exists, and to the English page otherwise. The order form (`/start`, `/file`) is already translated.

## What the code allows (facts from the sweep)
1. **Folder conflicts.** `(marketing)/[seoSlug]` uses `dynamicParams=false`. Static folders `de/` and `zh-hans/` win over it, and no landing page has either slug.
2. **Static pages.** `src/i18n/request.ts` reads cookies and headers, so calling next-intl's request APIs (`getTranslations`, `getLocale`) on these pages would make them dynamic.
   - **Rule:** translated pages use next-intl's pure `createTranslator({ locale, messages })`, with the messages imported at build time.
   - The client calculator gets a `NextIntlClientProvider` with an explicit locale and messages.
   - Result: the pages stay ○ static, and the homepage keeps its current `revalidate = 600`.
3. **Shared header and footer.** `(marketing)/layout.tsx` has the header and footer inline, in English. A nested `de/layout.tsx` would add a second header. So:
   - the header and footer are pulled out into one `MarketingChrome` component that takes its text as props;
   - the translated routes live in their own route group, `src/app/(marketing-intl)/{de,zh-hans}/…`, with a layout that renders `MarketingChrome` in that language.
4. **`<html lang>`** is hard-coded `en` in the root layout. Changing it per page would mean splitting the root layout (multiple root layouts and full page reloads between groups).
   - **v1:** wrap the page in `<div lang="de">`. This is the same approach the order form uses, and Google relies on hreflang and the page content, not `<html lang>`.
5. **SEO plumbing.**
   - `pageMeta()` in `src/lib/seo.ts` has no `languages` option.
   - Nothing emits hreflang.
   - `sitemap.ts` has no `alternates`.
   - The OpenGraph locale is hard-coded `en_US`.
6. **Facts come from code.** Prices come from `TIERS` (`src/lib/pricing.ts`). The turnaround text (`"5-7 business days"`, `"under 3 days"`) is English in that file and needs translated versions.
7. **Sizes.**

   | Page | Lines | Strings |
   |---|---|---|
   | Homepage | 1,058 | >150 |
   | Pricing | 394 | — |
   | Services overview | 209 | — |
   | FAQ page | 200 | — |
   | FAQ data (`faq.ts`) | 615 | about 60 items |
   | Penalty calculator | 444 + 390 | page + calculator UI |

## How it works
- **One component, many languages.** Each target page becomes a component that takes `locale` and `t`.
  - The English route renders it with the English catalog, so there is no copy-pasted duplicate that drifts out of date.
  - The translated routes are thin wrappers.
  - New catalog namespace: `messages/{locale}/marketing.json`.
- **English must not change.** Capture the rendered HTML of the 5 English pages before the work. After extraction, the English output must be byte-identical (the same method used for the emails, which used 25 fixture hashes).
- **Hreflang, in both directions.**
  - `pageMeta` gains `languages`, which emits `alternates.languages` = { en, zh-Hans, de, x-default → English }.
  - Each English target page links to its translations, and each translation links back.
  - The sitemap lists the translated URLs with `alternates`.
  - OpenGraph locale: `zh_CN`, `de_DE`.
- **Structured data.** JSON-LD on translated pages uses the translated visible text (the FAQ schema must equal the visible questions, as the existing tests enforce) and adds `inLanguage`. The Organization is referenced by `@id`, so there is one company entity, not a copy per language.
- **No automatic redirect by browser language** (Google advises against it).
  - A language menu in the header links to the equivalent page.
  - Optional: a small dismissible banner, "Diese Seite gibt es auf Deutsch", shown client-side from `navigator.language`. It does not affect static rendering.
- **The order form follows the visitor's language.** Visiting `/de/*` sets the `NEXT_LOCALE` cookie client-side, so "Start" opens the German order form even when the browser is in English. The portal and emails then follow `User.locale` as they do today.
- **Indexing gate.** One constant, `MARKETING_LOCALES_INDEXABLE`.
  - While it is false, translated pages are `noindex`, left out of the sitemap and hreflang, and reachable only by direct link, for the native-speaker review.
  - The owner flips it after review.

## Wording guards (tests)
- **Extend the forbidden-terms test to `marketing.json`.** It covers:
  - `Steuerberater`, `zugelassen`, `garantiert`;
  - `注册会计师`, `註冊會計師`, `保证`, `保證`;
  - English `licensed`, `certified`, `guaranteed`, `IRS-approved`.
- **No hard-coded prices or turnaround numbers in any catalog.** Use placeholders such as `{standardPrice}` and `{expressTurnaround}`, filled from `pricing.ts`, so a price change updates every language.
- **Key and placeholder parity:** the existing `messages.test.ts` already checks this.
- **Tax terms stay in English** (Form 5472, pro forma 1120, IRS, EIN, PTIN), with a short gloss on first use.
- The "English is authoritative" footer note appears on every translated page.

## Phases
| # | Work | Lane | Size |
|---|---|---|---|
| 0 | Baseline: snapshot the English HTML; record the build route table (○/●/ƒ) | Opus | ½ h |
| 1 | Infrastructure: `MarketingChrome` extraction, the `(marketing-intl)` group, `pageMeta` `languages`, the sitemap `alternates`, the indexing gate, the cookie-setter and the language menu | Codex | 1 day |
| 2 | String extraction for the 5 pages and the calculator, English unchanged (byte-identical check) | Codex | 2 days |
| 3 | zh-Hans and de translations of `marketing.json` and the wording-guard tests | Codex, plus an Opus tax-wording review | ½ day |
| 4 | Ship behind `noindex`; verify live (route table still ○/●, hreflang absent while gated, German/Chinese render, English unchanged) | Opus | ½ day |
| 5 | **Owner:** native-speaker review, then flip `MARKETING_LOCALES_INDEXABLE`; submit the sitemap in Search Console | Owner | — |
| 6 | After 4–6 weeks: compare Search Console impressions and clicks for `/de/*` and `/zh-hans/*` and decide on more pages or languages | Opus + owner | — |

That is about 4–5 working days of build before the review gate. Every phase gets the full test suite, `next build`, a read-only Codex review, a CI and deploy check, and a session-log entry.

## Risks
- **English pages regress** in rankings or speed. Mitigated by the byte-identical English output, the route-table check and no request-time reads.
- **A translation over-promises.** Mitigated by the forbidden-terms test, prices from code and the noindex-until-reviewed gate.
- **Duplicate content.** Hreflang plus a self-canonical on each language tells Google these are translations, not copies.
- **Translations go stale when the English copy changes.** Catalog parity fails the build when a key is added in English only. Changed wording under an existing key is not caught, so add a review note to the session log whenever marketing copy changes.

## Owner decisions
- **D1, languages.** Simplified Chinese and German **(recommended)**, or also add Traditional Chinese for Hong Kong and Taiwan. That would be one extra catalog; the routes are thin wrappers, so the cost is mostly translation and review. From the paid orders, China and Hong Kong (10) are the largest group and Germany (3) ties with Italy, Serbia, France and the UK.
- **D2, pages.** The 5 above **(recommended)**, or a different set chosen by traffic. Owner check: Search Console → Pages and Countries (Chrome profile with access; this session's Chrome profile has none).
- **D3, launch.** `noindex` until native-speaker review **(recommended)**, or index immediately.
- **D4, address style.** `/zh-hans/…` and `/de/…` **(recommended; they match the hreflang codes)**, or `/zh/…`.
