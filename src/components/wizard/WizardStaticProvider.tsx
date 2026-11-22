"use client";

import { useEffect, useState } from "react";
import { NextIntlClientProvider } from "next-intl";
import common from "../../../messages/en/common.json";
import domain from "../../../messages/en/domain.json";
import wizard from "../../../messages/en/wizard.json";
import { normalizeLocale, type Locale } from "@/i18n/locales";
import { deepMerge, type Messages } from "@/i18n/merge";

const english: Messages = { common, domain, wizard };
export function WizardStaticProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ locale: Locale; messages: Messages }>({ locale: "en", messages: english });
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const cookie = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("NEXT_LOCALE="));
        const locale = normalizeLocale(cookie ? decodeURIComponent(cookie.slice("NEXT_LOCALE=".length)) : navigator.language);
        if (locale === "en") return;
        const [localizedCommon, localizedDomain, localizedWizard] = await Promise.all([
          import(`../../../messages/${locale}/common.json`),
          import(`../../../messages/${locale}/domain.json`),
          import(`../../../messages/${locale}/wizard.json`),
        ]);
        const messages: Messages = { common: localizedCommon.default, domain: localizedDomain.default, wizard: localizedWizard.default };
        if (active) setState({ locale, messages: deepMerge(english, messages) });
      } catch { /* Bad cookie or failed chunk: keep the English form usable. */ }
    }
    void load();
    return () => { active = false; };
  }, []);
  return (
    <NextIntlClientProvider locale={state.locale} messages={state.messages} timeZone="UTC" onError={() => {}}>
      {children}
    </NextIntlClientProvider>
  );
}
