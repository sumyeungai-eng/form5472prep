# Blog batch 6 spec — 2026-10-03 — ten posts, drip-published one per day

Conversion target for all ten: **`/start`**.

## Scheduling — use the drip system, do not hand-write dates
Per `docs/sessions/2026-10-03-blog-scheduling.md`, every post in this batch carries:

```
publishAt: auto
```

The orchestrator then runs `npm run blog:schedule`, which assigns each post the next
free daily slot at **09:00 London**, weekends included, and rewrites `publishAt` and
`date` in place. **Writers must not invent a date or a UTC offset** — no `-04:00`, no
guessed ISO string. A literal `auto` left in a shipped file fails the guard test, so the
orchestrator owns running the scheduler before committing.

Frontmatter shape for every post (nothing else):
```
---
title: "…"
description: "…"            # <=155 chars, the answer plus a reason to click
date: 2026-10-03            # the scheduler rewrites this
publishAt: auto
updated: 2026-10-03
author: "Form5472 Prep"
tags: ["…", "…", "…", "…"]  # 4–5, kebab-case
draft: false
---
```

**Cross-links between posts in this batch:** allowed. A link to a post whose slot has not
arrived renders as plain text via the `blogSlugFromHref` guard and becomes a live link on
its release day. Linking a sibling in this batch is therefore safe.

## Shared contract (all ten)
Read `content/blog/form-5472-coaches-consultants-course-creators.md` as the house model
for an audience post and `content/blog/form-5472-penalty-notice-what-to-do.md` for the
problem-post voice.

- Bold **40–60 word** answer block first. No `^# ` H1. **No `utm_` anywhere.**
- Question-form `## ` H2s, one concept each, each leading with its answer. No
  cross-section pronouns ("as above", "this approach").
- ≥1 markdown table; a numbered procedure where the intent is procedural.
- `## Frequently asked questions` with **6–7** `### ` questions, each answer **≤50 words**.
- `/start` inside the first screen and again near the close; 3–5 internal links from the
  whitelist; 2–4 external links, all primary (irs.gov or another .gov), each verified 200.
- Body **1,700–2,200 words**. Second person for the reader, "we" for us.
- Last line exactly: `*Educational content only; not tax or legal advice.*`
- **Write the full draft to disk before running the gate.** Lanes have been lost to
  network drops, watchdog kills and a wiped scratchpad; a draft on disk survives.

### Verified US-side facts (use these; do not re-derive)
- Form 5472 attaches to a **pro forma Form 1120**, "Foreign-owned U.S. DE" across the top
  of page 1; only the DE's name and address and **items B and E** are required.
- **Cannot be e-filed.** Fax **855-887-7737** (an IRS fax line, never our phone) or mail
  Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201.
- **Treas. Reg. § 1.6038A-1**: for tax years beginning on or after 1 January 2017 **and
  ending on or after 13 December 2017**, a foreign-owned US disregarded entity is treated
  as a corporation separate from its owner **solely** for the § 6038A reporting rules.
- **$25,000** penalty for failure to file when due and in the prescribed manner; a
  **substantially incomplete** Form 5472 constitutes a failure to file; the penalty also
  applies to failure to maintain records required by **§ 1.6038A-3**.
- **Customer and platform revenue is not a reportable transaction.** Owner contributions,
  distributions, loans either way, owner-paid company costs and payments for services
  between owner and LLC are the reportable items.
- Calendar-year regular due date generally **15 April**; Form 7004 extends it under the
  special DE instructions.
- Pricing: **$149** Standard (5–7 business days), **$199** Express (within 3 business
  days), **+$99** per additional past tax year, IRS fax delivery included.
- **We are not a CPA firm and do not give tax advice.** A qualified tax accountant
  reviews each package. A provider fax receipt is **transmission evidence, not IRS
  acceptance**.

