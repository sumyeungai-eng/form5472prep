"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/useI18n";
import type { Language } from "@/lib/i18n/dictionary";
import type { YearOfAssessment } from "@/lib/i18n/I18nProvider";
import { Container } from "./Container";

const navLinks = [
  { href: "/", labelKey: "header.nav.home" },
  { href: "/wizard", labelKey: "header.nav.wizard" },
  { href: "/calculators", labelKey: "header.nav.calculators" },
  { href: "/deductions", labelKey: "header.nav.deductions" },
  { href: "/guides", labelKey: "header.nav.guides" }
] as const;

const languages: Language[] = ["zh", "en"];
const years: YearOfAssessment[] = ["2024_25", "2025_26"];

export function Header() {
  const { lang, setLang, setYear, t, year } = useI18n();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-900/95 text-white shadow-soft backdrop-blur">
      <Container className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link
          href="/"
          className="focus-ring inline-flex min-w-0 items-center gap-3 rounded-md"
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

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <nav
            aria-label={t("header.nav.ariaLabel")}
            className="flex flex-wrap gap-1"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-teal-50 transition hover:bg-white/10 hover:text-white"
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              className="inline-flex rounded-md border border-white/15 bg-white/10 p-1"
              aria-label={t("header.language.ariaLabel")}
            >
              {languages.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => setLang(language)}
                  className={`focus-ring rounded px-3 py-1.5 text-sm font-semibold transition ${
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
              className="form-select min-w-36 border-white/20 bg-white/95 text-navy-900"
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
