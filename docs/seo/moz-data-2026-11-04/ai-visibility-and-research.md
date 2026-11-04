# Moz Pro re-read E: AI Visibility + research tools for form5472prep.com (delta vs 2026-10-30 baseline / 2026-10-26 run)

Extracted 2026-11-04 (read-only; own tab `tab-2` of the built-in Claude in-app browser, Moz Pro already signed in - no sign-in performed). Baseline: `base/2026-10-30-ai-visibility-and-research.md` (runs Oct 5 / 12 / 19 / 26). Nothing added/edited/deleted/exported/downloaded in Moz. Only page loads and the page's own read-only `*.fetch` / `*.lookup` JSON-RPC calls (`ai.tracking.project.lookup / metrics.fetch / responses.fetch / citations.fetch (+async.call.lookup) / sentiment.fetch`, the same calls the dashboard issues) were used. Per-prompt tables are built from Moz's own `brand_mentions` (normalized depth) on the raw responses; Moz presence counts and my counts agree on every engine (US 11 / 3 / 4 / 1).

(Process note: I first opened two tabs in the user's Chrome by mistake - Chrome Browser 1 was not logged in to Moz, Browser 2 was. On the coordinator's correction I abandoned Chrome and used only the in-app browser. No Moz action happened in Chrome beyond loading the login/dashboard redirect; the Chrome tab groups were reset by the extension and could not be closed from here - see section 5.)

