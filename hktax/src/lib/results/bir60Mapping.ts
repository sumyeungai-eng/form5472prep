import type { ResultsEntry } from "./resultsDictionary";

export type Bir60MappingFlag =
  | "propertyIncome"
  | "salariesIncome"
  | "profitsIncome"
  | "personalAssessmentElection"
  | "jointSalariesElection"
  | "jointPersonalAssessmentElection"
  | "deductions"
  | "allowances";

export type Bir60MappingRow = {
  id: string;
  flag: Bir60MappingFlag;
  part: string;
  figure: ResultsEntry;
  note: ResultsEntry;
};

export const BIR60_MAPPING = [
  {
    id: "property-income",
    flag: "propertyIncome",
    part: "Part 3",
    figure: {
      zh: "出租物業收入、頂手費、不能追回租金、差餉及業權份額",
      en: "Rental income, lease premium, irrecoverable rent, rates, and ownership share",
    },
    note: {
      zh: "按物業稅明細填報；如同時選擇個人入息課稅，仍須申報物業資料。",
      en: "Report from the property-tax breakdown; property details still need reporting if PA is elected.",
    },
  },
  {
    id: "salaries-income",
    flag: "salariesIncome",
    part: "Part 4",
    figure: {
      zh: "薪金、花紅、整筆款項、僱主提供的居所租值，以及與受僱工作有關的扣除",
      en: "Salary, bonus, lump sums, employer accommodation rental value, and employment deductions",
    },
    note: {
      zh: "薪俸稅明細內的收入及僱傭扣除對應此部分。",
      en: "Income and employment-deduction lines in the salaries computation map here.",
    },
  },
  {
    id: "profits-income",
    flag: "profitsIncome",
    part: "Part 5",
    figure: {
      zh: "獨資業務收入、可扣除開支、加回項目、資本免稅額及承前虧損",
      en: "Sole-proprietor revenue, deductible expenses, add-backs, capital allowances, and losses",
    },
    note: {
      zh: "每項業務按利得稅明細填報；兩級制選擇須與實際報稅表要求一致。",
      en: "Use the profits-tax breakdown for each business; align any two-tier election with the actual return.",
    },
  },
  {
    id: "personal-assessment-election",
    flag: "personalAssessmentElection",
    part: "Part 7",
    figure: {
      zh: "選擇個人入息課稅",
      en: "Election for Personal Assessment",
    },
    note: {
      zh: "如建議方案為個人入息課稅，須在此部分作出選擇。",
      en: "If the recommended scenario is PA, make the election in this part.",
    },
  },
  {
    id: "joint-salaries-election",
    flag: "jointSalariesElection",
    part: "Part 4.4",
    figure: {
      zh: "夫婦薪俸稅合併評稅選擇",
      en: "Married couple joint salaries assessment election",
    },
    note: {
      zh: "只在建議方案為薪俸稅合併評稅時顯示；請核對配偶簽署及資料要求。",
      en: "Shown only when joint salaries assessment is recommended; check spouse signature and information requirements.",
    },
  },
  {
    id: "joint-pa-election",
    flag: "jointPersonalAssessmentElection",
    part: "Part 7",
    figure: {
      zh: "夫婦共同選擇個人入息課稅",
      en: "Joint election for Personal Assessment",
    },
    note: {
      zh: "夫婦共同個人入息課稅需要雙方資料；按收到的報稅表核對簽署安排。",
      en: "Joint PA requires both spouses' details; check the signature arrangement on your return.",
    },
  },
  {
    id: "deductions",
    flag: "deductions",
    part: "Parts 4.3, 8, 9, 10, 11 & 12.4",
    figure: {
      zh: "強積金、個人進修、認可捐款、長者住宿照顧、住屋、年金/TVC、自願醫保及輔助生育扣除",
      en: "MPF, self-education, donations, elderly care, housing, annuity/TVC, VHIS, and assisted-reproduction deductions",
    },
    note: {
      zh: "僱傭相關扣除在第 4.3 部分；居所貸款利息/住宅租金在第 8 部分；自願醫保在第 9 部分；輔助生育在第 10 部分；年金及TVC在第 11 部分；長者住宿照顧在第 12.4 部分。",
      en: "Employment-related deductions sit in Part 4.3; home loan interest / domestic rent in Part 8; VHIS in Part 9; assisted reproduction in Part 10; annuity and TVC in Part 11; elderly residential care in Part 12.4.",
    },
  },
  {
    id: "allowances",
    flag: "allowances",
    part: "Part 12",
    figure: {
      zh: "基本、已婚、子女、供養父母/祖父母、兄弟姊妹、單親及傷殘相關免稅額",
      en: "Basic, married, child, parent/grandparent, sibling, single-parent, and disability-related allowances",
    },
    note: {
      zh: "按計算明細內的免稅額行核對申索人及受養人資料。",
      en: "Use the allowance lines to check claimant and dependant details.",
    },
  },
] as const satisfies readonly Bir60MappingRow[];

export function getBir60MappingRows(flags: Bir60MappingFlag[]): Bir60MappingRow[] {
  const flagSet = new Set(flags);
  return BIR60_MAPPING.filter((row) => flagSet.has(row.flag));
}
