import { runPreflight } from "./pdf/preflight";
import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { isPdfEncodable, PDF_TEXT_MESSAGE, toPdfSafe } from "./pdfText";
import {
  entitySchema, ownerBaseSchema, reasonableCauseNarrativeSchema,
  reportableTransactionSchema, statementTextSchema, makeYearDataSchema, nonCashTransferSchema, makeOwnerPaidCostsSchema,
} from "./schemas";
import { filingCompletionIssues, type CompletionInput } from "./completeness";
import { setText, stampForeignOwnedDeHeader, stampShortPeriod } from "./pdf/fillForm";
import { generateFaxReceiptPdf } from "./pdf/faxReceipt";
import { parsePlacements, stampPlacements } from "./pdf/stampPlacements";
import { validateReasonableCauseYears } from "@/components/wizard/ReasonableCauseStep";
import { F1, F3, finalisedAt } from "./pdf/__fixtures__/filings";
import { generatePackage } from "./pdf/generatePackage";

const unsupportedNames = ["王小明", "Łukasz", "Şahin", "Nguyễn", "Иван"];
const mixedAddress = "12 Łódź / Şahin / Đặng, İstanbul — 王小明 🏠";
const samples = [...unsupportedNames, "José Müller", mixedAddress, "\u0000\ud800😀"];
const owner = {
  ownerName: "Jose Muller", ownerAddress: "123 Main Street",
  ownerCountryCitizenship: "Germany", ownerCountryTaxResidence: "Germany",
  ownerCountryBusiness: "Germany", ownerFtin: "DE12345",
  ownerItin: "", ownerReferenceId: "JOSE123",
};
const entity = {
  llcCountryBusiness: "USA", llcName: "Example LLC", llcEin: "12-3456789", llcAddress: "123 Main Street",
  llcCity: "Cheyenne", llcState: "WY", llcZip: "82001",
  llcDateIncorporated: "2023-01-01", llcBusinessActivity: "Software",
  llcBusinessCode: "541512",
};
const filing: CompletionInput = {
  ...entity, ...owner, taxYears: [2023],
  isFinalReturn: false, dissolvedAt: null, isDiirsp: true,
  reasonableCauseNarrative: "I did not know about the filing requirement.",
  extensionFiled: "no", extensionTransmittedAt: null,
};

function expectEnglishMessage(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  expect(result.success).toBe(false);
  expect(result.error?.issues.map((issue) => issue.message)).toContain(PDF_TEXT_MESSAGE);
}

describe("WinAnsi text safety", () => {
  it.each(unsupportedNames)("rejects unencodable name %s", (name) => {
    expect(isPdfEncodable(name)).toBe(false);
  });

  it("accepts accented WinAnsi names and its punctuation outside Latin-1", () => {
    expect(isPdfEncodable("José Müller")).toBe(true);
    expect(isPdfEncodable("€ Œ œ Š š Ž ž Ÿ ‘quotes’ — …")).toBe(true);
    expect(isPdfEncodable("")).toBe(true);
    expect(isPdfEncodable("\u0081")).toBe(false);
  });

  it("transliterates decomposed accents and nondecomposing Latin letters", () => {
    expect(toPdfSafe("Łukasz Şahin Nguyễn ı Đđ ğ ő ű"))
      .toBe("Lukasz Sahin Nguyen i Dd g o u");
    expect(toPdfSafe("王小明 Иван 😀")).toBe("??? ???? ?");
    expect(toPdfSafe("Jose\u0301 Mu\u0308ller")).toBe("Jose Muller");
  });

  it.each(samples)("produces encodable text and draws it with Helvetica: %s", async (sample) => {
    const safe = toPdfSafe(sample);
    expect(isPdfEncodable(safe)).toBe(true);
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    expect(() => pdf.addPage().drawText(safe, { font })).not.toThrow();
    await expect(pdf.save()).resolves.toBeInstanceOf(Uint8Array);
  });
});

