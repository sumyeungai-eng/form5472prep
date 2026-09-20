# Blog batch spec — digital-nomad / hot-location cluster (2026-09-18)

Conversion target for **every** post: **`/start`** (the filing wizard). One primary CTA.

## Why these five

21 country posts already exist (`form-5472-<country>-residents-us-llc`) covering
Australia, Brazil, Canada, China, France, Germany, Hong Kong, India, Italy, Japan,
Mexico, Netherlands, New Zealand, Nigeria, Pakistan, Singapore, Spain, Switzerland,
UAE/Dubai and the UK. **Do not duplicate any of those.** The four highest-volume
digital-nomad destinations with no post yet are Thailand, Indonesia/Bali, Vietnam and
Portugal. The fifth post is the cluster hub for nomads with no fixed country.

| Slug | Owns |
|---|---|
| `form-5472-thailand-residents-us-llc` | Thailand, incl. the DTV and the remittance rules |
| `form-5472-indonesia-bali-residents-us-llc` | Indonesia / Bali, incl. the remote-worker KITAS |
| `form-5472-vietnam-residents-us-llc` | Vietnam, incl. the signed-but-not-in-force treaty |
| `form-5472-portugal-residents-us-llc` | Portugal, incl. the D8 visa and the NHR successor |
| `form-5472-digital-nomad-us-llc` | the nomad with no single tax residence |

## The established template (follow it — read `content/blog/form-5472-uae-dubai-residents-us-llc.md` first)

