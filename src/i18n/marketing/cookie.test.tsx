import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MarketingLocaleCookie } from "@/components/marketing/MarketingLocaleCookie";
vi.mock("react", async original => ({ ...await original<typeof import("react")>(), useEffect: (effect: () => void) => effect() }));
afterEach(() => vi.unstubAllGlobals());
describe("marketing locale cookie", () => {
  it.each(["de", "zh-Hans"] as const)("sets %s only for a visitor without a preference", locale => {
    const document = { cookie: "analytics=1" };
    vi.stubGlobal("document", document);
    renderToStaticMarkup(<MarketingLocaleCookie locale={locale} />);
    expect(document.cookie).toBe(`NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`);
  });
  it.each(["en", "fr", "zh-Hant", "", "de"])("preserves existing portal preference %s", existing => {
    const cookie = `analytics=1; NEXT_LOCALE=${existing}; other=2`;
    const document = { cookie };
    vi.stubGlobal("document", document);
    renderToStaticMarkup(<MarketingLocaleCookie locale="zh-Hans" />);
    expect(document.cookie).toBe(cookie);
  });
});

// Keep translated behavior covered while the production switch is disabled.
vi.mock("@/config/i18n-switch.mjs", async original => ({
  ...await original<typeof import("@/config/i18n-switch.mjs")>(), I18N_ENABLED: true,
}));
