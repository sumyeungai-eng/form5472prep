import { describe, it, expect } from "vitest";
import { getEmailTranslator } from "@/i18n/server";
describe("de greeting", () => {
  it("no name", () => { const t = getEmailTranslator("de"); expect(t("shared.greeting", { name: t("magicLink.salutation") })).toBe("Guten Tag,"); });
  it("named", () => { expect(getEmailTranslator("de")("shared.greeting", { name: "Anna Müller" })).toBe("Guten Tag Anna Müller,"); });
});