Title: `Form 5472 for <Country> Residents with a US LLC`
(the hub post's title is different — see assignment E)

Body shape, in order:

1. **Bold 40–60 word answer block.** States that the owner must file Form 5472 with a
   pro forma Form 1120 each year the LLC had a reportable transaction with them, then
   names the one or two country-specific mechanics that change (treaty status, whether
   the country issues a personal tax ID for the FTIN box).
2. Two or three paragraphs of context: who in that country owns US LLCs and why
   (payment processors, US banking), then the sentence *"Two features of the
   `<country>` position change the mechanics of the filing compared with a UK or
   Indian owner. Neither removes the obligation"* — adapted, not copied verbatim.
3. `[we prepare and fax the complete package from $149](/start)` in the first screen.
4. `## Do <country> residents have to file Form 5472?` — the three conditions, then
   Treas. Reg. § 1.6038A-1, then what is and is not a reportable transaction with a
   concrete local example (name a real local bank or the local currency).
5. `## Does the US-<country> tax treaty change anything?` — the treaty answer, sourced
   to the IRS treaty page. It changes **nothing** about Form 5472; say so plainly.
6. `## What goes in the FTIN box <country-specific angle>?` — the single most useful
   section. What the local personal tax number is called, who gets one, and what a
   nomad who has no local tax number puts in the box instead.
7. `## Does <country> tax affect the US filing?` — local personal tax in outline, with
   the residency-day rule, sourced to that country's revenue authority.
8. `## How does a <country>-based owner actually file?` — numbered steps: prepare,
   sign, fax to 855-887-7737 or mail to Ogden, keep the receipt.
9. `## Getting it filed from <country>` — the service section with pricing.
10. `## Frequently asked questions` — 6–7 `### ` questions, each answered in ≤50 words.
11. `---`, then a two-or-three sentence close with the `/start` CTA and one related link.
12. Last line: `*Educational content only; not tax or legal advice.*`

## Verified US-side facts (use these; do not re-derive)

- Form 5472 attaches to a **pro forma Form 1120** with **"Foreign-owned U.S. DE"** across
  the top of page 1; only the DE's name and address and **items B and E** are required.
- The filing **cannot be e-filed**. Fax to **855-887-7737** (an IRS fax line, never our
  phone number) or mail to **Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112,
  Attn: PIN Unit, Ogden, UT 84201**.
- **Treas. Reg. § 1.6038A-1**: for tax years beginning on or after 1 January 2017, a
  foreign-owned US disregarded entity is treated as a corporation separate from its
  owner **solely** for the § 6038A reporting rules.
- The IRS instructions state a **$25,000** penalty may apply for failure to file when due
  and in the prescribed manner, a substantially incomplete Form 5472, or failure to
  maintain required records. **Filing a substantially incomplete Form 5472 constitutes a
  failure to file.** Not automatic for every mistake.
- **Customer revenue is not a reportable transaction.** A Stripe or Wise payout from a
  customer does not go on the form; a transfer from that balance to the owner's personal
  account does. Contributions in, distributions out, loans either way, and payments for
  goods or services between owner and LLC are the reportable items.
- Regular due date for a calendar-year entity is generally **April 15**; Form 7004
  extends it using the special DE instructions.
- Where there is no US identifying number for the foreign owner, the instructions
  address an **FTIN** and a **reference ID number**.
- Pricing: **$149 Standard (5–7 business days)**, **$199 Express (within 3 business
  days)**, **+$99 per additional past tax year**, **IRS fax delivery included**.
- **We are not a CPA firm and do not give tax advice.** We prepare and submit the
  information return; a qualified tax accountant reviews each package.
- A provider fax receipt is **transmission evidence, not IRS acceptance of the return**.

## Research you must do before writing (per post)

Load the tools first: `ToolSearch` with query `select:WebSearch,WebFetch`.

Verify from **primary sources you actually fetch**, and link them:

1. **Treaty status** — the IRS page
   <https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z>.
   Confirm whether a treaty with that country is **in force**. A treaty that was signed
   but never entered into force is a materially different fact and must be stated as
   such if that is the case.
2. **The local personal tax identification number** — its real local name and who is
   issued one, from that country's own revenue authority.
3. **The local tax-residency day rule** — the number of days and the statute or
   authority page that states it.
4. **The relevant visa**, where one exists — from that country's own immigration or
   foreign-ministry site, not a visa agency's blog.

**Never invent a statistic, a day count, a visa name, a tax rate or a quote.** If a
figure cannot be verified from a primary source, **omit it or say plainly that it is
unverified and tell the reader to check the authority's own page**. Do not cite
nomad-lifestyle blogs, visa agencies, law-firm marketing pages or relocation
consultancies for any factual claim.

**Local tax law is described in outline only, as context for why the US filing is
separate.** Never tell the reader what they owe locally, and never imply we advise on
it. Every local-tax section ends by pointing at the local authority or a local adviser.

## Shared contract (every file)

```
---
title: "…"
description: "…"            # <=155 chars, the answer + a reason to click
date: 2026-09-18
updated: 2026-09-18
author: "Form5472 Prep"
tags: ["form-5472", "<country>", "foreign-owned-llc", …]   # 4–5, kebab-case
draft: false
---
```

- **No `^# ` H1.** **No `utm_` parameters anywhere** — the whole blog was just swept
  clean of them; a new one would reintroduce the defect. Plain paths only.
- `/start` link in the first screen and again near the close.
- Question-form `## ` H2s. One concept per section, each leading with its answer. No
  cross-section pronouns ("as above", "this approach").
- At least one markdown table, plus the numbered filing procedure.
- One proprietary element per post — named in the assignment.
- 2–4 external links, all primary sources, each verified to return 200.
- 1,700–2,200 words of body.
- Voice: second person for the reader, first person plural for us. No hype.

### Internal links available (verified to exist — 3–5 per post, no others)

`/start` · `/pricing` · `/ein` · `/itin` · `/partners` ·
`/blog/form-5472-uae-dubai-residents-us-llc` · `/blog/form-5472-singapore-residents-us-llc` ·
`/blog/form-5472-hong-kong-residents-us-llc` · `/blog/form-5472-india-residents-us-llc` ·
`/blog/form-5472-uk-residents-us-llc` · `/blog/form-5472-mexico-residents-us-llc` ·
`/blog/form-5472-ftin-reference-id-foreign-address` · `/blog/how-to-fill-out-form-5472` ·
`/blog/form-5472-deadline-2026` · `/blog/form-5472-extension` ·
`/blog/form-5472-reportable-transactions-examples` ·
`/blog/form-5472-customer-payments-foreign-source-income` ·
`/blog/form-5472-currency-conversion-exchange-rates` ·
`/blog/form-5472-owner-becomes-us-tax-resident` ·
`/blog/foreign-owned-llc-filing-requirements-checklist` ·
`/blog/form-5472-dormant-llc-no-income` · `/blog/first-year-form-5472-new-llc` ·
`/blog/form-5472-filed-late-never-filed` · `/blog/form-5472-recordkeeping-checklist` ·
`/blog/ein-for-foreign-owned-llc-without-ssn` · `/blog/itin-required-form-5472` ·
`/blog/form-5472-cost`

---

## The five assignments

### A — `content/blog/form-5472-thailand-residents-us-llc.md`
Title: `Form 5472 for Thailand Residents with a US LLC`
Research and verify: whether the **US–Thailand income tax treaty is in force**; the Thai
personal **TIN** and who the Revenue Department issues one to; Thailand's
**residency day threshold** in the Revenue Code; the **Destination Thailand Visa (DTV)**
from a Thai government source; and the current Thai treatment of **foreign-sourced
income remitted into Thailand** — this changed by Revenue Department departmental
instruction for income remitted from 1 January 2024, and there has been further change
since, so **fetch the Revenue Department's own current page and state only what it
says, with its date**. If the current position cannot be pinned down, say so explicitly.
**Proprietary element:** a table mapping a nomad's Thai situation (short stay / over the
day threshold / DTV holder / Thai tax-resident with a TIN) to what goes in the FTIN box
and what the US filing requires.

