"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { LOCALIZED_MARKETING_PATHS, localizedPath, type MarketingLocale } from "@/i18n/marketing/config";

export function chooseLocale(locale: "en" | MarketingLocale) {
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
  const locale = /^\/de(?=\/|$)/.test(pathname) ? "de"
    : /^\/zh-hans(?=\/|$)/.test(pathname) ? "zh-Hans" : "en";
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      if (event.target instanceof Node && !wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!LOCALIZED_MARKETING_PATHS.some(localized => localized === path)) return null;
  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 px-1.5 sm:px-2"
      >
        <Globe aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">{locale === "de" ? "DE" : locale === "zh-Hans" ? "中文" : "EN"}</span>
        <ChevronDown aria-hidden="true" className="h-3 w-3" />
      </button>
      <div className={`absolute right-0 top-full mt-2 z-50 min-w-[10rem] rounded-md border border-slate-200 bg-white py-1 shadow-lg${open ? "" : " hidden"}`}>
        {([
          ["en", "English"], ["zh-Hans", "简体中文"], ["de", "Deutsch"],
        ] as const).map(([target, name]) => (
          <a
            key={target}
            href={localizedPath(target, path)}
            hrefLang={target}
            lang={target}
            onClick={() => chooseLocale(target)}
            aria-current={locale === target ? "true" : undefined}
            className={`block px-3 py-2 text-sm hover:bg-slate-50${locale === target ? " font-medium" : ""}`}
          >
            {name}
          </a>
        ))}
      </div>
    </div>
  );
}
