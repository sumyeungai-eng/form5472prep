import { describe, it, expect, vi } from "vitest";
import { getEmailTranslator } from "@/i18n/server";
describe("de greeting", () => {
  it("no name", () => { const t = getEmailTranslator("de"); expect(t("shared.greeting", { name: t("magicLink.salutation") })).toBe("Guten Tag,"); });
  it("named", () => { expect(getEmailTranslator("de")("shared.greeting", { name: "Anna Müller" })).toBe("Guten Tag Anna Müller,"); });
});

// Keep translated behavior covered while the production switch is disabled.
vi.mock("@/config/i18n-switch.mjs", async original => ({
  ...await original<typeof import("@/config/i18n-switch.mjs")>(), I18N_ENABLED: true,
}));
