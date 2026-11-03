import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { AUTHORED_DOC_SIGNATURE_HEADING } from "@/config/filingPackage";
import { form5472FieldMap, form1120_2025FieldMap } from "./fieldMaps";
import { generatePackage, type PackageRecord } from "./generatePackage";
import { runPreflight } from "./preflight";
import { activityMatchesCode, datesIn, readPageLines, readPrintedFields, validatePackage } from "./validatePackage";
import { EXAMPLE_IMPACT, EXAMPLE_IMPACT_FINALISED_AT } from "./__fixtures__/exampleImpact";
import type { FilingFixture } from "./__fixtures__/filings";

const TIMEOUT = 60_000;
const m = form5472FieldMap;
const m1120 = form1120_2025FieldMap;

async function build(overrides: Partial<FilingFixture> = {}) {
  return generatePackage({ ...EXAMPLE_IMPACT, ...overrides }, EXAMPLE_IMPACT_FINALISED_AT);
}

function pages(record: PackageRecord, label: string): number[] {
  return record.pageOrder
    .filter((p) => p.label === label)
    .flatMap((p) => Array.from({ length: p.endPage - p.startPage + 1 }, (_, k) => p.startPage + k));
}

async function text(bytes: Uint8Array, record: PackageRecord, label: string): Promise<string> {
  const out: string[] = [];
  for (const page of pages(record, label)) out.push((await readPageLines(bytes, page)).join(" "));
  return out.join(" ");
}

const ids = (issues: { id: string }[]) => issues.map((i) => i.id);

describe("fix spec §6 acceptance: synthetic EXAMPLE IMPACT LLC twin", () => {
  it("passes the post-generation validator and full pre-flight with no failures", async () => {
    const pkg = await build();
    const rendered = await validatePackage(pkg.bytes, pkg.record);
    expect(rendered).toEqual({ failures: [], warnings: [] });
    expect((await runPreflight(pkg.record, pkg.bytes)).failures).toEqual([]);
    expect(pkg.record.generatorVersion).toBe("2.4.0");
  }, TIMEOUT);

  it("asserts every row of the §6 table on the PRINTED package", async () => {
    const pkg = await build();
    const f = await readPrintedFields(pkg.bytes, pkg.record, 2025, {
      form5472: [
        m["1d_businessActivity"], m["1e_businessCode"], m["8c_businessActivity"], m["8d_businessCode"],
        m["4a_nameAddress"], m["8a_nameAddress"], m.box2_foreign50pct, m.box3_foreignOwnedUsDE,
        m.q43a_coveredDebt_yes, m.q43a_coveredDebt_no, m["1f_totalPaymentsThisForm"], m["1h_totalPaymentsAllForms"],
        m["4b3_ftin"], m["8b3_ftin"], m["8e_25pctShareholder"], m["1l_countryIncorp"],
      ],
      form1120: [m1120.taxYearBeginning, m1120.taxYearEnding, m1120.taxYearEndingYear2],
    });
    const t = (name: string) => f[name]?.text;

    // Narrative formation state: Wyoming, never the Delaware mailing state.
    const rcs = await text(pkg.bytes, pkg.record, "Reasonable Cause Statement");
    expect(rcs).toContain('I formed EXAMPLE IMPACT LLC ("the Company") on October 28, 2025 in Wyoming as a single-member LLC.');
    expect(rcs).not.toContain("Delaware");
    // 1e/8d 541800 with "Advertising services" on 1d/8c.
    expect([t(m["1e_businessCode"]), t(m["8d_businessCode"])]).toEqual(["541800", "541800"]);
    expect([t(m["1d_businessActivity"]), t(m["8c_businessActivity"])]).toEqual(["Advertising services", "Advertising services"]);
    // 8a rendered, identical to 4a, one line (PDF-safe ASCII: "Frejus").
    const line = "Camille Exemple, 101 rue des Exemples, Frejus, Var, 83600, France";
    expect(t(m["8a_nameAddress"])).toBe(line);
    expect(t(m["4a_nameAddress"])).toBe(line);
    // 1120 header: beginning 10/28, ending 12/31, year 25.
    expect([t(m1120.taxYearBeginning), t(m1120.taxYearEnding), t(m1120.taxYearEndingYear2)]).toEqual(["10/28", "12/31", "25"]);
    // Lines 2 and 3 ticked, 43a empty, 8e "25% foreign shareholder" ticked, 1l United States.
    expect(f[m.box2_foreign50pct]?.checked).toBe(true);
    expect(f[m.box3_foreignOwnedUsDE]?.checked).toBe(true);
    expect(f[m.q43a_coveredDebt_yes]?.checked ?? false).toBe(false);
    expect(f[m.q43a_coveredDebt_no]?.checked ?? false).toBe(false);
    expect(f[m["8e_25pctShareholder"]]?.checked).toBe(true);
    expect(t(m["1l_countryIncorp"])).toBe("United States");
    // 1f = 1h = 254; statement total $253.94 reconciling to 254.
    expect([t(m["1f_totalPaymentsThisForm"]), t(m["1h_totalPaymentsAllForms"])]).toEqual(["254", "254"]);
    const partV = await text(pkg.bytes, pkg.record, "Part V Statement");
    expect(partV).toContain("Total Part V reportable transactions, tax year 2025 $253.94");
    expect(partV).toContain("Form 5472 lines 1f and 1h: $254.");
    // FTIN printed unspaced on 4b(3)/8b(3).
    expect([t(m["4b3_ftin"]), t(m["8b3_ftin"])]).toEqual(["1234567890123", "1234567890123"]);
    // Cover letter without perjury wording; RCS signature block keeps it.
    expect(await text(pkg.bytes, pkg.record, "Cover letter")).not.toMatch(/penalties of perjury/i);
    expect(rcs).toContain(AUTHORED_DOC_SIGNATURE_HEADING);
    // Title: "Sole Member" stamped in the measured Title column, below the jurat.
    const year = pkg.record.taxYears[0];
    expect(year.signerTitleRect.left).toBeGreaterThanOrEqual(year.signerTitleColumnBounds.left);
    expect(year.signerTitleRect.top).toBeLessThanOrEqual(year.signerDeclarationBounds.bottom);
  }, TIMEOUT);
});

