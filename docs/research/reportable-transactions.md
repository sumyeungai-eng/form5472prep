# Research note — Form 5472 reportable-transactions checker

Generated 2026-09-29 from `src/lib/tools/reportable-transactions/sources.ts` (the source of truth;
each quote copied verbatim from the URL on 2026-09-29) and `transactions.ts`. Regenerate rather than hand-edit.

## Sources

### reg2A1 — Treas. Reg. §1.6038A-2(a)(1)

- URL: https://www.ecfr.gov/current/title-26/section-1.6038A-2#p-1.6038A-2(a)(1)
- Quote: "Each reporting corporation … shall make a separate annual information return on Form 5472 with respect to each related party as defined in § 1.6038A-1(d) with which the reporting corporation … has had any reportable transaction during the taxable year."

### reg2B3Sales — Treas. Reg. §1.6038A-2(b)(3)(i)–(iv)

- URL: https://www.ecfr.gov/current/title-26/section-1.6038A-2#p-1.6038A-2(b)(3)
- Quote: "(i) Sales and purchases of stock in trade (inventory); (ii) Sales and purchases of tangible property other than stock in trade; (iii) Rents and royalties paid and received …; (iv) Sales, purchases, and amounts paid and received as consideration for the use of all intangible property"

### reg2B3Services — Treas. Reg. §1.6038A-2(b)(3)(v)

- URL: https://www.ecfr.gov/current/title-26/section-1.6038A-2#p-1.6038A-2(b)(3)(v)
- Quote: "Consideration paid and received for technical, managerial, engineering, construction, scientific, or other services"

### reg2B3Loans — Treas. Reg. §1.6038A-2(b)(3)(vii)

- URL: https://www.ecfr.gov/current/title-26/section-1.6038A-2#p-1.6038A-2(b)(3)(vii)
- Quote: "Amounts loaned and borrowed (except open accounts resulting from sales and purchases … that arise and are collected in full in the ordinary course of business), to be reported as monthly averages or outstanding balances at the beginning and end of the taxable year"

### reg2B3Interest — Treas. Reg. §1.6038A-2(b)(3)(viii)

- URL: https://www.ecfr.gov/current/title-26/section-1.6038A-2#p-1.6038A-2(b)(3)(viii)
- Quote: "Interest paid and received"

### reg2B3Xi — Treas. Reg. §1.6038A-2(b)(3)(xi)

- URL: https://www.ecfr.gov/current/title-26/section-1.6038A-2#p-1.6038A-2(b)(3)(xi)
- Quote: "With respect to an entity that is a reporting corporation as a result of being treated as a corporation under § 301.7701-2(c)(2)(vi) of this chapter, any other transaction as defined by § 1.482-1(i)(7), such as amounts paid or received in connection with the formation, dissolution, acquisition and disposition of the entity, including contributions to and distributions from the entity."

### reg2B4 — Treas. Reg. §1.6038A-2(b)(4)

- URL: https://www.ecfr.gov/current/title-26/section-1.6038A-2#p-1.6038A-2(b)(4)
- Quote: "If the related party is a foreign person, the reporting corporation must provide on Form 5472 a description of any reportable transaction, or group of reportable transactions, listed in paragraph (b)(3) of this section, for which any part of the consideration paid or received was not monetary consideration, or for which less than full consideration was paid or received. … (iii) A reasonable estimate of the fair market value of all properties and services exchanged"

### reg2C — Treas. Reg. §1.6038A-2(c)

- URL: https://www.ecfr.gov/current/title-26/section-1.6038A-2#p-1.6038A-2(c)
- Quote: "All amounts required to be reported under paragraph (b) of this section must be expressed in United States currency, with a statement of the exchange rates used"

### reg2Examples — Treas. Reg. §1.6038A-2(b)(11), Example 1

- URL: https://www.ecfr.gov/current/title-26/section-1.6038A-2#p-1.6038A-2(b)(11)
- Quote: "In year 1, W, a foreign corporation, forms and contributes assets to X … In year 2, W contributes funds to X. In year 3, X makes a payment to W. In year 4, X, in liquidation, distributes its assets to W. … each of the transactions in years 1 through 4 is a reportable transaction with respect to X."

### reg1RelatedParty — Treas. Reg. §1.6038A-1(d)

- URL: https://www.ecfr.gov/current/title-26/section-1.6038A-1#p-1.6038A-1(d)
- Quote: "The term “related party” means— (1) Any direct or indirect 25-percent foreign shareholder of the reporting corporation, (2) Any person who is related within the meaning of sections 267(b) or 707(b)(1) to the reporting corporation or to a 25-percent foreign shareholder of the reporting corporation, or (3) Any other person who is related to the reporting corporation within the meaning of section 482"

### reg1DisregardedEntity — Treas. Reg. §1.6038A-1(c)(1)

- URL: https://www.ecfr.gov/current/title-26/section-1.6038A-1#p-1.6038A-1(c)(1)
- Quote: "A domestic business entity that is wholly owned by one foreign person and that is otherwise classified under § 301.7701-3(b)(1)(ii) of this chapter as disregarded as an entity separate from its owner is treated as an entity separate from its owner and classified as a domestic corporation for purposes of section 6038A."

### reg482Transaction — Treas. Reg. §1.482-1(i)(7)

