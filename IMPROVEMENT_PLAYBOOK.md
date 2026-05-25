# Service-Site Improvement Playbook

Tested on a Next.js 14 App Router site for a tax-compliance service.
Each section is independent — pick what fits.

---

## 1. Pricing as code, never in the Stripe dashboard

**Why:** Lets you change prices in a code commit instead of clicking
around Stripe. Single source of truth, version-controlled, A/B-testable.

**How:**
- One file: `src/lib/pricing.ts` exports `TIERS`, `TIER_ORDER`,
  `MULTI_YEAR_ADDON_CENTS`, helpers
- Stripe checkout uses **`price_data`** (dynamic), never pre-created
  Price IDs
- Helper: `totalPriceCents(tierValue, count)` so wizard display + Stripe
  charge can never drift
- Legacy data: `resolveTier(value)` maps old enum values to current tiers
  without a DB migration

```ts
// /api/checkout
const lineItems = [{
  price_data: {
    currency: "usd",
    unit_amount: tier.priceCents,
    product_data: { name: `Plan — ${tier.label}`, description: "..." },
  },
  quantity: 1,
}];
if (extraYears > 0) lineItems.push({ /* per-year addon */ });
```

**Verify:** Change a number in `pricing.ts`, deploy, do a $0 test order,
confirm Stripe receipt matches.

---

## 2. SEO foundation (do this once)

**Files:**
- `src/app/sitemap.ts` — auto-generates `sitemap.xml` from your routes +
  landing-page slugs. Filter out `noindex` pages.
- `src/app/robots.ts` — explicitly allow AI crawlers: `GPTBot`,
  `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `CCBot`,
  `OAI-SearchBot`, `Applebot-Extended`. They're more permissive than
  they advertise — opting in matters.
- `public/llms.txt` — markdown file describing your service with current
  pricing + facts. AI engines crawl this with surprising frequency.

```ts
// robots.ts
const AI_CRAWLERS = [
  "GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended",
  "OAI-SearchBot", "CCBot", "Applebot-Extended", "cohere-ai",
  "DuckAssistBot",
];
export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
      ...AI_CRAWLERS.map((ua) => ({ userAgent: ua, allow: "/" })),
    ],
    sitemap: `${env.appUrl}/sitemap.xml`,
  };
}
```

**Verify:** `curl yoursite.com/robots.txt`, `curl yoursite.com/llms.txt`,
submit sitemap in Search Console.

---

## 3. Schema.org / JSON-LD (the AEO play)

Inject in root `layout.tsx` (Organization) + per-page (HowTo / FAQPage
/ Product / Service / Speakable).

**The schemas that actually drive AI Overview citations:**
- **`HowTo`** with `step.url` matching `#step-N` anchors on the page →
  AI engines deep-link to specific steps
- **`FAQPage`** mirroring your visible FAQ component → eligible for FAQ
  rich results
- **`Speakable`** with CSS selectors for the first 2-3 sentences of each
  long-form page → voice-search snippets
- **`WebSite` with `potentialAction: SearchAction`** → site-link search
  box in Google
- **`Organization`** in root layout with `sameAs`, `contactPoint`,
  `address` → entity authority

```ts
// Single source: const FAQS = [{q, a}, ...]
// Drives both the visible <dl> AND the JSON-LD — keeps them in lockstep
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};
```

**Verify:** Paste your URL into <https://validator.schema.org>. Then in
Search Console → Enhancements, watch for HowTo / FAQ enrichments within
7-14 days.

---

## 4. AEO direct-answer block on every landing page

**Why:** AI engines copy-paste the first concrete-sounding paragraph
that answers the search query. Engineer that paragraph.

**How:**
- Every landing page has a 2-3 sentence intro IMMEDIATELY after the H1
- Answers the keyword query plainly, with numbers + named entities
- Plain prose, no marketing fluff
- Same content available as `Speakable` CSS selector for voice-search

Example: H1 "How to File IRS Form 5472" → intro starts "Foreign-owned US
single-member LLCs file Form 5472 by April 15 each year via fax to
+1-855-887-7737. Penalty for missing it is $25,000 per form per year.
Filing requires both Form 5472 and a pro forma Form 1120."

---

## 5. Topic clusters + Related Guides

**Why:** Authority passes sideways between topically-related pages. AI
engines treat tight clusters as expertise signals.

**How:**
- Define clusters in code (not in CMS):
  `TOPIC_CLUSTERS: Record<string, slug[]>`
