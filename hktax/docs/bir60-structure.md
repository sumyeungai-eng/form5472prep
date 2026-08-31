# BIR60 Box/Field Inventory (Year of Assessment 2025/26)

Purpose: box-by-box reference for generating a BIR60 "filing draft" that a
user can copy onto their real paper/eTAX return. Box numbers, item numbers
and bilingual labels below are transcribed directly from the official IRD
specimen return (see Sources). Every box number was visually verified against
the rendered form image, not inferred from OCR text alone.

Legend for "maps to": a concrete calculator field name, or `manual` (user
must type free text / cannot be computed by the engine), or `not computed`
(deliberately out of scope for this calculator, see final section).

---

## Part 1 — Personal Particulars (個人資料)

Always required; mostly identity data we do not compute, but useful for the
draft header.

| box/item no. | label 中文 | label EN | data type | maps to |
|---|---|---|---|---|
| (1) unnumbered | 本人 中文姓名 / 英文姓名 | SELF — Name in Chinese / Name in English | text | manual |
| (1) unnumbered | 配偶 中文姓名 / 英文姓名 | SPOUSE — Name in Chinese / Name in English | text | manual |
| box 1 | 本人香港身份證號碼 | SELF — Hong Kong Identity Card No. | ID | manual |
| box 2 | 配偶香港身份證號碼 | SPOUSE — Hong Kong Identity Card No. | ID | manual |
| (2) unnumbered | 如沒有香港身分證，國籍及護照號碼 | If not a HKID holder, nationality and passport number | text | manual |
| box 3 | 手提電話 (日間聯絡電話 unnumbered) | Mobile phone no. (Day-time contact tel. no. unnumbered) | text | manual |
| (3) unnumbered | 新通訊地址 / 新住址 | New Postal Address / New Residential Address | text | manual |
| (4) box 2 (example) | 更改婚姻狀況 生效日期 | Change of Marital Status — effective date + code (2=Married,3=Living Apart,4=Divorced,5=Widowed) | date+code | manual |

## Part 2 — Notification (通知)

Tick-boxes gating supplementary Appendix sections. Not computed by the
calculator; the draft should flag these as manual review items.

| box no. | label 中文 | label EN | maps to |
|---|---|---|---|
| box 4 | 本人已委任獲授權代表 | I have appointed an authorized representative | not computed |
| box 5 | 本人曾經取得有關本課稅年度的事先裁定 | I have obtained an advance ruling relating to this year of assessment | not computed |
| box 6 | 本人擬根據雙重課稅安排申請有關的寬免 | I wish to claim relief under Double Taxation Arrangement(s) | not computed |
| box 7 | 本人要求日後收取英文版本的個人人士報稅表 (BIR60) | I wish to receive CHINESE version of tax return (BIR60) in future (mirrored wording on EN form) | not computed |

## Part 3 — Property Tax (solely-owned properties) (第3部 物業稅)

Header question (unnumbered Yes/No tick): "Did you have any SOLELY-OWNED
properties which were LET during the year?" — 有 / 沒有.

Per-property columns "Property 1" / "Property 2" (unnumbered item labels,
repeat per property; use separate sheet if >2 properties):

| item no. | label 中文 | label EN | data type | maps to |
|---|---|---|---|---|
| (1) | 物業地點 | Location of property (full address per Land Registry) | text | manual |
| (2) | 出租期間 | Period of letting | date range | property.letPeriod |
| (3) | 總出租收入 | Gross rental income (whole letting period, not monthly) | currency | property.grossRentalIncome |
| (4) 本人繳交的差餉 | 扣除額 - 本人繳交的差餉 | Deductions — Rates paid by me (net of rates concession) | currency | property.ratesPaid |
| (4) 不能追回的租金 | 扣除額 - 不能追回的租金 | Deductions — Irrecoverable rent | currency | property.irrecoverableRent |
| (5) | 總出租收入減扣除額 (即第3項減去第4項) | Gross rental income less deductions (item 3 minus item 4) | currency, computed | property.netAssessableValue (before 20% allowance) |

Totals (only these three carry box numbers on the form):

