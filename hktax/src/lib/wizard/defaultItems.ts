import type { WizardMoneyItem } from "./wizardState";

export function defaultMoneyItem(prefix: string, index: number): WizardMoneyItem {
  return {
    key: `${prefix}-${index}`,
    labelZh: defaultMoneyItemLabelZh(prefix, index),
    labelEn: defaultMoneyItemLabelEn(prefix, index),
    amount: 0,
  };
}

// Every prefix needs its own readable default in BOTH languages. The generic
// fallback is deliberately a translated "item N" and never `${prefix}-${index}`:
// that slug is the item's key, and using it as a label put raw ids such as
// "accommodation-1" in front of the filer as the item's Chinese and English name.
const MONEY_ITEM_LABELS: Record<string, { zh: string; en: string }> = {
  income: { zh: "收入項目", en: "Income item" },
  accommodation: { zh: "僱主提供的居所", en: "Employer accommodation" },
  expense: { zh: "開支項目", en: "Expense item" },
  depreciation: { zh: "折舊項目", en: "Depreciation item" },
};

function defaultMoneyItemLabelZh(prefix: string, index: number): string {
  if (prefix === "income" && index === 1) {
    return "薪金";
  }

  return `${MONEY_ITEM_LABELS[prefix]?.zh ?? "項目"} ${index}`;
}

function defaultMoneyItemLabelEn(prefix: string, index: number): string {
  if (prefix === "income" && index === 1) {
    return "Salary";
  }

  return `${MONEY_ITEM_LABELS[prefix]?.en ?? "Item"} ${index}`;
}
