# 2026-10-16 — Marketing-page JS diet (perf2 lane)

Goal: cut the JavaScript every marketing page downloads and evaluates before
first paint (mobile Lighthouse LCP ~2.4–3.0 s, target < 2.5 s), with no visual,
copy, SEO, consent or behaviour change.

## Ownership

Checkout `~/Developer/f5472-wt/perf2`, branch `seo/perf2-2026-10-16` (node_modules
symlinked to `blog2`), from `a1db9ca`. Committed locally, **not pushed / not merged**.

| File | What |
|---|---|
| `src/app/(marketing)/layout.tsx` | Renders the 3 header `<Button>`s on the server and passes them into `HeaderAuthButtons` as props |
| `src/components/HeaderAuthButtons.tsx` | Takes `signInButton` / `startButton` / `dashboardButton` ReactNode props; no longer imports `Button` |
| `src/components/ChatWidget.tsx` | Launcher pill + all form state only; panel loaded with `import()` |
| `src/components/ChatWidgetPanel.tsx` (new) | The open panel (markup + submit), lazily loaded |
| `src/app/layout.tsx` | Google Ads bootstrap is a raw inline `<script id="google-ads-init">` instead of `next/script` |
| `src/lib/analytics/googleAdsLoader.inline.test.ts` (new) | Guard: bootstrap is safe inside a raw `<script>` |

Not touched (other lanes): `src/lib/seo.ts`, about page, blog files, `src/lib/llms.ts`,
`src/app/robots.ts`, `src/lib/analytics/googleAdsLoader.ts`, `src/components/MetaPixel.tsx`.

## Diagnosis (why JS sets the LCP floor)

- Lighthouse (Lantern) builds the LCP estimate from every non-image request that
  finished, and every script evaluated, before the *observed* LCP. On these pages
  the observed LCP equals first paint, and first paint happens only after all
  Next chunks have run and hydrated. So every byte of pre-paint JS (and its
  4x-throttled evaluation) is counted as an LCP dependency.
- On `/` the LCP element is the header "Start filing" button, because the hero
  `h1` starts at `opacity:0` (`animate-fade-in-up`) and is not an LCP candidate
  at first paint. LCP was 86% "render delay".
- Pre-paint JS per page (gzip): react-dom 52.4 KB + Next runtime 31.2 KB (fixed),
  then `9352` clsx + tailwind-merge 8.4 KB, `7663` next/link 8.5 KB, root layout
  6.1 KB (ChatWidget 1.9, SpeedInsights 1.5, Analytics 1.3, MetaPixel 1.2),
  `next/script` 2.7 KB, marketing layout 2.6 KB, next/image 5.6 KB on blog/services.
- tailwind-merge shipped only because the `HeaderAuthButtons` client island
  imported `Button` → `cn()`. `next/script` shipped only for the inline Google
  Ads bootstrap.

## What shipped

One commit on `seo/perf2-2026-10-16` (parent `a1db9ca`); see `git log -1` on the
branch. Not pushed, not merged, not deployed.

1. **Header buttons server-rendered.** `HeaderAuthButtons` takes the three
   `<Button>`s as props, so clsx + tailwind-merge + cva no longer reach the
   client on pages whose only `cn()` client user was the header (all four
   measured pages). Pages with their own client forms (e.g. `/start`) still
   ship it.
2. **Chat panel lazy.** `ChatWidget` keeps the SSR'd "Ask a question" pill
   (identical markup) and all form state. `ChatWidgetPanel` is fetched after
   `load` + idle, or on hover/focus/click. The pill stays until the panel is
   ready. If the fetch fails after a click, the visitor goes to `/contact`.
3. **`next/script` dropped from the root layout.** The Google Ads bootstrap
   (unchanged text) is a raw inline `<script id="google-ads-init">`.

Pre-paint JS (gzip, nomodule polyfills excluded; measured from the built HTML):

| Page | Before | After |
|---|---|---|
| `/` | 115.3 KB (11 scripts) | 103.1 KB (9) |
| `/blog/what-is-form-5472` | 119.4 KB | 107.2 KB |
| `/services/form-5472-filing-service` | 119.4 KB | 107.2 KB |
| `/pricing` | 114.5 KB | 102.3 KB |

Raw (parse/eval) bytes: 382 → 344 KB on `/`. Next's build table ("First Load
JS") does not count layout chunks, so it shows no change (97.6 / 102 / 97.3 KB).
The chat panel is a separate 1.7 KB-gzip chunk fetched after `load` + idle.

Lighthouse 12, mobile, simulated throttling, local `next start`. The baseline
build copy was served on :3322 and this build on :3321. Runs were interleaved
(order alternated each iteration), 7 pairs per page across two batches, with
caches warmed. Medians:

