# form5472prep.com — Full Website Review & Upgrade Recommendations

Reviewed: July 2, 2026. Pages audited: homepage, /pricing, /ein, /itin, /blog (+ sample post), /start, /partners, /security, robots.txt, sitemap. Benchmarked against form5472.online (your most direct competitor) and the broader search landscape.

**Overall verdict:** The site is well-built — clear positioning, strong copy, clean funnel, good technical hygiene (canonical tags, robots.txt with AI-bot rules, sitemap, noindex on /start). The two biggest gaps are **trust proof** (no named accountant, no reviews, no company identity) and **top-of-funnel capture** (no lead magnet, thin content footprint). Your direct competitor is weaker on price transparency and UX but much stronger on trust signals — that's the battle to win.

---

## 1. Bugs & quick fixes (do this week)

1. **Old brand name leftover.** The blog post "What is IRS Form 5472?" says *"That's exactly what 5472formIRS does"* — an old brand name. Find/replace across all content.
2. **"/ year" vs "/ filing" inconsistency.** Hero card says `$199.00 / filing`; the plan cards say `$199.00 / year`. "/year" implies a subscription — contradicting "No subscription. Pay once per filing." Use "/ filing" everywhere.
3. **CTA copy mismatch on EIN & ITIN pages.** Final CTA says "Email us to get started" but the button links to /ein/apply and /itin/apply application forms. Change to "Start your EIN application".
4. **Nav "Pricing" links to /#pricing** (homepage anchor) even though a dedicated /pricing page exists. From any subpage this jumps users back to the homepage. Point nav to /pricing.
5. **Signature-flow contradiction.** Homepage Step 5: "Print, sign in pen, scan, upload back." Partner page: clients "sign in the browser — no printing or scanning." If browser e-sign works for partner clients, offer it to direct customers — print/scan is your single biggest funnel friction point. If wet ink is genuinely required for direct filings, explain why.
6. **"Upload bank statements (coming soon)"** in the hero flow — either ship it or remove the mention; "coming soon" inside a paid flow reads as unfinished. Also: the Security page describes **Plaid bank connectivity**, but the FAQ describes manual statement upload processed in memory. Align the two stories.
7. **Open Graph tags are homepage-wide.** /pricing, /ein, /itin all reuse the homepage og:title and og:url (`og:url: https://www.form5472prep.com` on every page). Blog posts appear to have **no og:image** at all — shared links show no preview card. Give every page unique OG tags + a generated OG image for posts.
8. **EIN page says "Ask about our bundle when you order"** — but no bundle exists as a product. Build an actual **EIN + Form 5472 bundle** SKU (e.g., $299 vs $348 separately). Natural upsell both directions.

---

## 2. Trust — your biggest gap vs. the competition

Your competitor form5472.online leads with: a **named CPA with a verifiable Virginia license #025991**, a license certificate image, Trustpilot 4.7 (249+ reviews, borrowed from parent brand), a Brooklyn address, a phone number, and 20 years of history. You currently offer an anonymous "qualified tax accountant," no reviews, no address, no phone, no About page.

1. **Name the accountant.** "Reviewed by a qualified tax accountant" → name, credential (CPA/EA), license number, and a link to the state board verification page. Photo if possible. This is the single highest-impact change on the whole site.
2. **Prove the CAA claim.** The ITIN page claims "IRS-authorized Certifying Acceptance Agent" — display the CAA agent name/office as it appears in the IRS CAA list, and link to it. Unverifiable credential claims can hurt more than help.
3. **Add an About page.** Legal entity name, who runs it, why it exists, address, support email, response time. Foreign founders are wiring money and uploading passports to a site with no humans on it.
4. **Collect third-party reviews now.** Trustpilot or Google Reviews, email request post-filing. Even 15 real reviews under your own brand beats their 249 borrowed ones. Add review schema once live.
5. **Real numbers in the hero.** "Trusted by foreign founders in 🇬🇧🇭🇰… +30 more" — add counts when defensible: "1,240 filings faxed to Ogden" beats flags.
6. **Upgrade the guarantee.** "Money-back if we fail to submit" only covers the fax going through. Competitor's "Zero-Penalty Guarantee" is actually just free IRS representation — leapfrog it: *"If the IRS assesses a penalty due to an error in our preparation, we handle the response at no charge"* (or stronger). Then market the comparison.
7. **Footer contact info.** Support email + company entity + address in the footer sitewide.

