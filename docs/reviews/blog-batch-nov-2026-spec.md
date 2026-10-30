# House spec — November 2026 blog batch (10 posts)

Every writer lane follows this file exactly. It is the contract the repo guards enforce.

## Hard rules

1. **Frontmatter shape — exactly these keys, in this order:**

```
---
title: "<human, searchable, may exceed 60 chars>"
seoTitle: "<REQUIRED whenever title is longer than ~44 chars>"
description: "<<=160 characters, hard limit>"
date: 2026-10-30
publishAt: auto
updated: 2026-10-30
author: "Form5472 Prep"
tags: ["form-5472", "<3-4 more kebab-case tags>"]
draft: false
---
```

   - `publishAt: auto` is literal. The orchestrator runs `npm run blog:schedule`
     afterwards, which rewrites it to a real slot. Never hand-write a UTC offset.
   - **The guard that fails most often** (`src/lib/seo-title.test.ts`):
     `fitTitle(seoTitle ?? title).length <= 60` and `description.length <= 160`.
     `fitTitle` appends " · Form5472 Prep" (16 chars) only if the result still fits,
     so keep `seoTitle` **<= 43 characters** to earn the brand suffix. Count the
     characters; do not estimate.

2. **Never hard-code our own prices.** Use tokens, which the loader swaps for the
   live figure:
   `{{price.standard}}` ($149 Standard) · `{{price.express}}` ($199 Express) ·
   `{{price.additionalYear}}` ($99 each extra past year) · `{{price.ein}}` ($149) ·
   `{{price.itin}}` ($349). Arithmetic is allowed: `{{price.standard - 79}}`.
   A literal "$149"/"$199"/"$99"/"$349" outside a token fails
   `src/lib/blog-price-tokens.test.ts`.
   **There is NO token for the $79 Form 7004 extension service.** Do not state its
   price at all — link to `/form-7004-extension` and let that page carry the figure.

3. **Fixed wording, no paraphrasing:**
   - Express is "ready for you to check and sign within 24 hours, 7 days a week".
     **Never** "filed within 24 hours" or "faxed within 24 hours" — the fax goes out
     after the client signs.
   - Our reviewer is "a tax accountant who holds an IRS PTIN". **Never**
     "IRS-approved", "IRS-licensed", "our CPAs", or any claim of CPA status.
   - Standard turnaround is "5-7 business days".
   - `855-887-7737` is the **IRS Ogden fax line**. Never present it as our phone number.

4. **Never invent a statistic, study, quote, form line number, dollar figure or
   deadline.** Every factual claim must be verified this session against a primary
   source you actually fetched — irs.gov, the form's own instructions, or a state
   `.gov` page. A statistic must carry number + population + action + timeframe +
   named source, inline. If you cannot verify a figure, omit it or state the
   uncertainty in the text. A wrong IRS deadline or penalty figure on a commercial
   tax site is the worst possible failure mode: prefer "the instructions do not
   state" over a confident guess.
   - When a government page contradicts another government page, say so in the post
     and cite the one you are relying on.

## Structure (SEO + AEO + GEO)

- **Answer block first**: immediately after the frontmatter, one bold paragraph of
  **40-60 words** that answers the title question flatly and quotably, with no
  marketing. Count the words.
- **Question-form H2s** that mirror how people search ("How much does X cost?",
  not "Pricing").
- **Atomic chunks**: one concept per section, and no cross-section pronouns. Banned:
  "as discussed above", "this approach", "it does this". Restate the noun, because an
  answer engine may surface the section with zero surrounding context.
- **One extractable asset** per post: a comparison table, a numbered process, or a
  worked calculation. Comparison intent gets a table.
- **FAQ**: a `## Frequently asked questions` section with 6-7 `###` questions, each
  answered in <=50 words.
- **Links**: a contextual internal link to the post's conversion target inside the
  first screen *and* again near the close; at least one link to a related existing
  post (check `content/blog/` for the exact slug — linking a slug that does not
  exist renders as plain text); 2-4 external links to authoritative sources.
- Length 1,400-2,200 words. Close with a short takeaway, then this exact line:
  `*Educational content only; not tax or legal advice.*`

## Before you write

- `ls content/blog/ | grep -i <keyword>` and confirm your slug and angle are not
  already taken. 197 posts exist. If your assigned angle duplicates an existing
  post, say so in your report and pick the nearest genuinely open angle instead of
  writing a near-duplicate — cannibalisation is a real cost on this site.

## Your lane's boundaries

- You own **only** the `content/blog/<slug>.md` files named in your brief.
- Do **not** touch `scripts/render-blog-artwork.mjs`, `src/lib/blog.ts`, any other
  source file, or any other post. The orchestrator owns those.
- Do **not** run any `git` command. The orchestrator commits.

## Before you report

Run, from the worktree root:

```
npx vitest run src/lib/seo-title.test.ts src/lib/blog.test.ts src/lib/blog-price-tokens.test.ts
```

All must pass. If a guard fails on your file, fix it and re-run.

## Report format

For each post: slug · exact title · exact seoTitle + its character count · description
character count · word count · the primary query it targets · the conversion target ·
every external source URL you actually fetched and what fact it supports · anything
you could not verify and how you handled it. Then the guard result as the final line.
