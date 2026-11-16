# Moz campaign read: Form5472 Prep (id 3235940, acct 25501479) - read 2026-11-15
Read-only, built-in Claude in-app browser only (own tab `tab-1`; Moz already signed in; no sign-in, no Recrawl, no add/remove/track, no export, no Download-PDF clicks). Method: page navigation + DOM reads of the rendered Moz tables (Rankings, Competition, Opportunities, Insights, Site Crawl, Page Optimization Discover, Links). A direct `fetch` of Moz's `delorean-api` from the page was denied by the permission classifier, so I did NOT use the API (the 11-04 read did); everything below is what the UI tables show. Baseline = `base/` (11-01 data, read 11-04).
Companion files: `rankings.tsv` (246 kw: 11-08, 11-01, 10-25, 10-18, 10-11, 10-04 ranks, change, URLs 11-08/11-01/10-25), `competitors.tsv` (180 rows), `crawl-issues.tsv` (82 rows), `page-optimization.tsv` (48 pairs), raw scrapes `raw-*.tsv|txt`.

## 0. Bottom line
1. **NO 11-15 DATA YET.** Moz's newest rank collection is **2026-11-08** (UI label "Nov 7"); newest crawl is **Nov 8**. Dashboard still says "Next scheduled update: Nov 15, 2026 PST", crawl "Next Crawl Nov 15". So this read is the 11-08 collection, the first one after the 10-26/10-30/11-04 site changes. Re-read after Moz posts 11-15.
2. **Visibility fell again: 1.12% -> 0.98%** (peak 1.55% on 10-18). top-3 12 -> **6**, top-10 30 -> **24**, top-20 56 -> **41**. Competitors: Form5472.online 1.65 -> 1.48, Firstbase 1.26 -> 0.95, doola 0.46 -> 0.27. We are now **second** on visibility (Form5472.online 1.48, us 0.98, Firstbase 0.95, doola 0.27) - we regained second only because Firstbase fell harder (it was ahead of us on 11-01).
3. **The paginated noindex pages are gone from the SERP data** (only 1 keyword still on `/blog/page/3`). Of the 9 "protected" keywords: **vietnam #14 -> #3 on its dedicated post** and **estonia 51+ -> #2 on its dedicated post** (both migrated to the posts); indonesia and owner-becomes-us-tax-resident fell out (51+); france, recordkeeping checklist, switzerland, spain, germany remain 51+.
4. **Money pages still do not rank**; the two that did (final dissolved #3, late filing service #9) both **dropped out** (51+). Only `/services/late-form-5472-filing-service` shows up, and for other keywords (late form 5472 #6, deadline calculator #6, penalty calculator #15). New ranker: `/blog/form-5472-extension-vs-late-filing` is #2 for "form 7004 extension form 5472" (was 51+), #8 statute of limitations, #18 penalty for late filing. `/form-7004-extension` itself ranks for nothing.
5. **Unexpected:** brand slipped - `form5472prep` #2 -> #8 and now on `/about` (not `/`); `form5472 prep` and `form 5472 prep` left the top 20; `/` ranks only for "form 5472 preparation service" #7. **Moz DA 14 -> 39, linking domains 84 -> 226, external links 239 -> 529** (the first inbound-link rows are one.fsu.edu donate-form URLs with a `returnurl=` parameter pointing at the site - looks like parameter-URL noise, not editorial links).
6. **Crawl 11-08: 338 pages** (329), URL Too Long **55** (56): the 2 long-slug posts were renamed and no longer flagged, 1 new flagged URL is a fragment URL; Meta Noindex **23** (22, +1 = new `/blog/topics/foreign-owned-llc/page/7`); Temporary Redirect 1, Redirect Chain 1, Duplicate Content 0. `/form-7004-extension` title now **"Form 5472 Extension (Form 7004) — $19 · Form5472 Prep"**.
7. **Page Optimization Discover: 48 pairs** (65), mean 76.6 (74.6), 71 x28, 100 x2. `/do-i-need-to-file-form-5472` now **96** for its own keyword (page changed 11-04).

## 1. Data dates and overview
### 1a. Dates
| Data set | Latest | Next |
|---|---|---|
| Rank collection (Google en-US desktop national, 246 kw) | **2026-11-08** (UI "Oct 3 - Nov 7"); previous 11-01 | Nov 15 PST (not yet in) |
| Site crawl | **Nov 8** (338 pages) | Nov 15; recrawls 10 of 10 available until 12/01 (none used) |
| Insights | "week of November 8th, 2026" | weekly |
| Page Optimization Discover | "as of Nov 7" (Weekly Nov 1 - 7) | weekly |
| Links | Moz index refreshed (DA 39) | monthly |
"51+" in tsv = not in the top 20 (Moz UI shows "#21+").
### 1b. Visibility and buckets (you)
| Collection | Visibility | #1-3 | #4-10 | #11-20 | top-10 | top-20 |
|---|---|---|---|---|---|---|
| 2026-10-04 | 1.8467% | 14 | 10 | 16 | 24 | 40 |
| 2026-10-11 | 0.4730% | 5 | 10 | 17 | 15 | 32 |
| 2026-10-18 | 1.5524% | 10 | 33 | 34 | 43 | 77 |
| 2026-10-25 | 1.2316% | 9 | 24 | 29 | 33 | 62 |
| 2026-11-01 | 1.1160% | 12 | 18 | 26 | 30 | 56 |
| **2026-11-08** | **0.98%** | **6** | **18** | **17** | **24** | **41** |
(11-08 values from the Rankings page: #1-3 6, #4-10 18, #11-20 17, "205 tracked keywords are not in the top 20"; matches my recount of the 246-row table.)
- Dashboard: visibility 0.98% = **-12.16%** week on week; keywords ranked #1-10: 24/246 (6 fewer); Rankings page header "-46.92%" (vs start of the Oct 3 range).
- Moz counters: Rankings page (Oct 3 -> Nov 7) 34 moved up / 39 moved down; **Insights (11-01 -> 11-08) 31 up / 43 down**.
- AI Overviews (new Rankings-page card): AIO present on 198 of 246 keywords, **cites you on 1**; Featured Snippets 0.
- My recount 11-01 -> 11-08: of keywords ranked both weeks, 10 up / 7 down; **21 entered the top 20, 36 left it**.
### 1c. Competitors (see section 3)
| | Visibility 11-01 -> 11-08 | top-3 | top-10 | top-20 |
|---|---|---|---|---|
| You | 1.12 -> **0.98** | 12 -> 6 | 30 -> 24 | 56 -> 41 |
| Form5472.online | 1.65 -> **1.48** | 12 -> 10 | 47 -> 47 | 67 -> 66 |
| Firstbase | 1.26 -> **0.95** | 11 -> 8 | 17 -> 17 | 19 -> 19 |
| doola | 0.46 -> **0.27** | 2 -> 1 | 8 -> 7 | 10 -> 9 |
(Dashboard-confirmed: top-10 You 24 / Firstbase 17 / Form5472.online 47 / doola 7; visibility You 0.98, doola 0.27, Firstbase 0.95, Form5472.online 1.48; 11-01 competitor top-3/top-20 from base file.) Everyone fell; we lost the most top-20 keywords (56 -> 41, Firstbase and Form5472.online roughly flat at 19 / 66). Order now: Form5472.online 1.48, **us 0.98**, Firstbase 0.95, doola 0.27 (last read: we were third behind Firstbase 1.26).
### 1d. Links (Moz index refreshed; monthly compare)
DA **39** (was 14 on 11-04 read; Moz shows "25 previous month"); Page Authority 33; linking domains **226** (84); followed linking domains 209 (76); external followed 501 (221); total links 26,964; external nofollow 28; spam score 16%; dashboard External Links 529 (was 239; "290 previous month"). Competitors: Form5472.online DA 15 / 361 linking domains; doola DA 38 / 4,708; Firstbase DA 37 / 2,084. First 50 inbound rows are all `one.fsu.edu/foundation/donate/designation-search?returnurl=http://www.form5472prep...` (parameter pages of a Florida State University donation form echoing our URL) - likely the cause of the DA/linking-domain jump; not a placed link. Not itemised beyond the first 50 rows.
### 1e. Insights / alerts (week of Nov 8)
- Summary: visibility 0.98% (-13%), 24 keywords #1-10 (-6), 31 up / 43 down. Biggest up: turkey residents (+16 to #5), do i need to file form 5472 (+10 to #11), etsy sellers (+17 to #4). Biggest down (all to #21+): saas founders, firstbase form 5472, white label form 5472 filing.
- Dropped from page 1 (21 listed): form 5472 prep 7->21+, reportable transactions 5->21+, hire someone 10->21+, penalty calculator 5->15 (/services/late-form-5472-filing-service), final dissolved 3->21+, exchange rates 3->21+, line 1c 10->21+, colombia 7->21+, llc paying personal expenses 3->21+, compare 9->21+, late form 5472 filing service 9->21+, australia 3->21+, saas founders 2->21+, philippines 9->21+, sign electronically 10->21+, firstbase form 5472 2->21+, formation costs 8->11, stripe paypal wise 3->12 (/blog/page/3), pakistan 3->21+, white label 2->21+, thailand 3->21+, form5472 prep 2->21+.
- Reached page 1 (16): vietnam 14->3 (own post), 7004 extension form 5472 21+->2 (/blog/form-5472-extension-vs-late-filing), vs 1040-nr 21+->8 (own post), file without being a cpa 11->8 (/irs-form-5472), late form 5472 21+->6 (/services/late-form-5472-filing-service), preparation service 21+->7 (/), italy 21+->4 (/form-5472-by-country), app developers 21+->3 (own post), nigeria 15->1 (/blog/form-5472-foreign-corporate-owner), preparer 17->4 (/about), statute of limitations 21+->8, no transactions 21+->7, south korea 21+->4 (/form-5472-by-country), estonia 21+->2 (own post), etsy 21+->4 (/form-5472-instructions), turkey 21+->5 (/form-5472-by-country).
- Top-3 gains (4): 7004 extension #2, nigeria #1, kdp authors #1, estonia #2.
- Crawl card (stale, shows 11-01 numbers: 329 pages / 23 new / 80 total / Recommends Fixing URL Too Long 56, Meta Noindex 22, Temporary Redirect 1); the Site Crawl pages themselves show the 11-08 crawl (section 4).
- Page Opportunities card: only `/blog/page/3` "form 5472 stripe paypal wise" #12, score 63.
- Keyword Opportunities card (5): irsn number (24, 82%, 11-50); form 5472 preparation service pdf (25); 5472 form filling (6); form 5472 outsourcing (34); form 5472 due date 2026 irs (20, 93%, 0-0). Last read: card had "form 5472 fax filing service reddit" - now replaced by due-date-2026 irs.
### 1f. Keyword opportunities (Rankings > Opportunities, 50, untracked; `raw-opps.txt`)
- Top gap unchanged: **5472 form** (difficulty 18, CTR 81%, vol 201-500). Others low-difficulty: 5472 form filling (6), form 5472 due date 2026 template (13), does a foreign owned single member llc need an ein (15), form 5471 reasonable cause decision tree (19), form 5472 due date 2026 irs (20), irs caa fees and charges (20), form 5472 rental property llc (21), disregarded entity meaning (22), where to send form 5472? (22), form 5472 due date 2026 (23), part iv instructions question (23), irsn number (24), form 5472 deadline 2026 (24).
- **New vs the 11-04 list (18):** convert us $ to irs (51, vol 11-50); exempt payee tax classification airbnb (45, 11-50); foreign exchange rates irs (51, 11-50); 2018 irs exchange rates (50, 11-50) + irs exchange rate for 2018 / 2018 irs conversion rates; form 5472 fax filing reddit (52); irs ein online third party designee (53); par necessities 5472 (21); irs cpa change of address ein number (60); irs caa fees and charges (20); how long does it take to get a itin (47) / apply for an itin (49) / generate itin (49); irs fein address change (59); irs how to change address on ein (59); irs pro forma (53); tax ein change ownership llc (56). Gone vs 11-04 (examples): single member llc to partnership, irs error code 101, irs ein address change (replaced by the fein/how-to-change variants).

## 2. Rankings (246 kw; `rankings.tsv`, sorted by 11-08 rank)
`chg_1108_vs_1101(+up)`: positive = improved; `enter` = entered top 20; `drop` = left top 20.
### 2a. Delta 11-08 vs 11-01
- **Entered the top 20 (21):** estonia residents 51+->2 (own post), 7004 extension form 5472 ->2, app developers ->3 (own post), etsy sellers ->4 (/form-5472-instructions), italy ->4 / south korea ->4 / turkey ->5 (all /form-5472-by-country), late form 5472 ->6 (/services/late-form-5472-filing-service), form 5472 no transactions ->7, preparation service ->7 (/), statute of limitations ->8, vs 1040-nr ->8, do i need to file form 5472 ->11 (/do-i-need-to-file-form-5472), penalty letter ->12 (/blog/form-5472-irs-notice-numbers-decoder), related party ->12, requirements ->13, who must file ->14 (both /do-i-need-to-file-form-5472), hong kong ->15, royalties ->16, itin caa vs mailing passport ->17, penalty for late filing ->18.
- **Left the top 20 (36):** compare filing services (9), final dissolved (3), firstbase form 5472 (2), compliance calendar (11), australia (3), brazil (13), canada (13), coaches (12), colombia (7), digital nomads (13), exchange rates (3), fax number (13), filing cost (13), india (16), indonesia (13), line 1c (10), noncash property (11), nonresident spouse joint return (15), owner becomes us tax resident (13), owner loans (13), pakistan (3), philippines (9), form 5472 prep (7), reportable transactions (5), saas founders (2), thailand (3), form5472 prep (2), hire someone (10), late form 5472 filing service (9), llc paying personal expenses (3), never filed (14), offer filing as a service (13), paying family from us llc (11), sign electronically (10), where to file form 5472 (12), white label (2).
- **Biggest gains (both weeks ranked):** nigeria residents 15->1 (+14), preparer 17->4 (+13), vietnam 14->3 (+11), kdp authors 8->1 (+7), tax year 2025 18->11 (+7), first year form 5472 10->4 (+6), file without being a cpa 11->8 (+3).
- **Biggest losses (both ranked):** penalty calculator 5->15 (-10), stripe paypal wise 3->12 (-9, now /blog/page/3), form5472prep 2->8 (-6), formation costs 8->11, multiple llcs 4->7 (-3). Biggest drops out of top 20: saas founders 2, firstbase 2, white label 2, form5472 prep 2, final dissolved 3, exchange rates 3, llc paying personal expenses 3, australia 3, pakistan 3, thailand 3 (all were top-3).
- Top 3 now (6): #1 kdp authors (own post), #1 nigeria residents (/blog/form-5472-foreign-corporate-owner), #2 7004 extension form 5472 (/blog/form-5472-extension-vs-late-filing), #2 estonia residents (own post), #3 app developers (own post), #3 vietnam residents (own post). Two #1s again.
- By label, top-10 / top-20 (11-01 -> 11-08): alternatives 2/2 -> 0/0; blog-5472 8/15 -> 4/8; blog-audience 7/17 -> 10/11; blog-ein-itin 1/3 -> 1/3; branded 3/3 -> 1/1; guides 0/2 -> 1/2; head-terms 1/5 -> 3/10; services 5/6 -> 3/3; tools 3/3 -> 1/3.
### 2b. URLs carrying the rankings
24 distinct ranking URLs (25 on 11-01): /form-5472-instructions 4 keywords, /do-i-need-to-file-form-5472 4, /blog/form-5472-extension-vs-late-filing 3, /form-5472-by-country 3, /services/late-form-5472-filing-service 3 (late form 5472 #6, deadline calculator #6, penalty calculator #15), /blog/form-5472-reportable-transactions-examples 3, then /blog/form-5472-foreign-corporate-owner 2, /irs-form-5472 2, /about 2 (preparer #4, form5472prep #8), / 1, the rest 1 each. **Blog index pages: only /blog/page/3 (1 kw, #12); /blog/page/7 and topic pages carry 0** (11-01: 10) - Google has applied the noindex.
### 2c. The 9 "protected" country/niche keywords (were on /blog/page/N at 10-25/11-01)
| Keyword | 11-01 | 11-08 | URL at 11-08 | URL at 11-01 | Moved to its dedicated post? |
|---|---|---|---|---|---|
| form 5472 vietnam residents | 14 | **3** | /blog/form-5472-vietnam-residents-us-llc | /blog/page/7 | **YES** |
| form 5472 estonia residents | 51+ | **2** | /blog/form-5472-estonia-residents-us-llc | none | **YES** (re-entered on the post) |
| form 5472 france residents | 51+ | 51+ | none | none | no |
| form 5472 recordkeeping checklist | 51+ | 51+ | none | none | no |
| form 5472 indonesia residents | 13 | 51+ | none | /blog/page/3 | no - dropped out |
| form 5472 switzerland residents | 51+ | 51+ | none | none | no |
| form 5472 spain residents | 51+ | 51+ | none | none | no |
| form 5472 germany residents | 51+ | 51+ | none | none | no |
| form 5472 owner becomes us tax resident | 13 | 51+ | none | /blog/page/7 | no - dropped out |
**2 of 9 migrated to their post (vietnam #3, estonia #2); 7 not ranking in the top 20.** Other posts took over adjacent terms: app developers #3 and kdp authors #1 on their own posts; nigeria #1 on /blog/form-5472-foreign-corporate-owner; thailand, colombia, brazil, coaches, prep (all on /blog/page/7 on 11-01) fell out entirely rather than moving to their posts.
### 2d. Money terms (11-01 -> 11-08; ranking URL)
| Keyword | 11-01 | 11-08 | URL 11-08 | Note |
|---|---|---|---|---|
| form 5472 filing service | 51+ | 51+ | - | /services/form-5472-filing-service ranks for 0 |
| form 5472 fax filing service | 51+ | 51+ | - | /services/...fax... ranks for 0 |
| form 5472 preparer | 17 | **4** | /about | intended /services/form-5472-preparer not ranking; /about took it (11-01: /do-i-need-to-file-form-5472) |
| form 5472 preparation service | 51+ | **7** | / | home page; intended /services page not ranking |
| hire someone to file form 5472 | 10 | 51+ | - | lost |
| final form 5472 for dissolved llc | 3 | 51+ | - | /services/final-form-5472-for-dissolved-llc ranks for 0 now |
| compare form 5472 filing services | 9 | 51+ | - | /compare/... and the blog comparison both lost |
| late form 5472 filing service | 9 | 51+ | - | /services/late-form-5472-filing-service now ranks for late form 5472 #6 instead |
| pro forma 1120 filing service | 51+ | 51+ | - | |
| form 7004 extension form 5472 | 51+ | **2** | /blog/form-5472-extension-vs-late-filing | NOT /form-7004-extension (0 keywords) |
| form 5472 extension | 51+ | 51+ | - | |
| white label form 5472 filing | 2 | 51+ | - | lost |
| 1120 and 5472 filing service; for accountants / bookkeepers / cpas; dormant llc | 51+ | 51+ | - | |
| form 5472 penalty calculator | 5 | 15 | /services/late-form-5472-filing-service | tool page /form-5472-penalty-calculator not ranking |
| offer form 5472 filing as a service | 13 | 51+ | - | lost |
| form5472prep (brand) | 2 | 8 | /about | was / |
| form5472 prep (brand) / form 5472 prep | 2 / 7 | 51+ / 51+ | - | lost |
**Answers:** no `/form-7004-extension`, `/compare/*` or `/services/*` money page ranks for its own money keyword. `/services/late-form-5472-filing-service` is the only /services page in the top 20 (3 keywords: late form 5472 #6, deadline calculator #6, penalty calculator #15). Both "intended" holds from last week (final dissolved #3, late filing service #9) dropped out.
### 2e. /form-5472-by-country and /form-5472-instructions keywords
| Page | Keywords (11-01 -> 11-08) |
|---|---|
| /form-5472-by-country | south korea 51+->4, italy 51+->4, turkey 51+->5 (new); **lost:** canada 13, digital nomads 13, india 16, philippines 9 (all ->51+) |
| /form-5472-instructions | etsy sellers 51+->4, irs form 5472 2026 4->6, tax year 2025 18->11 (was /file-form-5472), formation costs 8->11 (was its blog post), deadline calculator 8 (secondary; primary #6 is on /services/late...). **Lost:** australia 3, pakistan 3 (->51+); kdp authors moved to its own post #1 (was this page #8) |
| /file-form-5472 | capital contribution 12->13 only (lost offer-as-a-service 13, tax year 2025 18 -> moved to /form-5472-instructions) |
| /do-i-need-to-file-form-5472 | now 4: do i need to file form 5472 #11, requirements #13, who must file #14, do i need an itin #12 (plus preparer #7 second URL in Discover) |
| /form-5472-example | 0 ("form 5472 example" #13 on /blog/form-5472-part-v-statement-example) |
Head terms still 51+: form 5472, irs form 5472, form 5472 instructions, form 5472 penalty, how to file form 5472, form 5472 filing, where to file (lost #12), file form 5472 online, form 5472 extension, pro forma 1120, form 5472 vs 1120, doola/clemta/zenind form 5472, foreign owned llc tax filing/return.

## 3. Competitors (Rankings > Competition; `competitors.tsv`)
- Keywords where >=1 competitor is in the top 20: **83** (86 on 11-01); a competitor outranks us on **75**, we are at/ahead of all present on 8 (11-01: 86 / 78 / 8). Per competitor outranking us: Form5472.online 59 -> 58, Firstbase 19 -> 18, doola 9 -> 8.
- **Keywords where we are top-20 and a competitor is ahead (11):** do i need an itin (us 12; F5472.online 5), file without being a cpa (8; F 5), deadline calculator (6; F **1**), form 5472 example (13; F 5, doola 9), no transactions (7; Firstbase **1**), penalty calculator (15; F 8), preparation service (7; F 3), related party (12; Firstbase 9), requirements (13; F 5, Firstbase 4), form5472prep (8; F 7), who must file (14; Firstbase **1**).
- Competitor holds where we are 51+ (selected): Firstbase #1 form 5472 filing, form 5472 threshold, form 5472 mailing address #3; F5472.online #1-3 on: form 5472 for cpas #2, final dissolved #5 (was #2), compare #3, 1120 and 5472 filing service #7 (was #2), form 5472 filing service #8, form 5472 expert #3, form 5472 for non residents #3 (Firstbase #2), form 5472 management fees #3; doola's only #1 is "is a us llc tax free for nomads" (plus #4-8 on digital-nomad / stripe atlas / clemta terms); Firstbase #2 on "form 5472" and "did the irs receive my form 5472".
- Competitors lost positions too: Form5472.online no longer in the top 20 for 7004 extension (was #1), late form 5472 filing service (was #1), preparer/fax (was #6); Firstbase left 7004 extension and "extension" #2 -> #7.
- Net: the money terms are mostly unowned right now (Form5472.online 7004 and late-filing-service #1s are gone), but we did not take them.

## 4. Site Crawl (latest **2026-11-08**; next 2026-11-15). `crawl-issues.tsv` (82 rows)
- **338 pages crawled** (329 on 11-01; 324, 321, 317, 404, 658 earlier); status 336 x 200, 1 x 301 (https apex), 1 x 308 (http apex); 0 x 4xx/5xx. New issues **2**, total issues 80 (unchanged total), Critical 0, Crawler Warnings 23, Metadata 55, Redirect 2, Content 0. Recrawls 10 of 10 available until 12/01 (none used).
| Issue type | 11-08 | 11-01 | Change | Moz Recommends Fixing | Note |
|---|---|---|---|---|---|
| URL Too Long | **55** | 56 | -2 fixed, **+1 new** | yes ("New") | the 2 long-slug posts are no longer flagged; 1 new = fragment URL `/blog/how-to-fill-out-form-5472#can-i-fill-out-form-5472-for-free` (93 chars, a `#anchor` link crawled as its own page); 54 unchanged |
| Meta Noindex | **23** | 22 | +1 new | yes ("New") | new = `/blog/topics/foreign-owned-llc/page/7` (blog now 206 posts, 9 /blog pages); the other 22 = /blog/page/2-9 (8), foreign-owned-llc/page/2-6 (5; +7 new), form-5472/page/2-8 (7), ftin/page/2 (1), /start - all deliberate |
| Temporary Redirect | 1 | 1 | 0 | yes | http://form5472prep.com 308 -> https (Vercel) |
| Redirect Chain | 1 | 1 | 0 | no | http apex -> https apex -> www |
| Duplicate Content and every other type | 0 | 0 | 0 | - | |
- **Renamed posts (confirmed):** `/blog/delaware-llc-annual-tax-2027-foreign-owner` -> **`/blog/delaware-llc-annual-tax-2027`** and `/blog/foreign-owned-llc-1099-nec-deadline-january-2027` -> **`/blog/1099-nec-deadline-2027-foreign-llc`**; both new slugs crawl 200 with no issue; `curl -IL` on the old slugs returns a redirect (1 hop) to the new ones and they are not in the crawl as 3xx pages.
- **`/form-7004-extension` title in the crawl: "Form 5472 Extension (Form 7004) — $19 · Form5472 Prep"** (was "$79" on 11-01) - confirmed.
- Inventory (338): 207 blog posts (200), /blog index 1 + 8 /blog/page/N, 14 topic hubs + 14 paginated topic pages, 13 /services pages, 2 /compare pages (new `/compare` index + `/compare/form-5472-filing-services`), 59 top-level pages, 20 parametrised calendar/fees pages. Two fragment URLs are now crawled as separate pages: `/about#who-reviews` and `/blog/how-to-fill-out-form-5472#...`. Crawl depth: 56 at d3, 148 at d4, 87 at d5, 35 at d6, 8 at d7. 81 pages carry an issue.
- Crawl titles for pages edited 11-04 (all index, 0 issues): /do-i-need-to-file-form-5472 "Do I Need to File Form 5472? 2-Minute Checker"; /irs-form-5472 "IRS Form 5472: What It Is, Who Files, and How (2026)"; /file-form-5472 "How to File IRS Form 5472 (2026 Step-by-Step Guide)"; /form-5472-deadline "Form 5472 Deadline: When Is It Due in 2026?"; /form-5472-penalty "Form 5472 $25,000 Penalty — How to Avoid or Reduce It"; /form-5472-vs-1120 "Form 5472 vs Form 1120 — What's the Difference?"; /form-5472-instructions "Form 5472 Instructions (2026) — Plain-English Walkthrough".

## 5. Page Optimization (`page-optimization.tsv`; Track & Monitor empty)
- Discover list "Weekly (Nov 1 - 7, 2026), as of Nov 7": **48 pairs** (65 on 11-01; 76 on 10-30). Only 10 pairs are shared with the 11-01 list (38 new pairs, 55 dropped) - the list follows the ranking URL x keyword.
- Discover scores: mean **76.6** (74.6), median 71. 71 x28, 79 x5, 88 x3, 100 x2, 86 x2, 82 x2, 96, 94, 85, 84, 73, 63 x1. Perfect (100): `/blog/form-5472-deadline-tomorrow-urgent-filing` for "form 5472 deadline" (#15) and `/services/late-form-5472-filing-service` for "late form 5472" (#6). Lost from the list since 11-01 (were 90+): final dissolved service 100, late filing service for its own keyword 100, white-label post 93, "form5472 prep" home 94, reportable-transactions examples 95/93, never-filed 90.
- ACC (noindex) pairs: **1** left (`/blog/page/3` "stripe paypal wise" #12, score 63) vs 14 on 11-01 - consistent with section 2b.
- Factors: I opened the Moz report only for `/do-i-need-to-file-form-5472` "do i need to file form 5472" (score 96): 25 helping / **2 hurting = Keywords in Meta Description, Keywords in Image Alt**, title/URL pass. Per-pair factor counts for the other 47 pairs were NOT read (UI would need 47 report page loads); scores of 71 map to the same failing set as last read (Te Tp U M D H I Tb) and 63 = + ACC, per `base/page-optimization.tsv`.
- Pages changed 11-04 that appear: **/do-i-need-to-file-form-5472** - "do i need to file form 5472" **96** (#11, new pair), "who must file form 5472" 82 (#14), "form 5472 preparer" 79 (#7, unchanged), "do i need an itin" 71 (#12, unchanged), "form 5472 requirements" 71 (#13); /irs-form-5472 - first year 71 (#4), file without a cpa 71 (#8), related party 71 (#17), all unchanged; /form-5472-instructions - tax year 2025 71 (#11), formation costs 71 (#11), etsy 71 (#4), irs form 5472 2026 71 (#6), deadline calculator 71 (#8); /file-form-5472 - capital contribution 71 (#13). `/form-7004-extension`, `/form-5472-deadline`, `/form-5472-penalty`, `/form-5472-vs-1120`, `/blog/form-5472-deadline-2026`: **no pair (no ranking)**. Best new pair: the 7004 post `/blog/form-5472-extension-vs-late-filing` for "form 7004 extension form 5472" 73 (#2), "late form 5472" 88 (#10), "statute of limitations" 79, "penalty for late filing" 71.

## 6. Not obtained / caveats
- **11-15 rank collection and crawl: not yet published by Moz** (latest = 11-08). Everything labelled "now" is 11-08.
- Per-keyword ranks below #20, traffic (no GA), Google's own indexation status, full inbound-link list (only the first 50 rows seen, all one.fsu.edu), per-pair failing-factor lists for 47 of 48 Discover pairs, 10-25/10-18 ranking URLs (copied from base, not re-read), second ranking URL per keyword.
- The Moz UI was redesigned since the last read (Rankings table now 25/page; analyze-keyword on app.moz.com); UI "Oct 3..Nov 7" = collections 10-04..11-08. UI "change" column on the Rankings table is vs the first date of the range (Oct 3), so I recomputed all changes vs 11-01 from `base/rankings.tsv`.
- The Moz DA 14 -> 39 and linking domains 84 -> 226 jump comes from `returnurl=`-parameter pages on one.fsu.edu; treat as Moz-index noise until a second month confirms.
- Tabs: only my own `tab-1` was used; `seed` (moz.com) and `tab-2` (app.moz.com) existed before/outside my work and were left alone. Chrome was never used.

## 11-15 / 11-16 update
Read 2026-11-16, read-only, Claude in-app browser only (UI tables; no Recrawl, no edits, no export). Moz posted the **2026-11-15 rank collection (UI "Nov 14") and the Nov 15 crawl**. Baseline = sections above (11-08).

### U1. Visibility and buckets
| Collection | Visibility | #1-3 | #4-10 | #11-20 | top-10 | top-20 |
|---|---|---|---|---|---|---|
| 11-08 | 0.98% | 6 | 18 | 17 | 24 | 41 |
| **11-15** | **1.66%** (+69.66% WoW; best since 10-04's 1.85%) | **14** | **31** | **17** | **45** | **62** |
Moved up 48 / down 30; 184 of 246 keywords not in top 20. AI Overviews present on 202 keywords, **cite us on 0** (11-08: 198 / 1). Dashboard: 45/246 keywords #1-10 (21 prior week), external links 529, DA 39 (unchanged), next update Nov 22.

### U2. Competitors (visibility; top-3 / top-10 / top-20, counted from the Competition table, top-10 matches dashboard)
| | Visibility 11-08 -> 11-15 | top-3 | top-10 | top-20 |
|---|---|---|---|---|
| Us | 0.98 -> **1.66** | 6 -> 14 | 24 -> 45 | 41 -> 62 |
| Form5472.online | 1.48 -> **1.73** | 10 -> 16 | 47 -> 45 | 66 -> 79 |
| Firstbase | 0.95 -> **0.13** | 8 -> 1 | 17 -> 1 | 19 -> 1 |
| doola | 0.27 -> **0.16** | 1 -> 1 | 7 -> 2 | 9 -> 5 |
We are now a close second to Form5472.online (gap 0.07 pts, from 0.50). Firstbase has almost vanished from this keyword set.

### U3. Named keywords, rank + URL, 11-15 vs 11-08
| Keyword | 11-08 | 11-15 | URL 11-15 |
|---|---|---|---|
| form 5472 filing service | 51+ | **#11** | /file-form-5472 |
| form 5472 preparer | #4 | #9 | /about |
| form 5472 preparation service | #7 (/) | #12 | /compare |
| hire someone to file form 5472 | 51+ | 21+ | - |
| final form 5472 for dissolved llc | 51+ | **#5** | /services/final-form-5472-for-dissolved-llc (money page back) |
| compare form 5472 filing services | 51+ | 21+ | - |
| late form 5472 filing service | 51+ | **#8** | /blog/form-5472-filed-late-never-filed (not the /services page) |
| form 7004 extension form 5472 | #2 (blog) | **21+** | - (lost) |
| form 5472 extension | 51+ | **#8** | /form-7004-extension (first rank for this page) |
| white label form 5472 filing | 51+ | 21+ | - |
| form5472prep | #8 (/about) | 21+ | - (lost) |
| form5472 prep | 51+ | **#8** | /about |
| vietnam residents | #3 | #3 | /blog/form-5472-vietnam-residents-us-llc |
| estonia residents | #2 | **#1** | /blog/form-5472-estonia-residents-us-llc |
| france / germany / spain / switzerland / indonesia residents | 51+ | 21+ | - (no change) |
Other: top-3 now (14): administratively dissolved llc #1 (/blog/reinstate-dissolved-llc-catch-up-form-5472), deadline calculator #1 (/form-5472-deadline-calculator), estonia #1, kdp authors #1, thailand #2, sign electronically #2, colombia #2, app developers #2, partner program #3, certificate of good standing #3, argentina #3, outsource preparation #3, brazil #3, vietnam #3. /form-5472-deadline-calculator, /form-5472-penalty-calculator (#7) now rank on their own pages.
Entered the top 20 (40 keywords vs 11-08), left it (19): nigeria residents (#1 -> 21+), form 7004 extension form 5472, first year, etsy sellers, no transactions, statute of limitations, vs 1040-nr, form5472prep, **do i need to file form 5472 (#11 -> 21+)**, formation costs, tax year 2025, penalty letter, related party, stripe paypal wise, requirements, hong kong, royalties, itin caa vs passport, penalty for late filing. Head terms (form 5472, irs form 5472, instructions, how to file, penalty) still 21+.
Caution: this is a weekly swing of +/-20 keywords both ways; one week does not make a trend (10-11 was 0.47%, 10-18 1.55%).

### U4. Site Crawl (latest Nov 15; next Nov 22)
339 pages crawled (338). New issues 0, total 80 (unchanged), Critical 0, Crawler Warnings 23, Metadata 55, Redirect 2, Content 0. URL Too Long 55, Meta Noindex 23, Temporary Redirect 1, Redirect Chain 1 - all identical to 11-08. Recrawls 10 of 10 unused.

### U5. AI Visibility dashboard 3465
**No 2026-11-16 run yet.** Page still says "Data as of Nov 9, 2026. Next data collection: Monday, Nov 16, 2026." Nothing new for mention rate or the 40 prompts; the 11-09 numbers in ai-visibility-and-research.md stand (ChatGPT 30.0 / 5.0 / 5.0 / 5.0; AI Mode 12.5 / 22.5 / 20.0 / 17.5). Re-read after the Nov 16 collection posts.