### B — `content/blog/form-5472-indonesia-bali-residents-us-llc.md`
Title: `Form 5472 for Indonesia and Bali Residents with a US LLC`
Research and verify: **US–Indonesia treaty** status; the **NPWP** and who is issued one;
Indonesia's **183-day** residency rule and its legal basis; and the **remote-worker
KITAS (E33G)** from an Indonesian government source (immigration or the embassy), not a
relocation agency. Note that Indonesia taxes resident individuals on worldwide income —
verify before stating.
**Proprietary element:** a Bali-specific worked example — an agency owner whose US LLC
receives client payments and who transfers money to a personal Indonesian account —
showing which movements are reportable and which are not, with IDR amounts converted at
a sourced rate.

### C — `content/blog/form-5472-vietnam-residents-us-llc.md`
Title: `Form 5472 for Vietnam Residents with a US LLC`
Research and verify: the **US–Vietnam income tax treaty position**. A treaty was signed
in 2015; confirm from the IRS treaty page whether it is **in force**, and if it is not,
say so plainly — that is the single most valuable fact in this post and most competing
content gets it wrong. Also verify the Vietnamese **personal tax code** and who is
issued one, and Vietnam's **183-day** residency rule with its statutory source.
Vietnam has no dedicated digital-nomad visa as far as we know — verify before asserting
either way, and if it cannot be confirmed, say it is unverified.
**Proprietary element:** a no-treaty consequences table — what the absence of a treaty
in force does and does not change for a US-LLC owner (it does not change Form 5472; it
does remove treaty relief and the treaty-claim boxes as an option).

### D — `content/blog/form-5472-portugal-residents-us-llc.md`
Title: `Form 5472 for Portugal Residents with a US LLC`
Research and verify: **US–Portugal treaty** status; the **NIF** and who is issued one;
Portugal's **183-day** rule; the **D8 visa**; and the status of **NHR** — the old
non-habitual resident regime closed to new entrants and a successor regime took its
place. **Fetch a Portuguese government or official source for the successor regime's
current name and who qualifies, and if you cannot confirm the detail, describe it in
outline and say the detail is unverified.** Do not state eligibility criteria you have
not sourced.
**Proprietary element:** a table separating the three things Portuguese-resident owners
routinely conflate — the Portuguese personal return, the US LLC's Form 5472, and any US
income-tax return — showing what each covers and what it does not.

### E — `content/blog/form-5472-digital-nomad-us-llc.md`
Title: `Form 5472 for Digital Nomads: Filing With No Fixed Tax Residence`
This is the cluster hub and the highest-intent query in the batch. Own the question a
nomad actually asks: *my US LLC is in Wyoming, I spent the year across four countries,
am I a tax resident nowhere, and do I still file?*
Cover:
- The answer: **the Form 5472 obligation follows the LLC and the owner's non-US-person
  status, not where the owner sleeps.** Moving between countries changes nothing about it.
- Why the "183 days" rule that nomads discuss constantly is a **local** residency test
  and has no bearing on the US filing.
- The FTIN box when the owner genuinely has no tax number anywhere — the reference ID
  route, linking `/blog/form-5472-ftin-reference-id-foreign-address`.
- The **address** question: what to put when the owner has no settled address, and why
  the LLC's address and the owner's address are separate fields. Link
  `/blog/form-5472-business-address-owner-address` **only if that file exists** — check
  first; if it does not, drop the link rather than inventing it.
