# GSC re-index requests, 2026-10-16

Run: Search Console, Chrome authuser 2, property `sc-domain:form5472prep.com`. For each URL the agent ran URL Inspection, recorded the stored index data (the pre-request state), then clicked Request indexing. Each request ran a live test and ended with the "Indexing requested" dialog: "URL was added to a priority crawl queue."

Quota used today: 9 requests (no "Quota exceeded" message seen). Do not request any of these again today.

All 9 pre-request inspections showed the same state: "URL is not on Google", "Page is not indexed: Duplicate without user-selected canonical", user-declared canonical "None", Google-selected canonical `https://www.747live.bet/`. The stored index data predates the 2026-10-15 redeploy, so it still shows the wrong canonical until Google recrawls.

| # | URL (https://www.form5472prep.com...) | Google-selected canonical (before request) | Last crawl in index (before request) | Request indexing |
|---|---|---|---|---|
| 1 | /compare/form-5472-filing-services | https://www.747live.bet/ | Oct 7, 2026, 5:28:58 AM | OK, indexing requested |
| 2 | /services/hire-someone-to-file-form-5472 | https://www.747live.bet/ | Oct 6, 2026, 2:41:01 AM | OK, indexing requested |
| 3 | /form-5472-reportable-transactions-checker | https://www.747live.bet/ | Oct 2, 2026, 7:36:42 AM | OK, indexing requested |
| 4 | /blog/itin-required-form-5472 | https://www.747live.bet/ | Sep 5, 2026, 6:25:09 PM | OK, indexing requested |
| 5 | /blog/form-5472-crypto-owner-transfers | https://www.747live.bet/ | Sep 11, 2026, 11:14:03 PM | OK, indexing requested |
| 6 | /blog/form-5472-owner-loans-contributions-reimbursements | https://www.747live.bet/ | Sep 13, 2026, 3:32:17 AM | OK, indexing requested |
| 7 | /blog/form-5472-nonresident-spouse-joint-return-election | https://www.747live.bet/ | Sep 12, 2026, 10:38:35 PM | OK, indexing requested |
| 8 | /blog/form-5472-colombia-residents-us-llc | https://www.747live.bet/ | Sep 19, 2026, 4:17:41 AM | OK, indexing requested |
| 9 | /blog/topics | https://www.747live.bet/ | Oct 8, 2026, 1:09:52 PM | OK, indexing requested |

## Inspect-only (requested 2026-10-15)

Inspected only. No Request indexing click on either.

| URL (https://www.form5472prep.com...) | Status | Last crawl | User-declared canonical | Google-selected canonical |
|---|---|---|---|---|
| /form-5472-instructions | URL is on Google, "Page is indexed" | Oct 15, 2026, 12:36:30 PM | itself | "Inspected URL" (itself) |
| /clemta-form-5472 | URL is on Google, "Page is indexed" | Oct 15, 2026, 6:38:35 AM | itself | "Inspected URL" (itself) |

Both yesterday-requested URLs are fixed: indexed, and Google now selects the page itself as canonical instead of 747live.bet. Search Console labels a matching canonical as "Inspected URL".

## Notes

- An earlier attempt this session wrote a "BLOCKED" version of this file because the Claude in Chrome extension had not connected. It connected later, and this file replaces that version.
- URL Inspection takes 20 to 30 seconds per lookup and about 60 to 70 seconds per Request indexing (live test, then queue).