### Internal link whitelist (all exist — use 3–5)
`/start` · `/pricing` · `/ein` · `/itin` · `/services` ·
`/blog/form-5472-digital-nomad-us-llc` · `/blog/does-foreign-owned-llc-pay-us-tax` ·
`/blog/form-5472-reportable-transactions-examples` ·
`/blog/form-5472-part-v-statement-example` ·
`/blog/form-5472-related-party-services-management-fees` ·
`/blog/pay-yourself-from-us-llc-non-resident` ·
`/blog/form-5472-owner-loans-contributions-reimbursements` ·
`/blog/form-5472-recordkeeping-checklist` · `/blog/form-5472-deadline-2026` ·
`/blog/form-5472-extension` · `/blog/form-5472-filed-late-never-filed` ·
`/blog/form-5472-penalty-notice-what-to-do` · `/blog/form-5472-dormant-llc-no-income` ·
`/blog/w8ben-vs-w9-foreign-owned-llc` · `/blog/ein-for-foreign-owned-llc-without-ssn` ·
`/blog/stripe-paypal-wise-form-5472` ·
`/blog/form-5472-currency-conversion-exchange-rates` ·
`/blog/us-llc-paying-foreign-contractors-tax-forms` ·
`/blog/form-5472-coaches-consultants-course-creators` ·
`/blog/form-5472-freelancers-upwork-fiverr-us-llc` · `/blog/how-to-fill-out-form-5472` ·
`/blog/multi-member-llc-form-5472-or-1065` · `/blog/foreign-owned-us-llc-fbar` ·
`/blog/final-form-5472-closing-foreign-owned-llc` · `/blog/form-5472-vs-form-5471` ·
`/blog/amended-form-5472-correcting-errors` · `/blog/form-5472-change-of-ownership`
Each writer must confirm with `ls` that any `/blog/` target it links actually exists.

### Platform / third-party rule
Any statement about a named company or platform must come from **that company's own
help, docs or pricing page, fetched today**, and carry "checked 3 October 2026". If the
page will not load or does not say it, write "not stated on [page]" or describe it
generically. Neutral tone, no disparagement, no fee percentages unless fetched.

---

## Assignments

Posts 1–5 are rewrites: they were written on 2026-09-24, were never committed, and were
lost when the scratchpad was wiped. Treat them as new work.

### A — `content/blog/form-5472-affiliate-marketers-content-sites.md`
`Form 5472 for Affiliate Marketers and Content Site Owners`
Affiliate and ad-network payouts into the LLC are customer revenue and not reportable;
what moves between owner and LLC is. Asset: table of the money flows an affiliate
business actually has — network payouts, ad revenue, sponsorship fees, hosting and tool
subscriptions paid by the LLC, the same costs paid personally by the owner, owner
withdrawals — each marked reportable or not, with the Part IV category or Part V
statement where it lands. Distinct angles to use: which card paid a legacy subscription,
a domain or site contributed in kind, a sponsor paying the owner personally, and selling
a site to an unrelated buyer. No commission rates.

### B — `content/blog/form-5472-app-developers-app-store-google-play.md`
`Form 5472 for App Developers Selling on the App Store and Google Play`
Store payouts are customer revenue; owner transfers are the reportable items. Asset: a
worked illustrative example in USD across two stores — gross sales, commission retained,
net payouts, then owner withdrawals and owner-paid costs — with totals that reconcile.
Check the arithmetic twice; label it illustrative. Apple's and Google's own developer
pages only, dated. **Do not state Apple's standard commission rate or Google's service-fee
percentages** — Apple's Small Business Program page names its standard rate without
giving it, and Google's tiers changed on 30 June 2026. Any percentage used in the example
is labelled an assumption. One line: a store acting as merchant of record in some
territories changes nothing here, because none of it is a related-party transaction.

