# /services/* ranking loss, Oct 4 → Oct 11: audit and fix (2026-10-15)

Branch `seo/svc-2026-10-15` (worktree `~/Developer/f5472-wt/svc`). Files changed: `src/lib/services-pages.ts`,
`src/lib/services-pages.test.ts`, `src/app/(marketing)/services/[slug]/page.tsx`, and link insertions in 17 blog posts (§7).
Evidence: the 2026-10-15 Moz re-read (campaign, rankings, competitors), GSC diagnosis 2026-10-15 §2b/2c/5/6, and Moz AI
Visibility §1.7. Those notes are in the orchestrator's scratch area, so the figures used here are copied into this file.

## 1. Verdict

Copy alone does not explain the loss. The service pages were never text duplicates of each other: before this pass,
on average 14% of a page's main copy also appeared on another service page, and the nearest pair overlapped by 3.7%
(Jaccard). Several facts point to a cause at the level of the whole site, outside this lane:

- The brand query "form5472prep" fell from #1 to #8.
- On Oct 4, several #1 positions were held by the **wrong** URL: the fax-filing keyword ranked on the late-filing page,
  "preparer" ranked on the pro-forma page, "pro forma 1120 filing service" ranked on the /services hub, and the brand
  query ranked on the late-filing page. Google had not yet settled which page answers which query. The 8 pages were
  only 3 days old (launched Oct 1).
- The drop overlaps Google's September 2026 spam update (Sep 24 – Oct 8, phase 3 Oct 4–6). The site also carries 54
  PBN spam-advert linking domains, and Google picked 747live.bet as the canonical for two of our URLs.
- The real traffic involved is small. GSC shows the service pages went from about 5–26 impressions each per 3 days
  (Oct 5–7) to 0–3 (Oct 10–12), roughly 100 impressions per 3 days in total.

Two content problems were real and are fixed here:

1. **Same buyer intent across several pages.** Six "annual" pages sell the same product at the same price.
2. **One section skeleton on every page.** Since the 2026-10-05 answer-engine (AEO) pass, every original page used the
   same section order: includes / how it works / what nobody can promise / how the options compare / how much it costs.

## 2. Hypotheses

| # | Hypothesis | Holds? | Numbers |
|---|---|---|---|
| a | Templated near-duplicates / doorway-like variants | **Not as text; partly as template and intent** | Main copy shared with other service pages: 10.6% (Oct 4, 8 pages) → 14.2% (Oct 15, 12 pages). Nearest-neighbour Jaccard 2.7% → 3.7%. With the page template included: 22.2% → 29.3%. Near-duplicate clustering needs far higher similarity. However, all 8 original pages shared one 6–7-section skeleton after the Oct 5 AEO pass. 6 pages are the same product, and GSC (data to Oct 9) listed `/services/hire-someone-to-file-form-5472` under "Duplicate without user-selected canonical", the only service page Google collapsed. |
| b | The 4 audience pages (Oct 5) cannibalise the core page | **Holds for 2 keywords + 1 page** | "form 5472 preparer" was #1 on `/services/pro-forma-1120-filing-service` and "form 5472 preparation service" was #1 on `/services/late-form-5472-filing-service` (Oct 4). On Oct 5 `/services/form-5472-preparer` was added targeting both. On Oct 11 none of these pages ranks (#21+). `hire-someone` duplicates the flagship's intent (above). Exact keyword collisions in running text: **0 before and 0 after**. That is now enforced by a test. |
| c | Titles/H1s changed, losing exact-match terms | **Does not hold** | The titles, H1s and meta descriptions of the 8 original pages were byte-identical on Oct 4 and Oct 15 (checked against commit `5f6b8e7`). Only the H2s changed (Oct 5: statements became questions), and the keyword-bearing H2s were kept. The one exact-match title collision predates the window: the hub "Form 5472 Filing Services" vs the flagship "Form 5472 Filing Service…" (fixed, §6). |
| d | Internal links point money anchors at the wrong pages | **Partly** | The flagship gets 128 blog and 16 landing ServiceCard links plus the footer, and still dropped #4 → #21+, so links are not its problem. The niche pages had 1–3 card links each. In-body money-anchor links to `/services/*` across 196 posts + all landing pages: **6**. The sitewide nav anchor "Form 5472 filing services" (`src/app/(marketing)/layout.tsx:92`) points at the **hub**, not the flagship. |
| e | Thin unique content vs competitors | **Mostly no; authority is the gap** | Our pages are 690–1,140 words, and 81–94% of each page's main copy is unique to it. Competitors rank on these exact terms with **homepages**: Form5472.online "/" for filing service (#4), preparer (#3), preparation service (#4) and "1120 and 5472" (#3); "/shop" for filing service and final dissolved. Domain Authority (Moz score) is 11 for us vs 15 for Form5472.online; linking domains are 64 (mostly PBN spam) vs 292. |

