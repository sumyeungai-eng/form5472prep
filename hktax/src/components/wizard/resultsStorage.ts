import type { FamilyScenarioInput, OptimizerResult } from "@/lib/tax/optimizer";

export const WIZARD_RESULT_STORAGE_KEY = "hktax:wizard:result:v1";

export type StoredWizardResult = {
  familyScenarioInput: FamilyScenarioInput;
  optimizerResult: OptimizerResult;
  storedAt: string;
};

const INFINITY_TOKEN = "__hktax_infinity__";

export function saveWizardResult(result: StoredWizardResult): void {
  window.sessionStorage.setItem(
    WIZARD_RESULT_STORAGE_KEY,
    JSON.stringify(result, (_key, value) => (value === Number.POSITIVE_INFINITY ? INFINITY_TOKEN : value)),
  );
}

export function loadWizardResult(): StoredWizardResult | null {
  const stored = window.sessionStorage.getItem(WIZARD_RESULT_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored, (_key, value) => (value === INFINITY_TOKEN ? Number.POSITIVE_INFINITY : value)) as StoredWizardResult;
  } catch {
    window.sessionStorage.removeItem(WIZARD_RESULT_STORAGE_KEY);
    return null;
  }
}
