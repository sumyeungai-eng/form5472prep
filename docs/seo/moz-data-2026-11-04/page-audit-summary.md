# Form5472 Prep — page-by-page SEO / AEO / GEO audit

Run: 2026-11-04. Source: every URL in https://www.form5472prep.com/sitemap.xml (287). Public fetches only, browser UA, 4 concurrent, 200 ms spacing. Raw data: `pages.tsv` (one row per URL), `risky.tsv`, `broken-links.tsv`. Scripts: `fetch.mjs` → `analyze.mjs` → `summary.mjs` → `compare.mjs` (re-run: `rm -rf .cache && node fetch.mjs && node analyze.mjs && node summary.mjs && node compare.mjs`). Extra output: `faq-mismatch.tsv`; `_baseline-rerun/` = this analyzer re-run on the 2026-10-30 cache.

## 0a. Before → after (2026-10-30 → 2026-11-04)

Before = the 2026-10-30 run (281 URLs); after = this run (287 URLs). “Before” for the 43 pre-existing issue rows is read straight from the official 2026-10-30 summary; for rows marked *new check* it comes from running this version of the analyzer on the 2026-10-30 cache (`_baseline-rerun/`). Method check: 43/43 pre-existing issue counts are identical between the official old summary and the re-run, so the two runs are like-for-like.

### Issue types: before → after (pages)

