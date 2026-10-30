# 2026-10-26 — Add doola and Firstbase to the filing-service comparison post

## Ownership

| Checkout / branch | Files owned this session |
|---|---|
| `~/Developer/f5472-wt/compare` on `blog-compare-doola` | `content/blog/form-5472-filing-service-comparison.md`, this log |

Nothing else was touched. `src/lib/provider-prices.ts` was read only.

## What shipped

The 24 October comparison post went from three services to five. Firstbase ($899/yr)
and doola ($1,500/yr standalone; $1,999/yr Tax and Compliance plus state fees) were
added as the formation-provider-bundle tier.

Changes to `content/blog/form-5472-filing-service-comparison.md`:

- Title/`seoTitle`/description reworked to the `$79 to $1,500` span. `seoTitle` added
  (33 chars) so the 60-char `fitTitle` guard passes with the branded suffix.
- Two new table rows, with each provider's own wording for what the bundle covers and
  who reviews it.
- Answer block rewritten to 60 rendered words naming all five services.
- New `## Why are Firstbase and doola so much more expensive?` section: they are annual
  compliance subscriptions, not single filings. Links
  `/blog/stripe-atlas-doola-firstbase-form-5472` (verified live, 200).
- Review section now covers all five in ascending price order.
- New FAQ: "What do doola and Firstbase charge for Form 5472?" (8 FAQs now).
- Every three-way leftover fixed: heading, intro, "all three", "best value of the
  three", "two of the three rows", the cheapest-of FAQ, the bottom-line span.

### Contracts a future editor must respect

- **Every competitor figure in this post comes from `src/lib/provider-prices.ts`, not
  from a fresh web read.** Firstbase/doola carry `checkedOn = PRICES_CHECKED_ON`
  (`2026-10-15`); snapfile.tax and form5472.online were read on 24 October 2026. The
  post states both dates separately under the table. If `PRICES_CHECKED_ON` moves, the
  post's "checked 15 October 2026" lines move with it.
- Competitor quality and credential claims stay attributed to that provider's own page,
  never asserted. "We make no claim about their quality" stays.
- Two of the five rows are ours (Snapfile, Form5472 Prep) and the post discloses it
  three times: table cell, `## Are Snapfile and Form5472 Prep the same team?`, FAQ.
  Do not thin that out.
- Own prices stay as `{{price.*}}` tokens (`blog-price-tokens` guard).
- The post claims *best value*, never *cheapest* — Snapfile's $79 undercuts us and the
  post says so.

## Verified evidence

- `npx vitest run src/lib/seo-title.test.ts src/lib/blog.test.ts src/lib/blog-price-tokens.test.ts` → 442 passed, 0 failed.
- Firstbase/doola prices, quotes and the checked-on date diffed by hand against
  `src/lib/provider-prices.ts`: exact match.
- `/blog/stripe-atlas-doola-firstbase-form-5472` → HTTP 200.

## Still open

### Owner-gated

- Nothing new. The post is live on the existing URL, no redirect needed.

### Follow-ups

- `src/lib/provider-prices.ts` still carries a stale comment excluding Snapfile for
  "possible affiliation, unconfirmed", and `provider-prices.test.ts` asserts `/compare`
  "never lists Snapfile". The affiliation is now confirmed and disclosed on both sites,
  so `/compare` could list Snapfile. **Not this session's files — reported, untouched.**
- This post has no `publishAt`, so the daily `/api/cron/blog-release` IndexNow ping
  skips it (it filters on `!!parsePublishAt`). IndexNow was submitted by hand.

## Lane notes

- The repo guard that bites on every new post is `src/lib/seo-title.test.ts`:
  `fitTitle(seoTitle ?? title)` must be ≤ 60 and `seoDescription ?? description` ≤ 160.
  A descriptive title almost always needs a short `seoTitle` alongside it.
- When patching markdown by script, anchor on the literal bytes including `**` bold
  markers. An anchor that missed cost a whole three-edit batch, because the assert
  fired before the file was opened for writing. Assert all anchors first, write once.
