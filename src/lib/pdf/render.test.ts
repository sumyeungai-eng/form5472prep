import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { FAX_RENDER_DPI } from "@/config/filingPackage";
import { generatePackage } from "./generatePackage";
import { F11, finalisedAt, fixtures, lateCatchUpFinalisedAt } from "./__fixtures__/filings";

const RENDER_TIMEOUT = 120_000;
const PAGE_HEIGHT = 792;
const CHECKBOXES = {
  line1jInitial: { x: 302.4, y: 522.969, width: 8, height: 8 },
  line2Foreign50: { x: 561.6, y: 458.968, width: 8, height: 8 },
  line3ForeignOwnedDe: { x: 561.6, y: 434.97, width: 8, height: 8 },
} as const;

function canRunRenderCheck(): { ok: boolean; message?: string } {
  const python = spawnSync("python3", ["--version"], { encoding: "utf8" });
  if (python.status !== 0) return { ok: false, message: "Skipping render test: python3 is not available." };
  const fitz = spawnSync("python3", ["-c", "import fitz"], { encoding: "utf8" });
  if (fitz.status !== 0) return { ok: false, message: "Skipping render test: PyMuPDF (fitz) is not importable." };
  return { ok: true };
}

function findPage(record: Awaited<ReturnType<typeof generatePackage>>["record"], label: string, taxYear?: number): number {
  const page = record.pageOrder.find((p) => p.label === label && (taxYear === undefined || p.taxYear === taxYear));
  if (!page) throw new Error(`Missing page ${label} ${taxYear ?? ""}`.trim());
  return page.startPage;
}

function rasterRect(rect: { x: number; y: number; width: number; height: number }) {
  const scale = FAX_RENDER_DPI / 72;
  const inset = 2;
  return [
    (rect.x + inset) * scale,
    (PAGE_HEIGHT - rect.y - rect.height + inset) * scale,
    Math.max(1, (rect.width - inset * 2) * scale),
    Math.max(1, (rect.height - inset * 2) * scale),
  ];
}