---

## 3. Conversion & funnel

1. **Free "Do I need to file?" checker.** You already have the 3-condition eligibility logic on the homepage — turn it into a 60-second interactive quiz with email capture for results. Competitor's free penalty calculator (no signup) is their main lead magnet and internal-link hub. Build both: eligibility quiz + **penalty exposure calculator** ($25k × years missed, with DIIRSP explanation).
2. **Deadline urgency.** No date-awareness anywhere. Add a dynamic banner: right now (July) that's *"Missed the April 15 deadline? File under DIIRSP before the IRS notices you first"* and a countdown to the **Oct 15 extended deadline**. Competitor runs a persistent countdown banner.
3. **State the Standard turnaround.** Rush = 24h, Premium = 12h, Standard = unstated. Ambiguity pushes people away, not upward. State it (e.g., 3–5 business days).
4. **"What happens after you pay" section.** Walk through the emails, review, signing, fax receipt. Reduces checkout anxiety; competitor does this well.
5. **Free next-year reminder for everyone.** Currently a Rush-tier perk. A March reminder email costs nothing and is your repeat-revenue engine — give it to all customers, keep "priority" perks for paid tiers.
6. **WhatsApp support.** Your audience is in India, UAE, HK, Brazil — WhatsApp beats email for trust and speed. Even a button that opens a chat.
7. **Show the full sample package.** You show the fax receipt (excellent, keep it). Add a redacted preview of the complete PDF package — cover letter, 1120, 5472, Part V statement — so buyers see the deliverable.
8. **Promote the Partner Program above the footer.** It's a real differentiator (agencies = repeat volume) but only lives in the footer. Add a homepage strip: "Agency or registered agent? File for all your clients from one dashboard."

---

## 4. SEO & content

**Working well:** unique titles per page, canonical tags, clean URLs, robots.txt explicitly allowing 18 AI crawlers, noindex on the funnel, sitemap present, solid long-form posts.

