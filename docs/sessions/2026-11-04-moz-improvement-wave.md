# 2026-11-04: Moz re-read → improvement and fix wave

The owner asked to "read every pages updates about our site on moz and plan a improvement and fix". Moz was read in the Claude in-app browser and GSC in Chrome (sumyeungai@, browser 2).

## Ownership
| Checkout / branch | Owns |
|---|---|
| `~/Developer/f5472-wt/moz-1104-fix`, branch `seo/moz-1104` (from `7a3be4b`) → merged to `main` | every file in this wave (list in commit `5438793` and `2d4ed11`) |
| `~/Developer/f5472-wt/moz-1104/` (outside the repo) | raw agent outputs: Moz readouts, `gsc-inspect-2026-11-04.md`, lane reports, Codex review, build logs |
| `~/Documents/Codex/form5472` (main checkout) | NOT touched. It has another session's dirty files (`blog.ts`, `blog.test.ts`, OG image, untracked docs/images); leave them |

## What shipped
- **`5438793` seo wave:**
  - Footer links the country hub, `/irs-form-5472` and `/compare`.
  - The hub lists all digital-nomad posts (`NOMAD_GUIDE_SLUGS`, test-enforced), and llms.txt lists the hub.
  - `/compare` gains a provider-guides block (7 competitor guides).
  - Exact-anchor links point to the intended service pages.
  - `/form-7004-extension` is retitled "Form 5472 Extension (Form 7004)" with a ≤60-word capsule.
  - Question H2s added:
    - "Who is required to file Form 5472?";
    - "Where do I send Form 5472?";
    - "How do I fill out Form 5472 online?";
    - "When is Form 5472 due in 2026?".
  - Copy changes:
    - "wizard" removed from public copy (57 → 0, except one code comment);
    - "generated automatically" now reads staff-prepared and PTIN-reviewed;
    - the cost capsule says "done-for-you, not DIY software" and includes fax delivery.
  - Blog changes:
    - 8 outcome promises reworded;
    - 14 first-answer capsules cut to ≤60 words;
    - France and Switzerland titles now say "<Country> residents".
  - Topic-hub intros for deadline, penalty and late-filing (`TOPIC_HUB_INTROS`, page 1 only).
  - The plan and data are saved under `docs/seo/`.
- **`2d4ed11`:** after Codex review, three guides now say review comes before signing, and the PTIN wording is standardised.
- **Verified:**
  - targeted vitest across llms, blog, blog-countries, blog-tags, TopicHubView, landing, services, faq, rcs/cp guards and seoSlug: all pass;
  - `tsc --noEmit`: 0 errors;
  - `next build`: passed, 576/576 static pages (the first two attempts failed for local reasons: a static-generation timeout while the machine was loaded, then a DNS failure for Google Fonts);
  - Codex review (gpt-6.1-sol, low): 2 findings, both fixed.

## Key findings (the data is in `docs/seo/moz-data-2026-11-04/`)
- **Visibility:** 1.12% (from 1.23%). Form5472.online is at 1.65% and Firstbase at 1.26%. DA is 14 with 84 linking domains, still all PBN adverts.
- **GSC (11-04):**
  - All 14 at-risk country and niche posts are indexed. They lose to `/blog/page/7`, which Google has not yet recrawled since it became noindex.
  - Not indexed:
    - `/form-7004-extension` (discovered, never crawled);
    - `/services/white-label-form-5472-filing` (discovered);
    - `/compare/form-5472-filing-services` and `/services/hire-someone-to-file-form-5472` (Google-selected canonical is still `747live.bet` from early-October crawls; the live HTML is clean).
- **AI:** ChatGPT 27.5%, AI Mode 7.5%, Gemini 10%. Gemini repeats "Express within 24 hours" and "~$99 wizard". Our own copy is now clean, so the 24h claim comes from third parties.

## Contracts for future editors
- Pagination stays noindex,follow. Do not re-index listing pages; they cannibalise their own posts.
- Public copy never says "wizard". Use "guided intake form".
- Process order everywhere: intake → accountant review → customer checks and signs → fax → receipt.
- The cost capsule is limited to 60 words (faq.test) and must keep "done-for-you, not DIY" plus fax delivery.
- Topic hubs: intros live in `TOPIC_HUB_INTROS` (`blog-tags.ts`) and render on page 1 only.
- Country hub: a new digital-nomad post must be added to `NOMAD_GUIDE_SLUGS`, or `blog-countries.test` fails.

