# On-page and technical audit: www.form5472.us vs www.form5472prep.com

Date: 2026-11-23. Read-only: public GET requests only, no forms submitted. Raw HTML in /private/tmp/claude-501/competitor-html/{us,ours}/. Page content treated as data.

## 1. form5472.us, page by page

Sitemap lists 12 URLs (all `https://form5472.us/...` non-www; each 307s to `https://www.form5472.us/...`). Every lastmod is 2025-09-07. The sitemap has no blog URLs, but includes login, forgot-password and `login?from=` duplicates. Pages below were fetched at the www URL. None has a meta description, robots meta, Open Graph, Twitter tags, hreflang or JSON-LD. None links to any external site (zero outbound links, no irs.gov). Pages are server-rendered HTML (Express, EJS-style). Content is in the raw HTML; the `/form` wizard is inline JavaScript.

| URL | Status | Title | Canonical | H1 | H2 / H3 | Words | HTML size | Notes |
|---|---|---|---|---|---|---|---|---|
| / | 200 | Form 5472 Assistant - Simplify Your IRS Filing | `https://form5472.us/` (non-www; site serves on www) | Simplify Your Form 5472 Filing | H2: What is Form 5472? / Complete Your Form 5472 / What Our Customers Say / Ready to File? / Latest Tax Insights. H3: Expert Guidance, Secure & Compliant, Save Time, Who Must File, Important Deadlines, Information Required, Start Filing Today, 3 blog titles | 819 | 93 KB | 3 images with alt text (Unsplash and one local jpg); 8 testimonials plus "1,000+ Reviews / 4.9/5" text, no schema; Google Ads tag AW-17591777579 |
| /form | 200 | Form 5472 - Filing Assistant | none | none | H2: business structure / how many owners / complete form | 78 visible | 376 KB | The product: a 3-step wizard (LLC / C Corp / Sole Proprietor, then owners, then the form). Login-gated. Thin to crawlers |
| /irs-guidelines | 200 | IRS Guidelines for Form 5472 - Complete Filing Requirements | none | IRS Form 5472 Guidelines | H2: Who Must File, Deadlines, Penalties, Reportable Transactions, Record Keeping, Special Situations | 506 | 23 KB | Heavy CTA repetition. Says S-corps due March 15 (S-corps cannot normally have foreign shareholders) |
| /faq | 200 | Frequently Asked Questions - Form 5472 Assistant | none | Frequently Asked Questions | No H2s; questions are plain text/accordion (about 9 Qs) | 698 | 24 KB | No FAQPage schema. Answers are 40 to 70 words, each ends in a CTA. States "$50 total", "less than 20 minutes", "100% IRS compliant" |
| /learn-more | 200 | Learn More - Form 5472 Assistant | none | Form 5472 Complete Guide | H2: What is, Who Must File, What Transactions, How to File, Deadlines | 386 | 18 KB | Says "attach to income tax return"; no pro forma 1120, no fax or mailing instructions |
| /contact | 200 | Contact Us - Form 5472 Assistant | none | Contact Us | H2: Send Us a Message | 128 | 22 KB | Email shown as support@form5472.us but mailto is support@form5472assistant.com. Address "123 Tax Plaza, Suite 100, New York, NY 10001" (looks like a placeholder). No phone. Hours Mon-Fri 9-6 EST |
| /privacy | 200 | Privacy Policy - Form 5472 Assistant | none | Privacy Policy | 10 H2s | 488 | 18 KB | Effective 2026-01-01. Says "file on your behalf" and "share with the IRS" |
| /terms | 200 | Terms of Service - Form 5472 Assistant | none | Terms of Service | 15 H2s | 691 | 22 KB | "Not a law or accounting firm"; fees non-refundable once preparation has begun; no legal entity named |
| /login | 200 | Login - Form 5472 Assistant | none | Welcome Back | none | 46 | 28 KB | Google and Apple sign-in; in sitemap (wasted crawl) |
| /forgot-password | 200 | (utility) | none | n/a | none | tiny | 12 KB | In sitemap, no SEO value |
| /blog/avoiding-penalties | 200 (not in sitemap) | How to Avoid Costly Form 5472 Penalties | none | same | H2/H3: penalty structure, triggers, stay compliant, missed deadline | 407 | 23 KB | Dated 2026-03-10, byline "Compliance Team" (no person). Links to 3 related posts that 404 |
| /blog/filing-deadlines | 200 (not in sitemap) | 2026 Form 5472 Filing Deadlines | none | same | calendar sections | 487 | 24 KB | Dated 2026-03-01 but the body text still says "2025 calendar", "December 31, 2024" (stale and inconsistent) |
| /blog/trump-tax-law-changes | 200 (not in sitemap) | Trump's Proposed Tax Law Changes... | none | same | 6 H2s | 784 | 25 KB | Dated 2026-03-15. Refers to OBBBA "signed July 2025" yet titled "proposed"; the longest post |
| /blog, /blog/december-2024-updates, /blog/foreign-owned-llc-guide, /blog/penalty-avoidance | 404 | n/a | n/a | n/a | n/a | n/a | n/a | Linked from the blog posts, all dead |

