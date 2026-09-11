# Form5472 Prep — Brand Kit

Single copy-paste source for creating or syncing external profiles (LinkedIn,
X, Facebook, Crunchbase, Wikidata, directories) with byte-identical brand
facts. All facts below are quoted or paraphrased from the codebase — no
invented facts. Cells with no on-record value are marked `TBD (owner)`.

Sources: `docs/reviews/2026-09-11-platform-geo-audit.md` Part C, `src/lib/seo.ts`,
`src/app/(marketing)/about/page.tsx`, `src/lib/faq.ts`, `src/lib/pricing.ts`,
`tailwind.config.ts`.

## 1. Canonical identity table

| Field | Value | Source |
|---|---|---|
| Brand name (exact spelling) | **Form5472 Prep** | `src/lib/seo.ts:6` — 527 consistent occurrences sitewide, 0 spelling variants (audit Part C) |
| Legal name | Form5472 Prep | `src/app/(marketing)/page.tsx:833` (homepage inline node only — **not yet in shared `organizationNode()`**, audit flags this as an inconsistency to fix in code, not in this kit) |
| Website | `https://www.form5472prep.com` | `SITE_URL = env.appUrl`, "always the www form" — `src/lib/seo.ts:7` |
| Founded | 2025 | `src/app/(marketing)/page.tsx:837` (homepage inline node only, same gap as legal name) |
| Support email | `support@form5472prep.com` | `ORG_EMAIL` — `src/lib/seo.ts:10` |
| Phone | TBD (owner) | No Organization telephone exists. The only phone-shaped value in `src/lib/seo.ts:9` is the IRS Ogden fax line, explicitly commented "NOT our phone; never emit as Organization.telephone" — never use it as a contact number |
| Postal address | TBD (owner) | No `PostalAddress` found anywhere in `src/` or `content/` (audit Part C) |
| Logo — full wordmark (**canonical**) | `https://www.form5472prep.com/logo.svg` (260×56, 1.19 KB, SVG) | `organizationNode()` default, `src/lib/seo.ts:66` — this is the shared helper every page except the homepage uses, so it is the canonical logo for profile syncing |
| Logo — mark only (homepage override, non-canonical) | `https://www.form5472prep.com/logo-mark.svg` (64×64, 0.53 KB, SVG) | `src/app/(marketing)/page.tsx:834` — only the homepage overrides to this; use it for square-avatar slots (X, Facebook profile photo) if a platform demands square art, otherwise prefer the full wordmark |
| Primary colors | Accent `#1e3a8a` (deep blue) · Ink `#0e1b33` (near-black navy) · Paper `#fbfaf7` (warm off-white) | `tailwind.config.ts` — `colors.accent.DEFAULT` / `colors.ink.DEFAULT` / `colors.paper.DEFAULT` |
| Category | US tax information-return preparation service | Factual description of the service (Form 5472 / pro forma 1120 filing) |
| Service area | Non-US owners of US LLCs, worldwide | Customer base per site copy; the *legal* `areaServed` schema value is `{"@type":"Country","name":"United States"}` (the LLC's jurisdiction, set per-page — `page.tsx:838`, `ein/page.tsx:327`, `itin/page.tsx:330`, `partners/page.tsx:247`), not the customer's location |

## 2. Tagline & descriptions

**One-line tagline** (verbatim H1, also the JSON-LD `slogan`):
> Flat-rate Form 5472 filing. No hidden fees.
— `src/app/(marketing)/page.tsx:216-219,846`

**50-word description:**
> Form5472 Prep prepares and files IRS Form 5472 and the pro forma Form 1120
> package for foreign-owned US single-member LLCs with reportable
> transactions. Every package is reviewed by a qualified tax accountant
> before submission, faxed to the IRS Ogden PIN Unit, and documented with a
> timestamped transmission receipt.

**150-word description** (includes the required "not a CPA firm" sentence):
> Form5472 Prep prepares and files IRS Form 5472 and pro forma Form 1120
> packages for foreign-owned U.S. single-member LLCs treated as disregarded
> entities with reportable transactions during the tax year. The package —
> Form 5472, pro forma Form 1120 marked "Foreign-Owned U.S. DE," and
> supporting statements — is reviewed by a qualified tax accountant before
> submission, then faxed to the IRS Ogden PIN Unit with a timestamped
> provider transmission receipt kept as evidence. Two turnaround tiers are
> available: Standard, ready in 5-7 business days, and Express, ready within
> 3 business days; both include the same documents and accountant review.
> Separate EIN and ITIN application services are offered when those tax IDs
> are genuinely needed, with eligible ITIN applications forwarded to an
> IRS-authorized Certifying Acceptance Agent for document review. Form5472
> Prep is not a CPA firm and does not provide tax advice; responsibility for
> the accuracy of submitted information stays with the customer.

## 3. Services (with prices)

- **Standard filing** — $149, ready in 5-7 business days. Form 5472 + pro
  forma 1120, accountant-reviewed, IRS fax delivery + receipt included.
- **Express filing** — $199, ready within 3 business days. Same documents
  and accountant review, plus priority email support.
- **Additional past tax year** — $99 flat per year, added to either tier,
  disclosed up front, no per-page fax surcharge.
- **EIN application** — $149. Form SS-4 by phone, for LLC owners without a
  US SSN or ITIN; the IRS online tool isn't available to them.
- **ITIN application** — $349. Form W-7 support; eligible applications are
  forwarded to an IRS-authorized Certifying Acceptance Agent for document
  review.

*Prices verified against `src/lib/pricing.ts:44-77` (`EIN_PRICE_CENTS =
14900`, `ITIN_PRICE_CENTS = 34900`, `TIERS.standard.priceCents = 14900`,
`TIERS.express.priceCents = 19900`) — matches the $149/$199/$149/$349
figures used throughout this kit.*

## 4. Profile checklist

Character limits below are typical platform norms as of this writing —
**re-check the live limit in each platform's own editor before pasting**,
since platforms change these without notice and this kit does not do web
research.

| Platform | What to create | Name | Tagline / one-liner | Description (length) | Logo | Website URL | Status |
|---|---|---|---|---|---|---|---|
| LinkedIn Company Page | New company page | Form5472 Prep | "Flat-rate Form 5472 filing. No hidden fees." | 150-word description (~2,000-char limit) | Full wordmark `/logo.svg` (raster export if SVG rejected) | `https://www.form5472prep.com` | |
| X / Twitter | New profile | Form5472 Prep (handle TBD (owner)) | One-line tagline (~160-char bio limit) | 50-word description trimmed to fit bio | Mark-only `/logo-mark.svg` as square avatar; wordmark as header | `https://www.form5472prep.com` | |
| Facebook Page | New business page | Form5472 Prep | One-line tagline | 50-word description (~255-char "About" limit) | Mark-only `/logo-mark.svg` as square profile photo | `https://www.form5472prep.com` | |
| Crunchbase | New organization profile | Form5472 Prep | One-line tagline | 50-word description in "Short Description"; 150-word in "About" | Full wordmark `/logo.svg` | `https://www.form5472prep.com` | |
| Wikidata | *Optional, deletion risk* — only if the site meets Wikidata's own notability bar on its own merits; do not create speculatively | Form5472 Prep | n/a | n/a | n/a | `https://www.form5472prep.com` | |
| Google Business Profile | **NOT recommended** — no physical location to verify | — | — | — | — | — | |
| Trustpilot | Already exists — link only | Form5472 Prep | — | — | — | `https://www.trustpilot.com/review/form5472prep.com` (`TRUSTPILOT_PROFILE_URL`, `src/lib/seo.ts:11`) | Live |
| Bing Places | Same caveat as Google Business Profile — no physical location to verify | — | — | — | — | — | |

## 5. `sameAs` handoff

Current live value — `ORG_SAME_AS` in `src/lib/seo.ts:12`:

```js
export const ORG_SAME_AS = [TRUSTPILOT_PROFILE_URL];
```

Target array once new profiles exist — add each URL **only after that
profile is live and shows the same name and logo as this kit**, one at a
time, never all at once speculatively:

```json
[
  "https://www.trustpilot.com/review/form5472prep.com",
  "https://www.linkedin.com/company/<slug>",
  "https://x.com/<handle>",
  "https://www.facebook.com/<slug>",
  "https://www.crunchbase.com/organization/<slug>",
  "https://www.wikidata.org/wiki/<Q-id>"
]
```

Rule: a placeholder above is not a URL to paste into code — replace it with
the real profile URL and delete the row from this list only once the
profile page itself matches this kit's name, logo, and description.

## 6. Consistency rules

1. **Same name spelling everywhere**: `Form5472 Prep` — never "Form 5472
   Prep" (extra space) or "Form5472Prep" (no space). All three variants were
   checked; only the correct form appears in the codebase today (audit Part
   C) — keep that streak on every external profile.
2. **Same logo file**: the full wordmark (`logo.svg`) is canonical for any
   platform that accepts a rectangular logo; use the mark-only file
   (`logo-mark.svg`) only where a platform forces a square avatar.
3. **Same description opening sentence** on every profile: "Form5472 Prep
   prepares and files IRS Form 5472 and the pro forma Form 1120 package for
   foreign-owned US single-member LLCs with reportable transactions." — do
   not paraphrase this differently per platform.
4. **Same support email everywhere**: `support@form5472prep.com`. Never
   substitute the EIN/ITIN notification address or any other inbox.
5. Keep this kit's wording plain and unembellished on every external
   profile: no promise-of-outcome language, no professional-credential
   claims beyond what Section 1 states, and no possessive claim of the
   Certifying Acceptance Agent relationship — describe it exactly as
   Section 3 does ("forwarded to an IRS-authorized Certifying Acceptance
   Agent").

## Open items for the owner

`TBD (owner)`: phone number, postal address, X/Twitter handle, LinkedIn
company slug, Facebook page slug, Crunchbase organization slug, Wikidata
Q-id (contingent on notability). None of these exist in the codebase; do not
guess them.
