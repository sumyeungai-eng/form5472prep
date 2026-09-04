# 2026-09-05 — Tool pages post-restore audit

Scope: the 3 tool pages + 1 provider page that were briefly 404 during an earlier audit
(bad deploy, since fixed) and got skipped at the time. Read-only audit, no repo changes.

Pages: `/form-5472-deadline-calculator`, `/do-i-need-to-file-form-5472`,
`/form-5472-penalty-calculator`, `/doola-form-5472`.

Artifacts (HTML snapshots, Lighthouse JSON, analysis scripts) saved under
`/private/tmp/claude-501/.../scratchpad/toolpages/` (session-scoped scratch, not in repo).

## 1. HTTP status

All 4 pages return `200` via `curl` (sizes 61–122 KB). No 404s remain.

## 2. Lighthouse (mobile, Perf/SEO/A11y/BP)

| Page | Perf | SEO | A11y | BP | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| deadline-calculator | 77 | 100 | 96 | 77 | 2.9s | 0 | 710ms |
| do-i-need-to-file | 72 | 100 | 96 | 77 | 2.7s | 0 | 1,190ms |
| penalty-calculator | 86 | 92 | 96 | 77 | 2.8s | 0 | 350ms |
| doola-form-5472 | 77 | 100 | 96 | 77 | 2.5s | 0 | 840ms |

CLS is clean (0) on all four. All runs succeeded on the first attempt (no retries needed).

Top failing audits (weight-ranked; all are performance-metric audits — TBT/LCP/FCP —
consistent with heavier client JS on these interactive calculators):
- **deadline-calculator**: TBT (0.42), LCP (0.8), FCP (0.97)
- **do-i-need-to-file**: TBT (0.21) — worst TBT of the four, LCP (0.86), FCP (0.93)
- **penalty-calculator**: TBT (0.73), LCP (0.83), Speed Index (0.81)
- **doola-form-5472**: TBT (0.34), LCP (0.89), FCP (0.97)

Shared non-metric failures across all 4 pages: `target-size` (a11y — touch targets too
small/close), `third-party-cookies` and `inspector-issues` (best-practices, score 0
each — pulls BP to 77 uniformly). `penalty-calculator` additionally fails `link-text`
(seo — non-descriptive link text), which is why its SEO score is 92 vs 100 elsewhere.

## 3. JSON-LD schema

| Page | @types present |
|---|---|
| deadline-calculator | WebApplication, FAQPage, BreadcrumbList, WebPage |
| do-i-need-to-file | WebApplication, FAQPage, BreadcrumbList, WebPage |
| penalty-calculator | WebApplication, FAQPage, BreadcrumbList, WebPage |
| doola-form-5472 | Article, FAQPage, BreadcrumbList, HowTo |

- **WebApplication** (name/url/applicationCategory/offers): OK on deadline-calculator
  and penalty-calculator. **`do-i-need-to-file-form-5472` is MISSING the `offers`
  property** — name/url/applicationCategory present but no `offers` object. (doola page
  has no WebApplication block at all, which is expected — it's an Article/HowTo page,
  not a calculator.)
- **FAQPage**: all 4 pages' Q&A text matches visible HTML (answers found even where
  they sit inside `<details>`) — 5/5, 4/4, 5/5, 4/4 questions verified, no mismatches.
- **BreadcrumbList**: positions sequential (1,2) on all 4 pages, no gaps/duplicates.
- **Article** (doola-form-5472): headline, datePublished (2026-08-28), dateModified
  (2026-08-28), author (Organization), and citation (5 CreativeWork entries incl. IRS
  + doola sources) all present. OK.

## 4. Metadata

| Page | Title (len) | Description (len) | H1 | Canonical | og:image |
|---|---|---|---|---|---|
| deadline-calculator | 56 chars | 133 chars | 1 | correct, self-ref | present |
| do-i-need-to-file | 61 chars | 122 chars | 1 | correct, self-ref | present |
| penalty-calculator | 53 chars | 128 chars | 1 | correct, self-ref | present |
| doola-form-5472 | 43 chars | 126 chars | 1 | correct, self-ref | present |

All titles/descriptions within normal length bounds, exactly one H1 per page, canonical
self-referencing on all 4, `og:image` present (shared `/opengraph-image` route) on all 4.
No failures here.

## 5. Client bundle integrity

Extracted `/_next/static/chunks/*.js` references from each page (11–13 per page) and
HEAD-fetched each: **all returned 200, zero 404s** across all 4 pages.

---

**Summary**: pages are healthy post-restore. One real defect found —
`do-i-need-to-file-form-5472`'s `WebApplication` JSON-LD is missing the `offers`
property (present on the other two calculators). Everything else (status, bundles,
FAQ/breadcrumb schema, metadata) checks out clean; performance scores (72–86) are the
main opportunity area, driven by TBT/LCP on these JS-heavy calculators, plus a shared
touch-target a11y nit and third-party-cookie/inspector-issue BP flags.
