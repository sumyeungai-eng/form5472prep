# Blog metadata-edit audit — 048379b..HEAD (24 posts)

Scope: frontmatter `title`/`description` changes, any added links, factual/pricing changes, and FAQ-extractor safety, per `docs/reviews/blog-geo-aeo-audit-brief.md` lines 13 and 15.

Method: `git diff 048379b HEAD -- content/blog/<slug>.md` for each slug; char-counted old vs. new title/description; `curl -s -o /dev/null -w "%{http_code}"` on every URL added in the diffs; scanned diffs for H2 lines (none touched) and for numeric/price changes (none found).

**Global finding:** every OLD title was actually non-compliant (61–77 chars, over the 60-char cap) and every OLD description was also over 155 chars (125–250). So this pass fixed a real, pre-existing length-limit violation across the board. The tradeoff: to hit the character budget, the new titles systematically strip the question-form/personal hook ("What You Need to File", "Do You Still Need to File?", "Which Makes Sense for You?"), and several new descriptions collapsed into the generic "Learn X, Y, and Z" / "covers the filing package..." pattern the brief explicitly flags as keyword-stuffed filler — sometimes losing the one genuinely differentiating fact or stat the old copy led with. Six new descriptions are *also* still over the 155-char cap (net regression on the very metric this edit was chasing).

**No factual, pricing, or FAQ-extractor issues found.** No diff touches an H2, a dollar figure, a deadline, a penalty amount, or any other claim — only frontmatter fields and (in 5 posts) one intro sentence gaining an inline `[Form 5472](irs.gov link)` markdown link. All 3 unique added URLs resolve 200:
- `https://www.irs.gov/instructions/i5472` → 200 (used in canada, dormant, india posts)
- `https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures` → 200 (filed-late-never-filed)
- `https://www.irs.gov/forms-pubs/about-form-5472` → 200 (what-is-form-5472)

Pricing quoted anywhere unchanged (`form-5472-cost`, `form-5472-extension` bodies/descriptions untouched aside from `updated:` date) — no regression from $149/$199/+$99.

