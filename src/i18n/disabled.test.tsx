import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTranslator, NextIntlClientProvider, useLocale, useMessages } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import common from "../../messages/en/common.json";
import domain from "../../messages/en/domain.json";
import portal from "../../messages/en/portal.json";
import wizard from "../../messages/en/wizard.json";
import requestConfig from "./request";
import { effectiveLocale, normalizeLocale } from "./locales";
import { setLocale } from "./actions";
import AppLayout from "@/app/(app)/layout";
import { FilingLocked } from "@/components/FilingLocked";

const state = vi.hoisted(() => ({
  cookie: undefined as { value: string } | undefined,
  language: "de,zh-Hans;q=0.9",
  set: vi.fn(), update: vi.fn(),
}));
vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => state.cookie, set: state.set }),
  headers: () => ({ get: (key: string) => key === "host" ? "www.form5472prep.com" : state.language }),
}));
vi.mock("next-intl/server", () => ({
  getRequestConfig: (callback: unknown) => callback,
  getLocale: async () => (await config()).locale,
  getMessages: async () => (await config()).messages,
  getTranslations: async (namespace: string) => {
    const { messages } = await config();
    return createTranslator({ locale: "en", messages, namespace });
  },
}));
vi.mock("@/lib/session", () => ({ getCurrentUser: async () => ({ id: "user", email: "client@example.com", locale: "de" }) }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { update: state.update } } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const config = () => requestConfig({ locale: "de", requestLocale: Promise.resolve("zh-Hans") });
const english = { common, domain, portal, wizard };

beforeEach(() => { state.cookie = undefined; vi.clearAllMocks(); });

describe("disabled customer locales", () => {
  it.each(["de", "zh-Hans", undefined])("resolves cookie %s and browser languages to English messages", async cookie => {
    state.cookie = cookie ? { value: cookie } : undefined;
    for (const language of ["de", "zh-Hans", "de;q=0.2,zh-Hans;q=0.9"]) {
      state.language = language;
      const result = await config();
      expect(result.locale).toBe("en");
      expect(result.messages).toEqual(english);
      expect(state.cookie?.value).toBe(cookie);
      expect(state.set).not.toHaveBeenCalled();
      expect(state.update).not.toHaveBeenCalled();
    }
  });

  it("keeps stored preferences independent of the effective locale", async () => {
    expect(normalizeLocale("zh-TW")).toBe("zh-Hant");
    expect(effectiveLocale("zh-TW")).toBe("en");
    await setLocale("de");
    expect(state.set).not.toHaveBeenCalled();
    expect(state.update).not.toHaveBeenCalled();
  });

  it("passes English locale and catalogs to the actual portal provider and FilingLocked", async () => {
    state.cookie = { value: "zh-Hans" };
    function Probe() {
      expect(useLocale()).toBe("en");
      expect(useMessages()).toEqual(english);
      return <FilingLocked ownerEmail="client@example.com" />;
    }
    const html = renderToStaticMarkup(<NextIntlClientProvider locale="en" messages={english} timeZone="UTC">
      {await AppLayout({ children: <Probe /> })}
    </NextIntlClientProvider>);
    expect(html).toContain('lang="en"');
    expect(html).toContain(portal.locked.heading);
    expect(html).toContain(portal.locked.signIn);
    expect(html).not.toMatch(/lang="(?:de|zh-Hans)"|<select/);
  });
});
