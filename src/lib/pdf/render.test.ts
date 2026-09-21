import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { FAX_RENDER_DPI } from "@/config/filingPackage";
import { generatePackage } from "./generatePackage";
import { finalisedAt, fixtures } from "./__fixtures__/filings";

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
          { page: statementPage, value: `Tax Year ${year.taxYear}`, label: `${name} ${year.taxYear} statement year` },
          { page: statementPage, value: filing.llcName, label: `${name} ${year.taxYear} statement LLC name` },
          { page: statementPage, value: filing.llcEin, label: `${name} ${year.taxYear} statement EIN` },
          { page: statementPage, value: money(year.line1f), label: `${name} ${year.taxYear} statement total` },
        );
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
            checked: year.isInitialYear,
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
});
