"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { dictionary, type DictionaryKey, type Language } from "./dictionary";

export type YearOfAssessment = "2024_25" | "2025_26";

type I18nContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  year: YearOfAssessment;
  setYear: (year: YearOfAssessment) => void;
  t: (key: DictionaryKey) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

const defaultLang: Language = "zh";
const defaultYear: YearOfAssessment = "2025_26";
const langStorageKey = "hktax:lang";
const yearStorageKey = "hktax:year";

function isLanguage(value: string | null): value is Language {
  return value === "zh" || value === "en";
}

function isYearOfAssessment(value: string | null): value is YearOfAssessment {
  return value === "2024_25" || value === "2025_26";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(defaultLang);
  const [year, setYearState] = useState<YearOfAssessment>(defaultYear);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedLang = window.localStorage.getItem(langStorageKey);
    const storedYear = window.localStorage.getItem(yearStorageKey);

    if (isLanguage(storedLang)) {
      setLangState(storedLang);
    }

    if (isYearOfAssessment(storedYear)) {
      setYearState(storedYear);
    }
  }, []);

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(langStorageKey, nextLang);
    }
  }, []);

  const setYear = useCallback((nextYear: YearOfAssessment) => {
    setYearState(nextYear);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(yearStorageKey, nextYear);
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang,
      year,
      setYear,
      t: (key) => dictionary[key][lang]
    }),
    [lang, setLang, setYear, year]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
