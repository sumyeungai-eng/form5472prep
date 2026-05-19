import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { form5472FieldMap, form1120_2024FieldMap } from "./fieldMaps";
import { setText, check, stampDiirspHeader, flatten } from "./fillForm";
import { formatDateForIrs } from "@/lib/utils";

type Filing = {
  llcName: string;
  llcEin: string;
  llcAddress: string;
  llcCity: string;
  llcState: string;
  llcZip: string;
  llcCountry: string;
  llcDateIncorporated: Date;
  llcBusinessActivity: string;
  llcBusinessCode: string;
  ownerName: string;
  ownerAddress: string;
  ownerCountryCitizenship: string;
  ownerCountryTaxResidence: string;
  ownerCountryBusiness: string;
  ownerFtin: string;
  ownerItin: string | null;
  ownerReferenceId: string | null;
  taxYears: number[];
  isDiirsp: boolean;
  reasonableCauseNarrative: string | null;
  yearData: {
    taxYear: number;
    totalAssetsYearEnd: number;
    contributions: number;
    distributions: number;
  }[];
};

const FORMS_DIR = path.join(process.cwd(), "public", "forms");

async function loadBlank(name: string): Promise<PDFDocument> {
  const bytes = await fs.readFile(path.join(FORMS_DIR, name));
  return PDFDocument.load(bytes);
}

function fillForm5472(pdf: PDFDocument, f: Filing, year: number, line1f: number) {
  const form = pdf.getForm();
  const m = form5472FieldMap;
  setText(form, m.taxYearBeginMonthDay, "01/01");
  setText(form, m.taxYearBeginYear, String(year));
  setText(form, m.taxYearEndMonthDay, "12/31");
  setText(form, m.taxYearEndYear, String(year));

  // Part I — reporting corp
  setText(form, m["1a_name"], f.llcName);
  setText(form, m["1_street"], f.llcAddress);
  setText(form, m["1_cityStateZip"], `${f.llcCity}, ${f.llcState} ${f.llcZip}`);
  setText(form, m["1b_ein"], f.llcEin);
  const yearData = f.yearData.find((y) => y.taxYear === year);
  setText(form, m["1c_totalAssets"], yearData ? yearData.totalAssetsYearEnd.toFixed(0) : "0");
  setText(form, m["1d_businessActivity"], f.llcBusinessActivity);
  setText(form, m["1e_businessCode"], f.llcBusinessCode);
  setText(form, m["1f_totalPaymentsThisForm"], line1f.toFixed(0));
  setText(form, m["1g_numberOfForms"], "1");
  setText(form, m["1h_totalPaymentsAllForms"], line1f.toFixed(0));
  setText(form, m["1l_countryIncorp"], "United States");
  setText(form, m["1m_dateIncorp"], formatDateForIrs(f.llcDateIncorporated));
  setText(form, m["1n_countriesTaxResident"], "United States");
  setText(form, m["1o_countriesBusinessConducted"], "United States");

  check(form, m.box3_foreignOwnedUsDE);

  // Part II — direct 25% foreign shareholder (same as Part III for SMLLC)
  setText(form, m["4a_nameAddress"], `${f.ownerName}\n${f.ownerAddress}`);
  if (f.ownerItin) setText(form, m["4b1_usId"], f.ownerItin);
  if (f.ownerReferenceId) setText(form, m["4b2_referenceId"], f.ownerReferenceId);
  setText(form, m["4b3_ftin"], f.ownerFtin);
  setText(form, m["4c_principalCountry"], f.ownerCountryBusiness);
  setText(form, m["4d_citizenship"], f.ownerCountryCitizenship);
  setText(form, m["4e_taxResidence"], f.ownerCountryTaxResidence);

  // Part III — related party (same person for SMLLC)
  check(form, m.partIII_foreignPersonBox);
  check(form, m["8e_25pctShareholder"]);
  setText(form, m["8a_nameAddress"], `${f.ownerName}\n${f.ownerAddress}`);
  if (f.ownerItin) setText(form, m["8b1_usId"], f.ownerItin);
  if (f.ownerReferenceId) setText(form, m["8b2_referenceId"], f.ownerReferenceId);
  setText(form, m["8b3_ftin"], f.ownerFtin);
  setText(form, m["8c_businessActivity"], f.llcBusinessActivity);
  setText(form, m["8f_principalCountry"], f.ownerCountryBusiness);
  setText(form, m["8g_taxResidence"], f.ownerCountryTaxResidence);

  // Part IV totals — zero (no inventory/services with the owner)
  setText(form, m.line22_totalReceived, "0");
  setText(form, m.line36_totalPaid, "0");

  // Part V — supporting statement attached
  check(form, m.partV_attachedStatementBox);

  // Part VII negatives
  check(form, m.q37_imports_no);
  check(form, m.q39_csa_no);
  check(form, m.q40a_267A_no);
  check(form, m.q41a_fdii_no);
  check(form, m.q42a_safeHavenInRange_no);
  check(form, m.q42b_safeHavenOutsideRange_no);
  check(form, m.q43a_coveredDebt_no);

  flatten(form);
}

