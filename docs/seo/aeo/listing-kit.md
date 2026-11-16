# Listing kit: one source for every outside listing

Date: 2026-11-16. Source of truth for facts: src/lib/pricing.ts and src/lib/faq.ts. If a price changes, update this file first, then each listing in third-party-ledger.md.
Rules: never say CPA, licensed or IRS-approved about us; never "best", "cheapest" or "#1"; no promised outcomes.

## Name, URL, contact
- Name: Form5472 Prep (also written Form5472 Prep; domain form5472prep.com)
- URL: https://www.form5472prep.com
- Contact: support@form5472prep.com
- Logo: public/logo.svg (vector), public/logo-mark-512.png (512 px square mark), public/favicon-32x32.png. Public URL form: https://www.form5472prep.com/logo-mark-512.png (confirm it loads before pasting).

## Short descriptions
**25 words**
Form5472 Prep prepares Form 5472 and the pro forma 1120 for foreign-owned single-member US LLCs. A PTIN-holding accountant reviews each. From $149 per tax year.

**50 words**
Form5472 Prep is a done-for-you filing service for foreign-owned single-member US LLCs. You complete a guided intake form, our team prepares Form 5472 and the pro forma 1120, a PTIN-holding tax accountant reviews it, you check and sign, and we fax it to the IRS. From $149 per tax year.

**150 words**
Form5472 Prep is a done-for-you filing service for foreign-owned single-member US LLCs that must file Form 5472 with a pro forma Form 1120. You answer a guided intake form (about 15 minutes). Our team prepares both forms, and a tax accountant who holds an IRS PTIN reviews the package. You check and sign online, then we fax it to the IRS Ogden PIN Unit and send you the fax receipt. Standard is $149 per tax year, ready to sign in 5-7 business days. Express is $199, ready to sign in under 3 days. Each additional past tax year adds $99. It is a one-time fee with no subscription. We also offer a Form 7004 extension for $19, EIN help for $149 and ITIN help for $349. We are not a CPA firm, give no tax advice and do not represent clients before the IRS.

## Price lines (paste as needed)
- Standard: $149 per tax year, ready to sign in 5-7 business days.
- Express: $199 per tax year, ready to sign in under 3 days.
- Past years: +$99 per additional past tax year.
- Extension: Form 7004, $19.
- EIN: $149. ITIN: $349.
- One-time fee, no subscription.
- Short form: "From $149 per tax year (Standard) or $199 (Express). One-time fee."

## Included
- Guided intake form (about 15 minutes)
- Form 5472 and pro forma Form 1120 prepared by our team
- Review by a tax accountant who holds an IRS PTIN
- You check and sign online
- Fax to the IRS Ogden PIN Unit, plus the fax receipt
- Partner / white-label option: the partner sends intake and signing links, we never email the partner's clients, the partner pays per filing

## Not included
- No tax advice or tax planning
- No IRS representation (for example answering IRS letters on your behalf)
- Not a CPA firm
- Not do-it-yourself software

## Category suggestions
Tax filing services; Tax preparation; Business compliance; Legal and compliance services for foreign founders; Startup tools (non-US founders); Form 5472 / foreign-owned LLC compliance.

## Tags
form 5472, pro forma 1120, foreign-owned LLC, single-member LLC, non-US founder, Stripe Atlas, Form 7004, IRS Ogden fax

## Wording for "what does it do" fields (one line)
Done-for-you Form 5472 and pro forma 1120 filing for foreign-owned single-member US LLCs, reviewed by a PTIN-holding tax accountant.

## Price check (run 2026-11-16)
Command: `grep -o '\$[0-9,]*' listing-kit.md | sort | uniq -c`
Amounts found: $149 (Standard, EIN), $199 (Express), $99 (per additional past year), $19 (Form 7004), $349 (ITIN). Each matches the facts and src/lib/pricing.ts (14900, 19900 Express, 1900 extension, EIN 14900, ITIN 34900; +$99 add-on). Turnarounds "5-7 business days" and "under 3 days" match STANDARD_TURNAROUND / EXPRESS_TURNAROUND. No other dollar figure appears. Word counts: 25-word = 25, 50-word = 50, 150-word = 144. Result: MATCH. No "CPA firm" claim (only "not a CPA firm"), no "licensed", "IRS-approved", "best", "cheapest", "#1".
Limit: the check is a grep against the facts in the brief and pricing.ts, not a script wired into the repo.