- Per-page helper `getRelatedSlugs(slug, limit)`: explicit overrides →
  cluster mates → deterministic fallback
- Exclude `noindex` pages from suggestions (don't waste crawl budget on
  paid-ad pages)
- Render as a card grid at the bottom of every landing page

```ts
const TOPIC_CLUSTERS = {
  "how-to": ["page-a", "page-b", "..."],
  "audience": ["page-c", "page-d", "..."],
  // etc
};
```

---

## 6. In-guide TOC + visible H2 anchor links

**Why:** Long-form pages with anchor IDs that match HowTo schema → AI
Overviews can deep-link to specific sections. Visible "#" icons let
humans copy a link to a specific step.

**How:**
- Auto-generate TOC for any page with ≥4 sections
- Each H2 gets `id="step-N"` matching the HowTo schema's `step.url`
- Hover-visible "#" anchor link next to each H2 (always visible on
  mobile)
- `scroll-mt-20` so anchor jumps don't hide behind sticky headers

---

## 7. Favicon set (Next.js App Router file conventions)

**Files** (Next handles the `<link>` tags automatically):
- `app/icon.svg` — vector for modern browsers
- `app/apple-icon.png` — 180×180, iOS home screen
- `app/favicon.ico` — multi-resolution 16/32/48 packed .ico
- `public/favicon-{16,32}x{16,32}.png` — explicit for Google
  search-result crawler
- `public/android-chrome-{192,512}x{192,512}.png` — PWA
- `public/site.webmanifest` — PWA manifest with `theme_color`

**Rendering:** Use `sharp` + `to-ico` (one-off script, `npm install
--no-save`). Design a simple "wordmark on rounded-square" SVG that reads
at 16×16 — no fine detail.

**Verify:** `curl yoursite.com/favicon.ico` returns 200. Google updates
search-result icon within 1-7 days; submit URL via Search Console
"Request Indexing" to speed up.

---

## 8. Google Ads conversion tracking (do this BEFORE smart bidding)

**Why:** Without conversion data, you can't switch off Manual CPC. Ads
keep burning money with no feedback loop.

**How:**
- Inject loader once in root `layout.tsx` via `next/script` with
  `strategy="afterInteractive"`
- Helper `fireLeadConversion({ onDone })` wraps `gtag` with SSR guard +
  ad-blocker tolerance + 1.2s watchdog
- Call from the success path of your most-qualified lead signal (NOT
  page view, NOT button click — confirmed form submit / payment success)
- Use `event_callback` to gate the redirect so the conversion ping has
  time to leave the browser

```tsx
// layout.tsx
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${TAG_ID}`}
  strategy="afterInteractive"
