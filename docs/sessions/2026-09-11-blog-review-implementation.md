# Claude handoff — blog review implementation, September 11, 2026

## Outcome and deployment

The owner approved implementation of the preceding blogpost-review with Codex Orchestration. Implemented six refresh areas and four new specialist articles, each dated September 11, with artwork and relevant service links. This was not another arbitrary five-post batch.

Website commits: `947c667` (content, images and shared copy), `40d2566` (responsive table renderer), `94583f4` (homepage signing alignment and evidence). Base was `c1787b1`, the documentation-only coverage review. Release push was `c8d2874..df051d6` to `origin/main`; it included that review and the pre-release handoff. The final documentation-only commit containing this update can be resolved with `git log -1 -- docs/sessions/2026-09-11-blog-review-implementation.md`.

**Published and live-verified.** Git-linked production deployment `dpl_6fr23KxmAiK4udFXTkyUpBU7fx1K` (`form5472prep-3j8hdfta6-form5472prep.vercel.app`, release `df051d6`) reached **Ready**. All new-article checks passed on `https://www.form5472prep.com` at **2026-09-11 09:22:51 UTC**; all refresh checks passed at **09:22:49 UTC**. The sitemap has **127 public blog URLs**; 129 local Markdown posts include the two still-scheduled articles. No approved content remains unshipped.

## New public articles

