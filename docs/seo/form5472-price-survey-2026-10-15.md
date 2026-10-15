# Form 5472 filing services: price and scope survey (re-check)

Date checked: 2026-10-15 (all pages fetched that day with curl and a desktop browser user-agent; no logins, forms, purchases or contact).
Purpose: dated, quote-backed fact base for the form5472prep.com Form 5472 filing cost comparison page (`src/lib/provider-prices.ts`). Re-check of `docs/seo/form5472-price-survey-2026-10-05.md` plus one new provider (Simple5472).
Rule applied: only what a provider's OWN pages state. Where a page is silent, blocked or JS-only the cell says not published or could not verify. Review-blog, search-snippet and competitor-comparison-table numbers are not used.
Scope of this pass: the 15 competitor rows in `provider-prices.ts`, Northwest Registered Agent (listed in `UNVERIFIED_PROVIDERS`), and Simple5472 (new). One provider that appears in the 2026-10-05 survey was deliberately not re-checked and is not covered here. The form5472prep.com row is built from `src/lib/pricing.ts` at render time and was not re-surveyed.

Scenario priced: one tax year of Form 5472 + pro forma 1120 for a foreign-owned single-member LLC (SMLLC).

Quote convention: every quote below is copied character for character from text extracted from the raw HTML (scripts, styles and SVG removed; block-level elements separated by one space; inline elements joined with no space; whitespace collapsed). Where a site splits a price across adjacent elements the extracted text reads, for example, `$147` or `$49.99/ filing`, whereas the 2026-10-05 survey recorded `$ 147` and `$49.99 / filing`. Quotes are at most 25 words and contain no ellipses. Provider pages change without notice; re-fetch before publishing.

---

## 1. Main table

One-off means a single fee for the filing. Annual-bundle rows are NOT like-for-like with the one-off rows. All 43 pages fetched returned HTTP 200 (fetch log in section 6).

| Provider | One-year price (SMLLC, Form 5472 + pro forma 1120) | Billing | Extra / past year | Filing method | Turnaround | Source |
|---|---|---|---|---|---|---|
| **Edetax** | $49.99 per filing today; the page banner says it rises to $79.99 on 16 October 2026 (see 2.2) | One-off, per filing | $49.99 per year (tax years from 2017), reasonable-cause statement included; same banner | Direct fax to the IRS with confirmation | not published (only about 10 minutes of user time) | https://edetax.com/pricing |
| **form5472.io** (site brand Form5472) | $147 Starter (1 company) | One-off | not published (late filing listed as supported; Penalty Abatement Letter only in the $197 Business plan) | Starter lists PDFs to download; fax listed under the $197 Business plan | not published (only 15 minutes of user time) | https://form5472.io/pricing |
| **Simple5472** (new) | $149 current year if you mail it yourself; $199 if they fax it (tax year 2025) | One-off | Late years: $179 (1 year), $329 (2), $499 flat (3+), mail; fax adds $50 per tier; reasonable-cause statement included, you author it | You mail the signed PDF, or optional fax transmission by them | not published (only about 15 minutes of user time) | https://simple5472.com/pricing |
| **5472Direct** | $199 (tax year 2025) | One-off | not available self-serve yet; planned for the 2027 season; contact to be notified | PDFs; optional +$49 IRS Direct Delivery (fax) with receipt | PDFs in the same session; with Direct Delivery a manual review usually 1-12 hours, then you sign, then they fax | https://www.5472direct.com/pricing |
| **form5472.tax** | $299 flat | One-off | $299 per unfiled year | By fax or certified mail, written confirmation | Filed in 7 days (home page) | https://form5472.tax/pricing/ |
| **Form5472.ai** | $299 for an eligible straightforward SMLLC; $399+ for reportable transactions, multi-member, C-corp, late filings | One-off | not published (late filings start at $399+) | IRS submission with written transmission confirmation; method not stated | not published | https://form5472.ai/pricing |
| **Laramie Ledger Tax** | $349 per return | One-off | $449 per past-due tax year, reasonable-cause statement included | By mail or fax to Ogden, Utah | within 5 business days of complete documents; express 48 hours +$149 | https://laramieledgertax.com/pricing/ |
| **Taxhub** | $469 flat | One-year retainer | not published | not stated ("method depends on entity type") | Fast turnaround (no number) | https://gettaxhub.com/form-5472-global-tax-filing/ |
| **Form5472.online** (Tax USA Inc.) | $399 prep + $49 IRS fax = $448 (no income/expenses); $547 if active | One-off (separate annual bundle $697-$796) | Late year: $947 per year no activity / $1,046 active (filing + $499 penalty removal + $49 fax [+ $99]) | IRS fax is a +$49 add-on; product page: without it you submit yourself | Standard 10 business days (pricing page; product page says 15); 3-day +$199; 24-hour +$299 | https://www.form5472.online/pricing |
| **tax-usa.net** (same company name, address and CPA as Form5472.online) | $599 per year (company with no income or expenses) | Per year | Penalty removal +$499 per year | A licensed CPA signs; they file with the IRS; method not stated | 10 business days; 3 business days +$199; 24-48 hours +$399 | https://www.tax-usa.net/tax-filing-non-us-residents |
| **Hiltzik CPA** | $599 current year | One-off per filing year (fee fixed after a 30-minute call) | $700 per delinquent year | not published | not published | https://hiltzikcpa.com/form-5472-filing-service/ |
| **Firstbase** (bundle) | $899 per year, Tax Filing package for a non-US-owned SMLLC | Annual package | not published | not published | not published | https://www.firstbase.io/tax-software |
| **doola** (bundle) | $1,500 per year standalone Tax Filing-only (help center); $1,999 per year Tax and Compliance (pricing page) | Annual | not published | help center: mail or fax (not electronic) | not published | https://ask.doola.com/article/8a192242-doola-standalone-tax-filing-only-service-pricing-and-service-details.md |
| **Clemta** | not published (Form 5472 not named anywhere on its pricing or federal-tax pages; Pro plan $1,068/yr billed annually lists Federal Tax Filing) | Annual plan | not published | not published | not published | https://clemta.com/pricing |
| **StartGlobal** | not published (federal tax filing priced by revenue; included in $149/month Managed LLC; federal-tax page names Form 1065 and K-1s) | Per service or monthly | not published | not published | not published | https://startglobal.co/pricing/ |
| **Stripe Atlas** | not listed: the Atlas page and its business-taxes docs page do not mention Form 5472 (0 occurrences) | n/a | n/a | n/a | n/a | https://stripe.com/atlas |
| **Northwest Registered Agent** | not listed: the Form 5472 URL now loads (HTTP 200) but is a 2022 informational blog post with no price or filing service | n/a | n/a | n/a | n/a | https://www.northwestregisteredagent.com/start-a-business/irs-form-5472 |

