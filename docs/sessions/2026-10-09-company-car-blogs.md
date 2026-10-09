# Claude handoff — company-car series

## Ownership and scope

Working checkout: `/Users/sumyeung/.codex/worktrees/nomad-location-blogs/form5472`, branch `codex/company-car-blogs-20261009`, from production `5116a7c`. Original canonical checkout is dirty on local `main` behind production; none of its modified/untracked blog, email, image or wizard files were edited or committed.

Release checkout: `/Users/sumyeung/Developer/f5472-wt/company-car-release-20261009`, an independent SSH clone with its own `main`. It shares only the ignored dependency directory for local diagnostics; it does not share Git branch references with the canonical checkout. Baseline diagnostics ran at unchanged `5116a7c` before scoped cherry-picks.

Owned files: four new company-car Markdown articles, four corresponding WebP covers, four artwork configurations and a new vehicle motif in `scripts/render-blog-artwork.mjs`, four `ARTWORK_ALTS` entries in `src/lib/blog.ts`, the batch verification script, the research brief/claim ledger and this handoff.

User requested a few articles covering company cars, deductibility, electric cars and VAT. Four guides written for the existing foreign-owned US LLC audience; VAT article explicitly UK-only. US-tax skill used for entity and nonresident deduction boundaries, sales-blog skill used for intent, primary authority research, worked examples, scope-fitting CTAs and publication checks. No licensed human tax review claimed.

## Content

1. `/blog/company-car-deductions-foreign-owned-us-llc` — taxpayer, business purpose, owner funding and vehicle evidence.
2. `/blog/business-car-mileage-vs-actual-expenses-2026` — two 2026 rates, comparison and method availability.
3. `/blog/electric-company-car-us-llc-tax-credits-2026` — acquisition cutoff, deduction versus credit and hypothetical cash budget.
4. `/blog/uk-company-car-vat-buy-lease-electric` — purchase, lease and charging VAT with claimant and private-use limits.

Evidence and editorial decisions: `docs/marketing/2026-10-09-company-car-blog-brief.md` and `docs/marketing/2026-10-09-company-car-evidence.csv`.

## Release workflow

Respect October 3 owner decision: one daily release at 09:00 London, weekends included. The existing scheduler resolved new `publishAt: auto` entries after the occupied October 10–15 slots:

| London release | Article |
|---|---|
| October 16, 2026, 09:00 | Company-car deductions |
| October 17, 2026, 09:00 | Mileage versus actual expenses |
| October 18, 2026, 09:00 | Electric-car deductions versus credits |
| October 19, 2026, 09:00 | UK company-car VAT |

All four are 10:00 Warsaw / 08:00 UTC. Future article URLs must return 404 and remain absent from index/sitemap/feed before release. No new cron or indexing submission is created.

Content checkpoint: `234d698`; QA checkpoint: `8b60d1c`. Only `git push origin main` was used, never CLI production deployment. Original checkout's `main` is occupied and dirty; an independent release clone with its own `main` cherry-picked only scoped task commits. The canonical checkout and its unrelated files remain unchanged.

Production commits: `8e19073` (content and artwork) and `a92310e` (verifier and editorial/QA handoff), fast-forwarded from `5116a7c`. The independent release tree was byte-for-byte equivalent to the tested feature tree (`git diff --exit-code 8b60d1c HEAD` passed) before pushing. Git push succeeded. Git-linked Vercel content deployment `dpl_4UTEcbZPjBuiTRsiQrx3MXduKH61`, `form5472prep-42sbdzuyj-form5472prep.vercel.app`, is READY and assigned to `www.form5472prep.com`. Read-only Vercel API confirmed Git source `main` and full commit `a92310ed7dfaf2656c93e4e675aa7e1bde5ea402`.

Status: **written, reviewed, deployed to the daily queue and live-gate checked**. Not yet publicly released: the articles remain intentionally unavailable until October 16–19. The final verification-log update is documentation only; it does not change the tested runtime or publication dates.

## Verification

