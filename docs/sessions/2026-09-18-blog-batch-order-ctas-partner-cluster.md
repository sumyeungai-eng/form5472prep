# Session log — 2026-09-18 — blog batches, order CTAs, partner cluster

## Ownership (who owned what in this session)

| Checkout / branch | Owned files | State |
|---|---|---|
| `scratchpad/wt-posts` → `blog-posts-0917` | `content/blog/*.md`, `public/blog/*.webp`, `src/lib/blog.ts` (ARTWORK_ALTS only), `scripts/render-blog-artwork.mjs`, `docs/reviews/*`, this log | three commits, merged to `main` |
| `scratchpad/wt-cta` → `blog-order-cta` | `src/lib/blog-order-cta.ts`, `src/components/blog/BlogOrderCta.tsx`, `src/lib/blog-order-cta.test.ts`, 5 lines in `src/app/(marketing)/blog/[slug]/page.tsx` | committed, cherry-picked into the posts branch |
| `~/Documents/Codex/form5472` (main checkout) | **not ours** — a concurrent session owns `src/app/partner/**`, `src/app/(marketing)/partners/**`, `src/components/PartnerScreenshots.tsx`, `prisma/migrations/20260918120000_filing_partner_hidden` | left untouched; dirt reported, not cleaned |

A concurrent session shipped the partner-portal wave (`c9486b9`..`21a1a2c`) while this
session ran. Our branch was rebased onto it; the file sets were disjoint.

## What shipped

Commit range: `21a1a2c..HEAD` on `main`.

1. **Five compliance guides** — BOI reporting after the 2025 FinCEN interim rule;
   registered agents; single-member LLC operating agreements for a foreign owner;
   certificates of good standing; sales tax nexus after *Wayfair*.
2. **Order CTAs on EIN/ITIN guides** — an automatic "start your order" card at the top
   and bottom of every post whose tags or slug identify it as an EIN or ITIN article.
3. **Five partner-program guides** — offering the filing as a service (with worked
   margin arithmetic); running a book of filings across a season (with a capacity
   model); in-house vs outsourced; the client intake checklist; and whether a firm may
   prepare a client's filing without a CPA licence.

### Verified evidence

- `npx tsc --noEmit` → no errors. `npx vitest run src/lib/blog-order-cta.test.ts src/lib/blog.test.ts` → 28 pass, 0 fail.
- All ten new posts parse through `getPost`, appear in `getAllPosts` (137 published),
  and yield 6–7 FAQ entries each with no answer over 50 words and no CTA/markup bleed
  into the FAQ schema.
- Every internal `/blog/...` link in the new posts resolves to a published post.
- Every external link in the new posts returns HTTP 200 and is a `.gov` primary source.
- Mechanical gate per post: no `utm_`, no `^# ` H1, ≥3 table rows, `/partners` (or the
  product CTA) inside the first quarter of the file, standard disclaimer as last line.

## Contracts a future editor must respect

1. **Deploy is `git push origin main`.** Production auto-deploys from `origin/main`.
   Never run `vercel --prod` in this repo — it has caused three outages.
2. **Prices come from `src/lib/pricing.ts`.** $149 Standard, $199 Express, +$99 per
   extra past year; EIN $149; ITIN $349. Do not hardcode a price in a post that is not
   one of these.
3. **No commission, referral fee, revenue share or volume-discount figure exists.**
   Partners pay the published per-filing price; their margin is what they charge their
   own client. Volume pricing and consolidated invoicing are "available on request"
   only. Several posts now state this explicitly — do not contradict them.
4. **Credential posture.** We are not a CPA firm and do not give tax advice; a
   qualified tax accountant reviews each package; we *forward* ITIN applications to an
   IRS-authorized Certifying Acceptance Agent, we are not one. Never write "our CPAs".
5. **`855-887-7737` is the IRS Ogden fax line**, never our phone number and never
   `Organization.telephone`.
6. **A fax receipt is transmission evidence, not IRS acceptance of the return.** Say so
   wherever a receipt is mentioned.
