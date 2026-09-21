# Form 5472 / Form 1120 rule verification against official IRS PDFs

**Purpose.** Before software logic depends on them, the eight rules below were checked directly against the official IRS PDFs (not from memory). PDFs were downloaded with `curl` and text was extracted with PyMuPDF (`fitz`). All quotes below are verbatim from the extracted text; page numbers refer to the PDF page (which matches the printed page number in every document checked, confirmed against the page-footer text visible in the extraction).

**Retrieval date:** 2026-09-21

**Documents used and their printed revision dates:**

| Document | URL | Revision printed on document |
|---|---|---|
| Instructions for Form 5472 | https://www.irs.gov/pub/irs-pdf/i5472.pdf | Rev. December 2024 (Catalog Number 59641T; "Feb 11, 2025" print date in footer); states it is for use with the December 2023 revision of Form 5472 |
| Form 5472 | https://www.irs.gov/pub/irs-pdf/f5472.pdf | Rev. December 2023 (Cat. No. 49987Y) |
| Instructions for Form 1120 (current) | https://www.irs.gov/pub/irs-pdf/i1120.pdf | "2025 Instructions for Form 1120" (current version as posted by IRS at retrieval date; no separate "Rev." line beyond the tax-year label) |
| Instructions for Form 1120 (prior year) | https://www.irs.gov/pub/irs-prior/i1120--2024.pdf | "2024 Instructions for Form 1120" |
| Instructions for Form 1120 (prior year) | https://www.irs.gov/pub/irs-prior/i1120--2023.pdf | "2023 Instructions for Form 1120" |

All five PDFs downloaded successfully; none were substituted from memory.

---

## Summary table

| Rule | Verdict | Source | Page |
|---|---|---|---|
| R1 — Lines 43a/43b blank for foreign-owned U.S. DE | CONFIRMED | i5472.pdf (Rev. 12-2024) | p. 7 |
| R2 — Code 999000 = Unclassified Establishments; 999999 not on list | CONFIRMED (all 3 years checked) | i1120.pdf p.33 (current); i1120--2024.pdf p.32; i1120--2023.pdf p.31 | see above |
| R3 — No-FTIN → "None"/"N/A"; reference ID number format & consistency | PARTLY CONFIRMED | i5472.pdf (Rev. 12-2024) | pp. 4–5 |
| R4 — Line 2 (≥50% foreign ownership) and Line 3 (foreign-owned U.S. DE checkbox) text | PARTLY CONFIRMED | f5472.pdf (Rev. 12-2023) p.1; i5472.pdf pp. 3–4 | see above |
| R5 — Fax 855-887-7737 and Ogden PIN Unit mailing address | CONFIRMED | i5472.pdf (Rev. 12-2024) | p. 2 |
| R6 — Line 1o asks for country(ies) where business is conducted | CONFIRMED | i5472.pdf (Rev. 12-2024) | p. 3 |
| R7 — Fax resolution must be 300 DPI or higher | CONFIRMED | i5472.pdf (Rev. 12-2024) | p. 2 |
| R8 — Due date 15th day of 4th month after year-end/dissolution; Form 7004 6-month extension | PARTLY CONFIRMED (due-date/dissolution language confirmed; "6-month" extension length NOT FOUND in the sources reviewed) | i1120.pdf p.4 (current); i1120--2024.pdf p.3; i1120--2023.pdf p.4 | see above |

---

## R1 — Lines 43a/43b left blank by a foreign-owned U.S. DE

**Verdict: CONFIRMED**

Source: Instructions for Form 5472 (Rev. December 2024), page 7, under the heading "**Lines 43a and 43b**":

> "**Note.** Complete lines 43a, 43b(1), and 43b(2) only if the reporting corporation is a domestic corporation. (Do not complete these lines if the reporting corporation is a foreign-owned U.S. DE.) In completing these lines, do not account for debt instruments that were issued, or distributions or acquisitions that occurred, before April 5, 2016."

This is an explicit instruction that a foreign-owned U.S. DE does **not** complete (i.e., leaves blank) lines 43a, 43b(1), and 43b(2) — it does not direct answering "No."

Related "who completes which parts" rules found in the same document (page 2), under "Who Must File / Exceptions from filing":

> "1. It had no reportable transactions of the types listed in Parts IV and VI of the form and, in the case of a reporting corporation that is a foreign-owned U.S. DE, also had no reportable transactions of the type listed in Part V of the form."

And (page 1c instruction, page 2):

> "Line 1f. Enter the total value in U.S. dollars of all foreign related party transactions reported in Parts IV and VI (and if the reporting corporation is a foreign-owned U.S. DE, Part V) of this Form 5472."

And (page 3), Part II heading note:

