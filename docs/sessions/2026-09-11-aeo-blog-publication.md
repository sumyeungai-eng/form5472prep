# Claude handoff — September 11 AEO five-guide batch

## Status

Content release `6b32a6e40e65ac4cb51dad5226b7a6cec9f92ded` was pushed to `origin/main`. Vercel's Git-linked production deployment is Ready, and all five articles are live on `https://www.form5472prep.com`:
`https://form5472prep-gjgrjhavx-form5472prep.vercel.app`.

Local and production checks passed. This executes the September 11 AEO execution brief and is distinct from the earlier uncommon-topic batch published today. The final handoff is a documentation-only follow-up to the verified content release.

## New articles

All five are dated and updated September 11, 2026, with `draft: false`, organizational authorship, three FAQs, primary-source citations and original explanatory tables.

- https://www.form5472prep.com/blog/form-5472-irs-receipt-confirmation-status
- https://www.form5472prep.com/blog/form-5472-line-1c-total-assets
- https://www.form5472prep.com/blog/form-5472-pro-forma-1120-signature
- https://www.form5472prep.com/blog/form-5472-ein-pending-deadline
- https://www.form5472prep.com/blog/form-5472-1099-k-foreign-owned-llc

Each hero is `public/blog/<slug>.webp`, 1280×720, 55–89 KB. Original PNGs were preserved; full prompts and paths are in `docs/research/2026-09-11-aeo-artwork.md`. The receipt example is explicitly dummy data, not IRS evidence.

## Changes and ownership

The content commit contains 34 explicit owned paths:

- Five new Markdown articles and five WebP heroes.
- Five artwork-alt entries only in shared `src/lib/blog.ts`.
- Targeted copy corrections in 25 objects in `src/lib/landing-pages.ts`. All routes, section/FAQ counts, pricing modes, `startSrc`, `noindex` and related-route configuration are preserved. Nine new incoming guide links remain, concentrated in five closely related landing pages.
- Public sample components `src/components/FaxReceipt.tsx` and `src/components/FaxReceiptProof.tsx`: clearly provider-derived transmission evidence, not IRS-issued acceptance. Operational receipt generation is unchanged.
- Ten supporting articles under `content/blog/`: `amended-form-5472-correcting-errors`, `ein-for-foreign-owned-llc-without-ssn`, `ein-processing-time-international-applicants`, `form-5472-deadline-2026`, `form-5472-extension`, `form-5472-recordkeeping-checklist`, `how-to-fax-form-5472-irs`, `how-to-fill-out-form-5472`, `pro-forma-form-1120-foreign-owned-llc`, and `stripe-paypal-wise-form-5472`.
- Nine evidence, editorial, measurement and artwork files under `docs/research/2026-09-11-aeo-*`, plus this handoff.

Corrections address limited pro forma fields, nonexistent amendment checkboxes, signature-method qualifications, receipt/silence limits, dedicated mailing addresses, failed-fax deadline claims, and an unsupported relief-success-rate claim in the extension article. This is a targeted refresh, not certification of the entire legacy content library.

## Evidence and editorial decisions

Per-article ledgers identify the exact source, section, access date, applicable filer and direct authority versus interpretation. The final review is `docs/research/2026-09-11-aeo-editorial-review.md`.

Keep the important qualifications:

- Assets: the line 1c conclusion is a practical reading of linked instructions, not an invented DE-specific sentence requiring Form 1120 item D or Schedule L.
- Signatures: ink-sign-and-scan is a conservative recommendation; no blanket digital-signature acceptance, rejection or automatic penalty claim.
- EIN pending: SS-4 and Form 1120 item B provide general Applied For guidance. That does not guarantee every Form 5472 field or a valid numberless Form 7004 extension.
- 1099-K: gross payments, net settlements, owner distributions and income-tax liability are separate questions.
- Receipt: transport evidence does not establish IRS processing, attachment matching or substantive correctness.

