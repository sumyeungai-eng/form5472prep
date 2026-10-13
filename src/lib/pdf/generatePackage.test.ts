import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import {
  AUTHORED_DOC_DATE_LINE,
  AUTHORED_DOC_SIGNATURE_HEADING,
  COVER_LETTER_CLOSING,
  COVER_LETTER_ENCLOSURE_PHRASE,
  SIGNER_TITLE,
  SMALL_CORPORATION_PARAGRAPH,
} from "@/config/filingPackage";
import {
  form5472FieldMap,
  form1120_2018FieldMap,
  form1120_2019FieldMap,
  form1120_2020FieldMap,
  form1120_2021FieldMap,
  form1120_2022FieldMap,
  form1120_2023FieldMap,
  form1120_2024FieldMap,
  form1120_2025FieldMap,
  form1120PaidPreparerFieldMaps,
} from "./fieldMaps";
import {
  assertRelatedPartyCount,
  deriveSignerTitleColumnBounds,
  fitScheduleDescription,
  generatePackage,
  NeedsReviewError,
  roundedPartVTotalDollars,
  signerTitleStampPlacement,
} from "./generatePackage";
import { runPreflight } from "./preflight";
import { filingToPackageInput } from "./packageInput";
import {
  F1,
  F2,
  F3,
  F4,
  F5,
  F7,
  F8,
  F9,
  F10,
  F10NoExtension,
  F11,
  CUSTOMER_INTAKE_TEXT,
  finalisedAt,
  fixtures,
  lateCatchUpFinalisedAt,
  reviewFinalisedAt,
} from "./__fixtures__/filings";
import { drawnTextWidth, usableFieldWidth } from "./fitText";

const PDF_TIMEOUT = 20_000;
const IRS_MAIL_ADDRESS_DISPLAY_LINES = [
  "Internal Revenue Service",
  "1973 Rulon White Blvd, M/S 6112",
  "Attn: PIN Unit",
  "Ogden, UT 84201",
] as const;

describe("generatePackage fixtures", () => {
  for (const [name, filing] of Object.entries(fixtures)) {
    it(`${name} passes Wave 1 preflight assertions`, async () => {
      const pkg = await generatePackage(filing, finalisedAt);
      const preflight = await runPreflight(pkg.record, pkg.bytes);
      expect(preflight.failures).toEqual([]);
      if (name === "F6") {
        // Generator 2.3.0 (D2): a "not_sure" Form 7004 counts as NO extension
        // for lateness. 2025 was due 2026-04-15, so on finalisedAt it is late
        // and gets its own statement; the year stays flagged for the reviewer.
        expect(pkg.record.taxYears[0].status).toBe("late");
        expect(pkg.record.taxYears[0].extensionUnclear).toBe(true);
        expect(pkg.record.taxYears[0].extensionFiled).toBe("not_sure");
        expect(
          pkg.record.authoredDocuments.filter((doc) => doc.kind === "reasonableCauseStatement").map((d) => d.taxYear),
        ).toEqual([2025]);
      }
    }, PDF_TIMEOUT);
  }
});

