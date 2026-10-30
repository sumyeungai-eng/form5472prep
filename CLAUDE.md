# form5472prep.com — rules every Claude/Codex session must follow

## Deploying (read this before touching production)
- **Production = whatever is on `origin/main`.** Vercel is git-linked
  (`sumyeungai-eng/form5472prep`, production branch `main`) and auto-deploys
  every push to `main`. **To deploy: `git push origin main`. Nothing else.**
- **NEVER run `vercel --prod` / `vercel deploy --prod` in this repo.** A CLI
  deploy publishes your local tree — including branches and uncommitted files
  that are NOT on `main` — and the next push (or another session's CLI deploy)
  silently reverts it. This has already wiped live pages three times
  (2026-08-27 `/contact`; 2026-09-04 all tool + provider pages, when a
  branch deploy from `claude/hk-tax-filing-website-*` replaced `main`).
- Feature branches are fine locally; they must be **merged to `main` and
  pushed** to reach production. If you need a preview, use a Vercel preview
  deployment (plain `vercel`, no `--prod`) or push the branch and use the
  branch preview URL.
- The `hktax/` app is a separate product. It must not be deployed to the
  form5472prep.com production project.

## Never block a customer from paying (owner rule, 2026-10-14)
- A customer must **always** be able to finish the wizard and pay, even when
  their information is incomplete, wrong or badly formatted. Owner's words:
  "make them pay first and then we can solve the issues after order is placed
  by correcting the details."
- Customer-side checks (wizard steps, the review / pre-flight step, the
  checkout API) may **warn and guide**, but must never block saving a step,
  advancing, or paying. Data problems are caught by staff after payment
  (admin pre-flight, Edit filing fields, reviewed-PDF upload).
- Anything that could make package generation throw at payment must be
  sanitised or defaulted so payment still succeeds and staff see a pre-flight
  finding instead. Staff-side gates (admin pre-flight, upload and fax gates)
  are fine.
- Every change touching the wizard, `src/lib/schemas.ts`, `src/lib/completeness.ts`,
  `src/app/api/checkout` or the customer pre-flight step must keep the pay
  path open — test that a deliberately bad-data order still reaches Stripe.

## Default completion checklist
- The owner wants completed website and content work released, not left only
  in a local branch. Unless the request explicitly says draft-only, local-only,
  or no deployment, finish by running the required tests and production build,
  merging the scoped work into `main`, and pushing `origin/main`.
- For blog work, check for completed drafts and scheduled posts that the owner
  asked to release; confirm each published post has its image, then verify the
  live article, image, sitemap, and RSS feed after the Git-linked deployment.
- Verify the affected public pages and the three production markers documented
  in `REPO-STATE.md`. Do not stop at a successful build or Git push.
- Write or update the latest file under `docs/sessions/` with the commit,
  deployment outcome, live verification, files changed, and anything still
  open. Keep durable cross-session rules in this `CLAUDE.md` file.
- Explicit user instructions such as “do not publish” or “leave as drafts”
  override this default. Never deploy unrelated or visibly unfinished work.

## Working in this repo alongside other sessions
- Several Claude sessions share this repo (blog production, SEO, hktax).
  Before a multi-file change run `git status --short`; never edit files you
  don't own; report dirt, don't clean it.
- **Session logs live in `docs/sessions/`.** Read the most recent one before
  starting work: it records which checkout/branch owns which files, what was
  shipped, and what is still open.
- **Every session that changes files must write one before it ends** —
  `docs/sessions/<YYYY-MM-DD>-<topic>.md`, committed with the work. Include:
  ownership table (checkout/branch → files), what shipped (commit range +
  live-verified evidence), contracts a future editor must respect, what is
  still open (owner decisions vs. follow-ups), and lane notes. This is how
  concurrent sessions avoid overwriting each other.
- Never commit secrets. A remote URL containing a `ghp_…` token was found in
  one checkout's `.git/config` — use SSH remotes.

## Facts that must not drift
- The owner's U.S. SSN (since 2026-10-15) is stored ONLY encrypted
  (`Filing.ownerSsnCiphertext`, AES-256-GCM, key `PII_ENCRYPTION_KEY`) and is
  decrypted only in `src/lib/pdf/packageInput.ts` (lines 4b(1)/8b(1)) and the
  admin-website Reveal action. It never goes into an API/partner/v1 payload,
  email (incl. package attachments), log, change-log (masked only) or the
  plain-text ITIN field. See `docs/sessions/2026-10-15-ssn-capture.md`.
- Prices come from `src/lib/pricing.ts` (`TIERS`, `MULTI_YEAR_ADDON_CENTS`);
  never hardcode dollar figures in pages. Promo machinery exists but
  `PROMO_SOURCES` is empty (promo ended 2026-08-19).
- `+1-855-887-7737` is the **IRS Ogden fax line**, not our phone. Never emit it
  as `Organization.telephone`.
- Admin-bound mail goes to `env.adminEmail` / `env.supportEmail` (both default
  to support@form5472prep.com). `ADMIN_LOGIN_EMAIL` is a login identity, not a
  recipient.
- Blog/ops details: `docs/reviews/blog-*.md`; growth plan:
  `docs/marketing/growth-plan-2026-09.md`; Google Ads:
  `docs/marketing/google-ads-diagnosis-2026-08-16.md`.
- **Partner white-label** (`docs/sessions/2026-10-30-partner-white-label-p1.md`):
  a partner's end client never hears from or sees us. All client mail goes
  through `sendEmail()` with `log: { kind, filingId }`; the guard in
  `src/lib/partner/clientMail.ts` redirects it to the partner or drops it
  (new kinds redirect by default; it fails closed). The neutral portal domain
  is `NEXT_PUBLIC_PARTNER_PORTAL_HOST`, parsed in BOTH `portalHost.ts` and
  `next.config.mjs`; only invite/intake/sign + `/api` exist there, and any new
  root-layout tracker/brand must check `onPortalHost()`. Only the owning
  partner can pay for a partner filing.
