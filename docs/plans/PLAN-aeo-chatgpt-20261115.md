# Plan: Form5472 Prep improvement and fixes (AI answers, rankings, links)
Version: 5 | Status: APPROVED v5 — EXECUTING (2026-11-16) | Date: 2026-11-15

Sources combined in this version:
- **X Article** by 虹安 (@yaohongan2025), 12 Nov 2026, read via the Grok CLI. Brief: `~/Developer/f5472-wt/aeo-1115/article-brief.md`. Its 17 screenshots could not be read; figures come from its text.
- **Moz read of 2026-11-15** (in-app browser, read-only): rankings and crawl of Nov 8, AI answers of Nov 9, links of Nov 15. Files: `~/Developer/f5472-wt/moz-1115/`. The Nov 15 rank collection had not posted yet.
- Live checks run on 2026-11-15 (technical base, junk URLs, home and About titles).

## 1. Goal
Three results, each measured:
1. **AI answers:** be one of the first two names ChatGPT, Google AI Mode and Gemini give for a fixed set of 14 buyer questions, with correct facts.
2. **Google rankings:** get the money pages (`/services/*`, `/form-7004-extension`, `/compare`) indexed and ranking for their own terms, and keep the country posts that just took over from the old listing pages.
3. **Links:** keep the paid link campaign from becoming a risk with Google, and add a small number of real mentions on pages AI engines already cite.

**Where we are (Nov 8 and Nov 9 data):**

