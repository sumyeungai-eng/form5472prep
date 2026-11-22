import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { createWizardText } from "./text";
import { WizardStaticProvider } from "./WizardStaticProvider";
import { WizardCopy } from "./WizardCopy";
import german from "../../../messages/de/wizard.json";
import type { Messages } from "@/i18n/merge";
import { pbaCodesFor } from "@/lib/irsCodes";
import { LOCALES } from "@/i18n/locales";

describe("wizard display copy never blocks the form", () => {
  it("uses English without a provider and on the static first paint", () => {
    expect(renderToStaticMarkup(<WizardCopy text="Continue" />)).toBe("Continue");
    expect(renderToStaticMarkup(<WizardStaticProvider><WizardCopy text="Continue" /></WizardStaticProvider>)).toBe("Continue");
  });
  it("uses the existing intl context", () => {
    expect(renderToStaticMarkup(<NextIntlClientProvider locale="de" messages={{ wizard: german }}><WizardCopy text="Continue" /></NextIntlClientProvider>)).toBe("Weiter");
  });
  it("falls back for missing, malformed and wrongly typed translations and a bad locale", () => {
    const broken = { entity: { continue: "{broken", lLCLegalName: 7 } } as unknown as Messages;
    const w = createWizardText(broken, "this is not a locale");
    expect(w("Continue")).toBe("Continue");
    expect(w("LLC legal name")).toBe("LLC legal name");
    expect(w("Pay {v0} securely", { v0: "$149" })).toBe("Pay $149 securely");
    expect(w("Future English copy")).toBe("Future English copy");
    expect(createWizardText({ entity: { continue: " " } }, "de")("Continue")).toBe("Continue");
  });
  it("formats translated amounts without translating supplied values", () => {
    const w = createWizardText(german, "de");
    expect(w("Pay {v0} securely", { v0: "$149" })).toBe("$149 sicher bezahlen");
    expect(w("Upload failed for {v0}: {v1}", { v0: "Owner", v1: "My unchanged input" })).toContain("Owner");
    expect(w("Upload failed for {v0}: {v1}", { v0: "Owner", v1: "My unchanged input" })).toContain("My unchanged input");
  });
  it("displays a localized determination while retaining the English source", () => {
    const source = "Your filing deadline is April 15, 2026 — this return is on time.";
    expect(createWizardText(german, "de")(source)).toBe("Ihre Frist ist der April 15, 2026; diese Erklärung ist fristgerecht.");
    expect(source).toBe("Your filing deadline is April 15, 2026 — this return is on time.");
  });
  it("translates all official activity-code labels without changing their source values", async () => {
    for (const locale of LOCALES.filter((locale) => locale !== "en")) {
      const messages = (await import(`../../../messages/${locale}/wizard.json`)).default;
      const w = createWizardText(messages, locale);
      for (const year of [2023, 2024, 2025] as const) {
        for (const entry of pbaCodesFor(year)) {
          const original = { ...entry };
          expect(w(entry.description), `${locale}/${year}/${entry.code}`).toBe(messages.entity[`irs${entry.code}`]);
          expect(entry).toEqual(original);
        }
      }
    }
  });
});
