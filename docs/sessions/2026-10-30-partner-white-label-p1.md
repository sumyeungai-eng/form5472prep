# 2026-10-30 — Partner white-label, Phase 1 ("invisible by default")

Plan (approved v1): `docs/plans/PLAN-partner-white-label-phase1-20261030.md`.
Source request: owner's `partner-white-label-plan.md` (AmericaNexus asked for client comms under their brand).

**Status: SHIPPED 2026-10-30 with the neutral portal OFF.** `main` @ `a1d9c6d`, production deployment `dpl_3rGPeuN89jQLEAciafavoo6ifded` (READY). The owner said "we just need to function ready", so everything except the neutral domain is live. The portal switches on when `NEXT_PUBLIC_PARTNER_PORTAL_HOST` is set in Vercel and the site is redeployed.

## Ownership

| Checkout / branch | Owns |
|---|---|
| `~/Developer/f5472-wt/white-label-audit`, branch `feat/partner-white-label-p1` (cut from `origin/main` @ `1881925`) | every file in `7089a8d..HEAD` |
| `~/Documents/Codex/form5472` (main checkout) | **not touched.** It was 200 commits behind `origin/main` and holds other sessions' uncommitted work. Do not audit, build or deploy from it. |

## What is on the branch

| Commit | Step | Change |
|---|---|---|
| `7089a8d` | plan | Approved plan |
| `eb5e17e` | 2 | **Client mail guard** in `sendEmail()` (`src/lib/partner/clientMail.ts`). Mail addressed to a partner filing's client is redirected to the partner, with a note and the client's login links pointed at `/partner`, or dropped for marketing, reminders, magic links, intake and resume links. No Trustpilot BCC. |
| `07921a3` | 3 | The partner dashboard offers copy-link only. The send routes stay, unlinked, for Phase 2. |
| `adde046` | 5 | **Signing record** for every filing. Typed name, versioned penalties-of-perjury declaration, IP, user agent and SHA-256 of the signed package are stored. Migration `20261030120000_filing_signature_evidence` adds 5 nullable columns. The invite is cleared on sign. |
| `4e6de3c` | 4 | **Client wizard view.** A partner's client sees no tiers, prices, Pay button or email field, only "Finish and send to <partner>" (`POST /api/filings/[id]/client-finished` emails the partner). Save-for-later sends no email. **Checkout** for a partner filing requires the owning partner's session (otherwise 403), charges the partner's email and never rebinds an existing client. |
| `2568035` | 6 | **PDF and file hygiene.** Producer and Creator are `generator <v>`. Title is `Form 5472 – <LLC> – <years>`. Signing paths keep metadata. Preflight accepts the old and new Producer. Every download and attachment is named `<LLC> - Form 5472 - <years> - <kind>.pdf`. The fax receipt says "Fax ID" and carries the partner's name on partner filings. |
| `33379ed` | 7 | **Neutral portal domain** via `NEXT_PUBLIC_PARTNER_PORTAL_HOST` (unset means off). Details under Contracts. |
| `f8e209a` | 7–8 | The portal invite redirect now stays on the portal. Adds `scripts/partner-leak-scan.mjs`. |
| `e9fb109` | 9 | Fixes for the 7 Codex review findings (see Evidence). |
| `2a3c98e` | 9 | Invite cookies are bound to their exact invite (Codex re-check). |
| `954ece3` | — | Session log, `CLAUDE.md` contracts, `scripts/partner-e2e-seed.mjs`. |
| `a38dffa` | v1.1 | **Partner "get ready" card** on `/partner`, added at the owner's request. The partner sets the name their clients see (`PATCH /api/partner/brand`: own row only, cleaned, at most 120 characters; blank falls back to the company name). The card also explains the flow. Verified in the browser: the saved name became the client's portal title and header. |

**Live verification (2026-10-30, after deploy):**
- The Vercel build ran `prisma migrate deploy`. It applied only `20261030120000_filing_signature_evidence` ("All migrations have been successfully applied").
- The 3 production markers pass: empty EIN checkout POST returns 400; `/ein/apply` returns 200 and contains "Owner date of birth"; `/form-5472-penalty-calculator` returns 200.
- `/`, `/pricing`, `/partner/sign-in`, `/robots.txt` and `/sitemap.xml` return 200, with no noindex on the main host.
- New routes are live: `PATCH /api/partner/brand` returns 401 "Sign in again" without a session; client-finished returns 404 without access.
- Vercel reported no runtime errors in the 20 minutes after the deploy.

