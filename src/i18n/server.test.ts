import { afterEach, describe, expect, it, vi } from "vitest";
import { createTranslator } from "next-intl";
import { getEmailTranslator } from "./server";

vi.mock("next-intl", async (original) => {
  const actual = await original<typeof import("next-intl")>();
  return { ...actual, createTranslator: vi.fn(actual.createTranslator) };
});
afterEach(() => { vi.mocked(createTranslator).mockReset(); vi.restoreAllMocks(); });

describe("email translator fallback", () => {
  it("returns English if translator initialization throws", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(createTranslator).mockImplementationOnce(() => { throw new Error("broken catalog"); });
    expect(getEmailTranslator("de")("magicLink.subject", { v0: "O''Brien LLC" })).toBe("Your O''Brien LLC filing — access link");
  });
  it("returns English when next-intl reports an error without throwing", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(createTranslator).mockImplementationOnce(((config: { onError: (error: Error) => void }) => () => {
      config.onError(new Error("invalid ICU message"));
      return "email.magicLink.heading";
    }) as never);
    expect(getEmailTranslator("de")("magicLink.heading")).toBe("Open your filing");
  });
});