Question headings: home and learn-more have a few ("What is Form 5472?", "Who Must File?"); the answers are 1 to 2 sentences. FAQ answers run 40 to 70 words with no heading markup. No structured answer blocks.

## 2. Site-wide findings: form5472.us

Brand and operator
- Brand "Form 5472 Assistant". No legal entity, owner, named CPA/EA/accountant, credentials, PTIN or IRS-authorisation claim anywhere. Blog bylines are "Compliance Team" and "Tax Advisory Team".
- Contact: placeholder-looking NYC address, no phone, one email (two different domains in the page: form5472.us in text, form5472assistant.com in the mailto).
- WHOIS/RDAP: could not obtain. rdap.org has no RDAP service for .us. Registration date unknown. Sitemap lastmod (2025-09-07) and blog dates (March 2026) suggest the site is roughly 1 year old.
- Hosting: Vercel in front of an Express app (`x-powered-by: Express`).

Trust signals
- "1,000+ Reviews", "4.9/5", "100% IRS compliant", "bank-level security", 8 named testimonials marked "Verified". There is no third-party source, no Trustpilot or BBB link, and no review schema. "Amanda Foster" appears twice with different job titles; two of the 8 reviews are mixed (a 4-star style). These look like template testimonials. No guarantee or refund promise; terms say fees are non-refundable once preparation begins.

