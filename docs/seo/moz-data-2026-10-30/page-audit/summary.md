# Form5472 Prep — page-by-page SEO / AEO / GEO audit

Run: 2026-10-30. Source: every URL in https://www.form5472prep.com/sitemap.xml (281). Public fetches only, browser UA, 4 concurrent, 200 ms spacing. Raw data: `pages.tsv` (one row per URL), `risky.tsv`, `broken-links.tsv`. Scripts: `fetch.mjs` → `analyze.mjs` → `summary.mjs` (re-run: `node fetch.mjs && node analyze.mjs && node summary.mjs`).

## 0. Headline findings (computed from this run)

1. **Technical hygiene is clean.** 281/281 sitemap URLs return 200 first time; 0 redirects, 0 noindex, 0 robots-blocked, 0 missing/relative/foreign canonicals; 0 broken or redirecting internal links across 702 checked targets; all 18 named bots (incl. GPTBot, ClaudeBot, PerplexityBot, Google-Extended) may crawl every sitemap URL. Gaps are in content structure and wording, not crawlability.
2. **Metadata:** 0 missing/duplicate/>60-char titles and 0 missing/duplicate descriptions; remaining: 10 descriptions <70 chars, 4 >160, 7 titles <30.
3. **Q&A structure is strong but uneven:** 235/262 content pages have ≥1 question-form H2 (guides 30/30, services 13/13); **27 do not** (incl. /faq, whose 55 questions are `<dt>` elements, and partner-program, state-filing and "digital nomad" blog posts) and **16** have a first answer paragraph >60 words.
4. **Internal linking:** **9 orphan** and 60 weakly linked (≤2 inbound) pages — long-tail blog posts (e.g. several “…-residents-us-llc” country posts); the /blog index links to only 26 of 197 posts, the rest rely on /blog/topics/* hubs and cross-links.
5. **Wording to fix:** “online filer” on 20 pages (“our 15-minute online filer starts from $149”, a sentence repeated across guide pages); the “100% money-back guarantee if we fail to submit” claim appears on 33 pages; “CP 15” on 2 pages; the IRS fax number is shown in the footer of all 281 pages without the word “fax”. Not found: “3 business days” near Express, “automatically generat*”, “no human review”, a stale “we don't file Form 7004”, or a $99 presented as a base price (198 of 200 “$99” sentences are framed as per-additional-year add-ons; the other 2 are unrelated figures such as an App Store membership). No “licensed”/“CPA” claim about Form5472 Prep: 127 pages carry “not a CPA firm”-style disclaimers and every remaining flagged sentence is a comparison, referral or partner-audience description (read the 21 in §5). No `tel:` links; +1-855-887-7737 appears only in IRS fax/Ogden contexts (the 4 “PHONE?” hits are fax how-to instructions).
6. **PTIN statement:** a PTIN-review statement is in the main content of 16/19 home/pricing/service pages (literal “tax accountant who holds an IRS PTIN” on only 2/19); /ein, /itin and /form-7004-extension mention PTIN only in the footer.
7. **Schema:** Organization/BreadcrumbList nearly universal; FAQPage on 243 pages; 18 pages show ≥3 visible Q&As with no FAQPage; 8 FAQPage blocks list more questions than the page visibly asks; JSON-LD dateModified ≠ sitemap lastmod on 13 pages and >90 days old on 2.
8. **Images:** 0 missing alt attributes; 220 images carry non-empty alt (heroes are descriptive), but 1000 blog-card thumbnails across 210 pages have `alt=""`.
9. **Brand consistency:** “Form5472 Prep” is absent from main content on 29 pages (tools, topic hubs, several guides) and the spaced variant “Form 5472 Prep” is used in main on 32.
10. **Off-topic content:** 4 blog post(s) are about company cars/mileage (`/blog/uk-company-car-vat-buy-lease-electric`, `/blog/electric-company-car-llc-tax-2026`, `/blog/business-car-mileage-vs-actual-2026`, `/blog/foreign-owned-llc-company-car-deduction`) — topical dilution for a Form 5472 site.

## 1. Totals

- Sitemap URLs: **281** (281 unique). Fetched OK (HTTP 200, HTML): **281**. Non-200 / fetch errors: **0**. Redirecting sitemap URLs: **0**.
- Indexable (200, no noindex, not robots-blocked): **281**. noindex: 0. Robots-blocked: 0. X-Robots-Tag header present: 0.
- Median main-content words: 1796; thin (<300): 0; <600: 8.
- Internal link targets found: 430 unique (0 broken, 0 redirecting); 162 non-sitemap targets requested once each.
- Site-wide note: every page contains one empty `<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">` right after the floating "Ask a question" chat button — only the chat widget is client-rendered; main content is fully server-rendered (verified: all pages have ≥ 331 words in SSR HTML).

### By section

| section | pages | avg words | avg title len | desc 70–160 | has q-H2 | first capsule ≤60w | avg q-H2 | avg in-main int links | FAQPage | Breadcrumb | Article-type |
|---|---|---|---|---|---|---|---|---|---|---|---|
| home | 1 | 2654.0 | 51.0 | 100% | 100% | 100% | 10.0 | 31.0 | 100% | 100% | 0% |
| pricing | 1 | 1245.0 | 44.0 | 0% | 100% | 100% | 4.0 | 8.0 | 100% | 100% | 0% |
| services | 13 | 1197.0 | 55.5 | 100% | 100% | 100% | 6.5 | 15.6 | 92% | 100% | 0% |
| product | 4 | 1318.3 | 54.8 | 100% | 100% | 100% | 3.5 | 4.3 | 100% | 100% | 0% |
| tools | 8 | 1796.6 | 55.5 | 88% | 100% | 88% | 3.6 | 8.1 | 100% | 100% | 0% |
| guides | 30 | 2361.6 | 51.8 | 93% | 100% | 100% | 8.8 | 10.6 | 100% | 100% | 100% |
| compare | 2 | 1949.5 | 48.0 | 100% | 100% | 100% | 6.0 | 10.5 | 100% | 100% | 50% |
| blog | 211 | 1642.8 | 51.5 | 95% | 82% | 75% | 5.3 | 12.8 | 86% | 100% | 93% |
| info | 6 | 1494.0 | 40.5 | 100% | 67% | 67% | 4.8 | 14.8 | 50% | 83% | 17% |
| legal | 5 | 758.6 | 33.0 | 100% | 0% | 0% | 0.0 | 0.8 | 0% | 0% | 0% |

## 2. Issue counts (sorted by count)

| # | issue | pages | % of 200-pages |
|---|---|---|---|
| 1 | Images with empty alt other than logo-mark.svg (blog-card thumbnails etc.) | 210 | 75% |
| 2 | Weakly linked: ≤ 2 inbound links from sitemap pages (excl. orphans) | 60 | 21% |
| 3 | Risky/stale wording: flagged sentence (see §5) | 46 | 16% |
| 4 | Brand "Form5472 Prep" absent from main content | 29 | 10% |
| 5 | No question-form H2 (content pages; legal, blog index and /blog/topics/* excluded) | 27 | 10% |
| 6 | ≥3 visible Q&A (q-H2/summary) but no FAQPage schema | 18 | 6% |
| 7 | Service/pricing/home page: exact phrase "tax accountant who holds an IRS PTIN" absent | 17 | 6% |
| 8 | Has question H2 but first one lacks ≤60-word answer capsule | 16 | 6% |
| 9 | Meta description < 70 chars | 10 | 4% |
| 10 | Orphan: 0 inbound internal links from other sitemap pages | 9 | 3% |
| 11 | Fewer than half of question H2s have ≤60-word capsule | 8 | 3% |
| 12 | Short (300–600 main words, indexable) | 8 | 3% |
| 13 | FAQPage schema lists more questions than visible question markup | 8 | 3% |
| 14 | Title < 30 chars | 7 | 2% |
| 15 | Fewer than 3 contextual (in-main) internal links | 7 | 2% |
| 16 | No JSON-LD at all | 6 | 2% |
| 17 | No BreadcrumbList (non-home) | 6 | 2% |
| 18 | Meta description > 160 chars | 4 | 1% |
| 19 | Service/pricing/home page: "PTIN" absent from main content | 3 | 1% |
| 20 | Service/pricing/home page: no PTIN-review statement in main (any wording) | 3 | 1% |
| 21 | Canonical differs only by trailing slash/case (self-variant) | 1 | 0% |
| 22 | Non-200 final status | 0 | 0% |
| 23 | Sitemap URL redirects | 0 | 0% |
| 24 | noindex (meta or X-Robots-Tag) on a sitemap URL | 0 | 0% |
| 25 | Disallowed by robots.txt (User-agent: *) | 0 | 0% |
| 26 | Canonical missing | 0 | 0% |
| 27 | Canonical relative / multiple / points elsewhere | 0 | 0% |
| 28 | Title missing | 0 | 0% |
| 29 | Title > 60 chars (SERP truncation risk) | 0 | 0% |
| 30 | Duplicate title | 0 | 0% |
| 31 | Meta description missing | 0 | 0% |
| 32 | Duplicate meta description | 0 | 0% |
| 33 | H1 missing | 0 | 0% |
| 34 | H1 count > 1 | 0 | 0% |
| 35 | Thin (< 300 main words, indexable) | 0 | 0% |
| 36 | Links to apex host form5472prep.com (301s to www) | 0 | 0% |
| 37 | Broken internal links (4xx/5xx/error) | 0 | 0% |
| 38 | Links to redirecting internal URLs | 0 | 0% |
| 39 | Images missing alt attribute | 0 | 0% |
| 40 | JSON-LD parse error | 0 | 0% |
| 41 | Article/BlogPosting without dateModified | 0 | 0% |
| 42 | FAQPage schema but no visible question markup (h2/h3/summary/dt) | 0 | 0% |
| 43 | og:image missing | 0 | 0% |

### Worst 15 per issue

#### Images with empty alt other than logo-mark.svg (blog-card thumbnails etc.) (210)

- `/blog/topics/form-5472` — 24/24
- `/blog/topics/foreign-owned-llc` — 24/24
- `/blog/topics/ftin` — 24/24
- `/blog` — 23/25
- `/blog/topics/digital-nomad` — 21/21
- `/blog/topics/non-resident` — 18/18
- `/blog/topics/recordkeeping` — 16/16
- `/blog/topics/ein` — 15/15
- `/blog/topics/itin` — 15/15
- `/blog/topics/partner-program` — 10/10
- `/blog/topics/form-ss-4` — 8/8
- `/blog/topics/late-filing` — 7/7
- `/blog/topics/penalty` — 7/7
- `/blog/form-5472-filing-service-comparison` — 4/6
- `/blog/uk-company-car-vat-buy-lease-electric` — 4/6
- … +195 more (see pages.tsv)

#### Weakly linked: ≤ 2 inbound links from sitemap pages (excl. orphans) (60)

- `/blog/form-5472-from-mercury-wise-relay-statements` — 1 inbound
- `/blog/form-5472-south-korea-residents-us-llc` — 1 inbound
- `/blog/form-5472-taiwan-residents-us-llc` — 1 inbound
- `/blog/form-5472-indonesia-bali-residents-us-llc` — 1 inbound
- `/blog/form-5472-philippines-residents-us-llc` — 1 inbound
- `/blog/us-llc-vs-estonia-ou-vs-uae-company-digital-nomads` — 1 inbound
- `/blog/boi-reporting-foreign-owned-us-llc-2026` — 1 inbound
- `/blog/certificate-of-good-standing-foreign-owned-llc` — 1 inbound
- `/blog/sales-tax-nexus-foreign-owned-llc` — 1 inbound
- `/blog/form-5472-1099-k-foreign-owned-llc` — 1 inbound
- `/blog/form-5472-crypto-owner-transfers` — 1 inbound
- `/blog/form-5472-llc-pays-personal-expenses` — 1 inbound
- `/blog/form-5472-outstanding-owner-loan-no-transfers` — 1 inbound
- `/blog/itin-processing-time-status-delays` — 1 inbound
- `/blog/form-5472-china-residents-us-llc` — 1 inbound
- … +45 more (see pages.tsv)

#### Risky/stale wording: flagged sentence (see §5) (46)

- `/irs-form-5472` — online filer,CPA,guarantee,money-back
- `/form-5472-deadline` — online filer,guarantee,money-back
- `/file-form-5472` — online filer,guarantee,money-back
- `/form-5472-vs-1120` — online filer,CPA,guarantee,money-back
- `/delaware-llc-form-5472` — online filer,CPA,guarantee,money-back
- `/stripe-atlas-form-5472` — guarantee,money-back
- `/form-5472-reasonable-cause-statement` — guarantee,money-back
- `/late-form-5472` — online filer,guarantee,money-back
- `/wyoming-llc-form-5472` — online filer,guarantee,money-back
- `/pro-forma-1120` — online filer,CPA,guarantee,money-back
- `/form-1120-foreign-owned-llc` — online filer,CPA,guarantee,money-back
- `/form-5472-fax-number` — online filer,guarantee,money-back
- `/doola-form-5472` — online filer,guarantee,money-back
- `/firstbase-form-5472` — online filer,guarantee,money-back
- `/form-5472-penalty` — CP-15,online filer,guarantee,money-back
- … +31 more (see pages.tsv)

#### Brand "Form5472 Prep" absent from main content (29)

- `/do-i-need-to-file-form-5472` — variant "Form 5472 Prep": true
- `/irs-yearly-average-exchange-rates` — variant "Form 5472 Prep": false
- `/form-5472-reportable-transactions-checker` — variant "Form 5472 Prep": false
- `/form-5472-late-filing-checker` — variant "Form 5472 Prep": false
- `/foreign-owned-llc-compliance-calendar` — variant "Form 5472 Prep": false
- `/llc-annual-fees-by-state` — variant "Form 5472 Prep": false
- `/itin` — variant "Form 5472 Prep": false
- `/form-7004-extension` — variant "Form 5472 Prep": false
- `/blog/topics` — variant "Form 5472 Prep": false
- `/form-5472-instructions` — variant "Form 5472 Prep": false
- `/foreign-owned-llc-tax` — variant "Form 5472 Prep": true
- `/late-form-5472` — variant "Form 5472 Prep": false
- `/form-5472-vs-1120` — variant "Form 5472 Prep": false
- `/wyoming-llc-form-5472` — variant "Form 5472 Prep": false
- `/delaware-llc-form-5472` — variant "Form 5472 Prep": false
- … +14 more (see pages.tsv)

#### No question-form H2 (content pages; legal, blog index and /blog/topics/* excluded) (27)

- `/faq` — h2=7, loose-q(no "?")=1, q-H3=0, q-dt=55, words=3364
- `/blog/oregon-llc-foreign-owner-tax-filing` — h2=7, loose-q(no "?")=0, q-H3=4, q-dt=0, words=1068
- `/blog/form-5472-partner-program-how-it-works` — h2=7, loose-q(no "?")=2, q-H3=0, q-dt=0, words=1056
- `/blog/form-5472-noncash-property-transfers` — h2=6, loose-q(no "?")=0, q-H3=4, q-dt=0, words=1032
- `/blog/washington-llc-foreign-owner-tax-filing` — h2=7, loose-q(no "?")=0, q-H3=4, q-dt=0, words=1021
- `/blog/white-label-form-5472-filing-accounting-firms` — h2=6, loose-q(no "?")=2, q-H3=0, q-dt=0, words=998
- `/blog/form-5472-royalties-license-fees-intellectual-property` — h2=6, loose-q(no "?")=1, q-H3=4, q-dt=0, words=989
- `/blog/uk-company-car-vat-buy-lease-electric` — h2=7, loose-q(no "?")=0, q-H3=2, q-dt=0, words=979
- `/blog/form-5472-reasonable-estimates-small-amounts` — h2=8, loose-q(no "?")=1, q-H3=4, q-dt=0, words=969
- `/blog/form-5472-partner-program-company-formation-agents` — h2=6, loose-q(no "?")=1, q-H3=0, q-dt=0, words=967
- `/blog/form-5472-white-label-vs-standard-partner` — h2=6, loose-q(no "?")=1, q-H3=0, q-dt=0, words=959
- `/blog/electric-company-car-llc-tax-2026` — h2=7, loose-q(no "?")=0, q-H3=2, q-dt=0, words=955
- `/blog/form-5472-crypto-owner-transfers` — h2=5, loose-q(no "?")=1, q-H3=3, q-dt=0, words=923
- `/blog/business-car-mileage-vs-actual-2026` — h2=6, loose-q(no "?")=0, q-H3=2, q-dt=0, words=908
- `/blog/form-5472-partner-program-registered-agents` — h2=5, loose-q(no "?")=0, q-H3=0, q-dt=0, words=895
- … +12 more (see pages.tsv)

#### ≥3 visible Q&A (q-H2/summary) but no FAQPage schema (18)

- `/blog` — 1 q-H2 + 6 q-H3 + 0 summaries + 0 dt
- `/about` — 14 q-H2 + 0 q-H3 + 0 summaries + 0 dt
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
- `/blog/topics/foreign-owned-llc` — 0 q-H2 + 8 q-H3 + 0 summaries + 0 dt
- … +3 more (see pages.tsv)

#### Service/pricing/home page: exact phrase "tax accountant who holds an IRS PTIN" absent (17)

- `/ein` — review-statement variant in main: false
- `/itin` — review-statement variant in main: false
- `/form-7004-extension` — review-statement variant in main: false
- `/partners` — review-statement variant in main: true
- `/services` — review-statement variant in main: true
- `/services/form-5472-filing-service` — review-statement variant in main: true
- `/services/pro-forma-1120-filing-service` — review-statement variant in main: true
- `/services/late-form-5472-filing-service` — review-statement variant in main: true
- `/services/foreign-owned-llc-tax-filing-service` — review-statement variant in main: true
- `/services/form-5472-fax-filing-service` — review-statement variant in main: true
- `/services/white-label-form-5472-filing` — review-statement variant in main: true
- `/services/form-5472-filing-for-dormant-llc` — review-statement variant in main: true
- `/services/final-form-5472-for-dissolved-llc` — review-statement variant in main: true
- `/services/hire-someone-to-file-form-5472` — review-statement variant in main: true
- `/services/form-5472-preparer` — review-statement variant in main: true
- … +2 more (see pages.tsv)

#### Has question H2 but first one lacks ≤60-word answer capsule (16)

- `/form-5472-deadline-calculator` — first capsule words=72, ok 1/2
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
- `/blog/form-5472-penalty-notice-what-to-do` — first capsule words=72, ok 5/7
- `/blog/form-5472-saas-founders` — first capsule words=66, ok 5/7
- … +1 more (see pages.tsv)

#### Meta description < 70 chars (10)

- `/blog/topics/ein` — 59: 15 practical guides on EIN for foreign-owned US LLC owners.
- `/blog/topics/ftin` — 60: 29 practical guides on FTIN for foreign-owned US LLC owners.
- `/blog/topics/itin` — 60: 15 practical guides on ITIN for foreign-owned US LLC owners.
- `/blog/topics/penalty` — 62: 7 practical guides on Penalty for foreign-owned US LLC owners.
- `/blog/topics/form-ss-4` — 64: 8 practical guides on Form SS-4 for foreign-owned US LLC owners.
- `/blog/topics/form-5472` — 66: 168 practical guides on Form 5472 for foreign-owned US LLC owners.
- `/blog/topics/late-filing` — 66: 7 practical guides on Late Filing for foreign-owned US LLC owners.
- `/blog/topics/non-resident` — 68: 18 practical guides on Non-resident for foreign-owned US LLC owners.
- `/blog/topics/digital-nomad` — 69: 21 practical guides on Digital Nomad for foreign-owned US LLC owners.
- `/blog/topics/recordkeeping` — 69: 16 practical guides on Recordkeeping for foreign-owned US LLC owners.


#### Orphan: 0 inbound internal links from other sitemap pages (9)

- `/blog/stripe-atlas-doola-firstbase-form-5472` — 
- `/blog/single-member-llc-operating-agreement-foreign-owner` — 
- `/blog/form-5472-cash-accrual-year-end-cutoff` — 
- `/blog/form-5472-airbnb-short-term-rental-host` — 
- `/blog/form-5472-brazil-residents-us-llc` — 
- `/blog/form-5472-italy-residents-us-llc` — 
- `/blog/form-5472-japan-residents-us-llc` — 
- `/blog/form-5472-new-zealand-residents-us-llc` — 
- `/blog/form-5472-netherlands-residents-us-llc` — 


#### Fewer than half of question H2s have ≤60-word capsule (8)

- `/blog/sales-tax-nexus-foreign-owned-llc` — ok 1/9
- `/blog/file-form-5472-for-clients-without-being-a-cpa` — ok 2/7
- `/blog/certificate-of-good-standing-foreign-owned-llc` — ok 2/5
- `/blog/single-member-llc-operating-agreement-foreign-owner` — ok 1/5
- `/blog/foreign-owned-llc-filing-requirements-checklist` — ok 1/5
- `/blog/registered-agent-foreign-owned-llc` — ok 1/4
- `/blog/form-5472-owner-becomes-us-tax-resident` — ok 0/1
- `/blog/form-5472-recordkeeping-checklist` — ok 0/1


#### Short (300–600 main words, indexable) (8)

- `/blog/topics/penalty` — 331 words
- `/editorial-policy` — 336 words
- `/cookies` — 344 words
- `/blog/topics/late-filing` — 347 words
- `/blog/topics/form-ss-4` — 370 words
- `/contact` — 383 words
- `/blog/topics/partner-program` — 447 words
- `/security` — 470 words


#### FAQPage schema lists more questions than visible question markup (8)

- `/llc-annual-fees-by-state` — schema 6 vs visible 2
- `/contact` — schema 5 vs visible 1
- `/irs-yearly-average-exchange-rates` — schema 6 vs visible 3
- `/pricing` — schema 9 vs visible 7
- `/foreign-owned-llc-compliance-calendar` — schema 6 vs visible 4
- `/form-5472-reportable-transactions-checker` — schema 6 vs visible 5
- `/form-5472-late-filing-checker` — schema 6 vs visible 5
- `/compare/form-5472-filing-services` — schema 9 vs visible 8


#### Title < 30 chars (7)

- `/about` — 19: About Form5472 Prep
- `/blog` — 20: Blog · Form5472 Prep
- `/cookies` — 23: Cookies · Form5472 Prep
- `/press` — 23: Form5472 Prep Press Kit
- `/blog/topics/ein` — 26: EIN guides · Form5472 Prep
- `/blog/topics/ftin` — 27: FTIN guides · Form5472 Prep
- `/blog/topics/itin` — 27: ITIN guides · Form5472 Prep


#### Fewer than 3 contextual (in-main) internal links (7)

- `/data-retention` — 0 in-main / 58 total
- `/contact` — 1 in-main / 60 total
- `/editorial-policy` — 1 in-main / 59 total
- `/terms` — 1 in-main / 59 total
- `/privacy` — 1 in-main / 59 total
- `/cookies` — 1 in-main / 59 total
- `/security` — 1 in-main / 59 total


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


#### Meta description > 160 chars (4)

- `/do-i-need-to-file-form-5472` — 176: Who must file Form 5472 and the filing requirements, from the IRS instructions, plus a fre…
- `/form-5472-penalty` — 176: The Form 5472 penalty is $25,000 under IRC §6038A(d). How to ask the IRS to remove it, wha…
- `/pricing` — 166: Pricing for Form 5472 + pro forma 1120 filing: Standard $149 ready in 5-7 business days, E…
- `/form-5472-instructions` — 161: Form 5472 instructions (Rev. December 2024) in plain English for foreign-owned US LLCs: wh…


#### Service/pricing/home page: "PTIN" absent from main content (3)

- `/ein` — ptin anywhere on page: true
- `/itin` — ptin anywhere on page: true
- `/form-7004-extension` — ptin anywhere on page: true


#### Service/pricing/home page: no PTIN-review statement in main (any wording) (3)

- `/ein` — PTIN word in main: false; anywhere (footer): true
- `/itin` — PTIN word in main: false; anywhere (footer): true
- `/form-7004-extension` — PTIN word in main: false; anywhere (footer): true


#### Canonical differs only by trailing slash/case (self-variant) (1)

- `/` — https://www.form5472prep.com


_Issues with 0 pages:_ Non-200 final status; Sitemap URL redirects; noindex (meta or X-Robots-Tag) on a sitemap URL; Disallowed by robots.txt (User-agent: *); Canonical missing; Canonical relative / multiple / points elsewhere; Title missing; Title > 60 chars (SERP truncation risk); Duplicate title; Meta description missing; Duplicate meta description; H1 missing; H1 count > 1; Thin (< 300 main words, indexable); Links to apex host form5472prep.com (301s to www); Broken internal links (4xx/5xx/error); Links to redirecting internal URLs; Images missing alt attribute; JSON-LD parse error; Article/BlogPosting without dateModified; FAQPage schema but no visible question markup (h2/h3/summary/dt); og:image missing

## 3a. Duplicate title groups (0 groups, 0 pages)

None.


## 3b. Duplicate meta description groups (0 groups, 0 pages)

None.


## 4. Internal link targets that are not a clean 200

Checked 702 unique internal targets (all page anchors plus llms.txt links; `/_next/` and `/api/` skipped). **4xx/5xx/errors: 0. Redirecting: 0.**

None. Every unique internal anchor target returned 200 with no redirect. Soft-404 check: `/this-page-does-not-exist-xyz` and `/blog/nope-xyz` return a true 404; `/pricing/` → 308 → `/pricing`; apex `https://form5472prep.com/` → 301 → www.

Internal anchors pointing at robots-disallowed URLs: **124** unique targets (e.g. `/sign-in`, `/start?tier=standard`, `/start?tier=express`, `/partner/sign-in`, `/start?src=tool-deadline`, `/start?src=tool-checker`, `/start?src=tool-penalty`, `/start?src=tool-exchange-rates`); these are crawl-blocked by `Disallow: /start?` etc. — expected for CTA/tracking links, but they dilute link equity if not rel=nofollow.

## 5. Risky / stale wording

Each hit is judged by its **sentence**. Sources: `main` = inside `<main>`; `chrome` = header/footer outside `<main>`; `meta` = title+description; `jsonld` = structured-data strings; `tel-link`. Identical sentences are grouped; groups on > 20 pages are shown as site-wide template text. Full per-page list: `risky.tsv`. Labels: `us-claim?` = first-person sentence (we/our/Form5472 Prep) with no negation — needs a human read; `negated` = “not a CPA”-style disclaimer; `generic` = third-party/educational use; `add-on(ok)` = $99 framed as per-additional-year; `STARTING?` = $99 near start/from/base wording; `PHONE?` = 855-887-7737 with no fax/IRS/Ogden wording in the sentence; `irs-ctx-no-fax-word` = IRS/Ogden mentioned but the word “fax” is not.

| pattern | distinct sentences | pages | flagged sentences | flagged pages |
|---|---|---|---|---|
| CP-15 | 3 | 2 | 3 | 2 |
| 3-business-days+Express | 0 | 0 | 0 | 0 |
| $99 | 95 | 160 | 0 | 0 |
| no-Form-7004 | 3 | 2 | 0 | 0 |
| online filer | 4 | 20 | 4 | 20 |
| automatically generat* | 0 | 0 | 0 | 0 |
| IRS-approved | 1 | 1 | 1 | 1 |
| licensed | 14 | 7 | 2 | 1 |
| CPA | 179 | 281 | 19 | 15 |
| guarantee | 115 | 73 | 10 | 33 |
| money-back | 16 | 37 | 11 | 33 |
| no human review | 0 | 0 | 0 | 0 |
| 855-887-7737 | 212 | 281 | 4 | 2 |
| filed-within-24h | 1 | 1 | 1 | 1 |

### CP-15 — 3 hit(s) on 2 page(s)

- [hit / main+jsonld] “The IRS manual (IRM 20.1.9.5.2) says a CP 215 is generated once a Form 5472 penalty is assessed; CP 15 is the equivalent notice for individual accounts.” — `/faq`
- [hit / main+jsonld] “What's a CP 15 or CP 215 notice?” — `/form-5472-penalty`
- [hit / main+jsonld] “CP 15 is the IRS's Notice of Penalty Charge for penalties assessed on an individual's account.” — `/form-5472-penalty`

### 3-business-days+Express — 0 hit(s) on 0 page(s)

None.

### $99 — 200 hit(s) on 160 page(s)


_Not flagged (95 distinct sentences, 200 page-hits): add-on(ok), unclear — first 9 incl. site-wide:_
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

### online filer — 23 hit(s) on 20 page(s)

- [hit / main] “Our 15-minute online filer handles the whole package — Form 5472, pro forma Form 1120, Part V supporting statement, cover letter, and reasonable cause statement (if late).” — `/irs-form-5472`
- [hit / main+jsonld] “Use our 15-minute online filer to generate the full package: cover letter, pro forma 1120 with the "Foreign-Owned U.S.” — `/form-5472-deadline`
- [hit / jsonld] “Use our 15-minute online filer to generate the full package: cover letter” — `/form-5472-deadline`
- [hit / main] “The IRS accepts the annual package by mail or fax to the Ogden PIN Unit at +1-855-887-7737, and our 15-minute online filer starts from $149.” — `/file-form-5472`, `/form-5472-penalty`, `/diirsp`, `/form-5472-instructions`, `/late-form-5472`, `/form-5472-vs-1120`, `/wyoming-llc-form-5472`, `/delaware-llc-form-5472` … +12

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

### CPA — 551 hit(s) on 281 page(s)

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
- [us-claim? / main] “Three ways to file Form 5472 for a foreign-owned US LLC, checked 24 October 2026: Snapfile at $79, where an AI system reviews the filing; Form5472 Prep at $149, where a tax accountant holding an IRS PTIN reviews it; and form5472.online at $448 to $547, which i” — `/blog/form-5472-filing-service-comparison`
- [us-claim? / main+jsonld] “Are you a CPA firm we can present as our tax adviser?” — `/blog/offer-form-5472-filing-as-a-service`
- [us-claim? / main] “Form5472 Prep is a form-preparation and filing-courier service rather than a CPA firm.” — `/blog/form-5472-partner-program-registered-agents`
- [us-claim? / main] “We do not prepare Form 1065 partnership returns — if your LLC is a partnership, you need a CPA or enrolled agent who does.” — `/blog/multi-member-llc-form-5472-or-1065`

_Not flagged (160 distinct sentences, 532 page-hits): generic, negated — first 9 incl. site-wide:_
- [negated / main] “We are not a CPA firm and do not give tax advice.” — **site-wide, 50 pages**
- [generic / chrome+main+jsonld] “Form 5472 for Accountants, CPAs and Tax Preparers” — **site-wide, 281 pages**
- [generic / main+jsonld] “Are you a CPA firm?” — `/faq`
- [negated / main] “We are not a CPA firm and do not give tax or legal advice.” — `/form-7004-extension`
- [generic / main] “For agencies, CPA firms & registered agents” — `/partners`
- [generic / main+jsonld] “Formation agencies, registered agents, CPA and accounting firms, and consultants who manage US LLCs for multiple foreign-owned clients and need to batch Form 5472 filings under a single account.” — `/partners`
- [generic / jsonld] “Formation agencies, CPA firms, and registered agents managing foreign-owned US LLCs” — `/partners`
- [negated / main] “We are not a CPA firm or a general tax firm.” — `/about`

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

### 855-887-7737 — 575 hit(s) on 281 page(s)

- [PHONE? / main] “Does the destination match 855-887-7737 ?” — `/blog/form-5472-irs-receipt-confirmation-status`
- [PHONE? / main] “+1 855-887-7737” — `/blog/form-5472-irs-receipt-confirmation-status`
- [PHONE? / main+jsonld] “Enter 855-887-7737 and recheck every digit.” — `/blog/how-to-fax-form-5472-irs`
- [PHONE? / jsonld] “Enter 855-887-7737 and recheck every digit” — `/blog/how-to-fax-form-5472-irs`

_Not flagged (208 distinct sentences, 571 page-hits): fax-context(ok), irs-ctx-no-fax-word — first 9 incl. site-wide:_
- [irs-ctx-no-fax-word / chrome] “Filed to the IRS Ogden PIN Unit · +1-855-887-7737” — **site-wide, 281 pages**
- [fax-context(ok) / main] “Form5472 Prep filing questionnaire, IRS fax delivery to Ogden PIN Unit (+1-855-887-7737)” — `/`
- [fax-context(ok) / main+jsonld] “After you sign, we fax the complete package to the IRS Ogden PIN Unit at +1-855-887-7737.” — `/`
- [fax-context(ok) / main+jsonld] “The special IRS instructions allow fax to +1-855-887-7737 or mail to the dedicated Ogden PIN Unit address.” — `/`
- [fax-context(ok) / jsonld] “IRS fax delivery to Ogden PIN Unit (+1-855-887-7737)” — `/`
- [fax-context(ok) / main+jsonld] “The IRS Form 5472 instructions say a foreign-owned U.S. disregarded entity cannot file Form 5472 electronically, so it goes with its pro forma Form 1120 by fax to +1-855-887-7737 or by mail to the IRS Ogden PIN Unit.” — `/faq`
- [fax-context(ok) / main] “Where to send it: fax (300 DPI or higher) to +1-855-887-7737, or mail to Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201.” — `/do-i-need-to-file-form-5472`

### filed-within-24h — 1 hit(s) on 1 page(s)

- [hit / main] “That is not the same as filed within 24 hours, and we will not say otherwise to win an order.” — `/blog/form-5472-deadline-tomorrow-urgent-filing`

All `tel:` hrefs on the site: none.

## 6. Question-form H2 and answer-capsule coverage by section

Pages counted are content pages: legal pages, the /blog index and the 13 `/blog/topics/*` listing pages are excluded (they are navigation lists). “Question H2” = `<h2>` text ending in `?` inside `<main>` (nav/footer/aside stripped). “Capsule” = first `<p>` after the first question H2 (before the next h1/h2) with ≤ 60 words. “Loose” = H2 starts with an interrogative but has no `?`.

| section | pages | 0 q-H2 | ≥1 q-H2 | avg q-H2 / page | loose-q (no ?) pages | first capsule ≤60w | avg capsule ratio | avg H2 | pages with q-H3 | pages with `<summary>` Q&A |
|---|---|---|---|---|---|---|---|---|---|---|
| home | 1 | 0 | 1 | 10.0 | 0 | 1/1 | 0.9 | 13.0 | 1 | 0 |
| pricing | 1 | 0 | 1 | 4.0 | 0 | 1/1 | 1.0 | 5.0 | 1 | 0 |
| services | 13 | 0 | 13 | 6.5 | 0 | 13/13 | 1.0 | 9.6 | 0 | 0 |
| product | 4 | 0 | 4 | 3.5 | 0 | 4/4 | 0.9 | 4.3 | 4 | 0 |
| tools | 8 | 0 | 8 | 3.6 | 0 | 7/8 | 0.9 | 5.9 | 3 | 1 |
| guides | 30 | 0 | 30 | 8.8 | 0 | 30/30 | 1.0 | 12.3 | 0 | 0 |
| compare | 2 | 0 | 2 | 6.0 | 0 | 2/2 | 0.8 | 8.5 | 0 | 0 |
| blog | 197 | 25 | 172 | 5.6 | 14 | 157/172 | 0.9 | 8.4 | 176 | 0 |
| info | 6 | 2 | 4 | 4.8 | 1 | 4/4 | 1.0 | 8.0 | 0 | 0 |

### /services (hub + 12 service pages): 13 pages — 0 with no question H2, 0 with q-H2 but no ≤60-word first capsule

### Guides `/[seoSlug]` (30): 30 pages — 0 with no question H2, 0 with q-H2 but no ≤60-word first capsule

### /blog (index + posts): 197 pages — 25 with no question H2, 15 with q-H2 but no ≤60-word first capsule

**No question H2** (25; top 15 by word count):
- `/blog/oregon-llc-foreign-owner-tax-filing` — h2=7, loose-q=0, q-H3=4, q-dt=0, q-summary=0, words=1068, faqSchema=4
- `/blog/form-5472-partner-program-how-it-works` — h2=7, loose-q=2, q-H3=0, q-dt=0, q-summary=0, words=1056, faqSchema=0
- `/blog/form-5472-noncash-property-transfers` — h2=6, loose-q=0, q-H3=4, q-dt=0, q-summary=0, words=1032, faqSchema=4
- `/blog/washington-llc-foreign-owner-tax-filing` — h2=7, loose-q=0, q-H3=4, q-dt=0, q-summary=0, words=1021, faqSchema=4
- `/blog/white-label-form-5472-filing-accounting-firms` — h2=6, loose-q=2, q-H3=0, q-dt=0, q-summary=0, words=998, faqSchema=0
- `/blog/form-5472-royalties-license-fees-intellectual-property` — h2=6, loose-q=1, q-H3=4, q-dt=0, q-summary=0, words=989, faqSchema=4
- `/blog/uk-company-car-vat-buy-lease-electric` — h2=7, loose-q=0, q-H3=2, q-dt=0, q-summary=0, words=979, faqSchema=2
- `/blog/form-5472-reasonable-estimates-small-amounts` — h2=8, loose-q=1, q-H3=4, q-dt=0, q-summary=0, words=969, faqSchema=4
- `/blog/form-5472-partner-program-company-formation-agents` — h2=6, loose-q=1, q-H3=0, q-dt=0, q-summary=0, words=967, faqSchema=0
- `/blog/form-5472-white-label-vs-standard-partner` — h2=6, loose-q=1, q-H3=0, q-dt=0, q-summary=0, words=959, faqSchema=0
- `/blog/electric-company-car-llc-tax-2026` — h2=7, loose-q=0, q-H3=2, q-dt=0, q-summary=0, words=955, faqSchema=2
- `/blog/form-5472-crypto-owner-transfers` — h2=5, loose-q=1, q-H3=3, q-dt=0, q-summary=0, words=923, faqSchema=3
- `/blog/business-car-mileage-vs-actual-2026` — h2=6, loose-q=0, q-H3=2, q-dt=0, q-summary=0, words=908, faqSchema=2
- `/blog/form-5472-partner-program-registered-agents` — h2=5, loose-q=0, q-H3=0, q-dt=0, q-summary=0, words=895, faqSchema=0
- `/blog/form-5472-llc-pays-personal-expenses` — h2=5, loose-q=1, q-H3=3, q-dt=0, q-summary=0, words=890, faqSchema=3
- … +10 more

**Question H2 but weak capsule** (15):
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
- `/blog/form-5472-penalty-notice-what-to-do` — first capsule words=72 (−1 = no <p>), ok 5/7
- `/blog/form-5472-saas-founders` — first capsule words=66 (−1 = no <p>), ok 5/7
- `/blog/form-5472-extension` — first capsule words=73 (−1 = no <p>), ok 2/4


### Tools (calculators / checkers): 8 pages — 0 with no question H2, 1 with q-H2 but no ≤60-word first capsule

**Question H2 but weak capsule** (1):
- `/form-5472-deadline-calculator` — first capsule words=72 (−1 = no <p>), ok 1/2


## 7. Schema (JSON-LD) coverage by page type

Cell = pages of that type carrying the schema type (top-level or `@graph` node).

| page type | n | no JSON-LD | Organization | WebSite | WebPage | Service | Article | BlogPosting | FAQPage | HowTo | BreadcrumbList | ItemList | CollectionPage | Product | WebApplication | Dataset | ContactPage | AboutPage |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| home | 1 | 0 | 1 | 1 | 1 | 1 | · | · | 1 | 1 | 1 | · | · | · | · | · | · | · |
| pricing | 1 | 0 | 1 | · | 1 | · | · | · | 1 | · | 1 | · | · | 1 | · | · | · | · |
| info | 6 | 1 | 2 | · | 2 | · | 1 | · | 3 | · | 5 | · | · | · | · | · | 1 | 1 |
| tool | 8 | 0 | · | · | 8 | · | · | · | 8 | · | 8 | · | · | · | 8 | 2 | · | · |
| product | 4 | 0 | · | · | 3 | 4 | · | · | 4 | 3 | 4 | · | · | · | · | · | · | · |
| blog-index | 1 | 0 | · | · | · | · | · | · | · | · | 1 | · | 1 | · | · | · | · | · |
| blog-topic | 13 | 0 | · | · | · | · | · | · | · | · | 13 | · | 13 | · | · | · | · | · |
| legal | 5 | 5 | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · |
| compare-hub | 1 | 0 | 1 | · | · | · | · | · | 1 | · | 1 | · | 1 | · | · | · | · | · |
| compare | 1 | 0 | 1 | · | · | · | 1 | · | 1 | · | 1 | 1 | · | · | · | · | · | · |
| services-hub | 1 | 0 | 1 | · | · | · | · | · | · | · | 1 | · | 1 | · | · | · | · | · |
| service | 12 | 0 | 12 | · | 12 | 12 | · | · | 12 | 5 | 12 | · | · | · | · | · | · | · |
| guide | 30 | 0 | 30 | · | · | · | 30 | · | 30 | 10 | 30 | · | · | · | · | · | · | · |
| blog-post | 197 | 0 | 197 | · | · | · | · | 197 | 182 | 95 | 197 | · | · | · | · | · | · | · |

- Parse errors: 0 block(s) on 0 page(s).
- FAQPage: 243 pages; total schema questions 1486; pages: `/`(11), `/pricing`(9), `/faq`(55), `/form-5472-deadline-calculator`(5), `/do-i-need-to-file-form-5472`(4), `/form-5472-penalty-calculator`(5), `/irs-yearly-average-exchange-rates`(6), `/form-5472-reportable-transactions-checker`(6), `/form-5472-late-filing-checker`(6), `/foreign-owned-llc-compliance-calendar`(6), `/llc-annual-fees-by-state`(6), `/ein`(18), `/itin`(9), `/form-7004-extension`(8), `/partners`(6), `/contact`(5), `/compare`(6), `/form-5472-statistics`(5), `/compare/form-5472-filing-services`(9), `/services/form-5472-filing-service`(4).
- Pages with dateModified: 271; datePublished: 229.
- JSON-LD dateModified older than 90 days (vs 2026-10-30): `/blog/amazon-fba-foreign-sellers-form-5472` 2026-07-06, `/blog/form-5472-canada-residents-us-llc` 2026-07-06.
- dateModified (JSON-LD) ≠ sitemap lastmod (date part): 13 pages — e.g. `/` ld=2026-08-16 sm=2026-09-30; `/pricing` ld=2026-10-26 sm=2026-09-30; `/faq` ld=2026-10-26 sm=2026-09-11; `/ein` ld=2026-08-16 sm=2026-09-14; `/itin` ld=2026-08-16 sm=2026-09-14; `/partners` ld=2026-08-16 sm=2026-09-18.

## 8. Thin / short pages

Thin (<300 main words, indexable): **0**. None — shortest page is 331 words.


Shortest 20 pages by main-content words:
- `/blog/topics/penalty` — 331 words (blog-topic)
- `/editorial-policy` — 336 words (info)
- `/cookies` — 344 words (legal)
- `/blog/topics/late-filing` — 347 words (blog-topic)
- `/blog/topics/form-ss-4` — 370 words (blog-topic)
- `/contact` — 383 words (info)
- `/blog/topics/partner-program` — 447 words (blog-topic)
- `/security` — 470 words (legal)
- `/data-retention` — 600 words (legal)
- `/blog/topics/itin` — 658 words (blog-topic)
- `/blog/topics/ein` — 675 words (blog-topic)
- `/blog/topics/recordkeeping` — 683 words (blog-topic)
- `/blog/medellin-digital-nomad-rolling-365-day-tax-log` — 744 words (blog-post)
- `/blog/topics` — 745 words (blog-topic)
- `/blog/kuala-lumpur-digital-nomad-cross-year-tax-records` — 759 words (blog-post)
- `/blog/multiple-related-parties-form-5472` — 761 words (blog-post)
- `/blog/barcelona-digital-nomad-visa-us-llc-tax-election` — 762 words (blog-post)
- `/blog/bangkok-digital-nomad-llc-transfer-remittance-records` — 770 words (blog-post)
- `/blog/tbilisi-digital-nomad-georgian-ie-us-llc-records` — 788 words (blog-post)
- `/blog/buenos-aires-digital-nomad-llc-usd-ars-reconciliation` — 789 words (blog-post)

Word-count distribution by section:

| section | min | median | max | <600 |
|---|---|---|---|---|
| home | 2654 | 2654 | 2654 | 0 |
| pricing | 1245 | 1245 | 1245 | 0 |
| services | 944 | 1244 | 1426 | 0 |
| product | 920 | 1461 | 1900 | 0 |
| tools | 1107 | 1507 | 3573 | 0 |
| guides | 1292 | 2545 | 3259 | 0 |
| compare | 901 | 2998 | 2998 | 0 |
| blog | 331 | 1914 | 2870 | 4 |
| info | 336 | 1476 | 3364 | 2 |
| legal | 344 | 600 | 1283 | 2 |

## 9. Sitemap / robots / noindex / canonical conflicts

Sitemap URLs with any conflict (non-200, redirect, noindex, robots-blocked, canonical missing/relative/multiple/elsewhere): **0**.


Canonical equals page up to trailing slash/case only (harmless but inconsistent):
- `/` — https://www.form5472prep.com

### robots.txt

- `/robots.txt`: HTTP 200, 5773 bytes, 18 user-agent group(s), Sitemap directive(s): https://www.form5472prep.com/sitemap.xml.
- `User-agent: *` rules: allow: /; disallow: /*?_rsc=; disallow: /*?*&_rsc=; disallow: /dashboard; disallow: /filings; disallow: /applications/; disallow: /admin; disallow: /api/; disallow: /start?; disallow: /sign-in; disallow: /partner/sign-in; disallow: /ein/apply; disallow: /itin/apply; disallow: /form-7004-extension/apply.
- Per-bot check of all 281 sitemap URLs:

| bot | has own group | sitemap URLs allowed | blocked |
|---|---|---|---|
| Googlebot | no (falls to *) | 281 | 0 |
| Bingbot | no (falls to *) | 281 | 0 |
| GPTBot | yes | 281 | 0 |
| ChatGPT-User | yes | 281 | 0 |
| OAI-SearchBot | yes | 281 | 0 |
| ClaudeBot | yes | 281 | 0 |
| Claude-SearchBot | no (falls to *) | 281 | 0 |
| Claude-User | no (falls to *) | 281 | 0 |
| anthropic-ai | yes | 281 | 0 |
| PerplexityBot | yes | 281 | 0 |
| Perplexity-User | yes | 281 | 0 |
| Google-Extended | yes | 281 | 0 |
| Applebot-Extended | yes | 281 | 0 |
| CCBot | yes | 281 | 0 |
| Bytespider | yes | 281 | 0 |
| Amazonbot | no (falls to *) | 281 | 0 |
| meta-externalagent | yes | 281 | 0 |
| cohere-ai | yes | 281 | 0 |

### llms.txt / llms-full.txt

- `/llms.txt`: HTTP 200, 62271 bytes (60.8 KB), content-type `text/plain; charset=utf-8`, 414 lines, 267 markdown links, 272 unique internal URLs.
- `/llms-full.txt`: HTTP 200, 344258 bytes (336.2 KB).
- Sitemap URLs **not listed** in llms.txt: 13 — `/blog/topics`, `/blog/topics/form-5472`, `/blog/topics/foreign-owned-llc`, `/blog/topics/ftin`, `/blog/topics/digital-nomad`, `/blog/topics/non-resident`, `/blog/topics/recordkeeping`, `/blog/topics/ein`, `/blog/topics/itin`, `/blog/topics/partner-program`, `/blog/topics/form-ss-4`, `/blog/topics/late-filing` ….
- llms.txt internal URLs **not in sitemap**: 4 — `/llms-services.txt`, `/llms-guides.txt`, `/llms-full.txt`, `/feed.xml`; of these non-200/redirecting: 0.

### Sitemap hygiene

- Duplicate sitemap URLs: 0. Missing `<lastmod>`: 0.
- `<lastmod>` distribution (date: URLs): 2026-10-28: 1; 2026-10-24: 8; 2026-10-19: 1; 2026-10-18: 1; 2026-10-17: 1; 2026-10-16: 2; 2026-10-15: 21; 2026-10-11: 1; 2026-10-07: 18; 2026-10-05: 12; 2026-10-04: 2; 2026-10-03: 12; 2026-09-30: 8; 2026-09-29: 13 … (28 distinct dates).
- Server response (fetch) ms: median 266, p95 357, max 517. HTML bytes: median 150511.

## 10. Brand, PTIN statement, images

- "Form5472 Prep" in main content: 252/281 pages (variant "Form 5472 Prep" with space in main: 32).
- PTIN scope pages (home, pricing, /services*, ein/itin/7004/partners): 19. Review-by-PTIN-holding-accountant statement in main (any wording, e.g. “PTIN-holding tax accountant” or “tax accountant who holds an IRS Preparer Tax Identification Number (PTIN)”): 16/19; "PTIN" word in main: 16/19; the literal phrase “tax accountant who holds an IRS PTIN”: 2/19; PTIN anywhere on page incl. footer/chrome: 19/19.
  - `/`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/pricing`: review-statement=yes, PTIN word in main=yes, literal phrase=yes, footer/any=yes
  - `/ein`: review-statement=NO, PTIN word in main=NO, literal phrase=no, footer/any=yes
  - `/itin`: review-statement=NO, PTIN word in main=NO, literal phrase=no, footer/any=yes
  - `/form-7004-extension`: review-statement=NO, PTIN word in main=NO, literal phrase=no, footer/any=yes
  - `/partners`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/form-5472-filing-service`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/pro-forma-1120-filing-service`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/late-form-5472-filing-service`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/foreign-owned-llc-tax-filing-service`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/form-5472-fax-filing-service`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/white-label-form-5472-filing`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/form-5472-filing-for-dormant-llc`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/final-form-5472-for-dissolved-llc`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/hire-someone-to-file-form-5472`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/form-5472-preparer`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/form-5472-for-accountants`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
  - `/services/form-5472-for-bookkeepers`: review-statement=yes, PTIN word in main=yes, literal phrase=no, footer/any=yes
- PTIN in main content across all page types: 172/281 (guides 30/30, blog 116/211).
- Images: 1418 total across 224 pages; missing alt attr: 0; empty alt on logo-mark.svg (decorative by design): 198; empty alt on other images (card thumbnails): 1000.

## 11. Could not fetch / caveats

Nothing: all 281 sitemap URLs fetched with HTTP 200 on first request, no retries needed beyond the built-in one.

- Not measured: rendered-DOM (JS) content, Core Web Vitals, backlinks, SERP/AI-citation visibility, hreflang, image file sizes, `og:`/Twitter tags beyond `og:image`.
- Heuristics are regex-based (no DOM parser): heading/paragraph/word counts treat `<main>` minus nav/footer/aside as content; question-H2 detection requires a literal trailing `?`.
