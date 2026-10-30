# 2026-10-30 — 10-post November blog batch + doola/Firstbase comparison rescue

## Ownership

| Checkout / branch | Files owned this session |
|---|---|
| `~/Developer/f5472-wt/compare` on `blog-compare-doola` | `content/blog/form-5472-filing-service-comparison.md`, `docs/sessions/2026-10-26-compare-post-doola-firstbase.md` — **pushed to main as `1ad7d4f`** |
| `~/Developer/f5472-wt/blog-nov` on `blog-nov-2026` | the 10 new `content/blog/*.md`, their 10 `public/blog/*.webp`, the new entries in `scripts/render-blog-artwork.mjs` and `src/lib/blog.ts`, `docs/reviews/blog-batch-nov-2026-spec.md`, this log, plus one surgical paragraph in `content/blog/form-5472-penalty-notice-what-to-do.md` (see below) |

Three writer lanes wrote into the `blog-nov` worktree concurrently, each owning only its
own post files. All git operations, both shared maps, the artwork render and the
scheduler run were done centrally by the orchestrator so the lanes could not collide.

## What shipped

### 1. Comparison post rescue (pushed, live)

The doola/Firstbase edits had been sitting **uncommitted for four days** while `origin/main`
moved on four commits. Another session had meanwhile edited the same post twice
(anchor-text dedupe, plus a link to `/compare/form-5472-filing-services`). Rather than
rebase-and-resolve, the file was rebased onto the newer base and that session's two
changes re-applied on top, so nothing of theirs was clobbered. Verified live, 200, with
doola and Firstbase rendering; submitted to IndexNow by hand (the cron skips posts with
no `publishAt`).

### 2. Ten posts, drip-scheduled 31 Oct → 9 Nov 2026

One per day at 09:00 London (now `+00:00`; BST ended 25 October).

| Date | Slug | Conversion target |
|---|---|---|
| 31 Oct | `delaware-llc-annual-tax-2027-foreign-owner` | `/start` |
| 1 Nov | `foreign-owned-llc-1099-nec-deadline-january-2027` | `/start` |
| 2 Nov | `foreign-owned-llc-year-end-checklist-december-2026` | `/start` |
| 3 Nov | `form-5472-extension-vs-late-filing-which-is-cheaper` | `/form-7004-extension` |
| 4 Nov | `form-5472-first-time-penalty-abatement` | `/start` |
| 5 Nov | `form-5472-no-ein-yet-what-to-do` | `/ein` |
| 6 Nov | `form-5472-records-to-gather-before-filing` | `/start` |
| 7 Nov | `form-7004-line-by-line-foreign-owned-llc` | `/form-7004-extension` |
| 8 Nov | `how-to-fill-out-w-8ben-e-foreign-owned-llc` | `/start` |
| 9 Nov | `us-sales-tax-vs-vat-foreign-owned-llc` | `/start` |

Four of the ten feed `/form-7004-extension`, which shipped as a service with almost no
blog support behind it.

## Contracts a future editor must respect

- **There is no `price.extension` token and adding one will break the build.** Our Form 7004
  service is $79 and Snapfile's competitor tier is also $79, so adding the token would make
  the price guard flag ten legitimate Snapfile mentions in
  `form-5472-filing-service-comparison.md`. All ten new posts therefore **state no price for
  the extension service** and link `/form-7004-extension` instead. If a token is ever added,
  add `ALLOWED_LITERALS` entries for the Snapfile mentions in the same commit.
- Every new slug needs three things or the page ships with a broken image: a `POSTS` entry in
  `scripts/render-blog-artwork.mjs`, an `ARTWORK_ALTS` entry in `src/lib/blog.ts`, and a
  rendered `public/blog/<slug>.webp`. The image path is unconditional — there is no fallback.
  Artwork is **not** test-enforced, so nothing will catch a miss.
- `publishAt: auto` → run `npm run blog:schedule` before committing. `blogSchedule.test.ts`
  fails on an unresolved literal `auto`.
- `fitTitle(seoTitle ?? title) <= 60` and `description <= 160`. Keep `seoTitle` <= 43 chars to
  earn the " · Form5472 Prep" suffix.

## Verified evidence

Claims checked by the orchestrator against primary sources directly, not taken from the
lanes' reports:

- **Form 1120 = form code 12** on Form 7004 — extracted from `f7004.pdf` itself by
  decompressing its text streams (no pdftotext/poppler on this machine). The orchestrator's
  own brief had guessed "01"; 01 is Form 706-GS(D). The lane was right to override it.
- **FTA does not reach Form 5472** — IRM 20.1.1: "Examples of some returns where penalty
  relief under the FTA waiver is NOT applicable include: ... Form 5472 ... (See IRM 20.1.9 for
  exception.)" The post carries the exception cross-reference rather than a flat no.
- **i5472 on Form 7004** — "the code for Form 1120 should be entered on Form 7004, Part I,
  line 1"; "'Foreign-owned U.S. DE' should be written across the top of Form 7004"; fax or
  mail to the PIN Unit, not the regular Form 7004 address.
- **$2,000 1099-NEC threshold** and the §6071(c) January 31 wording — verbatim on irs.gov.
- **FinCEN BOI** — a US-formed LLC is exempt even with a foreign owner; the post says so and
  distinguishes entities formed abroad.
- **Delaware $400.00** — both `corp.delaware.gov/frtax/` and `/alt-entitytaxinstructions/`
  read 30 Oct 2026: $400.00 annual tax, due 1 June, $200.00 penalty, 1.5%/month. **Zero**
  occurrences of $300 on either page.
- 31 January 2027 is a Sunday, so the 1 February derivation follows from the quoted
  next-business-day rule.
- `npx vitest run` on the four blog guards: **472 passed, 0 failed**. `tsc` clean apart from
  3 pre-existing `supportMail/imap.ts` errors.
- House lint (scratch script) clean on all 10: no "filed within 24 hours", no credential
  claims, no hard-coded prices, no cross-chunk pronouns, FAQ + disclaimer present, answer
  blocks in the 38-64 word band.

## Still open

### Owner-gated

- Nothing blocking. The batch publishes itself on the drip schedule.

### Follow-ups (found in passing, deliberately NOT touched — not this session's files)

0. **Not added for length**: `how-to-fill-out-w-8ben-e-foreign-owned-llc.md` presents the line 3
   informational entry as permitted, which is correct per the instructions, but carries no warning
   that a payer's onboarding system may still reject or mishandle a line 3 entry. The post sits at
   2,185 words against the 2,200 ceiling, so the sentence was left out rather than displacing a
   verified correction. Add it if the ceiling moves.

1. **Three live posts misattribute "the IRS's special DE instructions" to Form 7004**:
   `foreign-owned-llc-filing-requirements-checklist.md`, `form-5472-coaches-consultants-course-creators.md`,
   `form-5472-turkey-residents-us-llc.md`. The Form 7004 instructions mention "disregarded"
   **0** times, "pro forma" **0**, "5472" **0** (verified 30 Oct 2026). The phrase is correct
   for the 1120/5472 route — the DE-specific Form 7004 direction actually lives in the *Form
   5472* instructions, not the Form 7004 ones. Reword to cite i5472.
2. **`form-5472-extension.md` states a DE "cannot e-file Form 7004"** — no IRS page found says
   this. i7004 says Form 7004 can be e-filed for most returns and does not exclude Form 1120;
   i5472 directs this filer to fax/mail. The new `form-7004-line-by-line` post names the
   conflict and relies on i5472 as the specific guidance. One of the two posts should move.
3. **`sales-tax-nexus-foreign-owned-llc.md` cites a now-404 Supreme Court URL twice**
   (`supremecourt.gov/opinions/17pdf/17-494_j4el.pdf`) and sources the "$100,000 / 200
   transactions" statute terms to it. Needs a link fix and a sourcing review.
4. ~~`form-5472-penalty-notice-what-to-do.md` FTA section~~ — **FIXED this session**, see
   "Scope expanded deliberately" below.

## Scope expanded deliberately (one file outside the original owned set)

`content/blog/form-5472-penalty-notice-what-to-do.md` line 51 said flatly: "No. The IRS's First
Time Abate (FTA) administrative waiver covers three penalty types only, and the Form 5472 penalty
is not among them." Shipping the new, corrected FTA post beside it would have left two live pages
giving opposite answers to the same question — and that page's reader is holding a CP215, which is
precisely the systemically-assessed PRN 711 situation the exception is written for.