### C — `content/blog/form-5472-kdp-authors-royalties.md`
`Form 5472 for Self-Published Authors Earning KDP and Audiobook Royalties`
Royalties paid to the LLC are revenue; owner transfers are reportable. Asset: a table
separating the three things authors conflate — the platform's tax paperwork
(W-8BEN/W-8BEN-E and any withholding), the LLC's Form 5472 package, and the owner's own
home-country return — with what each covers and does not. Link
`/blog/w8ben-vs-w9-foreign-owned-llc` rather than restating form mechanics. Withholding
statements from irs.gov or the platform's own page only; state no rate you did not fetch,
and label treaty rates unverified.

### D — `content/blog/form-5472-irs-notice-numbers-decoder.md`
`Which IRS Notice Did You Get? Decoding Form 5472 Penalty Letters`
A reader holding an envelope wants to know what the number means and the deadline.
**Verify every notice number against irs.gov and omit any you cannot source.** Previously
verified live: CP215, CP259, CP504, CP518, CP161 and CP162 each have an "Understanding
your … notice" page; the LT11 page is titled "Understanding your LT11 notice or letter
1058"; the IRS information-return-penalties page calls it **"Notice 972CG"** (not Letter)
and gives **45 days, 60 for a foreign filer**. Re-confirm each before publishing.
Asset: table — notice number · what it means · what it asks for · the deadline it states ·
the first thing to do. Two safety lines: the dates on the reader's own notice govern, and
a notice absent from the table is not thereby fake. **Do not restate**
`/blog/form-5472-penalty-notice-what-to-do` (owns response strategy, First Time Abate,
CP215) or `/blog/form-5472-filed-late-never-filed` (owns reasonable cause and DIIRSP).

### E — `content/blog/foreign-owned-llc-hiring-us-employees-contractors.md`
`What Changes When Your Foreign-Owned US LLC Hires in the United States`
**Scope tightly; an incomplete post that stays in its lane is the right outcome.**
In scope: that an otherwise-disregarded single-member LLC is a **separate entity for
employment-tax purposes** (IRS single-member LLC page, quoted), so hiring creates employer
obligations in the LLC's own name; the employee-versus-contractor distinction at a high
level (IRS common-law categories, "no magic formula", Form SS-8); that a US contractor
gives a Form W-9 and may receive a Form 1099-NEC while a non-US contractor is a different
question (link `/blog/us-llc-paying-foreign-contractors-tax-forms`); and that none of this
changes the Form 5472 obligation — running yourself through payroll does not turn an owner
draw into a wage (link `/blog/pay-yourself-from-us-llc-non-resident`).
**Out of scope — omit entirely:** payroll-setup steps, state registration, any tax rate,
threshold, wage base or deposit schedule, form numbers like 940/941, and any verdict on a
particular worker's status. Say explicitly that classification and payroll belong to a
qualified US payroll provider and that we prepare Form 5472 only.
Asset: table of who the LLC pays — US employee · US contractor · non-US contractor ·
the owner — against the paperwork triggered and whether it touches Form 5472.

### F — `content/blog/form-5472-newsletter-membership-creators.md`
`Form 5472 for Newsletter and Membership Creators`
Audience: non-US owners running paid newsletters and memberships (Substack, Ghost,
Patreon, Buy Me a Coffee) through a US LLC. Subscriber revenue is customer revenue.
Own the thing this audience gets wrong: **pledged, deferred and refunded subscription
money** — an annual plan collected up front, a platform holding a balance, chargebacks
and refunds — none of which is a related-party transaction, while the owner's withdrawal
of it is. Asset: a table of subscription-business money flows marked reportable or not,
plus a short numbered routine for reconciling a platform balance to the owner-movement
total at year end. Platform mechanics only from the platform's own help page, dated; no
fee percentages. Must differ from
`/blog/form-5472-coaches-consultants-course-creators` (retainers and courses) — link it
and say in one line how they differ.

