import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { AUTHORED_DOC_SIGNATURE_HEADING, COVER_LETTER_CLOSING, COVER_LETTER_ENCLOSURE_PHRASE, GENERATOR_VERSION } from "@/config/filingPackage";
import { form5472FieldMap, form1120_2025FieldMap } from "./fieldMaps";
import { isValidBrazilianCpf, isValidCanadianSin, runPreflight } from "./preflight";
import { generatePackage, type PackageRecord, type RcsYearRecord } from "./generatePackage";
import { CUSTOMER_INTAKE_TEXT, F11, lateCatchUpFinalisedAt } from "./__fixtures__/filings";

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
      partVTotalCents: 27_850,
      partVRows: [
        { date: "2026-01-20", description: "Contribution", amountCents: 10_000, category: "contribution" },
        { date: "2026-02-20", description: "Distribution", amountCents: -17_850, category: "distribution" },
      ],
      nonCashTransfers: [],
      ownerPaidCosts: [],
      zeroConfirmations: {
        loansFromOwner: true,
        loansToOwner: true,
        ownerPaidCosts: true,
      },
      partVICentsAddedToLine1f: 0,
      line1jChecked: true,
      priorForm5472Filed: "no",
      ownerHasFtin: true,
      ownerAddressState: "Hong Kong",
      ownerAddressPostal: "999077",
      ownerNoPostalCode: false,
      signerTitleRect: { left: 326, right: 382, bottom: 90, top: 100 },
      signerTitleColumnBounds: { left: 324, right: 460.8, bottom: 90, top: 104, measuredField: "title" },
      signerDeclarationBounds: { left: 324, right: 460.8, bottom: 106, top: 148, measuredFrom: "title" },
      trades: true,
      hasUsSourceIncome: false,
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
          { form: "5472-2026", field: form5472FieldMap["1j_initialYear"], value: true },
          { form: "5472-2026", field: form5472FieldMap.box2_foreign50pct, value: true },
          { form: "5472-2026", field: form5472FieldMap.box3_foreignOwnedUsDE, value: true },
          { form: "5472-2026", field: form5472FieldMap["4b2_referenceId"], value: "EXAMPLEOWNER1" },
          { form: "5472-2026", field: form5472FieldMap["4b3_ftin"], value: "FTIN12345" },
          { form: "5472-2026", field: form5472FieldMap["8b2_referenceId"], value: "EXAMPLEOWNER1" },
          { form: "5472-2026", field: form5472FieldMap["8b3_ftin"], value: "FTIN12345" },
          { form: "5472-2026", field: form5472FieldMap["8d_businessCode"], value: "541512" },
          { form: "5472-2026", field: form5472FieldMap.partV_attachedStatementBox, value: true },
          { form: "5472-2026", field: form5472FieldMap.q37_imports_no, value: true },
          { form: "5472-2026", field: form5472FieldMap.q39_csa_no, value: true },
          { form: "5472-2026", field: form5472FieldMap.q40a_267A_no, value: true },
          { form: "5472-2026", field: form5472FieldMap.q41a_fdii_no, value: true },
          { form: "5472-2026", field: form5472FieldMap.q42a_safeHavenInRange_no, value: true },
          { form: "5472-2026", field: form5472FieldMap.q42b_safeHavenOutsideRange_no, value: true },
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
        COVER_LETTER_CLOSING,
      ],
    },
    {
      kind: "partVStatement",
      taxYear: 2026,
      lines: ["SUPPORTING STATEMENT TO FORM 5472", "Tax Year 2026", "Reporting Corporation: Example Holdings LLC, EIN 12-3456789", AUTHORED_DOC_SIGNATURE_HEADING],
      pages: [["SUPPORTING STATEMENT TO FORM 5472", "Tax Year 2026", "Reporting Corporation: Example Holdings LLC, EIN 12-3456789", AUTHORED_DOC_SIGNATURE_HEADING]],
    },
  ],
  pageOrder: [{ label: "Cover letter", startPage: 1, endPage: 1 }],
};

