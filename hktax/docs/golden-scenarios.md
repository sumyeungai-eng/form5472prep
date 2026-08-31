# Golden Scenario Suite — Hand-Derived Expected Figures

**Author:** independent verifier (derived from statute + verified parameters only; the
engine source under `hktax/src/` was deliberately **not** read, so these figures are an
independent oracle).
**Derived:** 2026-08-31.
**Parameter source:** `docs/params-verified-2026-08-31.md` (all constants below trace to it).
**Currency:** HKD. All final tax figures are integers; where a computation produces cents
they are **dropped (floored)** — see §0.6.

---

## 0. Common rules used throughout

Each derivation line is tagged with the rule it applies. The tags are defined here once.

### 0.1 Salaries tax skeleton (`[ST]`)
```
Assessable income
  − allowable outgoings/expenses & depreciation allowances (IRO s.12(1)(a),(b))
= Net assessable income
  − concessionary deductions (IRO Part 4A: MPF/ORSO, self-education, home loan interest,
    domestic rent, elderly residential care, annuity/TVC, VHIS, AR services, approved
    charitable donations)
= NET INCOME              ← base for the standard-rate comparison
  − personal allowances (IRO Part V)
= NET CHARGEABLE INCOME (NCI, floored at 0)
```
`tax = min( progressive(NCI), two-tier standard(NET INCOME) )`, then `− reduction`.

### 0.2 Progressive rates (`[PROG]`) — identical for YA 2024/25 and 2025/26
| Band | Rate | Tax on band | Cumulative tax |
|---|---|---|---|
| First $50,000 | 2% | 1,000 | 1,000 |
| Next $50,000 | 6% | 3,000 | 4,000 |
| Next $50,000 | 10% | 5,000 | 9,000 |
| Next $50,000 | 14% | 7,000 | 16,000 |
| Remainder | 17% | — | 16,000 + 17% × (NCI − 200,000) |

### 0.3 Two-tiered standard rate (`[STD]`) — YA 2024/25 and 2025/26
15% on the first $5,000,000 of **net income** (income after deductions, **before**
allowances); 16% on the remainder. Applies to salaries tax **and** tax under personal
assessment. The lower of `[PROG]` and `[STD]` is charged.

### 0.4 Allowances (`[ALL]`) — both years
Basic $132,000 · Married person's (MPA) $264,000 · Child $130,000 each (1st–9th) ·
Additional child (year of birth only, for 2025/26 and earlier) $130,000 ·
Single parent $132,000 · Dependent parent/grandparent 60+ $50,000 (55–59: $25,000) ·
Additional dependent parent/grandparent living with taxpayer throughout the year: a further
$50,000 (55–59: $25,000) · Dependent brother/sister $37,500 · Disabled dependant $75,000 ·
Personal disability $75,000.

MPA rule (`[MPA]`, IRO s.29 / BIR60 Guide Part 12.1): granted where the taxpayer was married
and not living apart **and** (a) the spouse had **no income chargeable to salaries tax** and
has not elected personal assessment separately, **or** (b) the couple elected joint
assessment / joint personal assessment. A spouse whose only income is **rental or business**
income has no income chargeable to *salaries tax* → MPA is still available (used in G21).

### 0.5 Deduction caps (`[DED]`) — both years
MPF mandatory (employee) $18,000 · self-education $100,000 · home loan interest $100,000
(+$20,000 additional where a qualifying newborn condition is met) · domestic rent $100,000
(+$20,000, mutually exclusive with home loan interest) · elderly residential care $100,000 ·
annuity premiums + MPF TVC combined $60,000 · VHIS $8,000 per insured person · AR services
$100,000 · approved charitable donations ≤ 35% of income after allowable expenses and
depreciation allowances.

MPF mandatory contribution (`[MPF]`, MPFA): 5% of relevant income; minimum relevant income
$7,100/month (below which the **employee** makes no mandatory contribution); maximum relevant
income $30,000/month → maximum $1,500/month = $18,000/year.

### 0.6 One-off tax reduction (`[RED]`)
| YA | % | Ceiling per case | Applies to | Not applicable to |
|---|---|---|---|---|
| 2024/25 | 100% | **$1,500** | profits tax, salaries tax, tax under personal assessment | property tax; provisional tax |
| 2025/26 | 100% | **$3,000** | profits tax, salaries tax, tax under personal assessment | property tax; provisional tax |

"Per case" (verbatim, IRD 2026-27 Budget page):
> "For profits tax, the ceiling of the tax reduction is applied to each business. For
> salaries tax, the ceiling is applied to each individual taxpayer; but for married couples
> jointly assessed, the ceiling is applied to each married couple (i.e. capped at $3,000 in
> total). For personal assessment, the ceiling is applied to each single taxpayer or married
> person who elects for personal assessment separately from his/her spouse. If a taxpayer
> elects for personal assessment jointly with his/her spouse, the tax reduction is capped at
> $3,000 for the married couple."

