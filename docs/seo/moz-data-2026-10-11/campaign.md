# Moz campaign re-read: Form5472 Prep (id 3235940, acct 25501479) - 2026-10-11
Extracted 2026-10-11 ~12:25-12:50 UTC (05:25-05:50 PDT) by a read-only browser session. Nothing was added, removed, edited, exported or recrawled. Baseline = 2026-10-07 read (`../moz-1007/campaign.md`, `../moz-1007/rankings.tsv`).
Companion file: `rankings.tsv` (246 rows: keyword, label, branded_flag, monthly_volume, rank_now, rank_baseline, change, url_now, url_baseline, collection dates).

## 0. Data dates (READ THIS FIRST)
| Data set | Baseline (10-07 read) | Now (10-11 read) | New data? |
|---|---|---|---|
| Rank collection (Google en-US) | 2026-10-04 (UI "Oct 3", week Sep 27 - Oct 3) | STILL 2026-10-04 (UI "Oct 3"). Rankings API `dates.available_range` = 2026-10-04 to 2026-10-04 for You and all 3 competitors; `keyword_count_history` and `visibility_score_history` each have exactly one point. Dashboard still says "Next scheduled update: Oct 11, 2026 PST". | NO. The Oct 11 rank collection is not in yet as of 12:43 UTC (05:43 PDT). Every rank, ranking URL, visibility score and bucket count is byte-identical to the baseline (proof in 2a). |
| Site Crawl | Oct 5 (two crawls: 03:12 UTC = 252 pages / 66 issues; 03:18 UTC = 658 pages / 428 issues) | Oct 11, started 10:12:39 UTC, completed 10:20:24 UTC (3rd crawl, `crawlCount` 3). "Latest Crawl Oct 11 / Next Crawl Oct 18"; recrawls 9 of 10 left until 10/30 (unchanged: none used by this session). | YES - 404 pages, 169 issues (45 new, 1 fixed). |
| Page Optimization scores | "as of Oct 3" | Same 54 pairs, identical scores (hash match, section 5). Driven by the Oct 3/4 grading, not the new crawl. | NO |
| Moz Links index | Home page last_crawled 2026-09-20 | Home page last_crawled 2026-09-20 (same). Totals changed (monthly index refresh): DA/links numbers differ, see section 6. | PARTIAL (index counts moved, newest link first seen 2026-10-07) |
| Insights card | "week of October 4th": 66 issues, 252 pages, visibility 10.29%, 7 kw top-10 | IDENTICAL (still the first 252-page crawl card; it has not refreshed to the Oct 11 crawl). Only keyword opportunity still "form 5472 cpe course" (difficulty 16, CTR 94%, volume 0-0). | NO |

IMPORTANT consequence for the architect: the Oct 7/8 deploys (85 blog-to-guide links, footer Guides band, brand in home H1, upgraded guides, new pages) are visible in the Oct 11 crawl but NOT yet in any rank data. The first post-ship rank reading will be the Oct 11 collection (or later). Everything in section 2/3/5 below is therefore the SAME pre-ship snapshot as 10-07 (rank collection 2026-10-04). Re-run this read after the collection lands (check `delorean-api/rankings/prod.25501479.3235940/grouped-by/engine-variant/You/week` -> `dates.available_range.to`; it should read 2026-10-11).