| issue | before | after | Δ | status |
|---|---|---|---|---|
| Images with empty alt other than logo-mark.svg (blog-card thumbnails etc.) | 210 | 215 | +5 | WORSE |
| Has question H2 but first one lacks ≤60-word answer capsule | 16 | 18 | +2 | WORSE |
| Fewer than half of question H2s have ≤60-word capsule | 8 | 9 | +1 | WORSE |
| Short (300–600 main words, indexable) | 8 | 9 | +1 | WORSE |
| ≥3 visible Q&A (q-H2/summary) but no FAQPage schema | 18 | 19 | +1 | WORSE |
| Title < 30 chars | 7 | 6 | -1 | improved |
| Risky/stale wording: flagged sentence (see §5) | 46 | 45 | -1 | improved |
| Outcome claim (accepted without penalty / most … accepted / penalty removed), not negated *(new check)* | 4 | 2 | -2 | improved |
| Service/pricing/home page: "PTIN" absent from main content | 3 | 0 | -3 | improved |
| Service/pricing/home page: no PTIN-review statement in main (any wording) | 3 | 0 | -3 | improved |
| Meta description > 160 chars | 4 | 0 | -4 | improved |
| Form 7004 priced at $79 (stale; now $19) *(new check)* | 4 | 0 | -4 | improved |
| FAQPage schema lists more questions than visible question markup | 8 | 3 | -5 | improved |
| "DIIRSP" in visible copy (main/footer; report only) *(new check)* | 58 | 52 | -6 | improved |
| Orphan: 0 inbound internal links from other sitemap pages | 9 | 0 | -9 | improved |
| Meta description < 70 chars | 10 | 0 | -10 | improved |
| "auto-generat*" near "reasonable cause" *(new check)* | 10 | 0 | -10 | improved |
| Service/pricing/home page: exact phrase "tax accountant who holds an IRS PTIN" absent | 17 | 0 | -17 | improved |
| Brand "Form5472 Prep" absent from main content | 29 | 0 | -29 | improved |
| Weakly linked: ≤ 2 inbound links from sitemap pages (excl. orphans) | 60 | 8 | -52 | improved |
| Express turnaround stated as 24 hours / "within 24" (Express is now under 3 days) *(new check)* | 161 | 0 | -161 | improved |
| Canonical differs only by trailing slash/case (self-variant) | 1 | 1 | +0 | unchanged |
| No question-form H2 (content pages; legal, blog index and /blog/topics/* excluded) | 27 | 27 | +0 | unchanged |
| Fewer than 3 contextual (in-main) internal links | 7 | 7 | +0 | unchanged |
| No JSON-LD at all | 6 | 6 | +0 | unchanged |
| No BreadcrumbList (non-home) | 6 | 6 | +0 | unchanged |
| "money-back guarantee" (any sentence) *(new check)* | 33 | 33 | +0 | unchanged |

Zero before and after (26): Non-200 final status; Sitemap URL redirects; noindex (meta or X-Robots-Tag) on a sitemap URL; Disallowed by robots.txt (User-agent: *); Canonical missing; Canonical relative / multiple / points elsewhere; Title missing; Title > 60 chars (SERP truncation risk); Duplicate title; Meta description missing; Duplicate meta description; H1 missing; H1 count > 1; Thin (< 300 main words, indexable); Links to apex host form5472prep.com (301s to www); Broken internal links (4xx/5xx/error); Links to redirecting internal URLs; Images missing alt attribute; JSON-LD parse error; Article/BlogPosting without dateModified; FAQPage schema but no visible question markup (h2/h3/summary/dt); og:image missing; Form 7004 sentence with a price other than $19; FAQPage schema question with no exact visible match (glyphs ▾ + × stripped); FAQPage schema lists more questions than visible question elements (schema > visible); HowTo schema step count ≠ visible numbered steps.

### Wording patterns (§5): pages with any hit / flagged pages

“Flagged” = needs a human read per the §5 rules; for the report-only patterns (express-24h, DIIRSP, auto-generat+reasonable-cause, money-back-guarantee) every hit counts as flagged.

| pattern | pages before | pages after | flagged before | flagged after |
|---|---|---|---|---|
| CP-15 | 2 | 2 | 2 | 2 |
| 3-business-days+Express | 0 | 0 | 0 | 0 |
| $99 | 160 | 162 | 0 | 0 |
| no-Form-7004 | 2 | 2 | 0 | 0 |
| online filer | 20 | 0 | 20 | 0 |
| automatically generat* | 0 | 0 | 0 | 0 |
| IRS-approved | 1 | 1 | 1 | 1 |
| licensed | 7 | 7 | 1 | 1 |
| CPA | 281 | 287 | 15 | 15 |
| guarantee | 73 | 73 | 33 | 33 |
| money-back | 37 | 37 | 33 | 33 |
| no human review | 0 | 0 | 0 | 0 |
| 855-887-7737 | 281 | 287 | 2 | 2 |
| filed-within-24h | 1 | 0 | 1 | 0 |
| express-24h *(new)* | 161 | 0 | 161 | 0 |
| express-under-3-days *(new)* | 0 | 167 | 0 | 0 |
| 7004-price *(new)* | 4 | 4 | 4 | 0 |
| DIIRSP *(new)* | 263 | 267 | 263 | 267 |
| auto-generat+reasonable-cause *(new)* | 10 | 0 | 10 | 0 |
| outcome: accepted-without-penalty *(new)* | 2 | 1 | 2 | 1 |
| outcome: most-accepted *(new)* | 2 | 0 | 2 | 0 |
| outcome: penalty-removed *(new)* | 9 | 10 | 1 | 1 |
| money-back-guarantee *(new)* | 33 | 33 | 33 | 33 |

### Schema and structure facts

| fact | before | after |
|---|---|---|
| Sitemap URLs / fetched OK | 281 / 281 | 287 / 287 |
| FAQPage pages / schema questions | 243 / 1486 | 248 / 1529 |
| Schema questions with exact visible text match | 1486/1486 | 1529/1529 |
| Pages where FAQ schema count = visible question count (loose; extra question-form H2s make visible larger) | 21/243 | 21/248 |
| Pages with HowTo schema | 114 | 116 |
| /file-form-5472 | HowTo 8 schema / 8 visible | HowTo 8 schema / 8 visible |
| /form-5472-instructions | no HowTo schema | HowTo 10 schema / 10 visible |
| /form-5472-example | no HowTo schema | HowTo 10 schema / 10 visible |
| /form-5472-by-country | not in sitemap | in sitemap, indexable, links 47 posts in main (49 on page) |
| DIIRSP in visible copy (main/footer): pages / sentences | 58 / 363 | 52 / 325 |
| IRS fax number in footer shown without the word “fax” (pages) | 281 | 0 |
| “… under 3 days” Express wording present (pages) | 0 | 167 |
| DIIRSP in JSON-LD strings (pages; Organization-level string) | 261 | 265 |
| DIIRSP in title/meta description (pages) | 7 | 7 |
| Total main-content words | 473243 | 485895 |

### Pages newly flagged since last run (in an issue list now, not before)

Sitemap diff: **6 new URLs**, 0 removed — `/form-5472-by-country`, `/blog/form-5472-extension-vs-late-filing`, `/blog/foreign-llc-year-end-checklist-2026`, `/blog/1099-nec-deadline-2027-foreign-llc`, `/blog/delaware-llc-annual-tax-2027`, `/blog/topics/deadline`.

- Has question H2 but first one lacks ≤60-word answer capsule (+3): `/blog/form-5472-extension-vs-late-filing` (new URL), `/blog/foreign-llc-year-end-checklist-2026` (new URL), `/blog/1099-nec-deadline-2027-foreign-llc` (new URL)
- Fewer than half of question H2s have ≤60-word capsule (+1): `/blog/foreign-llc-year-end-checklist-2026` (new URL)
- Short (300–600 main words, indexable) (+1): `/blog/topics/deadline` (new URL)
- Weakly linked: ≤ 2 inbound links from sitemap pages (excl. orphans) (+1): `/irs-form-5472`
- Images with empty alt other than logo-mark.svg (blog-card thumbnails etc.) (+5): `/blog/form-5472-extension-vs-late-filing` (new URL), `/blog/foreign-llc-year-end-checklist-2026` (new URL), `/blog/1099-nec-deadline-2027-foreign-llc` (new URL), `/blog/delaware-llc-annual-tax-2027` (new URL), `/blog/topics/deadline` (new URL)
- ≥3 visible Q&A (q-H2/summary) but no FAQPage schema (+2): `/blog/topics/late-filing`, `/blog/topics/penalty`
- "DIIRSP" in visible copy (main/footer; report only) (+1): `/blog/form-5472-extension-vs-late-filing` (new URL)

### What changed on the 281 pages present in both runs

Compared with `moz-1030/page-audit/pages.tsv` (281 URLs in both): title changed on **3**, meta description on **23**, sitemap lastmod on **10**, JSON-LD type set on **3**, FAQ schema question count on **3**, in-main internal links on **64**, main word count by more than 5% on **11**; any of title/description/words/schema changed on **190**.

### llms.txt and llms-full.txt (stale-fact scan; hits are occurrences, not pages)

| pattern | llms.txt before | llms.txt after | llms-full.txt before | llms-full.txt after |
|---|---|---|---|---|
| Express near "24 hours"/"within 24" | 5 | 0 | 22 | 0 |
| Form 7004 near "$79" | 3 | 0 | 2 | 0 |
| Form 7004 near "$19" | 0 | 4 | 0 | 2 |
| "online filer" | 0 | 0 | 3 | 0 |
| "auto-generat*" near reasonable cause | 0 | 0 | 10 | 0 |
| "money-back guarantee" | 2 | 2 | 23 | 23 |
| "DIIRSP" | 21 | 19 | 219 | 215 |
| outcome wording ("accepted without penalty" / "most … accepted" / "penalty removed") | 0 | 0 | 10 | 7 |

### Probes (live, this run)

| URL | first status | chain | final status |
|---|---|---|---|
| /this-page-does-not-exist-xyz | 404 | 404 | 404 |
| /blog/nope-xyz | 404 | 404 | 404 |
| /pricing/ | 308 | 308>200 | 200 |
| https://form5472prep.com/ (https://form5472prep.com) | 301 | 301>200 | 200 |
| http://www.form5472prep.com/ (http://www.form5472prep.com) | 308 | 308>200 | 200 |
| /sitemap.xml | 200 | 200 | 200 |
| /robots.txt | 200 | 200 | 200 |
| /llms.txt | 200 | 200 | 200 |

## 0b. Headline findings (computed from this run)

1. **Technical:** 287/287 sitemap URLs are HTTP 200 HTML; 0 redirect, 0 noindex, 0 robots-blocked, 0 with a missing/relative/multiple/foreign canonical; 0 broken and 0 redirecting internal link targets across 721 checked; 0/18 named bots blocked from any sitemap URL.
2. **Metadata:** 0 missing titles, 0 duplicate titles, 0 titles >60 chars, 6 <30; 0 missing descriptions, 0 duplicate, 0 <70 chars, 0 >160.
3. **Q&A structure:** 240/267 content pages have ≥1 question-form H2 (guides 31/31, services 13/13); **27 do not** (e.g. `/faq` q-dt=55, `/editorial-policy` q-dt=0, `/blog/uk-company-car-vat-buy-lease-electric` q-dt=0, `/blog/electric-company-car-llc-tax-2026` q-dt=0); **18** have a first answer paragraph >60 words.
4. **Internal linking:** **0 orphan** and 8 weakly linked (≤2 inbound) pages; the /blog index links to 26 of 201 posts.
5. **Wording counts (pages):** “online filer” 0; “100% money-back guarantee” sentence 33 (first-person “us-claim?” on 33); “CP 15” 2; “3 business days” near Express 0; “automatically generat*” 0; “no human review” 0; IRS fax number in header/footer chrome without the word “fax” on 0 pages; 0 “$99 as starting price” sentences (200/202 “$99” sentences framed as per-additional-year add-ons); flagged “CPA”/“licensed” first-person claims: 23 sentences (read in §5); `tel:` links: 0.
6. **PTIN statement:** a PTIN-review statement is in the main content of 19/19 home/pricing/service/product pages (literal “tax accountant who holds an IRS PTIN” on 19/19); pages with PTIN only in the footer: none.
7. **Schema:** FAQPage on 248 pages; HowTo on 116; 19 pages show ≥3 visible Q&As with no FAQPage; 3 FAQPage blocks list more questions than the page visibly asks (loose count); 0 pages have a schema question with no exact visible text match; JSON-LD dateModified ≠ sitemap lastmod on 14 pages and >90 days old on 2.
8. **Images:** 0 missing alt attributes; 224 images carry non-empty alt; 1027 images (blog-card thumbnails) across 215 pages have `alt=""`.
9. **Brand consistency:** “Form5472 Prep” is absent from main content on 0 pages; the spaced variant “Form 5472 Prep” appears in main on 32.
10. **Off-topic content:** 4 blog post(s) about company cars/mileage (`/blog/uk-company-car-vat-buy-lease-electric`, `/blog/electric-company-car-llc-tax-2026`, `/blog/business-car-mileage-vs-actual-2026`, `/blog/foreign-owned-llc-company-car-deduction`).

## 1. Totals

- Sitemap URLs: **287** (287 unique). Fetched OK (HTTP 200, HTML): **287**. Non-200 / fetch errors: **0**. Redirecting sitemap URLs: **0**.
- Indexable (200, no noindex, not robots-blocked): **287**. noindex: 0. Robots-blocked: 0. X-Robots-Tag header present: 0.
- Median main-content words: 1819; thin (<300): 0; <600: 9.
- Internal link targets found: 445 unique (0 broken, 0 redirecting); 162 non-sitemap targets requested once each.
- Client-side-render bailout template (chat widget): present on 1/287 pages; fewest main-content words on any page: 336 (main content is server-rendered).

### By section

| section | pages | avg words | avg title len | desc 70–160 | has q-H2 | first capsule ≤60w | avg q-H2 | avg in-main int links | FAQPage | Breadcrumb | Article-type |
|---|---|---|---|---|---|---|---|---|---|---|---|
| home | 1 | 2658.0 | 51.0 | 100% | 100% | 100% | 10.0 | 31.0 | 100% | 100% | 0% |
| pricing | 1 | 1249.0 | 44.0 | 100% | 100% | 100% | 4.0 | 8.0 | 100% | 100% | 0% |
| services | 13 | 1203.5 | 55.5 | 100% | 100% | 100% | 6.5 | 15.8 | 92% | 100% | 0% |
| product | 4 | 1396.3 | 54.8 | 100% | 100% | 100% | 4.8 | 4.8 | 100% | 100% | 0% |
| tools | 8 | 1795.6 | 55.5 | 100% | 100% | 100% | 3.6 | 8.1 | 100% | 100% | 0% |
| guides | 31 | 2378.4 | 51.3 | 100% | 100% | 100% | 8.6 | 11.7 | 97% | 100% | 97% |
| compare | 2 | 1953.5 | 48.0 | 100% | 100% | 100% | 6.0 | 10.5 | 100% | 100% | 50% |
| blog | 216 | 1648.1 | 51.4 | 100% | 82% | 74% | 5.3 | 13.1 | 86% | 100% | 93% |
| info | 6 | 1496.0 | 46.8 | 100% | 67% | 67% | 4.8 | 14.8 | 67% | 83% | 17% |
| legal | 5 | 758.6 | 33.0 | 100% | 0% | 0% | 0.0 | 0.8 | 0% | 0% | 0% |

## 2. Issue counts (sorted by count)

| # | issue | pages | % of 200-pages |
|---|---|---|---|
| 1 | Images with empty alt other than logo-mark.svg (blog-card thumbnails etc.) | 215 | 75% |
| 2 | [new check] "DIIRSP" in visible copy (main/footer; report only) | 52 | 18% |
| 3 | Risky/stale wording: flagged sentence (see §5) | 45 | 16% |
| 4 | [new check] "money-back guarantee" (any sentence) | 33 | 11% |
| 5 | No question-form H2 (content pages; legal, blog index and /blog/topics/* excluded) | 27 | 9% |
| 6 | ≥3 visible Q&A (q-H2/summary) but no FAQPage schema | 19 | 7% |
| 7 | Has question H2 but first one lacks ≤60-word answer capsule | 18 | 6% |
| 8 | Fewer than half of question H2s have ≤60-word capsule | 9 | 3% |
| 9 | Short (300–600 main words, indexable) | 9 | 3% |
| 10 | Weakly linked: ≤ 2 inbound links from sitemap pages (excl. orphans) | 8 | 3% |
| 11 | Fewer than 3 contextual (in-main) internal links | 7 | 2% |
| 12 | Title < 30 chars | 6 | 2% |
| 13 | No JSON-LD at all | 6 | 2% |
| 14 | No BreadcrumbList (non-home) | 6 | 2% |
| 15 | FAQPage schema lists more questions than visible question markup | 3 | 1% |
| 16 | [new check] Outcome claim (accepted without penalty / most … accepted / penalty removed), not negated | 2 | 1% |
| 17 | Canonical differs only by trailing slash/case (self-variant) | 1 | 0% |
| 18 | Non-200 final status | 0 | 0% |
| 19 | Sitemap URL redirects | 0 | 0% |
| 20 | noindex (meta or X-Robots-Tag) on a sitemap URL | 0 | 0% |
| 21 | Disallowed by robots.txt (User-agent: *) | 0 | 0% |
| 22 | Canonical missing | 0 | 0% |
| 23 | Canonical relative / multiple / points elsewhere | 0 | 0% |
| 24 | Title missing | 0 | 0% |
| 25 | Title > 60 chars (SERP truncation risk) | 0 | 0% |
| 26 | Duplicate title | 0 | 0% |
| 27 | Meta description missing | 0 | 0% |
| 28 | Meta description < 70 chars | 0 | 0% |
| 29 | Meta description > 160 chars | 0 | 0% |
| 30 | Duplicate meta description | 0 | 0% |
| 31 | H1 missing | 0 | 0% |
| 32 | H1 count > 1 | 0 | 0% |
| 33 | Thin (< 300 main words, indexable) | 0 | 0% |
| 34 | Orphan: 0 inbound internal links from other sitemap pages | 0 | 0% |
| 35 | Links to apex host form5472prep.com (301s to www) | 0 | 0% |
| 36 | Broken internal links (4xx/5xx/error) | 0 | 0% |
| 37 | Links to redirecting internal URLs | 0 | 0% |
| 38 | Images missing alt attribute | 0 | 0% |
| 39 | JSON-LD parse error | 0 | 0% |
| 40 | Article/BlogPosting without dateModified | 0 | 0% |
| 41 | FAQPage schema but no visible question markup (h2/h3/summary/dt) | 0 | 0% |
| 42 | Brand "Form5472 Prep" absent from main content | 0 | 0% |
| 43 | Service/pricing/home page: "PTIN" absent from main content | 0 | 0% |
| 44 | Service/pricing/home page: no PTIN-review statement in main (any wording) | 0 | 0% |
| 45 | Service/pricing/home page: exact phrase "tax accountant who holds an IRS PTIN" absent | 0 | 0% |
| 46 | og:image missing | 0 | 0% |
| 47 | [new check] Express turnaround stated as 24 hours / "within 24" (Express is now under 3 days) | 0 | 0% |
| 48 | [new check] Form 7004 priced at $79 (stale; now $19) | 0 | 0% |
| 49 | [new check] Form 7004 sentence with a price other than $19 | 0 | 0% |
| 50 | [new check] "auto-generat*" near "reasonable cause" | 0 | 0% |
| 51 | [new check] FAQPage schema question with no exact visible match (glyphs ▾ + × stripped) | 0 | 0% |
| 52 | [new check] FAQPage schema lists more questions than visible question elements (schema > visible) | 0 | 0% |
| 53 | [new check] HowTo schema step count ≠ visible numbered steps | 0 | 0% |

### Worst 15 per issue

#### Images with empty alt other than logo-mark.svg (blog-card thumbnails etc.) (215)

- `/blog/topics/form-5472` — 24/24
- `/blog/topics/foreign-owned-llc` — 24/24
- `/blog/topics/ftin` — 24/24
- `/blog` — 23/25
- `/blog/topics/digital-nomad` — 21/21
- `/blog/topics/non-resident` — 18/18
- `/blog/topics/recordkeeping` — 17/17
- `/blog/topics/ein` — 15/15
- `/blog/topics/itin` — 15/15
- `/blog/topics/partner-program` — 10/10
- `/blog/topics/deadline` — 8/8
- `/blog/topics/form-ss-4` — 8/8
- `/blog/topics/late-filing` — 8/8
- `/blog/topics/penalty` — 8/8
- `/blog/form-5472-extension-vs-late-filing` — 4/6
- … +200 more (see pages.tsv)

#### [new check] "DIIRSP" in visible copy (main/footer; report only) (52)

- `/diirsp` — 53 sentence(s) [guide]
- `/late-form-5472` — 37 sentence(s) [guide]
- `/form-5472-reasonable-cause-statement` — 29 sentence(s) [guide]
- `/form-5472-deadline` — 26 sentence(s) [guide]
- `/blog/form-5472-filed-late-never-filed` — 16 sentence(s) [blog-post]
- `/form-5472-late-filing-checker` — 14 sentence(s) [tool]
- `/form-5472-penalty` — 14 sentence(s) [guide]
- `/` — 12 sentence(s) [home]
- `/irs-form-5472` — 12 sentence(s) [guide]
- `/stripe-atlas-form-5472` — 12 sentence(s) [guide]
- `/single-member-llc-foreign-owner` — 9 sentence(s) [guide]
- `/form-5472-penalty-calculator` — 8 sentence(s) [tool]
- `/services/late-form-5472-filing-service` — 8 sentence(s) [service]
- `/blog/form-5472-small-corporation-reasonable-cause` — 8 sentence(s) [blog-post]
- `/blog/form-5472-dormant-llc-no-income` — 7 sentence(s) [blog-post]
- … +37 more (see pages.tsv)

#### Risky/stale wording: flagged sentence (see §5) (45)

- `/irs-form-5472` — CPA,guarantee,money-back
- `/stripe-atlas-form-5472` — guarantee,money-back
- `/form-5472-reasonable-cause-statement` — guarantee,money-back
- `/file-form-5472` — guarantee,money-back
- `/form-5472-vs-1120` — CPA,guarantee,money-back
- `/delaware-llc-form-5472` — CPA,guarantee,money-back
- `/late-form-5472` — guarantee,money-back
- `/wyoming-llc-form-5472` — guarantee,money-back
- `/pro-forma-1120` — CPA,guarantee,money-back
- `/form-1120-foreign-owned-llc` — CPA,guarantee,money-back
- `/form-1120-disregarded-entity` — guarantee,money-back
- `/form-5472-deadline` — guarantee,money-back
- `/form-5472-fax-number` — guarantee,money-back
- `/single-member-llc-foreign-owner` — guarantee,money-back
- `/doola-form-5472` — guarantee,money-back
- … +30 more (see pages.tsv)

#### [new check] "money-back guarantee" (any sentence) (33)

- `/` — 100% money-back guarantee if we fail to submit your filing to the IRS.
- `/faq` — We offer a 100% money-back guarantee if we fail to submit your filing to the IRS.
- `/file-form-5472` — 100% money-back guarantee if we fail to submit.
- `/form-5472-penalty` — 100% money-back guarantee if we fail to submit
- `/diirsp` — 100% money-back guarantee if we fail to submit.
- `/form-5472-instructions` — 100% money-back guarantee if we fail to submit
- `/foreign-owned-llc-tax` — 100% money-back guarantee if we fail to submit
- `/late-form-5472` — 100% money-back guarantee if we fail to submit your filing to the IRS.
- `/form-5472-vs-1120` — 100% money-back guarantee if we fail to submit your filing to the IRS.
- `/wyoming-llc-form-5472` — Our service handles the federal piece in 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit.
- `/delaware-llc-form-5472` — 100% money-back guarantee if we fail to submit.
- `/form-5472-germany` — Our service handles the federal piece in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if th
- `/form-5472-uae` — Our service handles the federal filing in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if t
- `/pro-forma-1120` — 100% money-back guarantee if we fail to submit.
- `/form-1120-foreign-owned-llc` — 100% money-back guarantee if we fail to submit your filing.
- … +18 more (see pages.tsv)

#### No question-form H2 (content pages; legal, blog index and /blog/topics/* excluded) (27)

- `/faq` — h2=7, loose-q(no "?")=1, q-H3=0, q-dt=55, words=3367
- `/blog/oregon-llc-foreign-owner-tax-filing` — h2=7, loose-q(no "?")=0, q-H3=4, q-dt=0, words=1068
- `/blog/form-5472-noncash-property-transfers` — h2=6, loose-q(no "?")=0, q-H3=4, q-dt=0, words=1032
- `/blog/washington-llc-foreign-owner-tax-filing` — h2=7, loose-q(no "?")=0, q-H3=4, q-dt=0, words=1021
- `/blog/form-5472-partner-program-how-it-works` — h2=7, loose-q(no "?")=2, q-H3=0, q-dt=0, words=1004
- `/blog/form-5472-royalties-license-fees-intellectual-property` — h2=6, loose-q(no "?")=1, q-H3=4, q-dt=0, words=989
- `/blog/white-label-form-5472-filing-accounting-firms` — h2=6, loose-q(no "?")=2, q-H3=0, q-dt=0, words=980
- `/blog/uk-company-car-vat-buy-lease-electric` — h2=7, loose-q(no "?")=0, q-H3=2, q-dt=0, words=979
- `/blog/form-5472-reasonable-estimates-small-amounts` — h2=8, loose-q(no "?")=1, q-H3=4, q-dt=0, words=969
- `/blog/electric-company-car-llc-tax-2026` — h2=7, loose-q(no "?")=0, q-H3=2, q-dt=0, words=955
- `/blog/form-5472-partner-program-company-formation-agents` — h2=6, loose-q(no "?")=1, q-H3=0, q-dt=0, words=955
- `/blog/form-5472-crypto-owner-transfers` — h2=5, loose-q(no "?")=1, q-H3=3, q-dt=0, words=923
- `/blog/business-car-mileage-vs-actual-2026` — h2=6, loose-q(no "?")=0, q-H3=2, q-dt=0, words=908
- `/blog/form-5472-partner-program-registered-agents` — h2=5, loose-q(no "?")=0, q-H3=0, q-dt=0, words=897
- `/blog/form-5472-llc-pays-personal-expenses` — h2=5, loose-q(no "?")=1, q-H3=3, q-dt=0, words=890
- … +12 more (see pages.tsv)

#### ≥3 visible Q&A (q-H2/summary) but no FAQPage schema (19)

- `/blog` — 1 q-H2 + 6 q-H3 + 0 summaries + 0 dt
- `/press` — 3 q-H2 + 0 q-H3 + 0 summaries + 0 dt
- `/services` — 5 q-H2 + 0 q-H3 + 0 summaries + 0 dt
- `/blog/ein-application-checklist-foreign-owned-llc` — 3 q-H2 + 0 q-H3 + 0 summaries + 0 dt
- `/blog/ein-cost-irs-free-vs-service` — 4 q-H2 + 0 q-H3 + 0 summaries + 0 dt
- `/blog/ein-processing-time-international-applicants` — 5 q-H2 + 0 q-H3 + 0 summaries + 0 dt
- `/blog/ein-responsible-party-foreign-owned-llc` — 5 q-H2 + 0 q-H3 + 0 summaries + 0 dt
- `/blog/itin-application-checklist-nonresidents` — 4 q-H2 + 0 q-H3 + 0 summaries + 0 dt
- `/blog/itin-caa-vs-mail-vs-tac` — 3 q-H2 + 0 q-H3 + 0 summaries + 0 dt
- `/blog/itin-cost-irs-fee-caa-service` — 4 q-H2 + 0 q-H3 + 0 summaries + 0 dt
- `/blog/itin-nonresident-rental-property` — 4 q-H2 + 0 q-H3 + 0 summaries + 0 dt
- `/blog/itin-processing-time-status-delays` — 5 q-H2 + 0 q-H3 + 0 summaries + 0 dt
- `/blog/topics/form-5472` — 0 q-H2 + 7 q-H3 + 0 summaries + 0 dt
- `/blog/topics/foreign-owned-llc` — 0 q-H2 + 6 q-H3 + 0 summaries + 0 dt
- `/blog/topics/non-resident` — 0 q-H2 + 4 q-H3 + 0 summaries + 0 dt
- … +4 more (see pages.tsv)

#### Has question H2 but first one lacks ≤60-word answer capsule (18)

- `/blog/form-5472-extension-vs-late-filing` — first capsule words=66, ok 6/7
- `/blog/foreign-llc-year-end-checklist-2026` — first capsule words=85, ok 3/8
- `/blog/1099-nec-deadline-2027-foreign-llc` — first capsule words=75, ok 6/8
- `/blog/llc-annual-report-late-fees-by-state` — first capsule words=80, ok 4/6
- `/blog/file-form-5472-for-clients-without-being-a-cpa` — first capsule words=69, ok 2/7
- `/blog/form-5472-in-house-vs-outsourced-firm` — first capsule words=73, ok 4/7
- `/blog/boi-reporting-foreign-owned-us-llc-2026` — first capsule words=72, ok 4/6
- `/blog/certificate-of-good-standing-foreign-owned-llc` — first capsule words=78, ok 2/5
- `/blog/sales-tax-nexus-foreign-owned-llc` — first capsule words=76, ok 1/9
- `/blog/form-5472-owner-becomes-us-tax-resident` — first capsule words=74, ok 0/1
- `/blog/form-5472-recordkeeping-checklist` — first capsule words=76, ok 0/1
- `/blog/form-5472-australia-residents-us-llc` — first capsule words=65, ok 8/9
- `/blog/form-5472-change-of-ownership` — first capsule words=66, ok 4/7
- `/blog/form-5472-foreign-corporate-owner` — first capsule words=75, ok 6/8
- `/blog/foreign-owned-llc-filing-requirements-checklist` — first capsule words=70, ok 1/5
- … +3 more (see pages.tsv)

#### Fewer than half of question H2s have ≤60-word capsule (9)

- `/blog/sales-tax-nexus-foreign-owned-llc` — ok 1/9
- `/blog/foreign-llc-year-end-checklist-2026` — ok 3/8
- `/blog/file-form-5472-for-clients-without-being-a-cpa` — ok 2/7
- `/blog/certificate-of-good-standing-foreign-owned-llc` — ok 2/5
- `/blog/single-member-llc-operating-agreement-foreign-owner` — ok 1/5
- `/blog/foreign-owned-llc-filing-requirements-checklist` — ok 1/5
- `/blog/registered-agent-foreign-owned-llc` — ok 1/4
- `/blog/form-5472-owner-becomes-us-tax-resident` — ok 0/1
- `/blog/form-5472-recordkeeping-checklist` — ok 0/1


#### Short (300–600 main words, indexable) (9)

- `/editorial-policy` — 336 words
- `/cookies` — 344 words
- `/blog/topics/form-ss-4` — 373 words
- `/blog/topics/penalty` — 378 words
- `/contact` — 388 words
- `/blog/topics/late-filing` — 395 words
- `/blog/topics/deadline` — 400 words
- `/blog/topics/partner-program` — 449 words
- `/security` — 470 words


#### Weakly linked: ≤ 2 inbound links from sitemap pages (excl. orphans) (8)

- `/irs-form-5472` — 2 inbound
- `/stripe-atlas-form-5472` — 2 inbound
- `/doola-form-5472` — 2 inbound
- `/firstbase-form-5472` — 2 inbound
- `/clemta-form-5472` — 2 inbound
- `/startglobal-form-5472` — 2 inbound
- `/zenind-form-5472` — 2 inbound
- `/northwest-registered-agent-form-5472` — 2 inbound


#### Fewer than 3 contextual (in-main) internal links (7)

- `/data-retention` — 0 in-main / 58 total
- `/contact` — 1 in-main / 60 total
- `/editorial-policy` — 1 in-main / 59 total
- `/terms` — 1 in-main / 59 total
- `/privacy` — 1 in-main / 59 total
- `/cookies` — 1 in-main / 59 total
- `/security` — 1 in-main / 59 total


#### Title < 30 chars (6)

- `/blog` — 20: Blog · Form5472 Prep
- `/cookies` — 23: Cookies · Form5472 Prep
- `/press` — 23: Form5472 Prep Press Kit
- `/blog/topics/ein` — 26: EIN guides · Form5472 Prep
- `/blog/topics/ftin` — 27: FTIN guides · Form5472 Prep
- `/blog/topics/itin` — 27: ITIN guides · Form5472 Prep


#### No JSON-LD at all (6)

- `/editorial-policy` — 
- `/terms` — 
- `/privacy` — 
- `/cookies` — 
- `/data-retention` — 
- `/security` — 


#### No BreadcrumbList (non-home) (6)

- `/editorial-policy` — no schema
- `/terms` — no schema
- `/privacy` — no schema
- `/cookies` — no schema
- `/data-retention` — no schema
- `/security` — no schema


#### FAQPage schema lists more questions than visible question markup (3)

- `/contact` — schema 5 vs visible 1
- `/pricing` — schema 9 vs visible 7
- `/compare/form-5472-filing-services` — schema 9 vs visible 8


#### [new check] Outcome claim (accepted without penalty / most … accepted / penalty removed), not negated (2)

- `/form-5472-statistics` — 55% of 2018 systemic Form 5471/5472 penalties were abated, or 71% by dollar value.
- `/blog/form-5472-filed-late-never-filed` — There is no formal waiver guarantee, but well-documented first-time late filings by foreign owners are commonly accepted without penalty.


#### Canonical differs only by trailing slash/case (self-variant) (1)

- `/` — https://www.form5472prep.com


_Issues with 0 pages:_ Non-200 final status; Sitemap URL redirects; noindex (meta or X-Robots-Tag) on a sitemap URL; Disallowed by robots.txt (User-agent: *); Canonical missing; Canonical relative / multiple / points elsewhere; Title missing; Title > 60 chars (SERP truncation risk); Duplicate title; Meta description missing; Meta description < 70 chars; Meta description > 160 chars; Duplicate meta description; H1 missing; H1 count > 1; Thin (< 300 main words, indexable); Orphan: 0 inbound internal links from other sitemap pages; Links to apex host form5472prep.com (301s to www); Broken internal links (4xx/5xx/error); Links to redirecting internal URLs; Images missing alt attribute; JSON-LD parse error; Article/BlogPosting without dateModified; FAQPage schema but no visible question markup (h2/h3/summary/dt); Brand "Form5472 Prep" absent from main content; Service/pricing/home page: "PTIN" absent from main content; Service/pricing/home page: no PTIN-review statement in main (any wording); Service/pricing/home page: exact phrase "tax accountant who holds an IRS PTIN" absent; og:image missing; [new check] Express turnaround stated as 24 hours / "within 24" (Express is now under 3 days); [new check] Form 7004 priced at $79 (stale; now $19); [new check] Form 7004 sentence with a price other than $19; [new check] "auto-generat*" near "reasonable cause"; [new check] FAQPage schema question with no exact visible match (glyphs ▾ + × stripped); [new check] FAQPage schema lists more questions than visible question elements (schema > visible); [new check] HowTo schema step count ≠ visible numbered steps

## 3a. Duplicate title groups (0 groups, 0 pages)

None.


## 3b. Duplicate meta description groups (0 groups, 0 pages)

None.


## 4. Internal link targets that are not a clean 200

Checked 721 unique internal targets (all page anchors plus llms.txt links; `/_next/` and `/api/` skipped). **4xx/5xx/errors: 0. Redirecting: 0.**

None. Every unique internal anchor target returned 200 with no redirect (soft-404 / trailing-slash / apex probes: see the Probes section in the comparison block at the top of this file).

Internal anchors pointing at robots-disallowed URLs: **124** unique targets (e.g. `/sign-in`, `/start?tier=standard`, `/start?tier=express`, `/partner/sign-in`, `/start?src=tool-deadline`, `/start?src=tool-checker`, `/start?src=tool-penalty`, `/start?src=tool-exchange-rates`); these are crawl-blocked by `Disallow: /start?` etc. — expected for CTA/tracking links, but they dilute link equity if not rel=nofollow.

## 5. Risky / stale wording

Each hit is judged by its **sentence**. Sources: `main` = inside `<main>`; `chrome` = header/footer outside `<main>`; `meta` = title+description; `jsonld` = structured-data strings; `tel-link`. Identical sentences are grouped; groups on > 20 pages are shown as site-wide template text. Full per-page list: `risky.tsv`. Labels: `us-claim?` = first-person sentence (we/our/Form5472 Prep) with no negation — needs a human read; `negated` = “not a CPA”-style disclaimer; `generic` = third-party/educational use; `add-on(ok)` = $99 framed as per-additional-year; `STARTING?` = $99 near start/from/base wording; `PHONE?` = 855-887-7737 with no fax/IRS/Ogden wording in the sentence; `irs-ctx-no-fax-word` = IRS/Ogden mentioned but the word “fax” is not.

| pattern | distinct sentences | pages | flagged sentences | flagged pages |
|---|---|---|---|---|
| CP-15 | 3 | 2 | 3 | 2 |
| 3-business-days+Express | 0 | 0 | 0 | 0 |
| $99 | 96 | 162 | 0 | 0 |
| no-Form-7004 | 3 | 2 | 0 | 0 |
| online filer | 0 | 0 | 0 | 0 |
| automatically generat* | 0 | 0 | 0 | 0 |
| IRS-approved | 1 | 1 | 1 | 1 |
| licensed | 14 | 7 | 2 | 1 |
| CPA | 182 | 287 | 21 | 15 |
| guarantee | 115 | 73 | 10 | 33 |
| money-back | 16 | 37 | 11 | 33 |
| no human review | 0 | 0 | 0 | 0 |
| 855-887-7737 | 215 | 287 | 4 | 2 |
| filed-within-24h | 0 | 0 | 0 | 0 |
| express-24h | 0 | 0 | 0 | 0 |
| express-under-3-days | 110 | 167 | 0 | 0 |
| 7004-price | 6 | 4 | 0 | 0 |
| DIIRSP | 282 | 267 | 282 | 267 |
| auto-generat+reasonable-cause | 0 | 0 | 0 | 0 |
| outcome: accepted-without-penalty | 1 | 1 | 1 | 1 |
| outcome: most-accepted | 0 | 0 | 0 | 0 |
| outcome: penalty-removed | 15 | 10 | 1 | 1 |
| money-back-guarantee | 10 | 33 | 10 | 33 |

### CP-15 — 3 hit(s) on 2 page(s)

- [hit / main+jsonld] “The IRS manual (IRM 20.1.9.5.2) says a CP 215 is generated once a Form 5472 penalty is assessed; CP 15 is the equivalent notice for individual accounts.” — `/faq`
- [hit / main+jsonld] “What's a CP 15 or CP 215 notice?” — `/form-5472-penalty`
- [hit / main+jsonld] “CP 15 is the IRS's Notice of Penalty Charge for penalties assessed on an individual's account.” — `/form-5472-penalty`

### 3-business-days+Express — 0 hit(s) on 0 page(s)

None.

### $99 — 202 hit(s) on 162 page(s)


_Not flagged (96 distinct sentences, 202 page-hits): add-on(ok), unclear — first 9 incl. site-wide:_
- [add-on(ok) / main] “+ $99 per additional year, either tier · Saves you from the $25,000-per-form IRS penalty” — **site-wide, 30 pages**
- [add-on(ok) / main] “+ $99 per additional past tax year, either tier · Saves you from the $25,000-per-form IRS penalty” — `/`
- [add-on(ok) / main+jsonld] “Pricing is +$99 per additional past year on either tier.” — `/`
- [add-on(ok) / main+jsonld] “Multi-year filings add a flat $99 per additional past year — disclosed up front and shown in the checkout summary before you pay.” — `/`
- [add-on(ok) / main] “+ $99 per additional past tax year, either tier · A missed or incomplete filing can cost a $25,000-per-form IRS penalty” — `/pricing`
- [add-on(ok) / main+jsonld] “Add $99 per additional past year on either tier.” — `/pricing`
- [add-on(ok) / main+jsonld] “Multi-year filings add a flat $99 per additional past year, disclosed up front.” — `/faq`

### no-Form-7004 — 3 hit(s) on 2 page(s)


_Not flagged (3 distinct sentences, 3 page-hits): generic — first 9 incl. site-wide:_
- [generic / main] “Don't file Form 7004 if you're already past April 15 — at that point file the actual Form 5472 + 1120 directly with a DIIRSP reasonable cause statement.” — `/form-5472-deadline`
- [generic / main] “If you did not file Form 7004, your 2025 return has been late since 16 April 2026 and the penalty exposure is already running.” — `/blog/form-5472-deadline-2026`
- [generic / main] “The part that is specific to foreign-owned LLCs, and that catches people out: you cannot file Form 7004 the normal way.” — `/blog/form-5472-deadline-2026`

### online filer — 0 hit(s) on 0 page(s)

None.

### automatically generat* — 0 hit(s) on 0 page(s)

None.

### IRS-approved — 1 hit(s) on 1 page(s)

- [hit / main] “Those entries are editorial examples, not IRS-approved wording.” — `/blog/business-car-mileage-vs-actual-2026`

### licensed — 14 hit(s) on 7 page(s)

- [us-claim? / main] “We do not act as a registered agent, form LLCs, or file BOI reports, and we are not a law or CPA firm — nothing here is legal or tax advice; for your registered-agent appointment itself, use a licensed registered-agent provider or your formation state's own pr” — `/blog/registered-agent-foreign-owned-llc`
- [us-claim? / main+jsonld] “It varies by provider and state, and we have not verified current commercial pricing here — get a quote from a licensed registered-agent service in your formation state.” — `/blog/registered-agent-foreign-owned-llc`

_Not flagged (12 distinct sentences, 12 page-hits): generic — first 9 incl. site-wide:_
- [generic / main] “Done-for-you filing service States that a named licensed CPA reviews the filing” — `/compare/form-5472-filing-services`
- [generic / main] “Done-for-you filing service Includes "licensed CPA preparation and signature"” — `/compare/form-5472-filing-services`
- [generic / main] “Done-for-you filing service States "A licensed CPA signs"” — `/compare/form-5472-filing-services`
- [generic / main] “For the UAE side, talk to a UAE-licensed tax professional.” — `/form-5472-uae`
- [generic / main+jsonld] “Whether your US LLC creates any UAE Corporate Tax exposure is a UAE-side question for a licensed UAE tax professional.” — `/form-5472-uae`
- [generic / main] “Its page states "CPA-prepared, reviewed & signed" by a "U.S.-licensed CPA (verified)"” — `/blog/form-5472-filing-service-comparison`

### CPA — 554 hit(s) on 287 page(s)

- [us-claim? / main] “Why use Form5472 Prep instead of CPA or DIY?” — `/`
- [us-claim? / main] “How does Form5472 Prep compare with a CPA or DIY?” — `/pricing`
- [us-claim? / main] “The table compares setup time, filing delivery, proof storage, and cost across Form5472 Prep, CPA, and DIY options.” — `/pricing`
- [us-claim? / main+jsonld] “Yes, we work with formation agencies, registered agents, CPA and accounting firms, and consultants who manage US LLCs for multiple foreign-owned clients.” — `/faq`
- [us-claim? / meta] “Partner program: formation agencies, CPA firms and registered agents batch filings in one partner account; client signs by secure link; we review, fax to IRS.” — `/partners`
- [us-claim? / main] “Formation-provider annual bundle Pricing page: "our in-house tax and CPA teams"” — `/compare/form-5472-filing-services`
- [us-claim? / main] “Form 5472 for CPAs works the same way: we prepare the package, you keep the client relationship.” — `/services/form-5472-for-accountants`
- [us-claim? / meta+jsonld] “Form 5472 for accountants, tax preparers and CPA firms: refer clients, or run their filings from a partner account while we prepare, review and fax.” — `/services/form-5472-for-accountants`
- [us-claim? / main+jsonld] “Our service is for the standard disregarded-entity case; if you owe corporate tax you need a CPA, not us.” — `/form-5472-vs-1120`
- [us-claim? / main] “Consult a CPA, not our service.” — `/delaware-llc-form-5472`
- [us-claim? / main+jsonld] “Get a CPA involved for multi-entity setups — our wizard supports single-entity filings only.” — `/pro-forma-1120`
- [us-claim? / main+jsonld] “Consult a CPA familiar with foreign owners — our service doesn't handle the full-1120 case.” — `/form-1120-foreign-owned-llc`
- [us-claim? / main] “Why use Form5472 Prep instead of a CPA or DIY?” — `/irs-form-5472`
- [us-claim? / main] “Form5472 Prep is built for the standard foreign-owned single-member LLC filing workflow rather than a broad CPA engagement or blank IRS-form DIY process.” — `/irs-form-5472`
- [us-claim? / main] “For the standard foreign-owned single-member LLC profile, our service is dramatically faster and lower-cost than CPA, and dramatically lower risk than DIY.” — `/irs-form-5472`
- [us-claim? / main] “Five ways to file Form 5472 for a foreign-owned US LLC: Snapfile at $79 with an AI system review; Form5472 Prep at $149 with a tax accountant holding an IRS PTIN; form5472.online at $448 to $547, advertised as CPA-prepared; and formation bundles, Firstbase at ” — `/blog/form-5472-filing-service-comparison`
- [us-claim? / main] “Its pricing page refers to "our in-house tax and CPA teams"” — `/blog/form-5472-filing-service-comparison`
- [us-claim? / main] “At $899 and $1,500 a year, Firstbase's page describes a "full-service process by dedicated tax experts" and doola's pricing page refers to "our in-house tax and CPA teams" — their own words, for bundles that cover more than this one filing.” — `/blog/form-5472-filing-service-comparison`
- [us-claim? / main+jsonld] “Are you a CPA firm we can present as our tax adviser?” — `/blog/offer-form-5472-filing-as-a-service`
- [us-claim? / main] “Form5472 Prep is a form-preparation and filing-courier service rather than a CPA firm.” — `/blog/form-5472-partner-program-registered-agents`
- [us-claim? / main] “We do not prepare Form 1065 partnership returns — if your LLC is a partnership, you need a CPA or enrolled agent who does.” — `/blog/multi-member-llc-form-5472-or-1065`

_Not flagged (161 distinct sentences, 533 page-hits): generic, negated — first 9 incl. site-wide:_
- [negated / main] “We are not a CPA firm and do not give tax advice.” — **site-wide, 50 pages**
- [generic / chrome+main+jsonld] “Form 5472 for Accountants, CPAs and Tax Preparers” — **site-wide, 287 pages**
- [generic / main+jsonld] “Are you a CPA firm?” — `/faq`
- [negated / main] “We are not a CPA firm and do not give tax or legal advice.” — `/form-7004-extension`
- [generic / main] “For agencies, CPA firms & registered agents” — `/partners`
- [generic / main+jsonld] “Formation agencies, registered agents, CPA and accounting firms, and consultants who manage US LLCs for multiple foreign-owned clients and need to batch Form 5472 filings under a single account.” — `/partners`
- [generic / jsonld] “Formation agencies, CPA firms, and registered agents managing foreign-owned US LLCs” — `/partners`
- [negated / main+jsonld] “We are not a CPA firm or a general tax firm.” — `/about`

### guarantee — 173 hit(s) on 73 page(s)

- [us-claim? / main+jsonld] “We offer a 100% money-back guarantee if we fail to submit your filing to the IRS.” — `/faq`
- [us-claim? / main] “Our service handles the federal piece in 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit.” — `/wyoming-llc-form-5472`
- [us-claim? / main] “Our service handles the federal piece in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if the IRS ever assesses a penalty because of an error in our preparation, we handle the response with the IRS at no charge.” — `/form-5472-germany`
- [us-claim? / main] “Our service handles the federal filing in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if the IRS ever assesses a penalty because of an error in our preparation, we handle the response with the IRS at no charge.” — `/form-5472-uae`
- [us-claim? / main] “Money-back guarantee if we fail to submit.” — `/irs-form-5472`
- [us-claim? / main] “Our service is built for this profile — fixed pricing, accountant-reviewed, with a money-back guarantee if we fail to submit.” — `/stripe-atlas-form-5472`
- [us-claim? / main] “100% money-back guarantee if we fail to submit your filing.” — `/file-form-5472`, `/form-1120-foreign-owned-llc`, `/irs-form-5472`
- [us-claim? / main+jsonld] “100% money-back guarantee if we fail to submit your filing to the IRS.” — `/`, `/late-form-5472`, `/form-5472-vs-1120`, `/form-5472-fax-number`, `/stripe-atlas-form-5472`, `/form-5472-reasonable-cause-statement`
- [us-claim? / main] “100% money-back guarantee if we fail to submit.” — `/file-form-5472`, `/diirsp`, `/delaware-llc-form-5472`, `/pro-forma-1120`, `/form-1120-disregarded-entity`, `/1120-pro-forma-instructions`, `/form-5472-deadline`, `/single-member-llc-foreign-owner` … +8
- [us-claim? / main] “100% money-back guarantee if we fail to submit” — **site-wide, 30 pages**

_Not flagged (105 distinct sentences, 112 page-hits): negated, generic — first 9 incl. site-wide:_
- [negated / main+jsonld] “Keep it with your submitted package; it is transmission evidence, not IRS acceptance or a guarantee of penalty relief.” — `/`
- [negated / main+jsonld] “The Form 5472 penalty can be abated, but there are no guarantees.” — `/faq`
- [negated / main+jsonld] “This route can avoid mailing an original passport to the IRS, but it does not guarantee ITIN eligibility or approval.” — `/faq`
- [negated / main+jsonld] “These are processing estimates, not a guaranteed issuance date; requests for additional information can delay a decision.” — `/faq`
- [negated / main+jsonld] “Each application has its own eligibility, documentation and IRS processing timeline; obtaining one does not guarantee or automatically require the other.” — `/faq`
- [negated / main+jsonld] “The provider's timestamped receipt is transmission evidence, not an IRS-issued acceptance or a guarantee of penalty relief.” — `/faq`

### money-back — 81 hit(s) on 37 page(s)

- [us-claim? / main+jsonld] “We offer a 100% money-back guarantee if we fail to submit your filing to the IRS.” — `/faq`
- [us-claim? / main] “Our service handles the federal piece in 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit.” — `/wyoming-llc-form-5472`
- [us-claim? / main] “Our service handles the federal piece in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if the IRS ever assesses a penalty because of an error in our preparation, we handle the response with the IRS at no charge.” — `/form-5472-germany`
- [us-claim? / main] “Our service handles the federal filing in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if the IRS ever assesses a penalty because of an error in our preparation, we handle the response with the IRS at no charge.” — `/form-5472-uae`
- [us-claim? / main] “IRS fax delivery included. Money-back guarantee if we fail to submit.” — `/irs-form-5472`
- [us-claim? / main] “Our service is built for this profile — fixed pricing, accountant-reviewed, with a money-back guarantee if we fail to submit.” — `/stripe-atlas-form-5472`
- [us-claim? / main] “100% money-back guarantee if we fail to submit your filing.” — `/file-form-5472`, `/form-1120-foreign-owned-llc`, `/irs-form-5472`
- [us-claim? / main+jsonld] “100% money-back guarantee if we fail to submit your filing to the IRS.” — `/`, `/late-form-5472`, `/form-5472-vs-1120`, `/form-5472-fax-number`, `/stripe-atlas-form-5472`, `/form-5472-reasonable-cause-statement`
- [us-claim? / main] “100% money-back if we fail to submit” — `/`, `/form-5472-instructions`, `/late-form-5472`, `/form-5472-vs-1120`, `/wyoming-llc-form-5472`, `/delaware-llc-form-5472`, `/form-1120-disregarded-entity`, `/form-5472-deadline` … +7
- [us-claim? / main] “100% money-back guarantee if we fail to submit.” — `/file-form-5472`, `/diirsp`, `/delaware-llc-form-5472`, `/pro-forma-1120`, `/form-1120-disregarded-entity`, `/1120-pro-forma-instructions`, `/form-5472-deadline`, `/single-member-llc-foreign-owner` … +8
- [us-claim? / main] “100% money-back guarantee if we fail to submit” — **site-wide, 30 pages**

_Not flagged (5 distinct sentences, 5 page-hits): generic — first 9 incl. site-wide:_
- [generic / main] “Later, the LLC transfers money back to you.” — `/blog/chiang-mai-digital-nomad-llc-coworking-owner-paid-costs`
- [generic / main] “Do not delete the first event because the owner eventually received the money back.” — `/blog/chiang-mai-digital-nomad-llc-coworking-owner-paid-costs`
- [generic / main] “LLC distributed money back to the owner.” — `/blog/california-llc-foreign-owner-tax-filing`
- [generic / main] “The LLC sent money back to the owner as a withdrawal or distribution.” — `/blog/delaware-llc-foreign-owner-tax-filing`
- [generic / main] “Paying the LLC's registered agent fee or state renewal from your personal Canadian credit card — the LLC owes you that money back, making it either a capital contribution or a loan, both reportable” — `/blog/form-5472-canada-residents-us-llc`

### no human review — 0 hit(s) on 0 page(s)

None.

### 855-887-7737 — 563 hit(s) on 287 page(s)

- [PHONE? / main] “Does the destination match 855-887-7737 ?” — `/blog/form-5472-irs-receipt-confirmation-status`
- [PHONE? / main] “+1 855-887-7737” — `/blog/form-5472-irs-receipt-confirmation-status`
- [PHONE? / main+jsonld] “Enter 855-887-7737 and recheck every digit.” — `/blog/how-to-fax-form-5472-irs`
- [PHONE? / jsonld] “Enter 855-887-7737 and recheck every digit” — `/blog/how-to-fax-form-5472-irs`

_Not flagged (211 distinct sentences, 559 page-hits): fax-context(ok), irs-ctx-no-fax-word — first 9 incl. site-wide:_
- [fax-context(ok) / chrome] “Filed to the IRS Ogden PIN Unit · IRS fax +1-855-887-7737” — **site-wide, 287 pages**
- [fax-context(ok) / main] “Form5472 Prep filing questionnaire, IRS fax delivery to Ogden PIN Unit (+1-855-887-7737)” — `/`
- [fax-context(ok) / main+jsonld] “After you sign, we fax the complete package to the IRS Ogden PIN Unit at +1-855-887-7737.” — `/`
- [fax-context(ok) / main+jsonld] “The special IRS instructions allow fax to +1-855-887-7737 or mail to the dedicated Ogden PIN Unit address.” — `/`
- [fax-context(ok) / jsonld] “IRS fax delivery to Ogden PIN Unit (+1-855-887-7737)” — `/`
- [fax-context(ok) / main+jsonld] “The IRS Form 5472 instructions say a foreign-owned U.S. disregarded entity cannot file Form 5472 electronically, so it goes with its pro forma Form 1120 by fax to +1-855-887-7737 or by mail to the IRS Ogden PIN Unit.” — `/faq`
- [fax-context(ok) / main] “Where to send it: fax (300 DPI or higher) to +1-855-887-7737, or mail to Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201.” — `/do-i-need-to-file-form-5472`

### filed-within-24h — 0 hit(s) on 0 page(s)

None.

### express-24h — 0 hit(s) on 0 page(s)

None.

### express-under-3-days — 242 hit(s) on 167 page(s)


_Not flagged (110 distinct sentences, 242 page-hits): ok(under-3-days) — first 9 incl. site-wide:_
- [ok(under-3-days) / main] “✓ Ready for you to check and sign in under 3 days, 7 days a week” — **site-wide, 31 pages**
- [ok(under-3-days) / main] “Ready to sign in under 3 days” — **site-wide, 32 pages**
- [ok(under-3-days) / main] “Form5472 Prep is a fixed-fee specialist: $149 (5-7 business days) or $199 (ready to sign in under 3 days), with tax-accountant review, IRS fax delivery and a timestamped receipt included.” — `/`
- [ok(under-3-days) / main] “Same filing either way — pick the turnaround you need: ready in 5-7 business days, or ready to sign in under 3 days on Express.” — `/pricing`
- [ok(under-3-days) / main] “Ready for you to check and sign in under 3 days, 7 days a week” — `/pricing`
- [ok(under-3-days) / main+jsonld] “Standard filing ($149) is ready in 5-7 business days; express filing ($199) is ready to sign in under 3 days and comes with priority email support.” — `/pricing`
- [ok(under-3-days) / meta] “Pricing for Form 5472 + pro forma 1120 filing: Standard $149 ready in 5-7 business days, Express $199 ready to sign in under 3 days, IRS fax included.” — `/pricing`
- [ok(under-3-days) / main+jsonld] “Standard is ready in 5-7 business days at $149, while Express is ready for you to check and sign in under 3 days from your order, 7 days a week, at $199 and adds priority email support.” — `/faq`

### 7004-price — 7 hit(s) on 4 page(s)


_Not flagged (6 distinct sentences, 7 page-hits): ok($19) — first 9 incl. site-wide:_
- [ok($19) / main+jsonld] “Form5472 Prep charges $19 per LLC per tax year to prepare Form 7004 and fax it to the IRS Ogden PIN Unit, with the fax confirmation emailed to you.” — `/form-7004-extension`
- [ok($19) / main] “Order the Form 7004 extension — $19” — `/form-7004-extension`
- [ok($19) / meta] “Form 7004 Extension for Foreign-Owned LLCs — $19” — `/form-7004-extension`
- [ok($19) / meta] “Form 7004 extension for foreign-owned single-member LLCs, $19 per tax year.” — `/form-7004-extension`
- [ok($19) / main+jsonld] “Form 7004 extension filing ($19 per LLC per tax year) for foreign-owned US LLCs, faxed to the IRS Ogden PIN Unit.” — `/about`
- [ok($19) / main] “Form 7004 — $19” — `/`, `/pricing`

### DIIRSP — 604 hit(s) on 267 page(s)

- [hit / main] “DIIRSP = IRS Delinquent International Information Return Submission Procedure.” — `/`
- [hit / main] “If you've missed prior years, the Delinquent International Information Return Submission Procedure (DIIRSP) lets you catch up with a reasonable cause statement — we generate this for you.” — `/`
- [hit / main] “The package includes the cover letter, pro forma Form 1120, Form 5472, supporting statement, and a late-filing reasonable cause statement when the IRS DIIRSP procedure applies.” — `/`
- [hit / main+jsonld] “After payment, we generate the package from your answers: the cover letter, pro forma Form 1120, Form 5472, Part V supporting statement, and, when the filing is late under the IRS DIIRSP procedure, a reasonable cause statement.” — `/`
- [hit / main] “If DIIRSP” — `/`
- [hit / main] “Only for DIIRSP filings.” — `/`
- [hit / main] “The guides cover Form 5472, DIIRSP, the pro forma Form 1120, and late filings.” — `/`
- [hit / main] “Filing late under DIIRSP” — `/`
- [hit / main+jsonld] “We'll auto-flag the filing as DIIRSP (Delinquent International Information Return Submission Procedure) and include a reasonable cause statement requesting penalty abatement.” — `/`
- [hit / jsonld] “Includes a reasonable-cause statement for late (DIIRSP) filings.” — `/`
- [hit / main+jsonld] “Both tiers also include a reasonable-cause letter on late / DIIRSP filings and a filing reminder in the second week of January for next year.” — `/pricing`
- [hit / main+jsonld] “What if I'm filing for multiple past years (DIIRSP)?” — `/pricing`
- [hit / main+jsonld] “We include a reasonable-cause statement on every late filing so the IRS Delinquent International Information Return Submission Procedure (DIIRSP) is invoked correctly.” — `/pricing`
- [hit / main+jsonld] “Late filings can sometimes include a reasonable cause explanation under DIIRSP.” — `/faq`
- [hit / main+jsonld] “Many late filers pursue reasonable-cause relief through DIIRSP by submitting the late return with a Reasonable Cause Statement.” — `/faq`
- [hit / main+jsonld] “We auto-flag the filing as DIIRSP and include a reasonable cause statement requesting penalty abatement, with additional past tax years priced at $99 each.” — `/faq`
- [hit / main+jsonld] “If the Form 5472 deadline already passed, DIIRSP with a reasonable-cause statement is the standard remedy for a late Form 5472 package.” — `/faq`
- [hit / main+jsonld] “If April 15 was missed without Form 7004, file the actual return under DIIRSP with the late filing package.” — `/faq`
- [hit / main] “If the IRS hasn't contacted you, its DIIRSP procedures say to file the late return through normal filing procedures, optionally with a reasonable-cause statement.” — `/form-5472-deadline-calculator`
- [hit / main+jsonld] “If you are not under IRS examination or investigation and the IRS hasn't contacted you about the missing return, its Delinquent International Information Return Submission Procedures (DIIRSP) say to file it through normal filing procedures, optionally with a r” — `/form-5472-deadline-calculator`
- [hit / main] “Use this as a statutory exposure estimate, then compare it with the ordinary catch-up route: file the missing Form 5472 package and include a reasonable-cause statement under DIIRSP.” — `/form-5472-penalty-calculator`
- [hit / main] “If you're not under IRS examination and the IRS hasn't contacted you about the missing returns, its Delinquent International Information Return Submission Procedures (DIIRSP) say to file them through normal filing procedures, and you may attach a reasonable-ca” — `/form-5472-penalty-calculator`
- [hit / main] “Read the late-filing overview for DIIRSP late-filing steps and the reasonable-cause letter guide for abatement letter requirements .” — `/form-5472-penalty-calculator`
- [hit / main] “If the IRS has not contacted you yet, the relief path is a DIIRSP filing that pairs late information returns with a reasonable-cause statement.” — `/form-5472-penalty-calculator`
- [hit / main] “We prepare the missing Form 5472 package, pro forma Form 1120, and reasonable-cause statement for DIIRSP catch-up filings.” — `/form-5472-penalty-calculator`
- [hit / meta+jsonld] “Estimate Form 5472 late-filing exposure, see IRS penalty citations, and review the DIIRSP reasonable-cause path for catching up.” — `/form-5472-penalty-calculator`
- [hit / main] “If you are not under IRS examination or investigation and the IRS has not contacted you about the missing returns, the IRS says to file them through normal filing procedures (DIIRSP), where you may attach a reasonable-cause statement.” — `/form-5472-late-filing-checker`
- [hit / main] “DIIRSP: file the late returns with a reasonable-cause statement” — `/form-5472-late-filing-checker`
- [hit / main] “DIIRSP: file the late returns, and have your reason reviewed first” — `/form-5472-late-filing-checker`
- [hit / main] “Who the DIIRSP route is for” — `/form-5472-late-filing-checker`
- [hit / main] “What DIIRSP does not promise” — `/form-5472-late-filing-checker`
- [hit / main] “We show that risk on every DIIRSP result.” — `/form-5472-late-filing-checker`
- [hit / main] “The DIIRSP page points to two other options.” — `/form-5472-late-filing-checker`
- [hit / main+jsonld] “What is DIIRSP?” — `/form-5472-late-filing-checker`
- [hit / main+jsonld] “The Delinquent International Information Return Submission Procedures are the IRS's instructions for filing late international information returns such as Form 5472.” — `/form-5472-late-filing-checker`
- [hit / main+jsonld] “Then DIIRSP no longer fits, because it covers taxpayers not yet contacted.” — `/form-5472-late-filing-checker`
- [hit / meta] “Answer five questions to see which IRS late-filing route fits your foreign-owned LLC: DIIRSP with reasonable cause, a penalty-notice response, or a review.” — `/form-5472-late-filing-checker`
- [hit / jsonld] “Answer five questions to see which IRS late-filing route fits your foreign-owned LLC: DIIRSP with a reasonable-cause statement, a penalty-notice response, or a review first.” — `/form-5472-late-filing-checker`
- [hit / main] “DIIRSP 2” — `/blog/topics`
- [hit / main+jsonld] “Late (DIIRSP) catch-up filings, with a reasonable cause statement.” — `/about`
- … +242 more distinct sentences (see risky.tsv)

### auto-generat+reasonable-cause — 0 hit(s) on 0 page(s)

None.

### outcome: accepted-without-penalty — 1 hit(s) on 1 page(s)

- [CLAIM? / main] “There is no formal waiver guarantee, but well-documented first-time late filings by foreign owners are commonly accepted without penalty.” — `/blog/form-5472-filed-late-never-filed`

### outcome: most-accepted — 0 hit(s) on 0 page(s)

None.

### outcome: penalty-removed — 17 hit(s) on 10 page(s)

- [CLAIM? / main] “55% of 2018 systemic Form 5471/5472 penalties were abated, or 71% by dollar value.” — `/form-5472-statistics`

_Not flagged (14 distinct sentences, 16 page-hits): disclaimer-or-question — first 9 incl. site-wide:_
- [disclaimer-or-question / main] “The IRS decides whether any penalty is removed.” — `/form-5472-late-filing-checker`
- [disclaimer-or-question / main] “The checker points to the IRS route that usually applies; the IRS decides whether any penalty is removed.” — `/form-5472-late-filing-checker`
- [disclaimer-or-question / main+jsonld] “How often are Form 5472 penalties abated?” — `/form-5472-statistics`
- [disclaimer-or-question / main] “How do you get the penalty abated under DIIRSP?” — `/form-5472-penalty`
- [disclaimer-or-question / main+jsonld] “If I file under DIIRSP, am I guaranteed the penalty is waived?” — `/form-5472-penalty`
- [disclaimer-or-question / main+jsonld] “Does DIIRSP guarantee my penalty is waived?” — `/diirsp`

### money-back-guarantee — 61 hit(s) on 33 page(s)

- [hit / main+jsonld] “We offer a 100% money-back guarantee if we fail to submit your filing to the IRS.” — `/faq`
- [hit / main] “Our service handles the federal piece in 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit.” — `/wyoming-llc-form-5472`
- [hit / main] “Our service handles the federal piece in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if the IRS ever assesses a penalty because of an error in our preparation, we handle the response with the IRS at no charge.” — `/form-5472-germany`
- [hit / main] “Our service handles the federal filing in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if the IRS ever assesses a penalty because of an error in our preparation, we handle the response with the IRS at no charge.” — `/form-5472-uae`
- [hit / main] “IRS fax delivery included. Money-back guarantee if we fail to submit.” — `/irs-form-5472`
- [hit / main] “Our service is built for this profile — fixed pricing, accountant-reviewed, with a money-back guarantee if we fail to submit.” — `/stripe-atlas-form-5472`
- [hit / main] “100% money-back guarantee if we fail to submit your filing.” — `/file-form-5472`, `/form-1120-foreign-owned-llc`, `/irs-form-5472`
- [hit / main+jsonld] “100% money-back guarantee if we fail to submit your filing to the IRS.” — `/`, `/late-form-5472`, `/form-5472-vs-1120`, `/form-5472-fax-number`, `/stripe-atlas-form-5472`, `/form-5472-reasonable-cause-statement`
- [hit / main] “100% money-back guarantee if we fail to submit.” — `/file-form-5472`, `/diirsp`, `/delaware-llc-form-5472`, `/pro-forma-1120`, `/form-1120-disregarded-entity`, `/1120-pro-forma-instructions`, `/form-5472-deadline`, `/single-member-llc-foreign-owner` … +8
- [hit / main] “100% money-back guarantee if we fail to submit” — **site-wide, 30 pages**

All `tel:` hrefs on the site: none.

## 6. Question-form H2 and answer-capsule coverage by section

Pages counted are content pages: legal pages, the /blog index and the 13 `/blog/topics/*` listing pages are excluded (they are navigation lists). “Question H2” = `<h2>` text ending in `?` inside `<main>` (nav/footer/aside stripped). “Capsule” = first `<p>` after the first question H2 (before the next h1/h2) with ≤ 60 words. “Loose” = H2 starts with an interrogative but has no `?`.

| section | pages | 0 q-H2 | ≥1 q-H2 | avg q-H2 / page | loose-q (no ?) pages | first capsule ≤60w | avg capsule ratio | avg H2 | pages with q-H3 | pages with `<summary>` Q&A |
|---|---|---|---|---|---|---|---|---|---|---|
| home | 1 | 0 | 1 | 10.0 | 0 | 1/1 | 0.9 | 13.0 | 1 | 0 |
| pricing | 1 | 0 | 1 | 4.0 | 0 | 1/1 | 1.0 | 5.0 | 1 | 0 |
| services | 13 | 0 | 13 | 6.5 | 0 | 13/13 | 1.0 | 9.6 | 0 | 0 |
| product | 4 | 0 | 4 | 4.8 | 0 | 4/4 | 0.9 | 5.3 | 4 | 0 |
| tools | 8 | 0 | 8 | 3.6 | 0 | 8/8 | 1.0 | 5.9 | 8 | 1 |
| guides | 31 | 0 | 31 | 8.6 | 0 | 31/31 | 1.0 | 12.2 | 0 | 0 |
| compare | 2 | 0 | 2 | 6.0 | 0 | 2/2 | 0.8 | 8.5 | 0 | 0 |
| blog | 201 | 25 | 176 | 5.7 | 14 | 158/176 | 0.9 | 8.4 | 180 | 0 |
| info | 6 | 2 | 4 | 4.8 | 1 | 4/4 | 1.0 | 8.0 | 1 | 0 |

### /services (hub + 12 service pages): 13 pages — 0 with no question H2, 0 with q-H2 but no ≤60-word first capsule

### Guides `/[seoSlug]` (30): 31 pages — 0 with no question H2, 0 with q-H2 but no ≤60-word first capsule

### /blog (index + posts): 201 pages — 25 with no question H2, 18 with q-H2 but no ≤60-word first capsule

**No question H2** (25; top 15 by word count):
- `/blog/oregon-llc-foreign-owner-tax-filing` — h2=7, loose-q=0, q-H3=4, q-dt=0, q-summary=0, words=1068, faqSchema=4
- `/blog/form-5472-noncash-property-transfers` — h2=6, loose-q=0, q-H3=4, q-dt=0, q-summary=0, words=1032, faqSchema=4
- `/blog/washington-llc-foreign-owner-tax-filing` — h2=7, loose-q=0, q-H3=4, q-dt=0, q-summary=0, words=1021, faqSchema=4
- `/blog/form-5472-partner-program-how-it-works` — h2=7, loose-q=2, q-H3=0, q-dt=0, q-summary=0, words=1004, faqSchema=0
- `/blog/form-5472-royalties-license-fees-intellectual-property` — h2=6, loose-q=1, q-H3=4, q-dt=0, q-summary=0, words=989, faqSchema=4
- `/blog/white-label-form-5472-filing-accounting-firms` — h2=6, loose-q=2, q-H3=0, q-dt=0, q-summary=0, words=980, faqSchema=0
- `/blog/uk-company-car-vat-buy-lease-electric` — h2=7, loose-q=0, q-H3=2, q-dt=0, q-summary=0, words=979, faqSchema=2
- `/blog/form-5472-reasonable-estimates-small-amounts` — h2=8, loose-q=1, q-H3=4, q-dt=0, q-summary=0, words=969, faqSchema=4
- `/blog/electric-company-car-llc-tax-2026` — h2=7, loose-q=0, q-H3=2, q-dt=0, q-summary=0, words=955, faqSchema=2
- `/blog/form-5472-partner-program-company-formation-agents` — h2=6, loose-q=1, q-H3=0, q-dt=0, q-summary=0, words=955, faqSchema=0
- `/blog/form-5472-crypto-owner-transfers` — h2=5, loose-q=1, q-H3=3, q-dt=0, q-summary=0, words=923, faqSchema=3
- `/blog/business-car-mileage-vs-actual-2026` — h2=6, loose-q=0, q-H3=2, q-dt=0, q-summary=0, words=908, faqSchema=2
- `/blog/form-5472-partner-program-registered-agents` — h2=5, loose-q=0, q-H3=0, q-dt=0, q-summary=0, words=897, faqSchema=0
- `/blog/form-5472-llc-pays-personal-expenses` — h2=5, loose-q=1, q-H3=3, q-dt=0, q-summary=0, words=890, faqSchema=3
- `/blog/lisbon-digital-nomad-us-llc-accountant-handoff` — h2=6, loose-q=1, q-H3=2, q-dt=0, q-summary=0, words=849, faqSchema=2
- … +10 more

**Question H2 but weak capsule** (18):
- `/blog/form-5472-extension-vs-late-filing` — first capsule words=66 (−1 = no <p>), ok 6/7
- `/blog/foreign-llc-year-end-checklist-2026` — first capsule words=85 (−1 = no <p>), ok 3/8
- `/blog/1099-nec-deadline-2027-foreign-llc` — first capsule words=75 (−1 = no <p>), ok 6/8
- `/blog/llc-annual-report-late-fees-by-state` — first capsule words=80 (−1 = no <p>), ok 4/6
- `/blog/file-form-5472-for-clients-without-being-a-cpa` — first capsule words=69 (−1 = no <p>), ok 2/7
- `/blog/form-5472-in-house-vs-outsourced-firm` — first capsule words=73 (−1 = no <p>), ok 4/7
- `/blog/boi-reporting-foreign-owned-us-llc-2026` — first capsule words=72 (−1 = no <p>), ok 4/6
- `/blog/certificate-of-good-standing-foreign-owned-llc` — first capsule words=78 (−1 = no <p>), ok 2/5
- `/blog/sales-tax-nexus-foreign-owned-llc` — first capsule words=76 (−1 = no <p>), ok 1/9
- `/blog/form-5472-owner-becomes-us-tax-resident` — first capsule words=74 (−1 = no <p>), ok 0/1
- `/blog/form-5472-recordkeeping-checklist` — first capsule words=76 (−1 = no <p>), ok 0/1
- `/blog/form-5472-australia-residents-us-llc` — first capsule words=65 (−1 = no <p>), ok 8/9
- `/blog/form-5472-change-of-ownership` — first capsule words=66 (−1 = no <p>), ok 4/7
- `/blog/form-5472-foreign-corporate-owner` — first capsule words=75 (−1 = no <p>), ok 6/8
- `/blog/foreign-owned-llc-filing-requirements-checklist` — first capsule words=70 (−1 = no <p>), ok 1/5
- … +3 more

### Tools (calculators / checkers): 8 pages — 0 with no question H2, 0 with q-H2 but no ≤60-word first capsule

## 7. Schema (JSON-LD) coverage by page type

Cell = pages of that type carrying the schema type (top-level or `@graph` node).

| page type | n | no JSON-LD | Organization | WebSite | WebPage | Service | Article | BlogPosting | FAQPage | HowTo | BreadcrumbList | ItemList | CollectionPage | Product | WebApplication | Dataset | ContactPage | AboutPage |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| home | 1 | 0 | 1 | 1 | 1 | 1 | · | · | 1 | 1 | 1 | · | · | · | · | · | · | · |
| pricing | 1 | 0 | 1 | · | 1 | · | · | · | 1 | · | 1 | · | · | 1 | · | · | · | · |
| info | 6 | 1 | 2 | · | 2 | · | 1 | · | 4 | · | 5 | · | · | · | · | · | 1 | 1 |
| tool | 8 | 0 | · | · | 8 | · | · | · | 8 | · | 8 | · | · | · | 8 | 2 | · | · |
| product | 4 | 0 | · | · | 3 | 4 | · | · | 4 | 3 | 4 | · | · | · | · | · | · | · |
| blog-index | 1 | 0 | · | · | · | · | · | · | · | · | 1 | · | 1 | · | · | · | · | · |
| blog-topic | 14 | 0 | · | · | · | · | · | · | · | · | 14 | · | 14 | · | · | · | · | · |
| guide | 31 | 0 | 30 | · | · | · | 30 | · | 30 | 12 | 31 | · | 1 | · | · | · | · | · |
| legal | 5 | 5 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| compare-hub | 1 | 0 | 1 | · | · | · | · | · | 1 | · | 1 | · | 1 | · | · | · | · | · |
| compare | 1 | 0 | 1 | · | · | · | 1 | · | 1 | · | 1 | 1 | · | · | · | · | · | · |
| services-hub | 1 | 0 | 1 | · | · | · | · | · | · | · | 1 | · | 1 | · | · | · | · | · |
| service | 12 | 0 | 12 | · | 12 | 12 | · | · | 12 | 5 | 12 | · | · | · | · | · | · | · |
| blog-post | 201 | 0 | 201 | · | · | · | · | 201 | 186 | 95 | 201 | · | · | · | · | · | · | · |

- Parse errors: 0 block(s) on 0 page(s).
- FAQPage: 248 pages; total schema questions 1529; pages: `/`(11), `/pricing`(9), `/faq`(55), `/form-5472-deadline-calculator`(5), `/do-i-need-to-file-form-5472`(4), `/form-5472-penalty-calculator`(5), `/irs-yearly-average-exchange-rates`(6), `/form-5472-reportable-transactions-checker`(6), `/form-5472-late-filing-checker`(6), `/foreign-owned-llc-compliance-calendar`(6), `/llc-annual-fees-by-state`(6), `/ein`(18), `/itin`(9), `/form-7004-extension`(9), `/partners`(6), `/contact`(5), `/about`(13), `/compare`(6), `/form-5472-statistics`(5), `/compare/form-5472-filing-services`(9).
- Pages with dateModified: 277; datePublished: 233.
- JSON-LD dateModified older than 90 days (vs 2026-11-03): `/blog/amazon-fba-foreign-sellers-form-5472` 2026-07-06, `/blog/form-5472-canada-residents-us-llc` 2026-07-06.
- dateModified (JSON-LD) ≠ sitemap lastmod (date part): 14 pages — e.g. `/` ld=2026-08-16 sm=2026-09-30; `/pricing` ld=2026-10-26 sm=2026-09-30; `/faq` ld=2026-10-26 sm=2026-09-11; `/ein` ld=2026-08-16 sm=2026-09-14; `/itin` ld=2026-08-16 sm=2026-09-14; `/form-7004-extension` ld=2026-10-30 sm=2026-10-28.

## 8. Thin / short pages

Thin (<300 main words, indexable): **0**. None — shortest page is 336 words.


Shortest 20 pages by main-content words:
- `/editorial-policy` — 336 words (info)
- `/cookies` — 344 words (legal)
- `/blog/topics/form-ss-4` — 373 words (blog-topic)
- `/blog/topics/penalty` — 378 words (blog-topic)
- `/contact` — 388 words (info)
- `/blog/topics/late-filing` — 395 words (blog-topic)
- `/blog/topics/deadline` — 400 words (blog-topic)
- `/blog/topics/partner-program` — 449 words (blog-topic)
- `/security` — 470 words (legal)
- `/data-retention` — 600 words (legal)
- `/blog/topics/itin` — 661 words (blog-topic)
- `/blog/topics/ein` — 678 words (blog-topic)
- `/blog/topics/recordkeeping` — 729 words (blog-topic)
- `/blog/form-5472-white-label-vs-standard-partner` — 742 words (blog-post)
- `/blog/medellin-digital-nomad-rolling-365-day-tax-log` — 744 words (blog-post)
- `/blog/kuala-lumpur-digital-nomad-cross-year-tax-records` — 759 words (blog-post)
- `/blog/multiple-related-parties-form-5472` — 761 words (blog-post)
- `/blog/barcelona-digital-nomad-visa-us-llc-tax-election` — 762 words (blog-post)
- `/blog/bangkok-digital-nomad-llc-transfer-remittance-records` — 770 words (blog-post)
- `/blog/tbilisi-digital-nomad-georgian-ie-us-llc-records` — 788 words (blog-post)

Word-count distribution by section:

| section | min | median | max | <600 |
|---|---|---|---|---|
| home | 2658 | 2658 | 2658 | 0 |
| pricing | 1249 | 1249 | 1249 | 0 |
| services | 944 | 1249 | 1440 | 0 |
| product | 1054 | 1511 | 1955 | 0 |
| tools | 1092 | 1507 | 3574 | 0 |
| guides | 1310 | 2462 | 3277 | 0 |
| compare | 909 | 2998 | 2998 | 0 |
| blog | 373 | 1915 | 2871 | 5 |
| info | 336 | 1479 | 3367 | 2 |
| legal | 344 | 600 | 1283 | 2 |

## 9. Sitemap / robots / noindex / canonical conflicts

Sitemap URLs with any conflict (non-200, redirect, noindex, robots-blocked, canonical missing/relative/multiple/elsewhere): **0**.


Canonical equals page up to trailing slash/case only (harmless but inconsistent):
- `/` — https://www.form5472prep.com

### robots.txt

- `/robots.txt`: HTTP 200, 5773 bytes, 18 user-agent group(s), Sitemap directive(s): https://www.form5472prep.com/sitemap.xml.
- `User-agent: *` rules: allow: /; disallow: /*?_rsc=; disallow: /*?*&_rsc=; disallow: /dashboard; disallow: /filings; disallow: /applications/; disallow: /admin; disallow: /api/; disallow: /start?; disallow: /sign-in; disallow: /partner/sign-in; disallow: /ein/apply; disallow: /itin/apply; disallow: /form-7004-extension/apply.
- Per-bot check of all 287 sitemap URLs:

| bot | has own group | sitemap URLs allowed | blocked |
|---|---|---|---|
| Googlebot | no (falls to *) | 287 | 0 |
| Bingbot | no (falls to *) | 287 | 0 |
| GPTBot | yes | 287 | 0 |
| ChatGPT-User | yes | 287 | 0 |
| OAI-SearchBot | yes | 287 | 0 |
| ClaudeBot | yes | 287 | 0 |
| Claude-SearchBot | no (falls to *) | 287 | 0 |
| Claude-User | no (falls to *) | 287 | 0 |
| anthropic-ai | yes | 287 | 0 |
| PerplexityBot | yes | 287 | 0 |
| Perplexity-User | yes | 287 | 0 |
| Google-Extended | yes | 287 | 0 |
| Applebot-Extended | yes | 287 | 0 |
| CCBot | yes | 287 | 0 |
| Bytespider | yes | 287 | 0 |
| Amazonbot | no (falls to *) | 287 | 0 |
| meta-externalagent | yes | 287 | 0 |
| cohere-ai | yes | 287 | 0 |

### llms.txt / llms-full.txt

- `/llms.txt`: HTTP 200, 64967 bytes (63.4 KB), content-type `text/plain; charset=utf-8`, 442 lines, 271 markdown links, 276 unique internal URLs.
- `/llms-full.txt`: HTTP 200, 347451 bytes (339.3 KB).
- Sitemap URLs **not listed** in llms.txt: 15 — `/blog/topics`, `/form-5472-by-country`, `/blog/topics/form-5472`, `/blog/topics/foreign-owned-llc`, `/blog/topics/ftin`, `/blog/topics/digital-nomad`, `/blog/topics/non-resident`, `/blog/topics/recordkeeping`, `/blog/topics/ein`, `/blog/topics/itin`, `/blog/topics/partner-program`, `/blog/topics/deadline` ….
- llms.txt internal URLs **not in sitemap**: 4 — `/llms-services.txt`, `/llms-guides.txt`, `/llms-full.txt`, `/feed.xml`; of these non-200/redirecting: 0.

### Sitemap hygiene

- Duplicate sitemap URLs: 0. Missing `<lastmod>`: 0.
- `<lastmod>` distribution (date: URLs): 2026-10-30: 15; 2026-10-28: 1; 2026-10-24: 3; 2026-10-19: 1; 2026-10-18: 1; 2026-10-17: 1; 2026-10-16: 2; 2026-10-15: 20; 2026-10-11: 1; 2026-10-07: 17; 2026-10-05: 12; 2026-10-04: 2; 2026-10-03: 10; 2026-09-30: 8 … (29 distinct dates).
- Server response (fetch) ms: median 544, p95 926, max 1556. HTML bytes: median 150507.

## 10. Brand, PTIN statement, images

- "Form5472 Prep" in main content: 287/287 pages (variant "Form 5472 Prep" with space in main: 32).
- PTIN scope pages (home, pricing, /services*, ein/itin/7004/partners): 19. Review-by-PTIN-holding-accountant statement in main (any wording, e.g. “PTIN-holding tax accountant” or “tax accountant who holds an IRS Preparer Tax Identification Number (PTIN)”): 19/19; "PTIN" word in main: 19/19; the literal phrase “tax accountant who holds an IRS PTIN”: 19/19; PTIN anywhere on page incl. footer/chrome: 19/19.
  - `/`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/pricing`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/ein`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/itin`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/form-7004-extension`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/partners`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/form-5472-filing-service`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/pro-forma-1120-filing-service`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/late-form-5472-filing-service`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/foreign-owned-llc-tax-filing-service`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/form-5472-fax-filing-service`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/white-label-form-5472-filing`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/form-5472-filing-for-dormant-llc`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/final-form-5472-for-dissolved-llc`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/hire-someone-to-file-form-5472`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/form-5472-preparer`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/form-5472-for-accountants`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/services/form-5472-for-bookkeepers`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
- PTIN in main content across all page types: 179/287 (guides 30/31, blog 120/216).
- Images: 1453 total across 229 pages; missing alt attr: 0; empty alt on logo-mark.svg (decorative by design): 202; empty alt on other images (card thumbnails): 1027.

## 11. Could not fetch / caveats

Nothing: all 287 sitemap URLs fetched with HTTP 200 on first request (built-in single retry aside).

- Not measured: rendered-DOM (JS) content, Core Web Vitals, backlinks, SERP/AI-citation visibility, hreflang, image file sizes, `og:`/Twitter tags beyond `og:image`.
- Heuristics are regex-based (no DOM parser): heading/paragraph/word counts treat `<main>` minus nav/footer/aside as content; question-H2 detection requires a literal trailing `?`.
## 12. Stale-fact sweep (page + snippet)

Each snippet is the matched sentence; `src` = where it appears (`main`, `chrome` = header/footer, `meta`, `jsonld`). Labels: `STALE-$79`, `other-$N` (7004 sentence with another price), `CLAIM?` (outcome wording with no negation/question/“guarantee”), `disclaimer-or-question` (negated/question form, not flagged).

### Express "24 hours" / "within 24" near “Express” — 0 sentence-hit(s) on 0 page(s)

None.

### Form 7004 price ≠ $19 (STALE-$79 and other prices; $19 confirmations listed last) — 7 sentence-hit(s) on 4 page(s)

- [ok($19) / main+jsonld] “Form5472 Prep charges $19 per LLC per tax year to prepare Form 7004 and fax it to the IRS Ogden PIN Unit, with the fax confirmation emailed to you.” — `/form-7004-extension`
- [ok($19) / main] “Order the Form 7004 extension — $19” — `/form-7004-extension`
- [ok($19) / meta] “Form 7004 Extension for Foreign-Owned LLCs — $19” — `/form-7004-extension`
- [ok($19) / meta] “Form 7004 extension for foreign-owned single-member LLCs, $19 per tax year.” — `/form-7004-extension`
- [ok($19) / main+jsonld] “Form 7004 extension filing ($19 per LLC per tax year) for foreign-owned US LLCs, faxed to the IRS Ogden PIN Unit.” — `/about`
- [ok($19) / main] “Form 7004 — $19” — `/`, `/pricing`

### "auto-generat*" near “reasonable cause” — 0 sentence-hit(s) on 0 page(s)

None.

### Outcome claims ("accepted without penalty", "most … accepted", "penalty removed") — 18 sentence-hit(s) on 10 page(s)

- [disclaimer-or-question / main] “The IRS decides whether any penalty is removed.” — `/form-5472-late-filing-checker`
- [disclaimer-or-question / main] “The checker points to the IRS route that usually applies; the IRS decides whether any penalty is removed.” — `/form-5472-late-filing-checker`
- [CLAIM? / main] “55% of 2018 systemic Form 5471/5472 penalties were abated, or 71% by dollar value.” — `/form-5472-statistics`
- [disclaimer-or-question / main+jsonld] “How often are Form 5472 penalties abated?” — `/form-5472-statistics`
- [disclaimer-or-question / main] “How do you get the penalty abated under DIIRSP?” — `/form-5472-penalty`
- [disclaimer-or-question / main+jsonld] “If I file under DIIRSP, am I guaranteed the penalty is waived?” — `/form-5472-penalty`
- [disclaimer-or-question / main+jsonld] “Does DIIRSP guarantee my penalty is waived?” — `/diirsp`
- [disclaimer-or-question / main+jsonld] “Silence does not show that reasonable cause was accepted or a penalty waived.” — `/diirsp`
- [disclaimer-or-question / main+jsonld] “A reasonable-cause explanation does not guarantee that a penalty will be waived.” — `/foreign-owned-llc-tax`
- [disclaimer-or-question / main] “Statements that you'd file in the future only if penalties are waived.” — `/form-5472-reasonable-cause-statement`
- [disclaimer-or-question / main+jsonld] “Does the IRS guarantee my penalty is waived if I submit a reasonable cause statement?” — `/form-5472-reasonable-cause-statement`
- [disclaimer-or-question / main+jsonld] “Does "liberally" mean the penalty will be removed?” — `/blog/form-5472-small-corporation-reasonable-cause`
- [disclaimer-or-question / main] “to a late-filed Form 1120, IRM 20.1.9.5.5(3) allows it to be abated with penalty reason code 018 if the related Form 1120's failure-to-file penalty was abated under FTA — or would have been eligible but none was assessed "because there was ” — `/blog/form-5472-penalty-notice-what-to-do`
- [CLAIM? / main] “There is no formal waiver guarantee, but well-documented first-time late filings by foreign owners are commonly accepted without penalty.” — `/blog/form-5472-filed-late-never-filed`
- [disclaimer-or-question / main+jsonld] “The IRS decides each case on its facts, so the statement has to be specific, credible and consistent with your situation — there is no guarantee the penalty will be waived.” — `/blog/form-5472-filed-late-never-filed`
- [disclaimer-or-question / main] “If a notice arrives, follow its instructions and response deadline; a transmission record does not guarantee a penalty will be removed.” — `/file-form-5472`, `/diirsp`, `/form-5472-reasonable-cause-statement`

### "online filer" — 0 sentence-hit(s) on 0 page(s)

None.

### "money-back guarantee" — 61 sentence-hit(s) on 33 page(s)

- ×30 pages: “100% money-back guarantee if we fail to submit” (main)
- ×16 pages: “100% money-back guarantee if we fail to submit.” (main)
- ×6 pages: “100% money-back guarantee if we fail to submit your filing to the irs.” (main+jsonld)
- ×3 pages: “100% money-back guarantee if we fail to submit your filing.” (main)
- ×1 pages: “we offer a 100% money-back guarantee if we fail to submit your filing to the irs.” (main+jsonld)
- ×1 pages: “our service handles the federal piece in 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit.” (main)
- ×1 pages: “our service handles the federal piece in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if the irs ever assesses a penalty because of an error in our pre” (main)
- ×1 pages: “our service handles the federal filing in about 15 minutes, accountant-reviewed, with a money-back guarantee if we fail to submit — and if the irs ever assesses a penalty because of an error in our pr” (main)
- ×1 pages: “irs fax delivery included. money-back guarantee if we fail to submit.” (main)
- ×1 pages: “our service is built for this profile — fixed pricing, accountant-reviewed, with a money-back guarantee if we fail to submit.” (main)

### "DIIRSP" — counts only (owner removed it from app/chat/contact/admin copy on 2026-11-03; guides not judged)

604 distinct sentences on 267 pages; in visible copy (main/footer): 325 sentences on 52 pages; in JSON-LD strings (structured data, not visible): 265 pages (the most common JSON-LD string: “DIIRSP — Delinquent International Information Return Submission Procedure”); in title/meta description: 7 pages.

| page type | pages of type | pages with DIIRSP in visible copy | visible-copy sentences |
|---|---|---|---|
| home | 1 | 1 | 10 |
| pricing | 1 | 1 | 4 |
| info | 6 | 3 | 8 |
| tool | 8 | 3 | 20 |
| product | 4 | 0 | 0 |
| blog-index | 1 | 0 | 0 |
| blog-topic | 14 | 2 | 2 |
| guide | 31 | 25 | 222 |
| legal | 5 | 0 | 0 |
| compare-hub | 1 | 0 | 0 |
| compare | 1 | 0 | 0 |
| services-hub | 1 | 0 | 0 |
| service | 12 | 1 | 6 |
| blog-post | 201 | 16 | 53 |

Non-guide/non-blog pages with DIIRSP in visible copy (9): `/` ×10, `/pricing` ×4, `/faq` ×5, `/form-5472-deadline-calculator` ×3, `/form-5472-penalty-calculator` ×6, `/form-5472-late-filing-checker` ×11, `/about` ×2, `/press` ×1, `/services/late-form-5472-filing-service` ×6.

## 13. FAQPage and HowTo schema vs visible markup

**FAQPage:** 248 pages, 1529 schema questions. Visible question = text of a `<summary>`, `<dt>`, `<h2–h4>`, aria-expanded button or a bold-only paragraph (`<p><strong>…</strong></p>`) inside `<main>` that ends in “?” (de-duplicated). Exact match = schema question text equals the text of any summary/dt/heading/button/bold element on the page after stripping glyphs (▾ ▸ + − × etc.) and collapsing whitespace. Exact matches: 1529; matches ignoring case/quotes/punctuation: 1529. Pages where schema count = visible count: 21/248; schema > visible: 0; schema < visible: 227. Pages with ≥1 schema question lacking an exact visible match: 0 (all unmatched questions in `faq-mismatch.tsv`).


Pages where schema question count ≠ visible question count (227; visible > schema is expected because every other question-form H2 on the page counts as visible; only schema > visible is an issue; top 25):
- `/` — schema 11 vs visible 27, exact-matched 11
- `/form-5472-penalty` — schema 10 vs visible 23, exact-matched 10
- `/form-5472-example` — schema 5 vs visible 18, exact-matched 5
- `/form-5472-instructions` — schema 10 vs visible 22, exact-matched 10
- `/form-5472-statistics` — schema 5 vs visible 16, exact-matched 5
- `/file-form-5472` — schema 10 vs visible 21, exact-matched 10
- `/form-5472-fax-number` — schema 10 vs visible 21, exact-matched 10
- `/blog/itin-renewal-expired-itin-what-to-do` — schema 7 vs visible 18, exact-matched 7
- `/blog/how-to-fill-out-form-ss-4-foreign-owned-llc` — schema 7 vs visible 18, exact-matched 7
- `/blog/form-5472-airbnb-short-term-rental-host` — schema 7 vs visible 18, exact-matched 7
- `/foreign-owned-llc-tax` — schema 10 vs visible 20, exact-matched 10
- `/wyoming-llc-form-5472` — schema 10 vs visible 20, exact-matched 10
- `/delaware-llc-form-5472` — schema 10 vs visible 20, exact-matched 10
- `/form-5472-deadline` — schema 10 vs visible 20, exact-matched 10
- `/blog/form-5472-affiliate-marketers-content-sites` — schema 6 vs visible 16, exact-matched 6
- `/blog/foreign-owned-llc-hiring-us-employees-contractors` — schema 7 vs visible 17, exact-matched 7
- `/blog/how-to-fill-out-form-w-7-nonresident-llc-owner` — schema 7 vs visible 17, exact-matched 7
- `/blog/itin-refund-30-percent-withholding-1042-s` — schema 7 vs visible 17, exact-matched 7
- `/blog/ein-third-party-designee-apply-on-your-behalf` — schema 7 vs visible 17, exact-matched 7
- `/blog/form-5472-etsy-print-on-demand-sellers` — schema 7 vs visible 17, exact-matched 7
- `/blog/us-bank-account-foreign-owned-llc` — schema 7 vs visible 17, exact-matched 7
- `/diirsp` — schema 10 vs visible 19, exact-matched 10
- `/late-form-5472` — schema 10 vs visible 19, exact-matched 10
- `/form-5472-vs-1120` — schema 10 vs visible 19, exact-matched 10
- `/pro-forma-1120` — schema 10 vs visible 19, exact-matched 10

**HowTo:** 116 page(s) carry HowTo schema. Visible numbered steps = items of the `<ol>`s in `<main>` (not a #-anchor table of contents) whose items contain schema step names, summed when a post splits the steps over several lists; falls back to “Step N” headings.

- `/file-form-5472`: HowTo nodes 1, schema steps **8**, visible numbered steps **8**, schema step names found in those lists 8/8; all `<ol>` item counts (n[toc]/names-matched): 8/8 3/0 5/0 1/0 1/0 1/0 → MATCH
- `/form-5472-instructions`: HowTo nodes 1, schema steps **10**, visible numbered steps **10**, schema step names found in those lists 10/10; all `<ol>` item counts (n[toc]/names-matched): 10/10 → MATCH
- `/form-5472-example`: HowTo nodes 1, schema steps **10**, visible numbered steps **10**, schema step names found in those lists 10/10; all `<ol>` item counts (n[toc]/names-matched): 10/10 6/0 → MATCH
- Other HowTo pages: `/` schema 6 vs visible 6; `/ein` schema 5 vs visible 5; `/itin` schema 5 vs visible 5; `/partners` schema 5 vs visible 5; `/services/form-5472-filing-service` schema 6 vs visible 6; `/services/white-label-form-5472-filing` schema 6 vs visible 6; `/services/final-form-5472-for-dissolved-llc` schema 5 vs visible 5; `/services/hire-someone-to-file-form-5472` schema 5 vs visible 5; `/services/form-5472-for-bookkeepers` schema 5 vs visible 5; `/diirsp` schema 7 vs visible 7; `/late-form-5472` schema 6 vs visible 6; `/wyoming-llc-form-5472` schema 6 vs visible 6; `/delaware-llc-form-5472` schema 8 vs visible 8; `/form-5472-germany` schema 8 vs visible 8; `/form-5472-uae` schema 8 vs visible 8; `/irs-form-5472` schema 5 vs visible 5; `/form-5472-deadline` schema 6 vs visible 6; `/form-5472-fax-number` schema 7 vs visible 7; `/blog/form-5472-newsletter-membership-creators` schema 10 vs visible 10; `/blog/form-5472-kdp-authors-royalties` schema 8 vs visible 8; `/blog/foreign-owned-llc-hiring-us-employees-contractors` schema 6 vs visible 6; `/blog/form-5472-vs-fbar-vs-form-8938` schema 5 vs visible 5; `/blog/foreign-owned-llc-compliance-calendar-2027` schema 7 vs visible 7; `/blog/form-5472-family-members-related-parties` schema 8 vs visible 8; `/blog/form-5472-small-corporation-reasonable-cause` schema 8 vs visible 8; `/blog/irs-official-exchange-rate-form-5472` schema 8 vs visible 8; `/blog/llc-annual-report-late-fees-by-state` schema 8 vs visible 8; `/blog/multiple-related-parties-form-5472` schema 5 vs visible 5; `/blog/form-5472-argentina-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-costa-rica-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-croatia-residents-us-llc` schema 6 vs visible 6; `/blog/form-5472-from-mercury-wise-relay-statements` schema 5 vs visible 5; `/blog/form-5472-hungary-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-south-korea-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-taiwan-residents-us-llc` schema 6 vs visible 6; `/blog/form-5472-turkey-residents-us-llc` schema 5 vs visible 5; `/blog/pay-yourself-from-us-llc-non-resident` schema 8 vs visible 8; `/blog/form-5472-colombia-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-digital-nomad-us-llc` schema 5 vs visible 5; `/blog/form-5472-estonia-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-georgia-country-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-indonesia-bali-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-malaysia-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-philippines-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-portugal-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-thailand-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-vietnam-residents-us-llc` schema 6 vs visible 6; `/blog/offer-form-5472-filing-as-a-service` schema 6 vs visible 6; `/blog/stripe-atlas-doola-firstbase-form-5472` schema 5 vs visible 5; `/blog/us-llc-tax-free-digital-nomads-myth` schema 5 vs visible 5; `/blog/us-llc-vs-estonia-ou-vs-uae-company-digital-nomads` schema 5 vs visible 5; `/blog/wyoming-vs-new-mexico-vs-delaware-llc-digital-nomads` schema 6 vs visible 6; `/blog/boi-reporting-foreign-owned-us-llc-2026` schema 3 vs visible 3; `/blog/registered-agent-foreign-owned-llc` schema 5 vs visible 5; `/blog/tax-extension-without-itin` schema 5 vs visible 5; `/blog/how-to-fill-out-form-w-7-nonresident-llc-owner` schema 7 vs visible 7; `/blog/itin-refund-30-percent-withholding-1042-s` schema 7 vs visible 7; `/blog/itin-renewal-expired-itin-what-to-do` schema 8 vs visible 8; `/blog/when-nonresident-actually-needs-itin` schema 5 vs visible 5; `/blog/ein-application-rejected-reference-number-101` schema 8 vs visible 8; `/blog/ein-third-party-designee-apply-on-your-behalf` schema 7 vs visible 7; `/blog/how-to-fill-out-form-ss-4-foreign-owned-llc` schema 7 vs visible 7; `/blog/lost-ein-147c-letter-replacement` schema 8 vs visible 8; `/blog/form-5472-airbnb-short-term-rental-host` schema 8 vs visible 8; `/blog/form-5472-brazil-residents-us-llc` schema 8 vs visible 8; `/blog/form-5472-china-residents-us-llc` schema 7 vs visible 7; `/blog/form-5472-etsy-print-on-demand-sellers` schema 8 vs visible 8; `/blog/form-5472-nigeria-residents-us-llc` schema 7 vs visible 7; `/blog/form-5472-youtube-creators-influencers` schema 8 vs visible 8; `/blog/form-8832-election-foreign-owned-llc` schema 3 vs visible 3; `/blog/us-bank-account-foreign-owned-llc` schema 9 vs visible 9; `/blog/form-5472-business-address-owner-address` schema 4 vs visible 4; `/blog/form-5472-customer-payments-foreign-source-income` schema 5 vs visible 5; `/blog/form-5472-formation-costs-registered-agent-fees` schema 6 vs visible 6; `/blog/form-5472-italy-residents-us-llc` schema 6 vs visible 6; `/blog/form-5472-japan-residents-us-llc` schema 6 vs visible 6; `/blog/form-5472-lines-1f-1g-1h-total-value` schema 6 vs visible 6; `/blog/form-5472-new-zealand-residents-us-llc` schema 5 vs visible 5; `/blog/form-5472-no-us-bank-account` schema 6 vs visible 6; `/blog/form-5472-spain-residents-us-llc` schema 6 vs visible 6; `/blog/form-5472-switzerland-residents-us-llc` schema 6 vs visible 6; `/blog/california-llc-foreign-owner-tax-filing` schema 8 vs visible 8; `/blog/delaware-llc-foreign-owner-tax-filing` schema 7 vs visible 7; `/blog/form-5472-australia-residents-us-llc` schema 8 vs visible 8; `/blog/form-5472-change-of-ownership` schema 9 vs visible 9; `/blog/form-5472-currency-conversion-exchange-rates` schema 5 vs visible 5; `/blog/form-5472-foreign-corporate-owner` schema 8 vs visible 8; `/blog/form-5472-france-residents-us-llc` schema 8 vs visible 8; `/blog/form-5472-germany-residents-us-llc` schema 8 vs visible 8; `/blog/form-5472-hong-kong-residents-us-llc` schema 6 vs visible 6; `/blog/form-5472-mexico-residents-us-llc` schema 7 vs visible 7; `/blog/form-5472-netherlands-residents-us-llc` schema 8 vs visible 8; `/blog/form-5472-pakistan-residents-us-llc` schema 7 vs visible 7; `/blog/form-5472-part-v-statement-example` schema 8 vs visible 8; `/blog/form-5472-reasonable-cause-letter` schema 8 vs visible 8; `/blog/form-5472-singapore-residents-us-llc` schema 8 vs visible 8; `/blog/form-5472-statute-of-limitations` schema 7 vs visible 7; `/blog/form-5472-us-real-estate-foreign-investor` schema 7 vs visible 7; `/blog/form-5472-vs-form-5471` schema 6 vs visible 6; `/blog/how-to-fax-form-5472-irs` schema 8 vs visible 8; `/blog/pro-forma-form-1120-foreign-owned-llc` schema 8 vs visible 8; `/blog/first-year-form-5472-new-llc` schema 7 vs visible 7; `/blog/amended-form-5472-correcting-errors` schema 8 vs visible 8; `/blog/form-5472-penalty-notice-what-to-do` schema 7 vs visible 7; `/blog/form-5472-uae-dubai-residents-us-llc` schema 5 vs visible 5; `/blog/how-to-fill-out-form-5472` schema 4 vs visible 4; `/blog/multi-member-llc-form-5472-or-1065` schema 4 vs visible 4; `/blog/wyoming-llc-foreign-owner-tax-filing` schema 4 vs visible 4; `/blog/form-5472-saas-founders` schema 5 vs visible 5; `/blog/stripe-paypal-wise-form-5472` schema 7 vs visible 7; `/blog/form-5472-reportable-transactions-examples` schema 9 vs visible 9; `/blog/form-5472-extension` schema 5 vs visible 5; `/blog/form-5472-filed-late-never-filed` schema 4 vs visible 4.

## 14. /form-5472-by-country

- In sitemap: **yes** (lastmod 2026-10-07); HTTP 200; indexable: **yes** (noindex=false, robots-blocked=false); canonical: self; title: “Form 5472 by Country · Form5472 Prep”; H1: “Form 5472 by country”; main words 1588; JSON-LD: CollectionPage, BreadcrumbList.
- Linked blog posts: **47** unique posts inside `<main>` (49 anywhere on the page); total internal links 107 (49 in main), 98 unique targets.
- Inbound internal links from other sitemap pages: 53 (7 in main content); in llms.txt: no.
- Blog posts whose slug is a country (`…-residents-us-llc`) or digital-nomad post: 50; not linked from this page's main content: 3 — `us-llc-tax-free-digital-nomads-myth`, `us-llc-vs-estonia-ou-vs-uae-company-digital-nomads`, `wyoming-vs-new-mexico-vs-delaware-llc-digital-nomads`.