> "**Note.** Only 25% foreign-owned U.S. corporations, including foreign-owned U.S. DEs, complete Part II. For a foreign-owned U.S. DE, report the information for the foreign owner on the lines provided for the 25% foreign shareholder."

These confirm the general pattern the rule describes: the instructions carve out specific parts/lines (Part V; lines 43a/43b) that only apply to, or are excluded for, foreign-owned U.S. DEs, rather than instructing the DE to answer "No."

---

## R2 — Form 1120 Principal Business Activity Codes: 999000 = unclassified; no 999999

**Verdict: CONFIRMED for all three years checked (2023, 2024, current/2025)**

**Current (i1120.pdf, "2025 Instructions for Form 1120"), page 33**, under the "Other" heading of the Principal Business Activity Codes list:

> "999000
> Unclassified Establishments
> (unable to classify)"

**Prior year 2024 (i1120--2024.pdf), page 32**, identical entry:

> "999000
> Unclassified Establishments
> (unable to classify)"

**Prior year 2023 (i1120--2023.pdf), page 31**, identical entry:

> "999000
> Unclassified Establishments
> (unable to classify)"

A text search for "999999" across all three Form 1120 instruction PDFs returned **no matches** — confirming 999999 does not appear anywhere on the Principal Business Activity Codes list in any of the three years checked.

---

## R3 — No FTIN → what to enter on 4b(3)/8b(3); reference ID number format & consistency

**Verdict: PARTLY CONFIRMED** — the FTIN/"None" rule and the reference-ID-number format/consistency rules are confirmed exactly as described, but only for lines **4b(3)/5b(3)/6b(3)/7b(3)** (Part II, the 25% foreign shareholder). The instructions text does **not** contain a parallel "Line 8b(3)" heading or FTIN discussion for Part III (related party), even though the Form 5472 itself has an 8b(3) "FTIN, if any" field.

**On the FTIN and "None"/"N/A" entry** — Instructions for Form 5472 (Rev. 12-2024), pages 4–5:

> "**Lines 4b(3), 5b(3), 6b(3), and 7b(3).** A foreign-owned U.S. DE must enter a foreign taxpayer identification number (FTIN), if any, for each direct and ultimate foreign owner listed in Part II. If a foreign-owned U.S. DE has, as a direct owner, a foreign DE, report that foreign DE as the direct owner. The FTIN should be used consistently on an annual basis when filing Form 5472, as an EIN or reference ID number would be used. **If you do not have an FTIN, enter "None" or "N/A" in the FTIN block.** If you have a U.S. identifying number and/or reference ID number, you can enter it in the appropriate block, as discussed earlier.
>
> Filers of Form 5472, other than foreign-owned U.S. DEs, can enter an FTIN on these lines. However, they must also enter a U.S. identifying number or reference ID number on lines 4b(1)/7b(1) or 4b(2)/7b(2), respectively. If you are not a foreign-owned U.S. DE, and do not have an FTIN, leave the block blank."

So "None" (or "N/A") is confirmed correct — but specifically for a foreign-owned U.S. DE; a non-DE filer without an FTIN is told to leave the block blank rather than enter "None."

**On line 8b(3) specifically:** the Form 5472 itself (Rev. 12-2023), page 2, Part III, lists a field:

> "8b(3)  FTIN, if any (see instructions)"

But a full-text search of the Instructions for Form 5472 (i5472.pdf) found no occurrence of "8b(3)" and no "Line 8b(3)" heading — the instructions' Part III discussion (page 5) only goes as far as:

> "Line 8b(1). Enter the related party's U.S. identifying number, if any... Line 8b(2). If the related party is a foreign person, enter the related party's reference ID number, if required..."

There is no instructional text in this document that separately addresses line 8b(3) (related-party FTIN). This is a gap in the instructions as written, not something to assume by analogy to 4b(3).

**On the reference ID number (4b(2)/8b(2)) — format limits and year-to-year consistency**, Instructions for Form 5472, page 4:

> "**Requirements.** The reference ID number that is entered must be alphanumeric (defined later), and no special characters or spaces are permitted. **The length of a given reference ID number is limited to 50 characters.**
>
> For these purposes, the term "alphanumeric" means the entry can be alphabetical, numeric, or any combination of the two.
>
> **The same reference ID number must be used consistently from tax year to tax year** with respect to a given 25% foreign shareholder or related foreign party. If for any reason a reference ID number falls out of use (for example, the 25% foreign shareholder or related foreign party no longer exists due to disposition or liquidation), the reference ID number used for such foreign person cannot be used again for another 25% foreign shareholder or related foreign party for purposes of Form 5472 reporting."

This confirms: alphanumeric only, no special characters/spaces, 50-character limit, and mandatory year-to-year consistency (with a defined correlation procedure for new-vs-old reference ID numbers on a merger/acquisition/entity-classification election, also on page 4).

