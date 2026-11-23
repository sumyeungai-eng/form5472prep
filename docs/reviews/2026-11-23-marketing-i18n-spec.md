# Build spec: translated public pages (Phase 3d)

- **Plan:** `docs/reviews/2026-11-23-marketing-i18n-plan.md`, approved by the owner with all the recommended picks.
- **Architecture review:** a second-opinion review (2026-11-23). Its corrections are folded in below and marked **[R]**.
- **Worktree:** `~/Developer/f5472-wt/mkt-plan`, branch `feat/i18n-marketing`, based on origin/main `3c03ab5`.

**Baseline route table (before any change):** `/`, `/pricing`, `/services`, `/faq` and `/form-5472-penalty-calculator` are all `○`. `/` uses `revalidate = 600`.

## Objective
Serve these 5 public pages and the shared header and footer in Simplified Chinese (`/zh-hans/...`) and German (`/de/...`):

| English route | Translated routes |
|---|---|
| `/` | `/zh-hans`, `/de` |
| `/pricing` | `/zh-hans/pricing`, `/de/pricing` |
| `/services` | `/zh-hans/services`, `/de/services` |
| `/faq` | `/zh-hans/faq`, `/de/faq` |
| `/form-5472-penalty-calculator` | `/zh-hans/form-5472-penalty-calculator`, `/de/form-5472-penalty-calculator` |

Hard requirements:
- The pages stay statically prerendered.
- The **English HTML output is unchanged**.
- The translated pages stay `noindex`, with no hreflang and no sitemap entries, until the owner flips one constant.

## Steps (commit after each step that passes; message `feat(i18n-mkt): <step>`)

### Step 1: English baseline snapshots (before touching any page)
- **New test:** `src/app/(marketing)/english-baseline.test.tsx`. It renders each of the 5 English page components and the marketing layout chrome to static markup (`react-dom/server` `renderToStaticMarkup`; `await` async server components first).
  - Follow the existing pattern in `src/app/(marketing)/services/page.test.tsx` and `faq/faq-schema-pages.test.tsx`.
  - Mock `getConfirmedFilingsCount` (`src/lib/stats.ts`) to a fixed number.
  - Mock anything time-dependent so the output is deterministic.
- **Snapshots:** `toMatchFileSnapshot("__snapshots__/<page>.html")`. Also snapshot each page's exported `metadata` (or `generateMetadata()` result) as JSON.
- **Commit the snapshots.** From here on these files **must not change**. Every later step must keep this test passing with no snapshot update.
  - The only exception: if a later step must change English markup in a provably invisible way, stop and report instead of updating the snapshot.

### Step 2: infrastructure
- **`src/i18n/marketing/config.ts`** (pure, no React):
  - `MARKETING_LOCALES = ["zh-Hans", "de"] as const`, `type MarketingLocale`.
  - `MARKETING_PATH_PREFIX: Record<MarketingLocale, "/zh-hans" | "/de">`.
  - `export const MARKETING_LOCALES_INDEXABLE = false;`
  - `LOCALIZED_MARKETING_PATHS = ["/", "/pricing", "/services", "/faq", "/form-5472-penalty-calculator"] as const`.
  - `localizedPath(locale: MarketingLocale | "en", path: string): string`. For `"en"` it returns `path` unchanged. A path not in the list stays the English path. `/` plus `de` gives `/de`, not `/de/`.
  - `marketingLanguageAlternates(path): Record<string,string> | undefined`. It returns `undefined` while `MARKETING_LOCALES_INDEXABLE` is false. Otherwise it returns `{ en, "zh-Hans", de, "x-default" }` with absolute URLs from `SITE_URL`, and `x-default` is the English URL.
- **Catalogs:** `src/i18n/marketing/{en,zh-Hans,de}.json`. **[R]** They live outside `messages/`, so the 6-locale parity test and the no-tags rule in `messages.test.ts` do not apply.
  - Namespaces by page: `chrome`, `home`, `pricing`, `services`, `faq`, `penalty`, plus `shared`.
  - `src/i18n/marketing/index.ts` exports `getMarketingMessages(locale)` and `getMarketingTranslator(locale)`, which returns `createTranslator({ locale, messages })` **imported from `'next-intl'`**. **[R]** It is pure use-intl core, so it never runs `src/i18n/request.ts`.
  - **Never** call `getTranslations`, `getLocale`, `getMessages` or `useTranslations` from a server component on these pages. Never render `NextIntlClientProvider` from a server component.
- **`src/components/marketing/MarketingIntlProvider.tsx`** (`"use client"`). **[R]** It wraps `NextIntlClientProvider` with explicit `locale`, `messages`, `timeZone="UTC"` and `now` (a fixed `new Date(0)` is fine, since the calculator uses its own date logic), plus `onError={() => {}}`. Only client components that need `useTranslations` (the penalty calculator) sit under it. Model it on `src/components/wizard/WizardStaticProvider.tsx`.
- **Shared header and footer.** Extract the header, nav and footer JSX from `src/app/(marketing)/layout.tsx` into `src/components/marketing/MarketingChrome.tsx`.
  - Props: `locale: "en" | MarketingLocale` and `t` (a translator), or pre-resolved strings, whichever is simpler.
  - Links go through `localizedPath`.
  - `(marketing)/layout.tsx` renders `<MarketingChrome locale="en" …>` with the English catalog. The English output must stay byte-identical (Step 1 snapshot).
