# 2026-09-07 — "We lost all organic orders" — investigation (in progress)

Owner report: organic orders have stopped. Question: did the last 7 days of SEO/AEO/GEO
work cause it? This file records what was checked, with evidence, so no session re-derives it.

## Everything that shipped 2026-08-30 → 2026-09-07 (marketing site only; `hktax/` is build-excluded)

| Date | Change | Could it stop organic orders? |
|---|---|---|
| 09-02 | EIN/ITIN payment-at-submission, DOB, 7-question form | No — EIN/ITIN funnel only |
| 09-04 | Blog: 15 EIN/ITIN guides; EIN/ITIN attribution | No — additive; blog is not indexed by Google anyway |
| 09-04/05 | **Production overwritten by `vercel --prod`** — tool/provider pages 404 ~8 min; EIN/ITIN checkout 404 intermittently | Short windows; not a week-long effect |
| 09-05 | IndexNow + 5 audit reports | No — additive |
| 09-05 | SEO waves 1+2: /pricing links in 15 guides, FAQ on 10 guides, `updated:` on 28 landing pages, homepage tools block, 6 blog titles shortened | **No title/description/H1/canonical/noindex change on any money page** (verified via `git show 52e9598`); the 6 titles are blog posts that Google does not index |
| 09-06 | Fax confirmation email; reminder cron 28 Jan → 5 Jan | No |
| 09-06 | Draft supersede-on-payment + backfill | Touches DRAFT rows only (`WHERE d.status='DRAFT'`); PAID rows unaffected. Admin default view now hides superseded drafts |
| 09-06 | `/faq` page + footer/homepage links | No — additive |

## Live crawlability — checked 2026-09-07

- `robots.txt`: Allow `/`, disallows only `/dashboard /filings /admin /api/`. Clean.
- Canonicals on `/`, `/pricing`, `/do-i-need-to-file-form-5472`, `/blog` → correct `www` URLs.
- `noindex`: only `/form-5472-filing` (the paid-ads LP) — intentional.
- `/start` 200; `/filings/new` → 307 to the wizard. Funnel entry works.
- `www` sitemap 200, 152 URLs; `robots.txt` points at it; IndexNow key 200; `llms.txt` 200.

## The decisive timeline fact

- `src/lib/env.ts:21` apex→www redirect landed **2026-05-22** (`4e29147`).
- GSC last read the (apex) sitemap **2026-05-22**. Same day.
- GSC baseline recorded 2026-09-05 (`docs/reviews/2026-09-05-indexation-check.md:60,121-125,136`):
  **5 pages indexed**, `/pricing` "unknown to Google", `site:` = 5 results,
  **28-day: 6 clicks / 71 impressions**, 16-month "full duration": **8 clicks total**,
  property data starts **2026-05-18**.

So on the `www` property Google has been tracking, organic search traffic has been ~zero
since before any of this week's work. The 5 Sep work was the first attempt to *fix* that;
two days is too early for Google to have re-indexed.

## What is NOT yet known (owner-provided)

1. Date of the last order attributed `google-organic` / `bing-organic` / AI referrer.
2. Whether TRAFFIC dropped (GSC clicks, GA sessions) or only ORDERS (conversion).
3. What "organic" means in the owner's count — Google only, or everything non-ads
   (direct, AI referrals, Bing). Perplexity cited the site in 5/6 test answers on 09-05.
4. Whether Google Ads is still running (promo ended 2026-08-19).
5. Whether an OLDER apex GSC property exists holding pre-May history.

## Side findings

- **AI-engine referrals are not classified as organic.** `src/lib/attribution.ts` maps Google/Bing
  hosts to `<engine>-organic` but has no entry for perplexity.ai, chatgpt.com/openai.com,
  copilot.microsoft.com, claude.ai or gemini.google.com — those orders land as "referral", or
  "direct" when the app strips the referrer. On 09-05 Perplexity cited the site in 5/6 test
  answers, so this is plausibly the site's largest organic channel and it is invisible in any
  count based on the "Google (organic)" label. Cheap to fix once the owner confirms what they
  are counting.
- **Partner supersede defect (fixed 09-07, commit `4b8dcf7`, deployed Ready; live three-check + `/faq` 200 after deploy; 185 tests).** `partner/filings/new/route.ts:24` stamps the
  PARTNER's browser `sessionId` on every client filing it creates, so the 09-06 session-match
  rule would have archived one client's blank draft when another client's filing was paid.
  `supersedeDraftsFor` now matches partner rows on `userId` only; two tests lock it in. No
  partner filings existed when the backfill ran, so nothing was archived wrongly.

- A probe `curl /filings/new` on 09-07 created one anonymous empty DRAFT in production. Noise.