| box no. | label 中文 | label EN | data type | maps to |
|---|---|---|---|---|
| box 8 | 出租物業總數 | Total number of properties LET | integer | totalPropertiesLet |
| box 9 | 所有出租物業由本人繳交的差餉及不能追回的租金之總額 | Total amount of rates paid by me and irrecoverable rent for ALL properties let | currency | totalRatesAndIrrecoverableRent |
| box 10 | 所有出租物業的總出租收入減扣除額 | Total gross rental income less deductions of ALL properties let | currency | totalNetAssessableValue |

Notes confirmed from eGuide/specimen:
- Statutory 20% "repairs and outgoings" allowance is automatically granted
  by IRD on the box-10 total — **do NOT deduct it yourself on the form**; the
  calculator should compute it separately for the tax-liability estimate but
  the box-10 figure entered on the draft is the *pre-20%* net figure (gross
  rent minus rates/irrecoverable rent only).
- Jointly-owned/co-owned properties are explicitly NOT reported in Part 3 —
  IRD issues separate Property Tax returns for those. The draft generator
  must exclude jointly-owned properties from this part and say so.
- No box number exists for the "solely owned properties Yes/No" gate itself
  on the form (it is an unnumbered tick routing box).

## Part 4 — Salaries Tax (第4部 薪俸稅)

Header gate (unnumbered Yes/No): "Did you have any income chargeable to
Salaries Tax during the year?"

### 4.1 Income accrued to me during the year (本人於本年度內所獲得的入息)

Employer table columns (unnumbered): Name of employer 僱主名稱 / Capacity
employed 受僱職位 / Period 期間 / Total amount 入息款額.

| box no. | label 中文 | label EN | data type | maps to |
|---|---|---|---|---|
| box 30 | 累計總入息 (已包括以下方格31、32及33的數項入息) | Grand total (including income items in boxes 31, 32 and 33) — **must be completed** | currency | salariesTax.grandTotalIncome |
| box 31 | 來自股份認購權的收益 | (i) share option gain | currency | salariesTax.shareOptionGain |
| box 32 | 整筆款項 (在退休或終止僱傭合約時，或由於補發薪金而收取) | (ii) lump sum payments (retirement/termination, deferred pay, arrears of pay) | currency | salariesTax.lumpSumPayments |
| box 33 | 佣金入息 | (iii) commission income | currency | salariesTax.commissionIncome |
| box 34 | 因將方格32的款項撥回有關期間計算及/或因入息可豁免徵稅，而申請從累計總入息扣除的款額 | Amount excluded from grand total by relating back of box-32 amount and/or income exemption | currency | salariesTax.excludedAmount |
| box 35 | 本人有就香港的僱傭工作或提供服務從非香港公司獲取入息 | I received income from a non-Hong Kong company for employment/services rendered in HK | Yes/No tick | manual |
| box 36 | 本人的僱主為本人繳付薪俸稅 | My employer(s) paid Salaries Tax for me | Yes/No tick | manual |

Note: employer name/capacity/period/amount rows themselves are unnumbered
free-text table entries feeding into box 30; there is no per-employer box
number — only the aggregated totals (30–34) are numbered.

### 4.2 Place of Residence Provided (在本年度內由每位僱主或相聯法團所提供的居所)

| box no. | label 中文 | label EN | data type | maps to |
|---|---|---|---|---|
| box 37 | 所有獲提供居所的總租值 | Total value of ALL places of residence provided (must complete Appendix Section 5) | currency | salariesTax.placeOfResidenceValue |

### 4.3 Deductions (扣除)

| box no. | label 中文 | label EN | data type | maps to |
|---|---|---|---|---|
| box 38 | 支出及開支 (詳細資料) | Outgoings and expenses — particulars + amount | text+currency | manual |
| box 39 | 就訂明課程所支付的個人進修開支/指明的教育提供者或協會主辦的考試所支付的考試費 | Expenses of self-education paid for prescribed courses/examination fees | currency | salariesTax.selfEducationExpenses |
| box 40 | 認可慈善捐款 | Approved charitable donations | currency | salariesTax.charitableDonations |
| box 41 | 以僱員身分付給認可退休計劃的強制性供款 | Mandatory contributions to recognized retirement schemes in capacity of an employee | currency | salariesTax.mandatoryMpfContributions |

