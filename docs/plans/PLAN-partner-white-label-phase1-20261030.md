# Plan: Partner white-label, Phase 1 ("invisible by default")
Version: 1 | Status: STEPS 1–9 COMPLETE — step 10 (ship) awaiting owner | Date: 2026-10-30

Source request: `partner-white-label-plan.md` (27 Oct 2026, AmericaNexus trigger), Phase 1 of its §8.
This plan covers only the gaps the code actually has. The audit ran on `origin/main` @ `1881925`.
The main checkout `~/Documents/Codex/form5472` is 200 commits behind and must not be used.

## 1. Goal

A partner's end client can complete a partner filing without seeing or receiving anything from us, apart from the legally required items in the source plan's §4. The client fills in intake (optional) and signs on a neutral domain under the partner's name. The client never gets an email from our domain, never sees our prices, receives none of our tracking scripts and never sees our brand in PDF metadata or file names. Every message the platform would have sent the client goes to the partner instead. Retail customers see no change except the stronger signing record (Q4).

**Whole-project acceptance:** a test partner filing on a Neon branch DB runs end to end: create, client intake by link, partner pays, admin generates, client signs, fax finalize in sandbox. `scripts/partner-leak-scan.ts` then reports zero hits outside §4 across:
- every portal page's HTML
- the browser network log
- every PDF the client or partner can download
- every EmailLog row for the filing

No EmailLog row is addressed to the client's email.

## 2. Scope and non-goals

**In scope**
- **Client mail guard.** One function at the `sendEmail()` choke point. Mail addressed to a partner's client is either redirected to the partner (transactional) or dropped (marketing, reminders, magic links, review requests).
- **Partner dashboard.** "Send to client" buttons become "Copy link". The platform never emails the client in partner-only mode.
- **Wizard client view.** For partner filings, a client reaching the review step sees no tier, price or Pay button. They get a "Finish" button that tells the partner instead. Payment comes only from the partner's session, with the Stripe customer email set to the partner.
- **Neutral portal host** (`PARTNER_PORTAL_HOST`). Invite, intake and sign pages are served there with:
  - the partner's name as the header
  - neutral `<title>`, metadata and favicon
  - no Google Ads, Meta Pixel, VisitPing, Vercel Analytics, Speed Insights or chat widget
  - no attribution cookie
  - a 404 for every other path (robots, sitemap, feed, `llms.txt` and marketing pages included)
  - its own expired-link page

  Partner-filing invite links point at the portal host.
- **Signing record** for all filings, ported from `src/lib/applicationSignature.ts`:
  - typed full name
  - a penalties-of-perjury declaration with a version
  - IP, user agent, and SHA-256 of the package that was signed

  The invite link stops working once the package is signed.
- **PDF and file hygiene** for all filings:
  - Producer and Creator are neutral and keep the generator version. Title is "Form 5472 – LLC – years".
  - Signing paths stop pdf-lib from rewriting metadata.
  - One file-name helper produces `<LLC> - Form 5472 - <years> - <kind>.pdf` for every client and partner download and email attachment.
  - The fax receipt shows the partner's name instead of ours on partner filings.
- **Leak-scan script** plus the end-to-end run above.

**Non-goals** (deferred, with owner)
- **§7216 consent upload and release gate.** This is Phase 1b and starts only when the attorney-approved consent form exists (source plan Phase 0). Partners can still download packages today; that legal exposure stays open until then.
- **Branded email mode** (neutral sending domain, Reply-To to the partner), the Spanish portal, the partner logo and brand-profile self-service, team seats, per-partner pricing, saved-card billing and monthly statements. All Phase 2.
- **Partner custom domains** (Phase 3). On Vercel this would be project domains, not the Cloudflare for SaaS or Caddy approach the source plan describes.
- **Phase 1 extras from the source plan:** the date-of-birth identity check on the portal, the "something looks wrong" button routed to the partner, the paused turnaround clock, partner annual-reminder digests, and the admin "partner client: redirect" banner for inbound support.
- **Fax header and station ID.** The Telnyx fax API call (`src/lib/fax.ts`) has no per-send header field. Any header is an account setting, so it's an owner check (step 0d), not code.
- **SS-4 and the EIN/ITIN/7004 application emails.** These are separate products, not partner filings.

