import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { AUTHORED_DOC_SIGNATURE_HEADING, COVER_LETTER_ENCLOSURE_PHRASE, SIGNER_TITLE } from "@/config/filingPackage";
import { form5472FieldMap, form1120_2025FieldMap } from "./fieldMaps";
import {
  deriveSignerTitleColumnBounds,
  generatePackage,
  roundedPartVTotalDollars,
  signerTitleStampPlacement,
} from "./generatePackage";
import { runPreflight } from "./preflight";
import { F1, F2, F3, F4, F5, F7, finalisedAt, fixtures } from "./__fixtures__/filings";

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
        // Existing status logic records "not_sure" Form 7004 as unresolved,
        // not late, so no reasonable-cause statement is generated.
        expect(pkg.record.taxYears[0].status).toBe("unresolved");
        expect(pkg.record.authoredDocuments.some((doc) => doc.kind === "reasonableCauseStatement")).toBe(false);
      }
    }, PDF_TIMEOUT);
  }
});

describe("generatePackage regressions", () => {
  it("G-01 checks Form 5472 line 2 as well as line 3", async () => {
    const pkg = await generatePackage(F1, finalisedAt);
    const fields = pkg.record.taxYears[0].form5472.fields;
    expect(fields).toContainEqual({ form: "5472-2026", field: form5472FieldMap.box2_foreign50pct, value: true });
    expect(fields).toContainEqual({ form: "5472-2026", field: form5472FieldMap.box3_foreignOwnedUsDE, value: true });
  }, PDF_TIMEOUT);

  it("G-02 leaves Form 5472 lines 43a and 43b blank", async () => {
    const pkg = await generatePackage(F1, finalisedAt);
    const fields = pkg.record.taxYears[0].form5472.fields.map((w) => w.field);
    expect(fields).not.toContain(form5472FieldMap.q43a_coveredDebt_no);
    expect(fields.some((field) => /43b|c3_9/.test(field))).toBe(false);
  }, PDF_TIMEOUT);

  it("G-04 fills full calendar-year 1120 header dates", async () => {
    const pkg = await generatePackage(F1, finalisedAt);
    const fields = pkg.record.taxYears[0].form1120.fields;
    expect(fields).toContainEqual({ form: "1120-2026", field: form1120_2025FieldMap.taxYearBeginning, value: "01/01/2026" });
    expect(fields).toContainEqual({ form: "1120-2026", field: form1120_2025FieldMap.taxYearEnding, value: "12/31" });
    expect(fields).toContainEqual({ form: "1120-2026", field: form1120_2025FieldMap.taxYearEndingYear2, value: "26" });
  }, PDF_TIMEOUT);

  it("records dissolutionDate only for final returns", async () => {
    const pkg = await generatePackage(
      {
        ...F1,
        isFinalReturn: false,
        dissolvedAt: new Date("2026-09-30T00:00:00.000Z"),
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
      form: "5472-2026",
      field: form5472FieldMap["1o_countriesBusinessConducted"],
      value: "United States",
    });
    expect(year.form5472.fields).not.toContainEqual({
      form: "5472-2026",
      field: form5472FieldMap["1o_countriesBusinessConducted"],
      value: "Hong Kong",
    });
  }, PDF_TIMEOUT);

  it("G-08 sums cents and rounds half-up once for line 1f", async () => {
    expect(roundedPartVTotalDollars([
      { date: "2026-01-01", description: "Contribution", amountCents: 1_300_936, category: "contribution" },
      { date: "2026-02-01", description: "Distribution", amountCents: -1_487_100, category: "distribution" },
    ])).toBe(27_880);
  }, PDF_TIMEOUT);

  it("C-03 uses the exact cover letter phrase and removes timeliness wording", async () => {
    const pkg = await generatePackage(F5, finalisedAt);
    const cover = pkg.record.authoredDocuments.find((doc) => doc.kind === "coverLetter");
    expect(cover?.lines.slice(0, 4)).toEqual([...IRS_MAIL_ADDRESS_DISPLAY_LINES]);
    expect(cover?.lines).toContain(AUTHORED_DOC_SIGNATURE_HEADING);
    expect(cover?.lines).toContain(SIGNER_TITLE);
    const text = cover?.lines.join("\n") ?? "";
    expect(text).toContain(COVER_LETTER_ENCLOSURE_PHRASE);
    expect(text).not.toMatch(/Form 5472 with attached pro forma/i);
    expect(text).not.toMatch(/\b(timely|late|delinquent|DIIRSP)\b/i);
  }, PDF_TIMEOUT);

  it("formats singular and plural cover letter tax year wording", async () => {
    const single = await generatePackage(F2, finalisedAt);
    const singleText = single.record.authoredDocuments.find((doc) => doc.kind === "coverLetter")?.lines.join(" ") ?? "";
    expect(singleText).toContain("Tax year: 2026");
    expect(singleText).toContain("covers tax year 2026.");
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
});
