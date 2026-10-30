# Improvement & enhancement plan — form5472prep.com (2026-10-30)

**Inputs** (all in `docs/seo/moz-data-2026-10-30/`): Moz campaign (ranks + crawl 2026-10-25 — Moz's next run is 1 Nov), Moz page grader (live), Moz AI Visibility (run 2026-10-26), Moz links (live 2026-10-30), and a page-by-page audit of all 281 sitemap URLs (`page-audit/summary.md`, `pages.tsv`, `risky.tsv`). Earlier context: `moz-data-2026-10-26/` (incl. Search Console 28-day data).

## 1. Where we stand

| Area | Now | Trend / note |
|---|---|---|
| Google (Search Console, 28 d to 10-26) | 104 clicks, 9.18K impressions, avg pos 12.4 | ×2.5 clicks, ×2.7 impressions vs prior 28 d |
| Moz visibility (246 tracked) | 1.23% (10-25) | 0.47% → 1.55% → 1.23%; top-10: 15 → 43 → 33 |
| Paid-service pages | 3 ranking keywords | money terms still land on guides/blog posts |
| Technical (281 pages) | clean | 0 broken links, 0 redirects, 0 noindex/robots conflicts, all self-canonical |
| Moz crawl | 59 issues | 54 URL-too-long (owner: leave), 2 duplicate groups (fixed 10-26, awaiting re-crawl) |
| Authority | DA 12, Brand Authority 1, Spam Score 16% | 76 linking domains — all spam except Form5472.online's comparison post; **0 genuine links** |
| AI answers (10-26) | ChatGPT 30%, Google AI Mode 5%, Gemini 7.5% | wrong facts ($99 / automated / 3 days) are **gone**; citations of our pages 31 → 68, but 15 of 20 AI Mode/Gemini citations still don't name us |

## 2. Priority 0 — this week (code, ~1 day)

| # | Action | Why (evidence) |
|---|---|---|
| P0-1 | **Protect 9 rankings sitting on the now-noindexed blog list pages** (7 in top 10: Vietnam #1, Estonia #2, France #4, recordkeeping checklist #4, Indonesia #6, Switzerland #6, Spain #7). Inspect those 7–9 posts in Search Console, request indexing, add 2–3 contextual links to each from strong pages and the country/topic hubs. | Moz page grader already sees the noindex (16 pairs fail "accessible to engines"); Google must switch to the posts themselves, which only happens if they're indexed and linked. |
| P0-2 | **Fix the 8 pages whose FAQ schema lists more questions than the page shows.** | Google treats mismatched FAQ markup as a structured-data quality problem. |
| P0-3 | **Remove "online filer" wording (20 pages)** → "questionnaire + review by a tax accountant who holds an IRS PTIN". Label the footer IRS number as "IRS fax" so it's never read as ours. | Feeds the "automated tool" description AI engines gave us. |
| P0-4 | **Put the PTIN-review statement + one brand-attributed answer on /ein, /itin, /form-7004-extension and the 17 service/pricing pages that lack it** (only 2 of 19 key pages state it). | AI answers now repeat the PTIN review — make it unmissable on every money page. |
| P0-5 | **Reconcile white-label vs partner messaging** (ChatGPT flagged a contradiction between `/services/white-label-form-5472-filing` and `/partners`; the full white-label portal is built but not shipped). | Contradictions lower AI trust. |
| P0-6 | **Form 7004 answers**: 21 AI answers about Form 7004 never name us. Add question-H2 capsules ("Can someone file Form 7004 for my foreign-owned LLC?", deadline, cost from pricing.ts) to `/form-7004-extension`, link it from the deadline and extension posts, add it to llms.txt quick answers. | New service, zero AI presence yet. |

## 3. Priority 1 — next 2 weeks (code + content)

| # | Action | Why |
|---|---|---|
| P1-1 | **Money pages on-page pass**: for the 9 intended money pages (filing service, fax filing, preparer, hire someone, pro forma 1120, late filing, final/dissolved, compare, 7004) put the exact phrase in title start, H1, first paragraph and meta description; run Moz's page grader on each once (owner OK — uses a query credit) and fix to 90+. | Moz's most common failures: meta description (71 pairs), exact keyword in title (68), H1 (60), title placement (58). Moz has no graded pair for any money page today. |
| P1-2 | **Internal linking**: 9 orphan pages + 60 with ≤2 inbound links; `/blog` page 1 links to only 26 of 197 posts. Build a **"Form 5472 by country" hub** (all country posts, indexable, one line each) and a **topic "start here" block** on each guide; strengthen the related-posts module (same topic first). | Orphans can't rank; country posts are where we already win (#1–#7). |
| P1-3 | **AEO structure on the 27 pages without question H2s, 16 with weak capsules, 18 with visible Q&As but no FAQPage schema**; fix the 10 short meta descriptions and 7 short titles. | Engines lift question + ≤60-word answer blocks. |
| P1-4 | **Win "how to file / fill out Form 5472"**: the pages AI engines cite instead of us are irs.gov (44), hcvt.com, wise.com, form5472.online, hiltzikcpa.com, clemta.com, expatustax.com. Make `/form-5472-instructions` + `/form-5472-example` + `/file-form-5472` the clearest step-by-step answer (numbered steps, line-by-line table, HowTo schema, sources, "updated" date). | 28 of 40 tracked AI prompts name us on no engine. |
| P1-5 | **Image alt text**: descriptive alt on hero/service/guide images; give blog-card thumbnails meaningful alt (post topic) where the card title isn't adjacent. | Moz fails image alt on 74 of 76 pairs; 1,000 empty alts on 210 pages. |
| P1-6 | **Brand mentions**: name "Form5472 Prep" (one form, not "Form 5472 Prep") once in the main content of the 29 pages that lack it — tools and hubs especially. | 15 of 20 AI citations of our pages don't name us. |

## 4. Priority 2 — enhancements (next 1–2 months)

- **Country hub + per-country quick facts** (tax treaty note, FTIN rules) — turns our strongest ranking cluster into a linkable asset.
- **Tool upgrades**: penalty and deadline calculators get shareable results + "embed this" prompt (calculators earn links).
- **Annual refresh workflow**: when the IRS publishes tax-year-2026 Form 5472 instructions (~Dec 2026), update instructions/example/deadline pages first; schedule a reminder.
- **Speed**: preloaded fonts (~128 KB) are the next LCP lever (mobile LCP ~3.0 s vs 2.5 s target).

## 5. Off-site & owner (still the biggest lever)

Moz shows **zero genuine links**; Brand Authority 1 vs doola/Firstbase 28. Form5472.online's only real placements are natlawreview.com, cpapracticeadvisor.com and qusos.com — all reachable for us too.
1. Directory/profile listings one a day (Crunchbase, G2, Capterra, SaaSHub, GoodFirms…) — kit: `docs/seo/offsite-kit-2026-10-04.md`.
2. Pitch cpapracticeadvisor.com (white-label/partner + free calculators) and natlawreview.com (statistics page data).
3. Ask the comparison pages AI engines cite to list us accurately ($149 / $199, PTIN review).
4. Expert-quote platforms; Trustpilot reviews (invites are automatic).
5. **Decisions**: named reviewer + credentials (the "company qualifications" doubt); legal name + LinkedIn/X/Crunchbase (`ORG_SAME_AS`); Google Ads consent gate; home claims ("40+ countries", "we handle the IRS response"); money-back guarantee (~33 pages) vs Terms §6; disavow the PBN spam; 301-merge hire-someone page; the 4 off-topic UK company-car posts on this blog (move/noindex?).

## 6. Measurement checkpoints

- **1 Nov (Moz ranks + crawl)**: did the 9 paginated-page rankings move to the posts? Duplicate-content groups gone? Money terms on intended pages?
- **2 Nov (Moz AI)**: AI Mode/Gemini mention rate; Form 7004 prompts; brand named in citations.
- **Search Console (weekly)**: external canonicals (747live.bet / marcustheatres.com) cleared on the 5 re-requested URLs; clicks/impressions trend.

## 7. Not doing
Renaming the 54 long blog URLs (owner decision: leave); changing Vercel's http→https 308; bulk retitling pages that already rank (wait ≥3 weeks between title batches); buying links.
