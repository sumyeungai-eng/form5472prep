# form5472prep.com — Decision-Grade SEO/AEO/GEO Audit — 2026-09-05

Synthesis of five 2026-09-05 audit inputs [1–5] plus the 2026-09-05 tool-pages
re-check [5] and content-gap analysis [6], with deltas against the
2026-08-16 baseline [baseline]. Sources:
[1] `draft-report-part1.md` (live crawl, 139 sitemap URLs — **caveat: crawled
while a sibling branch had wrongly overwritten production; 105 "posts" incl.
non-main pages, and the 3 tool pages + 6 provider pages 404'd at crawl time**;
treat per-page counts as approximate and defer to [5] for tool pages),
[2] `draft-report-part2.md` (Lighthouse mobile, same substituted-URL caveat),
[3] `2026-09-05-search-landscape.md` (GSC, SERP probes, AI Overview,
Perplexity, competitors), [4] `2026-09-05-indexation-check.md` (root-cause
indexation diagnosis), [5] `2026-09-05-tool-pages-audit.md` (post-restore
tool-page check), [6] `2026-09-05-content-inventory-gaps.md`
(cannibalization/gaps on `main`). Production is now confirmed correct: 134
URLs = 95 posts (91 live, 4 scheduled) + 28 landing pages + 3 tools + fixed
pages [6].

---

## Executive Summary

form5472prep.com's biggest strength is a technical and GEO foundation well
ahead of its traffic: 0 broken internal links, perfect Lighthouse SEO scores,
clean FAQ/Article/HowTo schema, a 5.4x-grown `llms.txt` plus a new
1.36 MB `llms-full.txt`, and citation in 5 of 6 Perplexity test prompts —
including one answer that named and recommended the service outright
[1][2][3]. The single critical finding, however, dwarfs all of that: Google
has only ever read a stale, wrong-host sitemap from May 2026 (22 URLs) and
has never discovered 96% of the site — 5 pages indexed, 0 blog posts, 0
landing pages, 0 tools, out of 134 live URLs [4]. That is the root cause of
the 6-click/28-day, 0-top-10-of-20-queries search performance in GSC [3], not
a content-quality or technical-SEO problem. Top 3 priorities: (1) confirm the
just-submitted www sitemap and IndexNow push actually drive indexation over
the next 1–2 weeks [4]; (2) close the sole YMYL/E-E-A-T gap — no named,
credentialed reviewer anywhere on the site, versus the leading competitor's
verifiable-CPA trust stack [1][3][baseline]; (3) fix the handful of concrete
on-page defects (orphan page, broken IRS citations, missing FAQ schema,
missing tool `offers` property) while indexation ramps [1][5][6]. Overall
assessment: technically healthy, content-rich, and already AI-citable site
that has been functionally invisible to Google through a plumbing bug now
fixed — the play is to verify the fix, not to rebuild the site.

---

## Keyword Opportunity Table

Volumes are **inferred only** — no ahrefs/semrush/similarweb connector is
authenticated in this environment; GSC query-level data is suppressed by low
traffic (only 1–2 queries surface at all in the 28-day/3-month windows) [3].
"Current Ranking" is drawn from the 20-query SERP probe [3] ("not in top 10"
for all 20) and GSC average position (19.2–19.3 site-wide, not query-level)
[3][4]. Difficulty and opportunity are judgment calls based on which domains
occupy the observed SERPs (irs.gov and forums dominate low-competition
queries; Form5472.online and doola dominate commercial queries) rather than
a metric tool — treat them as directional, not precise scores. Because the
indexation fix [4] is so new, none of these rankings reflect post-fix
crawling yet; re-run the SERP probe alongside the 2-week GSC re-check called
out in the action plan below.

