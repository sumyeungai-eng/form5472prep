# System test report — form5472prep.com (2026-11-26)

**Scope.** Every part of the system at `origin/main` `e389f70`: code, dependencies, build and the live public site. Everything was read-only. No production data, payments, emails or customer accounts were touched.

**Who checked what.**

| Lane | Who | Covered | Raw output |
|---|---|---|---|
| A. Automated | Opus orchestrator | `tsc`, `next lint`, full vitest, `next build`, `npm audit` | `~/Developer/f5472-wt/audit-auto.txt`, `audit-npm.json` |
| B. Code audit | Codex (GPT, high effort) | All 119 API routes, payments, filing/fax, privacy, reliability. 5 mocked reproductions | `audit-codex.md` |
| C. Code audit | Claude Opus (fresh context, same brief as B, independent) | Same scope. 1 standalone reproduction | `audit-opus.md` |
| D. Live site | Claude Sonnet | 307 sitemap URLs, 159 internal links, SEO and hreflang, security headers, page weight, content sanity | `audit-live.md` |

In the list below, tags show where a finding came from: **[B]** Codex, **[C]** Opus, **[D]** live, **[A]** automated. **✔** means the orchestrator re-checked it against the code.

## Headline
- **Healthy:**
  - Type check clean; 1 lint warning.
  - **5,107/5,107 tests pass**; build OK.
  - Every public page and link works, and the structured data is valid.
  - Prices are consistent everywhere.
  - The fax pipeline, the review-before-release gate, SSN handling on the main filing, and webhook signature checks are all strong. Both auditors named these as strengths.
- **Needs work:**
  - **What a customer pays is not tied to what gets fulfilled.**
  - **Three ways into an account** that should not exist.
  - **SSNs from the EIN application are stored unencrypted.**
  - **A partner can sign the client's return.**
  - **Old dependencies, including Next.js 14, with 1 critical and 15 high advisories.**
  - **Several "fail-open" settings, plus privacy promises with no code behind them.**

## Check these settings today (Vercel env, owner, no code needed)
1. Is `MAGIC_LINK_SECRET` set in Production, and different from `SESSION_SECRET`? If it is not, finding **P1-2** is live now. Fix it by rotating `SESSION_SECRET`, which signs everyone out once.
2. Are `SESSION_SECRET`, `CRON_SECRET`, `TELNYX_API_KEY` and `TELNYX_PUBLIC_KEY` all set in Production? The code fails open or fakes success when they are missing (P2-14).

## P1 — exploitable, or a risk to money, data or the law
1. **Price is not bound to what is fulfilled** [B][C] ✔.
   - Problem: a draft can change tier or years after checkout opens, and `stripeSessionId` is kept (`api/filings/[id]/route.ts` ~561). The webhook rejects only *superseded* sessions and never compares `amount_total` with the current price (`stripe-webhook/route.ts` ~159-190).
   - Effect: a $397 Express 3-year package was fulfilled for $149 (Codex reproduction).
   - Fix: store an immutable quote at checkout and fulfil that scope. When `amount_total` is lower than expected, hold the order and alert staff, but never block the payment itself.
2. **Old unsubscribe links can act as login cookies** [C] ✔ (code), env-dependent.
   - Problem: unsubscribe tokens issued before `2f67882` (29 Sep 2026) are `userId:exp(1y).HMAC` with the same key that `verifyUserToken` uses (`lib/session.ts:80-91`). Only `/auth/<token>` was closed off.
   - Effect: anyone holding a reminder email sent May–Sep 2026 could open that customer's account until about Sep 2027.
   - Fix: add a domain prefix to the session HMAC (`session:`), or rotate `SESSION_SECRET`.
3. **Google sign-in login CSRF** [B] ✔, and **`email_verified` is ignored** [C].
   - Problem: `api/auth/google/route.ts` accepts any body and any origin, then sets the session cookie.
   - Effect: a cross-site form can sign a victim into the attacker's account. Whatever filing data they then enter is visible to the attacker.
   - Fix: require same-origin JSON plus a nonce bound to the browser, and require `email_verified`.
