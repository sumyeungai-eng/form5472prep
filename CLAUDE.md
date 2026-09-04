# Form5472 Prep — Claude Update

Last updated: 2026-09-05

This note records production blog work so a future Claude session can continue without redoing or accidentally reverting it. Read `HANDOFF.md` and `REPO-STATE.md` first; this file supplements them with the content-release history and current live verification.

## September 5 full-blog production release

- Canonical source: `/Users/sumyeung/Documents/Codex/form5472`
- Canonical branch: `claude/hk-tax-filing-website-m97q8g`
- Partner/ITIN/EIN content commit: `cb02def` (`Publish partner, ITIN, and EIN guides`)
- Release commit: `f1fc2dc` (`Publish remaining scheduled Form 5472 guides`)
- Production deployment: `dpl_Aofp7ybMJXPmr7bg7Y9awiytjeY2`
- Production URL: https://www.form5472prep.com
- Vercel generated 193 application routes, including all 105 file-backed blog routes.
- The production database had 39 migrations and no pending migrations.

All 105 Markdown posts are now immediately published. There are no `draft: true` posts and no future `publishAt` schedules. Every post has a matching WebP image under `public/blog/`.

This deployment restored 15 posts that had returned 404 after a different production deployment replaced the canonical artifact:

- 5 partner and white-label guides;
- 5 ITIN sales guides; and
- 5 EIN sales guides.

It also brought these four previously scheduled guides forward to September 5, 2026:

1. `form-5472-recordkeeping-checklist`
2. `form-5472-ftin-reference-id-foreign-address`
3. `multiple-related-parties-form-5472`
4. `final-form-5472-closing-foreign-owned-llc`

Post-deployment verification completed on the public domain:

- 105/105 article pages returned HTTP 200;
- 105/105 WebP images returned HTTP 200;
- sitemap included all 105 posts;
- RSS feed included all 105 posts;
- `/blog` returned HTTP 200;
- the EIN application contained the owner-date-of-birth field; and
- an empty request to `/api/applications/ein/checkout` returned the expected HTTP 400, confirming that the canonical application build—not the stale duplicate checkout—is live.

Required release gates passed: Prisma Client generation, TypeScript, all 150 Vitest tests, the local production build, and the Vercel production build.

**Critical:** Deploy only from the canonical folder above. `REPO-STATE.md` documents the stale duplicate checkout and the production regression caused by deploying from it.

## Historical release: 2026-08-19

- Live site: https://www.form5472prep.com
- Blog: https://www.form5472prep.com/blog
- Fifteen new SEO/GEO/AEO-focused guides were published on 2026-08-19.
- The production deployment completed successfully on Vercel and all 15 new URLs and image assets returned HTTP 200.
- Content-release commit: `8facd95` (`Publish 15 GEO-optimized Form 5472 guides`)
- Follow-up fix: `041beac` (`Remove internal briefs from published guides`)
- Both commits are pushed to `origin/main`.

## New blog posts

### Owner-country guides

1. `form-5472-australia-residents-us-llc`
2. `form-5472-germany-residents-us-llc`
3. `form-5472-france-residents-us-llc`
4. `form-5472-singapore-residents-us-llc`
5. `form-5472-netherlands-residents-us-llc`

### State-compliance guides

6. `delaware-llc-foreign-owner-tax-filing`
7. `california-llc-foreign-owner-tax-filing`
8. `florida-llc-foreign-owner-tax-filing`
9. `texas-llc-foreign-owner-tax-filing`

### High-intent filing guides

10. `form-5472-reasonable-cause-letter`
11. `how-to-fax-form-5472-irs`
12. `pro-forma-form-1120-foreign-owned-llc`
13. `form-5472-currency-conversion-exchange-rates`
14. `form-5472-foreign-corporate-owner`
15. `form-5472-change-of-ownership`

The Markdown source files are under `content/blog/`. Each slug has a matching 1280×720 optimized WebP image under `public/blog/`.

## Content standards used

Each new article includes:

- a 40–60 word answer-first opening;
- current primary-source links to the IRS, relevant state agency, OECD, or national tax authority;
- an early and closing conversion link to `/start`;
- at least one original decision table, checklist, framework, or workpaper;
- at least five concise FAQs;
- internal links to related Form5472 Prep guides;
- visible publication and update dates; and
- a unique editorial image and descriptive alt text.

The query-selection and measurement log is stored at `docs/blog-log.csv`.

## Blog implementation changes

`src/lib/blog.ts` now contains:

- descriptive alt text for all 15 new images; and
- `extractHowTo()`, which extracts the first substantial numbered process from a question-form “How…” section.

`src/app/(marketing)/blog/[slug]/page.tsx` now emits one connected JSON-LD `@graph` containing:

- `BlogPosting`;
- `Organization`;
- `BreadcrumbList`;
- `FAQPage` when FAQs are present; and
- `HowTo` when an eligible numbered process is present.

Do not split these back into unrelated JSON-LD scripts without a specific reason.

## Important publishing gotcha

The initial drafts contained internal planning notes formatted as HTML comments such as:

`<!-- GEO/AEO brief: ... -->`

The current React Markdown setup exposed those comments as visible text. All 15 notes were removed in commit `041beac` and the correction was redeployed. Do not put editorial notes or hidden SEO briefs inside published Markdown bodies. Keep planning metadata in `docs/blog-log.csv` or another non-rendered file.

## Hybrid blog behavior

The blog merges file-backed Markdown with rows from the production `Post` table:

- a database row wins when its slug matches a file;
- a deleted database row is a tombstone that hides the matching file; and
- the site falls back to files if the database is unavailable.

There are 105 Markdown files in the canonical repository as of 2026-09-05. Database rows still override matching files, and database tombstones can hide file-backed posts; the September 5 verification confirmed that all 105 current file-backed slugs are live.

## Verification completed

- `npx tsc --noEmit`: passed
- `npm run test`: 112 tests passed
- `git diff --check`: passed
- local Next.js production build: passed
- Vercel production build: passed, 126 routes generated
- production database migration step: no pending migrations
- all 15 new article pages: HTTP 200
- sampled JSON-LD: `@graph`, `FAQPage`, `HowTo`, and `HowToStep` present
- exposed `GEO/AEO brief` text: absent from production after the fix

## Workspace caution

Two unrelated user files were intentionally left untracked and untouched:

- `IMG_2643_Hiu_Tong_Yeung.png`
- `IMG_2644_Hiu_Tong_Yeung.png`

Do not add, modify, or delete them unless the user explicitly asks.
