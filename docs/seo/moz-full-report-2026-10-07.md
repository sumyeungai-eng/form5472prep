# Moz full report: what to improve on form5472prep.com (2026-10-07)

**For:** the owner. **Written:** 2026-10-07.
**Sources:** the Moz extracts in `docs/seo/moz-data-2026-10-07/`: `campaign.md` (cited as "C §n"), `rankings.tsv` ("TSV") and `ai-visibility-and-research.md` ("AI §n"). I also used the repo at origin/main (`16c8e91`), live-site checks run today with curl, and the earlier SEO docs listed in section 6.
**Rule used throughout:** every number comes from those files or from a check run today. Where a point is my own inference, it is labelled **(inference)**.

## How to read this

**When Moz collected its data.** Most of it is older than today's site.

| Data | Collected | Next collection |
|---|---|---|
| Keyword ranks (246 keywords, Google desktop, USA) | 2026-10-04. This is the first and only collection, so there is no trend yet. | Oct 11 |
| Site crawl (658 pages) | 2026-10-05 | Oct 11 |
| Page Optimization scores | "as of Oct 3" | weekly |
| AI Visibility (40 prompts, 18 with answers) | 2026-10-05, 11:13 to 11:20 UTC | Oct 12 |
| Links, Link Intersect, Keyword Gap, Domain Overview | live on 2026-10-07 | n/a |

**What changed after Moz looked.** A lot shipped on 2026-10-04 and 2026-10-05, after the Oct 4 rank collection. Moz cannot see any of it yet:
- `/compare` and `/press` (`39aea39`).
- The embeddable calculators (`9cde0c0`).
- `/form-5472-statistics` (`b15bee8`).
- Four new audience service pages: hire someone, preparer, accountants, bookkeepers (`44020dc`).
- Internal-link fixes for wrong-page rankings (`1601bf0`).
- The AEO pass, which shipped after the AI collection (`6fa146e`, `2e2eba9`, `12aebe7`, `2769e9c`, `d68a886`):
  - answer capsules and question headings on every service page;
  - the price comparison page `/compare/form-5472-filing-services`;
  - corrected facts;
  - the llms.txt rebuild.

When a finding is already addressed in code, it is marked **"shipped after data date: re-check Oct 11/12"**.

**Plain-English glossary**
- **Search visibility**: Moz's estimate of the share of clicks we would get from the 246 tracked searches, given where we rank.
- **DA (Domain Authority, 0 to 100)**: Moz's estimate of how strong a site is in Google, driven mostly by links from other sites.
- **BA (Brand Authority, 0 to 100)**: Moz's estimate of brand strength.
- **Linking domain**: another website that links to us.
- **Cannibalisation**: two of our own pages chase the same search. Google splits the signals between them and often shows the weaker one.
- **noindex**: a tag that tells Google not to list a page.
- **308**: a permanent redirect.
- **Disavow**: a Google tool that asks Google to ignore specific links.
- **sameAs**: a field in a page's hidden structured data that lists a company's official profiles, which helps AI engines recognise the brand.
- **Answer capsule**: a direct answer of 60 words or fewer placed under a question heading.

---

## 1. TL;DR

- **We already lead the niche on Moz's visibility score, but only on tiny searches.**
  - Visibility: us 1.85%, Form5472.online 1.67%, doola 0.33%, Firstbase 0.31% (C §1).
  - We hold 14 keywords in the top 3 and 24 in the top 10. Form5472.online has 12 and 37 (C §3).
  - Every searched-for term is outside Moz's top 50. Examples: "form 5472" (1.7k to 2.9k searches a month), "form 5472 instructions" (501 to 850) and "irs form 5472" (201 to 500) (TSV).
- **More content is not the main fix. Authority and indexing are.**
  - 149 of the 206 tracked keywords where we are outside the top 50 already have a live page whose title matches the keyword (section 3.2).
  - Our late-filing service page scores 100/100 on Moz's on-page grader and still ranks #11, behind Form5472.online at #2 (C §3, §5b).
  - Our DA is 10 and our Brand Authority is 1. Doola and Firstbase both have BA 28 (AI §6).
  - Of our 61 linking domains, 53 are one automated spam advert page that also names Form5472.online (C §6b, AI §3.3). We have essentially no genuine editorial links.
- **Our own pages compete with each other.**
  - 25 of the 40 keywords we rank for land on a different page from the one built for them. 4 of these were fixed after the data date, 3 are acceptable, and 18 still need action (Appendix A).
  - The 27 guide pages built in May to August for the head terms get almost no links from our 183 blog posts. Blog posts on the same topics get 27 to 34 links each, and Google mostly shows the blog post (section 2.2).
- **AI answers name us rarely.**
  - We are named in 9 of the 76 engine-and-prompt slots, and only on our own brand or price questions (AI §1.2).
  - Gemini names us in 10.5% of answers. It names doola and Firstbase in 42% (AI §1.1).
  - The engines cite irs.gov (48 of 149 citations) and competitors' "best Form 5472 services" round-up articles (AI §1.4).
  - The fix is mostly owner work: a real company identity with linked official profiles, and getting listed on the comparison pages the engines read.
- **Don't disavow the spam links now.** Google says most sites never need to. Check Search Console's Manual Actions page once a month (section 2.4).
- **Moz can't see most of this week's work yet.** The price comparison page, the 4 audience service pages and the answer capsules all shipped after Moz's data date. Judge them after the Oct 11 and Oct 12 collections, and properly after 3 or 4 weekly collections.
- **The three moves that matter most:**
  1. We run Search Console URL Inspection on 12 key URLs to confirm Google has indexed them (action O1; about 10 indexing requests a day).
  2. We do an internal-linking pass that gives each topic one "owner" page (action C1).
  3. Owner starts the curated directory and comparison-site outreach at one a day (actions O2 and O3).

---

## 2. Scorecard

**Rankings and authority** (Google desktop, USA; ranks from Oct 4, other metrics from Oct 7)

| Metric | form5472prep.com (us) | Form5472.online | doola | Firstbase | Source |
|---|---|---|---|---|---|
| Search visibility (246 tracked keywords) | **1.85%** | 1.67% | 0.33% | 0.31% | C §1 |
| Tracked keywords in top 3 / top 10 / top 20 | 14 / 24 / 40 | 12 / 37 / 69 | 1 / 6 / 14 | 2 / 7 / 9 | C §3 |
| Domain Authority | 10 (was 1 twelve months ago) | 17 | 38 | 37 | C §1, AI §2.1 |
| Brand Authority | **1** | 1 | 28 | 28 | AI §6 |
| Homepage Page Authority | 28 | 33 | 49 | 47 | AI §6 |
| Linking domains (followed) | 61 (54) | 276 (255) | ~4.6k (2,644) | ~1.9k (1,256) | C §6 |
| **Genuine editorial linking domains** | **2**: Form5472.online (followed) and form5472.ai (nofollow). Both are competitors. | (not split by Moz) | (not split) | (not split) | AI §3.3 |
| Spam advert linking domains | 53 of 61 | the same 53 | n/a | n/a | AI §3.3 |
| Moz Spam Score (domain) | 16% | 11% | 1% | 7% | C §6 |
| Keywords Moz sees us ranking for (top 100) | 80 | 274 | ~7k | ~3k | AI §5.1 |

**AI answers** (one collection on Oct 5)

| Engine | Us | Form5472.online | doola | Firstbase | Source |
|---|---|---|---|---|---|
| ChatGPT: share of answers naming the brand | 10.5% (2/19) | 15.8% | 5.3% | 0% | AI §1.1 |
| Google AI Mode | 21.1% (4/19) | 15.8% | 21.1% | 15.8% | AI §1.1 |
| Gemini | **10.5%** (2/19) | 26.3% | **42.1%** | **42.1%** | AI §1.1 |
| Perplexity | 5.6% (1/18) | 5.6% | 11.1% | 11.1% | AI §1.1 |
| Citations of the brand's own domain (of 149) | 13 | 16 | 2 (doola.com + ask.doola.com) | 0 | AI §1.4 |
| Bing Copilot citations of our pages, Sep 8 to Oct 3 (not Moz; Bing Webmaster Tools) | **1.3K** | n/a | n/a | n/a | geo-baseline §6 |

**What the scorecard says**
- We win more top-3 spots than anyone, but on searches Moz mostly can't even measure. It has no volume figure for 202 of the 246 keywords (C §1d).
- Form5472.online wins breadth: 69 keywords in the top 20 against our 40, on DA 17. Its links are mostly about 110 bulk web directories plus press-release wires (AI §4.2).
- Bing's Copilot already cites our pages heavily (1.3K citations in 30 days). Our content can be cited. What is missing is authority and recognition by Google, ChatGPT and Gemini.

---

## 3. Findings and recommendations

### 3.1 Wrong-page rankings and cannibalisation

**What the data shows**
- **25 of our 40 ranked keywords land on a page other than the intended one.** Of those:
  - 4 were addressed after the data date by `1601bf0` and `44020dc`;
  - 3 are acceptable alternates;
  - 18 need action.
- The full table is Appendix A. The intended owner pages come from the target keywords in `services-pages.ts` and `landing-pages.ts`, the tool routes and the blog slugs.

**Patterns behind the mismatches**
1. **Money keywords landing on the late-filing service page.**
   - "form 5472 fax filing service", "form 5472 penalty calculator", "form 5472 preparation service" and "form5472prep" all rank #1 via `/services/late-form-5472-filing-service` (TSV).
   - The late page links to the fax and preparer pages and to the penalty calculator. Those links shipped after the data date in `1601bf0`, and today's live check confirms the cards exist.
   - **Do NOT add those phrases to the late page.** Moz's Page Optimization suggestions for these pairs (C §5b) would deepen the cannibalisation.
2. **Head-term guide pages vs blog posts.** We run two content systems for the same topics:
   - 27 indexable guide pages under `/[seoSlug]`, written May to August;
   - 183 published blog posts.
