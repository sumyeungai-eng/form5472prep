"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/useI18n";
import { Container } from "./Container";

const footerLinks = [
  { href: "/", labelKey: "header.nav.home" },
  { href: "/wizard", labelKey: "header.nav.wizard" },
  { href: "/calculators", labelKey: "header.nav.calculators" },
  { href: "/deductions", labelKey: "header.nav.deductions" },
  { href: "/guides", labelKey: "header.nav.guides" },
  { href: "/contact", labelKey: "header.nav.contact" },
  { href: "/feedback", labelKey: "footer.links.feedback" }
] as const;

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-warm-200 bg-white">
      <Container className="grid gap-8 py-10 md:grid-cols-[1fr_auto] md:items-start">
        <div className="max-w-2xl">
          <p className="text-base font-semibold text-navy-900">
            {t("site.name.full")}
          </p>
          <p className="mt-3 text-sm leading-6 text-warm-700">
            {t("footer.disclaimer")}
          </p>
          <p className="mt-3 text-sm font-semibold text-navy-800">
            {t("footer.affiliation")}
          </p>
        </div>

        <nav
          aria-label={t("footer.links.ariaLabel")}
          className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-navy-700 md:justify-end"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring rounded-md hover:text-teal-700"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        <p className="text-xs text-warm-600 md:col-span-2">
          {t("footer.copyrightPrefix")} {t("site.name.full")}{" "}
          {t("footer.copyright")}
        </p>
      </Container>
    </footer>
  );
}