1. **Country pages are your open territory** — neither you nor the competitor has them as landing pages. You have UK, India, Canada, Amazon FBA as blog posts. Build **dedicated landing pages** (not blog posts) for: Germany, UAE, Singapore, Australia, Hong Kong, Brazil, Turkey, Pakistan — matching your hero flags. Template: requirements + country-specific FTIN details (like your PAN/SIN angle) + treaty notes + CTA.
2. **State pages:** "Form 5472 for Wyoming LLC / Delaware LLC / New Mexico LLC" — high-intent queries, you already name these states everywhere.
3. **Comparison & switch pages.** Competitor runs "switch from Firstbase/Doola" pages claiming $1,400+ savings. Their real price is $448–$547 after mandatory add-ons ($399 + required $49 submission + $99 "active entity" fee). Your $199 all-inclusive price destroys that — build "Form5472 Prep vs doola / Firstbase / Stripe Atlas / hiring a CPA" pages and say it plainly: *"Their $399 becomes $547 at checkout. Our $199 is $199."*
4. **Publishing cadence.** 8 posts total; competitor publishes weekly with a CPA byline. Target 2–4 posts/month. Ideas: Form 7004 extensions, Mercury/Wise + reportable transactions, LLC dissolution filings, "first year LLC checklist for non-residents," OBBBA 2026 changes.
5. **Structured data.** Verify/add JSON-LD: `Organization`, `Service`/`Product` with price, `FAQPage` on homepage + pricing FAQs, `Article` + author on posts, `BreadcrumbList`. Test with Google Rich Results.
6. **AEO/GEO (AI search).** robots.txt is already ahead of the curve. Add: an `/llms.txt` page, a named author entity for blog posts (ties into #2.1), and definition-style openers in FAQs so ChatGPT/Perplexity cite you. Competitor is actively optimizing here (their own /llms page, ai-content-policy meta).
7. **Remove or ignore `meta keywords`** — obsolete, and identical on every page (cosmetic only).

---

## 5. Product & pricing strategy

1. **Annual compliance subscription.** Competitor sells a $599–$798/yr bundle (registered agent + state filing + 5472). You could offer a lighter "Compliance Autopilot" — we store your details, remind you in March, pre-fill next year's filing, you confirm and sign (e.g., $179/yr prepaid). Converts one-time buyers into recurring revenue.
2. **Bundle SKUs:** EIN + 5472; ITIN + 5472; "New LLC starter" (EIN + first-year 5472 + BOI review).
3. **Dissolution/final filing service** — competitor sells a 3-pack (dissolution + final filing + EIN cancellation). Natural end-of-lifecycle product for the same audience.
4. **Multi-year DIIRSP positioning.** Your +$149/year is dramatically cheaper than competitor's ~$947/year for late filings. That's a marketing page, not just a pricing line: "Catch up 3 missed years: us $497, them ~$2,800."

---

## 6. Technical checks to run (can't verify from here)

- Lighthouse / PageSpeed on mobile — the fax-receipt image is served at w=3840; check it's responsive-sized.
- Google Search Console: confirm sitemap indexed, check coverage.
- Rich Results Test on homepage + a blog post (validates whether JSON-LD exists today).
- Broken-link crawl (e.g., Screaming Frog) after fixing the nav /#pricing issue.

---

## Priority roadmap

| Priority | Item | Effort | Impact |
|---|---|---|---|
| 🔴 Now | Fix bugs #1–8 (brand name, /year, CTAs, OG tags, nav) | Low | Credibility |
| 🔴 Now | Name the accountant + credentials; CAA proof | Low | Conversion |
| 🔴 Now | About page + footer contact + address | Low | Trust |
| 🟠 30 days | Browser e-sign for direct customers | Med | Conversion |
| 🟠 30 days | Eligibility quiz + penalty calculator (lead magnets) | Med | Leads |
| 🟠 30 days | Start collecting Trustpilot/Google reviews | Low | Trust |
| 🟠 30 days | Deadline banner (Oct 15 countdown / DIIRSP) | Low | Conversion |
| 🟡 60 days | Country landing pages (8) + state pages (3) | Med | SEO |
| 🟡 60 days | Comparison/switch pages (doola, Firstbase, CPA) | Med | SEO + conversion |
| 🟡 60 days | JSON-LD schema + /llms.txt + OG images | Low | SEO/AEO |
| 🟢 90 days | Compliance subscription + bundles | High | Revenue |
| 🟢 90 days | WhatsApp support, 2–4 posts/month cadence | Med | Trust + SEO |

---

## Sources

- [form5472prep.com homepage](https://www.form5472prep.com), [/pricing](https://www.form5472prep.com/pricing), [/ein](https://www.form5472prep.com/ein), [/itin](https://www.form5472prep.com/itin), [/blog](https://www.form5472prep.com/blog), [/partners](https://www.form5472prep.com/partners), [/security](https://www.form5472prep.com/security), [/start](https://www.form5472prep.com/start), [blog: What is Form 5472](https://www.form5472prep.com/blog/what-is-form-5472), [robots.txt](https://www.form5472prep.com/robots.txt)
- Competitor: [form5472.online](https://www.form5472.online/)
- Landscape: [Fiverr 5472 filing ($80)](https://www.fiverr.com/viswacpa/file-forms-5472-and-1120-for-foreign-owned-us-llc), [SDO CPA](https://www.sdocpa.com/form-5472-foreign-owned-business-filing/), [doola 5472 guide](https://www.doola.com/blog/learn-how-to-file-form-5472-foreign-owned-llcs/), [Stripe Atlas vs Firstbase vs Doola vs Bizee 2026](https://www.globalsolo.global/blog/stripe-atlas-vs-firstbase-vs-doola-pricing-comparison-2026), [LLC University 5472 guide](https://www.llcuniversity.com/irs/form-5472-foreign-owned-llc/), [IRS: About Form 5472](https://www.irs.gov/forms-pubs/about-form-5472)