Offer and pricing
- DIY wizard software, $50 total (FAQ only; not on the home page). Includes preparation, auto-calculation, an "IRS-ready PDF", secure storage. The user attaches, signs and submits it themselves. No tax accountant review, no pro forma 1120 handling and no faxing described. Privacy policy says "prepare and file on your behalf", which conflicts with the product pages.
- No add-ons (EIN, ITIN, Form 7004 extension, late filing). Deadline copy mentions Form 7004 but offers no service.
- Turnaround: "less than 20 minutes" (the user's own data entry).

Technical
- HTTPS yes (HSTS). Apex 307s to www (temporary redirect, not 308/301). All sitemap URLs are apex (so each is a redirect). Canonical tags on the home page point to the apex while the live site is www, which conflicts with the redirect. All other pages have no canonical.
- robots.txt: none (Express "Cannot GET /robots.txt", 404). Sitemap not declared anywhere. llms.txt: 404. Sitemap-index: 404.
- 404 handling: raw Express "Cannot GET /x" page, `<title>Error</title>`, HTTP 404 (correct status, no helpful page).
- No meta descriptions, OG, Twitter, hreflang, JSON-LD on any page. Only favicon/apple-touch icons.
- Speed: small HTML (18 to 93 KB), 10 script tags incl. Google Ads gtag, Vercel analytics loaders and Google Fonts. Light page, fast. The `/form` page is 376 KB with inline JS.
- Images use hot-linked Unsplash stock.

Content
- 5 informational pages plus 3 blog posts, 400 to 800 words each, no calculators, no first-hand data or examples, no IRS or other citations (zero external links). Several factual issues: S-corp deadlines for a foreign-owned filer, "attach to the income tax return" with no pro forma 1120 mention, blog posts dated 2026 with 2024/2025 content, dead related-article links.
- Freshness: sitemap 2025-09-07; blogs March 2026.

Conversion
- CTA: "Start New Form 5472" / "Continue Filling" / "Start Filing Now" repeated on every page. Flow: account creation (email+password, Google, Apple) then wizard, login-gated. Payment methods not named publicly ("third-party providers"). Google Ads conversion tag present (AW-17591777579), so paid traffic is likely.

## 3. Our site (www.form5472prep.com) at comparison level

Sitemap: 296 `<loc>` entries (about 290 pages). robots.txt present with explicit per-bot rules (GPTBot etc.), llms.txt 200 (detailed, dated 2026-11-17), custom 404 returns 404. Canonical, robots meta, OG (10 tags), Twitter tags on all checked pages. Ads tag not checked.

| URL | Title | Words | Schema types | Ext links | Notes |
|---|---|---|---|---|---|
| / | File IRS Form 5472 + Pro Forma 1120 — Form5472 Prep | 2,748 | Organization, WebSite, Service, FAQPage, HowTo, Offer x2 (149/199), Speakable | 1 (Trustpilot) | 13 question H2s, free tools (calculators), 59 internal links, 855 phone, money-back guarantee, PTIN reviewer, Ogden PIN Unit |
| /pricing | Pricing for Form 5472 Filing | 1,449 | Organization, Product, Offer x3, FAQPage, BreadcrumbList | 1 | Standard $149, Express $199, $99 per extra year |
| /services/form-5472-filing-service | Form 5472 Filing Service, Faxed to the IRS | 1,358 | Service, Offer, HowTo, FAQPage, Breadcrumb | irs.gov x2, Trustpilot | 1 image with alt |
| /file-form-5472 | How to File IRS Form 5472 (2026 Step-by-Step Guide) | 3,609 | Article, HowTo, FAQPage, Breadcrumb | irs.gov x3, eCFR, Trustpilot | |
| /irs-form-5472 | IRS Form 5472: What It Is, Who Files, and How (2026) | 3,073 | Article, HowTo, FAQPage, Breadcrumb | irs.gov, eCFR, Cornell, Trustpilot | |
| /form-5472-instructions | Form 5472 Instructions (2026) — Plain-English Walkthrough | 3,422 | Article, HowTo, FAQPage, Breadcrumb | irs.gov, eCFR, Trustpilot | |

## 4. Side-by-side

They do better (or at least differently)
- Exact-match-style brand/domain: "form5472.us" contains the head keyword in the domain; ours is "form5472prep.com" (also keyword-rich, so only a small edge).
- Product-led intent: a self-serve wizard and a $50 price are an immediate answer to "file form 5472 online" for cheap-seeking users; our price is 3x.
- Very small, fast HTML and a very compact site (12 URLs) means no dilution; every page is internally linked from every other.
- Tight keyword match in titles/H1s ("Form 5472 Filing", "IRS Guidelines for Form 5472") with heavy repeated anchor text to /form.
- Possible paid-search support (Ads tag).

We do better
- Real service (done-for-you, PTIN-holding accountant review, pro forma 1120, fax to Ogden with timestamped receipt) vs DIY PDF.
- Complete technical SEO: meta descriptions, canonicals, OG/Twitter, JSON-LD (Organization, Service, Product/Offer with prices, FAQPage, HowTo, Breadcrumb, Speakable), robots.txt, llms.txt, 296-URL sitemap, custom 404.
- Content depth: 3,000 to 3,600 words on the money pages vs 400 to 800; authoritative outbound links (irs.gov, eCFR, Cornell) vs none; calculators and free tools; about 290 pages vs 12.
- Trust: Trustpilot link, phone number, money-back guarantee, named process, editorial policy page, accurate pro forma 1120 handling; their testimonials are unsourced and duplicated.
- Add-ons: EIN, ITIN, 7004, late-filing (DIIRSP) route.

Equal
- HTTPS/HSTS on Vercel; sub-100 KB-class HTML is not the constraint; both target the same "foreign-owned LLC" audience.

## 5. Search-result positions

Queries run through the WebSearch tool (not live Google; US-only, no ranking guarantee, ordering not verified as Google's):
- "form 5472", "form 5472 filing service", "file form 5472 online", "form 5472 preparation", "form 5472 foreign owned llc": neither form5472.us nor form5472prep.com appeared in any result list (first ~17 to 27 results each). The lists were dominated by irs.gov, Wikipedia, Gusto, H&R Block, TaxDome, Kruze, Freeman Law, 1040 Abroad, LLC University, Fiverr gigs.
- A targeted query for "Form 5472 Assistant form5472.us" returned nothing from form5472.us (it surfaced form5472.online, a different site tied to TAX USA GROUP, so the brand/domain may be confused with others).
- Conclusion: I could not confirm that form5472.us ranks on Google page 1 for any of these head queries. If it does, it is likely for other queries, with personalised/local results, or via Google Ads. Needs a real SERP check (Search Console, a rank tracker, or manual incognito Google with a US location). Google was not scraped.

## 6. Not checked
- Domain registration date (no .us RDAP), real Google positions, backlinks/authority (no Moz/Ahrefs), Core Web Vitals field data, whether their ads run, the logged-in wizard and payment step (would require creating an account), Trustpilot/BBB presence off-site, our own Ads tag and our live SERP positions.
