# Claude handoff — ten digital-nomad location articles

## Scope and ownership

- User requested ten more articles for digital nomads in established nomad destinations, using `sales-blog-geo-aeo`; standing authorization includes publishing and a Markdown handoff.
- Working checkout: `/Users/sumyeung/.codex/worktrees/nomad-location-blogs/form5472`, initially branch `codex/nomad-location-blogs-20260922`, based on production `8168881`.
- The original checkout remains on `fix/generator-review-defects`; its two ahead-of-production schema commits and extensive uncommitted generator work were **not** included or modified.
- Owned changes: ten new Markdown posts and ten WebP images; the nomad hub's directory and narrow claim corrections; artwork renderer location labels/config; `ARTWORK_ALTS`; research brief/evidence CSV; batch verifier; this handoff.
- No ad settings, budgets, customer records, tax packages, schema, migrations, or application workflows changed.

## Content delivered

Locations: Lisbon, Bangkok, Mexico City, Tbilisi, Chiang Mai, Buenos Aires, Dubai, Kuala Lumpur, Medellín, Barcelona. Each new article has a distinct recordkeeping or adviser-handoff job, an original table/example, two relevant FAQs, a `/start` CTA, country-guide and hub links, source citations, and an educational scope statement. Publication date: September 22, 2026.

The hub `/blog/form-5472-digital-nomad-us-llc` links all ten under “Practical records guides by digital-nomad destination”. It also corrects overbroad statements about unrelated customer revenue, owner versus genuine business costs, no-residence versus foreign-person status, and universal 183-day rules. This is not a full audit of old blog coverage.

See `docs/marketing/2026-09-22-nomad-location-blog-brief.md` for the page map, search context, differentiation, and editorial rubric; `docs/marketing/2026-09-22-nomad-location-evidence.csv` contains the material claim ledger. No population ranking, keyword volume, conversion-rate advantage, or licensed tax review is claimed.

## Verification before release

- Source gate: ten articles passed metadata, date, slug, original table, internal target, hub backlink, CTA, image dimensions, and two-FAQ checks; no editorial comments/UTMs/placeholders.
- All 14 distinct external article citations returned HTTP 200; primary-source passages inspected separately, not inferred from status alone.
- Original arithmetic checked: USD 2,000 − 60 − 1,000 = 940; Malaysian example 61 + 182 = 243 inclusive days; Colombian example 184 inclusive days.
- Ten original 1280×720 WebPs rendered and visually inspected as a contact sheet; approximately 17–26 KB each. City labels distinguish covers. No stock-photo or customer-evidence claims.
- `npm test -- src/lib/blog.test.ts src/lib/blog-order-cta.test.ts`: 28 tests passed. First attempt ran before Prisma generation completed; rerun passed.
- `tsc --noEmit`: passed. `git diff --check`: passed.
- Local `npm run build`: passed (exit 0), with an existing `MessagesPanel.tsx` image warning and expected file-fallback warnings against a deliberately unavailable local database. No production database credentials were used.
- `node scripts/verify-nomad-blogs-20260922.mjs http://localhost:3007`: passed all ten pages, visible dates/text, canonical/indexability, cover and social-preview images, Article and two-question FAQ structured data, all internal targets, blog index, sitemap, RSS feed, and hub discovery links.
- In-app browser preview: all ten pages checked at 390×844; no page-level horizontal overflow, all ten tables and filing CTAs present. Lisbon screenshot and actual image loading inspected; table uses its own horizontal scroll region.
- Content commit: `ff20740`; preview-evidence commit and production release: `644815c`.

## Published and checked — September 22, 2026, 09:23 UTC

