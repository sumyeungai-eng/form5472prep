"use client";

import { I18N_ENABLED } from "@/config/i18n-switch.mjs";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABELS } from "@/i18n/locales";
import { setLocale } from "@/i18n/actions";

export function LanguageSwitcher() {
  return I18N_ENABLED ? <EnabledLanguageSwitcher /> : null;
}

function EnabledLanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  return (
    <select
      aria-label={t("language")}
      value={locale}
      disabled={pending || saving}
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-600"
      onChange={async (event) => {
        const next = event.target.value;
        setSaving(true);
        try {
          await setLocale(next);
          startTransition(() => router.refresh());
        } catch (error) {
          console.warn("[i18n] Could not change language", error);
        } finally {
          setSaving(false);
        }
      }}
    >
      {LOCALES.map((value) => <option key={value} value={value} lang={value}>{LOCALE_LABELS[value]}</option>)}
    </select>
  );
}