Comparability caveat the page should state plainly: the rows differ in who prepares and reviews, as each site describes itself. Edetax, 5472Direct, form5472.io and Simple5472 describe themselves as software / document-preparation tools, not CPA or tax-preparer services. form5472.tax says CPA-reviewed (operator and reviewer not named on the pages read). Form5472.ai, Form5472.online and tax-usa.net name a licensed CPA; Form5472.ai and Form5472.online say they are operated by Tax USA Inc., and tax-usa.net carries the same company name, Brooklyn address and CPA. Laramie Ledger says a professional U.S. tax preparer signs. Hiltzik is a CPA firm. Taxhub says a CPA prepares. Clemta calls itself a software-enabled document filing and compliance support service.

### Derived arithmetic (mine, not stated by providers, except where marked)

Three late years filed together, using each provider's published per-year numbers. Scope differs (see caveat), so use only as an illustration.

| Provider | 3 years | How derived |
|---|---|---|
| Edetax | $149.97 | 3 x $49.99 (before the 16 October rise; $239.97 if 3 x $79.99 applies to late years too, which the banner does not say) |
| Simple5472 | $499 mail / $549 faxed | stated by provider: 3+ years capped at $499 (mail), $549 (fax) |
| form5472.tax | $897 | stated by provider: Three missed years cost $897 |
| Laramie Ledger Tax | $1,347 | 3 x $449 |
| Hiltzik CPA | $2,100 | 3 x $700 |
| Form5472.online | $2,841 | 3 x $947 (inactive SMLLC) |

---

## 2. Per-provider evidence (exact quotes)

All dates checked 2026-10-15. Each section lists the URL(s), the HTTP status and verbatim quotes. Existing quote means the `sourceQuote` currently in `provider-prices.ts`.

