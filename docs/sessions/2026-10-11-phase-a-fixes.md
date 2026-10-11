# 2026-10-11 — Phase A of the Moz plan (links to new guides, IRS-accuracy fixes)

Implements `docs/seo/plan-2026-10-11-moz.md` Phase A (owner: "fix and improve everything").

## Ownership
Worktree `~/Developer/f5472-wt/phase-a` (own `npm ci`), branch `seo/phase-a-2026-10-11` → `main`.

## What shipped
- **A1 links** (`83929f6`): inbound in-body links `/can-a-foreigner-own-a-us-llc` 0→8, `/what-is-a-disregarded-entity` 1→11, `/form-5472-example` 3→10 + footer Guides link. Sources: what-is-form-5472, EIN-without-SSN, multi-member, bank-account, how-to-fill-out posts; foreign-owned-llc-tax, pro-forma-1120, form-1120-disregarded-entity, 1120-pro-forma-instructions guides; do-i-need page; pro forma 1120 service page.
- **A2 accuracy** (`83929f6`, `0c28fcd`): CP-15 → CP 215 in faq.ts, /contact, /form-5472-filing (IRM 20.1.9.5.2; FAQ id `cp15-notice` kept for links); invented timelines ("6–18 months", "Day 60–180", "Day 200–540", "no human review") rewritten to IRM 20.1.9.5.3–.4; removed "most catch-ups are accepted with no penalty"; pro forma 1120 fields (name/address/EIN/item E + "Foreign-owned U.S. DE"; 1m/1c are Form 5472 lines), zero-transaction rule (formation/funding = Part V), Form 5472 = 3 pages, "respond within 30 days" → notice date + §6038A(d)(2) 90-day rule, ink-signature-only claim neutralised — across guides and 8 posts.
- **Guard**: `src/lib/cp-notice-guard.test.ts` scans every `src/lib`, `src/app`, `content/blog` source (601 files) for CP-15/CP15 (widened after Codex review).
- Verified: targeted vitest (18 files, 624 tests) + guard 601/601; tsc + lint clean; `next build` exit 0; Codex read-only review — only finding (guard scope) fixed.
- **GSC** (Chrome authuser 2): indexing requested for /form-5472-instructions, /form-5472-reasonable-cause-statement, /form-5472-example, /can-a-foreigner-own-a-us-llc, /what-is-a-disregarded-entity; /form-5472-fax-number already crawled Oct 8; fax/preparer/dissolved service pages and /form-5472-penalty indexed. Pages report unchanged (225/137, data 10/4).

## Watch items
- GSC shows Google-selected canonical for `/form-5472-instructions` = `https://www.747live.bet/` (unrelated scraper/spam site) from a pre-Oct-7 crawl. Our page self-canonicals and is in the sitemap; page was rewritten 10-07 and re-requested 10-11. If still wrong after recrawl → owner files a Google spam/DMCA report.
- PageSpeed public API: daily project quota exhausted (429) on 10-07 and 10-11 — needs an owner API key or local Lighthouse.

## Open
- Phase B re-read on 2026-10-13 (Moz ranks Oct 11 run, AI Oct 12 run). Phase C owner items unchanged.

## Later the same day (owner asked about Moz crawl issues)
- **Crawl issues (169, Oct 11 crawl):** `robots.ts` now disallows `/start?` (the ~110 tracked `/start?src=…` noindex variants; `/start` itself stays crawlable) — `ccaa240`. Apex redirect switched 308 → **301** via Vercel API (Moz labels 308 "temporary"); the http→https hop is Vercel's own 308 and can't be changed. "URL too long" (52 blog slugs) deliberately left — never rename indexed slugs.
- **Speed:** local Lighthouse (PSI API quota exhausted) showed mobile LCP 5.4 s on `/` and 5.2 s on `/blog/what-is-form-5472` vs ~2.9 s elsewhere. Cause: `next/script lazyOnload` could inject the 170 KB Google Ads gtag.js before a slow first paint, so Lighthouse's simulation counted it as an LCP dependency. Fix (`27aa3cf`): `src/lib/analytics/googleAdsLoader.ts` injects gtag.js only after `load` + first-contentful-paint (6 s fallback); `dataLayer` queueing and the `/embed/*` config guard unchanged, so conversions still fire. Remaining ~3 s floor = shared framework JS (separate project).
- Contract: don't move the Google Ads tag back to `lazyOnload`/`afterInteractive` src loading without re-running Lighthouse.
