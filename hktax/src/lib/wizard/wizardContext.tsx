"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  WIZARD_STATE_VERSION,
  createDefaultWizardState,
  type WizardPersonId,
  type WizardPersonState,
  type WizardState,
} from "./wizardState";
import { wizardStateSchema } from "./wizardSchemas";

export const WIZARD_STORAGE_KEY = `hktax:wizard:v${WIZARD_STATE_VERSION}`;

type WizardContextValue = {
  wizardState: WizardState;
  currentStepIndex: number;
  hasHydrated: boolean;
  setWizardState: (nextState: WizardState | ((previous: WizardState) => WizardState)) => void;
  updateWizardState: (patch: Partial<WizardState>) => void;
  updatePerson: (
    personId: WizardPersonId,
    updater: Partial<WizardPersonState> | ((previous: WizardPersonState) => WizardPersonState),
  ) => void;
  setCurrentStepIndex: (stepIndex: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  clearData: () => void;
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [wizardState, setWizardStateState] = useState<WizardState>(() => createDefaultWizardState());
  const [currentStepIndex, setCurrentStepIndexState] = useState(0);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!stored) {
      setHasHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;
      const result = wizardStateSchema.safeParse(parsed);
      if (result.success && result.data.version === WIZARD_STATE_VERSION) {
        setWizardStateState(result.data);
      } else {
        window.localStorage.removeItem(WIZARD_STORAGE_KEY);
      }
    } catch {
      window.localStorage.removeItem(WIZARD_STORAGE_KEY);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(wizardState));
  }, [hasHydrated, wizardState]);

  const setWizardState = useCallback(
    (nextState: WizardState | ((previous: WizardState) => WizardState)) => {
      setWizardStateState(nextState);
    },
    [],
  );

  const updateWizardState = useCallback((patch: Partial<WizardState>) => {
    setWizardStateState((previous) => ({
      ...previous,
      ...patch,
    }));
  }, []);

  const updatePerson = useCallback<WizardContextValue["updatePerson"]>((personId, updater) => {
    setWizardStateState((previous) => {
      const key = personId === "A" ? "personA" : "personB";
      const nextPerson = typeof updater === "function"
        ? updater(previous[key])
        : {
          ...previous[key],
          ...updater,
        };

      return {
        ...previous,
        [key]: nextPerson,
      };
    });
  }, []);

  const setCurrentStepIndex = useCallback((stepIndex: number) => {
    setCurrentStepIndexState(Math.max(0, stepIndex));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndexState((previous) => previous + 1);
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStepIndexState((previous) => Math.max(0, previous - 1));
  }, []);

  const clearData = useCallback(() => {
    setWizardStateState(createDefaultWizardState());
    setCurrentStepIndexState(0);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(WIZARD_STORAGE_KEY);
    }
  }, []);

  const value = useMemo<WizardContextValue>(
    () => ({
      wizardState,
      currentStepIndex,
      hasHydrated,
      setWizardState,
      updateWizardState,
      updatePerson,
      setCurrentStepIndex,
      nextStep,
      previousStep,
      clearData,
    }),
    [
      clearData,
      currentStepIndex,
      hasHydrated,
      nextStep,
      previousStep,
      setCurrentStepIndex,
      setWizardState,
      updatePerson,
      updateWizardState,
      wizardState,
    ],
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within WizardProvider.");
  }

  return context;
}