### 2.1 Simple5472 (new provider) (https://simple5472.com/pricing; /late-filing/form-5472; /; /about; /faq; /terms)
- HTTP status: 200 on all six URLs (the late-filing URL is the one search engines cite, https://simple5472.com/late-filing/form-5472).
- What it is: "simple5472 is self-service document-preparation software. It is not a law firm, CPA firm, enrolled agent, or paid tax return preparer" (pricing page). No human review is offered; the About page says the user fills every field, signs, and files.
- Operator: "Laurasia LLC d/b/a simple5472 1309 Coffeen Avenue STE 1200, Sheridan, WY 82801" (About) and "The Service is operated by Laurasia LLC, d/b/a simple5472" (Terms). Founder named on the About page: "Philipp Hoffschröer Founder, simple5472". No link to any other surveyed operator appears on the pages read.
- Current year (tax year 2025): "DIY · Mail yourself $149 one-time Save $49 Bundle · We fax it $199 $248 separately" and "Already bought the Filing Package? Add fax transmission from your dashboard for $99."
- Late / past years (2017 onward), mail versus fax: "1 year One delinquent tax year $179 One-time $229 One-time · faxed for you"; "2 years Two delinquent tax years $329 One-time $379 One-time · faxed for you"; "3+ years Best value Any number of years (2017+) $499 One-time $549 One-time · faxed for you".
- Fax add-on on late years (FAQ page): "Fax (we transmit it for you, +$50 per tier): $229, $379, $549."
- Reasonable-cause statement: "Every tier includes Reasonable Cause Statement (you author via guided builder)". The user writes, reviews and signs it; the site states no outcome is guaranteed.
- Filing method (late-filing page): "Mail to the IRS yourself or use the optional convenience-fax transmission."
- Turnaround: only the user's own time, "Free until you download Documents in ~15 minutes". No IRS-side or fax-side turnaround was found on the pages read.
- Scope gate: "Foreign-owned single-member LLC, default tax treatment (no entity election)"; an eligibility screener runs before payment and the late flow excludes anyone the IRS has already contacted about the returns.
- Not used: the site's own comparison claims about CPA, form-only and formation-service prices.
- Recorded for the first time on 2026-10-15, so there is no 10-05 figure to compare.

### 2.2 Edetax (https://edetax.com/pricing; /late-filing; /)
- HTTP status: 200 on all three URLs.
- Banner on the pricing and late-filing pages: "Price goes up to $79.99 on October 16. File before then for $49.99." (pricing page). This is the day after this check.
- Price: "Form 5472 + 1120 $49.99/ filing" and "One flat price per filing. No subscription, no compliance bundle, no hidden fees."
- Late: "Late filing costs $49.99 per tax year, for any year back to 2017."
- Method: "Direct fax to IRS with confirmation".
- Reviewer: none. "Edetax is filing software, not a CPA firm or tax advisory." (late-filing page)
- Turnaround: "Time to complete ~10 minutes" (user's time, not IRS processing).
- Existing quote `Form 5472 + 1120 $49.99 / filing`: present apart from spacing (today's extraction reads `$49.99/ filing`).
- Edetax's own table lists other providers' prices dated June 2026; not used.

### 2.3 form5472.io (https://form5472.io/pricing; /)
- HTTP status: 200 on both URLs.
- Starter: "Starter For solo founders running one US LLC $147 one-time payment" and "Late filing supported IRS-ready PDFs to download Email support".
- Business ($197, 2 companies): "We fax it straight to the IRS Penalty Abatement Letter Priority email support". A $297 Enterprise plan (5 companies) is also shown.
- Self-description (pricing page footer): "Document preparation tool, not a CPA or tax advisory service." Home page: "Our AI reviews every field on your form and flags issues before the IRS does."
- Turnaround: "From signup to filed in 15 minutes." (user's time)
- Extra year price: not published. FAQ answers are in a JavaScript accordion and are not in the HTML, so they could not be read.
- Existing quote `Starter ... $ 147 one-time payment`: present apart from spacing (today's extraction reads `$147`).
- Whether the $147 Starter includes the fax is still unclear: fax is listed only under Business, while the home page how-it-works says download the package or fax it from the dashboard.

### 2.4 5472Direct (https://www.5472direct.com/pricing; /faq; /)
- HTTP status: 200 on all three URLs.
- Price: "File Form 5472 for $199, flat" and "$199 covers the preparation of one filing. $49 covers the optional IRS fax delivery." Tax year: "Flat fee, tax year 2025 filings".
- Prior years (changed): "Prior-year (catch-up) filings aren’t available in the self-serve tool yet. They’re planned for the 2027 season."
- Delivery and turnaround: "we first complete a manual review of your PDF packet — usually within 1–12 hours — then you sign online and we fax it".
- Self-description: "5472Direct is a document preparation tool, not a CPA or tax advisory service."
- Existing quote `Standard LLC Filing $199 Flat fee, tax year 2025 filings`: NOT present. The label Standard LLC Filing is gone; the product line now reads Form 5472 + pro forma 1120 filing. Use one of the quotes above.

### 2.5 form5472.tax (https://form5472.tax/pricing/; /)
- HTTP status: 200 on both URLs.
- Price: "Form 5472 filing costs a flat $299 at form5472.tax" (same sentence continues: that covers Form 5472 and the required pro forma Form 1120).
- Extra years: "Catch-up filing is a flat $299 per unfiled year." and "Three missed years cost $897 with us versus up to $75,000 in IRS penalties."
- Method: "filing with the IRS by fax or certified mail, and written confirmation."
- Review: pricing page "Reviewed by a Form 5472 specialist"; home page "CPA-reviewed · Filed in 7 days · Flat fee, no add-ons". Reviewer and operating entity are not named on the pages read.
- Existing quote: present.
- The site also states competitor prices (for example form5472.online at $547); not used.

### 2.6 Form5472.ai (https://form5472.ai/pricing; /form-5472-filing-service; /)
- HTTP status: 200 on all three URLs.
- Price: "Form 5472 cost is $299 for an eligible straightforward foreign-owned single-member LLC filing."
- Higher scope: "CPA-prepared work starts at $399+ for distinct scopes." (pricing page) and, on the home page, "CPA-prepared options start at $399+ for reportable transactions, multi-member LLCs, C corporations, and late filings."
- Review: "named licensed CPA Arik Rozen reviews the package, the client approves and signs it".
- Operator (home page): "Form5472.ai is operated by Tax USA Inc. (TAXUSA) · Brooklyn, NY".
- Method and turnaround: not stated (applicable IRS submission with written transmission confirmation). Extra-year price: not published.
- Existing quote: present. The pricing page is much shorter than on 10-05 but the figures match.

### 2.7 Laramie Ledger Tax (https://laramieledgertax.com/pricing/; /services/form-5472/; /services/late-5472/)
- HTTP status: 200 on all three URLs.
- Price: "A flat $349 per return." (pricing FAQ) and the table row "Form 5472 + 1120 Annual information return, prepared and signed by a professional tax preparer, filed by mail/fax Foreign-owned U.S. LLC (incl. dormant) $349".
- Past-due: "$449 / tax year · reasonable cause statement included" and "submission by fax or mail with the transmission record kept for your file — $449 per tax year." (late-filing service page).
- Turnaround: "returns prepared within 5 business days of complete documents · express preparation in 48 hours (+$149)".
- Method: "For a foreign-owned disregarded LLC, this package is submitted to the IRS by mail or fax to Ogden, Utah — it cannot be e-filed." (service page)
- The $299 founding-client offer no longer appears on the pricing, Form 5472 or past-due pages read; $349 stands.
- Existing quote: its two halves are on the page but not contiguous (the old quote used an ellipsis to skip the words Foreign-owned U.S. LLC (incl. dormant)). Use the contiguous row quote above.

### 2.8 Hiltzik CPA (https://hiltzikcpa.com/form-5472-filing-service/)
- HTTP status: 200.
- Price: "Current-year filing $599. Preparation of one Form 5472 and the pro forma Form 1120, filed on time or on a timely extension."
- Delinquent: "Delinquent filing $700 per year. Preparation of each prior year that needs to be brought current."
- Scope: "Standard pricing assumes one foreign owner or related party and one Form 5472 per filing year."
- Review: "Licensed U.S. CPA · serving clients worldwide".
- Filing method, proof of filing, reasonable-cause statement as a deliverable, turnaround: not stated. Existing quote: present.

### 2.9 Form5472.online and tax-usa.net (Tax USA Inc.)
Pages: https://www.form5472.online/pricing (HTTP 200), https://www.form5472.online/product-page/single-member-llc-smllc (200), https://www.tax-usa.net/tax-filing-non-us-residents (200).
- Operator (pricing page): "This page is the authoritative price list for Form5472.online, operated by Tax USA Inc." The page still says prices are current as of August 2026.
- Price: "$448 all-in for a non-active company: $399 preparation plus $49 IRS fax submission with proof of filing." and "If the company had income or expenses, a one-time $99 activity fee applies, for a total of $547."
- Included: "Every package includes: licensed CPA preparation and signature".
- Fax is an add-on (product page): "Without this add-on, you are responsible for submitting the return to the IRS from your own country."
- Turnaround: "Standard filing: 10 business days (Form 5472 + 1120, 1040NR, Bookkeeping)" and "Expedited 3-day: $199 — Add now Rush 24-hour: $299 — Add now". The product page still says "Standard: 15 business days from the date all required information and documents are received from the client." The two pages disagree.
- Late filing: "$947 Late filing, Single-Member LLC, non-active, all-in. $399 filing + $499 penalty removal + $49 IRS submission."
- tax-usa.net price: "Single-Member LLC: $599/year (Form 5472 + pro-forma 1120)." and "Our $599 package covers exactly this case."
- tax-usa.net late and method: "Add the Penalty Removal Application ($499) at checkout." and "A licensed CPA signs; we file with the IRS and store the transmission receipt in your record."
- tax-usa.net turnaround: "Form 1120 & 5472 (Single-Member LLC) NORMAL (INCLUDED) 10 business days" and "Expedite add-ons: 3 business days +$199 · 24–48 hours +$399."
- Existing quotes: Form5472.online present. tax-usa.net old quote (`SINGLE MEMBER LLC Form 5472 + Form 1120 ... $599 per year`) is not contiguous; both halves are on the page. Use the FAQ quote above.
- Three prices under one company name, as on 10-05: $299 (Form5472.ai, narrow scope), $399-$448 (Form5472.online), $599 (tax-usa.net). Form5472.ai and Form5472.online state Tax USA Inc. as operator; tax-usa.net shows Tax USA Inc, the same Brooklyn address and the same named CPA.

### 2.10 Taxhub (https://gettaxhub.com/form-5472-global-tax-filing/)
- HTTP status: 200.
- Price: "We handle it end-to-end for $469 — from anywhere in the world." and "One Flat Rate: $469 One-year retainer with access to CPA consultation on any U.S. tax law question".
- Review: "A CPA prepares Form 5472 and the pro-forma Form 1120, reviews for accuracy, and confirms the submission method."
- Method and turnaround: "method depends on entity type - our CPAs guide you"; "Transparent price • Secure portal • Fast turnaround". Extra years, reasonable-cause statement, proof of filing: not stated.
- Existing quote: present.

### 2.11 doola (bundle) (https://ask.doola.com/article/8a192242-...md; https://www.doola.com/pricing/; https://help.doola.com/subscription-and-add-on-service-pricing; two further help articles)
- HTTP status: 200 on all pages read (standalone article, pricing page, help-center price list, coverage article, plan article, how-to-file article, llms.txt index).
- Standalone article: "doola's standalone Tax Filing-only service costs $1,500 per year and covers your federal tax filings, including Form 5472 and the accompanying pro forma Form 1120"
- Help-center price list: "Annual IRS Tax Filing $1500 Annually" and "Tax & Compliance $1999 Annually".
- Pricing page: "Tax and Compliance Your business, straight to your inbox. $1,999/yr + State Fees".
- Coverage (hedged): "In most cases, yes - Tax and Compliance generally covers required filings for foreign-owned single-member LLCs"
- Conflicting article: "Some services are optional add-ons that may carry an extra fee, including ITIN applications, bookkeeping, Form 1099 filing, and Form 5472."
- Method (coverage article, the asterisks are the article's own Markdown bold markers): "These forms **cannot be filed electronically**. They are submitted by **mail or fax** to the IRS unit below:"
- Turnaround, past-year price, reviewer: not published. Existing quote: present.

### 2.12 Firstbase (bundle) (https://www.firstbase.io/tax-software; /pricing)
- HTTP status: 200 on both URLs.
- Price: "For Single-Member LLC owned by a non-US citizen or resident * Catch up bookkeeping available as an add-on $899.00 Annually · Per package". The pricing page shows the same package at $899 Annually.
- Package contents: "Forms 5472 Unlimited Forms 1099-NEC or 1099-MISC Pro Forma Form 1120 Obtain 6-month deadline extension".
- Process: "Full-service process by dedicated tax experts".
- Staleness: the tax-software page still carries 2025 deadline text and a 2025 copyright line, so the $899 figure may predate the current season. Method, turnaround, extra years, reviewer: not published.
- Existing quote: its two halves are on the page but not contiguous (the old quote used an ellipsis to skip the catch-up bookkeeping note). Use the contiguous quote above.

### 2.13 Clemta (https://clemta.com/pricing; /federal-tax-filing)
- HTTP status: 200 on both URLs.
- Plan: "$89/month + State fee Billed annually ($1,068)" and "Yearly state reports and IRS federal tax filings for business".
- Form 5472 and pro forma 1120 are not named on either page (0 occurrences of 5472 on both).
- Self-description: "Clemta is a software-enabled document filing and compliance support service."
- Existing quote: present. Past-year terms, turnaround, method: not published.

### 2.14 StartGlobal (https://startglobal.co/pricing/; /llc-management/federal-tax-filing/)
- HTTP status: 200 on both URLs.
- Pricing page: "Annual federal tax filing, priced by your revenue." and "Federal tax filing At any revenue, no extra fees." (Managed LLC, $149 / month).
- Federal tax page: "We prepare and e-file your federal returns, Form 1065 and K-1s". Form 5472 is not mentioned (0 occurrences of 5472 on both pages).
- Existing quote: present. Form 5472 price, method, turnaround, past years: not published.

### 2.15 Stripe Atlas (https://stripe.com/atlas, served as https://stripe.com/en-sg/atlas; https://docs.stripe.com/atlas/business-taxes)
- HTTP status: 200 on both (the fetch was redirected to the Singapore English page, where prices show as US$).
- Price and inclusions: "Incorporate for $500 and get over $50,000 in discounts" and "US$500 one-time setup fee (includes government fees and your first year of registered agent services)".
- Included list: "Company tax ID Founder equity issuance and share purchase 83(b) election filing Document templates to help you sell, hire and run your business". Form 5472 is not in the list and the string 5472 does not appear on the Atlas page or the business-taxes docs page.
- Docs page on tax help: "Atlas partners with startup-focused tax and accounting services who can help you with corporate income taxes."
- Wording discipline: say Atlas's published inclusions do not list Form 5472 preparation or filing; do not say Atlas does not offer it anywhere.
- Existing quote: its fragments are present but it used ellipses and slash separators that are not on the page. Use the contiguous quote above.

### 2.16 Northwest Registered Agent (https://www.northwestregisteredagent.com/start-a-business/irs-form-5472)
- HTTP status: 200. On 2026-10-05 the same URL returned a Cloudflare bot challenge (HTTP 403); today it returned a normal page.
- What the page is: an informational blog post, "Posted January 10, 2022" (structured data shows a last-modified date of 2024-09-04).
- Content: "IRS Form 5472 is used for US companies with significant foreign ownership, as well as foreign companies conducting business in the US." and "To determine whether IRS Form 5472 is necessary for your business, it’s a good idea to check with a CPA."
- No price, no filing service and no order link for Form 5472 appears on this page. That says nothing about whether Northwest sells such a service elsewhere on its site; no other Northwest page was checked.

---

## 3. Changes since 2026-10-05

Action items for `provider-prices.ts` and the compare page:

1. **Edetax price rises tomorrow.** The pricing and late-filing pages carry a banner: $49.99 until 15 October, $79.99 from 16 October. The comparison page would show a wrong price from 16 October unless it is re-checked that day or reworded. This survey cannot show what the page says after the rise. Re-checked on 2026-10-16 (section 7): the rise had not yet appeared on the page.
2. **5472Direct existing quote is gone.** The label Standard LLC Filing no longer appears. Price ($199 for tax year 2025) and the optional +$49 Direct Delivery are unchanged. Prior-year wording changed from a generic contact-us line to: not available in the self-serve tool yet, planned for the 2027 season. New detail: with Direct Delivery a manual review of the PDF packet is done first, usually within 1-12 hours.
3. **Northwest Registered Agent is no longer a bot-check case.** The URL loads, but it is a 2022 informational article with no price or service. The `UNVERIFIED_PROVIDERS` note (page could not be loaded, bot-check) is not true for this check; reword it, for example: the page we checked is an informational article that lists no Form 5472 price or filing service.
4. **Quotes with ellipses are not contiguous on the pages.** Existing quotes for Laramie Ledger, tax-usa.net, Firstbase and Stripe Atlas used `...` or slash separators. Replace them with the contiguous quotes in section 5.
5. **Spacing in two existing quotes.** Edetax (`$49.99 / filing`) and form5472.io (`$ 147`) match today's page only if spaces around the split price are ignored. If a strict substring match against this file is required, use the replacement quotes in section 5.
6. **New provider:** Simple5472 (section 2.1). Its $149 mail-yourself / $199 faxed current-year pair equals the $149 / $199 figures of our two tiers numerically, but the service differs: it is self-service software with no review.

Other differences observed (informational):
- Laramie Ledger: the $299 founding-client offer is no longer on the pricing, Form 5472 or past-due pages. $349 stands (it was already $349 on 2026-10-05).
- Form5472.online: unchanged prices. The add-on list now also shows $399 Same day up to 24 Hour Filing and a $299 Rush 24-48 Hour line, while the glossary on the same page still says $299 Rush 24-hour. Standard turnaround is still 10 business days on the pricing page versus 15 on the product page.
- tax-usa.net: Single-Member price unchanged at $599. The page also lists annual compliance packages at $1,050, $1,590 and $1,990 per year plus state fees, which the 10-05 survey did not record.
- form5472.io: unchanged $147 / $197; a $297 Enterprise plan and a 30-day money-back guarantee are visible (not recorded on 10-05, so unknown whether new).
- Hiltzik CPA: unchanged. The page mentions an EIN application add-on for $350.
- Form5472.ai: the pricing page text is shorter than on 10-05; $299 and $399+ unchanged.
- form5472.tax: unchanged $299; the pricing page says Updated August 2026; the home page shows an extended-deadline banner for October 15, 2026.
- Firstbase: $899 unchanged and still looks stale (2025 deadlines and copyright on the tax-software page).

Unchanged on every figure checked: form5472.tax, Form5472.ai, Laramie Ledger ($349, $449, 5 business days, +$149), Taxhub ($469), Hiltzik ($599 / $700), Firstbase ($899), doola ($1,500 standalone / $1,999), Clemta (no 5472 price), StartGlobal (no 5472 price), Stripe Atlas (no 5472 listing).

---

## 4. Could not verify / not published

| Item | Status |
|---|---|
| Edetax: price after 16 October | Banner says $79.99; the post-rise page was not seen. Whether the rise also applies to late years is not stated (the late-filing page repeats the banner). Turnaround and human review: not stated; self-described as software |
| form5472.io: extra-year price, turnaround, whether Starter includes fax | FAQ answers are JavaScript-only and not in the HTML; not published on the readable text |
| Simple5472: IRS-side or fax-side turnaround | Not stated. The pricing-page FAQ answers are not readable as text; the late-filing page FAQ (structured data) and the /faq page payload were read instead |
| 5472Direct: prior-year price | Not available self-serve yet; no price |
| form5472.tax: reviewer identity and operating entity | Not named on the pages read |
| Form5472.ai: extra-year price, turnaround, filing method | Not stated (late filings $399+ only) |
| Hiltzik CPA: filing method, turnaround, proof of filing | Not stated |
| Taxhub: extra-year price, turnaround number, filing method | Not stated |
| Firstbase: filing method, turnaround, extra years, reviewer; whether $899 is current | Not stated; page carries 2025 text |
| doola: standalone Form 5472-only price, past-year price, turnaround, reviewer; whether $1,999 plan includes Form 5472 | Not published; help articles conflict (hedged coverage versus Form 5472 listed as an optional add-on) |
| Clemta: Form 5472 price and whether Pro covers it | Form 5472 not named on pricing or federal-tax pages |
| StartGlobal: Form 5472 price and coverage | Priced by revenue with no figure; federal-tax page names Form 1065 and K-1s only |
| Stripe Atlas: Form 5472 service | Not listed on the pages read |
| Northwest Registered Agent: any Form 5472 service or price | Page loads but is an informational article; no other Northwest page checked |
| Form5472.online / Form5472.ai: reasonable-cause letter for late years | Published as a separate $499 service, not included in the $399 |
| Any provider's turnaround as a guarantee | Day counts are published only by Form5472.online, tax-usa.net, Laramie Ledger and form5472.tax; 5472Direct gives a 1-12 hour review estimate for Direct Delivery |

Provider claims about competitors (not used): Edetax, form5472.tax and 5472Direct publish comparison tables with other providers' prices; Simple5472 also publishes generic price ranges for CPAs and formation services. These are the providers' own claims about others and were not used.

---

## 5. Suggested sourceQuote per row

Each quote below was checked as a substring of text extracted from that provider's `sourceUrl` page today, is at most 25 words, and has no ellipsis. Where the existing quote is still verbatim it is repeated unchanged.

| id | sourceUrl | Suggested sourceQuote |
|---|---|---|
| edetax | https://edetax.com/pricing | "Price goes up to $79.99 on October 16. File before then for $49.99." |
| form5472-io | https://form5472.io/pricing | "Starter For solo founders running one US LLC $147 one-time payment" |
| simple5472 | https://simple5472.com/pricing | "DIY · Mail yourself $149 one-time Save $49 Bundle · We fax it $199 $248 separately" |
| 5472direct | https://www.5472direct.com/pricing | "$199 covers the preparation of one filing. $49 covers the optional IRS fax delivery." |
| form5472-tax | https://form5472.tax/pricing/ | "Form 5472 filing costs a flat $299 at form5472.tax" |
| form5472-ai | https://form5472.ai/pricing | "Form 5472 cost is $299 for an eligible straightforward foreign-owned single-member LLC filing." |
| laramie-ledger | https://laramieledgertax.com/pricing/ | "Form 5472 + 1120 Annual information return, prepared and signed by a professional tax preparer, filed by mail/fax Foreign-owned U.S. LLC (incl. dormant) $349" |
| form5472-online | https://www.form5472.online/pricing | "$448 all-in for a non-active company: $399 preparation plus $49 IRS fax submission with proof of filing." |
| taxhub | https://gettaxhub.com/form-5472-global-tax-filing/ | "We handle it end-to-end for $469 — from anywhere in the world." |
| tax-usa-net | https://www.tax-usa.net/tax-filing-non-us-residents | "Single-Member LLC: $599/year (Form 5472 + pro-forma 1120)." |
| hiltzik-cpa | https://hiltzikcpa.com/form-5472-filing-service/ | "Current-year filing $599. Preparation of one Form 5472 and the pro forma Form 1120, filed on time or on a timely extension." |
| firstbase | https://www.firstbase.io/tax-software | "For Single-Member LLC owned by a non-US citizen or resident * Catch up bookkeeping available as an add-on $899.00 Annually · Per package" |
| doola | https://ask.doola.com/article/8a192242-doola-standalone-tax-filing-only-service-pricing-and-service-details.md | "doola's standalone Tax Filing-only service costs $1,500 per year and covers your federal tax filings, including Form 5472 and the accompanying pro forma Form 1120" |
| clemta | https://clemta.com/pricing | "Yearly state reports and IRS federal tax filings for business" |
| startglobal | https://startglobal.co/pricing/ | "Annual federal tax filing, priced by your revenue." |
| stripe-atlas | https://stripe.com/atlas | "Company tax ID Founder equity issuance and share purchase 83(b) election filing Document templates to help you sell, hire and run your business" |

---

## 6. Method and limits

- Pages were fetched with `curl -sL` and a desktop Chrome user-agent (Mozilla/5.0 Macintosh Chrome/129.0), `Accept` and `Accept-Language` headers only; no cookies, logins, forms, purchases or contact. WebFetch, WebSearch and search snippets were not used as evidence. Every figure and quote above comes from text extracted from the raw HTML (the Simple5472 FAQ answers on /faq came from the FAQ structured data embedded in the page's own HTML payload; the doola help articles are served as Markdown).
- Raw HTML, extracted text and the scripts are in the session scratchpad (`.../scratchpad/price-survey-1015/{raw,text,scripts}/`), not delivered.
- Fetch log, all HTTP 200 (43 pages): edetax.com /pricing /late-filing /; form5472.io /pricing /; 5472direct.com /pricing /faq /; form5472.tax /pricing/ /; form5472.ai /pricing /form-5472-filing-service /; laramieledgertax.com /pricing/ /services/form-5472/ /services/late-5472/; form5472.online /pricing /product-page/single-member-llc-smllc; tax-usa.net /tax-filing-non-us-residents; gettaxhub.com /form-5472-global-tax-filing/; hiltzikcpa.com /form-5472-filing-service/; firstbase.io /tax-software /pricing; doola (ask.doola.com standalone, coverage, plan and how-to-file articles and llms.txt; www.doola.com/pricing/; help.doola.com price list); clemta.com /pricing /federal-tax-filing; startglobal.co /pricing/ /llc-management/federal-tax-filing/; stripe.com/atlas (redirected to /en-sg/atlas) and docs.stripe.com/atlas/business-taxes; northwestregisteredagent.com /start-a-business/irs-form-5472; simple5472.com /pricing /late-filing/form-5472 / /about /faq /terms.
- Self-check: a script extracted every double-quoted string in this file and confirmed each is a whitespace-normalised substring of the extracted text of the provider named in its section (section 2) or of the matching provider's text (section 5), and is at most 25 words. Result is reported in the session hand-off, not stored here.
- Limits: this is one fetch per page on one day from one network. Prices tied to a date (the Edetax rise on 16 October, Form5472.online's August 2026 price list, Firstbase's 2025 text) can change without notice.

## 7. Re-check: Edetax on 2026-10-16

- Fetched https://edetax.com/pricing on 2026-10-16 at 02:22 HKT (2026-10-15 18:22 UTC, 11:22 US Pacific). Same method as section 6: `curl -sL` with a desktop Chrome user-agent. HTTP 200.
- The banner is unchanged: "Price goes up to $79.99 on October 16. File before then for $49.99."
- The page still lists $49.99 per filing in the price card, the comparison table and its own Offer structured data (`"price": "49.99"`). The late-filing FAQ still reads "Late filing costs $49.99 per tax year, for any year back to 2017."
- Finding: the check ran on 16 October in Hong Kong, but it was still 15 October in the US, and the post-rise page was not live yet. The $79.99 price after the rise therefore cannot be verified from Edetax's own page today. The page also does not say whether late years rise as well.
- Action taken in `src/lib/provider-prices.ts`: kept $79.99 as the announced price from 16 October 2026, with the dated note and the banner as the source quote. No other row changed. Edetax stays out of the three-late-year table.
- Open: re-fetch after 2026-10-16 08:00 UTC (US midnight Pacific) and record what the page shows, including the late-year price.
