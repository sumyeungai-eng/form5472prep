import { afterEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider, useLocale, useMessages } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LanguageMenu, chooseLocale } from "@/components/marketing/LanguageMenu";
import { MarketingLocaleCookie } from "@/components/marketing/MarketingLocaleCookie";
import { LocalizedMarketingLayout } from "@/components/marketing/LocalizedMarketingLayout";
import { WizardStaticProvider } from "@/components/wizard/WizardStaticProvider";
import { WizardCopy } from "@/components/wizard/WizardCopy";
import { createWizardText } from "@/components/wizard/text";
import german from "../../messages/de/wizard.json";
import common from "../../messages/en/common.json";
import domain from "../../messages/en/domain.json";
import wizard from "../../messages/en/wizard.json";

const effects = vi.hoisted(() => [] as Array<() => unknown>);
vi.mock("react", async original => ({
  ...await original<typeof import("react")>(),
  useEffect: (effect: () => unknown) => { effects.push(effect); },
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/de/pricing" }));
afterEach(() => { effects.length = 0; vi.unstubAllGlobals(); });

describe("disabled language UI", () => {
  it("renders neither picker, including without an intl provider", () => {
    expect(renderToStaticMarkup(<LanguageMenu />)).toBe("");
    expect(renderToStaticMarkup(<LanguageSwitcher />)).toBe("");
  });

  it("never reads or writes marketing preferences, even after client effects", () => {
    const read = vi.fn(() => "NEXT_LOCALE=de");
    const write = vi.fn();
    vi.stubGlobal("document", { get cookie() { return read(); }, set cookie(value: string) { write(value); } });
    renderToStaticMarkup(<MarketingLocaleCookie locale="zh-Hans" />);
    chooseLocale("de");
    effects.splice(0).forEach(effect => effect());
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });

  it("keeps the static wizard provider in English after effects despite browser preferences", () => {
    const read = vi.fn(() => "NEXT_LOCALE=zh-Hans");
    vi.stubGlobal("document", { get cookie() { return read(); } });
    vi.stubGlobal("navigator", { language: "de" });
    function Probe() {
      expect(useLocale()).toBe("en");
      expect(useMessages()).toEqual({ common, domain, wizard });
      return <WizardCopy text="Continue" />;
    }
    expect(renderToStaticMarkup(<WizardStaticProvider><Probe /></WizardStaticProvider>))
      .toBe('<div lang="en" class="contents">Continue</div>');
    effects.splice(0).forEach(effect => effect());
    expect(read).not.toHaveBeenCalled();
  });

  it("ignores translated wizard messages even from an existing German context", () => {
    expect(createWizardText(german, "de")("Continue")).toBe("Continue");
    expect(renderToStaticMarkup(<NextIntlClientProvider locale="de" messages={{ wizard: german }}>
      <WizardCopy text="Continue" />
    </NextIntlClientProvider>)).toBe("Continue");
  });

  it.each(["de", "zh-Hans"] as const)("keeps %s layout chrome English without language markup or picker links", locale => {
    const html = renderToStaticMarkup(<LocalizedMarketingLayout locale={locale}><p>Content</p></LocalizedMarketingLayout>);
    expect(html).toMatch(/^<div lang="en">/);
    expect(html).toContain("Start filing");
    expect(html).not.toMatch(/hrefLang=|hreflang=|lang="(?:de|zh-Hans)"|aria-label="Language:|href="\/(?:de|zh-hans)(?:\/|")/);
  });
});
