"use client";

import { useLocale, useMessages } from "next-intl";
import { useMemo } from "react";
import { createWizardText } from "./text";
import type { Messages } from "@/i18n/merge";
import { normalizeLocale } from "@/i18n/locales";

export function useWizardLocale() {
  try {
    // This always reads one context, including when its missing-provider
    // error is caught. No hook is skipped when the provider comes or goes.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return normalizeLocale(useLocale());
  }
  catch { return "en" as const; }
}

export function useWizardText() {
  // Standalone renders and a missing provider must still render usable English.
  const locale = useWizardLocale();
  let messages: Messages | undefined;
  try {
    // Like useLocale above, useMessages always reads exactly one context.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    messages = useMessages().wizard as Messages | undefined;
  } catch { /* English without a provider. */ }
  return useMemo(() => createWizardText(messages, locale), [messages, locale]);
}