describe("PDF-bound validation", () => {
  it("rejects 王小明 with the passport guidance and accepts Jose Muller", () => {
    expect(PDF_TEXT_MESSAGE).toBe("Use English letters only — as spelled in the Latin (English) letters on your passport or company documents.");
    expectEnglishMessage(ownerBaseSchema.safeParse({ ...owner, ownerName: "王小明" }));
    expect(ownerBaseSchema.safeParse(owner).success).toBe(true);
    expect(ownerBaseSchema.safeParse({ ...owner, ownerName: "José Müller" }).success).toBe(true);
  });

  it.each(["llcName", "llcAddress", "llcCity", "llcState", "llcBusinessActivity", "llcCountryBusiness"])(
    "validates entity field %s", (field) => {
      expectEnglishMessage(entitySchema.safeParse({ ...entity, [field]: "王明" }));
    },
  );
  it.each(["ownerName", "ownerAddress", "ownerCountryCitizenship", "ownerCountryTaxResidence", "ownerCountryBusiness", "ownerFtin"])(
    "validates owner field %s", (field) => {
      expectEnglishMessage(ownerBaseSchema.safeParse({ ...owner, [field]: "王小明" }));
    },
  );
  it.each(["date", "description", "counterparty", "category"])(
    "validates transaction field %s", (field) => {
      expectEnglishMessage(reportableTransactionSchema.safeParse({
        date: "2023-01-01", description: "Services", counterparty: "Jose",
        amountCents: 100, category: "contribution", [field]: "王小明",
      }));
    },
  );
  it("provides the same validation for narrative and statement text", () => {
    for (const schema of [reasonableCauseNarrativeSchema, statementTextSchema]) {
      expectEnglishMessage(schema.safeParse("I hired 王小明 for advice."));
      expect(schema.safeParse("I hired Jose Muller for advice.").success).toBe(true);
    }
  });
  it.each(["ownerName", "llcName", "llcAddress", "ownerAddress"])(
    "checkout completeness refuses payment for unencodable %s", (field) => {
      expect(filingCompletionIssues(filing, [2023])).toEqual([]);
      expect(filingCompletionIssues({ ...filing, [field]: "王小明" }, [2023])).toContain(field);
    },
  );
  it("preserves trimming, minimum lengths, and identifier rules", () => {
    expect(ownerBaseSchema.parse({ ...owner, ownerName: " Jose Muller " }).ownerName).toBe("Jose Muller");
    expect(ownerBaseSchema.safeParse({ ...owner, ownerName: "J" }).success).toBe(false);
    expect(ownerBaseSchema.safeParse({ ...owner, ownerReferenceId: "A-B" }).success).toBe(false);
    expectEnglishMessage(ownerBaseSchema.safeParse({ ...owner, ownerItin: "王小明" }));
    expect(entitySchema.parse({ ...entity, llcEin: "123456789" }).llcEin).toBe("12-3456789");
  });
});

describe("legacy PDF paths", () => {
  it("sanitizes form fields before appearance generation and saving", async () => {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage();
    const form = pdf.getForm();
    const field = form.createTextField("name");
    field.addToPage(page);
    setText(form, "name", `王小明\n${mixedAddress}`);
    expect(field.getText()).toBe(`???\n${toPdfSafe(mixedAddress)}`);
    expect(() => form.updateFieldAppearances()).not.toThrow();
    await expect(pdf.save()).resolves.toBeInstanceOf(Uint8Array);
  });
  it("sanitizes both free-text stamps", async () => {
    const pdf = await PDFDocument.create();
    pdf.addPage();
    await expect(stampForeignOwnedDeHeader(pdf, mixedAddress)).resolves.toBeUndefined();
    await expect(stampShortPeriod(pdf, "王小明", "Łukasz", "Nguyễn")).resolves.toBeUndefined();
  });
  it("renders a fax receipt including Unicode in measured paragraphs", async () => {
    const bytes = await generateFaxReceiptPdf({
      filingId: "test", llcName: mixedAddress, llcEin: "12-3456789",
      taxYears: [2023], ownerName: "王小明", telnyxFaxId: "test",
      fromFax: null, toFax: null, submittedAtIso: "2024-01-01T00:00:00Z",
      deliveredAtIso: "2024-01-01T00:00:00Z", pageCount: 5, brandLine: "Şahin",
    });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
  });
  it("renders a complete legacy package including narrative, notes, and transactions", async () => {
    const result = await generatePackage({
      ...entity, ...owner, llcCountry: "USA", llcDateIncorporated: new Date("2023-01-01"),
      llcName: "王小明 LLC", llcAddress: mixedAddress, ownerName: "Łukasz",
      ownerAddress: mixedAddress, ownerItin: "王小明", taxYears: [2023], isDiirsp: true,
      reasonableCauseNarrative: "I hired 王小明 and Łukasz for advice.",
      yearData: [{ taxYear: 2023, totalAssetsYearEnd: 1000, contributions: 100,
        distributions: 0, otherTransactionsNote: "Services from Şahin",
        reportableTransactions: [{ date: "Иван", description: mixedAddress,
          counterparty: "Đặng", amountCents: 10000, category: "contribution" }],
      }],
    });
    expect((await PDFDocument.load(result.bytes)).getPageCount()).toBe(result.totalPages);
    expect(result.totalPages).toBeGreaterThan(4);
  }, 15000);
});


