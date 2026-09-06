# Codex adversarial calculation review — 2026-09-04

Run: `codex-companion adversarial-review --scope branch --base main` on
`claude/hk-tax-filing-website-m97q8g`, scoped to hktax/src/lib/tax/** and wizard/mapping.ts.
Codex output is reproduced VERBATIM below, followed by the architect's adjudication.
Nothing was changed in code as a result of this review (review-only).

---


---

# Architect adjudication (Fable 5.1, 2026-09-04/06)

Reports are claims. Three findings are rejected or discounted with reasons; the rest are
plausible and UNVERIFIED — verify each against the IRO/IRD source before changing code.

| # | Finding | Verdict | Reason |
|---|---|---|---|
| 2 | Corporation rates 8.25%/16.5% missing | **REJECT — artefact of the review brief** | The architect typed corporate rates into the focus text. This is an individuals/BIR60 site; unincorporated two-tier is 7.5%/15%, which is what the params hold. |
| 1 | Cross-trade loss set-off "unlawful" | **REJECT pending primary-source re-check** | IRO s.19C(1) sets an individual's loss in one trade against that person's profits from other trades in the same year; verified against e-Legislation earlier in the session and enshrined in the golden suite. Codex cites a PA FAQ, not the section. Do not "fix" without re-reading s.19C(1). |
| 15 | Provisional tax uses current-year allowances | **KNOWN — documented v1 limitation** | docs/PLAN.md and golden G24 record both figures. Real, but not a regression. |
| 3 | Connected-entity election only within one call | Scope limitation, not a calc error | A personal tool cannot see entities outside the filer's own businesses. Document the assumption in the UI. |
| 5 | MPF autofill invents contributions below HK$7,100 | **Plausible — likely real** | MPFA: no employee mandatory contribution below the minimum relevant income. Test at mapping.test.ts:366 would need changing. |
| 6 | Elderly-care cap once instead of per dependant | Plausible | s.26D cap is per parent/grandparent. |
| 9 | Joint-assessment donations capped spouse-by-spouse | Plausible | DIPN 37. |
| 11 | Permanent-resident route to PA lapsed after 2017/18 | Plausible | DIPN 18 — verify the amendment year. |
| 10 | Parent age from birth year (post-31-March births) | Plausible | Needs DOB or age-at-31-March. |
| 16 | PA grants single-parent allowance from a bare flag | Plausible | Salaries path already gates on a child. |
| 4, 7, 8, 12, 13, 14, 17 | Depreciation inputs, housing model, rent suffered, PA joint test, property consideration, lease premium, holdover heads, rounding | Plausible / model-scope | Each needs a statute check; several are modelling breadth rather than wrong arithmetic. |

Owner decides whether to fund the verification + fix wave (see session log, owner-gated §6).
