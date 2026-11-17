# 2026-11-17 — Form 1120X post, EIN trust post, and a PII finding

## Ownership

| Checkout / branch | Files owned |
|---|---|
| `~/Developer/f5472-wt/blog-nov` on `blog-amend` | `content/blog/form-1120x-foreign-owned-llc-amended-return.md`, `content/blog/is-it-safe-to-use-an-ein-service.md`, their two `public/blog/*.webp`, the new entries in `scripts/render-blog-artwork.mjs` and `src/lib/blog.ts`, `docs/reviews/blog-batch-nov-2026-spec.md`, this log |

Both posts were written by the Codex lane (`gpt-6.1-sol`; `gpt-5.5` is rejected on a
ChatGPT account). The orchestrator owned the briefs, the shared maps, artwork,
scheduling, verification and commits.

## What shipped

Two posts, drip-scheduled: `form-1120x-foreign-owned-llc-amended-return` on 17 Nov
09:00 London (a slot already past, so it is public on deploy) and
`is-it-safe-to-use-an-ein-service` on 18 Nov 09:00.

### 1. Form 1120X — the instrument question

The owner asked for "a post that we can do amendment on 5472 and 1120". A post saying
exactly that would have duplicated `amended-form-5472-correcting-errors.md`, which
already owns how to correct a filed 5472, already has a "What if the mistake was on the
pro forma 1120 instead?" section, and already carries a full CTA selling corrected
packages for both forms. The post was therefore pointed at the open question:
**is Form 1120X even the right instrument for a pro forma return?** `1120X` appeared in
**zero** of the 200+ posts.

The post deliberately asserts neither permission nor prohibition, because the sources do
not support either. It says so and labels the gap.

### 2. EIN — trust by disclosure

"Write it as more trustworthy" cannot be executed by asserting trustworthiness. Sixteen
EIN posts already exist and the nearest (`ein-third-party-designee-apply-on-your-behalf`)
already owns red flags and safe authorisation. The open angle was the information side:
what a provider asks for, why the IRS needs each item, what happens to it afterwards, and
how to verify any provider. The post earns trust by publishing our own limits — that the
IRS issues EINs free, that no provider outruns the IRS queue, that our retention page has
no EIN-specific row, and that the filing flow's encryption assurance does **not** extend
to the EIN intake's tax-number box.

## Verified evidence (orchestrator, against primary sources, not lane reports)

- **Form 1120X instructions mention "disregarded" 0 times, "pro forma" 0, "5472" 0,
  "6038A" 0.** The post's thesis that they are silent on this filer is sound.
- **Form 5472 is (Rev. December 2023)** and contains no "Amended" anywhere;
  **Form 1120 item E** is exactly *Initial return / Final return / Name change / Address
  change*, and "Amended return" appears nowhere on the form. Both extracted from the IRS
  PDFs directly. The lane had flagged its own Rev. December 2023 citation as unverified —
  it was correct, and "fixing" it would have introduced an error.
- **Form SS-4 (Rev. December 2025)** contains no "birth", no "passport", no "PTIN".
- Guards: `seo-title`, `blog`, `blog-price-tokens`, `blogSchedule` → **487 passed**.
  `tsc` clean apart from the 3 pre-existing `supportMail/imap.ts` errors.
- House lint clean on both; answer blocks 50 and 49 words; every FAQ ≤50 words; the
  HowTo schema fires on both (5 and 7 numbered steps under a "How…" H2).

## Contracts a future editor must respect

- **`extractHowTo` (`src/lib/blog.ts`) only emits HowTo schema when an `##` H2 begins with
  the word "How" and is followed by at least two numbered list items.** No other shape
  works. Brief this explicitly or posts ship without HowTo schema.
