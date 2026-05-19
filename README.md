# form5472

Self-service IRS Form 5472 + pro forma Form 1120 filing for foreign-owned US single-member LLCs.

This is the **Phase 1 MVP** scaffold per the product spec. It supports a single-year, manual-entry filing end-to-end: auth → wizard → Stripe → PDF generation → signed re-upload → fax (sandbox).

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Postgres + Prisma 6
- Auth: HMAC-signed cookies (no third party) — anonymous wizard + magic-link by email after payment
- Email: Resend (with console-log fallback for dev)
- Stripe Checkout
- pdf-lib for filling IRS PDFs
- Telnyx Programmable Fax (sandbox stub by default)
- Local disk storage for generated/signed PDFs (R2 swap-in available)

## Heads-up: iCloud Drive

This project lives inside iCloud Drive. iCloud will try to sync `node_modules/` and `.next/`, which is slow and occasionally corrupts files. Two safer options:

1. **Move out**: `mv form5472 ~/code/ && cd ~/code/form5472` (recommended).
2. **Stop syncing in-place**: append `.nosync` to `node_modules` and `.next`, or run
   `xattr -w com.apple.metadata:com_apple_clouddocs_optout 1 node_modules`.

`.icloud` and `*.icloud` are already gitignored.

## Setup

```bash
cp .env.example .env.local
# Fill in the required values — see "Provisioning checklist" below.
npm install
npx prisma migrate dev --name init   # creates the schema in your DB
npm run dev
```

Open <http://localhost:3000>.

## Provisioning checklist

You need accounts for **Neon**, **Clerk**, and **Stripe** before the app boots. Telnyx + R2 are Phase 4.

### Neon (Postgres) — required

1. <https://console.neon.tech> → create project.
2. Copy the **pooled** connection string into `DATABASE_URL`.
3. Run `npx prisma migrate dev --name init`.

### Auth — no third party

Auth is handled by HMAC-signed cookies in [`src/lib/session.ts`](src/lib/session.ts). Customers start the wizard anonymously — a `fs_session` cookie binds the draft Filing to the browser. At the Review step they enter an email; we upsert a User and bind the Filing to it. After Stripe payment, a magic-link email is sent so they can return from any device — clicking the link sets a 30-day signed `fs_user` cookie.

Required env:

```
SESSION_SECRET="…"          # openssl rand -hex 32
MAGIC_LINK_SECRET="…"        # optional, falls back to SESSION_SECRET
```

### Email (Resend) — optional in dev

If `RESEND_API_KEY` is unset, magic-link emails are printed to the server console so you can copy the link locally.

For production: <https://resend.com> → API key → set `RESEND_API_KEY` and `RESEND_FROM`.

### Stripe — required for the checkout step

1. <https://dashboard.stripe.com/test/apikeys> → copy test keys.
2. Fill `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. For local webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```
   The CLI prints `whsec_...` — paste it into `STRIPE_WEBHOOK_SECRET`.

> If `STRIPE_WEBHOOK_SECRET` is not set the webhook handler will 400. The filing detail page also bumps `DRAFT → PAID` when Stripe redirects back with `?paid=1`, so the post-pay flow demos without the CLI listener.

### Telnyx — Phase 4 (skip for now)

Leave `TELNYX_API_KEY` empty. `src/lib/fax.ts` falls back to a sandbox stub that returns a fake job ID — the UI flow works end-to-end without any fax actually going out.

When you're ready to enable live fax: buy a fax number (~$1/mo), create a Programmable Fax connection in the portal, fill in the three Telnyx env vars.

### Cloudflare R2 — Phase 4 (skip for now)

Phase 1 stores generated and signed PDFs to `./tmp-pdfs/` on local disk. Phase 4 swaps `src/lib/storage.ts` to R2 — same interface (`putPdf`, `getPdf`).

## How the wizard works

1. **`/`** — landing page with pricing.
2. **`/sign-up`** — Clerk magic link.
3. **`/dashboard`** — list of filings, "New filing" CTA.
4. **`/filings/new`** — creates a DRAFT filing, redirects to `/edit`.
5. **`/filings/[id]/edit`** — 5-step wizard:
   - Entity → Owner → Tax years → Transactions → Review
   - Each step PATCHes back to `/api/filings/[id]`.
   - "Pay" hits `/api/checkout` → Stripe → returns to `/filings/[id]?paid=1`.