4. **SSNs entered in the EIN application are stored in plaintext** [B].
   - Problem: `ein-application/route.ts:72` saves "SSN or ITIN" into `responsiblePartyTin`. `generate-ss4/route.ts:60` copies it into `ss4Options` JSON, and the admin page shows it without the audited Reveal.
   - Fix: encrypt it with `encryptPii`, mask it in the UI, and stop persisting plaintext copies. Backfill-encrypt existing rows (owner-approved script).
5. **A partner can sign the client's pro forma 1120** [C].
   - Problem: the partner sign-link hands over a bearer sign URL, and invite consumption checks no email (`filingInvite.ts:89-105`). When no client is bound, checkout binds the partner's own email.
   - Effect: this breaks the house rule that only the client signs.
   - Fix: send a one-time code to the client's email at sign time, and refuse to sign as the partner.
6. **A failed re-fax can overwrite the record of what was filed** [B].
   - Problem: signed-PDF replacement is allowed after confirmation (`filingActions.ts` ~2767). `_faxed.pdf` is overwritten *before* submission (~1697).
   - Effect: if Telnyx rejects the re-send, the customer's "exact PDF we faxed" is not what the IRS received.
   - Fix: keep immutable artifacts per submission, and block replacement after fax activity.
7. **Dependencies with known advisories** [A].
   - **Next.js 14.2.35:** critical. Server-Components DoS, and request smuggling in rewrites; the partner portal uses rewrites.
   - **xlsx 0.18:** prototype pollution and ReDoS while parsing **customer-uploaded** Excel statements (`lib/bank/parsers.ts`). There is no npm fix; SheetJS ships fixed builds from its CDN.
   - **pdfjs-dist:** arbitrary JS when opening a malicious PDF.
   - **sharp, zod, axios, form-data:** fixes are available.
   - Fix: a planned upgrade wave, starting with xlsx and pdfjs, then Next 15.5+ (a major upgrade with its own test plan).

## P2 — likely bugs or serious gaps
8. **Ownership and DRAFT-status checks happen before the write, not with it** [B].
   - Effect: a delayed PATCH can still write after access is revoked or after payment locked the draft.
   - Fix: put `userId`/status in the `UPDATE ... WHERE` clause.
9. **EIN/ITIN payments can be silently dropped** [C].
   - Problem: the webhook claim requires status `RECEIVED`/`PAYMENT_PENDING`. If staff changed the status, the payment is logged as a "duplicate", and the Telegram alert is suppressed too. The customer is charged, `paidAt` is never set, and their PDF is refused.
   - Fix: claim on `stripePaymentId`, as Form 7004 does, and alert on an unexpected status.
10. **Payment and fax completion cannot resume after a partial failure** [B][C].
    - Problem: the webhook claims payment before generation and email (a timeout means a redelivery skips them). `fax/finalize.ts` marks the filing CONFIRMED before the receipt is stored.
    - Fix: separate retryable tasks (fulfil, receipt, notify), or send the emails before generation.
11. **The checkout completeness gate still blocks payment** [B][C].
    - Problem: `checkout/route.ts:55-65` returns 400 on ZIP/NAICS/EIN format, non-Latin names, or a missing 7004 answer. This contradicts the "never block payment" rule.
    - **Owner decision:** downgrade to warnings plus the staff pre-flight check, or document the exception.
12. **Upload limits are above Vercel's 4.5 MB request cap** [C].
    - Problem: the routes advertise 10–25 MB, so customers and staff get a raw 413.
    - Fix: presigned direct-to-R2 uploads, or cap at 4 MB with a clear message.
13. **Admin login** [C].
    - Problem: the throttle is per submitted email, which the attacker chooses. There is one shared password, no 2FA, a possible timing oracle, and an empty Admin table bootstraps any email.
    - Fix: throttle per IP plus globally, add TOTP.
