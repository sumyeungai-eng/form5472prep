import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { AUTHORED_DOC_SIGNATURE_HEADING, COVER_LETTER_ENCLOSURE_PHRASE, GENERATOR_VERSION } from "@/config/filingPackage";
import { form5472FieldMap, form1120_2025FieldMap } from "./fieldMaps";
import { runPreflight } from "./preflight";
import type { PackageRecord } from "./generatePackage";

const IRS_MAIL_ADDRESS_DISPLAY_LINES = [
  "Internal Revenue Service",
  "1973 Rulon White Blvd, M/S 6112",
  "Attn: PIN Unit",
  "Ogden, UT 84201",
] as const;

const goodRecord: PackageRecord = {
  generatorVersion: GENERATOR_VERSION,
  commit: "local",
  generatedAt: "2026-09-22T12:00:00.000Z",
  finalisedAt: "2026-09-22T12:00:00.000Z",
  llcName: "Example Holdings LLC",
  ownerName: "Example Owner",
  ownerReferenceId: "EXAMPLEOWNER1",
  llcEin: "12-3456789",
  llcPrintAddress: {
    value: "123 Market Street Suite 400",
    fontSize: 10,
    abbreviated: false,
    checkedFieldWidths: [],
    failures: [],
  },
  ownerPrintAddress: {
    value: "88 Queen Road Central, Suite 1200, Central, Hong Kong",
    fontSize: 10,
    abbreviated: false,
    checkedFieldWidths: [],
    failures: [],
  },
  formationDate: "2026-01-15T00:00:00.000Z",
  dissolutionDate: null,
  taxYears: [
    {
      taxYear: 2026,
      form1120Revision: "2025",
      revisionUsed: "2025",
      shortYearException: true,
      periodStart: "01/15",
      periodEnd: "12/31",
      status: "timely",
      isInitialYear: true,
      isFinalYear: false,
      line1oSource: "llc_field",
      line1f: 279,
      line1g: 1,
      line1h: 279,
      partVTotalRounded: 279,
      partVRows: [
        { date: "2026-01-20", description: "Contribution", amountCents: 10_000, category: "contribution" },
        { date: "2026-02-20", description: "Distribution", amountCents: -17_850, category: "distribution" },
      ],
      form1120: {
        fields: [
          { form: "1120-2026", field: form1120_2025FieldMap.taxYearBeginning, value: "01/15/2026" },
          { form: "1120-2026", field: form1120_2025FieldMap.taxYearEnding, value: "12/31" },
          { form: "1120-2026", field: form1120_2025FieldMap.taxYearEndingYear2, value: "26" },
          { form: "1120-2026", field: form1120_2025FieldMap["1a_name"], value: "Example Holdings LLC" },
          { form: "1120-2026", field: form1120_2025FieldMap["1_street"], value: "123 Market Street Suite 400" },
          { form: "1120-2026", field: form1120_2025FieldMap.B_ein, value: "12-3456789" },
          { form: "1120-2026", field: form1120_2025FieldMap.D_totalAssets, value: "1000" },
          { form: "1120-2026", field: form1120_2025FieldMap.E_initialReturn, value: true },
        ],
        stampedTexts: ["FOREIGN-OWNED U.S. DE"],
      },
      form5472: {
        fields: [
          { form: "5472-2026", field: form5472FieldMap.taxYearBeginMonthDay, value: "01/15" },
          { form: "5472-2026", field: form5472FieldMap.taxYearBeginYear, value: "2026" },
          { form: "5472-2026", field: form5472FieldMap.taxYearEndMonthDay, value: "12/31" },
          { form: "5472-2026", field: form5472FieldMap.taxYearEndYear, value: "2026" },
          { form: "5472-2026", field: form5472FieldMap["1a_name"], value: "Example Holdings LLC" },
          { form: "5472-2026", field: form5472FieldMap["1_street"], value: "123 Market Street Suite 400" },
          { form: "5472-2026", field: form5472FieldMap["1b_ein"], value: "12-3456789" },
          { form: "5472-2026", field: form5472FieldMap["1c_totalAssets"], value: "1000" },
          { form: "5472-2026", field: form5472FieldMap["1d_businessActivity"], value: "Computer systems design services" },
          { form: "5472-2026", field: form5472FieldMap["1e_businessCode"], value: "541512" },
          { form: "5472-2026", field: form5472FieldMap.box2_foreign50pct, value: true },
          { form: "5472-2026", field: form5472FieldMap.box3_foreignOwnedUsDE, value: true },
          { form: "5472-2026", field: form5472FieldMap["4b2_referenceId"], value: "EXAMPLEOWNER1" },
          { form: "5472-2026", field: form5472FieldMap["4b3_ftin"], value: "FTIN12345" },
          { form: "5472-2026", field: form5472FieldMap["8b2_referenceId"], value: "EXAMPLEOWNER1" },
          { form: "5472-2026", field: form5472FieldMap["8b3_ftin"], value: "FTIN12345" },
          { form: "5472-2026", field: form5472FieldMap["8d_businessCode"], value: "541512" },
        ],
      },
      reasonableCauseIncluded: false,
    },
  ],
  authoredDocuments: [
    {
      kind: "coverLetter",
      lines: [
        ...IRS_MAIL_ADDRESS_DISPLAY_LINES,
        "Date: 9/22/2026",
        `Re: ${COVER_LETTER_ENCLOSURE_PHRASE} for Example Holdings LLC`,
        `Enclosed please find ${COVER_LETTER_ENCLOSURE_PHRASE} for Example Holdings LLC.`,
        AUTHORED_DOC_SIGNATURE_HEADING,
      ],
    },
    {
      kind: "partVStatement",
      taxYear: 2026,
      lines: ["SUPPORTING STATEMENT TO FORM 5472", "Tax Year 2026", "Reporting Corporation: Example Holdings LLC, EIN 12-3456789"],
      pages: [["SUPPORTING STATEMENT TO FORM 5472", "Tax Year 2026", "Reporting Corporation: Example Holdings LLC, EIN 12-3456789"]],
    },
  ],
  pageOrder: [{ label: "Cover letter", startPage: 1, endPage: 1 }],
};

