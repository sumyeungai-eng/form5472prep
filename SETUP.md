# Setup — working on this project from another machine

The code is **not** synced by iCloud or any drive — GitHub is the single source of
truth. To work on this project from another Mac (or any machine), clone it and set
up a few things once. See `HANDOFF.md` for the architecture/context.

---

## One-time setup on a new machine

```bash
# 1. Get the code.
#    The origin remote is SSH, so this machine needs its OWN SSH key registered
#    on GitHub. On the new Mac:
#        ssh-keygen -t ed25519            # accept the defaults
#        cat ~/.ssh/id_ed25519.pub        # copy this and add it at
#                                         # https://github.com/settings/keys
#    Then clone:
git clone git@github.com:sumyeungai-eng/form5472prep.git
cd form5472prep

#    (No SSH key? Clone over HTTPS instead — you'll authenticate with a GitHub
#     Personal Access Token when you first push:)
#    git clone https://github.com/sumyeungai-eng/form5472prep.git

# 2. Install dependencies (Node 18+; matches Next 14).
npm install

# 3. Create .env.local — it is gitignored, so secrets are NOT in the repo.
#    For local builds / typechecks the ONLY thing that must be well-formed is a
#    dummy DATABASE_URL (the app constructs PrismaClient at import time and
#    throws on an empty URL; DB-reading pages catch the connection error and
#    render a fallback, so the build succeeds without a real database):
echo 'DATABASE_URL="postgresql://u:p@localhost:5432/devnull?schema=public"' > .env.local
#    See .env.example for the full list of variables. The REAL secrets
#    (database, Stripe, Resend, Telnyx, R2, etc.) live only in Vercel and are
#    applied at deploy time — you do not need them to build or to deploy.

# 4. Link to Vercel so you can deploy (log in with the same account).
npm i -g vercel
vercel login
vercel link          # select the existing "form5472prep" project

# 5. Sanity check.
npx tsc --noEmit
npm run build        # uses the dummy DB locally; should exit 0
```

---

## Daily loop (identical on either machine)

```bash
git pull                                   # ALWAYS pull before you start
# ...make changes...
npx tsc --noEmit && npm run build          # verify before deploying
git add -A && git commit -m "message"
git push                                   # keep GitHub in sync
vercel --prod                              # deploy to www.form5472prep.com
```

- `vercel --prod` deploys the **working tree** and, via the `vercel-build`
  script, runs `prisma migrate deploy` automatically — so any new migration
  under `prisma/migrations/` applies to the production DB on deploy. You cannot
  run `migrate deploy` locally (you don't have the prod `DATABASE_URL`).
- The live site is whatever was last `vercel --prod`'d from **either** machine.

---

## Gotchas

- **Never put this folder in iCloud/Dropbox.** Running a Node/Next build out of a
  synced folder causes flaky file locks and stale `node_modules`. Keep it in a
  plain local path (e.g. `~/Documents/...`).
- **Secrets are not in git.** `.env.local` only needs the dummy `DATABASE_URL`.
  If you ever want to run the app fully locally against real services, copy the
  real values from the Vercel dashboard by hand — do NOT commit them or sync
  `.env.local` between machines.
- **Pull before you start, push when you finish**, so the two machines never
  diverge. If they do diverge, resolve it in git (rebase/merge) before deploying.
- **Deploys auto-migrate.** A bad migration fails the Vercel build (safe — the
  previous deployment stays live); it won't half-apply.