- The one genuine US risk a nomad should know: **spending enough time in the United
  States can make the owner a US tax resident under the substantial presence test**,
  which changes the whole picture. Link
  `/blog/form-5472-owner-becomes-us-tax-resident`. Verify the substantial presence test
  from the IRS's own page before describing it, and describe it accurately or not at all.
- A table of the destinations the site now covers, each linking to its post.
**Proprietary element:** a four-question self-check that tells a nomad whether the LLC
has a Form 5472 obligation this year, resolving to a single answer.

---

## Acceptance gate (per file — verify with shell commands, report measured numbers)

1. `grep -c 'utm_'` → 0
2. `grep -c '^# '` → 0
3. `^## Frequently asked questions` → 1, with 6–7 `### ` under it, each answer ≤50 words
4. `grep -c '^|'` → ≥3
5. Body word count 1,700–2,200
6. `/start` appears ≥2 times, once in the first 25% of the file
7. Every internal `](/…)` link is on the whitelist AND, for `/blog/…`, the file exists
8. Every external link returns 200 (`curl -s -o /dev/null -w '%{http_code}' <url>`) and
   is a primary government/IRS source
9. No invented statistic, day count, visa name or tax rate; anything unverified is
   labelled as unverified in the text
10. No claim that we are a CPA firm or give tax advice; last line is
    `*Educational content only; not tax or legal advice.*`

---

# Batch 2 — five more hot-location posts (same day)

Same conversion target (`/start`), same established template, same shared contract,
same acceptance gate as batch 1 above. Only the assignments differ.

## Treaty status verified by the orchestrator against the IRS A-to-Z list

Fetched <https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z>
and read the alphabetical sections directly, so the absence of a country is a real
absence and not a keyword miss:

| Country | On the IRS list | Evidence from the page |
|---|---|---|
| Philippines | **yes** | P section: Pakistan, **Philippines**, Poland, Portugal |
| Malaysia | **no** | absent from the M entries |
| Georgia | **yes** | G section: **Georgia**, Germany, Greece |
| Colombia | **no** | C section is Canada, Chile, China, Cyprus, Czech Republic — no Colombia |
| Estonia | **yes** | E section: Egypt, **Estonia** |

Each lane must still fetch the page itself and confirm. If a lane's reading disagrees
with this table, the lane reports the disagreement rather than silently overriding it.

## The five assignments

### F — `content/blog/form-5472-philippines-residents-us-llc.md`
Title: `Form 5472 for Philippines Residents with a US LLC`
Verify: the US–Philippines treaty is in force; the BIR **TIN** and who is issued one
(Bureau of Internal Revenue); the Philippine residency rules for individuals; and
whether the Philippines offers a digital-nomad visa — a nomad-visa law was under
discussion, so **check a Philippine government source for its current status and say
plainly if it is not yet in effect or cannot be confirmed**.
**Proprietary element:** a table separating the BIR filing obligations a
Philippines-resident owner may have from the US Form 5472 package, showing that neither
substitutes for the other.

### G — `content/blog/form-5472-malaysia-residents-us-llc.md`
Title: `Form 5472 for Malaysia Residents with a US LLC`
Verify: that **no US–Malaysia income tax treaty is in force** (confirm from the IRS
list; if Malaysia is genuinely absent, say so plainly — most competing content is vague
about it); the LHDN **income tax number** and who is issued one; Malaysia's 182-day
residency rule and its statutory source; and the **DE Rantau Nomad Pass** from a
Malaysian government source (the MDEC or an official DE Rantau page), never an agency.
**Proprietary element:** a no-treaty consequences table for Malaysia — what the absence
of a treaty in force does and does not change. It does not change Form 5472; it removes
treaty relief as an option.

### H — `content/blog/form-5472-georgia-country-residents-us-llc.md`
Title: `Form 5472 for Georgia (Country) Residents with a US LLC`
The slug and title must disambiguate from the US state of Georgia — searchers and
engines confuse the two, and the disambiguation is itself a ranking asset. Say in the
opening that the post is about the country, not the US state.
Verify: the US–Georgia treaty is in force; the Georgian **personal tax identification
number**; Georgia's 183-day residency rule; the **small business status / individual
entrepreneur** regime that nomads move to Georgia for, from the Georgian Revenue
Service or another Georgian government source — **do not state the rate or the turnover
ceiling unless you fetch it from an official source**; and Georgia's visa-free stay
allowance for many nationalities, from a Georgian government source.
**Proprietary element:** a table showing why registering as a Georgian individual
entrepreneur does **not** replace or affect the US LLC's Form 5472 — two separate
entities, two separate regimes — with a row for each thing a reader might assume merges.

