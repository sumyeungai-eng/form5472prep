# Moz Pro re-read B: AI Visibility + research tools for form5472prep.com (delta vs 2026-10-07)

Extracted 2026-10-11 (read-only, own browser tab, Moz Pro account of sumyeungai@gmail.com). Baseline = `scratchpad/moz-1007/ai-visibility-and-research.md`. Nothing added/edited/deleted/exported/downloaded. Only report pages and the page's own read-only `*.fetch`/`*.lookup` JSON-RPC calls were used. (Moz app host is now app.moz.com; research pages still analytics.moz.com.)

**Data dates per section**
| Section | Moz data as of | Notes |
|---|---|---|
| 1 AI Visibility (dashboard 3465) | **single collection 2026-10-05 (unchanged)** - dashboard banner "Data as of Oct 5, 2026. Next data collection: Monday, Oct 12, 2026." | The Oct 12 AI run is NOT in yet (today is Oct 11). 0 new data. |
| 2 Domain Overview + ranking keywords | live run 2026-10-11 (DO query); keyword list "updated every two weeks", **byte-identical to the 2026-10-07 list**; Moz link index now through ~2026-10-04..10/07 | 80 ranking keywords (unchanged) |
| 3 Link Explorer | live 2026-10-11; newest discovered domain 10/04/2026; Spam Score still "updated quarterly"; Discovered/Lost window Aug 13 - Oct 11 | 62 linking domains, 164 links (was 61 / 154) |
| 4 Brand Authority | form5472prep.com + form5472.online re-read 2026-10-11; doola.com / firstbase.io NOT re-pulled (2-query Domain Overview cap) | us BA 1, F5472o BA 1 - unchanged |

---

## 1. AI Visibility dashboard "Form5472prep" (id 3465)

### 1.0 Collection status (the headline)
- Dashboards list page (all 8 dashboards): **Form5472prep "Latest collection: Oct 5, 2026"**, Prompts 40; Milemarketplace also Oct 5. (The Taxley dashboards show Oct 11 - they run on another cycle; not opened.) Quota line on the list page: "6 of 6 Dashboards | 201 of 300 Prompts" (plan was bumped, Moz banner: "6 AI Visibility dashboards, 300 tracked prompts").
- Per-engine response rows pulled via `ai.tracking.project.responses.fetch` (chatgpt/web, aimode/first_page, gemini/web, perplexity/web): every `collected_at` is **2026-10-05** (ChatGPT 11:10-11:22, AI Mode 11:09-11:26, Gemini 11:08-11:17, Perplexity 11:12-11:14). Collected prompts: ChatGPT 18, AI Mode 18, Gemini 18, Perplexity 17 of 40. **Not collected: 22 (ChatGPT/AI Mode/Gemini), 23 (Perplexity)** = identical to baseline. No prompt has gained data; the 22 prompts with no data are the same 22 listed in the 2026-10-07 file (1.0 there). Prompts tab "Total Rows: 40": only "is form5472 prep legit?" (5 citations) and "is there a flat-fee form 5472 filing service?" (4) rank "1st"; the other 38 "Not mentioned" - identical.
- `ai.tracking.project.metrics.fetch.latest`: collection_date 2026-10-05 for all brand x engine rows; `*_30_day_average` still null/0 (no trend).
- Sentiment tab: still fails. Page now shows "Unable to load sentiment / Internal error"; the async job `beta.ai.brand.sentiment.v3.fetch.background` goes pending -> processing -> complete with error code -32650 "Internal error" (HTTP 500 equivalent). Brand-level sentiment themes NOT obtainable (same as baseline). Response-level labels (below) unchanged.

### 1.1 Per-engine headline - now vs baseline (identical; same 2026-10-05 collection)
Presence = responses naming the brand / Moz response count (19; PPX 18). Avg first pos = % of response length where first mention sits (lower = earlier).

