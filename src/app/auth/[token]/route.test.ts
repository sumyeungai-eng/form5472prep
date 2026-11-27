import { beforeEach, describe, expect, it, vi } from "vitest";

const languageSwitch = vi.hoisted(() => ({ enabled: true }));
vi.mock("@/config/i18n-switch.mjs", () => ({
  get I18N_ENABLED() { return languageSwitch.enabled; },
}));

// Magic-link ?next= handling (release gate PR 1 relies on the EXISTING rule:
// same-origin relative paths only, no new whitelist).
vi.mock("@/lib/magicLink", () => ({ verifyMagicLinkToken: vi.fn(() => "user_1") }));
vi.mock("@/lib/session", () => ({ makeUserToken: vi.fn(() => "signed-token") }));
const state = vi.hoisted(() => ({ locale: "en" as string | null, country: "China", update: vi.fn(), filing: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(async () => ({ id: "user_1", email: "client@example.test", locale: state.locale })), update: state.update },
    filing: { findFirst: state.filing },
  },
}));
beforeEach(() => {
  languageSwitch.enabled = true;
  state.locale = "en";
  state.update.mockReset();
  state.filing.mockReset().mockResolvedValue({ ownerCountryTaxResidence: "China" });
});

import { GET } from "./route";

const go = async (next: string | null) => {
  const qs = next === null ? "" : `?next=${encodeURIComponent(next)}`;
  const res = await GET(new Request(`https://app.example.test/auth/tok${qs}`), { params: { token: "tok" } });
  return res.headers.get("location");
};

describe("magic link ?next=", () => {
  it("lands on the filing page (order-time link)", async () => {
    expect(await go("/filings/f1")).toBe("https://app.example.test/filings/f1");
  });
  it("keeps existing sign links working", async () => {
    expect(await go("/filings/f1/sign")).toBe("https://app.example.test/filings/f1/sign");
  });
  it("keeps the #ssn deep link working", async () => {
    expect(await go("/filings/f1#ssn")).toBe("https://app.example.test/filings/f1#ssn");
  });
  it("falls back to the dashboard for a protocol-relative //evil.com", async () => {
    expect(await go("//evil.com")).toBe("https://app.example.test/dashboard");
  });
  it("falls back to the dashboard for an absolute URL", async () => {
    expect(await go("https://evil.com/x")).toBe("https://app.example.test/dashboard");
  });
  it("falls back to the dashboard with no next", async () => {
    expect(await go(null)).toBe("https://app.example.test/dashboard");
  });
});

describe("magic-link language preference", () => {
  const login = (headers?: HeadersInit) => GET(new Request("https://app.example.test/auth/tok", { headers }), { params: { token: "tok" } });
  it.each([null, "de", "zh-Hant"])("leaves the stored locale %s and browser preference untouched when disabled", async locale => {
    languageSwitch.enabled = false;
    state.locale = locale;
    const headerCases: HeadersInit[] = [
      { "accept-language": "fr-FR,en;q=0.5" },
      { "accept-language": "en-US" },
      { cookie: "fs_user=old; NEXT_LOCALE=es" },
    ];
    for (const headers of headerCases) {
      const response = await login(headers);
      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe("https://app.example.test/dashboard");
      expect(response.cookies.get("fs_user")?.value).toBe("signed-token");
      expect(response.cookies.get("NEXT_LOCALE")).toBeUndefined();
      expect(state.update).not.toHaveBeenCalled();
      expect(state.filing).not.toHaveBeenCalled();
      expect(state.locale).toBe(locale);
    }
  });
  it("restores a stored language when the browser cookie is absent", async () => {
    state.locale = "zh-TW";
    const response = await login();
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("zh-Hant");
    expect(state.filing).not.toHaveBeenCalled();
  });
  it("preserves an existing browser language cookie", async () => {
    state.locale = "de";
    const response = await login({ cookie: "fs_user=old; NEXT_LOCALE=es" });
    expect(response.cookies.get("NEXT_LOCALE")).toBeUndefined();
  });
  it("prefers a non-English browser language for an unset account", async () => {
    state.locale = null;
    const response = await login({ "accept-language": "fr-FR,en;q=0.5" });
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("fr");
    expect(state.filing).not.toHaveBeenCalled();
    expect(state.update).toHaveBeenCalledWith({ where: { id: "user_1" }, data: { locale: "fr" } });
  });
  it("uses the owner country when the browser resolves to English", async () => {
    state.locale = null;
    const response = await login({ "accept-language": "en-US" });
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("zh-Hans");
  });
  it("preserves an explicit English cookie for an unset account", async () => {
    state.locale = null;
    const response = await login({ cookie: "NEXT_LOCALE=en" });
    expect(response.cookies.get("NEXT_LOCALE")).toBeUndefined();
    expect(state.filing).not.toHaveBeenCalled();
    expect(state.update).toHaveBeenCalledWith({ where: { id: "user_1" }, data: { locale: "en" } });
  });
  it("still logs in and sets the language cookie if persistence fails", async () => {
    state.locale = null;
    state.update.mockRejectedValueOnce(new Error("database unavailable"));
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const response = await login({ "accept-language": "es" });
    expect(response.status).toBe(303);
    expect(response.cookies.get("fs_user")?.value).toBe("signed-token");
    expect(response.cookies.get("NEXT_LOCALE")?.value).toBe("es");
    warning.mockRestore();
  });
});
