# Plan — nomad batch 3: five search-led topics (2026-09-18) — NOT YET APPROVED

Status: plan only. Nothing is written until the owner approves.
Conversion target for all five: `/start`. Template, gate and sourcing rules: as in
`docs/reviews/new-posts-nomad-batch-spec.md`.

Selection basis: gaps in the existing 147-post corpus plus query intent. No keyword-tool
volumes were available (Ahrefs connector not authorised), so priority is a judgement,
not measured volume.

## 1. `us-llc-tax-free-digital-nomads-myth`
Title: Is a US LLC Really Tax-Free for Digital Nomads?
Query: "us llc tax free digital nomad", "0% tax us llc non resident".
Why: the biggest nomad query in the niche; ranking content is mostly formation-service
sales pages that skip the filing. Angle: what is true (no US income tax in many cases),
what is not (the LLC still files Form 5472; $25,000 penalty), and the home-country side
in outline only.
Own asset: "claim vs reality" table. Risk: overlap with
`does-foreign-owned-llc-pay-us-tax` — link to it for the tax test, do not restate it.

## 2. `stripe-atlas-doola-firstbase-form-5472`
Title: Formed Your LLC With Stripe Atlas, doola or Firstbase? Who Files Form 5472
Query: "[service] form 5472", "does stripe atlas file form 5472".
Why: brand-name queries from people who already own an LLC — the highest purchase
intent of the five. Own asset: table of what each service's own published plan includes
for annual federal filings. Risk: every row must come from that company's own pricing
or help page, dated; neutral tone, no disparagement; omit any service we cannot source.

## 3. `form-5472-freelancers-upwork-fiverr-us-llc`
Title: Form 5472 for Freelancers Using a US LLC on Upwork, Fiverr and Toptal
Query: "upwork us llc non resident tax", "freelancer us llc form 5472".
Why: freelancers are the core nomad population and no post addresses them; existing
audience posts cover SaaS, Shopify, YouTube, Amazon, Etsy, Airbnb. Own asset: worked
example — platform payouts (not reportable) vs owner withdrawals (reportable).
Risk: W-8BEN vs W-9 on platforms — link `w-8ben-vs-w-9` post, keep claims to IRS text.

## 4. `wyoming-vs-new-mexico-vs-delaware-llc-digital-nomads`
Title: Wyoming vs New Mexico vs Delaware LLC for Digital Nomads: Annual Filings Compared
Query: "best state llc digital nomad", "wyoming vs new mexico llc non resident".
Why: high-volume comparison query; we have one post per state but no comparison page.
Point: the federal Form 5472 duty is identical in all three; only state cost differs.
Own asset: side-by-side annual cost and filing table (Wyoming $60 minimum, New Mexico
no annual report, Delaware $400 — re-verify each on the state's own page at write time).

## 5. `us-llc-vs-estonia-ou-vs-uae-company-digital-nomads`
Title: US LLC vs Estonian OÜ vs UAE Free-Zone Company: Yearly Filing Burden for Nomads
Query: "us llc vs estonian company digital nomad", "best company structure digital nomad".
Why: nomads compare structures before they form one; catches buyers earlier than any
existing post. We compare annual filing burden only, not which is "best".
Risk: highest sourcing load — Estonian and UAE obligations must come from official
sources (emta.ee / e-resident.gov.ee, UAE MoF / FTA); anything unsourced is omitted.
If sourcing fails, fallback topic: Georgia IE vs US LLC is already covered, so drop to a
four-post batch rather than publish thin claims.

## Execution (after approval)
1. Five parallel writer lanes, disjoint files, draft-to-disk before gate.
2. Orchestrator wires artwork + ARTWORK_ALTS, adds hub links from
   `form-5472-digital-nomad-us-llc`.
3. Independent fact-audit lane across all five (post 2 and 5 first).
4. tsc, vitest, build, `git push origin main`, live verification, session log.
Suggested order if only some are approved: 2, 1, 3, 4, 5.