| Engine | Us now (=baseline) | Form5472.online | Doola | Firstbase | Our rank of 4 |
|---|---|---|---|---|---|
| ChatGPT | 10.53% (2/19), first pos 6.67% | 15.79% (3/19), 45.61% | 5.26% (1/19), 52.76% | 0% (0/19) | 2nd |
| Google AI Mode | 21.05% (4/19), 32.91% | 15.79% (3/19), 21.49% | 21.05% (4/19), 16.14% | 15.79% (3/19), 26.62% | 1st (tied with Doola) |
| Gemini | 10.53% (2/19), 39.18% | 26.32% (5/19), 36.76% | 42.11% (8/19), 30.43% | 42.11% (8/19), 39.33% | 4th |
| Perplexity | 5.56% (1/18), 5.69% | 5.56% (1/18), 42.79% | 11.11% (2/18), 7.49% | 11.11% (2/18), 14.20% | 3rd |

**Delta vs 2026-10-07 baseline: none** (every presence %, average position, count matches).

### 1.2 Mention counts, share of voice, "mentioned first" (recomputed from the raw responses; 18 prompts with data per engine, PPX 17)
| Engine | US (SoV, first) | Form5472.online | Doola | Firstbase | No tracked brand named |
|---|---|---|---|---|---|
| ChatGPT | 2 (33.3%, 2) | 3 (50.0%, 3) | 1 (16.7%, 0) | 0 (0%, 0) | 13/18 |
| Google AI Mode | 4 (28.6%, 4) | 3 (21.4%, 2) | 4 (28.6%, 4) | 3 (21.4%, 0) | 8/18 |
| Gemini | 2 (8.7%, 2) | 5 (21.7%, 2) | 8 (34.8%, 5) | 8 (34.8%, 1) | 8/18 |
| Perplexity | 1 (16.7%, 1) | 1 (16.7%, 1) | 2 (33.3%, 2) | 2 (33.3%, 0) | 13/17 |
| All 4 engines | 9 | 12 | 15 | 13 | 42 |
Response-level sentiment labels (not brand-specific): ChatGPT neutral 7 / negative 8 / positive 2 / mixed 1; AI Mode neutral 8 / negative 6 / positive 2 / mixed 2; Gemini neutral 7 / negative 8 / mixed 3; Perplexity neutral 17 - identical to baseline.

### 1.3 Per-prompt table (18 prompts with data; cell = brands named in order @ first-mention depth %, citations, response sentiment; US = Form5472prep, F = Form5472.online, D = Doola, FB = Firstbase; "-" none of the 4)
| Prompt | ChatGPT | Google AI Mode | Gemini (no citations returned) | Perplexity |
|---|---|---|---|---|
| is form5472 prep legit? | **US@0** c5 neu | **US@0** c2 neg | F@1 (US not named) c0 mix | **US@6** c1 neu |
| is there a flat-fee form 5472 filing service? | **US@13** c4 pos | F@19 c3 neu | D@11>FB@12>F@32 c0 | - c1 |
| alternatives to doola for form 5472 filing | - c0 (stub) | D@2>F@23 c5 pos | D@1>F@31>FB@68 | D@10>FB@20 c1 |
| best form 5472 preparer for non-resident llc owners | F@79 c1 neg | D@44>FB@44 c4 mix | F@21>FB@54>D@63 mix | F@43 c1 |
| can form 5472 be faxed to the irs | - c2 | - c3 | - | - c1 |
| do i need to file a final form 5472 when i dissolve my llc? | - c2 | - c2 neg | - | - c1 |
| do i need to file form 5472 if my llc had no income? | - c3 neg | - c4 | - neg | - c1 |
| doola vs firstbase for form 5472 filing | - c0 (stub) | D@0>FB@5 c5 pos | D@0>FB@1>F@99 neg | D@5>FB@8 |
| how can accountants outsource form 5472 preparation for clients? | - c4 pos | - c3 neg | - neg | - c2 (cites OUR homepage + partner post, not named) |
| how do i file form 5472 if i am not a us resident? | - c4 neg | - c1 | - neg | - c1 |
| how much does form5472 prep cost? | - c0 (stub) | **US@25** c4 neg | D@55>FB@56 (US not named) neg | - c1 (cites OUR homepage, not named) |
| how much does it cost to hire someone to file form 5472? | - c7 neg (cites OUR /pricing, not named) | **US@32** c4 | **US@25**>FB@61>D@62 neg | no response |
| what is the best service to file form 5472 for a foreign-owned llc? | F@19 c8 neg | F@22 c3 mix | FB@32>D@32 | - c1 |
| what is the cheapest way to file form 5472 and pro forma 1120 online? | - c3 mix | **US@75** c6 | **US@54** mix | - c1 |
| what is the form 5472 deadline for a foreign-owned single-member llc? | - c4 neg | - c3 neg | - neg | - c1 |
| what is the form 5472 penalty and how can i avoid it? | - c4 neg | - c5 neg | - neg | - c1 |
| which companies help foreign founders with us llc tax compliance? | F@39>D@53 c9 neg | D@19>FB@31 c7 | D@19>FB@32 | - c3 |
| who can file form 5472 and the pro forma 1120 for my single-member llc? | - c2 | - c4 | - | - c1 |
| **Our mentions** | 2 | 4 | 2 | 1 |
**Prompts newly with data since baseline: NONE.** (Every row above matches the 2026-10-07 table; the 22 no-data prompts are still empty until the Oct 12 run.)