### I — `content/blog/form-5472-colombia-residents-us-llc.md`
Title: `Form 5472 for Colombia Residents with a US LLC`
Verify: that **no US–Colombia income tax treaty is in force** (confirm from the IRS
list and say so plainly); the DIAN **NIT / cédula** position for individuals and which
number a foreign individual would hold; Colombia's 183-day residency rule and its
statutory source; and the Colombian **digital-nomad visa (V-type)** from a Colombian
government source (Cancillería), never an immigration agency.
**Proprietary element:** a worked example for a Medellín-based owner — US LLC receives
client payments, owner transfers to a personal Colombian account — showing which
movements are reportable, with COP figures converted at a rate sourced to an official
body and dated.

### J — `content/blog/form-5472-estonia-residents-us-llc.md`
Title: `Form 5472 for Estonia Residents and e-Residents with a US LLC`
This post's distinctive job is the **e-Residency confusion**, which no competing content
handles well: Estonian e-Residency is a **digital identity, not tax residency and not a
company**, and holding it changes nothing about a US LLC's Form 5472. Many nomads
believe e-Residency makes them an Estonian tax resident or that it replaces their US
filing. Correct that carefully, sourced to Estonia's own e-Residency or tax authority
pages.
Verify: the US–Estonia treaty is in force; the Estonian **personal identification /
tax** number position; Estonia's 183-day residency rule; the Estonian **digital nomad
visa**; and what e-Residency does and does not confer, from an official Estonian source
(e-resident.gov.ee, Maksu- ja Tolliamet, or politsei.ee).
**Proprietary element:** an "e-Residency does / does not" table with a row for each
belief a reader might arrive with, including whether it creates tax residency, whether
it creates a company, and whether it affects the US LLC's Form 5472.

## Extra gate items for batch 2

11. Any post asserting that **no treaty is in force** must cite the IRS A-to-Z page and
    describe the absence accurately — not "there is no treaty" if one was signed but
    never entered into force. State the distinction where it applies.
12. No post may state a local tax **rate**, **turnover ceiling** or **day count** that
    was not fetched from an official source. Omit or label unverified.

---

# Batch 3 — five search-led nomad topics (approved 2026-09-18)

Plan: `docs/reviews/nomad-batch-3-plan.md`. Conversion target `/start`. These are
**topic** posts, not country posts: do NOT use the country template's headings. Keep the
shared contract (frontmatter shape, no H1, no utm, bold 40–60 word answer block,
question H2s, ≥1 table, 6–7 FAQs ≤50 words, `/start` in first screen and near close,
last line `*Educational content only; not tax or legal advice.*`), the verified US-side
facts, and the acceptance gate items 1–12.

**Write the full draft to disk before running the gate.** Network drops and watchdog
kills have hit several lanes today; a draft on disk survives, a draft in memory does not.

Extra internal links allowed for this batch (all exist):
`/blog/does-foreign-owned-llc-pay-us-tax` · `/blog/form-5472-digital-nomad-us-llc` ·
`/blog/w8ben-vs-w9-foreign-owned-llc` · `/blog/wyoming-llc-foreign-owner-tax-filing` ·
`/blog/new-mexico-llc-foreign-owner-tax-filing` · `/blog/delaware-llc-foreign-owner-tax-filing` ·
`/blog/form-5472-estonia-residents-us-llc` · `/blog/form-5472-uae-dubai-residents-us-llc` ·
`/blog/form-5472-diy-vs-preparer` · `/blog/llc-vs-c-corp-non-resident-founders`

### K — `content/blog/us-llc-tax-free-digital-nomads-myth.md`
Title: `Is a US LLC Really Tax-Free for Digital Nomads?`
Answer: often no US income tax for a nonresident owner with no US trade or business,
but the LLC still files Form 5472 + pro forma 1120 (penalty $25,000), and the owner's
home/residence country may tax the income — in outline only.
Asset: "claim vs reality" table (5–7 common marketing claims). Link
`/blog/does-foreign-owned-llc-pay-us-tax` for the income-tax test — do not restate it.
Every US tax statement sourced to IRS pages; say plainly when the answer depends on
facts (US trade or business, effectively connected income) that need an adviser.

