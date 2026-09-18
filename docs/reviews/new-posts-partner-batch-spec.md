# Blog batch spec — partner / agent / firm-account cluster (2026-09-18)

Conversion target for **every** post in this batch: **`/partners`** (the partner
application form). Secondary link for existing partners: `/partner/sign-in`.
One primary CTA per post. Do not also push `/start` as a primary CTA — that is the
direct-customer path and dilutes the partner conversion.

Five posts already cover the cluster and must NOT be duplicated:

| Existing slug | Owns |
|---|---|
| `form-5472-partner-program-how-it-works` | program overview / operating model |
| `form-5472-partner-program-registered-agents` | registered-agent audience |
| `form-5472-partner-program-company-formation-agents` | formation-agency audience |
| `form-5472-white-label-vs-standard-partner` | standard vs white-label choice |
| `white-label-form-5472-filing-accounting-firms` | white label for accounting firms |

This batch takes five *different* queries: pricing-your-own-service, multi-client
operations, in-house vs outsourced, client intake, and preparer-credential rules.

---

## Verified program facts (single source: the live `/partners` page)

Use these. Do not invent, extrapolate or soften them.

- Audience: formation agencies, registered agents, CPA/accounting firms, consultants
  managing US LLCs for multiple foreign-owned clients.
- Sign-up: short application form on `/partners`. Accounts are approved **manually,
  typically about one business day**. Sign-in is **passwordless** — a secure email link.
- Pricing is **identical to direct customers**: **$149 Standard (ready in 5–7 business
  days)**, **$199 Express (within 3 business days)**, **+$99 per additional past tax
  year** on either tier. **IRS fax delivery included. No platform fee, no subscription.**
  Each filing is paid individually at checkout.
- The filing work and the accountant review are **the same on both tiers** — only
  speed differs.
- **Volume pricing and consolidated invoicing are "available on request"** via
  support@form5472prep.com. **Never state a specific volume discount, tier table,
  commission rate, referral fee or revenue share — none is published and none exists.**
- A partner's own margin comes from whatever the partner charges its own client.
  Frame it that way. Never imply we pay the partner anything.
- Dashboard: start one filing per client LLC, send the client a secure
  review-and-sign link, track preparation / signature / submission, and see the
  provider fax receipt per filing. One login, filings grouped under the account.
- Signature: the **person authorized to sign for the client LLC** signs, in-browser,
  once; the signature is embedded into every required box on the printable PDF. A
  wet-ink route (print, sign, upload) exists if the client prefers. The partner does
  not sign for the client.
- White label: **available by request for approved partners**. When enabled, the
  partner brand name and reply-to address appear on those client emails instead of
  ours. Scope is agreed during partner approval. It is not automatic and not
  "everything rebranded".
- Client emails in the standard flow come from Form5472 Prep: sign link, filing
  confirmation, IRS fax receipt.
- A provider-reported fax result is **transmission evidence, not IRS acceptance of
  the return**. Say so wherever the receipt is mentioned.
- Company posture: **we are not a CPA firm and do not give tax advice.** We prepare
  and submit the information return; every package is reviewed by a **qualified tax
  accountant**. Never write "our CPAs", "we advise", or any credential we do not hold.
- Filing route facts: Form 5472 for a foreign-owned US DE attaches to a **pro forma
  Form 1120**, **cannot be e-filed**, and goes by fax to **855-887-7737** or by mail to
  the IRS Ogden PIN Unit (1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT
  84201). `855-887-7737` is the **IRS fax line** — never present it as our phone number.
- Penalty: the IRS instructions state a **$25,000** penalty may apply for failure to
  file when due and in the prescribed manner, a substantially incomplete Form 5472, or
  failure to maintain required records. Not automatic for every mistake.

---

## Shared contract (every file)

Frontmatter exactly this shape, nothing extra:

```
---
title: "…"
description: "…"            # <=155 chars, contains the answer + a reason to click
date: 2026-09-18
updated: 2026-09-18
author: "Form5472 Prep"
tags: ["partner-program", …]  # 3–4 tags, kebab-case, reuse existing tags where possible
draft: false
---
```

- **No `^# ` H1 anywhere in the body.** The page renders the title from frontmatter.
- **No `utm_` parameters in any internal link.** First-touch attribution means internal
  utm links record nothing and only uglify the URL. Plain paths: `/partners`, `/pricing`.
