# Moz Pro re-read D: AI Visibility + research tools for form5472prep.com (delta vs 2026-10-26)

Extracted 2026-10-30 (read-only, own browser tab `tab-2` of the built-in Claude browser, Moz Pro account already signed in - no sign-in performed, no Chrome used). Baseline: `base/2026-10-26-ai-visibility-and-research.md` (runs Oct 5 / 12 / 19). Nothing added/edited/deleted/exported/downloaded in Moz. Only report pages and the page's own read-only `*.fetch` / `*.lookup` JSON-RPC calls (same calls the dashboard issues) were used. AI Visibility data pulled with `ai.tracking.project.metrics.fetch` + `responses.fetch` (4 engines); per-prompt tables recomputed from raw responses (brand regexes: `form5472\s?prep` (not followed by a letter) / form5472prep.com = US; form5472.online = F; Doola = D; Firstbase = FB). Regex counts equal Moz's own `brand_definitions` counts on every engine this run (US 12 / 2 / 3 / 1).

## 0. Headline deltas (read this first)
- **AI collections:** Oct 5, Oct 12, Oct 19, **Oct 26 (now in; banner "Next data collection: Monday, Nov 2")**. Perplexity was never re-collected after Oct 5 (17/40 prompts, Oct 5 snapshot).
- **Mention rate (us / Form5472.online / Doola / Firstbase), Oct 19 -> Oct 26:** ChatGPT 30.6 (Moz 36-row; recount 37.5) / 5.6 / 5.6 / 5.6 -> **30.0** / 7.5 / 5.0 / 5.0 (lead intact, down 7.5 pts like-for-like); **AI Mode 10.0 / 22.5 / 15.0 / 12.5 -> 5.0 / 22.5 / 10.0 / 10.0 (2/40, our lowest ever; Form5472.online 4.5x us)**; **Gemini 5.0 / 20.0 / 12.5 / 12.5 -> 7.5 / 15.0 / 17.5 / 17.5** (still last of four, but a rebound).
- **Prompts gained / lost vs Oct 19:** union of prompts naming us on any engine **15 -> 12** (gained #13 doola-vs-firstbase; lost #14 dormant LLC, #18 statistics, #33 cheapest way, #37 which companies help foreign founders); **28 of 40 prompts name us on no engine** (was 25). ChatGPT 15 -> 12 (+1 / -4), AI Mode 4 -> 2 (lost #26, #33), Gemini 2 -> 3 (+#15 fax receipt, +#28 flat-fee, -#14).
- **Wrong facts are GONE:** no "~$99" for us, no "automated document generator" label, no "Express within 3 business days" in any of the 17 answers that name us. Engines now repeat PTIN-holding tax-accountant review (ChatGPT #27/#28, AI Mode #25/#27), "same team as Snapfile" (AI Mode #27 only), Express "24 Hours to 7 Days" (Gemini #28), $149 / $199 / +$99 per past year. Remaining negatives are our own words quoted back: "founded in 2025", "not a CPA firm" (ChatGPT #27); ChatGPT #38 flags a white-label vs partner-page contradiction on our site. Form 7004: 21 responses discuss it, none name us or cite our /form-7004-extension.
- **Our pages are cited far more but converted only on ChatGPT:** our-domain citations 31 -> **68** (AI Mode / Gemini / Perplexity like-for-like 17 -> 45); **/blog/form-5472-filing-service-comparison cited 5x for the first time** (AI Mode 3, Gemini 2) and **/form-5472-statistics 12x (Gemini only)** - but 15 of the 20 AI Mode / Gemini responses citing us (17 of 23 incl. Perplexity) do not name us.
- **Sources we lose to** (responses without us, 119): irs.gov/instructions/i5472 44x, hcvt.com alert article 10x, wise.com 9x, form5472.online home 9x (+ /pricing, /best-online-services... 4x each; form5472.online is cited in 32 of the 119), hiltzikcpa.com/form-5472-filing-service 8x (7x on service-intent prompts), clemta.com 8x, expatustax.com/form-5472 7x (Gemini), optimizetax.io penalty-relief, delawarebusinessincorporators.com, inkle.ai.
- **Sentiment:** ChatGPT 48.9 (confidence now low; 1 attributed negative: "shortlists ... not independent audits"); the Oct 19 "company qualifications" and "filing penalties" negative themes no longer attach to us; Gemini 75.0 (low, 2 segments); AI Mode 50 (insufficient).
- **Authority (Domain Overview + Link Explorer, Oct 30):** DA 11 -> **12**, BA 1 -> 1, PA 29, Spam Score 16% (quarterly), linking root domains 68 -> **76**, discovered-60d 28 / lost 0, inbound rows 198 -> 216. **8 new linking domains, all PBN-advert spam (DA 56-61); 0 genuine earned links; 0 lost.** Ranking keywords **106 -> 106 and the full list is byte-identical to Oct 26 (0 new / 0 lost / 0 moved)** - Moz's two-week keyword refresh has not run since (next ~Nov 9).
- **Competitor:** form5472.online DA 15, BA 1, PA 34, 319 linking domains (+11), 272 ranking keywords (unchanged), #1-3 15; its profile = 178 web-directory listings + the **same 68-domain / 198-row PBN network as ours** + 25 twinsalgo PBN + ~47 other domains whose only real editorial/press links are natlawreview.com (DA 75 press release), cpapracticeadvisor.com (DA 60), qusos.com (DA 65) and a press-syndication network (see section 4).

---

## 1. AI Visibility dashboard "Form5472prep" (id 3465)

### 1.0 Collection status
- Dashboards list: Form5472prep "Latest collection: **Oct 26, 2026**" (Milemarketplace also Oct 26; Taxley dashboards Oct 25). Dashboard banner: "Data as of Oct 26, 2026. Next data collection: Monday, Nov 2, 2026." **The Oct 26 run IS in** - 4th data point (Oct 5, 12, 19, 26). Nov 2 is not yet collected.
- `metrics.fetch` (2026-10-01..2026-11-02): 4 collection dates x 4 brands for ChatGPT / AI Mode / Gemini; **Perplexity has ONLY the Oct 5 row** (never re-collected on Oct 12 / 19 / 26; 17 of 40 prompts have a response dated 2026-10-05, 23 prompts never collected). Every Perplexity figure below is still the Oct 5 snapshot.
- Prompts with data on the latest run: ChatGPT 40/40 (all 2026-10-26), AI Mode 40/40, Gemini 40/40, Perplexity 17/40 (Oct 5).
- **Moz denominator fixed:** ChatGPT Oct 26 counts 40/40 responses (Oct 19 counted 36 and excluded 4 rows that named us). No recount needed this run; Moz official = text recount.
- **Moz now returns ChatGPT citations** (159 on 40 responses; baseline Oct 19 returned 0 and ChatGPT citations had to be parsed from markdown). So ChatGPT citation numbers below are Moz's own rows. **Not like-for-like with Oct 19** (88 parsed from markdown links then; 159 Moz rows now, which also include source-card links), so part of the ChatGPT growth in 'our URLs cited' (14 -> 23) is a counting change; AI Mode / Gemini / Perplexity are like-for-like. AI Mode 169, Gemini 287, Perplexity 19 (Oct 5).
- Per-prompt diff vs Oct 19 is possible this time because the baseline file holds the Oct 19 per-prompt table (Moz itself keeps only the latest response per prompt).

### 1.1 Trend per engine - presence % (responses naming brand / Moz response count). **Bold** = us.
| Engine | Brand | Oct 5 | Oct 12 | Oct 19 | **Oct 26** | Oct 26 vs Oct 19 |
|---|---|---|---|---|---|---|
| **ChatGPT** | **Form5472prep** | 10.53% (2/19) | 37.50% (15/40) | 30.56% (11/36)* | **30.00% (12/40)** | -0.6 pts (Moz) / -7.5 vs recount 15/40 |
| | Form5472.online | 15.79% (3/19) | 10.00% (4/40) | 5.56% (2/36)* | 7.50% (3/40) | +2.0 (recount 4 -> 3) |
| | Doola | 5.26% (1/19) | 7.50% (3/40) | 5.56% (2/36) | 5.00% (2/40) | -0.6 |
| | Firstbase | 0% (0/19) | 5.00% (2/40) | 5.56% (2/36) | 5.00% (2/40) | -0.6 |
| | our rank | 2nd | 1st | 1st | **1st** (lead 22.5 pts) | |
| **Google AI Mode** | **Form5472prep** | 21.05% (4/19) | 7.50% (3/40) | 10.00% (4/40) | **5.00% (2/40)** | **-5.0** |
| | Form5472.online | 15.79% (3/19) | 17.50% (7/40) | 22.50% (9/40) | **22.50% (9/40)** | 0 |
| | Doola | 21.05% (4/19) | 15.00% (6/40) | 15.00% (6/40) | 10.00% (4/40) | -5.0 |
| | Firstbase | 15.79% (3/19) | 12.50% (5/40) | 12.50% (5/40) | 10.00% (4/40) | -2.5 |
| | our rank | 1st (tied) | 4th | 4th | **4th (last)**, 17.5 pts behind Form5472.online | |
| **Gemini** | **Form5472prep** | 10.53% (2/19) | 7.50% (3/40) | 5.00% (2/40) | **7.50% (3/40)** | +2.5 |
| | Form5472.online | 26.32% (5/19) | 20.00% (8/40) | 20.00% (8/40) | 15.00% (6/40) | -5.0 |
| | Doola | 42.11% (8/19) | 17.50% (7/40) | 12.50% (5/40) | 17.50% (7/40) | +5.0 |
| | Firstbase | 42.11% (8/19) | 10.00% (4/40) | 12.50% (5/40) | 17.50% (7/40) | +5.0 |
| | our rank | 4th | 4th | 4th | **4th (last)** | |
| **Perplexity** (NOT re-collected) | **Form5472prep** | 5.56% (1/18) | no run | no run | no run | n/a |
| | Form5472.online | 5.56% (1/18) | | | | |
| | Doola | 11.11% (2/18) | | | | |
| | Firstbase | 11.11% (2/18) | | | | |
*Oct 19 ChatGPT figures are Moz's 36-response denominator; the text recount of Oct 19 was US 15/40 (37.5%), F 4/40, D 2/40, FB 2/40. **Like-for-like (recount) ChatGPT us: 37.5% (Oct 12) -> 37.5% (Oct 19) -> 30.0% (Oct 26).**

Average depth of our first mention (% of response length; lower = earlier), Oct 5 -> 12 -> 19 -> **26**: ChatGPT 6.67 -> 30.23 -> 28.59 -> **30.20**; AI Mode 32.91 -> 37.50 -> 25.95 -> **22.81**; Gemini 39.18 -> 24.99 -> 45.55 -> **26.06**; Perplexity 5.69 (Oct 5 only). Average position over all our mentions Oct 26: ChatGPT 43.07, AI Mode 10.71, Gemini 24.63.

**Reading:** ChatGPT is still the only engine where we lead, but the lead slid from 37.5% to 30% (recount) and the competitors are all <= 7.5% there. **Google AI Mode fell to 2/40 (5%) - the lowest it has ever been - while Form5472.online holds 22.5% (4.5x us)**; AI Mode lost #26 "cost to hire" and #33 "cheapest way" and keeps only #25 (cost) and #27 (legit). Gemini is a rebound (+2.5) but still last of four and the formation brands (Doola / Firstbase 17.5% each) rose again while Form5472.online dipped to 15%. Perplexity: no data newer than Oct 5.

### 1.2 Mention counts, share of voice (SoV), "mentioned first" - Oct 26 (recomputed from raw responses; Moz official counts identical)
SoV = brand's share of all brand mentions among the four tracked brands (sum of per-brand response counts). First = responses where that brand is the first tracked brand named.
| Engine (rows) | US (SoV, first) | Form5472.online | Doola | Firstbase | No tracked brand named |
|---|---|---|---|---|---|
| ChatGPT (40) | **12 (63.2%, 9)** | 3 (15.8%, 3) | 2 (10.5%, 2) | 2 (10.5%, 0) | 26/40 |
| Google AI Mode (40) | **2 (10.5%, 2)** | 9 (47.4%, 7) | 4 (21.1%, 3) | 4 (21.1%, 0) | 28/40 |
| Gemini (40) | **3 (13.0%, 3)** | 6 (26.1%, 4) | 7 (30.4%, 5) | 7 (30.4%, 0) | 28/40 |
| Perplexity (17, Oct 5) | 1 (16.7%, 1) | 1 (16.7%, 1) | 2 (33.3%, 2) | 2 (33.3%, 0) | 13/17 |
Oct 19 SoV for reference (baseline): ChatGPT 65.2% / AI Mode 16.7% / Gemini 10.0%. SoV delta Oct 19 -> 26: ChatGPT -2.0 pts, **AI Mode -6.2 pts**, Gemini +3.0 pts.


### 1.3 Per-prompt table - latest run (ChatGPT / AI Mode / Gemini = 2026-10-26; Perplexity = 2026-10-05, the latest it has)
Cell = tracked brands named in order of first mention with `@` = depth of first mention as % of response length (US = Form5472 Prep, F = Form5472.online, D = Doola, FB = Firstbase, "-" = none of the four); `cN` = citations Moz returned for that response (`our k` = k of them are form5472prep.com URLs; AI Mode #27 and Gemini #27 include the Trustpilot review page, noted in the cell); neu/neg/pos/mix = Moz response-level sentiment label; STUBn = very short (n-char) response; `nodata` = Perplexity never collected this prompt. **Bold US** = we are named. Prompt numbers are the alphabetical numbers used in the 10-26 baseline (same 40 prompts, same order).

| # | Prompt | ChatGPT | Google AI Mode | Gemini | Perplexity (Oct 5) |
|---|---|---|---|---|---|
| 1 | alternatives to doola for form 5472 filing | D@0>**US**@11>FB@25 c5(our 2) neu | D@1>F@51 c5 neg | D@1>FB@25 c6 neg | D@10>FB@20 c1 neu STUB339 |
| 2 | best form 5472 preparer for non-resident llc owners | F@20>**US**@53 c8(our 2) mix | F@32>D@62>FB@68 c5 pos | F@16>D@49>FB@49 c9 mix | F@43 c1 neu STUB455 |
| 3 | best way to file form 5472 for a stripe atlas company | - c5 neg | F@39 c6 neg | D@47>FB@47 c7 mix | nodata |
| 4 | can form 5472 be faxed to the irs | - c1 neu | - c2 neg | - c5 neu | - c1 neu STUB338 |
| 5 | can form 5472 be filed electronically or only by fax or mail | - c2 neu | - c2 neg | - c4 neg | nodata |
| 6 | can my bookkeeper file form 5472 for my us llc | - c2 neg | - c3 neg | - c4(our 1) neg | nodata |
| 7 | do accountants file form 5472 for foreign-owned llc clients | - c2 neg | - c4 neg | - c7 neg | nodata |
| 8 | do i need form 5472 if i only put money into my llc | - c1 neu | - c3 neg | - c6 neg | nodata |
| 9 | do i need to file a final form 5472 when i dissolve my llc? | - c2 neg | - c7(our 1) neu | - c2 neg | - c1 neu STUB340 |
| 10 | do i need to file form 5472 if my llc had no income? | - c1 neu | - c3 neg | - c8 neg | - c1 neu STUB312 |
| 11 | does a delaware llc owned by a foreign person need to file form 5472 | - c2 neu | - c6 neu | - c5 neg | nodata |
| 12 | does a wyoming llc owned by a non-resident need to file form 5472 | - c2 neu | - c8 neg | - c11 neg | nodata |
| 13 | doola vs firstbase for form 5472 filing | D@0>FB@0>**US**@86 c6(our 1) neg | D@0>FB@1 c3 mix | D@1>FB@1 c6 neg | D@5>FB@8 c0 neu STUB328 |
| 14 | form 5472 filing service for a dormant llc | - c7 neu | F@52 c7 neu | D@58>FB@62 c8 neu | nodata |
| 15 | form 5472 filing service with a fax confirmation receipt | **US**@29 c7(our 2) neu | - c6 neu | **US**@50 c12(our 6) neu | nodata |
| 16 | form 5472 penalty calculator | - c3 neg | - c5 neg | - c3 neg | nodata |
| 17 | form 5472 preparer for a foreign-owned llc | F@61 c5 pos | - c4 neu | - c6 neu | nodata |
| 18 | form 5472 statistics and penalty figures | - c7 neg | - c4 neg | - c13(our 9) neg | nodata |
| 19 | how can accountants outsource form 5472 preparation for clients? | **US**@36 c5(our 2) neu | - c1(our 1) neu | - c8(our 2) neu | - c2(our 2) neu STUB406 |
| 20 | how do i file form 5472 if i am not a us resident? | - c5 neg | - c5 neg | - c14 neu | - c1 neu STUB345 |
| 21 | how do i file form 5472 late for past years and handle the penalty? | - c5 neg | - c8 neg | - c13 neg | nodata |
| 22 | how do i write a reasonable cause statement for a late form 5472 | - c2 neg | - c5(our 1) neg | - c9(our 5) mix | nodata |
| 23 | how does a foreign-owned llc get an ein without an ssn | - c3 neu | - c4 neu | - c11 neu | nodata |
| 24 | how many foreign-owned companies file form 5472 | - c3 neu | - c4(our 1) neu | - c5(our 3) neu | nodata |
| 25 | how much does form5472 prep cost? | **US**@23 c3(our 2) neu | **US**@38>F@59 c2(our 1) neg | - c4(our 1) neu | - c1(our 1) neu STUB182 |
| 26 | how much does it cost to hire someone to file form 5472? | **US**@35 c2(our 1) neg | - c3(our 1) neu | - c5(our 1) neu | nodata |
| 27 | is form5472 prep legit? | **US**@0 c6(our 3) neu | **US**@0 c3(our 2 incl. Trustpilot) neg | **US**@0>F@60 c5(our 2 = Trustpilot) mix | **US**@5 c1(our 1) neu STUB299 |
| 28 | is there a flat-fee form 5472 filing service? | **US**@8 c8(our 2) neu | F@20 c3 neu | **US**@28>F@47 c4(our 1) neg | - c1 neu |
| 29 | what counts as a reportable transaction on form 5472 | - c2 neu | - c4 neg | - c5(our 3) neg | nodata |
| 30 | what happens if i never file form 5472 for my llc | - c2 neg | - c4 neg | - c6 neg | nodata |
| 31 | what is a pro forma 1120 and who has to file it | - c2 neu | - c5 neg | - c10 neg | nodata |
| 32 | what is the best service to file form 5472 for a foreign-owned llc? | **US**@23 c7(our 2) pos | F@6>FB@80 c0 mix | F@30>FB@53>D@53 c5 pos | - c1 neu |
| 33 | what is the cheapest way to file form 5472 and pro forma 1120 online? | F@35 c3 pos | F@77 c5 neu | F@79 c8 neu | - c1 neu STUB312 |
| 34 | what is the diirsp for a late form 5472 | - c1 neg | - c5 neg | - c9(our 1) neg | nodata |
| 35 | what is the form 5472 deadline for a foreign-owned single-member llc? | - c3 neu | - c4 neu | - c6 neg | - c1 neu STUB295 |
| 36 | what is the form 5472 penalty and how can i avoid it? | - c4 neg | - c4 neg | - c13 neg | - c1 neu STUB394 |
| 37 | which companies help foreign founders with us llc tax compliance? | - c13 mix | D@40>FB@49 c6 neg | D@18>FB@36 c8 mix | - c3 neu |
| 38 | white label form 5472 filing for accounting firms | **US**@14 c4(our 2) neu | F@24 c3(our 1) neg | - c6 neu | nodata |
| 39 | who can file form 5472 and the pro forma 1120 for my single-member llc? | - c1 neu | - c4 neu | - c3 neu | - c1 neu |
| 40 | who can i hire to file form 5472 for my llc | **US**@38 c7(our 2) neu | - c4 neu | F@41 c8 neu | nodata |

Named-us counts: ChatGPT **12/40** (first-named on 9), AI Mode **2/40** (#25, #27 - both first or tied-first), Gemini **3/40** (#15, #27, #28; first-named on all 3), Perplexity 1/17 (Oct 5).

### 1.3a Prompts gained / lost vs the previous run (Oct 19; per-prompt Oct 19 table from the baseline file) and vs Oct 5
| Engine | Named us Oct 19 | Named us Oct 26 | Gained | Lost |
|---|---|---|---|---|
| ChatGPT | 15 (#1,2,14,15,18,19,25,26,27,28,32,33,37,38,40) | **12** (#1,2,13,15,19,25,26,27,28,32,38,40) | **+1: #13 doola vs firstbase (US@86, last)** | **-4: #14 dormant LLC, #18 statistics/penalty figures, #33 cheapest way, #37 which companies help foreign founders** |
| Google AI Mode | 4 (#25,26,27,33) | **2** (#25,27) | none | **-2: #26 cost to hire someone, #33 cheapest way** |
| Gemini | 2 (#14,27) | **3** (#15,27,28) | **+2: #15 fax-receipt service (6 of its 12 cites are our fax page), #28 flat-fee service** | -1: #14 dormant LLC |
| Perplexity | 1 (Oct 5) | no new run | - | - |
**Unique prompts naming us on >= 1 engine: 12 of 40 (Oct 19: 15 of 40).** Net union change -3: gained #13; lost #14, #18, #33, #37. **28 prompts name us on no engine** (#3-12, 14, 16, 17, 18, 20-24, 29-31, 33-37, 39 - was 25): all informational/IRS-rules prompts plus the service-intent ones #3 Stripe Atlas, #14 dormant LLC, #17 "preparer for a foreign-owned llc", #33 "cheapest way ... online" (now Form5472.online on all 3 engines), #37 "which companies help foreign founders", #39 "who can file ... single-member llc".
Note: ChatGPT answers are non-deterministic week to week (Oct 12 -> 19 recount was identical at 15/40, so this -3 net is the first real ChatGPT drop). The ChatGPT losses #33 (cheapest way) and #18 (statistics) are the two where our NEW pages (/compare/form-5472-filing-services, /form-5472-statistics) were doing the work on Oct 19.
**vs Oct 5 (first run):** ChatGPT 2 prompts then -> 12 now; AI Mode {#25,#26,#27,#33} -> {#25,#27} (lost #26, #33 - both cost/price prompts); Gemini {#26,#33} -> {#15,#27,#28} (neither Oct 5 prompt retained); Perplexity unchanged (no new run). ChatGPT is the only engine that grew.
Prompts where an engine cites our pages WITHOUT naming us (non-Trustpilot): **AI Mode 6** (#9 final-5472-for-dissolved-LLC page, #19 in-house-vs-outsourced blog, #22 reasonable-cause page, #24 multiple-related-parties blog, #26 filing-service-comparison blog, #38 home) + **Gemini 9** (#6 for-bookkeepers page, #18 statistics x9, #19 in-house-vs-outsourced x2, #22 reasonable-cause x5, #24 statistics x3, #25 + #26 filing-service-comparison blog, #29 reportable-transactions blog x3, #34 reasonable-cause) + **Perplexity 2** (Oct 5: #19, #25) = **17 engine-responses** (was 6 on Oct 19). ChatGPT never cites us without naming us (12/12 citing responses name us).

### 1.4 Citations (latest run, Moz's own citation rows; `#:~:text` fragments and utm_source stripped)
Totals Oct 26: **ChatGPT 159** citations / 66 unique URLs / 28 domains (**Moz now returns them**; Oct 19 baseline = 0 from Moz, 88 parsed); **AI Mode 169** / 105 / 57 (the 50 `google.com/goto?url=` opaque wrappers of Oct 19 are gone - Moz now resolves AI Mode destinations; google.com is no longer a cited domain); **Gemini 287** / 100 / 60 (Oct 19: 348 / 111 / 67); Perplexity 19 / 14 / 8 (Oct 5, unchanged). Combined 634 (Oct 19: 664).
Top cited domains (all engines; cha / aim / gem / per): **irs.gov 129** (74/39/11/5) - **form5472.online 70** (2/23/45/0; was 92) - **form5472prep.com 68** (23/8/33/4; was 31 - AI Mode/Gemini/Perplexity like-for-like 17 -> 45; ChatGPT 14 -> 23 not like-for-like) - trybookmate.co 17 (Gemini 13) - taxesforexpats.com 17 (Gemini only) - clemta.com 16 (0/4/12) - optimizetax.io 15 (0/8/7) - hcvt.com 15 (0/7/8) - hiltzikcpa.com 13 (2/5/5/1) - edetax.com 10 (ChatGPT only) - wise.com 10 (0/3/4/3) - entity.inc 9 (0/3/6) - expatustax.com 9 (Gemini) - oandgaccounting.com 8 (3/0/5) - overseasfax.com 8 (Gemini) - filabl.com 7 - cloudacc.com 7 (Gemini) - ilmcpa.com 6 (ChatGPT only) - inkle.ai 6 - open-entity.com 6 - trustpilot.com 6 (2/1/3: our Trustpilot page on the "legit?" prompt) - 5472direct.com 4 - form5472.ai 3 - firstbase.io 3 - doola.com 1 (+0 help/ask subdomains).
form5472.online's most-cited URLs: / 22, /pricing 9, /best-online-services-to-file-irs-form-54... 9 (7+2 variants), /post/form-5472-comprehensive-guide-foreign-owned-llc 6, /post/form-5472-reportable-transactions-what-every-foreign-owned-llc-owner-must-know 4, /post/best-form-5472-filing-services-2026 3, /post/why-form-5472-requires-a-cpa-not-just-an-accountant 3, /form-5472-instructions 2. (Its Gemini share fell 64 -> 45.)

**OUR URLs cited - 68 citations (ChatGPT 23, AI Mode 8, Gemini 33, Perplexity 4 [Oct 5]) + 3 Trustpilot-page citations (trustpilot.com/review/form5472prep.com); Oct 19 was 31. 15 distinct on-site URLs.** (engine | URL | count | prompts; `Y` = we are also named in that answer, `N` = cited but NOT named)
| Engine | URL | n | Prompts |
|---|---|---|---|
| ChatGPT | / (home) | 14 | 1Y, 2Y, 13Y, 15Y, 19Y, 25Y, 26Y, 27Y, 28Y, 32Y, 40Y |
| ChatGPT | /pricing | 2 | 25Y, 28Y |
| ChatGPT | /services/form-5472-filing-service | 2 | 15Y, 32Y |
| ChatGPT | /services/form-5472-for-accountants | 1 | 19Y |
| ChatGPT | /services/white-label-form-5472-filing | 1 | 38Y |
| ChatGPT | /partners | 1 | 38Y |
| ChatGPT | /services/foreign-owned-llc-tax-filing-service | 1 | 40Y |
| ChatGPT | /terms | 1 | 27Y |
| AI Mode | **/blog/form-5472-filing-service-comparison** (NEW) | 3 | 25Y, **26N**, 27Y (positions 1-2) |
| AI Mode | /blog/form-5472-in-house-vs-outsourced-firm | 1 | 19N |
| AI Mode | /blog/multiple-related-parties-form-5472 | 1 | 24N |
| AI Mode | /form-5472-reasonable-cause-statement | 1 | 22N |
| AI Mode | /services/final-form-5472-for-dissolved-llc | 1 | 9N |
| AI Mode | / (home) | 1 | 38N |
| Gemini | **/form-5472-statistics** | 12 | 18N (9 cites), 24N (3 cites) |
| Gemini | /services/form-5472-fax-filing-service | 6 | 15Y (6 text-fragment cites on one answer) |
| Gemini | /form-5472-reasonable-cause-statement | 6 | 22N (5), 34N (1) |
| Gemini | /blog/form-5472-reportable-transactions-examples | 3 | 29N |
| Gemini | **/blog/form-5472-filing-service-comparison** (NEW) | 2 | 25N, 26N |
| Gemini | /blog/form-5472-in-house-vs-outsourced-firm | 2 | 19N |
| Gemini | /pricing | 1 | 28Y |
| Gemini | /services/form-5472-for-bookkeepers | 1 | 6N |
| Perplexity (Oct 5) | / ; /blog/form-5472-partner-program-how-it-works ; /about | 2 ; 1 ; 1 | 19N, 25N ; 19N ; 27Y |
Responses citing us: ChatGPT 12 (12 named), AI Mode 8 (2 named, **6 not named**), Gemini 12 (3 named incl. Trustpilot-only #27; **9 not named**), Perplexity 3 (1 named). **Engines now read our pages heavily but only ChatGPT turns that into a brand mention.**

**Target-page check:**
- `/blog/form-5472-filing-service-comparison` (the comparison **blog** post): **cited 5x for the first time** - AI Mode #25 / #26 / #27 (pos 1-2) and Gemini #25 / #26 (pos 2). On #25 and #27 AI Mode also names us; on #26 (cost to hire someone) and Gemini #25/#26 it cites the page and still does not name us (Gemini #26 note: the cited fragment is the post's "What that list is not is cheapest" passage).
- `/compare/form-5472-filing-services`: **NOT cited** this run (Oct 19: ChatGPT #33 pos 7). ChatGPT #33 no longer names us.
- `/form-5472-statistics`: **cited 12x, all Gemini** (#18 x9, #24 x3) but we are never named on those (Gemini #18/#24 `-`); ChatGPT #18 stopped naming us.
- `/form-5472-reasonable-cause-statement`: 7 cites (AI Mode #22; Gemini #22 x5, #34) - none naming us. `/services/form-5472-fax-filing-service`: 6 Gemini cites on #15 (named).
- `/form-5472-example`, `/form-5472-instructions`, `/form-5472-penalty`, `/about` (ChatGPT/AI Mode/Gemini), **`/form-7004-extension`** (new service page): **not cited by any engine** (no tracked prompt targets Form 7004, EIN or ITIN; 21 responses mention Form 7004 in passing - deadline/extension context - citing irs.gov/about-form-7004 and clemta.com, never us). `/services/pro-forma-1120-filing-service`: not cited.
- ChatGPT's inline "Form5472 Prep +1/+2" source chips still carry no URL, so the ChatGPT figure above is Moz's citation rows (home dominates because the chip-less answer cards link the root).

### 1.4a Third-party pages cited where we are NOT named (top 15; 119 engine-responses without us: ChatGPT 28, AI Mode 38, Gemini 37, Perplexity 16)
count = responses citing the URL; irs.gov kept because it is the top single source.
1. **44x** irs.gov/instructions/i5472 (cha 16, aim 22, gem 4, per 2); plus 28x bare irs.gov (ChatGPT root links)
2. 10x hcvt.com/alertarticle-Foreign-Owned-Single-Member-US-LLC-Tax-Requirement (aim 5, gem 5)
3. 9x wise.com/us/blog/how-to-file-form-5472 (aim 3, gem 4, per 2)
4. 9x form5472.online (home) (cha 1, aim 4, gem 4)
5. 8x **hiltzikcpa.com/form-5472-filing-service** (aim 5, gem 2, per 1)
6. 8x clemta.com/blog/how-to-fill-out-form-5472 (aim 3, gem 5)
7. 7x irs.gov/payments/international-information-reporting-penalties (cha 2, aim 4, gem 1)
8. 7x irs.gov/forms-pubs/about-form-5472 (cha 3, aim 1, per 3)
9. 7x expatustax.com/form-5472 (Gemini only)
10. 6x irs.gov/pub/irs-pdf/i5472.pdf (aim 5, gem 1)
11. 5x delawarebusinessincorporators.com/pages/faq-for-form-1120-5472-foreign-owned-single-member-and-multi-member-llcs-and-corporations (aim 4, gem 1)
12. 4x form5472.online/best-online-services-to-file-irs-form-54... (aim 2, gem 2)
13. 4x form5472.online/pricing (aim 2, gem 2)
14. 4x optimizetax.io/blog/form-5472-penalty-relief (aim 2, gem 2)
15. 4x inkle.ai/blog/irs-form-5472 (Gemini only) - then loeb.com (3), optimizetax.io/knowledge/form-5472-llc-no-activity (3), wgcpas.com/article/form-5472-penalty-relief (3), madrasaccountancy.com (3), gettaxhub.com/form-5472-global-tax-filing (3), entity.inc/blog/best-us-llc-formation-services-non-residents (3), jamesbakercpa.com/services/form-5472-filing (3), accorppartners.com (3)
Domains by number of responses without us that cite them: irs.gov 67, **form5472.online 32**, optimizetax.io 12, hcvt.com 12, hiltzikcpa.com 11, clemta.com 11, wise.com 10, entity.inc 7, trybookmate.co 7, expatustax.com 7, delawarebusinessincorporators.com 5 (our own domain appears in 17 of these 119 - answers that cite our pages without naming us).
**Service-intent prompts only** (the 20 service prompts #1-3, 6, 7, 13-15, 17, 20, 25-28, 32, 33, 37-40; 54 engine-responses without us): irs.gov/instructions/i5472 14x - form5472.online (home) 7x - **hiltzikcpa.com/form-5472-filing-service 7x** - hcvt.com alert 5x - expatustax.com/form-5472 5x - form5472.online/best-online-services... 4x + /pricing 4x - wise.com 4x - clemta.com 4x - gettaxhub.com 3x - entity.inc best-llc-formation 3x - jamesbakercpa.com/services/form-5472-filing 3x - filabl.com/compare/doola 2x + /compare/stripe-atlas 2x - auricllc.com 2x. Domains: irs.gov 22, **form5472.online 22**, hiltzikcpa.com 8, optimizetax.io 6, entity.inc 6, **form5472prep.com 6** (our own pages again), wise.com 5, hcvt.com 5, expatustax.com 5, filabl.com 4, jamesbakercpa.com 4, clemta.com 4.

### 1.5 How engines describe us (facts repeated; check for wrong / outdated) - Oct 26
**The three baseline wrong facts are GONE:**
1. "~$99 (software wizard...)" - **not present** (AI Mode no longer names us on #33; AI Mode #25 now says "Form5472 Prep ... charge around $149 to have a tax professional holding an IRS PTIN do a review of your completed package"; the only "$99" attached to us anywhere is the correct "additional past tax year $99 each" in ChatGPT #1, #27, #28, #38).
2. "automated document generator / software-assisted / budget document preparation site" - **not present as a descriptor of us.** AI Mode #27 now says "real, operational online service ... guided questionnaire ... have a tax professional with an IRS PTIN review it ... fax the completed signed package to the IRS Ogden". It still calls us "a software-driven filing service rather than a traditional CPA firm" and "budget service". Gemini #27: "legitimate online document-preparation and filing-courier service ... a qualified tax accountant review the preparation ... explicitly state they are not a CPA firm" ("form-prep tool", "accountant checks the forms for completeness ... without a full CPA firm backing it"). The only "automated" in those answers is "automated intake machine" (the IRS fax).
3. "Express within 3 business days" - **not present.** ChatGPT #27 now states "$149 for standard service (5-7 business days) or $199 for express service, with an additional $99 per past tax year"; Gemini #28 table: "$149-$199, **24 Hours to 7 Days**, Form 5472 + Pro Forma 1120, accountant review, direct IRS fax submission with proof". (ChatGPT #15's "within 24 hours / does not review the forms' contents" is O&G Tax and Accounting, not us.) The "Expedite tax filing service (3 business days)" strings in ChatGPT #2/#28 are image captions for Form5472.online.
**New correct facts now repeated (brand-fact capsules working):** PTIN-holding tax accountant review (ChatGPT #27, #28; AI Mode #25, #27), "same team as Snapfile ... tiered options AI review vs human PTIN review" (AI Mode #27 - the only Snapfile mention, 1 of 160 responses), accountant review + IRS fax + timestamped receipt (ChatGPT #1, 2, 15, 25, 27, 28, 32, 38, 40; Gemini #28), partner/white-label with client signature collection (ChatGPT #19, #38), $149 / $199 / +$99 per past year (consistent across engines). No claim that we do not make was found ("filed within 24h" never appears; no CPA/EA claim).
**Remaining unflattering / inaccurate-ish items:**
- ChatGPT #27 (legit): "founded in 2025, so it doesn't have a long public track record", "It's not a CPA firm ... tax accountant with an IRS PTIN reviews filings, but it doesn't provide personalized tax advice or represent you before the IRS", "You remain responsible for accuracy", Trustpilot "4.2/5 from six reviews", "Email support@... and ask who the reviewing accountant is and what credentials they hold", verdict "relatively new provider ... reasonable budget option to investigate" (all sourced from our About/Terms/Trustpilot). Gemini #27 and AI Mode #27 both say "when to use a CPA instead" for complex/late cases.
- **ChatGPT #2** (best preparer): we are #3 "Best budget-oriented option to investigate ... filing service, not a CPA firm"; advice "Ask about who reviews the return and what credentials they hold" - PTIN reviewer NOT mentioned here. ChatGPT #13 (doola vs firstbase): we appear last as "advertises single-year filing from $149 ... Confirm its scope and suitability".
- **ChatGPT #38 (white label): "White-label client emails are described on its white-label service page, but another partner page gives a different status. Confirm current availability"** - a real contradiction between /services/white-label-form-5472-filing and /partners (or the partner blog post) that ChatGPT spotted; fix it on the site.
- Gemini #27 positions us as the "form-prep tool" rung between self-service (5472Direct) and CPA-led (form5472.online, tax-usa.net).

### 1.6 Sentiment (tab loads; `ai.tracking.project.sentiment.fetch`, latest collection of each engine)
| Engine | Our score | Confidence | Relevant segments (+ / - / =) | Segments attributed to us |
|---|---|---|---|---|
| ChatGPT (Oct 26) | **48.9** (Oct 19: 47.6) | **low** (was high) | 44 (0 / 1 / 43) | 1 negative |
| AI Mode (Oct 26) | 50.0 | insufficient | 5 (0 / 0 / 5) | 0 |
| Gemini (Oct 26) | **75.0** | low | 2 (1 / 0 / 1) | 1 positive ("Yes, form5472prep.com ... is a real service provider ...") |
| Perplexity (Oct 5) | 50.0 | insufficient | 1 neutral | 0 |
Competitors: ChatGPT Form5472.online 42.9 (low; 1 neg - the $25,000 penalty caution), Doola 50 / Firstbase 50 (insufficient); AI Mode Form5472.online 40.0 (low; 2 neg - "most misunderstood and penalized" snippets), **Doola 46.4 (high; +1 / -2)**, Firstbase 53.8 (low; +1); Gemini Doola 45.0 (high; +1 / -3: "modular trap", higher-tier package), Firstbase 54.5 (low; +1), Form5472.online 50 (insufficient).
**Themes (ChatGPT, our brand): ONE - "service quality" -0.5 (1 mention)**, segment "These are shortlists based on advertised services and pricing, not independent audits of their quality." The Oct 19 negative themes **"company qualifications" (founded 2025 / not a CPA firm) and "filing penalties" next to our name are no longer themes** (only 1 attributed span now vs 41 mentions before - Moz's segmenter attributed far fewer segments to us). AI Mode / Gemini themes are about competitors (form 5472 confusion, compliance packages, automated tracking features, modular setup).
Corpus: ChatGPT 510 segments (7 pos / 29 neg / 474 neu = 92.9% neutral); AI Mode 465 (4 / 42 / 419; 90.1%); Gemini 372 (6 / 41 / 325; 87.4%); Perplexity 25 (all neutral). Response-level labels (Moz `sentiment_label`, not brand-specific; Oct 19 -> Oct 26): ChatGPT neutral 20 -> 21 / negative 17 -> 14 / mixed 3 -> 2 / positive 0 -> 3 (of 40); AI Mode neutral 15 -> 14 / negative 21 -> 23 / mixed 3 -> 2 / positive 1 -> 1; Gemini neutral 17 -> 14 / negative 20 -> 20 / mixed 1 -> 5 / positive 2 -> 1; Perplexity neutral 17 (Oct 5). Negative share is topic-driven (penalty / IRS-rules prompts): ChatGPT 35%, AI Mode 57.5%, Gemini 50%.


---

## 2. Domain Overview for form5472prep.com (run 2026-10-30; domain scope, market US en-US)
Credits: Domain Overview quota read "77 of 100 queries available until 11/01" before, **76 after query 1 (form5472prep.com)**. Ranking Keywords pool "5,000 of 5,000" -> 4,999 after one list view (pool reset on the page; Oct 26 was 3,749 of 5,000).

### 2.1 Headline metrics, now vs 2026-10-26
| Metric | 2026-10-26 | **2026-10-30** | Delta |
|---|---|---|---|
| Domain Authority | 11 | **12** | **+1** (12-month chart now 1 -> 12) |
| Brand Authority | 1 | **1** | 0 |
| Page Authority (homepage) | 29 | **29** | 0 |
| Spam Score (domain) | 16% | see 3.1 | |
| Linking root domains | 68 | **76** | **+8** (homepage is the only page with linking domains: PA 29 = 76) |
| Linking domains discovered, last 60 days / lost | 22 / 0 | **28 / 0** (net +28; window Sep 1 - Oct 27) | +6 discovered |
| Ranking keywords (Moz US) | 106 | **106** | **0 - the list is byte-identical to Oct 26** |
| Keywords #1-3 / #4-10 / #11-20 / #21-30 / #31-40 / #41-50 / #51+ | 5/3/8/11/14/9/56 | **5/3/8/11/14/9/56** | identical |
| Domain search theme | International Tax Compliance | same | |
| Keyword topics | same 5 | 1 Form 5472 filing requirements, 2 CPE for foreign-owned LLCs, 3 IRS reporting for foreign shareholders, 4 Cross-border tax documentation, 5 CPE credit for international tax professionals | same |
| Linking domains by spam score (Moz bands) | 1-10%: 43, 11-20%: 14, 21-30%: 1, 61-70%: 1 | **1-10%: 49, 11-20%: 14, 21-30%: 1, 61-70%: 1** (= 8coint.com) | +6 in the 1-10% band |
**Ranking keywords: 0 new / 0 lost / 0 position or URL changes vs 10-26.** I hashed the full 106-row list (keyword | position | ranking URL) from Keyword Research > Ranking Keywords (2 pages, 100 + 6 rows) and the baseline table of 10-26 - SHA-1 identical (`b187b20a62d0...`, rank sum 5,273 on both). "Keyword Data Updated Every Two Weeks": the 10-11 -> 10-26 refresh was +27/-1; the next refresh is expected ~2026-11-09, so **no ranking-keyword delta is obtainable this week** (the AI-visibility-era pages /compare, /form-5472-statistics, /form-7004-extension still do not appear for any keyword). Top 5 unchanged: form 5472 preparation service #1 (/services), form 5472 preparer #1, form 5472 preparation service pdf #1, 5472 form filling #2, form 5472 outsourcing #3; head term "form 5472" #29 (/blog/what-is-form-5472, vol 2,361).
Competitor Overview (Moz "true competitors"): taxule.com 21 kw / 2 at #1-3 / PA 23 (was 22) / DA 3 / BA 1; en-se.tkegexpat.com 10 kw / 0 / 2 at #4-10 / PA 17 / DA 15 (BA 1); easyfiling.com 8.5k kw / 36 at #1-3 / 269 at #4-10 / PA 38 (37) / DA 58 / BA 1; us 106 / 5 / 3 / 29 / 12 / 1. Keyword opportunities widget: still only "form 5472 rental property llc" (lift 0). Link-opportunities widget: gofreebacklinks.com, seosoftwareshop.com, wants.cfd, tokoseo.com, seo-first-page.com (all link-farm style; same class as before).
Top pages by linking domains: homepage PA 29 = 76 linking domains; /blog/form-5472-client-intake-checklist-for-firms, /blog/topics/influencers, /start?v=below&src=form-5472-instructions&tier=premium, /blog/topics/south-korea (each PA 15, 0 linking domains) - same set as 10-26. Top linking domains by DA: cvillico.com (DA 64, 694 LDs), cmocheatsheets.com (62, 825), mylisthero.com (62, 392), **teaserspublichouse.com (61, 567 - new in the top 5, replaces mymarketpost.com)**, wioutlet.com (61, 329) - all PBN-class.
Frequently used anchors: PBN sentence "high quality dofollow backlinks da 50 pa 40 premium pbn network service form5472prep.com rank first page google fast seo link building buy backlinks online cheap" = **68 domains / 198 followed external links** (Oct 26: 60 / 180; 10-11: 54 / 146); "form5472prep.com" 1 domain / 2 links (form5472.online).


---

## 3. Link Explorer for form5472prep.com (root domain, run 2026-10-30)
Queries used: **1 Link Explorer target (form5472prep.com)** viewed through Overview, Discovered & Lost and Inbound Links; pool "20,000 -> 19,999 of 20,000 queries available until 11/30" (cap 2; 1 used so far). Inbound-link rows were read from the page's own read-only `listerine/api/1.4/idina/links` GET (same call the Inbound Links page issues, `limit=250` returns all 216 rows incl. source URL, anchor, nofollow flag, first-seen date; the page's own `page=` URL parameter does not paginate).

### 3.1 Summary now vs 2026-10-26
| Metric | 2026-10-26 | **2026-10-30** | Delta |
|---|---|---|---|
| DA / PA / Spam Score (domain) | 11 / 29 / 16% | **12 / 29 / 16%** | DA +1, PA 0, spam same (Spam Score updated quarterly; last crawl of homepage 2026-09-20) |
| Linking root domains | 68 | **76** | **+8 new, 0 lost** |
| Discovered / lost, window Sep 1 - Oct 30 | 22 / 0 (Aug 28 - Oct 26) | **28 / 0** | +6 (window rolled and 8 new found) |
| Inbound link rows total / followed | 198 / 182 | **216 / 200** | +18 rows, all followed PBN (16 rows on the 8 new domains + 2 www/non-www duplicate rows on elrinconcitocofrade.com) |
| External links follow / nofollow | 91.9% / 8.1% | **92.6% / 7.4%** | |
| Spam score of linking domains | 98.3% in 1-30%, 1.7% (8coint.com 61%) in 61-100% | **49 / 14 / 1 in 1-10 / 11-20 / 21-30%, 1 in 61-70%** (=8coint.com) | the 8 new are 1-5% where Moz scores them (3 unscored) |
| Anchor = PBN advert sentence | 60 domains / 180 links | **68 domains / 198 links** | +8 domains / +18 links |
| All links land on | homepage | homepage (inner pages: 0 linking domains) | |

### 3.2 NEW linking domains since the last read (exactly EIGHT; none lost)
All eight are the same PBN-advert pattern (`/all/1102/22.html` "Boost your Google rankings with Premium PBN & Link Building", anchor = the premium-PBN sentence, target = homepage, followed; 2 rows each: direct + redirect/www-variant). Dates are Moz "Date Found".
| Domain | DA | Spam | Found | Source URL | Class |
|---|---|---|---|---|---|
| dbike-us.com | 58 | 2% | 10/27/2026 | /all/1102/22.html | **PBN-advert spam** |
| theerlinnews.com | 57 | 2% | 10/27/2026 | /all/1102/22.html | **PBN-advert spam** |
| bureatag.com | 59 | 3% | 10/27/2026 | /all/1102/22.html | **PBN-advert spam** |
| teaserspublichouse.com | 61 | 5% | 10/26/2026 | /all/1102/22.html | **PBN-advert spam** (now #4 top linking domain by DA) |
| elrinconcitocofrade.com (www. + non-www) | 57 | 2% | 10/26/2026 | /all/1102/22.html (4 rows) | **PBN-advert spam** |
| marketbusinessnewz.com | 59 | -- | 10/26/2026 | /all/1102/22.html | **PBN-advert spam** |
| lorentius.com | 56 | -- | 10/25/2026 | /all/1102/22.html | **PBN-advert spam** |
| seostrix.com | 59 | 1% | 10/25/2026 | /all/1102/22.html | **PBN-advert spam** |
**GENUINE new links: NONE.** No new competitor link, no new auto stats page. Newest-first discovered list: dbike-us.com 10/27, theerlinnews.com 10/27, bureatag.com 10/27, teaserspublichouse.com 10/26, elrinconcitocofrade.com 10/26, marketbusinessnewz.com 10/26, lorentius.com 10/25, seostrix.com 10/25, wecelebrities.com 10/23 ... (everything from 10/23 back unchanged vs the 10-26 read). **Lost links: none** (Total Lost -0). The PBN reseller keeps adding ~1 domain per day now (8 in 4 days, Oct 25-27 - faster than the ~1 per 2-3 days of Oct 11-23), all DA 56-61; the last discovered date is 10/27 (nothing found 10/28-10/30 yet).

### 3.3 Other link-row changes on EXISTING domains
None. The 14 automated report/stats rows (drjack.world/report/139402, quero.party/report/139402, atomizelink.icu/report/139401, dailymusings.top/stats/139402 + /stats/139401, optimizeflow.top/stats/139401, 8coint.com/list.php?part=2026/05/22/59 [spam 61%]) are all nofollow, anchor "form5472prep.com", unchanged. Competitors unchanged: form5472.online (DA 15, spam 11%, **followed**) still links from `/post/form-5472-filing-services-compared-credentials-reviews-pricing-evidence` (found 2026-08-30, anchor "form5472prep.com"); form5472.ai (DA 14, 3%) nofollow on `/providers` (found 2026-09-25).

### 3.4 Classification of all 76 linking domains / 216 rows
| Class | Domains | Link rows | Followed rows |
|---|---|---|---|
| PBN-advert spam (`/all/1102/22.html`, premium-PBN anchor) | **68** (was 60) | **198** (was 180) | 198 (all) |
| Automated report/stats pages (drjack.world, quero.party, atomizelink.icu, dailymusings.top, optimizeflow.top; + 8coint.com list page, spam 61%) | 6 | 14 | 0 (all nofollow) |
| Competitor editorial (form5472.online followed, form5472.ai nofollow) | 2 | 4 | 2 |
| **Genuine / earned (non-competitor, non-spam)** | **0** | **0** | 0 |
Rows: 198 + 14 + 4 = 216. Domains: 68 + 6 + 2 = 76. **We still have zero earned links**; DA rose 11 -> 12 purely from the PBN rows (88% of linking domains, 92% of link rows, and 99% of followed rows are the one PBN advert; the only two followed non-PBN rows are form5472.online's competitor article). Per the Moz page the top pages with linking domains are still the homepage only (PA 29 = 76).


---

## 4. Brand Authority / competitor profile (Domain Overview + Link Explorer; DO 2 of 2 used: form5472prep.com, form5472.online; LE 2 of 2 used: form5472prep.com, form5472.online)
| Metric | form5472prep.com 10-26 -> **10-30** | form5472.online 10-26 -> **10-30** |
|---|---|---|
| Brand Authority | 1 -> **1** | 1 -> **1** |
| Domain Authority | 11 -> **12** | 15 -> **15** |
| Page Authority (homepage) | 29 -> **29** | 33 -> **34** (www.form5472.online PA 37) |
| Linking root domains | 68 -> **76** | 308 -> **319** (+11; discovered 77 / lost 4 in 60 d) |
| Ranking keywords (US) | 106 -> **106** | 272 -> **272** (#1-3: 15 -> **15**; #4-10: 26 -> **26**) |
| Search theme | International Tax Compliance | Foreign-Owned LLC Tax Compliance |
Notes:
- **BA has still not moved for anyone**; the DA gap to form5472.online is -3 (12 vs 15; was -4). We closed it again purely with PBN rows.
- form5472.online's keyword counts are also identical to Oct 26 (272 / 15 / 26) - same two-week refresh cycle. Top keywords: #1 "form 5472 filing service" (KD 42, vol 4), #2 "launchusa" (195), #2 "form 5472 for cpas", #2 "late form 5472 filing service", #2 "form 5472 and pro forma 1120 filing service". Keyword-opportunity widget: "form 5472" (traffic lift 660), "form 5472 instructions" (180), "5472 instructions" (97), "5472 form" (41). Competitors: launchusaonline.com (54 kw, DA 12), irs.gov (321.6k kw, DA 92), globalfy.com (2.3k kw, DA 28).
- **form5472.online's 581 inbound link rows / 319 linking domains (Link Explorer, 516 followed), by anchor:** 178 domains / 217 rows anchor = its own URL, all `/listings#/...` pages on free web-directory sites (victorydirectory.com, webdirectory11.com, worlds-directory.com ... median DA 23); **68 domains / 198 rows = the same "premium PBN network" advert anchor we carry (identical 68 / 198 as ours)**; 25 domains "premium twinsalgo.com backlinks ..." (23 on 10-26, 7 on 10-11); the remaining 47 domains / 140 rows are:
  - **Earned-looking press/editorial (followed):** natlawreview.com (DA 75, press release "Form5472.online publishes compliance framework for foreign-owned ...", found 2026-09-18, anchors "cpa filing assurance protocol" / "form5472.online"); cpapracticeadvisor.com (DA 60, 2026/08/05 article "Protecting non-resident clients from the $25,000 IRS ...", found 2026-08-13); qusos.com (DA 65, blog post, 2025); a launchusa press-release syndication network (`/agp-article/933950837-form5472-online-launches-ai-built-dashboard...` on americantimesreporter.com, virginiabusinessbulletin.com, wyomingfreepress.com, equalitystateobserver.com, thewyomingsun.com, uspoliticalpressreleases.com, financetimesgazette.com - DA 4-15, followed) and `/article/933946398-200-000-beats-13m-form5472-online-dashboard-outscores...` on 9 more small news sites (nofollow).
  - **Press-release wires (nofollow):** webwire.com (DA 67, 3 releases 2025-12 / 2026-03), abnewswire.com (DA 57, spam 75%), getnews.info, universalpressrelease.com, marketminute.com.
  - **Sister / partner sites (followed):** tax-usa.net (DA 14; blog posts "who can help me file form 5472" etc., 2026-09/10), chatnra.com (DA 13), globalllc.co, pointsarchitect.com (2026-10-26), **form5472.ai (DA 14) - 8 blog posts link to form5472.online (followed, 2026-09-18/19) while it nofollows us**.
  - Directory/review listings (nofollow): reviewfoxy.com, trustwizz.com, wule.org, filabl.com/compare/cpa, hiremyaccountant.com, virtuallaunch.pro; tradingview.com profile (DA 90, nofollow); pages.dev spam (DA 93, nofollow); example3.com / wants.cfd link-farm pages.
  So **their genuine-looking authority comes from ~3 editorial placements (natlawreview DA 75, cpapracticeadvisor DA 60, qusos DA 65) plus press-release syndication**; the other 300+ domains are directory listings and the same PBN network we have.
- Not re-pulled this session (DO cap): doola.com (BA 28 / DA 39 on 10-26) and firstbase.io (BA 28 / DA 37 on 10-07).

---

## 5. What was NOT obtainable / limits
1. **Nov 2 AI collection is not in** (banner: "Data as of Oct 26, 2026. Next data collection: Monday, Nov 2, 2026").
2. **Perplexity has NOT been collected since Oct 5** (only 17/40 prompts ever; no Oct 12 / 19 / 26 rows in `metrics.fetch`). Perplexity trend / gain-loss is impossible; every Perplexity number is Oct 5.
3. **Per-prompt gain/loss vs Oct 19 relies on the 10-26 baseline file's Oct 19 table** (Moz keeps only the latest response per prompt). ChatGPT answers are non-deterministic week to week - a single-week -4 on ChatGPT needs the Nov 2 run to confirm as a trend.
4. **ChatGPT citations are not like-for-like with Oct 19** (Moz returned 0 then, 159 rows now; inline "Form5472 Prep +1" source chips still carry no URL, so the home page dominates our ChatGPT citation rows).
5. Moz AI Visibility only tracks the 40 existing prompts - none targets EIN, ITIN or Form 7004 (the new /form-7004-extension page and the EIN/ITIN service pages cannot show up in this dashboard); doola/firstbase BA not re-pulled (DO cap 2).
6. **Ranking-keyword delta is empty by construction:** the list is on a two-week refresh and did not refresh (identical SHA-1 to Oct 26). Next expected ~Nov 9.
7. Link Explorer "Date Found" is per linking domain; Spam Score (16%) updates quarterly. The Inbound Links page's own `page=` URL parameter does not paginate - all 216 rows were read from the page's own `listerine/api/1.4/idina/links` GET (limit 250), same data the UI table uses.
8. Nothing was exported, edited, saved or created in Moz; one tab (`tab-2`) used; no other tab touched; no sign-in/out; no Chrome tools used. The pane was set to 1400x900 on tab-2 for the extraction and reset to desktop at the end.
