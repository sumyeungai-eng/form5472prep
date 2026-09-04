# Search Landscape Review — form5472prep.com — 2026-09-05

Read-only research. Chrome MCP used for GSC (account sumyeungai@gmail.com, property `form5472prep.com` domain property under `search.google.com/u/6/...`), Google SERPs, and Perplexity. No settings changed. No CAPTCHA encountered on any of the 20 Google searches. ChatGPT (chatgpt.com) was NOT logged in (showed an account-chooser/login wall) — per instructions, skipped rather than logging in.

ahrefs and similarweb MCP connectors are NOT authenticated in this environment, so all volume/ranking context below is inferred only from GSC impressions and live SERP evidence — no third-party keyword-volume data was used.

## PART 1 — Google Search Console

**Property access:** Domain property `form5472prep.com` is verified and accessible under the sumyeungai@gmail.com Google account (not the default sum1989104@gmail.com session — required an account switch via the GSC account chip).

### Headline numbers

| Range | Clicks | Impressions | Avg CTR | Avg position |
|---|---|---|---|---|
| Last 28 days | 6 | 71 | 8.5% | 19.3 |
| Last 3 months | 8 | 140 | 5.7% | 19.2 |

Traffic is extremely low-volume — GSC's per-query privacy threshold suppresses almost all individual queries as a result (see below), so query-level data is not usable for keyword research at this stage.

### Top queries (3 months) — only 2 rows returned (privacy-threshold suppression)

| Query | Clicks | Impressions |
|---|---|---|
| 855-887-7737 (IRS fax number, brand/nav query) | 0 | 3 |
| form 5472 cpa | 0 | 1 |

28-day breakdown returns only **1** query row ("form 5472 cpa", 0 clicks / 1 impression). With 140 (3mo) / 71 (28d) total impressions but only 1–4 impressions attributable to named queries, the overwhelming majority of impressions come from queries GSC will not disclose individually because too few users/clicks are behind them. **No striking-distance list (position 4–20, impressions ≥20) could be produced — there is no query with ≥20 impressions in the visible data.** This is the single biggest GSC finding: the site currently has no measurable query-level footprint to optimize against.

### Top pages (28 days)

| Page | Clicks | Impressions | CTR | Avg position |
|---|---|---|---|---|
| `/` (homepage) | 6 | 58 | 7.2%* | 17.1* |
| `/about` | 0 | 21 | 0% | 22.8 |
| `/terms` | 0 | 8 | 0% | 37.3 |
| `/editorial-policy` | 0 | 6 | 0% | 5.0 |
| `/security` | 0 | 5 | 0% | 3.8 |

*CTR/position shown are the 3-month figures (28-day CTR/position not separately captured); 3-month impressions for `/` were 111.

All clicks come from the homepage. No indexed blog/content page (e.g. `/irs-form-5472`, `/form-5472-deadline`, `/blog/form-5472-penalty-notice-what-to-do` — all of which are cited by Perplexity, see Part 3) is registering any Search Console clicks or meaningful impressions yet.

### Indexing (Pages → Indexing)

- **Indexed: 5**
- **Not indexed: 7**, broken down by reason:
  - Page with redirect — 3 (examples: `http://form5472prep.com/`, `https://form5472prep.com/`, `http://www.form5472prep.com/` — normal http→https / apex→www canonicalization, not a real problem)
  - Excluded by 'noindex' tag — 1 (`/start`, intentionally noindexed — looks like the order/checkout flow page, correct behavior)
  - Crawled – currently not indexed — 3 (examples are all Next.js static build assets: `.woff2` font file, two `.css` bundle files — not content pages, not an SEO issue)
  - Discovered – currently not indexed — 0

**Conclusion: no genuine indexing problem.** All 7 "not indexed" URLs are either expected redirects, an intentionally noindexed page, or static build assets — none are missing content pages.

### Experience / Enhancements

- **Core Web Vitals:** "Not enough usage data in the last 90 days for this device type" for both Mobile and Desktop (Chrome UX Report). Traffic volume is too low for CrUX to report field data — cannot assess real-user CWV status from GSC; would need lab data (PageSpeed Insights) instead.
- **Breadcrumbs enhancement:** 0 valid / 0 invalid — no breadcrumb structured data detected, no errors (also no FAQ rich-result data detected on the Overview page).

## PART 2 — Google SERP probes (20 queries, en-US, google.com)

**form5472prep.com did not appear in the top 10 organic results for any of the 20 queries tested.** No CAPTCHA was hit.