### 4.4 Election for Joint Assessment (選擇合併評稅)

| box no. | label 中文 | label EN | data type | maps to |
|---|---|---|---|---|
| box 42 | 本人及配偶願意選擇合併評稅方式評定薪俸稅 | I and my spouse wish to elect for joint assessment under Salaries Tax | Yes tick only (no explicit No box printed) | jointAssessmentElection |

Guide note: if spouse has no salaries income at all, tick box 143 (Part
12.1) instead of box 42 — Married Person's Allowance is granted automatically.

## Part 5 — Profits Tax (sole proprietorship) (第5部 利得稅)

Header gate (unnumbered Yes/No): "Did you have any sole proprietorship
businesses (with/without business activities) during the year?" Two business
columns are printed side by side; Business 1 uses boxes 43–54, Business 2
uses the mirrored boxes 55–66. Complete items (1)-(13) per business; if >2
businesses, use a separate sheet.

| item | label 中文 | label EN | Business 1 box | Business 2 box | maps to |
|---|---|---|---|---|---|
| (1) | 業務名稱 | Name of business | unnumbered | unnumbered | manual |
| (2) | 商業登記號碼 | Business Registration Number | box 43 | box 55 | business.brNumber |
| (3) | 總入息 (包括營業額及其他入息) | Gross income (including turnover and other income) — attach accounts if >$2,000,000 | box 44 | box 56 | business.grossIncome |
| (4) | 營業額 | Turnover | box 45 | box 57 | business.turnover |
| (5) | 毛利/（虧損） | Gross profit/(loss) — enter '0' if no goods sold | box 46 | box 58 | business.grossProfit |
| (6) | 帳目所示的純利/（虧損） | Net profit/(loss) per accounts | box 47 | box 59 | business.netProfitPerAccounts |
| (7) | 應評稅利潤/（經調整虧損）[未扣減慈善捐款的數額] | Assessable profits/(Adjusted losses) before charitable donations | box 48 | box 60 | business.assessableProfits |
| (8) | 認可慈善捐款 | Approved charitable donations | box 49 | box 61 | business.charitableDonations |
| (9) | 以自僱人士身分付給強制性公積金計劃的強制性供款 [已於上述第(7)項應評稅利潤/經調整虧損內扣減] | Mandatory contributions to MPF Scheme as self-employed person (already deducted in item 7) | box 50 | box 62 | business.mandatoryMpfSelfEmployed |
| (10) | 此業務應按兩級稅率課稅 | This business is chargeable at two-tiered profits tax rates (Yes tick; complete Appendix Section 6 if connected entities) | box 51 | box 63 | business.twoTierRatesElection |
| (11) | 曾代/與非居住於香港的人士進行交易 | Had transactions for/with non-resident persons (Appendix Section 7 if Yes) | box 52 | box 64 | not computed |
| (12) | 曾申索扣除研究和開發開支/環保設施開支/知識產權開支 (Appendix Section 8 if Yes) | Had deduction claims for R&D/environmental protection facilities/IP expenditure | box 53 | box 65 | not computed |
| (13) | 擬從具資格知識產權收入所賺取的利潤申索利得稅寬減 (Form SP5 if Yes) | Claim profits tax concessions for eligible IP income (supplementary form SP5) | box 54 | box 66 | not computed |

Confirms two-tier rate election boxes are **51 (Business 1) and 63
(Business 2)** — matches the prior-research figures.

## Part 6 — Deemed Assessable Profits (第6部 推定應評稅利潤)

| box no. | label 中文 | label EN | maps to |
|---|---|---|---|
| box 67 | 在本年度內，本人有推定應評稅利潤 (若「是」，必須同時填寫附錄的第9部分) | During the year, I had deemed assessable profits (ss. 20AE/20AF/20AX/20AY) | not computed (niche fund-structure rule) |

## Part 7 — Personal Assessment (第7部 個人入息課稅)

Header gate (unnumbered Yes/No): "Do you wish to elect for Personal
Assessment?"