7. **No `utm_` on internal links.** First-touch attribution (`src/lib/attribution.ts`,
   cookie `f5472_attr`, never overwritten) means an internal utm link records nothing
   and only creates a duplicate URL.
8. **A new post needs three things or it ships without art:** the markdown file, a
   `POSTS` entry in `scripts/render-blog-artwork.mjs` (then run it to emit the webp),
   and an `ARTWORK_ALTS` entry in `src/lib/blog.ts`.
9. **`ORDER_CTA_EXCLUSIONS` in `src/lib/blog-order-cta.ts`** suppresses a product CTA
   on a post whose argument it would contradict. `itin-required-form-5472` excludes
   `itin` on purpose and correctly keeps `ein`, because the post's point is that the
   LLC's EIN covers the filing. Resolution is otherwise automatic from tags and slug.

## Open items

### Owner-gated decisions
- ~~207 internal `utm_` links~~ **Done — the owner approved the sweep in-session.** All
  217 internal `utm_` links are now gone from the blog (10 in the partner cluster, then
  207 across 94 files), plus one on the `/dashboard` renewal banner. See
  "The internal utm sweep" below.
- **Delaware's own site contradicts itself** on the LLC annual tax: the Division of
  Corporations' alt-entity tax instructions say $400, while `/frtax/` and `/taxfaq/`
  still say $300. Posts now cite the $400 page and note the conflict. If Delaware
  updates the stale pages, the hedging sentences can be simplified.

### Follow-ups
- Two points in `file-form-5472-for-clients-without-being-a-cpa.md` are published as
  **unverified on purpose**: why Circular 230 §10.8(a) still names "registered tax
  return preparer" when the current IRS credentials page says PTIN-only preparers are
  authorized, and whether a pro forma 1120 cover plus a full Form 5472 is
  "substantially all" of a return. If either is ever resolved from a primary source,
  update that post rather than leaving the hedge in place.
- `npm run build` cannot complete reliably on this machine: `next/font/google` fetches
  from `fonts.googleapis.com` / `fonts.gstatic.com`, which fails with a self-signed
  certificate inside the sandbox and intermittent `ECONNRESET` outside it. Typecheck,
  tests and a direct `getPost`/`extractFaqs` harness were used as the build proxy.

## Lane notes

- Five writer lanes ran in parallel on disjoint files in one worktree. Two of them
  (intake checklist, CPA/PTIN) hit the 600s stream watchdog **after** writing complete
  files — the same failure mode as an earlier lane in this session. The correct
  response is to verify the artefact, not re-run the lane; both files were complete,
  properly closed and passed the gate.
- Shared files (`src/lib/blog.ts`, `scripts/render-blog-artwork.mjs`) were kept out of
  every lane's brief and edited only by the orchestrator, which is why five concurrent
  writers produced no conflict.
- A fact-audit lane found the one real defect in batch 1 (the Delaware citation) that
  five writing lanes and the authoring gate had all missed. Auditing a batch against
  primary sources after writing it, as a separate lane, earns its cost.
- The audit's own finding was itself partly wrong — it reported `/frtax/` as showing
  only $300 and concluded the $400 figure was unsupported, when the figure is correct
  and a different official page carries it. A subagent's finding is a lead to verify,
  not a verdict to apply.

## The internal utm sweep (same session, after owner approval)

**What was removed.** Every `](/path?utm_source=…&utm_medium=…&utm_campaign=…)` on an
internal link in `content/blog/*.md` — 207 links across 94 files, all of the identical
shape, no mixed query parameters — plus the one on the `/dashboard` renewal banner in
`src/app/(app)/dashboard/page.tsx`. Targets affected: `/start` (162), `/ein` (13),
`/itin` (10), `/itin/apply` (9), `/ein/apply` (8), `/diirsp` (5). No blog-to-blog link
carried utm. Zero external links were touched.

**Why these were dead.** `src/middleware.ts:27` is `if (req.cookies.has(ATTR_COOKIE))
return res;` — the `f5472_attr` first-touch cookie is written once, on a visitor's very
first request to any page, and never overwritten for 90 days. A reader who is already
on a blog post necessarily has the cookie, so the utm parameters on a link they click
next are never read by our attribution. They also actively harmed GA4, which treats
utm parameters as a new campaign and would re-attribute an in-progress session to
"blog / internal".

