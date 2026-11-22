import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NextIntlClientProvider } from "next-intl";
import { ReviewStep, type ReviewStepFiling } from "./review/ReviewStep";
import { ReasonableCauseStep } from "./ReasonableCauseStep";
import { LOCALES } from "@/i18n/locales";

const badDraft: ReviewStepFiling = {
  id: "draft", email: "owner@example.com", llcName: "Owner", llcEin: "bad EIN",
  llcAddress: "", llcCity: "", llcState: "bad state", llcZip: "?",
  ownerName: "Continue", ownerFtin: "bad FTIN", taxYears: [], isDiirsp: false,
  extensionFiled: null, reasonableCauseNarrative: null, tier: "standard", funnelSource: null,
};
const review = <ReviewStep filing={badDraft} onBack={() => {}} onPay={async () => {}} onSelectTier={async () => {}} saving={false} />;
function formStructure(html: string) {
  return html.match(/<[^>]+>/g)?.map((tag) => tag.replace(/\s(?:aria-label|title|placeholder)="[^"]*"/g, "")).join("");
}

describe("wizard translations preserve the pay path and customer values", () => {
  for (const locale of LOCALES) {
    it(`${locale} keeps a bad-data review payable with identical form attributes`, async () => {
      const wizard = (await import(`../../../messages/${locale}/wizard.json`)).default;
      const english = renderToStaticMarkup(review);
      const translated = renderToStaticMarkup(<NextIntlClientProvider locale={locale} messages={{ wizard }}>{review}</NextIntlClientProvider>);
      expect(formStructure(translated)).toEqual(formStructure(english));
      const buttons = translated.match(/<button[^>]*>[\s\S]*?<\/button>/g) ?? [];
      const pay = buttons.find((button) => button.includes("$149"));
      expect(pay).toBeDefined();
      expect(pay).not.toMatch(/\sdisabled(?:=|\s|>)/);
      expect(translated).toContain(">Owner</p>");
      expect(translated).toContain(">Continue</dd>");
      expect(translated).toContain("bad EIN");
    });
  }
  it("keeps the pay button enabled if a translated pay label cannot format", () => {
    const html = renderToStaticMarkup(<NextIntlClientProvider locale="de" messages={{ wizard: { review: { paySecurely: "{broken" } } }}>{review}</NextIntlClientProvider>);
    const pay = html.match(/<button[^>]*>[\s\S]*?<\/button>/g)?.find((button) => button.includes("Pay $149.00 securely"));
    expect(pay).toBeDefined();
    expect(pay).not.toMatch(/\sdisabled(?:=|\s|>)/);
  });
  it("never translates a customer's own reasonable-cause explanation", async () => {
    const wizard = (await import("../../../messages/fr/wizard.json")).default;
    const raw = "Continue\nOwner";
    const html = renderToStaticMarkup(<NextIntlClientProvider locale="fr" messages={{ wizard }}><ReasonableCauseStep years={[{ taxYear: 2024, rcsWhyMissed: raw, rcsWhyMissedRaw: raw, rcsWhenLearned: "", rcsNoIrsNoticeConfirmed: true }]} onSubmit={async () => {}} onBack={() => {}} saving={false} /></NextIntlClientProvider>);
    expect(html).toContain(`>${raw}</textarea>`);
  });
});
