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
- **207 internal `utm_` links remain across 99 posts.** The ten in the partner cluster
  are stripped. The rest is a mechanical sweep that would touch most of the blog in one
  diff; it was not in this session's scope and needs a go-ahead before it lands
  alongside another session's work.
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