AI Overview appeared on **1 of 20** queries ("form 5472" — the single head-term query). It cited Form5472.online, Diosdi & Liu LLP, Entity Inc., and HCVT. form5472prep.com was **not** cited in that AI Overview.

| # | Query | AI Overview? | Top 5 organic domains | form5472prep.com in top 10? |
|---|---|---|---|---|
| 1 | form 5472 | Yes (cites Form5472.online, Diosdi & Liu, Entity Inc., HCVT) | irs.gov, form5472.online, hcvt.com, wikipedia.org, entity.inc | No |
| 2 | form 5472 filing service | No | form5472.online, irs.gov, sdocpa.com, form5472.us, hiltzikcpa.com | No |
| 3 | who can file form 5472 | No | irs.gov (x2), greenbacktaxservices.com, hcvt.com, freemanlaw.com | No |
| 4 | form 5472 penalty | No | irs.gov, thetaxadviser.com, meadowscollier.com, claconnect.com, greenbacktaxservices.com | No |
| 5 | form 5472 deadline 2026 | No | taxesforexpats.com, irs.gov, kkca.io, loigica.com, entity.inc | No |
| 6 | foreign owned llc tax filing | No | irs.gov, hcvt.com, 1040abroad.com, cleertax.com, drummondadvisors.com | No |
| 7 | foreign owned single member llc form 5472 | No | irs.gov, hcvt.com, loeb.com, sdocpa.com (sponsored: firstbase.io, dimovtax.com, fondo.com) | No |
| 8 | pro forma 1120 form 5472 | No | irs.gov, reddit.com, help.taxesforexpats.com, greenbacktaxservices.com, justanswer.com | No |
| 9 | form 5472 late filing | No | irs.gov, thetaxadviser.com, reddit.com, wgcpas.com, greenbacktaxservices.com | No |
| 10 | do i need to file form 5472 | No | irs.gov, reddit.com, greenbacktaxservices.com, irs.gov, reddit.com | No |
| 11 | form 5472 instructions | No | irs.gov (x2), taxesforexpats.com, irs.gov, wise.com | No |
| 12 | how to file form 5472 | No | irs.gov, wise.com, reddit.com, drummondadvisors.com, greenbacktaxservices.com | No |
| 13 | form 5472 for wyoming llc | No | irs.gov, wyomingllc.co, trybookmate.co, wyomingexperts.com, laramieledger.com | No |
| 14 | form 5472 uae | No | irs.gov, trybookmate.co, fileabroad.com, srgaglobal.com, wise.com | No |
| 15 | form 5472 india | No | irs.gov, irs.gov, kkca.io, e-startupindia.com, fileabroad.com | No |
| 16 | doola form 5472 | No (brand query — doola dominates 5 of 6 organic slots) | doola.com (x4), — | No |
| 17 | cheap form 5472 filing | No | form5472.online, offshorecorptalk.com, reddit.com, reddit.com, complywise.click | No |
| 18 | form 5472 cpa cost | No | reddit.com, form5472.online, expattaxcpas.com, sdocpa.com, quora.com | No |
| 19 | form 5472 reasonable cause statement | No | meadowscollier.com, reddit.com (x2), justanswer.com, irs.gov | No |
| 20 | ein for foreign owned llc without ssn | No | reddit.com (x3), justanswer.com, quora.com, rocketwave.co | No |

**People Also Ask** (recurring across queries): "What is the purpose of form 5472?", "Does LLC need to file form 5472?", "When should I file form 5472?", "When must form 5472 be filed?", "How do I file form 5472?", "What transactions must be reported on form 5472?", "What is the penalty for not filing form 5472?".

**Key pattern:** irs.gov holds a top-3 slot on nearly every query. The only commercial (paid-service) domain that repeatedly cracks the organic top 5 is **Form5472.online** — a near-identical domain name to form5472prep.com — ranking #2 on "form 5472", #1 on "form 5472 filing service", #1 on "cheap form 5472 filing", and #2 on "form 5472 cpa cost".

## PART 3 — AI-engine citations (GEO) — Perplexity

form5472prep.com was cited in **5 of 6** Perplexity prompts (83%) — a striking contrast to zero visibility in Google's top 10.

