# Session log — 2026-09-04/05 · EIN/ITIN payments, branch reunification, email deliverability

Companion to `docs/sessions/2026-09-05-seo-aeo-geo-session.md` (the SEO/GEO sprint). Both sessions
ran concurrently on this repo and repeatedly **overwrote each other's production deploys**. §3
explains exactly how, because it is the single most important thing for any future agent to avoid.

---

## 1. What this session shipped (all now on `main`, merge `7e7cea6`)

### 1a. EIN / ITIN applications now take payment
Previously an application was recorded with **no payment of any kind** — no amount, no Stripe
record — so admin could not tell whether an order was paid. Now:

- Submitting an EIN/ITIN application creates a Stripe Checkout session ($149 EIN / $349 ITIN) and
  redirects to it — `src/app/api/applications/[type]/checkout/route.ts`
- The existing `stripe-webhook` records `amountPaid` / `stripePaymentId` / `paidAt` and advances
  `RECEIVED|PAYMENT_PENDING → IN_REVIEW`, using the same claim-once guard filings use
- Admin application pages gained a **Payment** section (status / amount / paid-on)
- New applications start as **`PAYMENT_PENDING`**, not `RECEIVED`

### 1b. Notification emails moved behind payment
Both application emails (admin "new application" + customer confirmation) used to fire at *submit*
time — i.e. for unpaid, abandoned checkouts. They now fire **only** from the webhook, once the
claim-once payment update succeeds, so a replayed Stripe event cannot double-send.
See `src/lib/applicationNotifications.ts`. Admin subject gains a `[Paid]` prefix.

### 1c. EIN form reduced to the seven SS-4 questions
Email + company name, owner legal name, company mailing address, owner home address, business type,
business activity, principal products — plus **owner date of birth**. Removed: phone, state of
formation, formation date, citizenship, residence, passport number, notes. Columns were kept
(nullable), so historical rows are intact.
⚠️ **State of formation and formation date are on Form SS-4 but are no longer collected** — the
owner accepted collecting them per-order via chat.

### 1d. Traffic-source attribution on EIN/ITIN applications
Same first-touch mechanism filings use (`f5472_attr` cookie + sanitised `?src=` slug), same
`formatAttribution` labels. Admin application list gained a **Source** column; detail pages a
**Traffic source** card.

### 1e. Customer ↔ admin chat on EIN/ITIN applications
`Message` gained optional `einApplicationId` / `itinApplicationId` (`filingId` is now optional), so
one model + one `MessagesPanel` serves all three order types. Attachments (PDF/PNG/JPG, magic-byte
validated, 10 MB) work here too. Notification emails deep-link the customer straight to the
application via the auth handler's `?next=`.

### 1f. Smaller items
- Admin **"Upload reviewed package"** — the accountant's reviewed PDF becomes what the customer
  sees and signs; the old ambiguous button is now "Upload already-signed PDF"
- Customers can view their package before signing; upload controls show in-flight state
- Signature stroke thickened 2 → 3.5 (survives 1-bit fax rendering)
- `/contact` page + footer link; EIN application Q&A (8 items) shared between `/ein/apply` and the
  indexed `/ein` page so answer engines can read it

---

## 2. Email deliverability — root-caused, partly fixed

**Symptom:** transactional mail landing in junk, including in the owner's own `support@` mailbox.

**Verified NOT the cause** (evidence, not assumption — live send inspected via Gmail raw headers):
SPF **pass**, DKIM **pass** (`d=form5472prep.com`, selector `resend`), DMARC **pass**, sending IP
clean on Spamhaus / SpamCop / Barracuda / SORBS, and the message was **inboxed and flagged
Important** by Gmail.

**Actual causes and what was done:**
1. **DMARC was `p=none`** (monitor-only). Gmail/Yahoo/Apple treat an enforcing policy as a trust
   signal. Changed in Hostinger DNS to:
   `v=DMARC1; p=quarantine; pct=100; adkim=r; aspf=r; rua=mailto:support@form5472prep.com`
   — confirmed live via Google **and** Cloudflare DoH, and a post-change test send still inboxed.
2. **Hostinger's inbound filter was junking our own notifications** (mail "from our domain" arriving
   from Amazon SES, with `Reply-To` a customer's Gmail — reads as spoofing). Fixed by adding
   `donotreply@form5472prep.com` to the **Allow list** for the `support@` mailbox.

⚠️ **`support@form5472prep.com` forwards to `sum1989104@gmail.com`.** Forwarding is the one place
`p=quarantine` carries risk — if a forwarder alters the message, DKIM breaks and the forwarded copy
can be quarantined. The saved copy in `support@` is protected by the allow-list either way. Watch
that Gmail; reverting to `p=none` is a one-line DNS edit.

---

## 3. ⚠️ How we kept destroying each other's deploys — READ THIS

