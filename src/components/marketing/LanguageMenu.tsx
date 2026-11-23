"use client";
import { usePathname } from "next/navigation";
import { LOCALIZED_MARKETING_PATHS, localizedPath, type MarketingLocale } from "@/i18n/marketing/config";

function chooseLocale(locale: "en" | MarketingLocale) {
  try {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // A blocked cookie must never prevent the anchor's normal navigation.
  }
}
// Layouts have no pathname prop; this small island preserves the current page.
export function LanguageMenu({ label = "Language" }: { label?: string }) {
  const pathname = usePathname() ?? "/";
  const path = pathname.replace(/^\/(de|zh-hans)(?=\/|$)/, "") || "/";
  if (!LOCALIZED_MARKETING_PATHS.some(localized => localized === path)) return null;
  return <nav aria-label={label} className="mx-auto flex w-full max-w-6xl flex-wrap gap-3 px-6 py-3 text-sm">
    <a href={localizedPath("en", path)} hrefLang="en" lang="en" onClick={() => chooseLocale("en")}>English</a>
    <a href={localizedPath("zh-Hans", path)} hrefLang="zh-Hans" lang="zh-Hans" onClick={() => chooseLocale("zh-Hans")}>简体中文</a>
    <a href={localizedPath("de", path)} hrefLang="de" lang="de" onClick={() => chooseLocale("de")}>Deutsch</a>
  </nav>;
}