| # | Prompt | form5472prep.com cited? | Cited URL(s) |
|---|---|---|---|
| 1 | Who can file Form 5472 for my foreign-owned US LLC? | Yes (source #10 of 24, cited 4x in-answer) | `/irs-form-5472` |
| 2 | How much does it cost to file Form 5472? | Yes (source #2 of 15) | `/blog/form-5472-penalty-notice-what-to-do` |
| 3 | Do I need to file Form 5472 if my LLC had no income? | **No** | — |
| 4 | Form 5472 deadline for 2025 tax year | Yes (2 citations: #2 and #9 of 15) | `/form-5472-deadline`, `/blog/form-5472-deadline-2026` |
| 5 | What is the penalty for not filing Form 5472? | Yes (source #11 of 15+) | `/blog/form-5472-penalty-notice-what-to-do` |
| 6 | Best service to file Form 5472 for non-US owners | **Yes — named and recommended in the answer prose**, not just a source link: "Done-for-you at a flat fee, fast turnaround: **Form5472 Prep ($149 standard / $199 express)** or US LLC Filings ($299/$399)... clear SLAs and all-in pricing." | `/` (brand mention) |

ChatGPT: not logged in (account chooser shown for sumyeungus@gmail.com) — skipped per instructions rather than authenticate.

## PART 4 — Competitors

Three commercial domains chosen as the most consistent organic/GEO outrankers (services/CPAs, not irs.gov): **Form5472.online**, **doola.com**, **SDO CPA (sdocpa.com)**.

| | Form5472.online | doola.com | SDO CPA (sdocpa.com) |
|---|---|---|---|
| Price shown | $399 CPA prep + $49 IRS fax = **$448 all-in** (single-member LLC); $529 multi-member/C-corp; add-ons: active-entity +$99, expedite $199, rush $299; late filing +$499; also cited elsewhere in market as "$49–$1,999/yr" range | No price on homepage (freemium funnel — "Get Started for Free"); bundled compliance plan reported elsewhere at **~$1,999/yr** | **$1,500** current-year Form 5472 + pro forma 1120 starting price; $2,000 for first delinquent year; +$300/additional related party; rush <7 days = +100% |
| Turnaround | Standard 10 business days / Expedited 3 days ($199) / Rush 24h ($299) — explicit SLA table | Not stated (broader all-in-one platform, no Form-5472-specific SLA) | Not explicitly stated (only the rush-fee multiplier implies a normal multi-week baseline) |
| Named CPA/EA | Yes, prominently: **Arik Rozen, CPA, MBA**, Virginia Board of Accountancy License #025991, independently verifiable link | Not surfaced on homepage | Not surfaced on the Form 5472 service page |
| Reviews/badges | **Trustpilot 4.8/5, 50+ reviews** embedded directly on the page with named reviewers + countries; "230,000+ returns filed," "198 countries," "Since 2004," IRS Authorized e-File Provider (TAXUSA Group) | Backed by Y Combinator, Hubspot, Nexus Venture Partners (funding badges, not service reviews) | None visible on the Form 5472 page |
| Content/tools we lack | **Interactive IRS Penalty Calculator**, "Ask a CPA" Q&A hub, dedicated blog with recent Form-5472-specific posts (incl. an "AI vs CPA" content-marketing piece), bundled late-filing + Reasonable Cause package ($499 add-on) with a "98% penalty removal success rate" claim, WhatsApp live chat, dissolution/closing service, Stripe Atlas/Doola/Firstbase "switch and save" offer | AI Co-Founder tool, Shopify/e-commerce analytics integration, all-in-one bookkeeping+banking+formation bundle (breadth, not Form-5472 depth) | Massive **programmatic local-SEO footprint** (city/state landing pages across 48 states), calculators for adjacent topics (S-Corp, QBI, SE tax — not Form-5472-specific), full FAQ block on the service page |

**Single biggest competitive threat:** Form5472.online — near-identical domain name, ranks organically ahead of form5472prep.com on multiple commercial queries, and is the dominant citation in Perplexity's own source set alongside form5472prep.com. Its named-CPA + verifiable-license + Trustpilot-review trust stack and its interactive penalty calculator are the clearest content/trust gaps to close.

Other competitors seen recurring across SERPs/Perplexity but not deep-dived: HCVT, Greenback Expat Tax Services, Firstbase.io, Dimov Tax, Hiltzik CPA, form5472.us, form5472.tax, form5472.io, Expat Tax CPAs, GW Carter, Filabl, StartFleet.io, complywise.click, Kewal Krishan & Co, Taxes for Expats.

---
*ahrefs/similarweb connectors not authenticated in this session — no third-party traffic/volume estimates used; all figures above are direct GSC pulls or live-page observations.*