## Evidence

- `npx tsc --noEmit` is clean. `npm run build` passes with `NEXT_PUBLIC_PARTNER_PORTAL_HOST` set, both before and after the review fixes.
- Tests:
  - The guard tests pass 18/18.
  - 52 related test files (email, session/invite, checkout, messages, wizard, fax, webhooks, reminders, analytics) pass 724/724.
  - PDF, fax and email routes pass 629/629.
  - The full suite was not run (standing rule: targeted tests only). CI runs it on push.
- **Local end-to-end run.** It used a throwaway embedded Postgres; production was never touched.
  - All migrations, including the new one, applied cleanly.
  - Seeded a partner "Acme Formations" with an intake filing and a sign filing.
  - Dev server on `:3011`, portal host `portal.localhost:3011`.
- **Portal host checks:**
  - These paths return a neutral 404 with `X-Robots-Tag: noindex, nofollow`: `/`, `/pricing`, `/sitemap.xml`, `/feed.xml`, `/llms.txt`, `/admin`, `/sign-in`, `/dashboard`, `/filings`, `/favicon.ico` and `/icon.svg`.
  - `/robots.txt` returns `Disallow: /`.
- **Main host checks:** `/` and `/pricing` return 200 with normal robots and sitemap, and no noindex.
- **Sign page.** An old main-domain invite returns 307 to the portal, then lands on the sign page. The page shows:
  - title and header "Acme Formations"
  - **zero** hits for our brand terms in the full HTML, including the page-data payload
  - partner-only metadata with noindex
  - one same-origin request (the PDF API) and none of gtag, Meta, `/_vercel/insights` or the visit ping
  - no attribution cookie and a hidden consent banner
- **Intake page:** the same results, and no prices on the first step.
- **Pre-portal main-domain invite cookie:** returns 307 to the portal's `/portal/expired`.
- **Leak scan** (`node scripts/partner-leak-scan.mjs <invite>…`):
  - exits 0 on both portal invites
  - exits 1 with 31 hits on a main-site page (sanity check)
  - exits 1 on an expired or unknown link
- **Codex review (read-only): 7 findings.** All were verified and fixed in `e9fb109`:
  1. Message mails were untagged and routed to the newest partner filing.
  2. Invite cookies survived signing.
  3. The guard failed open, so it now fails closed.
  4. Direct customers with an old partner filing lost login mails.
  5. A pre-portal cookie on the main domain showed our brand.
  6. The client wizard warning showed support@.
  7. The leak scan passed on an expired invite.
- **Codex re-check of `e9fb109`:** fixes 1 and 3–7 are OK, with no new bugs or retail regressions. Fix 2 had a pre-existing gap: a re-issued invite revived older cookies. That is fixed in the final commit: a cookie is now honoured only while the filing row holds that cookie's exact invite expiry, which doubles as the invite's identity. Regression tests cover it, and 726/726 related tests pass.

## Contracts a future editor must respect

1. **All client mail goes through `sendEmail()` with `log: { kind, filingId }`.**
   - A new kind is redirected to the partner by default.
   - Add a kind to `DROP_KINDS` for marketing or login mail.
   - Add to the `EXEMPT_*` lists only for staff mail, partner mail or standalone products (EIN, ITIN, 7004, website questions).
   - The guard **fails closed**: it throws, like a Resend failure.
2. **Partner checkout.** Only the owning partner can check out a partner filing. Stripe `customer_email` is the partner's address. Checkout never rebinds an existing client user.
3. **Portal host.**
   - `NEXT_PUBLIC_PARTNER_PORTAL_HOST` is parsed in **both** `src/lib/partner/portalHost.ts` and `next.config.mjs`. Keep them in sync.
   - On the portal host only `invite/`, `filings/<id>/(edit|sign)`, `api/`, `_next/` and `portal/` exist; everything else is a neutral 404.
   - Anything new a partner client must reach on the portal needs adding to that allowlist.
   - Anything new in the root layout that tracks or brands must check `onPortalHost()`.
   - New root metadata must be overridden in `portalMetadata()`.
