# 2026-10-06 — fixes from the Moz campaign (Form5472 Prep, id 3235940)

**Checkout/branch:** worktree `~/Developer/f5472-wt/mozfix`, branch `feat/moz-fixes` → `main`.
**Owned files:**
- **Blog tags:** `src/lib/blog-tags.ts` (+test), `src/app/(marketing)/blog/{page,[slug]/page,topics/page,topics/[tag]/page}.tsx`
- **Service pages:** `src/lib/services-pages.ts` (+test)
- **FAQ:** `src/lib/faq.ts` (+test)
- **Blog post:** `content/blog/final-form-5472-closing-foreign-owned-llc.md`
- this log

## Moz data read (built-in browser, trial ends ~2026-10-07)
- **Campaign:** DA 10, search visibility 10.29%, 7/46 keywords in the top 10, 154 external links. Competitors: Form5472.online 1.52% (474 links), Firstbase 1.10%, doola 0%.
- **Rankings:** #1 for pro forma 1120 filing service, form 5472 fax filing service, form 5472 preparer and form 5472 preparation service. #3 for 1120 and 5472 filing service, #4 form 5472 filing service, #6 final form 5472 for dissolved llc, #11 late form 5472 filing service. Eight audience keywords are 51+ (pages are new and probably not indexed yet). 21 guide/tool/branded keywords are not collected until the next update on Oct 11.
- **Wrong page ranking:** several keywords rank with a different page than the dedicated one (fax→late page, preparer→pro-forma page, dissolved→/faq).
- **Site crawl (658 pages, 428 issues):**
  - **Meta noindex (378):** about 300 thin `/blog/topics/*` pages that are deliberately noindex (<7 posts) plus `/start?src=…` pages that are deliberately noindex. Not bugs.
  - **URL too long (47):** blog slugs over 75 characters. Left alone: renaming indexed URLs risks rankings, and the 75-character rule is Moz's guideline, not a Google rule.
  - **Temporary redirect (2) / chain (1):** stale. The apex is already 308 (verified with curl). The http→https→www two-hop is Vercel's default.

## What shipped
- **Topic links:** chips and lists link only to indexable topic hubs (`indexableTagSlugs`). Thin topics render as plain text, so posts stop sending ~300 internal links to pages Google ignores.
- **Keyword coverage:**
  - "form 5472 preparation service" on /services/form-5472-preparer.
  - "1120 and 5472 filing service" on /services/form-5472-filing-service.
  - "form 5472 for CPAs" on /services/form-5472-for-accountants (title and H1). That page also stays the single owner of "outsource form 5472 preparation"; it was deliberately NOT added to hire-someone, to avoid our own pages competing.
- **Reinforcement links:**
  - The late-filing page now links to the fax-filing and preparer pages.
  - The FAQ entry about dissolved LLCs links to the dissolved-LLC service page.
  - The final-return blog post links to the dissolved-LLC service page.
- **Sitemap dates:** `lastModified` is 2026-10-06 only on pages whose content changed.
- **Verified:** vitest 1865/1865, tsc clean, `next build` passes.

## Open (owner)
- **GSC:** request indexing for the 8 audience/situation service pages that rank 51+.
- **Moz trial:** check the Oct 11 rankings update for the 21 uncollected keywords. The paid plan starts in 2 days; cancel or keep it.
- **Link building:** off-site kit at `docs/seo/offsite-kit-2026-10-04.md`. DA 10 vs Form5472.online's 474 links is the main gap.
