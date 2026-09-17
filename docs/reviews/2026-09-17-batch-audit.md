# 2026-09-17 batch audit — five new posts

Method: read each post in full; verified mechanics by script (word count, FAQ H2/H3 count and answer word counts, `utm_`, `^# `, table count, frontmatter lengths/dates); fetched every cited external URL with WebFetch and compared the quoted claim against the live page text. Internal `/blog/` links checked against `content/blog/` on disk.

Score scale: /38 (19 lines x 2, per the audit-brief rubric, adapted — line 16/image-asset check not scored since these posts are not yet built with artwork; treated as N/A and excluded, so effective max is 36; noted per-post).

---

## boi-reporting-foreign-owned-us-llc-2026 — score 35/36

Mechanics: 1,745 words (in range); 6 FAQ items, longest 44 words; 0 `utm_`; 0 `^# `; 7 table rows; title 48/60, description 154/155; tags `["foreign-owned-llc","boi"]`.

Fact-check (all confirmed against primary sources):
- FinCEN announcement dated 11 Aug 2026 — confirmed via fincen.gov/news/news-releases (exact date, "permanently removes the requirement for U.S. companies and U.S. persons," and the deletion-of-prior-data language all match verbatim).
- Federal Register doc 2026-16576, published 14 Aug 2026, effective 14 Aug 2026 — confirmed via federalregister.gov API (publication_date and effective date both 2026-08-14).
- fincen.gov/boi reporting-company definition ("formed under the law of a foreign country and that have registered to do business in any U.S. State or Tribal jurisdiction") — confirmed verbatim, and page explicitly states "U.S. companies are exempt."
- fincen.gov/resources/scams — confirmed the four quoted "does not" behaviors and the fincen.gov/contact verification instruction.
- Form 5472 fax number, $25,000/30-day continuation penalty, no e-file for foreign-owned DE — confirmed via irs.gov/instructions/i5472.

Findings:
- P2 (tag mechanics): post has a full section ("What does a foreign-owned LLC still have to file?") and an FAQ item specifically on Form 5472, but tags omit `"form-5472"` (frontmatter line 7: `tags: ["foreign-owned-llc", "boi"]`). Spec says add `form-5472` "where the post discusses it." Fix: `tags: ["foreign-owned-llc", "form-5472", "boi"]`.

No P0 or P1 findings.

---

## registered-agent-foreign-owned-llc — score 35/36

Mechanics: 1,740 words; 6 FAQ items, longest 46 words; 0 `utm_`; 0 `^# `; 6 table rows; title 57/60, description 153/155; tags `["foreign-owned-llc","registered-agent"]`.

Fact-check (all confirmed):
- Wyoming SOS FAQ (sos.wyo.gov/FAQS.aspx?root=RAO): "physical location where an individual can accept service of process" and "reside in Wyoming, have a physical Wyoming address" — confirmed verbatim (lines 11, 19, 23).
- Wyoming $5.00 fee for both "Appointment of New Registered Agent and Office" and "Statement of Resignation" — confirmed on the same page (lines 51, 57).
- Delaware Division of Corporations (corp.delaware.gov/agents/): "maintain a street address and office located in Delaware and be open during normal business hours ... for the purpose of accepting service of process" — confirmed verbatim (line 19).

Findings:
- P2 (tag mechanics): section "What a registered agent does NOT do" and FAQ item "Does my registered agent file my Form 5472?" both discuss Form 5472 substantively, but tags omit `"form-5472"` (line 7). Fix: `tags: ["foreign-owned-llc", "form-5472", "registered-agent"]`.

No P0 or P1 findings.

---

## single-member-llc-operating-agreement-foreign-owner — score 36/36

Mechanics: 1,907 words; 7 FAQ items, longest 33 words; 0 `utm_`; 0 `^# `; 7 table rows; title 57/60, description 147/155; tags `["foreign-owned-llc","form-5472","operating-agreement"]` (compliant — one topical tag added).

Fact-check (all confirmed):
- Delaware 6 Del. C. §18-101(9) (delcode.delaware.gov/title6/c018/sc01/index.html): "means any agreement ... written, oral or implied" and "not subject to any statute of frauds" — confirmed verbatim (lines 13, 19, 82).
- Form 5472 Part IV vs Part V attached-statement treatment of contributions/distributions (irs.gov/instructions/i5472) — confirmed (line 33).
- Legal-advice framing requirement met: post explicitly refuses to state which states require an operating agreement, repeatedly directs the reader to "check your formation state's LLC act," and states "we do not draft operating agreements" (lines 11, 19, 72, 90) — no overreach.

No P0, P1, or P2 findings on this post.

---

## certificate-of-good-standing-foreign-owned-llc — score 32/36

Mechanics: 1,841 words; 7 FAQ items, longest 42 words; 0 `utm_`; 0 `^# `; 10 table rows; title 52/60, description 150/155; tags `["foreign-owned-llc","form-5472","good-standing"]` (compliant).