- Fast-forwarded the isolated checkout's `main` from `8168881` through `644815c`; deployed using **`git push origin main` only**.
- Vercel Git deployment `dpl_8LwQdQLUhfxJ9EW7NvQ28YY9Zrzi` / `form5472prep-4nvd0o7s4-form5472prep.vercel.app` reached **READY** and aliases include `www.form5472prep.com`. CLI use was read-only `list`/`inspect`, never a CLI deployment.
- `node scripts/verify-nomad-blogs-20260922.mjs https://www.form5472prep.com` passed the complete batch. All ten live URLs return 200 with expected titles/dates, self-canonicals, no noindex, working WebP and social images, Article and two-question FAQ schema. All internal targets return 200. All ten appear in `/blog`, `/sitemap.xml`, `/feed.xml`, and the existing nomad hub.
- In-app browser confirmed the live Lisbon article's cover, title, canonical, and filing links; the live index shows **173 articles** and links every new page. Mobile checks covered all ten in the identical-source local production build; no page-level horizontal overflow at 390×844. Normal viewport restored.
- Required regression markers passed together: empty JSON POST to `/api/applications/ein/checkout` rejected with 400 (no order created); `/ein/apply` contains “Owner date of birth”; `/form-5472-penalty-calculator` returns 200.
- No claim of indexing, rankings, AI citations, or increased conversions is made. No analytics configuration, ad targeting, indexing submission, or recurring monitor was changed.
- This final handoff update changes documentation only; the verified content release is `644815c`.

### Live articles

1. [Lisbon — accountant handoff](https://www.form5472prep.com/blog/lisbon-digital-nomad-us-llc-accountant-handoff)
2. [Bangkok — LLC transfers and remittances](https://www.form5472prep.com/blog/bangkok-digital-nomad-llc-transfer-remittance-records)
3. [Mexico City — work-location log](https://www.form5472prep.com/blog/mexico-city-digital-nomad-us-llc-work-location-log)
4. [Tbilisi — Georgian IE and LLC records](https://www.form5472prep.com/blog/tbilisi-digital-nomad-georgian-ie-us-llc-records)
5. [Chiang Mai — owner-paid costs](https://www.form5472prep.com/blog/chiang-mai-digital-nomad-llc-coworking-owner-paid-costs)
6. [Buenos Aires — USD/ARS reconciliation](https://www.form5472prep.com/blog/buenos-aires-digital-nomad-llc-usd-ars-reconciliation)
7. [Dubai — individual and entity review pack](https://www.form5472prep.com/blog/dubai-digital-nomad-us-llc-corporate-tax-review-pack)
8. [Kuala Lumpur — cross-year records](https://www.form5472prep.com/blog/kuala-lumpur-digital-nomad-cross-year-tax-records)
9. [Medellín — rolling 365-day log](https://www.form5472prep.com/blog/medellin-digital-nomad-rolling-365-day-tax-log)
10. [Barcelona — visa versus tax election](https://www.form5472prep.com/blog/barcelona-digital-nomad-visa-us-llc-tax-election)

### Next-session safety

The original `/Users/sumyeung/Documents/Codex/form5472` checkout remains on the dirty generator branch. Its local `main` ref now includes these published commits because Git refs are shared across worktrees. **Do not copy or reset the original working tree.** When continuing generator work, integrate current `origin/main` using the established safe merge workflow so the new articles are not omitted from the next release. No generator work was stashed, discarded, or deployed by this session.

## Contracts to preserve

1. Production deploys only through `git push origin main`; never `vercel --prod`. Do not publish the original checkout's unfinished generator tree.
2. All ten posts assume a non-U.S. individual and single-member disregarded LLC with no corporate election. Do not broaden them into U.S.-expat advice or local tax guarantees.
3. Examples are hypothetical; recordkeeping worksheets are editorial aids, not official tax forms or residency calculators. No local tax liability or special-regime eligibility is decided.
4. The renderer's optional `location` label affects only the ten new configurations; existing artwork was not re-rendered. Keep new Markdown + WebP + alt/config entries together.
5. The next filing step is `/start`; no price is hardcoded in the new articles. No internal UTM parameters.
6. Recheck local authority guidance after rule changes and IRS instructions each filing season. Suggested measurement is not a scheduled monitor or an indexing submission.
