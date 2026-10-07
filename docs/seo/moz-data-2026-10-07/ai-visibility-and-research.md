# Moz Pro extraction B: AI Visibility + research tools for form5472prep.com

Extracted 2026-10-07 (read-only, own browser tab, Moz Pro account of sumyeungai@gmail.com). Nothing was added, edited, deleted, exported or downloaded; only report/analysis pages were opened and the page's own read-only data calls were reused.

**Data dates per section**
| Section | Moz data as of | Notes |
|---|---|---|
| 1 AI Visibility (dashboard 3465) | single collection 2026-10-05 (next 2026-10-12) | 18 of 40 prompts have data; no trend yet |
| 2 Domain Overview + ranking keywords | live run 2026-10-07; Moz keyword data "updated every two weeks"; link index ~2026-09-29 latest discovery | 80 ranking keywords |
| 3 Link Explorer | live 2026-10-07; Spam Score "updated quarterly" | 61 linking domains, 154 links |
| 4 Link Intersect | live 2026-10-07 | 2 runs (5 competitors each); 500-row cap |
| 5 Keyword Gap | live 2026-10-07 | 9,749 gap rows; Moz top-50 rank window |
| 6 Brand Authority | live 2026-10-07 | 3 extra Domain Overview runs |

**Credits used by me (all within plan):** Domain Overview 4 (one per domain: form5472prep.com, form5472.online, doola.com, firstbase.io; 94 -> 90 of 100 left until 11/01); Link Explorer pool 9 (two Link Intersect runs; 19,974 -> 19,965 of 20,000 left until 10/30; the Link Explorer pages themselves did not visibly decrement); Competitive Research 4 (one Keyword Gap run; 75 -> 71 left until Nov 1); Keyword Research ranking-keywords page no visible decrement (3,764 of 5,000).

**Things Moz would NOT give / limits:** (a) Sentiment tab: the backing call returns HTTP 500 "Internal error" for all 4 engines, so brand-level sentiment themes are unavailable (only response-level sentiment labels, section 1); (b) Gemini returns no citations in Moz; (c) the dashboard has no Google AI Overviews engine (ChatGPT, Google AI Mode, Gemini, Perplexity only); (d) Link Intersect caps at 500 rows; (e) the 22 newest AI prompts have no response until 2026-10-12.

---

## 1. AI Visibility dashboard "Form5472prep" (id 3465)

### 1.0 Dashboard facts
- Brand = Form5472prep (domain form5472prep.com). Brand terms tracked: `Form5472prep` (primary), `Form5472 Prep`, `form5472prep.com`. Competitors: Form5472.online, Doola, Firstbase (one term each).
- Engines tracked (dropdown): ChatGPT (web), Google AI Mode (first_page), Gemini (web), Perplexity (web). Tabs: Brand Visibility, Sentiment (New/beta), Citations, Prompts. (No AI Overviews engine in this dashboard.)
- Prompts: 40 tracked. Created: 18 on 2026-10-05 11:07 (collected 11:13-11:20 same day), 1 on 13:01, 21 on 13:26. **Only 18 prompts have a collected response on any engine** (Perplexity 17). **22 prompts have no data yet** (collected_at = null on all 4 engines; first collection scheduled Mon 2026-10-12): 
  best way to file form 5472 for a stripe atlas company · can form 5472 be filed electronically or only by fax or mail · can my bookkeeper file form 5472 for my us llc · do accountants file form 5472 for foreign-owned llc clients · do i need form 5472 if i only put money into my llc · does a delaware llc owned by a foreign person need to file form 5472 · does a wyoming llc owned by a non-resident need to file form 5472 · form 5472 filing service for a dormant llc · form 5472 filing service with a fax confirmation receipt · form 5472 penalty calculator · form 5472 preparer for a foreign-owned llc · form 5472 statistics and penalty figures · how do i file form 5472 late for past years and handle the penalty? · how do i write a reasonable cause statement for a late form 5472 · how does a foreign-owned llc get an ein without an ssn · how many foreign-owned companies file form 5472 · what counts as a reportable transaction on form 5472 · what happens if i never file form 5472 for my llc · what is a pro forma 1120 and who has to file it · what is the diirsp for a late form 5472 · white label form 5472 filing for accounting firms · who can i hire to file form 5472 for my llc
- Moz's own response denominator is 19 per engine (Perplexity 18), one more than the 18 prompts I can see with data; the Prompts table in the UI shows the "stripe atlas" prompt as "Not mentioned / 0 citations" (empty). Treat Moz percentages as x/19 (x/18 Perplexity).
- Trend: **no trend exists**; `latest_collection_date_by_engine` = 2026-10-05 for all 4 engines and the history call returns only the 2026-10-05 point. 30-day averages are null/0.
- Sentiment tab: UI renders only the "Welcome to Brand Sentiment Analysis" panel; the backing API call `beta.ai.brand.sentiment.v3.fetch` returned HTTP 500 "Internal error" for all 4 engines (tried twice in the session). Only per-response `sentiment_label` (a response-level label, not brand-specific) is available; summarised below.

### 1.1 Per-engine headline (Moz "latest" metrics, 2026-10-05)
Presence = responses mentioning the brand / Moz response count (19; PPX 18). "Avg first pos" = where in the response (% of response length) the first mention sits; lower = earlier. "Avg pos" = average over all mentions.

| Engine | Our presence | Our avg first pos | Our rank (of 4) | Form5472.online | Doola | Firstbase |
|---|---|---|---|---|---|---|
| ChatGPT | 10.53% (2/19) | 6.67% | 2nd | 15.79% (3/19) first pos 45.61% | 5.26% (1/19) 52.76% | 0% (0/19) |
| Google AI Mode | 21.05% (4/19) | 32.91% | 1st (tied count with Doola 4/19) | 15.79% (3/19) 21.49% | 21.05% (4/19) 16.14% | 15.79% (3/19) 26.62% |
| Gemini | 10.53% (2/19) | 39.18% | 4th (US 2 vs F5472o 5, Doola 8, FB 8) | 26.32% (5/19) 36.76% | 42.11% (8/19) 30.43% | 42.11% (8/19) 39.33% |
| Perplexity | 5.56% (1/18) | 5.69% | 3rd (US 1 = F5472o 1 < Doola 2 = FB 2) | 5.56% (1/18) 42.79% | 11.11% (2/18) 7.49% | 11.11% (2/18) 14.20% |

By brand term for us (mentions/ avg position %): `Form5472prep`: GPT 1@1.2, AIM 1@74.81, GEM 1@53.56, PPX 0. `Form5472 Prep`: GPT 2@40.05, AIM 3@14.52, GEM 1@24.81, PPX 1@5.69. `form5472prep.com`: GPT 1@1.2, others 0. The dashboard text for ChatGPT: "Form5472prep appears in 10.5% of LLM-generated responses ... average mention position 6.7% ... term contributing most mentions is 'Form5472 Prep' ... ranks 2nd among all brands analyzed."

### 1.2 Mention counts, share of voice and "mentioned first" (computed from the 18 prompts-with-data per engine, PPX 17)
Share of voice = brand mentions / all tracked-brand mentions on that engine. "First" = number of responses where that brand is the earliest tracked brand named. "No tracked brand" = responses naming none of the 4.

| Engine | US (SoV, first) | Form5472.online | Doola | Firstbase | No tracked brand named |
|---|---|---|---|---|---|
| ChatGPT | 2 (33.3%, 2 first) | 3 (50.0%, 3) | 1 (16.7%, 0) | 0 (0%, 0) | 13/18 |
| Google AI Mode | 4 (28.6%, 4) | 3 (21.4%, 2) | 4 (28.6%, 4) | 3 (21.4%, 0) | 8/18 |
| Gemini | 2 (8.7%, 2) | 5 (21.7%, 2) | 8 (34.8%, 5) | 8 (34.8%, 1) | 8/18 |
| Perplexity | 1 (16.7%, 1) | 1 (16.7%, 1) | 2 (33.3%, 2) | 2 (33.3%, 0) | 13/17 |
| All 4 engines (71 prompt x engine slots with data; baseline counted 76 = 19 x 4) | 9 | 12 | 15 | 13 | 42 |

Sentiment labels on the responses (response-level; count of responses): ChatGPT neutral 7 / negative 8 / positive 2 / mixed 1; AI Mode neutral 8 / negative 6 / positive 2 / mixed 2; Gemini neutral 7 / negative 8 / mixed 3; Perplexity neutral 17.

All 9 of our mentions are on 5 prompts: "is form5472 prep legit?" (GPT, AIM, PPX), "is there a flat-fee form 5472 filing service?" (GPT), "how much does form5472 prep cost?" (AIM), "how much does it cost to hire someone to file form 5472?" (AIM, GEM), "what is the cheapest way to file form 5472 and pro forma 1120 online?" (AIM, GEM). Only the first two (and the third) are brand-named prompts; "how much does it cost to hire someone" and "cheapest way ... online" are category prompts where we were named.

### 1.3 Per-prompt results (18 prompts with data; 22 more have no data, see 1.0)
Cell = brands named in order of first mention with first-mention depth in % of response (US = Form5472prep, F = Form5472.online, D = Doola, FB = Firstbase), then citations count and response sentiment label. "-" = none of the 4 tracked brands named. Our position is rank among tracked brands named.

