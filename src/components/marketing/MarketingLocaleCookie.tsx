"use client";
import { I18N_ENABLED } from "@/config/i18n-switch.mjs";
import { useEffect } from "react";
import type { MarketingLocale } from "@/i18n/marketing/config";
export function MarketingLocaleCookie({ locale }: { locale: MarketingLocale }) {
  useEffect(() => {
    if (!I18N_ENABLED) return;
    if (!document.cookie.split(";").some(part => part.trim().startsWith("NEXT_LOCALE="))) {
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [locale]);
  return null;
}