### 1.4 Citations (recomputed from responses; utm_source stripped)
Totals unchanged: ChatGPT 62 citations / 35 unique URLs / 17 domains; AI Mode 68 / 48 / 26; Perplexity 19 / 14 / 8; Gemini 0 (no citations in Moz). Combined 149 citations across 41 domains.
Top cited domains (all engines; cha / aim / per): irs.gov 48 (35/8/5) · form5472.online 16 (3/13/0) · **form5472prep.com 13 (7/2/4)** · youtube.com 7 (aim 7) · form5472.ai 5 (3/2/0) · hiltzikcpa.com 4 · entity.inc 4 (aim) · trustpilot.com 3 · genzone.com / ecommerceparadise.com / hcvt.com 3 each (aim) · wise.com 3 (per) · edetax.com / jamesbakercpa.com / gettaxhub.com / reddit.com / nonresident.tax / google.com / form5472.io / terms.law 2 each. **Identical to baseline.**

**OUR URLs cited (engine | URL | citation position | prompt)** - identical to baseline:
| Engine | URL | Pos | Prompt | Brand named in answer? |
|---|---|---|---|---|
| ChatGPT | form5472prep.com/pricing | 1 | how much does it cost to hire someone to file form 5472? | NO |
| ChatGPT | form5472prep.com/pricing | 1 | is there a flat-fee form 5472 filing service? | yes (1st) |
| ChatGPT | form5472prep.com (home) | 2 | is there a flat-fee form 5472 filing service? | yes |
| ChatGPT | form5472prep.com/about, /terms, /security, /data-retention (pos 1-4) + trustpilot.com/review/form5472prep.com (5) | | is form5472 prep legit? | yes (1st) |
| AI Mode | form5472prep.com/pricing | 2 | how much does form5472 prep cost? | yes (1st) |
| AI Mode | form5472prep.com (home) | 3 | how much does it cost to hire someone to file form 5472? | yes (1st) |
| AI Mode | trustpilot.com/review/form5472prep.com | 1 | is form5472 prep legit? | yes (1st) |
| Perplexity | form5472prep.com (home) | 1 | how can accountants outsource form 5472 preparation for clients? ; how much does form5472 prep cost? | NO (cited, not named) in both |
| Perplexity | form5472prep.com/blog/form-5472-partner-program-how-it-works | 2 | how can accountants outsource form 5472 preparation for clients? | NO |
| Perplexity | form5472prep.com/about | 1 | is form5472 prep legit? | yes (1st) |
| Gemini | none (engine returns no citations) | | | |

**Target pages check** (/compare/form-5472-filing-services, /form-5472-statistics, /form-5472-example, /form-5472-penalty, /form-5472-instructions): **NONE cited by any engine.** (One substring hit for "form-5472-penalty" is `wgcpas.com/article/form-5472-penalty-relief`, a third-party page, not ours.) No blog/guide page other than the partner-program post is cited. Three of the target prompts for those pages ("form 5472 statistics and penalty figures", "how many foreign-owned companies file form 5472", "form 5472 penalty calculator") are among the 22 prompts with no data yet, so the first real read of those pages' AI value is the Oct 12 collection.

---

## 2. Domain Overview for form5472prep.com (run 2026-10-11; domain scope, market US en-US)
Credits: Domain Overview quota read 90 of 100 before, 89 after query 1 (form5472prep.com), 88 after query 2 (form5472.online) = **2 DO queries used** (cap respected). Keyword Research pool reads 3,761 of 5,000 (was 3,764 at the end of the 10-07 session); Link Explorer pool 19,962 of 20,000 (was 19,965) - the 3-point drops are not attributable to this session's page views (the pool did not move while I loaded 5 Link Explorer reports).