That contradiction is one this session's own work creates, so fixing it is part of finishing the
work rather than cleaning unrelated dirt. The change is one paragraph: "As a general waiver, no…"
plus the PRN 711 exception, the "$0 tax due" quote, both three-prior-period conditions, and a link
to the new post. The file was clean in `git status` before the edit. Nothing else in it was touched
— in particular it still has no "Educational content only" footer, which it never had and which
only 94 of 207 posts carry.

## Review findings and how they were resolved

A read-only Codex pass raised 11 findings. The orchestrator verified the material ones against
primary sources before dispatching them back to the lane that wrote each post, with instructions to
decline if they disagreed.

- **FTA / PRN 711 (the significant one).** Verified in IRM 20.1.9.5.5(3) by the orchestrator: FTA
  relief reaches a Form 5472 penalty where it was systemically assessed with PRN 711 off a
  late-filed Form 1120 and the related 1120's failure-to-file penalty was abated under FTA, "or
  would have been eligible for FTA abatement but a failure to file penalty wasn't assessed because
  there was $0 tax due or it was a fully paid return". A pro forma Form 1120 always shows $0 tax, so
  this is our readers' default state. Both the new post and the extension-vs-late post were
  rewritten; the lane also caught the same defect in a comparison-table row that Codex missed.
- **1099-K carve-out.** Payments by card or third-party network are reported by the settlement
  entity under section 6050W, not by the payer on 1099-NEC. The lane accepted the fix but
  deliberately scoped it *narrower* than the orchestrator proposed, adding a boundary paragraph,
  because "I paid by Wise, so no 1099" is a worse error than the one being corrected — a wire or
  ACH from the LLC's own account is neither a card nor a third-party network payment. It also
  declined to name Stripe/PayPal/Wise, having no irs.gov source classifying any named platform.
- **Backup withholding** reportable regardless of amount; **title/body date clash** (statutory 31
  January 2027 is a Sunday, operative 1 February) resolved by retitling and letting the body carry
  the distinction; **W-8 validity** reworded to allow indefinite validity; **Delaware** line that
  implied a federal corporate election changes the state entity tax corrected.

## Lane notes

- **Quoting IRS instructions by byte offset is how you quote the wrong section.** A lane fetched
  the W-8BEN-E instructions at `offset: 100000`, landed inside "Hybrid Entity Making a Claim of
  Treaty Benefits", and quoted that section's line 9b and line 10 text as if it were the general
  instruction — producing a post that contradicted its own line 1 explanation. Locate a quote by
  its **enclosing section heading**, not by offset, and re-read raw HTML rather than a summary
  when a quote is load-bearing. The same lane's first pass on Delaware also mis-read a `$400`
  corporate franchise-tax figure as the LLC figure from a summariser; the raw read caught it.
- **A reviewer finding can be half right.** The W-8BEN-E line 3 finding looked wrong two sentences
  into the instruction and correct by the third — there are genuinely two routes (the conditional
  GIIN entry and an informational entry). Read to the end of the instruction before declining.
- **Delaware's annual tax is statutory, not classification-driven**: 6 Del. C. § 18-1107(b) sets
  $400 for every domestic LLC; (c) sets the 1 June following the close of the calendar year, which
  independently confirms the prior-year framing; (e) makes the $200 part of the tax, which
  reconciles the statute's interest-on-tax wording with the Division's interest-on-tax-and-penalty
  wording. § 18-1107(a) imports federal classification but only for income-tax purposes.

- **`codex exec` blocks on stdin.** A backgrounded `codex exec` with no stdin redirect prints
  "Reading additional input from stdin..." and hangs forever — this is what killed the review
  in the 26 Oct session, which was misdiagnosed there as `tail` buffering. Always launch it
  with `< /dev/null`, and write to a file rather than piping through `tail`.
- **Do not `pkill -f` a stuck lane**: the auto-mode classifier refuses it as interfering with
  workloads. Launch a fresh process instead.
- **Dedup greps must allow for slug spelling.** The orchestrator's grep for `w-8ben` missed the
  existing `w8ben-vs-w9-foreign-owned-llc.md` because that slug has no hyphen after the `w`.
  A lane caught it and substituted an adjacent open angle. Grep for several spellings, and
  keep telling lanes to re-check their own slug before writing — that instruction is what
  saved two near-duplicate URLs here.
- Stale Prisma client recurs on this repo whenever another session adds a model
  (`extensionApplication` missing). `npx prisma generate` fixes it; node_modules is not
  committed so it is safe to run from any worktree.