describe("runPreflight", () => {
  for (const [id, mutate] of [
    ["A01", (r: PackageRecord) => { r.taxYears[0].form5472.fields = r.taxYears[0].form5472.fields.filter((w) => w.field !== form5472FieldMap.box2_foreign50pct); }],
    ["A02", (r: PackageRecord) => { r.taxYears[0].form5472.fields = r.taxYears[0].form5472.fields.filter((w) => w.field !== form5472FieldMap.box3_foreignOwnedUsDE); }],
    ["A03", (r: PackageRecord) => { r.taxYears[0].form5472.fields.push({ form: "5472-2026", field: form5472FieldMap.q43a_coveredDebt_no, value: true }); }],
    ["A05", (r: PackageRecord) => { r.taxYears[0].form5472.fields.find((w) => w.field === form5472FieldMap["1e_businessCode"])!.value = "541611"; }],
    ["A06", (r: PackageRecord) => { r.taxYears[0].form1120.fields[0].value = "01/01/2026"; }],
    ["A07", (r: PackageRecord) => { r.taxYears[0].periodStart = "01/01"; }],
    ["A08", (r: PackageRecord) => { r.taxYears[0].shortYearException = false; }],
    ["A09", (r: PackageRecord) => { r.taxYears[0].form1120.stampedTexts = []; }],
    ["A10", (r: PackageRecord) => { r.taxYears[0].form1120.fields = r.taxYears[0].form1120.fields.filter((w) => w.field !== form1120_2025FieldMap.E_initialReturn); }],
    ["A12", (r: PackageRecord) => { r.taxYears[0].line1f = 1; }],
    ["A16", (r: PackageRecord) => { r.taxYears[0].line1oSource = "owner_field" as "llc_field"; }],
    ["A18", (r: PackageRecord) => { r.taxYears[0].form5472.fields = r.taxYears[0].form5472.fields.filter((w) => w.field !== form5472FieldMap["4b3_ftin"]); }],
    ["A19", (r: PackageRecord) => { r.taxYears[0].form5472.fields.find((w) => w.field === form5472FieldMap["4b2_referenceId"])!.value = "BAD-ID"; }],
    ["A20", (r: PackageRecord) => { r.taxYears[0].form5472.fields.find((w) => w.field === form5472FieldMap["1_street"])!.value = "Different address"; }],
    ["A21", (r: PackageRecord) => { r.taxYears[0].form1120.fields.find((w) => w.field === form1120_2025FieldMap.D_totalAssets)!.value = "999"; }],
    ["A22", (r: PackageRecord) => { r.authoredDocuments[0].lines.push("These are timely filed."); }],
    ["A23", (r: PackageRecord) => { r.authoredDocuments[0].lines[0] = "Wrong address"; }],
    ["A24", (r: PackageRecord) => { r.taxYears[0].status = "late"; }],
    ["A25", (r: PackageRecord) => { r.authoredDocuments[0].lines = r.authoredDocuments[0].lines.filter((line) => line !== AUTHORED_DOC_SIGNATURE_HEADING); }],
    ["A27", (r: PackageRecord) => { r.authoredDocuments.find((d) => d.kind === "partVStatement")!.pages = [["Tax Year 2026"]]; }],
    ["R02", (r: PackageRecord) => { r.llcPrintAddress.failures = ["field cannot fit address"]; }],
    ["A30", (r: PackageRecord) => { r.generatorVersion = "0.0.0"; }],
  ] as const) {
    it(`${id} fails on a broken record and passes on a good record`, async () => {
      const pdf = await goodPdfBytes(goodRecord);
      const good = await runPreflight(clone(goodRecord), pdf);
      expect(good.failures.filter((f) => f.id === id)).toEqual([]);

      const badRecord = clone(goodRecord);
      mutate(badRecord);
      const bad = await runPreflight(badRecord, id === "A30" ? await goodPdfBytes(goodRecord) : pdf);
      expect(bad.failures.some((f) => f.id === id)).toBe(true);
    });
  }

  it("A16 emits W16, not a failure, when line 1o defaults to United States", async () => {
    const record = clone(goodRecord);
    record.taxYears[0].line1oSource = "default_us";
    const result = await runPreflight(record, await goodPdfBytes(record));
    expect(result.failures.some((f) => f.id === "A16")).toBe(false);
    expect(result.warnings.some((w) => w.id === "W16")).toBe(true);
  });

  it("A28 fails when fields and widgets remain in the final PDF", async () => {
    const result = await runPreflight(clone(goodRecord), await pdfWithFieldBytes(goodRecord));
    expect(result.failures.some((f) => f.id === "A28")).toBe(true);
  });

  it("A05 passes when 1d is filled and lines 1e and 8d carry a tax-year-valid code", async () => {
    const result = await runPreflight(clone(goodRecord), await goodPdfBytes(goodRecord));

    expect(result.failures.filter((f) => f.id === "A05")).toEqual([]);
  });

  it("A05 fails when Form 5472 line 1e and 8d use an off-list code for the tax year", async () => {
    const record = clone(goodRecord);
    record.taxYears[0].taxYear = 2025;
    record.taxYears[0].form5472.fields.find((w) => w.field === form5472FieldMap["1e_businessCode"])!.value = "541611";
    record.taxYears[0].form5472.fields.find((w) => w.field === form5472FieldMap["8d_businessCode"])!.value = "541611";

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.some((f) => f.id === "A05" && f.message.includes("541611"))).toBe(true);
  });

  it("A07 ignores a stale dissolution date when the record is not final", async () => {
    const record = clone(goodRecord);
    record.dissolutionDate = null;
    record.taxYears[0].isFinalYear = false;
    record.taxYears[0].periodEnd = "12/31";

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.some((f) => f.id === "A07")).toBe(false);
  });

  it("A22 ignores timeliness words that appear only inside LLC and owner names", async () => {
    const record = clone(goodRecord);
    record.llcName = "Late Night Media LLC";
    record.ownerName = "Timely Ng";
    record.authoredDocuments[0].lines = [
      ...IRS_MAIL_ADDRESS_DISPLAY_LINES,
      "Date: 9/22/2026",
      `Re: ${COVER_LETTER_ENCLOSURE_PHRASE} for Late Night Media LLC`,
      `Enclosed please find ${COVER_LETTER_ENCLOSURE_PHRASE} for Late Night Media LLC.`,
      "Timely Ng",
      AUTHORED_DOC_SIGNATURE_HEADING,
    ];

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.some((f) => f.id === "A22")).toBe(false);
  });

  it("A22 still fails for genuine timeliness language outside names", async () => {
    const record = clone(goodRecord);
    record.llcName = "Late Night Media LLC";
    record.ownerName = "Timely Ng";
    record.authoredDocuments[0].lines.push("This return is filed late.");

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.some((f) => f.id === "A22")).toBe(true);
  });
});

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function goodPdfBytes(record: PackageRecord): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.addPage([612, 792]);
  pdf.setTitle("Form 5472 package");
  pdf.setProducer(`form5472prep generator ${GENERATOR_VERSION}`);
  pdf.setKeywords([
    `version=${record.generatorVersion}`,
    `commit=${record.commit}`,
    `generatedAt=${record.generatedAt}`,
  ]);
  return pdf.save();
}

async function pdfWithFieldBytes(record: PackageRecord): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const form = pdf.getForm();
  const field = form.createTextField("leftover");
  field.addToPage(page, { x: 50, y: 700, width: 100, height: 20 });
  pdf.setTitle("Form 5472 package");
  pdf.setProducer(`form5472prep generator ${GENERATOR_VERSION}`);
  pdf.setKeywords([
    `version=${record.generatorVersion}`,
    `commit=${record.commit}`,
    `generatedAt=${record.generatedAt}`,
  ]);
  return pdf.save();
}