### 2.1 Headline metrics, now vs 2026-10-07
| Metric | 2026-10-07 | **2026-10-11** | Delta |
|---|---|---|---|
| Domain Authority | 10 | **10** | 0 (12-month chart 1 -> 10, rising; last point 2026-10-01) |
| Brand Authority | 1 | **1** | 0 |
| Page Authority (homepage) | 28 | **28** | 0 |
| Spam Score (domain) | 16% | **16%** | 0 (Link Explorer "Spam Score" tab; quarterly refresh) |
| Linking root domains | 61 | **62** | +1 (currentchron.com, see 3.2) |
| Linking domains discovered, last 60 days | 59 | **58** | window rolled; lost still 0 |
| Inbound links | 154 (140 followed) | **164 (148 followed)** | +10 rows (+8 followed, +2 nofollow) |
| Ranking keywords (Moz US) | 80 | **80** | 0 |
| Keywords #1-3 / #4-10 / #11-20 / #21-30 / #31-40 / #41-50 | 5/2/2/7/9/4 | **5/2/2/7/9/4** | 0 |
| Domain search theme | International Tax Compliance | International Tax Compliance | same |
| Keyword topics | 5 listed | same 5 (Form 5472 filing requirements; CPE for foreign-owned LLCs; IRS reporting for foreign shareholders; cross-border tax documentation; CPE credit for international tax professionals) | same |
Competitor Overview (Moz auto "true competitors"): taxule.com 18 kw / PA 16 (was 15) / DA 3; en-se.tkegexpat.com 7 kw / PA 16 (was 15) / DA 15 (was 14); easyfiling.com 8.3k kw / PA 37 / DA 57; us 80 / 5 / 2. Keyword opportunities widget: still only "form 5472 rental property llc" (lift 0). Link-opportunities widget: gofreebacklinks.com, **wants.cfd (new, replaces starcourts.com)**, super-seotools.com, techbullion.com, developmentmi.com (low value / link-farm style).
Top pages by linking domains: homepage PA 28 = 62 linking domains; every inner page = 0. Top-5 list now shows /blog/form-5472-client-intake-checklist-for-firms, **/blog/topics/influencers (new)**, /start?v=below&src=form-5472-instructions&tier=premium, /blog/topics/south-korea (each PA 14, 0 linking domains); /blog/form-5472-singapore-residents-us-llc dropped out of the top 5. "Top pages with 4xx": no data.
Frequently used anchors: PBN sentence "high quality dofollow backlinks da 50 pa 40 premium pbn network service form5472prep.com rank first page google fast seo link building buy backlinks online cheap" = **54 domains / 146 followed external links** (was 53 / 138); "form5472prep.com" 1 domain / 2 links (from form5472.online).

### 2.2 Ranking keywords (Keyword Research > Ranking Keywords, US, domain scope, 2026-10-11)
**Delta vs 2026-10-07: NONE.** The 80 rows (keyword, rank, ranking URL, difficulty, volume) hash byte-identical (SHA-256 of the normalised list) to the 10-07 list: **0 new keywords, 0 lost keywords, 0 position changes (>= 5 or otherwise).** Moz keyword data refreshes every two weeks, so the 2026-10-08..10-11 site changes (new /compare/form-5472-filing-services, /form-5472-statistics, /form-5472-example, /form-5472-instructions etc.) are not visible in Moz ranking data yet; none of those URLs ranks for any keyword. Tracked-campaign keywords flagged by Moz: 13 (form 5472 preparation service, form 5472 preparer, late form 5472 filing service, hire someone to file form 5472, form 5472 fax filing service, form 5472 help, 1120 and 5472 filing service, form 5472 deadline, form 5472 for bookkeepers, pro forma 1120 filing service, form 5472 extension, form 5472 penalty relief, form 5472 for cpas). Only 3 keywords at #1 (/services vol 36; /services/pro-forma-1120-filing-service and /faq vol 0); /blog/what-is-form-5472 is the ranking URL for 29 of 80.

Full list (identical to 10-07; sorted by rank; Vol 0 = Moz sub-threshold):

