# Deploying 5472formIRS to production

End-to-end checklist for hosting at `form5472.com` (or your domain) using
Vercel + Neon + Cloudflare R2 + Resend + Telnyx + Stripe.

---

## 0. Pre-flight (one-time)

- [ ] Domain registered (Hostinger or any registrar)
- [ ] GitHub repository created and code pushed
- [ ] All third-party accounts created (links in each section below)

Tested-on stack: Next.js 14.2, Node 20, Prisma 6, Postgres 15+.

---

## 1. Database — Neon (Postgres)

1. <https://console.neon.tech> → **New Project**, region close to your users.
2. Copy the **pooled** connection string (the one ending `?sslmode=require`).
3. Run migrations locally pointing at the production DB:
   ```bash
   DATABASE_URL="postgres://..." npx prisma migrate deploy
   ```
4. Keep this string — it goes into Vercel as `DATABASE_URL`.

---

## 2. File storage — Cloudflare R2

R2 stores signed PDFs and bank statements that the IRS fax job needs to read
back. Local-disk fallback only works in dev.

1. <https://dash.cloudflare.com> → **R2** → create bucket `form5472`.
2. **Manage R2 API Tokens** → create token with **Object Read & Write** on
   that bucket. Save the Access Key ID, Secret, and Account ID.
3. Optional: turn on public access for the bucket if you want public PDF
   URLs, then copy the public base URL. (Telnyx live mode needs a publicly
   reachable URL for the fax PDF.)
4. Env vars to set:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET=form5472`
   - `R2_PUBLIC_BASE_URL` (only if public access is enabled)

---

## 3. Email — Resend

1. <https://resend.com> → API Keys → create one. Free tier = 3,000/mo.
2. Add and verify your sending domain (`form5472.com`). Add the DNS records
   Resend shows in Hostinger's DNS panel.
3. Env vars:
   - `RESEND_API_KEY`
   - `RESEND_FROM="5472formIRS <no-reply@form5472.com>"`

Without these, magic-link emails are logged to the server console (works for
testing but real users won't get them).

---

## 4. Payments — Stripe

1. <https://dashboard.stripe.com> → **Live mode** → Developers → API keys.
2. Copy publishable and secret keys.
3. Webhooks → **Add endpoint** → URL `https://YOUR_DOMAIN/api/stripe-webhook`,
   event `checkout.session.completed`. Copy the signing secret.
4. Env vars:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`

Pricing is computed in the app from `src/lib/pricing.ts` — no Stripe Products
to manage. Currently `$169` / `$299` / `$419` base + flat `$29` IRS fax fee.

---

## 5. Fax — Telnyx

1. <https://portal.telnyx.com> → buy a fax number (cheapest US number is fine).
2. **Programmable Fax** → create a Fax Application (Connection). Note the
   connection ID.
3. **Auth & API** → create an API key (v2). Save it.
4. Apply for live-mode fax access (sandbox sends fake faxes — fine for
   smoke-testing the flow).
5. Env vars:
   - `TELNYX_API_KEY`
   - `TELNYX_CONNECTION_ID`
   - `TELNYX_FAX_NUMBER` (e.g. `+13125550100`)
   - `FAX_DESTINATION="+18558877737"` (real IRS Ogden PIN Unit, don't change)

Without an API key, the fax route runs in stub mode (no fax sent — flows
work end-to-end but nothing leaves your server).

---

## 6. Google sign-in (optional but recommended)

1. <https://console.cloud.google.com> → APIs & Services → Credentials.
2. **Create OAuth client ID** → Web application.
3. Authorized JavaScript origins: `http://localhost:3000` AND `https://YOUR_DOMAIN`.
4. Copy the client ID.
5. Env var:
   - `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID`

Unset = the Google button shows as disabled with a setup hint. Email +
magic-link still works.

---

## 7. Plaid (optional)