- **Never hand-write JSON-LD, OG tags, Twitter cards or a "Last updated" line into a
  post.** `src/app/(marketing)/blog/[slug]/page.tsx` emits `BlogPosting` + `FAQPage` +
  `HowTo` in one `@graph`, builds OG/Twitter from frontmatter, and renders the date from
  `updated:`. Following a generic SEO playbook literally produces duplicate schema.
- Express is **"ready for you to check and sign in under 3 days, 7 days a week"** since
  2026-11-03. The house spec still said "within 24 hours" until today and was corrected.
  Any post written against the old spec carries a false promise.
- The Form 7004 extension price was **cut from $79 to $19 on 2026-11-03**. At $19 it no
  longer collides with Snapfile's $79, so a `price.extension` blog token is now safe to
  add — it was not safe at $79.

## Still open

### Owner-gated — PII handling on the application intakes

Found while fact-checking the EIN post's data claims. **Not touched; these are schema and
code changes, not blog work.**

1. **`EinApplication.responsiblePartyTin` stores an SSN or ITIN as a plain string column.**
   The Form 5472 flow encrypts the equivalent value (`Filing.ownerSsnCiphertext`, marked
   "server-only — stripped from every client/partner/API payload"). The EIN intake collects
   the same class of identifier at `/ein/apply` and stores it unencrypted. Routing it
   through the same path as the filing flow would close the gap.
2. **`ItinApplication.passportNumber` is also a plain column, and the passport number is
   included in the staff notification email** (`src/lib/email.ts`). Emailing a passport
   number is a larger exposure than storing it.
3. **The EIN intake collects the owner's date of birth, citizenship and country of
   residence. Form SS-4 has no line for any of them** (verified against the form, Rev.
   December 2025). Either there is a downstream reason that should be documented on
   `/privacy`, or the date of birth should not be collected.
4. `/data-retention` has no row for EIN applications. The new post says so in terms,
   because no public page documents it.

The EIN post is written to be true under today's behaviour — it scopes the encryption
claim to the filing flow and tells readers to ask support about the EIN box. **If items 1
and 4 are fixed, that paragraph should be rewritten to say so**, because it currently
reads as a limitation.

### Follow-ups

5. `/ein` copy says "We call the IRS Business & Specialty Tax Line". The SS-4 instructions
   (rev. 12/2025) say the IRS no longer issues EINs by phone for domestic taxpayers; the
   international line is 267-941-1099. The page copy may be stale. Not verified end to end.
6. Carried from 2026-10-30 and still open: three posts attribute "the IRS's special DE
   instructions" to Form 7004 (whose instructions never mention disregarded entities, pro
   forma returns or Form 5472); `form-5472-extension.md` claims a DE "cannot e-file Form
   7004" with no IRS page supporting it; `sales-tax-nexus-foreign-owned-llc.md` cites a
   404'd Supreme Court URL twice.

## Lane notes

- **`codex exec` blocks on stdin.** Launch backgrounded Codex with `< /dev/null` and write
  to a file rather than piping through `tail`.
- **Do not `pkill -f` a stuck lane** — the auto-mode classifier refuses it.
- **Verify a lane's self-doubt as carefully as its claims.** The 1120X lane flagged its own
  "Form 5472 (Rev. December 2023)" citation as unverified; it was right, and acting on the
  doubt would have broken a correct citation. Conversely the orchestrator's own FAQ
  word-count script over-counted the final answer by swallowing the trailing `---` and
  disclaimer, and briefly looked like a lane defect. Check the checker.
- The shell on this machine is bash 3.2 and refuses compound commands with arrays or
  multiple `$(...)`. Put multi-step Python in a file and run it.
- Deviation from the orchestration doctrine, logged deliberately: one 12-word clause in the
  EIN post ("a PTIN is not a required SS-4 credential" → "neither Form SS-4 nor its
  instructions mention a PTIN or any preparer credential") was edited by the orchestrator
  rather than routed back to the lane. The underlying fact was verified directly from the
  form; a full lane round-trip for one clause was not worth it.