| # | Keyword | Pos | Ranking URL | KD | Vol |
|---|---|---|---|---|---|
| 1 | form 5472 preparation service | 1 | /services | 7 | 36 |
| 2 | form 5472 preparer | 1 | /services/pro-forma-1120-filing-service | 23 | 0 |
| 3 | form 5472 preparation service pdf | 1 | /faq | 25 | 0 |
| 4 | 5472 form filling | 2 | /file-form-5472 | 6 | 0 |
| 5 | form 5472 outsourcing | 3 | /blog/form-5472-in-house-vs-outsourced-firm | 34 | 0 |
| 6 | form 5472 fax filing service reddit | 8 | /blog/how-to-fax-form-5472-irs | 53 | 0 |
| 7 | form 5471 reasonable cause decision tree | 9 | /blog/topics/foreign-owned-llc | 19 | 11 |
| 8 | form 5472 and pro forma 1120 filing service instructions | 11 | /blog/pro-forma-form-1120-foreign-owned-llc | 42 | 0 |
| 9 | form 5472 rental property llc | 17 | /blog/form-5472-us-real-estate-foreign-investor | 21 | 0 |
| 10 | late form 5472 filing service | 21 | /blog/form-5472-filed-late-never-filed | 35 | 0 |
| 11 | hire someone to file form 5472 | 23 | /blog/form-5472-diy-vs-preparer | 37 | 0 |
| 12 | does a foreign owned single member llc need an ein | 24 | /blog/ein-responsible-party-foreign-owned-llc | 15 | 27 |
| 13 | 1120 and 5472 filing service 2022 | 24 | /blog/form-5472-small-corporation-reasonable-cause | 32 | 0 |
| 14 | form 5472 fax filing service | 24 | /blog/how-to-fax-form-5472-irs | 40 | 0 |
| 15 | what is the penalty for filing 5472 late? | 25 | /blog/form-5472-filed-late-never-filed | 31 | 0 |
| 16 | foreign owned single member llc filing requirements california | 30 | /blog/california-llc-foreign-owner-tax-filing | 32 | 0 |
| 17 | form 5472 cpe course | 31 | /about | 16 | 0 |
| 18 | form 5472 deadline 2026 | 31 | /blog/form-5472-deadline-2026 | 24 | 0 |
| 19 | form 5472 preparation example | 32 | /about | 37 | 0 |
| 20 | how long to get an itin | 34 | /blog/itin-processing-time-status-delays | 48 | 55 |
| 21 | how long does it take to get a itin | 34 | /blog/itin-processing-time-status-delays | 47 | 11 |
| 22 | how much does it cost to file form 5472? | 34 | /blog/what-is-form-5472 | 29 | 0 |
| 23 | form 5472 help | 36 | /blog/what-is-form-5472 | 20 | 0 |
| 24 | form 5472 for real estate llc foreign owned | 36 | /blog/form-5472-us-real-estate-foreign-investor | 34 | 0 |
| 25 | how long does it take to apply for an itin | 38 | /blog/itin-processing-time-status-delays | 49 | 0 |
| 26 | 1120 and 5472 filing service | 43 | /services/pro-forma-1120-filing-service | 42 | 0 |
| 27 | how long does it take to generate itin? | 43 | /blog/itin-processing-time-status-delays | 49 | 0 |
| 28 | form 5472 deadline | 46 | /blog/form-5472-deadline-2026 | 30 | 2 |
| 29 | what is a 5472? | 50 | /blog/what-is-form-5472 | 41 | 0 |
| 30 | 5472 us | 52 | /blog/what-is-form-5472 | 39 | 0 |
| 31 | what is form 5472 | 54 | /blog/what-is-form-5472 | 43 | 64 |
| 32 | federal form 5472 | 54 | /blog/what-is-form-5472 | 45 | 3 |
| 33 | form 5272 | 55 | /blog/what-is-form-5472 | 44 | 6 |
| 34 | single member llc foreign owned california | 55 | /blog/california-llc-foreign-owner-tax-filing | 28 | 0 |
| 35 | form 5472 for bookkeepers | 56 | /services/form-5472-filing-service | 28 | 0 |
| 36 | irs 5472 | 57 | /blog/what-is-form-5472 | 50 | 39 |
| 37 | do i have to file form 5472? | 57 | /blog/what-is-form-5472 | 41 | 0 |
| 38 | how long does it take for itin to arrive? | 57 | /blog/itin-processing-time-status-delays | 42 | 0 |
| 39 | forms 5472 | 58 | /blog/what-is-form-5472 | 39 | 47 |
| 40 | tax form 5472 | 58 | /blog/what-is-form-5472 | 45 | 1 |
| 41 | what is form 5472 used for | 59 | /blog/what-is-form-5472 | 41 | 6 |
| 42 | does taxact support form 5472? | 59 | /blog/what-is-form-5472 | 34 | 0 |
| 43 | rev proc 91-55 | 60 | /blog/what-is-form-5472 | 26 | 27 |
| 44 | new form 5472 | 60 | /blog/what-is-form-5472 | 38 | 0 |
| 45 | how do i get a non resident itin number? | 63 | /blog/itin-application-checklist-nonresidents | 39 | 27 |
| 46 | mi 5472 | 63 | /blog/what-is-form-5472 | 41 | 1 |
| 47 | 5472 penalty abatement | 64 | /form-5472-penalty | 32 | 24 |
| 48 | form 5472 irs | 65 | /blog/what-is-form-5472 | 50 | 24 |
| 49 | form 5472 due date pdf | 65 | /blog/form-5472-deadline-2026 | 35 | 0 |
| 50 | extension form 5472 | 66 | /blog/what-is-form-5472 | 24 | 0 |
| 51 | form 5472 help sample | 66 | /blog/how-to-fill-out-form-5472 | 35 | 0 |
| 52 | form 5472 1f | 66 | /blog/what-is-form-5472 | 38 | 0 |
| 53 | pro forma 1120 filing service | 66 | /1120-pro-forma-instructions | 38 | 0 |
| 54 | form 5472 preparer for non resident online | 66 | / | 40 | 0 |
| 55 | 5472 nra | 68 | /blog/what-is-form-5472 | 32 | 27 |
| 56 | 5472 1f | 68 | /blog/what-is-form-5472 | 42 | 0 |
| 57 | how to apply for itin from india | 69 | /blog/itin-application-checklist-nonresidents | 35 | 1 |
| 58 | foreign owned multi member llc | 70 | /blog/multi-member-llc-form-5472-or-1065 | 15 | 64 |
| 59 | form 5472 cost sharing arrangement | 71 | /blog/what-is-form-5472 | 34 | 3 |
| 60 | form 5472 for real estate llc foreign owned download | 71 | /services/final-form-5472-for-dissolved-llc | 40 | 0 |
| 61 | form 5472 extension | 72 | /blog/what-is-form-5472 | 40 | 1 |
| 62 | form 5472 history | 72 | /blog/what-is-form-5472 | 39 | 0 |
| 63 | pro forma 1120 filing service example | 73 | /1120-pro-forma-instructions | 28 | 0 |
| 64 | form 5472 reportable transaction capital contribution | 74 | /blog/what-is-form-5472 | 28 | 24 |
| 65 | form 5472 instructions part vi | 74 | /blog/what-is-form-5472 | 38 | 0 |
| 66 | form 5472 penalty relief | 75 | /form-5472-penalty | 27 | 0 |
| 67 | form 5472 for tax preparers instructions | 76 | /about | 40 | 0 |
| 68 | us taxes on foreign subsidiary irc | 78 | /blog/does-foreign-owned-llc-pay-us-tax | 31 | 1 |
| 69 | penalty relief form 5472 | 78 | /blog/what-is-form-5472 | 27 | 0 |
| 70 | form 5472 filing instructions | 81 | /file-form-5472 | 41 | 11 |
| 71 | form 5472 filing for cpa firms example | 81 | /blog/irs-official-exchange-rate-form-5472 | 3 | 0 |
| 72 | can california llc have foreign members | 82 | /blog/california-llc-foreign-owner-tax-filing | 32 | 0 |
| 73 | what are reportable transactions for form 5472 | 85 | /blog/what-is-form-5472 | 38 | 8 |
| 74 | form 5472 preparer for non resident | 86 | /about | 32 | 0 |
| 75 | form 5472 disregarded entity | 87 | /blog/what-is-form-5472 | 45 | 55 |
| 76 | itin verification documents | 87 | /blog/itin-application-checklist-nonresidents | 37 | 1 |
| 77 | form 5472 help pdf | 92 | /file-form-5472 | 22 | 0 |
| 78 | form 5472 for cpas | 92 | /about | 29 | 0 |
| 79 | form 5472 filing for cpa firms | 96 | /about | 25 | 0 |
| 80 | form instructions 5472 | 96 | /file-form-5472 | 31 | 0 |