---

## R4 — Line 2 and Line 3

**Verdict: PARTLY CONFIRMED** — the exact text of lines 2 and 3, and their instructions, are confirmed as quoted below. However: (1) line 2 asks about **≥50%** ownership, not "25% foreign-owned" as paraphrased in the rule statement — the 25%/related-party threshold is a separate, general filing-requirement concept; and (2) the instructions do **not** explicitly state whether a foreign-owned U.S. DE should or should not check line 2 (no cross-reference or note was found addressing this interaction between lines 2 and 3).

**Form 5472 (Rev. 12-2023), page 1, Part I:**

> "2    Check here if, at any time during the tax year, any foreign person owned, directly or indirectly, at least 50% of (a) the total voting power of all classes of the stock of the reporting corporation entitled to vote, or (b) the total value of all classes of stock of the reporting corporation"
>
> "3    Check here if the reporting corporation is a foreign-owned domestic disregarded entity (foreign-owned U.S. DE) treated as a corporation for purposes of section 6038A. See instructions"

**Instructions for Form 5472 (Rev. 12-2024), pages 3–4:**

> "**Line 2.** For purposes of this line:
> • Foreign person has the same meaning as provided earlier under Definitions; and
> • 50% direct or indirect ownership is determined by applying the constructive ownership rules of section 318 with the modifications listed under the definition of 25% foreign shareholder, earlier."
>
> "**Line 3.** Check this box if you are a foreign-owned U.S. DE."

No instruction text was found in i5472.pdf stating whether a foreign-owned U.S. DE also checks line 2 in addition to line 3. This should not be assumed either way from these documents alone.

---

## R5 — Fax number and mailing address for pro forma Form 1120 (foreign-owned U.S. DE)

**Verdict: CONFIRMED**

Instructions for Form 5472 (Rev. 12-2024), page 2, under "Dedicated mailing address":

> "Foreign-owned U.S. DEs are required to use the following dedicated mailing address. These filers do not use the mailing address provided in the Instructions for Form 1120.
>
> **Note.** "Foreign-owned U.S. DE" should be written across the top of the Form 1120. File these forms by:
> • **Fax (300 DPI or higher) to 855-887-7737**, or
> • Mail to:
> Internal Revenue Service
> 1973 Rulon White Blvd
> M/S 6112 Attn: PIN Unit
> Ogden, UT 84201"

Both the fax number (855-887-7737) and the Ogden, UT PIN Unit mailing address are confirmed exactly.

---

## R6 — Line 1o

**Verdict: CONFIRMED**

Form 5472 (Rev. 12-2023), page 1, Part I:

> "1o  Principal country(ies) where business is conducted"

Instructions for Form 5472 (Rev. 12-2024), page 3:

> "**Line 1o.** Provide the principal country(ies) where business is conducted. Do not include any country(ies) in which business is conducted solely through a subsidiary. Do not enter "worldwide" instead of listing the country(ies). These rules also apply to lines 5c, 6c, and 7c of Part II, and line 8f of Part III."

Confirms line 1o asks for the country or countries where the reporting corporation conducts business (with the additional instruction not to write "worldwide," and that the subsidiary-exclusion and no-"worldwide" rules also apply to the analogous lines elsewhere on the form).

---

## R7 — Fax resolution requirement

**Verdict: CONFIRMED**

Instructions for Form 5472 (Rev. 12-2024), page 2:

> "• Fax (300 DPI or higher) to 855-887-7737"

The instructions do specify a minimum resolution of 300 DPI for the fax.

---

## R8 — Due date of pro forma 1120/5472 for a foreign-owned DE (including dissolved entities); Form 7004 extension

**Verdict: PARTLY CONFIRMED** — the general due-date rule (15th day of the 4th month after year-end) and the dissolved-entity rule (15th day of the 4th month after dissolution) are confirmed, word for word, in all three years of the Instructions for Form 1120. However, these sentences are the **general Form 1120 "When To File" rule**, not language specific to a foreign-owned U.S. DE's pro forma 1120 — the Form 5472 instructions themselves state only that the DE's Form 5472 must be filed "by the due date (including extensions) of that Form 1120," without repeating the 15th-day-of-4th-month/dissolution language directly. Additionally, **the specific "6 months" length of a Form 7004 extension was NOT FOUND** in any of the five documents reviewed — Form 7004's own instructions were not part of the source set for this task, and neither the Form 1120 instructions nor the Form 5472 instructions state the extension period in months.

**Instructions for Form 1120 (current, "2025"), page 4, "When To File":**

