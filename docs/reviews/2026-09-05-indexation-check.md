# Indexation check — form5472prep.com — 2026-09-05

Read-only GSC + Google search + curl investigation. No changes made (no sitemap
submitted, no indexing requested, no "Validate fix" clicked).

## 0. Access note

Chrome's default signed-in profile (sum1989104@gmail.com) does **not** have
access to the GSC property. Switched to sumyeungai@gmail.com (account slot
`/u/6/`), which does. `sumyeungai@gmail.com` is a **user on the property**
(not necessarily the sole owner) — confirmed access, not ownership tier.

## 1. Properties

Only **one** property exists under this account for this domain:
- `sc-domain:form5472prep.com` (Domain property).
- No separate URL-prefix property `https://www.form5472prep.com/` exists.
- (Unrelated property `https://milemarketplace.com/` also listed — ignored.)

## 1a. Sitemaps report

One sitemap is submitted — it is **not** "none submitted", but it is stale and
at the wrong host:

| Field | Value |
|---|---|
| Sitemap URL submitted | `https://form5472prep.com/sitemap.xml` (**non-www**) |
| Type | Sitemap |
| Submitted | May 20, 2026 |
| Last read | **May 22, 2026** (109 days before this check — never re-read since) |
| Status | Success |
| Discovered pages | **22** |
| Discovered videos | 0 |

**Headline #1**: the sitemap Google last successfully read contained only 22
URLs. The live sitemap today (`https://www.form5472prep.com/sitemap.xml`,
verified via curl) has **139 `<loc>` entries**, including
`/blog/what-is-form-5472`, `/form-5472-penalty`, `/pricing`,
`/form-5472-deadline-calculator`, and the full blog. Google has not re-crawled
the sitemap since it was a 22-URL early version of the site.

**Headline #2 — likely root cause**: the sitemap URL as submitted/declared in
GSC is `https://form5472prep.com/sitemap.xml` (non-www). Live curl check
shows this URL now returns **HTTP 307**, redirecting to
`https://www.form5472prep.com/sitemap.xml`. `robots.txt` (see §3) also
declares the sitemap only at the **www** address. A sitemap fetch that 307s
at the exact submitted URL is consistent with Google silently failing to
re-poll it going forward, even though the original May 2026 read (before the
non-www→www redirect existed, or before host normalization) succeeded and
was cached as "Success."

## 1b. Pages (Indexing) report

"All known pages" view (default): the "All submitted pages" / sitemap-filter
toggle exists but the dropdown would not switch views in this session; it
appears there is no distinct alternate-view dataset to show.

| | Count |
|---|---|
| **Indexed** | **5** |
| **Not indexed** | **7** |

Why pages aren't indexed (4 reasons, all expanded):

| Reason | Source | Pages | Example URLs |
|---|---|---|---|
| Page with redirect | Website | 3 | `http://form5472prep.com/`, `https://form5472prep.com/`, `http://www.form5472prep.com/` — all last crawled Aug 19–23, 2026. Benign: these are the 3 non-canonical homepage variants correctly redirecting to `https://www.form5472prep.com/`. |
| Excluded by 'noindex' tag | Website | 1 | `https://www.form5472prep.com/start` (last crawled May 20, 2026) — intentional, a gated app-start page. |
| Crawled - currently not indexed | Google systems | 3 | `https://www.form5472prep.com/_next/static/media/db96af6b531dc71f-s.p.woff2` (Jul 10), `.../_next/static/css/b7b5a3e9ee9a884c.css?...` (Jul 7), `.../_next/static/css/6e6397304509a060.css?...` (Jun 1). **Not content pages at all — Next.js build asset files** (fonts/CSS) Google stumbled onto and correctly declined to index. |
| Discovered - currently not indexed | Google systems | 0 | N/A |

**Critical finding**: none of the 7 "not indexed" URLs are blog posts, the
pricing page, the penalty page, or the deadline calculator. Google isn't
excluding the money pages for a coverage reason — it simply has **never
discovered them** (see URL Inspection below). The 12 URLs GSC knows about
total (5 indexed + 7 not indexed) are exactly: homepage (×4 variants),
/about, /terms, /security, /editorial-policy, /start, and 3 static asset
files. That's essentially the site's boilerplate/legal shell, matching the
stale 22-URL sitemap read from May.

Indexed pages (5): `https://www.form5472prep.com/` (Aug 23, 2026),
`/terms` (Aug 19), `/editorial-policy` (Aug 9), `/about` (Jul 31),
`/security` (Jul 25).

## 1c. URL Inspection (4 target URLs — none clicked "Request indexing")

All four returned the **identical** verdict:

| URL | Verdict | Coverage | Last crawl | Discovered via | Crawl/index allowed | Canonical |
|---|---|---|---|---|---|---|
| `/blog/what-is-form-5472` | **URL is not on Google** | Page is not indexed: URL is unknown to Google | N/A | No referring sitemaps detected; No referring page detected | N/A | N/A |
| `/form-5472-penalty` | **URL is not on Google** | Page is not indexed: URL is unknown to Google | N/A | No referring sitemaps detected; No referring page detected | N/A | N/A |
| `/pricing` | **URL is not on Google** | Page is not indexed: URL is unknown to Google | N/A | No referring sitemaps detected; No referring page detected | N/A | N/A |
| `/form-5472-deadline-calculator` | **URL is not on Google** | Page is not indexed: URL is unknown to Google | N/A | No referring sitemaps detected; No referring page detected | N/A | N/A |

