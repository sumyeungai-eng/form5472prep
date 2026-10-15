# 2026-10-15 — Moz "drop" diagnosis + full SEO/AEO/GEO fix wave

Integration of lanes `seo/tech-2026-10-15`, `seo/svc-2026-10-15`, `seo/geo-2026-10-15` (worktrees `~/Developer/f5472-wt/{tech,svc,geo}`) in `~/Developer/f5472-wt/int1015` → `main`. Lane logs: `2026-10-15-moz-technical-fixes.md`, `2026-10-15-geo-brand-attribution.md`; service audit `docs/seo/service-pages-audit-2026-10-15.md`; price survey `docs/seo/form5472-price-survey-2026-10-15.md`.

## Diagnosis (data in this log; raw Moz/GSC extracts were in the session scratchpad)
- Moz visibility 1.85% (ranks 2026-10-04) → 0.47% (2026-10-11); top-3 14→5, top-10 24→15; 30 top-20 keywords dropped out, 22 new entered. Loss concentrated on `/services/*` (14→3 keywords); blog flat. Moz only sees ~top 20 now ("51+" = #21+).
- Google Search Console (ground truth): NO drop vs pre-Oct-4 — Oct 8–12 vs Sep 29–Oct 3 clicks 25 vs 13, impressions 2,220 vs 835, avg position 9.5 vs 13.2. Oct 5–8 spike then slide = 82% `/irs-yearly-average-exchange-rates`. Manual actions/security: none. Indexed 225→230.
- Google Sept 2026 spam update ran Sep 24–Oct 8 (phase 3 Oct 4–6). Form5472.online has the same 54-domain PBN spam links and ROSE (top-10 37→50) → link penalty unlikely. Brand query "form5472prep" #1→#8 is the open site-level signal.
- 11 URLs have Google-selected canonical `https://www.747live.bet/` with stored "user-declared canonical: None" (crawled ~Oct 6–9). Live Googlebot test is clean (our page, self-canonical). Ruled out: DNS (Vercel only), middleware, UA cloaking, Vercel firewall/attack mode (no config; project.security null). Root cause unknown → re-request indexing; watch.
- `/applications/ein/<id>` crawled by Googlebot Oct 13: auth-gated (requireUser + userId) → 307; no exposure.
- AI (Moz, Oct 12): ChatGPT 37.5% (lead), Google AI Mode 7.5%, Gemini 7.5% (last); 10 of 17 AIM/Gemini citations of our pages didn't name us.

## What shipped
- **Tech** (`679e199`, `09f8f37`): robots hides /sign-in, /partner/sign-in, /ein/apply, /itin/apply, /applications/ (+ test); `/blog` paginated 24/page (`/blog/page/[n]`, ISR 60 s, dynamicParams, `revalidateBlogIndex()` in cron + admin routes); nomad post links 149→100; post sidebar rendered once (desktop identical, mobile below article); 3 queued car posts renamed to ≤75-char URLs; `blog-slug-length.test.ts` for posts dated after 2026-10-15.
- **Services** (`4415585`): de-templated 12 service pages (shared text 14.2%→10.9%), page-specific openings + worked examples, brand once per capsule, keyword-ownership test, /services hub retitled, 24 money-anchor links from 17 posts.
- **GEO** (`fbdc26b`): brand-attributed capsules (statistics, compare, pricing, fax-number, reasonable-cause, penalty, deadline, FAQ); comparison page re-surveyed live 2026-10-15 (+Simple5472; Edetax $79.99 from 16 Oct); direct answers for the 9 prompts no engine named us on; llms comparison built from data.
- **Integration fixes**: extension post no longer says we file Form 7004; late-filing post no longer says "most owners qualify" (IRM 20.1.1.3.2.2.6); June-30 FY rule qualified to tax years beginning before 2026; final-year Form 5472 only if a reportable transaction occurred.
- Verified: 20 test files / 1,276 tests; tsc clean; `next build` exit 0; local route smoke (/blog, /blog/page/2, /8 = 200, /9 = 404, robots lines); desktop/mobile layout check; Codex read-only review (CLI updated to 0.162.1) — 2 medium findings fixed, 4 low (hard-coded prices in blog markdown) deferred.

## Contracts
- Blog index pages must be revalidated with `/blog` (use `revalidateBlogIndex()`).
- New posts: full URL ≤ 75 characters (test-enforced).
- Service pages: one primary keyword per page (test-enforced); ≤1 brand mention per capsule.

## Open
- Owner decisions: money-back guarantee "if we fail to submit" + "we handle the IRS response at no charge" still on several landing pages (Terms §6 mismatch); disavow of the PBN spam domains (now recommended as a precaution given the brand-query drop — needs owner go-ahead in Search Console); 301-merge hire-someone → filing-service page; sitewide nav anchor "Form 5472 filing services" → main page?; off-site work (directories, comparison outreach, profiles, YouTube).
- Follow-ups: GSC request indexing for the 9 remaining 747live-canonical URLs; hard-coded prices in blog markdown (needs a pricing token in the blog renderer); topic hubs with 200+ links; re-check Edetax price after 2026-10-16; Moz re-read after the Oct 18 crawl / Oct 19 AI run.
