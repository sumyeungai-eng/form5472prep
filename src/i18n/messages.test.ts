import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTranslator } from "next-intl";
import { LOCALES } from "./locales";

type Messages = { [key: string]: string | Messages };
const root = join(process.cwd(), "messages");
const files = readdirSync(join(root, "en")).filter((file) => file.endsWith(".json")).sort();
function flatten(messages: Messages, prefix = ""): Record<string, string> {
  return Object.fromEntries(Object.entries(messages).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [[path, value]] : Object.entries(flatten(value, path));
  }));
}
const read = (locale: string, file: string): Messages => JSON.parse(readFileSync(join(root, locale, file), "utf8"));

describe("translation catalog contract", () => {
  it("checks the server-only email namespace alongside portal catalogs", () => {
    expect(files).toContain("email.json");
  });
  for (const locale of LOCALES) {
    it(`${locale} has exactly the English namespaces and keys, with plain text messages`, () => {
      expect(readdirSync(join(root, locale)).filter((file) => file.endsWith(".json")).sort()).toEqual(files);
      for (const file of files) {
        const english = flatten(read("en", file));
        const translated = flatten(read(locale, file));
        expect(Object.keys(translated).sort(), `${locale}/${file}`).toEqual(Object.keys(english).sort());
        for (const [key, value] of Object.entries(translated)) {
          expect(value, `${locale}/${file}:${key}`).not.toMatch(/<\/?[a-z][^>]*>/i);
          // Unique names: an ICU select legitimately repeats a placeholder across branches.
          const placeholders = (text: string) => Array.from(new Set(Array.from(text.matchAll(/\{(\w+)(?:\}|,)/g)).map((m) => m[1]))).sort();
          expect(placeholders(value), `${locale}/${file}:${key} placeholders`).toEqual(placeholders(english[key]));
        }
      }
    });
    it(`${locale} has valid ICU messages and preserved form names`, () => {
      for (const file of files) {
        const messages = read(locale, file);
        const errors: unknown[] = [];
        const t = createTranslator({ locale, messages, onError: (error: unknown) => errors.push(error) });
        for (const [key, value] of Object.entries(flatten(messages))) {
          const args = Object.fromEntries(Array.from(value.matchAll(/\{(\w+)(?:\}|,)/g)).map((m) => [m[1], m[1] === "count" ? 2 : "example"]));
          t(key, args);
          const english = flatten(read("en", file))[key];
          for (const name of ["Form 5472", "Form 1120", "pro forma", "EIN", "ITIN", "IRS", "PTIN", "Form 7004", "LLC", "Part V", "Form5472 Prep"]) {
            if (english.includes(name)) expect(value, `${locale}/${file}:${key}`).toContain(name);
          }
        }
        expect(errors, `${locale}/${file} ICU errors`).toEqual([]);
      }
    });
  }
});

const state = vi.hoisted(() => ({
  cookie: undefined as { value: string } | undefined,
  language: null as string | null,
  user: null as { id: string } | null,
  set: vi.fn(),
  update: vi.fn(),
}));
vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => state.cookie, set: state.set }),
  headers: () => ({ get: () => state.language }),
}));
vi.mock("next-intl/server", () => ({ getRequestConfig: (callback: unknown) => callback }));
vi.mock("@/lib/session", () => ({ getCurrentUser: async () => state.user }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { update: state.update } } }));
import requestConfig, { deepMerge } from "./request";
import { setLocale } from "./actions";

beforeEach(() => {
  state.cookie = undefined;
  state.language = null;
  state.user = null;
  state.set.mockReset();
  state.update.mockReset();
});

// The identity mock exposes the request callback without requiring a Next server.
const config = () => requestConfig({ locale: "en", requestLocale: Promise.resolve(undefined) });
describe("request messages and cookie preferences", () => {
  it("deep-merges missing nested strings from English", () => {
    expect(deepMerge({ title: "Title", nested: { a: "A", b: "B" } }, { nested: { a: "甲" } }))
      .toEqual({ title: "Title", nested: { a: "甲", b: "B" } });
  });
  it("selects the cookie before Accept-Language, without database access", async () => {
    state.cookie = { value: "zh-TW" };
    state.language = "de";
    const result = await config();
    expect(result.locale).toBe("zh-Hant");
    expect(result.messages).toHaveProperty("portal.dashboard.yourFilings", "您的申報");
    expect(result.messages).not.toHaveProperty("email");
    expect(state.update).not.toHaveBeenCalled();
  });
  it("uses weighted browser language and falls back to English", async () => {
    state.language = "de;q=0.3,fr;q=0.9";
    expect((await config()).locale).toBe("fr");
    state.language = "ja";
    expect((await config()).locale).toBe("en");
  });
  it("returns an English string or key if message formatting fails", async () => {
    const result = await config();
    expect(result.getMessageFallback?.({ namespace: "common", key: "download", error: {} as never })).toBe("Download");
    expect(result.getMessageFallback?.({ namespace: "common", key: "nonexistent", error: {} as never })).toBe("nonexistent");
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => result.onError?.({} as never)).not.toThrow();
    expect(warning).toHaveBeenCalledOnce();
    warning.mockRestore();
  });
});

describe("language action", () => {
  it("sets a normalized host-only cookie for a year, including anonymous users", async () => {
    await setLocale("zh-HK");
    expect(state.set).toHaveBeenCalledWith("NEXT_LOCALE", "zh-Hant", { path: "/", maxAge: 31536000, sameSite: "lax" });
    expect(state.update).not.toHaveBeenCalled();
  });
  it("stores the authenticated user's preference", async () => {
    state.user = { id: "user-1" };
    await setLocale("de-AT");
    expect(state.update).toHaveBeenCalledWith({ where: { id: "user-1" }, data: { locale: "de" } });
  });
  it("keeps the cookie if account persistence fails", async () => {
    state.user = { id: "user-1" };
    state.update.mockRejectedValueOnce(new Error("database unavailable"));
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(setLocale("invalid")).resolves.toBeUndefined();
    expect(state.set).toHaveBeenCalledWith("NEXT_LOCALE", "en", expect.anything());
    warning.mockRestore();
  });
});