describe("newer questionnaire and stamping paths", () => {
  it.each(["rcsWhyMissed", "rcsWhenLearned"])("rejects non-encodable per-year %s in the schema and wizard", (field) => {
    const row = { taxYear: 2023, totalAssetsYearEnd: 0, contributions: 0, distributions: 0,
      rcsWhyMissed: "I did not know", rcsWhenLearned: "September", rcsNoIrsNoticeConfirmed: true };
    expectEnglishMessage(makeYearDataSchema(false).safeParse({ ...row, [field]: "王小明" }));
    expect(validateReasonableCauseYears([{ ...row, [field]: "王小明" }])).toEqual({ [`2023.${field}`]: PDF_TEXT_MESSAGE });
    expect(validateReasonableCauseYears([row])).toEqual({});
  });
  it.each(["description", "valuationMethod"])("rejects non-cash transfer %s", (field) => {
    const row = { date: "2023-01-01", direction: "in", description: "Equipment", fairMarketValueCents: 100, valuationMethod: "Market price" };
    expectEnglishMessage(nonCashTransferSchema.safeParse({ ...row, [field]: "王小明" }));
    expect(nonCashTransferSchema.safeParse(row).success).toBe(true);
  });
  it("rejects unencodable owner-paid cost notes", () => {
    const row = { category: "other", date: "2023-01-01", amountCents: 100, note: "Jose Muller" };
    expectEnglishMessage(makeOwnerPaidCostsSchema(2023).safeParse([{ ...row, note: "王小明" }]));
    expect(makeOwnerPaidCostsSchema(2023).safeParse([row]).success).toBe(true);
  });
  it("rejects new unencodable stamps and safely renders legacy placements", async () => {
    const placement = { kind: "text" as const, page: 1, x: 20, y: 20, text: "Łukasz 王小明", fontSize: 10 };
    expect(parsePlacements({ placements: [placement] })).toEqual({ ok: false, error: PDF_TEXT_MESSAGE });
    const pdf = await PDFDocument.create(); pdf.addPage();
    const bytes = await stampPlacements(await pdf.save(), null, [placement]);
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
  });
  it("generates legacy per-year reasonable cause and Part VI text without WinAnsi errors", async () => {
    const result = await generatePackage({ ...F3, ownerName: "Łukasz", ownerAddressStreet: "Łódź Street",
      yearData: F3.yearData.map((year) => ({ ...year, rcsWhyMissed: "I hired 王小明", rcsWhenLearned: "Şahin told me",
        rcsNoIrsNoticeConfirmed: true, nonCashTransfers: [{ date: `${year.taxYear}-03-01`, direction: "in",
          description: "王小明 equipment", fairMarketValueCents: 100, valuationMethod: "Nguyễn appraisal", alsoInPartV: false }] })),
    }, finalisedAt);
    expect((await PDFDocument.load(result.bytes)).getPageCount()).toBe(result.totalPages);
    expect(result.record.authoredDocuments.some((doc) => doc.kind === "partVIStatement")).toBe(true);
  }, 15000);
});


it("keeps accented names and addresses consistent with PDF preflight records", async () => {
  const source = { ...F1, llcName: "José Müller LLC", ownerName: "Łukasz", llcAddress: "12 Łódź Street" };
  const result = await generatePackage(source, finalisedAt);
  expect(result.record.llcName).toBe("Jose Muller LLC");
  expect(result.record.llcPrintAddress.value).toBe("12 Lodz Street");
  expect((await runPreflight(result.record, result.bytes)).failures).toEqual([]);
  expect(source.llcName).toBe("José Müller LLC");
}, 15000);
