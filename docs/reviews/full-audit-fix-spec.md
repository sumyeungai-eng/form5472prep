# Full-audit fix specification — consolidated from full-audit-aa/ab/ac/ad

Date: 2026-08-19. Scope: the 39 published slugs in `docs/reviews/live-slugs.txt` (working tree is source of truth) + `src/lib/blog.ts`.

**Dropped from the source audits (do not action):**
- Every "internal link 404s" finding whose target is one of the six not-yet-published slugs: `form-5472-owner-loans-contributions-reimbursements`, `itin-required-form-5472`, `form-5472-recordkeeping-checklist`, `form-5472-ftin-reference-id-foreign-address`, `multiple-related-parties-form-5472`, `final-form-5472-closing-foreign-owned-llc`. A render guard degrades these to plain text until they publish. (This kills ~12 "P0" findings across aa/ab/ac/ad.) Note `first-year-form-5472-new-llc` **is** published — links to it are fine.
- All "403 to automated fetch" findings (dos.fl.gov Sunbiz, ato.gov.au) and all `comptroller.texas.gov` "unverifiable here" findings.

**Auditor claims REJECTED after verification** (see end of this file for reasons): the word counts for `form-5472-diy-vs-preparer` (claimed 1,021 → actually 2,169), `form-5472-dormant-llc-no-income` (claimed 846 → actually 1,619), and `stripe-paypal-wise-form-5472` (claimed 852 → actually 803); the `IRC §4A` citation for the remittance tax (correct cite is **IRC §4475**); and `form-5472-canada-residents-us-llc:45` "change to §1.6038A-1" (correct target is **§1.6038A-2**).

---

## Cross-post rules (a–i)

### (a) FTIN vs reference ID — Form 5472 Part II lines 4b(1)/(2)/(3)

