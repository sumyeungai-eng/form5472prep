# Claude handoff — company-car series

## Ownership and scope

Working checkout: `/Users/sumyeung/.codex/worktrees/nomad-location-blogs/form5472`, branch `codex/company-car-blogs-20261009`, from production `5116a7c`. Original canonical checkout is dirty on local `main` behind production; none of its modified/untracked blog, email, image or wizard files were edited or committed.

Owned files: four new company-car Markdown articles, four corresponding WebP covers, four artwork configurations and a new vehicle motif in `scripts/render-blog-artwork.mjs`, four `ARTWORK_ALTS` entries in `src/lib/blog.ts`, the research brief/claim ledger and this handoff.

User requested a few articles covering company cars, deductibility, electric cars and VAT. Four guides written for the existing foreign-owned US LLC audience; VAT article explicitly UK-only. US-tax skill used for entity and nonresident deduction boundaries, sales-blog skill used for intent, primary authority research, worked examples, scope-fitting CTAs and publication checks. No licensed human tax review claimed.

## Content

1. `/blog/company-car-deductions-foreign-owned-us-llc` — taxpayer, business purpose, owner funding and vehicle evidence.
2. `/blog/business-car-mileage-vs-actual-expenses-2026` — two 2026 rates, comparison and method availability.
3. `/blog/electric-company-car-us-llc-tax-credits-2026` — acquisition cutoff, deduction versus credit and hypothetical cash budget.
4. `/blog/uk-company-car-vat-buy-lease-electric` — purchase, lease and charging VAT with claimant and private-use limits.

Evidence and editorial decisions: `docs/marketing/2026-10-09-company-car-blog-brief.md` and `docs/marketing/2026-10-09-company-car-evidence.csv`.

## Release workflow

Respect October 3 owner decision: one daily release at 09:00 London, weekends included. New files start with `publishAt: auto`; the existing scheduler assigns dates after occupied slots. Future article URLs must return 404 and remain absent from index/sitemap/feed before release. No new cron or indexing submission is created.

Work in progress: scheduling, artwork, preview/build checks and release evidence will be recorded before completion. Deployment only through `git push origin main`; never CLI production deployment. Original checkout's `main` is occupied and dirty, so deploy a scoped tested worktree commit with a fast-forward refspec if necessary, preserving the canonical tree.

## Contracts

- No company-card or LLC-name deduction guarantee. Nonresident deductions, information reporting and UK VAT are separate questions.
- Preserve the IRS July 1, 2026 mileage change and September 30, 2025 clean-vehicle acquisition cutoff.
- UK article applies normal VAT rules only and does not determine the US LLC's VAT eligibility or local classification.
- Examples and artwork are hypothetical/editorial; no actual vehicle test, client result, fabricated credentials or traffic forecast.
- New-post internal links render as text while sibling posts remain scheduled; existing template behavior restores them after release.
- No price, tax package, customer data, application code, migration or unrelated draft released.