describe("generatePackage regressions", () => {
  it("G-01 checks Form 5472 line 2 as well as line 3", async () => {
    const pkg = await generatePackage(F1, finalisedAt);
    const fields = pkg.record.taxYears[0].form5472.fields;
    expect(fields).toContainEqual({ form: "5472-2025", field: form5472FieldMap.box2_foreign50pct, value: true });
    expect(fields).toContainEqual({ form: "5472-2025", field: form5472FieldMap.box3_foreignOwnedUsDE, value: true });
  }, PDF_TIMEOUT);

  it("G-02 leaves Form 5472 lines 43a and 43b blank", async () => {
    const pkg = await generatePackage(F1, finalisedAt);
    const fields = pkg.record.taxYears[0].form5472.fields.map((w) => w.field);
    expect(fields).not.toContain(form5472FieldMap.q43a_coveredDebt_no);
    expect(fields.some((field) => /43b|c3_9/.test(field))).toBe(false);
  }, PDF_TIMEOUT);

  it("G-04 fills full calendar-year 1120 header dates (beginning MM/DD only: the form prints the year)", async () => {
    const pkg = await generatePackage(F1, finalisedAt);
    const fields = pkg.record.taxYears[0].form1120.fields;
    expect(fields).toContainEqual({ form: "1120-2025", field: form1120_2025FieldMap.taxYearBeginning, value: "01/01" });
    expect(fields).toContainEqual({ form: "1120-2025", field: form1120_2025FieldMap.taxYearEnding, value: "12/31" });
    expect(fields).toContainEqual({ form: "1120-2025", field: form1120_2025FieldMap.taxYearEndingYear2, value: "25" });
  }, PDF_TIMEOUT);

  it("records dissolutionDate only for final returns", async () => {
    const pkg = await generatePackage(
      {
        ...F1,
        isFinalReturn: false,
        dissolvedAt: new Date("2025-09-30T00:00:00.000Z"),
      },
      finalisedAt,
    );

    expect(pkg.record.dissolutionDate).toBeNull();
    expect((await runPreflight(pkg.record, pkg.bytes)).failures.some((f) => f.id === "A07")).toBe(false);
  }, PDF_TIMEOUT);

  it("G-06 defaults 1o to United States instead of the owner's country", async () => {
    const pkg = await generatePackage({ ...F2, llcCountryBusiness: null }, finalisedAt);
    const year = pkg.record.taxYears[0];
    expect(year.line1oSource).toBe("default_us");
    expect(year.form5472.fields).toContainEqual({
      form: "5472-2025",
      field: form5472FieldMap["1o_countriesBusinessConducted"],
      value: "United States",
    });
    expect(year.form5472.fields).not.toContainEqual({
      form: "5472-2025",
      field: form5472FieldMap["1o_countriesBusinessConducted"],
      value: "Hong Kong",
    });
  }, PDF_TIMEOUT);

  it("generates a no-FTIN package with None in both FTIN fields", async () => {
    const pkg = await generatePackage({ ...F2, ownerFtin: "" }, finalisedAt);
    const fields = pkg.record.taxYears[0].form5472.fields;

    expect(fields).toContainEqual({
      form: "5472-2025",
      field: form5472FieldMap["4b3_ftin"],
      value: "None",
    });
    expect(fields).toContainEqual({
      form: "5472-2025",
      field: form5472FieldMap["8b3_ftin"],
      value: "None",
    });
    expect((await runPreflight(pkg.record, pkg.bytes)).failures).toEqual([]);
  }, PDF_TIMEOUT);

  it("G-08 sums cents and rounds half-up once for line 1f", async () => {
    expect(roundedPartVTotalDollars([
      { date: "2026-01-01", description: "Contribution", amountCents: 1_300_936, category: "contribution" },
      { date: "2026-02-01", description: "Distribution", amountCents: -1_487_100, category: "distribution" },
    ])).toBe(27_880);
  }, PDF_TIMEOUT);

  it("Q-01/Q-02 includes owner-paid costs and loan rows in Part V and line 1f", async () => {
    const pkg = await generatePackage(
      {
        ...F1,
        yearData: [
          {
            ...F1.yearData[0],
            contributions: 0,
            distributions: 0,
            reportableTransactions: [
              { date: "2025-01-10", description: "Owner contribution", amountCents: 100_00, category: "contribution" },
              { date: "2025-02-10", description: "Owner distribution", amountCents: -20_00, category: "distribution" },
              { date: "2025-03-10", description: "Short-term loan from owner", amountCents: 200_00, category: "loan_from_owner" },
              { date: "2025-04-10", description: "Loan advance to owner", amountCents: -50_00, category: "loan_to_owner" },
            ],
            ownerPaidCosts: [
              {
                category: "state_filing_fee",
                date: "2025-05-10",
                amountCents: 150_00,
              },
            ],
            zeroConfirmations: {},
          },
        ],
      },
      finalisedAt,
    );
    const year = pkg.record.taxYears[0];
    const partVText = pkg.record.authoredDocuments
      .filter((doc) => doc.kind === "partVStatement")
      .flatMap((doc) => doc.lines)
      .join(" ");

    expect(year.partVRows.map((row) => [row.category, row.amountCents])).toEqual([
      ["contribution", 100_00],
      ["distribution", -20_00],
      ["loan_from_owner", 200_00],
      ["loan_to_owner", -50_00],
      ["contribution", 150_00],
    ]);
    expect(year.partVTotalCents).toBe(520_00);
    expect(year.line1f).toBe(520);
    expect(partVText).toContain("State filing fee, paid from my personal funds");
    expect(partVText).toContain(
      "During tax year 2025, I paid $150.00 of state filing fees for Example Holdings LLC from my personal funds. This amount is a capital contribution to the LLC.",
    );
    expect(partVText).not.toMatch(/paid personally by owner|entered by customer/i);
    expect(partVText).toContain("Loans from Foreign Owner to LLC");
    expect((await runPreflight(pkg.record, pkg.bytes)).failures).toEqual([]);
  }, PDF_TIMEOUT);

  it("dates synthesized Part V contribution totals on the final short year's actual period end", async () => {
    const pkg = await generatePackage(
      {
        ...F1,
        taxYears: [2026],
        isFinalReturn: true,
        dissolvedAt: new Date("2026-06-15T00:00:00.000Z"),
        yearData: [
          {
            ...F1.yearData[0],
            taxYear: 2026,
            contributions: 500,
            distributions: 0,
            reportableTransactions: [],
            ownerPaidCosts: [],
            zeroConfirmations: { distributions: true, loansFromOwner: true, loansToOwner: true, ownerPaidCosts: true },
          },
        ],
      },
      finalisedAt,
    );
    const year = pkg.record.taxYears[0];

    expect(year.partVRows).toContainEqual(expect.objectContaining({
      category: "contribution",
      date: "2026-06-15",
      amountCents: 500_00,
    }));
    expect(year.partVRows.some((row) => row.date === "2026-12-31")).toBe(false);
    expect(year.line1f).toBe(500);
    expect(year.line1h).toBe(500);
    expect((await runPreflight(pkg.record, pkg.bytes)).failures.filter((failure) => failure.id === "A13")).toEqual([]);
  }, PDF_TIMEOUT);

  it("uses explicit Part V category rows instead of double-counting stored totals", async () => {
    const pkg = await generatePackage(
      {
        ...F1,
        yearData: [
          {
            ...F1.yearData[0],
            contributions: 999,
            distributions: 888,
            reportableTransactions: [
              { date: "2025-01-10", description: "Owner contribution", amountCents: 100_00, category: "contribution" },
              { date: "2025-02-10", description: "Owner distribution", amountCents: -20_00, category: "distribution" },
            ],
            ownerPaidCosts: [],
            zeroConfirmations: {},
          },
        ],
      },
      finalisedAt,
    );
    const year = pkg.record.taxYears[0];

    expect(year.partVRows.map((row) => [row.category, row.amountCents])).toEqual([
      ["contribution", 100_00],
      ["distribution", -20_00],
    ]);
    expect(year.line1f).toBe(120);
  }, PDF_TIMEOUT);

  it("C-03 uses the exact cover letter phrase and removes timeliness wording", async () => {
    const pkg = await generatePackage(F5, finalisedAt);
    const cover = pkg.record.authoredDocuments.find((doc) => doc.kind === "coverLetter");
    expect(cover?.lines.slice(0, 4)).toEqual([...IRS_MAIL_ADDRESS_DISPLAY_LINES]);
    // Generator 2.3.0: the cover letter closes "Signed:" — never under
    // penalties of perjury (that heading stays on the statements only).
    expect(COVER_LETTER_CLOSING).toBe("Signed:");
    expect(cover?.lines).toContain("Signed:");
    expect(cover?.lines).not.toContain("Sincerely,");
    expect(cover?.lines).not.toContain(AUTHORED_DOC_SIGNATURE_HEADING);
    expect(cover?.lines.join(" ")).not.toMatch(/penalties of perjury/i);
    expect(cover?.lines).toContain(SIGNER_TITLE);
    const text = cover?.lines.join("\n") ?? "";
    expect(text).toContain(COVER_LETTER_ENCLOSURE_PHRASE);
    expect(text).not.toMatch(/Form 5472 with attached pro forma/i);
    expect(text).not.toMatch(/\b(timely|late|delinquent|DIIRSP)\b/i);
  }, PDF_TIMEOUT);

  it("formats singular and plural cover letter tax year wording", async () => {
    const single = await generatePackage(F2, finalisedAt);
    const singleText = single.record.authoredDocuments.find((doc) => doc.kind === "coverLetter")?.lines.join(" ") ?? "";
    expect(singleText).toContain("Tax year: 2025");
    expect(singleText).toContain("covers tax year 2025.");
    expect(singleText).not.toContain("Tax year(s)");
    expect(singleText).not.toContain("tax year(s)");

    const multi = await generatePackage(F5, finalisedAt);
    const multiText = multi.record.authoredDocuments.find((doc) => doc.kind === "coverLetter")?.lines.join(" ") ?? "";
    expect(multiText).toContain("Tax years: 2022, 2023 and 2024");
    expect(multiText).toContain("covers tax years 2022, 2023 and 2024.");
    expect(multiText).not.toContain("Tax year(s)");
    expect(multiText).not.toContain("tax year(s)");
  }, PDF_TIMEOUT);

  it.each([
    [2024, "topmostSubform[0].Page1[0].f1_52[0]"],
    [2025, "topmostSubform[0].Page1[0].SignHere-ReadOrder[0].f1_58[0]"],
  ])("keeps the %s signer title inside the measured Title column", async (year, fieldName) => {
    const pdf = await PDFDocument.load(
      await fs.readFile(path.join(process.cwd(), `public/forms/f1120--${year}.pdf`)),
    );
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bounds = deriveSignerTitleColumnBounds(pdf, year);
    const placement = signerTitleStampPlacement(bounds, font, SIGNER_TITLE);

    expect(bounds.measuredField).toBe(fieldName);
    expect(bounds.left).toBe(324);
    expect(bounds.right).toBeCloseTo(460.8, 5);
    expect(placement.x).toBeGreaterThan(bounds.left);
    expect(placement.x + placement.width).toBeLessThan(bounds.right);
  }, PDF_TIMEOUT);

  it("F1, F2, F4 pass with zero failures", async () => {
    for (const filing of [F1, F2, F4]) {
      const pkg = await generatePackage(filing, finalisedAt);
      expect((await runPreflight(pkg.record, pkg.bytes)).failures).toEqual([]);
    }
  }, PDF_TIMEOUT);

  it("F3, F5, F7 pass Wave 1 assertions", async () => {
    for (const filing of [F3, F5, F7]) {
      const pkg = await generatePackage(filing, finalisedAt);
      expect((await runPreflight(pkg.record, pkg.bytes)).failures).toEqual([]);
    }
  }, PDF_TIMEOUT);

  it("G-05 records the actual Form 1120 revision used by tax year", async () => {
    const pkg = await generatePackage(F5, finalisedAt);
    expect(pkg.record.taxYears.map((year) => [year.taxYear, year.form1120Revision, year.shortYearException])).toEqual([
      [2022, "2022", false],
      [2023, "2023", false],
      [2024, "2024", false],
    ]);
  }, PDF_TIMEOUT);

  it("G-05 supports 2018 and 2019 Form 1120 revisions without the short-year fallback", async () => {
    const pkg = await generatePackage(F8, finalisedAt);
    const preflight = await runPreflight(pkg.record, pkg.bytes);

    expect(preflight.failures.filter((failure) => failure.id === "A08")).toEqual([]);
    expect(pkg.record.taxYears.map((year) => [year.taxYear, year.form1120Revision, year.shortYearException])).toEqual([
      [2018, "2018", false],
      [2019, "2019", false],
    ]);
    expect(pkg.record.taxYears[0].form1120.fields).toContainEqual({
      form: "1120-2018",
      field: form1120_2018FieldMap.D_totalAssetsCents,
      value: "00",
    });
  }, PDF_TIMEOUT);

  // The prior-revision form prints the PREVIOUS year after "tax year
  // beginning", so this one case keeps MM/DD/YYYY (rules doc, Form 1120).
  it("G-05 allows the documented short-year prior-revision exception", async () => {
    const pkg = await generatePackage(
      {
        ...F3,
        llcDateIncorporated: new Date("2026-03-10T00:00:00.000Z"),
        dissolvedAt: new Date("2026-09-30T00:00:00.000Z"),
        taxYears: [2026],
        extensionFiled: "yes",
        extensionTransmittedAt: new Date("2026-07-10T00:00:00.000Z"),
        yearData: [
          {
            ...F3.yearData[0],
            taxYear: 2026,
            reportableTransactions: [
              { date: "2026-03-10", description: "Initial funding", amountCents: 1_000_00, category: "contribution" },
            ],
          },
        ],
      },
      finalisedAt,
    );

    expect(pkg.record.taxYears[0].form1120Revision).toBe("2025");
    expect(pkg.record.taxYears[0].shortYearException).toBe(true);
    expect(pkg.record.taxYears[0].form1120.fields).toContainEqual({
      form: "1120-2026",
      field: form1120_2025FieldMap.taxYearBeginning,
      value: "03/10/2026",
    });
  }, PDF_TIMEOUT);

  it("G-10 routes multi-related-party counts to review", () => {
    expect(() => assertRelatedPartyCount(1)).not.toThrow();
    expect(() => assertRelatedPartyCount(2)).toThrow(NeedsReviewError);
    expect(() => assertRelatedPartyCount(2)).toThrow("More than one related party: route to a reviewer.");
  });

  it("G-10 routes F9's stored member count to review during generation", async () => {
    await expect(generatePackage(F9, finalisedAt)).rejects.toThrow(NeedsReviewError);
  }, PDF_TIMEOUT);

  it("routes malformed transaction and non-cash transfer rows to review with the tax year named", () => {
    expect(() =>
      filingToPackageInput({
        ...F1,
        yearData: [
          {
            ...F1.yearData[0],
            reportableTransactions: [{ date: "2025-01-01", amountCents: "bad", category: "contribution" }],
          },
        ],
      }),
    ).toThrow("Tax year 2025: reportable transaction row 1 is malformed.");

    expect(() =>
      filingToPackageInput({
        ...F1,
        yearData: [
          {
            ...F1.yearData[0],
            nonCashTransfers: [{ date: "2025-01-01", direction: "in" }],
          },
        ],
      }),
    ).toThrow("Tax year 2025: non-cash transfer row 1 is malformed.");
  });

  it("keeps pre-wave mapper defaults for llcCountry and isFinalReturn", () => {
    const mapped = filingToPackageInput({
      ...F1,
      llcCountry: null,
      isFinalReturn: null,
    });

    expect(mapped.llcCountry).toBe("");
    expect(mapped.isFinalReturn).toBe(false);
  });

  it("G-09 checks Part VI, adds a statement, and counts non-cash value once", async () => {
    const pkg = await generatePackage(F5, finalisedAt);
    const year2022 = pkg.record.taxYears.find((year) => year.taxYear === 2022);
    expect(year2022?.form5472.fields).toContainEqual({
      form: "5472-2022",
      field: form5472FieldMap.partVI_attachedStatementBox,
      value: true,
    });
    expect(year2022?.line1f).toBe(25_000);
    expect(year2022?.partVTotalRounded).toBe(0);
    expect(pkg.record.authoredDocuments.some((doc) => doc.kind === "partVIStatement" && doc.taxYear === 2022)).toBe(true);
  }, PDF_TIMEOUT);

  it("C-04 describes only supported operations facts in the reasonable-cause statement", async () => {
    const pkg = await generatePackage(F5, finalisedAt);
    const rcsText = pkg.record.authoredDocuments
      .filter((doc) => doc.kind === "reasonableCauseStatement")
      .flatMap((doc) => doc.lines)
      .join(" ");

    expect(rcsText).toContain("The Company's business activity is Investment holding.");
    expect(rcsText).toContain(
      "no U.S. income tax return was required, and U.S. tax on that U.S.-source income was satisfied by withholding at source",
    );
    expect(rcsText).not.toMatch(/\b(dividends|dormant|no customers|no vendors|did not operate with customers or vendors)\b/i);
  }, PDF_TIMEOUT);

  it("never renders the customer's own explanation or the legacy narrative (rules doc H4)", async () => {
    const pkg = await generatePackage(F5, finalisedAt);
    const statements = pkg.record.authoredDocuments.filter((doc) => doc.kind === "reasonableCauseStatement");
    expect(statements.map((d) => d.taxYear)).toEqual([2022, 2023, 2024]);
    const everything = pkg.record.authoredDocuments.flatMap((doc) => doc.lines).join(" ");
    for (const year of F5.yearData) {
      for (const customer of [year.rcsWhyMissed, year.rcsWhenLearned]) {
        expect(everything).not.toContain(customer!.slice(10, 60));
      }
    }
    expect(everything).not.toContain(F5.reasonableCauseNarrative!.slice(10, 60));
    expect(everything).not.toMatch(/promptly arranged|arranged for|qualified assistance/i);
    for (const doc of statements) {
      expect(doc.rcsMissingAnswers).toBe(false);
      expect(doc.rcsFallbackUsed).toBe(false);
      expect(doc.rcsNarrativeSource).toBe("admin");
    }
  }, PDF_TIMEOUT);

  it("keeps a state that shares the city's name in the joined city line", async () => {
    const pkg = await generatePackage({ ...F1, llcCity: "New York", llcState: "New York", llcZip: "10001" }, finalisedAt);
    const line = pkg.record.taxYears[0].form5472.fields.find((w) => w.field === form5472FieldMap["1_cityStateZip"])?.value;
    expect(line).toBe("New York, New York 10001, USA");
  }, PDF_TIMEOUT);

  it("uses structured owner address parts once when the LLC uses the owner's address", async () => {
    const pkg = await generatePackage(F7, finalisedAt);
    const year = pkg.record.taxYears[0];
    const street1120 = year.form1120.fields.find((write) => write.field === form1120_2025FieldMap["1_street"])?.value;
    const city1120 = year.form1120.fields.find((write) => write.field === form1120_2025FieldMap["1_city"])?.value;
    const state1120 = year.form1120.fields.find((write) => write.field === form1120_2025FieldMap["1_state"])?.value;
    const zip1120 = year.form1120.fields.find((write) => write.field === form1120_2025FieldMap["1_zip"])?.value;
    const country1120 = year.form1120.fields.find((write) => write.field === form1120_2025FieldMap["1_country"])?.value;
    const street5472 = year.form5472.fields.find((write) => write.field === form5472FieldMap["1_street"])?.value;
    const city5472 = year.form5472.fields.find((write) => write.field === form5472FieldMap["1_cityStateZip"])?.value;

    expect(street1120).toBe(F7.ownerAddressStreet);
    expect(street5472).toBe(F7.ownerAddressStreet);
    expect(city1120).toBe(F7.ownerAddressCity);
    expect(state1120).toBe(F7.ownerAddressState);
    expect(zip1120).toBe(F7.ownerAddressPostal);
    expect(country1120).toBe(F7.ownerAddressCountry);
    expect(street1120).not.toBe(F7.ownerAddress);
    expect(street5472).not.toBe(F7.ownerAddress);
    expect(city5472).toContain(F7.ownerAddressCity!);
    expect(city5472).toContain(F7.ownerAddressState!);
    expect(city5472).toContain(F7.ownerAddressPostal!);
    expect(city5472).toContain(F7.ownerAddressCountry!);
  }, PDF_TIMEOUT);

  it("C-05 orders F5 pages per tax year", async () => {
    const pkg = await generatePackage(F5, finalisedAt);
    expect(pkg.record.pageOrder.map((page) => [page.label, page.taxYear ?? null])).toEqual([
      ["Cover letter", null],
      ["Form 1120", 2022],
      ["Form 5472", 2022],
      ["Part V Statement", 2022],
      ["Part VI Statement", 2022],
      ["Reasonable Cause Statement", 2022],
      ["Form 1120", 2023],
      ["Form 5472", 2023],
      ["Part V Statement", 2023],
      ["Reasonable Cause Statement", 2023],
      ["Form 1120", 2024],
      ["Form 5472", 2024],
      ["Part V Statement", 2024],
      ["Reasonable Cause Statement", 2024],
    ]);
  }, PDF_TIMEOUT);

  it("C-06 uses the configured signature heading on every authored statement (not the cover letter)", async () => {
    const pkg = await generatePackage(F5, finalisedAt);
    const byKind = new Map(pkg.record.authoredDocuments.map((doc) => [doc.kind, doc]));
    expect(byKind.get("coverLetter")?.lines).not.toContain(AUTHORED_DOC_SIGNATURE_HEADING);
    for (const kind of ["partVStatement", "partVIStatement", "reasonableCauseStatement"] as const) {
      expect(byKind.get(kind)?.lines).toContain(AUTHORED_DOC_SIGNATURE_HEADING);
    }
  }, PDF_TIMEOUT);

  it.each([
    [2018, form1120_2018FieldMap],
    [2019, form1120_2019FieldMap],
    [2020, form1120_2020FieldMap],
    [2021, form1120_2021FieldMap],
    [2022, form1120_2022FieldMap],
    [2023, form1120_2023FieldMap],
    [2024, form1120_2024FieldMap],
    [2025, form1120_2025FieldMap],
  ] as const)("uses one font size for Form 1120 header name, street, and city lines in %s", async (taxYear, map) => {
    const pkg = await generatePackage(
      {
        ...F1,
        taxYears: [taxYear],
        llcDateIncorporated: new Date("2015-01-01T00:00:00.000Z"),
        yearData: [
          {
            ...F1.yearData[0],
            taxYear,
            reportableTransactions: [
              { date: `${taxYear}-01-10`, description: "Contribution", amountCents: 100_00, category: "contribution" },
            ],
          },
        ],
      },
      finalisedAt,
    );
    const fields = pkg.record.taxYears[0].form1120.fields as Array<{ field: string; fontSize?: number }>;
    const fontSizeFor = (field: string) => fields.find((write) => write.field === field)?.fontSize;
    const expected = pkg.record.llcPrintAddress.fontSize;

    if ("1_street" in map) {
      for (const field of [map["1a_name"], map["1_street"], map["1_city"], map["1_state"], map["1_country"], map["1_zip"]]) {
        expect(fontSizeFor(field), field).toBe(expected);
      }
    } else {
      for (const field of [map["1a_name"], map["1_streetSuite"], map["1_cityStateCountryZip"]]) {
        expect(fontSizeFor(field), field).toBe(expected);
      }
    }
  }, PDF_TIMEOUT);

  it("G-12 keeps filing-package literals out of generatePackage.ts", async () => {
    const source = await fs.readFile(path.join(process.cwd(), "src/lib/pdf/generatePackage.ts"), "utf8");
    for (const literal of ["Sole Member", "Signed under penalties of perjury", "855-887-7737", "Rulon White"]) {
      expect(source).not.toContain(literal);
    }
  });
});

