# 2026-10-03 — blog drip scheduling (one post a day, 09:00 London)

**Checkout/branch:** worktree `~/Developer/f5472-wt/blogsched`, branch `feat/blog-schedule` → pushed to `main`.
Owned files: `src/lib/blogSchedule.ts` (+test), `src/lib/indexnow.ts` (+test), `scripts/schedule-blog-posts.ts`, `src/app/api/cron/blog-release/route.ts`, `vercel.json`, `package.json` (script only), `src/app/admin/posts/{page,PostEditor,new/page,[slug]/page}.tsx`, `src/app/api/admin/posts/{route,[slug]/route}.ts`, `src/lib/blog.ts` (header comment only), this log.

## Owner decision
Write many posts at once and have one go live **every day, weekends included, at 09:00 London time** (BST/GMT aware).

## What shipped
- **Engine (already existed):** a future `publishAt` hides a post from /blog, the post URL, the sitemap, the feed and related links until that instant (ISR 60s). No deploy is needed at release.
- **`publishAt: auto` + `npm run blog:schedule`:** assigns each auto post the next free daily slot.
  - Gaps are filled first. Slots start today if before 09:00 London, otherwise tomorrow.
  - Queue order is frontmatter `date`, then file name.
  - Rewrites `publishAt` and `date` in place. `--dry-run` previews; `--list` shows the queue.
- **Cron `/api/cron/blog-release`:** daily at 09:05 UTC (after the slot in both BST and GMT). It revalidates the blog listings, sitemap and feed for posts released in the last 26h, then submits them plus /blog to IndexNow (key is public: `public/93dd…e545.txt`).
- **Admin /admin/posts:**
  - "Publishing queue" panel: upcoming releases in order, the last date, and the next free day.
  - Scheduled / Not-scheduled badges, plus a warning listing any post stuck on an unresolved `auto`.
- **Admin editor:**
  - "When to publish": Publish immediately, or Schedule with a date + London time and a "Use next free day" button.
  - The save button reads "Schedule" for a future release.
  - The API validates `publishAt`; "" clears the schedule.
- **Guard test:** fails if any `content/blog/*.md` has an unparseable `publishAt` (e.g. `auto` left behind).
- **Verified:** vitest 1693/1693, including slot math across the 25 Oct 2026 clock change and 30 posts landing on 30 distinct days at 09:00. `next build` passes. The script was dry-run on a temp copy: two auto posts became Sun 4 Oct and Mon 5 Oct at 09:00 +01:00, with the body untouched.
- **Not verified:** the admin UI was not viewed in a browser (admin login is password-gated and the agent can't sign in). The cron's first live run is the next 09:05 UTC after deploy.

## Contracts
- Times are London wall-clock. Use `londonInstant()` and never hand-write `-04:00` offsets for new posts (older posts used New York time; they're harmless).
- `tsx` is not a dependency; the script runs via `npx --yes tsx` (first run needs network).
- The script only sees file posts. DB posts scheduled in admin are invisible to it, so a shared day is possible and harmless.
- Writers (Claude/codex sessions) creating a batch: put `publishAt: auto` in each post → `npm run blog:schedule` → `npm test` → commit → push.

## Open
- **Owner:** click through /admin/posts once to sanity-check the queue panel and editor.
- **Follow-up (optional):** daily Telegram/email note "today's post is live".