describe("P0-2: state of formation never comes from the mailing address", () => {
  it("omits the state when none is on file, warns W46, and never prints the mailing state", async () => {
    const pkg = await build({ llcFormationState: null });
    const rcs = await text(pkg.bytes, pkg.record, "Reasonable Cause Statement");
    expect(rcs).toContain('I formed EXAMPLE IMPACT LLC ("the Company") on October 28, 2025 as a single-member LLC.');
    expect(rcs).not.toContain("Delaware");
    const result = await validatePackage(pkg.bytes, pkg.record);
    expect(result.failures).toEqual([]);
    expect(ids(result.warnings)).toEqual(["W46"]);
  }, TIMEOUT);

  it("accepts a full state name and an unreadable value leaves the clause out", async () => {
    const named = await build({ llcFormationState: "new mexico" });
    expect(await text(named.bytes, named.record, "Reasonable Cause Statement")).toContain("in New Mexico as a single-member LLC");
    const odd = await build({ llcFormationState: "Wyo" });
    expect(await text(odd.bytes, odd.record, "Reasonable Cause Statement")).toContain("2025 as a single-member LLC");
  }, TIMEOUT);

  it("A45 fails when the printed state disagrees with the state on file", async () => {
    const pkg = await build();
    const result = await validatePackage(pkg.bytes, { ...pkg.record, formationState: "NM" });
    expect(ids(result.failures)).toEqual(["A45"]);
  }, TIMEOUT);
});

describe("A40 on multi-page authored documents (Codex review P1)", () => {
  const longNarrative = Array.from({ length: 6 }, (_, k) =>
    `Paragraph ${k + 1}: I did not know that a foreign-owned single-member LLC must file Form 5472 with a pro forma ` +
    "Form 1120 every year, including years with no U.S. income. No adviser, bank or formation service told me about " +
    "the requirement, and the state documents I received mentioned only the annual report and franchise tax.",
  ).join("\n\n").repeat(2);

  it("a valid two-page RCS passes: continuation pages need not repeat the header", async () => {
    const yd = EXAMPLE_IMPACT.yearData[0];
    const pkg = await build({ yearData: [{ ...yd, rcsAdminNarrative: longNarrative }] });
    expect(longNarrative.length).toBeGreaterThan(2_800);
    expect(pages(pkg.record, "Reasonable Cause Statement").length).toBeGreaterThanOrEqual(2);
    expect(await validatePackage(pkg.bytes, pkg.record)).toEqual({ failures: [], warnings: [] });
  }, TIMEOUT);

  it("still fails when an authored page prints a different EIN", async () => {
    const pkg = await build();
    const doc = await PDFDocument.load(pkg.bytes);
    const rcsPage = pages(pkg.record, "Reasonable Cause Statement")[0];
    doc.getPage(rcsPage - 1).drawText("EIN: 98-0000009", { x: 72, y: 40, size: 10, font: await doc.embedFont(StandardFonts.Helvetica) });
    expect(ids((await validatePackage(await doc.save(), pkg.record)).failures)).toEqual(["A40"]);
  }, TIMEOUT);
});

