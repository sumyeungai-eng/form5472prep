# Moz Pro re-read C: AI Visibility + research tools for form5472prep.com (delta vs 2026-10-11 / 10-15)

Extracted 2026-10-26 (read-only, own browser tab `tab-2`, Moz Pro account of sumyeungai@gmail.com). Baselines: `base/2026-10-07-ai-visibility-and-research.md`, `base/2026-10-11-ai-visibility-and-research.md`, `base/2026-10-15-session-log.md`. Nothing added/edited/deleted/exported/downloaded. Only report pages and the page's own read-only `*.fetch` / `*.lookup` JSON-RPC calls (same calls the dashboard issues) were used. AI Visibility data pulled via `ai.tracking.project.metrics.fetch` + `responses.fetch` (4 engines); per-prompt tables and citation lists are recomputed from the raw responses (brand regexes: Form5472 Prep / form5472prep.com; form5472.online; Doola; Firstbase; ChatGPT citations parsed from the markdown links in the response text, `utm_source` stripped; AI Mode / Gemini / Perplexity use Moz's own citation rows).

**Data dates per section**
| Section | Moz data as of | Notes |
|---|---|---|
| 1 AI Visibility (dashboard 3465 "Form5472prep") | **three collections: 2026-10-05, 2026-10-12, 2026-10-19** (banner "Data as of Oct 19, 2026. Next data collection: Monday, Oct 26, 2026" - the Oct 26 run is NOT in yet) | ChatGPT / AI Mode / Gemini collected on all 3 dates; **Perplexity was collected ONLY on Oct 5** (latest_collection_date_by_engine: perplexity 2026-10-05) |
| 2 Domain Overview + ranking keywords | live DO run 2026-10-26; keyword list "updated every two weeks" (+27 / -1 vs 10-11); link index through 2026-10-23 | 106 ranking keywords (was 80) |
| 3 Link Explorer | live 2026-10-26; newest discovered domain 10/23/2026; Spam Score "updated quarterly" (16%) | 68 linking domains (62), 198 links (164), 0 genuine |
| 4 Brand Authority | form5472prep.com, doola.com, form5472.online live 2026-10-26; firstbase.io NOT re-pulled (3-query DO cap) | us BA 1, F5472o BA 1, doola BA 28 - all unchanged |