**What deliberately kept its utm parameters:**
- `src/lib/reminders.ts:106` builds `/start?utm_source=email&utm_medium=lifecycle&utm_campaign=<campaign>-reminder`
  for lifecycle emails. **An email click is a genuine external entry point** and can
  legitimately be a visitor's first touch (for example after the 90-day cookie has
  expired). Do not strip this one.
- `src/lib/attribution.ts` and `src/lib/attribution.test.ts` — the parsing logic and
  its fixtures.
- `src/lib/blog.test.ts:67` — a `blogSlugFromHref` fixture that intentionally contains
  a query string.

**How the change was proven safe.** For each of the 94 files, HEAD's blob was fetched,
the same regex applied to it, and the result compared byte-for-byte against the working
file: 94 of 94 matched, so nothing but the query strings changed. All six link targets
were confirmed to resolve (`/diirsp` is served by the `src/app/(marketing)/[seoSlug]`
SEO catch-all, not a dedicated route — it returns 200 in production). `npx tsc
--noEmit` clean; full `npx vitest run` green at 388 tests across 103 suites.

**A verification lesson worth keeping.** The first sanity check on this diff reported a
mismatch. It was wrong: the check filtered diff lines with `grep -E '^\-[^-]'`, which
silently drops removed **markdown bullet** lines (they render as `-- ` in a diff) while
the `+` side kept added bullets. When a verification script disagrees with an obviously
safe transformation, suspect the script before the transformation — and prefer
reconstructing the expected content from HEAD over pattern-matching diff output.

## Digital-nomad cluster — ten posts (same session, later)

**What shipped.** Nine country posts following the established
`form-5472-<country>-residents-us-llc` template — Thailand, Indonesia/Bali, Vietnam,
Portugal, Philippines, Malaysia, Georgia (the country, disambiguated from the US state in
slug, title and opening), Colombia, Estonia (with e-Residency) — plus the hub
`form-5472-digital-nomad-us-llc`. The hub's destinations table links all 15 country
posts on the site; every new country post links back to the hub. Specs:
`docs/reviews/new-posts-nomad-batch-spec.md`. Audit:
`docs/reviews/2026-09-18-nomad-batch-audit.md`.

**Treaty status, read from the IRS A-to-Z list by section rather than keyword** (a
missing country was confirmed by reading the whole alphabetical section):
in force — Thailand, Indonesia, Portugal, Philippines, Georgia, Estonia; **not in
force** — Vietnam (the "V" section lists only Venezuela; a treaty signed 7 July 2015
never entered into force), Malaysia (no *comprehensive* treaty, but LHDN lists the US as
a *limited* agreement, P.U. (A) 242/1989 — the post says so), Colombia (no official
record of a signing found; the post labels any signing claim unverified).

**The audit found one P0, fixed before publishing.** The Vietnam post named the new
personal income tax law as "No. 63/2025/L-CTN" — "L-CTN" is a presidential promulgation
order, not the law. The law is **No. 109/2025/QH15**, passed 10 December 2025, in force
1 July 2026; the orchestrator confirmed the page title on Vietnam's Official Gazette
(Công báo) before applying it, and the citation moved from state media
(`vietnamnews.vn`) to that gazette. A P1 in the same post told *every* reader their tax
code is the 12-digit personal ID; that applies to Vietnamese citizens, while a foreign
national — the post's actual audience — keeps the 10-digit code the tax authority
issued. Three lines were corrected. Two P2s were taken: Georgia's 1% small-business
rate now says it applies to **Georgian-source** income, and Indonesia's NIK-as-NPWP
rule now follows the regulation's definition of a resident.