### L — `content/blog/stripe-atlas-doola-firstbase-form-5472.md`
Title: `Formed With Stripe Atlas, doola or Firstbase? Who Files Your Form 5472`
Answer: a formation service forms the LLC; whether annual federal filings are included
depends on the plan you bought, and the owner remains responsible for the filing.
Asset: table — service · what its own published plan says about annual federal filing /
Form 5472 · source URL · date checked. **Every row from that company's own pricing, help
or docs page, fetched today. If a company's page does not say, write "not stated on
[page]" — never infer.** Neutral tone: no disparagement, no "they won't help you".
Do not state competitor prices unless fetched from their page; prefer omitting prices.

### M — `content/blog/form-5472-freelancers-upwork-fiverr-us-llc.md`
Title: `Form 5472 for Freelancers Using a US LLC on Upwork, Fiverr and Toptal`
Asset: worked example — platform payouts from clients into the LLC (not reportable),
platform fees (not a related-party transaction), transfers to the owner's personal
account (reportable), owner-paid LLC expenses (reportable). USD only; check arithmetic.
Platform tax-form mechanics (W-8BEN-E vs W-9) only via link to
`/blog/w8ben-vs-w9-foreign-owned-llc`; any platform-specific claim must come from that
platform's own help centre, otherwise omit.

### N — `content/blog/wyoming-vs-new-mexico-vs-delaware-llc-digital-nomads.md`
Title: `Wyoming vs New Mexico vs Delaware LLC for Digital Nomads`
Answer: federal Form 5472 duty is identical in all three; they differ in state annual
report/tax and cost. Asset: side-by-side table (annual report? · annual state fee/tax ·
due date · source). **Re-fetch each figure from the state's own site at write time.**
Delaware: cite https://corp.delaware.gov/alt-entitytaxinstructions/ ($400); note
`/frtax/` still shows $300. Link the three state posts. No recommendation of a "best"
state for tax purposes; frame by cost and paperwork only.

### O — `content/blog/us-llc-vs-estonia-ou-vs-uae-company-digital-nomads.md`
Title: `US LLC vs Estonian OÜ vs UAE Free-Zone Company: Annual Filing Burden`
Scope: yearly filing and reporting obligations only — not tax planning, not "best".
Asset: comparison table (entity · where filed · annual return/report · accounts/audit ·
key deadline · source). US row from IRS/state facts above. Estonia from emta.ee /
ariregister.rik.ee / e-resident.gov.ee. UAE from the Ministry of Finance / Federal Tax
Authority (corporate tax registration and returns) — free-zone authority specifics only
if from an official free-zone site, else state they vary by free zone. **Any cell you
cannot source reads "varies — check [authority]".** Link Estonia and UAE country posts.

---

# Batch 4 — ten posts (approved 2026-09-20)

Plan: `docs/reviews/nomad-batch-4-plan.md`. Conversion target `/start`. Dates in
frontmatter: `date: 2026-09-20`, `updated: 2026-09-20`.

Country posts (P–V) use the country template (read
`content/blog/form-5472-uae-dubai-residents-us-llc.md`) and the batch-1/2 rules:
treaty section sourced to the IRS A-to-Z page read **by alphabetical section**, local
personal tax number, local residency day rule, the relevant visa from a government
source, FTIN-box table, numbered filing steps, 6–7 FAQs.
Topic posts (W–Y) do NOT use the country headings.

All ten: shared contract + gate items 1–12; **write the full draft to disk before running
the gate**; no `utm_`; `/start` in the first screen and near the close; last line
`*Educational content only; not tax or legal advice.*`; we are not a CPA firm.
Extra allowed internal links: any slug already in this file's whitelists, plus
`/blog/form-5472-digital-nomad-us-llc`, `/blog/us-llc-tax-free-digital-nomads-myth`,
`/blog/form-5472-freelancers-upwork-fiverr-us-llc`,
`/blog/stripe-paypal-wise-form-5472`, `/blog/form-5472-part-v-statement-example`,
`/blog/form-5472-related-party-services-management-fees`,
`/blog/us-bank-account-foreign-owned-llc`, `/blog/form-5472-recordkeeping-checklist`.

