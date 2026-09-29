# Research note: "Do I need to file Form 5472?" checker

Tool: `/do-i-need-to-file-form-5472`. Logic: `src/lib/tools/filing-checker/` (`tree.ts`, `sources.ts`).
Researched and last reviewed 2026-09-29. All sources were fetched live on that date (irs.gov with
curl; eCFR through its renderer API because the HTML page blocks scripts; statutes on Cornell LII).
Every rule the checker applies is listed with its source and a short verbatim quote.

## Shareable URL

`?llc=yes&owners=one&owner=foreign&corp=no&existed=yes&moved=yes`

| Key | Question | Values |
|---|---|---|
| `llc` | Do you have a US LLC? | `yes`, `no` |
| `owners` | How many owners? | `one`, `multi` |
| `owner` | Is the owner a non-US person or company? | `us`, `foreign` |
| `corp` | Elected corporate tax treatment? | `yes`, `no` (label "No / Not sure") |
| `existed` | Did the LLC exist during the year? | `yes`, `no` |
| `moved` | Did money or property move? | `yes`, `no`, `unsure` |

Parsing walks the tree from the first question and stops at the first missing or invalid answer;
answers that are off the path are dropped. Other params (utm_*) are kept. Tested in `tree.test.ts`,
which also pins the answer-to-result routing so the refactor could not change any result.

## Rules and sources

### 1. A foreign-owned single-member LLC is a "reporting corporation"
- Treas. Reg. §301.7701-2(c)(2)(vi)(A), <https://www.ecfr.gov/current/title-26/section-301.7701-2>:
  "treated as an entity separate from its owner and classified as a corporation for purposes of
  section 6038A if— (1) The entity is a domestic entity; and (2) One foreign person has direct or
  indirect sole ownership."
- Treas. Reg. §1.6038A-1(c)(1), <https://www.ecfr.gov/current/title-26/section-1.6038A-1>: "A
  domestic business entity that is wholly owned by one foreign person and that is otherwise
  classified under § 301.7701-3(b)(1)(ii) of this chapter as disregarded as an entity separate from
  its owner is treated as an entity separate from its owner and classified as a domestic
  corporation for purposes of section 6038A."
- Form 5472 instructions (Rev. 12/2024), <https://www.irs.gov/instructions/i5472> (page "Last
  Reviewed or Updated: 30-Apr-2026"): "A reporting corporation is either: A 25% foreign-owned U.S.
  corporation (including a foreign-owned U.S. disregarded entity (DE)), or A foreign corporation
  engaged in a trade or business within the United States." / "Generally, a reporting corporation
  must file Form 5472 if it had a reportable transaction with a foreign or domestic related party."
  / "it will now be required to file a pro forma Form 1120, U.S. Corporation Income Tax Return, with
  Form 5472 attached by the due date (including extensions) of that Form 1120."

### 2. Two or more owners: partnership by default
- Treas. Reg. §301.7701-3(b)(1), <https://www.ecfr.gov/current/title-26/section-301.7701-3>: "a
  domestic eligible entity is— (i) A partnership if it has two or more members; or (ii) Disregarded
  as an entity separate from its owner if it has a single owner."
- Form 1065 instructions, <https://www.irs.gov/instructions/i1065> ("Last Reviewed or Updated:
  30-Apr-2026"): "Except as provided below, every domestic partnership must file Form 1065, unless it
  neither receives income nor incurs any expenditures treated as deductions or credits for federal
  income tax purposes."

### 3. US owner: the disregarded-entity rule does not reach it
Same sources as §1: the rule needs "One foreign person has direct or indirect sole ownership".

### 4. Corporate election: Form 5472 goes with the corporation's own return
- IRC §6038A(a), (c)(1), <https://www.law.cornell.edu/uscode/text/26/6038A>: applies to a
  corporation that "is a domestic corporation, and is 25-percent foreign-owned"; "A corporation is
  25-percent foreign-owned if at least 25 percent of..." (voting power or value) "is owned at any time
  during the taxable year by 1 foreign person."