**Vietnam Article 29(2) — taken after verification (owner said "do it").** The orchestrator read Article 29 in the official text of Law No. 109/2025/QH15 (the `.docx` published on Vietnam's Official Gazette, congbao.chinhphu.vn, read in memory). Clause 1: the law takes effect 1 July 2026 except as in clause 2. Clause 2: provisions on business income and salary/wage income of **resident** individuals apply from the **2026 tax period**. The post now says so. The same text confirms passage on 10 December 2025. All audit findings for the nomad batch are now closed.

### Contracts for this cluster
- **A country post's treaty sentence must survive a section-level read of the IRS
  A-to-Z page.** "No treaty in force", "no comprehensive treaty" and "no treaty ever
  signed" are three different claims; each post uses exactly the one it can support.
- **Local tax figures are sourced to the country's own authority or stated as
  unverified.** Several posts deliberately omit a figure because two official pages
  disagreed (Estonia's nomad-visa income threshold: gross on one page, net on another;
  Thailand's "more than 180 days" versus "180 days or more").
- **Local tax is described in outline only**, as context for why the US filing is
  separate. No post tells a reader what they owe locally.
- New cluster posts need a row in the hub's destinations table and a hub backlink
  above the closing disclaimer.

### Lane notes
- **A DNS outage (`ENOTFOUND`) killed three lanes at once, and one lane stalled twice.**
  Three of the four had already written complete files, because the relaunch brief
  told lanes to write the draft to disk *before* running the gate. Put that instruction
  in every writing brief: a draft on disk survives a watchdog kill or a network drop, a
  draft in memory does not. Only Colombia, killed before it wrote anything, had to be
  re-run.
- **Orphaned files get the orchestrator's own verification**, because they never ran
  their self-check. It found that Malaysia's LHDN links returned 500 to curl — LHDN
  blocks curl's default client; with a browser user-agent both return 200.
- **Several government sites render content with JavaScript** (LHDN, Matsne), so curl
  sees CSS rather than the text and cannot confirm a figure. The fact-audit lane read
  Georgia's Tax Code from the official PDF on the same site instead. "I couldn't read
  it with curl" is not the same as "it isn't there".

## Nomad batch 3 — five search-led topics (same session, after owner approval)

Plan `docs/reviews/nomad-batch-3-plan.md` (approved: "write it"); assignments K–O in
`docs/reviews/new-posts-nomad-batch-spec.md`; audit
`docs/reviews/2026-09-18-nomad-batch-3-audit.md`.

Shipped: `us-llc-tax-free-digital-nomads-myth`, `stripe-atlas-doola-firstbase-form-5472`,
`form-5472-freelancers-upwork-fiverr-us-llc`,
`wyoming-vs-new-mexico-vs-delaware-llc-digital-nomads`,
`us-llc-vs-estonia-ou-vs-uae-company-digital-nomads`. The nomad hub gained a "Which
nomad questions have their own guide?" table linking all five; all five link back.

**Audit: 0 P0, 3 P1, 1 P2 — all applied.**
- The tax-free post implied occasional US work was safe unless "considerable, continuous
  and regular". The orchestrator verified IRS Pub 519 verbatim: services performed in the
  US "at any time during the tax year" usually make you engaged in a US trade or business,
  with a three-condition exception (foreign employer or contracting party not itself in a
  US trade or business, 90 days or less, $3,000 or less). The post now quotes it.
- New Mexico "no annual report" was **confirmed correct**. The widely repeated triennial
  LLC report comes from 2023 HB 281, which was postponed indefinitely and never enacted;
  the LLC Act in force (53-19 NMSA) has no periodic report. Both the comparison post and
  the existing New Mexico post now say so, so readers who saw the false claim elsewhere
  get an answer.
- The comparison post's Delaware $300/$400 discrepancy is now explained by HB 400
  (signed 21 May 2026, effective 1 January 2026). "First payable 1 June 2027" is still
  deliberately **not** stated — it is an inference, not a sourced fact.

### Contracts added by this batch
- **Posts naming real companies** (Stripe Atlas, doola, Firstbase) cite only each
  company's own page, dated "checked 18 September 2026", neutral in tone. If a page is
  silent the post says "not stated". Re-check these rows when refreshing — pricing and
  plan pages change more often than tax law.
- Platform help centres (Upwork, Fiverr) block curl; the posts name the articles in text
  rather than linking them.