| # | Prompt | ChatGPT | Google AI Mode | Gemini (no citations returned) | Perplexity |
|---|---|---|---|---|---|
| 1 | is form5472 prep legit? | **US 1st @0%** c5 neu | **US 1st @0%** c2 neg | F@1 only (US NOT named) c0 mix | **US 1st @6%** c1 neu |
| 2 | is there a flat-fee form 5472 filing service? | **US 1st @13%** c4 pos | F@19 (US not named) c3 neu | D@11 > FB@12 > F@32 c0 neu | - c1 neu |
| 3 | alternatives to doola for form 5472 filing | - (stub preamble, c0) neu | D@2 > F@23 c5 pos | D@1 > F@31 > FB@68 c0 neu | D@10 > FB@20 c1 neu |
| 4 | best form 5472 preparer for non-resident llc owners | F@79 c1 neg | D@44 > FB@44 c4 mix | F@21 > FB@54 > D@63 c0 mix | F@43 c1 neu |
| 5 | can form 5472 be faxed to the irs | - c2 neu | - c3 neu | - c0 neu | - c1 neu |
| 6 | do i need to file a final form 5472 when i dissolve my llc? | - c2 neu | - c2 neg | - c0 neu | - c1 neu |
| 7 | do i need to file form 5472 if my llc had no income? | - c3 neg | - c4 neu | - c0 neg | - c1 neu |
| 8 | doola vs firstbase for form 5472 filing | - (stub, c0) neu | D@0 > FB@5 c5 pos | D@0 > FB@1 > F@99 c0 neg | D@5 > FB@8 c0 neu |
| 9 | how can accountants outsource form 5472 preparation for clients? | - c4 pos | - c3 neg | - c0 neg | - c2 neu (cites OUR homepage + partner-program blog, brand not named) |
| 10 | how do i file form 5472 if i am not a us resident? | - c4 neg | - c1 neu | - c0 neg | - c1 neu |
| 11 | how much does form5472 prep cost? | - (stub, c0) neu | **US 1st @25%** c4 neg | D@55 > FB@56 (US not named) c0 neg | - c1 neu (cites OUR homepage, brand not named) |
| 12 | how much does it cost to hire someone to file form 5472? | - c7 neg (cites OUR /pricing, brand not named) | **US 1st @32%** c4 neu | **US 1st @25%** > FB@61 > D@62 c0 neg | no response |
| 13 | what is the best service to file form 5472 for a foreign-owned llc? | F@19 c8 neg | F@22 c3 mix | FB@32 > D@32 c0 neu | - c1 neu |
| 14 | what is the cheapest way to file form 5472 and pro forma 1120 online? | - c3 mix | **US 1st @75%** c6 neu | **US 1st @54%** c0 mix | - c1 neu |
| 15 | what is the form 5472 deadline for a foreign-owned single-member llc? | - c4 neg | - c3 neg | - c0 neg | - c1 neu |
| 16 | what is the form 5472 penalty and how can i avoid it? | - c4 neg | - c5 neg | - c0 neg | - c1 neu |
| 17 | which companies help foreign founders with us llc tax compliance? | F@39 > D@53 c9 neg | D@19 > FB@31 c7 neu | D@19 > FB@32 c0 neu | - c3 neu |
| 18 | who can file form 5472 and the pro forma 1120 for my single-member llc? | - c2 neu | - c4 neu | - c0 neu | - c1 neu |
| | Our mentions | 2 | 4 | 2 | 1 |

Prompt rank in Moz's Prompts tab for ChatGPT (UI): "is form5472 prep legit?" = 1st (5 citations), "is there a flat-fee form 5472 filing service?" = 1st (4); all other 38 = "Not mentioned" (including the 22 empty ones). Citations per prompt, ChatGPT (UI): best service 8, which companies 9, how much to hire 7, flat-fee 4, outsource 4, not a US resident 4, deadline 4, penalty 4.

### 1.4 Citations (Moz Citations breakdown, 2026-10-05)
Totals: ChatGPT 62 citations / 35 unique pages / 17 domains; Google AI Mode 68 / 48 / 26; Perplexity 19 / 14 / 8; Gemini 0 (the engine returns no citations in Moz). Combined 149 citations across 41 domains.

**Top cited domains (all engines combined, citation count; engine split cha=ChatGPT aim=AI Mode per=Perplexity):**
irs.gov 48 (cha35, aim8, per5) · form5472.online 16 (cha3, aim13) · **form5472prep.com 13 (cha7, aim2, per4)** · youtube.com 7 (aim7) · form5472.ai 5 (cha3, aim2) · hiltzikcpa.com 4 · entity.inc 4 (aim) · trustpilot.com 3 · hcvt.com 3 (aim) · genzone.com 3 (aim) · ecommerceparadise.com 3 (aim) · wise.com 3 (per) · edetax.com 2 · jamesbakercpa.com 2 · google.com 2 · gettaxhub.com 2 · reddit.com 2 · nonresident.tax 2 · form5472.io 2 (per) · terms.law 2 (per) · then 1 each: laramieledgertax.com, delewarellc.com, filetax.co, otoco.io, doola.com, ask.doola.com, taxclaim.co, delancycpa.com, caldwelltaxservices.com, taxtake.com, trybookmate.co, mondaq.com, cleertax.com, wyomingllc.co, counto.accountant, thetaxadviser.com, wgcpas.com, expattaxcpas.com, gwcarter.com, orbitaccountants.com, binderr.com.
Domains cited in the most distinct prompts: ChatGPT irs.gov 13 prompts (9 pages), form5472prep.com 3, form5472.online 2, edetax.com 2; AI Mode form5472.online 10 prompts (8 pages), irs.gov 8, youtube.com 5, entity.inc 4, genzone.com 3, ecommerceparadise.com 3, hcvt.com 3; Perplexity irs.gov 5, form5472prep.com 3, wise.com 3, form5472.io 2.
Note: doola.com / firstbase.io themselves are barely cited (doola.com + ask.doola.com 1 each in ChatGPT, firstbase.io 0) even though Doola/Firstbase are named heavily in Gemini/AI Mode: those two are named from model knowledge or third-party listicles, not from their own pages. Competitor domains NOT in the tracked set that engines cite: form5472.ai (5), form5472.io (2), edetax.com (2), entity.inc (4).

**Top cited URLs (distinct-prompt count, utm_source stripped):**
- ChatGPT: irs.gov/instructions/i5472 (11) · irs.gov/pub/irs-pdf/i5472.pdf (10) · irs.gov/payments/international-information-reporting-penalties (5) · irs.gov/forms-pubs/about-form-5472 (4) · form5472prep.com/pricing (2) · 1 each: irs.gov/taxtopics/tc254, irs.gov/instructions/iss4, laramieledgertax.com/pricing/, delewarellc.com/blog/delaware-llc-cpa-cost-form-5472/, filetax.co/resources/form-5472-cost-and-what-preparers-charge, edetax.com/pricing, form5472.ai/form-5472-filing-service, form5472.ai/, form5472.ai/blog/form-5472-filing-services-around-299-compared, form5472.online/best-form-5472-filing-service, form5472.online/post/best-form-5472-filing-services-2026
- Google AI Mode: irs.gov/instructions/i5472 (7) · form5472.online (3) · ecommerceparadise.com (3) · hcvt.com/alertarticle-Foreign-Owned-Single-Member-US-LLC-Tax-Requirement (3) · form5472.online/post/best-form-5472-filing-services-2026 (2) · genzone.com/best-doola-alternatives-for-non-us-founders/ (2) · gettaxhub.com/form-5472-global-tax-filing/ (2) · form5472.online/post/best-llc-formation-services-for-non-residents-2026-1 (2) · entity.inc (2) · reddit.com (2) · form5472.online/post/launchusa-vs-doola-vs-firstbase-llc-cost-2026 (2) · hiltzikcpa.com/form-5472-filing-service/ (2) · 1 each: entity.inc/blog/best-us-llc-formation-services-non-residents/, jamesbakercpa.com/blog/choose-tax-professional-foreign-owned-us-llc/, form5472.online/post/how-to-close-foreign-owned-us-llc-complete-guide, entity.inc/blog/dissolve-us-llc/, trybookmate.co/blog/form-5472-explained-what-foreign-owned-u-s-companies-need-to-know, mondaq.com/unitedstates/tax-authorities/1850488/form-5472-and-foreign-owned-us-entities-the-new, 2 YouTube videos
- Perplexity: irs.gov/forms-pubs/about-form-5472 (3) · irs.gov/instructions/i5472 (2) · wise.com/us/blog/how-to-file-form-5472 (2) · form5472prep.com/ (2) · 1 each: form5472.io/blog/doola-tax-package-review-alternatives, form5472.io/blog/best-form-5472-filing-services, orbitaccountants.com/us/form-5472-foreign-owned-llc/, form5472prep.com/blog/form-5472-partner-program-how-it-works, form5472prep.com/about, hiltzikcpa.com/form-5472-filing-service/, binderr.com/marketplace/us/form-a-wyoming-llc-as-a-non-us-resident, terms.law (2 pages), wise.com/us/blog/foreign-owned-single-member-llc