Google has literally never seen any of these four URLs — not "crawled but
not indexed," not "discovered but not crawled" — fully unknown, zero
discovery signal from sitemap or internal links.

## 1d. Crawl stats (Settings)

Last updated 9/3/26. Window: last 90 days.

- **Total crawl requests: 1.06K** (1,060)
- Total download size: 9.82M bytes
- Average response time: 169 ms
- By host: `www.form5472prep.com` — 976 requests, **No problems**;
  `form5472prep.com` — 85 requests, **No problems**.
- By response: OK (200) 88%, Moved temporarily (302) 6%, Moved permanently
  (301) 3%, Not found (404) 2%.
- By file type: JavaScript 45%, Other 20%, HTML 17% (~180 HTML fetches over
  90 days), CSS 7%.

Googlebot is actively and regularly crawling the site (no host problems,
healthy response times) — the bottleneck is **discovery** (sitemap not
re-read, presumably repeat-crawling the same dozen already-known URLs),
not crawl capacity or server health.

## 1e. Performance

- **28-day totals: 6 clicks, 71 impressions, 8.5% CTR, avg. position 19.3.**
- 3-month totals (for reference): 8 clicks, 140 impressions, 5.7% CTR, avg
  position 19.2.
- 16-month ("full duration") totals: 8 clicks, 164 impressions, 4.9% CTR,
  avg position 18.8 — and the chart's data **starts at 5/18/26**. There is no
  earlier data. The property's search performance history begins mid-May
  2026, i.e., Google has only known this domain for **~3.5 months** as of
  today (2026-09-05), consistent with the May 20, 2026 sitemap submission
  date.

## 2. Google `site:` searches (google.com, English, logged in as
sumyeungai@gmail.com, location Hong Kong)

| Query | Result |
|---|---|
| `site:form5472prep.com` | **5 results**, no page 2 (reached footer). Exactly: homepage, `/about`, `/terms`, `/security`, `/editorial-policy` — matches the 5 GSC-indexed pages exactly. |
| `site:form5472prep.com/blog` | **0 results** — "did not match any documents." No blog post is indexed. |
| `site:form5472prep.com form 5472 penalty` | **4 results**, all from the same 5 already-indexed boilerplate pages (about, homepage, terms, editorial-policy) — the dedicated `/form-5472-penalty` page itself does not appear. |
| `"What Is Form 5472?" site:form5472prep.com` | **0 results** — "did not match any documents." |

Google's public index is consistent with GSC: only ~5 pages are indexed,
site-wide, right now.

## 3. robots.txt and sitemap.xml (curl)

- `https://www.form5472prep.com/robots.txt` → **HTTP 200**. Declares
  `Sitemap: https://www.form5472prep.com/sitemap.xml` (www) and
  `Host: https://www.form5472prep.com`. `Allow: /` for all UAs (incl.
  GPTBot, ClaudeBot, PerplexityBot, etc.), with `Disallow: /dashboard`,
  `/filings`, `/admin`, `/api/` only.
- `https://www.form5472prep.com/sitemap.xml` (the address robots.txt
  actually points to) → **HTTP 200**, `content-type: application/xml`,
  26,385 bytes, **139 `<url>`/`<loc>` entries**, includes
  `/blog/what-is-form-5472` and all target URLs.
- `https://form5472prep.com/sitemap.xml` (the address actually **submitted
  in GSC**) → **HTTP 307**, redirects to the www URL above. This is the
  mismatch: GSC's Sitemaps report is polling a URL that no longer serves the
  sitemap directly.

## Diagnosis

This is **not** "sitemap never submitted" — a sitemap was submitted on
May 20, 2026 and initially read successfully. It is a **discovered-and-then-
abandoned** case with two compounding causes:

1. **Sitemap submitted at the wrong host.** GSC has
   `https://form5472prep.com/sitemap.xml` (non-www) on file; that exact URL
   now 307-redirects to the www version, while robots.txt only advertises
   the www sitemap. Google's last successful read (May 22, 2026) predates
   whatever change introduced that redirect, and it has not been re-read in
   109 days despite the site being crawled ~1,060 times/90 days — strongly
   suggesting Google gave up re-polling the redirecting sitemap URL.
2. **The sitemap Google does have on file is a 3.5-month-old snapshot** (22
   URLs) of a site that has since grown to 139 URLs. Every blog post, the
   pricing page, the penalty page, and the deadline calculator were added
   *after* that last successful read, so none of them were ever handed to
   Google via sitemap, and none has been linked-to/discovered organically
   either (URL Inspection shows zero referring page for all four spot-
   checked URLs).

Net effect: Google currently knows about only ~12 URLs on this domain (5
indexed, 7 not-indexed — all boilerplate/legal pages or build assets), which
is exactly consistent with the stale 22-URL sitemap snapshot. The 3
"crawled-not-indexed" items are meaningless noise (CSS/font files, not
content). The fix is not "wait for Google" — it's **resubmit the sitemap at
the exact URL robots.txt declares (`https://www.form5472prep.com/sitemap.xml`,
www, no redirect)** so Google re-reads the current 139-URL sitemap and begins
discovering/crawling the ~127 URLs (blog posts, pricing, penalty page,
deadline calculator, etc.) it has never seen. No other technical blocker was
found: crawl health is good (no host problems, 88% 200s), robots.txt allows
everything relevant, and the one `noindex` (`/start`) and 3 redirecting
homepage variants are correct/intentional.