function fillForm1120(pdf: PDFDocument, f: Filing, year: number) {
  const form = pdf.getForm();
  const m = form1120_2024FieldMap;
  setText(form, m["1a_name"], f.llcName);
  setText(form, m["1_streetSuite"], f.llcAddress);
  setText(form, m["1_cityStateCountryZip"], `${f.llcCity}, ${f.llcState} ${f.llcZip}`);
  setText(form, m.B_ein, f.llcEin);
  setText(form, m.C_dateIncorporated, formatDateForIrs(f.llcDateIncorporated));
  const yearData = f.yearData.find((y) => y.taxYear === year);
  setText(form, m.D_totalAssets, yearData ? yearData.totalAssetsYearEnd.toFixed(0) : "0");
  flatten(form);
}

// Build a brand-new PDF with the Part V supporting statement table.
async function buildSupportingStatement(f: Filing, year: number): Promise<PDFDocument> {
  const yd = f.yearData.find((y) => y.taxYear === year);
  const contributions = yd?.contributions ?? 0;
  const distributions = yd?.distributions ?? 0;

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 750;
  const draw = (text: string, opts: { x?: number; size?: number; font?: typeof font } = {}) => {
    page.drawText(text, {
      x: opts.x ?? 50,
      y,
      size: opts.size ?? 10,
      font: opts.font ?? font,
      color: rgb(0, 0, 0),
    });
  };

  draw(`SUPPORTING STATEMENT TO FORM 5472 — TAX YEAR ${year}`, { font: bold, size: 12 });
  y -= 20;
  draw(`Reporting corporation: ${f.llcName}`, { font: bold });
  y -= 14;
  draw(`EIN: ${f.llcEin}`);
  y -= 24;

  draw("Part V — Reportable Transactions", { font: bold, size: 11 });
  y -= 18;
  draw("Capital contributions from the foreign related party (single owner):", { font: bold });
  y -= 14;
  draw(`Total for tax year ${year}: $${contributions.toFixed(2)}`);
  y -= 24;

  draw("Distributions to the foreign related party (single owner):", { font: bold });
  y -= 14;
  draw(`Total for tax year ${year}: $${distributions.toFixed(2)}`);
  y -= 24;

  const line1f = contributions + distributions;
  draw(`Total Part V reportable transactions (matches Form 5472 line 1f): $${line1f.toFixed(2)}`, {
    font: bold,
  });
  y -= 24;

  const closing =
    "Other than the transactions described above, there were no other reportable " +
    `transactions of the type described in Treas. Reg. § 1.482-1(i)(7) during tax year ${year}.`;
  // Naive word wrap at ~85 chars
  for (const line of wrap(closing, 85)) {
    draw(line);
    y -= 14;
  }

  return pdf;
}