**OUR URLs cited, with the prompt (engine, position in citation list):**
| Engine | Our URL | Prompt(s) | Named in answer? |
|---|---|---|---|
| ChatGPT | form5472prep.com/pricing (pos 1) | how much does it cost to hire someone to file form 5472? ; is there a flat-fee form 5472 filing service? | flat-fee: yes (1st); hire-someone: NO |
| ChatGPT | form5472prep.com/ (pos 2) | is there a flat-fee form 5472 filing service? | yes |
| ChatGPT | form5472prep.com/about (1), /terms (2), /security (3), /data-retention (4), trustpilot.com/review/form5472prep.com (5) | is form5472 prep legit? | yes (1st) |
| AI Mode | form5472prep.com/pricing (pos 2) | how much does form5472 prep cost? | yes (1st) |
| AI Mode | form5472prep.com (pos 3) | how much does it cost to hire someone to file form 5472? | yes (1st) |
| AI Mode | trustpilot.com/review/form5472prep.com (pos 1) | is form5472 prep legit? | yes (1st) |
| Gemini | none (engine returns no citations) | | |
| Perplexity | form5472prep.com/ (pos 1) | how can accountants outsource form 5472 preparation for clients? ; how much does form5472 prep cost? | NO (cited, not named) in both |
| Perplexity | form5472prep.com/blog/form-5472-partner-program-how-it-works (pos 2) | how can accountants outsource form 5472 preparation for clients? | NO |
| Perplexity | form5472prep.com/about (pos 1) | is form5472 prep legit? | yes (1st) |
No blog/guide pages other than the partner-program post are cited by any Moz-tracked engine; none of the 22 category/informational prompts about penalties, deadlines, dissolution, no-income, non-resident, bookkeeper/accountant, fax cite our content.

### 1.5 Delta vs baseline (/Users/sumyeung/Documents/Claude work/geo-baseline-2026-10-05.md)
The baseline (written 2026-10-05 from this same dashboard plus Bing AI Performance) and today's pull are the SAME collection (2026-10-05; Moz still shows "Data as of Oct 5, 2026", next collection Mon Oct 12). **Nothing has changed since baseline**; every figure I re-derived matches it:
- Mentions: us 9 of 76 slots in baseline (AI Mode 4, ChatGPT 2, Gemini 2, Perplexity 1) = same as above; competitor slot counts Doola 15, Firstbase 13, Form5472.online 12 = same.
- Per-engine presence/avg position/rank (ChatGPT 10.5%/6.7%/2nd, AI Mode 21.1%/32.9%/1st, Gemini 10.5%/39.2%/4th, Perplexity 5.6%/5.7%/3rd) = same.
- Citations: ChatGPT 62/35/17, AI Mode 68/48/26, Perplexity 19/14/8, Gemini none; irs.gov 48 of 149; Form5472.online 16; our domain 13 (ChatGPT 7, AI Mode 2, Perplexity 4) = same.
- Prompt count: 40 total; baseline listed 19 "with data" (counting the "stripe atlas" prompt as an empty first-batch response) and 21 "no data"; today's API shows that prompt as an uncollected one created 13:26 on 2026-10-05, giving 18 / 22. Same underlying data, different bookkeeping.
- Still empty: Sentiment tab (API 500). Only difference vs baseline notes: none material. The next real delta can only appear after the 2026-10-12 collection (22 new prompts get first data).

---

## 2. Domain Overview for form5472prep.com (Moz Pro Domain Overview, run 2026-10-07; scope = Domain, market United States en-US)
Quota shown on page: 94 of 100 Domain Overview queries available until 11/01 before my query, 93 after (1 credit used). Keyword Research pool shows 3,764 of 5,000 queries available until 11/01. "Keyword Data Updated Every Two Weeks" (Moz banner).