### G — `content/blog/form-5472-vs-fbar-vs-form-8938.md`
`Form 5472 vs FBAR vs Form 8938: Which Ones Apply to You?`
The highest-AEO post in the batch. Answer: they answer different questions and are filed
with different bodies on different schedules; a foreign owner of a US LLC can owe one,
some or none. Asset: a comparison table — who files · what it reports · to whom · the
deadline · the headline penalty · the authority — one row each for Form 5472, FBAR
(FinCEN Form 114) and Form 8938, with every cell sourced to irs.gov or fincen.gov.
**Be careful and explicit that FBAR and Form 8938 turn on the reader's own facts, which
we cannot assess**: do not tell the reader they must or need not file either; give the
test and the authority and send them to an adviser. Link `/blog/foreign-owned-us-llc-fbar`
and `/blog/form-5472-vs-form-5471` rather than restating them.

### H — `content/blog/single-member-to-multi-member-llc-what-changes.md`
`Taking On a Partner: What Changes When a Single-Member LLC Becomes Multi-Member`
High-intent event post. Answer: adding a second member generally ends the disregarded-
entity treatment that puts the LLC in the Form 5472 regime and moves it toward a
partnership return, with a final Form 5472 package potentially due for the pre-change
period. **Verify the classification consequence from the IRS single-member LLC page and
the partnership/Form 1065 guidance before asserting it, and state the mid-year split as a
question for an adviser rather than a rule you compute for the reader.**
Asset: a before/after table — classification · what gets filed · who signs · which
transactions are reportable · what the EIN does. Link
`/blog/multi-member-llc-form-5472-or-1065`, `/blog/form-5472-change-of-ownership` and
`/blog/final-form-5472-closing-foreign-owned-llc`. Do not state a specific effective date
rule or an election outcome you cannot source.

### I — `content/blog/reinstate-dissolved-llc-catch-up-form-5472.md`
`Your LLC Was Administratively Dissolved — Do You Still Owe Form 5472?`
Answer: a state dissolving the entity does not erase federal filings already due, and
reinstatement is a state process separate from the federal catch-up. Asset: a numbered
sequence separating the two tracks — the state reinstatement track (check the formation
state's own portal; requirements, back fees and name availability vary and we do not
state them) and the federal track (which years are outstanding, the package per year,
delivery, evidence). Say plainly that we do not handle state reinstatement. Link
`/blog/form-5472-filed-late-never-filed` for the catch-up mechanics and
`/blog/final-form-5472-closing-foreign-owned-llc` for the alternative of closing properly.
No state fee, deadline or reinstatement window may be stated unless fetched from that
state's own site — prefer naming no state figures at all.

### J — `content/blog/foreign-owned-llc-irs-records-request-6038a-3.md`
`What the IRS Can Ask For: Form 5472 Records and § 1.6038A-3`
Answer: the $25,000 penalty attaches to two separate failures — not filing, and not
keeping the records the regulation requires — so a perfect form with no underlying records
is still exposed. **Verify § 1.6038A-3's record-maintenance requirement and the
instructions' records sentence before describing them**; cite the regulation (eCFR or
law.cornell.edu if eCFR redirects) and the Form 5472 instructions. Asset: a table mapping
each reportable transaction type to the documents that actually evidence it (bank
statement line, loan note, invoice, board or owner resolution, exchange-rate schedule) and
how long to keep them. Do not state a retention period in years unless you fetch it;
describe what the regulation requires instead. Link
`/blog/form-5472-recordkeeping-checklist` (owns the checklist — do not restate it) and
`/blog/form-5472-penalty-notice-what-to-do`.

## Acceptance gate (per file — run the commands, paste the numbers)
1. `grep -c 'utm_'` → 0 · 2. `grep -c '^# '` → 0 · 3. FAQ H2 = 1 with 6–7 `### `, every
answer ≤50 words · 4. `grep -c '^|'` → ≥3 · 5. body 1,700–2,200 words · 6. `/start` ≥2,
one in the first 25% · 7. every internal link on the whitelist and every `/blog/` target
exists · 8. every external link 200 and primary · 9. nothing invented; unverified points
labelled in the text · 10. no CPA claim for us; last line exact · 11. `publishAt: auto`
present and no hand-written date/offset · 12. any third-party claim sourced to that
company's own page and dated.