14. **Fail-open configuration** [B][C].
    - Six crons run unauthenticated without `CRON_SECRET`.
    - `submitFax` fakes a `sandbox_` success without `TELNYX_API_KEY`, so the filing shows FAXED but was never sent.
    - `session.ts` falls back to a public dev secret.
    - Fix: fail closed in production, through one shared helper.
15. **EIN/ITIN-only customers cannot get a new login link** [B]. `send-link` requires `filings.length > 0`.
16. **No `charge.refunded` or `dispute` handling** [C]. Refunded or charged-back orders keep moving toward the fax.
17. **Privacy promises vs code** [B][C].
    - Undisclosed recipients: Anthropic (`/api/chat`) and Telegram (customer names and emails in alerts).
    - "Account email: active + 12 months" and "IP 30 days" have no purge job. The `RateLimit` table keeps raw IPs forever.
    - Orphaned R2 blobs are left behind when a statement is deleted and when admin deletes a draft.
    - Fix: correct the copy or build the jobs (this continues the 2026-11-24 privacy work).

## P3 — worth improving
18. Admin place-signature has no status or hash guard, so it can regress FAXED/CONFIRMED [C].
19. `/api/chat` is a public Anthropic proxy with **no UI caller**, and its prompt says "never say you are an AI" (EU AI Act Art. 50, California BOT Act) [C]. Recommend deleting the route. The owner kept the persona on 2026-11-24, but nothing uses the route.
20. Headers [D][C]:
    - the CSP is only `frame-ancestors`, with no `script-src`;
    - there is no Permissions-Policy;
    - HSTS lacks `includeSubDomains`/`preload`.
21. Site polish [D]:
    - `<html lang="en">` on /de and /zh-hans;
    - about 560–610 KB of JS on mostly static pages;
    - the `f5472_attr` cookie is set before consent;
    - the apex domain takes two redirect hops;
    - the homepage canonical lacks the trailing slash the sitemap uses;
    - PageSpeed was not measured (quota);
    - 1 `<img>` lint warning.

## Recommended order of work
Each wave is built by Codex, reviewed by two independent agents, and shipped only when both say SHIP. That is the standing rule.

| Wave | Contents | Why first |
|---|---|---|
| 0 (today, owner) | Vercel env checks above; rotate `SESSION_SECRET` if P1-2 applies | Closes the worst risk without code |
| 1 Security | P1-1 price binding, P1-2 HMAC domain prefix, P1-3 Google CSRF + verified email, P1-5 partner signing, P2-14 fail-closed config | Account and money integrity |
| 2 Data | P1-4 encrypt EIN SSN (+ backfill), P1-6 immutable fax artifacts, P2-17 privacy copy and jobs, P3-19 delete `/api/chat` | PII and legal |
| 3 Payments reliability | P2-9 EIN/ITIN claim, P2-10 resumable fulfilment, P2-16 refunds/disputes, P2-8 atomic writes, P2-12 uploads, P2-15 login links; owner decision on P2-11 | Paid customers never stranded |
| 4 Platform | xlsx (SheetJS CDN) + pdfjs + minor deps now; Next 15.5+ upgrade as its own project; admin TOTP; CSP | Known CVEs |
| 5 Site polish | P3-20/21 | SEO and speed |

## Owner decisions needed
- P2-11: should checkout still refuse incomplete data, or downgrade it to warnings?
- P3-19: delete the unused `/api/chat` route?
- Wave 4: approve a Next.js 15.5+ major upgrade project.
- Admin 2FA (TOTP) for staff logins.

## Not checked
- Production env values.
- Live database contents.
- R2 lifecycle settings.
- Whether the PDF generator output is correct.
- The `hktax/` app.
- The iOS v1 handlers in depth.
- Real-browser Core Web Vitals.
- Authenticated customer, partner and admin flows on production (no test account; nothing was submitted).
