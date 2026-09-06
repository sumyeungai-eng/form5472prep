# Codex adversarial calculation review — 2026-09-04

Run: `codex-companion adversarial-review --scope branch --base main` on
`claude/hk-tax-filing-website-m97q8g` (HEAD 94263a0), focus: every calculation in
hktax/src/lib/tax/** and hktax/src/lib/wizard/mapping.ts against the IRO for YA 2024/25 and 2025/26.
Codex's output is reproduced VERBATIM below (from the session's captured tool output — the
original task file was cleaned up before this record was written), followed by the architect's
adjudication. Nothing was changed in code as a result of this review (review-only).

---

# Codex Adversarial Review

Target: branch diff against main
Verdict: needs-attention

Do not ship. The branch can materially overstate or understate Hong Kong tax across profits tax, salaries tax, Personal Assessment, property tax, and provisional tax; several tests enshrine incorrect statutory treatment.

Findings:
- [high] Sole-proprietor losses are unlawfully set off across separate trades (hktax/src/lib/tax/profits.ts:241-269)
  The standalone profits-tax path automatically consumes a current-year loss from one business against another business's profit. For an individual, absent a Personal Assessment election, the loss must remain with and be carried forward against the same trade. [IRD guidance](https://www.ird.gov.hk/eng/faq/pa.htm) confirms this treatment. `profits.test.ts` lines 203-220 and 250-267 assert the incorrect cross-trade result, causing understated standalone profits tax.
  Recommendation: Remove cross-trade loss set-off for unincorporated individual businesses; retain it only where the taxpayer type legally permits it or perform it through Personal Assessment. Replace the incorrect tests.
- [high] Requested corporation profits-tax rates are not represented (hktax/src/lib/tax/params/ya2025_26.ts:45-46)
  Both tax years hard-code 7.5%/15%, while `BusinessInput` has no corporation/unincorporated discriminator. Those rates are correct only for unincorporated businesses; corporations require 8.25% on the first HK$2 million and 16.5% thereafter. The branch therefore does not meet the requested corporate calculation coverage and would understate a corporation's tax if passed through this generic engine. [IRD rate table](https://www.ird.gov.hk/eng/faq/2tr.htm).
  Recommendation: Add a legal-form discriminator and separate corporate and unincorporated rates for both years, or enforce and clearly type the engine as unincorporated-only.
- [high] Connected-entity election is enforced only within one function call (hktax/src/lib/tax/profits.ts:121-126)
  The check merely counts elections in the supplied `businesses` array. The model has no connected-group identity or information about corporations, partnerships, or other controlled entities outside that array, so multiple connected entities can each receive two-tier rates. IRD permits only one nominated entity in the entire connected group. [IRD connected-entity rules](https://www.ird.gov.hk/eng/faq/2tr.htm).
  Recommendation: Model connected-group membership and the nominated entity explicitly, and validate the election across the complete group rather than per person/function invocation.
- [high] Capital-addition inputs can produce impossible depreciation allowances (hktax/src/lib/tax/profits.ts:155-168)
  Initial allowance uses `pmInitialAdditions`, while annual allowance independently assumes every pool's `additions` has already received a 60% initial allowance and includes only 40%. Nothing requires the first value to equal the sum of pool additions. Entering additions in only the aggregate field loses the same-year annual allowance; entering them only in pools suppresses initial allowance while still discarding 60% of cost. [IRD requires 60% initial allowance plus annual allowance on reducing value](https://www.ird.gov.hk/eng/tax/bus_pft.htm).
  Recommendation: Use one per-pool additions source to derive both the 60% initial allowance and remaining pool value, and validate disposal and brought-forward movements.
- [high] MPF autofill invents employee contributions below HK$7,100 (hktax/src/lib/wizard/mapping.ts:48-55)
  The formula clamps low income upward to HK$7,100, so HK$1,000 monthly income produces a HK$4,260 deduction. Employees below HK$7,100 make no mandatory employee contribution. [MPFA contribution table](https://www.mpfa.org.hk/en/mpf-system/mandatory-contributions/employees). `mapping.test.ts` lines 366-367 asserts the incorrect HK$4,260 result.
  Recommendation: Return zero below the minimum relevant-income threshold, apply 5% only within the band, and replace the erroneous test expectation.
- [high] Elderly-care expenses are capped once instead of per dependant (hktax/src/lib/wizard/mapping.ts:295-298)
  The wizard collapses all care-home parents into one amount, after which the salaries/PA engines apply a single HK$100,000 cap. Under s.26D the maximum applies to each qualifying parent or grandparent, so two HK$80,000 claims should allow HK$160,000. The mapping also accepts any care-home parent without verifying age 60 or Disability Allowance eligibility. [IRD DIPN 36](https://www.ird.gov.hk/eng/pdf/dipn36.pdf).
  Recommendation: Preserve per-dependant care expenses and eligibility, cap each qualifying dependant separately, then sum the allowed deductions.
- [high] Housing-deduction model cannot apply statutory limits correctly (hktax/src/lib/tax/salaries.ts:408-451)
  The engine accepts only one annual housing deduction and throws whenever both types are present. IRD permits domestic rent for one part of a year followed by home-loan interest for another; domestic-rent ceilings must be prorated for tenancy months and shared between co-tenants/spouses. The model also has no ownership share or prior HLI entitlement years, so it cannot enforce the 20-year HLI limit or proportionate ceiling. [IRD domestic-rent rules](https://www.ird.gov.hk/eng/faq/domestic_rent.htm) and [HLI rules](https://www.ird.gov.hk/eng/faq/hli_basic.htm). `salaries.test.ts` lines 109-113 asserts the overly broad exclusion.
  Recommendation: Model claim periods, tenancy/co-tenant shares, dwelling ownership, spouse-wide ceilings, and HLI entitlement years; allow sequential non-overlapping rent and HLI claims and replace the incorrect exclusivity test.
- [high] Employer-accommodation value omits rent suffered and depreciation (hktax/src/lib/tax/salaries.ts:323-335)
  Rental value is added without subtracting rent paid by the employee, and the accommodation input has no way to allocate depreciation allowances that reduce the rental-value base. This overstates the s.9 housing benefit whenever the employee contributes rent or has relevant depreciation. [IRD housing-benefit rules](https://www.ird.gov.hk/eng/tax/ere_house.htm).
  Recommendation: Add employee rent paid/suffered and employer-specific depreciation inputs, subtract them in the prescribed order, and apply the subtraction to either computed or elected rateable value.
- [high] Joint-assessment charitable donations are capped spouse-by-spouse (hktax/src/lib/tax/salaries.ts:158-166)
  Each spouse's donations are capped against that spouse's reduced assessable income before their incomes are combined. Under joint assessment, the cap is 35% of aggregate reduced assessable income and unused donations may transfer between spouses. A spouse with donations but little income consequently loses a deduction that should be available against the other's income. [IRD DIPN 37](https://www.ird.gov.hk/eng/pdf/dipn37.pdf).
  Recommendation: For joint salaries assessment, aggregate reduced assessable income and both spouses' donations before applying the HK$100 minimum and 35% ceiling.
- [high] Parent age fallback grants allowances a year early (hktax/src/lib/wizard/mapping.ts:301-307)
  When only birth year is entered, age is calculated as assessment end year minus birth year. A parent born after 31 March has not yet reached that result by the assessment year-end; for example, a December 1965 birth is treated as age 60 in YA 2024/25 although the parent is 59 throughout. The model also cannot classify an under-60 parent eligible under the Disability Allowance Scheme into the HK$50,000 band. [IRD allowance table](https://www.ird.gov.hk/eng/pdf/pam61e.pdf).
  Recommendation: Collect full date of birth or authoritative age attained by 31 March, and add the statutory Disability Allowance eligibility flag.
- [high] Hong Kong permanent-resident status wrongly qualifies for Personal Assessment (hktax/src/lib/tax/personalAssessment.ts:104-125)
  For YA 2024/25 and 2025/26, eligibility requires ordinary residence or temporary-resident presence. The former statutory `permanent resident` category applied only through YA 2017/18. The OR condition here therefore wrongly admits an overseas HK permanent-ID holder who is neither ordinarily nor temporarily resident. [IRD DIPN 18](https://www.ird.gov.hk/eng/pdf/dipn18.pdf).
  Recommendation: Remove HK immigration permanent-resident status as an independent eligibility route for these years and update the wizard question and tests.
- [high] Joint Personal Assessment eligibility uses the wrong spouse test (hktax/src/lib/tax/optimizer.ts:172-185)
  The optimizer requires both spouses individually to pass the residence test, but does not require both to have assessable income. IRD's post-2018 joint-election rule requires both spouses to have assessable income and either one or both to be eligible electors. Legitimate joint elections are rejected while zero-income joint scenarios can be offered. [IRD BIR52 instructions](https://www.ird.gov.hk/eng/tax/bir52e_notes.htm).
  Recommendation: Gate joint PA on assessable income for both spouses and eligibility of at least one spouse, while retaining the separate rules for joint salaries assessment.
- [high] Property tax uses cash rent instead of total consideration receivable (hktax/src/lib/tax/property.ts:73-83)
  Assessable value is built only from `rentReceived`, premium, and recovered bad rent. Property tax covers gross rent received or receivable, licence payments, service charges paid to the owner, and owner expenses borne by the tenant. Recoverable accrued rent and these other forms of consideration are omitted, systematically understating NAV. [IRD BIR57 notes](https://www.ird.gov.hk/eng/tax/bir57se_notes.htm).
  Recommendation: Replace the cash-only field with itemized statutory consideration received or receivable and map every included category into assessable value.
- [high] Lease-premium spreading applies to ineligible leases and accepts impossible month counts (hktax/src/lib/tax/property.ts:58-64)
  Every positive lease term is spread, although the statutory spreading rule applies only to a lease exceeding one year. `premiumMonthsInYear` is also accepted without a maximum, so 100 months can be charged in one assessment year or more than the full premium can be recognized. [IRD BIR57 notes](https://www.ird.gov.hk/eng/tax/bir57se_notes.htm).
  Recommendation: Recognize the full premium in the receipt/receivable year for leases not exceeding one year; otherwise validate current-year months as an integer from zero through the lesser of 12, remaining spread months, and lease overlap.
- [high] Provisional tax blindly copies the current final-assessment basis (hktax/src/lib/tax/provisional.ts:44-53)
  Provisional tax is set to current-year `taxBeforeReduction`. That fails commencement cases requiring annualization and, for YA 2025/26 salaries/PA, computes 2026/27 provisional tax using obsolete 2025/26 allowances. IRD's enacted 2026/27 example uses the increased HK$145,000 basic allowance rather than HK$132,000. [IRD provisional example](https://www.ird.gov.hk/eng/pdf/2026/example2627.pdf).
  Recommendation: Compute provisional tax from a separate next-year estimated basis with commencement/cessation annualization and the next year's enacted rates, deductions, and allowances.
- [medium] Profits tax is rounded after aggregating separate cases (hktax/src/lib/tax/profits.ts:293-301)
  The reduction is calculated per business, but fractional business taxes are aggregated and floored only once. Two businesses with fractional post-reduction liabilities can therefore produce a total one dollar higher than flooring each separately assessed case. `profits.test.ts` lines 239-247 explicitly locks in aggregate-only rounding despite IRD applying the reduction per business.
  Recommendation: Compute and drop cents on each business's final assessment after its per-case reduction, then aggregate the whole-dollar liabilities; add a multi-business fractional test.
- [medium] Personal Assessment grants single-parent allowance without a child (hktax/src/lib/tax/personalAssessment.ts:535-537)
  Unlike the salaries implementation, this branch grants HK$132,000 solely from the boolean flag. Single-parent allowance requires sole or predominant care of a child for whom child allowance is available, plus the statutory marital/living-apart condition. Empty or inconsistent wizard state therefore creates an invalid allowance and can make PA appear optimal. [IRD allowance guidance](https://www.ird.gov.hk/eng/faq/all.htm).
  Recommendation: Require at least one qualifying child allowance and explicit satisfaction of the full-year single/widowed/living-apart condition before granting the allowance.
- [medium] Holdover eligibility is not tax-head specific (hktax/src/lib/tax/provisional.ts:82-129)
  A single undifferentiated list marks any matched answer eligible. Consequently, a profits- or property-tax case can qualify solely because of a salaries-only `increased allowances or deductions` answer, and a salaries case can use a property/profits PA-election ground. The code comment itself concedes the lists were reconstructed rather than checked directly against ss.63E/63J/63K. [IRD head-specific grounds](https://www.ird.gov.hk/eng/pdf/ind_obje.pdf).
  Recommendation: Require the demand head and evaluate separate statutory grounds, thresholds, evidence requirements, and deadlines for salaries, profits, property, and PA.

Next steps:
- Block release until the high-severity calculations and their incorrect tests are corrected.
- Add statutory boundary tests for each finding, including multi-business losses, low-income MPF, multiple care dependants, sequential housing claims, rent receivable, joint PA eligibility, and 2026/27 provisional tax.

---

# Architect adjudication (Fable 5.1, 2026-09-04/06)

Reports are claims. Of 18 findings (15 high, 3 medium), three are rejected or discounted with reasons; the remaining 15 are
plausible and UNVERIFIED — verify each against the IRO/IRD source before changing code.
Numbering follows the order above (1 = cross-trade losses … 15 = provisional, 16 = rounding, 17 = single-parent, 18 = holdover heads).

| # | Finding | Verdict | Reason |
|---|---|---|---|
| 2 | Corporation rates 8.25%/16.5% missing | **REJECT — artefact of the review brief** | The architect typed corporate rates into the focus text. This is an individuals/BIR60 site; unincorporated two-tier is 7.5%/15%, which is what the params hold. |
| 1 | Cross-trade loss set-off "unlawful" | **REJECT pending primary-source re-check** | IRO s.19C(1) sets an individual's loss in one trade against that person's profits from other trades in the same year; verified against e-Legislation earlier in the session and enshrined in the golden suite. Codex cites a PA FAQ, not the section. Do not "fix" without re-reading s.19C(1). |
| 15 | Provisional tax uses current-year allowances | **KNOWN — documented v1 limitation** | docs/PLAN.md and golden G24 record both figures. Real, but not a regression. |
| 3 | Connected-entity election only within one call | Scope limitation, not a calc error | A personal tool cannot see entities outside the filer's own businesses. Document the assumption in the UI. |
| 5 | MPF autofill invents contributions below HK$7,100 | **Plausible — likely real** | MPFA: no employee mandatory contribution below the minimum relevant income. mapping.test.ts:366 would need changing. |
| 6 | Elderly-care cap once instead of per dependant | Plausible | s.26D cap is per parent/grandparent. |
| 9 | Joint-assessment donations capped spouse-by-spouse | Plausible | DIPN 37. |
| 11 | Permanent-resident route to PA lapsed after 2017/18 | Plausible | DIPN 18 — verify the amendment year. |
| 10 | Parent age from birth year (post-31-March births) | Plausible | Needs DOB or age-at-31-March. |
| 17 | PA grants single-parent allowance from a bare flag | Plausible | Salaries path already gates on a child. |
| 4, 7, 8, 12, 13, 14, 16, 18 | Depreciation inputs, housing model, rent suffered, PA joint test, property consideration, lease premium, per-business rounding, holdover heads | Plausible / model-scope | Each needs a statute check; several are modelling breadth rather than wrong arithmetic. |

Owner decides whether to fund the verification + fix wave (see the 2026-09-06 session log,
owner-gated §6).