- **New route group:** `src/app/(marketing-intl)/de/layout.tsx` and `src/app/(marketing-intl)/zh-hans/layout.tsx`, two small layouts that share one component.
  - Each renders `<div lang="de|zh-Hans">` **around the chrome and the page**. **[R]**
  - Each renders `MarketingChrome` for its locale.
  - Each renders the "English is authoritative" note in the footer. Add a `chrome.englishAuthoritative` key; reuse the meaning of the portal footer note.
  - Each renders `MarketingLocaleCookie`.
- **`src/components/marketing/MarketingLocaleCookie.tsx`** (`"use client"`). On mount, **only if no `NEXT_LOCALE` cookie exists**, it sets `NEXT_LOCALE=<"de"|"zh-Hans">; path=/; max-age=31536000; SameSite=Lax`. **[R]** It never overwrites an existing cookie; that rule protects signed-in users' portal language.
- **`src/components/marketing/LanguageMenu.tsx`** links to the same page in English, 简体中文 and Deutsch, using `localizedPath`.
  - It always renders on translated pages.
  - On English pages it renders **only when `MARKETING_LOCALES_INDEXABLE` is true**, so English markup is unchanged now.
  - Use plain `<a>`/`Link` with `hrefLang` and `lang` attributes. It needs no client JS unless an existing pattern requires it.
- **`src/lib/seo.ts`:**
  - `PageMetaInput` gains optional `languages?: Record<string,string>`, merged **inside** the existing `alternates` object next to `canonical` and `types`. **[R]** Never spread `alternates` over it.
  - It also gains optional `robots?: Metadata["robots"]`, which is passed through.
  - `openGraph.locale` gains an optional input (`ogLocale`). English defaults stay unchanged.
  - Add unit tests to `src/lib/seo.test.ts`. The existing English output must not change when the new options are omitted.
- **`src/app/sitemap.ts`:** when `MARKETING_LOCALES_INDEXABLE` is true, add the 10 translated URLs and `alternates.languages` on those 5 English entries plus the translated ones. When it is false, output is unchanged. Add tests (mock the flag both ways) to `src/app/sitemap.test.ts`.
- **`src/app/robots.ts`:** **do not** disallow `/de` or `/zh-hans`. **[R]** Crawlers must be able to see the noindex.

### Step 3: string extraction (English unchanged)
- **Shared components.** Turn each of the 5 page bodies into a component that takes `{ locale, t }`.
  - Location: `src/components/marketing/pages/{HomePage,PricingPage,ServicesPage,FaqPage,PenaltyPage}.tsx`, or kept in the route file and exported, whichever is the smaller diff.
  - The English route files render them with the `en` catalog. The `(marketing-intl)/<locale>/…/page.tsx` files are thin wrappers that pass their locale.
- **`metadata` / `generateMetadata`:**
  - The title and description come from the catalog.
  - The canonical is the page's own localized URL.
  - `languages: marketingLanguageAlternates(path)` applies on English and translated pages alike; it is `undefined` while gated.
  - Translated pages also set `robots: MARKETING_LOCALES_INDEXABLE ? undefined : { index: false, follow: true }`.
  - `ogLocale` is `zh_CN` or `de_DE`.
- **[R] Revalidation:** every translated homepage file declares its own `export const revalidate = 600` literally. Next ignores a re-exported value.
- **Rich text:** inline links and bold use `t.rich` with tag names, or split keys. Internal links on translated pages go through `localizedPath`.
- **Facts come from code.** Catalogs **never** contain a price, a dollar amount or a turnaround number. Use placeholders filled from `src/lib/pricing.ts` (`TIERS`, `formatPrice`, `MULTI_YEAR_ADDON_CENTS` and the turnaround constants), for example `{standardPrice}`, `{expressPrice}`, `{standardDays}`, `{faxFee}`.
  - For the turnaround, add catalog keys whose text carries the number as a placeholder. Do not edit `pricing.ts`.
  - Penalty amounts in the calculator still come from `src/lib/tools/penalty/params.ts`.
- **FAQ:**
  - The English source stays `src/lib/faq.ts`. Do **not** move the English FAQ text into the catalog: `llms*.txt` and other pages read it.
  - Translations live in the catalog under `faq.items.<id>.{q,a}`, keyed by the existing FAQ ids, with category names under `faq.categories.<id>`.
  - Translated FAQ pages map `FAQ_ITEMS` to translated text by id.
  - The same applies to the `SERVICE_PAGES` titles and blurbs used on `/services` (keys by slug) and to the `TIERS` feature lists (keys by tier id and feature index, or by a stable key).
  - The English rendering keeps reading the original constants.
- **JSON-LD on translated pages:**
  - Use the translated visible text.
  - Add `inLanguage` (`"zh-Hans"`/`"de"`).
  - Reference the organization with the existing `ORG_REF`/`@id`; do not create a new Organization node.
  - FAQPage questions must equal the visible questions; extend the existing schema tests to the translated FAQ pages.