| box no. | label 中文 | label EN | data type | maps to |
|---|---|---|---|---|
| box 68 | (a) 本人符合選擇個人入息課稅資格，並願意選擇自行/與配偶分開以個人入息課稅方式評稅 | I am eligible and wish to elect for Personal Assessment myself/separately from my spouse | tick (choose ONE of 68/69) | personalAssessmentElection = "separate" |
| box 69 | (b) 本人/本人的配偶符合選擇個人入息課稅資格，我們兩人於本年度內均有按《稅務條例》須予評稅的入息，並願意共同選擇以個人入息課稅方式評稅 | I am/my spouse is eligible and both of us had income assessable during the year; we wish to elect for Personal Assessment jointly | tick (choose ONE of 68/69) | personalAssessmentElection = "joint" |
| box 70 | 在第4部及第5部未有申請扣除的認可慈善捐款 | (2) Approved charitable donations NOT claimed under Parts 4 and 5 | currency | personalAssessment.additionalCharitableDonations |

Confirms box 68 = single/separate election, box 69 = joint election — matches
prior-research figures. Note there is no separate PA interest-deduction claim
box in Part 7 itself; PA-linked interest deductions on rental-producing loans
are claimed in **Part 8.3** (see below), gated on having elected PA in Part 7.

## Part 8 — Deduction for Interest Payments / Domestic Rents (第8部 利息扣除/住宅租金扣除)

Three parallel property columns: **Property 1** uses boxes in the 70s low
range, **Property 2** the high-70s/80s/90s range, **Property 3** the
100s/110s range. Box numbers below are Property 1 / Property 2 / Property 3.

### 8.1 Location of property (物業地點) — required to claim interest/rent deduction

Unnumbered text field per property (must be filled to claim any deduction in
8.3/8.4/8.5).

### 8.2 Details of the properties (第8.3及8.4部利息支出扣除的物業詳情)

| item | label EN | Property 1 | Property 2 | Property 3 | maps to |
|---|---|---|---|---|---|
| (1) | Loan obtained, secured by mortgage/charge | unnumbered (confirmed by 500%-zoom crop: no box number printed next to this tick, unlike items (2) and (3) below) | — | — | manual |
| (2) | A re-mortgaged loan is involved (Appendix Section 10 if Yes) | box 71 | box 85 | box 99 | not computed (edge case) |
| (3) | My share of ownership (%) | box 72 | box 86 | box 100 | interest.myOwnershipShare |

Note: item (1) "secured by mortgage or charge" tick is shown ticked in the
specimen images without a clearly separate printed box number distinct from
the surrounding boxes in our rendering — treat as unconfirmed; the engine
should not rely on a specific box number for this single tick.

### 8.3 Deduction for Interest Payments to Produce Rental Income (為獲取物業出租收入而支付的利息扣除) — only if Personal Assessment elected in Part 7

| Property 1 | Property 2 | Property 3 | label EN | maps to |
|---|---|---|---|---|
| box 73 | box 87 | box 101 | My share of interest payments to produce the rental income | rentalInterestDeduction.myShare |

### 8.4 Deduction for Home Loan Interest (居所貸款利息扣除) — only if property used as own residence

