# Meta Ads launch brief — July 2026

## Campaign

- Name: `META | Sales | Form 5472 | Geo Test | 2026-07`
- Objective: Sales
- Conversion location: Website
- Performance goal: Maximize number of conversions
- Optimization event: Purchase
- Bid strategy: Highest volume
- Daily budget: USD 15
- Attribution: 7-day click, 1-day view
- Placements: Advantage+ placements
- Destination: `https://www.form5472prep.com/file-form-5472`

## Test schedule

1. Days 1–10: United Kingdom, Canada, Australia.
2. Days 11–20: United Arab Emirates, Singapore, Hong Kong.
3. Days 21–30: retain the best two or three countries using purchases first,
   then initiated checkouts and qualified filing starts.

All unlisted locations—including the United States, India, Pakistan, and
Indonesia—remain outside the location inclusion control.

## Audience

- Minimum age: 24
- Gender: all
- Test A language: unrestricted
- Test B language: English
- Advantage+ audience suggestions: small business owners, entrepreneurship,
  ecommerce, Shopify, Amazon seller, Stripe, SaaS, freelancing, digital
  entrepreneurship, business banking, international business.
- Exclude existing purchasers when the audience becomes available.

## Ads

### 1. Qualification

Primary text:

> Form 5472 filing for foreign-owned U.S. single-member LLCs. We prepare Form
> 5472 and the pro forma Form 1120, you sign online, and we fax the completed
> package to the IRS. Accountant-reviewed service from $199.

Headline: `Form 5472 Filing From $199`

Description: `Accountant review and IRS fax delivery included.`

CTA: Get Started

Assets:

- `public/ads/meta/final/qualification-feed.jpg`
- `public/ads/meta/final/qualification-square.jpg`
- `public/ads/meta/final/qualification-story.jpg`

### 2. Complete workflow

Primary text:

> A foreign-owned U.S. disregarded entity may need Form 5472 even when it owes
> no U.S. federal income tax. Get the Form 5472, pro forma Form 1120, accountant
> review, IRS fax delivery and timestamped receipt in one online workflow.

Headline: `Every Required Form. One Online Workflow.`

Description: `Start from $199. No subscription.`

CTA: Learn More

Assets:

- `public/ads/meta/final/workflow-feed.jpg`
- `public/ads/meta/final/workflow-square.jpg`
- `public/ads/meta/final/workflow-story.jpg`

### 3. Late filing

Primary text:

> Missed the April 15 Form 5472 deadline without an extension? Late filing
> preparation is available for foreign-owned U.S. single-member LLCs. Complete
> the questionnaire online and receive an accountant-reviewed filing package
> with IRS fax delivery.

Headline: `Late Form 5472 Filing Help`

Description: `Prepared, reviewed and faxed to the IRS.`

CTA: Start Filing

Assets:

- `public/ads/meta/final/late-filing-feed.jpg`
- `public/ads/meta/final/late-filing-square.jpg`
- `public/ads/meta/final/late-filing-story.jpg`

## URL parameters

Use Meta's dynamic parameters:

`utm_source=facebook&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}`

## Launch checks

- Meta Dataset / Pixel ID configured as `NEXT_PUBLIC_META_PIXEL_ID`.
- Conversions API token configured as `META_CONVERSIONS_API_TOKEN`.
- Test event code removed after Events Manager validation.
- PageView, StartFiling, InitiateCheckout and Purchase verified.
- Browser and server Purchase share `purchase_<filingId>` for deduplication.
- Privacy Policy and consent controls live before media starts.
- Stripe remains the source of truth for paid-order reporting.
- Campaign and ad set remain off until final approval.