> "Generally, a corporation must file its income tax return by the 15th day of the 4th month after the end of its tax year. A new corporation filing a short-period return must generally file by the 15th day of the 4th month after the short period ends. **A corporation that has dissolved must generally file by the 15th day of the 4th month after the date it dissolved.**"

**Instructions for Form 1120 (2024), page 3** — identical wording:

> "Generally, a corporation must file its income tax return by the 15th day of the 4th month after the end of its tax year. A new corporation filing a short-period return must generally file by the 15th day of the 4th month after the short period ends. A corporation that has dissolved must generally file by the 15th day of the 4th month after the date it dissolved."

**Instructions for Form 1120 (2023), page 4** — identical wording (same sentence, split across the page 3/4 boundary in this year's PDF).

**On the extension mechanism**, Instructions for Form 1120 (current), page 4, "Extension of Time To File":

> "File Form 7004, Application for Automatic Extension of Time To File Certain Business Income Tax, Information, and Other Returns, to request an extension of time to file. Generally, the corporation must file Form 7004 by the regular due date of the return. See the Instructions for Form 7004."

This does not state the length of the extension (i.e., it does not say "6 months" or "6-month automatic extension" anywhere in the text extracted). To confirm the 6-month figure, the Instructions for Form 7004 (not among the five source documents supplied for this task) would need to be pulled and checked directly — do not assume it from memory.

**On the DE-specific due date**, Instructions for Form 5472 (Rev. 12-2024), page 2:

> "**Foreign-owned U.S. DEs.** While a foreign-owned U.S. DE has no income tax return filing requirement, as a result of final regulations under section 6038A, it will now be required to file a pro forma Form 1120, U.S. Corporation Income Tax Return, with Form 5472 attached **by the due date (including extensions) of that Form 1120**."

And, page 2–3, on extensions specifically for the DE:

> "**Extension of time to file.** A foreign-owned U.S. DE required to file Form 5472 can request an extension of time to file by filing Form 7004... The DE must file Form 7004 by the regular due date of the return. Because the Form 5472 of a DE must be attached to a pro forma Form 1120, the code for Form 1120 should be entered on Form 7004, Part I, line 1. "Foreign-owned U.S. DE" should be written across the top of Form 7004."

This confirms the DE's due date is tied to the pro forma Form 1120's due date (i.e., the same 15th-day-of-4th-month / dissolution rule found in the Form 1120 instructions applies by cross-reference), and that Form 7004 is the correct extension mechanism — but neither document states the extension is 6 months.

---

## Notes on method

- All PDFs were fetched directly from the URLs supplied via `curl` and saved under `/private/tmp/claude-501/.../scratchpad/irs/`.
- Text was extracted with `python3 -c "import fitz; ..."` (PyMuPDF), page by page, preserving page boundaries for citation.
- No content in this report was drawn from training-data memory of these forms; every quote above was located by direct text search in the extracted PDF text and cross-checked against the page marker in the extraction.
- Two gaps were identified in the process (both noted above under R3, R4, and R8): the Form 5472 instructions do not have explicit line-level text for 8b(3), do not state whether a foreign-owned U.S. DE checks line 2, and neither Form 1120 nor Form 5472 instructions state the Form 7004 extension period in months. These should be treated as open items rather than filled in from memory.

---

## R8 addendum — extension length (resolved)

**VERDICT: CONFIRMED (with one edge case).** Source: Instructions for Form 7004 (Rev. December 2025),
https://www.irs.gov/pub/irs-pdf/i7004.pdf, page 1, "Extension Period", retrieved 21 September 2026.

> "Properly filing Form 7004 will automatically give you the maximum extension allowed from the due
> date of your return to file the return. Maximum extension period. The automatic extension period for
> time to file is generally 6 months. Exceptions apply for certain filers of Form 1041 and for C
> corporations with tax years ending June 30."

> "C corporations with tax years ending June 30 and beginning before January 1, 2026, are eligible for
> an automatic 7-month extension of time to file (6-month extension if filing Form 1120-POL). For tax
> years beginning in 2026, the automatic extension period is 6 months."

**Edge case for the generator:** a dissolved LLC's short final year that ends on 30 June and began
before 1 January 2026 falls inside the literal wording of the 7-month exception. Whether that exception
reaches a foreign-owned disregarded entity filing a pro forma 1120 is not addressed here. Do not guess:
the filing-status code must route that exact case (final year, period ends 30 June, began before
2026-01-01, extension = Yes) to the reviewer instead of classifying it.

## R4 note — line 2 for a foreign-owned DE

The instructions do not say in terms whether a foreign-owned U.S. DE ticks line 2. The line's own text
asks whether one foreign person owned at least 50% of vote or value at any time in the year. Every
entity this product serves is wholly owned by one foreign person, so the condition is met on the line's
own terms; G-01 (always tick line 2) follows from the form text rather than from an instruction.