3. **The blog posts collect almost all internal links.** Counts of markdown links in `content/blog` (check run today):

| Topic | Guide page and its inbound blog links | Blog page and its inbound blog links | What Google showed |
|---|---|---|---|
| Deadline | `/form-5472-deadline`: **0** | `/blog/form-5472-deadline-2026`: **27** | the blog post, #46 for "form 5472 deadline" (AI §2.5) |
| Late filing | `/late-form-5472`: **0** | `/blog/form-5472-filed-late-never-filed`: **34** | the late-filing checker (#11) and the late service page (#18). The blog ranks #21 for "late form 5472 filing service" (AI §2.5). |
| Instructions | `/form-5472-instructions`: **0** | `/blog/how-to-fill-out-form-5472`: **12** | not in top 50. The blog ranks #66 for "form 5472 help sample". |
| What is Form 5472 | `/irs-form-5472`: **0** | `/blog/what-is-form-5472`: **10** | the blog post is the ranking page for 29 of the 80 keywords Moz sees for us (AI §2.5). `/irs-form-5472` ranks for none. |
| Reasonable cause | `/form-5472-reasonable-cause-statement`: **0** | `/blog/form-5472-reasonable-cause-letter`: **3** | a third page, `/blog/form-5472-small-corporation-reasonable-cause`, ranks #16 |
| Pro forma 1120 | `/pro-forma-1120`, `/1120-pro-forma-instructions`, `/form-1120-foreign-owned-llc` and `/form-1120-disregarded-entity`: **0 to 1** each | `/blog/pro-forma-form-1120-foreign-owned-llc`: 5 | service pages rank instead (#13 and #16) |

   - The live homepage links to only 4 guide pages (`/file-form-5472`, `/form-5472-penalty`, `/diirsp`, `/pro-forma-1120`).
   - `/blog`, `/pricing` and `/about` link to none (check run today).
   - The footer links every tool and every service page but no guide page.
   - **(inference)** Google's choice of page tracks where our internal links point. Moz itself shows two different URLs for the same keyword in the campaign and in Domain Overview: "form 5472 fax filing service" is #1 via the late service page and #24 via the how-to-fax blog post. That pattern suggests Google is still rotating our pages.
4. **Bing likes the guide pages that Google ignores.** Copilot cited `/pro-forma-1120` 186 times, `/form-5472-instructions` 75 times and `/diirsp` 44 times in 30 days (geo-baseline §6a). **So do not delete or merge guide pages on the strength of the Google data alone.**
5. **Thin searches pick odd pages.** "diy form 5472" (#2) lands on the Hungary post and "form 5472 coaches and consultants" (#2) on the Argentina post. All these keywords show "NA" volume. Several intended posts, such as `/blog/form-5472-part-v-statement-example` (live since Aug 19, with 9 inbound links and 16 Bing citations), lose to a post published on Sep 30.
   - **(inference)** The likeliest cause is that the intended page is not yet indexed in Google. Search Console showed 40 pages as "discovered, not indexed" on Oct 5 (`docs/sessions/2026-10-05-seo-course-gaps.md`, part 2).
6. **The brand query.**
   - "form5472prep" is #1 via the late service page, with the late-filing checker at #2 and two blog posts at #13 and #16 (C §5).
   - "form 5472 prep" is #16 via `/about`, and "form5472 prep" is outside the top 50 (TSV).
   - **The homepage is the ranking page for none of the 246 keywords**, not even the brand.
   - The live homepage is fine on its own terms: title "File IRS Form 5472 + Pro Forma 1120 — Form5472 Prep", canonical www, "index, follow".
   - Its H1 ("Flat-rate Form 5472 filing. No hidden fees.") does not contain the brand, and the WebSite and Organization structured data have no `alternateName`.
   - All 61 linking domains point at the apex `form5472prep.com`, which until Oct 5 sent visitors on with a *temporary* 307 redirect. It is a 308 today (check run today; Moz's link index still shows 307, C §6e).
   - **(inference)** Google may have split or mis-assigned the homepage while the redirect was temporary, or may not have the www homepage indexed. Only Search Console can say which.

**Recommendations**
- **R1 (owner, 15 minutes).** In Search Console, run URL Inspection and "Request indexing" on these URLs. GSC limits requests to roughly 10 a day, so spread them over two days.
  1. `https://www.form5472prep.com/`, and also inspect `https://form5472prep.com/`
  2. `/form-5472-penalty-calculator`
  3. `/services/form-5472-fax-filing-service`
  4. `/services/form-5472-preparer`
  5. `/blog/form-5472-part-v-statement-example`
  6. `/blog/form-5472-currency-conversion-exchange-rates`
  7. `/blog/form-5472-digital-nomad-us-llc`
  8. `/blog/form-5472-coaches-consultants-course-creators`
  9. `/blog/form-5472-diy-vs-preparer`
  10. `/blog/form-5472-llc-pays-personal-expenses`
  11. `/form-5472-reasonable-cause-statement`
  12. `/form-5472-instructions`

  Also export the "Discovered, currently not indexed" and "Crawled, currently not indexed" lists from the Pages report. That export is the single most useful data point missing from this report.
- **R2 (code).** Pick **one owner page per topic** using the table in 3.1a, then add 5 to 15 contextual links to each owner from related posts and from the competing pages. Use the anchors in the table. Leave titles alone on any page that already ranks in the top 10.
- **R3 (code).** Add a footer "Guides" band, like the existing "Filing services" band, linking the 6 head-term owner guides. That gives each one sitewide links cheaply.
- **R4 (code, brand).**
  - Add `alternateName: ["Form5472Prep", "form5472prep.com"]` to the WebSite and Organization nodes in `src/lib/seo.ts`.
  - Put the brand name in the homepage H1 or a line directly above it.
  - Change the `/about` H1 from "One filing, done properly." to one that contains "Form5472 Prep".
- **R5 (owner decision, November).** For each pair where one page is a near-duplicate, decide whether to merge it with a 301 redirect, using 4 weeks of Search Console page data. The pairs:
  - `/late-form-5472`: its H1 nearly repeats the blog post's title;
  - `/irs-form-5472`;
  - `/form-5472-deadline`;
  - `/blog/pro-forma-form-1120-foreign-owned-llc`.

  A 301 merge is not a slug rename, but it does retire a URL. Only merge a page with negligible impressions, and keep any page Bing Copilot cites.

**3.1a Topic owner map (proposed)**
- Default rule: keep the page Google already prefers, unless a commercial page should own a commercial term.
- The "Anchor" column is the link text to use when other pages link to the owner.

| Topic (keywords) | Owner page | Anchor to use when linking to it | Other pages: what they should do |
|---|---|---|---|
| Form 5472 basics: "what is form 5472", "irs 5472", "5472 form" | `/blog/what-is-form-5472` (Google's choice: 29 keywords) | "what is Form 5472" | `/irs-form-5472`: becomes a merge candidate under R5 |
| Who must file and requirements ("who must file form 5472" 11-50, "form 5472 requirements" 11-50, "form 5472 filing requirements" 61/mo) | `/do-i-need-to-file-form-5472` (add capsules, C6) | "who must file Form 5472" | the checklist post links to it |
| Instructions (≈1,450 searches a month across variants, AI §5.2) | `/form-5472-instructions` | "Form 5472 instructions" | how-to-fill-out, file-form-5472, the line-1c, lines-1f and Part V posts each link to it |
| How to file (the process) | `/file-form-5472` | "how to file Form 5472" | |
| Deadline / due date | `/blog/form-5472-deadline-2026` (Google's choice, 27 links) | "Form 5472 deadline" | the guide page links to it; both link the calculator with "Form 5472 deadline calculator" |
| Late filing (informational) | `/blog/form-5472-filed-late-never-filed` | "late Form 5472" | `/late-form-5472`: merge candidate |
| Late filing service | `/services/late-form-5472-filing-service` | "late Form 5472 filing service" | |
| Penalty, abatement, relief, waiver, appeal | `/form-5472-penalty` (expand, C3) | "Form 5472 penalty relief" or "Form 5472 penalty" | penalty-notice and notice-decoder posts link to it |
| Penalty calculator | `/form-5472-penalty-calculator` | "Form 5472 penalty calculator" | |
| Reasonable-cause statement | `/form-5472-reasonable-cause-statement` | "Form 5472 reasonable cause statement" | the letter post, the small-corporation post, `/diirsp` and the late service page link to it |
| Fax number, where to file, mailing address | `/form-5472-fax-number` (expand, C4) | "where to file Form 5472" | the how-to-fax post links to it |
| How to fax | `/blog/how-to-fax-form-5472-irs` | "how to fax Form 5472" | |
| Fax filing service | `/services/form-5472-fax-filing-service` | "Form 5472 fax filing service" | |
| Pro forma 1120 | `/pro-forma-1120`; `/1120-pro-forma-instructions` for "instructions" | "pro forma 1120", "1120 pro forma instructions" | the blog pro-forma post becomes a merge candidate; `/form-1120-foreign-owned-llc` and `/form-1120-disregarded-entity` keep their exact terms |
| Cost | `/blog/form-5472-cost` | "Form 5472 filing cost" | `/pricing` and `/compare/form-5472-filing-services` link to it |
| Exchange rates | the tool `/irs-yearly-average-exchange-rates` for "irs yearly average exchange rates" (201-500); `/blog/form-5472-currency-conversion-exchange-rates` for "form 5472 exchange rates" | as named | `/blog/irs-official-exchange-rate-form-5472` links to both |
| Reportable transactions | `/blog/form-5472-reportable-transactions-examples` (31 links); the tool owns "checker" | "Form 5472 reportable transactions" | |
| Germany / UAE | blog = "Germany residents" / "UAE residents"; guide page = "German LLC owner" / "UAE resident US LLC" | as named | cross-link both ways |
| Partner program | `/partners` | "Form 5472 partner program" | the 3 partner posts link to it |

### 3.2 The 206 keywords outside Moz's top 50

**Classification.** I matched each keyword to our pages by slug and title, then reviewed the matches by hand (check run today).

| Moz label | Not in top 50 | Page exists and live | Shipped or scheduled after Oct 4 | Only a section of a broader page | No page | Likely reason |
|---|---|---|---|---|---|---|
| services | 8 | 3 | 5 (accountants, bookkeepers, CPAs, hire someone, outsource: pages live Oct 5) | 0 | 0 | Too new: service pages were written Oct 1 to 5. "foreign owned llc tax filing service" has an exact-match page and is still outside the top 50. Form5472.online ranks #9 (AI §5.4). |
| guides | 23 | 19 | 0 | 4 | 0 | The guide pages are 2 to 4.5 months old, get about 0 blog links and compete with blog posts (3.1). Head terms need authority. |
| head-terms | 40 | 2 | 0 | 34 | 4 | Most have no single owner page. No page at all: form 5472 example, software, expert, first-time abatement. |
| blog-5472 | 32 | 30 | 2 (vs FBAR, Oct 4; administratively dissolved, Oct 8) | 0 | 0 | Mostly 1 to 2 months old. Several have exact titles, e.g. "How to Correct a Mistake on a Filed Form 5472". **(inference)** Not indexed, or no authority. |
| blog-audience | 47 | 42 | 3 (app developers Oct 10, KDP Oct 11, affiliate Oct 12) | 2 | 0 | Same. The country posts for the UK (May 21), India (May 28) and Canada (Jun 19) are old enough, and Form5472.online ranks #4 to #10 for those countries (C §3). |
| blog-ein-itin | 45 | 45 | 0 | 0 | 0 | doola and Firstbase (DA 37 to 38) dominate EIN and ITIN searches (AI §5.3). |
| tools | 6 | 5 | 1 (statistics, Oct 5) | 0 | 0 | The tools have exact-match titles, "index, follow" tags and sitewide footer links (check run today), yet none ranks. **(inference)** Most likely an indexing or authority problem: run R1. |
| alternatives | 4 | 3 | 1 (/compare/form-5472-filing-services, Oct 5) | 0 | 0 | These are competitors' own brand terms (e.g. "doola form 5472", where doola is #1). Hard. |
| branded | 1 | (homepage) | | | | See 3.1, pattern 6. |
| **Total** | **206** | **149** | **12** | **40** | **4** | |

**Age of the matched pages** (approximate, from the same matching)
- About 113 are blog posts published in the 2 months before the rank check: 48 under 1 month old and 65 between 1 and 2 months.
- About 25 are the May to August guide pages.
- 14 are service pages from Oct 1 to 5.
- 6 are tools.
- **(inference)** On a DA-10 domain, posts that are 1 to 2 months old commonly need more time. The 25 older guide pages are the ones that should already rank, which is why internal links (R2, R3) and indexing (R1) come first.

**What needs a new page and what just needs time or links**
- **New page justified (4):** form 5472 example, form 5472 software, and "can a foreigner own a US LLC". The fourth is "what is a disregarded entity", which comes from the keyword gap. See section 3.6.
- **Expand an existing owner page (most of the 40 "section only" rows):**
  - penalty relief, abatement, waiver and appeal: expand `/form-5472-penalty`;
  - where to file and mailing address: expand `/form-5472-fax-number`;
  - e-file and "file online": expand `/file-form-5472`;
  - who must file, requirements, threshold and "25 percent foreign owned": expand `/do-i-need-to-file-form-5472`;
  - due date and "tax year 2025": expand the deadline owner page;
  - non-resident LLC tax return terms: expand `/foreign-owned-llc-tax`.
- **Time plus links (149):** no new content. Do R1, R2, R3 and the off-site work in 3.5.

### 3.3 Page Optimization (54 page-and-keyword pairs, scores 71 to 100)

**What fails, across all 54 pairs** (C §5b)

| Moz factor | Pairs failing |
|---|---|
| Image alt contains the exact keyword | 51 |
| Exact keyword in title | 50 |
| Keyword in meta description | 50 |
| Keyword in H1 | 40 |
| Keyword near the start of the title | 39 |
| Broad keyword in title | 37 |
| Keyword in URL | 34 |
| Exact keyword in body | 34 |
| URL length | 10 |
| Keyword stuffing | 1 |

**Why most of these suggestions should be ignored**
- **39 of the 54 pairs are wrong-page pairs.** Moz grades the page Google happened to show. Following its suggestions would push keywords onto the wrong page, for example "fax filing service" onto the late page.
- **Low-value Moz heuristics, to ignore:**
  - exact-match image alt text (the service hero images already carry their keyword, test-enforced since `faa0e9f` after the Oct 3 data);
  - keyword in URL (we never rename indexed slugs);
  - URL length;
  - exact keyword in the meta description (not a ranking factor; it can only help click rate by being bolded).
- **15 pairs are on the intended page:**
  - 12 of them already rank between #1 and #18 with scores of 73 to 100;
  - the late-filing service page scores 100 and ranks #11, which shows on-page is not its bottleneck.

**High-value fixes (keyword missing from the title or H1 of the intended page; current live state checked today)**

| Page | Keyword | Current live title / H1 | Fix | Status |
|---|---|---|---|---|
| `/` | form5472prep / form 5472 prep | Title ends "— Form5472 Prep". H1 "Flat-rate Form 5472 filing. No hidden fees." | R4: brand in or above the H1; `alternateName` | new |
| `/about` | form 5472 prep | Title "About Form5472 Prep". H1 "One filing, done properly." | H1 "About Form5472 Prep" plus a one-line description of who we are | new |
| `/blog/form-5472-new-zealand-residents-us-llc` | form 5472 new zealand residents (#15, score 73) | "Form 5472 for New Zealand Owners of a US LLC" | Retitle to "...New Zealand Residents With a US LLC", the pattern every other country post uses. Slug unchanged. | new |
| `/blog/form-5472-germany-residents-us-llc` | form 5472 germany residents (outside top 50) | "Form 5472 for German Owners of a US LLC" | Retitle to "...Germany Residents..." so it stops chasing the guide page's "German LLC owner" term (#17 today), then cross-link | new |
| `/services/form-5472-filing-service` | 1120 and 5472 filing service (#3, score 79) | phrase now in the intro and an H2 | none | shipped after data date (`1601bf0`); re-check Oct 11 |
| `/services/form-5472-filing-service` | form 5472 filing service (score 92, "stuffing": 15 uses) | 9 exact uses in the main content today | none; harmless | shipped/OK |
| `/services/form-5472-preparer` | form 5472 preparer / preparation service | Title "Form 5472 Preparer, Reviewed Before You Sign" | none; page live Oct 5 | shipped after data date |
| `/services/form-5472-for-accountants` | form 5472 for cpas | Title "Form 5472 for Accountants and CPAs: You Keep the Client". CPAs are named as the audience, not as a claim about us. | none | shipped after data date |
| Guide pages: `/form-5472-instructions`, `/1120-pro-forma-instructions`, `/form-1120-foreign-owned-llc`, `/form-5472-reasonable-cause-statement`, `/form-5472-fax-number` | their own keyword | Exact keyword already in title and H1 (check run today) | **No on-page change.** The fix is links (R2, R3) and indexing (R1). | new |

### 3.4 Site crawl

- **The 378 noindex pages are deliberate. Nothing indexable is wrongly noindexed** (C §4a, checks run today).
  - 268 thin `/blog/topics/*` hubs. Live, `/blog/topics/deadline` returns 200 with "noindex, follow".
  - 106 `/start` funnel variants. `/start` sends "noindex, nofollow".
  - `/sign-in`, `/partner/sign-in`, `/ein/apply` and `/itin/apply`. These are application or login pages; the indexable `/ein` and `/itin` pages are in the sitemap.
  - The live sitemap has 263 URLs and includes all 12 service pages, 27 guide pages, all tools, 183 posts and the 12 topic hubs that have enough posts (check run today). None of them is noindexed.
- **The thin hubs should drop out of the next crawl.** Since `1601bf0`, posts link only to topic hubs that can be indexed. Live, the Hungary post links only to `foreign-owned-llc`, `form-5472` and `ftin`. So Moz's Oct 11 crawl should report far fewer than 378 noindex pages. That is the test that the fix works.
- **The redirect chain is real but small.**
  - `http://form5472prep.com` goes to `https://form5472prep.com/` (308), then to `https://www.form5472prep.com/` (308) (check run today).
  - The first hop is Vercel's forced HTTPS. It affects only requests that start at the plain-http apex. Google follows both hops and passes link value through permanent redirects.
  - Moz labels 308 as "Temporary Redirect" (C §4b). That label is Moz's own, so ignore the warning. The real temporary 307 was fixed on Oct 5.
  - Impact Low. No action, unless Vercel offers a single-hop http-to-www rule at no cost.
- **The 47 "URL too long" warnings are deliberate.** They are long blog slugs. Never rename indexed slugs; the 75-character limit is Moz's guideline, not Google's.
- **No critical issues.** 0 4xx, 0 5xx, 0 missing titles, H1s or descriptions, and 0 duplicate content (C §4b).
- **Optional (Low).** The footer links `/partner/sign-in`, a noindexed login page, from every page. It is harmless; drop it only if the footer is being edited anyway.

### 3.5 Backlinks

**What we have** (C §6b to §6f, AI §3)
- **53 of 61 linking domains (138 of 154 links) are the same advert page**, "Boost your Google rankings with Premium PBN & Link Building".
  - It sits at `/all/1102/22.html` on domains with DA 40 to 63.
  - Its anchor text is a link-selling sentence that contains our domain name.
  - Form5472.online shows the identical 53 domains and 138 links with its own domain in the sentence (AI §3.3).
  - **(inference)** It is an automated network that stamps any domain it scrapes. It is not aimed at us, and nothing in the repo or docs suggests we bought it.
  - It appeared between Aug 11 and Sep 29. **(inference)** Most of our DA rise from 1 to 10 probably comes from these domains, so do not read DA 10 as earned authority.
- **6 automated "domain report" or "stats" pages**, all nofollow, plus 8coint.com (61% spam score).
- **2 editorial links, both from competitors.**
  - Form5472.online's "Form 5472 Filing Services Compared" post is followed. It is our only followed editorial link.
  - form5472.ai's providers directory is nofollow.
- **Every link points at the homepage.** No inner page has a linking domain (C §6e).
- **Bing sees one more domain:** snapfile.tax, with 30 links and the anchor "Premium service" (`competitor-backlinks-2026-10-05.md`). Whether snapfile.tax is related to us is an open owner question.

**Disavow: recommendation**
- **Do not disavow now.** Google's guidance is that most sites never need the disavow tool. It is meant for a site with many artificial or low-quality links that has a manual action, or expects one, typically because of links the site itself built or paid for. Google's systems ignore spam links like these by default.
- **What to monitor:**
  1. **Owner, monthly, 2 minutes:** check Search Console > Security & Manual actions > Manual actions for "No issues detected".
  2. Moz's monthly count of new linking domains. Watch for spikes from the same network.
  3. The snapfile.tax answer (owner decision, below).
- **Prepare a disavow file, but do not upload it, if:**
  - a manual action ever appears; or
  - the owner learns that anyone was paid for links.
  The 53 advert domains are listed in Appendix E, ready to use.
- **If snapfile.tax is related to us** (shared ownership or affiliation), its 30 links should carry `rel="nofollow"`. Google treats links between related sites placed to pass ranking value as a link scheme. **Owner decision.**

**Outreach plan from Link Intersect**
- **The basis.** Moz listed the domains that link to competitors but not to us (AI §4).
  - Run 1 compared us with Form5472.online, doola, Firstbase, StartGlobal and Clemta.
  - Run 2 compared us with the niche filers: Form5472.online, form5472.ai, form5472.io, form5472.tax and edetax.
- **The prioritised list of about 25 domains, with angles and offsite-kit templates, is Appendix B.**
- **The short version:**
  1. **Profiles and directories that most competitors share**, for links plus entity signals: Crunchbase (DA 91, 4 of 5 competitors), Product Hunt (for the free tools; DA 90, all 4 formation brands), Indie Hackers (61), businessformation.io (58).
  2. **Comparison and listicle pages the AI engines actually cite:** ecommerceparadise.com (DA 58, cited 3 times by AI Mode), genzone.com, entity.inc, form5472.io's "best services" posts and Form5472.online's "best Form 5472 filing services 2026" post. Ask for accurate inclusion, using `/compare/form-5472-filing-services` as the sourced reference. Never pay.
  3. **Trade press:** cpapracticeadvisor.com (DA 60, links Form5472.online; partner and white-label angle) and natlawreview.com (DA 75; offer the sourced statistics page).
- **Excluded:**
  - press-release wires (webwire, abnewswire at 75% spam, getnews, marketminute);
  - techbullion.com (**(inference)** a sponsored-post site, and paid links are excluded);
  - the roughly 110 bulk web directories both niche rivals used;
  - self-hosted or user-generated pages (pages.dev, tradingview, linktr.ee).

### 3.6 Keyword gap: content plan

**The gap.** There are 9,749 keywords where a competitor ranks in the top 50 and we don't. About 1,492 are on our topic: 448 in the core Form 5472, foreign-owned and disregarded cluster, and 834 general EIN, ITIN and SS-4 terms (AI §5.1).

**No BOI demand.** **Zero** gap rows mention BOI, beneficial ownership, the CTA or FinCEN, for any competitor (AI §5.6). Do not invest in more BOI content; keep the existing `/blog/boi-reporting-foreign-owned-us-llc-2026` accurate.

**The 18 proposals.** Each was checked against `content/blog/`, `landing-pages.ts`, `services-pages.ts` and the routes so that none duplicates an existing page. Evidence is in Appendix C.

| # | Proposal | Type | Why (key data) | Impact | Effort |
|---|---|---|---|---|---|
| 1 | **Form 5472 completed example**: a fictional, clearly labelled sample of Form 5472 and the pro forma 1120 (PDF from our generator) with an annotated walkthrough | NEW | "form 5472 example" 11-50/mo; sample and template variants where Form5472.online ranks #8 to #15 and Firstbase #4; it is also a link and AI asset | High | M |
| 2 | **Form 5472 instructions refresh** (`/form-5472-instructions`): name the tax-year-2025 instructions (filed in 2026), add a line-by-line table of contents, become the owner page | EXPAND | about 1,450/mo across instruction variants (647 + 348 + 245 + ...); Form5472.online ranks #12 to #24 and Firstbase #5 to #9; Bing cites the page 75 times | High | S |
| 3 | **Penalty relief owner page** (`/form-5472-penalty`): question headings on abatement, first-time abatement, waiver and appeal, with IRS and IRM citations and no promised outcomes. First check in the IRS's own pages whether first-time abatement applies to this penalty. | EXPAND | 8 tracked penalty keywords outside the top 50 where Form5472.online ranks #4 to #14; "form 5472 penalty abatement" 51-100/mo | High | M |
| 4 | **Can a foreigner, or a foreign company, own a US LLC?** | NEW | "can a foreign corporation own an llc" 82 (KD 17, Firstbase #13); "llc owned by foreign corporation" 47 (KD 9); "c corporation foreign ownership" 73; "foreign partners in llc" 64; "can a non-resident alien own an llc" 31; "can foreign investors own us llc" 27 (Firstbase #3) | Med-High | M |
| 5 | **Where to file Form 5472: fax number and mailing address** (`/form-5472-fax-number`; new title and H1, slug kept, address from the `seo.ts` constant) | EXPAND | where to file (Form5472.online #15), mailing address (#6), address (#12, Firstbase #4), fax number (we are #18 on the wrong page) | Med-High | S |
| 6 | **Can Form 5472 be filed online or e-filed?** A capsule on `/file-form-5472`, sourced to the IRS instructions | EXPAND | "can form 5472 be e-filed" outside top 50; "file form 5472 online" (Form5472.online #5); the same question is an AI prompt collected Oct 12 | Med | S |
| 7 | **Who must file Form 5472 / requirements** capsules on `/do-i-need-to-file-form-5472` | EXPAND | who must file 11-50; requirements 11-50; filing requirements 61 (Form5472.online #35, Firstbase #32); threshold; "25 percent foreign owned" | Med | S |
| 8 | **What is a disregarded entity? (and why a foreign-owned one still files Form 5472)** | NEW | disregarded entity 3,622; disregarded 3,319; disregarded entity llc 444; llc disregarded entity 444; define 185; "form 5472 disregarded entity" 55 (we are #87). KD 40 to 46 is a long shot on DA 10, but AI engines can quote it. | Med | M |
| 9 | **Form 5472 software: TurboTax, TaxAct, H&R Block?** Every vendor fact quoted from the vendor's own page with a check date | NEW | form 5472 software (Form5472.online #2); tax software form 5472 (#3); "does taxact support form 5472?" (we are #59 on the wrong page) | Med | M |
| 10 | **Deadline owner page**: add "tax year 2025" and "pro forma 1120 due date" questions | EXPAND | form 5472 due date 11-50 (Form5472.online #12); "form 5472 tax year 2025" (#11); 1120 deadline 183; form 1120 due date 153 | Med | S |
| 11 | **Foreign-owned multi-member LLC** (`/blog/multi-member-llc-form-5472-or-1065`): title phrase plus one question heading | EXPAND | "foreign owned multi member llc" 64/mo, KD 15, we are #70 (Form5472.online #21) | Med | S |
| 12 | **EIN for a foreign-owned LLC without an SSN** (`/blog/ein-for-foreign-owned-llc-without-ssn` and `/ein`): add "Does a foreign-owned single-member LLC need an EIN?" | EXPAND | apply for ein without ssn 102; foreign ein 53; foreign ein number 53; "does a foreign owned single member llc need an ein" 27 (KD 15, we are #24 on the wrong page) | Med | S |
| 13 | **Capital contributions and distributions** headings on `/blog/form-5472-owner-loans-contributions-reimbursements` and `/blog/pay-yourself-from-us-llc-non-resident` | EXPAND | "form 5472 reportable transaction capital contribution" 24 (Form5472.online #8, we are #74); tracked "capital contribution" and "distributions to owner" outside top 50 | Low-Med | S |
| 14 | **Non-resident LLC tax return** questions on `/foreign-owned-llc-tax` | EXPAND | 5 tracked head terms outside top 50 (non resident llc tax return, us llc tax return for non residents, llc owned by non us person tax filing...); Form5472.online ranks #16 to #19 | Med | S |
| 15 | **Form 966 when closing a foreign-owned LLC?** A short post that links the dissolved-LLC service. Verify against the Form 966 instructions first; the final-return post does not mention it today. | NEW | where to file form 966: 39; "equivalent of irs form 966 for a llc": 27 (Form5472.online #11) | Low-Med | S |
| 16 | **Can a foreign company open a US bank account?** (`/blog/us-bank-account-foreign-owned-llc`) | EXPAND | 82/mo (Firstbase #4); single member llc bank account 32 | Low-Med | S |
| 17 | **What does a Form 5472 preparer do?** (`/services/form-5472-preparer`): a question heading on "Form 5472 expert vs preparer", with no claims about us | EXPAND | form 5472 expert (Form5472.online #3 to #5) | Low | S |
| 18 | **Pro forma 1120 example**: fold into item 1 | (in item 1) | "pro forma 1120 filing service example" (Form5472.online #7, we are #73) | n/a | n/a |

**Do not chase:**
- 1120S and 1120-H due dates, and "where to file form 1120s". These are other entity types.
- "form 5472 cpe course". It is Moz's only Insights opportunity, but it is not our product and has volume 0.
- Generic SS-4 and ITIN head terms ("form ss-4" 15,403/mo, Firstbase #6). Only the foreign-owner versions fit.
- More BOI content.

### 3.7 AI visibility (GEO/AEO)

**Per engine** (AI §1.1 to §1.4; one collection on Oct 5; one mention moves a percentage by 5.3 points, so treat these as directional)
- **ChatGPT.** We are 2nd of the 4 tracked brands at 10.5%, named first in both answers that mention us.
  - It cites irs.gov 35 times and our pages 7 times: `/pricing`, `/`, and `/about`, `/terms`, `/security`, `/data-retention` and Trustpilot for "is form5472 prep legit?".
  - In the "best service" and "which companies help" answers it names Form5472.online, Form5472.ai, Hiltzik CPA and James Baker CPA.
- **Google AI Mode.** This is our best engine at 21.1%, tied with doola.
  - It has the richest citations: Form5472.online is cited 13 times, YouTube 7, irs.gov 8, entity.inc 4, and genzone, ecommerceparadise and hcvt.com 3 each.
- **Gemini.** We are last at 10.5%, against 42.1% for doola and Firstbase. Gemini returns no citations in Moz, so it answers from model knowledge.
  - On "is form5472 prep legit?" it named only Form5472.online.
  - On "how much does form5472 prep cost?" it named doola and Firstbase.
  - **(inference)** This is a brand-recognition problem. It matches BA 1 and an Organization `sameAs` that lists only Trustpilot (`seo.ts:16`).
- **Perplexity.** 5.6%. It cites our homepage and the partner-program post on the accountant-outsourcing prompt, and quotes our $149/$199 prices on the cost prompt, but it **does not name the brand** (geo-baseline §7).

**Where we're absent, and who wins** (Appendix D)
- **"Best service", "which companies help", "best preparer", "flat-fee", "alternatives to doola", "doola vs firstbase":**
  - won by Form5472.online, Form5472.ai, doola, Firstbase and CPA firms;
  - sourced from Form5472.online's "best ... 2026" posts, form5472.ai's "$299 compared" post, genzone, entity.inc, ecommerceparadise, hiltzikcpa, gettaxhub and YouTube.
- **Informational prompts** (fax, dissolving, no income, non-resident, deadline, penalty, who can file): no tracked brand is named. The sources are irs.gov plus entity.inc, hcvt.com, wise.com, mondaq, trybookmate, thetaxadviser and YouTube.

**What this implies**
1. For "best" and "alternatives" prompts, engines quote round-up articles, not provider homepages. Getting onto those pages accurately (3.5, Appendix B) is worth more than another page of our own. Our new `/compare/form-5472-filing-services`, shipped Oct 5 after the data date, gives the engines a sourced page of that kind. Re-check on Oct 12.
2. For informational prompts, irs.gov wins (48 of 149 citations). We can only be the second source. Answer-first capsules with IRS citations are the right format, and they shipped on service pages after the data date. Bing Copilot already cites our guide pages for exactly these topics: diirsp 30.8% share, "1120 pro forma" 46.7% (geo-baseline §6b).
3. For brand prompts, entity signals decide the outcome. Gemini doesn't know us.

**Already shipped, after the AI data date (re-check Oct 12)**
- llms.txt and llms-full rebuilt from code.
- Factual fixes: the DIIRSP citation and the IRS mailing address.
- Question headings and capsules of 60 words or fewer on all service pages.
- Speakable markup fixed.
- The `/compare/form-5472-filing-services` price comparison.
- Re-sourced provider pages.
- Trustpilot invites, live since Oct 5.

**Next**
- **Entity signals, owner decision.** Publish the legal entity name and create real LinkedIn, X and Crunchbase profiles, then add them to `ORG_SAME_AS`. Add the founding year, operator and location to `/about` (AEO audit §1 "Entity signals").
- **Third-party pages the engines read, owner, ongoing.** Appendix B, rows 4 to 9.
- **YouTube, owner decision.** AI Mode cited YouTube 7 times. The video kit is in offsite kit §10.
- **Reviews, owner, ongoing.** Trustpilot is cited on "is it legit" prompts. Use neutral invites only.
- **Reddit, owner decision.** Genuine answers only, with disclosure (offsite kit §8). AI Mode cited Reddit twice.
- **Code, now.** C11, the brand string near prices and on `/about`, so that Perplexity-style answers attach our prices to our name **(inference)**.

### 3.8 Measurement gaps

| Gap | What's true | Fix | Needs owner? |
|---|---|---|---|
| Google Analytics not connected in Moz (C §0) | The site has **no GA4 property**. Only the Google Ads tag `AW-18127544007`, Vercel Analytics, Vercel Speed Insights and our own `/admin/traffic` log are installed (check run today: `src/app/layout.tsx`). | Recommend **not** adding GA4 just for Moz. Search Console is the authoritative organic source, and Moz's traffic panels add little. If wanted: create a GA4 property, add the tag behind the existing consent handling, then grant Moz access through OAuth. | Yes (decision + OAuth) |
| No Core Web Vitals in Moz (0 analysed) | Vercel Speed Insights already collects real-user speed data | Read Speed Insights for the top 10 pages. Optionally use Moz's 20 free on-demand analyses (until Nov 1). Tracked URLs are shared: 52 of 200 used across campaigns. | No (us) |
| Insights card says 10.29% and 7 keywords in the top 10; Rankings says 1.85% and 24 | The card matches the **original 46-keyword set** exactly. The 2026-10-06 session log recorded "search visibility 10.29%, 7/46 keywords in the top 10" before the campaign grew to 246. | Ignore the card. Use the Rankings page (1.85% / 24 of 246). | No |
| Only Google desktop, USA, is tracked (no Bing, no mobile) | Bing feeds Copilot, which cites us 1.3K times a month. Keyword slots are shared: the brief says about 1,269 of 1,500 are used, and the Taxley campaign shares the cap (`2026-10-05-seo-course-gaps.md`, part 4). | Add Bing (or Google mobile) for a **core subset of about 40 keywords** only, after agreeing slots with the Taxley session | Coordination |
| 22 of 40 AI prompts have no data | First collection Oct 12 (AI §1.0) | Read it on Oct 12 and compare with Appendix D | No |
| Moz has volume for only 44 of 246 keywords | 202 show "NA" (C §1d) | Use Search Console impressions as the demand measure. Export queries and pages every month. | Owner (GSC export) |
| No rank history | First collection on Oct 4 | Judge changes only after 3 or 4 weekly collections (late October) | No |
| Indexing status unknown | GSC on Oct 5: 193 indexed, 40 discovered but not indexed | R1 export | Yes |
| Page Optimization "Track & Monitor" is empty | Not needed | Optional: track the 6 head-term owner pages (uses shared tracked-URL slots) | No |

---

## 4. Action plan

Effort: S = under half a day; M = 1 to 3 days; L = more.
Status "shipped-after-data" means it is already in code but Moz hasn't seen it yet.

**4a. We can do in code now**

| # | Action | Evidence | Impact | Effort | Who | Status |
|---|---|---|---|---|---|---|
| C1 | Topic owner internal-link pass using the map in 3.1a: exact or partial anchors from related posts and competing pages; no title changes on top-10 pages | 25 of 40 ranked keywords land on the wrong page; guide pages get 0 blog links vs 27 to 34 for blog twins | High | M | code | new |
| C2 | Footer "Guides" band linking the 6 head-term owners (instructions, penalty, reasonable cause, where to file, pro forma 1120, what-is) | Footer links tools and services but no guides; homepage links only 4 guides | Med-High | S | code | new |
| C3 | Expand `/form-5472-penalty` into the penalty-relief owner (content item 3) and link it from every penalty post | 8 penalty keywords outside top 50, Form5472.online #4 to #14 | High | M | code | new |
| C4 | `/form-5472-fax-number` becomes "Where to file Form 5472: fax number and mailing address" (title and H1 only; slug kept) | 4 tracked "where/address" keywords; Form5472.online #6 to #15 | Med-High | S | code | new |
| C5 | E-file capsule on `/file-form-5472`; "who must file" capsules on `/do-i-need-to-file-form-5472` | Content items 6 and 7 | Med | S | code | new |
| C6 | New page: Form 5472 completed example (sample PDF from the generator, clearly fictional) | "form 5472 example" 11-50; Firstbase #4 on samples | High | M | code | new |
| C7 | `/form-5472-instructions` refresh (tax-year-2025 wording, table of contents) | about 1,450/mo cluster; Bing 75 citations | High | S | code | new |
| C8 | New pages: "Can a foreigner own a US LLC?" and "What is a disregarded entity?" | Content items 4 and 8 | Med-High | M | code | new |
| C9 | New page: Form 5472 software (vendor-sourced, with check dates) | Content item 9 | Med | M | code | new |
| C10 | Smaller expansions: deadline, multi-member, EIN, capital contributions, non-resident tax return, bank account, Form 966 | Content items 10 to 17 | Med/Low | S each | code | new |
| C11 | Brand signals: `alternateName` on WebSite and Organization; brand in or above the home H1; `/about` H1 | Brand query lands on the late page; "form 5472 prep" #16 via /about; Gemini misses the brand | Med | S | code | new |
| C12 | Retitle the NZ and Germany posts to the "Residents" pattern; cross-link the Germany and UAE blog and guide pairs | 3.3 | Low | S | code | new |
| C13 | Wrong-page fixes for money terms (fax, preparer, preparation, dissolved, 1120 and 5472) | C §3 / TSV | High | n/a | code | **shipped-after-data (`1601bf0`, `44020dc`): verify Oct 11** |
| C14 | Topic chips link only to indexable hubs (noindex count should fall) | C §4a | Low | n/a | code | **shipped-after-data (`1601bf0`): verify Oct 11 crawl** |
| C15 | Price comparison page, capsules, llms.txt, factual fixes | AI §1 | Med | n/a | code | **shipped-after-data (`2e2eba9`..`d68a886`): verify Oct 12** |

**4b. Off-site / owner**

| # | Action | Evidence | Impact | Effort | Who | Status |
|---|---|---|---|---|---|---|
| O1 | Search Console: inspect and request indexing for the 12 URLs in R1; export the "not indexed" lists | 149 of 206 non-ranking keywords already have a page; tools with exact titles don't rank; homepage absent for the brand | High | S | us (Search Console in Chrome, about 10 requests a day) | new |
| O2 | Curated directories and profiles from the 10-01 kit, one a day: Crunchbase, F6S, Indie Hackers, G2, Capterra, SourceForge, SaaSHub, GoodFirms, businessformation.io; launch the free tools on Product Hunt | Crunchbase, Product Hunt and Indie Hackers are shared by 3 to 4 competitors (AI §4.1); 0 genuine links today | High | M (ongoing) | owner | new |
| O3 | Ask for accurate inclusion on the AI-cited comparison pages (ecommerceparadise, genzone, form5472.io posts, Form5472.online's "best 2026" post, nonresidentfounder.com) using offsite kit §11.4 and `/compare/form-5472-filing-services` | These are the pages engines cite on "best" and "alternatives" prompts (AI §1.4) | High | M | owner | new |
| O4 | Trade press: cpapracticeadvisor.com (partner and white-label news), natlawreview.com (statistics data) | Both link to Form5472.online (AI §4.2) | Med | M | owner | new |
| O5 | Expert-quote platforms (Featured, Qwoted, Source of Sources), 1 or 2 answers a day, using only the approved trust line | Offsite kit §3; route to forbes, entrepreneur and similar sites (AI §4.1) | Med | ongoing | owner | new |
| O6 | **Decision:** legal entity name and real LinkedIn, X and Crunchbase profiles for `sameAs`; About-page facts | Gemini 10.5% vs 42%; BA 1 | High (AI) | S once decided | owner decision | open since 10-06 |
| O7 | **Decision:** YouTube how-to videos (offsite kit §10) | AI Mode cited YouTube 7 times | Med | M | owner decision | open |
| O8 | Keep the neutral Trustpilot invites running | Trustpilot cited on the "legit" prompt | Med | S | owner | live since 10-05 |
| O9 | **Decision:** Reddit and forum answers (offsite kit §8; disclosure; no links) | Reddit cited twice | Low-Med | ongoing | owner decision | open |
| O10 | Disavow: **no action**; check Manual actions monthly | Google's guidance; the spam network also hits Form5472.online | Low | S | owner | new |
| O11 | **Decision:** is snapfile.tax related to us? If yes, nofollow its 30 links | Bing backlinks report | Med (risk) | S | owner decision | open |
| O12 | **Decision:** money-back guarantee vs Terms §6; the home-FAQ promise that "we handle the IRS response at no charge" | Blocks clean AEO copy (AEO audit P0-5, P0-6) | Med | S | owner decision | open |
| O13 | **Decision (November):** 301-merge the near-duplicate pairs (R5) using 4 weeks of Search Console page data | 3.1 | Med | S | owner decision | new |

**4c. Measurement**

| # | Action | Evidence | Impact | Effort | Who | Status |
|---|---|---|---|---|---|---|
| M1 | Read Moz on Oct 11 (ranks, crawl) and Oct 12 (AI) against section 5 | First collections | High | S | us | new |
| M2 | Skip GA4 for now. If wanted, it needs a new property, a consent check and Moz OAuth. | No GA4 on site | Low | S | owner decision | new |
| M3 | Speed Insights review of the top 10 pages; optional Moz on-demand speed analysis | 0 speed data in Moz | Low | S | us | new |
| M4 | Bing or mobile tracking for about 40 core keywords after slot coordination with Taxley | Single engine tracked | Med | S | coordination | new |
| M5 | Monthly Search Console export (queries and pages) as the demand source; monthly AI routine and Bing AI Performance (already in the kit) | 202 of 246 keywords without Moz volume | Med | S | owner + us | new |

---

## 5. What to re-check after Moz's Oct 11 to 12 collection, and how we'll know it worked

**Rankings (Oct 11; baseline here = Oct 4)**
- **Money terms move to the right page:**
  - "form 5472 fax filing service" → `/services/form-5472-fax-filing-service`;
  - "form 5472 preparer" and "form 5472 preparation service" → `/services/form-5472-preparer`;
  - "final form 5472 for dissolved llc" → `/services/final-form-5472-for-dissolved-llc`;
  - "1120 and 5472 filing service" stays in the top 3.
  - If a money term keeps ranking #1 on a different service page for 3 collections, accept it. It is still a money page.
- **The pages that shipped Oct 4 to 5 enter the top 50:**
  - `/compare/form-5472-filing-services` ("compare form 5472 filing services", where Form5472.online is #3);
  - the accountants, bookkeepers and hire-someone pages;
  - `/form-5472-statistics`.
- **Totals:** at least 24 keywords in the top 10 and visibility of at least 1.85%. A drop of 1 or 2 keywords in a single week is noise.
- **After C1 to C3 ship:** the owner pages in 3.1a should replace the stray pages as the ranking URL within 2 to 4 collections.

**Crawl (Oct 11)**
- Meta noindex should fall well below 378, because the thin topic hubs are no longer linked.
- Moz will keep flagging the 308s as "temporary". Ignore that.
- Still 0 critical issues.

**AI Visibility (Oct 12)**
- 22 more prompts get data. Watch these, which match pages shipped Oct 5:
  - "form 5472 penalty calculator";
  - "form 5472 filing service with a fax confirmation receipt";
  - "form 5472 filing service for a dormant llc";
  - "form 5472 preparer for a foreign-owned llc";
  - "white label form 5472 filing for accounting firms";
  - "form 5472 statistics and penalty figures";
  - "who can i hire to file form 5472 for my llc";
  - "can form 5472 be filed electronically or only by fax or mail".
- **Success** = mentions on *category* prompts, not just brand prompts (baseline: 9 of 76 slots, all brand or price), plus citations of `/compare/form-5472-filing-services` or `/form-5472-statistics`.
- Gemini will only move after entity work (O6) and third-party mentions (O3). Don't expect it on Oct 12.

**Links (monthly)**
- The first non-spam, non-competitor linking domain appears (O2 to O4).
- The count of spam advert domains is stable.
- Manual actions show "No issues detected".

**Search Console (owner, after R1)**
- The 12 URLs show "URL is on Google".
- The "discovered, not indexed" count falls from 40.

---

## 6. Appendices

### Appendix A: Wrong-page table (40 ranked keywords, Oct 4)

- **Verdict:** OK = intended page; ALT = acceptable alternate; SHIPPED = fixed after the data date (verify Oct 11); FIX = open.
- Volume "NA" means Moz has no volume figure.

| # | Keyword (vol) | Rank | Ranking URL | Intended owner | Verdict | Fix (anchor) |
|---|---|---|---|---|---|---|
| 1 | form 5472 etsy sellers | 1 | /blog/form-5472-etsy-print-on-demand-sellers | same | OK | |
| 2 | form 5472 fax filing service | 1 | /services/late-form-5472-filing-service (also #7 dormant) | /services/form-5472-fax-filing-service | SHIPPED | late page now links to the fax page; add a link from /blog/how-to-fax-form-5472-irs and /form-5472-fax-number ("Form 5472 fax filing service") |
| 3 | form 5472 penalty calculator | 1 | late service (also #4 dissolved, #6 /faq) | /form-5472-penalty-calculator | FIX | R1 inspect; link from /form-5472-penalty and the penalty posts ("Form 5472 penalty calculator"); don't add the phrase to the late page |
| 4 | form 5472 preparation service (11-50) | 1 | late service | /services/form-5472-preparer | SHIPPED | `1601bf0` |
| 5 | form 5472 preparer | 1 | /services/pro-forma-1120-filing-service | /services/form-5472-preparer | SHIPPED | page live Oct 5 |
| 6 | form 5472 stripe paypal wise | 1 | /blog/stripe-paypal-wise-form-5472 | same | OK | |
| 7 | form5472prep | 1 | late service (also #2 late-filing checker) | / | FIX | R1 (homepage), R4/C11 |
| 8 | pro forma 1120 filing service | 1 | /services (also #8 fax service) | /services/pro-forma-1120-filing-service | ALT | the hub is a money page; the guide pages already link via service cards |
| 9 | diy form 5472 | 2 | /blog/form-5472-hungary-residents-us-llc | /blog/form-5472-diy-vs-preparer | FIX | link the Hungary post's "DIY package" phrase ("DIY Form 5472"); R1 |
| 10 | form 5472 coaches and consultants | 2 | /blog/form-5472-argentina-residents-us-llc | /blog/form-5472-coaches-consultants-course-creators | FIX | R1; links from the freelancers, SaaS and YouTube creator posts |
| 11 | form 5472 exchange rates | 2 | /blog/form-5472-small-corporation-reasonable-cause (also #11 foreign-owned service) | /blog/form-5472-currency-conversion-exchange-rates | FIX | R1 (the owner already has 18 inbound links) |
| 12 | form 5472 part v statement | 2 | small-corporation post (also #8 dissolved, #13 Hungary, #18 foreign-owned service) | /blog/form-5472-part-v-statement-example | FIX | R1; link from the small-corporation post ("Form 5472 Part V statement") |
| 13 | 1120 and 5472 filing service | 3 | /services/form-5472-filing-service | same | OK | reinforced in `1601bf0` |
| 14 | form 5472 filing cost | 3 | /services/foreign-owned-llc-tax-filing-service | /blog/form-5472-cost | ALT | links from /pricing and /compare/form-5472-filing-services ("Form 5472 filing cost") |
| 15 | form 5472 digital nomads | 4 | /blog/dubai-digital-nomad-... (also #15 Argentina) | /blog/form-5472-digital-nomad-us-llc | FIX | R1 (the owner has 34 links but doesn't rank) |
| 16 | form 5472 ein pending | 4 | /blog/form-5472-ein-pending-deadline | same | OK | |
| 17 | form 5472 filing service (0-10) | 4 | /services/form-5472-filing-service | same | OK | |
| 18 | final form 5472 for dissolved llc | 6 | /faq (also #13 pro-forma service) | /services/final-form-5472-for-dissolved-llc | SHIPPED | FAQ and final-return post links (`1601bf0`) |
| 19 | form 5472 thailand residents | 7 | thailand post | same | OK | |
| 20 | never filed form 5472 | 7 | /form-5472-late-filing-checker | /blog/form-5472-filed-late-never-filed | ALT | the tool fits the intent |
| 21 | form 5472 1099-k | 8 | 1099-k post | same | OK | |
| 22 | form 5472 formation costs | 9 | formation-costs post | same | OK | |
| 23 | form 5472 noncash property | 10 | noncash post | same | OK | |
| 24 | llc paying personal expenses form 5472 | 10 | /blog/chiang-mai-digital-nomad-... | /blog/form-5472-llc-pays-personal-expenses (0 inbound blog links) | FIX | links from the Chiang Mai, family-members and pay-yourself posts ("LLC paying personal expenses") |
| 25 | form 5472 brazil residents | 11 | brazil post | same | OK | |
| 26 | form 5472 japan residents | 11 | japan post | same | OK | |
| 27 | late form 5472 | 11 | late-filing checker (also #18 late service) | /blog/form-5472-filed-late-never-filed (topic owner) | FIX | C1; /late-form-5472 becomes a merge candidate (R5) |
| 28 | late form 5472 filing service | 11 | late service | same | OK | score 100: authority, not on-page |
| 29 | 1120 pro forma instructions | 13 | pro-forma service | /1120-pro-forma-instructions | FIX | links from /pro-forma-1120, the blog pro-forma post and how-to-fill-out ("1120 pro forma instructions") |
| 30 | form 5472 partner program | 13 | /blog/form-5472-partner-program-registered-agents | /partners | FIX | the 3 partner posts link to /partners ("Form 5472 partner program") |
| 31 | form 5472 new zealand residents | 15 | NZ post | same | OK | C12 retitle |
| 32 | form 5472 no us bank account | 15 | no-bank post | same | OK | |
| 33 | form 5472 owner loans | 15 | /blog/form-5472-outstanding-owner-loan-no-transfers | /blog/form-5472-owner-loans-contributions-reimbursements | FIX | link ("Form 5472 owner loans") |
| 34 | form 1120 foreign owned llc | 16 | foreign-owned service | /form-1120-foreign-owned-llc (0 blog links) | FIX | C1 links |
| 35 | form 5472 prep | 16 | /about | / | FIX | R4/C11 |
| 36 | form 5472 reasonable cause statement (11-50) | 16 | small-corporation post | /form-5472-reasonable-cause-statement (0 blog links) | FIX | links from /diirsp, the late service page, the filed-late post, the letter post and the small-corporation post ("Form 5472 reasonable cause statement") |
| 37 | how to fax form 5472 | 16 | fax service | /blog/how-to-fax-form-5472-irs (2 links) | FIX | C1 links |
| 38 | form 5472 german llc owner | 17 | Germany blog | /form-5472-germany | FIX | C12 retitle the blog to "Residents"; cross-link |
| 39 | form 5472 fax number (0-10) | 18 | fax service | /form-5472-fax-number | FIX | C4 plus links |
| 40 | form 5472 foreign owner rental property llc | 18 | real-estate post | same | OK | |

**Tally:** 15 OK, 3 ALT, 4 SHIPPED, 18 FIX.

**Extra Discover pairs (C §5) where service pages rank for each other's keywords:**
- penalty calculator → dissolved page;
- fax filing service → dormant page;
- Part V → dissolved and foreign-owned pages;
- exchange rates → foreign-owned page.
**(inference)** This is caused by boilerplate the service pages share. C1's exact-anchor links to the owners are the remedy. Don't strip the shared sections.

### Appendix B: Outreach list (from Link Intersect, plus the AI-cited pages)

- Kit references: "LB" = `link-building-2026-10-01.md` row; "OK §" = `offsite-kit-2026-10-04.md` section.
- Every pitch uses the approved line verbatim: "Every filing is reviewed by a qualified accountant before it is submitted."
- No claims to be a CPA, licensed or IRS-approved, no guarantees, no payment for placement.

| # | Domain | DA | Type | Links to (competitors) | Why | Suggested angle | Template |
|---|---|---|---|---|---|---|---|
| 1 | crunchbase.com | 91 | company directory | doola, Firstbase, StartGlobal, Clemta | shared by 4 of 5 competitors; also an entity source for AI | company profile (needs the legal-entity decision, O6) | LB #2; OK §5 |
| 2 | producthunt.com | 90 | launch platform | all 4 formation brands | brand and AI value; launches tools, not services | launch the penalty and deadline calculators | LB #7; OK §6 |
| 3 | indiehackers.com | 61 | product page and forum | doola, Firstbase, StartGlobal | founder audience | product page plus genuine posts | LB #3; OK §8 rules |
| 4 | ecommerceparadise.com | 58 | e-commerce reviews blog | edetax | **cited 3 times by AI Mode** on our prompts | offer /compare price table and calculators; ask for inclusion in their Form 5472 / filing reviews | OK §11.4 |
| 5 | genzone.com | n/a (not in Link Intersect) | listicle ("best doola alternatives for non-US founders") | n/a | cited twice by AI Mode | factual inclusion request | OK §11.4 |
| 6 | entity.inc | n/a | provider blog listicles (competitor-run) | n/a | cited 4 times by AI Mode | inclusion in "best US LLC formation services for non-residents"; low odds | OK §11.4 |
| 7 | form5472.io | n/a (Moz has no link data) | competitor-run listicles | n/a | cited twice by Perplexity ("best form 5472 filing services") | accurate-listing request | OK §11.4 |
| 8 | form5472.online (post "best form 5472 filing services 2026") | 17 | competitor comparison post | n/a | cited by ChatGPT and AI Mode; their other post already links to us (followed) | ask for accurate inclusion with sourced prices | OK §11.4 |
| 9 | form5472.ai/providers | 13 | competitor directory | n/a | already lists us (nofollow) | check our entry is accurate | none needed |
| 10 | nonresidentfounder.com | n/a | niche vendor comparison | n/a | exact audience | ask about a compliance or tax category | LB #44; OK §11.4 |
| 11 | businessformation.io | 58 | formation-provider directory | all 4 formation brands | niche directory | listing in a tax-filing category | OK §5 blurbs |
| 12 | cpapracticeadvisor.com | 60 | accounting trade publication | Form5472.online | accountant audience; partner program | news pitch: embeddable calculators and the white-label program for firms | OK §7 + LB partner blurb; OK §3 |
| 13 | natlawreview.com | 75 | legal news | Form5472.online | authority | offer the sourced `/form-5472-statistics` figures as a data note; verify their contributor rules (they may require law-firm authors) | OK §3 / §7 |
| 14 | reviewfoxy.com | 42 | review site | Form5472.online + 5 formation brands | listing | free listing if one exists | OK §5 |
| 15 | offshorecorptalk.com | 45 | offshore-company forum | Form5472.online | community | genuine answers, no link drops | OK §8 rules |
| 16 | reddit.com | 92 | forum | Firstbase, Clemta | cited twice by AI Mode | genuine answers with disclosure (owner decision O9) | OK §8 |
| 17 | youtube.com | n/a | video | n/a | cited 7 times by AI Mode | 5 keyword-first videos (owner decision O7) | OK §10 |
| 18 | forbes.com, entrepreneur.com, fastcompany.com, businessinsider.com, techcrunch.com | 92-94 | news | doola, Firstbase | earned media | only through expert-quote platforms | OK §3; LB #10-13 |
| 19 | medium.com | 95 | blog platform | 4 competitors | crawled by AI; low link value | optional explainer posts that link to the tools | none (low) |
| 20 | stripe.com | 92 | partner directory | doola | relevant to Stripe Atlas users | check partner-directory eligibility first | none (low) |
| 21 | theorg.com | 58 | org-chart directory | doola, Firstbase, StartGlobal | entity | needs real named people (O6) | none (low) |
| 22 | G2 / Capterra / SourceForge / F6S / SaaSHub / GoodFirms | 41-93 | software and service directories | (10-01 kit, not in the top Link Intersect rows) | curated directories | 1 a day | LB #1, 4-6, 9, 15 |
| — | **Excluded:** techbullion.com (73; **(inference)** sponsored posts); webwire (67), abnewswire (57, spam 75%), getnews (39), marketminute (51) press wires; about 110 bulk web directories (DA 15-36); pages.dev, tradingview, linktr.ee, bit.ly (self-made or user-generated); hiltzikcpa, gettaxhub, edetax, doola, Firstbase (competitors' own sites) | | | | paid, spammy or not editorial | — | — |

### Appendix C: Content-gap evidence

Volumes are Moz monthly; KD is Moz difficulty; competitor ranks are Moz top-50 positions (AI §5.2 to §5.6; C §3; TSV).

| Cluster | Keywords (vol, KD, best competitor rank) | Our page today | Proposal |
|---|---|---|---|
| Example / sample | form 5472 example (11-50, tracked, outside top 50); form 5472 help sample (we #66; Firstbase #4); form 5472 preparation example (we #32); form 5472 foreign owned llc sample (Form5472.online #12); single member llc foreign owned sample/pdf (#13 to #15); pro forma 1120 filing service example (#7, we #73) | only `/blog/form-5472-part-v-statement-example` (Part V only) | #1 NEW |
| Instructions | form 5472 instructions 647 (40; Firstbase 8); 5472 instructions 348 (39; Firstbase 6); form 5472 instructions 2025 245 (41; Firstbase 9); irs form 5472 instructions 55; instructions 5472 47; 5472 instructions 2017 47 / 2018 39; 5472 form instructions 27; form 5472 instruction 27; instruction form 5472 24 | `/form-5472-instructions` (0 blog links) | #2 EXPAND + C1 |
| Penalty relief | form 5472 penalty abatement (51-100, Form5472.online #5); 5472 penalty abatement (we #64, Form5472.online #4); penalty relief (Form5472.online #8, we #75); penalty relief form 5472 (#6, we #78); waiver (#4); first time abatement (#5); appeal; penalty for late filing (#14); 25000 penalty (#11); penalty abatement service (#3) | `/form-5472-penalty` (0 blog links), calculator, notice posts | #3 EXPAND |
| Foreign ownership | can a foreign corporation own an llc 82 (17; Firstbase 13); c corporation foreign ownership 73 (19); foreign partners in llc 64 (32); can a foreigner be a partner in an llc 47; llc owned by foreign corporation 47 (KD 9); can a non-resident alien own an llc 31 (26); foreign owned llc 31 (20; Firstbase 7); can foreign investors own us llc 27 (Firstbase 3); can an llc corp have foreign shareholders 27 (Firstbase 3) | partial: foreign-corporate-owner post, `/single-member-llc-foreign-owner` | #4 NEW |
| Where to file | where to file form 5472 (0-10; Form5472.online #15); form 5472 mailing address (0-10; #6); form 5472 address (#12, Firstbase #4); form 5472 fax number (we #18 on the wrong page) | `/form-5472-fax-number` | #5 EXPAND |
| E-file | can form 5472 be e-filed; file form 5472 online (0-10; Form5472.online #5) | none dedicated | #6 EXPAND |
| Who must file | who must file form 5472 (11-50); form 5472 requirements (11-50); form 5472 filing requirements 61 (39; Firstbase 32); threshold; 25 percent foreign owned; reporting corporation | checker tool, checklist post | #7 EXPAND |
| Disregarded entity | disregarded entity 3,622 (40; Firstbase 41); disregarded 3,319 (43; Firstbase 8); disregarded entity llc 444; llc disregarded entity 444; define disregarded entity 185; disregarded entity s corp 153; disregarded entity name 133; disregarded llc 112; form 5472 disregarded entity 55 (we #87); foreign owned disregarded entity (11-50, tracked); 6038a irs foreign owned disregarded entity 27 | `/form-1120-disregarded-entity` (filing angle only) | #8 NEW |
| Software | form 5472 software (Form5472.online #2); tax software form 5472 (#3); does taxact support form 5472? (we #59) | none | #9 NEW |
| Deadline | form 5472 due date (11-50; #12); form 5472 tax year 2025 (#11); 1120 deadline 183; form 1120 due date 153; pro forma 1120 deadline | deadline blog (27 links), guide page, calculator | #10 EXPAND |
| Multi-member | foreign owned multi member llc 64 (KD 15; we #70; Form5472.online #21) | multi-member post | #11 EXPAND |
| EIN without SSN | apply for ein without ssn 102 (56; doola 22); applying for ein without ssn 33; 4 "get an ein without ssn" variants about 25 each; foreign ein 53; foreign ein number 53; ein for foreign entity 30; can a foreign company apply for an ein 27; ss4 for international 27 (Firstbase 4); does a foreign owned single member llc need an ein 27 (KD 15; we #24) | EIN post, `/ein` | #12 EXPAND |
| Contributions | form 5472 reportable transaction capital contribution 24 (Form5472.online #8; we #74); tracked: capital contribution, distributions to owner | owner-loans post, pay-yourself post | #13 EXPAND |
| Non-resident tax return | non resident llc tax return; us llc tax return for non residents (Form5472.online #19); llc owned by non us person tax filing (#16); non resident llc annual tax filing; foreign owned single member llc tax | `/foreign-owned-llc-tax` | #14 EXPAND |
| Form 966 | where to file form 966 39 (42; #14); equivalent of irs form 966 for a llc 27 (#11) | not mentioned | #15 NEW |
| Bank account | can a foreign company open a us bank account 82 (Firstbase 4); single member llc bank account 32 | bank-account post | #16 EXPAND |
| BOI / CTA / FinCEN | **0 gap rows** | `/blog/boi-reporting-foreign-owned-us-llc-2026` | no new content |

### Appendix D: AI prompt table (Oct 5; 18 prompts with data)

- Cells list brands in order of first mention. US = us, F = Form5472.online, D = doola, FB = Firstbase.
- "-" means none of the 4 tracked brands was named.
- Source: AI §1.3.

| # | Prompt | ChatGPT | AI Mode | Gemini | Perplexity |
|---|---|---|---|---|---|
| 1 | is form5472 prep legit? | **US** | **US** | F only | **US** |
| 2 | is there a flat-fee form 5472 filing service? | **US** | F | D > FB > F | - |
| 3 | alternatives to doola for form 5472 filing | - (stub) | D > F | D > F > FB | D > FB |
| 4 | best form 5472 preparer for non-resident llc owners | F | D > FB | F > FB > D | F |
| 5 | can form 5472 be faxed to the irs | - | - | - | - |
| 6 | final form 5472 when I dissolve my llc? | - | - | - | - |
| 7 | file form 5472 if my llc had no income? | - | - | - | - |
| 8 | doola vs firstbase for form 5472 filing | - (stub) | D > FB | D > FB > F | D > FB |
| 9 | how can accountants outsource form 5472 preparation? | - | - | - | - (cites our homepage and partner post) |
| 10 | how do i file form 5472 if not a us resident? | - | - | - | - |
| 11 | how much does form5472 prep cost? | - (stub) | **US** | D > FB | - (cites our homepage) |
| 12 | how much does it cost to hire someone to file form 5472? | - (cites our /pricing) | **US** | **US** > FB > D | no response |
| 13 | best service to file form 5472 for a foreign-owned llc? | F | F | FB > D | - |
| 14 | cheapest way to file form 5472 and pro forma 1120 online? | - | **US** | **US** | - |
| 15 | form 5472 deadline for a foreign-owned single-member llc? | - | - | - | - |
| 16 | form 5472 penalty and how to avoid it? | - | - | - | - |
| 17 | which companies help foreign founders with us llc tax compliance? | F > D | D > FB | D > FB | - |
| 18 | who can file form 5472 and the pro forma 1120 for my llc? | - | - | - | - |

**Pending first data on Oct 12 (22 prompts):**
- stripe atlas company
- e-file vs fax
- bookkeeper
- accountants for clients
- only put money in
- Delaware non-resident
- Wyoming non-resident
- dormant LLC service
- fax confirmation receipt
- penalty calculator
- preparer for a foreign-owned LLC
- statistics and penalty figures
- late for past years plus penalty
- reasonable cause statement
- EIN without an SSN
- how many companies file
- reportable transaction
- never filed
- what is a pro forma 1120
- DIIRSP
- white label for accounting firms
- who can I hire

The full wording is in AI §1.0.

### Appendix E: Spam advert domains (for a disavow file, only if ever needed; do not upload now)

These are the 53 "Premium PBN" advert domains from AI §3.4, plus 8coint.com (spam score 61%):

cvillico.com, cmocheatsheets.com, mymarketpost.com, mylisthero.com, wioutlet.com, sahammurah.com, phanerosart.com, texturometer.com, raiseold.com, juaralaundry.com, reisenweg.com, thedocmag.com, blogerreviewers.com, expresskitchendesigns.com, bestofthefirstcoast.com, smartstimer.com, theforbestimes.com, archive-hu.com, ufabettererm4.com, canadapsilocybin.com, fastlifesite.com, primenewsartical.com, betwinnermirror.com, techbumppy.com, adcreativevideo.com, themicrodigits.com, plrdownloadshub.com, southfwb.com, gladeflowers.com, kkinsider.com, marinasone.com, fletcherrld.com, casinooftheking.com, dupurgeniefr.com, digitalchatni.com, betulcrime.com, masihnyata.com, exotichealths.com, rjcentinc.com, mediaboooster.com, coruzants.com, bestnz-poker-casinoslot.com, firstguestpost.com, forbesstories.com, hotonlinegaming.com, fashionclothingnews.com, homesforsaleoldgreenwichct.com, onvaxs.com, aloysionunes.com, quotesblom.com, uncledspizza.com, cgpa2percentag.com, royaldb.us.com; plus 8coint.com.

In the disavow file, each would be written as `domain:example.com`.

---

**Prior docs used:**
- `docs/seo/geo-baseline-2026-10-05.md`
- `docs/seo/aeo-audit-2026-10-05.md`
- `docs/seo/competitor-backlinks-2026-10-05.md`
- `docs/seo/link-building-2026-10-01.md`
- `docs/seo/offsite-kit-2026-10-04.md`
- `docs/seo/audience-keywords-2026-10-05.md` (headings only)
- `docs/sessions/2026-10-06-geo-aeo-pass.md`
- `docs/sessions/2026-10-06-moz-campaign-fixes.md`
- `docs/sessions/2026-10-05-seo-course-gaps.md`

**Checks run today (2026-10-07):**
- live head tags and links on about 30 URLs;
- the live sitemap (263 URLs);
- the redirect chain;
- noindex on topic and start pages;
- counts of markdown links in `content/blog`;
- `src/app/layout.tsx` (no GA4);
- `src/lib/pricing.ts` ($149 standard / $199 express / $99 per additional past year).