describe("runPreflight", () => {
  for (const [id, mutate] of [
    ["A01", (r: PackageRecord) => { r.taxYears[0].form5472.fields = r.taxYears[0].form5472.fields.filter((w) => w.field !== form5472FieldMap.box2_foreign50pct); }],
    ["A02", (r: PackageRecord) => { r.taxYears[0].form5472.fields = r.taxYears[0].form5472.fields.filter((w) => w.field !== form5472FieldMap.box3_foreignOwnedUsDE); }],
    ["A03", (r: PackageRecord) => { r.taxYears[0].form5472.fields.push({ form: "5472-2026", field: form5472FieldMap.q43a_coveredDebt_no, value: true }); }],
    ["A04", (r: PackageRecord) => { r.taxYears[0].form5472.fields = r.taxYears[0].form5472.fields.filter((w) => w.field !== form5472FieldMap.q42b_safeHavenOutsideRange_no); }],
    ["A05", (r: PackageRecord) => { r.taxYears[0].form5472.fields.find((w) => w.field === form5472FieldMap["1e_businessCode"])!.value = "541611"; }],
    ["A06", (r: PackageRecord) => { r.taxYears[0].form1120.fields[0].value = "01/01/2026"; }],
    ["A07", (r: PackageRecord) => { r.taxYears[0].periodStart = "01/01"; }],
    ["A08", (r: PackageRecord) => { r.taxYears[0].shortYearException = false; }],
    ["A09", (r: PackageRecord) => { r.taxYears[0].form1120.stampedTexts = []; }],
    ["A10", (r: PackageRecord) => { r.taxYears[0].form1120.fields = r.taxYears[0].form1120.fields.filter((w) => w.field !== form1120_2025FieldMap.E_initialReturn); }],
    ["A11", (r: PackageRecord) => { r.taxYears[0].signerTitleRect.left = 200; }],
    ["A12", (r: PackageRecord) => { r.taxYears[0].line1f = 1; }],
    ["A13", (r: PackageRecord) => { r.taxYears[0].partVRows[0].date = "2025-12-31"; }],
    ["A14", (r: PackageRecord) => { r.taxYears[0].nonCashTransfers = [{ date: "2026-03-01", direction: "in", description: "Securities", fairMarketValueCents: 100_00, valuationMethod: "Statement", alsoInPartV: false }]; }],
    ["A15", (r: PackageRecord) => { r.taxYears[0].form5472.fields = r.taxYears[0].form5472.fields.filter((w) => w.field !== form5472FieldMap["1j_initialYear"]); }],
    ["A16", (r: PackageRecord) => { r.taxYears[0].line1oSource = "owner_field" as "llc_field"; }],
    ["A17", (r: PackageRecord) => { r.taxYears[0].ownerAddressPostal = null; }],
    ["A18", (r: PackageRecord) => { r.taxYears[0].form5472.fields = r.taxYears[0].form5472.fields.filter((w) => w.field !== form5472FieldMap["4b3_ftin"]); }],
    ["A19", (r: PackageRecord) => { r.taxYears[0].form5472.fields.find((w) => w.field === form5472FieldMap["4b2_referenceId"])!.value = "BAD-ID"; }],
    ["A20", (r: PackageRecord) => { r.taxYears[0].form5472.fields.find((w) => w.field === form5472FieldMap["1_street"])!.value = "Different address"; }],
    ["A21", (r: PackageRecord) => { r.taxYears[0].form1120.fields.find((w) => w.field === form1120_2025FieldMap.D_totalAssets)!.value = "999"; }],
    ["A22", (r: PackageRecord) => { r.authoredDocuments[0].lines.push("These are timely filed."); }],
    ["A23", (r: PackageRecord) => { r.authoredDocuments[0].lines[0] = "Wrong address"; }],
    ["A24", (r: PackageRecord) => { r.taxYears[0].status = "late"; }],
    ["A25", (r: PackageRecord) => {
      const statement = r.authoredDocuments.find((d) => d.kind !== "coverLetter")!;
      statement.lines = statement.lines.filter((line) => line !== AUTHORED_DOC_SIGNATURE_HEADING);
    }],
    // Generator 2.2.0: a cover letter that still carries the penalties-of-
    // perjury heading is also an A25 failure.
    ["A25", (r: PackageRecord) => {
      const cover = r.authoredDocuments.find((d) => d.kind === "coverLetter")!;
      cover.lines = [...cover.lines, AUTHORED_DOC_SIGNATURE_HEADING];
    }],
    ["A26", (r: PackageRecord) => { r.taxYears[0].status = "late"; r.authoredDocuments.push({ kind: "reasonableCauseStatement", taxYear: 2026, lines: ["tax year 2026", "customer payments", AUTHORED_DOC_SIGNATURE_HEADING] }); r.taxYears[0].trades = false; }],
    ["A27", (r: PackageRecord) => { r.authoredDocuments.find((d) => d.kind === "partVStatement")!.pages = [["Tax Year 2026"]]; }],
    ["R02", (r: PackageRecord) => { r.llcPrintAddress.failures = ["field cannot fit address"]; }],
    ["A31", (r: PackageRecord) => { r.taxYears[0].form1120.stampedTexts = ["FOREIGN-OWNED U.S. DE — DIIRSP"]; }],
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

  // PDFs stored before the white-label change carry the old title/producer.
  it("A30 still accepts the legacy 'form5472prep generator' metadata", async () => {
    const legacy = await PDFDocument.create();
    legacy.addPage([612, 792]);
    legacy.setTitle("Form 5472 package");
    legacy.setProducer(`form5472prep generator ${GENERATOR_VERSION}`);
    legacy.setKeywords([
      `version=${goodRecord.generatorVersion}`,
      `commit=${goodRecord.commit}`,
      `generatedAt=${goodRecord.generatedAt}`,
    ]);
    const result = await runPreflight(clone(goodRecord), await legacy.save());
    expect(result.failures.filter((f) => f.id === "A30")).toEqual([]);
  });

  // Generator 2.3.0 (spec item 9): the 1120 prints the beginning year itself,
  // so "tax year beginning" is MM/DD only. goodRecord above uses the short-year
  // prior-revision exception, which keeps MM/DD/YYYY (the printed year is the
  // previous year).
  it("A06 requires MM/DD only on a same-revision 1120 and rejects a repeated year", async () => {
    const sameRevision = clone(goodRecord);
    sameRevision.taxYears[0].shortYearException = false;
    sameRevision.taxYears[0].form1120Revision = "2026";
    sameRevision.taxYears[0].form1120.fields[0].value = "01/15";
    const ok = await runPreflight(sameRevision, await goodPdfBytes(sameRevision));
    expect(ok.failures.filter((f) => f.id === "A06")).toEqual([]);

    const repeated = clone(sameRevision);
    repeated.taxYears[0].form1120.fields[0].value = "01/15/2026";
    const bad = await runPreflight(repeated, await goodPdfBytes(repeated));
    expect(bad.failures.filter((f) => f.id === "A06")).toEqual([
      { id: "A06", message: "Tax year 2026: 1120 and 5472 header dates do not match." },
    ]);

    const exceptionWithoutYear = clone(goodRecord);
    exceptionWithoutYear.taxYears[0].form1120.fields[0].value = "01/15";
    const badException = await runPreflight(exceptionWithoutYear, await goodPdfBytes(exceptionWithoutYear));
    expect(badException.failures.some((f) => f.id === "A06")).toBe(true);
  });

  it("A31 fails when an authored document names the delinquent-submission procedure", async () => {
    const record = clone(goodRecord);
    record.authoredDocuments[0].lines.push("Submitted under the Delinquent International Information Return Submission Procedures.");
    const result = await runPreflight(record, await goodPdfBytes(record));
    expect(result.failures.some((f) => f.id === "A31")).toBe(true);
  });

  it("A31 ignores DIIRSP inside the LLC name", async () => {
    const record = clone(goodRecord);
    record.llcName = "DIIRSP Holdings LLC";
    record.authoredDocuments[0].lines.push("Re: pro forma Form 1120 with Form 5472 attached for DIIRSP Holdings LLC");
    const result = await runPreflight(record, await goodPdfBytes(record));
    expect(result.failures.some((f) => f.id === "A31")).toBe(false);
  });

  it("W31 warns, without failing, when the owner's foreign tax ID is None", async () => {
    const good = await runPreflight(clone(goodRecord), await goodPdfBytes(goodRecord));
    expect(good.warnings.some((w) => w.id === "W31")).toBe(false);

    const record = clone(goodRecord);
    record.taxYears[0].ownerHasFtin = false;
    for (const field of [form5472FieldMap["4b3_ftin"], form5472FieldMap["8b3_ftin"]]) {
      record.taxYears[0].form5472.fields.find((w) => w.field === field)!.value = "None";
    }
    record.taxYears[0].form5472.fields.push({ form: "5472-2026", field: form5472FieldMap["4e_taxResidence"], value: "Hong Kong" });
    const result = await runPreflight(record, await goodPdfBytes(record));
    expect(result.failures.some((f) => f.id === "A18" || f.id === "W31")).toBe(false);
    expect(result.warnings.filter((w) => w.id === "W31")).toEqual([
      expect.objectContaining({ message: expect.stringContaining("e.g. Hong Kong: HKID number") }),
    ]);
  });

  it("W32 warns when the owner's street line has no flat, floor or street number", async () => {
    const withNumber = clone(goodRecord);
    withNumber.ownerStreet = "88 Queen Road Central, Suite 1200";
    expect((await runPreflight(withNumber, await goodPdfBytes(withNumber))).warnings.some((w) => w.id === "W32")).toBe(false);

    const record = clone(goodRecord);
    record.ownerStreet = "Exam House, Sample Court, Yau Tong";
    const result = await runPreflight(record, await goodPdfBytes(record));
    expect(result.failures).toEqual([]);
    expect(result.warnings.find((w) => w.id === "W32")?.message).toContain("flat/floor/unit");

    const legacy = clone(goodRecord);
    delete legacy.ownerStreet;
    expect((await runPreflight(legacy, await goodPdfBytes(legacy))).warnings.some((w) => w.id === "W32")).toBe(false);
  });

  it("W33 warns when the formation year reports $0 of Part V transactions", async () => {
    const good = await runPreflight(clone(goodRecord), await goodPdfBytes(goodRecord));
    expect(good.warnings.some((w) => w.id === "W33")).toBe(false);

    const record = clone(goodRecord);
    record.taxYears[0].partVRows = [];
    record.taxYears[0].partVTotalCents = 0;
    record.taxYears[0].partVTotalRounded = 0;
    record.taxYears[0].line1f = 0;
    record.taxYears[0].line1h = 0;
    const result = await runPreflight(record, await goodPdfBytes(record));
    expect(result.failures.filter((f) => f.id === "W33")).toEqual([]);
    expect(result.warnings.find((w) => w.id === "W33")?.message).toContain(
      "Formation costs the owner paid personally (state filing fee, registered agent fee)",
    );

    const notFormationYear = clone(record);
    notFormationYear.formationDate = "2020-03-01T00:00:00.000Z";
    expect(
      (await runPreflight(notFormationYear, await goodPdfBytes(notFormationYear))).warnings.some((w) => w.id === "W33"),
    ).toBe(false);
  });

  it("A16 emits W16, not a failure, when line 1o defaults to United States", async () => {
    const record = clone(goodRecord);
    record.taxYears[0].line1oSource = "default_us";
    const result = await runPreflight(record, await goodPdfBytes(record));
    expect(result.failures.some((f) => f.id === "A16")).toBe(false);
    expect(result.warnings.some((w) => w.id === "W16")).toBe(true);
  });

  it("W02 warns when transaction categories were never confirmed", async () => {
    const record = clone(goodRecord);
    record.taxYears[0].zeroConfirmations = {};

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.some((f) => f.id === "W02")).toBe(false);
    expect(result.warnings.some((w) => w.id === "W02")).toBe(true);
  });

  it("A04 passes when every Form 5472 line 37 through 42 Yes/No box is answered", async () => {
    const result = await runPreflight(clone(goodRecord), await goodPdfBytes(goodRecord));

    expect(result.failures.filter((f) => f.id === "A04")).toEqual([]);
  });

  it("A04 fails when a required line 37 through 42 Yes/No box is unanswered", async () => {
    const record = clone(goodRecord);
    record.taxYears[0].form5472.fields = record.taxYears[0].form5472.fields.filter(
      (write) => write.field !== form5472FieldMap.q42b_safeHavenOutsideRange_no,
    );

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.some((f) => f.id === "A04" && f.message.includes("42b"))).toBe(true);
  });

  it("A04 fails when conditional line 38a or 38c is answered while line 37 is No", async () => {
    const record = clone(goodRecord);
    record.taxYears[0].form5472.fields.push(
      { form: "5472-2026", field: form5472FieldMap.q38a_customsValue_no, value: true },
    );

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.some((f) => f.id === "A04" && f.message.includes("38a must be blank"))).toBe(true);
  });

  it("A15 emits W15 when the formation-year prior filing answer is yes or not_sure", async () => {
    for (const answer of ["yes", "not_sure"] as const) {
      const record = clone(goodRecord);
      record.taxYears[0].priorForm5472Filed = answer;
      record.taxYears[0].line1jChecked = false;
      record.taxYears[0].form5472.fields = record.taxYears[0].form5472.fields.filter(
        (write) => write.field !== form5472FieldMap["1j_initialYear"],
      );

      const result = await runPreflight(record, await goodPdfBytes(record));

      expect(result.failures.some((f) => f.id === "A15")).toBe(false);
      expect(result.warnings.some((w) => w.id === "W15")).toBe(true);
    }
  });

  it("A17 emits W17 instead of failing for legacy single-line owner addresses", async () => {
    const record = clone(goodRecord);
    record.taxYears[0].ownerAddressState = null;
    record.taxYears[0].ownerAddressPostal = null;
    record.taxYears[0].ownerNoPostalCode = null;

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.some((f) => f.id === "A17")).toBe(false);
    expect(result.warnings.some((w) => w.id === "W17")).toBe(true);
  });

  it("A18 emits W18 instead of failing when legacy orders predate the no-FTIN answer", async () => {
    const record = clone(goodRecord);
    record.taxYears[0].ownerHasFtin = null;
    for (const field of [form5472FieldMap["4b3_ftin"], form5472FieldMap["8b3_ftin"]]) {
      record.taxYears[0].form5472.fields.find((write) => write.field === field)!.value = "";
    }

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.some((f) => f.id === "A18")).toBe(false);
    expect(result.warnings.some((w) => w.id === "W18")).toBe(true);
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

  it("A19 passes when an ITIN-only owner has no stored reference ID and both reference-ID fields are blank", async () => {
    const record = clone(goodRecord);
    record.ownerReferenceId = null;
    record.taxYears[0].form5472.fields = record.taxYears[0].form5472.fields.filter(
      (write) =>
        write.field !== form5472FieldMap["4b2_referenceId"] &&
        write.field !== form5472FieldMap["8b2_referenceId"],
    );

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.filter((f) => f.id === "A19")).toEqual([]);
  });

  it("A19 still fails when written reference IDs differ from the stored ownerReferenceId", async () => {
    const record = clone(goodRecord);
    record.ownerReferenceId = "STOREDOWNER1";
    for (const field of [form5472FieldMap["4b2_referenceId"], form5472FieldMap["8b2_referenceId"]]) {
      record.taxYears[0].form5472.fields.find((write) => write.field === field)!.value = "WRITTENOWNER1";
    }

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.some((f) => f.id === "A19")).toBe(true);
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
      COVER_LETTER_CLOSING,
    ];

    const result = await runPreflight(record, await goodPdfBytes(record));

    expect(result.failures.some((f) => f.id === "A22")).toBe(false);
  });

  it("A26 fails unsupported generated operations claims but not legacy fallback text", async () => {
    const generated = clone(goodRecord);
    generated.taxYears[0].status = "late";
    generated.authoredDocuments.push({
      kind: "reasonableCauseStatement",
      taxYear: 2026,
      lines: ["tax year 2026", "The Company was dormant and had no customers or no vendors.", AUTHORED_DOC_SIGNATURE_HEADING],
    });
    let result = await runPreflight(generated, await goodPdfBytes(generated));
    expect(result.failures.some((f) => f.id === "A26")).toBe(true);

    const legacy = clone(goodRecord);
    legacy.taxYears[0].status = "late";
    legacy.authoredDocuments.push({
      kind: "reasonableCauseStatement",
      taxYear: 2026,
      lines: ["tax year 2026", "The Company was dormant and had no customers or no vendors.", AUTHORED_DOC_SIGNATURE_HEADING],
      rcsFallbackUsed: true,
    });
    result = await runPreflight(legacy, await goodPdfBytes(legacy));
    expect(result.failures.some((f) => f.id === "A26")).toBe(false);
    expect(result.warnings.some((w) => w.id === "W26")).toBe(true);
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

// ─── Generator 2.3.0 pre-flight (spec items 2-5, 7, 8, 10, 11, 13, 14) ───────
// All identifiers below are synthetic. Tax-ID test numbers are generated here
// so that they pass (or fail) the checksum; they are not real IDs.

function luhnCheckDigit(prefix8: string): string {
  let sum = 0;
  for (let index = 0; index < 8; index++) {
    let digit = Number(prefix8[index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return String((10 - (sum % 10)) % 10);
}

function cpfWithCheckDigits(prefix9: string): string {
  const digits = prefix9.split("").map(Number);
  for (const length of [9, 10]) {
    let sum = 0;
    for (let index = 0; index < length; index++) sum += digits[index] * (length + 1 - index);
    const remainder = (sum * 10) % 11;
    digits.push(remainder === 10 ? 0 : remainder);
  }
  return digits.join("");
}

const SYNTHETIC_SIN = `12345678${luhnCheckDigit("12345678")}`;
const SYNTHETIC_CPF = cpfWithCheckDigits("123456780");

function rcsYear(overrides: Partial<RcsYearRecord> = {}): RcsYearRecord {
  return {
    narrativeSource: "admin",
    narrative: "I did not know that my LLC had to file Form 5472. No adviser told me about it.",
    customerExplanation: { whyMissed: null, whenLearned: null },
    learnedOn: "2026-09-20",
    dueDate: "2027-04-15",
    dueDateProse: "April 15, 2027",
    isFirstLateYear: true,
    stillUnaware: { needed: false, rendered: false },
    noticeConfirmed: true,
    noticeSentence: true,
    firstTaxYearSentence: true,
    smallCorpParagraph: {
      setting: null,
      conditionsMet: false,
      conditions: { lateYear: true, registeredAgentOnly: false, noGrossReceiptsSignal: true, notKnownBeforeDueDate: true },
      rendered: false,
    },
    ...overrides,
  };
}

// goodRecord made late (generator 2.3.0 shape): one RCS whose cause section is
// the admin narrative.
function lateRecord(rcs: Partial<RcsYearRecord> = {}): PackageRecord {
  const record = clone(goodRecord);
  const year = record.taxYears[0];
  year.status = "late";
  year.reasonableCauseIncluded = true;
  year.rcs = rcsYear(rcs);
  year.partVStatementLine1fPrinted = year.line1f;
  year.form5472.fields.push(
    { form: "5472-2026", field: form5472FieldMap["1f_totalPaymentsThisForm"], value: String(year.line1f) },
    { form: "5472-2026", field: form5472FieldMap["1h_totalPaymentsAllForms"], value: String(year.line1f) },
  );
  record.authoredDocuments.push({
    kind: "reasonableCauseStatement",
    taxYear: 2026,
    lines: [
      "REASONABLE CAUSE STATEMENT",
      "This statement explains why I did not file for tax year 2026 by the due date.",
      "2. Cause of the Delinquency",
      ...(year.rcs.narrative ? year.rcs.narrative.split(/(?<=\.) /) : []),
      AUTHORED_DOC_SIGNATURE_HEADING,
    ],
    rcsMissingAnswers: year.rcs.narrativeSource === null,
    rcsNarrativeSource: year.rcs.narrativeSource,
  });
  return record;
}

async function preflightOf(record: PackageRecord) {
  return runPreflight(record, await goodPdfBytes(record));
}

const ids = (issues: { id: string }[]) => issues.map((issue) => issue.id);

describe("pre-flight 2.3.0: reasonable cause statement (items 2-5)", () => {
  it("A26 names the field, quotes each matched phrase and states the rule (narrative = error)", async () => {
    const record = lateRecord({
      narrative:
        "I did not know about Form 5472. The LLC had no operating expenses, employees, or transactions during the year.",
    });
    const result = await preflightOf(record);
    const a26 = result.failures.filter((f) => f.id === "A26");
    expect(a26).toHaveLength(1);
    expect(a26[0].message).toContain("Tax year 2026 → RCS narrative (admin):");
    expect(a26[0].message).toContain('"The LLC had no operating expenses, employees, or transactions during the year."');
    expect(a26[0].message).toContain(
      "claims about operations, expenses, employees or transactions that the order data does not support or contradicts",
    );
    expect(a26[0].message).toContain("This year reports $278.50 of Part V transactions.");
  });

  it("A26 truncates a long quote to about 80 characters around the match", async () => {
    const long =
      "Because my formation agent never mentioned any annual federal information return obligations for foreign-owned LLCs, I assumed the LLC with no employees needed nothing further from me at all in any year whatsoever.";
    const result = await preflightOf(lateRecord({ narrative: long }));
    const quote = /"([^"]+)"/.exec(result.failures.find((f) => f.id === "A26")!.message)![1];
    expect(quote).toContain("no employees");
    expect(quote.length).toBeLessThanOrEqual(82);
    expect(quote.startsWith("…") || quote.endsWith("…")).toBe(true);
  });

  it("customer text with the same claim is a labelled W26b warning, never an error, while no narrative is written", async () => {
    const record = lateRecord({
      narrativeSource: null,
      narrative: null,
      customerExplanation: { whyMissed: CUSTOMER_INTAKE_TEXT, whenLearned: null },
    });
    const result = await preflightOf(record);
    expect(result.failures.filter((f) => f.id === "A26")).toEqual([]);
    const w26b = result.warnings.find((w) => w.id === "W26b")!;
    expect(w26b.message).toContain("Tax year 2026 → Customer's explanation: why missed (customer text, never printed)");
    expect(w26b.message).toContain('"The Owner has no operating expenses, employees, or transactions."');
  });

  it("A32: a late year without an admin narrative fails with one clear message (no generic A26 answers-missing)", async () => {
    const result = await preflightOf(lateRecord({ narrativeSource: null, narrative: null }));
    expect(result.failures.filter((f) => f.id === "A32")).toEqual([
      expect.objectContaining({ message: expect.stringContaining("RCS narrative not written for tax year 2026") }),
    ]);
    expect(result.failures.some((f) => f.id === "A26")).toBe(false);
  });

  it("A33 blocks questions and notes addressed to us in text that renders, naming the field", async () => {
    const cases: Array<[string, string]> = [
      ["Could you check whether I need to file this?", '"Could you check whether I need to file this?"'],
      ["Please review the dates below before filing.", '"Please review the dates below before filing."'],
      ["My objective is to keep the LLC open at minimal cost.", '"My objective is to keep the LLC open at minimal cost."'],
      ["I relied on [CPA Name] for advice.", '"I relied on [CPA Name] for advice."'],
    ];
    for (const [narrative, quote] of cases) {
      const result = await preflightOf(lateRecord({ narrative }));
      const a33 = result.failures.find((f) => f.id === "A33");
      expect(a33?.message, narrative).toContain("Tax year 2026 → RCS narrative (admin):");
      expect(a33?.message).toContain(quote);
    }
  });

  it("A33 also catches free text that only exists in a rendered statement (e.g. a Part V note)", async () => {
    const record = lateRecord();
    record.authoredDocuments.find((d) => d.kind === "partVStatement")!.lines.splice(3, 0, "Could you add the bank fees?");
    const a33 = (await preflightOf(record)).failures.find((f) => f.id === "A33")!;
    expect(a33.message).toContain('Tax year 2026 → Part V statement text: "Could you add the bank fees?"');
  });

  it("W34 warns when a later late year has no learned-on date; W35 when no IRS notice is not confirmed", async () => {
    const record = lateRecord({ stillUnaware: { needed: true, rendered: false }, learnedOn: null, noticeConfirmed: null, noticeSentence: false });
    const result = await preflightOf(record);
    expect(result.failures).toEqual([]);
    expect(result.warnings.find((w) => w.id === "W34")?.message).toContain('"Learned of requirement on" is not recorded');
    expect(result.warnings.find((w) => w.id === "W35")?.message).toContain("was left out of the RCS");
  });

  it("W36 surfaces a 'not sure' Form 7004 answer before upload", async () => {
    const record = lateRecord();
    record.taxYears[0].extensionUnclear = true;
    expect((await preflightOf(record)).warnings.find((w) => w.id === "W36")?.message).toContain(
      "Extension unclear — confirm with customer before fax",
    );
  });
});

describe("pre-flight 2.3.0: totals, preparer, prior years (items 7, 8, 10)", () => {
  it("A34 fails when the Part V statement total does not equal lines 1f and 1h", async () => {
    const ok = await preflightOf(lateRecord());
    expect(ok.failures.filter((f) => f.id === "A34")).toEqual([]);

    const printedWrong = lateRecord();
    printedWrong.taxYears[0].partVStatementLine1fPrinted = 424;
    expect((await preflightOf(printedWrong)).failures.find((f) => f.id === "A34")?.message).toContain(
      "Part V statement total ($424) must equal Form 5472 line 1f ($279) and line 1h ($279)",
    );

    const formWrong = lateRecord();
    formWrong.taxYears[0].form5472.fields.find((w) => w.field === form5472FieldMap["1h_totalPaymentsAllForms"])!.value = "49";
    expect((await preflightOf(formWrong)).failures.some((f) => f.id === "A34")).toBe(true);
  });

  it("A35 fails a house preparer with incomplete config, and 'I prepared' while a preparer is shown", async () => {
    const config = lateRecord();
    config.paidPreparerMode = "house";
    config.housePreparer = { configComplete: false, missing: ["HOUSE_PREPARER_PTIN"], invalid: ["HOUSE_PREPARER_FIRM_EIN"] };
    expect((await preflightOf(config)).failures.find((f) => f.id === "A35")?.message).toContain(
      "missing HOUSE_PREPARER_PTIN; invalid HOUSE_PREPARER_FIRM_EIN",
    );

    const prepared = lateRecord({ narrative: "I prepared these returns myself once I learned of the requirement." });
    prepared.paidPreparerMode = "house";
    prepared.housePreparer = { configComplete: true, missing: [], invalid: [] };
    prepared.taxYears[0].paidPreparer = { shown: true, discuss: null, fitFailures: [] };
    expect((await preflightOf(prepared)).failures.find((f) => f.id === "A35")?.message).toContain('"I prepared these returns');

    const noPreparer = lateRecord({ narrative: "I prepared these returns myself once I learned of the requirement." });
    expect((await preflightOf(noPreparer)).failures.some((f) => f.id === "A35")).toBe(false);
  });

  // goodRecord's only year is its formation year; add a later year to test W15.
  function twoYearRecord(): PackageRecord {
    const record = clone(goodRecord);
    const later = clone(record.taxYears[0]);
    later.taxYear = 2027;
    later.isInitialYear = false;
    later.line1jChecked = false;
    later.form5472.fields = later.form5472.fields.filter((w) => w.field !== form5472FieldMap["1j_initialYear"]);
    record.taxYears.push(later);
    return record;
  }

  it("W15 is suppressed when the earliest year contains the formation date or has line 1j checked", async () => {
    const formationFirst = twoYearRecord();
    formationFirst.taxYears[0].isFormationYear = true;
    expect(ids((await preflightOf(formationFirst)).warnings)).not.toContain("W15");

    const legacyShape = twoYearRecord(); // no isFormationYear flag: falls back to the formation date + 1j
    expect(ids((await preflightOf(legacyShape)).warnings)).not.toContain("W15");

    const startsLater = twoYearRecord();
    startsLater.taxYears.shift();
    startsLater.formationDate = "2025-03-01T00:00:00.000Z";
    const result = await preflightOf(startsLater);
    expect(result.warnings).toContainEqual({ id: "W15", message: "An earlier year may not have been filed." });
  });
});

describe("pre-flight 2.3.0: owner data warnings (items 11, 13)", () => {
  it("validates the synthetic SIN and CPF helpers", () => {
    expect(isValidCanadianSin(SYNTHETIC_SIN)).toBe(true);
    expect(isValidCanadianSin(`${SYNTHETIC_SIN.slice(0, 3)} ${SYNTHETIC_SIN.slice(3, 6)} ${SYNTHETIC_SIN.slice(6)}`)).toBe(true);
    expect(isValidCanadianSin(`12345678${(Number(luhnCheckDigit("12345678")) + 1) % 10}`)).toBe(false);
    expect(isValidCanadianSin("123456789012")).toBe(false);
    expect(isValidBrazilianCpf(SYNTHETIC_CPF)).toBe(true);
    expect(isValidBrazilianCpf(`${SYNTHETIC_CPF.slice(0, 3)}.${SYNTHETIC_CPF.slice(3, 6)}.${SYNTHETIC_CPF.slice(6, 9)}-${SYNTHETIC_CPF.slice(9)}`)).toBe(true);
    expect(isValidBrazilianCpf(`${SYNTHETIC_CPF.slice(0, 10)}${(Number(SYNTHETIC_CPF[10]) + 1) % 10}`)).toBe(false);
    expect(isValidBrazilianCpf("11111111111")).toBe(false);
  });

  function withOwnerIds(residence: string, ftin: string, referenceId = "EXAMPLEOWNER1"): PackageRecord {
    const record = clone(goodRecord);
    record.ownerReferenceId = referenceId;
    const fields = record.taxYears[0].form5472.fields;
    for (const field of [form5472FieldMap["4b3_ftin"], form5472FieldMap["8b3_ftin"]]) fields.find((w) => w.field === field)!.value = ftin;
    for (const field of [form5472FieldMap["4b2_referenceId"], form5472FieldMap["8b2_referenceId"]]) fields.find((w) => w.field === field)!.value = referenceId;
    fields.push({ form: "5472-2026", field: form5472FieldMap["4e_taxResidence"], value: residence });
    return record;
  }

  it("W37 checks a Canadian FTIN as a SIN and a Brazilian FTIN as a CPF (warnings, never failures)", async () => {
    expect(ids((await preflightOf(withOwnerIds("Canada", SYNTHETIC_SIN))).warnings)).not.toContain("W37");
    const badSin = await preflightOf(withOwnerIds("Canada", "123456789012"));
    expect(badSin.failures).toEqual([]);
    expect(badSin.warnings.find((w) => w.id === "W37")?.message).toContain("Canadian Social Insurance Number");

    expect(ids((await preflightOf(withOwnerIds("Brazil", SYNTHETIC_CPF))).warnings)).not.toContain("W37");
    expect((await preflightOf(withOwnerIds("Brazil", "12345678901"))).warnings.find((w) => w.id === "W37")?.message).toContain("Brazilian CPF");
  });

  it("W37 only checks length elsewhere", async () => {
    expect(ids((await preflightOf(withOwnerIds("Hong Kong", "HK1234567"))).warnings)).not.toContain("W37");
    expect((await preflightOf(withOwnerIds("Hong Kong", "1234"))).warnings.find((w) => w.id === "W37")?.message).toContain("4 characters long");
  });

  it("W38 flags possible swapped fields: the Reference ID is a valid SIN and the FTIN is not", async () => {
    const result = await preflightOf(withOwnerIds("Canada", "123456789012", SYNTHETIC_SIN));
    expect(result.warnings.find((w) => w.id === "W38")?.message).toContain("Possible swapped fields");
    expect(result.warnings.find((w) => w.id === "W38")?.message).not.toContain(SYNTHETIC_SIN);
    expect(ids((await preflightOf(withOwnerIds("Canada", SYNTHETIC_SIN, SYNTHETIC_SIN))).warnings)).not.toContain("W38");
  });

  it("W39 flags an all-lowercase street and a bare trailing number with no unit label, and never rewrites it", async () => {
    const lower = clone(goodRecord);
    lower.ownerStreet = "12 sample road, flat 5";
    const lowerResult = await preflightOf(lower);
    expect(lowerResult.warnings.find((w) => w.id === "W39")?.message).toContain("is all lowercase");
    expect(lower.ownerStreet).toBe("12 sample road, flat 5");

    const bare = clone(goodRecord);
    bare.ownerStreet = "12 Main St 5";
    expect((await preflightOf(bare)).warnings.find((w) => w.id === "W39")?.message).toContain('ends "St 5"');

    for (const street of ["12 Main St Apt 5", "12 Main St #5", "88 Queen Road Central, Suite 1200", "Calle Mayor 5", "12 Route 66"]) {
      const ok = clone(goodRecord);
      ok.ownerStreet = street;
      expect(ids((await preflightOf(ok)).warnings), street).not.toContain("W39");
    }
  });

  it("A22 recognises an LLC name that wraps across cover-letter lines", async () => {
    const record = clone(goodRecord);
    record.llcName = "Late Night Media LLC";
    record.authoredDocuments[0].lines = [
      ...IRS_MAIL_ADDRESS_DISPLAY_LINES,
      "Date: 9/22/2026",
      `Re: ${COVER_LETTER_ENCLOSURE_PHRASE} for Late Night Media LLC`,
      `Enclosed please find ${COVER_LETTER_ENCLOSURE_PHRASE} for Late Night`,
      "Media LLC. The package covers tax year 2026.",
      COVER_LETTER_CLOSING,
    ];
    expect((await preflightOf(record)).failures.some((f) => f.id === "A22")).toBe(false);
  });
});

// Definition of done: Lane A's synthetic two-year late fixture (owner-paid
// costs both years, admin narratives, learned-on dates) with the IRS notice
// confirmed for both years passes pre-flight with NO errors, and warns only
// where data is genuinely missing.
describe("pre-flight 2.3.0: definition of done (F11)", () => {
  const confirmed = {
    ...F11,
    yearData: F11.yearData.map((year) => ({ ...year, rcsNoIrsNoticeConfirmed: true })),
  };

  it("passes with no errors; the only warning is the genuinely unconfirmed Form 7004 answer", async () => {
    const pkg = await generatePackage(confirmed, lateCatchUpFinalisedAt);
    const result = await runPreflight(pkg.record, pkg.bytes);
    expect(result.failures).toEqual([]);
    expect(result.ok).toBe(true);
    expect(ids(result.warnings)).toEqual(["W36"]);
    // Item 10: the earliest year (2024) contains the formation date, so W15 is gone.
    expect(ids(result.warnings)).not.toContain("W15");
  }, 60_000);

  it("with the extension answered 'no' it raises no warnings at all", async () => {
    const pkg = await generatePackage({ ...confirmed, extensionFiled: "no" }, lateCatchUpFinalisedAt);
    const result = await runPreflight(pkg.record, pkg.bytes);
    expect(result.failures).toEqual([]);
    expect(result.warnings).toEqual([]);
  }, 60_000);

  it("customer text but no admin narrative: no RCS body text, A32 for each late year, customer text only as context", async () => {
    const noNarrative = {
      ...confirmed,
      yearData: confirmed.yearData.map((year) => ({ ...year, rcsAdminNarrative: null })),
    };
    const pkg = await generatePackage(noNarrative, lateCatchUpFinalisedAt);
    const rendered = pkg.record.authoredDocuments.flatMap((doc) => doc.lines).join(" ");
    expect(rendered).not.toContain("Could you please review");
    const result = await runPreflight(pkg.record, pkg.bytes);
    expect(result.failures.map((f) => f.message.split(".")[0])).toEqual([
      "RCS narrative not written for tax year 2024",
      "RCS narrative not written for tax year 2025",
    ]);
    expect(result.warnings.find((w) => w.id === "W26b")?.message).toContain("customer text, never printed");
  }, 60_000);

  it("customer text pasted into the narrative fails A26 and A33 with quotes", async () => {
    const pasted = {
      ...confirmed,
      yearData: confirmed.yearData.map((year) =>
        year.taxYear === 2024 ? { ...year, rcsAdminNarrative: CUSTOMER_INTAKE_TEXT } : year,
      ),
    };
    const pkg = await generatePackage(pasted, lateCatchUpFinalisedAt);
    const result = await runPreflight(pkg.record, pkg.bytes);
    const a26 = result.failures.find((f) => f.id === "A26")!;
    expect(a26.message).toContain('Tax year 2024 → RCS narrative (admin): "The Owner has no operating expenses, employees, or transactions."');
    expect(a26.message).toContain("This year reports $424.00 of Part V transactions.");
    const a33 = result.failures.find((f) => f.id === "A33")!;
    expect(a33.message).toContain("Could you please review whether Form 5472 and 1120 are required for my LLC?");
    expect(a33.message).toContain("My objective is to maintain the LLC at minimal cost.");
    expect(result.failures.filter((f) => f.id === "A33")).toHaveLength(1);
  }, 60_000);
});

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function goodPdfBytes(record: PackageRecord): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.addPage([612, 792]);
  pdf.setTitle("Form 5472 \u2013 Test LLC \u2013 2025");
  pdf.setProducer(`generator ${GENERATOR_VERSION}`);
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
  pdf.setTitle("Form 5472 \u2013 Test LLC \u2013 2025");
  pdf.setProducer(`generator ${GENERATOR_VERSION}`);
  pdf.setKeywords([
    `version=${record.generatorVersion}`,
    `commit=${record.commit}`,
    `generatedAt=${record.generatedAt}`,
  ]);
  return pdf.save();
}
