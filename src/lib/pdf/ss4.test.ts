import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { defaultSs4Options, type Ss4Source } from "./ss4Options";
import { generateSs4Pdf, ss4FieldValues } from "./ss4";
import { ss4FitWarnings } from "./ss4Fit";

const source: Ss4Source = {
  fullName: "Alex Rivera",
  phone: "+1 307 555 0100",
  llcName: "Blue Harbor Trading LLC",
  llcState: "Wyoming",
  llcFormedDate: "2026-03-14",
  businessMailingAddress: "30 N Gould St, Ste R\nSheridan, WY 82801",
  businessType: "Online retail",
  businessPurpose: "Sell household goods online",
  principalProducts: "Online retail of household goods",
  ownerName: "Maria Alvarez",
  ownerResidence: "Spain",
  ownerCitizenship: "Spain",
};

const baseOptions = {
  ...defaultSs4Options(source),
  responsiblePartyTin: "000-00-0000",
};

describe("ss4FieldValues", () => {
  it("maps known text fields to exact AcroForm field names", () => {
    const values = ss4FieldValues({ llcName: source.llcName, options: baseOptions });
    expect(values.text["topmostSubform[0].Page1[0].f1_10[0]"]).toBe("Maria Alvarez");
    expect(values.text["topmostSubform[0].Page1[0].f1_38[0]"]).toBe("Online retail of household goods");
    expect(values.text["topmostSubform[0].Page1[0].Line4ReadOrder[0].f1_5[0]"]).toBe("30 N Gould St, Ste R");
    expect(values.text["topmostSubform[0].Page1[0].Line4ReadOrder[0].f1_6[0]"]).toBe("Sheridan, WY 82801");
  });

  it("routes started-new-business specify text to the continuation field when needed", () => {
    const longValues = ss4FieldValues({
      llcName: source.llcName,
      options: { ...baseOptions, reason: "started_new_business", reasonSpecify: "x".repeat(50) },
    });
    expect(longValues.text["topmostSubform[0].Page1[0].f1_25[0]"]).toBe("");
    expect(longValues.text["topmostSubform[0].Page1[0].f1_26[0]"]).toBe("x".repeat(50));

    const shortValues = ss4FieldValues({
      llcName: source.llcName,
      options: { ...baseOptions, reason: "started_new_business", reasonSpecify: "RetailCo" },
    });
    expect(shortValues.text["topmostSubform[0].Page1[0].f1_25[0]"]).toBe("RetailCo");
    expect(shortValues.text["topmostSubform[0].Page1[0].f1_26[0]"]).toBe("");
  });

  it("checks at most one box in each exclusive group", () => {
    const scenarios = [
      baseOptions,
      { ...baseOptions, isLlc: false },
      { ...baseOptions, organizedInUs: false },
      { ...baseOptions, entityType: "partnership" as const },
      { ...baseOptions, entityType: "corporation" as const, entityOtherText: "1120" },
      { ...baseOptions, reason: "banking_purpose" as const },
      { ...baseOptions, reason: "hired_employees" as const },
      { ...baseOptions, reason: "compliance_withholding" as const },
      { ...baseOptions, reason: "other" as const, reasonSpecify: "Compliance review" },
      { ...baseOptions, activity: "retail" as const },
      { ...baseOptions, activity: "finance_insurance" as const },
      { ...baseOptions, priorEin: true, priorEinNumber: "12-3456789" },
    ];
    for (const options of scenarios) {
      const checked = ss4FieldValues({ llcName: source.llcName, options }).check;
      expect(countMatches(checked, /^topmostSubform\[0\]\.Page1\[0\]\.c1_1\[/)).toBeLessThanOrEqual(1);
      expect(countMatches(checked, /^topmostSubform\[0\]\.Page1\[0\]\.c1_2\[/)).toBeLessThanOrEqual(1);
      expect(countMatches(checked, /^topmostSubform\[0\]\.Page1\[0\]\.c1_3\[/)).toBeLessThanOrEqual(1);
      expect(countMatches(checked, /^topmostSubform\[0\]\.Page1\[0\]\.c1_4\[/)).toBeLessThanOrEqual(1);
      expect(countMatches(checked, /^topmostSubform\[0\]\.Page1\[0\]\.c1_6\[/)).toBeLessThanOrEqual(1);
      expect(countMatches(checked, /^topmostSubform\[0\]\.Page1\[0\]\.c1_7\[/)).toBeLessThanOrEqual(1);
    }
  });
});

describe("generateSs4Pdf", () => {
  it("returns a readable 2-page PDF", async () => {
    const bytes = await generateSs4Pdf({ llcName: source.llcName, options: baseOptions });
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(2);
  });

  it("does not throw on text the form font cannot encode", async () => {
    const options = {
      ...defaultSs4Options({ ...source, ownerName: "Nguyễn Văn A" }),
      responsiblePartyTin: "000-00-0000",
    };
    const bytes = await generateSs4Pdf({ llcName: "Łódź Trading 李明 LLC", options });
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(2);
  });
});

describe("ss4FitWarnings", () => {
  it("warns when a long LLC name may not fit line 1", () => {
    expect(ss4FitWarnings({ llcName: "x".repeat(120), options: baseOptions })).toContain(
      "Line 1 may be cut off on the form (about 116 characters fit). Shorten it.",
    );
  });
});

function countMatches(values: string[], pattern: RegExp): number {
  return values.filter((value) => pattern.test(value)).length;
}
