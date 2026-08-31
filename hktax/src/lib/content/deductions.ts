import { getParams } from "@/lib/tax/params";

type TaxYearParams = ReturnType<typeof getParams>;
type DeductionCapKey = keyof TaxYearParams["deductionCaps"];
type AllowanceKey = keyof TaxYearParams["allowances"];

type BaseDeductionEntry = {
  id: string;
  titleZh: string;
  titleEn: string;
  eligibilityQuestionsZh: string[];
  eligibilityQuestionsEn: string[];
  evidenceZh: string[];
  evidenceEn: string[];
  pitfallsZh: string[];
  pitfallsEn: string[];
};

export type DeductionEntry =
  | (BaseDeductionEntry & {
      kind: "deduction";
      capKeys: DeductionCapKey[];
    })
  | (BaseDeductionEntry & {
      kind: "allowance";
      capKeys: AllowanceKey[];
    });

// The tax params do not currently expose this fixed statutory donation threshold.
export const DONATION_MINIMUM_HKD = 100;

export const deductionEntries: DeductionEntry[] = [
  {
    id: "self-education",
    kind: "deduction",
    titleZh: "個人進修開支",
    titleEn: "Self-education expenses",
    capKeys: ["selfEducation"],
    eligibilityQuestionsZh: [
      "課程是否與你現時或將來可能從事的受僱工作有關？",
      "開支是否由你本人支付，且沒有由僱主或其他人士全數補償？"
    ],
    eligibilityQuestionsEn: [
      "Is the course connected with your current employment or a possible future employment role?",
      "Did you pay the expense yourself without full reimbursement by your employer or another person?"
    ],
    evidenceZh: ["課程收據、學費單或考試費收據", "課程資料及付款紀錄"],
    evidenceEn: ["Course receipts, tuition invoices, or examination fee receipts", "Course details and payment records"],
    pitfallsZh: ["純興趣或私人性質課程通常不符合扣除條件。"],
    pitfallsEn: ["Courses taken only for personal interest are usually not deductible."]
  },
  {
    id: "donations",
    kind: "deduction",
    titleZh: "認可慈善捐款",
    titleEn: "Approved charitable donations",
    capKeys: ["donationsPercent"],
    eligibilityQuestionsZh: [
      "捐款是否給予香港認可慈善機構或政府作慈善用途？",
      "捐款總額是否不少於 {donationMinimum}？"
    ],
    eligibilityQuestionsEn: [
      "Was the donation made to an approved Hong Kong charity or to the Government for charitable purposes?",
      "Is the total donated amount at least {donationMinimum}?"
    ],
    evidenceZh: ["列明慈善機構名稱及金額的正式收據"],
    evidenceEn: ["Official receipts showing the charity name and donation amount"],
    pitfallsZh: ["上限為應評稅入息的 {donationsPercent}。", "少於 {donationMinimum} 的捐款不可扣除。"],
    pitfallsEn: ["The ceiling is {donationsPercent} of assessable income.", "Donations below {donationMinimum} are not deductible."]
  },
  {
    id: "mpf-mandatory",
    kind: "deduction",
    titleZh: "強制性公積金強制性供款",
    titleEn: "Mandatory MPF contributions",
    capKeys: ["mpfMandatory"],
    eligibilityQuestionsZh: ["你是否就受僱或自僱入息作出強制性強積金供款？"],
    eligibilityQuestionsEn: ["Did you make mandatory MPF contributions for employment or self-employment income?"],
    evidenceZh: ["僱主報稅表、糧單或強積金周年權益報表"],
    evidenceEn: ["Employer's return, payslips, or MPF annual benefit statement"],
    pitfallsZh: ["此項只適用於強制性供款；可扣稅自願性供款 TVC 屬另一個年金及 TVC 合併上限。"],
    pitfallsEn: ["This entry is only for mandatory contributions; MPF Tax Deductible Voluntary Contributions (TVC) use the separate annuity and TVC combined cap."]
  },
  {
    id: "home-loan-interest",
    kind: "deduction",
    titleZh: "居所貸款利息",
    titleEn: "Home loan interest",
    capKeys: ["homeLoanInterest", "homeLoanInterestElevated", "homeLoanInterestYears"],
    eligibilityQuestionsZh: [
      "物業是否你的主要居所，而貸款利息由你支付？",
      "你是否仍有未用完的 {homeLoanInterestYears} 扣除年期？",
      "如年內有合資格新生子女，可能適用較高上限。"
    ],
    eligibilityQuestionsEn: [
      "Was the property your main home, with mortgage interest paid by you?",
      "Do you still have remaining entitlement within the {homeLoanInterestYears} claim count?",
      "If you had a qualifying newborn child in the year, the elevated cap may apply."
    ],
    evidenceZh: ["銀行利息證明或按揭年結單", "物業及貸款文件", "如申索較高上限，保留新生子女相關證明"],
    evidenceEn: ["Bank interest certificate or mortgage annual statement", "Property and loan documents", "For the elevated cap, keep evidence for the newborn child condition"],
    pitfallsZh: ["居所貸款利息與住宅租金扣除同一年度不可同時申索。", "年期計算按已申索年度累計，並非按貸款年期自動重置。"],
    pitfallsEn: ["Home loan interest and the domestic rent deduction cannot both be claimed for the same year.", "The year count is based on years claimed, not automatically reset by a new loan."]
  },
  {
    id: "domestic-rent",
    kind: "deduction",
    titleZh: "住宅租金扣除",
    titleEn: "Domestic rent deduction",
    capKeys: ["domesticRent", "domesticRentElevated"],
    eligibilityQuestionsZh: [
      "你是否為自己在香港的主要居所支付租金？",
      "你及配偶是否沒有擁有香港住宅物業？",
      "如年內有合資格新生子女，可能適用較高上限。"
    ],
    eligibilityQuestionsEn: [
      "Did you pay rent for your main home in Hong Kong?",
      "Do neither you nor your spouse own domestic property in Hong Kong?",
      "If you had a qualifying newborn child in the year, the elevated cap may apply."
    ],
    evidenceZh: ["已打釐印租約", "租金收據或銀行轉賬紀錄", "業主資料及租住期間紀錄"],
    evidenceEn: ["Stamped tenancy agreement", "Rent receipts or bank transfer records", "Landlord details and rental period records"],
    pitfallsZh: ["如你或配偶擁有香港住宅物業，通常不能申索。", "住宅租金扣除與居所貸款利息同一年度不可同時申索。"],
    pitfallsEn: ["You usually cannot claim if you or your spouse owns domestic property in Hong Kong.", "The domestic rent deduction and home loan interest cannot both be claimed for the same year."]
  },
  {
    id: "elderly-care",
    kind: "deduction",
    titleZh: "長者住宿照顧開支",
    titleEn: "Elderly residential care expenses",
    capKeys: ["elderlyCare"],
    eligibilityQuestionsZh: ["你是否為合資格父母或祖父母／外祖父母支付安老院舍住宿照顧費用？"],
    eligibilityQuestionsEn: ["Did you pay residential care expenses for a qualifying parent or grandparent?"],
    evidenceZh: ["安老院舍收據", "受養人身分及親屬關係證明"],
    evidenceEn: ["Residential care home receipts", "Dependant identity and relationship evidence"],
    pitfallsZh: ["同一名受養人的長者住宿照顧開支與供養父母／祖父母免稅額一般不可重複使用同一基礎申索。"],
    pitfallsEn: ["For the same dependant, residential care expenses and dependent parent or grandparent allowance generally cannot be double-counted on the same basis."]
  },
  {
    id: "annuity-tvc",
    kind: "deduction",
    titleZh: "合資格延期年金保費及強積金 TVC",
    titleEn: "Qualifying annuity premiums and MPF TVC",
    capKeys: ["annuityAndTvc"],
    eligibilityQuestionsZh: ["你是否支付合資格延期年金保費或強積金可扣稅自願性供款？"],
    eligibilityQuestionsEn: ["Did you pay qualifying deferred annuity premiums or MPF Tax Deductible Voluntary Contributions?"],
    evidenceZh: ["保單周年結單", "強積金 TVC 供款證明", "付款紀錄"],
    evidenceEn: ["Policy annual statement", "MPF TVC contribution statement", "Payment records"],
    pitfallsZh: ["年金保費與 TVC 共用同一合併上限；不要與強制性強積金供款上限混淆。"],
    pitfallsEn: ["Annuity premiums and TVC share one combined cap; do not mix this up with the mandatory MPF contribution cap."]
  },
  {
    id: "vhis",
    kind: "deduction",
    titleZh: "自願醫保計劃保費",
    titleEn: "VHIS premiums",
    capKeys: ["vhisPerPerson"],
    eligibilityQuestionsZh: ["保單是否屬自願醫保計劃認可產品，並由你支付保費？"],
    eligibilityQuestionsEn: ["Is the policy a certified VHIS product, with premiums paid by you?"],
    evidenceZh: ["保險公司發出的自願醫保保費證明", "受保人資料及付款紀錄"],
    evidenceEn: ["VHIS premium statement from the insurer", "Insured person details and payment records"],
    pitfallsZh: ["上限按每名受保人計算，不是按每張保單或每個家庭總額計算。"],
    pitfallsEn: ["The cap applies per insured person, not per policy or as one family-wide total."]
  },
  {
    id: "assisted-reproduction",
    kind: "deduction",
    titleZh: "輔助生育服務開支",
    titleEn: "Assisted reproduction services",
    capKeys: ["assistedReproduction"],
    eligibilityQuestionsZh: ["你或配偶是否支付合資格輔助生育服務開支？"],
    eligibilityQuestionsEn: ["Did you or your spouse pay qualifying assisted reproduction service expenses?"],
    evidenceZh: ["醫療機構收據", "服務明細及付款紀錄"],
    evidenceEn: ["Medical provider receipts", "Service details and payment records"],
    pitfallsZh: ["只應申索合資格服務開支，保留足夠文件以區分其他醫療或私人開支。"],
    pitfallsEn: ["Claim only qualifying service expenses, and keep enough documentation to separate them from other medical or private costs."]
  },
  {
    id: "basic",
    kind: "allowance",
    titleZh: "基本免稅額",
    titleEn: "Basic allowance",
    capKeys: ["basic"],
    eligibilityQuestionsZh: ["你是否以個人身分課繳薪俸稅或個人入息課稅？"],
    eligibilityQuestionsEn: ["Are you chargeable as an individual under Salaries Tax or Personal Assessment?"],
    evidenceZh: ["一般不需特定收據；保留身分及報稅資料。"],
    evidenceEn: ["Usually no specific receipt is needed; keep identity and filing records."],
    pitfallsZh: ["已選用已婚人士免稅額的夫婦不會另行重複獲得兩個基本免稅額。"],
    pitfallsEn: ["A couple using married person's allowance does not separately duplicate two basic allowances."]
  },
  {
    id: "married",
    kind: "allowance",
    titleZh: "已婚人士免稅額",
    titleEn: "Married person's allowance",
    capKeys: ["married"],
    eligibilityQuestionsZh: ["你是否已婚，且符合以已婚人士免稅額評稅的條件？"],
    eligibilityQuestionsEn: ["Are you married and eligible to be assessed using married person's allowance?"],
    evidenceZh: ["婚姻狀況資料", "配偶收入及評稅選擇資料"],
    evidenceEn: ["Marital status records", "Spouse income and assessment election details"],
    pitfallsZh: ["選用已婚人士免稅額會影響配偶評稅方式及其他家庭免稅額配置。"],
    pitfallsEn: ["Using married person's allowance affects the spouse's assessment basis and family allowance allocation."]
  },
  {
    id: "child",
    kind: "allowance",
    titleZh: "子女免稅額",
    titleEn: "Child allowance",
    capKeys: ["child", "childNewbornExtra"],
    eligibilityQuestionsZh: [
      "子女是否符合受養子女條件？",
      "如子女在本課稅年度出生，可另有出生年度額外免稅額。"
    ],
    eligibilityQuestionsEn: [
      "Does the child meet the dependent child conditions?",
      "If the child was born in this year of assessment, an additional newborn allowance may apply for the year of birth."
    ],
    evidenceZh: ["出生證明或親屬關係文件", "教育、同住或受養資料（如適用）"],
    evidenceEn: ["Birth certificate or relationship documents", "Education, residence, or dependency records where relevant"],
    pitfallsZh: ["同一名子女的免稅額須在合資格申索人之間妥善分配，避免重複申索。"],
    pitfallsEn: ["The allowance for the same child must be allocated properly between eligible claimants to avoid duplicate claims."]
  },
  {
    id: "parent-grandparent",
    kind: "allowance",
    titleZh: "供養父母／祖父母或外祖父母免稅額",
    titleEn: "Dependent parent or grandparent allowance",
    capKeys: ["parentAged60", "parentAged55", "parentResidingExtra60", "parentResidingExtra55"],
    eligibilityQuestionsZh: [
      "受養人是否為父母、祖父母或外祖父母？",
      "按年齡分為 60 歲或以上，以及 55 至 59 歲兩個組別。",
      "如全年與你同住，相關組別可有額外同住免稅額。"
    ],
    eligibilityQuestionsEn: [
      "Is the dependant your parent, grandparent, or spouse's parent or grandparent?",
      "The age bands are 60 or above, and 55 to 59.",
      "If the dependant lived with you throughout the year, the relevant band may receive an additional residing allowance."
    ],
    evidenceZh: ["受養人身分及親屬關係證明", "年齡證明", "供養及同住紀錄（如申索同住額）"],
    evidenceEn: ["Dependant identity and relationship evidence", "Age evidence", "Maintenance and residence records if claiming the residing amount"],
    pitfallsZh: ["同住額是按相同年齡組別另加，實際效果為該組別金額加倍。"],
    pitfallsEn: ["The residing amount is added for the same age band, effectively doubling that band."]
  },
  {
    id: "sibling",
    kind: "allowance",
    titleZh: "供養兄弟姊妹免稅額",
    titleEn: "Dependent brother or sister allowance",
    capKeys: ["sibling"],
    eligibilityQuestionsZh: ["你是否供養符合條件的兄弟姊妹？"],
    eligibilityQuestionsEn: ["Do you maintain a qualifying dependent brother or sister?"],
    evidenceZh: ["親屬關係文件", "受養及教育或傷殘資料（如適用）"],
    evidenceEn: ["Relationship documents", "Dependency and education or disability records where relevant"],
    pitfallsZh: ["同一名受養兄弟姊妹不可由多人重複申索。"],
    pitfallsEn: ["The same dependent sibling cannot be claimed by multiple people."]
  },
  {
    id: "single-parent",
    kind: "allowance",
    titleZh: "單親免稅額",
    titleEn: "Single parent allowance",
    capKeys: ["singleParent"],
    eligibilityQuestionsZh: ["你是否獨力或主要照顧合資格子女，並符合單親條件？"],
    eligibilityQuestionsEn: ["Are you solely or mainly responsible for a qualifying child and meet the single parent conditions?"],
    evidenceZh: ["子女資料", "婚姻或分居狀況資料", "照顧及同住紀錄"],
    evidenceEn: ["Child details", "Marital or separation status records", "Care and residence records"],
    pitfallsZh: ["單親免稅額不能與已婚人士免稅額同時享有。"],
    pitfallsEn: ["Single parent allowance cannot be combined with married person's allowance."]
  },
  {
    id: "disabled-dependant",
    kind: "allowance",
    titleZh: "傷殘受養人免稅額",
    titleEn: "Disabled dependant allowance",
    capKeys: ["disabledDependant"],
    eligibilityQuestionsZh: ["你是否供養符合傷殘條件的受養人？"],
    eligibilityQuestionsEn: ["Do you maintain a dependant who meets the disability conditions?"],
    evidenceZh: ["傷殘證明文件", "受養人身分及親屬關係文件"],
    evidenceEn: ["Disability evidence", "Dependant identity and relationship documents"],
    pitfallsZh: ["此免稅額通常是在相關受養人免稅額以外另行考慮，仍須保留傷殘資格證明。"],
    pitfallsEn: ["This allowance is usually considered in addition to the relevant dependant allowance, but disability eligibility evidence is still needed."]
  },
  {
    id: "personal-disability",
    kind: "allowance",
    titleZh: "個人傷殘免稅額",
    titleEn: "Personal disability allowance",
    capKeys: ["personalDisability"],
    eligibilityQuestionsZh: ["你本人是否符合個人傷殘免稅額的資格？"],
    eligibilityQuestionsEn: ["Do you personally meet the eligibility conditions for personal disability allowance?"],
    evidenceZh: ["你本人的傷殘資格證明文件"],
    evidenceEn: ["Your own disability eligibility evidence"],
    pitfallsZh: ["此項適用於納稅人本人，不應與傷殘受養人免稅額混淆。"],
    pitfallsEn: ["This applies to the taxpayer personally and should not be confused with disabled dependant allowance."]
  }
];
