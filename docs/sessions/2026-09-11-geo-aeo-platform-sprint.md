# 2026-09-11 — GEO/AEO sprint: platform consistency, brand authority, question headings, HowTo

Owner pasted four audit sections (platform optimisation 70/100, brand authority 55/100, question-form
headings 40/100, HowTo structure 10/100). This log records what was verified, what shipped, and what is
deliberately NOT being done.

## Ownership

| Area | Files | Wave |
|---|---|---|
| Metadata wave | `src/lib/seo.ts` (`pageMeta()`, completed `organizationNode()`), 22 `src/app/(marketing)/**/page.tsx` metadata blocks, `blog/[slug]/opengraph-image.tsx` (+`generateStaticParams`), `ein/apply/layout.tsx`, `itin/apply/layout.tsx`, `src/lib/llms.ts`, `src/lib/seo.test.ts` | shipped `eed2dc8` |
| Audits | `docs/reviews/2026-09-11-platform-geo-audit.md`, `docs/reviews/2026-09-11-question-headings-howto-audit.md` | committed |
| Brand Kit | `docs/marketing/brand-kit.md` | committed |
| Playbook | `docs/marketing/brand-authority-playbook.md` (26 real Reddit threads, 5 targeted answers, 5 videos) | committed |
| HowTo wave (H1) | `seo.ts` `howTo()`, process blocks on home/ein/itin/partners, landing HowTo emission | pending |
| Question-heading wave (H2) | `landing-pages.ts` titles + first sentences, 10 indexed marketing pages | pending |

Untouched by design: `content/blog/**` and `src/lib/blog.ts` (another agent owns the blog today; 77% question-form already, HowTo extraction already live).

## Verified defects fixed (platform)

1. **Every blog post's OG image 404'd in production** — `opengraph-image.tsx` had no `generateStaticParams`; 127 posts shared to any chat app rendered as bare links. Fixed; 257 image artifacts now build.
2. **RSS `<link rel="alternate">` never rendered** — Next.js does not deep-merge `alternates` from the root layout into a page that sets its own; every page-level `alternates` now carries `types` via `pageMeta()`.
3. **Twitter Card was site-generic on every non-blog page** — `pageMeta()` emits page-specific `twitter` alongside `openGraph`.
4. **Landing pages claimed `og:type=article` with no dates** — `article:modified_time` from `updated`; blog posts gained `modifiedTime`.
5. **Organization entity differed by page** — `legalName`, `foundingDate`, `logo` (/logo-mark.svg), `description`, `slogan`, `areaServed`, `knowsAbout` (7 entities), two contact points now come from the shared helper on every page. (The lane's first pass had *dropped* the homepage-only fields; caught in review and promoted into the helper instead.)
6. `og:image:alt` on every page; `/feed.xml` listed in `llms.txt`.

Copy invariance: 544 rendered title/og:title/og:description strings byte-identical before and after.

## Verdicts on the audit items that are not code

- **Reddit**: not posted to by any agent — astroturfing risk and Reddit's spam detection. The owner posts from their own account with a disclosure line; the playbook supplies targets and answers.
- **Wikipedia**: not viable (no independent coverage). **Wikidata**: not yet (deletion risk). **Stack Overflow / GitHub**: not applicable.
- **Google Business Profile / NAP**: not recommended — no physical location; a profile without a real address gets suspended.
- **Search Console query mining**: blocked — the owner's property lives under `sumyeungai@gmail.com`, not signed in on the authorised browser; owner to sign in or export CSV.

## Contracts a future editor must respect

- Every marketing page's metadata goes through `pageMeta()`; never set `alternates` on a page without `types` (see the comment in `seo.ts`).
- `organizationNode()` is the ONLY Organization definition; do not reintroduce inline nodes.
- Blog OG images depend on `generateStaticParams` in `opengraph-image.tsx` matching `page.tsx`; keep them in step.
- Brand facts (name spelling "Form5472 Prep", logo, descriptions) come from `docs/marketing/brand-kit.md`.

## Deploy

Metadata wave `80da4f5` → Ready. Live: `/pricing` has the RSS `<link>` and `twitter:title` == `og:title`;
`/` Organization node carries `knowsAbout`; three-check unchanged.

**The blog OG image was still 404 after that deploy.** Second half of the bug, found by following the page's
own `og:image` tag on production: Next 14 serves a file-convention image under a dynamic segment at a HASHED
url (`/blog/<slug>/opengraph-image-yqks0s?<id>`), and the blog page's `generateMetadata` hand-wrote the
unhashed path. Fixed in `c3b1709` by omitting `images` from the blog page's openGraph/twitter so Next
injects the real url. Live after deploy: `what-is-form-5472` and `form-5472-ein-pending-deadline` both
advertise the hashed url → 200 `image/png`, 1200×630 (73–78 KB). Lesson recorded in doctrine: verify the
url the page advertises, never the build artifact.

## Still open

**Owner:** official profile URLs for `sameAs` (LinkedIn/X/Facebook/Crunchbase) — none exist yet; address/phone decision; Search Console sign-in or CSV; post the five Reddit answers; record the five videos.
**Agent:** wave H1 (HowTo) and H2 (question headings) — specs in the architect's scratchpad, dispatched after this commit; page-specific OG copy for privacy/terms/security/start/sign-in/data-retention (deferred: would break copy invariance); `pageOpenGraph()` is now dead code — delete in a later pass.
