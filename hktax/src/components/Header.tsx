"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useI18n } from "@/lib/i18n/useI18n";
import type { Language } from "@/lib/i18n/dictionary";
import type { YearOfAssessment } from "@/lib/i18n/I18nProvider";
import { Container } from "./Container";

const navLinks = [
  { href: "/", labelKey: "header.nav.home" },
  { href: "/wizard", labelKey: "header.nav.wizard" },
  { href: "/calculators", labelKey: "header.nav.calculators" },
  { href: "/deductions", labelKey: "header.nav.deductions" },
  { href: "/guides", labelKey: "header.nav.guides" },
  { href: "/contact", labelKey: "header.nav.contact" }
] as const;

const languages: Language[] = ["zh", "en"];
const years: YearOfAssessment[] = ["2024_25", "2025_26"];

export function Header() {
  const { lang, setLang, setYear, t, year } = useI18n();
  const pathname = usePathname();
  const menuId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuLabel = isMenuOpen ? "Close menu / 關閉選單" : "Open menu / 開啟選單";

  useEffect(() => {
    const updateScrolled = (): void => {
      setIsScrolled(window.scrollY > 8);
    };

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrolled);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-white/10 text-white backdrop-blur transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isScrolled ? "bg-navy-900/[0.98] shadow-md" : "bg-navy-900/95 shadow-soft"
      }`}
    >
      <Container className="flex min-h-16 items-center justify-between gap-2 px-3 py-2 md:hidden">
        <Link
          href="/"
          className="focus-ring inline-flex min-h-11 min-w-0 items-center gap-1.5 rounded-md"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gold text-sm font-black text-navy-900">
            {t("site.logoMark")}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold leading-tight">
              {t("site.name.zh")}
            </span>
            <span className="block truncate text-[11px] leading-tight text-teal-100">
              {t("site.name.en")}
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="inline-flex min-h-11 items-center rounded-md border border-white/15 bg-white/10 px-2 text-xs font-semibold text-teal-50">
            {compactYearLabel(year)}
          </span>
          {/* A single switch-to-the-other-language button rather than the desktop
              pair: the two-button group cost 90px of a 375px bar and truncated the
              site name. Shows the language you would switch TO. */}
          <button
            type="button"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/15 bg-white/10 px-2 text-sm font-semibold text-teal-50 transition hover:bg-white/15 hover:text-white"
            aria-label={t(lang === "zh" ? "header.language.enAriaLabel" : "header.language.zhAriaLabel")}
          >
            {t(lang === "zh" ? "header.language.en" : "header.language.zh")}
          </button>
          <button
            type="button"
            className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/15 bg-white/10 px-3 text-xl font-semibold leading-none text-teal-50 transition hover:bg-white/15 hover:text-white"
            aria-controls={menuId}
            aria-expanded={isMenuOpen}
            aria-label={menuLabel}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" className="relative block h-5 w-5">
              <span
                className={`absolute left-0 top-1/2 h-0.5 w-5 rounded-full bg-current transition ${
                  isMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-2 rotate-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-0.5 w-5 rounded-full bg-current transition ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-0.5 w-5 rounded-full bg-current transition ${
                  isMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-2 rotate-0"
                }`}
              />
            </span>
          </button>
        </div>
      </Container>

      <div id={menuId} className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
        <Container className="border-t border-white/10 pb-3 pt-2">
          <nav
            aria-label={t("header.nav.ariaLabel")}
            className="grid gap-1"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-teal-50 transition hover:bg-white/10 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          <label className="mt-2 block text-xs font-semibold text-teal-100">
            <span className="sr-only">{t("header.year.ariaLabel")}</span>
            <select
              aria-label={t("header.year.ariaLabel")}
              className="form-select min-h-11 w-full border-white/20 bg-white/95 text-navy-900"
              value={year}
              onChange={(event) => setYear(event.target.value as YearOfAssessment)}
            >
              {years.map((optionYear) => (
                <option key={optionYear} value={optionYear}>
                  {t(`header.year.${optionYear}`)}
                </option>
              ))}
            </select>
          </label>
        </Container>
      </div>

      <Container className="hidden flex-col gap-4 py-4 md:flex md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="focus-ring inline-flex min-h-11 min-w-0 items-center gap-3 rounded-md"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gold text-base font-black text-navy-900">
            {t("site.logoMark")}
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold leading-tight">
              {t("site.name.zh")}
            </span>
            <span className="block text-sm leading-tight text-teal-100">
              {t("site.name.en")}
            </span>
          </span>
        </Link>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <nav
            aria-label={t("header.nav.ariaLabel")}
            className="flex flex-wrap gap-1"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring inline-flex min-h-11 items-center whitespace-nowrap rounded-md px-3 text-sm font-medium text-teal-50 transition hover:bg-white/10 hover:text-white"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              className="inline-flex rounded-md border border-white/15 bg-white/10"
              aria-label={t("header.language.ariaLabel")}
            >
              {languages.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => setLang(language)}
                  className={`focus-ring min-h-11 min-w-11 rounded px-3 text-sm font-semibold transition ${
                    lang === language
                      ? "bg-white text-navy-900"
                      : "text-teal-50 hover:bg-white/10"
                  }`}
                  aria-pressed={lang === language}
                  aria-label={t(`header.language.${language}AriaLabel`)}
                >
                  {t(`header.language.${language}`)}
                </button>
              ))}
            </div>

            <select
              aria-label={t("header.year.ariaLabel")}
              className="form-select min-h-11 min-w-36 border-white/20 bg-white/95 text-navy-900"
              value={year}
              onChange={(event) => setYear(event.target.value as YearOfAssessment)}
            >
              {years.map((optionYear) => (
                <option key={optionYear} value={optionYear}>
                  {t(`header.year.${optionYear}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Container>
    </header>
  );
}

function compactYearLabel(year: YearOfAssessment): string {
  return year.replace("_", "/");
}
