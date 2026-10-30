# Moz campaign re-read: Form5472 Prep (id 3235940, acct 25501479) - 2026-10-30
Read-only extraction by a browser session using ONLY the built-in Claude browser pane (tab-1; it was already logged in to Moz - no sign-in performed, Chrome never used). GET requests only. Nothing was added, removed, edited, exported, tracked, recrawled or analysed-on-demand beyond the 76 page-grader report GETs that Page Optimization requires (same call the Analyze screen makes; none of the pairs was tracked). Baselines: `base/2026-10-26-*` (rank collections 10-04/11/18/25; crawl 10-25).
Companion files (this folder): `rankings.tsv` (246 rows x 4 collections + URLs; byte-identical to base because nothing new was collected), `competitors.tsv` (162 rows, identical to base), `crawl-issues.tsv` (63 rows: every issue incl. all 54 URL Too Long URLs, which the 10-26 read could not itemise), `page-optimization.tsv` (76 pairs; NEW columns: live 10-30 grade + live failing factors vs 10-26 baseline + change).

## 0. Bottom line (READ FIRST)
1. **There is NO new Moz data.** Latest rank collection is still 2026-10-25 (UI label "Oct 24") and the latest crawl is still 2026-10-25 10:13-10:19 UTC (crawlCount 6). Both next run on **Nov 1** (rank: "Next scheduled update: Nov 1, 2026 PST"; crawl: 2026-11-01 10:11 UTC). The 11-01 collection is not in (API `available_range` ends 2026-10-25; asking for 10-26..11-02 returns the empty 11-01 slot). So none of the post-10-26 site changes (paginated pages noindex + out of sitemap, form-w-7 canonical to itin, exact-anchor links, brand-fact capsules, RSC noindex, /form-7004-extension) can be seen in rankings, competitors or the crawl yet.
2. **Proof the data is unchanged** (SHA-256 of a canonical string, computed live in the page vs the same string rebuilt from the 10-26 base files): 246 keywords x ranks at all 4 collections + ranking URLs at all 4 collections = `3fe2b2db...572c` on both sides; label/branded/volume columns `6c9ce85f...e05b` both sides; competitors (162 rows x 3 sites x 4 collections) `acb1d90f...7861` both sides; crawl: same 59 issues (54 URL Too Long, 2 Duplicate Content groups, 1 Temp Redirect, 1 Redirect Chain, 1 Meta Noindex), same URLs; Insights card text identical and the 50-row Rankings > Opportunities tab shows the same keywords in the same order (compared by reading, not hashed); visibility per site per collection identical.
3. **What DID change (three things, all outside the rank/crawl cycle):**
   - **Page-grader (live fetch) now reflects the site changes.** 16 of the 76 page+keyword pairs gained a new failing factor `accessible_to_engines` ("Accessible to Engines"): exactly the 16 pairs whose page is a paginated blog/topic page (/blog/page/3, /4, /7; /blog/topics/foreign-owned-llc/page/2, /3, /5). Their live grade fell 71 -> 63 (one 79 -> 71). This is Moz independently confirming the noindex,follow on pages 2+ is live. Those same pages carry 9 of our tracked top-20 rankings at 10-25 (7 in the top 10, incl. vietnam #1, estonia #2, france #4, recordkeeping #4, indonesia #6, switzerland #6, spain #7): expect those to move once Google drops the pages and the dedicated posts must pick them up (see section 2e).
   - **One content improvement is visible**: /blog/form-5472-in-house-vs-outsourced-firm for "compare form 5472 filing services" (#6) went 71 -> 79 because "exact keyword in document" (D) now passes (inference: the new exact-anchor link/text edits; Moz does not say why). Every other page's title, meta-description length and failing factors are unchanged, including / (82), /pricing (71), /faq (71) - the brand-fact capsules did not move any Moz factor.
   - **Moz Links index refreshed** (monthly): DA 11 -> 12, linking domains 68 -> 76, external followed 182 -> 200, dashboard External Links 198 -> 216 (section 1c). Still 198 of 216 external links are the PBN-promo spam; zero editorial links.
4. Not obtainable / not done: any 11-01 data; effect of the new /form-7004-extension page (not crawled, no tracked keyword); on-page grading of the intended money pages (not in the 76-pair list; running the page-grader for them would be an extra on-demand analysis outside the brief - offered as an optional follow-up).

## 1. Data dates and overview
### 1a. Data dates
| Data set | Dates available | Next |
|---|---|---|
| Rank collection (Google en-US desktop, national, 246 keywords) | 2026-10-04, 10-11, 10-18, 10-25 (UI labels Oct 3, 10, 17, 24). `available_range` 2026-10-04..2026-10-25. **11-01 NOT in.** | Nov 1, 2026 PST |
| Site Crawl | 6 crawls: 10-05 x2 (252 pages/66 issues; 658/428), 10-11 (404/169), 10-16 (317/59), 10-18 (321/58), **10-25 (324/59) = latest** (10:13:36-10:19:20 UTC, success, seed form5472prep.com domain crawl) | 2026-11-01 10:11 UTC. Recrawls "7 of 10 available until 10/30"; API says account quota resets 2026-10-30T22:45:38Z. None used. |
| Page Optimization | Discover tab "Weekly (Oct 18 - 24, 2026), as of Oct 24": 76 pairs (unchanged); Track & Monitor empty. Live page-grader report fetched 2026-10-30 for all 76. | with next rank collection |
| Insights card | "week of October 25th, 2026" (unchanged) | weekly |
| Moz Links index | refreshed since 10-26 read (DA 11 -> 12) | monthly |
Reading rule unchanged: "51+" means "not in the top 20" (Moz shows nothing between #21 and #50).
### 1b. Visibility and bucket history (you) - identical to 10-26
| Collection | Visibility | #1-3 | #4-10 | #11-20 | #21+ (51+) | top-10 | top-20 |
|---|---|---|---|---|---|---|---|
| 2026-10-04 | 1.8467% | 14 | 10 | 16 | 206 | 24 | 40 |
| 2026-10-11 | 0.4730% | 5 | 10 | 17 | 214 | 15 | 32 |
| 2026-10-18 | 1.5524% | 10 | 33 | 34 | 169 | 43 | 77 |
| 2026-10-25 | 1.2316% | 9 | 24 | 29 | 184 | 33 | 62 |
- Trend: trough 10-11 -> best 10-18 (43 top-10 / 77 top-20) -> 10-25 gave back about a fifth (33 / 62). Net vs 10-04: top-10 +9, top-20 +22, top-3 -5, visibility -0.61 pt. Moz counters: Rankings page (10-04 -> 10-25) 48 up / 35 down; Insights (10-18 -> 10-25) 43 up / 47 down.
- Dashboard (10-25): Search Visibility You 1.23%, Form5472.online 1.28%, Firstbase 0.73%, doola 0.28%; Keywords ranked #1-10: You 33/246, Form5472.online 38, Firstbase 11, doola 7. Top National Keywords: form 5472 stripe paypal wise #1, form 5472 vietnam residents #1, form 5472 colombia residents #2, form 5472 estonia residents #2, form 5472 etsy sellers #2.
### 1c. Links (Moz index, refreshed since the 10-26 read; the UI shows an unsigned month-over-month change beside each figure, so only the 10-26 comparison is stated)
| Metric | You | Form5472.online | doola | Firstbase |
|---|---|---|---|---|
| Domain Authority | 12 (UI change 2; was 11 on 10-26) | 15 (UI change 2; was 15 on 10-26) | 38 (was 39) | 37 |
| Spam Score | 16% | 11% | 1% | 7% |
| Total links | 26,525 | 17,535 | 59,938 | 177,849 |
| External followed | 200 (UI change 66; was 182 on 10-26) | 516 | 28,922 | 71,189 |
| Internal followed | 26,309 | 16,954 | 18,671 | 100,729 |
| External nofollowed | 16 | 65 | 12,304 | 5,031 |
| Total linking domains | 76 (UI change 15; was 68 on 10-26) | 319 | 4,621 | 2,020 |
| Followed linking domains | 69 | 294 | 2,605 | 1,285 |
- Dashboard "External Links": You 216 (UI change 68 vs previous month; 198 on 10-26), Form5472.online 581, doola 41k, Firstbase 76k.
- Inbound-links snapshot (GET listerine `idina/links`, external, not deleted, 216 rows): **198 links from 68 domains carry the PBN-promo anchor** ("high quality dofollow backlinks da 50 pa 40 premium pbn network service form5472prep.com rank first page ... buy backlinks online cheap"), first seen 2026-08-12 .. 2026-10-27 (newest links arrived 10-27, so the spam keeps growing). The other 18 rows (8 domains) are report/stats/directory farms with nofollow (drjack.world, quero.party, atomizelink.icu, 8coint.com, dailymusings.top, optimizeflow.top, form5472.ai/providers) plus one **followed link from a competitor's comparison post**: www.form5472.online/post/form-5472-filing-services-compared-credentials-reviews-pricing-ev... (first seen 2026-08-30, DA 15). **No genuine editorial link exists.** Spam Score 16% unchanged. (Not itemised into a file; the list was only counted.)
### 1d. Insights / alerts (week of Oct 25) - identical to 10-26
- Summary card: 33 keywords #1-10, 43 moved up, 47 moved down (the "21%" visibility quirk is a Moz display bug). Biggest up: form 5472 portugal residents (+4 to #17), owner becomes us tax resident (+8 to #13), south korea residents (+8 to #13). Biggest down: form 5472 kdp authors (-20, 1 -> 21+), outsource form 5472 preparation (-20, 1 -> 21+), form 5472 deadline calculator (-18, 1 -> 19).
- Dropped from page 1: 24 keywords (list in the 10-26 base; includes form 5472 prep 5->17 on /form-5472-instructions, final form 5472 for dissolved llc 5->21+, late form 5472 filing service 9->17, form 5472 deadline calculator 1->19 on /services/late-form-5472-filing-service, white label form 5472 filing 2->21+, outsource form 5472 preparation 1->21+). Reached page 1: 14 keywords (compare form 5472 filing services 14->6, form 5472 preparer 14->4, form5472prep 21+->2, form 5472 reasonable cause statement 21+->6, form 5472 statistics 21+->7, form 5472 exchange rates 21+->6, philippines 18->2, estonia 18->2 ...). Top-3 now: 9 keywords.
- Crawl card: 324 pages, 1 new issue, 59 total. **Moz Recommends Fixing** (only place Moz flags priority): (1) URL Too Long - Metadata Issues - 54; (2) New: Duplicate Content - Content Issues - 2; (3) Temporary Redirect - Redirect Issues - 1. Not flagged: Redirect Chain (1), Meta Noindex (1).

## 2. Rankings (246 keywords; `rankings.tsv`)
Columns: keyword, label, branded_flag, monthly_volume, rank at 10-04/10-11/10-18/10-25, chg_vs_1011 / chg_vs_1018 / chg_vs_1004 (positive = improved; `enter` = entered top 20; `drop` = left top 20), ranking URL at 10-25/10-18/10-11/10-04. 10-04 ranks/URLs are byte-consistent with the 10-11 read (same 24/40 counts).
### 2a. Delta summary
- Top-20 set churn: 10-04 -> 10-25: 18 stayed, 22 lost, 44 new. 10-11 -> 10-25: 15 stayed, 17 lost, 47 new. 10-18 -> 10-25: 45 stayed, 32 lost, 17 new.
- **Newly top-10 vs 10-11 (27 keywords)**: compare form 5472 filing services (18->6), do i need an itin for form 5472 (51+->6), first year form 5472 (51+->7), form 5472 1099-k (51+->9), form 5472 amazon fba foreign sellers (51+->7), form 5472 colombia residents (51+->2), form 5472 estonia residents (51+->2), form 5472 etsy sellers (51+->2), form 5472 exchange rates (51+->6), form 5472 filing for dormant llc (51+->8), form 5472 france residents (15->4), form 5472 indonesia residents (51+->6), form 5472 nonresident spouse joint return (51+->3), form 5472 owner loans (51+->7), form 5472 penalty calculator (51+->7), form 5472 philippines residents (15->2), form 5472 preparation service (51+->10), form 5472 preparer (51+->4), form 5472 recordkeeping checklist (51+->4), form 5472 spain residents (51+->7), form 5472 stripe paypal wise (51+->1), form 5472 switzerland residents (51+->6), form 5472 thailand residents (51+->8), form 5472 vietnam residents (51+->1), form 5472 vs 1040-nr (51+->10), form 5472 youtube creators (51+->10), hire someone to file form 5472 (51+->7), llc paying personal expenses form 5472 (51+->3).
- vs 10-18: 14 keywords newly in the top 10, 24 fell out of the top 10, 17 newly in the top 20, 32 left the top 20.
- Biggest gains 10-18 -> 10-25 (both ranked): form 5472 philippines residents 18->2 (/do-i-need-to-file-form-5472), form 5472 estonia residents 18->2 (/blog/topics/foreign-owned-llc/page/3), form 5472 preparer 14->4, form 5472 france residents 14->4, do i need an itin for form 5472 16->6, form 5472 switzerland residents 15->6. Entered from nothing: form5472prep -> 2, form 5472 exchange rates -> 6, form 5472 reasonable cause statement -> 6.
- Biggest losses 10-18 -> 10-25: form 5472 deadline calculator 1->19, form 5472 prep 5->17, form 5472 reasonable estimates 4->15, late form 5472 filing service 9->17, form 5472 germany residents 4->11, form 5472 preparation service 3->10. Dropped out of top 20 from top-6: final form 5472 for dissolved llc (5), form 5472 crypto transfers (2), form 5472 digital nomads (3), form 5472 kdp authors (1), form 5472 new zealand residents (4), form 5472 nigeria residents (3), outsource form 5472 preparation (1), white label form 5472 filing (2).
- Top 3 now (9): #1 form 5472 stripe paypal wise -> /blog/stripe-paypal-wise-form-5472 (10-18: 9); #1 form 5472 vietnam residents -> /blog/page/7 (10-18: 6); #2 form 5472 colombia residents -> /blog/form-5472-colombia-residents-us-llc (10-18: 2); #2 form 5472 estonia residents -> /blog/topics/foreign-owned-llc/page/3 (10-18: 18); #2 form 5472 etsy sellers -> /blog/form-5472-etsy-print-on-demand-sellers (10-18: 1); #2 form 5472 philippines residents -> /do-i-need-to-file-form-5472 (10-18: 18); #2 form5472prep -> / (10-18: 51+); #3 form 5472 nonresident spouse joint return -> /blog/form-5472-nonresident-spouse-joint-return-election (10-18: 6); #3 llc paying personal expenses form 5472 -> /blog/form-5472-llc-pays-personal-expenses (10-18: 5).
- By label (top-10 / top-20 counts per collection):
| Label (keywords) | top-10 / top-20 at 10-04 | 10-11 | 10-18 | 10-25 |
|---|---|---|---|---|
| alternatives (4) | 0 / 0 | 0 / 1 | 0 / 1 | 1 / 1 |
| blog-5472 (46) | 11 / 14 | 3 / 9 | 12 / 19 | 9 / 19 |
| blog-audience (56) | 4 / 9 | 5 / 10 | 15 / 27 | 13 / 19 |
| blog-ein-itin (45) | 0 / 0 | 1 / 1 | 1 / 5 | 1 / 3 |
| branded (3) | 1 / 2 | 1 / 1 | 1 / 1 | 1 / 2 |
| guides (29) | 0 / 6 | 1 / 3 | 1 / 3 | 1 / 4 |
| head-terms (40) | 0 / 0 | 0 / 1 | 2 / 8 | 0 / 5 |
| services (16) | 7 / 8 | 2 / 4 | 8 / 10 | 4 / 5 |
| tools (7) | 1 / 1 | 2 / 2 | 3 / 3 | 3 / 4 |
### 2b. Which URLs carry the rankings (ranking-URL structure changed a lot)
- Distinct URLs ranking in the top 20: 29 (10-04) -> 41 (10-25) (48 on 10-18). Two generic pages carry the most keywords at 10-25: /do-i-need-to-file-form-5472 (8 keywords) and /irs-form-5472 (7), then /blog/page/7 (4), /blog/form-5472-deadline-tomorrow-urgent-filing (3), /blog/topics/foreign-owned-llc/page/3 (3).
- /services/* pages carry only 3 ranking keywords at 10-25 (final-form dissolved: "administratively dissolved llc form 5472" #12; dormant-LLC page: "form 5472 filing for dormant llc" #8; late-filing page: "form 5472 deadline calculator" #19) vs 14 keywords on 10-04. URL-type counts of the ranking URLs: 10-04 services 14 / blog posts 22 / other top-level 4; 10-18 services 2 / blog posts 38 / top-level 26 / topic hubs 6 / blog index pages 5; 10-25 services 3 / blog posts 24 / top-level 26 / topic hubs 4 / blog index pages 5.
- **Paginated blog / topic-hub pages now rank instead of the dedicated country/topic posts** (new since the 10-15 pagination ship): form 5472 vietnam residents #1 -> /blog/page/7 (the dedicated post /blog/form-5472-vietnam-residents-us-llc was #6 on 10-18), estonia residents #2 -> /blog/topics/foreign-owned-llc/page/3, france residents #4 -> /blog/page/7, indonesia residents #6 -> /blog/page/3, spain residents #7 -> /blog/page/7, switzerland residents #6 -> /blog/topics/foreign-owned-llc/page/2, recordkeeping checklist #4 -> /blog/page/7 (dedicated post was #9 on 10-18), germany residents #11 and owner-becomes-us-tax-resident #13 -> /blog/topics/foreign-owned-llc/page/3. These pages have Moz score 71 (79 for one) (title "Blog - page N" / "Foreign-owned LLC guides - page N") and are the same pages Moz now flags as Duplicate Content (/blog/page/3, /blog/topics/form-5472/page/3).
### 2c. Money terms - intended-page check (10-25 collection; earlier ranks in brackets)
| Keyword | Rank 10-04 / 10-11 / 10-18 / 10-25 | Ranking URL at 10-25 | Intended page | Intended page ranks? |
|---|---|---|---|---|
| form 5472 filing service | 4 / 51+ / 51+ / 51+ | none | /services/form-5472-filing-service | NO (was #4 on 10-04; absent since) |
| form 5472 fax filing service | 1 / 51+ / 51+ / 51+ | none (10-04: /services/late-form-5472-filing-service #1) | /services/form-5472-fax-filing-service | NO, not at any collection |
| form 5472 preparer | 1 / 51+ / 14 / 4 | /do-i-need-to-file-form-5472 (#4; 10-18 /form-5472-instructions #14) | /services/form-5472-preparer | NO - generic checker page ranks |
| form 5472 preparation service | 1 / 51+ / 3 / 10 | /pricing (#10; 10-18 / (home) #3) | /services/form-5472-preparer | NO |
| final form 5472 for dissolved llc | 6 / 51+ / 5 / 51+ | none (10-18: the intended /services/final-form-5472-for-dissolved-llc was #5) | /services/final-form-5472-for-dissolved-llc | was yes on 10-18 only; gone 10-25 |
| compare form 5472 filing services | 51+ / 18 / 14 / 6 | /blog/form-5472-in-house-vs-outsourced-firm (#6; 10-18 /blog/form-5472-diy-vs-preparer #14) | /compare/form-5472-filing-services | NO - never ranked (competitors at 10-25: Form5472.online #7; Firstbase was #4 on 10-18) |
| late form 5472 filing service | 11 / 17 / 9 / 17 | /blog/form-5472-deadline-tomorrow-urgent-filing (#17). History: the intended services page was #11 on 10-04 and #17 on 10-11; on 10-18 /blog/form-5472-filed-late-never-filed was #9 | /services/late-form-5472-filing-service | only on 10-04/10-11 |
| pro forma 1120 filing service | 1 / 51+ / 51+ / 51+ | none | /services/pro-forma-1120-filing-service | NO |
| hire someone to file form 5472 | 51+ / 51+ / 8 / 7 | /do-i-need-to-file-form-5472 | /services/hire-someone-to-file-form-5472 | NO |
| white label form 5472 filing | 51+ / 2 / 2 / 51+ | none (10-18: /blog/white-label-form-5472-filing-accounting-firms #2) | /services/white-label-form-5472-filing | NO (the blog post ranked, not the service page) |
| form 5472 for accountants / bookkeepers | 51+ / 51+ / 15 / 51+ ; 51+ / 11 / 51+ / 51+ | none | /services/form-5472-for-accountants, /services/form-5472-for-bookkeepers | NO |
| form 5472 filing for dormant llc | 51+ / 51+ / 9 / 8 | /services/form-5472-filing-for-dormant-llc | same | YES (#8, the one service page that ranks as intended) |
| form 5472 penalty calculator | 1 / 51+ / 7 / 7 | /form-5472-penalty-calculator | same (tool) | YES (#7) |
| form5472prep (brand) | 1 / 8 / 51+ / 2 | / | home | YES (#2; 10-18 absent) |
- Net: of the five requested mappings (filing service, fax filing service, preparer/preparation service, final form dissolved LLC, compare), none holds at 10-25. "form 5472 filing service" and "form 5472 fax filing service", both #1/#4 on 10-04, have no top-20 ranking at all on 10-11/10-18/10-25. The intended service pages /services/form-5472-filing-service, -fax-filing-service, -preparer, /services/pro-forma-1120-filing-service and /compare/form-5472-filing-services appear as a ranking URL for ZERO keywords at 10-25.
### 2d. Keywords landing on the new/upgraded guide pages (10-25)
- /form-5472-example: 0 (tracked "form 5472 example" 51+; was #13 on 10-18 via /blog/form-5472-reportable-transactions-examples). /can-a-foreigner-own-a-us-llc and /what-is-a-disregarded-entity: 0 (no tracked keyword; both ARE in the 10-25 crawl now). /form-5472-fax-number: 0 ("form 5472 fax number" 51+ all of 10-18/10-25; Form5472.online #10, Firstbase #6). /file-form-5472: 0. /form-5472-instructions: 1 ("form 5472 prep" #17; "form 5472 instructions" itself 51+ at all four collections; Form5472.online #17, Firstbase #7). /form-5472-penalty: 2 ("form 5472 reasonable cause statement" #6; "form 5472 first time abatement" #12) but "form 5472 penalty" itself is 51+ at all four collections. /form-5472-reasonable-cause-statement: 1 ("form 5472 reasonable estimates" #15). /form-5472-statistics: 1 ("form 5472 statistics" #7). /delaware-llc-form-5472: 1 (#17).
- Tracked head terms still 51+ at 10-25: form 5472, irs form 5472, form 5472 instructions, form 5472 penalty, how to file form 5472, form 5472 filing, where to file form 5472, form 5472 mailing address, pro forma 1120, form 5472 vs 1120, form 5472 penalty abatement/waiver/relief, form 5472 extension, file form 5472 online, diirsp, doola/firstbase/clemta/zenind form 5472, foreign owned llc tax filing/return, form 1120 disregarded entity.

### 2e. NEW in this read - keywords landing on paginated pages (these pages are now noindex,follow; Moz grader flags them ACC)
| Rank 10-25 | Keyword | Ranking URL 10-25 | Rank / URL at 10-18 (dedicated post to take over) |
|---|---|---|---|
| 1 | form 5472 vietnam residents | /blog/page/7 | 6 / /blog/form-5472-vietnam-residents-us-llc |
| 2 | form 5472 estonia residents | /blog/topics/foreign-owned-llc/page/3 | 18 / /blog/form-5472-estonia-residents-us-llc |
| 4 | form 5472 france residents | /blog/page/7 | 14 / /blog/topics/foreign-owned-llc/page/5 |
| 4 | form 5472 recordkeeping checklist | /blog/page/7 | 9 / /blog/form-5472-recordkeeping-checklist |
| 6 | form 5472 indonesia residents | /blog/page/3 | 14 / /blog/page/3 |
| 6 | form 5472 switzerland residents | /blog/topics/foreign-owned-llc/page/2 | 15 / /blog/topics/foreign-owned-llc/page/5 |
| 7 | form 5472 spain residents | /blog/page/7 | 5 / /blog/topics/foreign-owned-llc/page/5 |
| 11 | form 5472 germany residents | /blog/topics/foreign-owned-llc/page/3 | 4 / /blog/page/7 |
| 13 | form 5472 owner becomes us tax resident | /blog/topics/foreign-owned-llc/page/3 | 51+ |
- 9 keywords (7 in the top 10) rank on paginated pages at 10-25; 0 did at 10-04/10-11, 11 did at 10-18. Delta vs 10-25: none (no new collection).

## 3. Competitors (Rankings > Competition; collections 10-04/10-11/10-18/10-25)
| | Visibility (10-04/10-11/10-18/10-25) | top-3 | top-10 | top-20 |
|---|---|---|---|---|
| You | 1.85 / 0.47 / 1.55 / 1.23 | 14/5/10/9 | 24/15/43/33 | 40/32/77/62 |
| Form5472.online | 1.67 / 1.91 / 1.52 / 1.28 | 12/13/8/9 | 37/50/48/38 | 69/83/81/65 |
| doola | 0.33 / 0.36 / 0.38 / 0.28 | 1/2/2/2 | 6/5/5/7 | 14/19/12/10 |
| Firstbase | 0.31 / 0.58 / 0.88 / 0.73 | 2/4/7/5 | 7/10/12/11 | 9/16/18/17 |
- Form5472.online peaked at 10-11 (50 top-10) and has declined 12 top-10 since (50 -> 38); we are now at 33 top-10 vs their 38 and their visibility (1.28%) is within 0.05 pt of ours. Firstbase more than doubled visibility since 10-04 (0.31 -> 0.73; peak 0.88 on 10-18). doola flat/down.
- Keywords where >=1 competitor is in the top 20 / a competitor outranks us / we are at-or-ahead of all present: 10-04 85 / 80 / 5; 10-11 106 / 99 / 7; 10-18 100 / 85 / 15; 10-25 83 / 71 / 12. Per competitor outranking us (10-04 / 10-11 / 10-18 / 10-25): Form5472.online 65/76/68/54; doola 12/19/10/10; Firstbase 9/15/16/15.
- 10-25: 71 keywords where a competitor is top-20 and outranks us; we are 51+ on 59 of them. Table (sorted by the best competitor rank; full 4-collection matrix in `competitors.tsv`):
| Keyword | You | Form5472.online | doola | Firstbase |
|---|---|---|---|---|
| can form 5472 be e-filed | #15 | 51+ | 51+ | #1 |
| foreign owned llc compliance calendar | 51+ | #1 | 51+ | 51+ |
| form 5472 expert | 51+ | #1 | 51+ | 51+ |
| form 5472 extension | 51+ | 51+ | 51+ | #1 |
| form 5472 reporting corporation | 51+ | 51+ | 51+ | #1 |
| is a us llc tax free for nomads | 51+ | 51+ | #1 | 51+ |
| llc vs c corp for non resident founders | 51+ | 51+ | 51+ | #1 |
| administratively dissolved llc form 5472 | #12 | #2 | 51+ | 51+ |
| form 5472 deadline | #14 | 51+ | 51+ | #2 |
| form 5472 filing service | 51+ | #2 | 51+ | 51+ |
| offer form 5472 filing as a service | #15 | #2 | 51+ | 51+ |
| form 5472 fax filing service | 51+ | #3 | 51+ | #19 |
| form 5472 help | 51+ | #3 | 51+ | 51+ |
| form 5472 related party | 51+ | #3 | 51+ | 51+ |
| startglobal form 5472 | #15 | #3 | 51+ | 51+ |
| us llc for digital nomads barcelona | 51+ | 51+ | #3 | 51+ |
| final form 5472 for dissolved llc | 51+ | #4 | 51+ | 51+ |
| form 5472 address | 51+ | #10 | 51+ | #4 |
| form 5472 software | 51+ | #4 | 51+ | 51+ |
| us llc tax for digital nomads dubai | 51+ | 51+ | #4 | 51+ |
| form 5472 exchange rates | #6 | #5 | 51+ | #18 |
| form 5472 penalty calculator | #7 | #5 | 51+ | 51+ |
| stripe atlas form 5472 | 51+ | #8 | #5 | 51+ |
| form 5472 fax number | 51+ | #10 | 51+ | #6 |
| form 5472 for cpas | 51+ | 51+ | 51+ | #6 |
| form 5472 german llc owner | 51+ | #6 | 51+ | 51+ |
| form 5472 india residents | 51+ | #6 | 51+ | 51+ |
| form 5472 mailing address | 51+ | #6 | 51+ | 51+ |
| form 5472 multiple llcs | 51+ | #6 | 51+ | 51+ |
| form 5472 penalty waiver | 51+ | #6 | 51+ | 51+ |
| how to fax form 5472 | 51+ | 51+ | 51+ | #6 |
| doola form 5472 | 51+ | 51+ | #7 | 51+ |
| form 5472 first time abatement | #12 | #7 | 51+ | 51+ |
| form 5472 for accountants | 51+ | #7 | 51+ | 51+ |
| form 5472 instructions | 51+ | #17 | 51+ | #7 |
| form 5472 line 1f | 51+ | #7 | 51+ | 51+ |
| form 5472 penalty abatement | 51+ | #7 | 51+ | 51+ |
| form 5472 uae resident us llc | 51+ | #7 | 51+ | 51+ |
| form 5472 vs 1120 | 51+ | #7 | 51+ | 51+ |
| get an ein for foreign owned llc | 51+ | #7 | 51+ | 51+ |
| how to fill out form 5472 | 51+ | #10 | 51+ | #7 |
| delaware llc form 5472 | #17 | #8 | 51+ | 51+ |
| file form 5472 online | 51+ | #8 | 51+ | 51+ |
| llc annual fees by state | 51+ | 51+ | #8 | 51+ |
| file form 5472 without being a cpa | 51+ | #9 | 51+ | 51+ |
| form 5472 due date | #19 | #9 | 51+ | 51+ |
| form 5472 filing cost | #11 | #9 | 51+ | 51+ |
| form 5472 line 1c | 51+ | #10 | 51+ | 51+ |
| shopify dropshipping llc non resident | 51+ | 51+ | #10 | 51+ |
| operating agreement foreign owned llc | 51+ | 51+ | 51+ | #11 |
| foreign owned llc irs penalty | 51+ | #12 | 51+ | 51+ |
| form 5472 deadline calculator | #19 | #12 | 51+ | 51+ |
| form 5472 part iv | 51+ | #12 | 51+ | 51+ |
| form5472 prep | 51+ | #15 | 51+ | #12 |
| does a foreign owned llc need an fbar | 51+ | #13 | 51+ | 51+ |
| irs form 5472 2026 | 51+ | #13 | 51+ | 51+ |
| late form 5472 | 51+ | #13 | 51+ | 51+ |
| does a foreign owned llc pay us tax | 51+ | #14 | 51+ | #18 |
| form 5472 no us bank account | 51+ | #14 | 51+ | 51+ |
| form 5472 distributions to owner | 51+ | #15 | 51+ | 51+ |
| form 5472 part v statement | 51+ | #15 | 51+ | 51+ |
| form 5472 royalties | 51+ | #15 | 51+ | 51+ |
| how to file form 5472 | 51+ | #16 | 51+ | 51+ |
| did the irs receive my form 5472 | 51+ | #17 | 51+ | 51+ |
| form 5472 foreign company owns us llc | 51+ | 51+ | #17 | 51+ |
| form 5472 penalty relief | 51+ | #17 | 51+ | 51+ |
| form 5472 vs fbar | 51+ | #17 | 51+ | 51+ |
| foreign owned llc tax filing | 51+ | #18 | 51+ | 51+ |
| us bank account for foreign owned llc | 51+ | 51+ | #18 | 51+ |
| us llc for digital nomads lisbon | 51+ | 51+ | #18 | 51+ |
| llc owned by non us person tax filing | 51+ | #19 | 51+ | 51+ |
- Notable: Form5472.online owns the money-term pages we do not: form 5472 filing service #2, form 5472 fax filing service #3, form 5472 software #4, form 5472 help #3, form 5472 related party #3, final form 5472 for dissolved llc #4, form 5472 expert #1, offer form 5472 filing as a service #2 (we #15), startglobal form 5472 #3 (we #15), administratively dissolved llc form 5472 #2 (we #12). Firstbase: can form 5472 be e-filed #1 (we #15), form 5472 extension #1, form 5472 reporting corporation #1, form 5472 deadline #2 (we #14), form 5472 address #4, form 5472 fax number #6. doola: is a us llc tax free for nomads #1, us llc for digital nomads barcelona #3.

## 4. Site Crawl (latest = 2026-10-25, unchanged; no crawl since). Affected URLs: `crawl-issues.tsv`
- Latest crawl: started 2026-10-25 10:13:36 UTC, completed 10:19:20, seed form5472prep.com (domain crawl), **324 pages** (10-18: 321; 10-16: 317; 10-11: 404; 10-05: 658). Status 322 x 200, 1 x 301 (https apex), 1 x 308 (http apex), 0 x 4xx/5xx. Depth up to d8 (66 pages at depth 6-8). 262 pages with 0 issues, 61 with 1, 1 with 2. Categories: Critical 0; Crawler Warnings 1; Metadata 54; Redirect 2; Content 2; Total 59 (New 1, Fixed 0).
| Issue type | Count | Change this crawl | Moz Recommends Fixing | Notes |
|---|---|---|---|---|
| URL Too Long | 54 | +0 (52 on 10-11, 54 since 10-16) | **YES** | 76-89 chars vs Moz's 75-char threshold; all /blog/<slug>; 0 new; full list now saved in crawl-issues.tsv |
| Duplicate Content | 2 groups (4 pages) | +1 new group | **YES** (labelled "New", 2) | G1 NEW: /blog/page/3 (1,300 words) + /blog/topics/form-5472/page/3 (1,236); G2 existing since 10-16: /blog/topics/itin (821) + /blog/topics/form-w-7 (782). All four are listing pages |
| Temporary Redirect | 1 | 0 | **YES** (1) | http://form5472prep.com 308 -> https://form5472prep.com/ (Vercel default http->https) |
| Redirect Chain | 1 (3 rows) | 0 | no | http apex 308 -> https apex 301 -> https://www.form5472prep.com/ 200 |
| Meta Noindex | 1 | 0 | no | only /start (noindex,nofollow, deliberate; was 114 on 10-11) |
| every other type (4xx, 5xx, title/description/H1/canonical, thin content, slow page, overly dynamic, redirect to 4xx, x-robots, nofollow, refresh) | 0 | - | - | - |
- Stale-by-design for the planned changes: this crawl predates the paginated-pages noindex (pages 2+ were still `index,follow` self-canonical in the 10-25 crawl), the form-w-7 -> itin canonical and the RSC noindex. Expect on 11-01: the Duplicate Content group(s) on paginated/topic listing pages and form-w-7/itin to clear or change, the paginated pages to show as Meta Noindex (new), and /form-7004-extension to appear in the page count if linked. URL Too Long (54) is untouched by those changes and stays the top "Moz Recommends Fixing" item unless slugs are shortened or Moz is ignored.
- Inventory unchanged (324 pages): /blog posts 197; /blog index + 8 /blog/page/N; /blog/topics hubs 13 + 12 paginated; /services hub + 12 service pages (1,137-1,611 words); 59 top-level pages; 20 parametrised pages; /start. The ~267 long-tail /blog/topics/<slug> noindex pages are still not reached by the crawler.

## 5. Page Optimization (`page-optimization.tsv`; Track & Monitor empty; all 76 pairs untracked)
- Source: Discover list (`on-page/.../summary`, as of Oct 24: same 76 pairs, same ranks, same scores as the 10-26 read) PLUS the live page-grader report for each pair fetched 2026-10-30 (`/page-grader/api/report`, GET). The report re-reads the live page, so it is the only Moz view that reflects post-10-26 site edits. Title and meta-description length are identical to the base for all 76 pairs.
- **Live grade distribution (76 pairs):** 100 x2, 98 x2, 96, 95, 92, 88, 86 x7, 85 x2, 84 x3, 82, 79 x9, 73 x2, 71 x29, **63 x15 (new floor)**; mean 75.4 (was 77.0), median 71. The 63s are all paginated-page pairs (see below).
- **Failing-factor frequency, live 10-30 (base 10-26 in brackets):** I keyword in image alt 74 (74); M keyword in meta description 71 (71); Te exact keyword in title 68 (68); H keyword in H1 60 (60); Tp keyword placement in title 58 (58); U keyword in URL 57 (57); D exact keyword in body 57 (**58**); Tb broad keyword in title 56 (56); **ACC accessible_to_engines 16 (0, new)**; Ul URL length 9 (9); LNK avoid_excessive_internal_links 2 (2: /form-5472-instructions for "form 5472 prep" 73 and "form 5472 preparer" 79); S keyword stuffing 0. Codes: Te exact keyword in title, Tp placement in title, Tb broad keyword in title, U keyword in URL, Ul URL length, M meta description, D body, S stuffing, H H1, I image alt, ACC accessible to engines (noindex/robots), LNK internal-link count.
- **The 17 pairs that changed since 10-26 (everything else identical):**
  - 16 x ACC newly failing (grade -8): /blog/page/7 (france #4, vietnam #1, indonesia #17, estonia #12, spain #7, switzerland #9, portugal #18, recordkeeping #4, owner loans #11), /blog/page/3 (indonesia #6), /blog/page/4 (do i need an itin #12), /blog/topics/foreign-owned-llc/page/2 (switzerland #6), /page/3 (estonia #2, owner becomes us tax resident #13, germany #11), /page/5 (recordkeeping #12). The 71-floor in the base (44 pairs) therefore splits into 29 at 71 and 15 at 63; "owner loans" /blog/page/7 went 79 -> 71.
  - 1 x D newly passing: compare form 5472 filing services -> /blog/form-5472-in-house-vs-outsourced-firm (#6) 71 -> 79 (still fails Te Tp U M H I Tb).
- Best pairs (unchanged): /blog/form-5472-deadline-tomorrow-urgent-filing 100 ("form 5472 deadline", #14, nothing failing); /services/form-5472-filing-for-dormant-llc 100 ("form 5472 filing for dormant llc", #8); /delaware-llc-form-5472 98 (#17, image alt only); /form-5472-statistics 98 (#7, image alt); /form-5472-penalty-calculator 96 (#7, M + I); /blog/form-5472-reportable-transactions-examples 95 (#8); /blog/offer-form-5472-filing-as-a-service 92 (#15; Tp M H I).
- Service pages in the list: only /services/final-form-5472-for-dissolved-llc ("administratively dissolved llc form 5472" #12, 71, fails Te Tp U M D H I Tb), /services/form-5472-filing-for-dormant-llc (100) and /services/late-form-5472-filing-service ("form 5472 deadline calculator" #19, 71). The intended money pages (/services/form-5472-filing-service, -fax-filing-service, -preparer, -hire-someone-to-file-form-5472, /services/pro-forma-1120-filing-service, /compare/form-5472-filing-services) have no pair at all (they rank for nothing) so Moz never grades them for their keywords.
- Titles Moz holds (live, all unchanged vs base): / "File IRS Form 5472 + Pro Forma 1120 - Form5472 Prep" (meta 138 chars); /pricing "Pricing for Form 5472 Filing | Form5472 Prep" (166); /faq "Form 5472 FAQ: Filing, Deadlines, EIN & ITIN | Form5472 Prep" (123); /irs-form-5472 "IRS Form 5472: What It Is, Who Files, and How (2026)" (150); /form-5472-instructions "Form 5472 Instructions (2026) - Plain-English Walkthrough" (161); /form-5472-penalty "Form 5472 $25,000 Penalty - How to Avoid or Reduce It" (176); /do-i-need-to-file-form-5472 "Do I Need to File Form 5472? 2-Minute Checker" (176); paginated pages "Blog - page N | Form5472 Prep" (139/137 chars) and "Foreign-owned LLC guides - page N | Form5472 Prep" (86-87 chars). (Moz renders the site's "—", "–" and "·" separators; the TSV keeps the live characters.)

## 6. Insights / Keyword Opportunities
- Insights card "Keyword Opportunities" (5): irsn number (difficulty 24, organic CTR 82%, volume 11-50); form 5472 preparation service pdf (25, 89%, 0-0); 5472 form filling (6, 81%, 0-0); form 5472 outsourcing (34, 88%, 0-0); form 5472 fax filing service reddit (53, 100%, 0-0).
- Rankings > Opportunities tab (50 suggestions, not tracked; difficulty / organic CTR % / monthly volume): irs ein address change 60/39/101-200; irs error code 101 39/97/101-200; how long to get an itin 48/97/51-100; exchange rate irs 2018 49/93/51-100; what is form 5472 43/80/51-100; irsn number 24/82/11-50; exchange rate average 32/97/11-50; form 5472-2 41/76/11-50; does a foreign owned single member llc need an ein 15/88/11-50; convert us $ to irs 51/93/11-50; exempt payee tax classification airbnb 45/92/11-50; foreign exchange rates irs 51/96/11-50; irs ein number error 101 39/97/11-50; irs ein ref number 101 38/97/11-50; irs 5472 50/97/11-50; forms 5472 39/89/11-50; form 5472 preparation service pdf 25/89/0-0; 5472 form filling 6/81/0-0; form 5472 outsourcing 34/88/0-0; form 5472 fax filing service reddit 53/100/0-0; form 5471 reasonable cause decision tree 19/97/0-10; irs ein correction address 66/36/0-10; form 5472 and pro forma 1120 filing service instructions 42/89/0-0; irs ein online third party designee 53/93/0-10; form 5472 fax filing reddit 52/100/0-0; form 5472 rental property llc 21/88/0-0; 1120 and 5472 filing service 2022 32/77/0-0; what is the penalty for filing 5472 late? 31/88/0-0; irs cpa change of address ein number 60/93/0-10; foreign owned single member llc filing requirements california 32/92/0-0; form 5472 deadline 2026 24/88/0-0; irs caa fees and charges 20/88/0-10; form 5472 preparation example 37/62/0-0; how long does it take to get a itin 47/97/0-10; how much does it cost to file form 5472? 29/88/0-0; form 5472 for real estate llc foreign owned 34/88/0-0; how long does it take to apply for an itin 49/97/0-0; irs fein address change 59/43/0-10; irs how to change address on ein 59/94/0-10; how long does it take to generate itin? 49/97/0-0; irs ein error reference number 101 41/97/0-10; what is a 5472? 41/97/0-0; 5472 us 39/93/0-0; federal form 5472 45/97/0-10; form 5272 44/70/0-10; single member llc foreign owned california 28/92/0-0; do i have to file form 5472? 41/84/0-0; how long does it take for itin to arrive? 42/97/0-0; tax form 5472 45/94/0-10; what is form 5472 used for 41/97/0-10.
- Low-difficulty, topic-relevant gaps (difficulty <=30): 5472 form filling (6), does a foreign owned single member llc need an ein (15), form 5471 reasonable cause decision tree (19), irsn number (24), form 5472 deadline 2026 (24), form 5472 preparation service pdf (25), form 5472 rental property llc (21), irs caa fees and charges (20). Volume for most is 0-0 (Moz has no data).

## 7. Items not captured / caveats
- Built-in Browser pane WAS logged in to Moz this time (the 10-26 read had to use Chrome). No Chrome tab was opened. All reads were GETs from `delorean-api` (rankings grouped-by, competitor grouped-by by site name, crawl issues-v2/historical-summary/issues history, on-page summary), `ma-crawl-management-api/crawl-info`, `page-grader/api/report` (76 pairs), `listerine/api/1.4/idina/links` (inbound-link snapshot), and the Dashboard / Insights / Links / Opportunities UI pages. No writes, exports, tracking, recrawls or "mark fixed".
- The page-grader report is an on-demand fetch of the live page for each pair (the same call the Analyze screen makes); no other pages/keywords were analysed.
- Rank data below the top 20 does not exist in Moz now ("51+" = #21 or unranked); GA is not connected; Performance Metrics not set up (unchanged).
- Link snapshot counted, not archived: the 216 external links were classified in-page (promo-anchor vs other); the per-link list was not saved.
- Moz cannot show effect of anything shipped after 10-25 until the Nov 1 collections (rank, crawl, Discover). The page-grader is the only live signal and it covers only the 76 listed pairs.