| Area | Now | Note |
|---|---|---|
| ChatGPT mention rate | 30% (first; rivals 5%) | 12 of 40 prompts |
| Google AI Mode / Gemini | 12.5% / 10% (last on both) | Form5472.online 22.5% on both |
| Prompts naming us on no engine | 28 of 40 | includes "who can I hire", "doola vs firstbase", Stripe Atlas, Form 7004 |
| Wrong facts in AI answers | 0 of the 2 from Nov 2 | one drift: "within 3 business days"; AI Mode calls us "software/form-prep tools" |
| Moz visibility | 0.98% (was 1.12%); top-20 41 (was 56) | every competitor fell too |
| Money pages ranking for their own term | 0 | dissolved (#3) and late-filing (#9) dropped out |
| Brand terms | "form5472prep" #8 on `/about` (was #2 on home) | "form5472 prep" out of top 20 |
| Domain Authority | 39 (was 14) | from about 105 redirect-parameter pages, about 27 spun-blog posts, 7 more PBN domains, 4 placed posts (ordered by the owner); 0 real editorial links |
| Technical base (article's 7 checks) | 6 pass | Bing Webmaster verification unconfirmed |
| Google penalty (Search Console, Nov 15) | none | Manual actions and Security issues both "No issues detected" |
| Google clicks, last 28 days vs previous 28 | 63 vs 105 | 38 of the 42 lost clicks sit on 6 pages, mostly how-to and exchange-rate pages; `/pricing` and home held |

**Acceptance statement:** by 2026-12-20 there is a tracking table with at least 5 weekly rows for the 14 fixed questions; every on-site step below is live and verified; Search Console shows the index and canonical status of the 8 key pages, checked twice; a link inventory with a vendor brief and a ranked list of at least 20 off-site targets are delivered; and a week-5 report says, per question group, continue or stop, with AI-source visits, started filings and orders beside it.

Outcome targets (aims, not promises):
- ChatGPT names us on at least 3 more of the 14 questions; AI Mode or Gemini on at least 2 more.
- At least 3 of the 8 key pages rank in Moz's top 20 for their own term.
- No AI answer in the fixed set states a wrong price, turnaround or "software" description.

## 2. Scope and non-goals
**In scope**
- Fixed question set, weekly test routine, tracking table.
- Search Console checks: real clicks versus the Moz dip, brand queries, index and canonical status, manual actions.
- On-site: explicit "no" facts, answer-first openings on money pages, a brand-named summary on `/compare`, a route from the ranking 7004 blog post to the 7004 page, up to 5 new pages, a safety page, partner page and Terms saying the same thing.
- Links: an inventory by group, a brief for the link vendor, and a disavow file only if Google takes a manual action.
- Off-site: listing kit, ranked targets, drafted emails and entries.
- Week-5 continue-or-stop review.

**Not in scope**
- Creating accounts, sending emails, posting on other sites, or uploading a disavow file. I draft; the owner does these or approves each one.
- Title changes on ranking pages before 2026-11-25 (the last title batch was Nov 4; wait three weeks between batches).
- Translated pages. Spanish questions are measured only.
- Paid links, bulk directory submissions, fake reviews.
- Pagination noindex, long blog URLs, DIIRSP on marketing pages, money-back guarantee lines, the 3 company-car posts.
- New tracking code; attribution and the sources page already exist.
- Any Moz change (no Recrawl, no keyword or prompt edits, no exports).

## 3. Assumptions
1. **ChatGPT can be tested in the in-app browser** in Temporary Chat with web search on. If not, Steps 4 and 23 use Moz's weekly AI data only.
2. **`/admin/sources` is readable** where the owner is already signed in to admin. I never type the password. Otherwise the owner reads the numbers off the page.
3. **Search Console works in Chrome** with sumyeungai@ chosen by email (it did on Nov 4). Indexing requests are limited to about 10 a day.
4. **The Nov 8 ranking dip is partly noise.** All three competitors fell the same week. Step 3 checks Search Console before anything is changed because of the dip. If Search Console shows a real fall in clicks, Step 10 adds a diagnosis step before Phase B.
5. **Our 60-word answer rule stays.** The article's 80 to 120 word opening becomes a 40 to 60 word answer plus one "What this does not cover" line. If that reads badly on a page, that page gets the longer opening and its test is adjusted, noted in the log.
6. **The owner ordered the four placed posts** (ipsnews.net, nerdbot.com, psbios.com, bulkdp.com), answered 2026-11-15. It is assumed the PBN adverts, spun-blog posts and redirect-parameter pages came from the same vendor or from nobody we control. Nothing is disavowed unless Search Console shows a manual action (Step 3); if one exists, Step 22 moves ahead of Phase B.
7. **AI-source orders are few** (possibly 0 to 5 a month), so the week-5 decision leans on mention rate and visits.

## 4. Open questions
Answered by the owner on 2026-11-15:
1. Placed posts: **the owner ordered them.** They stay; no disavow.
2. First-hand numbers: **no.** Not published.
3. Review method page: **no.** Not published.
4. Partner wording: **we do not contact the partner's clients.** The partner page is right; the Terms line that says otherwise is corrected (Step 17), and the owner sees the exact Terms text before it ships.
5. Off-site work: **left to me.** Decision: I draft every listing, email and answer so each takes one paste; the owner sends or posts. Reason: most places need an account tied to the owner's email, and outreach from the owner himself gets better replies.

One left:
- Were the "PBN network" adverts and the spun-blog posts part of the same order as the four placed posts, or did they appear on their own? It decides what the vendor brief in Step 22 says. Default if unanswered: treat them as part of the same vendor's work.

Still waiting from earlier, and quoted against us by ChatGPT every week: a named reviewing accountant, the operator's legal name on `/about`, and more reviews (Trustpilot has a handful).

## 5. Step-by-step instructions

### Phase A: baseline and diagnosis (read-only; days 1 to 3)

**Step 1. Fix the 14 questions.**
- **Action:** Write `docs/seo/aeo/questions.md` with exactly 14 buyer questions in the article's six types, worded as people type them. Seed them from the Moz prompts where no engine names us and from the GSC long-tail list (`docs/seo/gsc-longtail-2026-11-04/`):
  - find a service (3): for example Moz #40 "who can I hire", #1, #28;
  - scenario (3): Stripe Atlas LLC (#3), dormant LLC (#14), missed years;
  - price (2): cost to hire (#26), cheapest way (#33);
  - comparison (2): doola vs Firstbase (#13), versus a CPA;
  - trust (2): "is form5472prep legit" (#27), safe to upload documents;
  - information (2): Form 5472 extension via Form 7004, late penalty.
  Two are in Spanish. Each has an id Q01 to Q14, its source and the page that should answer it.
- **Acceptance criteria:** 14 rows with id, type, exact wording, source, target URL; a header line "never reword".
- **Executor:** main session.
- **Depends on:** None.

**Step 2. Read the Nov 15 rankings when Moz posts them.**
- **Action:** In the in-app browser, read the Nov 15 rank collection and crawl (and the Nov 16 AI run if present). Append to `~/Developer/f5472-wt/moz-1115/campaign.md` and note whether the Nov 8 losses came back.
- **Acceptance criteria:** visibility, top-3/10/20, the money-term table and the list of keywords that returned or stayed lost, for Nov 15.
- **Executor:** subagent, sonnet, in-app browser only, read-only. Report under 150 words.
- **Depends on:** None (run when the data exists; do not block other steps).

**Step 3. Search Console reality check.**
- **Already done on 2026-11-15** (`~/Developer/f5472-wt/moz-1115/gsc-penalty-check-2026-11-15.md`): no manual action, no security issue; 28-day clicks 63 vs 105, concentrated on 6 pages. The rest of this step is still to do.
- **Action:** In Chrome (read-only), record in `docs/seo/aeo/gsc-check-2026-11.md`:
  - clicks, impressions, CTR and position for the last 28 days versus the previous 28, and week by week since Oct 18;
  - for the queries "form5472prep" and "form5472 prep": which page shows and at what position;
  - URL inspection of 8 pages: `/`, `/form-7004-extension`, `/compare/form-5472-filing-services`, `/services/hire-someone-to-file-form-5472`, `/services/white-label-form-5472-filing`, `/services/final-form-5472-for-dissolved-llc`, `/services/late-form-5472-filing-service`, `/services/form-5472-filing-service` (indexed or not, reason, Google-selected canonical, last crawl);
  - the Manual actions and Security issues pages;
  - the Links report's top linking sites (first screen);
  - for the five pages that lost clicks (`/irs-yearly-average-exchange-rates`, `/blog/form-5472-pro-forma-1120-signature`, `/blog/form-5472-part-v-statement-example`, `/blog/form-5472-currency-conversion-exchange-rates`, `/blog/form-5472-filed-late-never-filed`): the queries that lost clicks, position week by week since Sep 20, and whether another of our pages now shows for the same query.
- **Acceptance criteria:** the file has all five parts; any page whose Google canonical is not itself is flagged; "manual action: none" or the action text is quoted.
- **Executor:** subagent, sonnet, Chrome with `authuser=sumyeungai%40gmail.com`. No "Request indexing" in this step.
- **Depends on:** None.

**Step 4. Baseline ChatGPT runs.**
- **Action:** Run each of the 14 questions twice in ChatGPT Temporary Chat with web search on. Record in `docs/seo/aeo/tracking.tsv`: date, question id, run, named (yes/no), position, facts correct, pages cited, competitors named.
- **Acceptance criteria:** 28 rows dated the same day; a one-line summary per question.
- **Executor:** subagent, sonnet, in-app browser. If ChatGPT cannot be used, report and stop (Assumption 1).
- **Depends on:** 1.

**Step 5. Baseline AI-source traffic.**
- **Action:** Read `/admin/sources` for the last 30 days: visits, started filings and paid orders for each AI channel (`chatgpt-ai`, `perplexity-ai`, `gemini-ai`, `copilot-ai`, `claude-ai`) and for google-organic. Save to `docs/seo/aeo/traffic-baseline.md`.
- **Acceptance criteria:** one row per channel with three numbers and the date range.
- **Executor:** main session in a browser already signed in to admin; otherwise the owner supplies the numbers.
- **Depends on:** None.

**Step 6. Bing and Copilot check.**
- **Action:** Check whether the site is verified in Bing Webmaster Tools with the sitemap submitted, and read the AI Performance report if available. Add to `traffic-baseline.md`.
- **Acceptance criteria:** verified yes/no, sitemap status, Copilot citations for the last 3 months; if not verified, the owner's steps are written down.
- **Executor:** main session, browser, read-only.
- **Depends on:** None.

**Step 7. Find the empty seats.**
- **Action:** Run the article's "empty-seat finder" prompt (brief §8, Appendix 1) with our facts. Keep only "gap" and "empty" results. Cross-check each against the Moz per-prompt table (is anyone named today, and which page is cited) and against our pages. Save to `docs/seo/aeo/empty-seats.md`.
- **Acceptance criteria:** at least 10 candidate questions, each with who is cited now and where their answer falls short, whether we have a page, a proposed title and first sentence, and a verdict (rewrite / new page / skip).
- **Executor:** subagent, sonnet; in-app browser for the ChatGPT run, repo read-only.
- **Depends on:** 1.

**Step 8. Third-party fact ledger.**
- **Action:** Open every outside page that describes us or is cited instead of us, starting from the Moz list: Form5472.online's "best online services" and "filing services compared" posts, form5472.ai/providers, form5472.io's comparison, genzone.com doola alternatives, llcabroad.com doola vs Firstbase, optimizetax.io and myfreetaxamerica.com Stripe Atlas posts, wise.com's how-to, Trustpilot, site-safety review sites. For each: does it mention us, what price, turnaround and description it states, and whether that matches the site today. Save to `docs/seo/aeo/third-party-ledger.md`.
- **Acceptance criteria:** one row per page with URL, date seen, mentions us (yes/no), facts stated, match (yes/no), and what to ask for (inclusion or correction). Pages that would not open are listed.
- **Executor:** subagent, sonnet, web fetch, read-only.
- **Depends on:** None.

**Step 9. Link inventory.**
- **Action:** From Moz Link Explorer (on-screen rows only) and the Search Console Links report, group the linking domains: the four placed posts the owner ordered; PBN adverts; spun-blog network; redirect or `returnurl` parameter pages on large sites; everything else. For each group record count, typical anchor text, followed or not, and whether Search Console lists it. Save to `docs/seo/links/link-inventory-2026-11.md`. No disavow file is drafted.
- **Acceptance criteria:** the file has a row per group with counts and three example URLs each, and a line stating what share of followed links use an exact-match commercial anchor.
- **Executor:** subagent, sonnet, read-only browsing; main session reviews the file.
- **Depends on:** 3.

**Step 10. Checkpoint with the owner.**
- **Action:** Present: Search Console versus Moz (is the dip real), index status of the 8 pages, ChatGPT baseline, AI-source traffic, the page shortlist (rewrites and up to 5 new pages), wrong outside facts and the link inventory. Wait for the owner's yes on the shortlist before Phase B.
- **Acceptance criteria:** the owner's reply is recorded in the execution log.
- **Executor:** main session.
- **Depends on:** 3, 4, 5, 6, 7, 8, 9.

### Phase B: on-site changes (days 4 to 17, in two batches)

**Rule for all of Phase B: protect what ChatGPT already uses.**
- From Step 4 and the Moz citation table, list every page of ours that ChatGPT cites on the 12 prompts where it names us (the "winning pages"), and the sentences it quotes. Save as `docs/seo/aeo/protected-pages.md` before any edit.
- On a winning page: add, do not remove. Keep the quoted sentences, the price lines, the headings and the URL exactly as they are; new text goes above or below them.
- Ship in two batches a week apart. Batch 1: Steps 11, 12, 12a, 16, 17. Batch 2: Steps 13 and 15. Run the Step 4 questions again between the batches.
- Revert rule: if a question we were winning at baseline does not name us in both runs of two weekly checks in a row, and the page it cited was edited, revert that page's edit and note it.

**Step 11. State the "no" facts.**
- **Action:** In `src/lib/faq.ts` (shown on `/faq` and `/pricing`) and `src/lib/llms.ts`, add short question-and-answer lines for the claims engines get wrong:
  - "Is Express ready in 24 hours?" No; ready to sign in under 3 days, 7 days a week (calendar days, not business days).
  - "Does Form5472 Prep cost $99?" No; the $99 is only for each additional past year.
  - "Is Form5472 Prep software?" No; a done-for-you service: our team prepares the forms and a tax accountant who holds an IRS PTIN reviews them.
  Prices and turnarounds come from `src/lib/pricing.ts`.
- **Acceptance criteria:** the three questions render on `/faq` with FAQ schema equal to visible text; `/llms.txt` contains them; `faq.test.ts` and `llms.test.ts` pass with one new assertion each.
- **Executor:** subagent, sonnet. Owned files: `faq.ts`, `llms.ts`, their tests.
- **Depends on:** 10.

**Step 12. Three targeted fixes from the Moz read.**
- **Action:**
  - `/compare/form-5472-filing-services`: add a summary at the top that names Form5472 Prep with its price, turnaround, what is included and what it is not, before the table. AI Mode cites this page on "doola vs Firstbase" without naming us.
  - `/blog/form-5472-extension-vs-late-filing` ranks #2 for "form 7004 extension form 5472": add a first-screen sentence and link to `/form-7004-extension` with the anchor "Form 5472 extension (Form 7004)" and the price token.
  - Home page: one sentence in the first screen that says done-for-you, prepared by our team and reviewed by a tax accountant who holds an IRS PTIN (AI Mode calls us "software"). No title or H1 change.
- **Acceptance criteria:** each change is visible in the first 150 words of its page; the compare summary's prices come from `pricing.ts`; existing page tests pass.
- **Executor:** subagent, sonnet. Owned files: the compare route, that one blog post, `src/app/(marketing)/page.tsx`.
- **Depends on:** 10.

**Step 12a. Recover the how-to pages that lost clicks.**
- **Action:** For each of the five pages in Step 3, compare the page as it was on Oct 17 with today (`git log -p` on its file): title, first paragraph, headings. Then act on what Step 3 shows:
  - if another of our pages took the query, link from that page to the right one with the query as the link text;
  - if a Nov 4 edit changed the opening or a heading the lost query matched, restore that wording while keeping the correct facts;
  - if the loss is only seasonal (queries fell for everyone after Oct 15), change nothing and note it.
  No title changes before Nov 25.
- **Acceptance criteria:** a table in the execution log with one row per page: cause found (cannibalised / our edit / seasonal / unknown), what was changed or "no change", and the page's position a week later from Step 23.
- **Executor:** subagent, sonnet, read-only diagnosis first; main session approves each change; owned files are those five pages only.
- **Depends on:** 3, 10.

**Step 13. Answer-first openings on the money pages.**
- **Action:** Using the article's rewrite prompt as the template (brief §8, Appendix 2), rework the opening of the 12 `/services/*` pages, `/form-7004-extension`, `/pricing` and the 7 provider guides (doola, Firstbase, Clemta, StartGlobal, Zenind, Northwest, Stripe Atlas). Each opening answers, in order: can it be done; how, in how many steps and how long; price and that there is no subscription; what it does not cover (no tax advice, no multi-member or corporation returns, no IRS representation). Provider guides say honestly when the provider's own add-on or a DIY filing is enough. Only facts already on the site; no "best" or "cheapest"; no title, H1 or URL changes.
- **Acceptance criteria:** a script prints each page's first 120 words and a yes/no for the four parts, all yes; guards pass (`landing-pages`, `services-pages`, `rcs-claim-guard`, `landing-prices`, title and meta length); the script output is saved in the log.
- **Executor:** two subagents on disjoint files: opus for `services-pages.ts` and the service routes; sonnet for the provider guides in `landing-pages.ts`, `/pricing` and the 7004 page. Each brief carries the house copy rules.
- **Depends on:** 10.

**Step 14. Removed in version 3.** The owner declined publishing first-hand numbers and a review-method page. The step number is kept so later numbers do not shift.

**Step 15. Up to 5 pages for unanswered questions.**
- **Action:** For each question the owner picked at Step 10, write one page whose title is the question and whose first paragraph is the four-part answer. One question per page. Tax facts link to irs.gov.
- **Acceptance criteria:** each page builds, has a question heading with a 40 to 60 word answer, FAQ schema, at least 3 internal links in and 3 out, a URL within 75 characters, and passes the blog guards.
- **Executor:** subagent, opus, one lane.
- **Depends on:** 10.

**Step 16. Trust and safety page.**
- **Action:** Upgrade `/security` to answer "is it safe to upload my documents": what is stored, where, who can see it, how long (link `/data-retention`), how to ask for deletion, which processors handle payment, storage, email and fax (named), and that only the client signs. Add the short answer to `/about`.
- **Acceptance criteria:** a question heading with a 40 to 60 word answer; each processor named; facts match `/privacy` and `/data-retention` read side by side; no certification claimed that we do not hold.
- **Executor:** subagent, sonnet. Owned files: the `/security` and `/about` routes.
- **Depends on:** 10.

**Step 17. Make the Terms match the partner page.**
- **Action:** The owner confirmed we do not contact a partner's clients. Find every line in `/terms` (and anywhere else, including email templates sent to partners) that says or implies Form5472 Prep identifies itself to the partner's client, and reword it to the live offer: the partner sends the intake and signing links, our emails go to the partner only, the partner's name shows in intake and on the fax receipt, client pages stay on form5472prep.com, and the client signs their own return. Show the owner the exact Terms text before it ships.
- **Acceptance criteria:** `/partners`, `/services/white-label-form-5472-filing` and `/terms` give the same answer to "does the client hear from Form5472 Prep"; a grep for "processing provider" in public copy returns only wording the owner approved; the owner's approval of the Terms text is in the log.
- **Executor:** main session drafts the Terms wording; subagent, sonnet, applies it.
- **Depends on:** 10.

**Step 18. Ship.**
- **Action:** Review diffs; run the related tests, `tsc`, a production build and a read-only Codex review; fix findings; `git push origin main`; verify one page per step live; IndexNow for changed URLs; Search Console indexing requests for the pages Step 3 found unindexed, then the top changed pages (about 10 a day); copy the Moz and baseline files into `docs/seo/`; session log and `REPO-STATE.md` line.
- **Acceptance criteria:** tests and build green; Codex findings resolved or answered; live checks pass; IndexNow HTTP 200; session log committed.
- **Executor:** main session.
- **Depends on:** 11, 12, 12a, 13, 15, 16, 17 (run once per batch).

### Phase C: off-site and links (drafts by me, actions by the owner; days 4 to 25)

**Step 19. One listing kit.**
- **Action:** Write `docs/seo/aeo/listing-kit.md`: 25, 50 and 150 word descriptions, price lines, what is included, what it is not, contact, logo path.
- **Acceptance criteria:** a script greps the kit's prices and turnarounds against `pricing.ts` and reports a match.
- **Executor:** main session.
- **Depends on:** 8.

**Step 20. Ranked targets and drafts.**
- **Action:** Build `docs/seo/aeo/targets.md` with at least 20 places, ranked by: an AI engine cites it for one of our 14 questions, real traffic, relevance.
  - Comparison and "best of" pages AI already cites (from Step 8): an inclusion or correction email drafted for each.
  - Profiles and directories (for example Crunchbase, Product Hunt, AlternativeTo, SaaSHub, founder resource lists for non-US owners): the exact text to paste.
  - Answers and articles: 5 drafted answers for the Reddit threads AI cites (r/stripe, r/tax) and one article for Medium or dev.to, each disclosing the affiliation.
  Pace: 2 to 5 a day at most.
- **Acceptance criteria:** 20 rows with URL, why it is listed, what to submit and status (drafted / sent by owner / live / declined); every draft uses the kit wording.
- **Executor:** subagent, sonnet, for research; main session reviews drafts.
- **Depends on:** 4, 8, 19.

**Step 21. Corrections.**
- **Action:** For each wrong outside fact in the ledger, draft a short correction request (page, wrong line, right line). The owner sends them.
- **Acceptance criteria:** one draft per wrong fact; ledger status updated when sent and again when the page changes.
- **Executor:** main session.
- **Depends on:** 8.

**Step 22. Brief for the link vendor.**
- **Action:** Write `docs/seo/links/vendor-brief.md`, one page the owner can send to whoever places the posts: use the brand name or the bare URL as link text for most links (exact-match phrases such as "best form 5472 filing service" for at most 1 in 5); place only on sites about tax, business formation, startups or expat life (not gaming or image sites); no more than 2 to 4 posts a month; prefer pages that AI engines already cite (list from Step 8); ask for a "sponsored" label where the site requires one. Add a short note on why: Google's link-spam rules target unlabeled paid posts with keyword links on unrelated sites, and Moz's higher score is not Google's. If Step 3 found a manual action, this step instead prepares a disavow file for the owner to upload and moves ahead of Phase B.
- **Acceptance criteria:** the brief exists, fits one page, and names at least 10 suitable target sites from Step 8; the log records whether the owner sent it.
- **Executor:** main session.
- **Depends on:** 3, 8, 9.

### Phase D: weekly loop and decision (weeks 2 to 5)

**Step 23. Weekly check.**
- **Action:** Each week for 4 weeks: repeat Step 4 (same questions, 2 runs); read the new Moz AI run and rank collection; read `/admin/sources`; re-inspect in Search Console any of the 8 pages not yet indexed and re-read the Manual actions page. Append to `tracking.tsv` and write a 10-line note: what moved, any wrong fact, any drop.
- **Acceptance criteria:** 4 dated notes; 28 new tracking rows each week.
- **Executor:** subagent, sonnet, started by the owner's "run the weekly check" (or a scheduled task if the owner wants one).
- **Depends on:** 4, 18.

**Step 24. Week-5 review and stop-loss.**
- **Action:** Per question group, compare baseline to week 5: mention rate, position, facts correct, AI-source visits, started filings, orders; and for the 8 pages, index status and Moz rank. Apply the article's rule: where pages are live, outside mentions exist, and the question still never names us while AI visits are flat, stop spending time on that group; continue the groups that moved.
- **Acceptance criteria:** a one-page report with a continue/stop verdict per group and the numbers behind it; plan status set to COMPLETE.
- **Executor:** main session.
- **Depends on:** 23.

## 6. Risks and rollback
| Risk | Likelihood | Impact | Mitigation | Rollback |
|---|---|---|---|---|
| Reacting to a Moz dip that is noise | Medium | Medium | Step 3 checks Search Console first; no title changes before Nov 25 | None needed |
| The paid link campaign leads to a Google penalty or is simply ignored | Low to medium | High | Step 3 reads Manual actions now and Step 23 re-reads it weekly; Step 22 changes how future posts are placed | Disavow file and reconsideration request (owner) if an action appears |
| ChatGPT answers swing day to day | High | Medium | 2 runs per question, weekly, judge the 4-week trend | None needed |
| An edit removes wording ChatGPT was citing and we lose a question we were winning | Low | High | Protected-pages list; add-only edits on winning pages; two batches with a re-test between | Revert that page (`git revert`), per the revert rule |
| Rewriting openings hurts pages that rank | Low to medium | Medium | Keep titles, H1s and URLs; change the opening only | `git revert` that page's change |
| A new answer states a tax fact wrongly | Low | High | IRS source per fact; Codex review; copy rules in every brief | Revert, correct, redeploy |
| Changing Terms wording creates a legal mismatch | Low | High | Owner approves the exact text (Step 17) | Revert the Terms commit |
| Outside listings go stale when prices change | Medium | Medium | The kit is the one source; the ledger lists every place | Update each listing from the ledger |
| No effect after 5 weeks | Medium | Low (time only) | Stop-loss in Step 24 | Stop |

## 7. Estimates
| Step | Effort |
|---|---|
| 1, 2, 5, 6, 17, 19, 21, 22 | S each |
| 3, 4, 7, 8, 9 | M each |
| 11, 12, 12a, 16 | S each |
| 13 | L (21 pages) |
| 15 | M to L (up to 5 pages) |
| 18 | M |
| 20 | M |
| 23 | S per week, 4 weeks |
| 24 | S |

What could blow this up: a manual action in Search Console (Step 22 jumps the queue and Phase B waits); ChatGPT not usable in the in-app browser; the owner's time for Phase C; many pages where the 60-word rule fights the four-part opening.

## 8. Changelog
v1 (2026-11-15): initial plan from the X Article.
v2 (2026-11-15): combined with the Moz read of the same day at the owner's request. Added the Search Console reality check (Step 3), link inventory and disavow draft (Steps 9 and 22), three targeted fixes from Moz (Step 12), partner page versus Terms (Step 17), the Nov 15 re-read (Step 2); widened the goal from AI answers to rankings and links; seeded the questions and targets from the Moz per-prompt and citation tables; added open questions 1 and 4; added the no-title-change rule until Nov 25.

v3 (2026-11-15): owner's answers applied. Placed posts were ordered by the owner, so the disavow draft is replaced by a link inventory (Step 9) and a vendor brief (Step 22), with a disavow only if Google takes a manual action. Step 14 removed (no first-hand numbers, no method page). Step 17 now corrects the Terms to match the partner page. Off-site mode decided: I draft, the owner sends.
v4 (2026-11-15): Search Console checked at the owner's request: no penalty; clicks 63 vs 105 over 28 days, concentrated on six pages. Added the finding to the status table, marked the done part of Step 3, added query-level diagnosis for the five pages, and added Step 12a to recover them.
v5 (2026-11-15): owner asked about the risk of losing ChatGPT placement. Added the protected-pages rule, add-only edits on pages ChatGPT cites, two shipping batches with a re-test between, and a revert rule.

## 9. Execution log
2026-11-16 (approved v5 by owner: "work on everything, use codex to build as much as possible")
- Step 1 done: docs/seo/aeo/questions.md (14 questions).
- Step 2 done: Moz 11-15 ranks (visibility 1.66%, top-3/10/20 14/45/62; filing service #11, dissolved #5, late #8, form 5472 extension #8); AI 11-16 run not posted.
- Step 3: penalty check done 11-15 (none). Remaining parts BLOCKED: Claude in Chrome not connected.
- Step 4 done: ChatGPT logged-out, 28 runs; named 7/14 then 8/14; no wrong facts (docs/seo/aeo/tracking.tsv, chatgpt-baseline-2026-11-16.md, protected-pages.md).
- Step 5, 6 BLOCKED: /admin and Bing not signed in in the in-app browser.
- Step 7 done (empty-seats.md), Step 8 done (third-party-ledger.md: 4 of 17 mention us, 3 with wrong/missing facts), Step 9 Moz half done (links/link-inventory-2026-11.md).
- Step 10: owner pre-approved execution; shortlist taken from empty-seats (no translated pages).
- Batch 1 SHIPPED (main 6b17a93): Steps 11, 12, 16; add-only on protected pages (0 removed lines); vitest pass, tsc 0, build 589/589, Codex review nothing material; live-verified; IndexNow 200.
- Step 17: no change needed — current /terms and /partners never say we contact partner clients; ChatGPT quotes an older version.
- Batch 2 BUILT, HELD on branch seo/aeo-batch2 (4892a32, c2066d2): Steps 13, 15. Service pages and provider guides add-only above unchanged originals (first lane rewrote intros on ranking pages and repeated a block on 12 pages — sent back); 7004 timely-filing wording; deadline + CP15 sections; new is-form5472-prep-legit post. vitest 2238/2238, tsc 0, build 591/591, Codex findings fixed.
- Phase C drafted (not sent): listing-kit, 32 targets, outreach-drafts (Codex fact-check fixes applied), corrections, links/vendor-brief.
- Step 12a, 18 (GSC requests), 22 GSC half: waiting on Chrome.
- Next: re-run Step 4 questions on or after 2026-11-20; if no protected question lost, merge seo/aeo-batch2 to main.
