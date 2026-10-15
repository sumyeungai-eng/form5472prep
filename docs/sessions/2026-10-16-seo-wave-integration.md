# 2026-10-16 — SEO/AEO/GEO "do everything" wave (integration)

Owner: "yes do everything" (the code-side list). Lanes merged in `~/Developer/f5472-wt/int1016` → `main`:
- `seo/blog2-2026-10-16` — see `2026-10-16-blog-price-tokens-and-hubs.md` (price tokens `{{price.*}}` substituted in the blog loader, 543 prices in 129 posts, guard test; topic hubs paginated <100 links/page; revalidation paths fixed for the `(marketing)` route group; admin post route validates before rename).
- `seo/entity-2026-10-16` — see `2026-10-16-entity-trust.md` (Organization logo PNG ImageObject `public/logo-mark-512.png`; `AREA_SERVED` Worldwide; unverified `legalName` removed; /about rebuilt from repo facts; `/llms-services.txt` split — llms-full 453→340 KB, 400 KB budget test; Edetax re-check pending).
- `seo/perf2-2026-10-16` — see `2026-10-16-perf2-marketing-js.md` (~12 KB gz less pre-paint JS: server-rendered header auth buttons, lazy chat panel, inline Google Ads bootstrap; LCP medians improved on 4 pages, still ~3.0 s).
- Integration: `AREA_SERVED` on home/EIN/ITIN/partners Service nodes; sitemap /about lastmod; two loader-heavy tests given 30 s timeouts (they timed out at 5 s under the full parallel suite — CI runs the full suite).

## Verified
tsc clean; full `src/lib` + `src/app` vitest 3,267/3,269 with the 2 timeouts then fixed (file 225/225); `next build` exit 0; Codex read-only review (default model, low effort): only finding = inline Google Ads bootstrap may inject gtag.js before hydration (still gated by load + FCP + idle) — accepted: the site sets no Google consent-mode state anywhere, so no consent behaviour changed.

## Google Search Console (Chrome authuser 2)
`/form-5472-instructions` and `/clemta-form-5472` now indexed with self-canonical (fixed after the 10-15 re-index request). The other 9 URLs that had Google-selected canonical `https://www.747live.bet/` were re-requested 2026-10-16 — results in `docs/seo/gsc-reindex-2026-10-16.md`.

## Open — owner decisions
Named reviewer + credentials (E-E-A-T); registered legal name + LinkedIn/X/Crunchbase for `ORG_SAME_AS`; consent gate for the Google Ads tag (banner covers Meta only); home claims "Trusted by founders in 40+ countries" and "we handle the response with the IRS at no charge"; money-back guarantee vs Terms §6; disavow the PBN spam domains; 301 hire-someone → filing-service page; translations; YouTube.
## Open — follow-ups
Edetax price re-check after the 16 Oct rise; fonts preload (~128 KB) as the next LCP lever; Moz re-read after 18 Oct crawl / 19 Oct AI run; GSC canonicals for the 9 URLs; refresh Form 5472 pages when the IRS publishes tax-year-2026 instructions (~Dec 2026).
