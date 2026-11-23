import { catalogText } from "./translation";
import { getMarketingTranslator } from "@/i18n/marketing";
import { localizedPath, MARKETING_LOCALES_INDEXABLE, type MarketingLocale } from "@/i18n/marketing/config";
import { MarketingMobileMenu } from "./MarketingMobileMenu";
import { LanguageMenu } from "./LanguageMenu";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { MobileMenu } from "@/components/MobileMenu";
import { HeaderAuthButtons } from "@/components/HeaderAuthButtons";
import { Button } from "@/components/ui/button";
import { SERVICE_PAGES, servicePath } from "@/lib/services-pages";
import { CONTACT_EMAIL } from "@/lib/contactEmail";

// No `force-dynamic` and no cookie reads here: the auth-dependent header bits are
// client islands (MobileMenu + HeaderAuthButtons) that poll /api/me after paint,
// so the whole marketing shell can be statically generated and edge-cached.

export function MarketingChrome({ children, locale = "en" }: { children: React.ReactNode; locale?: "en" | MarketingLocale }) {
  const t = getMarketingTranslator(locale);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="relative border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={localizedPath(locale, "/")}  aria-label={t("chrome.s001")}>
            <Logo mark className="h-9 w-9 min-[430px]:hidden" />
            <Logo className="hidden min-[430px]:block" />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            {locale === "en" ? <MobileMenu /> : <MarketingMobileMenu
              links={[["/pricing", "s002"], ["/ein", "s003"], ["/itin", "s004"], ["/form-7004-extension", "s020"], ["/blog", "s006"], ["/services", "s015"], ["/faq", "s024"]].map(([path, key]) => ({ href: localizedPath(locale, path), label: t(`chrome.${key}`) }))}
              signInLabel={t("chrome.s008")} openLabel={t("chrome.openMenu")} closeLabel={t("chrome.closeMenu")}
            />}
            <Link
              href={localizedPath(locale, "/pricing")}
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              {t("chrome.s002")}
            </Link>
            <Link
              href={localizedPath(locale, "/ein")}
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              {t("chrome.s003")}
            </Link>
            <Link
              href={localizedPath(locale, "/itin")}
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              {t("chrome.s004")}
            </Link>
            <Link
              href={localizedPath(locale, "/form-7004-extension")}
              className="hidden lg:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              {t("chrome.s005")}
            </Link>
            <Link
              href={localizedPath(locale, "/blog")}
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              {t("chrome.s006")}
            </Link>
            <Link
              href={localizedPath(locale, "/contact")}
              className="hidden sm:inline text-sm text-slate-600 hover:text-slate-900 px-2"
            >
              {t("chrome.s007")}
            </Link>
            {/* Buttons are rendered here (server) so the client island does not
                ship Button's cn()/tailwind-merge code — see HeaderAuthButtons. */}
            <HeaderAuthButtons
              signInButton={<Button variant="ghost" size="sm">{t("chrome.s008")}</Button>}
              startButton={<Button size="sm">{t("chrome.s009")}</Button>}
              dashboardButton={<Button size="sm">{t("chrome.s010")}</Button>}
            />
          </nav>
        </div>
      </header>
      {(locale !== "en" || MARKETING_LOCALES_INDEXABLE) && <LanguageMenu label={t("chrome.language")} />}
      <main className="flex-1">{children}</main>
      <footer className="border-t border-paper-edge bg-paper text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5">
            <div className="sm:col-span-2 space-y-4">
              <Logo />
              <p className="max-w-sm leading-relaxed">
                {t("chrome.s011")}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                {t("chrome.s012")}
              </p>
              <p>
                {t("chrome.s013")}{" "}
                <a href={localizedPath(locale, `mailto:${CONTACT_EMAIL}`)} className="text-accent hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>
                <a
                  href={localizedPath(locale, "https://www.trustpilot.com/review/form5472prep.com")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-ink"
                >
                  <span aria-hidden className="text-[#00b67a]">★</span> {t("chrome.s014")}</a>
              </p>
            </div>
            <nav className="space-y-2.5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-ink">{t("chrome.s015")}</p>
              <ul className="space-y-2">
                <li><Link href={localizedPath(locale, "/services")}  className="hover:text-ink">{t("chrome.s016")}</Link></li>
                <li><Link href={localizedPath(locale, "/pricing")}  className="hover:text-ink">{t("chrome.s017")}</Link></li>
                <li><Link href={localizedPath(locale, "/ein")}  className="hover:text-ink">{t("chrome.s018")}</Link></li>
                <li><Link href={localizedPath(locale, "/itin")}  className="hover:text-ink">{t("chrome.s019")}</Link></li>
                <li><Link href={localizedPath(locale, "/form-7004-extension")}  className="hover:text-ink">{t("chrome.s020")}</Link></li>
                <li><Link href={localizedPath(locale, "/partners")}  className="hover:text-ink">{t("chrome.s021")}</Link></li>
                <li><Link href={localizedPath(locale, "/partner/sign-in")}  className="hover:text-ink">{t("chrome.s022")}</Link></li>
                <li><Link href={localizedPath(locale, "/blog")}  className="hover:text-ink">{t("chrome.s023")}</Link></li>
                <li><Link href={localizedPath(locale, "/faq")}  className="hover:text-ink">{t("chrome.s024")}</Link></li>
                <li><Link href={localizedPath(locale, "/contact")}  className="hover:text-ink">{t("chrome.s007")}</Link></li>
                <li><Link href={localizedPath(locale, "/about")}  className="hover:text-ink">{t("chrome.s025")}</Link></li>
                <li><Link href={localizedPath(locale, "/press")}  className="hover:text-ink">{t("chrome.s026")}</Link></li>
              </ul>
            </nav>
            <nav className="space-y-2.5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-ink">{t("chrome.s027")}</p>
              <ul className="space-y-2">
                <li><Link href={localizedPath(locale, "/do-i-need-to-file-form-5472")}  className="hover:text-ink">{t("chrome.s028")}</Link></li>
                <li><Link href={localizedPath(locale, "/form-5472-deadline-calculator")}  className="hover:text-ink">{t("chrome.s029")}</Link></li>
                <li><Link href={localizedPath(locale, "/form-5472-penalty-calculator")}  className="hover:text-ink">{t("chrome.s030")}</Link></li>
                <li><Link href={localizedPath(locale, "/irs-yearly-average-exchange-rates")}  className="hover:text-ink">{t("chrome.s031")}</Link></li>
                <li><Link href={localizedPath(locale, "/form-5472-reportable-transactions-checker")}  className="hover:text-ink">{t("chrome.s032")}</Link></li>
                <li><Link href={localizedPath(locale, "/form-5472-late-filing-checker")}  className="hover:text-ink">{t("chrome.s033")}</Link></li>
                <li><Link href={localizedPath(locale, "/foreign-owned-llc-compliance-calendar")}  className="hover:text-ink">{t("chrome.s034")}</Link></li>
                <li><Link href={localizedPath(locale, "/llc-annual-fees-by-state")}  className="hover:text-ink">{t("chrome.s035")}</Link></li>
                <li><Link href={localizedPath(locale, "/form-5472-statistics")}  className="hover:text-ink">{t("chrome.s036")}</Link></li>
              </ul>
            </nav>
            <nav className="space-y-2.5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-ink">{t("chrome.s037")}</p>
              <ul className="space-y-2">
                <li><Link href={localizedPath(locale, "/terms")}  className="hover:text-ink">{t("chrome.s038")}</Link></li>
                <li><Link href={localizedPath(locale, "/privacy")}  className="hover:text-ink">{t("chrome.s039")}</Link></li>
                <li><Link href={localizedPath(locale, "/cookies")}  className="hover:text-ink">{t("chrome.s040")}</Link></li>
                <li><Link href={localizedPath(locale, "/editorial-policy")}  className="hover:text-ink">{t("chrome.s041")}</Link></li>
                <li><Link href={localizedPath(locale, "/data-retention")}  className="hover:text-ink">{t("chrome.s042")}</Link></li>
                <li><Link href={localizedPath(locale, "/security")}  className="hover:text-ink">{t("chrome.s043")}</Link></li>
              </ul>
            </nav>
          </div>
          <nav aria-label={t("chrome.s044")} className="mt-10 space-y-3 border-t border-paper-edge pt-8">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-ink">{t("chrome.s044")}</p>
            <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICE_PAGES.map((p) => (
                <li key={p.slug}><Link href={localizedPath(locale, servicePath(p.slug))} className="hover:text-ink">{catalogText(locale, t, `services.pages.${p.slug}.h1`, p.h1)}</Link></li>
              ))}
              <li><Link href={localizedPath(locale, "/compare")}  className="hover:text-ink">{t("chrome.s045")}</Link></li>
              <li><Link href={localizedPath(locale, "/compare/form-5472-filing-services")}  className="hover:text-ink">{t("chrome.s046")}</Link></li>
            </ul>
          </nav>
          <nav aria-label={t("chrome.s023")} className="mt-10 space-y-3 border-t border-paper-edge pt-8">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-ink">{t("chrome.s023")}</p>
            <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              <li><Link href={localizedPath(locale, "/irs-form-5472")}  className="hover:text-ink">{t("chrome.s047")}</Link></li>
              <li><Link href={localizedPath(locale, "/form-5472-by-country")}  className="hover:text-ink">{t("chrome.s048")}</Link></li>
              <li><Link href={localizedPath(locale, "/form-5472-instructions")}  className="hover:text-ink">{t("chrome.s049")}</Link></li>
              <li><Link href={localizedPath(locale, "/form-5472-example")}  className="hover:text-ink">{t("chrome.s050")}</Link></li>
              <li><Link href={localizedPath(locale, "/form-5472-penalty")}  className="hover:text-ink">{t("chrome.s051")}</Link></li>
              <li><Link href={localizedPath(locale, "/form-5472-reasonable-cause-statement")}  className="hover:text-ink">{t("chrome.s052")}</Link></li>
              <li><Link href={localizedPath(locale, "/form-5472-fax-number")}  className="hover:text-ink">{t("chrome.s053")}</Link></li>
              <li><Link href={localizedPath(locale, "/pro-forma-1120")}  className="hover:text-ink">{t("chrome.s054")}</Link></li>
              <li><Link href={localizedPath(locale, "/blog/form-5472-deadline-2026")}  className="hover:text-ink">{t("chrome.s055")}</Link></li>
              <li><Link href={localizedPath(locale, "/blog/what-is-form-5472")}  className="hover:text-ink">{t("chrome.s056")}</Link></li>
            </ul>
          </nav>
          {locale !== "en" && <p>{t("chrome.englishAuthoritative")}</p>}
          <div className="mt-10 border-t border-paper-edge pt-6">
            <p>{t("chrome.s057")}{new Date().getFullYear()} {t("chrome.s058")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