| Page | LCP before → after | Perf before → after | TBT before → after | CLS |
|---|---|---|---|---|
| `/` | 3.19 → **2.98 s** | 84 → 90 | 388 → 250 ms | 0 → 0 |
| `/blog/what-is-form-5472` | 3.33 → **3.09 s** | 84 → 90 | 176 → 139 ms | 0 → 0 |
| `/services/form-5472-filing-service` | 3.20 → **3.16 s** | 86 → 89 | 307 → 247 ms | 0 → 0 |
| `/pricing` | 3.11 → **2.98 s** | 92 → 93 | 144 → 149 ms | 0 → 0 |

Machine load from other sessions varied (`benchmarkIndex` 800–2500). The first
batch ran under load, the second near-quiet. In the quiet batch alone, LCP was
3.12 → 2.95 on `/`, 3.56 → 3.09 on blog, 3.13 → 3.16 on services and 3.12 → 2.98
on pricing. Max CLS across all 28 runs is 0. Still above the 2.5 s target: the
remaining floor is react-dom + the Next runtime + next/link (~92 KB gz), the
fonts and the HTML (see Open).

## Verification

- Visible markup is byte-identical before vs after on `/`, the blog post,
  the services page, `/pricing` and `/faq`, after stripping scripts and chunk
  hashes. JSON-LD blocks are identical (7/1/6/5/3).
- Browser (`next start`): the header "Start filing" link picks up `?src=`
  (`/start?src=perf-check`). There are no tailwind-merge or next/script chunks.
  The panel chunk is requested after `load`, and gtag.js is still injected
  after load + FCP (6 s fallback when hidden). Chat: opens; a typed message
  survives close/reopen. Submit (with `fetch` stubbed in the page, so no
  email was sent) posts the same payload and shows "Question sent!". Its
  Close resets name/message/status and keeps the email.
- On the final code: `npx tsc --noEmit` exit 0; `next lint` on all touched files
  clean; `npx vitest run src/lib/analytics src/components` 60 tests pass, 0 fail;
  `npm run build` exit 0.
- Codex read-only review: no regressions found in the diff. Should-fix applied:
  an explicit click whose panel-chunk fetch fails now falls back to `/contact`
  instead of a dead button. Its "blocker" is pre-existing and out of scope
  (see Open).

## Contracts a future editor must respect

- Do not import `@/components/ui/button` (or anything using `cn()` /
  tailwind-merge) into a client component that renders on every marketing
  page. Pass server-rendered elements in as props instead, as
  `HeaderAuthButtons` does.
- `ChatWidget.tsx` must keep only a **type** import from `ChatWidgetPanel`. A
  value import silently pulls the panel back into the pre-paint bundle.
- The Google Ads bootstrap is a raw inline `<script>`. Keep
  `googleAdsBootstrapScript()` free of `</script` and `<!--`
  (`googleAdsLoader.inline.test.ts`). Do not re-wrap it in `next/script`
  without measuring. The gtag.js gate (load + FCP + idle) stays as in the
  2026-10-11 contract.
- To measure pre-paint JS, count `<script src>` in the built HTML. The Next
  build table omits layout chunks.

## Open

Owner-gated:
- **Google Ads tag vs consent (pre-existing, not changed here).** gtag.js loads
  for every visitor after load + FCP. The consent banner (`MetaPixel`) gates
  only Meta. Whether Google Ads needs the same opt-in, for example for EU
  visitors, is an owner/legal decision.
- **Fonts are now the biggest controllable LCP input.** Five preloaded woff2
  files (~128 KB: Inter 48, Source Serif 50, Plex Mono 3×10) finish before
  first paint, so Lantern counts them. Options are fewer weights or no preload
  for mono/serif. Both are a visual-timing (FOUT) trade-off, and the gain is
  unmeasured.

Follow-ups:
- `@vercel/analytics` + `@vercel/speed-insights` (~2.8 KB gz) could mount after
  load + idle. Not done because it shifts analytics timing (fast bounces could
  drop pageviews).
- `next/image` ships 5.6 KB gz on blog/services. `getImageProps()` + `<img>` in
  the server component would remove it (blog files belong to another lane).
- lucide-react 1.x icons are client components. Their path data is serialised
  into every page's RSC payload, and each icon instance hydrates.

## Lane notes

- Local Lighthouse on a shared machine is unreliable while other sessions build.
  Load average reached 124 on 8 cores and `benchmarkIndex` halved. Check
  `uptime` before measuring, and compare interleaved A/B runs (baseline build
  copy on a second port) rather than sequential before/after runs.
