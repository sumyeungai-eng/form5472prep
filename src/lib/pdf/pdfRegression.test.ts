import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFRawStream, PDFStream, decodePDFRawStream } from "pdf-lib";
import { form1120_2025FieldMap, form5472FieldMap } from "./fieldMaps";
import { AUTHORED_DOC_SIGNATURE_HEADING } from "@/config/filingPackage";
import { generatePackage, type PackageRecord } from "./generatePackage";
import { readPageLines, readPrintedFields, validatePackage } from "./validatePackage";
import { EXAMPLE_IMPACT, EXAMPLE_IMPACT_FINALISED_AT } from "./__fixtures__/exampleImpact";
import type { FilingFixture } from "./__fixtures__/filings";

// PR 9 (P2-9) gap tests: PDF-level checks the existing validator and §6 fixture
// tests did not pin. Map to the other checks: docs/reviews/2026-11-03-p2-9-regression-map.md.
// Synthetic data only.
const TIMEOUT = 60_000;
const m = form5472FieldMap;
const m1120 = form1120_2025FieldMap;
const ids = (issues: { id: string }[]) => issues.map((i) => i.id);
const build = (overrides: Partial<FilingFixture> = {}) =>
  generatePackage({ ...EXAMPLE_IMPACT, ...overrides }, EXAMPLE_IMPACT_FINALISED_AT);
type Pkg = Awaited<ReturnType<typeof build>>;

const pages = (record: PackageRecord, label: string): number[] =>
  record.pageOrder
    .filter((p) => p.label === label)
    .flatMap((p) => Array.from({ length: p.endPage - p.startPage + 1 }, (_, k) => p.startPage + k));
const printedText = async (pkg: Pkg, label: string) => {
  const out: string[] = [];
  for (const page of pages(pkg.record, label)) out.push((await readPageLines(pkg.bytes, page)).join(" "));
  return out.join(" ").replace(/\s+/g, " ");
};

function contentOf(doc: PDFDocument, pageIndex: number): string {
  const contents = doc.getPage(pageIndex).node.Contents();
  const parts = contents instanceof PDFArray ? contents.asArray().map((ref) => doc.context.lookup(ref)) : [contents];
  return parts
    .map((s) =>
      s instanceof PDFRawStream
        ? Buffer.from(decodePDFRawStream(s).decode()).toString("latin1")
        : s instanceof PDFStream
          ? Buffer.from(s.getContents()).toString("latin1")
          : "",
    )
    .join("\n");
}

