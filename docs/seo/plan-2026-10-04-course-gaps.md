# Compact Keywords course → form5472prep.com gap plan (2026-10-04)

Source: the full course transcripts (20 files), extracted into `course-notes-A..E.md`
(A: intro/characteristics/technical; B: IA, BOFU template 5.2, On-Page Grader 5.3,
image SEO, trust; C: research 7.x, layouts 8.x; D: timelines, stuck pages, video,
Reddit, strategy 13; E: link building 12.x). Diffed against the live repo inventory.

The 2026-10-01 pass already shipped the core method (services hub + 8 BOFU pages,
titles ≤60, canonicals, sitemap dates, IndexNow, AI-bot allow list, llms.txt).

## Wave 1 — code (this session)

| Lane | Branch / worktree | Course rule it implements |
|---|---|---|
| schema+linking | `seo-schema` | One Organization entity (@id) everywhere (entity clarity for AI); no dead SearchAction; real dates; service pages get visible "last reviewed" + HowTo + outbound IRS links (B: dofollow outbound to authority helped rank); BOFU pages linked from content (B/C: internal links + footer one-click to money pages); related posts by topic, visible on mobile |
| new pages | `seo-pages` | `/press` press kit linked in footer as "Press kit" (E 12.2); `/compare` alternatives hub over the 7 existing provider pages (B/C: alternatives hub beside services hub) |
| embeddable tools | `seo-embed` | Embed/share for free calculators with a "powered by" link (C/E 12.4: embeddable tool = passive links) |
| off-site kit | docs only | Expert-quote template, podcast guest profile, keyword-language directory blurbs, press-release draft, Reddit answer rules, Meetup blurb (E, D) |

## Wave 2 — after Wave 1 lands
- Audience / decision-maker BOFU pages (C #1: "for accountants / formation agents / Amazon sellers…") — only after Moz SERP Page-Score check per the method.
- Image SEO on service pages: one keyword-named hero image each, keyword in first alt only (the last Moz "hurting" factor).
- Statistics / facts page (E 12.4 linkable asset) — every figure must cite irs.gov/eCFR.

## Owner-gated (cannot be done from code)
- GSC: Domain + URL-prefix properties, submit sitemap, request indexing; positions 6–13 → retarget (Dominic procedure). Chrome blocks search.google.com for the agent.
- Bing Webmaster Tools: verify, submit sitemap, use Backlinks for competitor link lists.
- Named, real reviewer/author with verifiable credentials (YMYL E-E-A-T) — no invented people.
- Postal address / phone (NAP) once the legal entity address is settled.
- Directory, Product Hunt, Featured.com / Source of Sources, matchmaker.fm, Reddit, Meetup accounts.
- Real reviews → only then Review/AggregateRating markup.
- Apex 307→308 in Vercel Domains.

## Deliberately skipped
- State / nationality clone pages (playbook trap; YMYL thin-content risk).
- Top-of-funnel "what is Form 5472" expansion (D/A: TOFU traffic is what the 2024 updates cut; blog already has 189 posts).
- Title format change to "keyword | benefit | brand" site-wide — A/B one page first (conflicts with the ≤60 rule), logged in `optimisation-log.csv`.
