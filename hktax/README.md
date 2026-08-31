# HK Tax Assistant 香港報稅助手

HK Tax Assistant 香港報稅助手 is a bilingual Hong Kong personal tax calculator website scaffold. This initial version contains only a static-friendly Next.js app skeleton and placeholder home page.

This project is educational only. It is not tax advice and is not affiliated with the Hong Kong Inland Revenue Department (稅務局/IRD).

## Run Locally

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run build
npm run test
npm run lint
```

## Deploy (Vercel)

This app is self-contained and deploys as its own Vercel project, separate from the
repository root app:

1. In Vercel, **Add New Project** → import `sumyeungai-eng/form5472prep`.
2. Set **Root Directory** to `hktax/` (Framework Preset: Next.js — auto-detected).
3. No environment variables are required — the app is 100% client-side, has no
   database, and stores user data only in the visitor's browser (localStorage).
4. Deploy. Verify the production URL by completing one wizard run
   (e.g. single filer, salary 600,000, no deductions, YA 2025/26 → final tax HK$58,560).

Any other static-capable Node host works the same way: `npm ci && npm run build`
then serve with `npm run start` (or `next start -p <port>`).