`reduction = min(tax_before_reduction, ceiling)` — it can never create a refund of its own
(G05, G20's wife, G23 scenario 1 all exercise this).

### 0.7 Property tax (`[PT]`)
```
Assessable Value (AV) = rent receivable + premium instalments + owner's expenses borne by
                        tenant + service/management fees paid to owner − irrecoverable rent
Net Assessable Value  = (AV − rates paid by the OWNER) × 80%      ← 20% statutory allowance
Property tax          = 15% × NAV                                 ← flat, NOT two-tiered
```
No other deduction (no mortgage interest, government rent, management fee, repairs) is
allowed under property tax. Lease premium (`[PREM]`) is spread in equal monthly instalments
over **the lease period or 3 years (36 months), whichever is shorter**.

### 0.8 Profits tax — unincorporated business (`[PROF]`)
Standard rate 15%. Two-tiered rates, **if elected** (only one entity per group of connected
entities may elect): 7.5% on the first $2,000,000 of assessable profits, 15% on the
remainder. Adjusted losses are carried forward indefinitely and set off against future
assessable profits of the same trade (`[LOSS]`).

### 0.9 Personal assessment (`[PA]`)
```
  Net assessable value of property (after the 20% allowance)
+ Net assessable income under salaries tax (BEFORE concessionary deductions)
+ Assessable profits from business (losses enter as negative)
= TOTAL INCOME
  − interest on money borrowed to produce the rental income (capped, per property, at that
    property's NAV)                                                       [PA-INT]
  − business losses of the year / brought forward
= REDUCED TOTAL INCOME
  − concessionary deductions (Part 4A — same list and caps as §0.5)
= NET INCOME under PA          ← base for the standard-rate comparison
  − personal allowances
= NET CHARGEABLE INCOME
```
Tax at `[PROG]`, capped by `[STD]`, then `[RED]` (one ceiling per single taxpayer / per
separately-electing married person; one ceiling for a couple electing jointly).

PA election rules (`[PA-ELECT]`, BIR60 Guide Part 7, YA 2018/19 onwards):
* Individual aged 18+ (or under 18 with both parents dead), ordinarily resident or a
  temporary resident of Hong Kong.
* If married and **both** spouses have income assessable under the IRO, they **may** elect
  jointly, **or** either may elect **separately** from the spouse.
* If the spouse has **no** income assessable under the IRO, the individual elects alone.
* If the couple are **jointly assessed under salaries tax**, the PA election **must** be
  made jointly. (This forbids the "joint salaries assessment + one-spouse PA" combination —
  see G23.)
* A person with salaries income only (no rental, no business profits) gains nothing from PA.

Under a **joint** PA the couple's tax is apportioned between them in proportion to their
respective **reduced total income** (confirmed by IRD's 2026-27 Budget Example 5).

### 0.10 Provisional tax (`[PROV]`)
Provisional tax for year Y+1 is computed on year Y's chargeable base, at the rates **and
allowances in force for Y+1**, and carries **no** tax reduction. Verified verbatim from the
IRD 2026-27 Budget page: *"The Inland Revenue Department will automatically apply the new
amounts of allowances in calculating the 2026/27 provisional salaries tax."* — and
demonstrated numerically in IRD Budget Example 1 (reproduced as G24).
**⚠ This contradicts the simplification in `PLAN.md` §5 Step 7 ("provisional = pre-reduction
tax"). See §3 uncertainty U1 — both figures are given in G24.**

---

## 1. The 25 golden scenarios

Legend: **EXPECTED** lines are the assertions the engine must reproduce.

---

### G01 — Salaries only, single, simple (YA 2025/26)

**Inputs**
| Item | Value |
|---|---|
| Year of assessment | 2025/26 |
| Marital status | Single |
| Employment income | 400,000 |
| MPF mandatory (employee) | 18,000 (salary $33,333/mo > $30,000 cap → $1,500 × 12) `[MPF]` |
| Other deductions / dependants | none |

**Derivation**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Assessable income | 400,000 | `[ST]` |
| 2 | Less: MPF mandatory contributions | (18,000) | `[DED]` cap 18,000 |
| 3 | **Net income** | **382,000** | `[ST]` |
| 4 | Less: basic allowance | (132,000) | `[ALL]` |
| 5 | **Net chargeable income** | **250,000** | `[ST]` |
| 6 | Progressive tax: 16,000 + 17% × 50,000 | 24,500 | `[PROG]` |
| 7 | Standard rate: 15% × 382,000 | 57,300 | `[STD]` |
| 8 | Lower of (6),(7) → tax before reduction | 24,500 | `[STD]` |
| 9 | Less: 100% reduction capped $3,000 | (3,000) | `[RED]` |
| 10 | **Final salaries tax** | **21,500** | |

**EXPECTED:** net income 382,000 · NCI 250,000 · progressive 24,500 · standard 57,300 ·
basis = progressive · reduction 3,000 · **final tax 21,500**.

---

### G02 — Salaries only, single, MPF + self-education (YA 2025/26)

**Inputs:** single; employment income 600,000; MPF mandatory 18,000 (capped);
self-education expenses paid 80,000 (qualifying course, under the $100,000 cap); no dependants.

**Derivation**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Assessable income | 600,000 | `[ST]` |
| 2 | Less: MPF mandatory | (18,000) | `[DED]` |
| 3 | Less: self-education expenses | (80,000) | `[DED]` cap 100,000, unused |
| 4 | **Net income** | **502,000** | |
| 5 | Less: basic allowance | (132,000) | `[ALL]` |
| 6 | **Net chargeable income** | **370,000** | |
| 7 | Progressive: 16,000 + 17% × 170,000 = 16,000 + 28,900 | 44,900 | `[PROG]` |
| 8 | Standard: 15% × 502,000 | 75,300 | `[STD]` |
| 9 | Tax before reduction (lower) | 44,900 | |
| 10 | Less: reduction | (3,000) | `[RED]` |
| 11 | **Final salaries tax** | **41,900** | |

**EXPECTED:** net income 502,000 · NCI 370,000 · **final tax 41,900**.

---

### G03 — Married couple, salaries only: joint vs separate assessment (YA 2025/26)

**Inputs:** husband employment income 800,000, MPF 18,000 (capped); wife employment income
120,000 ($10,000/mo → MPF 5% = 6,000); no children, no other dependants.

**Branch A — separate assessment (default)**
| # | Line | Husband | Wife | Rule |
|---|---|---|---|---|
| 1 | Assessable income | 800,000 | 120,000 | |
| 2 | Less: MPF | (18,000) | (6,000) | `[MPF]`,`[DED]` |
| 3 | **Net income** | **782,000** | **114,000** | |
| 4 | Less: allowance — basic only (spouse HAS salaries income → no MPA) | (132,000) | (132,000) | `[MPA]` |
| 5 | **NCI** (floored at 0) | **650,000** | **0** | |
| 6 | Progressive | 16,000 + 17%×450,000 = **92,500** | 0 | `[PROG]` |
| 7 | Standard | 15%×782,000 = 117,300 | 15%×114,000 = 17,100 | `[STD]` |
| 8 | Tax before reduction | 92,500 | 0 | |
| 9 | Less: reduction (own ceiling each) | (3,000) | (0) | `[RED]` |
| 10 | **Final** | **89,500** | **0** | |
| | **Separate total** | | **89,500** | |

**Branch B — joint assessment (IRO s.10(2))**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Aggregate net income 782,000 + 114,000 | 896,000 | `[ST]` |
| 2 | Less: married person's allowance | (264,000) | `[ALL]`,`[MPA]` |
| 3 | **NCI** | **632,000** | |
| 4 | Progressive: 16,000 + 17% × 432,000 = 16,000 + 73,440 | 89,440 | `[PROG]` |
| 5 | Standard: 15% × 896,000 | 134,400 | `[STD]` |
| 6 | Tax before reduction | 89,440 | |
| 7 | Less: reduction — **one ceiling for the couple** | (3,000) | `[RED]` |
| 8 | **Joint total** | **86,440** | |

**EXPECTED:** separate total **89,500** · joint total **86,440** · **joint assessment wins,
saving 3,060**. (Sanity identity: the wife's unused basic allowance 132,000 − 114,000 =
18,000, relieved at the husband's 17% marginal rate = 3,060. ✔)

---

### G04 — High earner: two-tiered standard rate binds (YA 2025/26)
*Cross-referenced against IRD 2026-27 Budget illustrative Example 4 — figures match exactly.*

**Inputs:** Mr Ho, married, wife is a housewife with no income; employment income 5,300,000;
home loan interest paid 100,000; elderly residential care expenses **paid 110,000** for his
father aged 68; 2025/26 provisional salaries tax already paid 500,000.

**Derivation**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Assessable income | 5,300,000 | `[ST]` |
| 2 | Less: home loan interest | (100,000) | `[DED]` cap 100,000 |
| 3 | Less: elderly residential care expenses — **restricted to the $100,000 cap** | (100,000) | `[DED]` (paid 110,000) |
| 4 | **Net income** | **5,100,000** | |
| 5 | Less: married person's allowance (spouse has no chargeable income) | (264,000) | `[MPA]` |
| 6 | **NCI** | **4,836,000** | |
| 7 | Progressive: 1,000+3,000+5,000+7,000 + 17%×4,636,000 (=788,120) | 804,120 | `[PROG]` |
| 8 | Standard: 15%×5,000,000 (750,000) + 16%×100,000 (16,000) | 766,000 | `[STD]` — 16% tier binds |
| 9 | Tax before reduction (standard is lower) | 766,000 | |
| 10 | Less: reduction | (3,000) | `[RED]` |
| 11 | **Final salaries tax charged** | **763,000** | |
| 12 | Less: 2025/26 provisional tax paid | (500,000) | |
| 13 | **Balance payable on the final assessment** | **263,000** | |

**EXPECTED:** net income 5,100,000 · NCI 4,836,000 · progressive 804,120 · standard 766,000 ·
basis = **standard (two-tiered, 16% tier engaged)** · **final tax 763,000** · balance after
provisional credit 263,000.

---

### G05 — Zero-tax low earner (YA 2025/26)

**Inputs:** single; employment income 130,000 ($10,833/mo ≥ the $7,100 minimum relevant
income → MPF 5% = 6,500); no other items.

**Derivation**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Assessable income | 130,000 | |
| 2 | Less: MPF mandatory | (6,500) | `[MPF]` |
| 3 | **Net income** | **123,500** | |
| 4 | Less: basic allowance | (132,000) | `[ALL]` |
| 5 | **NCI** — negative, **floored at 0** | **0** | `[ST]` |
| 6 | Progressive on 0 | 0 | `[PROG]` |
| 7 | Standard 15% × 123,500 = 18,525 — but the charge is the **lower** of the two | 0 | `[STD]` |
| 8 | Reduction: min(0, 3,000) — **no refund is created** | 0 | `[RED]` |
| 9 | **Final salaries tax** | **0** | |

**EXPECTED:** NCI 0 · **final tax 0** · reduction actually allowed 0.
*(Trap this scenario guards: applying the standard rate unconditionally would wrongly produce
18,525; treating the reduction as a credit would wrongly produce a refund.)*

---

### G06 — YA **2024/25** twin of G01: the $1,500 ceiling

**Inputs:** identical to G01 (single, employment income 400,000, MPF 18,000) but
**year of assessment 2024/25**.

**Derivation:** lines 1–8 are identical to G01 (rates, bands and allowances are unchanged
between the two years):
net income 382,000 → NCI 250,000 → progressive 24,500 → standard 57,300 → tax 24,500.

| # | Line | Amount | Rule |
|---|---|---|---|
| 9 | Less: 100% reduction capped **$1,500** | (1,500) | `[RED]` 2024/25 |
| 10 | **Final salaries tax** | **23,000** | |

**EXPECTED:** **final tax 23,000** — exactly **$1,500 more** than G01. The *only* permitted
difference between the two years in this engine is the reduction ceiling.

---

### G07 — YA **2024/25**, child + newborn additional allowance

**Inputs:** married man; wife is a homemaker with no income of any kind; employment income
950,000; MPF 18,000 (capped); two children — one aged 5, one **born during the year of
assessment 2024/25**; both children's allowances claimed by him.

**Derivation**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Assessable income | 950,000 | |
| 2 | Less: MPF mandatory | (18,000) | `[DED]` |
| 3 | **Net income** | **932,000** | |
| 4 | Less: married person's allowance (spouse no chargeable income → **no joint-assessment election needed**) | (264,000) | `[MPA]` |
| 5 | Less: child allowance × 2 @ 130,000 | (260,000) | `[ALL]` |
| 6 | Less: **additional** child allowance for the child born in the year | (130,000) | `[ALL]` — one-off, year of birth only for YA ≤ 2025/26 |
| 7 | Total allowances | (654,000) | |
| 8 | **NCI** | **278,000** | |
| 9 | Progressive: 16,000 + 17% × 78,000 = 16,000 + 13,260 | 29,260 | `[PROG]` |
| 10 | Standard: 15% × 932,000 | 139,800 | `[STD]` |
| 11 | Tax before reduction | 29,260 | |
| 12 | Less: reduction (2024/25 ceiling) | (1,500) | `[RED]` |
| 13 | **Final salaries tax** | **27,760** | |

**EXPECTED:** allowances 654,000 · NCI 278,000 · **final tax 27,760**.
*(If run for YA 2025/26 with the same inputs the answer would be 26,260 — ceiling $3,000.)*

---

### G08 — Property tax, sole owner, simple (YA 2025/26)

**Inputs:** sole owner (registered in the Land Registry) of one flat; let for the whole year
at **18,000/month**; **tenant** pays the rates; no irrecoverable rent; no premium.

**Derivation**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Gross rent 18,000 × 12 = **Assessable Value** | 216,000 | `[PT]` |
| 2 | Less: rates paid by owner | (0) | tenant paid → not deductible by owner |
| 3 | Less: 20% statutory allowance for repairs & outgoings (20% × 216,000) | (43,200) | `[PT]` |
| 4 | **Net Assessable Value** | **172,800** | |
| 5 | Property tax @ 15% | 25,920 | `[PT]` |
| 6 | Tax reduction | **none — the reduction does not apply to property tax** | `[RED]` |
| 7 | **Final property tax** | **25,920** | |

**EXPECTED:** AV 216,000 · NAV 172,800 · **final property tax 25,920** · reduction 0.
*(No deduction is available for management fees, government rent, repairs or mortgage
interest under property tax.)*

---

### G09 — Property tax, co-owned 50%, owner-paid rates, cents floored (YA 2025/26)

**Inputs:** flat co-owned 50/50 by the taxpayer and one other person; let for the whole year
at **25,000/month**; **owner(s)** paid rates of **8,940** for the year; no irrecoverable rent.

**Derivation (whole property — property tax is charged on the owners jointly)**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Gross rent 25,000 × 12 = **Assessable Value** | 300,000 | `[PT]` |
| 2 | Less: rates paid by the owners | (8,940) | `[PT]` — deducted **before** the 20% |
| 3 | Sub-total | 291,060 | |
| 4 | Less: 20% statutory allowance (20% × 291,060 = 58,212) | (58,212) | `[PT]` |
| 5 | **Net Assessable Value (whole property)** | **232,848** | |
| 6 | Property tax @ 15% = 34,927.20 → **cents dropped** | **34,927** | `[PT]`, §0.6 |
| 7 | Taxpayer's 50% share of NAV | 116,424 | |
| 8 | Taxpayer's share of the tax: 15% × 116,424 = 17,463.60 → floored | **17,463** | |

**EXPECTED:** whole-property AV 300,000 · NAV 232,848 · **whole-property tax 34,927** ·
taxpayer's share of NAV 116,424 · **taxpayer's share of tax 17,463**.
*(This scenario exists to pin down (a) that rates are deducted before the 20% allowance,
(b) cent-flooring, and (c) that both routes — half of the whole tax, or 15% of half the NAV —
must land on the same integer. Jointly/co-owned properties are **not** reported in BIR60
Part 3; a separate property tax return is issued for them.)*

---

### G10 — Property tax, lease premium spread across years of assessment

**Inputs:** sole owner; tenancy of **24 months from 1 October 2024 to 30 September 2026**;
rent 20,000/month; **non-refundable lease premium of 120,000** received on signing; tenant
pays rates; no irrecoverable rent.

**Premium spreading** `[PREM]`: lease term 24 months < 36 months → spread over **24 months** =
**5,000 per month**.

| YA | Months let in the YA | Rent | Premium instalments | AV | NAV (×80%) | Property tax @15% |
|---|---|---|---|---|---|---|
| **2024/25** (1 Oct 24 – 31 Mar 25) | 6 | 120,000 | 6 × 5,000 = 30,000 | **150,000** | **120,000** | **18,000** |
| **2025/26** (full year) | 12 | 240,000 | 12 × 5,000 = 60,000 | **300,000** | **240,000** | **36,000** |
| *2026/27* (1 Apr – 30 Sep 26, for completeness) | 6 | 120,000 | 6 × 5,000 = 30,000 | 150,000 | 120,000 | 18,000 |

Premium recognised in total: 30,000 + 60,000 + 30,000 = **120,000** ✔

**EXPECTED:** YA 2024/25 — AV 150,000, NAV 120,000, **property tax 18,000**;
YA 2025/26 — AV 300,000, NAV 240,000, **property tax 36,000**; no tax reduction in either year.
*(Contrast case for the engine: had the lease run 48 months, the premium would be spread over
the **first 36 months only**, i.e. 120,000/36 = 3,333.33 per month.)*

---

### G11 — Sole proprietorship, profits under $2M, two-tiered rates elected (YA 2025/26)

**Inputs:** one sole-proprietorship business; assessable profits **1,200,000**; no connected
entities, so the business elects the two-tiered rates; no losses brought forward; personal
assessment **not** elected.

**Derivation**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Assessable profits | 1,200,000 | `[PROF]` |
| 2 | First $2,000,000 @ 7.5% → 1,200,000 × 7.5% | 90,000 | `[PROF]` two-tier |
| 3 | Remainder @ 15% | 0 | |
| 4 | Profits tax before reduction | 90,000 | |
| 5 | Less: reduction, **ceiling applies per business** | (3,000) | `[RED]` |
| 6 | **Final profits tax** | **87,000** | |

**EXPECTED:** **final profits tax 87,000**. *Contrast (must also be produced by the engine's
"no election" branch): without the two-tiered election, 15% × 1,200,000 = 180,000 − 3,000 =
**177,000**.*

---

### G12 — Sole proprietorship, profits over $2M, two-tiered rates elected (YA 2025/26)

**Inputs:** assessable profits **3,500,000**; two-tiered rates elected; no losses b/f.

| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Assessable profits | 3,500,000 | |
| 2 | First 2,000,000 @ 7.5% | 150,000 | `[PROF]` |
| 3 | Remainder 1,500,000 @ 15% | 225,000 | `[PROF]` |
| 4 | Profits tax before reduction | 375,000 | |
| 5 | Less: reduction (per business) | (3,000) | `[RED]` |
| 6 | **Final profits tax** | **372,000** | |

**EXPECTED:** tier-1 tax 150,000 · tier-2 tax 225,000 · **final profits tax 372,000**.
*(No-election contrast: 15% × 3,500,000 = 525,000 − 3,000 = 522,000.)*

---

### G13 — Sole proprietorship loss carried forward (YA 2024/25 → YA 2025/26)

**Inputs:** one sole proprietorship, same trade throughout; **YA 2024/25 adjusted loss
(400,000)**; **YA 2025/26 assessable profits before set-off 700,000**; two-tiered rates
elected; no other income; personal assessment not elected in either year.

**YA 2024/25**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Adjusted loss for the year | (400,000) | `[PROF]` |
| 2 | Assessable profits | 0 | |
| 3 | Profits tax | 0 | |
| 4 | Reduction: min(0, 1,500) | 0 | `[RED]` |
| 5 | **Loss carried forward at 31 Mar 2025** | **400,000** | `[LOSS]` |

**YA 2025/26**
| # | Line | Amount | Rule |
|---|---|---|---|
| 6 | Profits before set-off | 700,000 | |
| 7 | Less: loss brought forward | (400,000) | `[LOSS]` |
| 8 | **Assessable profits after set-off** | **300,000** | |
| 9 | 300,000 @ 7.5% (first $2M tier) | 22,500 | `[PROF]` |
| 10 | Less: reduction | (3,000) | `[RED]` |
| 11 | **Final profits tax** | **19,500** | |
| 12 | **Loss carried forward at 31 Mar 2026** | **0** | `[LOSS]` |

**EXPECTED:** 2024/25 tax 0, **loss c/f 400,000**; 2025/26 assessable profits after set-off
300,000, **final tax 19,500**, **loss c/f 0**.

---

### G14 — Personal assessment: landlord with mortgage interest — PA wins (YA 2025/26)
*Cross-referenced against GovHK "Can Personal Assessment Reduce Your Tax Liability" Example
(Miss C) — figures match exactly.*

**Inputs:** Miss C, single; sole-owned flat let for the whole year at **40,000/month**;
tenant pays rates; **mortgage interest of 42,000** paid during the year on the loan used to
acquire that let property; no other income; no dependants.

**Branch A — no election (property tax only)**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | AV = 40,000 × 12 | 480,000 | `[PT]` |
| 2 | Less: 20% statutory allowance | (96,000) | `[PT]` |
| 3 | **NAV** | **384,000** | |
| 4 | Property tax @ 15% (mortgage interest is **not** deductible here) | 57,600 | `[PT]` |
| 5 | Tax reduction — not applicable to property tax | 0 | `[RED]` |
| 6 | **Total tax, no election** | **57,600** | |

**Branch B — personal assessment elected**
| # | Line | Amount | Rule |
|---|---|---|---|
| 7 | Total income = NAV | 384,000 | `[PA]` |
| 8 | Less: interest to produce rental income (42,000 ≤ NAV 384,000) | (42,000) | `[PA-INT]` |
| 9 | **Reduced total income / net income under PA** | **342,000** | |
| 10 | Less: basic allowance | (132,000) | `[ALL]` |
| 11 | **NCI** | **210,000** | |
| 12 | Progressive: 16,000 + 17% × 10,000 | 17,700 | `[PROG]` |
| 13 | Standard: 15% × 342,000 = 51,300 → not lower | — | `[STD]` |
| 14 | Tax before reduction | 17,700 | |
| 15 | Less: reduction (single taxpayer, one ceiling) | (3,000) | `[RED]` |
| 16 | **Total tax under PA** | **14,700** | |

**EXPECTED:** no-election total **57,600** · PA total **14,700** · **PA elected; saving
42,900**.

---

### G15 — Personal assessment does **not** help a standard-rate payer (YA 2025/26)

**Inputs:** single; employment income **4,800,000** with MPF 18,000 (capped); sole-owned flat
let for the whole year at **50,000/month**, tenant pays rates, **no** mortgage on it; no
dependants.

**Branch A — no election**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Salaries: assessable income | 4,800,000 | |
| 2 | Less: MPF | (18,000) | `[DED]` |
| 3 | **Net income** | **4,782,000** | |
| 4 | Less: basic allowance | (132,000) | `[ALL]` |
| 5 | **NCI** | **4,650,000** | |
| 6 | Progressive: 16,000 + 17% × 4,450,000 = 16,000 + 756,500 | 772,500 | `[PROG]` |
| 7 | Standard: 15% × 4,782,000 (below the $5M threshold) | 717,300 | `[STD]` |
| 8 | Salaries tax before reduction (standard is lower) | 717,300 | |
| 9 | Less: reduction | (3,000) | `[RED]` |
| 10 | **Salaries tax** | **714,300** | |
| 11 | Property: AV 600,000 → NAV 480,000 → 15% | 72,000 | `[PT]` |
| 12 | **Total, no election** | **786,300** | |

**Branch B — personal assessment elected**
| # | Line | Amount | Rule |
|---|---|---|---|
| 13 | Total income = 4,800,000 (salaries) + 480,000 (NAV) | 5,280,000 | `[PA]` |
| 14 | Less: MPF (concessionary deduction, applied at PA level) | (18,000) | `[DED]` |
| 15 | **Net income under PA** | **5,262,000** | |
| 16 | Less: basic allowance | (132,000) | `[ALL]` |
| 17 | **NCI** | **5,130,000** | |
| 18 | Progressive: 16,000 + 17% × 4,930,000 = 16,000 + 838,100 | 854,100 | `[PROG]` |
| 19 | Standard: 15%×5,000,000 (750,000) + 16%×262,000 (41,920) | 791,920 | `[STD]` — 16% tier |
| 20 | Tax before reduction (standard is lower) | 791,920 | |
| 21 | Less: reduction | (3,000) | `[RED]` |
| 22 | **Total under PA** | **788,920** | |

**EXPECTED:** no-election total **786,300** · PA total **788,920** · **PA is NOT elected; it
would cost 2,620 more**. Aggregating under PA pushes the combined net income above $5,000,000
so the 16% standard tier engages on the excess, while separately the salaries income stayed
inside the 15% tier and the rental income was taxed at a flat 15%.

**⚠ Depends on uncertainty U2** (that the two-tiered standard rate caps tax under PA). If the
engine's rule is instead "PA is charged at progressive rates only", the PA total becomes
854,100 − 3,000 = **851,100** and PA still loses. Assert the branch your engine implements
and record which.

---

### G16 — Personal assessment: salary + business loss offset (YA 2025/26)
*Cross-referenced against GovHK "Can Personal Assessment Reduce Your Tax Liability" Example
(Mr L) — figures match exactly.*

**Inputs:** Mr L, single; employment income **400,000** (no deductions claimed — mirrors the
official example); sole-proprietorship business **adjusted loss (100,000)**; no dependants.

**Branch A — no election**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Salaries net income | 400,000 | |
| 2 | Less: basic allowance | (132,000) | `[ALL]` |
| 3 | **NCI** | **268,000** | |
| 4 | Progressive: 16,000 + 17% × 68,000 = 16,000 + 11,560 | 27,560 | `[PROG]` |
| 5 | Standard: 15% × 400,000 = 60,000 → not lower | — | `[STD]` |
| 6 | Less: reduction | (3,000) | `[RED]` |
| 7 | Salaries tax | 24,560 | |
| 8 | Profits tax on a loss | 0 | `[PROF]` |
| 9 | **Total, no election** | **24,560** | (loss of 100,000 would be carried forward) |

**Branch B — personal assessment elected**
| # | Line | Amount | Rule |
|---|---|---|---|
| 10 | Total income = 400,000 + (100,000) business loss | 300,000 | `[PA]`,`[LOSS]` |
| 11 | Less: basic allowance | (132,000) | `[ALL]` |
| 12 | **NCI** | **168,000** | |
| 13 | Progressive: 9,000 + 14% × 18,000 = 9,000 + 2,520 | 11,520 | `[PROG]` |
| 14 | Standard: 15% × 300,000 = 45,000 → not lower | — | `[STD]` |
| 15 | Less: reduction | (3,000) | `[RED]` |
| 16 | **Total under PA** | **8,520** | |

**EXPECTED:** no-election total **24,560** · PA total **8,520** · **PA elected; saving
16,040**. The business loss is absorbed in the year instead of being carried forward.

---

### G17 — Personal assessment with all three income heads (YA 2025/26)

**Inputs:** single; employment income **180,000** ($15,000/mo → MPF 5% = **9,000**);
sole proprietorship **assessable profits 150,000**, two-tiered rates elected;
sole-owned flat let all year at **20,000/month**, tenant pays rates, **mortgage interest
50,000** paid on the loan used to acquire that let flat; no dependants.

**Branch A — no election (three separate charges)**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Salaries: 180,000 − MPF 9,000 = net income | 171,000 | `[DED]` |
| 2 | Less: basic allowance → NCI | 39,000 | `[ALL]` |
| 3 | Progressive: 39,000 @ 2% | 780 | `[PROG]` |
| 4 | Less: reduction min(780, 3,000) | (780) | `[RED]` |
| 5 | **Salaries tax** | **0** | |
| 6 | Profits: 150,000 @ 7.5% | 11,250 | `[PROF]` |
| 7 | Less: reduction (per business) | (3,000) | `[RED]` |
| 8 | **Profits tax** | **8,250** | |
| 9 | Property: AV 240,000 → NAV 192,000 → @15% (interest not deductible) | 28,800 | `[PT]` |
| 10 | **Total, no election** | **37,050** | |

**Branch B — personal assessment elected**
| # | Line | Amount | Rule |
|---|---|---|---|
| 11 | NAV of property | 192,000 | `[PA]` |
| 12 | + net assessable income (salaries, before concessionary deductions) | 180,000 | `[PA]` |
| 13 | + assessable profits | 150,000 | `[PA]` |
| 14 | **Total income** | **522,000** | |
| 15 | Less: interest to produce rental income (50,000 ≤ NAV 192,000) | (50,000) | `[PA-INT]` |
| 16 | **Reduced total income** | **472,000** | |
| 17 | Less: MPF mandatory contributions | (9,000) | `[DED]` |
| 18 | **Net income under PA** | **463,000** | |
| 19 | Less: basic allowance | (132,000) | `[ALL]` |
| 20 | **NCI** | **331,000** | |
| 21 | Progressive: 16,000 + 17% × 131,000 = 16,000 + 22,270 | 38,270 | `[PROG]` |
| 22 | Standard: 15% × 463,000 = 69,450 → not lower | — | `[STD]` |
| 23 | Less: reduction (one ceiling for the whole PA) | (3,000) | `[RED]` |
| 24 | **Total under PA** | **35,270** | |

**EXPECTED:** no-election total **37,050** (salaries 0 + profits 8,250 + property 28,800) ·
PA total **35,270** · **PA elected; saving 1,780**.
*(Note the engine trap: under PA the three separate $3,000 ceilings collapse into one, so PA
must overcome a $6,000 handicap here before the rental-interest deduction and the low
progressive bands make it worthwhile.)*

---

### G18 — Same facts, YA 2024/25 vs YA 2025/26: the reduction ceiling difference

**Inputs:** identical to G14 (single; sole-owned flat let at 40,000/month, tenant pays rates;
mortgage interest 42,000; no other income), computed for **both** years.

| Line | YA 2024/25 | YA 2025/26 | Rule |
|---|---|---|---|
| AV | 480,000 | 480,000 | `[PT]` |
| NAV (×80%) | 384,000 | 384,000 | `[PT]` |
| **Property tax if no election** (15%, no reduction in either year) | **57,600** | **57,600** | `[PT]`,`[RED]` |
| PA: total income | 384,000 | 384,000 | `[PA]` |
| less rental interest | (42,000) | (42,000) | `[PA-INT]` |
| less basic allowance | (132,000) | (132,000) | `[ALL]` |
| **NCI** | **210,000** | **210,000** | |
| Progressive tax | 17,700 | 17,700 | `[PROG]` |
| Less: reduction ceiling | **(1,500)** | **(3,000)** | `[RED]` |
| **PA tax payable** | **16,200** | **14,700** | |
| PA saving vs no election | **41,400** | **42,900** | |

**EXPECTED:** PA tax **16,200** (2024/25) vs **14,700** (2025/26); difference **1,500**;
property-tax-only figure **57,600 in both years** (property tax never carries the reduction).

---

### G19 — Couple: joint salaries assessment **wins** (YA 2025/26)

**Inputs:** husband employment income **1,000,000**, MPF 18,000 (capped); wife employment
income **96,000** ($8,000/mo ≥ the $7,100 minimum → MPF 5% = **4,800**); two children aged 6
and 10 (neither born in the year); all child allowances claimed by the husband (they must be
claimed by one spouse only).

**Branch A — separate assessment**
| Line | Husband | Wife |
|---|---|---|
| Assessable income | 1,000,000 | 96,000 |
| Less: MPF | (18,000) | (4,800) |
| **Net income** | **982,000** | **91,200** |
| Less: basic allowance (spouse has salaries income → no MPA) | (132,000) | (132,000) |
| Less: child allowance 2 × 130,000 | (260,000) | — |
| **NCI** (floored) | **590,000** | **0** |
| Progressive: 16,000 + 17%×390,000 | **82,300** | 0 |
| Standard: 15% × net income | 147,300 | 13,680 |
| Tax before reduction | 82,300 | 0 |
| Less: reduction | (3,000) | 0 |
| **Final** | **79,300** | **0** |
| **Separate total** | | **79,300** |

**Branch B — joint assessment**
| # | Line | Amount |
|---|---|---|
| 1 | Aggregate net income 982,000 + 91,200 | 1,073,200 |
| 2 | Less: married person's allowance | (264,000) |
| 3 | Less: child allowance 2 × 130,000 | (260,000) |
| 4 | **NCI** | **549,200** |
| 5 | Progressive: 16,000 + 17% × 349,200 = 16,000 + 59,364 | 75,364 |
| 6 | Standard: 15% × 1,073,200 = 160,980 → not lower | — |
| 7 | Less: reduction — **one ceiling for the couple** | (3,000) |
| 8 | **Joint total** | **72,364** |

**EXPECTED:** separate **79,300** · joint **72,364** · **joint assessment elected; saving
6,936**. (Identity check: the wife's unused allowance 132,000 − 91,200 = 40,800 relieved at
17% = 6,936. ✔)

---

### G20 — Couple: joint assessment **loses** (two mid earners, YA 2025/26)

**Inputs:** husband employment income **600,000** (MPF 18,000, capped); wife employment
income **550,000** (MPF 18,000, capped); no children, no other dependants.

**Branch A — separate assessment**
| Line | Husband | Wife |
|---|---|---|
| Net income (after MPF) | 582,000 | 532,000 |
| Less: basic allowance | (132,000) | (132,000) |
| **NCI** | **450,000** | **400,000** |
| Progressive | 16,000 + 17%×250,000 = **58,500** | 16,000 + 17%×200,000 = **50,000** |
| Standard (15%) | 87,300 | 79,800 |
| Tax before reduction | 58,500 | 50,000 |
| Less: reduction (own ceiling each) | (3,000) | (3,000) |
| **Final** | **55,500** | **47,000** |
| **Separate total** | | **102,500** |

**Branch B — joint assessment**
| # | Line | Amount |
|---|---|---|
| 1 | Aggregate net income 582,000 + 532,000 | 1,114,000 |
| 2 | Less: married person's allowance (= exactly 2 × basic, so no allowance gain) | (264,000) |
| 3 | **NCI** | **850,000** |
| 4 | Progressive: 16,000 + 17% × 650,000 = 16,000 + 110,500 | 126,500 |
| 5 | Standard: 15% × 1,114,000 = 167,100 → not lower | — |
| 6 | Less: reduction — **one ceiling only** | (3,000) |
| 7 | **Joint total** | **123,500** |

**EXPECTED:** separate **102,500** · joint **123,500** · **joint assessment must NOT be
elected; it would cost 21,000 more**. (Decomposition: 18,000 of extra progressive tax from
losing one set of the 2%/6%/10%/14% bands, plus 3,000 of lost reduction ceiling. ✔)

---

### G21 — Couple: joint personal assessment with rental + mortgage (YA 2025/26)

**Inputs:** husband employment income **450,000**, MPF 18,000 (capped), no other income; wife
has **no salaries income** — her only income is a sole-owned flat let all year at
**35,000/month** (tenant pays rates) on which **mortgage interest of 60,000** was paid; no
children.

**Branch A — no election**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Husband salaries net income 450,000 − 18,000 | 432,000 | `[DED]` |
| 2 | Less: **married person's allowance** — the wife has no income chargeable to *salaries tax* | (264,000) | `[MPA]` |
| 3 | **NCI** | **168,000** | |
| 4 | Progressive: 9,000 + 14% × 18,000 | 11,520 | `[PROG]` |
| 5 | Standard: 15% × 432,000 = 64,800 → not lower | — | `[STD]` |
| 6 | Less: reduction | (3,000) | `[RED]` |
| 7 | **Husband's salaries tax** | **8,520** | |
| 8 | Wife's property tax: AV 420,000 → NAV 336,000 → @15% | 50,400 | `[PT]` |
| 9 | **Total, no election** | **58,920** | |

**Branch B — joint personal assessment** (both have income assessable under the IRO → a joint
election is available; `[PA-ELECT]`)
| # | Line | Amount | Rule |
|---|---|---|---|
| 10 | Husband's net assessable income | 450,000 | `[PA]` |
| 11 | Wife's net assessable value | 336,000 | `[PA]` |
| 12 | **Total income** | **786,000** | |
| 13 | Less: interest to produce rental income (60,000 ≤ NAV 336,000) | (60,000) | `[PA-INT]` |
| 14 | Less: husband's MPF mandatory contributions | (18,000) | `[DED]` |
| 15 | **Net income under PA** | **708,000** | |
| 16 | Less: married person's allowance | (264,000) | `[ALL]` |
| 17 | **NCI** | **444,000** | |
| 18 | Progressive: 16,000 + 17% × 244,000 = 16,000 + 41,480 | 57,480 | `[PROG]` |
| 19 | Standard: 15% × 708,000 = 106,200 → not lower | — | `[STD]` |
| 20 | Less: reduction — **one ceiling for the couple** | (3,000) | `[RED]` |
| 21 | **Total under joint PA** | **54,480** | |
| 22 | *Apportionment* — husband 432,000/708,000 × 54,480 = 33,242.0 | 33,242 | `[PA]` |
| 23 | *Apportionment* — wife 276,000/708,000 × 54,480 = 21,238.0 | 21,238 | `[PA]` |

**EXPECTED:** no-election total **58,920** · joint PA total **54,480** · **joint PA elected;
saving 4,440**. Apportionment (if the engine reports it): husband 33,242, wife 21,238
(sum = 54,480 ✔).
*(Key rule this scenario guards: a spouse with only rental income does **not** deprive the
other spouse of the married person's allowance under salaries tax.)*

---

### G22 — Individual personal assessment where the spouse has no income (YA 2025/26)

**Inputs:** married man; wife has **no income of any kind**; he runs one sole-proprietorship
business with **assessable profits 250,000** (two-tiered rates elected); he paid **home loan
interest of 90,000** on the mortgage over the dwelling he occupies as his residence; no
children; no salaries or rental income.

**Branch A — no election**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Assessable profits | 250,000 | `[PROF]` |
| 2 | Profits tax 250,000 @ 7.5% | 18,750 | `[PROF]` |
| 3 | *(Home loan interest and personal allowances are unavailable under profits tax)* | — | |
| 4 | Less: reduction (per business) | (3,000) | `[RED]` |
| 5 | **Total, no election** | **15,750** | |

**Branch B — personal assessment elected by him alone** (allowed: the spouse has no income
assessable under the IRO; `[PA-ELECT]`)
| # | Line | Amount | Rule |
|---|---|---|---|
| 6 | Total income = assessable profits | 250,000 | `[PA]` |
| 7 | Less: home loan interest | (90,000) | `[DED]` cap 100,000 |
| 8 | **Net income under PA** | **160,000** | |
| 9 | Less: **married person's allowance** (spouse has no chargeable income and has not elected PA separately) | (264,000) | `[MPA]` |
| 10 | **NCI** — negative, floored | **0** | |
| 11 | Progressive on 0 | 0 | `[PROG]` |
| 12 | Standard: 15% × 160,000 = 24,000 → the **lower** amount is charged | 0 | `[STD]` |
| 13 | Reduction: min(0, 3,000) | 0 | `[RED]` |
| 14 | **Total under PA** | **0** | |

**EXPECTED:** no-election total **15,750** · PA total **0** · **PA elected; saving 15,750**.
*(Same shape as GovHK's published Mr P example, which shows business profits of 280,000 taxed
at 15% = 42,000 − 3,000 = 39,000 without PA, falling to 280 under PA after a 60,000 home loan
interest deduction and the basic allowance.)*

---

### G23 — Full optimizer ranking for a complex couple (YA 2025/26)

**Inputs**
| Item | Husband | Wife |
|---|---|---|
| Employment income | 900,000 | 150,000 |
| MPF mandatory (employee) | 18,000 (capped) | 7,500 ($12,500/mo × 5%) |
| Sole-proprietorship assessable profits | 400,000 (two-tiered rates elected; no connected entities) | — |
| Sole-owned let property | — | 28,000/month, let all year, tenant pays rates |
| Mortgage interest on the let property | — | 70,000 |
| Children | 2 (aged 4 and 9; neither born in the year) — allowances claimed by the husband | |
| Dependent parent | husband's mother aged 68, **residing with them throughout the year** — 50,000 + 50,000 additional, claimed by the husband | |

**Building blocks**
| Block | Amount | Rule |
|---|---|---|
| Husband's salaries net income (900,000 − 18,000) | 882,000 | `[DED]` |
| Husband's assessable profits | 400,000 | `[PROF]` |
| Wife's salaries net income (150,000 − 7,500) | 142,500 | `[DED]` |
| Wife's property AV (28,000 × 12) | 336,000 | `[PT]` |
| Wife's property NAV (×80%) | 268,800 | `[PT]` |
| Wife's property tax if not under PA (15%) | 40,320 | `[PT]` |
| Husband's allowances when separate: basic 132,000 + children 260,000 + parent 100,000 | 492,000 | `[ALL]` |
| Couple's allowances when aggregated: MPA 264,000 + children 260,000 + parent 100,000 | 624,000 | `[ALL]` |

**Scenario 1 — no election at all**
| Component | Working | Tax |
|---|---|---|
| Husband salaries | NCI 882,000 − 492,000 = 390,000 → 16,000 + 17%×190,000 = 48,300; std 132,300 → 48,300 − 3,000 | **45,300** |
| Husband profits | 400,000 @ 7.5% = 30,000 − 3,000 | **27,000** |
| Wife salaries | NCI 142,500 − 132,000 = 10,500 → 10,500 @ 2% = 210 − min(210, 3,000) | **0** |
| Wife property | 15% × 268,800 (no reduction) | **40,320** |
| | **Total** | **112,620** |

**Scenario 2 — joint salaries assessment; profits and property unchanged**
| Component | Working | Tax |
|---|---|---|
| Joint salaries | aggregate net income 882,000 + 142,500 = 1,024,500; − 624,000 = NCI 400,500 → 16,000 + 17%×200,500 = 50,085; std 153,675 → 50,085 − 3,000 (one ceiling) | **47,085** |
| Husband profits | as above | **27,000** |
| Wife property | as above | **40,320** |
| | **Total** | **114,405** |

**Scenario 3 — husband elects PA separately; wife does not elect**
| Component | Working | Tax |
|---|---|---|
| Husband PA | total income 900,000 + 400,000 = 1,300,000; − MPF 18,000 = 1,282,000; − allowances 492,000 (basic, **not** MPA, because the wife has salaries income) = NCI 790,000 → 16,000 + 17%×590,000 = 116,300; std 192,300 → 116,300 − 3,000 | **113,300** |
| Wife salaries | 210 − 210 | **0** |
| Wife property | 15% × 268,800 | **40,320** |
| | **Total** | **153,620** |

**Scenario 4 — wife elects PA separately; husband does not elect**
| Component | Working | Tax |
|---|---|---|
| Husband salaries | as scenario 1 | **45,300** |
| Husband profits | as scenario 1 | **27,000** |
| Wife PA | total income 150,000 + 268,800 = 418,800; − rental interest 70,000 = 348,800; − MPF 7,500 = 341,300; − basic allowance 132,000 = NCI 209,300 → 16,000 + 17%×9,300 = 17,581; std 51,195 → 17,581 − 3,000 | **14,581** |
| | **Total** | **86,881** |

**Scenario 5 — both elect PA jointly**
| Component | Working | Tax |
|---|---|---|
| Joint PA | total income 900,000 + 400,000 + 150,000 + 268,800 = 1,718,800; − rental interest 70,000 = 1,648,800; − MPF 25,500 = 1,623,300; − allowances 624,000 = NCI 999,300 → 16,000 + 17%×799,300 = 151,881; std 243,495 → 151,881 − 3,000 (one ceiling) | **148,881** |
| | **Total** | **148,881** |

**Excluded combination:** joint salaries assessment **plus** a one-spouse PA election is not
permitted — where a couple is jointly assessed under salaries tax the PA election must be
made jointly (`[PA-ELECT]`). The engine must not emit it as a candidate.

**EXPECTED — full ranking**
| Rank | Scenario | Total tax |
|---|---|---|
| 1 (optimal) | **4 — wife elects PA separately, husband no election** | **86,881** |
| 2 | 1 — no election | 112,620 |
| 3 | 2 — joint salaries assessment | 114,405 |
| 4 | 5 — joint personal assessment | 148,881 |
| 5 | 3 — husband elects PA separately | 153,620 |

Optimal saving vs. doing nothing: **25,739**.
*Allowance-allocation check (should the optimizer also search this): moving the two child
allowances to the wife under scenario 4 gives wife tax 0 but husband 89,500 + 27,000 =
116,500, total **116,500** — worse. Keeping child and dependent-parent allowances with the
higher earner is optimal here.*
*(This scenario's shape — separate PA by one spouse beating both "no election" and "joint PA"
— is the same conclusion IRD reaches in its own 2026-27 Budget Example 5.)*

---

### G24 — Salaries: final tax + provisional tax = total demand (YA 2025/26)
*Cross-referenced against IRD 2026-27 Budget illustrative Example 1 (Mr Cheung) — figures
match exactly.*

**Inputs:** Mr Cheung, single; salary income for 2025/26 **380,000**; no deductions, no
dependants; **2025/26 provisional salaries tax already paid: 10,000**.

**Part 1 — 2025/26 final salaries tax**
| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Income (= net income; no deductions) | 380,000 | `[ST]` |
| 2 | Less: basic allowance | (132,000) | `[ALL]` |
| 3 | **NCI** | **248,000** | |
| 4 | Progressive: 16,000 + 17% × 48,000 = 16,000 + 8,160 | 24,160 | `[PROG]` |
| 5 | Standard: 15% × 380,000 = 57,000 → not lower | — | `[STD]` |
| 6 | Less: 100% reduction capped $3,000 | (3,000) | `[RED]` |
| 7 | **2025/26 final salaries tax charged** | **21,160** | |
| 8 | Less: 2025/26 provisional tax paid | (10,000) | |
| 9 | **Balance of final tax payable** | **11,160** | |

**Part 2 — 2026/27 provisional salaries tax** `[PROV]`
| # | Line | Amount | Rule |
|---|---|---|---|
| 10 | Income (2025/26 base carried forward) | 380,000 | `[PROV]` |
| 11 | Less: basic allowance **at the 2026/27 amount** | (145,000) | `[PROV]` |
| 12 | **NCI** | **235,000** | |
| 13 | Progressive: 16,000 + 17% × 35,000 = 16,000 + 5,950 | 21,950 | `[PROG]` |
| 14 | Tax reduction — **not applicable to provisional tax** | 0 | `[RED]` |
| 15 | **2026/27 provisional salaries tax** | **21,950** | |

**Total demand note (2025/26 final balance + 2026/27 provisional): 11,160 + 21,950 = 33,110.**
On IRD's presentation the "Total Salaries Tax Payable" for the two years is also 33,110
(21,160 + 21,950 − 10,000 already paid).

**EXPECTED (IRD-correct branch):** final tax charged **21,160** · balance after provisional
credit **11,160** · 2026/27 provisional **21,950** · total demand **33,110**.

**⚠ ALTERNATIVE under the `PLAN.md` simplification (uncertainty U1):** if the engine defines
provisional = current-year tax **before** reduction using **current-year** allowances, the
2026/27 provisional would be **24,160** and the total demand **35,320** (balance 11,160 +
24,160). Pick one, assert it, and document it — the IRD figure is 21,950.

---

### G25 — Property tax: demand = final + provisional, no reduction (YA 2025/26)
*Cross-referenced against GovHK "How Property Tax is Computed" Example 1 — figures match
exactly.*

**Inputs:** sole owner; flat let for the whole year at **10,000/month**; **tenant** paid the
rates; no irrecoverable rent, no premium; no provisional property tax previously paid.

| # | Line | Amount | Rule |
|---|---|---|---|
| 1 | Assessable Value 10,000 × 12 | 120,000 | `[PT]` |
| 2 | Less: 20% statutory allowance | (24,000) | `[PT]` |
| 3 | **Net Assessable Value** | **96,000** | |
| 4 | 2025/26 **final** property tax @ 15% | 14,400 | `[PT]` |
| 5 | Tax reduction | **0 — never applies to property tax** | `[RED]` |
| 6 | 2026/27 **provisional** property tax @ 15% on the same NAV | 14,400 | `[PROV]` |
| 7 | **Total property tax demanded** | **28,800** | |

**EXPECTED:** NAV 96,000 · final 14,400 · provisional 14,400 · **total demand 28,800**
(exactly 2 × the final tax, because the letting ran the full year, the rate is unchanged and
no reduction applies).
*(Contrast that the engine should also handle, from the same GovHK page: a letting commencing
1 July 2025 at 30,000/month with owner-paid rates of 12,000 gives AV 270,000 − 12,000 =
258,000, less 20% (51,600) = NAV 206,400, final tax 30,960; the 2026/27 provisional is grossed
up to twelve months: 206,400 × 12/9 = 275,200 @ 15% = 41,280.)*

---

## 2. BIR60 form verification (Tax Return – Individuals)

**Sources**
* `https://www.ird.gov.hk/eng/pdf/bir60_eguide.pdf` — *Guide to Tax Return – Individuals
  (BIR60)*. Retrieved **2026-08-31**; HTTP `Last-Modified: 2026-03-31`. The guide's own
  examples run "1/4/2025 to 31/3/2026" and it states "2025/26 runs from 1 April 2025 to
  31 March 2026", i.e. this edition accompanies the **YA 2025/26** return. (The extracted
  print code reads "(4/2025)"; treat the print code as unreliable and the internal YA
  references as authoritative.)
* `https://www.ird.gov.hk/eng/tax/ind_ctr.htm` — *Completion and Filing of Tax Return –
  Individuals (BIR60)*. Retrieved 2026-08-31.
* Specimen: `https://www.ird.gov.hk/eng/pdf/bir60e.pdf` (encrypted; part structure taken from
  the Guide above).

**Result: the numbering assumed in the brief is CONFIRMED.**

| Part | Heading (as printed in the Guide) | Notes |
|---|---|---|
| Part 1 | Personal Particulars | Mandatory |
| Part 2 | Notification | Advance ruling, relief under a Double Taxation Arrangement, authorized representative, etc.; details go in the Appendix |
| **Part 3** | **Property Tax** | ✔ **Property/rental income — CONFIRMED as Part 3.** Only **solely-owned** let properties. Jointly-owned/co-owned properties are **excluded** here — a separate property tax return is issued (form IR6129 to notify). Deductions allowed in item (4): **rates paid by the owner** and **irrecoverable rent**; the 20% statutory repairs-and-outgoings allowance is granted automatically in the assessment. No other deduction (government rent, management fees, renovation, utilities). |
| **Part 4** | **Salaries Tax** | ✔ **CONFIRMED as Part 4.** 4.1 Income accrued during the year (report **before** deducting MPF); 4.2 Place of residence provided by employer; **4.3 Deductions** (outgoings & expenses, depreciation allowances, **approved charitable donations** box 40, **MPF/ORSO mandatory contributions** box 41); **4.4 Election for Joint Assessment** |
| **Part 5** | **Profits Tax** | ✔ **Sole-proprietorship profits — CONFIRMED as Part 5.** Includes the declaration of whether the business is chargeable at **two-tiered rates** (boxes 51 & 63) and the Section-6-of-Appendix requirement for connected entities |
| Part 6 | Deemed Assessable Profits under section 20AE, 20AF, 20AX and/or 20AY | Declared via Section 9 of the Appendix (box 67) |
| **Part 7** | **Personal Assessment** | ✔ **PA election — CONFIRMED as Part 7.** **Box 68** = single / spouse with no chargeable income / married electing **separately**; **Box 69** = married electing **jointly**. Tick one box only |
| Part 8 | Deduction for Interest Payments / Domestic Rents | 8.1–8.2 property & loan particulars; **8.3 Interest payments to produce rental income** (requires a Part 7 PA election; capped at each property's NAV, share-proportionate); **8.4 Home loan interest**; **8.5 Domestic rents**; **8.6 Election for the home loan interest / domestic rents additional deduction ceiling** |
| Part 9 | Qualifying Premiums Paid under Voluntary Health Insurance Scheme (VHIS) Policy | |
| Part 10 | Deduction for Assisted Reproductive (AR) Service Expenses | |
| Part 11 | Qualifying Annuity Premiums and Tax Deductible MPF Contributions (TVC) | Boxes 140/141/142; TVC allowed first, then annuity premiums, up to the combined cap |
| **Part 12** | **Allowances and Elderly Residential Care Expenses** | ✔ **Allowances — CONFIRMED as Part 12.** 12.1 Married Person's Allowance & Personal Disability Allowance (boxes 143/144/146); 12.2 Child Allowance and Dependent Brother/Sister Allowance; 12.3 Single Parent Allowance; **12.4 Dependent Parent/Grandparent Allowance and Elderly Residential Care Expenses** |
| Part 13 | Declaration | Both spouses must sign **on both returns** to elect joint assessment (Part 4.4) or joint personal assessment (Part 7) |

**Corrections to the brief's assumptions:** none required — Part 3 property, Part 4 salaries,
Part 5 sole-proprietorship profits are all correct; PA election is **Part 7**; allowances are
**Part 12**. The one nuance worth recording is that **deductions are not in a single part**:
employment-related deductions and charitable donations sit in **Part 4.3**, while the
concessionary deductions are spread over **Parts 8 (interest / domestic rents), 9 (VHIS),
10 (AR services), 11 (annuity + TVC) and 12.4 (elderly residential care)**. Self-education
expenses are claimed within Part 4.3's deduction block.

---

## 3. Rules I was uncertain about (flag list for the engine team)

**U1 — Provisional tax basis (HIGH impact; affects G24 and every "demand" figure).**
`PLAN.md` §5 Step 7 says "provisional = pre-reduction tax [at current-year figures]".
IRD's own published 2026-27 Budget Example 1 computes 2026/27 provisional salaries tax on the
2025/26 income but with the **2026/27** basic allowance ($145,000), giving 21,950 rather than
24,160; the Budget page states the Department "will automatically apply the new amounts of
allowances in calculating the 2026/27 provisional salaries tax", and FAQ 10 shows the same for
the elderly-residential-care cap ($100,000 for the 2025/26 final, $110,000 for the 2026/27
provisional). **Recommendation:** implement the IRD behaviour (next-year allowances and
deduction caps, no reduction) and treat the PLAN wording as a simplification to be amended. If
the engine cannot carry 2026/27 parameters, it must say so in the UI rather than silently
under/over-stating the demand. G24 carries both numbers.

**U2 — Does the two-tiered standard rate cap tax under personal assessment?** I have applied
it (GovHK's rates page is titled "Tax Rates of Salaries Tax **& Personal Assessment**" and
states the "whichever is lower" rule for that combined page). I did **not** find an IRD worked
example under PA where the standard rate actually bound, so the *interaction* is inferred, not
demonstrated. Affects **G15 only** (PA figure 788,920 with the cap, 851,100 without); the
qualitative conclusion is unchanged. Confidence: medium-high.

**U3 — The $5,000,000 two-tier threshold for a jointly-assessed couple / joint PA.** I assumed
a single $5,000,000 threshold applied to the couple's aggregate net income (there is one
assessment). No official confirmation found. Deliberately avoided in all couple scenarios
(G03, G19, G20, G21, G23 all stay well below $5,000,000 aggregate), so **no golden figure
depends on it** — but the engine needs a documented answer before anyone runs a rich couple.

**U4 — Rounding conventions.** I have floored final tax to the dollar (G09 is the only
scenario where it bites: 34,927.20 → 34,927; 17,463.60 → 17,463). IRD's own joint-PA
apportionment in Budget Example 5 (12,147 / 5,893 out of 18,040) is consistent with
round-half-up *or* with computing one spouse's share and taking the balance as the other's —
the two cannot be distinguished from that single example. G21's apportionment (33,242 /
21,238) is unaffected because both shares land within 0.05 of an integer. Decide and document;
prefer "compute the smaller share, balance to the larger" if you want guaranteed summation.

**U5 — Co-owned property: per-owner attribution.** Property tax on a co-owned property is
charged on the owners **jointly** (one assessment on the whole property; owners jointly and
severally liable) — so "the taxpayer's property tax" is a derived figure, not an assessment.
G09 is constructed so that both plausible derivations (½ × whole tax, and 15% × ½ NAV) floor
to the same 17,463; in general they can differ by $1. Choose one rule.

**U6 — Order of `irrecoverable rent` vs `rates` in the property computation.** I used
`AV = rent + premium − irrecoverable rent`, then `NAV = (AV − rates paid by owner) × 80%`. The
"rates before the 20%" step is confirmed by GovHK's published example (270,000 − 12,000 =
258,000, then 20%). The placement of irrecoverable rent inside AV follows the BIR60 Part 3
item (4) presentation but was not confirmed by a worked example with both items present. No
golden scenario depends on it (G09 sets irrecoverable rent to nil).

**U7 — "Income chargeable to salaries tax" for the married person's allowance.** I treat a
spouse whose only income is rental or business income as having **no** income chargeable to
*salaries tax*, so the other spouse keeps the MPA (G21, G22). This follows IRO s.29 and the
BIR60 Guide Part 12.1 wording ("did not have any income chargeable to Salaries Tax"), but note
that the BIR60 Guide's **Part 7** note uses a broader phrase ("no salaries income, rental
income and business income") for a different purpose (which PA box to tick). If the engine
gets this wrong, G21's no-election branch becomes 58,920 → a much larger figure. Worth a
second opinion.

**U8 — Two-tiered profits tax election.** Only one entity in a group of connected entities may
elect. The engine models the election as a per-business boolean (G11–G13, G17, G22, G23); it
does **not** validate the connected-entity constraint. That is a data-entry warning, not a
computation rule, but it should be surfaced.

**U9 — 2024/25 property tax and the reduction.** The IRD FAQ on the 2025-26 Budget lists the
2024/25 reduction as covering "profits tax, salaries tax and tax under personal assessment"
and simply does not mention property tax; the explicit sentence "The tax reduction is not
applicable to property tax" appears only on the 2026-27 Budget page (for 2025/26). I have
treated property tax as excluded in **both** years (G18). Confidence: high, but by omission
rather than by an express 2024/25 statement.

**U10 — Provisional tax instalments.** IRD normally demands the final tax plus 75% of the
provisional in the first instalment and the remaining 25% in the second. I did not verify this
split against an official page in this pass, so **no golden scenario asserts an instalment
split** — G24 and G25 assert only the totals.

**U11 — Self-education expenses under personal assessment.** Treated as a Part 4A
concessionary deduction allowable at the PA level (like MPF, which IRD's Example 5 confirms
for annuity premiums). No golden scenario combines self-education with PA, so nothing depends
on it; the inference is by analogy.

---

## 4. Source index

| # | Source | URL | Used for |
|---|---|---|---|
| S1 | IRD, *Allowances, Deductions and Tax Rate Table* (PAM 61(e)) | https://www.ird.gov.hk/eng/pdf/pam61e.pdf | via `params-verified-2026-08-31.md`: rates, bands, allowances, deduction caps |
| S2 | IRD, **2026-27 Budget – Tax Measures** | https://www.ird.gov.hk/eng/tax/budget.htm | 2025/26 reduction 100%/$3,000, per-case rules incl. jointly-assessed couples, property-tax exclusion, provisional-tax treatment, 2026/27 allowance uplift applied to 2026/27 provisional |
| S3 | IRD, **FAQ on 2026-27 Budget – Tax Measures** | https://www.ird.gov.hk/eng/faq/budget2026_27.htm | per-case ceilings for PA (separate vs joint), per-business ceiling, elderly-care cap in final vs provisional |
| S4 | IRD, **FAQ on 2025-26 Budget – Tax Measures** | https://www.ird.gov.hk/eng/faq/budget2025_26.htm | YA 2024/25 reduction 100%/$1,500; separate-assessment couple gets two ceilings |
| S5 | IRD, **2026-27 Budget illustrative examples (PDF)** | https://www.ird.gov.hk/eng/pdf/2026/example2627.pdf | **G04** (Example 4), **G24** (Example 1); Example 5 corroborates G23's structure and joint-PA apportionment; Example 3 corroborates the one-ceiling rule for jointly-assessed couples and the newborn additional child allowance |
| S6 | GovHK, *Can Personal Assessment Reduce Your Tax Liability* | https://www.gov.hk/en/residents/taxes/salaries/personal/personalreduction/personalassessment.htm | **G14** (Miss C), **G16** (Mr L); Mr P example corroborates G22 |
| S7 | GovHK, *How Property Tax is Computed* | https://www.gov.hk/en/residents/taxes/property/propertycompute.htm | **G25** / **G08** pattern; the mid-year + owner-rates example and grossed-up provisional |
| S8 | GovHK, *Income from Property Letting* | https://www.gov.hk/en/residents/taxes/property/propertyincome.htm | **G10** lease-premium spreading ("over the period of the lease or a period of 3 years, whichever is the shorter") |
| S9 | GovHK, *Tax Rates of Salaries Tax & Personal Assessment* | https://www.gov.hk/en/residents/taxes/taxfiling/taxrates/salariesrates.htm | progressive bands; two-tiered standard rate on net income before allowances; "whichever is lower" |
| S10 | IRD, *Guide to Tax Return – Individuals (BIR60)* | https://www.ird.gov.hk/eng/pdf/bir60_eguide.pdf | §2 part numbering; PA election rules; joint assessment; MPA condition; property-tax deductions; two-tiered rates declaration |
| S11 | IRD, *Completion and Filing of Tax Return – Individuals (BIR60)* | https://www.ird.gov.hk/eng/tax/ind_ctr.htm | §2 corroboration |
| S12 | IRD, *A guide to Property Tax (1)* (PAM 54(e)) | https://www.ird.gov.hk/eng/pdf/pam54e.pdf | via params file: 15% rate, 20% statutory allowance |
| S13 | MPFA, mandatory contributions | https://www.mpfa.org.hk/en/mpf-system/mandatory-contributions/employees | via params file: 5%, $7,100 min / $30,000 max relevant income |

**All figures above were computed by hand twice, independently, before being written down.**

---

## Amendments 2026-08-31

* Married Personal Assessment election rule: confirmed the post-2018/19 rule under the
  Inland Revenue (Amendment) (No.4) Ordinance 2018. A married person may elect PA
  individually regardless of whether the spouse has chargeable salaries, property, or
  profits income; joint PA remains available where both spouses agree to elect jointly.

* G21 joint-PA apportionment rounding: the engine assigns the rounding remainder to the
  larger-share spouse. No IRD-published convention was identified for this exact
  remainder case; the total is verified exact at 54,480 per the golden doc. The engine's
  per-spouse figures are A = 33,243 and B = 21,237, summing to 54,480.

## Amendments 2026-08-31 (2)

* G21 individual-PA MPA cross-spouse condition: for the three individual-PA election
  optimizer branches only, the engine now applies the amended s.29(1) condition that MPA is
  unavailable to a person whose spouse elects PA separately. In those same branches, the
  spouse-income test uses the broader PA helper covering salaries, property, and profits
  income. This is deliberately scoped to the branch computation and does not rewrite the
  general salaries-tax-only rule documented in section 0.4.

* G21 corrected totals: no-election remains 58,920. Husband with MPA remains 8,520 in the
  baseline separate branch. When wife elects PA individually, husband is stripped to basic:
  NAI 432,000 less basic allowance 132,000 gives NCI 300,000; progressive tax is 33,000,
  less the 3,000 reduction, so husband tax is 30,000. Wife's PA remains 5,400. Corrected
  paIndividualB total is 35,400, so saving is 58,920 - 35,400 = 23,520. paIndividualBoth
  also totals 35,400, and the optimizer tie-break keeps paIndividualB ahead of
  paIndividualBoth.

* G22 and G23 confirmation: G22 is unchanged because person B has zero chargeable income and
  does not elect in the paIndividualA branch, so person A keeps MPA. G23 is unchanged because
  neither spouse claims MPA in the raw fixture; there is no MPA amount to strip.