1. <https://dashboard.plaid.com/developers/keys> → grab Sandbox client + secret.
2. Env vars:
   - `PLAID_CLIENT_ID`
   - `PLAID_SECRET`
   - `PLAID_ENV=sandbox` (or `development` / `production`)

Unset = the Plaid Connect button shows as Unavailable with a hint. Users
can still upload CSVs/PDFs.

---

## 8. Auth secrets

```bash
# Generate two strong random secrets:
openssl rand -hex 32  # SESSION_SECRET
openssl rand -hex 32  # ADMIN_SESSION_SECRET
```

Env vars:
- `SESSION_SECRET` — required, signs the user-session cookie
- `MAGIC_LINK_SECRET` — optional, falls back to SESSION_SECRET
- `ADMIN_PASSWORD` — change from default `111111` before going live
- `ADMIN_SESSION_SECRET` — required for /admin

---

## 9. Vercel deploy

1. <https://vercel.com/new> → Import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. Build command: `next build` (default). Install command: `npm install` (default).
4. **Environment Variables** → paste every variable from sections 1–8:
   - `DATABASE_URL`
   - `SESSION_SECRET`, `MAGIC_LINK_SECRET`
   - `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID`
   - `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`
   - `RESEND_API_KEY`, `RESEND_FROM`
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`
   - `TELNYX_API_KEY`, `TELNYX_CONNECTION_ID`, `TELNYX_FAX_NUMBER`, `FAX_DESTINATION`
   - `NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN`
   - `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
5. Deploy.

---

## 10. Domain — Hostinger DNS → Vercel

1. Vercel project → **Settings** → **Domains** → add `form5472.com` and `www.form5472.com`.
2. Vercel will show the DNS records you need. Two common shapes:
   - **A record** for apex: `@ → 76.76.21.21`
   - **CNAME** for www: `www → cname.vercel-dns.com`
3. Hostinger panel → your domain → **DNS / Nameservers** → add those records.
   - Set TTL to 300 (5 min) while you're verifying — bump back to 3600 later.
4. Wait 5–60 min for propagation. Vercel will auto-issue an SSL cert.
5. Once green, update env var `NEXT_PUBLIC_APP_URL` to the https URL and
   redeploy (Vercel → Deployments → ⋯ → Redeploy).

---

## 11. Post-deploy smoke test

Walk through each of these on the live site:

- [ ] Landing page loads, hero shows `$169` and the `+$29 fax fee` line
- [ ] `/start` — email submit → magic-link email arrives
- [ ] Wizard end-to-end: LLC → owner → years → numbers → review
- [ ] Review screen shows base price + `$29` fax fee + correct total
- [ ] Stripe Checkout opens with two line items totalling base + `$29`
- [ ] Pay with a Stripe live test card → returns to filing page with status updated
- [ ] PDF generates, signed PDF uploads
- [ ] (Telnyx live mode only) fax delivers receipt to dashboard
- [ ] `/admin` login with `ADMIN_PASSWORD` → create a draft post
- [ ] `/llms.txt`, `/sitemap.xml`, `/robots.txt` all return 200
- [ ] `/opengraph-image` returns a valid PNG

---

## 12. Things to watch

- **Admin blog editor + Vercel**: writes go to `content/blog/*.md` on the
  serverless filesystem, which is ephemeral. Posts saved through `/admin`
  on Vercel will vanish on the next deploy. For real use, either commit
  posts to git locally or migrate `src/lib/blog.ts` to use the database.
- **Stripe webhook**: if checkout completes but the filing status doesn't
  flip to `PAID`, the webhook secret is wrong or the endpoint URL is
  pointed at the wrong env. Check Stripe → Webhooks → recent events.
- **R2 public URL**: Telnyx needs the fax PDF to be publicly reachable.
  If `R2_PUBLIC_BASE_URL` is unset, the fax send will fail at the
  download step in live mode. (Sandbox stubs this.)
- **Cron / retries**: there's no scheduled retry job yet. Fax failures
  surface in the filing page; retry is manual. Wire up Vercel Cron or
  Inngest if you need automatic retry.
