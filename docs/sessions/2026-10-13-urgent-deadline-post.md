# 2026-10-13 — urgent post for the 15 October extended deadline

**Checkout/branch:** durable worktree `~/Developer/f5472-wt/urgent`, branch `blog-urgent-1013`.
Owned files: `content/blog/form-5472-deadline-tomorrow-urgent-filing.md`,
`public/blog/form-5472-deadline-tomorrow-urgent-filing.webp`, the `POSTS`/`ARTWORK_ALTS`
entries for that slug, a one-line freshness refresh to
`content/blog/form-5472-deadline-2026.md`, and this log.

## Why it bypasses the drip scheduler
The daily queue was full through **19 October**. A post about a **15 October** deadline is
worthless on the 20th, so this one carries **no `publishAt`** and goes live on deploy.
`isPubliclyAvailable` returns true when `publishAt` is absent, which was verified through
the blog library before pushing. **This is a deliberate exception to the one-a-day drip,
justified by the deadline; do not treat it as the new default.**

## The commercial constraint — the whole point of the review on this one
`src/lib/pricing.ts` defines and comments it:
`EXPRESS_PROMISE = "Ready for you to check and sign within 24 hours, 7 days a week"` with
`// The exact Express promise. Never "filed/faxed within 24 hours".`
A "24-Hour filing" plan was briefly offered on 2026-10-10 and withdrawn.
The post therefore sells **preparation** inside 24 hours and names the client's signature
as the gate: we prepare → you sign → we fax. Every one of the twelve "24 hour" mentions
was checked by hand and is the prepare-for-signature promise, a heading, or an explicit
denial. The forbidden-phrasing grep returns only denials.

## Codex review (standing rule) returned FIX — three findings, all valid, all applied
1. The FAQ "Can you file my Form 5472 within 24 hours?" answered "No — and no honest
   provider can", then said "We fax it that day" two sentences later. Both too broad and
   **self-contradictory**: if the client signs at once, the fax can go inside 24 hours.
   Rewritten to "We cannot promise it: filing depends on your signature, not on us …
   Sign the same day and the fax goes the same day."
2. "you want the package **in** before Thursday" could be read as *filed* before Thursday.
   Now "ready to sign before Thursday".
3. The no-7004 section called a late filing "not a catastrophe … a different procedure,
   with a reasonable-cause statement attached" — which **softened real exposure**. Now
   states that a reasonable cause statement can accompany a late package but is not a
   procedure that clears the penalty, quoting the IRS: penalties "may be assessed without
   considering the attached reasonable cause statement" (DIIRSP page, verified verbatim).
Lesson: the review earned its keep on the two claims a writer is least able to see — its
own FAQ contradicting its own body copy.

## Verified evidence
- Orchestrator checks at source, not from the lane's report:
  - Continuing-failure penalty, quoted from the Instructions for Form 5472: the additional
    $25,000 "applies with respect to each related party for which a failure occurs for each
    30-day period (or part of a 30-day period) during which the failure continues after the
    90-day period ends" — **uncapped**, not a one-off.
  - Form 7004 "does not extend the time to pay any tax due" and must be filed by the
    return's due date, which is why a reader who never filed one has a late filing rather
    than a 15 October deadline.
  - The DIIRSP reasonable-cause sentence above.
- `npx vitest run src/lib/seo-title.test.ts src/lib/blog.test.ts src/lib/blogSchedule.test.ts`
  → **225 passed** (targeted, per the standing rule; the seo-title guard covers all posts).
- Blog-library parse check: post parses, `publishAt` absent, publicly available now,
  7 FAQs with none over 50 words, no dangling internal links, `seoTitle` present because
  the title is 57 characters.
- `node --check` on the artwork script before running it.

## Pre-existing problems found, not fixed, reported
- **`imapflow` and `mailparser` are declared in `package.json` but absent from the shared
  `node_modules`.** That leaves three typecheck errors in `src/lib/supportMail/imap.ts`
  (TS2307 ×2, TS7006 ×1) in every worktree symlinked to the main checkout. Nothing to do
  with this change; Vercel installs from `package.json` on deploy. Whoever owns the
  support-mailbox work should run `npm install` in the main checkout.
- `npx prisma generate` was needed again to clear stale `Filing`/`EmailLog` types in
  `src/lib/admin/websiteQuestions.ts`. Generated artefact, nothing committed.
- The local build was **not** run, because it cannot succeed until those two packages are
  installed. The change is two markdown files; CI runs the full suite on push.

## A gap this post exposed in the drip system (reported, not fixed)
`src/app/api/cron/blog-release/route.ts` selects posts to revalidate and submit to
IndexNow with:

```
const at = parsePublishAt(p.publishAt);
return !!at && at.getTime() <= now && at.getTime() > now - WINDOW_MS;
```

A post published **without** `publishAt` — which is exactly how an off-cycle urgent post
goes live — fails `!!at` and is therefore **never submitted to IndexNow by the cron**.
It still appears on /blog, in the sitemap and in the feed; it simply never gets pinged.

For this post the orchestrator submitted it by hand and IndexNow returned HTTP 200:
```
POST https://api.indexnow.org/IndexNow
urlList: /blog/form-5472-deadline-tomorrow-urgent-filing,
         /blog/form-5472-deadline-2026, /blog
```
(The key is public at `public/93ddcc589b3e2a572c208e3628e1e545.txt`, verified 200.)

**Follow-up for whoever owns the scheduling files** (not touched here, since that session
owns `blog-release/route.ts` and `blogSchedule.ts`): either treat a missing `publishAt`
as "released now" for one window, or compare against the post's `date`. Until then, the
rule for writers is: **a post published without `publishAt` needs a manual IndexNow
submission**, or it waits for organic discovery.

## Contracts
1. Deploy is `git push origin main`. Never `vercel --prod`.
2. Express = ready to **check and sign** within 24 hours, 7 days a week, $199. Standard
   $149, 5-7 business days. +$99 per extra past year. Fax delivery included on both.
   **Never** "filed/faxed/submitted within 24 hours", and never revive "24-Hour filing".
3. A provider fax receipt is transmission evidence, not IRS acceptance.
4. Not a CPA firm, no tax advice; a qualified tax accountant reviews each package.

## Open
- **Owner:** this post is evergreen only until 15 October passes. It is written around a
  specific deadline and an hour-by-hour table dated Tue 13 → Thu 15 Oct. **It needs
  rewriting or retiring after the 15th** — otherwise it is a stale urgency page. The
  natural move is to generalise it to "the next deadline" and re-point the table.
- `content/blog/form-5472-deadline-2026.md` carried a "Status at 7 October 2026" column
  header while every status row was still accurate; refreshed to 13 October and `updated`
  bumped. Same staleness will recur — the header is a hand-maintained as-of date.