- Body opens with a **bold 40–60 word direct answer block**, factual, quotable with
  zero surrounding context.
- A contextual `/partners` link inside the **first screen** (within the first ~3
  paragraphs) and again near the close.
- **Question-form `## ` H2s.** One concept per section, each leading with its answer.
  No cross-section pronouns ("as above", "this approach").
- **At least one markdown table** and, where the intent is procedural, a numbered list.
- **At least one proprietary/original asset** — a worked calculation, a decision
  matrix, a questionnaire, a capacity model. Named per post below.
- Every external stat: number + population + action + timeframe + named source, with
  an inline link to a primary source (irs.gov, fincen.gov, .gov, or an official
  standards body). **2–4 external links, all primary sources. Nothing invented.**
- `## Frequently asked questions` with **6–7** `### ` question H3s, each answered in
  **≤50 words**.
- End with a `---` rule, then a two-to-three sentence close containing the final
  `/partners` CTA and one related-post link.
- 1,600–2,100 words of body. British-influenced neutral register, second person for the
  reader ("your firm"), first person plural for us ("we prepare"). No hype, no
  "unlock", no "seamless", no em-dash-free rule — normal prose.
- Prices come from the verified list above only. Never hardcode a price we do not
  publish.

### Internal links available (verified to exist — use 3–5 per post, no others)

`/partners` · `/partner/sign-in` · `/pricing` · `/ein` · `/itin` ·
`/blog/form-5472-partner-program-how-it-works` ·
`/blog/form-5472-white-label-vs-standard-partner` ·
`/blog/white-label-form-5472-filing-accounting-firms` ·
`/blog/form-5472-partner-program-registered-agents` ·
`/blog/form-5472-partner-program-company-formation-agents` ·
`/blog/form-5472-deadline-2026` · `/blog/form-5472-extension` ·
`/blog/amended-form-5472-correcting-errors` · `/blog/form-5472-filed-late-never-filed` ·
`/blog/form-5472-recordkeeping-checklist` · `/blog/how-to-fill-out-form-5472` ·
`/blog/multiple-related-parties-form-5472` ·
`/blog/form-5472-pro-forma-1120-signature` ·
`/blog/form-5472-penalty-notice-what-to-do` ·
`/blog/form-5472-irs-receipt-confirmation-status` ·
`/blog/foreign-owned-llc-filing-requirements-checklist` ·
`/blog/form-5472-dormant-llc-no-income` · `/blog/first-year-form-5472-new-llc` ·
`/blog/form-5472-diy-vs-preparer` · `/blog/form-5472-cost` ·
`/blog/itin-required-form-5472` · `/blog/ein-for-foreign-owned-llc-without-ssn`

Close with the standard line: `*Educational content only; not tax or legal advice.*`

---

## The five assignments

### A — `content/blog/offer-form-5472-filing-as-a-service.md`
Primary query: **"how to offer Form 5472 filing as a service"** (agency owner,
commercial intent).
Title: `How to Offer Form 5472 Filing as a Service to Your Clients`
Own: productising the filing — who it suits, how to scope the offer, how to price it
to your own clients, how to write the client-facing description, what to exclude.
Required table: an offer-scoping table (what your firm does / what we do / what the
client does).
**Proprietary asset:** a worked unit-economics example — partner charges its own
client a stated fee, our Standard fee is $149, show the arithmetic per filing and
across a 20-client book, and state plainly that the client fee is the partner's own
commercial decision and that we pay no commission.
Must include: the no-platform-fee / no-subscription point, and a warning against
advertising tax advice the firm is not qualified to give.

### B — `content/blog/file-form-5472-for-multiple-clients.md`
Primary query: **"how to file Form 5472 for multiple clients"** (operations).
Title: `How to File Form 5472 for Multiple Clients Without Losing Track`
Own: the multi-client operating rhythm — building the client list, the deadline
calendar, chasing signatures, evidencing each submission, closing the season out.
Required: a numbered season workflow **and** a table mapping each stage to the
artefact that proves it is done.
**Proprietary asset:** a capacity model — minutes of partner hands-on time per
filing and what a 10 / 25 / 50-client book implies in working days, with the
assumption stated.
Must include the deadline facts (calendar-year regular due date generally April 15;
Form 7004 via the special DE instructions) with a link to
`/blog/form-5472-deadline-2026`, and the receipt-is-not-acceptance point.