- i5472: "File Form 5472 as an attachment to the reporting corporation's income tax return by the
  due date (including extensions) of that return."
- "No / Not sure" is routed like "No" because the default classification in §301.7701-3(b)(1)
  applies unless the entity elects otherwise (Form 8832).

### 5. Tax year
- i5472: "Use Form 5472 to provide information required under sections 6038A and 6038C when
  reportable transactions occur during the tax year of a reporting corporation with a foreign or
  domestic related party." / "The foreign-owned U.S. DE has the same tax year used by its owner for
  U.S. tax filing requirements or, if none, the calendar year."

### 6. Reportable transactions (why "no income" is not "no filing")
- Treas. Reg. §1.6038A-2(b)(3)(xi), <https://www.ecfr.gov/current/title-26/section-1.6038A-2>: for
  an entity treated as a corporation under §301.7701-2(c)(2)(vi), "any other transaction as defined
  by § 1.482-1(i)(7), such as amounts paid or received in connection with the formation, dissolution,
  acquisition and disposition of the entity, including contributions to and distributions from the
  entity."
- i5472, Part V: "These transactions include amounts paid or received in connection with the
  formation, dissolution, acquisition, and disposition of the entity, including contributions to,
  and distributions from, the entity." Part IV lines include "Amounts borrowed" and "Amounts loaned".
- i5472, Exceptions from filing (no transactions): "It had no reportable transactions of the types
  listed in Parts IV and VI of the form and, in the case of a reporting corporation that is a
  foreign-owned U.S. DE, also had no reportable transactions of the type listed in Part V of the
  form."

### 7. Deadline and penalty
- Form 1120 instructions, <https://www.irs.gov/instructions/i1120> ("Last Reviewed or Updated:
  30-Apr-2026"): "a corporation must file its income tax return by the 15th day of the 4th month
  after the end of its tax year."
- i5472, Penalties: "A penalty of $25,000 will be assessed on any reporting corporation that fails to
  file Form 5472 when due and in the manner prescribed." / "Filing a substantially incomplete Form
  5472 constitutes a failure to file Form 5472."
- IRC §6038A(d)(1): "a penalty of $25,000 for each taxable year with respect to which such failure
  occurs."

## Claims softened on the page (old → new)

| Where | Old | New | Why |
|---|---|---|---|
| Result "Filing required" | "…penalty for missing Form 5472 or an incomplete reportable transaction disclosure is generally $25,000." | "…penalty for not filing Form 5472 when due, or for filing a substantially incomplete one, is $25,000." | Instructions say "substantially incomplete". |
| Result "Probably still safer to file" (answered "No, truly nothing") | "A genuinely zero-transaction year is rare… Many owners file protectively because…" | States that the instructions excuse a year with no reportable transactions, then lists what counts as one. | No source for "rare" or "many owners"; the exception from filing is sourced and was missing. |
| Result for "Not sure" | Title "Almost certainly yes"; "that usually means a filing obligation exists" | Title "Probably yes — check the year's records"; ties formation funding to the instructions' contributions/formation wording; "If you can't rule those out, plan on filing." | No source for "almost certainly" / "usually". Verdict (likely filing) unchanged. |
| FAQ "What happens if Form 5472 is missed?" | "generally $25,000 for a missing or incomplete Form 5472" | "$25,000 for a Form 5472 that is not filed when due or is substantially incomplete" | Instructions wording. |
| Hero answer | "…due April 15." | "…due April 15 for a calendar-year LLC." | April 15 is the calendar-year case. |

Results (which outcome each answer path reaches) are unchanged.

## Our choices, not IRS rules (stated on the page)
- A "Not sure" about money moving leads to a filing-leaning result. The page says this is our
  cautious choice, not an IRS rule.
- A "No, truly nothing" answer still shows "Probably still safer to file"; the explanation now says
  plainly that the instructions excuse a year with no reportable transactions.