Codex Orchestration used bounded same-provider subagents for research, drafts and independent review. No model configuration, provider selection or account settings changed. Agents encountered usage limits during final cleanup; root completed the interrupted edit repair and final review. No reset credit was used. No professional tax sign-off was represented.

## Local verification

- Base HEAD was `03bbbe2`; fetched origin and confirmed no divergence before release.
- Prisma client generation: passed.
- TypeScript: passed after repair of the interrupted supporting-page edit.
- Tests: 244 passed across 17 test files.
- Final production build: exit 0. Log: `/tmp/form5472-aeo-final-build-20260911.log`.
- Read-only batch verifier: all five passed on localhost at 08:20 UTC, including HTTP, titles/dates, canonicals, robots, tables, Article/FAQ schema, images, internal links, blog index, sitemap and feed.
- Description metadata checked separately against Markdown.
- Browser: all five checked at 390px mobile and 1280px desktop; no document overflow. Hero images and CTAs present. The mobile evidence table and public sample receipt were inspected.
- A browser viewport-reset artifact temporarily left responsive image sources unselected. Explicit test viewports and fresh checks confirmed loading; no website workaround was introduced.
- Captured main-content hashes for 41 routes: five new articles, ten refreshed articles, 25 landing pages and the homepage, for production comparison.

Local PostgreSQL is unavailable, so the blog build uses its intended Markdown fallback. No production database was read or migrated locally; the public content comparison below checked for stale copy or database overrides. The temporary local preview server was stopped after verification.

## Production verification

- Git-linked production deployment `dpl_BEunjEJZT8niPRZ9Lcx5za5CEKL3`: Ready, with the public production alias assigned.
- Public batch verifier passed for all five articles at `2026-09-11T08:26:53.100Z`. Checked page responses, titles/dates, canonicals, robots, tables, Article/FAQ schema, hero assets, 19 internal destinations, blog index, sitemap and feed entries.
- All 41 public main-content hashes exactly matched the tested local version: five new articles, ten refreshed articles, 25 landing pages and the homepage. No stale body copy or database override was detected on those routes.
- Browser checks covered all five public pages at 390px mobile and 1280px desktop, with one H1, tables and filing CTAs present and no document overflow. All five hero images loaded during the desktop checks; the receipt hero also loaded in the mobile check.
- REPO-STATE smoke markers passed: empty EIN checkout request returned 400, `/ein/apply` returned 200 with the Owner date of birth field, and `/form-5472-penalty-calculator` returned 200. No real application, payment, message or fax was created.

These checks establish publication and page integrity, not search indexing or AI exposure. No visibility or conversion gain is claimed.

Deploy only through `git push origin main`; never use Vercel's production CLI deployment command.

## Visibility baseline

One neutral, signed-out Perplexity receipt question cited the existing homepage as a clickable source. This was before publication, not a measured gain or explicit service recommendation. Copilot required sign-in, so its result is unavailable, not zero. The other topic prompts and aggregate analytics/conversions were not measured.

Exact prompt, context, source URLs and answer URL: `docs/research/2026-09-11-aeo-baseline.csv`. Recommend a comparable repeat around September 25 and October 23. No recurring automation was created.

## Preserve unrelated work

The user-authored execution brief and earlier brief-session MD were already untracked and were not included incidentally. Preserve personal IMG files, email image originals/variants and untracked `src/lib/wizard/`.

No pricing, checkout, payment, email, customer records, analytics, schema, crawler policy or `hktax/` changes were made.

## Separate follow-up

1. Obtain qualified, document-specific review of the operational canvas-signature process. Do not modify actual customer filings based on educational copy alone.
2. Review older email and generated-receipt acknowledgment/proof wording separately; the brief excluded those operational changes.
3. Audit remaining legacy tax guidance, including Part II field mappings, older page counts, FTIN/reference-ID shortcuts, DIIRSP success-rate/materiality/retention assertions and reasonable-cause declaration guidance. Any declaration must be truthful and fact-specific; never coach omission of relevant facts.

These items are not certified correct by this content release. See the editorial review for details.