- URL: https://www.ecfr.gov/current/title-26/section-1.482-1#p-1.482-1(i)(7)
- Quote: "Transaction means any sale, assignment, lease, license, loan, advance, contribution, or any other transfer of any interest in or a right to use any property (whether tangible or intangible, real or personal) or money, however such transaction is effected, and whether or not the terms of such transaction are formally documented. A transaction also includes the performance of any services for the benefit of, or on behalf of, another taxpayer."

### reg482Control — Treas. Reg. §1.482-1(i)(4)

- URL: https://www.ecfr.gov/current/title-26/section-1.482-1#p-1.482-1(i)(4)
- Quote: "Controlled includes any kind of control, direct or indirect, whether legally enforceable or not, and however exercisable or exercised"

### irc267 — IRC §267(b) and (c)(4)

- URL: https://www.law.cornell.edu/uscode/text/26/267
- Quote: "(b)(1) Members of a family, as defined in subsection (c)(4); (2) An individual and a corporation more than 50 percent in value of the outstanding stock of which is owned, directly or indirectly, by or for such individual … (c)(4) The family of an individual shall include only his brothers and sisters (whether by the whole or half blood), spouse, ancestors, and lineal descendants"

### i5472Definitions — Form 5472 instructions — Definitions

- URL: https://www.irs.gov/instructions/i5472
- Quote: "A reportable transaction is: Any type of transaction listed in Part IV … for which monetary consideration (including U.S. and foreign currency) was the sole consideration paid or received …; Any transaction listed in Part V; or Any transaction or group of transactions listed in Part VI. Transactions with a U.S. related party, however, are not required to be specifically identified in Parts IV, V, and VI."

### i5472PartIV — Form 5472 instructions — Part IV

- URL: https://www.irs.gov/instructions/i5472
- Quote: "Do not complete Part IV for transactions with a domestic related party. … Report amounts borrowed (including borrowings in place at the beginning of the tax year) … Report amounts loaned (including loans in place at the beginning of the tax year)"

### i5472PartV — Form 5472 instructions — Part V

- URL: https://www.irs.gov/instructions/i5472
- Quote: "You must check the box in Part V if you are a foreign-owned DE that had any other transaction, as defined by Regulations section 1.482-1(i)(7) not already entered in Part IV. These transactions include amounts paid or received in connection with the formation, dissolution, acquisition, and disposition of the entity, including contributions to, and distributions from, the entity. Describe these on an attached statement."

### i5472PartVI — Form 5472 instructions — Part VI

- URL: https://www.irs.gov/instructions/i5472
- Quote: "If the related party is a foreign person, the reporting corporation must attach a schedule describing each reportable transaction or group of reportable transactions. … A reasonable estimate of the FMV of all properties and services exchanged, if possible, or some other reasonable indicator of value."

### i5472Penalties — Form 5472 instructions — Penalties

- URL: https://www.irs.gov/instructions/i5472
- Quote: "A penalty of $25,000 will be assessed on any reporting corporation that fails to file Form 5472 when due and in the manner prescribed. … Filing a substantially incomplete Form 5472 constitutes a failure to file Form 5472. … If the failure continues for more than 90 days after notification by the IRS, an additional penalty of $25,000 will apply … for each 30-day period (or part of a 30-day period)"

## Verdicts

- **You transfer money into the LLC's bank account** → reportable (Part V) — sources: reg2B3Xi, reg2Examples, reg1DisregardedEntity, i5472PartV
- **The LLC transfers money to you** → reportable (Part V) — sources: reg2B3Xi, reg2Examples, reg1DisregardedEntity, i5472PartV
- **The LLC pays your personal expenses** → reportable (Part V) — sources: reg2B3Xi, reg482Transaction, i5472PartV
- **You lend money to the LLC** → reportable (Part IV) — sources: reg2B3Loans, reg2B3Interest, i5472PartIV, reg2B4
- **The LLC lends money to you** → reportable (Part IV) — sources: reg2B3Loans, reg2B3Interest, i5472PartIV, reg2B4
- **You paid the LLC's state fees personally** → reportable (Part V) — sources: reg2B3Xi, reg482Transaction, i5472PartV
- **You paid the registered agent personally** → reportable (Part V) — sources: reg2B3Xi, reg482Transaction, i5472PartV
- **You paid other LLC costs personally** → reportable (Part V) — sources: reg2B3Xi, reg482Transaction, reg2C, i5472PartV
- **The LLC pays you back for costs you paid** → reportable (Part IV + V) — sources: reg2B3Xi, reg482Transaction, reg2B3Loans, i5472PartV
- **You put non-cash property into the LLC** → reportable (Part V + VI) — sources: reg2B3Xi, reg482Transaction, reg2B4, reg2Examples, i5472PartVI
- **The LLC pays you for work you do** → reportable (Part IV) — sources: reg2B3Services, reg1RelatedParty, i5472PartIV
- **You work for the LLC without being paid** → depends — sources: reg482Transaction, reg2B3Xi, reg2B4
- **The LLC deals with another company you own or control** → reportable (Part IV + VI) — sources: reg1RelatedParty, irc267, reg482Control, reg2A1, reg2B3Sales, i5472Definitions
- **The LLC pays or receives money from your family** → reportable — sources: reg1RelatedParty, irc267, reg2A1, reg2B3Xi
- **Customers you're not related to pay the LLC** → not-reportable — sources: reg2A1, reg1RelatedParty, i5472Definitions
- **The LLC pays vendors or contractors you're not related to** → not-reportable — sources: reg2A1, reg1RelatedParty, i5472Definitions