---

## 3. Link Explorer for form5472prep.com (root domain, run 2026-10-11)
Queries used: **1 Link Explorer target (form5472prep.com)** viewed through Overview, Linking Domains, Inbound Links, Discovered & Lost and Spam Score reports (cap was 3; no Link Intersect, no competitor Link Explorer run). Pool 19,962 of 20,000 until 10/30, unchanged across all report page loads.

### 3.1 Summary now vs 2026-10-07
| Metric | 2026-10-07 | **2026-10-11** |
|---|---|---|
| DA / PA / Spam Score (domain) | 10 / 28 / 16% | **10 / 28 / 16%** |
| Linking root domains | 61 | **62** |
| Discovered last 60 days / lost | 59 / 0 | **58 / 0** (Aug 13 - Oct 11 window: +58, -0, net +58) |
| Inbound links (rows) total / followed | 154 / 140 | **164 / 148** (16 nofollow rows) |
| External links follow / nofollow | 90.9% / 9.1% | **90.2% / 9.8%** |
| Spam score of linking domains | 98.2% in 1-30%, 1.8% in 61-100% (8coint.com 61%) | **same** |
| Linking domains where anchor = PBN advert sentence | 53 (138 links) | **54 (146 links)** |
| All links land on | homepage | homepage (inner pages: 0 linking domains) |