Changes to service pages in the window (git): Oct 1 the 8 pages launched; Oct 5 the 4 audience pages, the AEO pass
(question H2s and ≤60-word capsules) and hero images; Oct 6 keyword-gap edits on 4 pages; Oct 7 the preparer H2 and a
sitewide footer Guides band; Oct 10–11 Express price churn ($299 option added and reverted; $249 then back to $199).

## 3. Keyword → page map (after this pass)

Primary keywords are unique; secondaries are unique too. `services-pages.test.ts › keyword ownership` fails if another
service page uses an owned phrase anywhere except as the anchor of a link to its owner.

| Page | Primary (title, H1, first sentence) | Secondary | Note |
|---|---|---|---|
| `form-5472-filing-service` | form 5472 filing service | 1120 and 5472 filing service; form 5472 and pro forma 1120 filing service; form 5472 online filing | Head term. The hub no longer uses "filing services" (§6). |
| `pro-forma-1120-filing-service` | pro forma 1120 filing service | pro forma 1120 preparer for non resident | |
| `late-form-5472-filing-service` | late form 5472 filing service | delinquent form 5472 filing service; form 5472 catch up filing multiple years | Still ranks #17 / #18 ("late form 5472"). |
| `foreign-owned-llc-tax-filing-service` | foreign owned llc tax filing service | us tax filing service for non resident llc owner; non resident llc compliance service | Now the "which US filings exist" scope page. |
| `form-5472-fax-filing-service` | form 5472 fax filing service | fax form 5472 to irs service | "form 5472 fax number" belongs to `/form-5472-fax-number` (#12). |
| `white-label-form-5472-filing` | white label form 5472 filing | form 5472 filing for company formation agents / registered agents | `/blog/white-label-form-5472-filing-accounting-firms` ranks #2 for the primary. The blog links here with a descriptive anchor, deliberately not the exact keyword. |
| `form-5472-filing-for-dormant-llc` | form 5472 filing for dormant llc | form 5472 for llc with no activity | |
| `final-form-5472-for-dissolved-llc` | final form 5472 for dissolved llc | close foreign owned us llc tax filing | Was #6 via `/faq` on Oct 4. |
| `hire-someone-to-file-form-5472` | hire someone to file form 5472 | pay someone to file form 5472; form 5472 done for you | Merge candidate (§8). |
| `form-5472-preparer` | form 5472 preparer | who prepares form 5472; form 5472 tax preparer; **form 5472 preparation service** | Now a "choosing a preparer" page. The options comparison moved here from the flagship. |
| `form-5472-for-accountants` | form 5472 for accountants | for tax preparers / cpa firms / accounting firms / cpas; outsource form 5472 preparation | `/blog/form-5472-in-house-vs-outsourced-firm` ranks #3 for "outsource…"; don't chase it here. |
| `form-5472-for-bookkeepers` | form 5472 for bookkeepers | bookkeeping handoff | Newly #11. Kept light-touch. |

## 4. Overlap measurement

Method:
- **Text:** each page's main copy, rendered as plain text: H1, intro, section H2s and bodies, FAQs.
- **Shingles:** sequences of 5 lower-cased consecutive words.
- **Shared %:** the share of a page's shingles that also occur on any other service page.
- **Nearest-neighbour Jaccard:** the overlap with the most similar other page.
- **Template variant:** "With page template" also counts the template text: breadcrumb, CTA band, trust line, IRS-source
  and related cards.

"Before" is commit `287b194` and "Oct 4" is commit `5f6b8e7`. The page template text was assumed unchanged between
those two commits (8 vs 12 pages).

| Page | Words (Oct 4 / Oct 15 before / after) | Shared with other service pages, % (Oct 4 / before / after) | Nearest-neighbour Jaccard, % (Oct 4 / before / after) | Nearest neighbour after |
|---|---|---|---|---|
| `form-5472-filing-service` | 906 / 1116 / 1054 | 19.3 / 23.9 / 19.1 | 3.6 / 5 / 4 | form-5472-preparer |
| `pro-forma-1120-filing-service` | 924 / 1134 / 1072 | 12.1 / 12.9 / 11 | 3 / 3 / 2.3 | form-5472-filing-service |
| `late-form-5472-filing-service` | 930 / 1078 / 1130 | 8 / 11.1 / 9.5 | 2.3 / 2.9 / 2.1 | form-5472-filing-service |
| `foreign-owned-llc-tax-filing-service` | 906 / 1012 / 983 | 11.2 / 12.7 / 10.5 | 2.9 / 3 / 2 | form-5472-filing-service |
| `form-5472-fax-filing-service` | 903 / 1062 / 989 | 9.2 / 8.8 / 7.6 | 3.6 / 3.1 / 2.1 | form-5472-filing-service |
| `white-label-form-5472-filing` | 886 / 1096 / 1139 | 3.5 / 12.3 / 5.7 | 0.8 / 5.1 / 1.4 | form-5472-for-accountants |
| `form-5472-filing-for-dormant-llc` | 922 / 1064 / 1136 | 11 / 11.2 / 8.8 | 2.7 / 2.2 / 1.7 | late-form-5472-filing-service |
| `final-form-5472-for-dissolved-llc` | 883 / 1023 / 1092 | 10.8 / 11.8 / 10.4 | 2.7 / 2.8 / 2.4 | form-5472-filing-service |
| `hire-someone-to-file-form-5472` | – / 704 / 692 | – / 16.1 / 13.3 | – / 4.1 / 3.2 | form-5472-filing-service |
| `form-5472-preparer` | – / 707 / 703 | – / 15.8 / 13.7 | – / 5 / 4 | form-5472-filing-service |
| `form-5472-for-accountants` | – / 688 / 707 | – / 20.6 / 7.7 | – / 5.1 / 1.4 | form-5472-filing-service |
| `form-5472-for-bookkeepers` | – / 697 / 706 | – / 13.3 / 13.7 | – / 3 / 2.1 | form-5472-filing-service |
| **Mean, main copy only** | | **10.6 / 14.2 / 10.9** | **2.7 / 3.7 / 2.4** | |
| **Mean, with page template** | | 22.2 / 29.3 / 23.8 | 7.2 / 10.0 / 7.3 | |

Two more measures, main copy only, Oct 4 / before / after:

- **Shingles shared by ≥3 pages:** 4.2 / 7.0 / 5.5%.
- **Templated sentences:** 2.2 / 1.9 / 0.9%. A templated sentence is the same sentence on two or more pages once each
  page's own keyword is swapped out.

What remains shared is mostly domain vocabulary, which is fine. Examples: "Foreign-owned U.S. DE across the top",
"the $25,000 penalty under IRC §6038A(d)", and the approved trust line.

## 5. What changed per page

Changes common to every page:
- **Opening:** the first sentence now says exactly who the page is for.
- **Brand in the answer:** the bold direct answer names "Form5472 Prep" once. Test: `names the brand once in the bold
  answer and at most once per capsule`. Evidence: in 10 of 17 AI Mode and Gemini citations, the engine quoted our pages
  without naming us (Moz AI Visibility, 2026-10-12).
- **Price paragraph:** each page's price paragraph is worded differently and names the brand. Prices are still
  interpolated from `pricing.ts`.
- **IRS-source blurbs:** these were identical on 9–11 pages; each now says what that page uses the source for.
- **Removed section:** the repeated "How do the options compare?" block is gone from 7 pages.
- **Dates:** `lastModified` and the visible "Last reviewed" date are now 2026-10-15.

New page-specific blocks:
- **Flagship:** a worked first-year example (USD 5,000 in, USD 300 owner-paid bill, USD 1,000 out → cover, Form 5472,
  Part V lines, cover letter). The "what you need" list moved to the hire page.
- **Pro forma:** the cover box by box; what changes on the cover from year to year (item E initial, final, name and
  address boxes).
- **Late:** a three-year catch-up worked example, with the price arithmetic ($347 on Standard = $149 + 2 × $99, from `pricing.ts`).
- **Foreign-owned LLC tax:** a map of which US filings a foreign-owned SMLLC can have, and which are covered.
- **Fax:** the generic "who uses" section is cut.
- **White label:** how missed-year, dormant and dissolved clients are handled. The refer / partner / white-label
  comparison now lives only on the accountants page.
- **Dormant:** three quiet-year examples (file / file / maybe not).
- **Final:** a worked example of an LLC dissolved on March 20.
- **Hire:** a "what comes back to you, and when" timeline.
- **Preparer:** the four kinds of preparer and the checklist.
- **Accountants and bookkeepers:** reworded overlaps only.

Hub: the title and H1 are now "Form 5472 Services by Situation" (was "Form 5472 Filing Services"), so the hub stops
competing with the flagship for the head term. The eyebrow above each service H1 now shows the page's category instead
of the repeated "Form 5472 filing services".

Accuracy review: an independent advisor checked the changed copy. Its fixes were applied:
- The flagship cover bullet ("Nothing else.") contradicted the pro-forma page; corrected.
- The Part V scope wording was too broad; narrowed.
- The §1.6038A-1(c) phrasing was tightened.
- Dates now use the US order (July 15).
- "every client list" became "most client lists".

## 6. Internal links added (24 links in 17 posts, max 2 per post, body text only)

| Post | Link(s) → anchor |
|---|---|
| what-is-form-5472 | late Form 5472 filing service; Form 5472 filing service |
| form-5472-reportable-transactions-examples | Form 5472 filing for a dormant LLC; Form 5472 filing service |
| how-to-fill-out-form-5472 | Form 5472 preparer |
| pro-forma-form-1120-foreign-owned-llc | pro forma 1120 filing service |
| form-5472-pro-forma-1120-signature | Form 5472 fax filing service |
| form-5472-deadline-2026 | late Form 5472 filing service; Form 5472 filing service |
| irs-official-exchange-rate-form-5472 | Form 5472 filing service |
| new-ein-llc-ownership-structure-change | foreign owned LLC tax filing service |
| ein-third-party-designee-apply-on-your-behalf | Form 5472 filing service |
| form-5472-small-corporation-reasonable-cause | Form 5472 fax filing service; late Form 5472 filing service |
| form-5472-extension | late Form 5472 filing service |
| form-5472-diy-vs-preparer | Form 5472 preparer; hire someone to file Form 5472 |
| form-5472-in-house-vs-outsourced-firm | Form 5472 for accountants |
| white-label-form-5472-filing-accounting-firms | Form 5472 for accountants; "how white-label delivery works" (descriptive, not the exact keyword, because this post ranks #2) |
| form-5472-saas-founders | Form 5472 filing service |
| form-5472-hong-kong-residents-us-llc | foreign owned LLC tax filing service |
| form-5472-filed-late-never-filed | final Form 5472 for a dissolved LLC; late Form 5472 filing service |

## 7. Merge recommendations and other owner decisions (not done here)

1. **301 `hire-someone-to-file-form-5472` → `form-5472-filing-service`** (recommended).
   - It is the same product for the same buyer intent, and Google already collapsed it as a duplicate (GSC, Oct 6–9).
   - It had 0 impressions in both GSC windows and ranks #21+ on both dates.
   - The flagship would absorb its handover list. Merge only if it is still unranked at the 4-week check.
2. **Keep `form-5472-preparer`, but re-check on ~2026-11-12.** If it is still #21+ while the flagship recovers, 301 it
   to the flagship and move "form 5472 preparer/preparation service" to the flagship's secondaries.
3. **Sitewide nav anchor.** "Form 5472 filing services" → /services (`layout.tsx:92`, another lane's file) sends the
   strongest internal anchor for the head term to the hub. Change it to "All services", or point it at the flagship.
4. **Homepage vs flagship for "form 5472 filing service".** Competitors win this term with their homepages. Decide
   which of our URLs targets it; the homepage title is "File IRS Form 5472 + Pro Forma 1120".
5. **Site-level causes (tech/owner lanes).**
   - Disavow, or otherwise handle, the 54 PBN spam-advert domains.
   - Resolve the 747live.bet canonical hijack on `/form-5472-instructions` and `/clemta-form-5472`.
   - Watch the brand query "form5472prep" (#1 → #8).

## 8. Out-of-scope findings for other lanes (not touched)

- `content/blog/form-5472-extension.md` says "we prepare and submit the extension or filing package". The service
  pages say "We do not file Form 7004".
- `content/blog/form-5472-filed-late-never-filed.md:161`: "most foreign owners qualify for reasonable cause abatement,
  and the penalty exposure largely disappears" is an outcome claim.
- `src/lib/landing-pages.ts` (Germany page): "money-back guarantee … we handle the response with the IRS at no
  charge". Check this against current policy and the no-guarantee rule.
- Advisor note: an online signature on a pro forma 1120 that is filed on paper is not on the IRS e-signature list.
  This is a product question (the blog signature post covers it); the service copy still offers wet ink.

## 9. Re-check

Re-read the Moz collections and GSC Pages report on or after 2026-11-12. Success means:
- the intended page ranks for each primary keyword in §3;
- GSC no longer lists any `/services/*` URL as "Duplicate without user-selected canonical".

Re-run the §4 overlap measurement after any copy change. Keep main-copy shared % at or below 11 and the
nearest-neighbour Jaccard at or below 3%.