Vercel is git-linked to `main` and auto-deploys every push. But **`vercel --prod` publishes your
local working tree**, bypassing git entirely. With two sessions and two checkouts, this happened:

| When | Who | Effect |
|---|---|---|
| 2026-08-27 | CLI deploy | `/contact` disappeared from production |
| 2026-09-04 | CLI deploy from `claude/hk-tax-filing-website-*` | all tool + provider pages wiped |
| 2026-09-04/05 | pushes to `main` | EIN/ITIN payment collection 404'd, repeatedly |

It cut **both ways**: CLI deploys erased work that was only on `main`; pushes to `main` erased work
that was only on a feature branch. Four flips in one day.

**Resolved** by merging the feature branch into `main` (`7e7cea6`) so `main` holds everything.
Only **5 conflicts**, all blog/docs — resolved in **`main`'s favour** (its scheduled publish dates,
its ITIN guide entries, its `CLAUDE.md`). **Zero conflicts in tax or payment logic.**

**Rule, no exceptions:** deploy with `git push origin main`. Never `vercel --prod`, from any folder.

### The second checkout
`~/Documents/Claude work/form5472` (branch `feat/seo-geo-aeo-sprint`) still exists and is **stale**.
Its 31 unique commits are all functionally duplicated in `main` — verified. A real merge of it
produces **60 conflicts** across `pricing.ts`, `schemas.ts`, `pdf/generatePackage.ts`, the Stripe
webhook and the filing wizard; attempted and **deliberately abandoned** (high risk to verified IRS
logic, zero feature gain). If it ever gains something unique, cherry-pick that one commit.
Its remote had a plaintext GitHub PAT — switched to SSH; **the token still needs revoking**.

---

## 4. Traps that cost real time here

- **Stale Prisma client after a branch switch** throws dozens of phantom
  `Property 'x' does not exist` errors that look like broken code. Always
  `./node_modules/.bin/prisma generate` after switching branches.
- **`.env.local` `DATABASE_URL` points at localhost**, not production. No local tool can read or
  clean production data. Build-time `prisma:error ... database unavailable` noise is expected.
- **`tsconfig.json` must keep excluding `hktax/` and `src/lib/wizard/`** — without it the
  production build fails on code that is not part of this app.
- **Never poll with an unbounded `until` loop** on `vercel ls` row numbers. Two such waiters ran
  **9 hours** and produced nothing. Verify against a real endpoint with a bounded retry count.

---

## 5. Files this session owns (don't edit blind)

`src/app/api/applications/**`, `src/app/api/{ein,itin}-application/route.ts`,
`src/lib/applicationNotifications.ts`, `src/lib/einApplicationFaq.ts`,
`src/app/(marketing)/{ein,itin}/apply/page.tsx`, `src/app/(marketing)/contact/**`,
`src/app/admin/applications/**`, `src/components/MessagesPanel.tsx`,
`src/components/SignaturePad.tsx`, `REPO-STATE.md`.

Shared with other sessions — coordinate: `src/lib/email.ts`, `src/app/api/stripe-webhook/route.ts`,
`prisma/schema.prisma`, `src/lib/pricing.ts`, `src/app/admin/filings/[id]/**`.

---

## 6. Open — needs the owner, not another agent

1. **Revoke the leaked GitHub PAT** at <https://github.com/settings/tokens>. Removed from disk, but
   still valid. Do it when other sessions are idle, in case one authenticates with it.
2. **Delete probe rows from production** (created while verifying live behaviour; `.env.local` is
   localhost so no agent here can reach them): partner applications *Deliverability probe*,
   *Deliverability probe 2*, *DMARC verify probe*, *DMARC verify*; EIN application *Deployment
   Probe LLC — ignore*; several empty anonymous DRAFT filings.
3. **Apple Mail → "Not Junk"** on a junked notification, so the local filter unlearns.
4. **Set `TELNYX_PUBLIC_KEY`** in Vercel production — the fax webhook is still fail-open.
5. **Consider deleting the second checkout** once satisfied nothing there is needed.
6. **Watch the `support@` → Gmail forward** for a day after the DMARC change (§2).

---

## 7. Evidence (verified live on the `800b35f` deploy)

All three must pass **together** — each branch had half the work at various points, so any single
check can mislead:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  https://www.form5472prep.com/api/applications/ein/checkout \
  -H 'Content-Type: application/json' -d '{}'          # → 400 (endpoint exists)
curl -s https://www.form5472prep.com/ein/apply | grep -c 'Owner date of birth'   # → 1
curl -s -o /dev/null -w '%{http_code}\n' \
  https://www.form5472prep.com/form-5472-penalty-calculator                      # → 200
```

Result: `payment:400 newForm:1 tools:200` — the first time both sessions' work was live together.
Local gates at merge time: `tsc` clean, **166 tests**, production build clean.