### 2.1 Headline metrics
| Metric | Value |
|---|---|
| Domain Authority (DA) | **10** (chart range over the last 12 months: 1 to 10, Nov 2025 to Oct 2026 - rising) |
| Brand Authority (BA) | **1** |
| Page Authority (homepage https://form5472prep.com) | 28 |
| Spam Score (domain) | see 3.1 (Link Explorer overview); distribution of linking domains by spam score: 1-10%: 40, 11-20%: 14, 21-30%: 1, 61-70%: 1 |
| Linking root domains | **61** (discovered in last 60 days: **59**; lost in last 60 days: **0**) |
| Ranking keywords (Moz index, US) | **80** (top 3: 5; #4-10: 2; #11-20: 2; #21-30: 7; #31-40: 9; #41-50: 4; the remaining 51 sit at #51-96) |
| Domain search theme | "International Tax Compliance" |
| Moz-derived keyword topics | 1 Form 5472 filing requirements, 2 CPE for foreign-owned LLCs, 3 IRS reporting for foreign shareholders, 4 Cross-border tax documentation, 5 CPE credit for international tax professionals |
| Discovered/lost linking domains chart | total discovered +59, lost -0, net +59 between 2026-08-11 and 2026-09-29 (max 8 per week) |

### 2.2 Competitors Moz discovers ("Competitor Overview" in Domain Overview; True Competitor)
| Site | Ranking keywords | #1-3 | #4-10 | PA | DA |
|---|---|---|---|---|---|
| form5472prep.com | 80 | 5 | 2 | 28 | 10 |
| taxule.com | 18 | 2 | 0 | 15 | 3 |
| en-se.tkegexpat.com (tkegexpat.com) | 7 | 0 | 2 | 15 | 14 |
| easyfiling.com | 8.3k | 14 | 258 | 37 | 57 |
Note: these are Moz's automatic "top search competitors" (keyword-overlap based), NOT Form5472.online / Doola / Firstbase (those are handled in sections 4-6). Moz's Keyword opportunities widget shows 1 row only: "form 5472 rental property llc" (traffic lift 0). Link opportunities widget (sites that intersect the 3 auto-competitors, not us): gofreebacklinks.com, super-seotools.com, techbullion.com, developmentmi.com, starcourts.com (low-value; first two are link-farm style domains).

### 2.3 Top pages (Domain Overview > Links > Top pages)
| Page | PA | Linking domains |
|---|---|---|
| https://form5472prep.com (homepage) | 28 | 61 |
| /blog/form-5472-client-intake-checklist-for-firms | 14 | 0 |
| /start?v=below&src=form-5472-instructions&tier=premium | 14 | 0 |
| /blog/topics/south-korea | 14 | 0 |
| /blog/form-5472-singapore-residents-us-llc | 14 | 0 |
All inbound link equity sits on the homepage; every inner page shows 0 linking domains. "Top pages with 4xx errors": no data.

### 2.4 Top linking domains / anchor text (Domain Overview widgets; full list in section 3)
Top linking domains: cvillico.com (673 linking domains, DA 63), cmocheatsheets.com (778, DA 62), mymarketpost.com (478, DA 61), mylisthero.com (347, DA 61), wioutlet.com (299, DA 61).
Frequently used anchor text: **"high quality dofollow backlinks da 50 pa 40 premium pbn network service form5472prep.com rank first page google fast seo link building buy backlinks online cheap"** = 53 linking domains / 138 followed external links; "form5472prep.com" = 1 linking domain / 2 links. (Spam/PBN-style anchor on 53 of 61 linking domains; see section 3.)

### 2.5 Ranking keywords (all 80 that Moz shows; Keyword Research > Ranking Keywords, US, domain scope, 2026-10-07)
Pos = Moz's rank for that keyword; KD = Moz difficulty; Vol = Moz monthly volume bucket; (T) = keyword is in a tracked campaign (the other agent's rank-tracking campaign). Note many volumes are 0 (Moz shows 0 for sub-threshold terms).

| Keyword | Pos | Ranking URL | KD | Vol |
|---|---|---|---|---|
| form 5472 preparation service (T) | 1 | /services | 7 | 36 |
| form 5472 preparer (T) | 1 | /services/pro-forma-1120-filing-service | 23 | 0 |
| form 5472 preparation service pdf | 1 | /faq | 25 | 0 |
| 5472 form filling | 2 | /file-form-5472 | 6 | 0 |
| form 5472 outsourcing | 3 | /blog/form-5472-in-house-vs-outsourced-firm | 34 | 0 |
| form 5472 fax filing service reddit | 8 | /blog/how-to-fax-form-5472-irs | 53 | 0 |
| form 5471 reasonable cause decision tree | 9 | /blog/topics/foreign-owned-llc | 19 | 11 |
| form 5472 and pro forma 1120 filing service instructions | 11 | /blog/pro-forma-form-1120-foreign-owned-llc | 42 | 0 |
| form 5472 rental property llc | 17 | /blog/form-5472-us-real-estate-foreign-investor | 21 | 0 |
| late form 5472 filing service (T) | 21 | /blog/form-5472-filed-late-never-filed | 35 | 0 |
| hire someone to file form 5472 (T) | 23 | /blog/form-5472-diy-vs-preparer | 37 | 0 |
| does a foreign owned single member llc need an ein | 24 | /blog/ein-responsible-party-foreign-owned-llc | 15 | 27 |
| 1120 and 5472 filing service 2022 | 24 | /blog/form-5472-small-corporation-reasonable-cause | 32 | 0 |
| form 5472 fax filing service (T) | 24 | /blog/how-to-fax-form-5472-irs | 40 | 0 |
| what is the penalty for filing 5472 late? | 25 | /blog/form-5472-filed-late-never-filed | 31 | 0 |
| foreign owned single member llc filing requirements california | 30 | /blog/california-llc-foreign-owner-tax-filing | 32 | 0 |
| form 5472 cpe course | 31 | /about | 16 | 0 |
| form 5472 deadline 2026 | 31 | /blog/form-5472-deadline-2026 | 24 | 0 |
| form 5472 preparation example | 32 | /about | 37 | 0 |
| how long to get an itin | 34 | /blog/itin-processing-time-status-delays | 48 | 55 |
| how long does it take to get a itin | 34 | /blog/itin-processing-time-status-delays | 47 | 11 |
| how much does it cost to file form 5472? | 34 | /blog/what-is-form-5472 | 29 | 0 |
| form 5472 help (T) | 36 | /blog/what-is-form-5472 | 20 | 0 |
| form 5472 for real estate llc foreign owned | 36 | /blog/form-5472-us-real-estate-foreign-investor | 34 | 0 |
| how long does it take to apply for an itin | 38 | /blog/itin-processing-time-status-delays | 49 | 0 |
| 1120 and 5472 filing service (T) | 43 | /services/pro-forma-1120-filing-service | 42 | 0 |
| how long does it take to generate itin? | 43 | /blog/itin-processing-time-status-delays | 49 | 0 |
| form 5472 deadline (T) | 46 | /blog/form-5472-deadline-2026 | 30 | 2 |
| what is a 5472? | 50 | /blog/what-is-form-5472 | 41 | 0 |
| 5472 us | 52 | /blog/what-is-form-5472 | 39 | 0 |
| what is form 5472 | 54 | /blog/what-is-form-5472 | 43 | 64 |
| federal form 5472 | 54 | /blog/what-is-form-5472 | 45 | 3 |
| form 5272 | 55 | /blog/what-is-form-5472 | 44 | 6 |
| single member llc foreign owned california | 55 | /blog/california-llc-foreign-owner-tax-filing | 28 | 0 |
| form 5472 for bookkeepers (T) | 56 | /services/form-5472-filing-service | 28 | 0 |
| irs 5472 | 57 | /blog/what-is-form-5472 | 50 | 39 |
| do i have to file form 5472? | 57 | /blog/what-is-form-5472 | 41 | 0 |
| how long does it take for itin to arrive? | 57 | /blog/itin-processing-time-status-delays | 42 | 0 |
| forms 5472 | 58 | /blog/what-is-form-5472 | 39 | 47 |
| tax form 5472 | 58 | /blog/what-is-form-5472 | 45 | 1 |
| what is form 5472 used for | 59 | /blog/what-is-form-5472 | 41 | 6 |
| does taxact support form 5472? | 59 | /blog/what-is-form-5472 | 34 | 0 |
| rev proc 91-55 | 60 | /blog/what-is-form-5472 | 26 | 27 |
| new form 5472 | 60 | /blog/what-is-form-5472 | 38 | 0 |
| how do i get a non resident itin number? | 63 | /blog/itin-application-checklist-nonresidents | 39 | 27 |
| mi 5472 | 63 | /blog/what-is-form-5472 | 41 | 1 |
| 5472 penalty abatement | 64 | /form-5472-penalty | 32 | 24 |
| form 5472 irs | 65 | /blog/what-is-form-5472 | 50 | 24 |
| form 5472 due date pdf | 65 | /blog/form-5472-deadline-2026 | 35 | 0 |
| extension form 5472 | 66 | /blog/what-is-form-5472 | 24 | 0 |
| form 5472 help sample | 66 | /blog/how-to-fill-out-form-5472 | 35 | 0 |
| form 5472 1f | 66 | /blog/what-is-form-5472 | 38 | 0 |
| pro forma 1120 filing service (T) | 66 | /1120-pro-forma-instructions | 38 | 0 |
| form 5472 preparer for non resident online | 66 | / | 40 | 0 |
| 5472 nra | 68 | /blog/what-is-form-5472 | 32 | 27 |
| 5472 1f | 68 | /blog/what-is-form-5472 | 42 | 0 |
| how to apply for itin from india | 69 | /blog/itin-application-checklist-nonresidents | 35 | 1 |
| foreign owned multi member llc | 70 | /blog/multi-member-llc-form-5472-or-1065 | 15 | 64 |
| form 5472 cost sharing arrangement | 71 | /blog/what-is-form-5472 | 34 | 3 |
| form 5472 for real estate llc foreign owned download | 71 | /services/final-form-5472-for-dissolved-llc | 40 | 0 |
| form 5472 extension (T) | 72 | /blog/what-is-form-5472 | 40 | 1 |
| form 5472 history | 72 | /blog/what-is-form-5472 | 39 | 0 |
| pro forma 1120 filing service example | 73 | /1120-pro-forma-instructions | 28 | 0 |
| form 5472 reportable transaction capital contribution | 74 | /blog/what-is-form-5472 | 28 | 24 |
| form 5472 instructions part vi | 74 | /blog/what-is-form-5472 | 38 | 0 |
| form 5472 penalty relief (T) | 75 | /form-5472-penalty | 27 | 0 |
| form 5472 for tax preparers instructions | 76 | /about | 40 | 0 |
| us taxes on foreign subsidiary irc | 78 | /blog/does-foreign-owned-llc-pay-us-tax | 31 | 1 |
| penalty relief form 5472 | 78 | /blog/what-is-form-5472 | 27 | 0 |
| form 5472 filing instructions | 81 | /file-form-5472 | 41 | 11 |
| form 5472 filing for cpa firms example | 81 | /blog/irs-official-exchange-rate-form-5472 | 3 | 0 |
| can california llc have foreign members | 82 | /blog/california-llc-foreign-owner-tax-filing | 32 | 0 |
| what are reportable transactions for form 5472 | 85 | /blog/what-is-form-5472 | 38 | 8 |
| form 5472 preparer for non resident | 86 | /about | 32 | 0 |
| form 5472 disregarded entity | 87 | /blog/what-is-form-5472 | 45 | 55 |
| itin verification documents | 87 | /blog/itin-application-checklist-nonresidents | 37 | 1 |
| form 5472 help pdf | 92 | /file-form-5472 | 22 | 0 |
| form 5472 for cpas (T) | 92 | /about | 29 | 0 |
| form 5472 filing for cpa firms | 96 | /about | 25 | 0 |
| form instructions 5472 | 96 | /file-form-5472 | 31 | 0 |

Observations in the Moz data (not recommendations): only 3 keywords rank #1 (all long-tail, volume 36/0/0); the two highest-volume terms we show for are "what is form 5472" (vol 64, pos 54) and "foreign owned multi member llc" (vol 64, pos 70); "forms 5472" (47, pos 58), "how long to get an itin" (55, pos 34), "form 5472 disregarded entity" (55, pos 87); "/blog/what-is-form-5472" is the ranking URL for 29 of the 80 keywords (13 keywords are in the tracked campaign).

---

## 3. Link Explorer for form5472prep.com (root domain; run 2026-10-07; Link Explorer pool 19,974 of 20,000 queries left until 10/30 after my reads)

### 3.1 Summary numbers
| Metric | Value |
|---|---|
| Domain Authority | 10 |
| Page Authority (homepage) | 28 |
| Spam Score (domain) | 16% (low band 1-30%) |
| Linking root domains | 61 (discovered last 60 days 59; lost 0) |
| Inbound links | 154 total; 140 followed; 14 nofollow (14 = the 7 nofollow domains x2 rows: each link is listed twice, once direct and once "via redirect") |
| Internal links follow/nofollow | 100% / 0% |
| External links follow/nofollow | 90.9% / 9.1% |
| Spam Score of linking domains | 98.2% of linking domains in 1-30%, 0.0% in 31-60%, 1.8% in 61-100% (1 domain: 8coint.com 61%) |
| Linking domains by DA | 52 domains have DA 40-63 (all PBN-advert domains); 9 have DA 4-27 (see table) |
| Link velocity | first links discovered 2026-08-11; 59 new linking domains between 2026-08-11 and 2026-09-29; none lost (weekly chart max 8 new domains per week) |

### 3.2 Anchor text (top anchor text for this site; Moz "Followed External Links")
| Anchor text | Followed external links | Linking domains |
|---|---|---|
| "high quality dofollow backlinks da 50 pa 40 premium pbn network service form5472prep.com rank first page google fast seo link building buy backlinks online cheap" | 138 | 53 |
| "form5472prep.com" (naked domain) | 2 (followed, from form5472.online); 14 further nofollow links carry the same anchor | 8 |
Link rows by anchor in the Inbound Links report: 138 rows carry the PBN-service anchor, 16 rows carry "form5472prep.com".

### 3.3 What the links are (read from Inbound Links report)
- **53 of 61 linking domains (138 of 154 links, all FOLLOWED) are the same advert page.** Each source page is titled "Boost your Google rankings with Premium PBN & Link Building" at the path `/all/1102/22.html` on DA 42-63 domains (cvillico.com, cmocheatsheets.com, mymarketpost.com, mylisthero.com, wioutlet.com, ... full list below). Their anchor is a PBN-seller advert sentence that contains our domain name. Pages are in Moz's index with spam scores of 1-23%. They are not editorial links; they look like a third party's link-spam / PBN-advert network that has our domain name embedded (all discovered 2026-08-11 to 2026-09-29, i.e. appeared after launch of the site, none lost). 37 of those domains give 2 link rows, 16 give 4 (www and non-www copies, each plus "via redirect").
- **Context (seen in Domain Overview of form5472.online, 2026-10-07):** form5472.online shows the identical advert anchor ("...premium pbn network service form5472.online rank first page google...") from the same 53 linking domains / 138 followed links, so this is an automated PBN-advert network that stamps whatever domain it scrapes, not something aimed only at us; form5472.online also shows 85 new linking domains in the last 60 days (3 lost).
- 6 domains are automated "report/stats" pages, all NOFOLLOW, DA 7-27: drjack.world (`/report/139402`, "Domain Report"), quero.party (`/report/139402`), atomizelink.icu (`/report/139401`), dailymusings.top (`/stats/139402`, "Website Stats"), optimizeflow.top (`/stats/139401`), plus 8coint.com (`/list.php?part=2026/05/22/59`, "High-quality backlink service", Spam Score 61%, crawled 2026-06-15, nofollow).
- **2 domains are editorial-looking and are competitors' sites:** form5472.online (DA 17, spam 11%): "Form 5472 Filing Services Compared: Evidence & Credentials" at `www.form5472.online/post/form-5472-filing-services`, a FOLLOWED link (first found 2026-08-30); form5472.ai (DA 13, spam 3%): "Form 5472 Filing Providers: The Complete 2026 Directory" at `form5472.ai/providers`, NOFOLLOW (first found 2026-09-25).
- All 154 links land on the homepage (https://form5472prep.com); no inner page has a linking domain. Moz "Top followed links" list is all the PBN advert pages (betwinnermirror.com, cmocheatsheets.com, plrdownloadshub.com, smartstimer.com ... `/all/1102/22.html`, PA 23).
- Top pages by links: homepage only (PA 28, 61 linking domains). Pages with 4xx: none returned.

### 3.4 Every linking root domain (61)
Columns: DA; "LD" = number of domains linking to that domain (Moz "Linking Domains" column); SS = spam score; Found = discovered date; Type: PBN = PBN-advert page, auto = automated report page, ed = editorial page. All PBN rows are followed, the anchor is the PBN sentence; the others carry anchor "form5472prep.com".

| Domain | DA | LD | SS | Found | Type |
|---|---|---|---|---|---|
| cvillico.com | 63 | 673 | 7% | 09/03 | PBN |
| cmocheatsheets.com | 62 | 778 | 6% | 08/14 | PBN |
| mymarketpost.com | 61 | 478 | 7% | 08/16 | PBN |
| mylisthero.com | 61 | 347 | 7% | 08/27 | PBN |
| wioutlet.com | 61 | 299 | 1% | 09/12 | PBN |
| sahammurah.com | 59 | 363 | 13% | 09/03 | PBN |
| phanerosart.com | 59 | 152 | 12% | 08/17 | PBN |
| texturometer.com | 58 | 437 | -- | 09/29 | PBN |
| raiseold.com | 58 | 611 | 1% | 09/22 | PBN |
| juaralaundry.com | 58 | 278 | 6% | 08/18 | PBN |
| reisenweg.com | 57 | 573 | -- | 09/20 | PBN |
| thedocmag.com | 57 | 292 | 1% | 08/17 | PBN |
| blogerreviewers.com | 57 | 236 | 6% | 08/19 | PBN |
| expresskitchendesigns.com | 57 | 291 | 6% | 08/16 | PBN |
| bestofthefirstcoast.com | 57 | 260 | 1% | 09/08 | PBN |
| smartstimer.com | 56 | 864 | 7% | 08/14 | PBN |
| theforbestimes.com | 56 | 583 | 6% | 08/16 | PBN |
| archive-hu.com | 56 | 332 | 11% | 08/15 | PBN |
| ufabettererm4.com | 56 | 295 | 7% | 08/13 | PBN |
| canadapsilocybin.com | 56 | 282 | 9% | 08/14 | PBN |
| fastlifesite.com | 56 | 330 | 12% | 08/21 | PBN |
| primenewsartical.com | 56 | 219 | 6% | 08/13 | PBN |
| betwinnermirror.com | 55 | 784 | 5% | 08/13 | PBN |
| techbumppy.com | 55 | 400 | 7% | 08/13 | PBN |
| adcreativevideo.com | 55 | 251 | 6% | 08/23 | PBN |
| themicrodigits.com | 55 | 191 | 11% | 08/19 | PBN |
| plrdownloadshub.com | 54 | 928 | -- | 08/19 | PBN |
| southfwb.com | 54 | 873 | 9% | 08/19 | PBN |
| gladeflowers.com | 54 | 624 | 11% | 08/21 | PBN |
| kkinsider.com | 54 | 554 | 8% | 08/14 | PBN |
| marinasone.com | 54 | 455 | 5% | 09/07 | PBN |
| fletcherrld.com | 54 | 363 | 14% | 08/21 | PBN |
| casinooftheking.com | 54 | 331 | 14% | 08/17 | PBN |
| dupurgeniefr.com | 54 | 334 | 6% | 08/14 | PBN |
| digitalchatni.com | 54 | 335 | 7% | 08/17 | PBN |
| betulcrime.com | 54 | 346 | 7% | 08/12 | PBN |
| masihnyata.com | 54 | 247 | 14% | 08/18 | PBN |
| exotichealths.com | 54 | 304 | 6% | 08/25 | PBN |
| rjcentinc.com | 54 | 230 | 6% | 08/16 | PBN |
| mediaboooster.com | 54 | 272 | 11% | 08/16 | PBN |
| coruzants.com | 54 | 284 | 13% | 08/31 | PBN |
| bestnz-poker-casinoslot.com | 53 | 751 | 15% | 08/18 | PBN |
| firstguestpost.com | 53 | 431 | 2% | 08/14 | PBN |
| forbesstories.com | 53 | 282 | 7% | 08/21 | PBN |
| hotonlinegaming.com | 53 | 219 | 1% | 08/14 | PBN |
| fashionclothingnews.com | 53 | 192 | 6% | 08/16 | PBN |
| homesforsaleoldgreenwichct.com | 52 | 241 | 5% | 09/01 | PBN |
| onvaxs.com | 50 | 294 | 23% | 08/17 | PBN |
| aloysionunes.com | 42 | 382 | 18% | 08/20 | PBN |
| quotesblom.com | 42 | 277 | 6% | 09/03 | PBN |
| uncledspizza.com | 41 | 145 | 7% | 08/16 | PBN |
| cgpa2percentag.com | 40 | 248 | -- | 08/20 | PBN |
| royaldb.us.com | 4 | 5 | -- | 08/17 | PBN (DA 4) |
| quero.party | 27 | 818 | 4% | 08/11 | auto, nofollow |
| drjack.world | 21 | 1,458 | 4% | 09/18 | auto, nofollow |
| form5472.online | 17 | 276 | 11% | 08/30 | ed, FOLLOWED (competitor) |
| form5472.ai | 13 | 220 | 3% | 09/25 | ed, nofollow (competitor) |
| optimizeflow.top | 11 | 201 | 7% | 09/10 | auto, nofollow |
| dailymusings.top | 9 | 190 | 7% | 08/14 | auto, nofollow |
| atomizelink.icu | 7 | 714 | 4% | before 08/09 | auto, nofollow |
| 8coint.com | 5 | 451 | 61% | before 08/09 (crawled 06/15) | auto, nofollow |
(That is 52 PBN rows with DA >=40 plus royaldb.us.com = 53 PBN domains, plus 8 others = 61. royaldb.us.com's anchor/row type was inferred from its entry in the 53-domain set; its DA is 4.)

### 3.5 New / lost links
- Discovered 59 linking domains 2026-08-09 to 2026-10-07 (dates in the table; most recent: texturometer.com 09/29, form5472.ai 09/25, raiseold.com 09/22, reisenweg.com 09/20, drjack.world 09/18). Lost: 0. No new linking domain has appeared since 2026-09-29 in the Moz index.
- The Domain Overview "Link opportunities" widget (sites that link to taxule.com / tkegexpat.com / easyfiling.com but not us) listed: gofreebacklinks.com, super-seotools.com, techbullion.com, developmentmi.com, starcourts.com.

---

## 4. Link Intersect (Moz Link Research > Link Intersect; run 2026-10-07)
Moz's Link Intersect lists root domains that link to at least one of the competitor domains but NOT to form5472prep.com (domain scope for all). Moz allows up to 5 competitor slots, so I used all 5. Results are capped at 500 rows per query ("Showing up to 500 results based on your sort").

### 4.1 Run 1: us vs form5472.online (A), doola.com (B), firstbase.io (C), startglobal.co (D), clemta.com (E)
Cost: 5 Link Explorer queries (19,974 -> 19,969 of 20,000). Sorted by DA descending; I paged through all 500 rows (DA 96 down to DA 51 at row 500, so the 500-row cap cuts the list at DA 51; more domains exist below DA 51).
Competitor link counts inside those 500 rows: doola.com 303 domains, firstbase.io 215, startglobal.co 80, clemta.com 40, **form5472.online only 8**. 32 domains link to 3+ competitors; 7 link to 4-5: medium.com, crunchbase.com, producthunt.com, tntcode.com (spam 15%), soundflare.xyz (spam 61%, avoid), businessformation.io, evna.care (spam 14%).
Spam note: 19 of the 500 domains show spam score 30% or higher (mostly .xyz/.cfd/.click/.top style domains lower in the list).

**Top 40 by DA** (Type = my read of the domain name; not from Moz; "-" = unclear):
| # | Domain | DA | Spam | Links to | Type |
|---|---|---|---|---|---|
| 1 | github.com | 96 | 1% | startglobal | developer platform (repo/readme link) |
| 2 | medium.com | 95 | 1% | doola, firstbase, startglobal, clemta | blog platform (author posts) |
| 3 | linktr.ee | 94 | 2% | doola, firstbase, clemta | link-in-bio profile |
| 4 | forbes.com | 94 | 1% | doola, firstbase | news/editorial mention |
| 5 | bit.ly | 94 | -- | firstbase, startglobal | shortener |
| 6 | yandex.com | 94 | 5% | doola, firstbase | portal |
| 7 | namecheap.com | 94 | 1% | doola | registrar partner page |
| 8 | businessinsider.com | 94 | 1% | firstbase | news |
| 9 | vercel.app | 93 | -- | doola, firstbase | hosted app |
| 10 | techcrunch.com | 93 | 1% | doola, firstbase | news |
| 11 | hubspot.com | 93 | 1% | doola | partner/marketplace page |
| 12 | r7.com | 93 | 8% | doola | news portal (BR) |
| 13 | nationalgeographic.com | 93 | 1% | doola | news |
| 14 | canva.com | 93 | 13% | doola | design platform page |
| 15 | finance.yahoo.com | 93 | 2% | firstbase | news/PR |
| 16 | zendesk.com | 93 | 1% | firstbase | customer story/partner |
| 17 | substack.com | 92 | 1% | doola, firstbase, clemta | newsletter platform |
| 18 | pages.dev | 92 | -- | form5472.online, doola | Cloudflare Pages hosted site |
| 19 | reddit.com | 92 | 3% | firstbase, clemta | forum |
| 20 | entrepreneur.com | 92 | 1% | doola | news/editorial |
| 21 | behance.net | 92 | 1% | startglobal | portfolio |
| 22 | prtimes.jp | 92 | 6% | doola | press release wire (JP) |
| 23 | fastcompany.com | 92 | 1% | doola | news |
| 24 | networksolutions.com | 92 | 1% | doola | registrar |
| 25 | habr.com | 92 | 1% | firstbase | tech blog platform |
| 26 | openai.com | 92 | 2% | firstbase | customer story |
| 27 | stripe.com | 92 | 1% | doola | Stripe partner/customer page |
| 28 | crunchbase.com | 91 | 1% | doola, firstbase, startglobal, clemta | company directory profile |
| 29 | webflow.io | 91 | 49% | firstbase, startglobal | hosted sites (high spam) |
| 30 | ibtimes.com | 91 | 2% | doola | news |
| 31 | meetup.com | 91 | 1% | firstbase | events |
| 32 | tradingview.com | 91 | 1% | form5472.online | finance community/ideas post |
| 33 | producthunt.com | 90 | 1% | doola, firstbase, startglobal, clemta | startup directory |
| 34 | notion.site | 90 | -- | doola, firstbase | public Notion page |
| 35 | gulfnews.com | 90 | 3% | clemta | news |
| 36 | shareasale.com | 90 | 3% | startglobal | affiliate network |
| 37 | spreaker.com | 90 | 3% | firstbase | podcast host |
| 38 | podbean.com | 90 | 5% | firstbase | podcast host |
| 39 | lovable.app | 90 | 7% | doola | hosted app |
| 40 | ycombinator.com | 89 | 1% | doola, firstbase | startup directory/launch page |

**Domains that link to form5472.online (8 of the 500 rows; all of them are links the closest niche competitor has and we do not):** pages.dev (DA 92, also doola), tradingview.com (91), natlawreview.com (75, legal news), webwire.com (67, spam 16%, press release), qusos.com (65, spam 6%, also startglobal+clemta), cpapracticeadvisor.com (60, CPA trade publication), abnewswire.com (57, spam 75%, press release), marketminute.com (51, spam 15%, also doola).

**Domains linking to 3+ competitors (32), DA descending:** medium.com 95 (BCDE) · linktr.ee 94 (BCE) · substack.com 92 (BCE) · crunchbase.com 91 (BCDE) · producthunt.com 90 (BCDE) · cloudwaysapps.com 88 (BCD) · cbinsights.com 77 (BCD) · topwebdirectoy.com 73 (BCD, directory) · topdomadirectory.com 69 · webjunctiondirectory.com 69 · webrankdirectory.com 69 · topmillionwebdirectory.com 69 · webhubdirectory.com 68 · webworthdirectory.com 66 (all generic web-directory sites, BCD, spam 6-7%) · tntcode.com 66 (BCDE, spam 15%) · qusos.com 65 (ADE) · tpsearchtool.com 65 (BCD) · sovrn.com 63 (BCD) · indiehackers.com 61 (BCD, forum/community) · soundflare.xyz 60 (BCDE, spam 61%) · grokipedia.com 59 (BCE) · businessformation.io 58 (BCDE, formation directory) · theorg.com 58 (BCD, org-chart directory) · easyfiling.com 57 (BCD) · developmentmi.com 56 (BCE; also on Moz's auto-competitor widget) · kingranks.com 55 (BCD) · webranksite.com 55 (BCE) · evna.care 53 (BCDE) · zipdo.co 53 (BCE) · siteprice.org 52 (CDE) · worldmetrics.org 52 (BCE) · wifitalents.com 51 (BCE).
Higher-DA domains linking to startglobal.co/clemta.com only (not doola/firstbase): business2community.com 88, angel.co 86, khaleejtimes.com 86, albawaba.com 83, go.dev 82, techstars.com 77, e27.co 74, startupgrind.com 72, republic.com 62, adomonline.com 60.
Note: because doola/firstbase/startglobal/clemta are general company-formation brands, run 1 mostly surfaces generic startup/news/directory domains; the niche (Form 5472) overlap is the form5472.online column (8 domains) and run 2 below.

### 4.2 Run 2 (extra, niche): us vs form5472.online (A), form5472.ai (B), form5472.io (C), form5472.tax (D), edetax.com (E)
Added by me because run 1's competitors are broad formation brands; these are the actual Form 5472 niche competitors that the AI engines cite (form5472.ai, form5472.io, edetax.com) or that the price survey lists (form5472.tax). Cost 5 Link Explorer queries (19,969 -> 19,965 of 20,000, rounded display). Sorted by DA descending; I read 450 rows (9 pages; the 10th page, DA 1, not read).
Link counts inside the 450 rows: form5472.online 221 domains, form5472.ai 164, edetax.com 185, form5472.tax 8, **form5472.io 0** (Moz has no link data for it). ~110 of the rows are generic "web directory" / free-listing sites (DA 15-36, spam 3-18%, almost all linking both form5472.online AND form5472.ai) = both rivals ran bulk directory submissions; the rest is the short list below.

**Non-directory targets (DA descending, Links to: A=form5472.online B=form5472.ai D=form5472.tax E=edetax.com):**
| Domain | DA | Spam | Links to | Type (my read) |
|---|---|---|---|---|
| pages.dev | 92 | -- | A | hosted site (Cloudflare Pages) |
| tradingview.com | 91 | 1% | A | finance community/ideas post |
| natlawreview.com | 75 | 1% | A | legal news publication |
| techbullion.com | 73 | 2% | D (form5472.tax) | business/tech guest-post site |
| webwire.com | 67 | 16% | A | press-release wire |
| qusos.com | 65 | 6% | A | - (also links startglobal.co + clemta.com in run 1) |
| wedbush.com | 60 | 1% | E (edetax) | financial firm site |
| cpapracticeadvisor.com | 60 | 1% | A | CPA trade publication |
| ecommerceparadise.com | 58 | 1% | E (edetax) | e-commerce blog (also cited 3x by Google AI Mode for our prompts) |
| chordmp3.net | 58 | 21% | E | off-topic |
| bazerdaily.com | 57 | 7% | E | blog |
| fittyfoody.com | 57 | 7% | E | off-topic blog |
| abnewswire.com | 57 | 75% | A | press-release wire (high spam) |
| onlyhealthydeals.com | 56 | 7% | E | off-topic |
| digitalseotool.com | 54 | 12% | E | SEO tool site |
| marketminute.com | 51 | 15% | A, E | finance news feed (run 1: also doola) |
| justonewayticket.com | 48 | 3% | E | travel blog |
| offshorecorptalk.com | 45 | 2% | A | offshore-company forum |
| domain.glass | 43 | 16% | A | domain-info site |
| reviewfoxy.com | 42 | 2% | A | review site (run 1: links to all 5 formation brands) |
| solodinero.com | 40 | 1% | B (form5472.ai) | personal finance blog |
| getnews.info | 39 | 16% | A | press-release wire |
| example3.com | 37 | 21% | A, B, E | directory |
| genki.world | 33 | 3% | E | blog |
| (then ~110 generic web directories, DA 15-36: worlds-directory.com 36, directoryholiday.com 36, linkdirectorynet.com 35, directory-fast.com 35, http-directory.com 34, directory4search.com 34, directoryio.com 32, slimdirectory.com 32, ... all A+B) | | | | web directory |
Spam flags: seo-channel.com (DA 26, 55%), urls-shortener.eu (15, DE), bye.fyi (13, DE): ignore. Domains linking to form5472.online AND form5472.ai AND edetax: example3.com only.

### 4.3 Counts
Run 1: 500 rows read (cap), top 40 by DA tabulated above; 8 rows link form5472.online; 32 rows link 3+ competitors. Run 2: 450 rows read, ~24 non-directory rows tabulated, ~110 generic web-directory rows summarised.

---

## 5. Keyword Gap / Competitive Research: form5472prep.com vs form5472.online, doola.com, firstbase.io (US en-US, domain scope; run 2026-10-07)
Competitive Research quota: 75 queries/month, 4 used after my run (71 left until Nov 1). Source: Competitive Research > Keyword Gap (I also read the same four tabs through the page's own API call `competitive.research.keyword.ranking.comparisons.v2.fetch`, comparison = no_rank / superior_rank / inferior_rank / all_rank, because the grid is virtualised). Moz only counts ranks within the top 50 for the gap ("51+" = not ranked); "US" below = we are NOT in the top 50. Rank = best Moz position for that site; F5472o = form5472.online, doola = doola.com, FB = firstbase.io. KD = Moz difficulty; Vol = Moz exact monthly volume (0 = below Moz's threshold).

### 5.1 Competitor overview (Moz)
| Site | Ranking keywords | #1-3 | #4-10 | PA | DA |
|---|---|---|---|---|---|
| form5472prep.com | 80 | 5 | 2 | 28 | 10 |
| form5472.online | 274 | 13 | 29 | 33 | 17 |
| doola.com | ~7k | 45 | 211 | 49 | 38 |
| firstbase.io | ~3k | 166 | 424 | 47 | 37 |
Gap tab sizes: "New keyword opportunities" (they rank top 50, we do not) = **9,749**; "Winning keywords" (we out-rank all three) = 6; "Keywords to improve" (we rank 2-20 and a competitor is higher) = 1; "All ranking keywords" = 9,829. Within the 9,749 rows: form5472.online ranks top-50 for 215 of them (64 at #1-20), doola.com for 7,029 (mostly company-formation/EIN terms), firstbase.io for 2,955 (rows can be ranked by several sites). Of the 9,749, ~1,492 match an on-topic regex (5472, 1120, pro forma, foreign, nonresident, ITIN/EIN/SS-4, disregarded, BOI, single-member, ...), 448 of them in the core Form-5472/foreign-owned/disregarded cluster, 834 are general EIN/ITIN/SS-4/tax-ID terms.
Moz Keyword Gap "Keywords to improve" (1 row): form 5472 and pro forma 1120 filing service instructions (vol 0, KD 42): US 11, F5472o 9, doola 51+, FB 17.
"Winning keywords" (6; we beat all three): 5 472 form filling (US 2 vs F5472o 85), form 5472 outsourcing (US 3), form 5472 rental property llc (US 17), hire someone to file form 5472 (US 23), 1120 and 5472 filing service 2022 (US 24), foreign owned single member llc filing requirements california (US 30). All volume 0.

### 5.2 Top 60 relevant keywords they rank for (top 50) and we do not, by volume
Topics included: Form 5472, 1120, foreign-owned/single-member/disregarded LLC, EIN/ITIN for non-residents. (No BOI/CTA rows appear in the gap pool: no keyword containing "boi" or "beneficial owner" shows up at all for these three competitors.)
| Keyword | Vol | KD | Competitor positions |
|---|---|---|---|
| disregarded entity | 3,622 | 40 | FB 41 |
| disregarded | 3,319 | 43 | FB 8 |
| form 5472 | 2,361 | 41 | F5472o 24, FB 34 |
| form 5472 instructions | 647 | 40 | F5472o 21, FB 8 |
| form 1120 due date 2017 | 457 | 40 | F5472o 40 |
| disregarded entity llc | 444 | 44 | FB 45 |
| llc disregarded entity | 444 | 42 | FB 43 |
| 1120s due date | 430 | 45 | F5472o 49 |
| 5472 instructions | 348 | 39 | F5472o 20, FB 6 |
| 5472 form | 322 | 34 | F5472o 3, FB 37 |
| where to file form 1120s | 322 | 31 | doola 68 |
| foreign entities | 304 | 48 | FB 42 |
| irs form 5472 | 271 | 23 | F5472o 41, FB 37 |
| form 5472 instructions 2025 | 245 | 41 | F5472o 12, FB 9 |
| define disregarded entity | 185 | 41 | FB 36 |
| 1120 deadline | 183 | 46 | F5472o 35 |
| tax foreign income | 181 | 56 | doola 34 |
| disregarded entity s corp | 153 | 25 | FB 46 |
| form 1120 due date | 153 | 48 | F5472o 21 |
| 1120h due date | 149 | 30 | F5472o 36 |
| disregarded entity name | 133 | 46 | FB 37 |
| disregarded llc | 112 | 44 | FB 47 |
| apply for ein without ssn | 102 | 56 | doola 22 |
| what is a foreign llc | 102 | 40 | FB 49 |
| can a single member llc have employees | 97 | 43 | doola 35 |
| can you change a single member llc to a multi member llc | 92 | 32 | FB 28 |
| foreign company doing business in usa | 92 | 28 | FB 51 |
| can a foreign company open a us bank account | 82 | 31 | doola 34, FB 4 |
| can a foreign corporation own an llc | 82 | 17 | FB 13 |
| c corporation foreign ownership | 73 | 19 | FB 44 |
| single member llc tax rate | 69 | 41 | doola 39 |
| does single member llc need ein | 67 | 51 | doola 40 |
| do foreigners get tax breaks on businesses | 64 | 34 | FB 38 |
| foreign partners in llc | 64 | 32 | F5472o 45, FB 34 |
| single member llc vs sole proprietorship california | 64 | 37 | FB 73 |
| form 5472 filing requirements | 61 | 39 | F5472o 35, FB 32 |
| irs form 5472 instructions | 55 | 48 | F5472o 22, FB 18 |
| foreign ein | 53 | 42 | doola 10 |
| foreign ein number | 53 | 54 | doola 15 |
| instructions 5472 | 47 | 41 | F5472o 24, FB 5 |
| 5472 instructions 2017 | 47 | 32 | F5472o 15, FB 8 |
| can a foreigner be a partner in an llc | 47 | 33 | doola 53, FB 37 |
| llc owned by foreign corporation | 47 | 9 | doola 54 |
| 5472 instructions 2018 | 39 | 38 | F5472o 29, FB 11 |
| does a single member llc need to file a tax return | 39 | 45 | doola 64 |
| applying for ein without ssn | 33 | 41 | doola 25 |
| single member llc bank account | 32 | 35 | doola 25 |
| foreign owned llc | 31 | 20 | FB 7 |
| can a non-resident alien own an llc | 31 | 26 | doola 52 |
| ein for foreign entity | 30 | 28 | doola 40 |
| can an llc corp have foreign shareholders | 27 | 22 | FB 3 |
| can foreign investors own us llc | 27 | 21 | FB 3 |
| can foreign llc invest in usa | 27 | 23 | FB 5 |
| form 5472-2 | 27 | 36 | F5472o 5 |
| 5472 form instructions | 27 | 42 | F5472o 14, FB 8 |
| 6038a irs foreign owned disregarded entity | 27 | 43 | F5472o 41 |
| can a foreign company apply for an ein | 27 | 23 | doola 12 |
| do international companies need ein number | 27 | 45 | doola 38 |
| foreign business owner need tax id number | 27 | 30 | doola 26 |
| ss4 for international | 27 | 40 | FB 4 |
| how to apply for ein without ssn / how to get ein (number) without ssn / get ein without ssn (4 variants) | 25-26 each | 42-51 | doola 14-24 |
(Rows 1-52 are the core/foreign-owned cluster in volume order; EIN/ITIN-for-non-resident rows from the doola/firstbase side are interleaved by volume.)

### 5.3 General EIN / ITIN / SS-4 demand where doola or firstbase rank and we do not (not non-resident-specific; highest volume first)
form ss-4 15,403 (FB 6) · ss4 form 15,403 (FB 8) · ss4 8,909 (FB 6) · tax id number 8,521 (doola 50) · tax id 8,106 (doola 38) · irs form ss-4 5,553 (FB 11) · ss-4 form 3,588 (FB 10) · what is an itin 3,481 (FB 44) · irs ss-4 2,415 (FB 14) · irs ss4 2,415 (FB 16) · ein confirmation letter 2,415 (doola 42) · what is a itin number 2,273 (FB 46) · form ss4 2,129 (FB 6) · how to get an itin number 1,971 (doola 43) · ein letter 1,970 (doola 46, FB 40) · ss-4 instructions 1,728 (doola 46, FB 24) · how to get a/an itin number 1,427 to 1,971 (doola 39-45) · itin application 1,376 (doola 39) · how long does it take to get an ein 1,325 (doola 27) · ss-4 online 1,243 (FB 9) · how to apply for itin 1,151 (doola 40) · itin vs ssn 827 (doola 40) · lost ein 810 (doola 17) · forgot ein number 790 (doola 19). KD 26-57. Also non-profit EIN rows (e.g. ein for nonprofit 615) that are off-topic.

### 5.4 Keywords where form5472.online ranks top 20 and we have no top-50 rank (64 keywords; first 45 by their rank; all rank data Moz, 0 = Moz volume floor)
form 5472 filing service (vol 4, KD 42) F5472o 1 · form 5472 and pro forma 1120 filing service (0, 38) 2 · 5472 form (322, 34) 3 · tax software form 5472 (1, 41) 3 · form 5472 penalty abatement service (0, 26) 3 · form 5472 penalty abatement service instructions (0, 32) 3 · late form 5472 filing service pdf (0, 36) 4 · form 1165 (52, 50) 5 · form 5472-2 (27, 36) 5 · form 5472 expert (0, 20) 5 · form 5472 for cpas instructions (0, 25) 5 · cpe on form 5472 (0, 21) 6 · form 5472 download (2, 40) 8 · irs pro forma (1, 22) 8 · irs verification of cpa (1, 49) 8 · platform contribution transaction form 5472 (1, 24) 8 · form 5472 expert template (0, 30) 8 · foreign owned llc tax filing service (0, 12) 9 · form 5472 for law firms (0, 18) 9 · form 5472 instructions 2012 (0, 29) 9 · form 5472 principal business activity code (0, 34) 9 · form 5472 penalty 2018 (27, 30) 10 · form 5472 for accountants (0, 24) 10 · llc foreign owner tax (0, 11) 10 · equivalent of irs form 966 for a llc (27, 45) 11 · can an llc have a foreign owner? (0, 22) 11 · new mexico llc for non residents online (0, 30) 11 · form 5472 instructions 2025 (245, 41) 12 · form 5472 due date (17, 1) 12 · form 5472 expert instructions (0, 42) 12 · form 5472 foreign owned llc sample (0, 28) 12 · form 5472 instruction (27, 42) 13 · instruction form 5472 (24, 42) 13 · foreign-owned llc reporting and taxes (1, 20) 13 · irs form 5472 penalty (1, 36) 13 · form 5472 help template (0, 35) 13 · outsource form 5472 preparation reddit (0, 54) 13 · single member llc foreign owned pdf (0, 27) 13 · where to file form 966 (39, 42) 14 · 5472 form instructions (27, 42) 14 · amending form 5472 (1, 22) 14 · 5472 instructions 2017 (47, 32) 15 · single member llc foreign owned sample (0, 15) 15 · taxation of foreign members of llc (0, 16) 15 · instructions for form 5472 (27, 39) 16.

### 5.5 Shared keywords: we rank (top 100 in Moz) and rivals also rank (68 of our 80 keywords); our position vs theirs
Where we are behind form5472.online (US pos vs F5472o pos): 5472 penalty abatement 64 vs 4 · 1120 and 5472 filing service 43 vs 2 · 5472 1f 68 vs 24 · 5472 nra 68 vs 45 · 5472 us 52 vs 18 · do i have to file form 5472? 57 vs 39 · does taxact support form 5472? 59 vs 20 · extension form 5472 66 vs 33 · federal form 5472 54 vs 16 · foreign owned multi member llc 70 vs 21 (vol 64) · form 5272 55 vs 21 · form 5472 1f 66 vs 15 · form 5472 cost sharing arrangement 71 vs 20 · form 5472 cpe course 31 vs 28 · form 5472 deadline 46 vs 4 · form 5472 deadline 2026 31 vs 3 · form 5472 disregarded entity 87 vs 29 (vol 55) · form 5472 due date pdf 65 vs 11 · form 5472 extension 72 vs 10 · form 5472 fax filing service 24 vs 2 · form 5472 filing for cpa firms 96 vs 12 · form 5472 filing instructions 81 vs 10 (vol 11) · form 5472 for bookkeepers 56 vs 26 · form 5472 for cpas 92 vs 2 · form 5472 for real estate llc foreign owned 36 vs 23 · form 5472 for tax preparers instructions 76 vs 17 · form 5472 help 36 vs 13 · form 5472 help pdf 92 vs 11 · form 5472 help sample 66 vs 14 · form 5472 history 72 vs 21 · form 5472 instructions part vi 74 vs 25 · form 5472 irs 65 vs 22 (vol 24) · form 5472 penalty relief 75 vs 7 · form 5472 preparation example 32 vs 13 · form 5472 preparer for non resident 86 vs 3 · form 5472 preparer for non resident online 66 vs 2 · form 5472 reportable transaction capital contribution 74 vs 8 (vol 24) · forms 5472 58 vs 21 (vol 47) · irs 5472 57 vs 23 (vol 39) · late form 5472 filing service 21 vs 2 · mi 5472 63 vs 45 · new form 5472 60 vs 34 · penalty relief form 5472 78 vs 6 · pro forma 1120 filing service 66 vs 8 · pro forma 1120 filing service example 73 vs 7 · rev proc 91-55 60 vs 49 (vol 27) · tax form 5472 58 vs 18 · us taxes on foreign subsidiary irc 78 vs 67 · what are reportable transactions for form 5472 85 vs 13 (vol 8) · what is a 5472? 50 vs 21 · what is form 5472 54 vs 14 (vol 64) · what is the penalty for filing 5472 late? 25 vs 14 · how much does it cost to file form 5472? 34 vs 4.
Where doola/firstbase beat us: how do i get a non resident itin number? (US 63 vs doola 44, vol 27) · how to apply for itin from india (69 vs doola 35) · itin verification documents (87 vs doola 38) · how long does it take to apply for an itin (38 vs FB 28) · what is form 5472 used for (59 vs doola 45) · form instructions 5472 (96 vs doola 86) · form 5472 cost sharing arrangement (71 vs FB 6) · form 5472 instructions part vi (74 vs FB 7) · form 5472 help sample (66 vs FB 4).
Where we out-rank form5472.online (also in 5.1 "Winning"): 5 472 form filling (2 vs 85), form 5472 outsourcing (3 vs 67), hire someone to file form 5472 (23 vs 57), form 5472 rental property llc (17 vs 19), foreign owned single member llc filing requirements california (30 vs 36).
Moz data for all 9,749 gap rows is not tabulated here; the on-topic subset counts are in 5.1.

### 5.6 Non-resident LLC / BOI check (Moz gap pool, 9,749 rows)
- BOI / beneficial ownership / Corporate Transparency Act / FinCEN: **0 rows** in the gap pool (none of the three competitors ranks top-50 for any keyword containing boi, beneficial, corporate transparency, cta or fincen; and we do not either).
- Non-resident LLC terms (36 rows, all low volume, mostly doola): can a non-resident alien own an llc 31 (doola 52) · llc for non us residents 19 (doola 41) · us llc non resident 19 (doola 49) · us llc as non-resident 14 (doola 42) · wyoming llc non resident requirements 14 (doola 65) · nonresident alien single member llc 11 (F5472o 45) · us llc for non residents 11 (doola 49) · open a us business bank account for non resident 5 (doola 27) · open llc for non us residents 2 (doola 3) · can a non resident alien form an llc 1 (F5472o 39, doola 54) · how does a non resident alien get an ein 1 (FB 26) · new mexico llc for non residents online 0 (F5472o 11, doola 51) · cheap us company. forming us company as non-resident 1 (F5472o 29) · ein for non resident template 0 (doola 22) · how to get itin non resident founder 0 (doola 28) · free us company formation for non residents 0 (doola 4) · delaware llc for non residents tax return 0 (doola 52).
- Moz volumes are floor-bucketed and most niche terms show 0; absolute demand for the 0-volume rows is not measurable from Moz.


---

## 6. Brand Authority and authority metrics: us vs competitors (Moz Domain Overview run per domain, 2026-10-07; domain scope, US)
Used 4 Domain Overview credits in total today (94 -> 90 of 100 until 11/01: form5472prep.com, form5472.online, doola.com, firstbase.io). Brand Authority (BA) is Moz's 0-100 brand-strength score.

| Metric | form5472prep.com | form5472.online | doola.com | firstbase.io |
|---|---|---|---|---|
| Brand Authority (BA) | **1** | 1 | **28** | **28** |
| Domain Authority (DA) | 10 | 17 | 38 | 37 |
| Page Authority (homepage) | 28 | 33 | 49 | 47 |
| Linking root domains | 61 (59 new / 0 lost in 60 d) | 276 (85 new / 3 lost) | ~4.6k (443 new / 209 lost) | ~1.9k (164 new / 51 lost) |
| Ranking keywords (Moz, US) | 80 | 274 | ~7k | ~3k |
| Keywords #1-3 / #4-10 | 5 / 2 | 13 / 29 | 45 / 211 | 166 / 424 |
| Domain search theme (Moz) | International Tax Compliance | Foreign-Owned LLC Tax Compliance | Cross-Border Business Formation | Company Formation in USA |
| Top anchor text | PBN-advert sentence (53 domains, 138 links) | homepage URL (175 dom) then the same PBN-advert sentence (53 dom, 138 links), "form5472.online/launchusa" (6), "form5472.online" (4) | brand "doola" (339 dom), "business banking verified partner doola" (250), "form your us business" (249), "doola.com" (144) | brand "firstbase" (274 dom), "firstbase.io" (160), Chinese-language "visit official site" anchors (89 each) |
| Top linking domains (Moz) | cvillico.com, cmocheatsheets.com, mymarketpost.com ... (PBN adverts) | pages.dev (DA 92), tradingview.com (91), natlawreview.com (75), webwire.com (67), qusos.com (65) | (not read) | (not read) |
| Moz-discovered organic competitors | taxule.com, tkegexpat.com, easyfiling.com | irs.gov, expatustax.com (DA 31, 3.5k kw), sdocpa.com (DA 30, 14.6k kw) | venturesmarter.com (DA 40), reddit.com, keepertax.com | usa-corporate.com (DA 32), irs.gov, usa.acclime.com (DA 37) |
BA gap: both formation brands sit at 28; the two niche filers (us, form5472.online) are both at 1.
AI Visibility cross-reference (section 1): Doola and Firstbase are each named in 8 of 19 Gemini responses and 2 of 18 Perplexity responses; we are named in 2/19 and 1/18.