| slug | title verdict | desc verdict | notes |
|---|---|---|---|
| amazon-fba-foreign-sellers-form-5472 | keep | keep | Old title 64c/old desc 188c both over limit. New: 47c/152c, compliant, keeps "2026" and full audience phrase. Reasonable trade. |
| amended-form-5472-correcting-errors | keep (unchanged) | **rewrite** | Desc 250c→152c fixes length but drops the $25,000-penalty stakes line and becomes "Learn which mistakes matter..." — generic filler. |
| does-foreign-owned-llc-pay-us-tax | **rewrite** | keep | Title lost its natural "?" question form (71c→48c) — this is the CTR-relevant downgrade pattern the brief calls out; question titles also help PAA/AEO matching. Desc (220c→149c) stayed reasonably informative (trade-or-business/income-sourcing framing), acceptable. |
| ein-for-foreign-owned-llc-without-ssn | keep (unchanged) | **rewrite** | Desc is 157c — **still over the 155 cap**, and dropped the specific "line 7b / fax and phone numbers / how long it takes" hooks for generic "Learn how to complete Form SS-4...". |
| foreign-owned-llc-filing-requirements-checklist | keep | keep (P2) | Title 74c→44c compliant, checklist framing intact. Desc 198c→148c compliant but is now a flat keyword list with no click reason; P2 polish, not urgent. |
| form-5472-canada-residents-us-llc | keep | **rewrite** | Desc is 158c — **still over the 155 cap**. New copy retains the good SIN/FTIN specific but leads with generic "covers the filing package for..." Also gained a resolving irs.gov link (200 OK). |
| form-5472-cost | keep (unchanged) | keep (unchanged) | Only an `updated:` date was added. No issue. |
| form-5472-deadline-2026 | keep | **rewrite** | Title 75c→36c, fine. Desc 193c→142c is compliant but is now a *meta*-description ("lists the 2026 and 2027 due dates...") instead of stating the actual answer — lost the concrete "due 15 October 2026" date, which is the single highest-value click driver for a deadline query. |
| form-5472-diy-vs-preparer | keep (P2) | keep (P2) | Title 67c→36c drops the personal "Which Makes Sense for You?" hook. Desc 188c→154c compliant, dropped the $25,000-penalty stakes framing for a flatter "compare the work, price, review..." Both acceptable, not urgent. |
| form-5472-dormant-llc-no-income | keep (P2) | **rewrite** | Title lost its "Do You Still Need to File?" question hook (70c→42c). Desc is 159c — **still over the 155 cap**, and softened the direct "almost certainly yes" answer into hedgier "may still apply." Gained a resolving irs.gov link (200 OK). |
| form-5472-extension | keep (unchanged) | keep (unchanged) | Only an `updated:` date was added. No issue. |
| form-5472-filed-late-never-filed | keep (unchanged) | keep (P2) | Desc 188c→152c compliant, kept the $25,000 stat, ends in a slightly generic "Learn how DIIRSP... work" list but acceptable. Gained a resolving irs.gov DIIRSP link (200 OK). |
| form-5472-ftin-reference-id-foreign-address | keep | keep (unchanged) | Title only trimmed a stray "and"→", and" (67c→49c); desc untouched. No issue. |
| form-5472-india-residents-us-llc | keep (P2) | keep (P2) | Title 73c→43c compliant. Desc 213c→154c compliant, kept the good PAN/FTIN specific but dropped the "what's changed in 2025/2026" timeliness hook. Gained a resolving irs.gov link (200 OK). |
| form-5472-penalty-notice-what-to-do | keep (unchanged, 60c) | keep (P2) | Desc 205c→154c compliant, kept the $25,000 figure, lost the personal "why your letter may have been ignored" hook for a flatter "explains the assessment, deadlines, evidence..." list. |
| form-5472-reportable-transactions-examples | keep | keep (unchanged) | Title only dropped trailing "for Foreign-Owned LLCs" (69c→46c) to fit under 60; desc untouched, already compliant. |
| form-5472-uae-dubai-residents-us-llc | keep (unchanged, 51c) | **rewrite** | Desc 231c→154c is compliant but drops the genuinely unique differentiating fact ("no US-UAE tax treaty, and the UAE issues no personal tax ID") for a generic "covers the filing package, identification fields..." list — this post's best hook is gone. |
| form-5472-uk-residents-us-llc | keep (P2) | keep (P2) | Title 77c→42c compliant, lost "even if you never made a penny" personal framing. Desc 240c→153c compliant, reasonably informative but generic-list flavored. |
| how-to-fill-out-form-5472 | keep | **rewrite** | Title 76c→42c, good ("Part by Part" specificity kept). Desc is 156c — **still over the 155 cap by 1**, and dropped both the $25,000-penalty stakes and the "which boxes to leave blank" specificity. |
| multi-member-llc-form-5472-or-1065 | **rewrite** | **rewrite** | Old title was itself 61c (1 over the cap). New title (41c) dropped "with Foreign Owners" — a meaningful qualifier since this whole site's intent is foreign ownership, not generic multi-member LLCs. Desc is 156c — **still over the 155 cap by 1**, ends in generic "Learn when Form 5472 applies..." |
| multiple-related-parties-form-5472 | **rewrite** | keep (unchanged) | Old title 66c (over cap) had a strong "How Many Forms Do You File?" question hook that matches natural search phrasing; new title (38c) is compliant but flat declarative, losing the AEO-friendly question form. Desc untouched, already compliant and fine. |
| stripe-paypal-wise-form-5472 | keep | keep (unchanged) | Title 68c→47c, retains full keyword set (Stripe/PayPal/Wise), minor hook loss but fine. Desc untouched, already compliant. |
| what-is-form-5472 | **revert/rewrite** | **rewrite** | **This is the exact example flagged in the brief.** Old title ("What is IRS Form 5472? A jargon-free guide for foreign-owned LLC owners") had the strongest voice/hook on the whole site — plus it's the reference post the brief cites for consistent voice (line 15), so its own hook getting stripped is self-undermining. New title drops both the question form and "jargon-free" personality. Desc is 156c — **still over the 155 cap by 1** — and is now literally "Learn who files, what to report, and when it is due," the generic keyword-stuffed pattern the brief calls out by name. Gained a resolving irs.gov link (200 OK). |
| wyoming-llc-foreign-owner-tax-filing | keep (P2) | **rewrite** | Title 71c→42c compliant. Desc 202c→149c compliant but dropped both the "no state income tax but..." contrast hook and the $25,000-penalty figure — the two things that made the old description worth clicking. |