1. [Does a Foreign-Owned U.S. LLC Need an FBAR?](https://www.form5472prep.com/blog/foreign-owned-us-llc-fbar)
2. [U.S. LLC Paying Foreign Contractors: Tax Forms and Form 5472](https://www.form5472prep.com/blog/us-llc-paying-foreign-contractors-tax-forms)
3. [ITIN for a Nonresident Spouse Filing a Joint Return: Form W-7 Package](https://www.form5472prep.com/blog/itin-nonresident-spouse-joint-return-w7)
4. [When a Form 5472 Owner Becomes a U.S. Tax Resident](https://www.form5472prep.com/blog/form-5472-owner-becomes-us-tax-resident)

All four have distinct 1280×720 WebP conceptual illustrations, descriptive alt text, decision aids, three visible FAQs with matching schema, primary-source links, and `draft: false`. No hidden GEO/AEO brief, fabricated customer story, fake professional sign-off, or internal UTM tags were added. The residency article is a fact-collection/review guide, not a transition-year filing determination.

## Six refresh areas completed

| Area | Files / effects |
|---|---|
| Federal/state compliance map | `foreign-owned-llc-filing-requirements-checklist.md` and the `foreign-owned-llc-tax` object in `src/lib/landing-pages.ts`: conditional Form 5472, LLC-level FBAR, current BOI exemption, state-specific review and separate EIN/ITIN support |
| DIY/cost | `form-5472-diy-vs-preparer.md`, `form-5472-cost.md`: fax or mail, correct form parts, no penalty-elimination promise or unsupported competitor prices; current pricing destination retained |
| ITIN sales page | `src/app/(marketing)/itin/page.tsx`: federal tax purpose, SSN ineligibility, limited CAA referral/authentication claims and IRS status estimates; paid intake is not called free pre-purchase review |
| EIN name mismatch | `new-ein-llc-ownership-structure-change.md`: distinguish legal amendment, DBA, clerical correction and bank name mismatch; no duplicate-EIN shortcut; S-election eligibility caveat |
| Recordkeeping | `form-5472-recordkeeping-checklist.md` and `public/downloads/form-5472-example-ledger.csv`: five invented entries, gross cash movements versus owner-paid cost and net-bank-change distinctions |
| Delivery/signature promises | `src/lib/faq.ts`, marketing home/about/partners pages: provider transmission evidence is not IRS acceptance or immunity; establish authorized signer and appropriate method, rather than blanket browser-signing claims |

The shared blog renderer now puts Markdown tables in keyboard-focusable horizontal scroll regions. Browser testing found the contractor matrix previously produced 452px document width on a 390px viewport. The fix gives 390px document width and a 292px scroll region containing the 512px table. Existing desktop styling is preserved.

## Ownership and unrelated changes

| Checkout / branch | Owned files |
|---|---|
| Canonical `/Users/sumyeung/Documents/Codex/form5472`, `main` | Four new articles and five refreshed Markdown articles listed above; four WebP images; CSV; artwork renderer; blog alt map and page table component; shared marketing/FAQ/landing files; two verification scripts; four evidence notes; this handoff and its `REPO-STATE.md` index entry |
| Detached `/tmp/form5472-review-release.AAQMhE` | Verification-only checkout of release commits, shared dependency symlink, `.next` and local logs. No production environment or database credentials copied. |

Existing admin traffic changes in `src/app/admin/traffic/`, `src/lib/admin/traffic.ts` and its test were excluded from every commit. Untracked admin IP work, identity images, email images, old execution briefs, `src/lib/wizard/`, and the separate `hktax/` app were not staged. Do not clean, overwrite, or deploy them on this session's behalf.

## Verification record

- Full Vitest suite on isolated release commit `94583f4`: **244 tests passed, 17 files**.
- `npm run build` on that isolated release: exit 0, compiled successfully, all 226 static pages generated. Local new-post and refresh verifiers passed on port 3127; local canonicals correctly use the build's default `http://localhost:3000`, not the preview port.
- Production builds include Prisma generation, lint and TypeScript checks. Expected local database-unavailable fallback is not a successful production database test. Known pre-existing `MessagesPanel.tsx` Next Image lint warning remains.
- New-article verifier: HTTP 200, single H1, matching title/date, canonical, indexability, decision table, Article and three-item FAQ schema, WebP response and size, internal links, blog index/sitemap/RSS discovery.
- Refresh verifier: five refreshed articles plus six public surfaces, dateModified, canonical, CSV, table wrapper and the scheduled-publication gates.
- Both verifiers passed against production. Three required production markers passed together at **09:23:03 UTC**: empty EIN-checkout validation request returned 400; `/ein/apply` returned 200 with “Owner date of birth”; penalty calculator returned 200. No checkout/payment was created.
- Production browser check confirmed the spouse guide's actual hero image and canonical, all four cards in `/blog`, and the contractor page at 390px viewport/document width with its scroll region present. Temporary viewport override was reset.
- Desktop FBAR hero and mobile FBAR/contractor/ITIN layouts visually inspected. Four original artwork files inspected. Mobile overflow correction measured in the DOM.
- No payment submitted, customer application created, private database accessed, migration manually run, analytics setting changed, or production CLI deploy used.

## Contracts to preserve

1. Production is `origin/main`, deployed only by `git push origin main`. Never use a Vercel production CLI command.
2. Keep `multiple-related-parties-form-5472` scheduled for September 21 and `final-form-5472-closing-foreign-owned-llc` for September 28. They are not missing drafts to publish now.
3. The existing blog renderer already suppresses links to unpublished sibling slugs as plain text. The previous review flagged a potential issue based on source Markdown; rendered-page verification resolves it without date changes.
4. Form5472 Prep forwards eligible ITIN requests to an IRS-authorized CAA; do not say the company itself is a CAA or that every document can be authenticated remotely.
5. ITIN intake opens paid checkout before team review. Eligibility/scope uncertainty should go to `/contact` before purchase.
6. All invented examples must remain labeled. The CSV October row is a full-calendar-year illustration, not a transaction that occurred for a real customer.
7. Avoid claiming specialist FBAR/withholding/residency/personal-return work is included in the Form 5472 package. No licensed professional reviewed these new drafts; uncertain applications of tax rules were omitted or made explicit review triggers.

## Evidence and lane notes

`docs/marketing/2026-09-11-refresh-evidence.md`, `2026-09-11-itin-ein-evidence.md`, `2026-09-11-contractor-residency-evidence.md`, and `2026-09-11-fbar-shared-copy-evidence.md` contain source/claim mappings and maintenance boundaries. Qualitative demand comes from the preceding coverage review; no search-volume, ranking, or conversion increase is claimed.

Codex Orchestration selected three bounded native-agent lanes: compliance refresh and later independent read-only review (requested Terra/high), ITIN/EIN content (requested Terra/high), and contractor/residency content (requested Sol/high). The root integrated shared copy, FBAR, visuals, tests and release. Tool acceptance and completed agent outputs establish work completion; these requested routes are not independent runtime model attestation. No persistent routes, root model, provider settings, custom roles, or account access changed. Sales-blog-geo-aeo shaped source ledgers, original decision aids, scope-qualified CTAs and publication checks.

## Still open — owner decisions, not unshipped approved content

- Confirm whether ITIN pricing includes associated spouse joint Form 1040 preparation/election advice and the exact CAA document workflow. Current copy tells readers to confirm scope; it asserts neither inclusion nor exclusion.
- Confirm white-label availability. `/partners` still says it is not live; legacy partner articles may describe a broader offering. No new availability claim was added without confirmation.
- Qualified professional review is needed before expanding articles into fact-specific FBAR, withholding, treaty, personal-return or residency conclusions.
- A measured 28/56-day performance review requires authorized Search Console and conversion data. No monitoring automation was created.
- This is the approved targeted refresh, not a claim that every historical blog/landing page or every operational promise was re-audited.