## 0. Headline deltas (read this first)
- **AI collections:** Oct 5, 12, 19, 26, **Nov 2 (now in; next Monday Nov 9)**. **Perplexity still not collected since Oct 5** (17/40). **Moz stored almost no Gemini sources on Nov 2 (2 rows vs 287)** - Gemini citation comparisons are void this week.
- **Mention rate (us / Form5472.online / Doola / Firstbase), Oct 26 -> Nov 2:** ChatGPT 30.0 / 7.5 / 5.0 / 5.0 -> **27.5** / 5.0 / 7.5 / 7.5 (still 1st, lead 20 pts; our 3rd straight small decline from 37.5); AI Mode 5.0 / 22.5 / 10.0 / 10.0 -> **7.5** / **10.0** / 15.0 / 10.0 (we are still 4th but Form5472.online collapsed 9 -> 4 prompts, so the gap to it is 2.5 pts, was 17.5); Gemini 7.5 / 15.0 / 17.5 / 17.5 -> **10.0** / 12.5 / 15.0 / 12.5 (still last, our best Gemini gap yet). SoV (us) ChatGPT 63.2 -> 57.9, AI Mode 10.5 -> 17.6, Gemini 13.0 -> 20.0.
- **Prompts gained / lost vs Oct 26:** union of prompts naming us on any engine **12 -> 12** (gained #17 "preparer for a foreign-owned llc" and #33 "cheapest way" [Gemini, with a WRONG ~$99 row]; lost #13 doola-vs-firstbase and #40 who-can-i-hire). By engine: ChatGPT 12 -> 11 (+#17; -#13, -#40); AI Mode 2 -> 3 (+#38 white label); Gemini 3 -> 4 (+#25, +#32, +#33; -#15 fax receipt, -#28 flat-fee). **28 of 40 prompts still name us on no engine.**
- **Outdated / wrong facts engines repeat (2, both Gemini):** #25 "Express ... ready within 24 hours" (now under 3 days) and **#33 "Form5472Prep ~$99 - simple step-by-step wizard"** (the Oct 12-19 wrong fact is BACK). ChatGPT / AI Mode / Gemini #32 state $149 / $199 / PTIN-holding accountant review / IRS fax correctly; the Oct 26 white-label contradiction is gone (ChatGPT #19 / #38 now say "dedicated white-label program"). Repeated negatives are our own words quoted back: "founded in 2025", "not a CPA firm", "couldn't establish the reviewer's identity", limited Trustpilot history.
- **Form 7004 ($19):** 22 responses discuss it (ChatGPT 6, AI Mode 5, Gemini 10, Perplexity 1) - **none names us, none cites /form-7004-extension**, no 7004 price attached to us; /form-7004-extension also has no Moz ranking keyword. No tracked prompt targets 7004.
- **Our pages cited:** 68 -> **26** rows (ChatGPT 23 -> 18, AI Mode 8 -> 4, Gemini 33 -> 0 [capture loss], Perplexity 4 Oct 5); ChatGPT now also cites /compare/form-5472-filing-services (2x), /blog/offer-form-5472-filing-as-a-service, /form-5472-statistics; /blog/form-5472-filing-service-comparison (5x last run) 0x. ChatGPT cited our pages without naming us on #13 and #18 (a first).
- **Sources we lose to (responses without us):** irs.gov/instructions/i5472 31x (+15 bare irs.gov, +11 tracked variants), irs.gov penalties page 11x, hcvt.com alert 5x, clemta.com 4x, form5472.online (/best-online-services..., /post/best-form-5472-filing-services-2026) 12 responses across pages, filabl.com/compare/doola 3x, taxclaim.co 3x, hiltzikcpa.com 2x (was 8x), reddit.com 8 citations (new).
- **Sentiment:** API returns no numeric score for us (confidence low / insufficient). ChatGPT: 1 negative segment, two themes ("company track record concerns" -0.5, "lack of CPA representation" -0.5, both from #27); Gemini 1 negative (the $25,000 caution paragraph); AI Mode 0 attributed.
- **Authority (Domain Overview + Link Explorer, Nov 4):** **DA 12 -> 14**, BA 1 -> 1, PA 29 -> 30, Spam Score 16% (unchanged, quarterly), linking root domains 76 -> **84**, discovered-60d 32 / lost 0, inbound rows 216 -> 239. **8 new linking domains: 6 PBN-advert spam (DA 58-61), 1 automated stats page (creativeposts.top), 1 UNVERIFIED followed article link (nerdbot.com, DA 51, keyword anchor "form5472 preparation")**; **0 confirmed genuine earned links; 0 lost.** Ranking keywords **106 -> 125 (+19 new, 0 lost, 0 moved)**, #4-10 3 -> 7 (new due-date / instructions keywords), top 5 unchanged.
- **Competitor:** form5472.online DA 15, BA 1, PA 34, 342 linking domains (+23), 319 ranking keywords (+47; #1-3 15, #4-10 36); it carries the same 74-domain / 218-link PBN advert as ours; its 24 new domains = the same 6 PBN domains + 18 SEO-tool farms, no new press.

---

## 1. AI Visibility dashboard "Form5472prep" (id 3465)

### 1.0 Collection status
- Dashboards list: Form5472prep "Latest collection: **Nov 2, 2026**" (Milemarketplace also Nov 2; Taxley dashboards Nov 1). Project record: `latest_collection_date` 2026-11-02T00:03:42Z, **`next_collection_date` 2026-11-09**; dashboard banner "Data as of Nov 2, 2026. Next data collection: Monday, Nov 9, 2026." **The Nov 2 run IS in** (5th data point: Oct 5, 12, 19, 26, **Nov 2**).
- `latest_collection_date_by_engine`: ChatGPT / AI Mode / Gemini 2026-11-02; **Perplexity 2026-10-05 (never re-collected - still 17 of 40 prompts, Oct 5 snapshot; 23 prompts never collected)**. Every Perplexity figure is the Oct 5 snapshot.
- Prompts with data on the latest run: ChatGPT 40/40, AI Mode 40/40, Gemini 40/40 (all `collected_at` 2026-11-02), Perplexity 17/40 (Oct 5). Same 40 prompts as the baseline (identical text, same alphabetical numbering).
- **DATA CHANGE to know about: Moz captured almost no Gemini sources on Nov 2.** Gemini citation rows: **2 total** (Oct 26: 287). Gemini answers still carry "🔗" source markers in the text but Moz stored no URLs, so every per-prompt Gemini `c` below is 0 and Gemini citation-based comparisons with Oct 26 are not valid. AI Mode citations fell 169 -> 112, ChatGPT 159 -> 165 (Moz rows). Totals Nov 2 (Moz citation rows): ChatGPT 165 / 81 unique URLs / 39 domains; AI Mode 112 / 73 / 38; Gemini 2 / 2 / 1; Perplexity 19 / 14 / 8 (Oct 5).

### 1.1 Trend per engine - presence % (responses naming brand / Moz response count). **Bold** = us.
| Engine | Brand | Oct 5 | Oct 12 | Oct 19 | Oct 26 | **Nov 2** | Nov 2 vs Oct 26 |
|---|---|---|---|---|---|---|---|
| **ChatGPT** | **Form5472prep** | 10.53% (2/19) | 37.50% (15/40) | 30.56% (11/36)* | 30.00% (12/40) | **27.50% (11/40)** | -2.5 |
| | Form5472.online | 15.79% (3/19) | 10.00% (4/40) | 5.56% (2/36)* | 7.50% (3/40) | 5.00% (2/40) | -2.5 |
| | Doola | 5.26% (1/19) | 7.50% (3/40) | 5.56% (2/36) | 5.00% (2/40) | 7.50% (3/40) | +2.5 |
| | Firstbase | 0% (0/19) | 5.00% (2/40) | 5.56% (2/36) | 5.00% (2/40) | 7.50% (3/40) | +2.5 |
| | our rank | 2nd | 1st | 1st | 1st (lead 22.5) | **1st (lead 20.0 pts)** | |
| **Google AI Mode** | **Form5472prep** | 21.05% (4/19) | 7.50% (3/40) | 10.00% (4/40) | 5.00% (2/40) | **7.50% (3/40)** | +2.5 |
| | Form5472.online | 15.79% (3/19) | 17.50% (7/40) | 22.50% (9/40) | 22.50% (9/40) | **10.00% (4/40)** | **-12.5** |
| | Doola | 21.05% (4/19) | 15.00% (6/40) | 15.00% (6/40) | 10.00% (4/40) | 15.00% (6/40) | +5.0 |
| | Firstbase | 15.79% (3/19) | 12.50% (5/40) | 12.50% (5/40) | 10.00% (4/40) | 10.00% (4/40) | 0 |
| | our rank | 1st (tied) | 4th | 4th | 4th | **4th (last)**: 2.5 pts behind Form5472.online / Firstbase (10.0), 7.5 behind Doola (15.0); gap to Form5472.online cut from 17.5 to 2.5 pts because IT fell | |
| **Gemini** | **Form5472prep** | 10.53% (2/19) | 7.50% (3/40) | 5.00% (2/40) | 7.50% (3/40) | **10.00% (4/40)** | +2.5 |
| | Form5472.online | 26.32% (5/19) | 20.00% (8/40) | 20.00% (8/40) | 15.00% (6/40) | 12.50% (5/40) | -2.5 |
| | Doola | 42.11% (8/19) | 17.50% (7/40) | 12.50% (5/40) | 17.50% (7/40) | 15.00% (6/40) | -2.5 |
| | Firstbase | 42.11% (8/19) | 10.00% (4/40) | 12.50% (5/40) | 17.50% (7/40) | 12.50% (5/40) | -5.0 |
| | our rank | 4th | 4th | 4th | 4th | **4th (last), 2.5 pts behind F and FB** (best gap yet) | |
| **Perplexity** (NOT re-collected) | **Form5472prep** | 5.56% (1/18) | no run | no run | no run | **no run** | n/a |
| | Form5472.online / Doola / Firstbase | 5.56% / 11.11% / 11.11% | | | | | |
*Oct 19 ChatGPT is Moz's 36-response denominator (recount was 15/40 = 37.5%). Like-for-like ChatGPT (us, 40/40): 37.5% (Oct 12) -> 37.5% (Oct 19) -> 30.0% (Oct 26) -> **27.5% (Nov 2)** = three consecutive declines, but still 5x the best competitor (Doola/Firstbase 7.5%).

Average depth of our FIRST mention (% of response length; lower = earlier), Oct 5 -> 12 -> 19 -> 26 -> **Nov 2**: ChatGPT 6.67 -> 30.23 -> 28.59 -> 30.20 -> **24.75** (earliest since Oct 5); AI Mode 32.91 -> 37.50 -> 25.95 -> 22.81 -> **38.02**; Gemini 39.18 -> 24.99 -> 45.55 -> 26.06 -> **39.78**. Average position over all our mentions Nov 2: ChatGPT 24.49 (was 43.07), AI Mode 19.70 (10.71), Gemini 26.00 (24.63).

### 1.2 Mention counts, share of voice (SoV), "mentioned first" - Nov 2 (from Moz brand_mentions)
SoV = brand's share of all tracked-brand responses (sum of the four counts). First = responses where that brand is the first tracked brand named.
| Engine (rows) | US (SoV, first) | Form5472.online | Doola | Firstbase | No tracked brand named |
|---|---|---|---|---|---|
| ChatGPT (40) | **11 (57.9%, 10)** | 2 (10.5%, 0) | 3 (15.8%, 3) | 3 (15.8%, 0) | 27/40 |
| Google AI Mode (40) | **3 (17.6%, 3)** | 4 (23.5%, 3) | 6 (35.3%, 3) | 4 (23.5%, 1) | 30/40 |
| Gemini (40) | **4 (20.0%, 3)** | 5 (25.0%, 3) | 6 (30.0%, 4) | 5 (25.0%, 1) | 29/40 |
| Perplexity (17, Oct 5) | 1 (16.7%, 1) | 1 (16.7%, 1) | 2 (33.3%, 2) | 2 (33.3%, 0) | 13/17 |
SoV delta Oct 26 -> Nov 2 (us): ChatGPT 63.2 -> 57.9 (-5.3), **AI Mode 10.5 -> 17.6 (+7.1)**, Gemini 13.0 -> 20.0 (+7.0). Oct 26 reference: ChatGPT 63.2 / AI Mode 10.5 / Gemini 13.0.

### 1.3 Per-prompt table - latest run (ChatGPT / AI Mode / Gemini = 2026-11-02; Perplexity = 2026-10-05, the latest it has)
Cell = tracked brands named in order of first mention with `@` = depth of first mention as % of response length (US = Form5472 Prep, F = Form5472.online, D = Doola, FB = Firstbase, "-" = none of the four); `cN` = citation rows Moz stored for that response (`our k` = k of them are form5472prep.com URLs; **Gemini is c0 everywhere = Moz stored no Gemini sources on Nov 2, see 1.0**); neu/neg/pos/mix = Moz response-level sentiment label; STUBn = very short (n-char) response; `nodata` = Perplexity never collected this prompt. **Bold US** = we are named. Prompt numbers = alphabetical numbers used in the baseline.

| # | Prompt | ChatGPT | Google AI Mode | Gemini | Perplexity (Oct 5) |
|---|---|---|---|---|---|
| 1 | alternatives to doola for form 5472 filing | D@1>**US**@17>F@23>FB@24 c6(our 2) pos | D@2>F@70 c3 pos | D@1>FB@16 c0 pos | D@10>FB@20 c1 neu STUB337 |
| 2 | best form 5472 preparer for non-resident llc owners | **US**@45 c10(our 2) neu | F@19>D@29>FB@43 c2 neu | F@15>D@64>FB@64 c0 pos | F@43 c1 neu STUB451 |
| 3 | best way to file form 5472 for a stripe atlas company | - c4 neg | - c4 neu | D@64 c0 neg | nodata |
| 4 | can form 5472 be faxed to the irs | - c2 neu | - c1 neu | - c0 neu | - c1 neu STUB338 |
| 5 | can form 5472 be filed electronically or only by fax or mail | - c1 neu | - c1 neg | - c0 neu | nodata |
| 6 | can my bookkeeper file form 5472 for my us llc | - c1 neg | - c4 neu | - c0 neg | nodata |
| 7 | do accountants file form 5472 for foreign-owned llc clients | - c2 neu | - c3 neu | - c0 neg | nodata |
| 8 | do i need form 5472 if i only put money into my llc | - c1 neu | - c4 neg | - c0 neg | nodata |
| 9 | do i need to file a final form 5472 when i dissolve my llc? | - c1 neu | - c4 neg | - c0 neg | - c1 neu STUB340 |
| 10 | do i need to file form 5472 if my llc had no income? | - c2 neg | - c3 neg | - c0 neg | - c1 neu STUB312 |
| 11 | does a delaware llc owned by a foreign person need to file form 5472 | - c1 neg | - c4 neu | - c0 neu | nodata |
| 12 | does a wyoming llc owned by a non-resident need to file form 5472 | - c2 neu | - c2 neu | - c0 neu | nodata |
| 13 | doola vs firstbase for form 5472 filing | D@0>FB@0 c8(our 1, URL only - /compare page, not named) neu | D@1>FB@1 c4 neg | D@0>FB@1 c0 neu | D@5>FB@8 c0 neu STUB328 |
| 14 | form 5472 filing service for a dormant llc | - c5 neu | FB@68>D@75 c3 neg | FB@76>D@77 c0 neg | nodata |
| 15 | form 5472 filing service with a fax confirmation receipt | **US**@33 c6(our 2) neu | - c2 neu | - c0 neg | nodata |
| 16 | form 5472 penalty calculator | - c4 neg | - c1 neg | - c0 neg | nodata |
| 17 | form 5472 preparer for a foreign-owned llc | **US**@15>F@34 c5(our 1) neg | - c1 neu | - c0 neg | nodata |
| 18 | form 5472 statistics and penalty figures | - c9(our 1) neg | - c4 neg | - c0 neg | nodata |
| 19 | how can accountants outsource form 5472 preparation for clients? | **US**@31 c7(our 2) neg | - c3 neg | - c0 neu | - c2(our 2) neu STUB402 |
| 20 | how do i file form 5472 if i am not a us resident? | - c5 neg | - c2 neu | - c0 neg | - c1 neu STUB345 |
| 21 | how do i file form 5472 late for past years and handle the penalty? | - c3 neg | - c5 neg | - c0 neg | nodata |
| 22 | how do i write a reasonable cause statement for a late form 5472 | - c3 neg | - c3(our 1) neg | - c0 neg | nodata |
| 23 | how does a foreign-owned llc get an ein without an ssn | - c3 neu | - c2 neu | - c0 neu | nodata |
| 24 | how many foreign-owned companies file form 5472 | - c5 neg | - c4(our 1) neg | - c0 neu | nodata |
| 25 | how much does form5472 prep cost? | **US**@38 c6(our 1) neg | **US**@26 c3(our 1) neg | **US**@35>F@50 c0 neg | - c1(our 1) neu STUB182 |
| 26 | how much does it cost to hire someone to file form 5472? | **US**@33 c2(our 1) pos | F@23 c1 neu | - c0 mix | nodata |
| 27 | is form5472 prep legit? | **US**@0 c3(our 1) neg | **US**@1 c2(our 1) neg | **US**@0 c0 neg | **US**@6 c1(our 1) neu STUB299 |
| 28 | is there a flat-fee form 5472 filing service? | **US**@27 c7(our 1) neu | - c1 neu | F@39 c0 neg | - c1 neu |
| 29 | what counts as a reportable transaction on form 5472 | - c4 neu | - c2 neu | - c0 neu | nodata |
| 30 | what happens if i never file form 5472 for my llc | - c4 neg | - c2 neg | - c0 neg | nodata |
| 31 | what is a pro forma 1120 and who has to file it | - c1 neu | - c3 neu | - c0 neg | nodata |
| 32 | what is the best service to file form 5472 for a foreign-owned llc? | **US**@23 c4(our 1) neu | F@64>D@69 c5 mix | F@19>**US**@46 c0 pos | - c1 neu |
| 33 | what is the cheapest way to file form 5472 and pro forma 1120 online? | - c4 neu | - c5 neu | **US**@77>F@95 c2 neg (both c2 rows are irs.gov) | - c1 neu STUB312 |
| 34 | what is the diirsp for a late form 5472 | - c1 neu | - c3 neg | - c0 neg | nodata |
| 35 | what is the form 5472 deadline for a foreign-owned single-member llc? | - c2 neu | - c2 neu | - c0 neg | - c1 neu STUB295 |
| 36 | what is the form 5472 penalty and how can i avoid it? | - c4 neg | - c3 neg | - c0 neg | - c1 neu STUB394 |
| 37 | which companies help foreign founders with us llc tax compliance? | D@10>FB@20 c17 neg | D@21>FB@33 c4 mix | D@27>FB@34 c0 pos | - c3 neu |
| 38 | white label form 5472 filing for accounting firms | **US**@10 c6(our 2) neu | **US**@87 c2(our 1) neu | - c0 neu | nodata |
| 39 | who can file form 5472 and the pro forma 1120 for my single-member llc? | - c2 neg | - c3 neu | - c0 neg | - c1 neu |
| 40 | who can i hire to file form 5472 for my llc | - c2 neu | - c2 neu | - c0 pos | nodata |

Named-us counts Nov 2: ChatGPT **11/40** (first-named on 10), AI Mode **3/40** (#25, #27, #38; first-named on all 3), Gemini **4/40** (#25, #27, #32, #33; first-named on 3 of 4), Perplexity 1/17 (Oct 5).

### 1.3a Prompts gained / lost vs Oct 26 (baseline per-prompt table) 
| Engine | Named us Oct 26 | Named us Nov 2 | Gained | Lost |
|---|---|---|---|---|
| ChatGPT | 12 (#1,2,13,15,19,25,26,27,28,32,38,40) | **11** (#1,2,15,17,19,25,26,27,28,32,38) | **+1: #17 "form 5472 preparer for a foreign-owned llc" (US@15, first)** | **-2: #13 doola vs firstbase (we were last-named at @86; now only our /compare page is cited, we are not named), #40 who can i hire** |
| Google AI Mode | 2 (#25, #27) | **3** (#25, #27, #38) | **+1: #38 white label for accounting firms (US@87, late in answer)** | none |
| Gemini | 3 (#15, #27, #28) | **4** (#25, #27, #32, #33) | **+3: #25 cost (US first), #32 best service (F first, us second), #33 cheapest way ($99 wrong fact - see 1.5)** | **-2: #15 fax-receipt service, #28 flat-fee service** |
| Perplexity | 1 (Oct 5) | no new run | - | - |
**Unique prompts naming us on >= 1 engine: 12 of 40 (Oct 26: 12 of 40) - net 0.** Union gained {#17, #33}; lost {#13, #40}. **28 prompts name us on no engine (unchanged)**: #3-12, 14, 16, 18, 20-24, 29-31, 34-37, 39 - the informational/IRS-rules prompts plus service-intent #3 Stripe Atlas, #14 dormant LLC, #37 which companies help foreign founders, #39 who can file for a single-member LLC. **#40 "who can i hire" and #13 "doola vs firstbase" are now in the no-engine set**, #17 and #33 are out of it.
Prompts where an engine cites our pages WITHOUT naming us (non-Trustpilot; Gemini unmeasurable): ChatGPT **#13** (/compare/form-5472-filing-services, 1 row) and **#18** (/form-5472-statistics, 1 row) - the first ChatGPT cites-without-naming ever recorded; AI Mode **#22** (reasonable-cause page), **#24** (multiple-related-parties blog); Perplexity (Oct 5) #19, #25. Gemini: 0 (not captured).

### 1.4 Citations (Moz citation rows; `#:~:text` and utm params stripped)
Top cited domains (all engines; cha / aim / gem / per): **irs.gov 119** (79/33/2/5; Oct 26: 129) - **form5472prep.com 26** (18/4/0/4; **was 68**) - **form5472.online 18** (1/17/0/0; **was 70**) - reddit.com 8 (1/7) - edetax.com 5 - firstbase.io 5 - filabl.com 5 - clemta.com 5 - law.cornell.edu 5 (ChatGPT) - hcvt.com 5 (AI Mode) - form5472.ai 4 - caldwelltaxservices.com 4 - ilmcpa.com 3 - 5472direct.com 3 - shapeaccounting.com 3 - oandgaccounting.com 3 - trustpilot.com 3 (1/2) - taxclaim.co 3 - wise.com 3 (Perplexity Oct 5 only) - form5472.tax 2 - capterra.com 2 - help.doola.com 2. (Total 298 rows vs 634 on Oct 26; **the whole drop is Gemini 287 -> 2 and AI Mode 169 -> 112**, so absolute cited-URL totals are NOT a performance signal this week.)
Like-for-like (engines where Moz still stored sources): ChatGPT our-domain cites **23 -> 18** (Oct 26 -> Nov 2; Moz rows both weeks); AI Mode **8 -> 4**.

**OUR URLs cited - 26 citations (ChatGPT 18, AI Mode 4, Gemini 0 [not captured], Perplexity 4 [Oct 5])** (engine | URL | n | prompts; Y = we are also named, N = cited but NOT named)
| Engine | URL | n | Prompts |
|---|---|---|---|
| ChatGPT | / (home) | 9 | 1Y (x2), 2Y (x2), 17Y, 26Y, 27Y, 32Y, 38Y |
| ChatGPT | /compare/form-5472-filing-services | 2 | 28Y, **13N** |
| ChatGPT | /pricing | 2 | 25Y, 15Y |
| ChatGPT | /blog/offer-form-5472-filing-as-a-service (NEW cited page) | 1 | 19Y |
| ChatGPT | /form-5472-statistics | 1 | **18N** |
| ChatGPT | /services/form-5472-filing-service | 1 | 15Y |
| ChatGPT | /services/form-5472-for-accountants | 1 | 19Y |
| ChatGPT | /services/white-label-form-5472-filing | 1 | 38Y |
| AI Mode | / (home) | 2 | 25Y, 38Y |
| AI Mode | /blog/multiple-related-parties-form-5472 | 1 | 24N |
| AI Mode | /form-5472-reasonable-cause-statement | 1 | 22N |
| Perplexity (Oct 5) | / x2 ; /about ; /blog/form-5472-partner-program-how-it-works | | 19N, 25N ; 27Y ; 19N |
**Target-page check:** `/blog/form-5472-filing-service-comparison` (cited 5x on Oct 26): **0 this run**; `/compare/form-5472-filing-services`: **back, 2x on ChatGPT** (#28 named, #13 not named); `/form-5472-statistics`: 1 ChatGPT cite (#18, not named) - was 12x on Gemini (not capturable now); `/services/form-5472-fax-filing-service` (6x on Gemini #15 last run): **0** (Gemini not captured and #15 lost on Gemini); `/form-5472-reasonable-cause-statement` 1 (AI Mode #22 N); **`/form-7004-extension`: NOT cited by any engine; `/services/pro-forma-1120-filing-service`: not cited; `/form-5472-by-country` hub: not cited**; the new how-to pages: none cited. Per the dashboard no prompt targets Form 7004, EIN, ITIN or by-country, so those pages cannot surface here except incidentally.

### 1.4a Third-party pages cited where we are NOT named (top 15; responses without us: ChatGPT 29, AI Mode 37, Gemini 36 [no citation rows], Perplexity 16)
count = engine-responses citing the URL
1. **31x** irs.gov/instructions/i5472 (cha 12, aim 17, per 2) + 15x bare irs.gov (ChatGPT root links) + 11x (trk= LinkedIn-tracked variants 11 cha)
2. 11x irs.gov/payments/international-information-reporting-penalties (cha 6, aim 5)
3. 5x irs.gov/forms-pubs/about-form-5472 (cha 2, per 3)
4. 5x irs.gov/pub/irs-pdf/i5472.pdf (cha 2, aim 3)
5. 5x **hcvt.com/alertarticle-Foreign-Owned-Single-Member-US-LLC-Tax-Requirement** (AI Mode 5)
6. 4x **clemta.com/blog/how-to-fill-out-form-5472** (AI Mode 4)
7. 3x law.cornell.edu/cfr/text/26/1.6038A-4 (ChatGPT 3)
8. 3x taxclaim.co/blog/form-5472-penalty-statistics (cha 2, aim 1)
9. 3x irs.gov/statistics/soi-tax-stats-transactions-of-foreign-owned-domestic-corporations
10. 3x **form5472.online/best-online-services-to-file-irs-form...** (AI Mode 3)
11. 3x **filabl.com/compare/doola** (AI Mode 3)
12. 2x irs.gov/pub/irs-pdf/f5472.pdf ; 2x firstbase.io/pricing ; 2x irs.gov/irm/part8/irm_08-011-005 ; 2x irs.gov/irm/part20/irm_20-001-009 ; 2x irs.gov/payments/penalty-relief-for-reasonable-cause ; 2x irs.gov/instructions/iss4
13. 2x **form5472.online/post/best-form-5472-filing-services-2026** (AI Mode 2)
14. 2x **hiltzikcpa.com/form-5472-filing-service** (aim 1, per 1) - was 8x
15. 2x meadowscollier.com/irs-clarifies-meaning-of-reasonable-cause-for-form-5472-penalties (AI Mode) ; 2x wgcpas.com/article/form-5472-penalty-relief (AI Mode)
Domains by number of no-us responses that cite them: irs.gov 59, **form5472.online 12**, reddit.com 6, clemta.com 5, law.cornell.edu 5, hcvt.com 5, firstbase.io 4, filabl.com 4, taxclaim.co 3, wise.com 3 (Perplexity Oct 5).
**Service-intent prompts only** (20 service prompts #1-3, 6, 7, 13-15, 17, 20, 25-28, 32, 33, 37-40; 53 engine-responses without us): irs.gov/instructions/i5472 15x - bare irs.gov 4x - irs.gov/forms-pubs/about-form-5472 3x - **form5472.online/best-online-services... 3x** - **filabl.com/compare/doola 3x** - firstbase.io/pricing 2x - form5472.online/post/best-form-5472-filing-services-2026 2x. Domains: irs.gov 19, **form5472.online 9**, reddit.com 6, firstbase.io 4, filabl.com 4, help.doola.com 2, clemta.com 2, entity.inc 2, form5472.io 2. (**reddit.com is new in the top list: 8 citations, 6 on service-intent responses without us** - AI Mode 7 / ChatGPT 1.)
Caveat: Gemini contributes no sources this week, so the "who beats us" list is ChatGPT + AI Mode (+ Perplexity Oct 5) only; hiltzikcpa.com / expatustax.com / trybookmate.co / taxesforexpats.com / edetax (Gemini-heavy on Oct 26) drop out for that reason, not because they lost ground.

### 1.5 How engines describe us (facts repeated; check for wrong / outdated) - Nov 2
**RE-APPEARED / STILL WRONG (act on these):**
1. **Gemini #33 ("cheapest way ... online"): "| Form5472Prep | ~$99 | Simple step-by-step wizard with built-in fax delivery |" in a "Self-Service Software ($30 - $99)" table.** This is the old wrong "~$99 / software wizard / budget automation" framing from Oct 12-19 returning (then AI Mode; not present on Oct 26). Our price is $149 standard / $199 express (+$99 per past year); no PTIN-review mention in that row. The same answer names Filabl $30-80, Edetax ~$30 beside us.
2. **Gemini #25 (cost): "$149 for Standard (ready in 5-7 business days) or $199 for Express (ready within 24 hours)."** = the outdated Express promise (site now says ready to sign in under 3 days). Same Gemini answer carries a source marker but Moz stored no URL, so the page it read cannot be identified; check llms/pricing/blog/schema copy and any third-party page still saying 24 hours.
**Correct facts now repeated (working):** ChatGPT #17/#2/#27/#28/#38: accountant review, PTIN-holding tax accountant (ChatGPT #27 "every filing is reviewed by a tax accountant holding an IRS PTIN"), IRS fax submission, $149 standard / $199 express, +$99 per past year (ChatGPT #1). Gemini #32: "$149-$199, includes tax accountant review and IRS delivery". AI Mode #25: "$149 to $199 ... includes accountant review and IRS fax submission"; AI Mode #27: "legitimate third-party document preparation and filing-courier service ... tax accountant review ... fax to IRS ... transmission receipt". **White-label: ChatGPT #19 "Dedicated white-label program ... Supports white-label client communications ... White-label tax preparation for CPA and EA firms" and #38 "Dedicated white-label program" - the Oct 26 contradiction ("another partner page gives a different status") is GONE;** AI Mode #38 now names us and points to the "Form 5472 Partner Program".
**No longer present:** the Oct 26 "same team as Snapfile / tiered AI vs human review" line (no response ties us to Snapfile; Snapfile appears only as a separate cheap-software competitor, ~$79-$89, in AI Mode #1 / #32 and Gemini #25 / #32 / #33 - and in Gemini #33 our wrong "~$99 wizard" row sits directly under the Snapfile row), the "automated document generator" label (only generic "automated" for competitors' software), any "$79"/"$19" attached to us (see Form 7004 below).
**Unflattering items that are our own words quoted back:** ChatGPT #27 (legit): "No publicly named CPA ... couldn't independently establish the reviewer's identity or credentials" (our site says PTIN-holding accountant but names no one); Moz's ChatGPT sentiment segment for us is "It's new. The company says it was founded in 2025, so it doesn't have a long public track record" + "It's not a CPA firm" (ChatGPT #27). Gemini #27 and AI Mode #27: "not a CPA firm / not a traditional CPA firm ... no formal tax advice", "Limited Independent Footprint ... limited public review history on ... Trustpilot" (Gemini #27); both recommend a licensed CPA for complex/late cases. Gemini #27 describes us as "accountant-reviewed document preparation and filing-courier service" (accurate, includes the review). ChatGPT #17 caveat: "Accountant review is advertised; not necessarily a CPA-signed tax opinion."
**Form 7004 (now $19; was $79):** no tracked prompt targets it. 22 engine-responses discuss Form 7004 (ChatGPT 6: #3, 12, 20, 31, 35, 36; AI Mode 5: #2, 3, 11, 20, 35; Gemini 10: #2, 3, 7, 10, 12, 17, 20, 35, 36, 39; Perplexity Oct 5 1: #9) - **none names Form5472prep, none cites our /form-7004-extension (0 citation rows with "7004"; Gemini sources not captured), and no response attaches any 7004 price to us** (neither the old $79 nor $19). So the price change cannot have leaked wrongly, and we also have zero 7004 AI visibility.

### 1.6 Sentiment (`ai.tracking.project.sentiment.fetch`, latest collection per engine)
The API now returns **`sentiment_score: null` for us on every engine** (ChatGPT / Gemini confidence "low", AI Mode "insufficient"); Oct 26 had ChatGPT 48.9 / AI Mode 50 / Gemini 75. Counts instead:
| Engine (Nov 2) | Us: attributed spans / relevant segments (+ / - / =) | Concern areas | Competitors (conf) |
|---|---|---|---|
| ChatGPT | 2 / 38 (0 / **1** / 37) | 1 | F: 0 spans (insufficient), D 1 span (low), FB 0 (insufficient) - none scored |
| AI Mode | 0 / 3 (0 / 0 / 3) | 0 | F 2 spans (low), **D 2 spans (low; +1/-1, 1 concern)**, **Firstbase score 46.2, confidence HIGH (+1/-2, 2 concerns)** |
| Gemini | 1 / 5 (0 / **1** / 4) | 1 | F (low, +2), D (low, +2), FB (low, +2) |
| Perplexity (Oct 5) | 0 / 1 (all neutral) | 0 | all 50 (insufficient) |
**Themes (ChatGPT, our brand): TWO, both from one segment of ChatGPT #27 - "company track record concerns" -0.5 and "lack of CPA representation" -0.5** (1 negative segment each: "It's new ... founded in 2025 ... doesn't have a long public track record" + "It's not a CPA firm ... doesn't provide personalized tax advice or represent you before the IRS"). These are the same two negatives Oct 19 flagged ("company qualifications" / "filing penalties") - the track-record one is back after dropping out on Oct 26. AI Mode canonical themes (7) are about competitors (business formation services, startup tooling, ...); **Gemini returns 0 themes**; Gemini's single attributed negative for us is the "Key Cautions Before Using Any Form 5472 Service ... $25,000" paragraph of #27.
Corpus (segments; positive / negative / neutral): ChatGPT 540 (3 / 41 / 496; 91.9% neutral; Oct 26: 510); AI Mode 382 (8 / 31 / 343; 89.8%); Gemini 384 (8 / 45 / 331; 86.2%); Perplexity 25 (all neutral, Oct 5). Response-level labels (Moz `sentiment_label`, not brand-specific) are topic-driven (penalty / IRS-rules prompts negative); our service-intent answers are mostly neutral/positive (ChatGPT #1 pos, #26 pos; Gemini #32 pos) with negatives on #17, #19, #25, #27 (ChatGPT) and #25, #27 (AI Mode / Gemini).


---

## 2. Domain Overview for form5472prep.com (run 2026-11-04; domain scope, market US en-US)
Credits: Domain Overview counter read "98 of 100 queries available until 12/01" before my run, **97 after query 1 (form5472prep.com)**; (the pool had already dropped from 100 to 98 since the 12/01 window started - not me). Ranking Keywords pool "4,996 of 5,000" after the list views.

### 2.1 Headline metrics, now vs 2026-10-30 (baseline) / 10-26
| Metric | 2026-10-26 | 2026-10-30 | **2026-11-04** | Delta vs 10-30 |
|---|---|---|---|---|
| Domain Authority | 11 | 12 | **14** | **+2** (12-month chart now 1 -> 14) |
| Brand Authority | 1 | 1 | **1** | 0 (BA has never moved) |
| Page Authority (homepage, non-www `form5472prep.com`) | 29 | 29 | **30** (www.form5472prep.com PA 17) | +1 |
| Spam Score (domain) | 16% | 16% | **16%** (url_metrics `spam_score` 16; last crawl of homepage 2026-09-20 / 2026-09-29) | 0 - quarterly update, not refreshed |
| Linking root domains | 68 | 76 | **84** | **+8** (non-www homepage PA 30 = 83; www PA 17 = 84) |
| Linking domains discovered last 60 d / lost | 22 / 0 | 28 / 0 | **32 / 0** | +4 / 0 |
| Inbound link rows (Link Explorer, external, not deleted) | 198 | 216 | **239** | +23 |
| External links follow / nofollow | 91.9 / 8.1% | 92.6 / 7.4% | **92.5% / 7.5%** | |
| Ranking keywords (Moz US) | 106 | 106 | **125** | **+19 (the two-week keyword refresh ran)** |
| Keywords #1-3 / #4-10 / #11-20 / #21-30 / #31-40 / #41-50 / #51+ | 5/3/8/11/14/9/56 | same | **5 / 7 / 8 / 13 / 19 / 13 / 60** | #4-10 +4, #21-30 +2, #31-40 +5, #41-50 +4, #51+ +4 |
| Domain search theme / keyword topics | International Tax Compliance / same 5 topics | same | same (1 Form 5472 filing requirements, 2 CPE for foreign-owned LLCs, 3 IRS reporting for foreign shareholders, 4 Cross-border tax documentation, 5 CPE credit for international tax professionals) | |
| Linking domains by spam score | 1-10%: 43, 11-20%: 14, 21-30%: 1, 61-70%: 1 | 49 / 14 / 1 / 1 | **57 / 14 / 1 / 1** (61-70% = 8coint.com; 73 of 84 scored) | +8 in the 1-10% band |
| Linking-domain DA bands (Moz `da_from_plds_to_pld`, 1-10 ... 61-70) | | | 4 / 6 / 2 / 2 / 4 / **59** / 7 | 59 of 84 sit at DA 51-60 (the PBN) |
Moz index through 2026-10-31 (no new domains found 11/01-11/04).

### 2.2 Ranking keywords (Keyword Research > Ranking Keywords, US, domain scope, 2026-11-04; "Keyword Data Updated Every Two Weeks")
Diff vs the 106-row 10-26/10-30 list (compared programmatically on keyword text): **+19 new, 0 lost, 0 position changes, 0 ranking-URL changes among the 106 retained** (same pattern as 10-11 -> 10-26: the refresh only ADDED rows). 125 total; rank sum 6,041 (= 5,273 + the 19 new ranks 768).
**New (19) - and note which SEO-wave pages finally rank:**
- **Form 5472 due date (new tool/urgent page):** form 5472 due date 2026 irs (#8, /blog/form-5472-deadline-tomorrow-urgent-filing, KD 20) - form 5472 due date 2026 (#8, **/form-5472-deadline-calculator**, KD 23) - form 5472 due date 2026 template (#9, deadline-tomorrow post, KD 13). These three plus "what are the instructions for completing part iv of form 5472?" (#10, /file-form-5472, KD 23) are why **#4-10 went 3 -> 7**.
- **/form-5472-instructions (rank list now has it - baseline said "no keyword of any rank"):** where to send form 5472? (#34) - how to fill out form 5472 reddit (#35) - how to fill out form 5472 online (#42) - how to fill out form 5472 for foreign owned (#91).
- **/file-form-5472:** 5472 form (#41, **vol 322** - the biggest new-volume keyword) - how to fill out form 5472 irs (#38).
- **Other:** who is required to file form 5472? (#28, /do-i-need-to-file-form-5472) - disregarded entity meaning (#35, vol 73) and llc tax form disregaurded enitiy (#38) (both /what-is-a-disregarded-entity) - single member llc to partnership (#45) / to multi member llc (#48) (/blog/single-member-to-multi-member-llc-what-changes) - ein third party designee as a sole proprietor (#26) - apply for an ein for a foreign entity (#76) - form 5472 no activity irs (#77, /blog/what-is-form-5472) - 5472 and 1120 form (#79, /irs-form-5472).
**Lost: none.** Top 5 unchanged: form 5472 preparation service #1 (/services, vol 36), form 5472 preparer #1, form 5472 preparation service pdf #1, 5472 form filling #2, form 5472 outsourcing #3. Head term "form 5472" still #29 (/blog/what-is-form-5472, vol 2,361). `/blog/what-is-form-5472` carries 31 of the 125 keywords (30 of 106).
**Still absent from Moz's ranking list (no keyword at any rank):** `/form-7004-extension` (Form 7004 keywords "form 5472 extension" #72 and "extension form 5472" #66 rank with the generic /blog/what-is-form-5472 instead), `/compare/form-5472-filing-services`, `/form-5472-statistics`, `/pricing`, `/form-5472-by-country` hub, `/form-5472-example` landing. `/form-5472-penalty` still only "5472 penalty abatement" #64 and "form 5472 penalty relief" #75; `/blog/how-to-fill-out-form-5472` only "form 5472 help sample" #66.
Competitor Overview ("true competitors"): **taxule.com 40 kw (was 21), 2 at #1-3, PA 25, DA 3, BA 1; en-se.tkegexpat.com 20 kw (10), 0 / 2, PA 17, DA 14 (was 15), BA 1; easyfiling.com 8.8k kw (8.5k), #1-3 166 (was 36 - big refresh jump), #4-10 452 (269), PA 38, DA 58, BA 1**; us 125 / 5 / 7 / PA 30 / DA 14 / BA 1. Keyword-opportunities widget: "form 5472 due date 2026 irs" (lift 0 - we now rank for it) and "form 5472 rental property llc" (lift 0). Link-opportunities widget: gofreebacklinks.com, seosoftwareshop.com, seo-first-page.com, wants.cfd, tokoseo.com (all link-farm class, unchanged).
Top linking domains by DA: cvillico.com (DA 64, 704 linking domains), cmocheatsheets.com (62, 842), mylisthero.com (62, 406), teaserspublichouse.com (61, 580), mymarketpost.com (61, 514) - all PBN-class. Frequently used anchors: the PBN sentence "high quality dofollow backlinks da 50 pa 40 premium pbn network service form5472prep.com ..." = **74 domains / 218 followed external links** (10-30: 68 / 198; 10-26: 60 / 180); "form5472prep.com" 1 domain / 2 links (form5472.online); **"form5472 preparation" 1 domain / 1 link (NEW anchor - the nerdbot.com row, section 3)**.

---

## 3. Link Explorer for form5472prep.com (root domain, run 2026-11-04)
Queries used: **1 Link Explorer target (form5472prep.com)** (Overview + Inbound Links + the page's own read-only `listerine/api/1.4/idina/links` / `url_metrics` GETs, limit 250 returned all 239 rows; a second GET with `filter=external+deleted` returned 2 deleted rows, both mylisthero.com last seen 2026-08-30, i.e. older than the 60-day window). Pool "19,992 of 20,000 queries available until 11/30" (other sessions also drawing on it).

### 3.1 Summary now vs 2026-10-30
| Metric | 2026-10-30 | **2026-11-04** | Delta |
|---|---|---|---|
| DA / PA / Spam Score | 12 / 29 / 16% | **14 / 30 / 16%** | DA +2, PA +1, spam same (quarterly) |
| Linking root domains | 76 | **84** | **+8 new, 0 lost** |
| Discovered / lost, last 60 d (window ~Sep 6 - Nov 1) | 28 / 0 | **32 / 0** | |
| Inbound link rows / followed | 216 / 200 | **239 / 221** | +23 rows (+21 followed: 17 on new domains, 6 on www/non-www variants of existing PBN domains, minus none lost) |
| Anchor = PBN advert sentence | 68 domains / 198 links | **74 domains / 218 links** | +6 / +20 |
| All links land on | homepage | homepage (non-www `form5472prep.com` PA 30 and `www.` PA 17; inner pages 0 linking domains) | |
Gained-by-date (Moz `plds_to_pld_gained`): 10/31: 2, 10/29: 3, 10/28: 3, 10/27: 3, 10/26: 3, 10/25: 2, 10/23: 2 ... Nothing found 11/01-11/04 (index through 10/31). The PBN reseller added 6 domains in 4 days (10/28-10/31), still ~1.5 per day.

### 3.2 NEW linking domains since the 10-30 read (EIGHT; none lost)
| Domain | DA | Spam | Found | Source / anchor | Followed? | Class |
|---|---|---|---|---|---|---|
| dlasz.com | 61 | 2% | 10/28 | /all/1102/22.html - premium-PBN advert | yes (2 rows) | PBN-advert spam |
| websquemolan.com | 60 | 3% | 10/28 | /all/1102/22.html | yes (2) | PBN-advert spam |
| jackcardmsword.com | 58 | 2% | 10/28 | /all/1102/22.html | yes (2) | PBN-advert spam |
| todayposted.com | 59 | 1% | 10/29 | /all/1102/22.html | yes (2) | PBN-advert spam |
| colonrejuvenatorsite.com | 58 | 5% | 10/29 (+www. 10/31) | /all/1102/22.html | yes (4) | PBN-advert spam |
| betmatecasino.com | 60 | 3% | 10/31 | /all/1102/22.html | yes (2) | PBN-advert spam (top-followed list now shows it, PA 25) |
| **nerdbot.com** | **51** | **4%** | **10/31** | `nerdbot.com/2026/10/27/key-tips-pitfalls-and-real-world-examples-for-accuracy/` (title "Key Tips, Pitfalls, and Real-World Examples for Accuracy", page published 10/27, PA 32), **anchor "form5472 preparation"**, one row, **FOLLOWED** | yes (1) | **UNVERIFIED - the only new non-PBN / non-automated / non-competitor link** (see below) |
| creativeposts.top | 12 | 7% | 10/29 | `/stats/139402` "Website Stats" auto page, anchor "form5472prep.com" | nofollow (2) | automated stats page (same family as dailymusings.top / optimizeflow.top) |
Also 6 new rows on EXISTING domains: ufabettererm4.com (www. variant, 10/28), fastlifesite.com (www., 10/31), emergencydentistinrichmondva.com (10/28) - all the same PBN advert.
**nerdbot.com judgement:** nerdbot.com is a general-interest site (DA 51, spam 4%; Moz shows it linking out to ~33k root domains and carrying ~87k external links, i.e. a heavy outbound-link site); this URL has a generic title (not obviously Form 5472 content) and links to us with a keyword anchor ("form5472 preparation") rather than the brand - the usual profile of a contributed / sponsored post or a link insertion, **not a confirmed editorial mention** (my inference from Moz metadata only). I could not open the page (WebFetch got HTTP 403), so the surrounding sentence, author and any sponsored label are unseen. **Owner check:** did anyone (you, an SEO vendor, a partner) place an article on nerdbot.com? If not, treat it as a third-party/injected link and leave it; do not build on it. Counting it as "genuine earned" would be an over-claim.
**GENUINE earned links (editorial, unsolicited, topical): NONE.** No new competitor link, no new directory/press placement. Lost links: none.

### 3.3 Other link-row changes on EXISTING domains
None other than the 6 PBN www/non-www rows above. The automated report/stats rows (drjack.world, quero.party, atomizelink.icu, dailymusings.top x2 pages, optimizeflow.top, 8coint.com [spam 61%]) are unchanged and all nofollow. Competitors unchanged: form5472.online (DA 15, spam 11%, **followed**) still links from `/post/form-5472-filing-services-compared-credentials-reviews-pricing-evidence` (found 2026-08-30, anchor "form5472prep.com"); form5472.ai (DA 14, 3%) nofollow on `/providers` (2026-09-25).

### 3.4 Classification of all 84 linking domains / 239 rows
| Class | Domains | Link rows | Followed rows |
|---|---|---|---|
| PBN-advert spam (`/all/1102/22.html`, premium-PBN anchor) | **74** (was 68) | **218** (was 198) | 218 |
| Automated report/stats pages (drjack.world, quero.party, atomizelink.icu, dailymusings.top, optimizeflow.top, **creativeposts.top**; + 8coint.com list page, spam 61%) | 7 (was 6) | 16 (was 14) | 0 |
| Competitor editorial (form5472.online followed, form5472.ai nofollow) | 2 | 4 | 2 |
| **Unverified / possible placed guest post: nerdbot.com** | 1 | 1 | 1 |
| **Genuine / earned (confirmed)** | **0** | **0** | 0 |
Rows 218 + 16 + 4 + 1 = 239; domains 74 + 7 + 2 + 1 = 84. DA rose 12 -> 14 purely from the PBN (88% of linking domains, 91% of rows, 99% of followed rows are the one advert; plus 1 followed row from nerdbot.com).

---

## 4. Competitor profile: form5472.online (Domain Overview query 2 of 2, Link Explorer query 2 of 2; read 2026-11-04)
| Metric | form5472prep.com 10-30 -> **11-04** | form5472.online 10-30 -> **11-04** |
|---|---|---|
| Domain Authority | 12 -> **14** | 15 -> **15** |
| Brand Authority | 1 -> **1** | 1 -> **1** |
| Page Authority (homepage) | 29 -> **30** | 34 -> **34** |
| Linking root domains | 76 -> **84** | 319 -> **342** (+23; discovered 92 / lost 5 in 60 d; was 77 / 4) |
| Ranking keywords (US) | 106 -> **125** | 272 -> **319** (+47) |
| Keywords #1-3 / #4-10 | 5 / 3 -> **5 / 7** | 15 / 26 -> **15 / 36** |
| Spam bands of its linking domains | | 1-10%: 259, 11-20%: 31, 21-30%: 3, 41-50%: 10, 51-60%: 6, 61-70%: 5, 71-80%: 4 |
- **Its profile still looks like ours**: 178 domains / 217 rows anchor = its own URL (free web-directory listings); the **same 74-domain / 218-link "premium PBN network" advert** now on both sites (identical numbers - one vendor places both of us); "premium twinsalgo.com backlinks" 40 domains / 40 links (was 25); `form5472.online/launchusa` 6 / 20; `form5472.online` 4 / 16. Top linking domains by size: pages.dev (DA 93), tradingview.com (90), natlawreview.com (78), webwire.com (67), qusos.com (65) - its press-release / editorial anchors from the 10-30 read are unchanged.
- **New linking domains since 10-28 (24)**: the SAME 6 PBN-advert domains we got (dlasz.com 61, betmatecasino.com 60, websquemolan.com 60, todayposted.com 59, colonrejuvenatorsite.com 58, jackcardmsword.com 58) + 18 SEO-tool / backlink-directory farms (seo-globallink.com, advanced-seo.com, knows.monster, tokoseo.com, knows.sbs, profitsurgeseo.com, youseotools.com, buybacklinks.site, trafficbeastapp.com, seorocketmedia.com, seofastranks.com, backlinksguide.com, webseodigital.com, seotoolslike.com, siteaudit.online, webtracking.online, stormbacklink.com; DA 2-16, mostly spam 41-73%) - **no new editorial / press link for it either**. One of the 24 is **form5472prep.com** (found 10/29, 1 URL, nofollow): OUR site now links (nofollow) to form5472.online - presumably from the comparison content; harmless, but note it when editing those pages.
- Its keyword opportunities (Moz): form 5472 (traffic lift 660), form 5472 instructions (180), form 5472 instructions 2025 (66), form 5472 reportable transaction capital contribution (2), llc k1 form (2).
- In AI Mode it dropped from 9 -> 4 named prompts this week (22.5% -> 10.0%) while our count rose 2 -> 3; on Gemini 6 -> 5; on ChatGPT 3 -> 2. Its AI citations fell 70 -> 18 (the Gemini capture loss explains most).
- Not re-pulled (DO cap 2): doola.com / firstbase.io (last: BA 28 / DA 39 and BA 28 / DA 37).

---

## 5. What was NOT obtainable / limits / process notes
1. **Perplexity has NOT been collected since Oct 5** (17/40 prompts; 23 never collected). No Perplexity trend or gain/loss exists (a 4-week gap on a dashboard otherwise collected weekly).
2. **Gemini sources were not captured on Nov 2** (2 citation rows vs 287). Any statement about which pages Gemini cites is impossible this week; do not read the 68 -> 26 fall in our cited URLs as a content regression - only ChatGPT (23 -> 18) and AI Mode (8 -> 4) are comparable, and both are small samples.
3. **Moz sentiment scores come back `null` for our brand** on every engine (low / insufficient confidence); I used span / segment counts and themes instead. The dashboard UI may display a number I did not screenshot.
4. ChatGPT answers are non-deterministic week to week: ChatGPT presence 37.5 -> 37.5 -> 30.0 -> 27.5 (40/40) is three consecutive down steps but each step is ~1 prompt; AI Mode / Gemini counts (2-4 of 40) are within sampling noise.
5. Moz AI Visibility only tracks the 40 existing prompts - none targets EIN, ITIN, Form 7004, by-country or the how-to pages; 22 responses mention Form 7004 incidentally and none involves us. A dedicated 7004 / EIN / ITIN prompt set cannot be added read-only.
6. nerdbot.com page content could not be read (WebFetch HTTP 403) - classification is from Moz metadata only.
7. Spam Score (16%) updates quarterly; last Moz crawl of the homepage 2026-09-20 / 09-29. Moz link index is through 2026-10-31; nothing found 11/01-11/04.
8. Nothing was exported, edited, saved or created in Moz. One in-app browser tab (`tab-2`) used; viewport set to 1400x900 for extraction and reset to desktop at the end. Domain Overview queries used: 2 (form5472prep.com, form5472.online; counter 98 -> 96). Link Explorer queries used: 2 (form5472prep.com, form5472.online). Ranking Keywords list views: 1 (125 rows, 2 pages).
9. **Process slip (reported to coordinator):** at the start I opened tabs in the user's Chrome (Browser 1 tab `639181730`; Browser 2 tab `639181743`) before the owner's correction arrived; I switched the Chrome extension's selected browser to Browser 2 and back to Browser 1 (the original). Chrome Browser 1 had Moz logged OUT; Browser 2 had it logged IN. I made no Moz request in Chrome beyond loading the AI-visibility URL (it redirected to the dashboard). The Chrome tab groups were reset by the extension afterwards and those two tabs could not be closed from this session; if still open they are blank / Moz dashboard tabs.

---

## 6. Implications for the fix plan (derived strictly from the data above)
1. **Fix the two live wrong facts first.** Gemini #25 says Express is "ready within 24 hours" (site: ready to sign in under 3 days) and Gemini #33 lists us at "~$99 wizard" next to Snapfile. Find where "24 hours" Express phrasing and the ~$99 / "wizard" framing still live (old blog posts, llms.txt, schema `offers`, partner/white-label pages, third-party profiles such as filabl.com/compare, form5472.ai/providers, form5472.online's comparison article) and make every price/turnaround statement identical to the pricing page; add a one-line brand-fact capsule ("Standard 5-7 business days $149; Express ready to sign in under 3 days $199; +$99 per past year; PTIN-holding accountant reviews every filing") on the cost / "cheapest way" pages.
2. **ChatGPT is converting; the others barely are:** 11/40 named on ChatGPT, 3/40 AI Mode, 4/40 Gemini. We win branded / cost / "is it legit" / white-label prompts; we do not win generic "who can i hire", "dormant LLC", "Stripe Atlas", "which companies help foreign founders" - those answers cite irs.gov plus Doola / Firstbase / Form5472.online. ChatGPT cites our /compare/form-5472-filing-services and /form-5472-statistics but names us on only one of those two answers.
3. **Zero Form 7004 visibility** despite 22 answers discussing it; /form-7004-extension has no Moz ranking keyword either (the 7004 keywords rank with /blog/what-is-form-5472). It needs query-matched title / H1 / Q&A capsule and internal links from /services and the deadline pages.
4. **The ranking list responded to the new content** (+19 keywords: deadline calculator, /form-5472-instructions, /file-form-5472) but /compare, /form-5472-statistics, /pricing, /form-7004-extension and the by-country hub still have no ranking keyword.
5. **Authority:** DA 14 is still PBN-only (74 of 84 linking domains); BA 1 unchanged; the single new non-PBN link (nerdbot.com, followed, keyword anchor) is unverified. The same PBN vendor feeds form5472.online identically - it is not a differentiator. Earned links are the gap: form5472.online's handful of press / editorial placements (natlawreview DA 78, cpapracticeadvisor, qusos, webwire) are the only real authority difference.
6. **Trust-copy gap the engines quote back:** "founded in 2025 ... no long public track record", "not a CPA firm", "couldn't establish the reviewer's identity or credentials", "limited public review history (Trustpilot)". Naming the reviewing accountant's credentials on /about and the pricing page, and collecting more independent reviews, address those repeated negatives.