describe("validator findings on bad data (generation never throws)", () => {
  it("A48: a client description dated outside the tax year is flagged, never rewritten", async () => {
    const yd = EXAMPLE_IMPACT.yearData[0];
    const pkg = await build({
      yearData: [{
        ...yd,
        reportableTransactions: [
          yd.reportableTransactions![0],
          { ...yd.reportableTransactions![1], description: "Creation of my LLC - Oct 27 2026" },
        ],
      }],
    });
    expect(await text(pkg.bytes, pkg.record, "Part V Statement")).toContain("Creation of my LLC - Oct 27 2026");
    const result = await validatePackage(pkg.bytes, pkg.record);
    expect(ids(result.failures)).toEqual(["A48"]);
    expect(result.failures[0].message).toContain("Oct 27 2026");
  }, TIMEOUT);

  it("A42: an off-list NAICS code generates but blocks release; W47 flags a mismatched description", async () => {
    const offList = await build({ llcBusinessCode: "541613" });
    expect(ids((await validatePackage(offList.bytes, offList.record)).failures)).toEqual(["A42", "A42"]);
    // The payment path's pre-flight resolves (never throws) and blocks staff release.
    expect((await runPreflight(offList.record, offList.bytes)).ok).toBe(false);
    const mismatch = await build({ llcBusinessActivity: "Marketing consulting" });
    const result = await validatePackage(mismatch.bytes, mismatch.record);
    expect(result.failures).toEqual([]);
    expect(ids(result.warnings)).toEqual(["W47"]);
  }, TIMEOUT);

  it("A49: abbreviated country or missing postal code on the printed 4a/8a line", async () => {
    const abbreviated = await build({ ownerAddressCountry: "FR" });
    expect(ids((await validatePackage(abbreviated.bytes, abbreviated.record)).failures)).toContain("A49");
    const noPostal = await build({ ownerAddressPostal: null });
    expect(ids((await validatePackage(noPostal.bytes, noPostal.record)).failures)).toContain("A49");
    const noPostalAnswered = await build({ ownerAddressPostal: null, ownerNoPostalCode: true });
    expect(ids((await validatePackage(noPostalAnswered.bytes, noPostalAnswered.record)).failures)).not.toContain("A49");
  }, TIMEOUT);

  it("A50: 'None' printed while the owner said they have an FTIN", async () => {
    const pkg = await build({ ownerFtin: "None" });
    expect(ids((await validatePackage(pkg.bytes, pkg.record)).failures)).toEqual(["A50", "A50"]);
  }, TIMEOUT);

  it("A47 and A40: perjury wording drawn onto the cover letter, and an EIN that disagrees", async () => {
    const pkg = await build();
    const doc = await PDFDocument.load(pkg.bytes);
    doc.getPage(0).drawText("Signed under penalties of perjury", { x: 72, y: 60, size: 10, font: await doc.embedFont(StandardFonts.Helvetica), color: rgb(0, 0, 0) });
    const tampered = await doc.save();
    expect(ids((await validatePackage(tampered, pkg.record)).failures)).toContain("A47");
    expect(ids((await validatePackage(pkg.bytes, { ...pkg.record, llcEin: "98-0000002" })).failures)).toContain("A40");
  }, TIMEOUT);

  it("A51: a package whose page order does not match the PDF", async () => {
    const pkg = await build();
    const onePage = await PDFDocument.create();
    onePage.addPage();
    expect(ids((await validatePackage(await onePage.save(), pkg.record)).failures)).toEqual(["A51"]);
    expect(ids((await runPreflight(pkg.record, await onePage.save())).failures)).toContain("A51");
  }, TIMEOUT);
});

describe("A39 clip box (spec P0-1)", () => {
  it("fails a second line drawn below a one-line field's box, as on the pre-2.1.0 line 8a", async () => {
    const doc = await PDFDocument.create();
    const page = doc.addPage([612, 792]);
    const field = doc.getForm().createTextField("line8a");
    field.enableMultiline();
    field.addToPage(page, { x: 36, y: 600, width: 540, height: 12 });
    field.setText("Example Owner\n101 rue des Exemples, Frejus, Var, 83600, France");
    field.setFontSize(8);
    doc.getForm().flatten();
    const record = { pageOrder: [], taxYears: [], llcName: "", llcEin: "" } as unknown as PackageRecord;
    const result = await validatePackage(await doc.save(), record);
    expect(ids(result.failures)).toEqual(["A39"]);
    expect(result.failures[0].message).toContain("101 rue des Exemples");
  });
});

describe("helpers", () => {
  it("finds the date shapes clients type", () => {
    expect(datesIn("Creation of my LLC - Oct 27 2026").map((d) => [d.y, d.m, d.d])).toEqual([[2026, 10, 27]]);
    expect(datesIn("27/10/2026, 2025-12-15, 3 March 2025, December 2025").map((d) => [d.y, d.m, d.d])).toEqual([
      [2026, 10, 27], [2025, 12, 15], [2025, 3, 3], [2025, 12, null],
    ]);
    expect(datesIn("Tax Year 2025 Treas. Reg. sec. 1.6038A-2(b)(3)(xi)")).toEqual([]);
  });

  it("pairs wizard presets and shared words, not unrelated descriptions", () => {
    expect(activityMatchesCode("Software / SaaS / app development", "541512", 2025)).toBe(true);
    expect(activityMatchesCode("Advertising services", "541800", 2025)).toBe(true);
    expect(activityMatchesCode("Management consulting", "541800", 2025)).toBe(false);
  });
});