- **Penalty calculator:**
  - `src/components/tools/PenaltyCalculator.tsx` gets its UI strings from `useTranslations("penalty.calculator")` under `MarketingIntlProvider`.
  - The English page also wraps it in the provider with `en` messages, so English output stays identical.
  - Number and currency formatting follows the locale on translated pages and stays exactly as now on English.
  - `EmbedThisCalculator` is not shown on translated pages (it is an English embed).
- **Links:** CTA links to `/start` and `/file` stay as they are; the cookie from Step 2 handles the language.

### Step 4: translations and guards
- **Write the translations** to `zh-Hans.json` and `de.json` for every key in `en.json`.
  - Use natural, professional, plain language for small-business owners.
  - **Tax terms stay in English:** Form 5472, pro forma 1120, Form 7004, IRS, EIN, ITIN, PTIN, LLC. Add a short gloss in parentheses on first use per page when helpful.
- **Required wording (owner policy):**
  - The preparer is "a tax accountant who holds an IRS PTIN".
    - German: "eine Steuerfachkraft mit IRS-PTIN".
    - Chinese: "持有IRS PTIN的税务会计师".
  - Never use "Steuerberater", "expert-comptable", "注册会计师" or "註冊會計師".
  - Never claim licensed, certified, IRS-approved or IRS acceptance, and never claim the IRS "guarantees" anything.
  - **[R] Money-back guarantee:**
    - Chinese: "退款承诺" (never 保证 or 保證).
    - German: "Geld-zurück-Garantie" is allowed. Never use "garantiert".
  - Never say "filed in X days"; say "ready to sign" as the English does.
- **New test:** `src/i18n/marketing/marketing.test.ts`. It checks:
  - (a) `zh-Hans` and `de` have exactly the same key set as `en`, with the same ICU placeholder names (a unique set) and the same rich-tag names;
  - (b) no catalog value contains `$`, `USD` or a digit adjacent to `day`/`Tag`/`天`. Use placeholders; allow digits that are part of a form name, such as `5472`, `1120`, `7004`;
  - (c) these regexes find no match in zh-Hans or de: `/Steuerberater|expert-comptable|注册会计师|註冊會計師|保证|保證|garantiert|zugelassen|licensed|certified|IRS-approved/i`;
  - (d) `getMarketingTranslator(locale)` renders every key without throwing, given the placeholders from `pricing.ts`.

## Files you own (do not edit anything else)
- **Existing files:**
  - `src/app/(marketing)/layout.tsx`
  - `src/app/(marketing)/page.tsx`
  - `src/app/(marketing)/pricing/page.tsx`
  - `src/app/(marketing)/services/page.tsx`
  - `src/app/(marketing)/faq/page.tsx`
  - `src/app/(marketing)/form-5472-penalty-calculator/page.tsx`
  - the components those pages render that hold visible English text: `ComparisonTable`, `HowToSummary`, `FaxReceiptProof`, `src/components/tools/PenaltyCalculator.tsx`, plus `Reveal` only if needed
  - `src/lib/seo.ts`, `src/lib/seo.test.ts`
  - `src/app/sitemap.ts`, `src/app/sitemap.test.ts`
  - the existing page tests next to the 5 pages
- **New files:**
  - `src/app/(marketing-intl)/**`
  - `src/components/marketing/**`
  - `src/i18n/marketing/**`
  - `src/app/(marketing)/english-baseline.test.tsx` and `src/app/(marketing)/__snapshots__/**`
- **Report, don't edit:** if something else must change, stop and report it. Never touch `src/i18n/request.ts`, `messages/**`, `src/lib/faq.ts`, `src/lib/pricing.ts`, `src/lib/services-pages.ts` or `next.config.mjs`.

## Constraints
- **Use what the codebase already has:**
  - next-intl 3.26.5 (already installed); no new dependencies;
  - the existing Tailwind classes and components;
  - Prettier/ESLint as configured.
- **Server–client boundary:** server files never import non-component values from `"use client"` modules (`src/lib/clientBoundary.test.ts`).
- **Never block payment.** Missing or bad translations must fall back to English, never throw at render.
- **No new request-time reads** (`cookies()`, `headers()`, `searchParams`) on any of these pages.

## Verification (run all; quote the tail of each in the report)
```
npx vitest run src/app/\(marketing\) src/i18n src/lib/seo.test.ts src/app/sitemap.test.ts src/app/robots.test.ts src/lib/clientBoundary.test.ts src/lib/faq.test.ts src/lib/llms.test.ts
npx vitest run          # full suite; known local flakes: blog-price-tokens "renders…", generatePackage "F5 passes Wave 1"
npx tsc --noEmit
npx next lint
```
The orchestrator runs `next build` and checks that all 15 routes are `○`, or ISR for the 3 homepages.

## Report
Include:
- the commits (sha + subject);
- the files changed;
- the verification tails;
- whether the Step 1 snapshots were left untouched (`git log --follow` on them shows one commit);
- anything you had to stop and report.