function money(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

describe("render-check", () => {
  const capability = canRunRenderCheck();
  if (!capability.ok) {
    console.warn(capability.message);
    it.skip("requires python3 and PyMuPDF", () => undefined);
    return;
  }

  for (const [name, filing] of Object.entries(fixtures)) {
    it(`V-02 verifies rendered text and checkboxes for ${name}`, async () => {
      const pkg = await generatePackage(filing, finalisedAt);
      const dir = await fs.mkdtemp(path.join(os.tmpdir(), `form5472-render-${name}-`));
      const pdfPath = path.join(dir, `${name}.pdf`);
      const expectedPath = path.join(dir, `${name}.json`);
      await fs.writeFile(pdfPath, pkg.bytes);

      const text: Array<{ page: number; value: string; label?: string }> = [
        { page: 1, value: filing.llcName, label: "cover LLC name" },
        { page: 1, value: filing.llcEin, label: "cover EIN" },
      ];
      const checkboxes: Array<{ page: number; rect: number[]; checked: boolean; label: string; threshold?: number }> = [];

      for (const year of pkg.record.taxYears) {
        const form1120Page = findPage(pkg.record, "Form 1120", year.taxYear);
        const form5472Page = findPage(pkg.record, "Form 5472", year.taxYear);
        const statementPage = findPage(pkg.record, "Part V Statement", year.taxYear);
        text.push(
          { page: form1120Page, value: filing.llcName, label: `${name} ${year.taxYear} 1120 LLC name` },
          { page: form1120Page, value: filing.llcEin, label: `${name} ${year.taxYear} 1120 EIN` },
          { page: form1120Page, value: pkg.record.llcPrintAddress.value, label: `${name} ${year.taxYear} 1120 address` },
          { page: form5472Page, value: filing.ownerName, label: `${name} ${year.taxYear} 5472 owner` },
          { page: form5472Page, value: pkg.record.ownerPrintAddress.value, label: `${name} ${year.taxYear} 5472 owner address` },
          // Lines 4a (page 1) and 8a (page 2) print "Name, address" on one line.
          {
            page: form5472Page,
            value: `${filing.ownerName}, ${pkg.record.ownerPrintAddress.value}`,
            label: `${name} ${year.taxYear} 5472 line 4a name and address`,
          },
          {
            page: form5472Page + 1,
            value: `${filing.ownerName}, ${pkg.record.ownerPrintAddress.value}`,
            label: `${name} ${year.taxYear} 5472 line 8a name and address`,
          },
          { page: statementPage, value: `Tax Year ${year.taxYear}`, label: `${name} ${year.taxYear} statement year` },
          { page: statementPage, value: filing.llcName, label: `${name} ${year.taxYear} statement LLC name` },
          { page: statementPage, value: filing.llcEin, label: `${name} ${year.taxYear} statement EIN` },
          // A year with no Part V rows prints one "no reportable transactions"
          // sentence instead of a $0.00 total (generator 2.1.0).
          year.partVRows.length === 0
            ? { page: statementPage, value: "reportable transactions between", label: `${name} ${year.taxYear} Part V no-transactions sentence` }
            : { page: statementPage, value: money(year.partVTotalRounded), label: `${name} ${year.taxYear} Part V statement total` },
        );
        if (year.nonCashTransfers.length > 0) {
          const partVIPage = findPage(pkg.record, "Part VI Statement", year.taxYear);
          text.push(
            { page: partVIPage, value: `Tax Year ${year.taxYear}`, label: `${name} ${year.taxYear} Part VI year` },
            { page: partVIPage, value: filing.llcName, label: `${name} ${year.taxYear} Part VI LLC name` },
            { page: partVIPage, value: money(year.line1f).replace(".00", ""), label: `${name} ${year.taxYear} Part VI value` },
          );
        }
        checkboxes.push(
          {
            page: form5472Page,
            rect: rasterRect(CHECKBOXES.line2Foreign50),
            checked: true,
            label: `${name} ${year.taxYear} line 2`,
          },
          {
            page: form5472Page,
            rect: rasterRect(CHECKBOXES.line3ForeignOwnedDe),
            checked: true,
            label: `${name} ${year.taxYear} line 3`,
          },
          {
            page: form5472Page,
            rect: rasterRect(CHECKBOXES.line1jInitial),
            checked: year.line1jChecked,
            label: `${name} ${year.taxYear} line 1j`,
          },
        );
      }

      await fs.writeFile(expectedPath, JSON.stringify({ text, checkboxes }, null, 2));
      const output = execFileSync("python3", ["scripts/render-check.py", pdfPath, expectedPath], {
        cwd: process.cwd(),
        encoding: "utf8",
      });
      expect(output).toContain("render-check ok");
    }, RENDER_TIMEOUT);
  }

  // Generator 2.3.0 definition of done, checked on the RENDERED PDF text (two
  // independent extractors) and pixels: the synthetic two-year late package
  // with owner-paid costs in both years and admin narratives.
  it("V-02 DoD: two-year late package text and the paid preparer block render as specified", async () => {
    const env = {
      HOUSE_PREPARER_NAME: "Pat Q. Synthetic",
      HOUSE_PREPARER_PTIN: "P00000001",
      HOUSE_PREPARER_FIRM_NAME: "Synthetic Preparer Firm LLC",
      HOUSE_PREPARER_FIRM_EIN: "00-0000001",
      HOUSE_PREPARER_FIRM_ADDRESS: "1 Synthetic Way, Example City, ST 00000",
      HOUSE_PREPARER_PHONE: "555-0100",
    };
    const pkg = await generatePackage(
      { ...F11, paidPreparerMode: "house", irsMayDiscussWithPreparer: "yes" },
      lateCatchUpFinalisedAt,
      { env },
    );
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "form5472-render-dod-"));
    const pdfPath = path.join(dir, "dod.pdf");
    const expectedPath = path.join(dir, "dod.json");
    await fs.writeFile(pdfPath, pkg.bytes);

    const text: Array<{ page: number; value: string; label?: string }> = [];
    const absent: Array<{ page?: number; value: string; label?: string; ignoreCase?: boolean }> = [
      { value: "Could you please review", label: "no customer intake text anywhere" },
      { page: findPage(pkg.record, "Cover letter"), value: "penalties of perjury", label: "cover letter perjury", ignoreCase: true },
    ];
    // Every page WE author (the printed IRS forms carry their own wording).
    const authoredLabels = new Set(["Cover letter", "Part V Statement", "Part VI Statement", "Reasonable Cause Statement"]);
    for (const entry of pkg.record.pageOrder.filter((p) => authoredLabels.has(p.label))) {
      for (let page = entry.startPage; page <= entry.endPage; page++) {
        absent.push(
          { page, value: "the Owner", label: `${entry.label} ${entry.taxYear ?? ""} 'the Owner'`, ignoreCase: true },
          { page, value: "I prepared", label: `${entry.label} ${entry.taxYear ?? ""} 'I prepared'`, ignoreCase: true },
        );
      }
    }
    text.push({ page: findPage(pkg.record, "Cover letter"), value: "Signed:", label: "cover letter Signed:" });
    // Every Part V and RCS statement ends with the perjury signature heading.
    for (const entry of pkg.record.pageOrder) {
      if (entry.label === "Part V Statement" || entry.label === "Reasonable Cause Statement") {
        text.push({
          page: entry.endPage,
          value: "Signed under penalties of perjury:",
          label: `${entry.label} ${entry.taxYear} signature heading`,
        });
      }
    }
    text.push(
      { page: findPage(pkg.record, "Part V Statement", 2024), value: "Form 5472 lines 1f and 1h: $424.", label: "2024 Part V ending" },
      { page: findPage(pkg.record, "Part V Statement", 2025), value: "Form 5472 lines 1f and 1h: $49.", label: "2025 Part V ending" },
      { page: findPage(pkg.record, "Part V Statement", 2024), value: "1.6038A-2(b)(3)(xi)", label: "Part V citation" },
      {
        page: findPage(pkg.record, "Reasonable Cause Statement", 2025),
        value: "I remained unaware of the requirement when the 2025 return was due on April 15, 2026.",
        label: "2025 still unaware",
      },
    );
    // Paid preparer block on both revisions: text plus Yes ticked, No and
    // self-employed empty (PDF bottom-left coordinates of each 8pt box).
    const boxes = {
      2024: { yes: { x: 522, y: 104 }, no: { x: 552, y: 104 }, selfEmployed: { x: 482, y: 82 } },
      2025: { yes: { x: 524.4, y: 81.3 }, no: { x: 553.2, y: 81.3 }, selfEmployed: { x: 483, y: 67.5 } },
    } as const;
    const checkboxes: Array<{ page: number; rect: number[]; checked: boolean; label: string }> = [];
    for (const taxYear of [2024, 2025] as const) {
      const page = findPage(pkg.record, "Form 1120", taxYear);
      for (const value of ["Pat Q. Synthetic", "P00000001", "Synthetic Preparer Firm LLC", "00-0000001", "1 Synthetic Way, Example City, ST 00000", "555-0100"]) {
        text.push({ page, value, label: `${taxYear} 1120 preparer ${value}` });
      }
      const box = (at: { x: number; y: number }) => rasterRect({ ...at, width: 8, height: 8 });
      checkboxes.push(
        { page, rect: box(boxes[taxYear].yes), checked: true, label: `${taxYear} discuss Yes` },
        { page, rect: box(boxes[taxYear].no), checked: false, label: `${taxYear} discuss No` },
        { page, rect: box(boxes[taxYear].selfEmployed), checked: false, label: `${taxYear} self-employed` },
      );
    }

    await fs.writeFile(expectedPath, JSON.stringify({ text, absent, checkboxes }, null, 2));
    const output = execFileSync("python3", ["scripts/render-check.py", pdfPath, expectedPath], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    expect(output).toContain("render-check ok");
  }, RENDER_TIMEOUT);
});