Fact-check:
- Wyoming online certificate generation via Filing ID (wyobiz.wyo.gov/Business/ViewCertificate.aspx) — confirmed (lines 13, 23, 55).
- Delaware Document Filing and Certificate Request Service, short-form "Certificate of Status" vs long-form (corp.delaware.gov/directweb/) — confirmed the service and the short/long distinction (lines 13, 24, 61), and the post correctly does NOT state the $50/$175 fees it wasn't told to state.
- **P0 — invented/unverifiable fee, contradicts the cited primary source.** Line 43: *"Delaware LLCs don't file an annual report at all, but they owe a flat annual tax — $400 from tax year 2026 under Delaware House Bill 400 — due by June 1, with a $200 penalty plus 1.5% monthly interest for late payment, per the [Delaware annual tax page](https://corp.delaware.gov/frtax/)."* I fetched corp.delaware.gov/frtax/ twice and searched specifically for "$400," "House Bill 400," "HB 400," and "tax year 2026" — none appear. The live page currently states the LLC/LP/GP annual tax is **$300.00**, due June 1, with the $200 penalty and 1.5%/month interest (those two details are correctly sourced). The $400/HB 400 figure is not supported by the page the post cites as its source. Fix: either remove the $400/HB 400 clause and state "$300, per corp.delaware.gov/frtax/" (matching what's actually on the page today), or — if HB 400 is a real, separately-confirmed statute taking effect in tax year 2026 — cite the actual legislative text/session-law source for it rather than a page that still shows $300, and add a note that the $300 figure on the DE site had not yet been updated as of the fetch date.

No P1 findings; the P0 above is the only substantive issue.

---

## sales-tax-nexus-foreign-owned-llc — score 36/36

Mechanics: 2,279 words (top of range but within 1,700–2,300); 6 FAQ items, longest 44 words; 0 `utm_`; 0 `^# `; 12 table rows; title 57/60, description 148/155; tags `["foreign-owned-llc","form-5472","sales-tax"]` (compliant).

Fact-check (all confirmed):
- South Dakota v. Wayfair decided 21 June 2018; "unsound and incorrect" quote re: Quill's physical-presence rule — confirmed via supremecourt.gov PDF (lines 15, 24). Post correctly states SD's *original* 1998-era statute had both a $100,000 and a 200-transaction test (accurately framed as the statute "under review," not the current rule) — confirmed by the opinion text.
- South Dakota's **current** threshold (dor.sd.gov): $100,000 gross revenue, current-or-prior calendar year, **no transaction-count test** — confirmed; the post correctly states "the state's page no longer lists a separate transaction-count threshold" (line 35). This matches the anchor given (SD removed the 200-transaction test).
- California economic nexus $500,000, current-or-preceding calendar year (cdtfa.ca.gov/industry/wayfair.htm) — confirmed verbatim (line 36).
- California fulfillment-center/FBA nexus rule (cdtfa.ca.gov/industry/fulfillment-centers.htm): "considered to be engaged in business in California" and must register/file/pay — confirmed verbatim (line 42).
- Form 5472 $25,000 penalty, IRC §6038A(d), no state equivalent — confirmed and correctly scoped as unrelated to sales tax (lines 61, 67-68).

No P0, P1, or P2 findings on this post.

---

## Overall totals
- P0: 1 (certificate-of-good-standing-foreign-owned-llc.md, line 43, Delaware $400/HB 400 claim not supported by its own cited source)
- P1: 0
- P2: 2 (boi and registered-agent posts missing the `form-5472` tag despite substantive Form 5472 content)

## Verification appendix (for reproducibility)
- All 5 posts: `wc -w`, `utm_` count, `^# ` count, `^|` table-row count, FAQ H3 count/max-answer-words, and frontmatter title/description lengths were computed directly from the files in `content/blog/` in this worktree (not estimated).
- Internal `/blog/` links referenced by all 5 posts (wyoming-llc-foreign-owner-tax-filing, delaware-llc-foreign-owner-tax-filing, foreign-owned-llc-filing-requirements-checklist, us-bank-account-foreign-owned-llc, form-8832-election-foreign-owned-llc, amazon-fba-foreign-sellers-form-5472, what-is-form-5472) all exist in `content/blog/`. `/do-i-need-to-file-form-5472` is a real non-blog route (`src/app/(marketing)/do-i-need-to-file-form-5472/page.tsx`).
- External URLs fetched and their live-page status: fincen.gov/news/news-releases/... (200, confirmed), federalregister.gov/documents/2026/08/14/2026-16576/... (302 redirect to unblock page; confirmed instead via federalregister.gov/api/v1/documents/2026-16576.json, 200), fincen.gov/boi (200, confirmed), fincen.gov/resources/scams (200, confirmed), sos.wyo.gov/FAQS.aspx?root=RAO (200, confirmed), corp.delaware.gov/agents/ (200, confirmed), delcode.delaware.gov/title6/c018/sc01/index.html (200, confirmed), irs.gov/instructions/i5472 (200, confirmed), wyobiz.wyo.gov/Business/AnnualReport.aspx (200, due-date confirmed; license-tax formula not visible in fetched extract — this specific $60/$0.0002 figure is a pre-verified site anchor per the architect's brief, not re-flagged), corp.delaware.gov/frtax/ (200 — **$300 only, contradicts the post's $400/HB 400 claim**, see P0 above), dor.sd.gov/businesses/taxes/sales-use-tax/ (200, confirmed), cdtfa.ca.gov/industry/wayfair.htm (200, confirmed), cdtfa.ca.gov/industry/fulfillment-centers.htm (200, confirmed), supremecourt.gov/opinions/17pdf/17-494_j4el.pdf (200, confirmed), wyobiz.wyo.gov/Business/ViewCertificate.aspx (200, confirmed), corp.delaware.gov/directweb/ (200, confirmed).