6. **`/filings/[id]`** — post-pay detail page with three steps:
   - Generate PDF → Sign & upload → Fax.

## PDF generation

`src/lib/pdf/generatePackage.ts` builds the full package:

- **Cover letter** (1 page) — generated.
- **Reasonable Cause Statement** (1 page) — only when `isDiirsp = true`.
- For each tax year:
  - **Form 1120** — `public/forms/f1120--2024.pdf` filled per `form1120_2024FieldMap`.
  - **Form 5472** — `public/forms/f5472.pdf` filled per `form5472FieldMap`.
  - **Supporting Statement** (Part V table) — generated.

Both blank IRS PDFs are downloaded into `public/forms/` (committed) so the app works offline. Field maps live in `src/lib/pdf/fieldMaps.ts` and use the names from the spec.

> The 1120 field map is for **tax year 2024 only**. Filing a 2025 return requires `f1120.pdf` (current year) and the `form1120_2025FieldMap` from the spec — add in Phase 3.

### DIIRSP stamp

`stampDiirspHeader` overlays "FOREIGN-OWNED U.S. DE — DIIRSP" in red at the top of page 1 of each form. For timely filings the "— DIIRSP" suffix is dropped.

### Line 1f calculation

Per IRS instructions for foreign-owned US DEs, Form 5472 line 1f includes Part V (contributions + distributions). The code sums them and writes the same value to lines 1f and 1h (one Form 5472 per filing).

## API surface

| Route | Method | Purpose |
|---|---|---|
| `/api/filings` | POST | Create a draft filing |
| `/api/filings` | GET | List the user's filings |
| `/api/filings/[id]` | GET/PATCH | Read or update a draft |
| `/api/filings/[id]/pdf` | GET | Download generated unsigned PDF |
| `/api/filings/[id]/signed-pdf` | GET | View uploaded signed PDF |
| `/api/filings/[id]/statements` | POST | Upload + parse + categorize a bank CSV for one tax year |
| `/api/checkout` | POST | Create Stripe Checkout Session |
| `/api/stripe-webhook` | POST | Stripe webhook → mark PAID |
| `/api/telnyx-webhook` | POST | Telnyx fax webhook → delivery / retry / failure |
| `/api/generate-pdf` | POST | Build the filing package PDF |
| `/api/upload-signed` | POST | Multipart upload of signed PDF |
| `/api/fax` | POST | Submit to Telnyx (sandbox if `TELNYX_API_KEY` unset) |

All `/api/filings/*`, `/api/checkout`, `/api/generate-pdf`, `/api/upload-signed`, `/api/fax` routes are gated by Clerk middleware.

## Google sign-in (optional)