## 1. Overview
### 1a. Dashboard (weekly) now vs baseline
| Metric | Baseline 10-07 | Now 10-11 | Delta |
|---|---|---|---|
| Search Visibility, you | 1.85% | 1.85% (1.8467, 2026-10-04) | 0 (same collection) |
| Search Visibility, Form5472.online | 1.67% | 1.67% (1.6696) | 0 |
| Search Visibility, doola | 0.33% | 0.33% (0.3341) | 0 |
| Search Visibility, Firstbase | 0.31% | 0.31% (0.3096) | 0 |
| Keywords ranked #1-10 (you / F5472.online / doola / Firstbase) | 24 / 37 / 6 / 7 | 24 / 37 / 6 / 7 | 0 |
| Rank buckets (you), of 246 | 1-3: 14, 4-10: 10, 11-20: 16, 21-50: 0, 51+: 206 | 14 / 10 / 16 / 0 / 206 | 0 |
| Keyword movement | 0 up / 0 down (single collection) | 0 up / 0 down (still single collection; `original_rank` null for all rows) | - |
| Domain Authority (you) | 10 | 10 | 0 |
| DA competitors | F5472.online 17, doola 38, Firstbase 37 | F5472.online 16 (-1), doola 39 (+1), Firstbase 37 | small |
| External links (you) | 154 (+6 vs prev month) | 164 (+16 vs prev month) | +10 vs baseline |
| External links competitors | F5472.online 474, doola 32k, Firstbase 74k | F5472.online 490 (+26), doola 34k (+4k), Firstbase 74k (+224) | - |
| Top National Keywords (all #1) | preparation service; etsy sellers; fax filing service; penalty calculator; preparer | same 5 | 0 |
- Engines: still only "Google en-US" (national, desktop). Competitors (3): Form5472.online, doola, Firstbase. GA not connected. Page Optimization tracked pages: none. Performance Metrics: not set up.
- Next scheduled update: Oct 11, 2026 PST (rank). Next crawl Oct 18 (nextCrawl 2026-10-18T10:11Z).
### 1b. Insights / alerts
Unchanged from baseline (see section 0): rankings summary "week of October 4th, 2026"; "66 new issue(s) found" (the first 252-page crawl: URL Too Long 47, Meta Noindex 16, Temporary Redirect 2); no new alerts. The Insights card still quotes visibility 10.29% / 7 keywords (does not match Rankings/Dashboard 1.85% / 24; known quirk).

## 2. Rankings (246 keywords; table in `rankings.tsv`)
### 2a. Proof that nothing moved
Computed in-page from the live rankings API on 2026-10-11 12:28 UTC: SHA-256 over the 246 sorted lines `keyword<TAB>rank<TAB>ranking-path` equals the SHA-256 of the same lines built from the 10-07 `rankings.tsv` (79aff051fa54...45c3). Label hash also identical (9a5e7f543ec1; 246 keywords x 1 label each, all added_at 2026-10-05, all state "current"). Same check repeated for the three competitors (see 3). So in `rankings.tsv` rank_now = rank_baseline and url_now = url_baseline for all 246 rows; `change` = 0 (no new collection).
### 2b. Delta summary
- Biggest gains / losses: none (no new collection). Newly in top 50 / top 10: none. Ranking-URL changes (old -> new): none.
- Standing picture (Oct 4 collection, unchanged): 40 of 246 keywords rank in the top 20 (14 in 1-3, 10 in 4-10, 16 in 11-20); nothing ranks 21-50; 206 are not in the top 50. 29 distinct URLs carry those 40 rankings; most-used: /services/late-form-5472-filing-service (5 keywords), /blog/form-5472-small-corporation-reasonable-cause (3), then 2 each for /services/pro-forma-1120-filing-service, /services/form-5472-filing-service, /services/foreign-owned-llc-tax-filing-service, /form-5472-late-filing-checker, /services/form-5472-fax-filing-service.
### 2c. Money terms - intended-page check (all from the pre-ship Oct 4 collection; still current)
Moz's rank column = our best URL; the Page Optimization pairs show every one of our URLs that appears for the keyword (54 pairs over 40 keywords), so both are given.
| Keyword | Rank now | Our ranking URL(s) now (rank) | Intended page | Intended page ranks? |
|---|---|---|---|---|
| form 5472 fax filing service | #1 | /services/late-form-5472-filing-service (#1); /services/form-5472-filing-for-dormant-llc (#7) | /services/form-5472-fax-filing-service | NO - absent from the top 50 for this keyword |
| form 5472 preparer | #1 | /services/pro-forma-1120-filing-service (#1) | /services/form-5472-preparer | NO - absent |
| form 5472 preparation service | #1 | /services/late-form-5472-filing-service (#1) | /services/form-5472-preparer | NO - absent |
| final form 5472 for dissolved llc | #6 | /faq (#6); /services/pro-forma-1120-filing-service (#13) | /services/final-form-5472-for-dissolved-llc | NO - absent (it ranks #8 for "form 5472 part v statement" and #4 for "form 5472 penalty calculator" instead) |
| compare form 5472 filing services | #51+ | none | /compare/form-5472-filing-services | NO - not ranking (Form5472.online #3) |
| form 5472 filing service | #4 | /services/form-5472-filing-service (#4) | same | yes |
| late form 5472 filing service | #11 | /services/late-form-5472-filing-service (#11) | same | yes |
| pro forma 1120 filing service | #1 | /services (#1); /services/form-5472-fax-filing-service (#8) | /services/pro-forma-1120-filing-service | NO - hub #1, fax page #8, pro-forma page absent |
| form 5472 penalty calculator | #1 | /services/late-form-5472-filing-service (#1); /services/final-form-5472-for-dissolved-llc (#4); /faq (#6) | /form-5472-penalty-calculator (tool) | NO - absent |
| form 5472 fax number | #18 | /services/form-5472-fax-filing-service (#18) | guide /form-5472-fax-number (retitled "Where to File Form 5472...") | NO - the service page ranks, the guide does not |
- Net: none of the 5 requested keyword-to-intended-page mappings hold (fax filing service, preparer, preparation service, dissolved-LLC final return, compare). Caveat: the Oct 4 collection predates the Oct 7/8 deploys, so this is the "before" picture.
- Keywords tracked for the new/upgraded guide pages are all #51+ in this (pre-ship) collection: form 5472 penalty, form 5472 instructions, how to file form 5472, do i need to file form 5472, form 5472 example, form 5472 for accountants, form 5472 for bookkeepers, hire someone to file form 5472, white label form 5472 filing, form 5472 filing for dormant llc, form 1120 disregarded entity. No tracked keyword currently lands on any of the new guide pages (/form-5472-example, /can-a-foreigner-own-a-us-llc, /what-is-a-disregarded-entity, /form-5472-instructions, /file-form-5472, /do-i-need-to-file-form-5472, /form-5472-penalty). "how to fax form 5472" #16 lands on /services/form-5472-fax-filing-service. (No keyword is tracked for "can a foreigner own a us llc" or "what is a disregarded entity".)

## 3. Competitors (Rankings > Competition; collection 2026-10-04 for all, unchanged; proven by hash 3334124b...6256 of the 85 rows where a competitor ranks top-50, identical to the 10-07 table)
| | Visibility | top 3 | top 10 | top 20 | Baseline |
|---|---|---|---|---|---|
| You | 1.85% | 14 | 24 | 40 | same |
| Form5472.online | 1.67% | 12 | 37 | 69 | same |
| doola | 0.33% | 1 | 6 | 14 | same |
| Firstbase | 0.31% | 2 | 7 | 9 | same |
- 85 keywords have at least one competitor in the top 50; in 80 of them at least one competitor outranks us (Form5472.online 65, doola 12, Firstbase 9). We are #51+ on 69 of those 80; among those 85 rows we are at or ahead of every competitor on only 5.
- Top 20 where a competitor outranks us (strongest competitor rank first): diy form 5472 (us #2 / F5472.online #1); doola form 5472 (us - / doola #1, F5472.online #3); firstbase form 5472 (us - / F5472.online #1, Firstbase #4); form 5472 short tax year (- / F5472.online #1); offer form 5472 filing as a service (- / Firstbase #1); stripe atlas form 5472 (- / F5472.online #1); 1120 and 5472 filing service (us #3 / Firstbase #2); form 5472 formation costs (us #9 / F5472.online #2); late form 5472 filing service (us #11 / F5472.online #2); form 5472 deadline calculator (- / #2); form 5472 software (- / #2); compare form 5472 filing services (- / #3); form 5472 expert (- / #3); form 5472 address (- / F5472.online #12, Firstbase #4); form 5472 deadline (- / #4); form 5472 penalty letter (- / #4); form 5472 penalty waiver (- / #4); form 5472 uk residents (- / #4); file form 5472 online (- / #5); form 5472 first time abatement (- / #5). (Next five at #5: form 5472 for cpas, form 5472 penalty abatement, form 5472 saas founders, form 5472 uae resident us llc, multi member llc foreign owners 1065.)
- Competitor link/authority movement since baseline: see 1a and 6 (Form5472.online +26 external links, DA 17->16; doola +4k links, DA 38->39).

## 4. Site Crawl (Oct 11 crawl vs Oct 5 crawl)
- Crawl: started 2026-10-11 10:12:39 UTC, completed 10:20:24 UTC; seed form5472prep.com (domain crawl). Pages crawled 404 (Oct 5: 658; the earlier partial Oct 5 crawl: 252). Status: 402 x 200, 2 x 308 (the two apex URLs), 0 x 4xx/5xx. PA 14 on 402 pages, 28 on the 2 apex URLs. Depth: d0 1, d1 1, d2 1, d3 55, d4 269, d5 56, d6 21. Pages with 0 issues 235, 1 issue 167, 2 issues 2.
- Issues by category: Critical Crawler Issues 0 ; Crawler Warnings 114 (Oct 5: 378) ; Metadata Issues 52 (47) ; Redirect Issues 3 (3) ; Content Issues 0 (0). Total issues 169 (428); New issues 45; Fixed 1.
| Issue type | Oct 11 total | Oct 5 total | New | Fixed | Note |
|---|---|---|---|---|---|
| Meta Noindex | 114 | 378 | 40 | 1 | see 4a |
| URL Too Long | 52 | 47 | 5 | 0 | count went UP; 5 new URLs below |
| Temporary Redirect | 2 | 2 | 0 | 0 | the apex 308s (unchanged) |
| Redirect Chain | 1 (3 rows) | 1 | 0 | 0 | http apex -> https apex -> www (unchanged) |
| all other types (4xx, 5xx, missing/duplicate/long/short title, description, H1, canonical, duplicate content, thin content, slow page, redirect loop/refresh, nofollow, X-Robots) | 0 | 0 | - | - | no NEW issue TYPE appeared |
### 4a. Meta Noindex (114): why it fell from 378 - it is crawl COVERAGE, not a fix
- Composition now: 110 `/start?...` variants (70 existing + 40 NEW) + 4 other (/partner/sign-in, /sign-in, /ein/apply, /itin/apply; all existing). All deliberate noindex (robots "noindex, nofollow" in Moz's view, canonical -> /start). Zero /blog/topics/* noindex pages remain in the crawl (Oct 5: 268).
- FIXED (1): /blog/topics/penalty - live now `index, follow` (verified with curl 2026-10-11): it was promoted to an indexable topic hub, so it left the noindex list.
- The other 267 noindexed /blog/topics/<slug> pages are not "fixed": they are still live (curl 200, `noindex, follow`, e.g. /blog/topics/deadline, /blog/topics/diirsp, /blog/topics/late-filing) but were NOT reached by the Oct 11 crawl (blog /blog/topics* pages crawled: 13 vs 280 on Oct 5). Spot check: /blog/form-5472-etsy-print-on-demand-sellers and /blog/stripe-paypal-wise-form-5472 now link only to /blog/topics/foreign-owned-llc and /blog/topics/form-5472, and /blog and /blog/topics link only to the 12 indexable topic hubs, so the long-tail topic pages are now effectively orphaned in the link graph (inferred; only 2 posts + 2 index pages sampled). Crawl total therefore fell 658 -> 404 (-254 ~ -264 noindex pages + 7 new blog posts + 6 more /start variants).
- NEW /start variants (40): 13 new `src` values x 3 variants (base, tier=express, tier=standard) + 1 (/start?src=compare-prices) = 40, all noindex'd CTA URLs created by the new CTAs. Examples (10): /start?v=below&src=diirsp ; /start?v=below&src=diirsp&tier=express ; /start?v=below&src=file-form-5472 ; /start?v=below&src=clemta-form-5472 ; /start?v=below&src=form-5472-example ; /start?v=below&src=zenind-form-5472 ; /start?v=rail&src=doola-form-5472 ; /start?v=rail&src=firstbase-form-5472 ; /start?v=rail&src=form-1120-disregarded-entity ; /start?src=compare-prices. Referrers of the new ones: /diirsp, /file-form-5472, /compare/form-5472-filing-services, /clemta-form-5472, /form-5472-example, /zenind-form-5472, /doola-form-5472, /firstbase-form-5472, /form-1120-disregarded-entity, /form-5472-deadline, /foreign-owned-llc-tax, /form-1120-foreign-owned-llc, /delaware-llc-form-5472, /wyoming-llc-form-5472. (51 distinct `src` values now in total, plus 3 src-less /start tier variants.) Deliberate noindex (a /start?... URL per CTA placement); only a count increase.
### 4b. URL Too Long (52, was 47): 5 NEW, all /blog/ posts (lengths 76-83 chars, referring URL /blog; threshold 75)
1. /blog/foreign-owned-llc-hiring-us-employees-contractors (83)
2. /blog/foreign-owned-llc-irs-records-request-6038a-3 (79)
3. /blog/form-5472-app-developers-app-store-google-play (80)
4. /blog/reinstate-dissolved-llc-catch-up-form-5472 (76)
5. /blog/single-member-to-multi-member-llc-what-changes (80)
All 52 are /blog/<long-slug> posts (deliberate; no non-blog URL is too long).
### 4c. Redirects (unchanged)
Temporary Redirect 2: http://form5472prep.com (308) and https://form5472prep.com/ (308). Redirect Chain 1: http://form5472prep.com -> https://form5472prep.com/ -> https://www.form5472prep.com/ (3 rows incl. final 200). No new redirect issues, no redirect to 4xx.
### 4d. Inventory of the Oct 11 crawl (404 pages) vs Oct 5 (658)
- /blog/topics*: 13 (280); /blog/<post>: 187 (180; +7 new posts); /blog index 1; /start?...: 111 (105); /services/*: 12 (12); compliance-calendar?state=XX 10 (10); llc-annual-fees-by-state?state=XX 10 (10); top-level and other: 60 (about 71 before; the missing ones are the long-tail topic pages' neighbours - not itemised, the Oct 5 URL list was not saved).
- Key pages now in the crawl with fresh titles (all 200, 0 issues, depth 3-4, referrer = home unless noted): /form-5472-penalty "Form 5472 $25,000 Penalty - How to Avoid or Reduce It" (3,396 words, 103 links); /form-5472-fax-number "Where to File Form 5472: Fax Number and Mailing Address" (2,756 words, 92 links); /file-form-5472 "How to File IRS Form 5472 (2026 Step-by-Step Guide)" (3,016); /do-i-need-to-file-form-5472 "Do I Need to File Form 5472? 2-Minute Checker" (1,600); /form-5472-instructions "Form 5472 Instructions (2026) - Plain-English Walkthrough" (3,143); /form-5472-example "Form 5472 Example: Completed Sample With Pro Forma 1120" (2,754; referrer /form-5472-instructions; depth 4); /compare/form-5472-filing-services "Form 5472 Filing Services Compared: 2026 Prices" (2,540; referrer /compare); /services/form-5472-for-accountants, /services/form-5472-for-bookkeepers, /services/hire-someone-to-file-form-5472, /services/white-label-form-5472-filing (all present, 1,119-1,526 words).
- NOT in the Oct 11 crawl: /can-a-foreigner-own-a-us-llc and /what-is-a-disregarded-entity. Both are live (curl 200, titles "Can a Foreigner Own a US LLC? Rules and Yearly Filings" and "What Is a Disregarded Entity? Definition and Form 5472") and both are in /sitemap.xml, but a spot check of 9 pages (/, /blog, /services, /faq, /form-5472-penalty, /do-i-need-to-file-form-5472, /pro-forma-1120, /form-1120-disregarded-entity, /compare) found no link to either. Moz (link-following crawler) therefore did not find them - either they shipped after 10:12 UTC or they are not internally linked yet.

## 5. Page Optimization (Discover tab; 54 pairs; tracked pages: none)
- Source: `delorean-api/on-page/prod.25501479.3235940/summary/google.en-US/week` (`pages_to_optimize`, 54 entries; notification "no_rankings_for_original_cycle"). SHA-256 over the 54 sorted lines `keyword<TAB>path<TAB>rank<TAB>score` = 89059128...289f, IDENTICAL to the 54 pairs parsed from the 10-07 report. Changed pairs: 0. New pairs: 0. All 54 have no on-page errors; none is tracked.
- The titles Moz holds for the 32 distinct pages in the pairs are unchanged from the 10-07 section 5c (they come from the Oct 3/4 grading); the retitled/upgraded guides are not in those 32 pairs because they have no rank in the top 50 yet. Re-grading will only appear after the next rank collection.

## 6. Links (campaign Links tab; Moz Links index)
### 6a. Overview now vs baseline (root domain form5472prep.com)
| Metric | Baseline 10-07 | Now 10-11 (change vs previous month as Moz shows) |
|---|---|---|
| Domain Authority | 10 | 10 |
| Spam Score | 16% | 16% |
| Total links | 5,978 (+4k) | 17,951 (+16k) |
| Internal followed links | 5,824 | 17,787 (+16k) - Moz index refresh picked up the site's internal link growth (blog topic pages, guides, footer); not attributable to the Oct 7/8 deploys alone (home page last_crawled still 2026-09-20) |
| External followed | 140 (+6) | 148 (+14) |
| External nofollowed | 14 | 16 (+2) |
| Total external (dashboard) | 154 | 164 (+16) |
| Total linking (root) domains | 61 | 62 (+1) |
| Followed linking domains | 54 | 55 (+1) |
| Competitors (DA, linking domains, external followed) | F5472.online 17 / 276 / 424 ; doola 38 / 4,607 / 19,827 ; Firstbase 37 / 1,889 / 70,553 | F5472.online 16 / 282 (+9) / 436 (+22) ; doola 39 / 4,557 / 22,270 (+4k) ; Firstbase 37 / 1,896 (+17) / 70,610 (+161) |
### 6b. Inbound links (164 rows = 82 distinct source URL+anchor pairs, each listed twice: direct + via redirect)
- 146 links (54 linking domains) are the "Premium PBN & Link Building" spam promo pattern: path `/all/1102/22.html` (106 rows on bare domain, 40 on the `www.` host variant) with the anchor "high quality dofollow backlinks da 50 pa 40 premium pbn network service form5472prep.com rank first page google fast seo link building buy backlinks online cheap". Baseline: 138 links / 53 domains. Linking-page DA mostly 40-63.
- 18 links (8 domains, same 8 as baseline) with the bare anchor "form5472prep.com": drjack.world/report/139402 (DA21, nofollow), quero.party/report/139402 (DA27, nofollow), atomizelink.icu/report/139401 (DA7, nofollow), 8coint.com list.php?part=2026/05/22/59 (DA5, spam 61%, nofollow), dailymusings.top /stats/139402 and NEW /stats/139401 (DA9, nofollow), optimizeflow.top/stats/139401 (DA11, nofollow), form5472.ai/providers (DA13, nofollow, a competitor directory), www.form5472.online/post/form-5472-filing-services-compared-... (DA16, FOLLOW, the competitor's comparison post). Baseline: 16 links / 8 domains.
- All links point at the home page (target form5472prep.com/, PA 28; 82 links per host variant). No deep-page links.
### 6c. New / lost since baseline (Discovered and Lost, range Aug 13 - Oct 11 2026)
- Linking domains: Total Discovered +58 (the window start moved from Aug 9 to Aug 13: +1 new domain, currentchron.com, and domains first found Aug 9-12 such as quero.party 08/11 left the window; not a loss), Total Lost -0, Net +58. Newest discovery: currentchron.com, first found 2026-10-04, DA58, spam 1% = PBN spam promo (/all/1102/22.html). Previous newest was texturometer.com 09/29.
- New LINKS (first seen 2026-09-30 to 2026-10-07; 9 sources, 18 rows): 8 PBN promo pages (currentchron.com NEW DOMAIN 10-04; new `www.` /all/1102/22.html pages on already-known domains: bestnz-poker-casinoslot.com 10-06, sahammurah.com 10-06, mymarketpost.com 10-05, kkinsider.com 10-02, mediaboooster.com 10-01, bestofthefirstcoast.com 10-01, cgpa2percentag.com 09-30) + 1 dailymusings.top /stats/139401 (10-07, auto-generated "Website Stats" nofollow page, spam network pattern).
- GENUINE new links: NONE. Every new link is either the PBN promo spam (146 of 164 total) or the auto-generated stats/report spam network (nofollow). The only editorial-looking link remains the competitor's own comparison post on form5472.online (followed, first seen 08-30) and the competitor directory form5472.ai (nofollow, 09-25).

## 7. Items not captured / caveats
- No new rank data exists, so no rank deltas, no movers, no first-time top-10/top-50 entries could be reported. Competitor rank deltas likewise zero.
- Oct 5 crawl URL lists were not saved in the baseline (only counts and samples), so a URL-by-URL inventory diff vs Oct 5 is not possible; the noindex diff in 4a relies on category counts and the live curl spot checks.
- The Rankings > Opportunities tab (Moz keyword suggestions) was not re-read (outside the requested list).
- Moz Insights card, Performance Metrics, Custom Reports and Traffic remain as in the baseline.
- Helper reads used Moz's own page API GETs (rankings grouped-by, competitors, crawl issues-v2/pages/historical-summary, on-page summary, listerine links); no writes. A localhost receiver was tried for file transfer and blocked by the browser, so nothing left the page.

## 8. Re-check log (rank collection arrival)
- 12:28 UTC: rankings API range 2026-10-04 only (You). 12:30: competitors same. 12:43: same. 12:46: same (You and Form5472.online both still 2026-10-04); crawl info lastCrawl 2026-10-11T10:20:24Z, nextCrawl 2026-10-18T10:11Z, crawlCount 3.
