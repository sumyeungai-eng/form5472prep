import { effectiveLocale } from "@/i18n/locales";
import { MarketingChrome } from "./MarketingChrome";
import { MarketingLocaleCookie } from "./MarketingLocaleCookie";
import type { MarketingLocale } from "@/i18n/marketing/config";
export function LocalizedMarketingLayout({ locale, children }: { locale: MarketingLocale; children: React.ReactNode }) {
  return <div lang={effectiveLocale(locale)}><MarketingLocaleCookie locale={locale} /><MarketingChrome locale={locale}>{children}</MarketingChrome></div>;
}
