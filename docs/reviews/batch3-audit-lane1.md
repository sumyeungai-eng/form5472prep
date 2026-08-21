# Batch 3 audit — Lane 1 (4 posts)

Auditor: read-only fact check against docs/reviews/blog-geo-aeo-audit-brief.md (incl. addendum) and the
"legal facts" block in docs/reviews/new-posts-batch-3-spec.md. Verified against irs.gov (i5472, i5471, FIRPTA
withholding page, nonresident real property page, DIIRSP page, Form 5472/1120 PDFs) and law.cornell.edu
(26 USC §6501, §6038). All four files are working-tree, not yet deployed (no `publishAt`, `draft: false`).
Internal `/blog/` link targets were checked against `content/blog/*.md` in the working tree (not the live
site, per addendum). External links curl-verified 200 on 2026-08-21.

---

## form-5472-us-real-estate-foreign-investor — score 38/38

- P0: none found.
- P1: none found.
- P2 (polish):
  - Line 15 / 41 (H2 "How is US rental income taxed for a nonresident owner?") and line 47 (H2 "What happens when the property is sold?"): the post states the 30% FDAP rule and the 15% FIRPTA rate correctly and links to the right irs.gov pages, but never cites the underlying IRC section numbers in-text (`§871(d)` is named once at line 41/114, but `IRC §1445` for FIRPTA is never named — only "FIRPTA" and a link). The spec brief for this post says "cite ... FIRPTA withholding 15% on sale (IRC §1445 ...)". Fix: add "(IRC section 1445)" after "FIRPTA" at line 49, e.g. "FIRPTA (IRC section 1445) generally requires the buyer to withhold 15%...". Not a factual error — the content and the linked source are correct — just a missing inline citation the brief asked for.