### C — `content/blog/form-5472-in-house-vs-outsourced-firm.md`
Primary query: **"should my firm prepare Form 5472 in-house or outsource it"**
(comparison / build-vs-buy).
Title: `Form 5472 In-House or Outsourced: How Firms Should Decide`
Own: the honest comparison. Not a sales pamphlet — state clearly when in-house wins
(high volume, existing 1120 practice, staff already trained).
Required: a side-by-side decision table across setup effort, per-filing cost, review
depth, submission evidence, liability, and what breaks at volume.
**Proprietary asset:** a five-question decision test that resolves to a
recommendation, plus a true-cost-of-in-house breakdown that names the cost lines
(staff time, training, fax infrastructure, receipt retention, error rework) without
inventing dollar figures for them.
Must include the $25,000 / substantially-incomplete point as the reason review depth
matters, and link `/blog/amended-form-5472-correcting-errors`.

### D — `content/blog/form-5472-client-intake-checklist-for-firms.md`
Primary query: **"Form 5472 client information checklist"** / what to collect from a
client before filing (practical, high intent, weak existing answers).
Title: `What to Collect From a Client Before Filing Their Form 5472`
Own: the intake itself. This is the most extractable post in the batch — make the
checklist the centre of the page.
Required: a field-by-field intake table (field · why it is needed · where the client
finds it · common failure), covering at minimum the LLC legal name and EIN, formation
state and date, tax year, the foreign owner's name, address, country of citizenship
and tax residence, FTIN or the reference ID where there is no US identifying number,
every related party, the reportable transaction categories with amounts, year-end
total assets, and who is authorised to sign.
**Proprietary asset:** a copy-paste client request email the firm can send, plus a
"do not start until you have these four" shortlist.
Must include: EIN missing → link `/blog/ein-for-foreign-owned-llc-without-ssn` and
`/blog/form-5472-ein-pending-deadline` is NOT in the link whitelist so use
`/blog/first-year-form-5472-new-llc` instead; ITIN question →
`/blog/itin-required-form-5472`; records → `/blog/form-5472-recordkeeping-checklist`.

### E — `content/blog/file-form-5472-for-clients-without-being-a-cpa.md`
Primary query: **"can I file Form 5472 for clients without being a CPA"**
(gating objection — the single highest-intent query in the cluster).
Title: `Can You File Form 5472 for Clients Without Being a CPA?`
Own: the credential question. **This post carries the most factual risk in the batch.
Every regulatory statement must be verified against a primary IRS source and linked.**
Research and verify before writing:
- who may prepare a federal return or claim for refund for compensation, and what a
  **PTIN** is required for (IRC §6109(a)(4) / the IRS PTIN pages);
- what **unenrolled** preparers can and cannot do, and the limits on representation
  before the IRS (Circular 230 / the IRS "Understanding Tax Return Preparer
  Credentials and Qualifications" page);
- that Form 5472 is an **information return** attached to a pro forma Form 1120, and
  what the Form 5472 instructions actually say about who signs.
If a point cannot be verified from a primary source, **write that it is unverified
and tell the reader to confirm with their own adviser** — do not fill the gap.
Required: a table of roles (unenrolled preparer · EA · CPA · attorney) against what
each may do, sourced.
**Proprietary asset:** a three-branch decision path — coordinate only / prepare for
compensation / represent the client — mapping each branch to what it requires.
Frame the partner program as the route for a firm that wants to coordinate the filing
without becoming the paid preparer of record, and state our own posture plainly: we
are not a CPA firm, we do not give tax advice, a qualified tax accountant reviews each
package. Close with a clear "this is not legal advice on your licensing position"
caveat in addition to the standard disclaimer.

---

## Acceptance gate (per file, all must pass)

1. `grep -c 'utm_' <file>` → 0
2. `grep -c '^# ' <file>` → 0
3. `grep -c '^## Frequently asked questions' <file>` → 1, with 6–7 `### ` under it
4. `grep -c '^|' <file>` → ≥3 (a table exists)
5. Body word count 1,600–2,100
6. `/partners` appears at least twice, once in the first 25% of the file
7. Every `](/…)` internal link is on the whitelist above
8. Every `](http…)` external link is a primary source and returns 200
9. No unpublished price, no commission/revenue-share claim, no CPA claim for us
10. Closing line is `*Educational content only; not tax or legal advice.*`
