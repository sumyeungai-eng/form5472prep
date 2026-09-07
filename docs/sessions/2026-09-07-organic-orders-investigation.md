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

## Update 2026-09-07 — owner clarified: the lost channel is ChatGPT referral traffic

Checked (all from this machine, evidence in-line):

- **OpenAI's crawlers are not blocked.** `OAI-SearchBot`, `ChatGPT-User`, `GPTBot` (and `bingbot`)
  fetch `/`, `/pricing` and a blog post with HTTP 200, `server: Vercel`, no challenge or
  mitigation headers. Vercel deployment protection: SSO applies to `all_except_custom_domains`,
  so the public domain is open (curl 200 confirms).
- `robots.txt` AI-crawler allow rules date from `4a5dd1e` **2026-05-23**; unchanged since.
- **No blog, landing or marketing URL was deleted or renamed since 2026-08-30** — no cited link 404s.
- The 09-05 audit did NOT test ChatGPT (not logged in) — there is no citation baseline.
- **Bing Webmaster Tools was never set up** (`docs/reviews/2026-09-05-seo-aeo-geo-audit.md:172`).
  ChatGPT search draws on Bing's index; the site has no registration there and no way to see
  Bing coverage. IndexNow (live since 09-05) submits to Bing but does not replace BWT.
- **Bing indexation could NOT be verified from here.** DuckDuckGo and Bing RSS are bot-walled
  from the shell (IRS.gov also returned 0), and Bing in the in-app browser serves degraded,
  geo-mangled results even for `site:form5472.online`. Do not repeat these methods; use a
  normal browser session or BWT.
- **Industry-wide ChatGPT change in the second week of August 2026**: ChatGPT changed how it
  selects sources (fan-out via `site:` operators, fewer citations per answer; Reddit citations
  −86%, official/institutional sources absorbed the share). Separately, ChatGPT referral clicks
  per citation have been falling since mid-2025 ("cited, not clicked"). Sources: seroundtable,
  searchengineland, otterly.ai, seoclarity, dataconomy (2026-09-07 search).

Ranked hypotheses (pending the owner's GA drop date):

1. **Platform shift (~14 Aug 2026)** — ChatGPT re-weighted toward official/institutional
   sources; for tax queries that means IRS.gov. A small prep site loses citations without
   anything changing on the site. Fits "traffic gone" with no on-site cause found.
2. **Bing coverage** — if Bing dropped/never had the pages, ChatGPT search cannot cite them.
   Unverifiable until BWT exists.
3. **The 09-04/05 production overwrites** — pages 404'd for minutes while crawlers may have
   fetched them. Weak: short windows, and OpenAI recrawls.
4. Nothing shipped this week is a credible cause (table above).

Owner-gated next steps: (a) GA → Acquisition → referral `chatgpt.com` by week — the drop DATE
decides between 1 and 3; (b) create Bing Webmaster Tools, verify `www.form5472prep.com`,
submit the sitemap, read Coverage; (c) run 3 ChatGPT prompts and note whether the site is
cited at all today; (d) add AI-engine referrers to `attribution.ts` so this channel is
visible in the admin from now on.

## Shipped 2026-09-07 — AI-engine attribution + historical backfill

Commit `0ba1b9b`. `src/lib/attribution.ts` now classifies ChatGPT, Perplexity, Copilot,
Claude, Gemini, Grok, Meta AI and You.com — by referrer host (suffix-anchored, lookalike-safe)
or by `utm_source` token — as `<engine>-ai` / medium `ai`, labelled "ChatGPT (AI)" etc.
Precedence: paid click-ids → Microsoft Ads → Meta → **AI by utm** → generic utm → **AI by
referrer** (before the search-engine table, so `gemini.google.com` is not `google-organic`) →
search organic → referral → direct. 27 new tests (`src/lib/attribution.test.ts`).

Migration `20260907120000_ai_engine_attribution_backfill` re-classifies historical rows in
`Filing`, `EinApplication`, `ItinApplication` (24 statements). **Spec correction by the lane,
verified:** `attrReferrer` stores a bare host and `attrLanding` a pathname only, so the backfill
matches `attrReferrer ~* '(^|\.)chatgpt\.com$'` (when source is referral/direct/null) or
`lower(attrSource)` equal to a raw AI utm token — never a paid source. First execution is the
deploy (no local Postgres).

Accepted risks, recorded: (1) patterns assume `standard_conforming_strings=on` (PG default
since 9.1); (2) `utm_medium=cpc` with an AI `utm_source` lands as `<engine>-ai`, not paid —
paid click-ids still win; (3) rows whose ChatGPT visit left `referral` with a stripped referrer
cannot be recovered.

After deploy, `/admin/filings` and the applications list show the AI channel per order — this
is how the owner reads WHEN ChatGPT orders stopped.

Deploy evidence (`97f8902`): production build log —
`Applying migration 20260907120000_ai_engine_attribution_backfill` → `All migrations have been
successfully applied.` Live after deploy: ein/checkout 400, `/ein/apply` DOB marker 1, penalty
calculator 200, `/faq` 200.

## Bing Webmaster Tools — set up 2026-09-07 (owner-authorized, via owner's Chrome)

- Signed in with Google (`sumyeungai@gmail.com`, scopes: profile/email + `webmasters.readonly`).
- Imported ONLY `https://form5472prep.com/` from GSC (the MileMarketplace property was
  deliberately deselected — outside the authorization).
- **The imported property is the apex URL-prefix**, not `www`. Bing treats them as separate
  sites, and the apex 307s to `www`, so a `www` property must be added and verified separately
  (XML-file or meta-tag verification can be shipped in the repo without owner action).
- BWT shows "data processing, up to 48 hours". It also offers an **AI Performance** report
  (citations in Copilot / Bing AI answers) — the closest instrument we have to "is the site
  cited by AI engines", worth reading once data lands.

### Bing findings (URL Inspection, 2026-09-07)

- `https://form5472prep.com/` → **Indexed successfully. URL can appear on Bing. No SEO/GEO issues. 2 markup types found.**
- `https://form5472prep.com/pricing` → same.
- Adding `https://www.form5472prep.com` manually returned "Site is already added" — the apex
  property covers the `www` host in Bing's model; no separate property needed.
- Sitemap `https://www.form5472prep.com/sitemap.xml` submitted 9/7/2026, status Processing.

**Hypothesis 2 (Bing coverage) is refuted.** With OpenAI's crawlers unblocked, no URL removals,
and Bing indexing the site cleanly, the remaining explanation for the ChatGPT referral loss is
ChatGPT's own source-selection change (second week of August 2026) — nothing on the site.
Next instrument: BWT → AI Performance (citations in Copilot/Bing AI) once the 48-hour
processing completes; and the owner's GA `chatgpt.com` weekly trend for the drop date.
- `https://form5472prep.com/blog/what-is-form-5472` → **Indexed successfully**; one Bing notice:
  "Alt attribute for images is missing — 5 instances". Content pages are in Bing too.
  Follow-up for an agent: add alt text to blog images (Bing flags it as an SEO/GEO issue).