## Open
**Owner-gated:**
- named reviewer and credentials (AI engines quote "couldn't establish reviewer identity");
- more independent reviews (Trustpilot has 1);
- earned press links;
- confirm whether anyone placed the nerdbot.com link (DA 51, anchor "form5472 preparation");
- disavow, legal name and sameAs, home claims, money-back guarantee vs Terms §6, hire-someone 301, off-topic car posts;
- DIIRSP in calculators and faq (D8b).

**Follow-ups:**
- GSC request-indexing list (≈10/day): 7004, white-label, compare, hire-someone, then irs-form-5472, file-form-5472, form-5472-deadline, by-country, France, Switzerland.
- Re-read Moz after the 11-08 ranks and crawl and the 11-09 AI run. Check whether the country posts replace `/blog/page/7` and whether the money pages get a ranking keyword.
- The Spain and Switzerland posts are about half the length of the other country posts; expand them with verified country facts.
- Still open from the re-audit:
  - 27 posts without question H2s (partner-program, company-car and state posts);
  - 19 pages with ≥3 visible Q&As but no FAQPage (EIN/ITIN posts, /services, /press);
  - 1,027 blog-card thumbnails with `alt=""`.
- Local `next build` can time out on `/blog/topics/*/page/N` when the machine is loaded, because there is no local DB and Prisma retries. Re-run it on an idle machine.

## Lane notes
- **Lanes:** A (sonnet) handled links, B (opus) money pages and copy, C (sonnet) blog hygiene. They worked on disjoint files in one worktree with no lane commits; the architect committed.
- **Moz readers:** they opened stray Chrome tabs before the "in-app browser" correction (ids 639181727/733/730/743). Those tabs could not be closed from the session.

## Wave 2 — "finish the remaining" (branch `seo/moz-1104b` → main)
- **`3c8e849`:**
  - 21 posts gained 80 question H2s with 40–60-word answers. The posts are the 9 digital-nomad cities, the 4 partner-program/white-label posts, and the crypto, personal-expenses, noncash, estimates, royalties, Oregon and Washington posts.
  - Blog FAQPage fallback: `extractQuestionHeadings()` in `blog.ts` uses question H2s plus their first paragraph (≥2 required) when a post has no FAQ section. A colon lead-in carries its list. 12 posts gain FAQPage this way.
  - `/services` and `/press` emit FAQPage from the data they render. Tests assert that schema text equals visible text.
  - The Spain and Switzerland posts are expanded to about 2,100 words and cite BOE, ESTV and IRS sources. They use the 2025 IRS yearly averages from `tools/exchange-rates/data.ts` (EUR 0.886, CHF 0.831).
- **`e8bc584`, Codex review fixes** (verified: vitest 2215/2215, tsc 0 errors, build 576/576):
  - FAQ extraction ignores code fences.
  - `stripMarkdown` strips HTML, entities, strikethrough and reference links (shared with `extractFaqs`/`extractHowTo`).
  - The Spain Modelo 720 real-estate row now says "property outside Spain".
  - "your clients see no prices" was removed from the white-label post.
- **GSC (after 79ea9d8):** indexing requested for all 10 priority URLs (table in `~/Developer/f5472-wt/moz-1104/gsc-inspect-2026-11-04.md`).
  - Live test: `/compare` and `/services/hire-someone…` are "available to Google" with a self user-canonical. Google's canonical is re-decided after indexing; it was still 747live.bet before the request.
  - The white-label page was "unknown to Google".
  - GSC worked in Chrome Browser 1 via `authuser=sumyeungai%40gmail.com`.
- **Deliberately not changed:**
  - Blog-card thumbnails keep `alt=""`. They are decorative next to the title text, so filling them would duplicate it for screen readers.
  - The "spaced brand variant" audit hit is a false positive: it matched "Form 5472 Preparer".
  - The /blog and topic-hub "Q&A" are post-card titles, so they get no FAQPage.
  - The 3 company-car posts are owner-gated.
- **Follow-ups:**
  - `extractHowTo` and `extractH2Headings` don't yet ignore code fences.
  - `ein-application-checklist-foreign-owned-llc` and `itin-caa-vs-mail-vs-tac` have only one question H2 each, so they get no FAQPage.
