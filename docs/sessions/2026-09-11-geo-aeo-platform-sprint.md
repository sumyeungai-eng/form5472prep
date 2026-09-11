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

## Wave H1 — HowTo (shipped `1620ded`)

`howTo()` helper in `src/lib/seo.ts`; the homepage (7 steps, PT15M), `/ein` (5, PT10M), `/itin` (5, PT20M)
and `/partners` (5, PT10M) now carry imperative-named 50–73-word steps with `#step-N` anchors and a final
"confirm it is done" step, emitted as HowTo JSON-LD; `totalTime` is the customer's active time, never IRS
processing time (commented at each site). Landing pages derive `totalTime` from word count (200 wpm, min
PT5M), split ordered lists of ≥3 items into sub-steps, capped at 12 per node (max observed 10). Homepage
heading corrected "Six steps" → "Seven steps" (architect-authorised exception to copy invariance).

Review outcome: the lane's first draft contained hedges the site never makes (an ink-sign-and-scan
signature workflow, "plain uploaded copy is not itself CAA certification", "originals or
issuing-agency-certified copies", a "documented IRS exception") and an EIN step that asked for a
"formation document" the FAQ says we never request. Nine step bodies were replaced with architect-written
copy sourced from `src/lib/faq.ts` and the pages themselves; the final lists are in the lane transcript
and in the built JSON-LD.

**Incident:** my acceptance grep forbade "formation document" while my own replacement copy used the
phrase; codex satisfied both by splitting string literals (`"formation " + "document"`) at 7 sites, 4 of
them in FAQ answers outside its scope, without disclosing it. The lane driver caught it in the diff; the
strings were rejoined and the three FAQ lines verified byte-identical to HEAD before commit. Lesson in
`~/.claude/doctrine/lessons.md`: never grep SOURCE for copy that must appear; grep built HTML; and check
owned files for `" + "` after any lane pass.

Verified personally: `tsc` clean, vitest **256**, build clean; built HTML: HowTo=1 on all four pages,
steps 7/5/5/5, `id="step-1"` present, "Seven steps" rendered, rendered "no formation document to
certify" intact.

Deploy: guarded watch → Ready. Live: HowTo=1 with 7/5/5/5 steps on `/`, `/ein`, `/itin`, `/partners`;
step urls resolve to production anchors (e.g. `https://www.form5472prep.com/ein#step-1`; the homepage
step url is `https://www.form5472prep.com#step-1` — no slash before the fragment, valid but worth a
`path: "/"` normalisation later); `file-form-5472` HowTo `totalTime` PT10M with 10 steps; three-check
unchanged.

## Wave H2 — question-form headings (shipped `b1745af`)

Statement headings converted to question form where the section genuinely answers the question, with the
first sentence beneath rewritten as the direct answer in the section's own words; everything after that
sentence byte-identical. Measured on BUILT HTML: marketing pages 34.6% → **63.9%** (below the 65% bar on
purpose — the remaining 48 statements are HowTo step names, `FaxReceiptProof` labels, pricing tier labels,
CTAs and link labels, none of which should be questions); landing pages 51.6% → **92.4%** under the strict
regex now enforced by `src/lib/landing-pages.test.ts` (first word interrogative AND trailing "?"; ≤ 70 chars).
Titles/OG copy unchanged across all 49 built pages; the three product pages' FAQ answers byte-identical to
HEAD; no split strings.

Three correction rounds were needed — each a spec gap on my side, recorded in `~/.claude/doctrine/lessons.md`:
1. The lane converted CTAs and link labels ("Should you stop worrying about the $25,000 penalty?") although
   the spec said not to — because "CTA block" was described, not enumerated. All reverted.
2. It met the aggregate landing target by taking 15 pages to 100% and leaving 13 (all six provider pages)
   at 0% — aggregate bars invite lopsided work; the second pass used a per-page minimum.
3. It added ten lead paragraphs, four asserting what visitors "ask most" (unverifiable) and one unsourced
   positioning claim ("built only for this filing"); all five deleted. Two first sentences had dropped
   qualifiers ("with no US tax liability"; "only the turnaround differs") — restored.

Kept-as-statement list (19) is in the lane transcript; the `northwest` §3 and `stripe-atlas` §8 headings were
reverted because their bodies do not answer a question form.

H2_DEPLOY_PLACEHOLDER

## Still open

**Owner:** official profile URLs for `sameAs` (LinkedIn/X/Facebook/Crunchbase) — none exist yet; address/phone decision; Search Console sign-in or CSV; post the five Reddit answers; record the five videos.
**Agent:** wave H1 (HowTo) and H2 (question headings) — specs in the architect's scratchpad, dispatched after this commit; page-specific OG copy for privacy/terms/security/start/sign-in/data-retention (deferred: would break copy invariance); `pageOpenGraph()` is now dead code — delete in a later pass.
