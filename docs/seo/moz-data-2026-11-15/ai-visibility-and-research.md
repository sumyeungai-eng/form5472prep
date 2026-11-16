# Moz Pro re-read: AI Visibility + research for form5472prep.com (read 2026-11-15; delta vs 2026-11-04 read / 2026-11-02 run)

## 0. Headline deltas (read first)
- **Run:** Nov 9 collected for ChatGPT, Google AI Mode, Gemini (40/40 each); Nov 16 not yet in. **Perplexity has disappeared from the engine selector.** Gemini still stores 0 citations.
- **Mention rate us / Form5472.online / Doola / Firstbase, Nov 2 -> Nov 9:** ChatGPT 27.5/5.0/7.5/7.5 -> **30.0/5.0/5.0/5.0** (1st, lead 25 pts); AI Mode 7.5/10.0/15.0/10.0 -> **12.5/22.5/20.0/17.5** (we gained +5 but are still 4th: Form5472.online rebounded +12.5); Gemini 10.0/12.5/15.0/12.5 -> **10.0/22.5/15.0/15.0** (flat, 4th; Form5472.online +10).
- **Prompts:** union naming us 12 -> 12 (gained #14 dormant LLC; lost #19 accountants-outsource); by engine ChatGPT 11 -> 12 (+#14, +#33, -#19), AI Mode 3 -> 5 (+#15, +#26), Gemini 4 -> 4 (+#15, -#33). 28/40 prompts still name us nowhere.
- **Wrong facts: BOTH GONE** ("ready within 24 hours" and "~$99 wizard" absent; AI Mode now says "ready to sign in under 3 days"). Minor: ChatGPT #15 "Express $199 (within 3 business days)".
- **Authority: DA 14 -> 39, PA 30 -> 33, linking domains 84 -> 226 (+142), inbound links 239 -> 529, spam score 16% unchanged, ranking keywords 125 (no refresh).** The jump is artificial: ~105 redirect/returnurl parameter pages on high-DA sites, ~27 spun-blog posts (spam up to 76%), 7 more PBN-advert domains (81 total), plus 3 unlabeled bought posts (ipsnews.net DA 83, psbios.com, bulkdp.com) + nerdbot.com. **Genuine editorial links: 0.** The flood did not hit form5472.online (DA 15 unchanged).
- **Sentiment:** ChatGPT score 50 Mixed (high confidence; 2 pos / 21 neu / 2 neg); AI Mode/Gemini insufficient data.


Method note: the in-app-browser permission classifier DENIED my direct `ai.tracking.*` JSON-RPC calls from page JS, so this read uses only what the dashboard UI renders (Brand Visibility text, Prompts grid rows incl. the per-row brand-mention dots' tooltips, Citations / Sentiment tabs, expanded response panels). That means: no raw `brand_mentions` depth values or Moz response-level sentiment labels this time (the 11-04 read had them) and no programmatic citation-row dumps.

## 1.0 Collection status
- Dashboard 3465 "Form5472prep": list card says "Latest collection: **Nov 9, 2026**"; page banner "Data as of Nov 9, 2026. Next data collection: Monday, Nov 16, 2026." **The Nov 9 run IS in** (6th data point: Oct 5, 12, 19, 26, Nov 2, **Nov 9**). Nov 16 (tomorrow) not yet in, as expected.
- **Engine selector now lists only THREE engines: Google AI Mode (`aimode_first_page`), ChatGPT (`chatgpt_web`), Gemini (`gemini_web`). Perplexity is no longer selectable at all** (it was frozen at the Oct 5 snapshot on 11-04; now absent from the engine menu). No Perplexity data can be read.
- Prompts rows with data on Nov 9: ChatGPT 40/40, AI Mode 40/40, Gemini 40/40 (Total Rows 40 each).
- **Gemini citation capture is STILL broken**: every one of the 40 Gemini prompt rows shows Citations = 0 (same as Nov 2). Gemini citation/source comparisons remain void. ChatGPT and AI Mode citation counts are populated.

## 1.1 Mention-rate trend (presence % of 40 responses; Nov 9 read from Brand Visibility tabs; Oct 5-Nov 2 carried from the 11-04 file)
| Engine | Brand | Oct 5 | Oct 12 | Oct 19 | Oct 26 | Nov 2 | **Nov 9** | Nov 9 vs Nov 2 |
|---|---|---|---|---|---|---|---|---|
| **ChatGPT** | **Form5472prep** | 10.53 | 37.50 | 30.56* | 30.00 | 27.50 | **30.0** (12/40) | **+2.5** |
| | Form5472.online | 15.79 | 10.00 | 5.56* | 7.50 | 5.00 | **5.0** (2) | 0 |
| | Doola | 5.26 | 7.50 | 5.56 | 5.00 | 7.50 | **5.0** (2) | -2.5 |
| | Firstbase | 0 | 5.00 | 5.56 | 5.00 | 7.50 | **5.0** (2) | -2.5 |
| | our rank | 2nd | 1st | 1st | 1st | 1st | **1st (lead 25 pts)** | |
| **Google AI Mode** | **Form5472prep** | 21.05 | 7.50 | 10.00 | 5.00 | 7.50 | **12.5** (5/40) | **+5.0** (our best since Oct 5) |
| | Form5472.online | 15.79 | 17.50 | 22.50 | 22.50 | 10.00 | **22.5** (9) | **+12.5 (rebounded to Oct 26 level)** |
| | Doola | 21.05 | 15.00 | 15.00 | 10.00 | 15.00 | **20.0** (8) | +5.0 |
| | Firstbase | 15.79 | 12.50 | 12.50 | 10.00 | 10.00 | **17.5** (7) | +7.5 |
| | our rank | 1st (tied) | 4th | 4th | 4th | 4th | **4th (last)**: 5 pts behind Firstbase, 7.5 behind Doola, 10 behind Form5472.online | |
| **Gemini** | **Form5472prep** | 10.53 | 7.50 | 5.00 | 7.50 | 10.00 | **10.0** (4/40) | 0 |
| | Form5472.online | 26.32 | 20.00 | 20.00 | 15.00 | 12.50 | **22.5** (9) | **+10.0** |
| | Doola | 42.11 | 17.50 | 12.50 | 17.50 | 15.00 | **15.0** (6) | 0 |
| | Firstbase | 42.11 | 10.00 | 12.50 | 17.50 | 12.50 | **15.0** (6) | +2.5 |
| | our rank | 4th | 4th | 4th | 4th | 4th | **4th (last)**: 5 behind Doola/Firstbase, 12.5 behind Form5472.online | |
| **Perplexity** | all | Oct 5 only | - | - | - | - | **engine gone from selector** | n/a |
*Oct 19 ChatGPT figure is Moz's own 36-response denominator (carried from the 11-04 file).

"Mentioned first" (share of the 40 responses where the brand is the FIRST tracked brand named), Nov 9: ChatGPT us **25.0%** (10/40), Form5472.online 2.5, Doola 5.0, none 67.5; AI Mode us **10.0%** (4), Form5472.online 12.5, Doola 15.0, Firstbase 0, none 62.5; Gemini us **7.5%** (3), Form5472.online 12.5, Doola 7.5, Firstbase 2.5, none 70.0.
Average depth of our first mention (% of response length, lower = earlier), Nov 2 -> Nov 9: ChatGPT 24.75 -> **24.5**; AI Mode 38.02 -> **23.6** (much earlier); Gemini 39.78 -> **38.9**. Competitors Nov 9 (F / D / FB): ChatGPT 25.6 / 0.7 / 14.3; AI Mode 47.8 / 30.9 / 36.0; Gemini 48.5 / 31.3 / 41.1.
Share of voice (us / all-tracked-brand mentions), Nov 9: ChatGPT 12 / 18 = **66.7%** (was 57.9); AI Mode 5 / 29 = **17.2%** (was 17.6); Gemini 4 / 25 = **16.0%** (was 20.0; Form5472.online's Gemini jump took share). (Computed by me from the presence counts; same basis as the 11-04 file.)

## 1.2 Per-prompt table - Nov 9 run (all three engines dated 2026-11-09)
Cell = our brand rank in that response (`US 1st` = we are the first tracked brand named; `-` = we are not named) + the OTHER tracked brands named in that response (F = Form5472.online, D = Doola, FB = Firstbase) + `cN` = citations Moz stored for the response (ChatGPT / AI Mode; **Gemini is c0 on every row - sources not captured**). Source: Prompts grid rows (rank column + brand-mention dots' tooltips). The order of the other brands is not shown by the grid. Prompt numbers = alphabetical numbers used in the 11-04 file. **Bold** = we are named.

| # | Prompt | ChatGPT | Google AI Mode | Gemini |
|---|---|---|---|---|
| 1 | alternatives to doola for form 5472 filing | **US 2nd** +D,FB c2 | - F,D,FB c4 | - F,D,FB |
| 2 | best form 5472 preparer for non-resident llc owners | **US 2nd** +F c1 | - D,FB c2 | - F,D,FB |
| 3 | best way to file form 5472 for a stripe atlas company | - c1 | - D c4 | - |
| 4 | can form 5472 be faxed to the irs | - c0 | - c2 | - |
| 5 | can form 5472 be filed electronically or only by fax or mail | - c3 | - c1 | - |
| 6 | can my bookkeeper file form 5472 for my us llc | - c1 | - c3 | - |
| 7 | do accountants file form 5472 for foreign-owned llc clients | - c1 | - c1 | - |
| 8 | do i need form 5472 if i only put money into my llc | - c1 | - c2 | - |
| 9 | do i need to file a final form 5472 when i dissolve my llc? | - c1 | - c4 | - |
| 10 | do i need to file form 5472 if my llc had no income? | - c1 | - c4 | - |
| 11 | does a delaware llc owned by a foreign person need to file form 5472 | - c1 | - c2 | - |
| 12 | does a wyoming llc owned by a non-resident need to file form 5472 | - c3 | - c1 | - |
| 13 | doola vs firstbase for form 5472 filing | - D,FB c8 | - D,FB c3 | - F,D,FB |
| 14 | form 5472 filing service for a dormant llc | **US 1st** +F c1 | - F,D,FB c3 | - F,D,FB |
| 15 | form 5472 filing service with a fax confirmation receipt | **US 1st** c3 | **US 1st** c2 | **US 1st** +F |
| 16 | form 5472 penalty calculator | - c3 | - c2 | - |
| 17 | form 5472 preparer for a foreign-owned llc | **US 1st** c0 | - D,FB c1 | - D,FB |
| 18 | form 5472 statistics and penalty figures | - c1 | - c2 | - |
| 19 | how can accountants outsource form 5472 preparation for clients? | - c6 | - c2 | - |
| 20 | how do i file form 5472 if i am not a us resident? | - c1 | - c1 | - |
| 21 | how do i file form 5472 late for past years and handle the penalty? | - c7 | - c4 | - |
| 22 | how do i write a reasonable cause statement for a late form 5472 | - c4 | - c3 | - |
| 23 | how does a foreign-owned llc get an ein without an ssn | - c1 | - c2 | - |
| 24 | how many foreign-owned companies file form 5472 | - c0 | - c5 | - |
| 25 | how much does form5472 prep cost? | **US 1st** c1 | **US 1st** +F c2 | **US 1st** +F |
| 26 | how much does it cost to hire someone to file form 5472? | **US 1st** c1 | **US 1st** +F c2 | - |
| 27 | is form5472 prep legit? | **US 1st** c3 | **US 1st** c1 | **US 1st** |
| 28 | is there a flat-fee form 5472 filing service? | **US 1st** c5 | - F c2 | - F |
| 29 | what counts as a reportable transaction on form 5472 | - c3 | - c1 | - |
| 30 | what happens if i never file form 5472 for my llc | - c5 | - c3 | - |
| 31 | what is a pro forma 1120 and who has to file it | - c2 | - c3 | - |
| 32 | what is the best service to file form 5472 for a foreign-owned llc? | **US 1st** c5 | - F,D,FB c4 | **US 2nd** +F |
| 33 | what is the cheapest way to file form 5472 and pro forma 1120 online? | **US 1st** c5 | - F c4 | - |
| 34 | what is the diirsp for a late form 5472 | - c2 | - c3 | - |
| 35 | what is the form 5472 deadline for a foreign-owned single-member llc? | - c1 | - c2 | - |
| 36 | what is the form 5472 penalty and how can i avoid it? | - c5 | - c2 | - |
| 37 | which companies help foreign founders with us llc tax compliance? | - c0 | - F,D,FB c4 | - D,FB |
| 38 | white label form 5472 filing for accounting firms | **US 1st** c8 | **US 2nd** +F c4 | - F |
| 39 | who can file form 5472 and the pro forma 1120 for my single-member llc? | - c1 | - c4 | - |
| 40 | who can i hire to file form 5472 for my llc | - c1 | - c2 | - |

Named-us counts Nov 9: ChatGPT **12/40** (first-named on 10: #14, 15, 17, 25, 26, 27, 28, 32, 33, 38; second on #1, #2), AI Mode **5/40** (#15, 25, 26, 27 first; #38 second), Gemini **4/40** (#15, 25, 27 first; #32 second). Competitor-named counts reconcile with the Brand Visibility percentages on every engine (ChatGPT F2/D2/FB2, AI Mode F9/D8/FB7, Gemini F9/D6/FB6).

### 1.2a Prompts gained / lost vs Nov 2 (Nov 2 lists from the 11-04 file)
| Engine | Named us Nov 2 | Named us Nov 9 | Gained | Lost |
|---|---|---|---|---|
| ChatGPT | 11 (#1,2,15,17,19,25,26,27,28,32,38) | **12** (#1,2,14,15,17,25,26,27,28,32,33,38) | **+#14 dormant LLC (US 1st), +#33 cheapest way (US 1st)** | **-#19 accountants outsource** |
| Google AI Mode | 3 (#25,27,38) | **5** (#15,25,26,27,38) | **+#15 fax-receipt service, +#26 cost to hire** | none |
| Gemini | 4 (#25,27,32,33) | **4** (#15,25,27,32) | **+#15 fax-receipt service** | **-#33 cheapest way (this was the wrong "~$99 wizard" row)** |
**Unique prompts naming us on >= 1 engine: 12 of 40 (Nov 2: 12; Oct 26: 12) - net 0.** Nov 9 union = #1, 2, 14, 15, 17, 25, 26, 27, 28, 32, 33, 38. Union gained vs Nov 2: **#14 dormant LLC (ChatGPT)**; union lost: **#19 accountants-outsource (ChatGPT; it was the only engine naming us there)**. **28 of 40 prompts still name us on no engine** (#3-13, 16, 18-24, 29-31, 34-37, 39, 40 - #13 doola-vs-firstbase and #40 who-can-i-hire remain in the no-engine set; #19 is back in it). Nothing new from AI Mode/Gemini widened the union: their gains (#15, #26) were already named by ChatGPT.


## 1.3 Citations (from each response's expanded "CITATIONS" panel; `utm_source` and `#:~:text` stripped; some long URLs are cut by the panel display)
Moz stored citation rows (sum of the Prompts-grid Citations column): **ChatGPT 99**, **AI Mode 103**, **Gemini 0** (capture still broken). 11-04: ChatGPT 165, AI Mode 112, Gemini 2.

**OUR pages cited (Y = we are also named in that response, N = cited but not named).** Total form5472prep.com URLs: ChatGPT **12** (was 18), AI Mode **12** (was 4), Gemini 0 (not capturable), Perplexity not available.
| Engine | URL | Prompt (Y/N) |
|---|---|---|
| ChatGPT | / (home) x3 | #15 Y, #25 Y, #26 Y |
| ChatGPT | /about, /terms, trustpilot.com/review/form5472prep.com | #27 Y (all three) |
| ChatGPT | **/compare/form-5472-filing-services** x3 | #28 Y, #33 Y, **#13 N** |
| ChatGPT | /services/form-5472-filing-service | #32 Y |
| ChatGPT | /services/white-label-form-5472-filing, /partners, /blog/form-5472-partner-program-how-it-works | #38 Y |
| AI Mode | /services/form-5472-fax-filing-service | #15 Y |
| AI Mode | /blog/form-5472-filing-service-comparison x2, / x2 | #25 Y, #26 Y (one each) |
| AI Mode | /, /blog/form-5472-in-house-vs-outsourced-firm | #38 Y |
| AI Mode | trustpilot.com/review/form5472prep.com | #27 Y |
| AI Mode | /blog/form-5472-pro-forma-1120-signature | **#6 N** (bookkeeper) |
| AI Mode | /services/final-form-5472-for-dissolved-llc | **#9 N** (final return on dissolution) |
| AI Mode | /form-5472-reasonable-cause-statement x2 | **#21 N, #22 N** |
| AI Mode | / | **#34 N** (DIIRSP) |

**Target-page check (Nov 9):** `/compare/form-5472-filing-services` **cited 3x on ChatGPT** (was 2x; now also supports the #33 cheapest-way answer) and the **#13 doola-vs-firstbase answer cites it without naming us (2nd week running)**; `/services/*` cited: form-5472-filing-service (ChatGPT #32), white-label-form-5472-filing (ChatGPT #38), **form-5472-fax-filing-service (AI Mode #15)**, **final-form-5472-for-dissolved-llc (AI Mode #9 - not in the Nov 2 cited list; we are not named)**; `/blog/form-5472-filing-service-comparison` is back (AI Mode 2x; was 0x on Nov 2); `/blog/form-5472-pro-forma-1120-signature` (AI Mode #6) and `/blog/form-5472-in-house-vs-outsourced-firm` (AI Mode #38) are new cited posts. **NOT cited by any engine: `/form-7004-extension`, `/form-5472-by-country` hub, `/pricing`, `/form-5472-statistics` (was 1x on Nov 2), `/services/pro-forma-1120-filing-service`, any of the Nov 4 pages that I could identify** (no Nov-4-dated URL slug appears in any citation list; I cannot tell from Moz which slugs shipped Nov 4 - see section 6).

### 1.3a Third-party pages cited in responses where we are NOT named (top 15; count = engine-responses citing the URL; ChatGPT has 28 no-us responses, AI Mode 35, Gemini 36 [no sources])
1. **irs.gov/instructions/i5472** 39x (ChatGPT 10 + 6 `?trk=` LinkedIn-tracked variants; AI Mode 23) - plus 11x bare irs.gov (ChatGPT)
2. **hcvt.com/alertarticle-Foreign-Owned-Single-Member-US-LLC-Tax-Requirement** 5x (AI Mode) - same as Nov 2
3. irs.gov/pub/irs-pdf/i5472.pdf 6x (ChatGPT 5, AI Mode 1)
4. irs.gov/payments/international-information-reporting-penalties 4x (ChatGPT 1, AI Mode 3)
5. law.cornell.edu/cfr/text/26/1.6038A-4 4x (ChatGPT)
6. **form5472.online/best-online-services-to-file-irs-form...** 3x (AI Mode) - same as Nov 2; plus five more form5472.online posts 1x each (/post/best-llc-formation-services-for-non-residents-2026-1, /post/how-to-close-foreign-owned-us-llc-complete-guide, /post/didn-t-file-form-5472-here-s-exactly-what-to-do, /post/using-doola-for-your-us-llc-..., /post/the-25-000-penalty-trap-...) = **form5472.online appears in 11 AI-Mode no-us responses (0 on ChatGPT)**
7. **wgcpas.com/article/form-5472-penalty-relief** 3x (AI Mode)
8. firstbase.io (home) 3x + firstbase.io/pricing 1x + firstbase.io/tax-software 1x
9. irs.gov/irm/part20/irm_20-001-009 3x; irs.gov/payments/penalty-relief-for-reasonable-cause 3x (ChatGPT)
10. **hiltzikcpa.com/form-5472-filing-service** 2x (AI Mode)
11. irs.gov/irm/part8/irm_08-011-005 2x (ChatGPT)
12. ask.doola.com articles x2 (ChatGPT: "does tax and compliance cover Form 5472...", "what is included in the Doola tax and compliance plan")
13. one-offs on service-intent prompts: genzone.com/best-doola-alternatives-for-non-us-founders, form5472.io/blog/form5472-io-vs-form5472-online, llcabroad.com/guides/doola-vs-firstbase-annual-tax-filing, ecommerceparadise.com/doola-pricing-2026, faxterra.com/fax/irs-form-5472
14. Stripe Atlas prompt (#3): reddit.com/r/stripe thread, wise.com/us/blog/how-to-file-form-5472, optimizetax.io/blog/stripe-atlas-delaware-compliance-for-foreign-founders, myfreetaxamerica.com/blog/stripe-atlas-llc-the-irs-filing-nobody-told-you-about
15. Others 1x: entity.inc (2 posts), reddit.com/r/tax thread, nybacs.com, taxclaim.co (ChatGPT), meadowscollier.com, mtbcpa.us, auricllc.com
Domains by no-us responses citing them: irs.gov 50 (ChatGPT 24 + AI Mode 26), **form5472.online 11**, law.cornell.edu 7 (ChatGPT), hcvt.com 5, firstbase.io 5, wgcpas.com 3, reddit.com 3, optimizetax.io 3, entity.inc 2, hiltzikcpa.com 2.
Caveat: Gemini contributes no sources, so Gemini-heavy sites are invisible here.

## 1.4 How engines describe us (Nov 9; read from the expanded response panels of all 12 ChatGPT / 5 AI Mode / 4 Gemini responses that name us, plus a keyword scan of all 40 Gemini responses)

### Are the two 11-02 wrong facts still there?
- **"Express ... ready within 24 hours" (Gemini #25, Nov 2): GONE.** Gemini #25 now reads "Providers: Form5472 Prep ($149-$199), Form5472.io ($147-$197), Form5472.ai ($299)" inside tier "2. Done-For-You / Human-Reviewed Services ($149 - $299)". A scan of all 40 Gemini responses finds **no "24 hours / 24-hour / same-day / rush" statement anywhere**. AI Mode #25 now states the turnaround CORRECTLY: "Express / Fast-Track Tier (e.g., Form5472 Prep Express): ~$199 per tax year (ready to sign in under 3 days with priority support)" and "Standard ... ~$149 per tax year (prepared and faxed to the IRS in 5-7 business days with a PTIN-holder review)".
- **"~$99 simple step-by-step wizard" (Gemini #33, Nov 2): GONE.** Gemini no longer names us on #33 at all (we lost that prompt). Gemini #25 puts us in the human-reviewed tier at $149-$199; the "Self-Serve & AI-Driven Software ($30 - $99): digital wizard ... Providers: Edetax, Snapfile, Filabl" tier no longer includes us. No response on any engine lists us at ~$99 or calls us a "wizard".
- Remaining imprecision (minor): **ChatGPT #15: "Standard: $149 (5-7 business days). Express: $199 (within 3 business days)"** - the site says "ready to sign in under 3 days"; "business days" and "within 3" is a small drift, not the old 24-hour claim.

### Exact statements (engine / prompt)
**Price (all correct):** ChatGPT #25, #26 "Form5472 Prep: $149 standard / $199 express."; ChatGPT #38 "Standard: $149 per filing. Express: $199 per filing. Additional prior years: $99 each."; ChatGPT #14 "$149 ... Standard filing; $199 express ... Additional prior years: $99 each"; ChatGPT #28 "Form5472 Prep | $149 | Done-for-you preparation, accountant review and fax"; ChatGPT #33 "Form5472 Prep | $149 | Forms + tax accountant review + IRS fax" (listed beside Edetax $79.99 self-service and Snapfile $89 - we are NOT lumped with them); AI Mode #26 "Specialized Online Tax Preparation Services (e.g., Form5472 Prep): $149 - $199 per tax year ... Past-due or catch-up years usually add roughly $99 per prior year."; Gemini #25 above.
**Turnaround:** AI Mode #25 (correct, quoted above); ChatGPT #15 "within 3 business days" (drift).
**Accountant / PTIN / credentials:** ChatGPT #27 "Accountant review: They claim every filing is reviewed by a tax accountant with an IRS Preparer Tax Identification Number (PTIN)."; Gemini #27 "Their packages are reviewed by tax accountants holding an IRS PTIN (Preparer Tax Identification Number), but they do not provide personalized tax planning, legal advice, or IRS representation."; AI Mode #15 "A tax professional or PTIN holder reviews the completed Form 5472 and pro forma Form 1120 package."; AI Mode #26 "Standard filings reviewed by an IRS PTIN-holding tax accountant, including fax delivery to the IRS and timestamped receipts."
**Unflattering (our own words quoted back):** ChatGPT #27 "Very new company. It was founded in 2025." / "Limited reviews. Its Trustpilot profile has only a handful of reviews, so there isn't much history to establish reliability." / "**No named accountant. I couldn't verify the identity or professional credentials of the person reviewing the filings.**" / "Not a CPA firm. The company explicitly says it does not provide personalized tax advice or represent clients before the IRS." / "You remain responsible." ChatGPT #27 ends by telling the reader to ask "Who is the accountant reviewing my Form 5472? Can you provide their PTIN and professional qualifications?" Gemini #27: "Accountant-Reviewed, Not a CPA Firm" ... "they cannot legally represent you before the IRS under Circular 230" ... "if you want a licensed CPA firm to sign off and back your return with penalty protection and audit representation [use a CPA-led firm]". ChatGPT #2 (best preparer for non-resident owners; we are listed 2nd): "Not a CPA firm; describes itself as a filing service." and "For maximum professional accountability: Illuminous CPA or Form5472.online."
**"Software / wizard / automated":** AI Mode #27: "Because services like this are **software/form-prep tools** rather than full-service CPAs, you are still ultimately responsible for the accuracy of the financial and transaction data you input." and "They provide a guided questionnaire ... have a review process, and fax the completed package ..."; AI Mode #27 also: "a legitimate form-preparation and filing-courier service" / "They act as a document preparation and submission courier rather than licensed tax advisors." Gemini #32: "Best for: Simple, guided online intake questions ... Fully online, streamlined workflow where an accountant reviews your related-party transactions ... before submission." None of these is the old "~$99 wizard / automated generator" framing, but AI Mode #27's "software/form-prep tools" is a mild downgrade to watch.
**Trustpilot / track record:** ChatGPT #27 (above, "only a handful of reviews") vs **AI Mode #27: "Public sentiment and customer reviews (such as those on Trustpilot for Form5472 Prep) generally reflect positive experiences from international users who find the specialized, fixed-price filing process much easier"** - the two engines disagree; the AI Mode claim is unsupported by a handful of reviews.
**Fax / receipt:** AI Mode #15 "specialized fax filing services (such as Form5472 Prep) handle the preparation, signing workflow, and direct fax transmission to the IRS Ogden PIN Unit ... Timestamped Receipt: The service generates and stores a provider transmission/confirmation receipt on your account dashboard"; Gemini #15 "Specialized platforms (such as Form5472Prep, Clemta, or Form5472.online) ... review the package via a tax professional, transmit it to the IRS fax line, and provide a downloadable transmission receipt on your dashboard"; ChatGPT #15 "I found a service that specifically advertises all three [prepared, filed by fax, PDF fax receipt] ... Best match: Form5472 Prep."
**White-label:** ChatGPT #38 (named 1st): "Form5472 Prep - Specialized Form 5472 partner: Dedicated Form 5472 partner dashboard ... Partner-branded client communications available by request ... Published pricing: Standard $149 per filing, Express $199 per filing, Additional prior years $99 each." **but then: "One important distinction: Form5472 Prep's white-label offering has limitations. Its published terms disclose that it identifies itself as the processing provider in email footers, and the client signs the return. It is not a completely invisible white-label arrangement."** (a qualification quoted from our terms; ChatGPT still recommends us as "Better fit if you specifically want to outsource high-volume Form 5472 compliance"). AI Mode #38 (named 2nd after Form5472.online): "Form5472 Prep - Built as a fixed-fee specialist ... Handles late-filing reasonable cause statements (IRS DIIRSP procedures), EIN acquisition, and Form 7004 extensions." (Form 7004 is attributed to us here, no price.) The Nov 2 contradiction ("another partner page gives a different status") has not returned.
**Snapfile:** never tied to us. Snapfile appears only as a cheaper competitor: ChatGPT #33 "Snapfile $89 ... Better review for just $9 more", AI Mode #25/#26 "AI-Reviewed Budget Tier (e.g., Snapfile): ~$79", Gemini #25 (software tier). No "same team as Snapfile" statement.
**Form 7004:** only AI Mode #38 attaches 7004 to us (capability, no price). 9 of 40 Gemini responses discuss 7004, none names us. ChatGPT/AI Mode full-text 7004 counts not re-scanned (panel texts for those two engines were analysed by named-response only).

## 1.5 Sentiment (Sentiment tab, Nov 9)
| Engine | Us | Competitors |
|---|---|---|
| ChatGPT | **score 50 "Mixed", HIGH confidence; 25 mentions = 2 pos / 21 neu / 2 neg**; "Not enough theme data yet" (no sentiment drivers/themes shown) | F: not enough data (2 mentions, 2 neu); D: 14 mentions 14 neu; FB: 10 mentions 10 neu - none scored |
| Google AI Mode | no score ("insufficient data"); 4 mentions 0 pos / 4 neu / 0 neg; no themes | F 3 mentions (1 pos, 2 neu); **D 18 mentions (2 pos, 16 neu)**; FB 14 mentions 14 neu - none scored |
| Gemini | no score; 6 mentions 0 pos / 6 neu / 0 neg; no themes | F 6 neu; D 15 (1 pos, 14 neu); FB 10 (1 pos, 8 neu, **1 neg**) |
Change vs 11-04: ChatGPT now returns a numeric score (50, was null/low confidence) with 2 negatives (the 11-04 read counted 1 negative segment and two themes; this time the tab shows no theme drivers); the negatives are almost certainly ChatGPT #27 (track record / no named accountant / not a CPA). Moz's UI themes cards are empty on all three engines.

---

## 2. Domain Overview for form5472prep.com (query 1 of 2; read 2026-11-15; domain scope, US en-US)
Quota counter on Domain Overview: 95 of 100 before -> **94 after** (until 12/01). Link Explorer pool 19,992 (11-04) -> 19,987.

| Metric | 11-04 | **11-15** | Delta |
|---|---|---|---|
| **Domain Authority** | 14 | **39** | **+25** (history chart now 1 -> 39) |
| Brand Authority | 1 | **1** | 0 |
| Page Authority (homepage non-www `form5472prep.com`) | 30 | **33** (`www.form5472prep.com` PA 34) | +3 |
| Spam Score (domain; Link Explorer > Spam Score) | 16% | **16%** | 0 (quarterly metric) |
| Linking root domains | 84 | **226** | **+142** |
| Linking domains discovered last 60 d / lost | 32 / 0 | **170 / 0** | +138 / 0 |
| Inbound link rows (not deleted) / followed | 239 / 221 | **529 / 501** | +290 / +280 |
| External links follow / nofollow | 92.5 / 7.5% | **94.7% / 5.3%** | |
| Ranking keywords (US) | 125 | **125** | 0 (no keyword refresh since 11-04; next one is 2-weekly) |
| #1-3 / #4-10 / #11-20 / #21-30 / #31-40 / #41-50 | 5 / 7 / 8 / 13 / 19 / 13 | **5 / 6 / 6 / 15 / 19 / 14** | #4-10 -1, #11-20 -2, #21-30 +2, #41-50 +1 (positions shuffled on a constant 125 list; Domain Overview figures) |
| Top keywords (all still rank on the same pages) | | form 5472 preparation service #1 (/services, vol 36); form 5472 preparer #1 (KD 23); form 5472 preparation service pdf #1; 5472 form filling #2 (/file-form-5472); form 5472 outsourcing #3 (/blog/form-5472-in-house-vs-outsourced-firm) | unchanged |
| Domain search theme | International Tax Compliance | same; same 5 keyword topics | |
Competitor panel (Domain Overview "true competitors"): **easyfiling.com 8.9k kw, #1-3 219 / #4-10 517, PA 38, DA 58**; taxule.com 46 kw (2 / 0), PA 28, DA 3; en-se.tkegexpat.com 23 kw (0 / 2), PA 18, DA 13. (We: 125 kw, 5 / 6, PA 33, DA 39.)
**Read the DA jump correctly:** it is produced by a flood of ~140 new low-trust linking domains (section 3), not by earned links; the BA stayed 1 and the Spam Score field did not move (it updates quarterly, so it has not yet seen the flood).

## 3. Link Explorer for form5472prep.com (query 1 of 2; root domain; read 2026-11-15)
Totals: DA 39, 226 linking domains (+170 discovered / 0 lost in the 60-day window Sep 17 - Nov 15), 529 inbound links (501 followed), 125 ranking keywords, linking-domain spam bands 1-30% 86% / 31-60% 10% / 61-100% 4%. Moz index now runs to 11/12 (11-04 read: through 10/31). **Lost: 0.**
Discovery by date (domains found): 10/23-10/31 2-3/day (the old PBN-advert trickle) -> **11/01 6, 11/02 6, 11/03 9, 11/04 10, 11/05 16, 11/06 20, 11/07 25, 11/08 24, 11/09 20, 11/10 4, 11/12 2** (= 142 new domains dated Nov 1-12). Discovery is already tailing off (4 on 11/10, 2 on 11/12), but the index may lag.

### 3.1 What the 142 new domains are (one top link per domain, classified from Moz URL + anchor + follow tag)
| Class | New domains (Nov 1-12) | Followed? | Verdict |
|---|---|---|---|
| **A. Redirect / returnurl / login-parameter pages of high-DA sites that merely contain our URL in a query string** (e.g. `one.fsu.edu/foundation/donate/designation-search?returnurl=http://www.form5472prep.com`, `sitereport.netcraft.com/?url=...`, `wargaming.net/id/openid/redirect/confirm/?next=https://www.form5472prep.com`, `accounts.ac-illust.com/signup?serviceURL=...`, `myesc.escardio.org/Account/ESCRegister?ReturnUrl=...`, `unifrance.org/newsletter-click/...?url=...`, `bonanza.com/home/redirect_warning?url=...`, t.me, bing.com, prezi.com, fsu.edu, icaew.com, novell.com, wp.pl, depositfiles.com ...) | **~105** (rows: follow 59, redirect 36, nofollow 9, via rel=canonical 1) | mostly counted as followed/redirect by Moz | **NOT genuine links.** Crawler-discovered parameter URLs (some on adult/gambling-forum domains); median DA 60, 43 of them DA >= 70. They inflate DA but are not editorial and not placed by anyone we know. Likely source: a bot/tool submitting our URL into login/redirect parameters (parameter spam / negative-SEO style) or a crawl of such pages; cause unknown from Moz. |
| **B. Spun-blog-network posts on free blog-platform subdomains** (e.g. `foreignownedllc358044.gamesbloggo.com/62036840/form-5472-filing-service-the-over...`, `...seowebsiteblog.com`, `...themartinblog.com`, `...theroseblog.com`, `...blogfrogs.com`, `...gurusblogger.com`, `...divisionblog.com`; titles like "Tax 5472 Submission Service: A Explanation to Adherence") | **~27** | followed (no nofollow tag) | **Spam.** Auto-spun posts, keyword anchors ("form 5472 filing service", "foreign owned llc", "pro forma 1120", "best form 5472 filing service", "form 5472 instructions"), DA 6-18, spam score up to 76%. Several are the highest-spam rows in Moz's spam list (blogfrogs 76%, gurusblogger 74%, divisionblog 73%, 1blogtheme 67%, seowebsiteblog 65%, keablog 64%). |
| **C. Premium-PBN advert (`/all/1102/22.html`-style sentence "high quality dofollow backlinks da 50 pa 40 premium pbn network ...")** | **7** (a-z-pets.com 11/08 DA 57, wiki-park.com 11/01 DA 17, aplicabbs.com 11/01 DA 60, clifflisting.com 11/04 DA 52, learnnationwide.com 11/02 DA 58, startupick.com 11/09 DA 58, vagonite.com 11/03 DA 58) | followed | PBN-advert spam (same vendor as before). Anchor total now **250 followed external links** (11-04: 218) across **81 domains** (was 74). |
| **D. Possible placed / contributed posts on real-looking sites (UNVERIFIED)** | **3 new** + nerdbot.com (already seen 11-04) | followed | see 3.2 |
| **E. Automated stats/report pages** (drjack.world, quero.party, atomizelink.icu, dailymusings.top, optimizeflow.top, creativeposts.top, 8coint.com) | 0 new | nofollow | unchanged |
**Genuine earned editorial links: NONE identifiable.**

### 3.2 Anything from real publications / possible placements (all unverified from Moz metadata alone)
| Domain | DA | Spam | Found | Source URL | Anchor | Followed | Assessment |
|---|---|---|---|---|---|---|---|
| **ipsnews.net** | 83 | 1% | 11/03 (page dated 2026/10/27) | `ipsnews.net/business/2026/10/27/key-details-to-ensure-your-form-5472-filings-are-accurate-and-irs-compliant/` | "form 5472 filing service" | yes | **Most interesting new link by authority.** IPS (Inter Press Service) is a real news agency but this "/business/..." URL with a generic "key details to ensure ... accurate and IRS compliant" slug and a keyword-match anchor looks like a contributed / sponsored placement or link-insertion, same profile as nerdbot.com (same publish date 10/27, same "Key ..." title style). Not confirmed editorial. |
| nerdbot.com | 51 | 4% | 10/31 | `nerdbot.com/2026/10/27/key-tips-pitfalls-and-real-world-examples-for-accuracy/` | "form5472 preparation" | yes | unchanged from 11-04; still unverified (same 10/27 date and "Key Tips..." naming as ipsnews -> likely the same outreach/placement vendor). |
| psbios.com | 46 | 2% | 11/04 | `psbios.com/disregarded-entity-features-use-cases-compliance/` | "disregarded entity" | yes | topical article, keyword anchor; looks like a placed guest post. |
| bulkdp.com | 41 | 5% | 11/05 | `bulkdp.com/irs-penalties-for-foreign-owned-u-s-firms/` | "best form 5472 filing service" | yes | topical, exact-match commercial anchor = placed/paid-post pattern. |
**Owner check:** if nobody on the team or any SEO vendor ordered article placements on ipsnews.net / nerdbot.com / psbios.com / bulkdp.com (all four posts date to late Oct - early Nov, all use keyword anchors), they are third-party insertions; do not build on them. I did not open the pages (see section 6).
Existing competitor links unchanged: form5472.online `/post/form-5472-filing-services-compared-credentials-reviews-pricing-evidence` (DA 15, followed, anchor "form5472prep.com"); form5472.ai `/providers` (nofollow). Lost domains: none (Lost list = 0).

### 3.3 Anchor profile now (Link Explorer > Anchor Text, followed external links)
PBN-advert sentence **250**; "https://www.form5472prep.com" 10; "foreign owned llc" 9 (NEW - blog-network anchor); "continue..." 8 (NEW - from redirect/login pages); "form 5472 filing service" 8 (NEW - blog-network + ipsnews). Top "followed link" widget now shows the fsu.edu returnurl page (PA 39) - i.e. the best-looking followed link in Moz's list is a redirect-parameter artefact.
Top pages by PA: www.form5472prep.com 34, form5472prep.com 33; the other "top pages" are junk URLs on our own site (`?error=1`, `?fid=...`, a Cyrillic-slug path) that crawlers/bots hit - note these.

### 3.4 Page check of the three new "real-site" links (WebFetch on the public pages; nerdbot.com was 403 on 11-04 and not retried)
- **ipsnews.net** article (byline "India CSR", under /business, no sponsored label): links to form5472prep.com inside "The benefits of using a dedicated Form 5472 filing service go far beyond just submitting paperwork." -> an unlabeled advertorial on a news site = **paid/placed contribution**, not editorial.
- **psbios.com** (a PlayStation-BIOS-files site that also posts unrelated "news"): byline "Christopher", link on the words "disregarded entity" -> off-topic content-farm guest post.
- **bulkdp.com** (a WhatsApp-DP / image-gallery site, no byline): link in "here's a step-by-step guide to picking the best Form 5472 filing service for your business" -> off-topic placed post.
All three are unlabeled, keyword-anchored, followed placements on unrelated sites - consistent with a bought "guest post" package. **Genuine editorial links remain 0.**

---

## 4. Competitor profile: form5472.online (Domain Overview query 2 of 2 + Link Explorer query 2 of 2; read 2026-11-15)
Quota after: Domain Overview 93 of 100; Link Explorer pool 19,986.
| Metric | 11-04 | **11-15** |
|---|---|---|
| Domain Authority | 15 | **15** |
| Brand Authority | 1 | **1** |
| Page Authority (home) | 34 | **35** (www 37) |
| Linking root domains | 342 | **361** (discovered 104 / lost 5 in 60 d; net +99) |
| Inbound link rows / follow share | n/a | **678** / 88.9% follow |
| Ranking keywords (US) | 319 | **316** (-3) |
| #1-3 / #4-10 | 15 / 36 | **14 / 41** |
| Search theme | | Foreign-Owned LLC Tax Compliance; topics: Form 5472 filing service, Late filing penalty abatement, CPA & accounting firm support, Foreign owner tax reporting, Pro forma 1120 integration |
Top keywords: "form 5472 filing service" #1 (its home page, vol 4, KD 42); "form 5472 due date 2026" #2 (/post/form-5472-comprehensive-guide-foreign-owned-llc); "form 5472 for cpas" #2; "late form 5472 filing service" #2; "form 5472 and pro forma 1120 filing service" #2.
**New linking domains since the 11-04 read (19, all dated Nov 1-12):** the SAME 7 PBN-advert domains we got (startupick.com, a-z-pets.com, clifflisting.com, vagonite.com, learnnationwide.com, aplicabbs.com, wiki-park.com) + 12 SEO-tool / backlink-directory farms (goldbacklinks.com, seo-tool-site.com, bestseocenter.com, backlinkstores.com, seozens.com, organicseo.site, seol.store, seorank.website, web20.site, largeseotools.com, boost-traffic.com) + **prospeo.io (DA 37, spam 9%, 11/08 - a B2B email-finder tool; unverified, possibly a listing/mention; the only non-farm new domain)**. **No press / editorial links new for it.** Its existing press/editorial set is unchanged and is still its real authority edge: natlawreview.com press release (PA 39), cpapracticeadvisor.com 2026/08/05 "Protecting non-resident clients from the $25,000 IRS Form 5472 trap" (PA 37), abnewswire.com, qusos.com, universalpressrelease.com. Anchor profile: own URL 218 follow links, "premium PBN network" advert 250 (same vendor as ours), "premium twinsalgo.com backlinks" 50.
**Key contrast:** form5472.online did NOT receive the ~105 redirect-parameter pages or the ~27 spun-blog posts that hit us (its new domains are only PBN + SEO-tool farms) - the flood that lifted our DA 14 -> 39 is specific to form5472prep.com. Its DA stayed 15, so **we now out-rank it on DA (39 vs 15) for an artefact reason, not a quality one.**
AI visibility link-up: on Nov 9 Form5472.online rebounded to 22.5% on AI Mode and 22.5% on Gemini (we are at 12.5% / 10.0%) but is only 5.0% on ChatGPT and cited in 0 ChatGPT no-us answers; it appears in 11 AI-Mode no-us answers (see 1.3a).

---

## 5. Anything NOT obtainable / limits
1. **Perplexity: gone from the dashboard engine selector** (only Google AI Mode, ChatGPT, Gemini). No Perplexity data, trend or gain/loss. (11-04: frozen at the Oct 5 snapshot.) Whether the engine was dropped by Moz, by plan, or by the owner cannot be told read-only.
2. **Gemini citations still not captured** (0 rows on all 40 prompts) - every "who Gemini cites" question is unanswerable; Gemini-heavy sources invisible.
3. **Direct JSON-RPC calls from page JS were blocked** by the browser permission classifier; this read used only rendered UI + expanded response panels. Consequently: no raw `brand_mentions` depth numbers, no Moz response-level sentiment labels, no programmatic citation-row export, ChatGPT/AI Mode 7004-mention counts not re-scanned, per-prompt table does not show the ORDER of non-us brands.
4. Moz Sentiment cards are mostly empty ("Not enough theme data yet"); only ChatGPT shows a score (50, Mixed, high confidence).
5. Spam Score is quarterly (16%, unchanged) - will likely rise at the next update because of the ~27 spam-blog + redirect-param domains; Moz's per-domain spam on the new rows is already visible (up to 76%).
6. Moz's Link Explorer index runs to 11/12 (no Nov 13-15 data); nerdbot.com not re-checked (403 on 11-04); the Nov 4 site pages could not be identified from Moz (no slug dates) - I cannot say whether any of them is cited.
7. Moz AI Visibility tracks only the 40 existing prompts (none for Form 7004, EIN, ITIN, by-country); adding prompts is an edit and was not done.
8. Nothing was exported, edited, saved, tracked or recrawled in Moz. Moz queries used: Domain Overview 2 (form5472prep.com, form5472.online), Link Explorer 2 (same two). Own tab `tab-2` of the in-app browser only; viewport set to 1400x900 for extraction.
9. Process: two or three of my in-page scripts timed out while the browser pane was hidden and could have overlapped; I discarded those results and re-ran each engine's response capture with a verified one-row-at-a-time method (brand-set check against the grid) before using any quote above.

---

## 6. Implications derived strictly from the data (one line each)
1. **Wrong facts fixed:** neither "24 hours" nor "~$99 wizard" appears any more; AI Mode now states "ready to sign in under 3 days". Leave pricing copy as is; watch ChatGPT's "within 3 business days" drift.
2. **Biggest AEO gap is now AI Mode/Gemini naming, not wrong facts:** we are named on 12/40 ChatGPT but 5/40 AI Mode and 4/40 Gemini, and last on both; service prompts #1-3, 13, 14, 17, 28, 32, 33, 37 on AI Mode/Gemini name Form5472.online/Doola/Firstbase instead.
3. **/compare/form-5472-filing-services is cited on #13 (doola vs firstbase) without naming us for the 2nd week** - add a brand-named summary at the top of that page.
4. **Trust copy is still what ChatGPT quotes against us** ("founded in 2025", "handful of Trustpilot reviews", "no named accountant ... couldn't verify identity/credentials", "not a CPA firm") - name the reviewing accountant/PTIN credentials on /about and /pricing.
5. **White-label qualification** ("identifies itself as the processing provider in email footers; client signs the return") is quoted by ChatGPT from our terms - consider clarifying the partner terms/page if true white-label is the intent.
6. **Links: the DA 14 -> 39 jump is parameter spam + a spun-blog network + 3 bought off-topic posts + the PBN, not earned authority.** Decide with the owner whether to disavow: ~105 redirect-parameter pages (Moz class A), ~27 spun blog posts (class B, spam 5-76%), 81 PBN-advert domains; and ask who ordered the ipsnews/nerdbot/psbios/bulkdp posts (they are the only topical-looking followed links and all are unlabeled placements on unrelated sites). Google Search Console's Links report should be checked for the same domains before any disavow.
7. **Form 7004 and by-country remain un-cited by every engine**; /form-7004-extension still absent from Moz's ranking list.
