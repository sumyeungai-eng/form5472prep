import type { WizardMoneyItem } from "./wizardState";

export function defaultMoneyItem(prefix: string, index: number): WizardMoneyItem {
  return {
    key: `${prefix}-${index}`,
    labelZh: defaultMoneyItemLabelZh(prefix, index),
    labelEn: defaultMoneyItemLabelEn(prefix, index),
    amount: 0,
  };
}

function defaultMoneyItemLabelZh(prefix: string, index: number): string {
  if (prefix === "income") {
    return index === 1 ? "薪金" : `收入項目 ${index}`;
  }

  return `${prefix}-${index}`;
}

function defaultMoneyItemLabelEn(prefix: string, index: number): string {
  if (prefix === "income") {
    return index === 1 ? "Salary" : `Income item ${index}`;
  }

  return `${prefix}-${index}`;
}