| # | Keyword | Est. Difficulty | Opportunity | Current Ranking | Intent | Recommended Content Type / URL to strengthen |
|---|---|---|---|---|---|---|
| 1 | form 5472 | High (irs.gov + AI Overview lock top slots) | Med — head term, AI Overview cites 4 competitors, not us | Not in top 10 [3] | Informational | `/irs-form-5472` (already Perplexity-cited [3]) |
| 2 | form 5472 filing service | Med — Form5472.online ranks #1 | High — direct commercial intent, we have no dedicated indexable page | Not in top 10; our only built page (`pro-form-5472`) is `noindex` [3][6] | Transactional | New indexable "Form 5472 filing service" page or un-noindex a non-ad variant [6] |
| 3 | who can file form 5472 | Med | Med | Not in top 10 [3] | Informational | `/irs-form-5472` |
| 4 | form 5472 penalty | Med | High — $25k penalty is the core hook, we have a calculator | Not in top 10 [3] | Informational/commercial | `/form-5472-penalty` + `/form-5472-penalty-calculator` (winner per cluster #4) [6] |
| 5 | form 5472 deadline 2026 | Low–Med | High — seasonal, low competition outside irs.gov | Not in top 10 [3] | Informational | `/form-5472-deadline-calculator` (winner per cluster #3) [6] |
| 6 | foreign owned llc tax filing | High | Med | Not in top 10 [3] | Informational | `/irs-form-5472`, `/file-form-5472` |
| 7 | foreign owned single member llc form 5472 | Med | Med | Not in top 10 [3] | Informational | `/irs-form-5472` |
| 8 | pro forma 1120 form 5472 | Low–Med | High — thin competitor coverage (reddit/forums dominate) | Not in top 10 [3] | Informational | `/pro-forma-1120` (winner per cluster #1) [6] |
| 9 | form 5472 late filing | Med | High — DIIRSP/reasonable-cause is a differentiated angle | Not in top 10 [3] | Informational/transactional | `/diirsp` (winner per cluster #2) [6] |
| 10 | do i need to file form 5472 | Med | High — matches our own tool page exactly | Not in top 10 [3] | Informational | `/do-i-need-to-file-form-5472` (tool) [5] |
| 11 | form 5472 instructions | High (irs.gov x2 + wise.com) | Low–Med | Not in top 10 [3] | Informational | `/form-5472-instructions` (differentiate as line-by-line reference) [6] |
| 12 | how to file form 5472 | Med | Med | Not in top 10 [3] | Informational/transactional | `/file-form-5472` (winner per cluster #5) [6] |
| 13 | form 5472 for wyoming llc | Low | Med — SDO CPA's state-page strategy is beatable, we already have state pages | Not in top 10 [3] | Local/informational | Wyoming landing page (differentiate title/H1 vs blog twin) [6] |
| 14 | form 5472 uae | Low | Med | Not in top 10 [3] | Local/informational | Existing UAE coverage per gap list [6] |
| 15 | form 5472 india | Low | Med | Not in top 10 [3] | Local/informational | Existing India coverage per gap list [6] |
| 16 | doola form 5472 | High (brand-owned by doola) | Low | Not in top 10 [3] | Comparison | `/doola-form-5472` (existing provider page) [5] |
| 17 | cheap form 5472 filing | Med | Med — price-sensitive, we're the lowest-priced named option in Perplexity's answer [3] | Not in top 10 [3] | Transactional | `/pricing` |
| 18 | form 5472 cpa cost | Med | High — only visible GSC query with any impression [3] | Not in top 10 (1 impression, 0 clicks, 28d) [3] | Commercial | `/pricing`, "best form 5472 service" comparison [6] |
| 19 | form 5472 reasonable cause statement | Low–Med | High | Not in top 10 [3] | Informational/transactional | `/form-5472-reasonable-cause-statement` (winner per cluster #2) [6] |
| 20 | ein for foreign owned llc without ssn | Med (forum-dominated) | Med | Not in top 10 [3] | Informational | `/ein` |
| 21 | form 5472 crypto | Low (uncovered) | Med — content gap, no competitor coverage seen | N/A — page doesn't exist yet | Informational | New post [6] |
| 22 | form 5472 turkey | Low (only uncovered country) | Low–Med | N/A — page doesn't exist yet | Local/informational | New post [6] |
| 23 | best form 5472 filing service | Med | High — comparison-intent, competitors uncovered by us | Not tested directly; adjacent query #17/18 not in top 10 [3] | Commercial comparison | New comparison page incl. provider pages [6] |
| 24 | 855-887-7737 (IRS fax number) | Low (brand/nav) | Low | 3 impressions, 0 clicks (28d, only other visible GSC query) [3] | Navigational | `/form-5472-fax-number` |
| 25 | form 5472 penalty notice | Med | Med | Not directly probed; Perplexity cites our post for cost/penalty prompts [3] | Informational | `/blog/form-5472-penalty-notice-what-to-do` |

---

## On-Page Issues Table

| Page | Issue | Severity | Fix |
|---|---|---|---|
| `/1120-pro-forma-instructions` | True orphan — 0 in-body inbound links from any other page, not even nav/footer [1] | High | Add contextual links from the pro-forma-1120 cluster and blog; then 301-consolidate into `/pro-forma-1120` per cannibalization fix [6] |
| Site-wide (homepage, all blog, all landing pages) | No named human reviewer/preparer with credentials anywhere; "Reviewed by a qualified tax accountant" is generic on 24 pages, Terms explicitly disclaims being a CPA/EA firm [1][baseline] | Critical (YMYL) | Name a real credentialed reviewer (CPA/EA) with `Person` schema + bio page, or adjust "reviewed by" language for accuracy — owner-gated |
| 25 of 105 blog posts (crawl-time count; ~10 of 95 in current inventory per [6]'s FAQ-gap list) | Missing `FAQPage` schema that sibling posts have | Medium | Add FAQ blocks + schema; wave 1 (in progress) already covers 10 of these — track remainder against [6]'s 10-post list |
| `/blog/ein-cost-irs-free-vs-service`, `/blog/ein-responsible-party-foreign-owned-llc`, `/blog/new-ein-llc-ownership-structure-change` | Cite 404'd irs.gov URLs (IRS restructured to `/businesses/small-businesses-self-employed/...`) [1] | Medium | Update the 3 outbound links to the current IRS paths |
| `/` and `/pricing` | Duplicate H1 text ("Flat-rate Form 5472 filing. No hidden fees.") — unchanged since baseline [1][baseline] | Low | Differentiate H1 wording between the two pages |
| 22 of 28 landing pages | No `updated` field — `dateModified` falls back to a site constant instead of a real edit date [6] | Medium | Add real `updated` dates as pages are refreshed (tracked in wave-1/strategic plan) |
| `do-i-need-to-file-form-5472` (tool) | `WebApplication` JSON-LD missing the `offers` property that the other two calculators have [5] | Medium | Add `offers` object to match `deadline-calculator`/`penalty-calculator` (wave-1 item, in progress) |
| `/blog/form-5472-royalties-license-fees-intellectual-property`, `/blog/form-5472-vs-1040-nr`, `/blog/form-5472-reasonable-estimates-small-amounts`, `/blog/form-5472-short-tax-year` | Title core (excl. accepted `· Form5472 Prep` suffix) is 77–80 chars, will truncate in SERPs [1] | Low | Shorten core titles to ≤60 chars |
| `/blog` index | Meta description 99 chars, under the 110 floor [1] | Low | Expand to 110–155 chars |
| `/privacy`, `/data-retention` | Meta description 173/189 chars, over 160 [1] | Low | Trim to ≤160 chars |
| Homepage | Canonical omits trailing slash (`.../form5472prep.com`) vs sitemap `<loc>` (`.../form5472prep.com/`) — unchanged since baseline [1][baseline] | Low | Normalize both to the same form |
| `/terms` (and likely `/privacy`, `/data-retention`, `/security`, `/editorial-policy`, same template) | Zero JSON-LD on the page, not even `WebPage` [1] | Low | Add minimal `WebPage` schema for consistency |
| `/form-5472-fax-number`, `/stripe-atlas-form-5472`, 8 named blog posts | Near-orphan — only 1 in-body inbound link each [1] | Low | Add 2–3 contextual cross-links from topically related posts |
| `penalty-calculator` (tool) | Fails Lighthouse `link-text` (SEO) — non-descriptive link text, why SEO score is 92 vs 100 elsewhere [5] | Low | Rewrite link text to be descriptive |

---

## Content Gap Recommendations

All items below are from the content-inventory gap analysis [6] against a
40-query target list, cross-referenced with the search-landscape competitor
findings [3].

### New content (why / format / priority / effort)
| Item | Why | Format | Priority | Effort |
|---|---|---|---|---|
| Form 5472 + crypto | Only uncovered transaction type on the target list; no competitor coverage seen in SERP probes [3][6] | Blog post | Medium | S |
| Form 5472 + Turkey | Only uncovered country on the target list [6] | Blog post | Low–Medium | S |
| "Best Form 5472 filing service" comparison | Direct commercial-comparison intent (query #17/18 territory); competitors have nothing equivalent naming us [3][6] | Comparison page, cross-links provider pages | High | M |
| ZenBusiness / LegalZoom / Bizee-Incfile / Tailor Brands provider pages | Same facts-file discipline as existing doola/firstbase/atlas/northwest/clemta/startglobal/zenind pages; formation-service search volume is real (SDO CPA and doola compete here) [6] | Landing pages | Medium | M |
| Indexable "Form 5472 filing service" page | The only page built for this exact commercial query (`pro-form-5472`) is `noindex` (paid-ads only) [6] | Landing page | High | S |
| IRS CP15 notice page (currently only a subsection) | Penalty-notice intent is proven — Perplexity already cites the penalty-notice blog post for cost questions [3][6] | Blog post / expand existing | Medium | S |
| E-file question (currently folded into `/file-form-5472`) | Standalone AEO answer target ("can I e-file Form 5472?") | FAQ/blog snippet | Low | S |
| Fax-vs-mail comparison | Partial coverage today; direct-answer format fits AEO well [6] | Blog post/FAQ | Low | S |
| Complete filled-form example | Partial coverage; high AEO/GEO value (LLMs favor concrete worked examples) [6] | Blog post with annotated example | Medium | M |
| FBAR/8938 bank-account reporting angle | Partial coverage; adjacent compliance topic foreign owners search for [6] | Blog post | Low | S |

### Consolidate / Differentiate (cannibalization clusters) [6]
| Cluster | Members | Recommended winner | 301 targets |
|---|---|---|---|
| 1. Pro forma 1120 (5-way) | `pro-forma-1120`, `form-1120-foreign-owned-llc`, `form-1120-disregarded-entity`, `1120-pro-forma-instructions`, blog `pro-forma-form-1120-foreign-owned-llc` | `/pro-forma-1120` | `form-1120-disregarded-entity` → `/pro-forma-1120`; `1120-pro-forma-instructions` → `/pro-forma-1120` (also fixes the orphan-page issue above); differentiate `form-1120-foreign-owned-llc` toward "who must file the 1120 cover"; blog post stays as supporting content |
| 2. Late / DIIRSP / reasonable cause (5-way) | `late-form-5472`, `diirsp`, `form-5472-reasonable-cause-statement`, blog `form-5472-filed-late-never-filed`, `form-5472-reasonable-cause-letter` | `/diirsp` (procedure) + `/form-5472-reasonable-cause-statement` (letter) — two winners, differentiated by intent | `late-form-5472` → `/diirsp` |
| 3. Deadline (3-way) | Blog `form-5472-deadline-2026`, landing `form-5472-deadline`, tool `/form-5472-deadline-calculator` | Calculator (transactional intent) | No 301 — differentiate: landing gets a calculator CTA, blog stays evergreen explainer |
| 4. Penalty (3-way) | Blog `form-5472-penalty-notice-what-to-do`, landing `form-5472-penalty`, tool `/form-5472-penalty-calculator` | Calculator ("what does it cost") | No 301 — differentiate: landing keeps the $25k authority angle, blog stays "I got a notice" narrative; only 5/95 posts currently link the penalty calculator, add cross-links |
| 5. Instructions/how-to/what-is (3-way + 2-way) | Landing `file-form-5472`, `form-5472-instructions`, blog `how-to-fill-out-form-5472`; landing `irs-form-5472` vs blog `what-is-form-5472` | `/file-form-5472` (how-to) and `/irs-form-5472` (definitional) | No 301 — differentiate `form-5472-instructions` into a literal line-by-line field reference |

---

**Prioritization note:** The five cannibalization clusters above account for 21 of the 134 live URLs
touching just 5 topics — the largest source of internal competition on the
site [6]. None require new content; all are link/routing fixes. By contrast,
the 10 net-new content items address only 2 genuine topic gaps (crypto,
Turkey) plus 8 items that already have partial coverage and mainly need
depth or a dedicated URL — this is a site with broad coverage already, not
one that needs a large new-content sprint. That reinforces the sequencing
rule below: resolve indexation and internal linking before investing more
writer time on net-new posts that Google still can't see.

---

## Technical SEO Checklist

| Check | Status | Details |
|---|---|---|
| Indexation | Fail → Fixing | Only 5/134 pages indexed as of 2026-09-05; root cause was a stale non-www sitemap (last read May 22, 2026, 22 URLs) that 307-redirects; www sitemap now submitted + indexing requested for 8 URLs today, in progress [4] |
| Sitemap | Fail → Fixed | Live sitemap at `https://www.form5472prep.com/sitemap.xml` returns 200 with 139 `<loc>` entries (134 production URLs per current inventory), zero redirects on any entry [1][4] |
| robots.txt | Pass | 200, `Allow: /`, disallows only `/admin`, `/api/`, `/dashboard`, `/filings`; explicitly allowlists all major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) [1][4] |
| Canonicals | Pass (1 lint nit) | 0/139 pages have a canonical pointing elsewhere; only defect is the homepage trailing-slash mismatch vs sitemap `<loc>` [1] |
| Apex → www redirect | Warning | Still `307 Temporary Redirect`, unchanged since the 2026-08-16 baseline; should be 301/308 — **owner-gated toggle at DNS/edge config** [1][baseline] |
| HTTPS | Pass | HSTS enabled (`max-age=63072000`), http→https and apex→www both resolve, though via 2 hops due to the 307 above [1][baseline] |
| Core Web Vitals / Lighthouse (mobile) per page type | Warning | Homepage 74 perf/2.9s LCP; pricing 84/2.9s; blog post 84/4.3s LCP; penalty landing 82/4.1s LCP; tool pages 72–86 perf (deadline-calc 77, do-i-need-to-file 72, penalty-calc 86, doola page 77), LCP 2.5–2.9s on tools. SEO 92–100 across all pages (100 except `penalty-calculator` at 92 for link-text). CLS is 0 everywhere — no layout-shift issues. Best Practices flat at 77 site-wide from a third-party-cookie flag [2][5] |
| Structured data validity | Pass (1 gap) | 0/26 spot-checked FAQ Q&A mismatches across page types; breadcrumbs sequential everywhere; Article/BlogPosting fields complete. Gap: `do-i-need-to-file-form-5472`'s `WebApplication` missing `offers`; legal pages (`/terms` etc.) carry zero JSON-LD [1][5] |
| Mobile | Pass (a11y nits) | Accessibility 91–96 across sampled pages; recurring `target-size` (touch targets too small/close) and `color-contrast` findings on 3/5 crawled pages — design-system-level fix would likely resolve both at once [2][5] |
| Broken links (internal) | Pass | 0 broken — all 143 unique internal targets return 200 [1] |
| Broken links (outbound irs.gov) | Warning | 3 of 51 unique irs.gov links 404 (IRS restructured URL paths); 90% of pages now cite irs.gov at least once, up from 25% at baseline [1][baseline] |
| llms.txt / llms-full.txt | Pass | `llms.txt` grew 5.4x (8.1 KB → 44.4 KB); new `llms-full.txt` (1.36 MB, ~1,800 section headers, full-text export with Source/Last-reviewed lines) is a strong new GEO asset [1] |
| IndexNow | Pass (new) | Key file live, all 139 sitemap URLs submitted 2026-09-05 05:07 UTC, HTTP 202 Accepted; note this is the Bing/IndexNow-consortium path only — Google ignores IndexNow, the GSC www-sitemap submission is the path that matters for Google [4] |
| Bing Webmaster Tools | Not set up | No BWT account exists yet — **owner-gated** |

---

## Competitor Comparison Summary

Competitors per the SERP/Perplexity probe [3]: Form5472.online (single
biggest competitive threat — near-identical domain, ranks organically ahead
on multiple commercial queries, dominant in Perplexity's own source set),
doola.com, SDO CPA (sdocpa.com).

| Dimension | form5472prep.com | Form5472.online | doola | SDO CPA | Winner |
|---|---|---|---|---|---|
| Indexed pages / visibility | 5/134 indexed in Google today (fix in progress); 0 top-10 rankings across 20 SERP probes [3][4] | Ranks #1–2 on 4 of 20 probed queries [3] | Broad brand visibility, not Form-5472-specific in probes [3] | Some presence via programmatic state pages [3] | Form5472.online (today) |
| Content depth | 95 posts + 28 landing pages + 3 tools, strong topical coverage incl. per-state and per-country pages [6] | Blog + "AI vs CPA" content-marketing piece, narrower set [3] | Broad all-in-one platform content, not Form-5472-deep [3] | Programmatic local-SEO footprint across 48 states, calculators for adjacent topics (S-Corp, QBI, SE tax) [3] | form5472prep.com (depth) / SDO CPA (breadth of local pages) |
| Named credentialed expert | None — "reviewed by a qualified tax accountant," no name, no license number [1][3][baseline] | **Arik Rozen, CPA, MBA**, Virginia Board of Accountancy License #025991, independently verifiable [3] | Not surfaced on homepage [3] | Not surfaced on Form 5472 service page [3] | Form5472.online |
| Reviews / trust badges | None found [1][3] | Trustpilot 4.8/5, 50+ named reviews, "230,000+ returns filed," "198 countries," IRS Authorized e-File Provider [3] | Y Combinator/Hubspot/Nexus funding badges (not service reviews) [3] | None visible [3] | Form5472.online |
| Tools | 3 (deadline calculator, penalty calculator, do-i-need-to-file eligibility checker), all with WebApplication/FAQPage schema [5] | Interactive IRS Penalty Calculator, "Ask a CPA" Q&A hub [3] | AI Co-Founder tool, e-commerce integrations (not Form-5472-specific) [3] | Calculators for adjacent topics only, not Form-5472-specific [3] | Tie (form5472prep.com vs Form5472.online) |
| Pricing transparency | $149/$199 flat, clearly stated on `/pricing` [baseline] | $399 CPA prep + $49 fax = $448 all-in, explicit SLA table (standard/expedited/rush) [3] | No price on homepage (freemium funnel) [3] | $1,500 starting, +$300/related party, rush = +100%, not upfront on landing [3] | form5472prep.com (lowest, most transparent) |
| AI-citation presence (GEO) | Cited in 5/6 Perplexity prompts (83%), including one prompt naming and recommending the service by name and price [3] | Cited alongside us in Perplexity's broader source sets; also cited in Google AI Overview for "form 5472" [3] | Not observed in the GEO probe set [3] | Not observed in the GEO probe set [3] | form5472prep.com |
| Technical score (Lighthouse SEO) | 92–100 across all sampled pages, 0 broken internal links, clean schema [1][2][5] | Not directly audited (out of scope) | Not directly audited | Not directly audited | form5472prep.com (only site technically audited here) |

---

## Prioritized Action Plan

### Quick Wins (this week)

| Item | Status | Effort | Impact |
|---|---|---|---|
| Submit www sitemap to GSC | **DONE** | — | Unblocks discovery of 129 previously-unknown URLs [4] |
| Submit IndexNow for all 139 URLs | **DONE** | — | Secondary discovery signal (Bing/IndexNow consortium, not Google) [4] |
| Homepage "Free tools and guides" block linking 3 tools + 8 key pages | **DONE** | — | Internal-link equity to tools and orphan-risk pages |
| `/pricing` link into 15 high-intent posts | **IN PROGRESS** (wave 1) | S | Money-page linking depth — only 2/95 posts linked `/pricing` before [6] |
| FAQ sections on 10 guides lacking one | **IN PROGRESS** (wave 1) | S | Closes AEO schema-consistency gap [1][6] |
| Direct-answer lead on `itin-required` | **IN PROGRESS** (wave 1) | S | AEO — was the one outlier opening with a date instead of an answer [6] |
| Checker `WebApplication` `offers` property | **IN PROGRESS** (wave 1) | S | Closes the schema parity gap vs. sibling calculators [5] |
| Penalty-calculator link-text fix | **IN PROGRESS** (wave 1) | S | Fixes the one non-100 Lighthouse SEO score (92→100) [5] |
| Fix 3 broken irs.gov outbound citations | TODO | S | Restores citation quality on 3 posts [1] |
| Add contextual links to `/1120-pro-forma-instructions` (true orphan) | TODO | S | Fixes the site's only orphan page [1] |
| Differentiate H1 on `/` vs `/pricing` | TODO | S | Removes duplicate-H1 signal, unchanged since baseline [1][baseline] |
| Normalize homepage canonical trailing slash | TODO | S | Lint cleanup [1] |
| Trim/expand the 3 meta-description length outliers (`/blog`, `/privacy`, `/data-retention`) | TODO | S | SERP display quality [1] |
| Shorten the 4 genuinely-long titles (77–80 chars core) | TODO | S | SERP truncation [1] |

### Strategic Investments (this quarter)

Sequenced so nothing content-heavy starts before indexation is confirmed
ramping — **re-check GSC indexation status in ~2 weeks (around 2026-09-19)**
before greenlighting new-content production below.

| Item | Effort | Impact | Dependencies |
|---|---|---|---|
| Confirm indexation ramp (GSC Pages report climbing off 5 indexed) | — | Gate for everything below | 1–2 week wait after sitemap fix [4] |
| Named credentialed reviewer (EA/CPA) with `Person` schema + bio page | M | Critical — closes the sole YMYL/E-E-A-T gap, directly matches the leading competitor's trust stack [1][3] | **OWNER-GATED** — needs a real person willing to be named |
| Apex → www redirect: 307 → 308 | S | Consolidates ranking signals cleanly | **OWNER-GATED** — DNS/edge config change |
| Bing Webmaster Tools account setup | S | Second search-engine discovery channel, complements IndexNow | **OWNER-GATED** — new account |
| Consolidate cannibalization cluster 1 (pro forma 1120, 5-way → `/pro-forma-1120` + 301s) | M | Removes internal competition on the #1 cluster; also fixes the orphan page | Indexation ramp confirmed |
| Consolidate cannibalization cluster 2 (late/DIIRSP/reasonable-cause) | M | Removes internal competition on a high-intent cluster | Indexation ramp confirmed |
| Differentiate clusters 3–5 (deadline, penalty, instructions/how-to) | S–M | Clarifies intent-matching without needing 301s | Indexation ramp confirmed |
| Add `updated` field to 22 landing pages missing it | S | Accurate `dateModified` for freshness signals | Can run in parallel with indexation wait |
| Indexable "Form 5472 filing service" page | S | Captures the exact commercial query the noindex'd `pro-form-5472` currently misses [6] | Indexation ramp confirmed |
| "Best Form 5472 filing service" comparison page | M | Commercial-comparison intent, cross-links provider pages [3][6] | Indexation ramp confirmed |
| New provider pages (ZenBusiness, LegalZoom, Bizee-Incfile, Tailor Brands) | M | Extends the proven provider-page pattern (doola/firstbase/atlas/etc.) [6] | Indexation ramp confirmed |
| Crypto + Turkey content gaps | S/M | Closes the only 2 remaining gaps on the 40-query target list [6] | Indexation ramp confirmed |
| CP15 notice, e-file question, fax-vs-mail, filled example, FBAR/8938 | S each | Rounds out partial-coverage AEO answer targets [6] | Indexation ramp confirmed |
| Design-system fix for color-contrast + target-size (mobile a11y) | M | Fixes recurring a11y findings across 3/5 pages in one pass [2][5] | Independent of indexation |
| Investigate/remove third-party cookie pinning Best Practices at 77 site-wide | S | Uniform BP score lift across all pages [2][5] | Independent of indexation |
| LCP optimization on content-heavy pages (blog post 4.3s, penalty landing 4.1s) | M | Performance score lift on the highest-value page types | Independent of indexation |
| `/admin/sources` attribution readout | — | Visibility into which content drives AI-engine citations | **OWNER-GATED** — not yet scoped/built |
| GitHub token rotation | — | Security hygiene, unrelated to SEO but flagged as owner-gated housekeeping | **OWNER-GATED** |

---

**Bucket counts**: Keyword Opportunity Table — 25 rows. On-Page Issues Table
— 13 rows. Content Gap Recommendations — 10 new-content items + 5
consolidate/differentiate cluster items. Technical SEO Checklist — 15 rows.
Competitor Comparison Summary — 8 dimension rows. Prioritized Action Plan —
Quick Wins: 14 items (3 DONE, 4 IN PROGRESS, 7 TODO); Strategic Investments:
16 items (5 owner-gated).