**Verified correct rule** (Instructions for Form 5472, "Line 4b" and Part II, fetched 2026-08-19 from https://www.irs.gov/instructions/i5472):

> "A reference ID number is required only in cases where no U.S. identifying number was entered for the shareholder on the preceding line."
> "If you do not have an FTIN, enter 'None' or 'N/A' in the FTIN block."

Therefore:
1. **Line 4b(2) reference ID is REQUIRED whenever line 4b(1) (U.S. identifying number) is blank.** It is not optional, not a privacy alternative, and not a substitute for the FTIN.
2. **Line 4b(3) FTIN is a separate field.** Enter the foreign tax ID if the owner has one. If the owner has none, enter **"None" or "N/A"** — **never leave it blank**.
3. A foreign owner who has a PAN / SIN / UTR / IdNr but **no** US TIN must supply **both** the FTIN **and** a reference ID. The correct connector is "and", never "or".
4. The reference ID must be alphanumeric, consistent year to year, and never reused for a different person.
5. There is **no checkbox** on Form 5472 for explaining a missing FTIN.

**Canonical replacement sentence** (adapt the country-specific ID name):
> Enter your `<PAN/SIN/UTR/…>` as the foreign taxpayer identifying number on Part II line 4b(3); if you have none, the IRS instructions say to write "None" or "N/A" there rather than leaving it blank. Because you have no U.S. identifying number on line 4b(1), you must **also** enter a reference ID number on line 4b(2) — a consistent alphanumeric ID you assign yourself and reuse in every filing year. The reference ID is an additional field, not a substitute for the FTIN.

**MUST-FIX (states the rule wrongly as instruction):**

| file:line | current text (abridged) | required change |
|---|---|---|
| `form-5472-canada-residents-us-llc.md:12` | "you can enter your Canadian SIN as the foreign tax identifying number, **or** a self-assigned reference ID if you'd rather not use it" | apply canonical sentence with SIN |
| `form-5472-canada-residents-us-llc.md:71` | "Form 5472 has a **checkbox to explain why no FTIN is available**, along with a reason." | delete; replace with "If you genuinely have no SIN, the IRS instructions say to enter 'None' or 'N/A' in the FTIN block and supply a reference ID number on line 4b(2). There is no explanation checkbox." |
| `form-5472-india-residents-us-llc.md:12` | "Your Indian PAN … ; **if you'd rather not use it, a self-assigned reference ID is accepted**." | apply canonical sentence with PAN |
| `form-5472-uk-residents-us-llc.md:11` | "you can enter your UK tax reference (UTR) as the foreign tax identifying number, **or a self-assigned reference ID instead**" | apply canonical sentence with UTR |
| `form-5472-uae-dubai-residents-us-llc.md:11` | "most Dubai-based owners use a reference ID **rather than** an FTIN" | → "because the UAE issues no personal tax identification number, most Dubai-based owners write 'None' in the FTIN block **and** enter a self-assigned reference ID number" |
| `form-5472-uae-dubai-residents-us-llc.md:128` | "**leave the FTIN line blank** and enter a self-assigned reference ID number **instead**" | → "Enter 'None' or 'N/A' in the FTIN block — the instructions say not to leave it blank — and enter a self-assigned reference ID number on line 4b(2), using the identical reference ID in every year you file." |
| `how-to-fill-out-form-5472.md:91` | "**leave the FTIN blank** and use a reference ID number" | → "enter 'None' or 'N/A' in the FTIN block and **also** enter a reference ID number on line 4b(2)" |
| `how-to-fill-out-form-5472.md:157` | "Leaving the **FTIN blank** in Part II with no reference ID either." | → "Leaving the FTIN block empty instead of writing 'None' or 'N/A', or omitting the required reference ID on line 4b(2)." |
| `how-to-fill-out-form-5472.md:188` | "If your country issues no individual tax ID, **leave it blank** and use a reference ID number on line 4b(2)" | → "If your country issues no individual tax ID, enter 'None' or 'N/A' on line 4b(3) and enter a reference ID number on line 4b(2). A reference ID is required whenever line 4b(1) is blank — it is additional to the FTIN, not a replacement." |
| `ein-for-foreign-owned-llc-without-ssn.md:95` | "Part II accepts your home country's foreign tax ID **or** a reference ID." | → "Part II takes your home country's foreign tax ID (or 'None'/'N/A' if you have none) **and**, because you have no U.S. identifying number, a reference ID number as well." |
| `foreign-owned-llc-filing-requirements-checklist.md:99` | "You use your home country's tax ID as your Foreign Taxpayer Identifying Number, **or** a reference ID." | same "and" correction as above |
| `what-is-form-5472.md:106` | "you use your **foreign tax identifying number (FTIN)** … — **or** a self-assigned Reference ID." | → "…— and, because you have no US identifying number, a self-assigned Reference ID as well. If you have no foreign tax ID at all, the instructions say to write 'None' or 'N/A' in the FTIN block rather than leave it empty." |

**SHOULD-TIGHTEN (low-risk "or"-framing inside a list; fix in the same pass):** `amended-form-5472-correcting-errors.md:63`, `texas-llc-foreign-owner-tax-filing.md:143`, `wyoming-llc-foreign-owner-tax-filing.md:93` — change "FTIN **or** reference ID" to "FTIN **and**, where no U.S. identifying number is entered, a reference ID".

**Already correct — do not touch:** `form-5472-australia-residents-us-llc.md:144`, `form-5472-france-residents-us-llc.md:45,139`, `form-5472-germany-residents-us-llc.md:144`, `form-5472-netherlands-residents-us-llc.md:43,140`, `form-5472-singapore-residents-us-llc.md:42,139`, `first-year-form-5472-new-llc.md:48`, `form-5472-saas-founders.md:74`, `pro-forma-form-1120-foreign-owned-llc.md:84`, `form-5472-foreign-corporate-owner.md:51`, `form-5472-change-of-ownership.md:62`.

---

### (b) Continuation penalty — IRC §6038A(d)(2)

**Verified correct rule** (26 U.S.C. §6038A(d)(2), law.cornell.edu, fetched 2026-08-19):

> "If any failure described in paragraph (1) continues for more than 90 days after the day on which the Secretary mails notice of such failure to the reporting corporation, such corporation shall pay a penalty (in addition to the amount required under paragraph (1)) of $25,000 for **each 30-day period (or fraction thereof)** during which such failure continues after the expiration of such 90-day period."

Confirmed identically in the Form 5472 instructions: "This penalty applies with respect to each related party for which a failure occurs for each 30-day period (or part of a 30-day period) during which the failure continues after the 90-day period ends." There is **no statutory cap**.

**Canonical replacement sentence:**
> If the failure continues more than 90 days after the IRS mails its notice, an additional $25,000 applies **for each 30-day period (or fraction of one) that the failure continues after that 90-day window** — per related party, with no stated cap (IRC §6038A(d)(2)).

**Files stating it as a one-off / vague (MUST-FIX):**

| file:line | defect |
|---|---|
| `does-foreign-owned-llc-pay-us-tax.md:94` | "adds another $25,000" — one-off |
| `form-5472-deadline-2026.md:71` | "an additional $25,000 penalty, with further amounts for continued non-compliance" — vague |
| `form-5472-deadline-2026.md:137` | "An additional $25,000 applies if the failure continues more than 90 days" — one-off (FAQ, feeds FAQPage schema) |
| `form-5472-penalty-notice-what-to-do.md:28` | "an **additional $25,000** penalty, with further amounts accruing" — vague |
| `form-5472-penalty-notice-what-to-do.md:93` | "an additional $25,000 penalty applies. The notice starts that clock." — one-off |
| `form-5472-penalty-notice-what-to-do.md:142` | FAQ answer, one-off; feeds FAQPage schema. **Highest priority of this group.** |
| `form-5472-uae-dubai-residents-us-llc.md:38` | "adds another $25,000" — one-off |
| `wyoming-llc-foreign-owner-tax-filing.md:64` | "adds a further $25,000" — one-off |

**Files with the 30-day recurrence right but the 90-day threshold MISSING (MUST-FIX — they overstate how fast it starts):**

| file:line | defect |
|---|---|
| `form-5472-filed-late-never-filed.md:22` | "It continues at $25,000 per 30-day period **after the IRS notifies you**" → "…if you still haven't filed 90 days after the IRS mails its notice" |
| `form-5472-filed-late-never-filed.md:35` | "for each 30-day period (or part of a period) **after the IRS mails a notice**" → insert "if the failure continues more than 90 days after that notice" |
| `form-5472-canada-residents-us-llc.md:124` | "($25,000 per 30-day period **after an IRS notice**)" → "…per 30-day period once a failure runs more than 90 days past the IRS notice" |
| `form-5472-india-residents-us-llc.md:127` | same defect, same fix |

**Already correct — do not touch:** `form-5472-uk-residents-us-llc.md:99`, `amazon-fba-foreign-sellers-form-5472.md:105`, `form-5472-penalty-notice-what-to-do.md:109`.

---

### (c) Reportable-transaction regulation cite

**Verified** (law.cornell.edu/cfr/text/26/1.6038A-2 and /1.6038A-4, fetched 2026-08-19):
- **26 CFR §1.6038A-2 = "Requirement of return."** Paragraph (a)(2) defines the reportable transactions as those listed in **(b)(3) and (b)(4)**. This is the correct cite for "what is a reportable transaction."
- **26 CFR §1.6038A-4 = "Monetary penalty."** (a)(1) is the $25,000 penalty. This is the correct cite for the penalty — and it is **not** the definition of a reportable transaction.

**MUST-FIX (all three cite §1.6038A-4 for the definition):**

| file:line | change |
|---|---|
| `form-5472-canada-residents-us-llc.md:45` | "Reportable transactions under 26 CFR §1.6038A-4" → "Reportable transactions are defined in [26 CFR §1.6038A-2(b)(3)–(4)](https://www.law.cornell.edu/cfr/text/26/1.6038A-2)" |
| `form-5472-india-residents-us-llc.md:45` | "defined under 26 CFR §1.6038A-4" → same replacement |
| `form-5472-uk-residents-us-llc.md:45` | "defined in 26 CFR §1.6038A-4" → same replacement |

**Already correct:** `form-5472-dormant-llc-no-income.md:50` (cites §1.6038A-2 for the zero-transaction exception — the exception lives at §1.6038A-2(e); optionally add "(e)"). `form-5472-penalty-notice-what-to-do.md:26`, `foreign-owned-llc-filing-requirements-checklist.md:107`, `amended-form-5472-correcting-errors.md:93` all cite §1.6038A-3 for records — correct.

---

### (d) Reasonable-cause regulation cite for §6038A

**Verified**: 26 CFR §1.6038A-4(b) is headed **"Reasonable cause"** and opens "Certain failures may be excused for reasonable cause, including not timely filing Form 5472…". Treas. Reg. §301.6724-1 is the reasonable-cause regulation for the §6721/6722/6723 information-return regime (W-2 / 1099 series) — **wrong regime**. The auditor is correct.

**MUST-FIX — single occurrence:**
- `form-5472-filed-late-never-filed.md:73` — "The reasonable cause standard under **Treas. Reg. §301.6724-1**" → "The reasonable cause standard for this penalty sits in [26 CFR §1.6038A-4(b)](https://www.law.cornell.edu/cfr/text/26/1.6038A-4)". Keep the "ordinary business care and prudence" phrasing that follows.

(No other post cites §301.6724-1 — grep confirms.)

---

### (e) OBBBA 1% remittance transfer tax — IRC §4475

**Verified** (IRS/Treasury guidance on the excise tax on remittance transfers; proposed regs at 91 FR / FR doc 2026-07085; Notice 2025-55):
- 1% excise tax on remittance transfers occurring **after 31 December 2025**.
- Applies **only** where the sender hands the remittance transfer provider **cash, a money order, a cashier's check, or a similar physical instrument**.
- **Exempt**: transfers funded by withdrawal from an account held at a financial institution described in 31 U.S.C. §5312(a)(2)(A)–(H), and transfers funded with a **US-issued debit or credit card**.
- Collected by the remittance transfer provider (a money-transmitter business), not by a bank on an ordinary wire.

So an LLC wiring/ACHing its own US bank balance to the owner's foreign bank account is squarely inside the financial-institution-funded exemption. Both posts currently say the opposite.

**Correct cite is IRC §4475**, not "§4A" (audit `ac` got this wrong).

**Canonical replacement paragraph:**
> The One Big Beautiful Bill Act added a 1% federal excise tax on remittance transfers (IRC §4475) for transfers occurring after 31 December 2025. It is narrower than most summaries suggest: it applies **only** when the sender funds the transfer with cash, a money order, a cashier's check, or a similar physical instrument handed to a remittance transfer provider. Transfers funded by withdrawal from an account at a US financial institution, or with a US-issued debit or credit card, are **expressly excluded**. An ordinary wire or ACH from your LLC's own US business bank account to your foreign bank account is therefore outside the tax. Source: [IRS guidance on the remittance transfer tax](https://www.irs.gov/newsroom/treasury-irs-provide-penalty-relief-for-remittance-transfer-providers-who-fail-to-deposit-excise-tax-under-the-one-big-beautiful-bill).

**MUST-FIX:**

| file:line | action |
|---|---|
| `amazon-fba-foreign-sellers-form-5472.md:14` | delete "plus a new 2026 headache from the One Big Beautiful Bill Act's 1% remittance tax on cross-border transfers." |
| `amazon-fba-foreign-sellers-form-5472.md:26` | replace TL;DR bullet with "**The 2026 OBBBA 1% remittance tax (IRC §4475) does NOT apply** to Amazon payouts swept from your US LLC bank account to your foreign bank account — bank-funded transfers are exempt." |
| `amazon-fba-foreign-sellers-form-5472.md:79–95` | replace the whole H2 body with the canonical paragraph; **delete lines 87 and 91 entirely** (the "1% applies to the LLC-to-owner transfer" bullet and the $2,000/$5,000 worked example are both built on the wrong premise). Retitle H2 to "Does the 2026 OBBBA remittance tax hit FBA payouts?" and lead with "No, not in the usual setup." |
| `amazon-fba-foreign-sellers-form-5472.md:183–185` | replace the FAQ answer with: "No, in the usual setup. The 1% remittance transfer tax (IRC §4475) reaches only cash, money-order, or cashier's-check-funded transfers made through a remittance transfer provider. A wire or ACH from your LLC's US bank account is funded from a financial-institution account and is expressly excluded." |
| `amazon-fba-foreign-sellers-form-5472.md:193` | drop "OBBBA remittance tax" from the list of 2026 pressures. |
| `form-5472-india-residents-us-llc.md:27` | replace the TL;DR bullet with "**The 2026 US remittance excise tax (IRC §4475) does not reach ordinary bank transfers** from your LLC to your Indian account — only cash/money-order/cashier's-check remittances through a money-transmitter are taxed." |
| `form-5472-india-residents-us-llc.md:93–99` | replace the H2 body with the canonical paragraph, adapted: "If you send money from the LLC's US bank account to your Indian bank account by wire or ACH, the 1% tax does not apply. It would apply if you walked cash or a cashier's check into a money-transfer shop." **Delete** "they could be subject to the 1% tax" and "The IRS has not yet issued detailed guidance" (proposed regs were published April 2026). |

---

### (f) June-30 fiscal-year due date

**Verified** (Instructions for Form 1120, "When To File": "a corporation with a fiscal tax year ending June 30 must file by the 15th day of the 3rd month after the end of its tax year"; Instructions for Form 7004: "C corporations with tax years ending June 30 and beginning before January 1, 2026, are eligible for an automatic 7-month extension of time to file… For tax years beginning in 2026, the automatic extension period is 6 months."). The transition rule originates in P.L. 114-41 §2006(a)(3). The auditor is correct.

**MUST-FIX — `form-5472-deadline-2026.md:38`.**

Current:
> For a **fiscal-year** LLC, the due date is the 15th day of the fourth month after the end of the tax year. A tax year ending 30 June is due 15 October.

Replace with:
> For a **fiscal-year** LLC, the due date is generally the 15th day of the fourth month after the tax year ends — with one live exception. A tax year **ending 30 June that began before 1 January 2026** is due on the 15th day of the **third** month (so a year ended 30 June 2026 is due **15 September 2026**), and its automatic extension runs **seven** months, to 15 April 2027. Only a June-30 year that *begins* on or after 1 January 2026 — the first is the year ended 30 June 2027 — follows the standard fourth-month rule and the six-month extension. See the [Form 1120 instructions](https://www.irs.gov/instructions/i1120) and [Form 7004 instructions](https://www.irs.gov/instructions/i7004).

---

### (g) `form-5472-diy-vs-preparer.md:55` — entity-type / 1120-F mix-up

**Verified**: a "reporting corporation" is either a 25%-foreign-owned **domestic** corporation (including a foreign-owned DE, which uses the pro forma 1120) or a **foreign** corporation engaged in a US trade or business — and the foreign corporation attaches its Form 5472 to **Form 1120-F**, not Form 1120. The post has the pairing backwards.

Current line 55 (second sentence):
> Some DIY filers confuse this with the Form 5472 filed by foreign corporations, which uses a real Form 1120 — an entirely different return.

Replace with:
> Some DIY filers confuse this with two other Form 5472 filings: a 25%-foreign-owned **domestic** US corporation with real income attaches its Form 5472 to an actual (non-pro-forma) Form 1120, and a **foreign** corporation engaged in a US trade or business attaches its Form 5472 to **Form 1120-F**. Different returns, different filing routes.

---

### (h) `amended-form-5472-correcting-errors.md:3` — meta description 156 chars

Current (156):
> Found an error after filing Form 5472? The IRS has no amendment procedure — see the practitioner fix and why an incomplete form risks the $25,000 penalty.

Replace with (150 chars):
> Found an error after filing Form 5472? The IRS has no amendment procedure — here's the fix preparers use, and why an incomplete form risks $25,000.

---

### (i) `extractFaqs()` in `src/lib/blog.ts` — FAQ answer bleed

**Confirmed defect.** `extractFaqs()` (src/lib/blog.ts, ~line 297) only ends an answer on the next `##`, `###`, or whole-line-bold. When the FAQ H2 is the last H2 in the file — which it is in most posts — everything after the last question (the `---` rule, the closing paragraph, the CTA link, disclaimers) is folded into the final answer and shipped as FAQPage JSON-LD.

I ran the current implementation over all 45 files. **18 published posts are currently emitting a corrupted final answer**: `amended-form-5472-correcting-errors` (89 words), `california-llc-foreign-owner-tax-filing` (61), `delaware-llc-foreign-owner-tax-filing` (65), `does-foreign-owned-llc-pay-us-tax` (86), `ein-for-foreign-owned-llc-without-ssn` (91), `florida-llc-foreign-owner-tax-filing` (63), `foreign-owned-llc-filing-requirements-checklist` (86), `form-5472-change-of-ownership` (69), `form-5472-deadline-2026` (86), `form-5472-penalty-notice-what-to-do` (108), `form-5472-uae-dubai-residents-us-llc` (72), `form-5472-uk-residents-us-llc` (73 — swallows "Last reviewed: May 2026" and the whole disclaimer), `how-to-fill-out-form-5472` (68), `multi-member-llc-form-5472-or-1065` (83), `texas-llc-foreign-owner-tax-filing` (64), `what-is-form-5472` (74), `wyoming-llc-foreign-owner-tax-filing` (82). Several answers ship a `/start` CTA link inside the schema answer text.

**Fix this in code, not in content** — it repairs all 18 at once with no editorial risk.

#### Spec

Inside `extractFaqs()`, keep the existing H2 / H3 / whole-line-bold handling and add two terminators:

1. **Horizontal rule ends the FAQ section.** When `inFaq` is true and a trimmed line matches `/^(-{3,}|\*{3,}|_{3,})$/`, flush the pending Q&A and set `inFaq = false`. (Order matters: test this *after* the `##` test so an H2 still wins, and *before* the whole-line-bold test so `***` is never read as bold.)
2. **Cap each answer at its first paragraph.** Track a per-question `started` flag. While a question is open: a non-blank line sets `started = true` and is appended; a blank line **after** `started` closes the answer (set a `done` flag — stop appending until the next question or terminator). Blank lines *before* any answer text are ignored, so the blank line that normally sits between an `###` heading and its answer is harmless.

Both flags reset in `flush()`.

Reference implementation of the changed loop body:

```ts
for (const line of body.split("\n")) {
  const t = line.trim();
  const h2 = line.match(/^##\s+(.*)/);
  if (h2) {
    flush();
    inFaq = /frequently asked|faq|common questions/i.test(h2[1]);
    continue;
  }
  if (!inFaq) continue;
  if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { // horizontal rule closes the section
    flush();
    inFaq = false;
    continue;
  }
  const h3 = line.match(/^###\s+(.*)/);
  const bold = t.match(/^\*\*(.+?)\*\*$/);
  if (h3) { flush(); q = h3[1]; }
  else if (bold) { flush(); q = bold[1]; }
  else if (q && !done) {
    if (t === "") { if (started) done = true; }
    else { started = true; ans.push(line); }
  }
}
```

**Verified impact** (I ran this exact logic over all 45 posts): question counts are **identical** to the current implementation in every file — no FAQ is lost — and every one of the 18 bleeding answers drops to a clean ≤50-word answer, except `what-is-form-5472` (74 words), which is a genuinely long single paragraph and is a content trim, not a code bug.

**Known trade-off:** any FAQ answer deliberately written as two paragraphs, or as a paragraph followed by a bullet list, will now be truncated to the first paragraph in the JSON-LD (the rendered page is unaffected). No current post relies on that, but it is worth a comment in the code.

#### Vitest cases (add to the existing `extractFaqs` suite)

```ts
import { describe, it, expect } from "vitest";
import { extractFaqs } from "@/lib/blog";

describe("extractFaqs", () => {
  it("stops the FAQ section at a horizontal rule, not just the next H2", () => {
    const body = [
      "## Frequently asked questions",
      "",
      "### Do I need an EIN?",
      "",
      "Yes. The LLC needs its own EIN.",
      "",
      "---",
      "",
      "The bottom line: file it.",
      "",
      "[File it here](/start?utm_source=blog)",
    ].join("\n");
    expect(extractFaqs(body)).toEqual([
      { q: "Do I need an EIN?", a: "Yes. The LLC needs its own EIN." },
    ]);
  });

  it("caps an answer at its first paragraph when the FAQ is the last section", () => {
    const body = [
      "## FAQ",
      "",
      "**Is a dormant LLC exempt?**",
      "",
      "No. A capital contribution is still a reportable transaction.",
      "",
      "Filing takes about fifteen minutes and costs $149.",
    ].join("\n");
    expect(extractFaqs(body)).toEqual([
      {
        q: "Is a dormant LLC exempt?",
        a: "No. A capital contribution is still a reportable transaction.",
      },
    ]);
  });

  it("still extracts every question and is unaffected by the blank line under a heading", () => {
    const body = [
      "## Common questions",
      "",
      "### First?",
      "",
      "Answer one.",
      "",
      "### Second?",
      "",
      "Answer two.",
      "",
      "## The bottom line",
      "",
      "Trailing prose that must not appear in any answer.",
    ].join("\n");
    expect(extractFaqs(body)).toEqual([
      { q: "First?", a: "Answer one." },
      { q: "Second?", a: "Answer two." },
    ]);
  });
});
```

---

## Per-file fixes

Ordered alphabetically. Line numbers are working-tree as of 2026-08-19; re-grep before editing if earlier fixes shift them.

### amazon-fba-foreign-sellers-form-5472
- **:14, :26, :79–95, :183–185, :193** — remittance-tax rewrite per rule (e). Delete the $2,000/$5,000 worked example at :91 and the "1% applies to the distribution step" bullet at :87.
- **:20–29 (P1, missing early /start)** — the only `/start` link is line 197. Add after the TL;DR block: "If the federal filing is the part you want handled, [start your Form 5472 filing](/start?utm_source=blog&utm_medium=internal&utm_campaign=amazon-fba-foreign-sellers-form-5472) — about 15 minutes."
- **whole file (P1, zero external links)** — confirmed 0 hyperlinks. Add at minimum: `https://www.irs.gov/instructions/i5472` at the §6038A(d) penalty mention (:14), the IRS remittance-tax guidance URL in the rewritten §4475 section, and an explicit link for the EcomCPA source named at :105.
- **whole file (P1, no pricing, no disclaimer)** — confirmed `$149` appears 0 times. Before the final CTA (~:189) add: "Standard filing is $149 and is ready in 5-7 business days; Express is $199 and is ready within 3 business days. Each additional past tax year is +$99. IRS fax delivery is included on both. We are not a CPA firm and do not give tax advice."
- **:105 / :26 (P1, unsourced enforcement claim)** — "IRS enforcement is automated in 2026 … not manually reviewed" is sourced only to a third-party blog. Either attribute in-text ("per EcomCPA's June 2026 analysis, [link]") or soften to "practitioners report faster, more automated notice generation".

### amended-form-5472-correcting-errors
- **:3** — meta description → the 150-char replacement in rule (h).
- **:63** — "FTIN or reference ID" → "and" phrasing per rule (a).
- **:65 (P2, one-line)** — literal `[date]` placeholder → "originally filed on the date shown on your fax confirmation receipt".
- FAQ bleed at the close is fixed by the code change; no content edit needed.

### california-llc-foreign-owner-tax-filing
- No content edits required. FAQ bleed fixed by the code change.

### delaware-llc-foreign-owner-tax-filing
- No content edits required. FAQ bleed fixed by the code change.

### does-foreign-owned-llc-pay-us-tax
- **:94** — continuation penalty per rule (b).
- **:11 (P1)** — bold lead is ~66 words (target 40–60); trim to ~55 and append "(IRC §6038A(d))" after "$25,000 penalty".
- **:33–35 or :81 (P1)** — only 1 external link in the whole post. Add a second, e.g. IRS Pub. 519 near the ECI/FDAP discussion.
- **:81 (P2, one-line)** — append ", and ending on or after December 13, 2017" to the §1.6038A-1 effective-date sentence.

### ein-for-foreign-owned-llc-without-ssn
- **:95** — FTIN/reference-ID "and" correction per rule (a).
- **:23** — "roughly six to eleven weeks" for ITIN → "roughly seven to eleven weeks" (IRS.gov: 7 weeks standard, 9–11 weeks in season or from overseas), and add "(per IRS.gov)" or a link at first mention.
- **:11 (P1)** — lead is 62 words; trim to ~55.
- **:23, :36, :78, :103 (P1)** — timing claims ("six to eleven weeks", "roughly 4 business days") carry no inline citation. Add one at first mention of each.
- **:107 (P1, single primary CTA)** — the post closes with `/ein` **or** `/start` as two equal-weight links. Keep `/ein` as the only bracketed CTA; demote the 5472 mention to plain prose.
- **whole file (P1)** — only `/start` link is at :107, past the halfway point. Add an early `/ein` CTA is already present; ensure the early-conversion requirement is met with `/ein` in the first screen.
- **whole file (P1)** — no in-body "2026" reference; add one naturally in the closing section.

### florida-llc-foreign-owner-tax-filing
- **after :46 (P1)** — confirmed: the string "25,000" does not appear anywhere in this post, on a post whose whole premise is federal 5472 risk. Add: "A late, incomplete, or unfiled Form 5472 draws a $25,000 penalty per form per year under IRC §6038A(d), and $25,000 more for each 30-day period the failure continues past 90 days after an IRS notice ([IRS Form 5472 instructions](https://www.irs.gov/instructions/i5472))."
- **:30 vs :102–106 (P2, one-line)** — delete the duplicated "no Delaware-style franchise tax" sentences at :30; keep the dedicated H2.

### foreign-owned-llc-filing-requirements-checklist
- **:99** — FTIN/reference-ID "and" correction per rule (a).
- **:81–84 (P1)** — Wyoming ($60 / $0.0002), Delaware ($300, June 1) and Florida state-fee figures have no inline source. Add one citation link per bullet (Wyoming SOS fee page, Delaware Division of Corporations, Sunbiz).
- **:11 (P2, one-line)** — 75-word bolded lead; move the last sentence ("A US income tax return is required only if…") out of the bold into the body.
- **:36 (P2, one-line)** — append ", and ending on or after December 13, 2017".

### form-5472-canada-residents-us-llc
- **:12** — FTIN/reference-ID rewrite per rule (a).
- **:45** — §1.6038A-4 → §1.6038A-2(b)(3)–(4) per rule (c).
- **:71** — delete the invented "checkbox to explain why no FTIN is available" per rule (a).
- **:124** — add the 90-day threshold per rule (b); and soften "Most Canadian founders … qualify for reasonable cause abatement" to "Reasonable cause relief is decided on the facts and circumstances; not knowing about the requirement is a commonly cited factor, but relief is not automatic."
- **:20–28 (P1)** — the only `/start` link is line 160. Add one in the TL;DR block.
- **whole file (P1)** — only 1 external link; add irs.gov links at the Form 7004 mention (:27/:116) and the §6038A(d) penalty (:14).
- **near :160 (P1)** — confirmed no pricing anywhere. Add the standard pricing + "not a CPA firm" sentence.
- **:136–138 (P2, one-line)** — FAQ answer 65 words; drop the closing sentence.

### form-5472-change-of-ownership
- **:36, :66 (P1)** — hyperlink "IRS single-member LLC page" → `https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies` and "IRS SS-4 instructions" → `https://www.irs.gov/instructions/iss4`.
- **:132–134 (P1)** — FAQ answer 69 words; trim to ≤50.
- FAQ bleed fixed by the code change.

### form-5472-cost
- **:11** — in-body "**Last updated: July 2026**" conflicts with frontmatter `updated: 2026-08-14`. Change to "August 2026" or delete the line (the frontmatter drives the displayed date).
- **:13, :27, :81 (P1)** — "$600 to $750" CPA range repeated 3× with no named source. Name and link at least one published CPA pricing page, or reframe as "our August 2026 review of published CPA pricing pages commonly showed $600–$750".
- **:13 (P1)** — bolded lead is ~85 words; cut to the core claim ($0 IRS fee / $149 start / $25,000 penalty).
- **:83–85, :87–89 (P2, one-line each)** — FAQ answers 56 and 58 words; trim each by a clause.
- **near :99 (P1)** — no "not a CPA firm" disclaimer; add one to the pricing paragraph.

### form-5472-currency-conversion-exchange-rates
- **:129–131 (P2, one-line)** — FAQ answer 51 words; trim one clause.
- Links to the two unpublished slugs at :80 and :133 are **dropped** per the filtering rule.

### form-5472-deadline-2026
- **:38** — June-30 fiscal-year rewrite per rule (f).
- **:71, :137** — continuation penalty per rule (b).
- **:13 (P2, one-line)** — add "(IRC §6038A(d))" at the first "$25,000 penalty" mention.
- **:133 (P2, one-line)** — FAQ answer 57 words; trim.

### form-5472-diy-vs-preparer
- **:55** — entity-type / 1120-F correction per rule (g).
- **:45 (P1)** — "The IRS instructions for Form 5472 are available at irs.gov" is unlinked plain text, and the post has **zero** external links. Hyperlink it to `https://www.irs.gov/instructions/i5472` and add a second irs.gov link at the fax-number sentence (:169).
- **:18 (P1)** — only `/start` link is line 183. Add an early CTA after "Here's the full breakdown".
- **:102–104 (P1)** — competitor price ranges ($300–$700 / $225–$400 / $25–$100) stated as fact with no source. Attribute ("based on our review of publicly listed pricing, August 2026") or soften to qualitative.
- **:173 (P1)** — "typically 6–18 months after filing" — unsourced false precision. Rephrase as "can take well over a year".
- **:27 (P2, one-line)** — "3–8 hours first time" / "15–30 minutes on your end" — add "roughly" or state the basis.
- **whole file (P1)** — no "not a CPA firm" disclaimer; add one near the pricing.

### form-5472-dormant-llc-no-income
- **:126 (P1)** — rewrite to lead with IRC §6501(c)(8): an unfiled Form 5472 keeps the assessment window open on the **entire return** until three years after the form is actually filed — not capped at 3/6 years. Then: "In practice, DIIRSP submissions commonly cover the last six years — a practitioner convention, not a published IRS lookback."
- **:128–130 (P1)** — first-time abatement overstated. Replace with: "Limited first-time abatement may apply where it is tied to abatement of the related Form 1120 late-filing penalty and you have a clean three-year history; reasonable-cause abatement under 26 CFR §1.6038A-4(b) is the more commonly available route for a standalone Form 5472 penalty."
- **near :93 (P1)** — confirmed no pricing anywhere. Add: "Standard filing is $149 (5-7 business days), Express $199 (3 business days), +$99 per additional past tax year — IRS fax delivery included on both."
- **:20–28 and :134–140 (P1)** — `/start` appears exactly once, at :93; `/diirsp` is the link in both the opener and the close. Add a `/start` link early and at the true close.
- **:50, :87–91 (P1)** — only 1 external link. Hyperlink "26 CFR §1.6038A-2" and add the IRS DIIRSP page link.
- **:112–114, :120–122, :124–126 (P2, one-line each)** — FAQ answers 59 / 53 / 52 words; trim to ≤50.

### form-5472-extension
- **:11 (P1 — NOT in any source audit; found in this consolidation)** — in-body "**Last updated: July 2026**" conflicts with frontmatter `updated: 2026-08-14`. Change to "August 2026" or delete the line.
- **:13–19 (P2, one-line)** — pull the $25,000 / IRC §6038A(d) figure from :51 into the opening so a sourced stat lands inside the first 30%.
- **whole file (P1)** — no "not a CPA firm" disclaimer near the pricing at :63; add one.

### form-5472-filed-late-never-filed
- **:22, :35** — add the 90-day threshold per rule (b).
- **:73** — §301.6724-1 → 26 CFR §1.6038A-4(b) per rule (d).
- **:65 (P1)** — "In practice, DIIRSP submissions typically cover the last six years" — soften to "Many practitioners cover the last six years as a rule of thumb; the IRS publishes no DIIRSP lookback period."
- **:20–27 (P1)** — first internal link of any kind is at :126; the only `/start` is at :162. Add a `/start` or `/diirsp` link in the TL;DR block.
- **:32–35, :73 (P1)** — only 1 external link; hyperlink IRC §6038A(d) and the corrected §1.6038A-4(b) cite.
- **:132–134, :144–146 (P2, one-line each)** — FAQ answers 58 and 54 words; trim.
- **:140–142 (P2, one-line)** — add "for calendar-year filers reporting the 2025 tax year" so a current-year reference appears in body prose.

### form-5472-foreign-corporate-owner
- **:19 (P2, one-line)** — append ", and ending on or after December 13, 2017" to the 2017 effective-date sentence.
- The `multiple-related-parties-form-5472` link findings at :108 and :146 are **dropped** per the filtering rule.

### form-5472-france-residents-us-llc
- **:29 (P1)** — deadline sentence has no inline citation. Add a link to `https://www.irs.gov/instructions/i5472` or to `/blog/form-5472-deadline-2026`.
- **:106 (P1)** — hyperlink "the instructions" to `https://www.irs.gov/instructions/i5472`.
- **:35 (P2, one-line)** — expand SPI on first use.

### form-5472-germany-residents-us-llc
- **:114 (P1)** — the `esth.bundesfinanzministerium.de` citation is a Radware bot-challenge page; its content cannot be verified. Replace with `https://www.gesetze-im-internet.de/estg/__1.html` (machine-readable §1 EStG), keeping the same claim.
- **:29 (P1)** — deadline sentence needs an inline citation.
- **:97 (P1)** — hyperlink "IRS instructions" at the fax/DPI sentence.
- **:138 (P2, one-line)** — FAQ says "Steuer-ID" while the body says "IdNr"; standardize.

### form-5472-india-residents-us-llc
- **:12** — FTIN/reference-ID rewrite per rule (a).
- **:45** — §1.6038A-4 → §1.6038A-2(b)(3)–(4) per rule (c).
- **:27, :93–99** — remittance-tax rewrite per rule (e).
- **:127** — add the 90-day threshold per rule (b), and soften "Most India-based LLC owners … qualify for penalty abatement under reasonable cause" to "can present a reasonable-cause case, though relief is evaluated individually and is not automatic."
- **:85 (P1)** — "the Treasury Department issued a **final rule**" → "**interim final rule**" (FinCEN IFR, effective 26 March 2025).
- **:20–29 (P1)** — the only `/start` link is at :163. Add an early CTA in the TL;DR.
- **whole file (P1)** — only 1 external link. Add: the corrected §1.6038A-2 cite, the FinCEN BOI IFR, and the IRS remittance-tax guidance page.
- **near :163 (P1)** — confirmed no pricing anywhere. Add the standard pricing paragraph.
- **whole file (P1)** — no "not a CPA firm" disclaimer; add one (the Netherlands post has it at :61).
- **:14, :22, :26, :157 (P2)** — add "(IRC §6038A(d))" at one more $25,000 mention.
- **:3 (P2, one-line)** — description is 154/155 chars; trim ~10 chars for margin.

### form-5472-netherlands-residents-us-llc
- **:29 (P1)** — deadline claim needs an inline citation to the IRS instructions.
- **:84–93 (P2, one-line)** — name the IRS yearly-average-exchange-rates page as the recommended rate source.
- **:142 (P2, one-line)** — expand "KvK (Dutch Chamber of Commerce)" on first use.

### form-5472-penalty-notice-what-to-do
- **:28, :93, :142** — continuation penalty per rule (b). :142 is the FAQ answer and feeds FAQPage JSON-LD — do this one first.
- **:2 (P1)** — title is 62 chars. Replace with "I Got a $25,000 Form 5472 Penalty Notice — Now What?" (52 chars).
- **:104, :158 (P1)** — "six to twelve months" reply-time claim, unsourced, stated twice. Attribute (e.g. Taxpayer Advocate Service reporting) or soften to "commonly many months".
- **near :86 or :162 (P1)** — no link to `/blog/form-5472-reasonable-cause-letter` despite an entire section on the topic and a reciprocal link from that post. Add: "For a full walkthrough of the letter itself, see [our reasonable cause letter guide](/blog/form-5472-reasonable-cause-letter)."
- **:3 (P2, one-line)** — description reads as a topic list. Replace with: "Got a $25,000 Form 5472 penalty notice? Here's what CP215 means, why a reasonable-cause letter gets ignored, and how to respond before the deadline."

### form-5472-reasonable-cause-letter
- **:3 (P1)** — description states the answer with no click-reason. Replace with: "A Form 5472 reasonable cause letter needs a dated, evidence-backed account of ordinary care — here's exactly what to include and what the IRS actually credits."

### form-5472-reportable-transactions-examples
- **:24 (P0)** — "A 100% foreign owner is related" is presented as *the* related-party test before the 100%-ownership scoping note at :29. The statutory threshold is any direct or indirect **25%** foreign shareholder. Replace with: "**Was the other person a related party?** Any foreign shareholder with at least 25% direct or indirect ownership is a related party — in the 100%-owner setup used throughout this article, that threshold is met automatically. An unrelated customer, contractor, processor, or landlord usually is not."
- **:90 (P1)** — "The stated penalty is $25,000" has no source. Append "(IRC §6038A(d); [IRS Form 5472 instructions](https://www.irs.gov/instructions/i5472))".
- **:51–55 (P1)** — no link to any related post. Add a contextual link to `/blog/form-5472-saas-founders`.
- Thin — see the expansion group below.

### form-5472-saas-founders
- **:12** — "**Last updated: July 2026**" conflicts with frontmatter `updated: 2026-08-10`. Change to "August 2026" or delete.
- **:24–34 (P1)** — no link to any related post. Add a contextual link to `/blog/form-5472-reportable-transactions-examples`.
- **whole file (P1)** — no sourced statistic anywhere. Add one sourced figure (e.g. the $25,000 penalty with its IRC §6038A(d) cite and an irs.gov link) inside the first 30%.
- Thin — see the expansion group below.

### form-5472-singapore-residents-us-llc
- **:28 (P2, one-line)** — add an inline citation at the deadline sentence.

### form-5472-uae-dubai-residents-us-llc
- **:11, :128** — FTIN/reference-ID rewrite per rule (a) (the "leave the FTIN blank" instruction is the wrong rule).
- **:38** — continuation penalty per rule (b).
- **:52 (P1)** — H2 does not lead with its answer. Open the section with: "Write 'None' in the FTIN block and enter a self-assigned reference ID number on line 4b(2) — the UAE issues individuals no personal tax identification number."
- **whole file (P1)** — only 1 external link, and the load-bearing "no US–UAE treaty" claim (repeated at :11, :42–50, :122–124) is never sourced. Add `https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z` at :42, and source the UAE corporate-tax figures at :78 to mof.gov.ae or Federal Decree-Law No. 47 of 2022.
- **whole file (P1)** — zero markdown tables (`grep -c "^|"` = 0) despite table-friendly content at :44–50 and :58–61. Convert the Part II line-4b breakdown into a table, matching the Singapore/Netherlands siblings.
- **:11 (P1)** — bolded lead is 70 words; trim to ~55 while applying the FTIN fix.
- **:96 (P1)** — add a small AED→USD worked table mirroring the Singapore SGD example.
- **:100 (P1)** — no reader-facing current-year statement; state "15 April 2026" / "15 October 2026" explicitly.
- **:78, :96, :48 (P2)** — 9% / AED 375,000 / 1 June 2023, the 3.6725 peg, and the 30% FDAP rate all lack a named source. Name "UAE Federal Decree-Law No. 47 of 2022" and "IRC §871(a)" inline.
- The three link findings at :70 and :86 are **dropped** per the filtering rule.

### form-5472-uk-residents-us-llc
- **:11** — FTIN/reference-ID rewrite per rule (a).
- **:45** — §1.6038A-4 → §1.6038A-2(b)(3)–(4) per rule (c), and add an external citation next to the corrected claim.
- **:127, :165** — "This post reflects the status as of **May 2026**" and "*Last reviewed: May 2026*" both conflict with frontmatter `updated: 2026-08-14`. Update both to August 2026 or delete them (deleting :165 is preferable — no sibling post carries one).
- **:29–40 (P1)** — no conversion link in the first 30%; the only `/start` is at :115. Add an early `/start` link.
- **whole file (P1)** — confirmed zero `/blog/` links. Add a link to `/blog/what-is-form-5472` and/or `/blog/form-5472-filed-late-never-filed`.
- **:163–169 (P1)** — the close has no CTA, only a disclaimer. Add a `/start` CTA after the FAQ.
- **:143–145, :151–153 (P1)** — two FAQ answers ~70 words; trim to ≤50.
- **:113 (P2, one-line)** — "Plans from $149 — IRS fax delivery included" omits Express and the +$99 year. Align with the sibling posts' fuller statement.
- **:99** is already correct on the continuation penalty — leave it.

### how-to-fax-form-5472-irs
- No edits required (its sole P0 was a link to an unpublished slug).

### how-to-fill-out-form-5472
- **:91, :157, :188** — FTIN/reference-ID rewrites per rule (a).
- **:11 (P1)** — no sourced numeric stat in the first 30% (first hard figure is at :142). Work "$25,000 penalty under IRC §6038A(d)" plus an irs.gov link into the line-11 answer or the :19–31 documents list.
- **:142 (P2)** — the phrase "constitutes a failure to file Form 5472" is presented as a direct IRS quote but could not be surfaced verbatim in the current instructions. Either re-verify against the instructions PDF or de-quote it into a paraphrase.
- The three link findings at :28, :75, :89 are **dropped** per the filtering rule.

### multi-member-llc-form-5472-or-1065
- **:11 (P1)** — no sourced numeric stat before the 30% mark (37%/21% at :53, $25,000 at :77). Pull one figure into the opening paragraph.
- The `multiple-related-parties-form-5472` link at :75 is **dropped** per the filtering rule.

### pro-forma-form-1120-foreign-owned-llc
- **:11–13 or :17–23 (P1)** — the $25,000 IRC §6038A(d) penalty is never mentioned in this ~2,150-word post (confirmed: no "25,000" in the file), even though it is the risk that motivates the whole package. Add one sourced sentence.
- **:15, :21, :71, :84, :101 (P1)** — the identical `irs.gov/instructions/i5472` URL is cited five times. Vary at least one to the eCFR/Cornell §1.6038A-2 page.
- The `itin-required-form-5472` link at :184 is **dropped** per the filtering rule.

### stripe-paypal-wise-form-5472
- **:12** — "**Last updated: July 2026**" conflicts with frontmatter `updated: 2026-08-03`. Change to "August 2026" or delete.
- **:14 (P1)** — the direct-answer lead is plain text, not bolded, unlike every sibling post. Wrap it in `**…**`.
- **whole file (P1)** — confirmed zero `/blog/` links. Add a link to `/blog/form-5472-currency-conversion-exchange-rates` or `/blog/form-5472-reportable-transactions-examples`.
- Thin — see the expansion group below.

### texas-llc-foreign-owner-tax-filing
- **:143** — "foreign identifier **or** reference ID" → "and" phrasing per rule (a).
- FAQ bleed fixed by the code change. The comptroller.texas.gov findings are **dropped**.

### what-is-form-5472
- **:106** — FTIN/reference-ID rewrite per rule (a).
- **:17–23 (P1)** — confirmed: **no `/start` link anywhere in the post**. Add an early `/start` link in the "30-second version" section, and change the bare `[Form5472 Prep does](/)` at :120 to `/start?utm_source=blog&utm_medium=internal&utm_campaign=what-is-form-5472`.
- **:116–120 (P1)** — confirmed zero `/blog/` links. Add links to `/blog/how-to-fill-out-form-5472` and `/blog/form-5472-deadline-2026`.
- **:65, :96–98 (P1)** — only 1 external link. Add `https://www.irs.gov/instructions/i5472` at the penalty and fax-number claims.
- **:112–114 (P1)** — "A US CPA typically charges $400–$800" has no source. Attribute or drop the figures. (Note the same paragraph is the last FAQ answer, 74 words even after the code fix — trim it to ≤50 while you are there.)
- **:11 (P2, one-line)** — bolded lead is ~70 words; trim to two tighter sentences.
- **whole file (P1)** — no "not a CPA firm" disclaimer; add one near the pricing.

### wyoming-llc-foreign-owner-tax-filing
- **:64** — continuation penalty per rule (b).
- **:93** — "foreign tax ID **or** reference ID" → "and" phrasing per rule (a).
- **:42 (P1)** — the post tells readers to "confirm the current amount on the Wyoming Secretary of State's own site" but gives no link. Add a direct hyperlink to the current WY SOS annual-report/license-tax page (verify it resolves — `sos.wyo.gov/Business/AnnualReports.aspx` 404'd during the audit).
- **:58 (P2, one-line)** — append ", and ending on or after December 13, 2017".
- **:11 (P2, one-line)** — ~80-word bolded lead; split into two sentences.

---

## Thin-post EXPANSIONS

Body word counts measured on the working tree (frontmatter excluded). The addendum bar is ≥1,200 words for narrow how-to/topic posts. Four published posts fail:

| slug | current | target | what to add |
|---|---|---|---|
| `first-year-form-5472-new-llc` | **711** | 1,300 | (i) A worked first-year dollar example: $2,000 owner capital in, $850 of personally-paid formation costs, $0 revenue → exactly what Part IV/Part V show, and the line 1f/1h totals. The table at :28–34 lists categories but never walks numbers. (ii) A "formed in November, first tax year is 6 weeks long" short-year section. (iii) Expand the FAQ from 4 to 6 questions ("Does a first-year LLC file if it was never funded?", "What if the EIN didn't arrive before year-end?"). (iv) Add the two missing related-post links (`/blog/does-foreign-owned-llc-pay-us-tax` near :18–20, `/blog/ein-for-foreign-owned-llc-without-ssn` near :44–49). Also fix **:12** ("Last updated: July 2026" vs frontmatter `updated: 2026-08-17`) and **:14** (unbolded lead → wrap in `**…**`). |
| `form-5472-saas-founders` | **722** | 1,300 | Expand "Which SaaS transactions belong on Form 5472?" (:24–34) and "What records should a SaaS founder collect?" (:42–54) with a concrete Stripe-payout-vs-founder-withdrawal walkthrough: gross Stripe volume → processor fees → net payout to the LLC account → owner draw, showing which single line of that chain is reportable and which are not. Add a worked Part V statement. ~+550 words. |
| `stripe-paypal-wise-form-5472` | **803** | 1,300 | Add (i) a worked numeric reconciliation: a month of Stripe gross, refunds, fees and payouts against the owner-draw ledger, ending in the Part V figure; (ii) a Wise multi-currency section tied to `/blog/form-5472-currency-conversion-exchange-rates`; (iii) a documentation/recordkeeping subsection (which exports to keep and for how long). ~+500 words. |
| `form-5472-reportable-transactions-examples` | **997** | 1,300 | Add one more worked example or short case study (~+250 words) — e.g. an owner who paid a supplier personally and was reimbursed, and how that lands in Part V — plus the related-post link to `/blog/form-5472-saas-founders`. |

**Rejected thin-post claims:** `form-5472-diy-vs-preparer` (audit ab says 1,021 words — actual body is **2,169**), `form-5472-dormant-llc-no-income` (audit ab says 846 — actual **1,619**), `what-is-form-5472` (**1,579**), `form-5472-extension` (**1,386**). All four clear the bar; do not expand them. The audits were reading pre-expansion copies.

---

## Optional P2

One-line fixes only; none are blocking.

- Append ", and ending on or after December 13, 2017" to the §1.6038A-1 / T.D. 9796 effective-date sentence in: `does-foreign-owned-llc-pay-us-tax:81`, `foreign-owned-llc-filing-requirements-checklist:36`, `form-5472-foreign-corporate-owner:19`, `form-5472-uae-dubai-residents-us-llc:27`, `wyoming-llc-foreign-owner-tax-filing:58`.
- FAQ answers still over the ≤50-word guideline after the code fix (trim one clause each): `amazon-fba…:165, :183`, `form-5472-cost:83, :87`, `form-5472-currency-conversion…:129`, `form-5472-dormant-llc-no-income:112, :120, :124`, `form-5472-filed-late-never-filed:132, :144`, `form-5472-deadline-2026:133`, `form-5472-canada-residents-us-llc:136`, `what-is-form-5472` (last FAQ, 74 words).
- Anchor-text / source-diversity polish: `california-llc…` (FTB index page cited 5×), `delaware-llc…` (corp.delaware.gov 3×).
- `form-5472-australia-residents-us-llc:144` — add an `/itin` cross-link.
- `form-5472-singapore-residents-us-llc:133` — move the `/ein` mention out of the primary pricing paragraph.
- `form-5472-netherlands-residents-us-llc:13` vs `:164` — two different `utm_campaign` values; confirm both are tracked.
- `form-5472-penalty-notice-what-to-do:122` — the one non-question-form H2; cosmetic.
- `form-5472-uae-dubai-residents-us-llc:62` — a natural person trading above the UAE corporate-tax threshold can hold a TRN in a business capacity; add a brief caveat.
- `form-5472-uk-residents-us-llc` — `---` horizontal-rule dividers throughout (:17, 27, 41, 63, 80, 93, 107, 117, 129, 139, 163, 167) are a convention no other post uses. **Do not remove the one immediately after the FAQ** — under the new `extractFaqs()` it is a useful section terminator.
- `amended-form-5472-correcting-errors:2` — title lacks the literal query term "amended"; consider "How to File an Amended Form 5472 (Correcting a Mistake)".
- `first-year-form-5472-new-llc:2` — title is exactly 60 chars; trim 2–3 for SERP margin.
- `form-5472-amazon…:115–149` — convert the bold "Step 1…Step 5" labels to a real numbered list.
- Unpublished posts (fix before their `publishAt` fires, not now): `final-form-5472-closing-foreign-owned-llc:12`, `form-5472-ftin-reference-id-foreign-address:12`, `form-5472-owner-loans-contributions-reimbursements:12`, `form-5472-recordkeeping-checklist:12`, `itin-required-form-5472:12`, `multiple-related-parties-form-5472:12` all carry "**Last updated: July 2026**" against frontmatter `updated` dates in August–September 2026. All six are also under 800 words.

---

## Verification log

Primary sources fetched 2026-08-19: `irs.gov/instructions/i5472` (FTIN / reference ID, continuation penalty), `irs.gov/instructions/i1120` (June-30 third-month rule), `irs.gov/instructions/i7004` (June-30 seven-month extension and the "beginning before January 1, 2026" transition), `law.cornell.edu/uscode/text/26/6038A` (d)(1)-(2), `law.cornell.edu/cfr/text/26/1.6038A-2` (title "Requirement of return"; reportable transactions at (b)(3)-(4)), `law.cornell.edu/cfr/text/26/1.6038A-4` (title "Monetary penalty"; (b) "Reasonable cause"), IRS/Treasury guidance on the IRC §4475 remittance transfer tax. eCFR was unreachable (302 to an unblock interstitial); Cornell LII used instead.

Rejected auditor claims and why:
1. **"IRC §4A" for the remittance tax** (audit ac, india post) — the OBBBA provision is **IRC §4475**. Substance of the exemption was right; the citation was not.
2. **"Change §1.6038A-4 to §1.6038A-1"** (audit ab, canada post) — §1.6038A-1 is definitions/general rules; the reportable-transaction list is in **§1.6038A-2(b)(3)–(4)**. Audit ad got this right; ab did not.
3. **Word counts for `form-5472-diy-vs-preparer` (1,021), `form-5472-dormant-llc-no-income` (846), `stripe-paypal-wise-form-5472` (852)** — actual working-tree body counts are 2,169 / 1,619 / 803. Two of the three "thin post" calls are wrong; only stripe is genuinely thin (and thinner than claimed).
4. **All "internal link 404" P0s** — these are `publishAt`-gated future posts, already handled by the render guard. Not defects.
5. **`does-foreign-owned-llc-pay-us-tax` and `ein-for-foreign-owned-llc-without-ssn` FAQ bleed treated as per-post content fixes** — correct diagnosis, wrong remedy scope. The bug affects **18** posts and belongs in `extractFaqs()`.