## Recommended REVERT/REWRITE list with proposed replacements

All proposed descriptions verified ≤155 chars; proposed titles ≤60 chars.

| slug | field | proposed replacement | chars |
|---|---|---|---|
| what-is-form-5472 | title | `What Is IRS Form 5472? A Jargon-Free Guide` | 42 |
| what-is-form-5472 | description | `Form 5472 is an IRS return foreign-owned US LLCs must file yearly, even with zero revenue. See who must file it and what a missed filing actually costs.` | 152 |
| does-foreign-owned-llc-pay-us-tax | title | `Does a Foreign-Owned US LLC Pay US Tax?` | 39 |
| multi-member-llc-form-5472-or-1065 | title | `Multi-Member LLC with Foreign Owners: 5472 or 1065?` | 51 |
| multi-member-llc-form-5472-or-1065 | description | `A 2-member LLC defaults to a partnership and files Form 1065, not Form 5472. See when the switch happens and which structures bring back Form 5472.` | 147 |
| multiple-related-parties-form-5472 | title | `Form 5472: How Many Forms for Related Parties?` | 46 |
| amended-form-5472-correcting-errors | description | `Found an error after filing Form 5472? The IRS has no amendment procedure — see the practitioner fix and why an incomplete form risks the $25,000 penalty.` | 154 |
| ein-for-foreign-owned-llc-without-ssn | description | `No SSN or ITIN? You can still get an EIN via Form SS-4. Learn what to write on line 7b, the fax number to use, and how long approval takes.` | 139 |
| form-5472-canada-residents-us-llc | description | `Canada residents who own a US LLC must file Form 5472 yearly, even with zero revenue. See how to enter your SIN as the FTIN and what counts as reportable.` | 154 |
| form-5472-deadline-2026 | description | `The 2025 Form 5472 is due October 15, 2026 if extended. See every 2026-2027 deadline, the Form 7004 extension rule, and what to do if you're already late.` | 154 |
| form-5472-dormant-llc-no-income | description | `Zero revenue doesn't mean no filing. A dormant foreign-owned LLC almost always still owes Form 5472 — contributions and distributions count as reportable.` | 154 |
| form-5472-uae-dubai-residents-us-llc | description | `No US-UAE tax treaty and no UAE personal tax ID change how Dubai owners file Form 5472. See what goes in the FTIN box and what the $25,000 penalty means.` | 153 |
| how-to-fill-out-form-5472 | description | `A part-by-part walkthrough of Form 5472 and the pro forma 1120 — which boxes to complete, which to skip, and the errors that trigger the $25,000 penalty.` | 153 |
| wyoming-llc-foreign-owner-tax-filing | description | `Wyoming has no state income tax, but a foreign-owned Wyoming LLC still owes an annual report and, in most cases, Form 5472 backed by a $25,000 penalty.` | 151 |

Not flagged for action (compliant and acceptable, only minor/P2 hook softening): amazon-fba-foreign-sellers-form-5472, foreign-owned-llc-filing-requirements-checklist, form-5472-diy-vs-preparer, form-5472-filed-late-never-filed, form-5472-india-residents-us-llc, form-5472-penalty-notice-what-to-do, form-5472-reportable-transactions-examples, form-5472-uk-residents-us-llc, stripe-paypal-wise-form-5472, form-5472-ftin-reference-id-foreign-address, form-5472-cost, form-5472-extension.