- Four related test files / 237 tests passed: blog, blog-order CTA, publication schedule and SEO title.
- All four articles previewed locally with the scheduled visibility temporarily removed. Each returned 200, one H1, canonical, indexable metadata, expected BlogPosting and two-item FAQ schema, working cover/social image, data table and `/start` CTA. Publication fields were restored to the committed October 16–19 schedule immediately after preview.
- Blog, sitemap and feed discovery checked in the temporary preview; eight internal destinations and all 15 external citation destinations returned 200. Primary source passage review is recorded separately in the claim ledger; an HTTP response alone is not treated as factual verification.
- Mobile preview at 390 × 844 on all four pages: images loaded, no page-level horizontal overflow, wide tables scroll inside their containers. Company-car and UK VAT screenshots visually reviewed; all four original 1280 × 720 covers inspected.
- Description lengths, absent editorial comments/placeholders, artwork dimensions and all example arithmetic checked by `scripts/verify-company-car-blogs-20261009.mjs`.
- Restored scheduled tree locally: all four article URLs return 404, all four covers return 200, and no new slugs appear in blog, sitemap or feed. Existing linked destinations still return 200.
- TypeScript `tsc --noEmit` passed. Full suite with its expected `http://localhost:3000` app URL: 2,166 passed / 3 failed across 132 files. The three failures also reproduce at unchanged production `5116a7c`: `pdfInputs.test.ts` (two) and `irsCodes/index.test.ts` (one), all because their session mock lacks `toClientFiling`. These files and the filing API are untouched. Initial port-3009 test run had two additional Stripe branding expectation failures; those pass with the expected port 3000. No assertion was changed to make tests pass.
- Production-mode `npm run build` completed successfully (compile, lint/type checks, static generation and finalization; exit 0) with the restored schedule. Local-only dummy database/Stripe/session values were used; no production credentials or customer records. Expected unavailable-local-database fallback logs and the pre-existing `MessagesPanel.tsx` image warning remain. An initial build lacked the now-required local session secret; retrying with a dummy session value resolved that environment issue without source edits.
- The built local production server passed the batch verifier: four scheduled 404s, byte-identical 200 covers, no pre-release discovery in blog/sitemap/feed, and existing internal links 200. Production credentials were not used.
- Live verification completed October 9, 2026, 15:18:22 UTC against `https://www.form5472prep.com`: all four scheduled article URLs 404; all four covers 200 and byte-identical to committed assets; blog, sitemap and feed 200 with all four new slugs absent; linked existing destinations 200. This verifies deployed assets and current release gates, not future indexing or conversion performance.
- All three production markers passed together: empty EIN checkout request 400 (rejected before database/Stripe access), `/ein/apply` 200 containing `Owner date of birth`, and `/form-5472-penalty-calculator` 200. No application was submitted or customer record created. Prior live deployment was `dpl_2RhErSGqGSia6NB64hs2pXvConvG` on main `5116a7c`; new content deployment is confirmed above.
- Existing `publishAt` filtering and 60-second ISR will expose each post on its scheduled day. Existing `blog-release` cron refreshes discovery and handles its already-authorized IndexNow flow. It was not manually invoked, modified or newly scheduled by this session. To check a released page later, run the batch verifier against production; it changes expected status from 404 to 200 based on each committed release time.

## Open follow-ups

- Separate application-test maintenance: add the appropriate `toClientFiling` mock in the two existing test files and rerun the full suite. Not part of this editorial task and not implemented here.
- No owner decision blocks this scoped series. VAT jurisdiction default is explicitly UK; if the owner wants another country, research a separately scoped replacement before changing the article.

## Contracts

- No company-card or LLC-name deduction guarantee. Nonresident deductions, information reporting and UK VAT are separate questions.
- Preserve the IRS July 1, 2026 mileage change and September 30, 2025 clean-vehicle acquisition cutoff.
- UK article applies normal VAT rules only and does not determine the US LLC's VAT eligibility or local classification.
- Examples and artwork are hypothetical/editorial; no actual vehicle test, client result, fabricated credentials or traffic forecast.
- New-post internal links render as text while sibling posts remain scheduled; existing template behavior restores them after release.
- No price, tax-preparation workflow, customer data, database migration or unrelated draft was changed or released. The only runtime change is four descriptive artwork alt-text entries in the blog library.