Customers can start or resume a filing with one click via Google. Implementation uses [Google Identity Services](https://developers.google.com/identity/gsi/web) on the client and [`google-auth-library`](https://www.npmjs.com/package/google-auth-library) to verify the JWT server-side. No third-party auth vendor.

### Setup

1. <https://console.cloud.google.com> → **APIs & Services** → **Credentials** → **Create credentials** → **OAuth client ID** → **Web application**.
2. **Authorized JavaScript origins**: add `http://localhost:3000` (dev) and your production URL.
3. **Authorized redirect URIs**: leave blank (we use the GIS popup, not a redirect).
4. Copy the **Client ID** into `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID="123abc.apps.googleusercontent.com"
   ```

### How it works

1. Client renders Google's official "Continue with Google" button via the GIS script.
2. User picks an account → Google returns a JWT credential to our `onCredential` callback.
3. POST to `/api/auth/google` → server verifies the JWT signature + audience with `google-auth-library`.
4. Server upserts the User row (keyed by email), sets the `fs_user` session cookie, and either resumes their most recent DRAFT filing or creates a fresh one.
5. Client redirects to `/filings/[id]/edit` (or `/dashboard` from the sign-in page).

When `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` is unset, the button renders disabled with an "Unavailable" badge + setup hint, and the email + magic-link path stays functional.

## Bank connection via Plaid

Customers can connect their bank directly with [Plaid Link](https://plaid.com/products/link/) instead of (or in addition to) uploading CSV/PDF. The button sits next to the upload dropzone on the Transactions step.

### Setup

1. Create a Plaid account at <https://dashboard.plaid.com>.
2. From **Developers → Keys**, copy the Sandbox `client_id` and `secret`.
3. Set in `.env.local`:
   ```
   PLAID_CLIENT_ID="..."
   PLAID_SECRET="..."
   PLAID_ENV="sandbox"
   ```
4. In Sandbox, use the test institution **"First Platypus Bank"** with any username and password `pass_good`.

When unset, the Connect button still renders but returns a friendly "Plaid isn't configured" error so users can fall back to CSV/PDF.

### How it works

1. Client clicks **Connect bank with Plaid** → `POST /api/plaid/link-token` mints a `link_token`.
2. [`react-plaid-link`](https://github.com/plaid/react-plaid-link) opens the Plaid Link modal; user picks their bank, signs in, picks accounts.
3. On success the client gets a `public_token` and POSTs to `/api/plaid/exchange` with the filing id + tax year.
4. Server exchanges for a long-lived `access_token`, stores the `PlaidConnection` row, fetches the year's transactions, and returns them already categorized.
5. Transactions flow into the same review table as CSV/PDF uploads — the user can re-categorize / remove rows the same way.

The `access_token` is stored in the `PlaidConnection.accessToken` column. For production, encrypt at rest with a KMS key — Neon's encryption is good but not customer-managed.

## Bank statement parsing & categorization (Phase 2)

Upload a CSV bank statement during the Transactions step and the app parses + auto-categorizes it.

- **Detection**: header-row sniffing in [`src/lib/bank/parsers.ts`](src/lib/bank/parsers.ts) recognises Mercury, Wise, Relay, Brex; everything else falls back to a generic parser with a warning.
- **Categorization**: rule-based engine in [`src/lib/bank/categorize.ts`](src/lib/bank/categorize.ts). Categories: `contribution` and `distribution` are reportable on Part V; `revenue`, `vendor_expense`, `card_reimbursement`, `internal_transfer` are not. Owner-name matching uses the owner's name from the wizard plus optional user-typed aliases.
- **Override**: every row has a category dropdown the user can change. Bulk totals recompute live.
- **Tests**: 10 unit tests in [`src/lib/bank/categorize.test.ts`](src/lib/bank/categorize.test.ts). Run `npm test`.

## DIIRSP & multi-year (Phase 3)

When the user selects multiple tax years or a prior year, the wizard automatically adds a "Reasonable cause" step ([`ReasonableCauseStep`](src/components/wizard/ReasonableCauseStep.tsx)) between Tax Years and Transactions. The user picks from four template reasons (unaware, prior preparer, personal circumstances, administrative oversight), optionally adds specifics, and sees a live preview of the final statement that will be attached to the package.

## R2 storage (Phase 4)

[`src/lib/storage.ts`](src/lib/storage.ts) is the single storage interface. It auto-detects: when all three `R2_*` env vars are set, it uses Cloudflare R2 via the AWS SDK; otherwise it falls back to local `./tmp-pdfs/`. Set the env vars in production. `publicUrl()` returns a presigned URL when in R2 mode — Telnyx live fax needs this.

## Telnyx live fax (Phase 4)

Point your Telnyx fax connection's webhook URL at `{NEXT_PUBLIC_APP_URL}/api/telnyx-webhook`. The handler processes:

- `fax.delivered` → mark filing `CONFIRMED`.
- `fax.failed` / `fax.sending.failed` → automatic retry up to 3 attempts, then mark `FAILED`.
- Other events → record the latest status.

Webhook signature verification is left as a TODO; add it before going live.

## Blog

File-based markdown blog at `/blog` for SEO content. To publish a post:

1. Drop a markdown file in `content/blog/<slug>.md`.
2. Frontmatter required:
   ```yaml
   ---
   title: "Your post title"
   description: "1–2 sentence summary used as meta description and index card"
   date: 2026-05-19
   author: "form5472 team"
   tags: ["form-5472", "diirsp"]
   draft: false
   ---
   ```
3. Write the body in standard markdown (GFM supported — tables, strikethrough, task lists).

The file name (without `.md`) becomes the URL slug. Draft posts (`draft: true`) are excluded from the index and 404 on direct access. Each post automatically gets:

- Per-post `<title>` / meta description / OG / Twitter / canonical
- JSON-LD `BlogPosting` structured data
- Inclusion in `/sitemap.xml`
- Reading time estimate

Posts hit the filesystem at request time (no build step). On Vercel they get cached by the Data Cache; revalidate as needed.

### Admin editor

Visit `/admin` and sign in. Default password is `111111` — override with `ADMIN_PASSWORD` in `.env.local`. Also set `ADMIN_SESSION_SECRET` to a strong random value (`openssl rand -hex 32`) before deploying.

The editor:
- Lists all posts (drafts shown with a badge).
- Markdown editor with live preview tab.
- Auto-slug from title, or supply one.
- Save as draft or publish.
- Delete removes the markdown file from disk.

> **Vercel caveat:** the editor writes to `content/blog/*.md` on the filesystem. Vercel's serverless filesystem is read-only outside `/tmp`, so the editor works locally but writes won't persist across deploys. For production, either: (a) run on a stateful host (Fly.io, Railway, your own VPS), (b) swap the file-based storage in `src/lib/blog.ts` for a database, or (c) treat the editor as a local-only tool and commit the generated `.md` files to git.

Both `/admin` and `/api/admin/*` are excluded from `robots.txt` and unindexed (`X-Robots-Tag: noindex, nofollow` on every admin page).

## Legal pages

- [`/terms`](src/app/(marketing)/terms/page.tsx) — Terms of Service
- [`/privacy`](src/app/(marketing)/privacy/page.tsx) — Privacy Policy with explicit data list, GDPR / CCPA sections
- [`/data-retention`](src/app/(marketing)/data-retention/page.tsx) — 7-year IRS-aligned retention schedule

Footer links to all three. Review with counsel before launch.

## Not yet built

- PDF bank statement OCR (Phase 5)
- Annual recurring filing + April 15 reminders (Phase 6)
- Telnyx webhook signature verification

## Project layout

```
src/
├── app/
│   ├── (marketing)/         # Landing page + footer
│   ├── (app)/               # Auth-gated dashboard + wizard
│   ├── api/                 # Route handlers
│   └── layout.tsx           # ClerkProvider root
├── components/
│   ├── ui/                  # Button, Input, Field, Label
│   └── wizard/              # FilingWizard, FilingActions
├── lib/
│   ├── auth.ts              # Clerk + DB user sync
│   ├── env.ts               # Env access with friendly errors
│   ├── fax.ts               # Telnyx (sandbox stub)
│   ├── pricing.ts           # Tier definitions
│   ├── prisma.ts            # PrismaClient singleton
│   ├── schemas.ts           # Zod validation for wizard steps
│   ├── storage.ts           # Local tmp-pdfs/ (R2 swap-in)
│   ├── stripe.ts            # Stripe client lazy init
│   ├── utils.ts             # cn, formatUsd, formatDateForIrs
│   └── pdf/
│       ├── fieldMaps.ts     # IRS form field name maps
│       ├── fillForm.ts      # setText / check / stamp helpers
│       └── generatePackage.ts  # Build the full filing package
├── middleware.ts            # Clerk route protection
└── ...
prisma/schema.prisma
public/forms/
├── f1120--2024.pdf          # blank IRS Form 1120, 2024 revision
└── f5472.pdf                # blank IRS Form 5472, Rev. Dec 2023
```

## Legal reminders (from spec § Legal & Compliance)

Before launch you must add: full ToS, privacy policy, data retention policy (suggest 7 years), and explicit disclaimer that this is a form preparation and filing courier service, NOT tax advice. The footer already carries the disclaimer; standalone policy pages still need to be written.

## Scripts

```bash
npm run dev      # Next dev server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
npx prisma studio   # Browse the DB
```
