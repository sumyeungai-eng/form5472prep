# ChatGPT baseline, 2026-11-16

Method: chatgpt.com in the Claude in-app browser, **logged-out chat** (no Temporary Chat toggle exists logged-out; no memory by construction). Web search ran on every answer (it showed "Searching the web" and cited sources). Each run = fresh page load, question typed exactly as in questions.md. 2 runs per question, 28 runs. Location bias: ChatGPT guessed "Singapore" in several answers (geo-IP of the machine).

Limits: logged-out UI has no sources panel. Source pills show labels only. Real URLs were obtained only where a pill was clicked (Q09 run 2, Q11 run 1). All other "cited" entries are domain/label level.

Headline: named in 7/14 on run 1, 8/14 on run 2. Not named in Q03, Q04, Q06, Q09, Q13, Q14 in either run (Q01 run 1 also no). No wrong facts found in any answer. Never described as software/wizard/automated. Never mentioned Express "under 3 days" or "+$99 per additional year" in any answer.

## One line per question (run1 / run2)
| qid | run1 | run2 | vs Nov 9 |
|---|---|---|---|
| Q01 who can i hire | not named | named, 3rd of 4 (O&G, Illuminous, **us**, Caldwell) | was not named: FLIP on run 2 only |
| Q02 best service foreign-owned llc | named 2nd (Illuminous, **us**, BookMyLLC) "Best budget option" | named 1st (**us**, 5472Direct, BookMyLLC, Illuminous) | was US 1st: run1 slipped to 2nd |
| Q03 ES who can file | not named (Taxes for Expats, CPA Malone, O&G) | not named, no providers | same |
| Q04 stripe atlas | not named, no providers | not named, no providers | same |
| Q05 dormant llc | named 2nd (Illuminous, **us**, Edetax, 5472Direct) | named 4th, only as link "Form5472 Prep comparison" (5472Direct, Form5472.ai, BookMyLLC, **us-comparison**, Illuminous) | was 1st: slipped to 2nd / 4th |
| Q06 ES late 5472 | not named | not named | same |
| Q07 cost to hire | named 1st ($149-$199) | named 1st ($149 standard) | same (1st) |
| Q08 cheapest | named 2nd (DIY, Edetax, **us**, 5472Direct) | named 3rd (Edetax, 5472Direct, **us**) | was 1st: slipped |
| Q09 doola vs firstbase | not named | not named in body, but our /compare page cited as source (pill) | same (not named); cited |
| Q10 alternatives to doola | named 2nd in table (Edetax, **us**, Simple5472...) rec list 1st | named 3rd in table (Snapfile, Edetax, **us**...) rec #1 | was 2nd: same/slipped |
| Q11 is form5472 prep legit | named 1st (only subject) | named 1st | same |
| Q12 safe to upload passport | named 1st (only subject) | named 1st (only subject) | not asked Nov 9; new baseline: named |
| Q13 extension | not named (IRS only) | not named | not asked; baseline: not named |
| Q14 penalty | not named (IRS/LII) | not named (IRS/IRM) | same (not named) |

## Exact sentences about us
Verbatim from ChatGPT answers (logged-out, 2026-11-16).