describe("reasonable cause statement prose dates", () => {
  it("writes the formation date as a long date, not ISO", async () => {
    const { F5 } = await import("./__fixtures__/filings");
    const { generatePackage } = await import("./generatePackage");
    const result = await generatePackage(F5 as never);
    const rcsLines = result.record.authoredDocuments
      .filter((d) => d.kind === "reasonableCauseStatement")
      .flatMap((d) => d.lines)
      .join(" ");
    expect(rcsLines.length).toBeGreaterThan(0);
    expect(rcsLines).toContain("January 1, 2020");
    expect(rcsLines).not.toMatch(/\b\d{4}-\d{2}-\d{2}\b/);
  }, PDF_TIMEOUT);
});

// Regressions from the independent review of a real 3-year Hong Kong package
// generated 2026-10-05 (generator 2.1.0). F10 mirrors that filing's shape.
describe("2026-10-05 review package (F10)", () => {
  const textOf = (pkg: Awaited<ReturnType<typeof generatePackage>>, kind: string, taxYear?: number) =>
    pkg.record.authoredDocuments
      .filter((doc) => doc.kind === kind && (taxYear === undefined || doc.taxYear === taxYear))
      .flatMap((doc) => doc.lines)
      .join(" ");
  const write = (fields: { field: string; value: string | true }[], field: string) =>
    fields.find((w) => w.field === field) as ({ field: string; value: string; fontSize?: number } | undefined);

  it("prints 'Name, address' on one fitted line in Form 5472 lines 4a and 8a", async () => {
    const pkg = await generatePackage(F10, reviewFinalisedAt);
    // Region "Hong Kong" repeats the country, so it is printed once.
    const expected = "Mei Ling Example, Example House, Sample Court, Yau Tong, Kowloon, Hong Kong";
    const font = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
    for (const year of pkg.record.taxYears) {
      for (const field of [form5472FieldMap["4a_nameAddress"], form5472FieldMap["8a_nameAddress"]]) {
        const w = write(year.form5472.fields, field);
        expect(w?.value).toBe(expected);
        expect(w?.value).not.toContain("\n");
        // Inside the 540pt-wide field at the recorded size.
        expect(drawnTextWidth(font, expected, pkg.record.ownerPrintAddress.fontSize)).toBeLessThanOrEqual(usableFieldWidth(540));
      }
    }
    expect(pkg.record.ownerPrintAddress.fontSize).toBeGreaterThanOrEqual(6);
    expect(pkg.record.ownerPrintAddress.failures).toEqual([]);
  }, PDF_TIMEOUT);

  it("shrinks an over-long 8a line below the minimum to stay inside the field and fails R02", async () => {
    const pkg = await generatePackage(
      {
        ...F10,
        ownerName: "Maximilian Alexander Konstantin von Hohenzollern-Sigmaringen",
        ownerAddressStreet:
          "Flat 4512, Tower 7, The Grand Harbour Residences Phase III, 88 Extraordinarily Long Waterfront Promenade Road North Extension",
      },
      reviewFinalisedAt,
    );
    const font = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
    const line = write(pkg.record.taxYears[0].form5472.fields, form5472FieldMap["8a_nameAddress"])?.value ?? "";
    expect(pkg.record.ownerPrintAddress.fontSize).toBeLessThan(6);
    expect(drawnTextWidth(font, line, pkg.record.ownerPrintAddress.fontSize)).toBeLessThanOrEqual(usableFieldWidth(540));
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    expect(preflight.failures.filter((f) => f.id === "R02").map((f) => f.message)).toEqual(
      expect.arrayContaining([expect.stringContaining("Form 5472 line 8a cannot fit its text at 6pt")]),
    );
  }, PDF_TIMEOUT);

  it("stamps exactly 'Foreign-owned U.S. DE' and never DIIRSP", async () => {
    for (const filing of [F10, F10NoExtension, F5, F8]) {
      const pkg = await generatePackage(filing, reviewFinalisedAt);
      for (const year of pkg.record.taxYears) {
        expect(year.form1120.stampedTexts[0]).toBe("Foreign-owned U.S. DE");
      }
      const everything = [
        ...pkg.record.taxYears.flatMap((year) => year.form1120.stampedTexts),
        ...pkg.record.authoredDocuments.flatMap((doc) => doc.lines),
      ].join(" ");
      expect(everything).not.toMatch(/DIIRSP|Delinquent International Information Return/i);
      expect((await runPreflight(pkg.record, pkg.bytes)).failures.filter((f) => f.id === "A31")).toEqual([]);
    }
  }, PDF_TIMEOUT * 2);

  it("treats the extended latest year as timely: no RCS page, no late wording", async () => {
    const pkg = await generatePackage(F10, reviewFinalisedAt);
    expect(pkg.record.taxYears.map((y) => [y.taxYear, y.status, y.reasonableCauseIncluded])).toEqual([
      [2023, "late", true],
      [2024, "late", true],
      [2025, "timely", false],
    ]);
    expect(pkg.record.pageOrder.some((p) => p.label === "Reasonable Cause Statement" && p.taxYear === 2025)).toBe(false);
    expect(pkg.record.authoredDocuments.filter((d) => d.kind === "reasonableCauseStatement").map((d) => d.taxYear)).toEqual([
      2023, 2024,
    ]);
    expect(textOf(pkg, "coverLetter")).not.toMatch(/\b(late|delinquen\w*|timely)\b/i);
    expect((await runPreflight(pkg.record, pkg.bytes)).failures).toEqual([]);
  }, PDF_TIMEOUT);

  it("treats the latest year as late without an extension", async () => {
    const pkg = await generatePackage(F10NoExtension, reviewFinalisedAt);
    expect(pkg.record.taxYears.map((y) => [y.taxYear, y.status])).toEqual([
      [2023, "late"],
      [2024, "late"],
      [2025, "late"],
    ]);
    expect(pkg.record.pageOrder.some((p) => p.label === "Reasonable Cause Statement" && p.taxYear === 2025)).toBe(true);
    expect((await runPreflight(pkg.record, pkg.bytes)).failures).toEqual([]);
  }, PDF_TIMEOUT);

  it("decides lateness from the injected finalisedAt, day-inclusive at the extended due date", async () => {
    // 2025 + valid Form 7004: due Thursday 2026-10-15; late from 2026-10-16.
    const onDueDate = await generatePackage(F10, new Date("2026-10-15T23:00:00.000Z"));
    expect(onDueDate.record.taxYears.find((y) => y.taxYear === 2025)?.status).toBe("timely");
    const dayAfter = await generatePackage(F10, new Date("2026-10-16T00:00:00.000Z"));
    expect(dayAfter.record.taxYears.find((y) => y.taxYear === 2025)?.status).toBe("late");
    // Without the extension 2025 is due 2026-04-15: timely on that day, late the next.
    const noExtOnTime = await generatePackage(F10NoExtension, new Date("2026-04-15T12:00:00.000Z"));
    expect(noExtOnTime.record.taxYears.find((y) => y.taxYear === 2025)?.status).toBe("timely");
  }, PDF_TIMEOUT * 2);

  it("writes the Hong Kong permanent-resident and no-U.S.-income facts into the RCS", async () => {
    const pkg = await generatePackage(F10, reviewFinalisedAt);
    const rcs = textOf(pkg, "reasonableCauseStatement", 2023);
    // Generator 2.3.0: first person, never "the Owner".
    expect(rcs).toContain("I am a Hong Kong permanent resident.");
    expect(rcs).not.toMatch(/citizen of Hong Kong|resident and citizen/);
    expect(rcs).toContain(
      "The Company had no U.S.-source income in tax year 2023, and no U.S. income tax was due or withheld for that year.",
    );
    // The admin narrative renders; the customer's preset (third person) does not.
    expect(rcs).toContain("I did not know that a foreign-owned single-member LLC must file Form 5472");
    expect(rcs).not.toContain("The Owner was not aware");
    expect(rcs).not.toMatch(/the Owner/i);
  }, PDF_TIMEOUT);

  it("adds the no-U.S.-income facts only when the intake supports them", async () => {
    const unknown = await generatePackage({ ...F10, hasUsSourceIncome: null }, reviewFinalisedAt);
    expect(textOf(unknown, "reasonableCauseStatement")).not.toContain("no U.S.-source income");
    const trading = await generatePackage(
      { ...F10, yearData: F10.yearData.map((y) => ({ ...y, otherTransactionsNote: "Stripe payouts from customers" })) },
      reviewFinalisedAt,
    );
    const tradingText = textOf(trading, "reasonableCauseStatement", 2023);
    expect(tradingText).toContain("The Company had no U.S.-source income in tax year 2023, and no U.S. income tax was withheld for that year.");
    expect(tradingText).not.toContain("was due");
    const withIncome = await generatePackage(F5, reviewFinalisedAt);
    expect(textOf(withIncome, "reasonableCauseStatement")).not.toContain("no U.S.-source income");
  }, PDF_TIMEOUT * 2);

  it("prints one clear sentence for a $0 Part V year", async () => {
    const pkg = await generatePackage(F10, reviewFinalisedAt);
    const text = textOf(pkg, "partVStatement", 2024);
    expect(text).toContain(
      "There were no reportable transactions between me and Example Harbour Software LLC during tax year 2024.",
    );
    expect(text).toContain("Form 5472 lines 1f and 1h: $0.");
    expect(text).not.toMatch(/These transactions include|Total Part V Rows|Total Reportable Transactions|Other than the transactions described above/);
  }, PDF_TIMEOUT);

  it("keeps each Part V heading above the table and total it labels", async () => {
    const pkg = await generatePackage(F1, finalisedAt);
    const lines = pkg.record.authoredDocuments.find((d) => d.kind === "partVStatement")?.lines ?? [];
    const at = (needle: string) => lines.findIndex((line) => line.startsWith(needle));
    expect(at("Capital Contributions from Foreign Owner")).toBeLessThan(at("Total Capital Contributions"));
    expect(at("Distributions to Foreign Owner")).toBeLessThan(at("Total Distributions"));
    expect(at("Total Reportable Transactions (Part V)")).toBeLessThan(at("Total Part V reportable transactions"));
    expect(at("Total Distributions")).toBeLessThan(at("Total Reportable Transactions (Part V)"));
  }, PDF_TIMEOUT);

  it("title-cases the lower-case city everywhere it prints", async () => {
    const pkg = await generatePackage(F10, reviewFinalisedAt);
    const y2023 = pkg.record.taxYears.find((y) => y.taxYear === 2023)!;
    const y2025 = pkg.record.taxYears.find((y) => y.taxYear === 2025)!;
    expect(write(y2023.form1120.fields, form1120_2023FieldMap["1_cityStateCountryZip"])?.value).toBe(
      "Kowloon, Hong Kong",
    );
    expect(write(y2025.form1120.fields, form1120_2025FieldMap["1_city"])?.value).toBe("Kowloon");
    expect(write(y2023.form5472.fields, form5472FieldMap["1_cityStateZip"])?.value).toBe("Kowloon, Hong Kong");
    expect(pkg.record.ownerPrintAddress.value).toContain("Kowloon");
    const all = [
      ...pkg.record.taxYears.flatMap((y) => [...y.form1120.fields, ...y.form5472.fields]).map((w) => String(w.value)),
      ...pkg.record.authoredDocuments.flatMap((d) => d.lines),
    ].join(" ");
    expect(all).not.toContain("kowloon");
  }, PDF_TIMEOUT);

  it("raises the three customer-data warnings without failing pre-flight", async () => {
    const pkg = await generatePackage(F10, reviewFinalisedAt);
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    expect(preflight.failures).toEqual([]);
    const ids = preflight.warnings.map((w) => w.id);
    expect(ids).toEqual(expect.arrayContaining(["W31", "W32", "W33"]));
    expect(preflight.warnings.find((w) => w.id === "W31")?.message).toContain("Hong Kong: HKID number");
    expect(preflight.warnings.find((w) => w.id === "W32")?.message).toContain("Example House, Sample Court, Yau Tong");
    expect(preflight.warnings.filter((w) => w.id === "W33").map((w) => w.message)).toEqual([
      expect.stringContaining("Tax year 2023 includes the LLC's formation date"),
    ]);
  }, PDF_TIMEOUT);
});

