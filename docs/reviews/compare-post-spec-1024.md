# Spec — three-way comparison post (2026-10-24)

Slug: `content/blog/form-5472-filing-service-comparison.md`
Title: `Form 5472 Filing Services Compared: $79, $149 or $547?`
Conversion target: **`/start`**. Publishes immediately (**no `publishAt`**).

## Verified pricing — fetched from each provider's own page on 24 October 2026
Every figure below was read off the live page today. **Do not use a number that is not
in this block, and stamp the table "checked 24 October 2026".**

**form5472prep.com (us)** — from `src/lib/pricing.ts`:
- Standard **$149**, ready in 5-7 business days.
- Express **$199**, *ready for you to check and sign within 24 hours, 7 days a week*.
- **+$99** per additional past tax year. IRS fax delivery included on both.
- Reviewed by a **tax accountant who holds an IRS PTIN**. EIN $149, ITIN $349.
- **NEVER** write "filed/faxed within 24 hours" and never "IRS-approved" or "licensed".

**snapfile.tax (also ours)** — from snapfile.tax and snapfile.tax/pricing:
- **AI review $79** one-time: Form 5472 + pro forma 1120 from your answers, "AI system
  review for completeness and consistency", reasonable-cause statement when needed,
  online signature, fax to the Ogden PIN Unit, timestamped receipt, automatic retry if
  the first fax fails, optional annual reminders. Additional past year **+$69**.
- **Human review $149**: snapfile.tax states verbatim *"Offered and fulfilled by
  Form5472Prep.com. You'll continue on their website."* and *"Review by a PTIN-holding
  tax accountant"*, 5-7 business days.
- Snapfile's own page frames the choice: *"Choose Snapfile for fast preparation with an
  AI system review, or continue to Form5472Prep.com when you want a tax accountant to
  review the filing."*
- Footer: *"Snapfile is operated by Horizons Furness LLC."*

**form5472.online (competitor)** — from their home page:
- **$399** flat, "FORM 5472 — CPA PREPARED & FILED", Form 5472 + pro forma 1120.
- **+$49** for "IRS submission + confirmation".
- *"Total if filed with the IRS: $448 (All-In)"*.
- *"With reportable activity: $547 (All-In Active)"*.
- Claims "CPA-prepared, reviewed & signed" and "U.S.-licensed CPA (verified)".
- Quote their figures; attribute them; do not characterise their service beyond what
  their page says. No disparagement, no claims about their quality or their staff.

## The spine of the post — it must be true, not flattering
A price ladder, cheapest to dearest, with who reviews the filing at each rung:
**$79 AI system review (Snapfile) → $149 human tax accountant holding an IRS PTIN
(Form5472 Prep, which is also Snapfile's human tier) → $448-$547 CPA-prepared
(form5472.online)**.

Position **Form5472 Prep as the best value** on this honest basis, never on being
cheapest — it is not cheapest and a reader can check that in one click:
- a human tax accountant reviews it, not a machine;
- Express gets the package ready to sign within 24 hours when a deadline is close;
- catch-up years at +$99 each, plus EIN ($149) and ITIN ($349) if those are still missing;
- partner accounts for firms filing for several clients.
Say plainly that **Snapfile at $79 is the right choice** for one straightforward year
where the owner is happy with an AI system review — recommending against ourselves where
it is true is what makes the rest of the post credible.

## Required disclosure — non-negotiable
State in the table row **and** again near the close that **Snapfile and Form5472 Prep are
the same team**, and that Snapfile's $149 human tier is fulfilled by Form5472 Prep —
quoting snapfile.tax's own sentence. A three-way comparison where two rows are ours
reads as independent otherwise. Do not bury it in a footnote.

## The "do you need a CPA?" section — sourced, not opinion
Fetch <https://www.irs.gov/tax-professionals/understanding-tax-return-preparer-credentials-and-qualifications>
and quote it: any tax professional with an IRS PTIN is authorised to prepare federal tax
returns. Then make the narrow, true argument:
- Form 5472 is an **information return** about transactions between the LLC and its
  foreign owner — not a judgement about the owner's tax position.
- The IRS requires a **PTIN** for a paid preparer; it does not require a CPA licence.
- So paying a CPA premium for this particular form buys a credential the form does not
  require.
**Then be fair, in the same section:** name what a CPA or EA genuinely is worth paying
for — a treaty position, Form 1040-NR or 1120-F, transfer pricing, an IRS examination,
representation before the IRS (a PTIN-only preparer has no representation rights). Do
**not** tell a reader they do not need a professional; give the distinction and let them
choose. Link `/blog/file-form-5472-for-clients-without-being-a-cpa` if it exists.

## Structure (AEO/GEO/SEO)
- Bold **40-60 word** answer block first: the three price points, who reviews at each,
  and the one-line recommendation. This is the passage an answer engine lifts.
- `/start` inside the first screen and again near the close.
- Question-form `## ` H2s, answer-first, one concept each, no cross-section pronouns.
- **The comparison table is the extractable asset**: columns = price · what's included ·
  who reviews it · turnaround · best for. Three rows plus a "checked 24 October 2026"
  note under it.
- A second original asset: a **"what the form actually asks"** breakdown — the parts of
  Form 5472 and the four required items on the pro forma 1120 (name, address, items B
  and E), sourced to the IRS instructions, so "is a CPA necessary" is answered by the
  form itself.
- `## Frequently asked questions`: 6-7 `### ` questions, each answer **≤50 words**.
- Visible "Last updated" is handled by frontmatter `updated`.
- 3-5 internal links, each `ls`-confirmed: `/start`, `/pricing`, `/compare`,
  `/blog/form-5472-cost`, `/blog/form-5472-diy-vs-preparer`,
  `/blog/how-to-fill-out-form-5472`. **Link `/compare`** — it already covers the wider
  field including form5472.online, and this post must not contradict it.
- 2-4 external links: irs.gov plus the two provider pages whose prices you quote.
- Body **1,900-2,300 words**.

## Frontmatter
```
title / description (<=160) / date: 2026-10-24 / updated: 2026-10-24 /
author: "Form5472 Prep" / tags (4-5) / draft: false
```
Add `seoTitle` if the title exceeds 60 characters (a guard test enforces
`fitTitle(seoTitle ?? title).length <= 60`). **No `publishAt`** and no `utm_`.

## House facts
Pro forma Form 1120 with "Foreign-owned U.S. DE" across the top, only name/address and
items B and E required; cannot be e-filed; fax 855-887-7737 or the Ogden PIN Unit;
$25,000 penalty, a substantially incomplete form counts as a failure to file, and the
additional $25,000 runs per related party per 30-day period after 90 days from IRS
notification; a fax receipt is transmission evidence, not IRS acceptance; we are not a
CPA firm and do not give tax advice. Last line exactly:
`*Educational content only; not tax or legal advice.*`

## Gate
utm=0 · no `^# ` H1 · FAQ 6-7 with every answer <=50 words · >=3 table rows ·
1,900-2,300 words · `/start` >=2 with one in the first 25% · every internal link exists ·
every external link 200 · no claim beyond the verified pricing block · Snapfile
relationship disclosed twice · no "filed within 24 hours" · no "IRS-approved/licensed".