## 0. Headline deltas (read this first)
- **AI collections:** Oct 5, Oct 12, Oct 19 (Oct 26 pending). Perplexity was never re-collected after Oct 5.
- **Mention rate (us / F5472.online / Doola / Firstbase), Oct 12 -> Oct 19:** ChatGPT 37.5 / 10.0 / 7.5 / 5.0 -> 30.6 (Moz; 37.5 on a recount) / 5.6 / 5.6 / 5.6; **AI Mode 7.5 / 17.5 / 15.0 / 12.5 -> 10.0 / 22.5 / 15.0 / 12.5** (we are last of 4 and Form5472.online keeps climbing); **Gemini 7.5 / 20.0 / 17.5 / 10.0 -> 5.0 / 20.0 / 12.5 / 12.5** (we are last of 4 and falling).
- **We win only on ChatGPT** (named on 15 of 40 prompts; 1st on 12 of those). AI Mode names us on the same 4 brand/price/legit prompts as on Oct 5 (#25, 26, 27, 33; no new prompts); Gemini on 2 (#14, #27 - it dropped the two it had on Oct 5). **25 of 40 prompts name us on no engine.**
- **New pages:** /compare/form-5472-filing-services cited once (ChatGPT, #33 cheapest-way, position 7); /form-5472-statistics very likely used by ChatGPT (answer reproduces its figures and shows a "Form5472 Prep" chip) but Moz shows no URL; /form-5472-example, /form-5472-instructions, /form-5472-penalty, /about, the comparison blog post: not cited. In Moz's ranking list none of the four new pages ranks for any keyword.
- **Wrong fact engines repeat:** AI Mode says Form5472Prep is "~$99 (software wizard...)" on "cheapest way" (#33); AI Mode/Gemini call us an automated document generator, not accountant-reviewed; ChatGPT #38 says Express "within 3 business days".
- **Competitor pages that beat us where we are not named:** irs.gov/instructions/i5472 (34x), wise.com/us/blog/how-to-file-form-5472 (10x), hiltzikcpa.com/form-5472-filing-service (10x; 8x on service-intent prompts), hcvt.com alert article, drummondadvisors.com, form5472.online (/best-online-services-to-file-irs-form-5472..., /pricing, /; **form5472.online = 92 citations, 64 of them in Gemini**), entity.inc, greenbacktaxservices.com, clemta.com.
- **Authority:** DA 10 -> 11, BA 1 -> 1, PA 29, spam 16%, linking domains 62 -> 68, ranking keywords 80 -> 106 (+27 / -1, many unrelated EIN/exchange-rate keywords; 79 retained keywords did not move). **6 new linking domains, all PBN-advert spam; 0 genuine earned links; 0 lost.** form5472.online: DA 15, BA 1, 308 linking domains, #1-3 keywords 15 (13).
- **Sentiment now loads:** ChatGPT score 48 "Mixed" (high confidence; 1 pos / 37 neu / 3 neg of 41 mentions); negative themes = company qualifications ("founded in 2025, not a CPA firm") and filing penalties.

---

## 1. AI Visibility dashboard "Form5472prep" (id 3465)

### 1.0 Collection status
- Dashboards list: Form5472prep "Latest collection: Oct 19, 2026", Prompts 40 (quota line now "6 of 6 Dashboards | 222 of 300 Prompts"). Milemarketplace also Oct 19; the Taxley dashboards show Oct 25 (other cycle, not opened).
- `ai.tracking.project.metrics.fetch` (start 2026-10-01 .. end 2026-10-26): 10 metric rows per brand = Oct 5 x 4 engines, Oct 12 x 3 engines, Oct 19 x 3 engines. **Perplexity has no Oct 12 or Oct 19 collection** (its 40 prompt rows: 17 with a response dated 2026-10-05, 23 never collected) - so every Perplexity figure below is still the Oct 5 snapshot.
- Prompts with data on the latest run: ChatGPT 40/40 (all dated 2026-10-19), AI Mode 40/40, Gemini 40/40 (1 stub response, 69 chars), Perplexity 17/40 (Oct 5). On Oct 5 only 18 of the 40 had data (the other 22 added by the Oct 12 run), so **per-prompt gain/loss vs Oct 5 is possible on the 18 shared prompts, but per-prompt data for Oct 12 is NOT retrievable**: `responses.fetch` returns only the latest response per prompt and ignores date parameters (tested collection_date / date / start_date+end_date). The Oct 12 per-prompt table lived only in the 10-15 session scratchpad; only its aggregates survive (see 1.1).
- **Moz undercount on ChatGPT Oct 19**: Moz counts 36 (not 40) ChatGPT responses and 11 brand-named responses for us (30.56%). Four ChatGPT responses have empty `brand_definitions` although the text plainly names us (prompts: "how much does it cost to hire someone to file form 5472?", "is form5472 prep legit?", "which companies help foreign founders with us llc tax compliance?", "who can i hire to file form 5472 for my llc"); the same 4 rows are excluded from Moz's 36 denominator (and 2 of them also name Form5472.online). Recounting from the raw text: **us 15/40 = 37.5%** (equal to the Oct 12 headline), Form5472.online 4/40, Doola 2/40, Firstbase 2/40. Dashboard "Prompts" tab (ChatGPT) shows our rank 1st on 9 prompts, 2nd on 2, "Not mentioned" on 29 - i.e. Moz's 11, and shows "Citations 0" on every row because Moz returns **0 ChatGPT citations** (citations breakdown total 0), so ChatGPT citation data below is parsed from the response text.
- Sentiment tab: see 1.6.

### 1.1 Mention-rate trend per engine (Moz official presence = responses naming brand / Moz response count)
Cell = presence % (count/responses). **Bold** = our brand. Rank = our rank among the 4 tracked brands by presence.

| Engine | Brand | Oct 5 | Oct 12 | **Oct 19** | Oct 19 delta vs Oct 12 |
|---|---|---|---|---|---|
| **ChatGPT** | **Form5472prep** | 10.53% (2/19) | **37.50% (15/40)** | **30.56% (11/36)** [text recount 37.5% = 15/40] | -6.9 pts (Moz) / 0 (recount) |
| | Form5472.online | 15.79% (3/19) | 10.00% (4/40) | 5.56% (2/36) [recount 4/40 = 10%] | -4.4 |
| | Doola | 5.26% (1/19) | 7.50% (3/40) | 5.56% (2/36) | -1.9 |
| | Firstbase | 0% (0/19) | 5.00% (2/40) | 5.56% (2/36) | +0.6 |
| | our rank | 2nd | **1st** | **1st** (lead 25 pts over every competitor) | |
| **Google AI Mode** | **Form5472prep** | 21.05% (4/19) | **7.50% (3/40)** | **10.00% (4/40)** | +2.5 |
| | Form5472.online | 15.79% (3/19) | 17.50% (7/40) | **22.50% (9/40)** | +5.0 |
| | Doola | 21.05% (4/19) | 15.00% (6/40) | 15.00% (6/40) | 0 |
| | Firstbase | 15.79% (3/19) | 12.50% (5/40) | 12.50% (5/40) | 0 |
| | our rank | 1st (tied) | 4th (last) | **4th (last)** | |
| **Gemini** | **Form5472prep** | 10.53% (2/19) | **7.50% (3/40)** | **5.00% (2/40)** | -2.5 |
| | Form5472.online | 26.32% (5/19) | 20.00% (8/40) | 20.00% (8/40) | 0 |
| | Doola | 42.11% (8/19) | 17.50% (7/40) | 12.50% (5/40) | -5.0 |
| | Firstbase | 42.11% (8/19) | 10.00% (4/40) | 12.50% (5/40) | +2.5 |
| | our rank | 4th | 4th (last) | **4th (last)** | |
| **Perplexity** (NOT re-collected) | **Form5472prep** | 5.56% (1/18) | no run | no run | n/a |
| | Form5472.online | 5.56% (1/18) | no run | no run | |
| | Doola | 11.11% (2/18) | no run | no run | |
| | Firstbase | 11.11% (2/18) | no run | no run | |
| | our rank | 3rd | | | |

Average depth of our first mention (% of response length; lower = earlier): ChatGPT 6.67 -> 30.23 -> **28.59**; AI Mode 32.91 -> 37.50 -> **25.95**; Gemini 39.18 -> 24.99 -> **45.55**; Perplexity 5.69 (Oct 5 only). Average position over all our mentions (Oct 19): ChatGPT 37.79, AI Mode 37.94, Gemini 22.95 (Moz field `average_position`).
Competitor first-mention depth Oct 19 (Moz dashboard, ChatGPT): Form5472prep 28.6%, Form5472.online 33.7%, Doola 0.2%, Firstbase 22.1%.

**Reading:** ChatGPT remains the only engine where we lead (and the lead is robust: recount 15/40 = same as Oct 12). Google AI Mode: 4th of 4 on both new runs, and **Form5472.online is rising there (15.8 -> 17.5 -> 22.5%)**. Gemini: still last of 4 and slipping (10.5 -> 7.5 -> 5.0%); Doola's Gemini presence collapsed 42 -> 17.5 -> 12.5%, Firstbase 42 -> 10 -> 12.5%, so the formation brands lost Gemini share to **Form5472.online (20%, stable) and to un-tracked third parties** (27/40 Gemini answers name none of the four). Perplexity: no data newer than Oct 5.

### 1.2 Mention counts, share of voice, "mentioned first" - Oct 19 (recomputed from raw responses; ChatGPT = recount incl. the 4 Moz-excluded rows)
SoV = brand's share of all brand-named responses of the four. First = responses where that brand is the first tracked brand named.

| Engine (rows) | US (SoV, first) | Form5472.online | Doola | Firstbase | No tracked brand named |
|---|---|---|---|---|---|
| ChatGPT (40) | **15 (65.2%, 12)** | 4 (17.4%, 2) | 2 (8.7%, 2) | 2 (8.7%, 0) | 24/40 |
| Google AI Mode (40) | **4 (16.7%, 4)** | 9 (37.5%, 5) | 6 (25.0%, 5) | 5 (20.8%, 0) | 26/40 |
| Gemini (40) | **2 (10.0%, 1)** | 8 (40.0%, 7) | 5 (25.0%, 4) | 5 (25.0%, 1) | 27/40 |
| Perplexity (17, Oct 5) | 2 (28.6%, 2)* | 1 (14.3%, 1) | 2 (28.6%, 2) | 2 (28.6%, 0) | 12/17 |
*Perplexity "2" counts the 182-char stub for "how much does form5472 prep cost?" whose text contains our domain; Moz's own count is 1.
ChatGPT "mentioned first" per Moz dashboard pie (percent of all 40 prompts): Form5472prep 22.5% (9), Form5472.online 2.5% (1), Doola 5.0% (2), no brand 70% (28). The dashboard's "How often mentioned" bars use the same 40 denominator (Form5472prep 27.5% = 11/40, each competitor 5.0% = 2/40) while the headline sentence says "30.6% of responses" (11/36).

### 1.3 Per-prompt table - latest run (ChatGPT / AI Mode / Gemini = 2026-10-19; Perplexity = 2026-10-05, the latest it has)
Cell = tracked brands named, in order of first mention, with `@` = depth of first mention as % of response length (US = Form5472 Prep, F = Form5472.online, D = Doola, FB = Firstbase, "-" = none of the 4); `cN` = citations returned/parsed (`our k` = k of them are form5472prep.com URLs); neu/neg/pos/mix = Moz response-level sentiment label; STUBn = very short (n-char) response; `nodata` = Perplexity never collected this prompt. **Bold US** = we are named.

| # | Prompt | ChatGPT | Google AI Mode | Gemini | Perplexity (Oct 5) |
|---|---|---|---|---|---|
| 1 | alternatives to doola for form 5472 filing | D@0>F@21>**US**@25>FB@53 c5(our 1) neu | D@1>F@19>FB@49 c4 neg | D@1>F@51>FB@62 c12 pos | D@10>FB@20 c1 neu STUB339 |
| 2 | best form 5472 preparer for non-resident llc owners | F@29>**US**@63 c2(our 1) mix | D@49>FB@59 c3 mix | F@20>D@72 c11 neu | F@43 c1 neu |
| 3 | best way to file form 5472 for a stripe atlas company | - c3 neu | D@60 c6 neg | D@41 c10 neu | nodata |
| 4 | can form 5472 be faxed to the irs | - c1 neu | F@95 c10 neu | - c5 neu | - c1 neu STUB338 |
| 5 | can form 5472 be filed electronically or only by fax or mail | - c1 neu | - c4 neu | - c5 neg | nodata |
| 6 | can my bookkeeper file form 5472 for my us llc | - c1 neg | - c7 neu | - c5 neg | nodata |
| 7 | do accountants file form 5472 for foreign-owned llc clients | - c1 neu | - c7 neu | - c8 neu | nodata |
| 8 | do i need form 5472 if i only put money into my llc | - c0 neu | - c10 neu | - c9 neg | nodata |
| 9 | do i need to file a final form 5472 when i dissolve my llc? | - c1 neg | - c4 neu | - c12 neg | - c1 neu STUB340 |
| 10 | do i need to file form 5472 if my llc had no income? | - c0 neu | - c10 neg | - c13 neg | - c1 neu STUB312 |
| 11 | does a delaware llc owned by a foreign person need to file form 5472 | - c1 neu | - c7 neg | - c18 neg | nodata |
| 12 | does a wyoming llc owned by a non-resident need to file form 5472 | - c0 neu | - c6 neu | - c8 neu | nodata |
| 13 | doola vs firstbase for form 5472 filing | D@0>FB@0 c5 neu | D@0>FB@1 c3 mix | D@0>FB@1 c11 neu | D@5>FB@8 c0 neu STUB328 |
| 14 | form 5472 filing service for a dormant llc | **US**@22 c3 neg | - c3 neg | F@90>**US**@91>FB@93 c7 neu | nodata |
| 15 | form 5472 filing service with a fax confirmation receipt | **US**@33 c4(our 1) neu | - c3 neu | F@72 c7 neu | nodata |
| 16 | form 5472 penalty calculator | - c1 neg | - c4 neg | - c6 neg | nodata |
| 17 | form 5472 preparer for a foreign-owned llc | - c1 neg | - c4 neu | - c12 neg | nodata |
| 18 | form 5472 statistics and penalty figures | **US**@47 c3 neg | - c6 neg | - c9 neu | nodata |
| 19 | how can accountants outsource form 5472 preparation for clients? | **US**@36 c2(our 1) neg | - c2 neu | - c6(our 3) neu | - c2(our 2) neu |
| 20 | how do i file form 5472 if i am not a us resident? | - c3 neu | F@37 c10 neu | - c18 neu | - c1 neu STUB345 |
| 21 | how do i file form 5472 late for past years and handle the penalty? | - c1 neg | - c6 neg | - c0 neg STUB69 | nodata |
| 22 | how do i write a reasonable cause statement for a late form 5472 | - c0 neg | - c5(our 1) neg | - c12 neg | nodata |
| 23 | how does a foreign-owned llc get an ein without an ssn | - c2 neu | - c3 neu | - c12 neu | nodata |
| 24 | how many foreign-owned companies file form 5472 | - c2 neu | - c5 neg | - c0 neu | nodata |
| 25 | how much does form5472 prep cost? | **US**@10 c2(our 1) neu | **US**@24>F@35 c4(our 1) neg | - c4(our 1) neg | **US**@9 c1(our 1) neu STUB182 |
| 26 | how much does it cost to hire someone to file form 5472? | **US**@12>F@67 c3(our 1) neu | **US**@23>F@40 c3(our 1) neg | - c9(our 4) neu | nodata |
| 27 | is form5472 prep legit? | **US**@0 c4(our 2) neg | **US**@1 c5 neu | **US**@0 c4 mix | **US**@5 c1(our 1) neu STUB299 |
| 28 | is there a flat-fee form 5472 filing service? | **US**@9 c4(our 1) neg | - c4 neg | F@43 c7 neg | - c1 neu |
| 29 | what counts as a reportable transaction on form 5472 | - c1 neg | F@52 c10 neg | - c17(our 2) neg | nodata |
| 30 | what happens if i never file form 5472 for my llc | - c1 neg | - c5 neg | - c6 neg | nodata |
| 31 | what is a pro forma 1120 and who has to file it | - c1 neg | - c4 neg | - c10 neg | nodata |
| 32 | what is the best service to file form 5472 for a foreign-owned llc? | F@27>**US**@33 c3(our 1) mix | F@21 c5 mix | F@19 c9 pos | - c1 neu |
| 33 | what is the cheapest way to file form 5472 and pro forma 1120 online? | **US**@21 c8(our 1) neg | **US**@44>F@53>D@55>FB@55 c7 neg | F@82 c5 neg | - c1 neu STUB312 |
| 34 | what is the diirsp for a late form 5472 | - c0 neu | - c4 neg | - c7 neu | nodata |
| 35 | what is the form 5472 deadline for a foreign-owned single-member llc? | - c1 neu | - c3 neg | - c5 neg | - c1 neu STUB295 |
| 36 | what is the form 5472 penalty and how can i avoid it? | - c4 neg | - c4 neg | - c13 neg | - c1 neu STUB394 |
| 37 | which companies help foreign founders with us llc tax compliance? | **US**@24 c6(our 1) neu | D@33>FB@44 c7 pos | D@17>FB@35 c14 neu | - c3 neu |
| 38 | white label form 5472 filing for accounting firms | **US**@17 c3(our 1) mix | F@49 c5 neu | F@48 c10 neg | nodata |
| 39 | who can file form 5472 and the pro forma 1120 for my single-member llc? | - c1 neu | - c4 neu | - c5 neu | - c1 neu |
| 40 | who can i hire to file form 5472 for my llc | **US**@38 c3(our 1) neg | - c3 neg | FB@68 c7 neg | nodata |

**Moz-missed ChatGPT rows (named in the text, empty `brand_definitions`):** #26, #27, #37, #40. These show "Not mentioned" on the dashboard Prompts tab; the table above counts them as named.

### 1.3a Prompts gained / lost
**vs 2026-10-12: per-prompt diff NOT obtainable** (Moz keeps only the latest response per prompt; the Oct 12 per-prompt table is gone). Aggregates only (Moz official counts of 40 prompts): ChatGPT 15 -> 11 (recount 15 -> 15, i.e. no real change; the drop is Moz's 4 unprocessed rows), AI Mode 3 -> 4 (+1), Gemini 3 -> 2 (-1). Unique prompts naming us in >=1 engine on Oct 19: **15 of 40, all through ChatGPT** (#1, 2, 14, 15, 18, 19, 25, 26, 27, 28, 32, 33, 37, 38, 40); AI Mode and Gemini add none beyond ChatGPT's set except Gemini #14 and #27 (already in the set). **25 prompts have no engine naming us** (#3-13, 16, 17, 20-24, 29-31, 34-36, 39 - all informational/IRS-rules queries plus 3 service-intent ones: #3 Stripe Atlas, #13 doola-vs-firstbase, #17 "preparer for a foreign-owned llc", #39 "who can file ...").

**vs 2026-10-05 on the 18 prompts that had data on both dates** (prompt ids from the table):
| Engine | Named us Oct 5 | Named us Oct 19 (same 18 prompts) | Gained | Lost |
|---|---|---|---|---|
| ChatGPT | 2 (#27 legit, #28 flat-fee) | **10** | **+8: #1 alternatives to doola, #2 best preparer, #19 accountants outsource, #25 how much form5472 prep cost, #26 cost to hire, #32 best service, #33 cheapest way, #37 which companies** | none |
| Google AI Mode | 4 (#25, #26, #27, #33) | 4 (identical set) | none | none |
| Gemini | 2 (#26, #33) | 1 (#27) | #27 "is form5472 prep legit?" (US@0, first answer) | **#26 cost to hire, #33 cheapest way** |
| Perplexity | 1 (#27) | no new run | - | - |
Of the 22 prompts added after Oct 5: ChatGPT names us on 5 (**#14 dormant LLC, #15 fax-receipt service, #18 statistics, #38 white-label for accounting firms, #40 "who can i hire"**), AI Mode on 0, Gemini on 1 (#14, third in a list: F@90 > US@91 > FB@93).
Prompts where an engine now cites our pages **without naming us**: AI Mode #22 (reasonable-cause statement; cites /form-5472-reasonable-cause-statement pos 3), Gemini #19 (3 cites of the in-house-vs-outsourced blog), Gemini #25 (/pricing), Gemini #26 (/pricing x4), Gemini #29 (reportable-transactions blog x2), Perplexity #19 (home + partner post, Oct 5) = **6 responses** (13 of the 17 our-domain citations on AI Mode/Gemini/Perplexity; for AI Mode + Gemini alone 11 of 13 citations of our pages sit in answers that do not name us - Oct 12 per the 10-15 log: 10 of 17).

### 1.4 Citations (latest run; parsed/returned, utm_source and `#:~:text` fragments stripped)
Totals: ChatGPT **88** citations / 55 unique URLs / 21 domains (parsed from response markdown; Moz itself returns 0 ChatGPT citations - citation breakdown total 0); AI Mode **209** / 152 / 59 domains; **Gemini 348** / 111 / 67 (Gemini now returns citations - baseline Oct 5/11 had 0); Perplexity 19 / 14 / 8 (Oct 5). Combined 664 citations.
Top cited domains (all engines; cha / aim / gem / per): irs.gov **79** (35/32/7/5) - **form5472.online 92** (3/25/**64**/0) - google.com 50 (AI Mode `google.com/goto?url=` redirect wrappers; destinations opaque, only the page title is visible; none has our brand in the title) - **form5472prep.com 31** (14/3/10/4; was 13 on Oct 11: 7/2/0/4) - entity.inc 25 (0/5/20/0) - wise.com 20 (0/3/14/3) - taxesforexpats.com 20 (Gemini only) - optimizetax.io 15 - hiltzikcpa.com 15 (0/4/10/1) - trybookmate.co 15 (Gemini 14) - greenbacktaxservices.com 11 (Gemini) - clemta.com 10 - form5472.tax 9 (6/1/2/0) - reddit.com 9 - nonresident.tax 9 - expatustax.com 9 - hcvt.com 8 - filabl.com 8 - 5472direct.com 7 - drummondadvisors 7 - edetax.com 6 (5/1/0/0) - firstbase.io 5 - doola.com 4 (+ask.doola.com/help.doola.com).
Per engine top-12 (domain count): **ChatGPT** irs.gov 35, form5472prep.com 14, form5472.tax 6, edetax.com 5, snapfile.tax 3, 5472direct.com 3, firstbase.io 3, form5472.online 3, doola.com 2, fintaxes.us 2, laramieledgertax.com 2 | **AI Mode** google.com 50, irs.gov 32, form5472.online 25, reddit.com 6, entity.inc 5, hcvt.com 4, optimizetax.io 4, youtube.com 4, hiltzikcpa.com 4 | **Gemini** form5472.online 64, entity.inc 20, taxesforexpats.com 20, wise.com 14, trybookmate.co 14, greenbacktaxservices.com 11, optimizetax.io 11, hiltzikcpa.com 10, **form5472prep.com 10**, expatustax.com 9, nonresident.tax 8 | **Perplexity (Oct 5)** irs.gov 5, form5472prep.com 4, wise.com 3, form5472.io 2, terms.law 2.
**form5472.online's most-cited URLs** (cha+aim+gem): /pricing 13, /best-online-services-to-file-irs-form-5472... 13, /post/foreign-owned-llc-tax-requirements-complete-guide 8, /post/form-5472-comprehensive-guide-foreign-owned-llc 7, /partners 6, /post/launchusa-vs-doola-vs-firstbase-llc-cost-2026 6, / 5, /penalty-removal 5, /post/form-5472-and-u-s-tax-filing-update-october-2026 4, /post/the-pro-forma-form-1120-requirement-for-llcs 4. Also cited in AI Mode: form5472.online/post/best-form-5472-filing-services-2026 and /post/form-5472-filing-services-compared-credentials-reviews-pricing-evidence (its own comparison posts).

**OUR URLs cited (engine | URL | citation position | prompt | named in the answer?)** - 31 citations, 13 distinct URLs:
| Engine | URL | Pos | Prompt | Named? |
|---|---|---|---|---|
| ChatGPT | /services/form-5472-filing-service | 2 / 1 / 2 / 2 | #1 alternatives to doola / #26 cost to hire / #28 flat-fee / #32 best service | yes (all) |
| ChatGPT | /services/foreign-owned-llc-tax-filing-service | 2 / 2 | #2 best preparer for non-resident owners / #37 which companies help foreign founders | yes |
| ChatGPT | /services/form-5472-fax-filing-service | 1 | #15 filing service with a fax confirmation receipt | yes (1st) |
| ChatGPT | /services/white-label-form-5472-filing | 1 | #38 white label for accounting firms | yes (1st) |
| ChatGPT | /partners | 1 | #19 how can accountants outsource | yes |
| ChatGPT | /pricing | 1 / 2 | #25 how much does form5472 prep cost / #27 legit | yes |
| ChatGPT | / (home) | 1 / 1 | #27 legit / #40 who can i hire | yes |
| ChatGPT | **/compare/form-5472-filing-services** | **7** (of 8) | #33 cheapest way to file 5472 + pro forma 1120 online | yes (1st, US@21) - **first-ever citation of the comparison page** |
| AI Mode | /pricing | 2 | #26 cost to hire someone | yes (1st) |
| AI Mode | / (home) | 2 | #25 how much does form5472 prep cost | yes (1st) |
| AI Mode | /form-5472-reasonable-cause-statement | 3 | #22 reasonable cause statement | **no** |
| Gemini | /pricing | 3 ; 2,6,7,8 | #25 ; #26 | **no** (both) |
| Gemini | /blog/form-5472-in-house-vs-outsourced-firm | 2,4,5 | #19 accountants outsource | **no** |
| Gemini | /blog/form-5472-reportable-transactions-examples | 10,11 | #29 reportable transaction | **no** |
| Perplexity (Oct 5) | / ; /blog/form-5472-partner-program-how-it-works ; /about | 1 ; 2 ; 1 | #19, #25 ; #19 ; #27 | #25 / #27 named, #19 not |
Trustpilot (trustpilot.com/review/form5472prep.com) is cited on "is form5472 prep legit?" by ChatGPT, AI Mode and Gemini.

**Target-page check (new pages):**
- `/compare/form-5472-filing-services`: **cited once** (ChatGPT #33, pos 7) - and the answer names us first on that prompt (AI Mode also names us at 44% on #33 but cites other pages; Gemini does not name us on #33).
- `/form-5472-statistics`: **no URL cited** by any engine, BUT ChatGPT's answer to #18 ("form 5472 statistics and penalty figures") names us and its body carries the NTA 2018 figures (9,889 penalties, $253.1M assessed, 55% by number / 71% by dollars abated) "as summarized in the Form 5472 statistics review" followed by a "Form5472 Prep" source chip - almost certainly our statistics page, whose URL Moz's capture drops (ChatGPT inline source chips are text only). So the statistics page is probably being cited by ChatGPT; the same chip-without-URL pattern appears in ChatGPT #14 (dormant LLC). Treat the ChatGPT our-URL count above as a lower bound.
- `/form-5472-example`, `/form-5472-instructions`, `/form-5472-penalty`: **not cited** by any engine (third-party pages for those slugs: taxesforexpats.com/.../form-5472-penalty.html, laramieledgertax.com/articles/form-5472-instructions/, wgcpas.com/article/form-5472-penalty-relief/, optimizetax.io/blog/form-5472-penalty-relief/ own those queries).
- `/about`: not cited on Oct 19 (Oct 5: ChatGPT cited /about, /terms, /security, /data-retention on the legit prompt, Perplexity /about; the legit answer now cites /, /pricing, Trustpilot, IRS). Only the Perplexity Oct 5 /about cite exists.
- `/pricing`: ChatGPT 2, AI Mode 1, Gemini 5 (across 2 responses).
- Filing-service comparison **blog post**: no `/blog/*` comparison post is cited by any engine (the blog URLs cited are in-house-vs-outsourced-firm, reportable-transactions-examples (Gemini) and partner-program (Perplexity Oct 5)).

### 1.4a Third-party pages cited where we are NOT named (top 15; 114 engine-responses without us, all engines)
(count = responses citing the URL; irs.gov kept because it is the top single source)
1. **34x** irs.gov/instructions/i5472 (cha 15, aim 13, gem 4, per 2)
2. 10x wise.com/us/blog/how-to-file-form-5472 (aim 2, gem 6, per 2)
3. 10x **hiltzikcpa.com/form-5472-filing-service/** (aim 4, gem 5, per 1)
4. 7x hcvt.com/alertarticle-Foreign-Owned-Single-Member-US-LLC-Tax-Requirement (aim 4, gem 3)
5. 6x irs.gov/forms-pubs/about-form-5472
6. 6x media.drummondadvisors.com/foreign-owned-single-member-llc-and-irs-form-5472/ (aim 3, gem 3)
7. 6x **form5472.online/best-online-services-to-file-irs-form-5472...** (aim 1, gem 5)
8. 5x irs.gov/pub/irs-pdf/i5472.pdf
9. 5x greenbacktaxservices.com/knowledge-center/form-5472/ (Gemini)
10. 5x clemta.com/blog/form-5472-late-filing-penalty (aim 2, gem 3)
11. 4x form5472.online/post/form-5472-comprehensive-guide-foreign-owned-llc
12. 4x irs.gov/payments/international-information-reporting-penalties
13. 4x entity.inc/blog/best-us-llc-formation-services-non-residents/
14. 4x asamllp.cpa/form-5472-foreign-owned-llcform-5472-foreign-owned-llc/
15. 4x delawarebusinessincorporators.com/pages/faq-for-form-1120-5472-foreign-owned-single-member-and-multi-member-llc... / wgcpas.com/article/form-5472-penalty-relief/ / form5472.online/ / form5472.online/pricing (4x each)
**Service-intent prompts only** (20 prompts such as #1-3, 6, 7, 13-15, 17, 20, 25-28, 32, 33, 37-40; 50 engine-responses without us): hiltzikcpa.com/form-5472-filing-service/ **8x** (prompts 2, 26, 28, 32, 38) - form5472.online/best-online-services-to-file-irs-form-5472 6x - hcvt.com alert article 5x - wise.com how-to-file 5x - entity.inc best-llc-formation-services 4x - drummondadvisors 4x - form5472.online/ 4x and /pricing 4x - firstbase.io/pricing 3x - form5472.online comprehensive-guide 3x - asamllp.cpa 3x - genzone.com best-doola-alternatives 2x - faxterra.com/fax/irs-form-5472 2x - reddit.com/r/llc/.../any_recommended_cpas_for_filing_form_5472 2x - filabl.com/compare/doola 2x - skool.com ... verification-of-form-5472-and-1120-submission-status 2x - 5472direct.com 2x. Domains by number of distinct (prompt, engine) cites there: form5472.online 18, irs.gov 16, hiltzikcpa.com 9, entity.inc 7, wise.com 6, hcvt.com 5, reddit.com 5, drummondadvisors 4.

### 1.5 How engines describe us (facts repeated; check for wrong / outdated)
Correct and repeated: Standard $149 / Express $199 incl. accountant review, IRS fax delivery, timestamped fax receipt (ChatGPT #1, 15, 25, 26, 27, 28, 32, 37, 38; AI Mode #25 "start around $149", #26 "$149-$199"; Perplexity Oct 5 #25); partner program / white-label for accountants (ChatGPT #19, #38); "Express advertised within 24 hours" (ChatGPT #32); both forms prepared (5472 + pro forma 1120).
**Wrong / outdated / unflattering facts found:**
1. **AI Mode #33 "cheapest way ... online": "Form5472Prep: ~$99 (software wizard with IRS fax submission)"** - wrong price (ours is $149 Standard / $199 Express; $99 is the extra-past-year add-on). It also lists us as the cheapest option on that wrong number.
2. **ChatGPT #38 (white label): "Express: within 3 business days"** (and Standard 5-7 business days) vs the 24-hour ready-to-sign Express promise ChatGPT itself states in #32 - verify the white-label page / terms wording.
3. "Additional past tax years cost $99 each" appears in ChatGPT #28, #38 and Perplexity #25 - consistent across engines; confirm it is still the live price.
4. **AI Mode #27 / Gemini #27 ("is form5472 prep legit?")**: we are classified as "software-assisted / automated or semi-automated document generators ... rather than formal, licensed CPA or tax law firms" and "budget document preparation site" - contradicts the accountant-review positioning (neither answer mentions the PTIN accountant reviewer); Gemini adds "automated intake forms can easily miss critical nuances".
5. **ChatGPT #27 (legit)**: repeats "founded in 2025, limited operating history", "Trustpilot 4.2/5 but only six reviews", "it explicitly says it is not a CPA firm and does not provide personalized tax or legal advice", "a fax receipt proves transmission, not IRS acceptance" (sourced from /about, /terms and Trustpilot); recommends an international-tax professional for complex/late cases; ends "relatively new, specialized service". Response sentiment label: negative.
6. ChatGPT #2: lists us 4th ("Best to compare for a straightforward, lower-cost filing ... Confirm the preparer's credentials, exact fee"), recommending Form5472.online or a specialist CPA first.
No price other than $149/$199/(+$99 per past year)/~$99 (wrong) was found; no claim we do not make (no "filed within 24h", no CPA/EA claim) except items 1-2 above.

### 1.6 Sentiment (tab now LOADS - it errored with "Internal error" on 10-07 and 10-11; `ai.tracking.project.sentiment.fetch` per engine, collection of the latest run)
Dashboard (ChatGPT view): **Overall score 48 = "Mixed", High confidence**, "based on the 41 times your brand was mentioned in the 40 prompts" (1 positive / 37 neutral / 3 negative). Competitors: Form5472.online 7 mentions (0/7/0), Doola 13 (0/13/0), Firstbase 7 (0/7/0) - all "Not enough data" (score 50, insufficient confidence).
Per engine, our brand: **ChatGPT 47.6 (high confidence; relevant segments 41: +1 / -3 / =37)**; AI Mode 50.0 (insufficient; 3 relevant segments, all neutral); Gemini 50.0 (insufficient; 3 neutral); Perplexity (Oct 5) 50.0 (insufficient; 1). Competitors elsewhere: AI Mode Doola 57.1 (high; +3 / -1 / =10), Firstbase 62.5 (low; +2), Form5472.online 50.0 (low; +1/-1); Gemini Form5472.online 55.6 (low; +1).
Corpus negativity is topic-driven: negative segments 43/489 (ChatGPT), 36/332 (AI Mode), 32/419 (Gemini), i.e. 7-11% of all segments are penalty/risk text, 87-91% neutral.
**Key themes (ChatGPT, our brand):** preparation services **100 / positive (1 mention)** - segment "Form5472 Prep - Best budget-friendly done-for-you option"; filing penalties **25 / negative (2 mentions)** - "$25,000 penalty ... Confirm the service handles your ownership structure ... before paying" next to our name; **company qualifications 25 / negative (1 mention)** - "The company says it was founded in 2025, is not a CPA firm, and does not provide personalized tax or legal advice." (that is the ChatGPT "legit?" answer quoting our own About/Terms). Moz's own improvement suggestion: "room for improvement around company qualifications".
Response-level labels (Moz `sentiment_label`, not brand-specific), latest run: ChatGPT neutral 20 / negative 17 / mixed 3 (of 40); AI Mode neutral 15 / negative 21 / mixed 3 / positive 1; Gemini neutral 17 / negative 20 / positive 2 / mixed 1; Perplexity neutral 17 (Oct 5). Negative share: ChatGPT 44% -> 42.5%, AI Mode 33% -> 52.5%, Gemini 44% -> 50% vs the Oct 5 18-prompt baseline (driven by the 22 added penalty/IRS-rules prompts).


---

## 2. Domain Overview for form5472prep.com (run 2026-10-26; domain scope, market US en-US)
Credits: Domain Overview quota read "80 of 100 queries available until 11/01" before and **79 after query 1 (form5472prep.com)**. Keyword Research pool "3,749 of 5,000" (was 3,761 on 10-11). Query 2/3 of the DO cap used in section 4. (Another agent shares the account: the DO pool was 88 on 10-11 and 80 at the start of this session.)

### 2.1 Headline metrics, now vs 2026-10-11
| Metric | 2026-10-11 | **2026-10-26** | Delta |
|---|---|---|---|
| Domain Authority | 10 | **11** | **+1** (12-month chart 1 -> 11, last point 2026-10-01 = 11) |
| Brand Authority | 1 | **1** | 0 |
| Page Authority (homepage) | 28 | **29** | +1 |
| Spam Score (domain) | 16% | see 3.1 (Link Explorer) | |
| Linking root domains | 62 | **68** | **+6** (homepage is the only page with linking domains: PA 29 = 68) |
| Linking domains discovered, last 60 days / lost | 58 / 0 | **22 / 0** (window Aug 30 - Oct 23: +22, -0, net +22; the window rolled, the 58 are not "lost") | |
| Ranking keywords (Moz US) | 80 | **106** | **+26 net (+27 new, -1 lost)** |
| Keywords #1-3 / #4-10 / #11-20 / #21-30 / #31-40 / #41-50 / #51+ | 5/2/2/7/9/4/51 | **5/3/8/11/14/9/56** | #1-3 flat, #4-20 +7 |
| Domain search theme | International Tax Compliance | same | |
| Keyword topics | 5 | same 5 | |
| Linking domains by spam score (Moz bands) | 98.2% in 1-30% | 1-10%: 43, 11-20%: 14, 21-30%: 1, 61-70%: 1 (= 8coint.com) | |
Competitor Overview (Moz "true competitors"): taxule.com 21 kw (was 18) / 2 at #1-3 / PA 22 (16) / DA 3; en-se.tkegexpat.com 10 kw (7) / 0 / 2 at #4-10 / PA 17 (16) / DA 15; easyfiling.com 8.5k kw / 36 at #1-3 / 269 at #4-10 / PA 37 / DA 58 (57); us 106 / 5 / 3 / 29 / 11. Keyword opportunities widget: still only "form 5472 rental property llc" (lift 0). Link-opportunities widget: gofreebacklinks.com, seo-first-page.com, wants.cfd, largeseotools.com, backlinkshome.com (all link-farm style; same class as before).
Top pages by linking domains: homepage PA 29 = 68 linking domains; /blog/form-5472-client-intake-checklist-for-firms, /blog/topics/influencers, /start?v=below&src=form-5472-instructions&tier=premium, /blog/topics/south-korea (each PA 15, 0 linking domains) - same set as 10-11. Top linking domains by DA: cvillico.com (DA 64, 689 LDs), cmocheatsheets.com (62, 811), mylisthero.com (62, 380), mymarketpost.com (61, 496), wioutlet.com (61, 321) - all PBN-class.
Frequently used anchors: PBN sentence "high quality dofollow backlinks da 50 pa 40 premium pbn network service form5472prep.com rank first page google fast seo link building buy backlinks online cheap" = **60 domains / 180 followed external links** (was 54 / 146); "form5472prep.com" 1 domain / 2 links (form5472.online).

### 2.2 Ranking keywords (Keyword Research > Ranking Keywords, US, domain scope, 2026-10-26; "Keyword Data Updated Every Two Weeks")
**Delta vs the 2026-10-11 list (80 rows): +27 new, -1 lost, 0 position moves of >=3, 0 ranking-URL changes among the 79 retained keywords** (the retained keywords carry exactly the 10-11 positions; this refresh only *added* rows). Moz now lists ranks down to #96.
**Lost (1):** form 5472 cpe course (#31, /about) - an irrelevant CPE keyword.
**New (27)** - by theme:
- **Money / service intent:** pro forma 1120 (#20, /services/pro-forma-1120-filing-service, KD 51, vol 27) - form 5472 fax filing reddit (#16) - form 5472 fax filing (#74, /faq) - form 5472 fax filing pdf (#83, /file-form-5472) - form 5472 example (#16, tracked, **/blog/form-5472-part-v-statement-example**, vol 11) - **form 5472 (#29, /blog/what-is-form-5472, vol 2,361, KD 50)** - form 5472-2 (#22, /do-i-need-to-file-form-5472, vol 27) - exempt payee tax classification airbnb (#34, /blog/form-5472-airbnb-short-term-rental-host).
- **EIN cluster (new URLs /blog/ein-address-change-form-8822-b, /blog/ein-application-rejected-reference-number-101, /blog/ein-third-party-designee-apply-on-your-behalf, /blog/ein-for-foreign-owned-llc-without-ssn):** irs ein address change (#40, vol 136), irs error code 101 (#47, vol 122), irs ein number error 101 (#47), irs ein ref number 101 (#48), irs ein error reference number 101 (#49), irs fein address change (#39), irs how to change address on ein (#39), irs ein correction address (#11, KD 66), irs cpa change of address ein number (#28), irs ein online third party designee (#15), ein foreign entity (#69), how to get ein for llc as non resident without (#75), how to get ein for llc as non resident (#79).
- **Other:** exchange rate average (#17, /irs-yearly-average-exchange-rates, vol 47), convert us $ to irs (#24), foreign exchange rates irs (#35), exchange rate irs 2018 (#42, vol 64), irsn number (#7, /blog/irsn-vs-itin-rejected-w7, vol 19), irs caa fees and charges (#32, /blog/itin-cost-irs-fee-caa-service).
**New pages from the SEO wave NOT in Moz's list at all:** /compare/form-5472-filing-services, /form-5472-statistics, /form-5472-example, /form-5472-instructions (no keyword of any rank), /pricing; /form-5472-penalty ranks only for "5472 penalty abatement" #64 and "form 5472 penalty relief" #75 (both already in the 10-11 list at the same positions). The blog comparison post does not rank for any listed keyword. 10 ranking URLs are new vs 10-11 (the EIN posts, /irs-yearly-average-exchange-rates, /do-i-need-to-file-form-5472, /blog/form-5472-part-v-statement-example, /blog/form-5472-airbnb-short-term-rental-host, /blog/irsn-vs-itin-rejected-w7, /blog/itin-cost-irs-fee-caa-service); /blog/what-is-form-5472 carries 30 of the 106 keywords.
Tracked keywords (Moz "Tracked" flag, campaign): form 5472 preparation service #1, form 5472 preparer #1, form 5472 example #16, pro forma 1120 #20, late form 5472 filing service #21, hire someone to file form 5472 #23, form 5472 fax filing service #24, form 5472 #29, form 5472 help #36, 1120 and 5472 filing service #43, form 5472 deadline #46, form 5472 for bookkeepers #56, pro forma 1120 filing service #66, form 5472 extension #72, form 5472 penalty relief #75, form 5472 for cpas #92.

Full list (sorted by rank; **bold** = new vs 10-11; KD, Vol 0 = Moz sub-threshold; T = tracked):

| # | Keyword | Pos | Ranking URL | KD | Vol |
|---|---|---|---|---|---|
| 1 | form 5472 preparation service T | 1 | /services | 7 | 36 |
| 2 | form 5472 preparer T | 1 | /services/pro-forma-1120-filing-service | 23 | 0 |
| 3 | form 5472 preparation service pdf | 1 | /faq | 25 | 0 |
| 4 | 5472 form filling | 2 | /file-form-5472 | 6 | 0 |
| 5 | form 5472 outsourcing | 3 | /blog/form-5472-in-house-vs-outsourced-firm | 34 | 0 |
| 6 | **irsn number** | 7 | /blog/irsn-vs-itin-rejected-w7 | 24 | 19 |
| 7 | form 5472 fax filing service reddit | 8 | /blog/how-to-fax-form-5472-irs | 53 | 0 |
| 8 | form 5471 reasonable cause decision tree | 9 | /blog/topics/foreign-owned-llc | 19 | 11 |
| 9 | **irs ein correction address** | 11 | /blog/ein-address-change-form-8822-b | 66 | 1 |
| 10 | form 5472 and pro forma 1120 filing service instructions | 11 | /blog/pro-forma-form-1120-foreign-owned-llc | 42 | 0 |
| 11 | **irs ein online third party designee** | 15 | /blog/ein-third-party-designee-apply-on-your-behalf | 53 | 1 |
| 12 | **form 5472 example** T | 16 | /blog/form-5472-part-v-statement-example | 27 | 11 |
| 13 | **form 5472 fax filing reddit** | 16 | /blog/how-to-fax-form-5472-irs | 52 | 0 |
| 14 | **exchange rate average** | 17 | /irs-yearly-average-exchange-rates | 32 | 47 |
| 15 | form 5472 rental property llc | 17 | /blog/form-5472-us-real-estate-foreign-investor | 21 | 0 |
| 16 | **pro forma 1120** T | 20 | /services/pro-forma-1120-filing-service | 51 | 27 |
| 17 | late form 5472 filing service T | 21 | /blog/form-5472-filed-late-never-filed | 35 | 0 |
| 18 | **form 5472-2** | 22 | /do-i-need-to-file-form-5472 | 41 | 27 |
| 19 | hire someone to file form 5472 T | 23 | /blog/form-5472-diy-vs-preparer | 37 | 0 |
| 20 | does a foreign owned single member llc need an ein | 24 | /blog/ein-responsible-party-foreign-owned-llc | 15 | 27 |
| 21 | **convert us $ to irs** | 24 | /irs-yearly-average-exchange-rates | 51 | 27 |
| 22 | 1120 and 5472 filing service 2022 | 24 | /blog/form-5472-small-corporation-reasonable-cause | 32 | 0 |
| 23 | form 5472 fax filing service T | 24 | /blog/how-to-fax-form-5472-irs | 40 | 0 |
| 24 | what is the penalty for filing 5472 late? | 25 | /blog/form-5472-filed-late-never-filed | 31 | 0 |
| 25 | **irs cpa change of address ein number** | 28 | /blog/ein-address-change-form-8822-b | 60 | 11 |
| 26 | **form 5472** T | 29 | /blog/what-is-form-5472 | 50 | 2,361 |
| 27 | foreign owned single member llc filing requirements california | 30 | /blog/california-llc-foreign-owner-tax-filing | 32 | 0 |
| 28 | form 5472 deadline 2026 | 31 | /blog/form-5472-deadline-2026 | 24 | 0 |
| 29 | **irs caa fees and charges** | 32 | /blog/itin-cost-irs-fee-caa-service | 20 | 11 |
| 30 | form 5472 preparation example | 32 | /about | 37 | 0 |
| 31 | how long to get an itin | 34 | /blog/itin-processing-time-status-delays | 48 | 55 |
| 32 | **exempt payee tax classification airbnb** | 34 | /blog/form-5472-airbnb-short-term-rental-host | 45 | 27 |
| 33 | how long does it take to get a itin | 34 | /blog/itin-processing-time-status-delays | 47 | 11 |
| 34 | how much does it cost to file form 5472? | 34 | /blog/what-is-form-5472 | 29 | 0 |
| 35 | **foreign exchange rates irs** | 35 | /irs-yearly-average-exchange-rates | 51 | 17 |
| 36 | form 5472 help T | 36 | /blog/what-is-form-5472 | 20 | 0 |
| 37 | form 5472 for real estate llc foreign owned | 36 | /blog/form-5472-us-real-estate-foreign-investor | 34 | 0 |
| 38 | how long does it take to apply for an itin | 38 | /blog/itin-processing-time-status-delays | 49 | 0 |
| 39 | **irs fein address change** | 39 | /blog/ein-address-change-form-8822-b | 59 | 11 |
| 40 | **irs how to change address on ein** | 39 | /blog/ein-address-change-form-8822-b | 59 | 1 |
| 41 | **irs ein address change** | 40 | /blog/ein-address-change-form-8822-b | 60 | 136 |
| 42 | **exchange rate irs 2018** | 42 | /irs-yearly-average-exchange-rates | 49 | 64 |
| 43 | 1120 and 5472 filing service T | 43 | /services/pro-forma-1120-filing-service | 42 | 0 |
| 44 | how long does it take to generate itin? | 43 | /blog/itin-processing-time-status-delays | 49 | 0 |
| 45 | form 5472 deadline T | 46 | /blog/form-5472-deadline-2026 | 30 | 2 |
| 46 | **irs error code 101** | 47 | /blog/ein-application-rejected-reference-number-101 | 39 | 122 |
| 47 | **irs ein number error 101** | 47 | /blog/ein-application-rejected-reference-number-101 | 39 | 27 |
| 48 | **irs ein ref number 101** | 48 | /blog/ein-application-rejected-reference-number-101 | 38 | 27 |
| 49 | **irs ein error reference number 101** | 49 | /blog/ein-application-rejected-reference-number-101 | 41 | 11 |
| 50 | what is a 5472? | 50 | /blog/what-is-form-5472 | 41 | 0 |
| 51 | 5472 us | 52 | /blog/what-is-form-5472 | 39 | 0 |
| 52 | what is form 5472 | 54 | /blog/what-is-form-5472 | 43 | 64 |
| 53 | federal form 5472 | 54 | /blog/what-is-form-5472 | 45 | 3 |
| 54 | form 5272 | 55 | /blog/what-is-form-5472 | 44 | 6 |
| 55 | single member llc foreign owned california | 55 | /blog/california-llc-foreign-owner-tax-filing | 28 | 0 |
| 56 | form 5472 for bookkeepers T | 56 | /services/form-5472-filing-service | 28 | 0 |
| 57 | irs 5472 | 57 | /blog/what-is-form-5472 | 50 | 39 |
| 58 | do i have to file form 5472? | 57 | /blog/what-is-form-5472 | 41 | 0 |
| 59 | how long does it take for itin to arrive? | 57 | /blog/itin-processing-time-status-delays | 42 | 0 |
| 60 | forms 5472 | 58 | /blog/what-is-form-5472 | 39 | 47 |
| 61 | tax form 5472 | 58 | /blog/what-is-form-5472 | 45 | 1 |
| 62 | what is form 5472 used for | 59 | /blog/what-is-form-5472 | 41 | 6 |
| 63 | does taxact support form 5472? | 59 | /blog/what-is-form-5472 | 34 | 0 |
| 64 | rev proc 91-55 | 60 | /blog/what-is-form-5472 | 26 | 27 |
| 65 | new form 5472 | 60 | /blog/what-is-form-5472 | 38 | 0 |
| 66 | how do i get a non resident itin number? | 63 | /blog/itin-application-checklist-nonresidents | 39 | 27 |
| 67 | mi 5472 | 63 | /blog/what-is-form-5472 | 41 | 1 |
| 68 | 5472 penalty abatement | 64 | /form-5472-penalty | 32 | 24 |
| 69 | form 5472 irs | 65 | /blog/what-is-form-5472 | 50 | 24 |
| 70 | form 5472 due date pdf | 65 | /blog/form-5472-deadline-2026 | 35 | 0 |
| 71 | extension form 5472 | 66 | /blog/what-is-form-5472 | 24 | 0 |
| 72 | form 5472 help sample | 66 | /blog/how-to-fill-out-form-5472 | 35 | 0 |
| 73 | form 5472 1f | 66 | /blog/what-is-form-5472 | 38 | 0 |
| 74 | pro forma 1120 filing service T | 66 | /1120-pro-forma-instructions | 38 | 0 |
| 75 | form 5472 preparer for non resident online | 66 | / | 40 | 0 |
| 76 | 5472 nra | 68 | /blog/what-is-form-5472 | 32 | 27 |
| 77 | 5472 1f | 68 | /blog/what-is-form-5472 | 42 | 0 |
| 78 | **ein foreign entity** | 69 | /blog/ein-for-foreign-owned-llc-without-ssn | 39 | 24 |
| 79 | how to apply for itin from india | 69 | /blog/itin-application-checklist-nonresidents | 35 | 1 |
| 80 | foreign owned multi member llc | 70 | /blog/multi-member-llc-form-5472-or-1065 | 15 | 64 |
| 81 | form 5472 cost sharing arrangement | 71 | /blog/what-is-form-5472 | 34 | 3 |
| 82 | form 5472 for real estate llc foreign owned download | 71 | /services/final-form-5472-for-dissolved-llc | 40 | 0 |
| 83 | form 5472 extension T | 72 | /blog/what-is-form-5472 | 40 | 1 |
| 84 | form 5472 history | 72 | /blog/what-is-form-5472 | 39 | 0 |
| 85 | pro forma 1120 filing service example | 73 | /1120-pro-forma-instructions | 28 | 0 |
| 86 | form 5472 reportable transaction capital contribution | 74 | /blog/what-is-form-5472 | 28 | 24 |
| 87 | **form 5472 fax filing** | 74 | /faq | 25 | 0 |
| 88 | form 5472 instructions part vi | 74 | /blog/what-is-form-5472 | 38 | 0 |
| 89 | form 5472 penalty relief T | 75 | /form-5472-penalty | 27 | 0 |
| 90 | **how to get ein for llc as non resident without** | 75 | /blog/ein-for-foreign-owned-llc-without-ssn | 37 | 0 |
| 91 | form 5472 for tax preparers instructions | 76 | /about | 40 | 0 |
| 92 | us taxes on foreign subsidiary irc | 78 | /blog/does-foreign-owned-llc-pay-us-tax | 31 | 1 |
| 93 | penalty relief form 5472 | 78 | /blog/what-is-form-5472 | 27 | 0 |
| 94 | **how to get ein for llc as non resident** | 79 | /blog/ein-for-foreign-owned-llc-without-ssn | 26 | 0 |
| 95 | form 5472 filing instructions | 81 | /file-form-5472 | 41 | 11 |
| 96 | form 5472 filing for cpa firms example | 81 | /blog/irs-official-exchange-rate-form-5472 | 3 | 0 |
| 97 | can california llc have foreign members | 82 | /blog/california-llc-foreign-owner-tax-filing | 32 | 0 |
| 98 | **form 5472 fax filing pdf** | 83 | /file-form-5472 | 17 | 0 |
| 99 | what are reportable transactions for form 5472 | 85 | /blog/what-is-form-5472 | 38 | 8 |
| 100 | form 5472 preparer for non resident | 86 | /about | 32 | 0 |
| 101 | form 5472 disregarded entity | 87 | /blog/what-is-form-5472 | 45 | 55 |
| 102 | itin verification documents | 87 | /blog/itin-application-checklist-nonresidents | 37 | 1 |
| 103 | form 5472 help pdf | 92 | /file-form-5472 | 22 | 0 |
| 104 | form 5472 for cpas T | 92 | /about | 29 | 0 |
| 105 | form 5472 filing for cpa firms | 96 | /about | 25 | 0 |
| 106 | form instructions 5472 | 96 | /file-form-5472 | 31 | 0 |

---

## 3. Link Explorer for form5472prep.com (root domain, run 2026-10-26)
Queries used: **1 Link Explorer target (form5472prep.com)** viewed through Overview, Linking Domains, Discovered & Lost, Inbound Links and Spam Score reports (cap 3; no Link Intersect, no competitor run). Pool "19,924 of 20,000 queries available until 10/30" (was 19,962 on 10-11; the 38-point drop is not from this session - one target = one query).

### 3.1 Summary now vs 2026-10-11 (and the 10-15 log: DA 11, BA 1, 64 linking domains)
| Metric | 2026-10-11 | **2026-10-26** | Delta |
|---|---|---|---|
| DA / PA / Spam Score (domain) | 10 / 28 / 16% | **11 / 29 / 16%** | DA +1, PA +1, spam same (Spam Score updated quarterly) |
| Linking root domains | 62 | **68** | **+6 new, 0 lost** |
| Discovered / lost, last 60 days (Aug 28 - Oct 26) | 58 / 0 | **22 / 0** | window rolled |
| Inbound link rows total / followed | 164 / 148 | **198 / 182** | +34 rows, all followed PBN (+12 rows on the 6 new domains, +22 www-duplicate rows on 11 existing PBN domains) |
| External links follow / nofollow | 90.2% / 9.8% | **91.9% / 8.1%** | |
| Spam score of linking domains | 98.2% in 1-30%, 1.8% in 61-100% | **98.3% in 1-30%, 0% in 31-60%, 1.7% in 61-100%** (8coint.com 61%) | |
| Linking domains where anchor = PBN advert sentence | 54 (146 links) | **60 (180 links)** (30 domains x 4 rows + 30 x 2 rows) | +6 domains / +34 links |
| All links land on | homepage | homepage (inner pages: 0 linking domains) | |

### 3.2 NEW linking domains since the last read (exactly SIX; none lost)
Dates are Moz "Date Found" (Discovered & Lost report). Four were found after 2026-10-15; two (found 10-09 / 10-11) only entered the index after our 10-11 read.
| Domain | DA | Linking-domain count | Spam | Found | Source URL | Anchor | Target | Followed? | Class |
|---|---|---|---|---|---|---|---|---|---|
| wecelebrities.com (www.) | 57 | 1,055 | 8% | 10/23/2026 | /all/1102/22.html "Boost your Google rankings with Premium PBN & Link Building" | "high quality dofollow backlinks da 50 pa 40 premium pbn network service form5472prep.com rank first page google fast seo link building buy backlinks online cheap" | homepage | **followed** (2 rows: direct + via redirect) | **PBN-advert spam** |
| nitinenterprises.shop | 19 | 90 | -- | 10/23/2026 | /all/1102/22.html (same title) | same PBN anchor | homepage | followed (2 rows) | **PBN-advert spam** |
| shanzytechs.site | 33 | 409 | -- | 10/19/2026 | /all/1102/22.html | same PBN anchor | homepage | followed (2 rows) | **PBN-advert spam** |
| sushimean.com | 57 | 808 | -- | 10/17/2026 | /all/1102/22.html | same PBN anchor | homepage | followed (2 rows) | **PBN-advert spam** |
| bestwebs123.site | 16 | 77 | -- | 10/11/2026 | /all/1102/22.html | same PBN anchor | homepage | followed (2 rows) | **PBN-advert spam** |
| emergencydentistinrichmondva.com (www.) | 60 | 181 | 1% | 10/09/2026 | /all/1102/22.html | same PBN anchor | homepage | followed (2 rows) | **PBN-advert spam** |
**GENUINE new links: NONE.** No new competitor link, no new auto stats page. Newest-first discovered list: wecelebrities.com 10/23, nitinenterprises.shop 10/23, shanzytechs.site 10/19, sushimean.com 10/17, bestwebs123.site 10/11, emergencydentistinrichmondva.com 10/09, currentchron.com 10/04, texturometer.com 09/29, form5472.ai 09/25 ... (everything from 10/04 back unchanged). **Lost links: none** (Total Lost -0).
Note: the PBN reseller added ~1 new domain every 2-3 days (6 in 14 days); the new ones are lower-DA throw-away TLDs (.site/.shop, DA 16-33) as well as DA 57-60 sites.

### 3.3 Other link-row changes on EXISTING domains
- **+22 followed PBN rows = 11 existing PBN domains now show a www./non-www duplicate row-pair** (30 hosts with 4 rows now vs 19 on 10-11; 30 hosts with 2 rows vs 35). Same network, same anchor, same target - no new domain.
- Auto stats/report pages unchanged: drjack.world/report/139402, quero.party/report/139402, atomizelink.icu/report/139401, dailymusings.top/stats/139402 + /stats/139401, optimizeflow.top/stats/139401, 8coint.com/list.php?part=2026/05/22/59 (14 nofollow rows, all anchor "form5472prep.com"; 8coint spam 61%).
- Competitors: form5472.online (DA now 15, spam 11%, followed) still links from `/post/form-5472-filing-services-compared-credentials-reviews-pricing-evidence` with anchor "form5472prep.com"; form5472.ai (DA 14, 3%) still nofollow on `/providers`. Unchanged.
- DA/LD refreshes on PBN domains (cvillico.com DA 64 / 689 LDs, cmocheatsheets.com 62 / 811, mylisthero.com 62 / 380, mymarketpost.com 61 / 496, wioutlet.com 61 / 321): metric noise.

### 3.4 Classification of all 68 linking domains
| Class | Domains | Link rows | Followed |
|---|---|---|---|
| PBN-advert spam (`/all/1102/22.html`, premium-PBN anchor) | **60** (was 54) | 180 (was 146) | all followed |
| Automated report/stats pages (drjack.world, quero.party, atomizelink.icu, dailymusings.top, optimizeflow.top; + 8coint.com "High-quality backlink service", spam 61%) | 6 | 14 | all nofollow |
| Competitor editorial (form5472.online followed, form5472.ai nofollow) | 2 | 4 | 2 followed rows (form5472.online), 2 nofollow |
| **Genuine / earned (non-competitor, non-spam)** | **0** | 0 | |
Rows: 180 + 14 + 4 = 198. 60 + 6 + 2 = 68. **We still have zero earned links**; DA rose 10 -> 11 purely from the PBN rows.

---

## 4. Brand Authority (Domain Overview; 3 of 3 DO queries used: form5472prep.com, doola.com, form5472.online; quota 80 -> 77 of 100)
| Metric | form5472prep.com 10-11 -> **10-26** | form5472.online 10-11 -> **10-26** | doola.com 10-07 -> **10-26** | firstbase.io |
|---|---|---|---|---|
| Brand Authority | 1 -> **1** | 1 -> **1** | 28 -> **28** | 28 (10-07; **not re-pulled**, DO cap) |
| Domain Authority | 10 -> **11** | 16 -> **15** | 38 -> **39** | 37 (10-07) |
| Page Authority (homepage) | 28 -> **29** | 33 -> **33** | 49 -> **49** (www.doola.com PA 50) | 47 (10-07) |
| Linking root domains | 62 -> **68** | 282 -> **308** (+26; discovered 68 / lost 4 in 60 d) | ~4.6k -> **4.6k** (discovered 491 / lost 374 in 60 d) | ~1.9k (10-07) |
| Ranking keywords (US) | 80 -> **106** | 274 -> **272** (#1-3: 13 -> **15**; #4-10: 29 -> **26**) | ~7k -> **6.8k** (#1-3: 50; #4-10: 218) | ~3k (10-07) |
Notes:
- **BA has not moved for anyone**: both niche filers (us, form5472.online) are 1; the formation brands are 28. Our DA gap to form5472.online is now -4 (11 vs 15), down from -6 (10 vs 16) - we closed it by PBN rows, they lost 1 DA point.
- **form5472.online keeps the money keywords**: ranks #1 "form 5472 filing service" (KD 42), #2 "launchusa" (195 vol), #2 "form 5472 for cpas" (we: #92), #2 "late form 5472 filing service" (we: #21), #2 "form 5472 and pro forma 1120 filing service" (we: #11 for the "...instructions" variant). Its Moz search theme is "Foreign-Owned LLC Tax C..." (ours: International Tax Compliance). Top search competitors: irs.gov (321.6k kw, DA 92), launchusaonline.com (54 kw, DA 12), sdocpa.com (14.1k kw, DA 30). Anchor profile now: our same PBN sentence (60 domains / 180 links - the identical 60/180 network as ours), "premium twinsalgo.com backlinks designed to increase google search visibility" (**23 domains / 23 links, was 7**), naked "https://www.form5472.online/" (177 domains / 216 links), "form5472.online/launchusa" (6 / 20), "form5472.online" (4 / 16).
- doola.com Domain Overview "Competition" panel returned "We are experiencing issues finding data for this domain" (no competitor BA); search theme Cross-Border Business Formation. firstbase.io not queried (3-query cap).

---

## 5. What was NOT obtainable / limits
1. **Oct 26 AI collection not in** (banner: "Data as of Oct 19, 2026. Next data collection: Monday, Oct 26, 2026"; today is Oct 26) - re-read tomorrow for a 4th point.
2. **Perplexity has NOT been collected since Oct 5** (no Oct 12 / Oct 19 rows in `metrics.fetch`; 23 of 40 prompts never collected). Perplexity trend / gain-loss impossible; all Perplexity numbers are Oct 5.
3. **Per-prompt Oct 12 table not retrievable** (Moz keeps only the latest response per prompt; `responses.fetch` ignores date params). Gain/loss vs Oct 12 is aggregate only; per-prompt gain/loss is shown against Oct 5 (18 shared prompts).
4. **Moz ChatGPT data quirks**: 36 vs 40 response denominator (4 unprocessed rows that name us), 0 ChatGPT citations returned (breakdown total 0), inline ChatGPT source chips ("Form5472 Prep +1") carry no URL, so our ChatGPT URL citations are a lower bound; AI Mode citations include 50 `google.com/goto?url=` wrappers with only a page title (destination domain unknown).
5. Sentiment: loads now (ChatGPT score 47.6, others "insufficient confidence"); brand-level themes only exist for ChatGPT with 41 mentions - 1/3/37 pos/neg/neu is too small for trend work.
6. firstbase.io Brand Authority not re-pulled (Domain Overview cap = 3: us, doola.com, form5472.online); last known 28 / DA 37 (10-07). doola.com's competitor panel failed to load.
7. Moz Link Explorer "Date Found" is per linking domain only (rows for the 11 www-duplicate PBN additions have no first-seen date). Spam Score updates quarterly (16% unchanged).
8. Moz ranking-keyword list: retained keywords show no rank changes at all vs 10-11 (the refresh only added 27 rows and dropped 1), so rank movement cannot be read from it; the new /compare, /form-5472-statistics, /form-5472-example, /form-5472-instructions pages do not appear for any keyword (Moz lists ranks to #96).
9. The browser pane was resized to 1400x900 on tab-2 for the extraction (the app cleared it whenever the pane width changed); reset to desktop at the end. Nothing was exported, edited, saved or created in Moz; one tab (`tab-2`) used; no other tab touched.
