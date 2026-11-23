import { MarketingChrome } from "./MarketingChrome";
import { MarketingLocaleCookie } from "./MarketingLocaleCookie";
import type { MarketingLocale } from "@/i18n/marketing/config";
export function LocalizedMarketingLayout({ locale, children }: { locale: MarketingLocale; children: React.ReactNode }) {
  return <div lang={locale}><MarketingLocaleCookie locale={locale} /><MarketingChrome locale={locale}>{children}</MarketingChrome></div>;
}
