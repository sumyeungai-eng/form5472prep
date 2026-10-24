# 2026-10-24 — the 15 October deadline passed: refreshing two live posts

**Checkout/branch:** `~/Developer/f5472-wt/compare`, branch `blog-deadline-refresh-1024`.
Owned: `content/blog/form-5472-deadline-tomorrow-urgent-filing.md`,
`content/blog/form-5472-deadline-2026.md`, this log.

## Why
On 13 October this session published an urgency page for the 15 October 2026 extended
Form 5472 deadline — titled "Filing in Two Days", with an hour-by-hour table dated Tue 13
to Thu 15 October. **That session's own handoff flagged that the post would expire on the
15th and needed rewriting or retiring. It was not actioned, and the post ran for nine days
telling readers a passed deadline was two days away.** Anyone arriving was pushed toward a
deadline they had already missed instead of being told they were now a late filer.

A sweep of all 196 posts for the same failure mode (a date-bound claim that has since
expired) found only these two. The "checked <date>" stamps on the competitor and platform
posts are correctly-dated statements, not stale claims.

## What changed
**`form-5472-deadline-tomorrow-urgent-filing.md` — rewritten, same slug.** The URL keeps
its ranking and inbound links; the content now serves the reader who arrives after the
deadline, in three cases: extended and missed it, never filed a 7004 (late since 16 April
2026), or reading ahead. Title "Form 5472 Deadline Passed on 15 October 2026: Filing Late
Now" (`seoTitle` 58 chars). The dated table is replaced by an undated sequence. Express
remains the relevant offer — a late filer wants it closed fast and the exposure grows per
30-day period. `date: 2026-10-13` kept, `updated: 2026-10-24`, no `publishAt`. Tag
`express-filing` (one post) swapped for `late-filing` (now 7, crossing
MIN_INDEXABLE_TAG_POSTS).

**`form-5472-deadline-2026.md` — tense corrected in six places.** Its calendar's 2025
status row still read "Extended deadline 15 October 2026" as though upcoming; the as-of
header said 13 October; the meta description said the return "is due"; and the **answer
block** said "the final deadline **is** 15 October 2026". That last one matters most — it
is the passage an AI answer lifts, so a present-tense error there propagates off-site.

## Codex review — two rounds, six real findings
Round 1 (four, all applied):
1. **Factual error:** "a meter that starts once a notice arrives" contradicted the 90-day
   window. The additional $25,000 runs only *after* 90 days from IRS notification.
2. **Told the reader their position:** "If you filed Form 7004, your return is now late"
   also covers someone who had already filed. Qualified to an unfiled return.
3. **Overbroad rule:** "the form cannot be filed electronically" — the prohibition is on a
   **foreign-owned US disregarded entity**, not every Form 5472 filer.
4. **Dropped qualifier:** "an incomplete form is treated as a failure to file" restored to
   "substantially incomplete".
Round 2 confirmed all four and found the categorical lateness claim recurring in two more
places ("has been late since 16 April 2026", "late whether or not an extension was
filed"). Both now qualified with "if the return is still unfiled".

## Verified evidence
- Guards: `seo-title`, `blog`, `blog-price-tokens`, `blog-tags` → **451 pass**.
- `tsc` clean apart from the pre-existing `imapflow`/`mailparser` errors.
- Gate on the rewrite: utm 0 · no H1 · 7 FAQs none over 50 words · 1,995 words ·
  `/start` ×2 · no `publishAt` · no dangling links · no "two days/Tuesday/Thursday/dated
  table" framing survives · the only "filed within 24 hours" occurrence is the honesty
  line denying it.

## Contracts
- **A date-bound post is a liability with a due date.** If a post names a specific
  deadline in its title, answer block or a dated table, it needs an owner and a review
  date. The cheapest version is to prefer "the next deadline" framing over "in two days".
- Express = ready to **check and sign** within 24 hours; never filed/faxed within 24 hours.
- Our reviewer is a **tax accountant who holds an IRS PTIN** — never "IRS-approved" or
  "licensed".

## Open
- A post with no `publishAt` is **skipped by the `blog-release` cron's IndexNow step**,
  which requires a truthy `publishAt`. Both pages were submitted by hand again. This is
  the third session to hit it; the fix belongs to whoever owns `blog-release/route.ts`.
- `imapflow` and `mailparser` are declared in `package.json` but not installed in the
  shared `node_modules` — three typecheck errors in `src/lib/supportMail/imap.ts` in every
  worktree. Needs `npm install` in the main checkout.
- `src/lib/provider-prices.ts` still excludes Snapfile for "possible affiliation,
  unconfirmed"; the affiliation is now public on snapfile.tax.