### P — `form-5472-turkey-residents-us-llc` — Turkey (treaty listed; confirm)
Verify: Turkish tax identification number (vergi kimlik numarası) from gib.gov.tr;
residency rule; whether Türkiye offers a digital-nomad visa, from a Turkish government
source (say unverified if not confirmable).

### Q — `form-5472-hungary-residents-us-llc` — Hungary — **HIGHEST RISK IN BATCH**
The IRS A-to-Z list shows Hungary with "CAUTION Treaty Terminated". Establish from
IRS/Treasury sources: the termination and the date from which it ceased to apply for
taxes. State only what those pages say; if the effective date is unclear, say so
explicitly. Also: Hungarian tax number, 183-day rule, and the White Card residence
permit from a Hungarian government source. Asset: table of what treaty termination does
and does not change — it does **not** change Form 5472.

### R — `form-5472-costa-rica-residents-us-llc` — Costa Rica (no treaty in force; confirm)
Verify: the digital-nomad law/visa from a Costa Rican government source (migracion.go.cr
or the Gaceta); cédula/NITE identification for foreigners from Hacienda; territorial
taxation only in outline, sourced.

### S — `form-5472-argentina-residents-us-llc` — Argentina (no treaty; confirm)
Verify: CUIT/CUIL from AFIP/ARCA; 183-day rule from the income tax law. Peso figures
only at a dated official rate (BCRA or US Treasury reporting rate) — or omit pesos.
Make no claim about exchange controls or parallel rates unless officially sourced.

### T — `form-5472-south-korea-residents-us-llc` — Korea (treaty listed; confirm)
Verify: resident registration number vs taxpayer number for foreigners (NTS/Hometax);
183-day rule; the workation visa (F-1-D) from a Korean government source.

### U — `form-5472-croatia-residents-us-llc` — Croatia
A US–Croatia treaty was signed in 2022. Confirm from the IRS A-to-Z page whether it is
in force; if Croatia is absent, say plainly that a signed treaty not in force gives a
taxpayer nothing. Verify OIB from porezna-uprava.gov.hr and the digital-nomad temporary
stay from mup.gov.hr.

### V — `form-5472-taiwan-residents-us-llc` — Taiwan
Taiwan is not on the IRS treaty list. Check whether any US–Taiwan double-tax relief
legislation has taken effect; if you cannot confirm it from an official US source, write
that it is unverified and tell readers to confirm. Verify the Taiwan tax ID / ARC
number, the 183-day rule, and the Employment Gold Card from a Taiwanese government source.

### W — `pay-yourself-from-us-llc-non-resident` — **route: highest-value topic post**
Title: `How to Pay Yourself From a US LLC as a Non-Resident`
Answer: a single-member LLC's owner takes distributions, not a salary; the owner is not
an employee of a disregarded entity; each movement is a reportable transaction on
Form 5472.
Asset: table — owner draw · "salary" · loan to/from the LLC · expense reimbursement ·
payment for genuine services — each mapped to how it is characterised and where it lands
on Form 5472 (Part IV category or Part V statement). Sourced to the Form 5472
instructions and IRS single-member-LLC guidance. Do not advise on home-country tax.
Link `/blog/form-5472-part-v-statement-example`,
`/blog/form-5472-related-party-services-management-fees`,
`/blog/does-foreign-owned-llc-pay-us-tax`.

### X — `form-5472-from-mercury-wise-relay-statements`
Title: `Building Your Form 5472 Figures From Mercury, Wise or Relay Statements`
Numbered process: export the year's statements → separate customer revenue from owner
movements → categorise owner movements → total per category → reconcile to Part IV/V.
Asset: a worked ledger (10–15 lines) with categories and totals that reconcile; state it
is illustrative. Any claim about a bank's export features must come from that bank's own
help centre, fetched; otherwise describe generically ("most business accounts export CSV").
Do not restate `/blog/stripe-paypal-wise-form-5472` — link it.

### Y — `form-5472-coaches-consultants-course-creators`
Title: `Form 5472 for Coaches, Consultants and Course Creators With a US LLC`
Asset: worked example distinct from the freelancer post — course-platform payouts and
client retainers (not reportable) vs owner withdrawals and owner-paid software
(reportable). Platform facts only from the platform's own help pages, else omit.
Link `/blog/form-5472-freelancers-upwork-fiverr-us-llc` and note how the two differ.
