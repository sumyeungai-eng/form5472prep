# Protect rankings on noindexed paginated pages (plan P0-1), 2026-10-30

Branch `seo/blogx-2026-10-30` (`~/Developer/f5472-wt/blogx`). Source: `docs/seo/moz-data-2026-10-30/campaign.md`
table "Paginated blog / topic-hub pages now rank instead of the dedicated posts". Pages 2+ of `/blog` and
`/blog/topics/*` are noindex,follow, so Google has to move these keywords onto the posts themselves.

## Request indexing for these URLs (architect, Search Console)

After this branch is deployed, run URL Inspection then Request indexing, highest current rank first. Quota is
about 10 a day.

| # | URL (https://www.form5472prep.com...) | Keyword (Moz rank 10-25, ranking URL) | Inbound links before -> after |
|---|---|---|---|
| 1 | /blog/form-5472-vietnam-residents-us-llc | form 5472 vietnam residents (#1, /blog/page/7) | 3 -> 8 |
| 2 | /blog/form-5472-estonia-residents-us-llc | form 5472 estonia residents (#2, /blog/topics/foreign-owned-llc/page/3) | 2 -> 7 |
| 3 | /blog/form-5472-france-residents-us-llc | form 5472 france residents (#4, /blog/page/7) | 1 -> 8 |
| 4 | /blog/form-5472-recordkeeping-checklist | form 5472 recordkeeping checklist (#4, /blog/page/7) | 22 -> 26 |
| 5 | /blog/form-5472-indonesia-bali-residents-us-llc | form 5472 indonesia residents (#6, /blog/page/3) | 1 -> 7 |
| 6 | /blog/form-5472-switzerland-residents-us-llc | form 5472 switzerland residents (#6, /blog/topics/foreign-owned-llc/page/2) | 1 -> 12 |
| 7 | /blog/form-5472-spain-residents-us-llc | form 5472 spain residents (#7, /blog/page/7) | 1 -> 10 |
| 8 | /blog/form-5472-germany-residents-us-llc | form 5472 germany residents (#11, /blog/topics/foreign-owned-llc/page/3) | 2 -> 13 |
| 9 | /blog/form-5472-owner-becomes-us-tax-resident | form 5472 owner becomes us tax resident (#13, /blog/topics/foreign-owned-llc/page/3) | 3 -> 8 |
| 10 | /form-5472-by-country | new indexable hub linking every country guide | new |

Inbound = distinct sitemap pages linking to the URL, counted from the prerendered HTML of a local production
build (same method reproduces the 2026-10-30 page audit's `inlinks_from_sitemap_pages` for 196 of 197 posts).
Orphan and weak-link numbers are in `docs/sessions/2026-10-30-blog-links-country-hub.md`.

Also on paginated pages, below the top 20 (lower priority): portugal (#18, /blog/page/7), owner loans
(#11, /blog/page/7), do I need an ITIN (#12, /blog/page/4). Their posts gain links from the country hub and
the related-guides change but were not given hand-placed links.

## New contextual links per protected post (source post -> anchor)

- Vietnam: form-5472-digital-nomad-us-llc ("Vietnam"), form-5472-south-korea-residents-us-llc ("Vietnam owners"),
  irs-official-exchange-rate-form-5472 ("Form 5472 for Vietnam residents").
- Estonia: form-5472-digital-nomad-us-llc ("Estonia (including e-Residents)"),
  form-5472-ftin-reference-id-foreign-address ("Form 5472 for Estonia residents and e-residents").
- France: oregon-llc-foreign-owner-tax-filing ("French resident"), form-5472-germany-residents-us-llc and
  form-5472-switzerland-residents-us-llc ("Form 5472 for French owners").
- Recordkeeping checklist: delaware-llc-foreign-owner-tax-filing (anchor already said "Form 5472 recordkeeping
  checklist" but pointed at the filing-requirements checklist; href corrected), stripe-paypal-wise-form-5472.
- Indonesia: form-5472-digital-nomad-us-llc ("Indonesia and Bali"), irs-official-exchange-rate-form-5472
  ("Form 5472 for Indonesia and Bali residents").
- Switzerland: form-5472-germany-residents-us-llc, form-5472-france-residents-us-llc ("Form 5472 for Swiss residents").
- Spain: form-5472-customer-payments-foreign-source-income, form-5472-business-address-owner-address ("Spain").
- Germany: does-foreign-owned-llc-pay-us-tax ("Germany"), form-5472-malaysia-residents-us-llc ("German owner"),
  form-5472-switzerland-residents-us-llc and form-5472-france-residents-us-llc ("Form 5472 for Germany residents").
- Owner becomes US tax resident: form-5472-colombia-residents-us-llc ("US tax resident"),
  form-5472-vs-form-5471 ("becomes a US tax resident"), pay-yourself-from-us-llc-non-resident
  ("becomes a US resident alien").

Every country post above also gains: a line on `/form-5472-by-country`, a "Form 5472 by country" link in its
own sidebar, and same-series neighbours in the related-guides module (`src/lib/related-posts.ts`).
