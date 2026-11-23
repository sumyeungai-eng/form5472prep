import { SITE_URL } from "@/lib/seo";
import { MARKETING_LOCALES_INDEXABLE, localizedPath } from "./config";

// Read the shared gate at call time, just as metadata, chrome and sitemap do.
export function marketingLanguageAlternates(path: string): Record<string, string> | undefined {
  if (!MARKETING_LOCALES_INDEXABLE) return undefined;
  return { en: SITE_URL + path, "zh-Hans": SITE_URL + localizedPath("zh-Hans", path), de: SITE_URL + localizedPath("de", path), "x-default": SITE_URL + path };
}