// ─────────────────────────────────────────────────────────────────────────────
// Generator 2.3.0 — docs/reviews/2026-10-13-preflight-generator-spec.md items
// 3-9, rules doc H1-H10. F11 is the synthetic two-year late catch-up fixture.
// ─────────────────────────────────────────────────────────────────────────────
describe("generator 2.3.0: preflight-generator spec", () => {
  type Pkg = Awaited<ReturnType<typeof generatePackage>>;
  const docText = (pkg: Pkg, kind: string, taxYear?: number) =>
    pkg.record.authoredDocuments
      .filter((doc) => doc.kind === kind && (taxYear === undefined || doc.taxYear === taxYear))
      .flatMap((doc) => doc.lines)
      .join(" ");
  const rcsLines = (pkg: Pkg, taxYear: number) =>
    pkg.record.authoredDocuments.find((d) => d.kind === "reasonableCauseStatement" && d.taxYear === taxYear)?.lines ?? [];
  // The cause section: everything between the "2." and "3." headings.
  const causeSection = (pkg: Pkg, taxYear: number) => {
    const lines = rcsLines(pkg, taxYear);
    return lines.slice(lines.indexOf("2. Cause of the Delinquency") + 1, lines.indexOf("3. Filing History and Notice Status")).join(" ");
  };
  const count = (text: string, needle: RegExp) => (text.match(needle) ?? []).length;
  const VOICE_BANS: Array<[string, RegExp]> = [
    ["the Owner", /the Owner/gi],
    ["I prepared", /I prepared/gi],
    ["arranged for", /arranged for/gi],
    ["qualified assistance", /qualified assistance/gi],
    ["entered by customer", /entered by customer/gi],
  ];
  const expectOwnerVoice = (text: string) => {
    for (const [label, pattern] of VOICE_BANS) expect(count(text, pattern), label).toBe(0);
  };
  const withYear = (filing: typeof F11, taxYear: number, patch: Partial<(typeof F11)["yearData"][number]>) => ({
    ...filing,
    yearData: filing.yearData.map((y) => (y.taxYear === taxYear ? { ...y, ...patch } : y)),
  });
  // Synthetic house preparer — never real preparer data.
  const PREPARER_ENV = {
    HOUSE_PREPARER_NAME: "Pat Q. Synthetic",
    HOUSE_PREPARER_PTIN: "P00000001",
    HOUSE_PREPARER_FIRM_NAME: "Synthetic Preparer Firm LLC",
    HOUSE_PREPARER_FIRM_EIN: "00-0000001",
    HOUSE_PREPARER_FIRM_ADDRESS: "1 Synthetic Way, Example City, ST 00000",
    HOUSE_PREPARER_PHONE: "555-0100",
  };

  // ── Item 3: customer text never renders; only the admin narrative does ──
  it("item 3: customer text and no admin narrative -> no cause narrative, record marks it missing, pre-flight fails", async () => {
    const filing = withYear(F11, 2024, { rcsAdminNarrative: null });
    const pkg = await generatePackage(filing, lateCatchUpFinalisedAt);
    const all = pkg.record.authoredDocuments.flatMap((d) => d.lines).join(" ");
    for (const phrase of ["Could you please review", "My objective", "minimal cost", "learned about it from a friend"]) {
      expect(all).not.toContain(phrase);
    }
    // The cause section prints no narrative at all: only the structured facts.
    expect(causeSection(pkg, 2024)).toBe(
      "The Company had no U.S.-source income in tax year 2024, and no U.S. income tax was due or withheld for that " +
        `year. ${SMALL_CORPORATION_PARAGRAPH}`,
    );
    const doc = pkg.record.authoredDocuments.find((d) => d.kind === "reasonableCauseStatement" && d.taxYear === 2024)!;
    expect(doc.rcsMissingAnswers).toBe(true);
    expect(doc.rcsNarrativeSource).toBeNull();
    const year = pkg.record.taxYears.find((y) => y.taxYear === 2024)!;
    expect(year.rcs?.narrativeSource).toBeNull();
    expect(year.rcs?.narrative).toBeNull();
    // Customer explanation is on the record for the admin/pre-flight only.
    expect(year.rcs?.customerExplanation.whyMissed).toBe(CUSTOMER_INTAKE_TEXT);
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    expect(preflight.failures).toContainEqual({ id: "A26", message: "Reasonable cause answers missing for 2024." });
  }, PDF_TIMEOUT);

  it("item 3: an admin narrative renders as the only cause narrative", async () => {
    const pkg = await generatePackage(F11, lateCatchUpFinalisedAt);
    const cause = causeSection(pkg, 2024);
    expect(cause.startsWith("I formed the LLC through an online formation service and relied on it for the state requirements.")).toBe(true);
    // Two admin paragraphs render as two paragraphs, in order.
    expect(cause).toContain("No one told me that a foreign-owned single-member LLC must file Form 5472");
    expect(cause).not.toContain("Could you");
    expect(pkg.record.taxYears.find((y) => y.taxYear === 2024)?.rcs?.narrative).toBe(
      "I formed the LLC through an online formation service and relied on it for the state requirements.\n\n" +
        "No one told me that a foreign-owned single-member LLC must file Form 5472 with a pro forma Form 1120 " +
        "each year, even when it has no income.",
    );
    expect((await runPreflight(pkg.record, pkg.bytes)).failures).toEqual([]);
  }, PDF_TIMEOUT);

  // ── Item 4: one RCS per late year, "not sure" = no extension ──
  it("item 4: two late years -> two statements, each after its own Part V statement; later year says still unaware", async () => {
    const pkg = await generatePackage(F11, lateCatchUpFinalisedAt);
    expect(pkg.record.taxYears.map((y) => [y.taxYear, y.status, y.reasonableCauseIncluded])).toEqual([
      [2024, "late", true],
      [2025, "late", true],
    ]);
    expect(pkg.record.lateYears).toEqual([2024, 2025]);
    expect(pkg.record.pageOrder.map((p) => [p.label, p.taxYear ?? null])).toEqual([
      ["Cover letter", null],
      ["Form 1120", 2024],
      ["Form 5472", 2024],
      ["Part V Statement", 2024],
      ["Reasonable Cause Statement", 2024],
      ["Form 1120", 2025],
      ["Form 5472", 2025],
      ["Part V Statement", 2025],
      ["Reasonable Cause Statement", 2025],
    ]);
    const y2025 = pkg.record.taxYears.find((y) => y.taxYear === 2025)!;
    expect(y2025.extensionFiled).toBe("not_sure");
    expect(y2025.extensionUnclear).toBe(true);
    expect(y2025.dueDate).toBe("2026-04-15");
    expect(y2025.rcs?.stillUnaware).toEqual({ needed: true, rendered: true });
    expect(docText(pkg, "reasonableCauseStatement", 2025)).toContain(
      "I remained unaware of the requirement when the 2025 return was due on April 15, 2026.",
    );
    // The first late year never carries the sentence.
    expect(pkg.record.taxYears[0].rcs?.stillUnaware).toEqual({ needed: false, rendered: false });
    expect(docText(pkg, "reasonableCauseStatement", 2024)).not.toContain("I remained unaware");
    // Each statement uses its own year's narrative.
    expect(docText(pkg, "reasonableCauseStatement", 2025)).toContain("I still did not know about the Form 5472 requirement during 2025.");
    expect(docText(pkg, "reasonableCauseStatement", 2025)).not.toContain("online formation service");
  }, PDF_TIMEOUT);

  it("item 4: no 'still unaware' sentence when rcsLearnedOn is missing or on/before the due date", async () => {
    const missing = await generatePackage(withYear(F11, 2025, { rcsLearnedOn: null }), lateCatchUpFinalisedAt);
    expect(missing.record.taxYears[1].rcs?.stillUnaware).toEqual({ needed: true, rendered: false });
    expect(docText(missing, "reasonableCauseStatement", 2025)).not.toContain("I remained unaware");
    const onDueDate = await generatePackage(withYear(F11, 2025, { rcsLearnedOn: new Date("2026-04-15T00:00:00.000Z") }), lateCatchUpFinalisedAt);
    expect(onDueDate.record.taxYears[1].rcs?.learnedOn).toBe("2026-04-15");
    expect(onDueDate.record.taxYears[1].rcs?.stillUnaware.rendered).toBe(false);
  }, PDF_TIMEOUT * 2);

  it("item 4: a 'not sure' extension year before its original due date stays timely", async () => {
    const pkg = await generatePackage(F11, new Date("2026-04-15T12:00:00.000Z"));
    expect(pkg.record.taxYears.map((y) => [y.taxYear, y.status])).toEqual([
      [2024, "late"],
      [2025, "timely"],
    ]);
    expect(pkg.record.taxYears[1].extensionUnclear).toBe(true);
  }, PDF_TIMEOUT);

  // ── Item 5: first-person RCS, exact wording, conditional sentences ──
  it("item 5: formation year, notice confirmed, small-corporation paragraph on (snapshot)", async () => {
    const pkg = await generatePackage(F11, lateCatchUpFinalisedAt);
    const lines = rcsLines(pkg, 2024);
    const text = lines.join(" ");
    expectOwnerVoice(text);
    expect(text).toContain("This is the LLC's first tax year.");
    expect(text).toContain("I have not received any IRS notice about this return.");
    expect(text).toContain(SMALL_CORPORATION_PARAGRAPH.slice(0, 60));
    expect(text).toContain(
      "As soon as I learned of the requirement, I took steps to file the outstanding returns for 2024 and 2025, which I am now filing together.",
    );
    expect(lines.slice(-5)).toEqual([
      AUTHORED_DOC_SIGNATURE_HEADING,
      "________________________________________",
      "Alex Example",
      "Sole Member, Example Catchup Holdings LLC",
      AUTHORED_DOC_DATE_LINE,
    ]);
    expect(AUTHORED_DOC_SIGNATURE_HEADING).toBe("Signed under penalties of perjury:");
    expect(AUTHORED_DOC_DATE_LINE.startsWith("Date: ____")).toBe(true);
    expect(pkg.record.taxYears[0].rcs).toMatchObject({
      firstTaxYearSentence: true,
      noticeConfirmed: true,
      noticeSentence: true,
      smallCorpParagraph: { setting: null, conditionsMet: true, rendered: true },
    });
    expect(lines).toMatchSnapshot();
  }, PDF_TIMEOUT);

  it("item 5: later year, notice not recorded (snapshot)", async () => {
    const pkg = await generatePackage(F11, lateCatchUpFinalisedAt);
    const lines = rcsLines(pkg, 2025);
    const text = lines.join(" ");
    expectOwnerVoice(text);
    expect(text).not.toContain("This is the LLC's first tax year.");
    expect(text).not.toContain("IRS notice");
    expect(pkg.record.taxYears[1].rcs).toMatchObject({
      firstTaxYearSentence: false,
      noticeConfirmed: null,
      noticeSentence: false,
    });
    expect(lines.slice(-5)).toEqual([
      AUTHORED_DOC_SIGNATURE_HEADING,
      "________________________________________",
      "Alex Example",
      "Sole Member, Example Catchup Holdings LLC",
      AUTHORED_DOC_DATE_LINE,
    ]);
    expect(lines).toMatchSnapshot();
  }, PDF_TIMEOUT);

  it("item 5: notice sentence only when confirmed Yes (false is not Yes)", async () => {
    const pkg = await generatePackage(withYear(F11, 2024, { rcsNoIrsNoticeConfirmed: false }), lateCatchUpFinalisedAt);
    expect(docText(pkg, "reasonableCauseStatement", 2024)).not.toContain("IRS notice");
    expect(pkg.record.taxYears[0].rcs?.noticeSentence).toBe(false);
  }, PDF_TIMEOUT);

  it("item 5: small-corporation paragraph off (admin toggle) and auto-off when conditions are not met", async () => {
    const off = await generatePackage(withYear(F11, 2024, { rcsSmallCorpParagraph: false }), lateCatchUpFinalisedAt);
    expect(docText(off, "reasonableCauseStatement", 2024)).not.toContain("small corporation");
    expect(off.record.taxYears[0].rcs?.smallCorpParagraph).toMatchObject({ setting: false, conditionsMet: true, rendered: false });
    expectOwnerVoice(docText(off, "reasonableCauseStatement"));
    expect(rcsLines(off, 2024)).toMatchSnapshot();

    const notAgentOnly = await generatePackage({ ...F11, llcAddressIsRegisteredAgentOnly: false }, lateCatchUpFinalisedAt);
    expect(notAgentOnly.record.taxYears[0].rcs?.smallCorpParagraph).toMatchObject({
      setting: null,
      conditionsMet: false,
      conditions: { registeredAgentOnly: false },
      rendered: false,
    });
    expect(docText(notAgentOnly, "reasonableCauseStatement")).not.toContain("small corporation");

    const knewBeforeDue = await generatePackage(withYear(F11, 2025, { rcsLearnedOn: "2026-01-10" }), lateCatchUpFinalisedAt);
    expect(knewBeforeDue.record.taxYears[1].rcs?.smallCorpParagraph).toMatchObject({
      conditions: { notKnownBeforeDueDate: false },
      rendered: false,
    });

    const forced = await generatePackage(
      withYear({ ...F11, llcAddressIsRegisteredAgentOnly: false }, 2024, { rcsSmallCorpParagraph: true }),
      lateCatchUpFinalisedAt,
    );
    expect(forced.record.taxYears[0].rcs?.smallCorpParagraph).toMatchObject({ setting: true, conditionsMet: false, rendered: true });
    expect(docText(forced, "reasonableCauseStatement", 2024)).toContain(SMALL_CORPORATION_PARAGRAPH.slice(0, 60));
  }, PDF_TIMEOUT * 3);

  it("item 5: single-year package uses the singular corrective-action sentence", async () => {
    const pkg = await generatePackage({ ...F11, taxYears: [2024], yearData: [F11.yearData[0]] }, lateCatchUpFinalisedAt);
    expect(docText(pkg, "reasonableCauseStatement", 2024)).toContain(
      "As soon as I learned of the requirement, I took steps to file the outstanding return for 2024, which I am now filing.",
    );
  }, PDF_TIMEOUT);

  // ── Item 6: cover letter "Signed:" and never perjury wording ──
  it("item 6: every fixture's cover letter closes 'Signed:' and never says 'penalties of perjury'", async () => {
    for (const filing of [...Object.values(fixtures)]) {
      const pkg = await generatePackage(filing, finalisedAt);
      const cover = pkg.record.authoredDocuments.find((d) => d.kind === "coverLetter")!;
      expect(cover.lines).toContain("Signed:");
      expect(cover.lines.join(" ")).not.toMatch(/penalties of perjury/i);
    }
  }, PDF_TIMEOUT * 6);

  // ── Item 7: owner-paid costs -> Part V, lines 1f/1h; first-person template ──
  it("item 7: $424 / $49 owner-paid costs reach Part V and lines 1f/1h; 1c and Part IV unchanged", async () => {
    const pkg = await generatePackage(F11, lateCatchUpFinalisedAt);
    const field = (taxYear: number, name: string) =>
      pkg.record.taxYears.find((y) => y.taxYear === taxYear)!.form5472.fields.find((w) => w.field === name)?.value;
    for (const [taxYear, dollars] of [[2024, 424], [2025, 49]] as const) {
      const year = pkg.record.taxYears.find((y) => y.taxYear === taxYear)!;
      expect(year.line1f).toBe(dollars);
      expect(year.line1h).toBe(dollars);
      expect(year.partVTotalCents).toBe(dollars * 100);
      expect(year.partVStatementLine1fPrinted).toBe(dollars);
      expect(field(taxYear, form5472FieldMap["1f_totalPaymentsThisForm"])).toBe(String(dollars));
      expect(field(taxYear, form5472FieldMap["1h_totalPaymentsAllForms"])).toBe(String(dollars));
      expect(field(taxYear, form5472FieldMap["1c_totalAssets"])).toBe("0");
      expect(field(taxYear, form5472FieldMap.line22_totalReceived)).toBe("0");
      expect(field(taxYear, form5472FieldMap.line36_totalPaid)).toBe("0");
      expect(field(taxYear, form5472FieldMap.partV_attachedStatementBox)).toBe(true);
      const lines = pkg.record.authoredDocuments.find((d) => d.kind === "partVStatement" && d.taxYear === taxYear)!.lines;
      const text = lines.join(" ");
      expect(text).toContain("Pursuant to Treas. Reg. sec. 1.6038A-2(b)(3)(xi) and Part V instructions");
      expect(text).toContain(`Form 5472 lines 1f and 1h: $${dollars}.`);
      // The ending line is the last line before the signature block.
      expect(lines[lines.indexOf(AUTHORED_DOC_SIGNATURE_HEADING) - 1]).toBe(`Form 5472 lines 1f and 1h: $${dollars}.`);
      expect(text).toContain("Description");
      expect(text).toContain("Amount (USD)");
      expect(text).toContain(`Total Part V reportable transactions, tax year ${taxYear}`);
      expect(text).not.toMatch(/no reportable transactions/i);
      expectOwnerVoice(text);
    }
    const y2024 = docText(pkg, "partVStatement", 2024);
    expect(y2024).toContain("During tax year 2024, I paid $375.00 of formation or EIN service fees for Example Catchup Holdings LLC from my personal funds.");
    expect(y2024).toContain("These amounts are capital contributions to the LLC.");
    expect(y2024).toContain("$424.00");
    const y2025 = docText(pkg, "partVStatement", 2025);
    expect(y2025).toContain("During tax year 2025, I paid $49.00 of registered agent fees for Example Catchup Holdings LLC from my personal funds. This amount is a capital contribution to the LLC.");
    expect((await runPreflight(pkg.record, pkg.bytes)).failures).toEqual([]);
  }, PDF_TIMEOUT);

  it("item 7: Part VI value on line 1f is explained and the ending line still equals line 1f", async () => {
    const pkg = await generatePackage(F5, finalisedAt);
    const y2022 = pkg.record.taxYears.find((y) => y.taxYear === 2022)!;
    expect(y2022.partVStatementLine1fPrinted).toBe(y2022.line1f);
    expect(docText(pkg, "partVStatement", 2022)).toContain("Form 5472 lines 1f and 1h: $25,000.");
    expect(docText(pkg, "partVIStatement", 2022)).toContain(
      "The following non-cash transfers between me and Example Portfolio LLC during tax year 2022 are reported for Part VI of Form 5472.",
    );
    expectOwnerVoice(docText(pkg, "partVIStatement"));
  }, PDF_TIMEOUT);

  it("item 7: schedule descriptions stay on one line, or wrap with no orphan word", async () => {
    const font = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
    expect(fitScheduleDescription("Registered agent fee", font, 346)).toEqual({ lines: ["Registered agent fee"], size: 10 });
    const longish = "Formation or EIN service fee, paid from my personal funds (Alexandria Example-Longname)";
    const shrunk = fitScheduleDescription(longish, font, 346);
    expect(shrunk.lines).toEqual([longish]);
    expect(shrunk.size).toBeLessThan(10);
    expect(shrunk.size).toBeGreaterThanOrEqual(8);
    const veryLong = `${"Reimbursement of a software subscription paid on the company card ".repeat(2)}renewal`;
    const wrapped = fitScheduleDescription(veryLong, font, 346);
    expect(wrapped.lines.length).toBeGreaterThan(1);
    expect(wrapped.lines[wrapped.lines.length - 1].split(" ").length).toBeGreaterThan(1);
    for (const line of wrapped.lines) expect(font.widthOfTextAtSize(line, wrapped.size)).toBeLessThanOrEqual(346);
  });

  // ── Item 8: optional house paid preparer block ──
  it("item 8: house preparer fills the 2024 and 2025 Paid Preparer blocks; signature/date/self-employed stay blank", async () => {
    const pkg = await generatePackage(
      { ...F11, paidPreparerMode: "house", irsMayDiscussWithPreparer: "yes" },
      lateCatchUpFinalisedAt,
      { env: PREPARER_ENV },
    );
    expect(pkg.record.paidPreparerMode).toBe("house");
    expect(pkg.record.housePreparer).toEqual({ configComplete: true, missing: [], invalid: [] });
    for (const [taxYear, revision] of [[2024, 2024], [2025, 2025]] as const) {
      const year = pkg.record.taxYears.find((y) => y.taxYear === taxYear)!;
      const m = form1120PaidPreparerFieldMaps[revision];
      const value = (field: string) => year.form1120.fields.find((w) => w.field === field)?.value;
      expect(year.form1120Revision).toBe(String(revision));
      expect(value(m.preparerName)).toBe("Pat Q. Synthetic");
      expect(value(m.ptin)).toBe("P00000001");
      expect(value(m.firmName)).toBe("Synthetic Preparer Firm LLC");
      expect(value(m.firmEin)).toBe("00-0000001");
      expect(value(m.firmAddress)).toBe("1 Synthetic Way, Example City, ST 00000");
      expect(value(m.phone)).toBe("555-0100");
      expect(value(m.discussYes)).toBe(true);
      expect(value(m.discussNo)).toBeUndefined();
      expect(value(m.selfEmployed)).toBeUndefined();
      expect(year.paidPreparer).toEqual({ shown: true, discuss: "yes", fitFailures: [] });
    }
    // 2024 and 2025 layouts use different fields.
    expect(form1120PaidPreparerFieldMaps[2024].preparerName).not.toBe(form1120PaidPreparerFieldMaps[2025].preparerName);
    expect((await runPreflight(pkg.record, pkg.bytes)).failures).toEqual([]);
  }, PDF_TIMEOUT);

  it("item 8: discuss No / blank, no preparer by default, and incomplete config leaves the block blank", async () => {
    const no = await generatePackage({ ...F11, paidPreparerMode: "house", irsMayDiscussWithPreparer: "no" }, lateCatchUpFinalisedAt, {
      env: PREPARER_ENV,
    });
    const m2025 = form1120PaidPreparerFieldMaps[2025];
    const v = (pkg: Pkg, field: string) => pkg.record.taxYears[1].form1120.fields.find((w) => w.field === field)?.value;
    expect(v(no, m2025.discussNo)).toBe(true);
    expect(v(no, m2025.discussYes)).toBeUndefined();

    const blank = await generatePackage({ ...F11, paidPreparerMode: "house" }, lateCatchUpFinalisedAt, { env: PREPARER_ENV });
    expect(v(blank, m2025.discussYes)).toBeUndefined();
    expect(v(blank, m2025.discussNo)).toBeUndefined();
    expect(blank.record.irsMayDiscussWithPreparer).toBeNull();

    const preparerFields = (pkg: Pkg) =>
      pkg.record.taxYears.flatMap((year) => {
        const m = form1120PaidPreparerFieldMaps[Number(year.form1120Revision) as 2024 | 2025];
        return year.form1120.fields.filter((w) => Object.values(m).includes(w.field));
      });
    // Default (no mode) with a complete config and a discuss answer: still blank.
    const none = await generatePackage({ ...F11, irsMayDiscussWithPreparer: "yes" }, lateCatchUpFinalisedAt, { env: PREPARER_ENV });
    expect(none.record.paidPreparerMode).toBe("none");
    expect(preparerFields(none)).toEqual([]);
    expect(none.record.taxYears.every((y) => y.paidPreparer?.shown === false)).toBe(true);

    const incomplete = await generatePackage({ ...F11, paidPreparerMode: "house" }, lateCatchUpFinalisedAt, {
      env: { ...PREPARER_ENV, HOUSE_PREPARER_PTIN: "", HOUSE_PREPARER_FIRM_EIN: "000000001" },
    });
    expect(preparerFields(incomplete)).toEqual([]);
    expect(incomplete.record.housePreparer).toEqual({
      configComplete: false,
      missing: ["HOUSE_PREPARER_PTIN"],
      invalid: ["HOUSE_PREPARER_FIRM_EIN"],
    });
  }, PDF_TIMEOUT * 4);

  // ── Item 9: 1120 header MM/DD only ──
  it("item 9: the 1120 'tax year beginning' prints 11/02, never 11/02/2024", async () => {
    const pkg = await generatePackage(F11, lateCatchUpFinalisedAt);
    const begin = (taxYear: number, field: string) =>
      pkg.record.taxYears.find((y) => y.taxYear === taxYear)!.form1120.fields.find((w) => w.field === field)?.value;
    expect(begin(2024, form1120_2024FieldMap.taxYearBeginning)).toBe("11/02");
    expect(begin(2025, form1120_2025FieldMap.taxYearBeginning)).toBe("01/01");
    expect((await runPreflight(pkg.record, pkg.bytes)).failures.filter((f) => f.id === "A06")).toEqual([]);
  }, PDF_TIMEOUT);

  // ── DoD: the whole two-year package in the owner's voice ──
  it("DoD: two-year late package has no third-person or preparer wording and every statement is signed under penalties of perjury", async () => {
    const pkg = await generatePackage(
      { ...F11, paidPreparerMode: "house", irsMayDiscussWithPreparer: "yes" },
      lateCatchUpFinalisedAt,
      { env: PREPARER_ENV },
    );
    const statements = pkg.record.authoredDocuments.filter((d) => d.kind !== "coverLetter");
    expect(statements.map((d) => [d.kind, d.taxYear])).toEqual([
      ["partVStatement", 2024],
      ["reasonableCauseStatement", 2024],
      ["partVStatement", 2025],
      ["reasonableCauseStatement", 2025],
    ]);
    for (const doc of statements) {
      expect(doc.lines).toContain("Signed under penalties of perjury:");
      expectOwnerVoice(doc.lines.join(" "));
    }
    expect(docText(pkg, "coverLetter")).not.toMatch(/penalties of perjury/i);
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    expect(preflight.failures).toEqual([]);
  }, PDF_TIMEOUT);
});