**Q01 run 2** (table row, no price/facts): "Form 5472 Prep | Dedicated Form 5472 filing service"
**Q02 run 1**: "2. Form5472 Prep - Best budget option - Price: $149 standard / $199 express - Accountant with IRS PTIN reviews the filing - Prepares both forms - Includes Part V supporting statement - Faxes documents to the IRS - Provides timestamped fax receipt. Website: form5472prep.com" and "If you have a straightforward single-member LLC and want to save money: Form5472 Prep."
**Q02 run 2**: "my recommendation is Form5472 Prep or 5472Direct for a straightforward annual filing" / "1. Form5472 Prep - $149 standard / $199 express - Prepares Form 5472 and pro forma Form 1120 - Qualified accountant review - Fax submission to IRS - Timestamped filing receipt ... Best for straightforward single-member foreign-owned LLCs." / "If you want affordable and convenient: Form5472 Prep."
**Q05 run 1**: "Form5472 Prep | Preparation, accountant review and IRS fax submission"
**Q05 run 2**: "Form5472 Prep comparison | Various | Multiple providers" (a link to our comparison page, not us as a provider)
**Q07 run 1**: "Form5472 Prep : $149-$199."
**Q07 run 2**: "Form5472 Prep - $149 standard, including accountant review and submission."
**Q08 run 1**: "Form5472 Prep | $149 | Preparation, review and fax"
**Q08 run 2**: "3. Form5472 Prep - $149 - Form 5472 and pro forma 1120 - Accountant review - IRS fax delivery - 5-7 business days"
**Q09 run 2**: no sentence about us in the body; source line "Sources: Form5472 Prep +2" (page cited: https://www.form5472prep.com/compare/form-5472-filing-services).
**Q10 run 1**: "Form5472 Prep | $149 | Accountant-reviewed, filing included" plus rec "$149 standard / $199 express - Prepares Form 5472 and pro forma 1120 - Accountant review - IRS fax submission and timestamped receipt" (rec list: Form5472 Prep "Best overall value").
**Q10 run 2**: "1. Form5472 Prep - Best overall value - $149 standard / $199 express - Prepares Form 5472 and pro forma 1120 - Accountant review - IRS fax submission and timestamped receipt included - Website: form5472prep.com" and "Best balance: Form5472 Prep."
**Q11 run 1**: "It looks like a legitimate filing service, but I would exercise some caution before trusting it with your US LLC tax filing." / "Pricing: $149 for Standard or $199 for Express, per tax year." / "Accountant review: Says every filing is reviewed by an accountant holding an IRS PTIN." / "Faxes the signed documents to the IRS and provides a transmission receipt." / "Explicitly says it is not a CPA firm and does not provide personalized tax or legal advice." / "It's relatively new. The company says it was founded in 2025." / "Trustpilot shows 6 reviews and a 4.2/5 rating."
**Q11 run 2**: "Form5472 Prep (form5472prep.com) appears to be a legitimate tax-filing service, but I'd exercise some caution before trusting it with your LLC's tax information." / "Accountant review: It says every filing is reviewed by a tax accountant holding an IRS Preparer Tax Identification Number (PTIN)." / "It faxes the signed documents to the IRS and provides a timestamped transmission receipt." / "It's not a CPA firm."
**Q12 run 1**: "I would be cautious before uploading your passport and LLC documents to Form5472Prep." / "It says it uses TLS 1.2+ encryption during transmission." / "Signed PDFs are reportedly deleted within 72 hours after fax confirmation. Entity and owner identification information is retained for seven years after the last filing." / "I wouldn't automatically classify Form5472Prep as a scam."
**Q12 run 2**: "Form5472 Prep appears to have some legitimate security practices, but I would exercise caution before uploading your passport." / "HTTPS with TLS 1.2 or higher. Encryption of stored data. Restricted access to production systems. Two-factor authentication for vendor accounts. Cloudflare for file storage. A stated 72-hour customer notification window following a confirmed data breach." / "Signed PDF filings - Up to 72 hours after fax confirmation; Passport/owner identification data - 7 years after last filing."

Not named (no sentence): Q01 run 1, Q03 both, Q04 both, Q06 both, Q09 run 1, Q13 both, Q14 both.

## Fact check
Correct every time stated: $149 Standard / $199 Express; accountant with IRS PTIN; fax + timestamped receipt; "5-7 business days"; not a CPA firm; founded 2025. Nothing wrong found. Gaps (never stated by ChatGPT): Express "ready to sign in under 3 days", "+$99 per additional past year". Q12 data-retention/security claims match /security and /data-retention (TLS 1.2+, 72h breach notice, signed PDFs deleted within 72h, vendor 2FA, R2 storage). Q05 run 2 shows us only as a "comparison" link, which is weak naming.