4. **Invite cookies** are honoured only while `Filing.inviteExpiresAt` equals the expiry embedded in the cookie. Each invite has a unique expiry, so re-issuing an invite revokes older cookies, and the sign route clears it.
5. **Migration order.** `20261030120000_filing_signature_evidence` must be applied to production **before** this code deploys, because Prisma selects every column.
6. **PDF metadata.** The Producer is `generator <v>`. Use `downloadFileName()` for every client or partner file name.

## Ship runbook (plan step 10, owner-gated)

1. Owner registers the neutral domain (private WHOIS) and adds it to the Vercel project. Its DNS should point at Vercel.
2. Set `NEXT_PUBLIC_PARTNER_PORTAL_HOST=<host>` in Vercel for Production and Preview.
3. Owner tells partners: their clients no longer get our emails, and links are copy-and-send.
4. Rebase the branch on `origin/main`, then re-run tsc, the build and the targeted tests.
5. Migrations need no manual step. The `vercel-build` script (`prisma generate && prisma migrate deploy && next build`) applies them during the production build, before promotion. Keep them additive and nullable.
6. Merge to `main` and run `git push origin main` (never `vercel --prod`).
7. Live verification:
   - leak scan against a real test partner's invite on the neutral domain
   - the browser network panel on the portal
   - the `REPO-STATE.md` markers on form5472prep.com
8. The code can ship before the domain exists. With the portal off, the guard, checkout, price hiding, signing record and PDF hygiene go live, but partner pages stay on form5472prep.com as they do today.

## Open items

**Owner to-do now**
- In **Admin → Partners**, click **Reactivate** on the three pending applicants: AmericaNexus (Luciano Aliaga), American Leverage (Jean-Paul D'Andrea) and Crimson Peak (Carlo Bartolini). Reactivating sends each one a sign-in link.
- Then send the drafted emails from **support@form5472prep.com**, never a personal Gmail. The drafts, including an optional heads-up for Jasmine Group (already active), are in the owner's Claude folder: `form5472-partner-portal-emails-2026-10-30.md`.

**Owner-gated**
- Q2: the neutral domain.
- Q5: which partners are live, and the heads-up to them.
- Plan step 0d: the Telnyx fax header check.
- Go-ahead for the production migration and deploy.
- §7216 consent form: the attorney-reviewed form gates Phase 1b.
- Q3 (test database) was worked around with a throwaway local Postgres.

**Follow-ups**
- Phase 1b: §7216 consent upload and release gate.
- Phase 2: branded email from a neutral sending domain (reuses the unlinked send routes), brand profile and logo, seats, billing, Spanish.
- The client-view review step is covered by unit tests but not walked in the browser.
- Portal HTML still holds the inline Google Ads bootstrap text and a `googletagmanager` preconnect. Both are gated at runtime: no request goes out and no brand appears. Removing them needs a separate root layout.
- File-based icon links on the portal return 404, so the browser shows its default icon.
- PDFs already stored keep their old metadata.

## Lane notes

- Steps 3–6 ran as parallel subagent lanes in one worktree with disjoint file ownership, with no collisions. I reviewed and committed each lane myself.
- **The main checkout was stale.** Three first-pass audits read it and had to be redone. Always audit from `origin/main` (`git fetch` first).
- In Next 14 route handlers, `new URL(req.url).origin` is not the requested host. Portal redirects use `portalOrigin()`.
- `npx prisma` fails under the rtk hook. Use `./node_modules/.bin/prisma`.
- **Local end-to-end recipe:**
  1. Run `embedded-postgres@17.10.0-beta.17` (pinned; the latest release was same-day) on `:54329`, from a scratch folder.
  2. Run `./node_modules/.bin/prisma migrate deploy` with a local `DATABASE_URL`.
  3. Write `.env.development.local` in the worktree (gitignored) with that `DATABASE_URL`, dummy secrets and `NEXT_PUBLIC_PARTNER_PORTAL_HOST=portal.localhost:3011`.
  4. Run `node scripts/partner-e2e-seed.mjs` and dev on `:3011` (`launch.json` entry `f5472-white-label`).
  5. Run `node scripts/partner-leak-scan.mjs <invites>`.