## 3. Assumptions

| # | Assumption | If false |
|---|---|---|
| A1 | For partner filings, `Filing.user` is the end client (bound by the partner's sign/client links or at checkout). | The guard still works: it matches by filingId first. Step 1's trace confirms the binding. |
| A2 | Partners pay for partner filings through their own session in the wizard (`/api/checkout` accepts the partner via `getOwnedFiling`). | If clients pay today, step 4 grows into a partner-pays flow (saved card). That's Phase 2 size, so stop and re-plan. |
| A3 | The neutral domain is served by the same Vercel project as an extra domain. No second deployment. | A second project would need its own env and deploys. Re-plan step 6. |
| A4 | Rewriting by `host` in `next.config.mjs` (`beforeFiles`, `has: [{type:"host"}]`) works on Next 14.2.35 on Vercel for both pages and dotted static paths. | Fall back to widening the middleware matcher for the portal host only. More edge invocations. |
| A5 | Admin and partner-bound emails need no change. | A wider audit of those emails. |
| A6 | Dropping a magic-link email for a partner client is acceptable. Partner clients have no account; they use the partner's links. | Q1 decides otherwise. |
| A7 | Neutral PDF metadata and LLC-based file names are fine for retail customers too. One code path, no branching. | Keep retail names behind a partner check (small). |

## 4. Open questions (owner only)

**Q1. Contact mode now.** Partner-only for every partner, including any with white-label already on? With partner-only, their clients stop getting the fax-delivered, order-confirmation, ready-to-sign and message emails, and the partner gets each one instead. *Recommendation: yes. Branded email to clients returns in Phase 2 on a neutral sending domain. Today's partner-named emails still come from donotreply@form5472prep.com and carry our footer, so they aren't white-label.*

**Q2. Neutral domain.** Which name? Register it with private WHOIS and add it to the Vercel project. *I can build and test on `portal.localhost` without it, but Phase 1 can't go live until it exists.*

**Q3. Test database.** May I create a Neon branch of production (for example `wl-test`) for the end-to-end run, or will you create it and put its URL in `.env.test.local`? *Without it the only database is production. In that case the end-to-end run drops to unit tests, plus one owner-approved test partner filing on production.*

**Q4. Signing record for all filings.** Should retail clients also type their full name and tick a penalties-of-perjury declaration on the sign page? *Recommendation: yes. It's one code path and a stronger record.* Please also approve the exact declaration text in step 5.

**Q5. Who to tell.** Which partners are live, and is any client mid-flow (link sent, not signed)? Partners need a heads-up about the email change. *I couldn't read the production database: the query was blocked.*

## 5. Step-by-step instructions

Executors use the trio from `~/.claude/doctrine/delegation-templates.md`: goal, acceptance criteria, report format. Each step's goal and acceptance are below; the report format is always changed files, test output, and open issues.

### Step 0. Owner inputs (parallel with steps 1–5)
- **Action**
  - 0a: answer Q1–Q5.
  - 0b: register the neutral domain and add it to the Vercel project (Q2). I then set `PARTNER_PORTAL_HOST` and `NEXT_PUBLIC_PARTNER_PORTAL_HOST` in Vercel for Production and Preview, after you OK the value.
  - 0c: create the Neon branch (Q3).
  - 0d: in the Telnyx portal, check whether the fax connection's header / caller-ID name says "Form5472" or our domain. If it does, change it to blank or a neutral value. It's global, and retail is unaffected.
  - 0e: tell partners about the email change (Q5).
- **Acceptance**
  - Answers recorded in §8 of this file.
  - The domain resolves to Vercel (`dig +short <domain>` gives `76.76.21.21` or `cname.vercel-dns.com`).
  - The Neon branch URL works (`npx prisma migrate status` against it).
  - A Telnyx screenshot or your confirmation.
- **Executor:** owner. 0b's Vercel env change is done by the main session after you OK the value.
- **Depends on:** None. Steps 1–5 can start without step 0. Step 6 needs 0b to go live, step 7 needs 0c, step 9 needs all of it.

### Step 1. Branch, baseline, payment-flow trace
- **Action**
  1. In `~/Developer/f5472-wt/white-label-audit`: `git switch -c feat/partner-white-label-p1`, then `npm ci`. Commit this plan file.
  2. Run the targeted baseline: `npx vitest run src/lib/partner src/lib/pdf src/lib/email src/app/api/partner`, plus `npx tsc --noEmit`. Record the results.
  3. Read-only trace of the partner payment flow: who presses Pay on a partner filing, which email `checkout/route.ts:116 bindFilingToEmail` binds, and what the client sees at `ReviewStep` when opened via an "edit" invite. Answer A1 and A2 with file:line.
- **Acceptance**
  - Branch exists with the plan committed.
  - Baseline pass/fail list recorded in §9.
  - A1 and A2 confirmed or refuted with file:line. If A2 is refuted, stop and re-plan step 4.
- **Executor:** main session for 1–2. A sonnet `Explore` subagent for 3: goal "settle A1/A2", acceptance "file:line for each hop", report as ≤15 bullets.
- **Depends on:** None.

### Step 2. Client mail guard at `sendEmail()`
- **Action**
  1. New `src/lib/partner/clientMail.ts` exporting `partnerClientRoute({ to, filingId })`, which returns `null` (retail) or `{ partnerEmail, partnerName, filingId, llcName }`:
     - With a `filingId`: partner route if `filing.partnerId` is set and `filing.user.email` equals `to` (case-insensitive).
     - Without one: the most recent filing where `user.email = to` and `partnerId` is not null.
     - Shortcut comment: the flag never expires. Add the 12-month expiry when a partnership-end date exists.
  2. In `src/lib/email.ts` `sendEmail()`, add optional `filingId` and `partnerClient?: "redirect" | "drop"`, defaulting to `"redirect"`. When the route is not null:
     - `"drop"`: send nothing and write an EmailLog row with outcome `dropped_partner_client`.
     - `"redirect"`: send to `partnerEmail`, prefix the subject with `[Your client: <LLC>] `, and add one line above the body: "This was addressed to your client <email>. We sent it to you instead; your client received nothing." Use our normal brand, support@ Reply-To, and keep the attachments. The EmailLog row records the original recipient and outcome `redirected_partner`.
  3. Pass `partnerClient: "drop"` from `sendJanuaryReminderEmail`, `sendMarchReminderEmail`, `sendAbandonedDraftReminderEmail` and `sendMagicLinkEmail`. Never add a Trustpilot BCC to a redirected email.
  4. Thread `filingId` through every client-facing caller in the audit table: stripe-webhook, checkout, the filingActions resends, send-client-link, send-sign-link, save-for-later, ready-to-sign, the SSN request, `fax/finalize.ts`, `messages.ts`.
  5. If the order-confirmation body embeds a magic link, leave it out of the redirected copy.
- **Acceptance**
  - New `src/lib/partner/clientMail.test.ts` covers:
    - retail is unchanged
    - partner client plus a transactional email goes to the partner, with prefix and note
    - reminders and magic links are dropped
    - case-insensitive match
    - an unrelated recipient is unchanged
    - a filingId match beats the email lookup
  - Existing email tests still pass.
  - `grep -n "partnerClient" src/lib/email.ts` shows the four drop call sites.
- **Executor:** main session (design-critical).
- **Depends on:** 1.

### Step 3. Partner dashboard: copy instead of send
- **Action**
  - In `src/app/partner/PartnerFilingRow.tsx`, replace the "Send intake link" and "Send sign link" actions (the ones that hit `send-client-link` and `send-sign-link`) with "Copy link", using the existing `client-link` and `sign-link` GET routes.
  - Help text: "Send this link to your client from your own email. We never email your clients."
  - Keep the send routes in place, unused, for Phase 2 branded mode. Each gets the comment: `// partner-only mode: not linked from UI (Phase 2 branded email reuses this)`.
- **Acceptance**
  - The dashboard renders with no send buttons.
  - Copy puts an invite URL on the clipboard (checked in the step 7 browser run).
  - Existing partner tests pass.
- **Executor:** fast-worker (haiku). Escalate to the main session on first failure.
- **Depends on:** 2.

### Step 4. Wizard client view and partner-only checkout
- **Action**
  1. In `src/app/(app)/filings/[id]/edit/page.tsx`, compute `clientView = filing.partnerId !== null && owningPartner === null`. Pass it and `partnerName` into `FilingWizard`, then into `ReviewStep`.
  2. When `clientView` is true:
     - Hide `TierChooser`, `OrderSummary`, every price string and the Pay button.
     - Show a "Finish and send to <partnerName>" button. It calls new `POST /api/filings/[id]/client-finished`, which uses invite "edit" scope access, emails the partner "<client email> finished the intake for <LLC>" with a link to the filing, and returns 204.
     - `saveForLaterMode` returns the plain-link mode, so it never emails the client.
  3. In `src/app/api/checkout/route.ts`, for filings with `partnerId`:
     - Require a current partner session that owns the filing, otherwise return 403.
     - Set Stripe `customer_email = partner.email` and add `partnerId` to metadata.
     - Don't rebind `Filing.user` to the email typed at checkout when a client user is already bound. If none is bound, keep today's behaviour.
- **Acceptance**
  - Tests: `ReviewStep` with `clientView` has no price text and no Pay button. The checkout route returns 403 for a partner filing with no partner session, and uses `customer_email` = partner email with one.
  - `client-finished` emails the partner (mocked send).
  - Step 7 browser run: the client review page has no "$" anywhere.
- **Executor:** sonnet subagent (`general-purpose`, model sonnet). Owns only the files named in this step plus their tests.
- **Depends on:** 1 and step 1's A2 result. Runs after 2 because both touch `email.ts` callers.

### Step 5. Signing record for all filings (gated by Q4)
- **Action**
  1. Migration `prisma/migrations/2026103xxxxxxx_filing_signature_evidence`. It adds nullable `Filing` columns:
     - `signerName TEXT`
     - `signatureIp TEXT`
     - `signatureUserAgent TEXT`
     - `signatureConsentVersion TEXT`
     - `signedPreparedPdfSha256 TEXT`

     Mirror these in `schema.prisma`.
  2. New `src/lib/filingSignature.ts` with `FILING_SIGNATURE_DECLARATION_VERSION = "2026-10-30"` and `filingDeclarationText()`. Proposed text, which you approve in Q4: *"Under penalties of perjury, I declare that I have examined this return, including the accompanying schedules and statements, and to the best of my knowledge and belief it is true, correct, and complete. I authorize my signature above to be applied to the Form 1120 and the statements in this package."*
  3. In `SignClient.tsx`, add a typed full-name input (required, non-empty) and the declaration text beside the existing confirmation box.
  4. In `src/app/api/filings/[id]/sign/route.ts`, require `signerName`. Store the name, IP (`x-forwarded-for` first hop), user agent, version, and the SHA-256 of the `generatedPdfKey` object. In the same atomic update, set `inviteTokenHash = null`.
- **Acceptance**
  - Migration SQL is additive only (no drops or renames).
  - Sign-route tests check all five fields are stored, a missing name returns 400, and the invite is cleared.
  - `prisma migrate status` against the Neon branch is clean after apply.
- **Executor:** sonnet subagent, owning only these files.
- **Depends on:** 1 and Q4.

### Step 6. PDF and file hygiene
- **Action**
  1. In `src/lib/pdf/generatePackage.ts` (~2702), set:
     - Title `Form 5472 – <LLC> – <years>`
     - Producer and Creator `generator <version>` (no brand)
     - Author: none

     Keep the Keywords. Update the `preflight.ts` check that reads the Producer, plus the snapshots.
  2. Pass `{ updateMetadata: false }` to `PDFDocument.load` in:
     - `embedSignature.ts:32`
     - `stampPlacements.ts:144`
     - `app/api/admin/filings/[id]/place-signature/route.ts:91`
  3. In `faxReceipt.ts`:
     - Neutral Producer and Creator.
     - Label "Telnyx Fax ID" becomes "Fax ID".
     - When `brandLine` is given, it replaces the subtitle and the footer drops "Form5472 Prep · form5472prep.com".

     `fax/finalize.ts` passes the partner display name (`brandName` or `company` or `name`) for partner filings.
  4. `downloadFileName.ts` produces `<LLC> - Form 5472 - <years> - <kind>.pdf` (ASCII-safe). Use it in:
     - `api/filings/[id]/pdf`, `/signed-pdf` and `/fax-receipt`
     - the `email.ts` attachments (~1114, 1160, 1283, 1289)
- **Acceptance**
  - A test loads a generated, signed and receipt PDF and asserts that Title, Producer, Creator, Author and Keywords contain no `form5472prep`, `Form5472 Prep` or `pdf-lib`. Keywords may hold version and commit.
  - `preflight` tests pass.
  - A file-name unit test covers it.
  - `grep -rn '"form5472-' src/app/api` returns nothing.
- **Executor:** sonnet subagent, owning only these files.
- **Depends on:** 2, because it edits `email.ts` after it.

### Step 7. Neutral portal host
- **Action**
  1. In `src/lib/env.ts`, add `partnerPortalHost` (server) and `NEXT_PUBLIC_PARTNER_PORTAL_HOST` (client), plus `portalOrigin()`.
  2. In `src/lib/filingInvite.ts`, build the invite URL from the portal origin when `filing.partnerId` is set and the portal is configured.
  3. In `src/app/invite/[token]/route.ts`:
     - On the main host, for a partner filing with the portal configured, 307 to the same token on the portal origin.
     - On the portal host, send an invalid or expired token to `/portal/expired`, never `/sign-in`.
  4. In `next.config.mjs`, add `beforeFiles` rewrites with `has: [{ type: "host", value: <portal host> }]`:
     - `/robots.txt` becomes `/portal/robots.txt` (disallow all).
     - `/favicon.ico` becomes the neutral icon.
     - Every path except `/invite/*`, `/filings/*/(edit|sign)`, `/api/filings/*`, `/_next/*` and `/portal/*` goes to `/portal/not-found`.

     Add the `X-Robots-Tag: noindex` header on the portal host.
  5. In `src/middleware.ts`, skip the `f5472_attr` cookie when the host is the portal host.
  6. In `src/app/(app)/layout.tsx`, render no `<Logo/>`, email or sign-out when the host is the portal host.
  7. New `src/lib/partner/portalMetadata.ts` with `portalMetadata(name)`. It overrides:
     - title (absolute)
     - description, applicationName, authors, creator, publisher
     - openGraph and twitter (minimal)
     - icons (neutral)
     - manifest (null)
     - verification (empty)
     - robots noindex

     The `edit` and `sign` pages use it in `generateMetadata` when on the portal host, and render a `PortalHeader` with the partner display name.
  8. One client-safe `isPortalHost()` in `src/lib/partner/portalHost.ts`, checked by:
     - `googleAdsLoader.ts` (skip, like `/embed/*`)
     - `MetaPixel.tsx` (no init, no consent banner)
     - `VisitPing.tsx`
     - `ChatWidget.tsx`
     - root `layout.tsx`: `<Analytics beforeSend>` / `<SpeedInsights beforeSend>` return null
  9. In the `edit` and `sign` pages on the main host: if the filing is a partner filing, the viewer is not the partner and the portal is configured, redirect to the same path on the portal origin.
  10. New pages `src/app/portal/not-found/page.tsx` and `src/app/portal/expired/page.tsx`. Both are neutral: no our name, noindex.
- **Acceptance**, in local dev with `PARTNER_PORTAL_HOST=portal.localhost:3000` and the Neon branch DB, checked in the built-in browser:
  - The portal host serves invite, edit and sign under the partner name.
  - `/`, `/pricing`, `/robots.txt`, `/sitemap.xml`, `/feed.xml` and `/llms.txt` on the portal host return the neutral 404 or disallow.
  - The network log on portal pages has no `googletagmanager`, `facebook`, `/_vercel/insights`, `/_vercel/speed-insights` or `/api/session/ping`.
  - No `f5472_attr` cookie.
  - `localhost:3000/`, `/pricing` and the three production markers in `REPO-STATE.md` are unchanged on the main host.
  - `npm run build` passes.
- **Executor:** main session (largest, design-critical). The browser checks run in the built-in browser pane.
- **Depends on:** 3, 4 and 6, because they touch the edit page and email callers. Going live needs 0b.

### Step 8. Leak scan and end-to-end run
- **Action**
  1. New `scripts/partner-leak-scan.ts` (run with `npx tsx`). It takes `--base`, `--filing` and `--cookie-jar`, then:
     - fetches every portal page for the filing
     - downloads every PDF the client or partner can reach and reads its metadata with pdf-lib
     - reads the EmailLog rows for the filing

     It searches for `form5472prep`, `Form5472 Prep`, `5472prep`, `Horizons Furness`, `East West Global`, `Andrew`, `support@form5472prep.com`, `donotreply@form5472prep.com`, `/brand/`, `banner.png` and `Telnyx`. It allowlists the house paid-preparer block (§4) and fails on any EmailLog row addressed to the client email.
  2. Run the whole-project scenario from §1 on the Neon branch, with the fax in sandbox mode (no Telnyx key, `fax.ts:50`). Then check the network log in the built-in browser.
- **Acceptance:** the script exits 0 with a printed per-surface summary. Screenshots of the portal sign page and the partner dashboard are saved in `docs/sessions/assets/`.
- **Executor:** main session.
- **Depends on:** 2–7 and 0c.

### Step 9. Review, fix, build
- **Action**
  1. Read-only Codex review of `git diff origin/main...HEAD` (standing rule). Verify each finding, fix the real ones, and re-run the affected tests.
  2. Run `npx tsc --noEmit`, `SESSION_SECRET=x npm run build`, and the targeted vitest set from step 1, plus every new test file.
- **Acceptance:**
  - Codex findings are triaged in §9 (fixed / not a bug + why).
  - tsc and build are clean, and targeted tests are green.
- **Executor:** `codex:codex-rescue` (read-only review), then the main session.
- **Depends on:** 8.

### Step 10. Ship and verify live
- **Action**
  1. Rebase onto the latest `origin/main` and re-run the step 9 checks.
  2. Apply the step 5 migration to **production** Neon: `set -a; . ./.env.local; set +a; npx prisma migrate deploy`, from the worktree. This goes **before** the push: Prisma selects every column, so code without the columns breaks every Filing query. Approving this plan approves this one additive production migration.
  3. Fast-forward `main` and `git push origin main` (never `vercel --prod`).
  4. Live verification:
     - the neutral domain's `/`, `/robots.txt` and `/sitemap.xml` return neutral 404 / disallow
     - form5472prep.com's homepage, `/pricing` and the `REPO-STATE.md` markers are unchanged
     - one owner-approved click-through: a test partner filing's sign link opens on the neutral domain and the network log is clean
  5. Write `docs/sessions/2026-10-xx-partner-white-label-p1.md` (ownership, commits, evidence, contracts, open items). Point `CLAUDE.md` at it, then commit and push. Update memory.
- **Acceptance:**
  - `git rev-list --left-right --count origin/main...HEAD` gives `0 0`.
  - Vercel deployment is READY.
  - Every live check passes, with evidence in the session log.
- **Executor:** main session. Step 10.4's click-through is with you.
- **Depends on:** 9, 0b, and 0e (partners told).

**Phase 1b (separate plan, after the attorney-approved form):**
- `Filing.consent7216ReceivedAt` plus an uploaded consent file.
- Partner upload in the dashboard.
- Partner reads of `/pdf`, `/signed-pdf` and `/fax-receipt` blocked until consent is received. Preparation and client signing are not blocked.

## 6. Risks and rollback

| Risk | Likelihood | Impact | Mitigation | Rollback |
|---|---|---|---|---|
| The guard misroutes a retail email (a person who was once a partner client buys retail) | Low | Medium | filingId match beats email lookup; EmailLog records every redirect and drop; tests | Revert the step 2 commit; the guard is one function |
| Code deployed before the migration takes down every Filing query | Low if ordered | High | Step 10.2 runs before 10.3; columns are additive and nullable | Columns are harmless to old code; revert the code if needed |
| A host-rewrite regex mistake breaks main-site routes | Medium | High | Every rewrite is conditioned on the portal host; main-host markers checked locally and live | Revert `next.config.mjs` and push |
| Partners or clients surprised that client emails stop | Medium | Medium | 0e heads-up before the push; redirected emails explain themselves | Revert step 2 (clients get emails again) |
| Our name hides in wizard or sign copy the audit missed | Medium | Low | The step 8 scan covers the full page HTML; fix the copy | n/a |
| Partner checkout 403 blocks a partner who used to let the client pay | Low (A2) | Medium | Step 1 trace before building step 4 | Revert step 4 |
| Concurrent sessions edit `email.ts` or the wizard on main | Medium | Low | Small commits; rebase in 10.1 | Resolve conflicts in the rebase |
| The neutral domain is linked to us through WHOIS or DNS | Low | Low | Private WHOIS; Vercel's IP is shared by many sites; never used for retail | n/a |

## 7. Estimates

| Step | Size | Could blow up if |
|---|---|---|
| 0 | owner | domain or DNS lead time |
| 1 | S | A2 is false, which forces a re-plan |
| 2 | M | more `sendEmail` callers than the audit listed |
| 3 | S | |
| 4 | M | the review-step logic is tangled with tier state |
| 5 | M | the existing sign-page prefill or re-sign logic fights the new field |
| 6 | M | preflight relies on the Producer string in more places |
| 7 | L | Next 14 metadata merge or host-rewrite quirks |
| 8 | M | the Neon branch is late |
| 9 | S–M | the Codex finding count |
| 10 | S | — |

Overall: roughly 2–3 agent-days of work once 0b and 0c are done.

## 8. Changelog
- v1 (2026-10-30): initial plan, built from a three-lane audit of `origin/main` @ `1881925`. The audit superseded the source plan's §2 "what exists today": brandForFiling already exists, invites are already hashed with a 14-day expiry, and hosting is Vercel, not Cloudflare.

## 9. Execution log
- 2026-10-30: owner approved v1 ("Approve, go") and then "write everything, i give you full approval, make it ready". Read as: Q1 = yes (partner-only for every partner), Q4 = yes (signing record + declaration text as written, all filings). Q2 (domain), Q3 (test DB), Q5 (live partners) still open. "Make it ready" = steps 1–9 complete on the branch; step 10 (prod migration + push) waits for 0b domain and 0e partner heads-up as planned.
- Step 1 — branch `feat/partner-white-label-p1`; A1 confirmed (Filing.user = client, bound by partner links), A2 confirmed (partner pays via own session; an invite-only client's Pay 404s). Extra finding: checkout rebinds the filing to the typed email → fixed in step 4.
- Step 2 — `eb5e17e`. Deviation (minor): guard keys off the existing `log: { kind, filingId }` instead of a new `partnerClient` arg; drop list by kind. 16 tests.
- Step 3 — `07921a3` (copy actions already existed; only send buttons removed).
- Step 5 — `adde046`; migration verified by applying all migrations to a throwaway local Postgres.
- Step 4 — `4e6de3c`; also hid prices in the Years step and PreflightStep EIN links for clients.
- Step 6 — `2568035`; 629/629 targeted tests.
- Step 7 — `33379ed` + `f8e209a`. Deviation (minor): one env var (`NEXT_PUBLIC_PARTNER_PORTAL_HOST`) instead of two; main-host page redirect done in the filings layout (e9fb109) rather than per page; portal 404/expired/robots are bare route handlers.
- Step 8 — `scripts/partner-leak-scan.mjs`; local E2E on throwaway embedded Postgres (Q3 workaround, no production access): exit 0 on both invites, catches 31 hits on a main-site page and an expired link. Network: no trackers on the portal.
- Step 9 — Codex review: 7 findings, all verified + fixed in `e9fb109`; tsc clean, build passes with the portal host set; 724/724 related tests.
- Step 10 — NOT started: needs 0b (domain), 0e (partner heads-up) and go-ahead for the production migration. Runbook in docs/sessions/2026-10-30-partner-white-label-p1.md.