### 3.2 NEW linking domains since the 10-07 baseline (exactly ONE)
Diff of the 62-domain Linking Domains list against the 61-domain baseline list: **+1 new, 0 lost.**
| Domain | DA | Linking-domain count (LD) | Spam | Found | Source URL | Anchor | Target | Followed? | Class |
|---|---|---|---|---|---|---|---|---|---|
| currentchron.com | 58 | 235 | 1% | 10/04/2026 (crawled 10/04) | currentchron.com/all/1102/22.html (2 rows: direct + via redirect), title "Boost your Google rankings with Premium PBN & Link Building" | "high quality dofollow backlinks da 50 pa 40 premium pbn network service form5472prep.com rank first page google fast seo link building buy backlinks online cheap" | https://form5472prep.com (homepage) | **followed** | **PBN-advert spam pattern** |
**No new genuine/editorial link.** Newest-first discovered list (date found): currentchron.com 10/04, texturometer.com 09/29, form5472.ai 09/25, raiseold.com 09/22, reisenweg.com 09/20, drjack.world 09/18, wioutlet.com 09/12 (everything from 10-07 baseline back is unchanged). Lost links: **none** (Total Lost -0).

### 3.3 Other link-row changes on EXISTING domains (+9 rows, no new domain)
- 6 extra followed PBN rows = three existing PBN domains now show a `www.` duplicate row-pair (4 rows instead of 2); PBN hosts with 4 rows: 19 (was 16), with 2 rows: 35 (was 37); 146 followed PBN rows = 19x4 + 35x2. Moz does not show first-seen per row, so which three is inferred: `www.` copies with crawl dates after the 09/29 index cut are `www.sahammurah.com` 10/06, `www.bestnz-poker-casinoslot.com` 10/06, `www.mymarketpost.com` 10/05, `www.kkinsider.com` 10/02, `www.mediaboooster.com` 10/01, `www.bestofthefirstcoast.com` 10/01, `www.cgpa2percentag.com` 09/30 (the others, aloysionunes 09/26 and blogerreviewers 09/28, pre-date it). Same spam network, same anchor, same target (homepage); no new domain.
- +2 nofollow rows: `dailymusings.top` now has BOTH `/stats/139402` and `/stats/139401` (crawled 10/07, anchor "form5472prep.com").
- form5472.online editorial link: DA now 16 (was 17), spam 11%, followed; source slug is now `form5472.online/post/form-5472-filing-services-compared-credentials-reviews-pricing-evidence` (baseline recorded `/post/form-5472-filing-services`), anchor "form5472prep.com". form5472.ai still nofollow on `/providers` (DA 13, spam 3%).
- DA/LD refreshes on PBN domains (e.g. cmocheatsheets 785 linking domains, cvillico 673): metric noise only.