Verification notes: $25,000 penalty (line 15), FDAP 30% (line 41), §871(d) net-election mechanics and "stays in effect for later years unless revoked" (lines 41-43, matches irs.gov verbatim: "This election stays in effect for all later tax years unless the NRA revokes it"), FIRPTA 15% and the "after 16 February 2016" cutoff (line 49, consistent with IRS's "10% for dispositions before Feb. 17, 2016"), e-file prohibition and fax/Ogden details (line 25) — all verified accurate against irs.gov. Internal link target `/blog/form-5472-reportable-transactions-examples` exists in the working tree. Pricing exactly $149/$199/+$99, EIN $149, ITIN $349 (line 96) — correct. No duplicated H2s, no placeholder text, no cross-section pronouns, no conflicting facts. FAQ: 7 questions, all ≤33 words. Word count 2,051 (bar: ≥1,200 for a narrow persona post — passes with margin).

---

## form-5472-vs-form-5471 — score 34/38

- **P0 (wrong/invented fact):** Lines 15, 34, and 129 all state the Form 5471 information-penalty is imposed **"under section 6038(a)."** That is the wrong subsection. 26 U.S.C. §6038(a) is the *reporting requirement* ("Every United States person shall furnish... such information..."); the $10,000 penalty and the $10,000-per-30-day continuation penalty are imposed by **§6038(b)(1)** and **§6038(b)(2)** (verified against the Cornell Law text of 26 USC §6038, and consistent with the audit brief's own legal-facts line: "Form 5471 penalty amount and section (i5471 — §6038(b) $10,000 + continuation)"). The i5472/i5471 instructions themselves describe the penalty as being "for failure to furnish the information required by section 6038(a)" — i.e., they reference (a) only to name the underlying duty, not as the penalty-imposing subsection — so citing "(a)" as *the penalty section* is a citation error, repeated three times in this post (intro, comparison table, and FAQ answer). Exact offending text (line 15): *"the [IRS Instructions for Form 5471] state a **$10,000** penalty under section 6038(a) for failure to furnish required information..."* — same phrase repeats at line 34 (table cell "$10,000 under section 6038(a), with continuation penalties after IRS notice") and line 129 (FAQ: "the common section 6038(a) Form 5471 penalty starts at $10,000"). **Exact fix:** replace "section 6038(a)" with "section 6038(b)" in all three locations (or write "section 6038" without a subsection letter, which is also accurate and avoids the error entirely).
- P1: none found (this is the only substantive defect; everything else about the $25,000/$10,000 comparison, the ownership-direction framing, and the decision tree is accurate).
- P2 (polish): none beyond the P0 above.

Verification notes: $25,000 Form 5472 penalty confirmed. E-file prohibition, pro forma 1120 attachment, and Ogden PIN Unit fax/mail details (lines 70, 107) confirmed against i5472. Internal link target `/blog/how-to-fill-out-form-5472` exists in the working tree. External links (i5472, i5471) both verified 200. Pricing correct. FAQ: 7 questions, all ≤31 words. Word count 2,077. No duplicated H2s, no placeholder text, no cross-section pronouns (the repeated "6038(a)" is a factual error, not a pronoun/integrity defect — the three instances are consistent with each other, not conflicting, so INTEGRITY line 18 itself is unaffected; the defect is scored under FACT CHECK line 6).

---

## form-5472-statute-of-limitations — score 38/38

- P0: none found.
- P1: none found.
- P2: none found.

Verification notes: this post's central legal claim — IRC §6501(c)(8) keeps the assessment window open until three years after the missing §6038A information is furnished, with a reasonable-cause carve-out limited to the related item(s) — was checked word-for-word against the Cornell Law text of 26 U.S.C. §6501(c)(8) and matches closely (paraphrase, not misquote). The DIIRSP quote at line 82 ("penalties may still be assessed without considering the statement during processing") matches the actual irs.gov DIIRSP page text: "During the processing of the delinquent information return, penalties may be assessed without considering the attached reasonable cause statement." The §1.6038A-3 "record maintenance" citation at line 59 is correct (verified: 26 CFR §1.6038A-3 is titled "Record maintenance"). $25,000 penalty and 90-day/30-day continuation rule (line 29) confirmed against i5472. The post correctly declines to invent an IRS enforcement-rate statistic (lines 31, 130-132), as the spec instructed. Internal link targets `/blog/form-5472-filed-late-never-filed` and `/blog/form-5472-reasonable-cause-letter` exist in the working tree. Pricing correct. FAQ: 7 questions, all ≤31 words. Word count 1,807 (bar: ≥1,200 for a narrow topic post — passes).

---

## form-5472-part-v-statement-example — score 38/38

- P0: none found.
- P1: none found.
- P2: none found.

Verification notes: the Part V description at lines 15/19 ("amounts paid or received in connection with formation, dissolution, acquisition, disposition... including contributions to, and distributions from, the entity... describe on an attached statement") matches the i5472 instructions verbatim in substance. Line 1f/1h mechanics (lines 23, 83-85) match the instructions exactly: line 1f = total for *this* Form 5472 (incl. Part V for a foreign-owned DE), line 1h = total across *all* Forms 5472 filed for the year. The worked Part V statement template (lines 50-73) uses clearly-labelled illustrative figures and a fictitious name/EIN, as required. $25,000 penalty and "substantially incomplete... constitutes a failure to file" (line 15) confirmed verbatim against i5472. Internal link targets `/blog/form-5472-reportable-transactions-examples` and `/blog/how-to-fill-out-form-5472` exist in the working tree. External links to i5472, and the f1120/f5472 PDFs, all verified 200. Pricing correct. FAQ: 7 questions, all ≤32 words. Word count 1,962.

---

## Totals across the 4 posts

- P0: 1 (form-5472-vs-form-5471, §6038(a)/(b) citation error, 3 occurrences)
- P1: 0
- P2: 1 (form-5472-us-real-estate-foreign-investor, missing "IRC section 1445" inline citation)
- Combined score: 148/152 (38+34+38+38)
