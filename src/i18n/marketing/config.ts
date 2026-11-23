import { SITE_URL } from "@/lib/seo";
export const MARKETING_LOCALES = ["zh-Hans", "de"] as const;
export type MarketingLocale = typeof MARKETING_LOCALES[number];
export const MARKETING_PATH_PREFIX: Record<MarketingLocale, "/zh-hans" | "/de"> = { "zh-Hans": "/zh-hans", de: "/de" };
export const MARKETING_LOCALES_INDEXABLE = true;
export const LOCALIZED_MARKETING_PATHS = ["/", "/pricing", "/services", "/faq", "/form-5472-penalty-calculator"] as const;
export function localizedPath(locale: MarketingLocale | "en", path: string): string {
  if (locale === "en" || !LOCALIZED_MARKETING_PATHS.some(p => p === path)) return path;
  return MARKETING_PATH_PREFIX[locale] + (path === "/" ? "" : path);
}
export function marketingLanguageAlternates(path: string): Record<string, string> | undefined {
  if (!MARKETING_LOCALES_INDEXABLE) return undefined;
  return { en: SITE_URL + path, "zh-Hans": SITE_URL + localizedPath("zh-Hans", path), de: SITE_URL + localizedPath("de", path), "x-default": SITE_URL + path };
}