### 3.4 Classification of all 62 linking domains
| Class | Domains | Link rows | Followed |
|---|---|---|---|
| PBN-advert spam (`/all/1102/22.html`, premium-PBN anchor, DA 40-63 plus royaldb.us.com DA 4) | **54** (was 53) | 146 (was 138) | all followed |
| Automated report/stats pages (drjack.world, quero.party, atomizelink.icu, dailymusings.top, optimizeflow.top; + 8coint.com "High-quality backlink service", spam 61%) | 6 | 14 (was 12) | all nofollow |
| Competitor editorial (form5472.online followed, form5472.ai nofollow) | 2 | 4 | 2 followed rows (from F5472o), 2 nofollow |
| **Genuine / earned (non-competitor, non-spam)** | **0** | 0 | |
Rows: 146 + 14 + 4 = 164. The same 54-domain / 146-link PBN network anchor now appears on form5472.online too (see 4).

---

## 4. Brand Authority (Domain Overview; us + form5472.online re-read; 2 DO queries)
| Metric | form5472prep.com 10-07 -> **10-11** | form5472.online 10-07 -> **10-11** | doola.com | firstbase.io |
|---|---|---|---|---|
| Brand Authority | 1 -> **1** | 1 -> **1** | 28 (10-07; **not re-pulled**) | 28 (10-07; **not re-pulled**) |
| Domain Authority | 10 -> **10** | 17 -> **16** (-1) | 38 (10-07) | 37 (10-07) |
| Page Authority (homepage) | 28 -> **28** | 33 -> **33** | 49 | 47 |
| Linking root domains | 61 -> **62** | 276 -> **282** (discovered 60d 85 -> 90; lost 3 -> 3) | ~4.6k | ~1.9k |
| Ranking keywords (US) | 80 -> **80** | 274 -> **274** (13 at #1-3, 29 at #4-10 - unchanged) | ~7k | ~3k |
Notes: BA has not moved for either niche filer (both 1) and the formation brands were 28 on 10-07; doola.com / firstbase.io were not re-pulled because the Domain Overview cap (2 queries) went to us + form5472.online (the AI Visibility data, which names Doola/Firstbase heavily, did not change either - section 1). form5472.online's Moz "top search competitors" are now irs.gov (332.8k kw), kkca.io (3.9k), patellawoffices.com (1.9k); its link-opportunity list now includes grokipedia.com, taxsharkinc.com, quero.party, drjack.world, thetaxtimes.com; and its anchor profile gained a second spam pattern: "premium twinsalgo.com backlinks designed to increase google search visibility" (7 domains / 7 links) alongside the same 54-domain / 146-link PBN sentence as ours.

---

## 5. What was NOT obtainable / limits
1. **Oct 12 AI collection not in** (banner: "Next data collection: Monday, Oct 12, 2026"); Form5472prep dashboard still shows "Latest collection: Oct 5, 2026". The 22 prompts with no data (incl. "form 5472 statistics and penalty figures", "form 5472 penalty calculator", "how many foreign-owned companies file form 5472", "what is a pro forma 1120 and who has to file it") stay empty; no trend, no 30-day averages.
2. Sentiment tab still errors (async `beta.ai.brand.sentiment.v3.fetch.background` -> "Internal error"); brand-level sentiment themes unavailable.
3. Gemini returns no citations in Moz; the dashboard has no Google AI Overviews engine.
4. Moz ranking-keyword data refreshes every two weeks and showed zero change; it cannot yet say whether the new /compare, /form-5472-statistics, /form-5472-example, /form-5472-instructions pages rank.
5. doola.com / firstbase.io Brand Authority not re-pulled (2 Domain Overview query cap); last known 28 / 28 (10-07).
6. Moz Link Explorer's "Date Found" is per linking domain only; per-link first-seen dates are not shown (inferred new rows from crawl dates in the Spam Score tab).
7. Sessions note: the browser pane was hidden part of the time (screenshots failed); everything was read from page text / the page's own read-only fetch calls. Nothing was exported, edited, saved or created in Moz.