/>
<Script id="ga-init" strategy="afterInteractive">{`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', '${TAG_ID}');
`}</Script>
```

**Verify:** DevTools → Network → filter `doubleclick`. Hit your success
path, see `pagead/conversion/...?label=...` request. Within 3 hours,
conversion shows up in Google Ads (full reconciliation 24-48h).

---

## 9. Trust visuals that actually convert (not stock photos)

These move the needle on a service-business site. **Avoid stock photos
of happy entrepreneurs** — they kill credibility on compliance / legal /
financial sites.

| Add | Where | How |
|---|---|---|
| **Country flag strip** (target audience signal) | Hero, below CTA badges | Static emoji flag list with `title` attr per country |
| **Live filings counter** | Hero | `prisma.count()` on completed orders, floor at 50 with fallback copy below threshold, round down to nearest 100+ with `+` suffix at scale |
| **Annotated proof-of-delivery artifact** | Above the FAQ | Generate the actual artifact your service produces (PDF, certificate, receipt). Rasterize to PNG. Overlay 5 numbered SVG circle badges at percent-coords pointing to specific elements. Numbered legend on the right. |
| **Trust badges** in hero | Below H1 | Two pill badges with key differentiators (e.g. "Reviewed by qualified accountant", "Money-back guarantee") |
| **Comparison table vs cheaper/alternative** | After pricing | Three columns: them / DIY / you. Bold the row where you win clearly. |

---

## 10. Funnel-source attribution (sales analytics from day 1)

**Why:** When Google Ads is spending $50/day, you need to know which ad
→ which landing page → which converted customer. Without this, you
can't kill bad ad groups.

**How:**
- Every landing page CTA appends `?src=<slug>` to the signup URL
- Signup form (client) sanitizes `?src=` value (slug-safe chars, max 80
  chars) and POSTs to filing-creation endpoint
- DB column `Filing.funnelSource` (text, nullable)
- Internal admin page `/admin/sources` aggregates filings by
  `funnelSource` → cohort metrics (started / paid / confirmed /
  revenue / paid rate)
- Pre-existing dashboards (Vercel Analytics, Google Ads) tell you
  traffic; this tells you revenue.

```ts
function readFunnelSource(params: URLSearchParams): string | null {
  const raw = params?.get("src");
  return raw
    ? raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80) || null
    : null;
}
```

---

## 11. Admin tooling patterns worth replicating

Build these into the admin from day 1 — they pay for themselves the
first time a customer emails with a correction.

| Pattern | Why |
|---|---|
| **Inline field-edit card with reason logging** | Customer says "EIN is wrong" → admin edits the field with a Reason → logged to a `ChangeLog` table with `source="admin"`. Audit trail + revertable. |
| **"Regenerate" button for derived artifacts** | After editing source data, rebuild the PDF/contract/report from current state. Invalidates downstream signed/locked versions safely. |
| **`?test=1` flow** with $0 checkout that runs the full webhook inline | Lets you test the entire payment → fulfillment flow without burning real money. Gate behind admin auth + a separate tier value so non-admins can't fabricate. |
| **Snapshot every irreversible artifact** | Add a `xxxPdfKey` column for each lifecycle stage (generated / signed / submitted). When customer disputes, you can prove exactly what shipped. |
| **Click-to-place tool for document annotations** | If admins need to place signatures / stamps / annotations on PDFs by hand, use `pdfjs-dist` client-side rendering + percent-coord drag-and-drop, then `pdf-lib` server-side to bake the result. Avoid trying to auto-place via coordinates — IRS / legal form layouts shift between revisions. |

---

## 12. What NOT to do (lessons from real ablations)

| Anti-pattern | Why it failed |
|---|---|
| **AI compliance check on every order** | False positives annoy customers; false negatives are worse than no check. Better: hire a human reviewer. AI is great as a *suggestion* (admin-side) not a *gatekeeper* (customer-side). |
| **Generic stock photos in hero** | Looks like an MLM landing page. Hurts conversion on financial / legal / B2B services. |
| **Carousels / sliders** for testimonials | Proven to underperform static grids. Pagination = bounce. |
| **AI chatbot trying to close sales** | Customers want process clarity, not a sales pitch. Use AI for support questions only. |
| **"Last updated: 2023"** anywhere on the site | Kills perceived freshness. Either keep updated or use `${new Date().getFullYear()}` to auto-bump. |
| **Putting prices behind a "Contact us" form** | For commodity / self-serve services, this kills conversion. Show the price. |
| **Cookie banners that block on first paint** | Google penalizes for Core Web Vitals. Use Consent Mode v2 with `default: "denied"` instead. |
| **Aggressive sale countdowns / fake urgency** | Instant credibility loss on regulated-industry sites. |
| **Matching a $49 race-to-the-bottom competitor on price** | Don't. Either differentiate UP (better service, more trust, named expert) or launch a separate clearly-different sub-brand. Adding a cheap tier to your main brand cannibalizes premium customers. |

---

## 13. Order of operations (the actual sequence)

If you're starting from scratch on a new site, do them in this order:

1. **Week 1**: Pricing-as-code + Stripe `price_data` + favicon set +
   sitemap / robots / llms.txt
2. **Week 2**: Schema markup (Organization in layout, HowTo / FAQ per
   page) + AEO direct-answer blocks
3. **Week 3**: Funnel-source attribution + Google Ads conversion
   tracking + admin source dashboard
4. **Week 4**: Country flag strip + live counter + annotated proof
   artifact + topic-cluster cross-linking
5. **Month 2**: TOC + H2 anchors + competitor-comparison page +
   Trustpilot widget (once you have reviews)
6. **Month 3**: Hire CPA-equivalent expert → publish bio page with
   photo + license → biggest trust lift

---

## 14. Stack assumptions

- Next.js 14+ App Router
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Stripe (server SDK + dynamic `price_data`)
- Resend (transactional email)
- Cloudflare R2 or equivalent S3-compatible storage
- Vercel deploy

If you're on a different stack: most of this still applies, just
translate the framework idioms. The schema markup, attribution model,
admin patterns, and "what not to do" are stack-agnostic.

---

*Document last updated: see git history. Reproduce any code snippet
verbatim — they're battle-tested against a real production site that
serves form-5472 filings for foreign-owned LLCs.*