async function buildCoverLetter(f: Filing): Promise<PDFDocument> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 750;
  const draw = (text: string, opts: { font?: typeof font; size?: number } = {}) => {
    page.drawText(text, { x: 50, y, size: opts.size ?? 10, font: opts.font ?? font });
  };

  draw("Internal Revenue Service", { font: bold });
  y -= 14;
  draw("Ogden Service Center");
  y -= 14;
  draw("PIN Unit, Stop 6273");
  y -= 14;
  draw("Ogden, UT 84201");
  y -= 28;

  draw(`Date: ${new Date().toLocaleDateString("en-US")}`);
  y -= 28;

  draw(`Re: Form 5472 + Pro Forma Form 1120 for ${f.llcName}`, { font: bold });
  y -= 14;
  draw(`EIN: ${f.llcEin}`);
  y -= 14;
  draw(`Tax year(s): ${f.taxYears.join(", ")}`);
  y -= 28;

  const body =
    `Enclosed please find Form 5472 with attached pro forma Form 1120 for the above ` +
    `foreign-owned U.S. disregarded entity, for the tax year(s) listed. ` +
    (f.isDiirsp
      ? `These filings are being submitted under the Delinquent International Information ` +
        `Return Submission Procedures (DIIRSP). A reasonable cause statement is attached.`
      : `These are timely filed for the tax year(s) indicated.`);

  for (const line of wrap(body, 85)) {
    draw(line);
    y -= 14;
  }
  y -= 28;

  draw("Signed:", { font: bold });
  y -= 28;
  draw("________________________________________");
  y -= 14;
  draw(`${f.ownerName}, Owner`);

  return pdf;
}

async function buildReasonableCause(f: Filing): Promise<PDFDocument> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let y = 750;
  const draw = (text: string, opts: { font?: typeof font; size?: number } = {}) => {
    page.drawText(text, { x: 50, y, size: opts.size ?? 10, font: opts.font ?? font });
  };

  draw("REASONABLE CAUSE STATEMENT", { font: bold, size: 12 });
  y -= 20;
  draw(`Reporting corporation: ${f.llcName}`);
  y -= 14;
  draw(`EIN: ${f.llcEin}`);
  y -= 14;
  draw(`Tax year(s): ${f.taxYears.join(", ")}`);
  y -= 28;

  const fallback =
    `The taxpayer was unaware of the Form 5472 filing requirement applicable to ` +
    `foreign-owned U.S. disregarded entities. Upon learning of the requirement, ` +
    `the taxpayer acted promptly and in good faith to come into compliance by ` +
    `preparing and submitting this filing under the Delinquent International ` +
    `Information Return Submission Procedures. The failure was not willful and ` +
    `no tax was due for the years at issue. The taxpayer respectfully requests ` +
    `that no penalty be assessed.`;
  const text = f.reasonableCauseNarrative?.trim() || fallback;
  for (const line of wrap(text, 85)) {
    draw(line);
    y -= 14;
  }
  return pdf;
}

function wrap(text: string, width: number): string[] {
  // Preserve blank-line paragraph breaks by wrapping each paragraph separately
  // and joining with empty strings (the caller advances y for each entry).
  const paragraphs = text.split(/\n\s*\n/);
  const out: string[] = [];
  paragraphs.forEach((p, i) => {
    if (i > 0) out.push("");
    out.push(...wrapParagraph(p, width));
  });
  return out;
}

function wrapParagraph(text: string, width: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > width) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// Build the full filing package as a single PDF Uint8Array.
// Order: cover letter, RCS (if DIIRSP), then per year: 1120, 5472, supporting statement.
export async function generatePackage(f: Filing): Promise<Uint8Array> {
  const out = await PDFDocument.create();

  const cover = await buildCoverLetter(f);
  await copyAll(out, cover);

  if (f.isDiirsp) {
    const rcs = await buildReasonableCause(f);
    await copyAll(out, rcs);
  }

  for (const year of f.taxYears) {
    const yd = f.yearData.find((y) => y.taxYear === year);
    const line1f = (yd?.contributions ?? 0) + (yd?.distributions ?? 0);

    const f1120 = await loadBlank("f1120--2024.pdf");
    fillForm1120(f1120, f, year);
    if (f.isDiirsp) await stampDiirspHeader(f1120, "FOREIGN-OWNED U.S. DE — DIIRSP");
    else await stampDiirspHeader(f1120, "FOREIGN-OWNED U.S. DE");
    await copyAll(out, f1120);

    const f5472 = await loadBlank("f5472.pdf");
    fillForm5472(f5472, f, year, line1f);
    if (f.isDiirsp) await stampDiirspHeader(f5472, "FOREIGN-OWNED U.S. DE — DIIRSP");
    else await stampDiirspHeader(f5472, "FOREIGN-OWNED U.S. DE");
    await copyAll(out, f5472);

    const supporting = await buildSupportingStatement(f, year);
    await copyAll(out, supporting);
  }

  return out.save();
}

async function copyAll(dest: PDFDocument, src: PDFDocument) {
  const pages = await dest.copyPages(src, src.getPageIndices());
  for (const p of pages) dest.addPage(p);
}