| item | label EN | Property 1 | Property 2 | Property 3 | maps to |
|---|---|---|---|---|---|
| (1)(a) | Total home loan interest payments | unnumbered (confirmed by zoom crop: no box number printed, e.g. Property 3's $160,000 example has no number beside it) | — | — | manual/computed working figure |
| (1)(b) | My share of home loan interest payments | box 74 | box 88 | box 102 | homeLoanInterest.myShare |
| (2)(a) | Nominated by spouse to claim deduction | box 75 | box 89 | box 103 | homeLoanInterest.spouseNominated |
| (2)(b) | My spouse's share of ownership (%) | box 76 | box 90 | box 104 | homeLoanInterest.spouseOwnershipShare |
| (2)(c) | My spouse's share of home loan interest payments | box 77 | box 91 | box 105 | homeLoanInterest.spouseShare |
| (3) | Property occupied as my residence for FULL YEAR | box 78 | box 92 | box 106 | homeLoanInterest.fullYearResidence |

Confirms **boxes 74, 88 & 102** = home loan interest "my share" boxes across
the three property columns, matching the eGuide's parenthetical
"(boxes 74, 88 & 102)".

### 8.5 Deduction for Domestic Rents (住宅租金扣除)

| item | label EN | Property 1 | Property 2 | Property 3 | maps to |
|---|---|---|---|---|---|
| (1) | Tenancy starts from | box 79 | box 93 | box 107 | domesticRent.tenancyStart |
| (2) | Tenancy ends on | box 80 | box 94 | box 108 | domesticRent.tenancyEnd |
| (3) | Number of tenants entered into the tenancy | box 81 | box 95 | box 109 | domesticRent.numberOfTenants |
| (3)(a) | I am the tenant/a co-tenant | box 82 | box 96 | box 110 | domesticRent.iAmTenant |
| (3)(b) | My spouse is the tenant/a co-tenant | box 83 | box 97 | box 111 | domesticRent.spouseIsTenant |
| (4) | Amount of domestic rents claimed | box 84 | box 98 | box 112 | domesticRent.amountClaimed |

Confirms **boxes 84, 98 & 112** = domestic rent deduction amount boxes,
matching the eGuide.

### 8.6 Election for Home Loan Interest / Domestic Rents Additional Deduction Ceiling Amount ("the Child" born on/after 25 Oct 2023)

| box no. | label EN | data type | maps to |
|---|---|---|---|
| box 113 | I am eligible and wish to elect for using the additional deduction ceiling amount; enter '1' (continuous ≥6 months) or '2' (other) for residing with the Child | code 1/2 | additionalDeductionCeiling.selfElection |
| box 114 | My spouse is eligible and wishes to elect (same 1/2 coding); spouse must sign Part 13 | code 1/2 | additionalDeductionCeiling.spouseElection |
| box 115 | Particulars of the Child — Date of birth (name field is unnumbered) | date | additionalDeductionCeiling.childDob |

## Part 9 — Qualifying Premiums Paid under VHIS Policy (第9部 根據自願醫保計劃保單繳付的合資格保費)

| box no. | label 中文 | label EN | maps to |
|---|---|---|---|
| box 116 | 為本人繳付的合資格保費 | (1) Qualifying premiums paid for self | vhis.selfPremium |

Item (2) — three "Relative" columns (Relative 1/2/3), boxes as follows:

| item | label EN | Relative 1 | Relative 2 | Relative 3 | maps to |
|---|---|---|---|---|---|
| (a) | Name | unnumbered | unnumbered | unnumbered | manual |
| (b) | HKID Card Number | box 117 | box 124 | box 131 | vhis.relative[n].hkid |
| (c) | Date of birth | box 118 | box 125 | box 132 | vhis.relative[n].dob |
| (d) | Relationship code (1=spouse,2=child,3=brother/sister,4=parent,5=grandparent) | box 119 | box 126 | box 133 | vhis.relative[n].relationshipCode |
| (e) | For child/brother/sister aged 18+ (Note 1 code) | box 120 | box 127 | box 134 | vhis.relative[n].ageBandCode |
| (f) | For child/brother/sister under 11 & not HKID holder — parent's HKID | box 121 | box 128 | box 135 | vhis.relative[n].parentHkid |
| (g) | For parent/grandparent under 55 — eligible for Disability Allowance Scheme | box 122 | box 129 | box 136 | vhis.relative[n].disabilityAllowanceEligible |
| (h) | Amount of premiums claimed | box 123 | box 130 | box 137 | vhis.relative[n].premiumClaimed |

Confirms **boxes 116, 123, 130 & 137** = VHIS premium amount boxes (self +
3 relatives), matching the eGuide's "(boxes 116, 123, 130 & 137)".

## Part 10 — Deduction for Assisted Reproductive (AR) Service Expenses (第10部 輔助生育服務開支扣除)

| box no. | label 中文 | label EN | maps to |
|---|---|---|---|
| box 138 | 申請的合資格輔助生育服務開支款額 | Amount of qualifying AR service expenses claimed | arDeduction.amount |

## Part 11 — Qualifying Annuity Premiums and Tax Deductible MPF Voluntary Contributions ("TVC") (第11部 合資格年金保費及可扣稅強積金自願性供款)

| box no. | label 中文 | label EN | maps to |
|---|---|---|---|
| box 139 | 本人是根據《強制性公積金計劃條例》下定義的「可扣稅自願性供款帳戶」的持有人 | (1)(a) I am the holder of a TVC account | tvc.isAccountHolder |
| box 140 | 可扣稅強積金自願性供款 | (1)(b) Tax deductible MPF voluntary contributions | tvc.contributionAmount |
| box 141 | 本人申請以本人作為年金領取人繳付的合資格年金保費 | (2)(a) Qualifying annuity premiums paid for self as annuitant and claimed by me | annuity.selfPremium |
| box 142 | 本人申請以配偶作為年金領取人繳付的合資格年金保費 | (2)(b) Qualifying annuity premiums paid for spouse as annuitant and claimed by me | annuity.spousePremium |

Confirms **boxes 139, 140, 141 & 142** matching the eGuide's parenthetical.
Aggregate cap: boxes 140+141+142 combined subject to the prescribed maximum
(eGuide states this explicitly).

## Part 12 — Allowances and Elderly Residential Care Expenses (第12部 免稅額及長者住宿照顧開支)

Gate: this Part only applies if you had Salaries Tax chargeable income or
elected Personal Assessment.

### 12.1 Married Person's Allowance and Personal Disability Allowance (已婚人士免稅額及傷殘人士免稅額)

| box no. | label 中文 | label EN | maps to |
|---|---|---|---|
| box 143 | 本人的配偶在本年度內有收取應課薪俸稅的入息 | (1) My spouse had income chargeable to Salaries Tax during the year — tick "No" here (i.e. spouse had NO chargeable income) to get Married Person's Allowance automatically | marriedPersonAllowance.spouseHasIncome (tick No) |
| box 144 | 本人已與配偶分開居住，配偶在本年度內並沒有任何應課薪俸稅的入息，而本人在本年度內已付給配偶的生活費為 $___ | (2) Living apart from spouse who has no chargeable income; I paid maintenance fees of $___ | marriedPersonAllowance.livingApartMaintenance |
| box 145 | 本人擬就配偶申請傷殘受養人免稅額 | (3) I wish to claim disabled dependant allowance in respect of my spouse | marriedPersonAllowance.spouseDisabledDependant |
| box 146 | 本人在本年度內有資格按政府傷殘津貼計劃申索津貼，並擬申請傷殘人士免稅額 | (4) I wish to claim personal disability allowance (eligible under Government's Disability Allowance Scheme) | personalDisabilityAllowance |

Note: eGuide text says "tick 'No' in box 143" — confirmed: box 143 is the
tick for item (1) "My spouse had income chargeable to Salaries Tax", and you
tick the **No** option within that box to trigger Married Person's Allowance.
Taxpayer claiming Married Person's Allowance must complete box 143 or 144
(per specimen callout).

### 12.2 Child Allowance and Dependent Brother or Dependent Sister Allowance (子女免稅額及供養兄弟姊妹免稅額)

Three "Dependant" columns (Dependant 1/2/3); repeat/extend on separate sheet
if more.

| item | label EN | Dependant 1 | Dependant 2 | Dependant 3 | maps to |
|---|---|---|---|---|---|
| (1) | Name | unnumbered | unnumbered | unnumbered | dependant[n].name |
| (2) | Relationship (1=child, 2=your/spouse's brother/sister) | box 147 | box 151 | box 155 | dependant[n].relationshipCode |
| (3) | Date of birth | box 148 | box 152 | box 156 | dependant[n].dob |
| (4) | For dependant if aged 18 or above (Note 1: 1=18-24 full-time education, 2=18+ incapacitated) | box 149 | box 153 | box 157 | dependant[n].ageBandCode |
| (5) | I wish to claim disabled dependant allowance (Note 2) | box 150 | box 154 | box 158 | dependant[n].disabledDependantAllowance |
| (6) | Particulars of parents of dependent brother/sister — Father's HKID | box 159 | (shared row, applies to whichever dependant is a brother/sister) | — | dependant.brotherSisterFatherHkid |
| (6) | Mother's HKID | box 160 | — | — | dependant.brotherSisterMotherHkid |

Note: All Child Allowances for a married couple must be claimed by ONE
nominated spouse only (cannot split across both returns).

### 12.3 Single Parent Allowance (單親免稅額)

| box no. | label 中文 | label EN | maps to |
|---|---|---|---|
| box 161 | 本人在本年度內獨力或主力撫養在上述第12.2部所提及的子女 (全年填「1」，非全年填「2」) | I had sole/predominant care of my child/children mentioned in Part 12.2 during the year (1=full year, 2=part of year) | singleParentAllowance.code |

### 12.4 Dependent Parent and Dependent Grandparent Allowance and Elderly Residential Care Expenses (供養父母及供養祖父母或外祖父母免稅額及長者住宿照顧開支)

Three "Dependant" columns.

| item | label EN | Dependant 1 | Dependant 2 | Dependant 3 | maps to |
|---|---|---|---|---|---|
| (1) | Name | unnumbered | unnumbered | unnumbered | dependant[n].name |
| (2) | Hong Kong Identity Card Number | box 162 | box 170 | box 178 | dependant[n].hkid |
| (3) | Date of birth (month & year only) | box 163 | box 171 | box 179 | dependant[n].dobMonthYear |
| (4) | Relationship with me/my spouse (1=parent, 2=grandparent) | box 164 | box 172 | box 180 | dependant[n].relationshipCode |
| (5)(a) | Dependant was ordinarily resident in Hong Kong during the year | box 165 | box 173 | box 181 | dependant[n].ordinarilyResidentHk |
| (5)(b) | Dependant resided with me continuously without paying full cost (1=full year, 2=≥6 months) OR I/spouse contributed ≥$12,000 | box 166 (code) / box 167 (Yes tick for $12,000 alt) | box 174 / box 175 | box 182 / box 183 | dependant[n].residedWithMeCode / .contributed12000 |
| (6)(a) | Name of residential care home | unnumbered | unnumbered | unnumbered | dependant[n].careHomeName |
| (6)(b) | Residential care expenses paid by me/spouse | box 168 | box 176 | box 184 | dependant[n].elderlyResidentialCareExpenses |
| (7) | I wish to claim disabled dependant allowance (Note 2) | box 169 | box 177 | box 185 | dependant[n].disabledDependantAllowance |

Must complete EITHER item (5) [allowance claim] OR item (6) [residential
care expense deduction] per dependant, not both for the same person.

### Disabled Dependant Allowance (general note, not a separate Part)

No dedicated box number of its own — claimed by ticking the relevant
disabled-dependant box within 12.1 (box 145), 12.2 (boxes 150/154/158), or
12.4 (boxes 169/177/185), for whichever allowance category the dependant
falls under.

### Where spouse's name/HKID goes (married person's allowance mechanics)

Spouse's name (English + Chinese) and HKID number are captured in **Part 1**
(box 2 for spouse HKID; unnumbered name fields), not in Part 12. Part 12.1
only carries the tick/amount boxes (143–146) that trigger the allowance —
it does not re-collect spouse identity data.

## Part 13 — Declaration (第13部 聲明書)

No numbered boxes; contains signature date, taxpayer signature, and a
conditional spouse-signature block required when: (1) joint assessment
(Part 4.4)/PA jointly (Part 7) elected, or (2) spouse nominated taxpayer for
home loan interest deduction (Part 8.4(2)), or (3) spouse elected to use the
additional deduction ceiling (Part 8.6(2)). Not computed — flag as a manual
signing step in the draft output.

---

## "For Official Use Only" strip (bottom of page 1, boxes 11–29)

IRD-internal assessor codes (AN, SEE, ST DON, VHIS, ARS, PA DON, ENCL, ERCE,
QAP, QV, MI, HLI, HLI-N, TVC, DRD) — **not computed, not for taxpayer entry**.
Leave entirely blank in the draft.

---

## Parts / sections deliberately NOT computed by this calculator

State these explicitly in the generated draft as "leave blank / not
covered — consult the Guide or a tax advisor":

- **Part 2** Notification items (authorized representative, advance ruling,
  DTA relief, Chinese-return request) — boxes 4–7. Administrative, not a
  tax computation.
- **Part 5 items (11)–(13)** / boxes 52/64, 53/65, 54/66 — non-resident
  transactions, R&D/environmental/IP expenditure claims, IP income
  concessions (require supplementary forms SP1–SP5).
- **Part 6** (box 67) — deemed assessable profits under ss.20AE/20AF/20AX/
  20AY (fund/SPV structures) — out of scope for an individual calculator.
- **Part 8.2(2) / Appendix Section 10** — re-mortgaged loan interest
  apportionment (boxes 71/85/99 gate) — edge case, not modeled.
- **Appendix Sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10** in general — all require
  free-text/supplementary-form detail beyond what a box-by-box numeric
  engine can populate. The draft should say "complete the Appendix
  separately if the corresponding Part 2/4/5/6/8 box was ticked Yes."
- **Part 13** Declaration/signature — inherently manual.
- **"For Official Use Only" strip** (boxes 11–29) — IRD internal only.

---

## Unconfirmed / needs follow-up verification

All box numbers named in the tables above (including Part 8.2(1) and Part
8.4(1)(a), which were specifically zoom-checked at 2x-on-200dpi resolution)
are now visually confirmed as either numbered or unnumbered. The remaining
open items are lower-stakes transcription/edge-case caveats:

1. **Part 3 item (1)–(5)** per-property fields (location, period, gross
   rental income, rates/irrecoverable rent, net) are confirmed as unnumbered
   — only the three aggregate totals (boxes 8, 9, 10) carry printed numbers.
   This is consistent across both languages and was double-checked, so
   treated as confirmed rather than unconfirmed, but flagged here since the
   task brief implied box numbers might exist for the per-property rows.
2. Bilingual labels above were transcribed from the **2025/26 specimen**
   images (Chinese and English editions render as two separate documents,
   not a single bilingual form) — cross-checked line by line against box
   position, but a full independent proofread against a second Chinese
   source (e.g. the eGuide, which is English-only) was not possible since
   IRD does not publish a combined bilingual eGuide. Minor transcription
   risk exists for long free-text labels (e.g. Part 8.6, Part 12.4(5)(b)).

---

## Sources

- BIR60 eGuide (Guide to Tax Return – Individuals), YA 2025/26 edition
  (4/2025 print date), English: https://www.ird.gov.hk/eng/pdf/bir60_eguide.pdf
  — retrieved 2026-09-01. 19 pages; text extracted and read in full.
- BIR60 Specimen (English), current YA 2025/26 filled specimen with IRD
  guidance-bubble annotations: https://www.ird.gov.hk/eng/pdf/ind_ctre_demo.pdf
  — retrieved 2026-09-01. 28 pages; pages 1–4 (Parts 1–13 of the main BIR60
  form) rendered to image and read visually for exact box numbers.
- BIR60 Specimen (Chinese), same content in Chinese:
  https://www.ird.gov.hk/chi/pdf/ind_ctrc_demo.pdf — retrieved 2026-09-01.
  27 pages; pages 1–4 rendered and read for Chinese labels.
- IRD "Completion and Filing of Tax Return – Individuals (BIR60)" index page
  (links to the above): https://www.ird.gov.hk/eng/tax/ind_ctr.htm —
  retrieved 2026-09-01.
- Related Tax Rules pages (not deep-read, listed for future reference):
  https://www.ird.gov.hk/eng/tax/rtr.htm, and per-topic PDFs
  bir60_pty_e.pdf / bir60_st_e.pdf / bir60_pf_e.pdf / bir60_pa_e.pdf /
  bir60_hli_e.pdf / bir60_int_e.pdf / bir60_all_e.pdf under /eng/pdf/.

Note: an older specimen at https://www.ird.gov.hk/eng/pdf/esem_ctr_ctre_demo.pdf
was initially fetched but found to be a stale YA 2004/05 specimen with a
materially different (much lower) box-numbering scheme — **do not use that
URL as a source**; it was superseded by ind_ctre_demo.pdf above for this
research.