// Replace what one flattened widget draws (the way a bad generator would leave
// it) so a validator check can be shown to fail on the printed page.
// `content` is a PDF content stream: "" = blank, text = `BT /F1 8 Tf 0 2 Td (x) Tj ET`,
// a tick = `BT /ZaDb 8 Tf 0 0 Td (4) Tj ET`.
async function overwriteField(pkg: Pkg, formFile: "f5472.pdf" | "f1120--2025.pdf", fieldName: string, content: string) {
  const label = formFile === "f5472.pdf" ? "Form 5472" : "Form 1120";
  const start = pkg.record.pageOrder.find((p) => p.label === label && p.taxYear === 2025)!.startPage;
  const blank = await PDFDocument.load(await fs.readFile(path.join(process.cwd(), "public", "forms", formFile)));
  const rect = blank.getForm().getField(fieldName).acroField.getWidgets()[0].getRectangle();
  const formPage = Number(/\.Page(\d+)\[/.exec(fieldName)![1]);
  const doc = await PDFDocument.load(pkg.bytes);
  const pageIndex = start + formPage - 2;
  const draw = Array.from(
    contentOf(doc, pageIndex).matchAll(/1 0 0 1 (-?[\d.]+) (-?[\d.]+) cm\s+(?:1 0 0 1 0 0 cm\s+)*\/(FlatWidget-[\w.-]+) Do/g),
  ).find((d) => Math.abs(Number(d[1]) - rect.x) < 0.01 && Math.abs(Number(d[2]) - rect.y) < 0.01);
  expect(draw, `${fieldName} was drawn`).toBeDefined();
  const xobjects = doc.getPage(pageIndex).node.Resources()!.lookup(PDFName.of("XObject"), PDFDict);
  xobjects.set(PDFName.of(draw![3]), doc.context.register(doc.context.stream(content, { Type: "XObject", Subtype: "Form", BBox: [0, 0, 100, 10] })));
  return doc.save();
}

describe("PR 9 gap: item 4 — 4a and 8a print one line for a LONG foreign address", () => {
  it("a ~110-character 'Name, address' line prints identically on 4a and 8a, on one line, inside the field box (A39/A44 clean)", async () => {
    const ownerAddressStreet = "Apartment 12B, Building 4, Synthetic Gardens Residential Complex, 1234 Example Boulevard North Extension";
    const pkg = await build({
      ownerAddressStreet,
      ownerAddress: `${ownerAddressStreet}, Example Town, Examplestate, 12345, France`,
    });
    const f = await readPrintedFields(pkg.bytes, pkg.record, 2025, { form5472: [m["4a_nameAddress"], m["8a_nameAddress"]] });
    const line = f[m["4a_nameAddress"]]?.text ?? "";
    expect(line.length).toBeGreaterThanOrEqual(110);
    expect(line).toContain("Synthetic Gardens Residential Complex");
    expect(line).not.toContain("\n");
    expect(f[m["8a_nameAddress"]]?.text).toBe(line);
    const result = await validatePackage(pkg.bytes, pkg.record);
    expect(ids(result.failures).filter((id) => id === "A39" || id === "A44" || id === "A49")).toEqual([]);
  }, TIMEOUT);
});

describe("PR 9 gap: item 5 — the foreign address includes province and postal code when supplied", () => {
  it("a Canadian owner prints province name and postal code on 4a and 8a, country last, in full", async () => {
    const pkg = await build({
      ownerAddress: "1 Example Street, Exampleville, Ontario, K1A 0B1, Canada",
      ownerAddressStreet: "1 Example Street",
      ownerAddressCity: "Exampleville",
      ownerAddressState: "Ontario",
      ownerAddressPostal: "K1A 0B1",
      ownerAddressCountry: "Canada",
      ownerCountryCitizenship: "Canada",
      ownerCountryTaxResidence: "Canada",
      ownerCountryBusiness: "Canada",
    });
    const f = await readPrintedFields(pkg.bytes, pkg.record, 2025, { form5472: [m["4a_nameAddress"], m["8a_nameAddress"]] });
    for (const name of [m["4a_nameAddress"], m["8a_nameAddress"]]) {
      expect(f[name]?.text).toBe("Camille Exemple, 1 Example Street, Exampleville, Ontario, K1A 0B1, Canada");
    }
    expect(ids((await validatePackage(pkg.bytes, pkg.record)).failures)).not.toContain("A49");
  }, TIMEOUT);
});

describe("PR 9 gap: item 10 — the LLC designator prints on Form 1120, Form 5472 line 1a, the cover letter and the statements", () => {
  it('"EXAMPLE IMPACT LLC" (with LLC) is in all four places', async () => {
    const pkg = await build();
    const name = EXAMPLE_IMPACT.llcName;
    expect(name.endsWith(" LLC")).toBe(true);
    const f = await readPrintedFields(pkg.bytes, pkg.record, 2025, { form5472: [m["1a_name"]], form1120: [m1120["1a_name"]] });
    expect(f[m["1a_name"]]?.text.trim()).toBe(name);
    expect(f[m1120["1a_name"]]?.text.trim()).toBe(name);
    // The cover letter wraps the name across lines, so compare whitespace-normalised text.
    expect(await printedText(pkg, "Cover letter")).toContain(name);
    expect(await printedText(pkg, "Part V Statement")).toContain(name);
    expect(await printedText(pkg, "Reasonable Cause Statement")).toContain(name);
    expect(ids((await validatePackage(pkg.bytes, pkg.record)).failures)).toEqual([]);
  }, TIMEOUT);

  it("a statement page that drops the designator is caught (A40 needs the exact name)", async () => {
    const pkg = await build();
    const wrongName = { ...pkg.record, llcName: "EXAMPLE IMPACT" };
    // Pretending the forms say "EXAMPLE IMPACT" makes the printed "... LLC" forms disagree with the record.
    expect(ids((await validatePackage(pkg.bytes, wrongName)).failures)).toContain("A40");
  }, TIMEOUT);
});

describe("PR 9 gap: A43 / A44 / A46 negative tests on the printed page", () => {
  it("A43 fails when line 2 or line 3 is not ticked, and when line 43a is marked", async () => {
    const pkg = await build();
    const untick2 = await overwriteField(pkg, "f5472.pdf", m.box2_foreign50pct, "");
    const r2 = await validatePackage(untick2, pkg.record);
    expect(ids(r2.failures)).toEqual(["A43"]);
    expect(r2.failures[0].message).toContain("line 2 is not ticked");

    const untick3 = await overwriteField(pkg, "f5472.pdf", m.box3_foreignOwnedUsDE, "");
    expect((await validatePackage(untick3, pkg.record)).failures[0].message).toContain("line 3 is not ticked");

    const marked43a = await overwriteField(pkg, "f5472.pdf", m.q43a_coveredDebt_no, "BT /ZaDb 8 Tf 0 0 Td (4) Tj ET");
    const r43 = await validatePackage(marked43a, pkg.record);
    // (the stand-in tick has a made-up BBox, so A39 may fire as well)
    expect(r43.failures.find((f) => f.id === "A43")?.message).toContain("43a/43b is marked");
  }, TIMEOUT * 2);

  it("A44 fails when 8a differs from 4a, and when 8a wraps onto a second line", async () => {
    const pkg = await build();
    const differs = await overwriteField(pkg, "f5472.pdf", m["8a_nameAddress"], "BT /F1 8 Tf 0 2 Td (Camille Exemple, 1 Other Street, France) Tj ET");
    expect(ids((await validatePackage(differs, pkg.record)).failures)).toContain("A44");

    const wrapped = await overwriteField(
      pkg,
      "f5472.pdf",
      m["8a_nameAddress"],
      "BT /F1 8 Tf 0 8 Td (Camille Exemple, 101 rue des Exemples,) Tj 0 -9 Td (Frejus, Var, 83600, France) Tj ET",
    );
    expect(ids((await validatePackage(wrapped, pkg.record)).failures)).toContain("A44");

    const blank = await overwriteField(pkg, "f5472.pdf", m["8a_nameAddress"], "");
    expect(ids((await validatePackage(blank, pkg.record)).failures)).toContain("A44");
  }, TIMEOUT * 2);

  it("A46 fails when the Form 1120 tax-year beginning, ending or year is blank on the printed page", async () => {
    const pkg = await build();
    for (const field of [m1120.taxYearBeginning, m1120.taxYearEnding, m1120.taxYearEndingYear2]) {
      const blanked = await overwriteField(pkg, "f1120--2025.pdf", field, "");
      const result = await validatePackage(blanked, pkg.record);
      expect(ids(result.failures), field).toEqual(["A46"]);
    }
    const wrongYear = await overwriteField(pkg, "f1120--2025.pdf", m1120.taxYearEndingYear2, "BT /F1 8 Tf 0 2 Td (24) Tj ET");
    expect(ids((await validatePackage(wrongYear, pkg.record)).failures)).toEqual(["A40"]);
  }, TIMEOUT * 2);
});

describe("PR 9 gap: items 2, 8 and 11 read from the printed PDF", () => {
  it("item 2: 'Sole Member' is drawn on the Form 1120 signing page, inside the measured Title column and below the jurat", async () => {
    const pkg = await build();
    const year = pkg.record.taxYears[0];
    const first1120 = pkg.record.pageOrder.find((p) => p.label === "Form 1120" && p.taxYear === 2025)!;
    let drawn = false;
    for (let page = first1120.startPage; page <= first1120.endPage; page++) {
      if ((await readPageLines(pkg.bytes, page)).includes("Sole Member")) drawn = true;
    }
    expect(drawn).toBe(true);
    expect(year.signerTitleRect.left).toBeGreaterThanOrEqual(year.signerTitleColumnBounds.left);
    expect(year.signerTitleRect.right).toBeLessThanOrEqual(year.signerTitleColumnBounds.right);
    expect(year.signerTitleRect.top).toBeLessThanOrEqual(year.signerDeclarationBounds.bottom);
  }, TIMEOUT);

  it("item 8: lines 37 and 39-42 print answered No, 38a/38c and 43a stay blank", async () => {
    const pkg = await build();
    const answered = [m.q37_imports_no, m.q39_csa_no, m.q40a_267A_no, m.q41a_fdii_no, m.q42a_safeHavenInRange_no, m.q42b_safeHavenOutsideRange_no];
    const blank = [m.q38a_customsValue_no, m.q38a_customsValue_yes, m.q38c_importDocumentation_no, m.q38c_importDocumentation_yes, m.q43a_coveredDebt_no, m.q43a_coveredDebt_yes];
    const f = await readPrintedFields(pkg.bytes, pkg.record, 2025, { form5472: [...answered, ...blank] });
    for (const name of answered) expect(f[name]?.checked, name).toBe(true);
    for (const name of blank) expect(f[name]?.checked ?? false, name).toBe(false);
  }, TIMEOUT);

  it("item 11: the Part V statement and the RCS each end with 'Signed under penalties of perjury:' and only the signature block follows", async () => {
    const pkg = await build();
    for (const label of ["Part V Statement", "Reasonable Cause Statement"]) {
      const lines = (await Promise.all(pages(pkg.record, label).map((p) => readPageLines(pkg.bytes, p)))).flat();
      const at = lines.lastIndexOf(AUTHORED_DOC_SIGNATURE_HEADING);
      expect(at, label).toBeGreaterThan(0);
      expect(lines.length - at, label).toBeLessThanOrEqual(5); // heading, rule, name, title, optional date
      expect(lines.slice(at + 1).join(" "), label).toContain("Camille Exemple");
    }
  }, TIMEOUT);
});
