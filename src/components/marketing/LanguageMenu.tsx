"use client";
import { usePathname } from "next/navigation";
import { localizedPath } from "@/i18n/marketing/config";
// Layouts have no pathname prop; this small island preserves the current page.
export function LanguageMenu({ label = "Language" }: { label?: string }) {
  const pathname = usePathname() ?? "/";
  const path = pathname.replace(/^\/(de|zh-hans)(?=\/|$)/, "") || "/";
  return <nav aria-label={label} className="mx-auto flex w-full max-w-6xl flex-wrap gap-3 px-6 py-3 text-sm">
    <a href={localizedPath("en", path)} hrefLang="en" lang="en">English</a>
    <a href={localizedPath("zh-Hans", path)} hrefLang="zh-Hans" lang="zh-Hans">简体中文</a>
    <a href={localizedPath("de", path)} hrefLang="de" lang="de">Deutsch</a>
  </nav>;
}
