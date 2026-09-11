# Claude handoff — blog coverage review, 2026-09-11

## Outcome and scope

Completed the owner's blogpost-review + Codex Orchestration request for Form5472 Prep. This was a recommendations-only review, not permission to write or publish another batch.

No website posts, service copy, scheduled dates, source code, database rows, account settings or production configuration were changed. No deploy was attempted.

Base checkout commit: `c8d2874`. This log and the two review artifacts are committed together in the documentation-only commit containing this file; use `git log -1 -- docs/sessions/2026-09-11-blog-coverage-review.md` to resolve its SHA. Do not push merely to publish this review.

## Files owned by this session

Canonical checkout: /Users/sumyeung/Documents/Codex/form5472. Current main checkout; no branch switch.

- docs/marketing/form5472-blog-coverage-review-2026-09-11.md — detailed recommendations, sources and top-three outlines.
- docs/marketing/form5472-blog-inventory-2026-09-11.csv — 125 local posts with live status, canonical, dates and review basis.
- docs/sessions/2026-09-11-blog-coverage-review.md — this handoff.

No shared source files edited. All unrelated untracked files, prior execution briefs, images, hktax and src/lib/wizard remain untouched.

## Findings to carry forward

The sitemap had 167 URLs, 123 of them blog posts; all 123 returned HTTP 200 and exposed canonicals. Local inventory has 125 posts. We read 46 unique article bodies, including 44 published and two scheduled, plus eight non-blog business/service/FAQ pages. Local-only reading is distinguished in the CSV; this is not a claim that every public body was reviewed.

Recommended new writing order, after corrections:

1. LLC-level FBAR versus the foreign owner's personal position — practical account evidence worksheet.
2. Paying foreign contractors — payer-side Form 5472, documentation and withholding decision workflow.
3. Nonresident spouse ITIN with a joint return — package assembly after professional election review.
4. Same owner becomes a U.S. tax resident — conditional on specialist research/review and stronger demand validation.

Six separate refreshes are detailed in the report: compliance map, DIY/cost, ITIN sales page, EIN name mismatch, recordkeeping worked example, and delivery/signature/partner promises.

Most urgent observations:
- Checklist understates possible LLC-level FBAR duties. Landing-page summary is only partially clearer.
- DIY/preparer guide says fax only and wrongly excludes mail; it also mislabels form parts and promises risk elimination. Cost copy has related unqualified claims.
- /itin overstates bank/W-8BEN eligibility and inevitable passport mailing/waiting; the newer eligibility articles are more careful.
- /foreign-owned-llc-tax says ITIN applications are not handled despite /itin being live.
- /partners explicitly says white-label delivery is not live. Do not market it as available without owner confirmation.
- Current Delaware official guidance retrieved in this review says $400. Do not “correct” that to the old $300 figure from memory.

Scheduled posts are not content gaps:
- multiple-related-parties-form-5472: September 21; its public URL returned 404 during review.
- final-form-5472-closing-foreign-owned-llc: September 28; absent from current public sitemap/index.

Some current content links to the future multiple-related-parties URL. Check the publishing/internal-link policy in a separately authorized implementation pass, without silently changing its date.

## Evidence and verification

The report contains linked public customer questions and IRS/FinCEN sources. Demand is qualitative, not measured volume. There are no traffic, conversion-lift or low-competition guarantees. Community responses are not authorities and should never be copied as tax rules.

Inventory/review counts were reconciled programmatically. Documentation-only checks cover formatting and CSV consistency. No application build or test suite was needed or run for this review; prior publication tests are not represented as new test results.

Codex Orchestration was used for one independent read-only EIN/ITIN research pass. The main agent handled Form 5472, live inventory and integration. No persistent model routes/configuration changed.

## Still open

### Needs a subsequent authorized work session

- Implement the prioritized factual/message corrections, then research and draft approved new topics.
- Obtain qualified review for FBAR, withholding, residency and joint-return examples.
- Recheck current official guidance immediately before publishing.
- Validate relevant public pages after any future production push; deployment must remain git push origin main only, never a production Vercel CLI deployment.

### Needs owner/business evidence

- Confirm whether the ITIN offer supports a spouse's joint Form 1040 and the exact remote CAA document-verification workflow.
- Confirm white-label availability and actual delivery/status promises before copy changes.
- Supply authorized Search Console/exported conversion data and anonymized support themes if measured prioritization is wanted.

No blocker to this review remains. These are next-stage decisions, not unfinished publication work.
