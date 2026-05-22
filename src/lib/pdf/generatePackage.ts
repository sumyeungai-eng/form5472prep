import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { form5472FieldMap, form1120_2024FieldMap, form1120_2025FieldMap } from "./fieldMaps";
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
    otherTransactionsNote: string | null;
    reportableTransactions?: ReportableTx[];
  }[];
};

export type ReportableTx = {
  date: string; // YYYY-MM-DD
  description: string;
  counterparty?: string;
  amountCents: number; // signed: positive = inflow (contribution), negative = outflow (distribution)
  category: string; // "contribution" | "distribution" | other
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

// Form 1120 is filed PRO FORMA — purely as a transmittal for Form 5472.
// Per the Form 5472 instructions for foreign-owned U.S. DEs, only the entity's
// name and address, plus item B (EIN), should be filled. Items C (date
// incorporated), D (total assets), and the income/deduction/Schedule pages
// must NOT be completed for a pro forma 1120 — extra data introduces
// contradictions and can complicate IRS processing. "Foreign-owned U.S. DE"
// is stamped across the top of the form by stampDiirspHeader().
function fillForm1120(pdf: PDFDocument, f: Filing, year: number) {
  const form = pdf.getForm();
  if (year >= 2025) {
    const m = form1120_2025FieldMap;
    setText(form, m["1a_name"], f.llcName);
    // Split address into the structured 2025 fields when possible; otherwise
    // dump the full street into the street box.
    setText(form, m["1_street"], f.llcAddress);
    setText(form, m["1_city"], f.llcCity);
    setText(form, m["1_state"], f.llcState);
    setText(form, m["1_country"], f.llcCountry || "USA");
    setText(form, m["1_zip"], f.llcZip);
    setText(form, m.B_ein, f.llcEin);
  } else {
    const m = form1120_2024FieldMap;
    setText(form, m["1a_name"], f.llcName);
    setText(form, m["1_streetSuite"], f.llcAddress);
    setText(form, m["1_cityStateCountryZip"], `${f.llcCity}, ${f.llcState} ${f.llcZip}`);
    setText(form, m.B_ein, f.llcEin);
  }
  flatten(form);
}

// Build a brand-new PDF with the Part V supporting statement table.
async function buildSupportingStatement(f: Filing, year: number): Promise<PDFDocument> {
  const yd = f.yearData.find((y) => y.taxYear === year);
  const contributionsTotal = yd?.contributions ?? 0;
  const distributionsTotal = yd?.distributions ?? 0;
  const otherNote = (yd?.otherTransactionsNote ?? "").trim();
  const allTx = yd?.reportableTransactions ?? [];
  const contributionsTx = allTx.filter((t) => t.category === "contribution");
  const distributionsTx = allTx.filter((t) => t.category === "distribution");

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // Layout constants
  const PAGE_W = 612;
  const PAGE_H = 792;
  const MARGIN_L = 50;
  const MARGIN_R = 50;
  const MARGIN_TOP = 750;
  const MARGIN_BOTTOM = 60;
  const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R; // 512
  // Date | Description | Amount column layout
  const COL_DATE_X = MARGIN_L;
  const COL_DATE_W = 70;
  const COL_DESC_X = COL_DATE_X + COL_DATE_W + 8;
  const COL_AMOUNT_RIGHT = PAGE_W - MARGIN_R;
  const COL_AMOUNT_W = 80;
  const COL_DESC_W = COL_AMOUNT_RIGHT - COL_AMOUNT_W - COL_DESC_X - 8;

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = MARGIN_TOP;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN_BOTTOM) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = MARGIN_TOP;
    }
  };

  const draw = (
    text: string,
    opts: { x?: number; size?: number; font?: typeof font; align?: "left" | "right" } = {},
  ) => {
    const size = opts.size ?? 10;
    const f = opts.font ?? font;
    let x = opts.x ?? MARGIN_L;
    if (opts.align === "right") {
      const w = f.widthOfTextAtSize(text, size);
      x = x - w;
    }
    page.drawText(text, { x, y, size, font: f, color: rgb(0, 0, 0) });
  };

  // ---- Header ----
  draw("SUPPORTING STATEMENT TO FORM 5472", { font: bold, size: 13 });
  y -= 16;
  draw(`Tax Year ${year}`, { font: bold, size: 11 });
  y -= 14;
  draw(`Reporting Corporation: ${f.llcName}, EIN ${f.llcEin}`);
  y -= 12;
  draw("Pursuant to Treas. Reg. § 1.6038A-2(b)(3) and Part V instructions", { font: italic, size: 9 });
  y -= 22;

  // ---- Opening paragraph ----
  const opening =
    "The following reportable transactions of the foreign-owned U.S. disregarded entity are " +
    "reported pursuant to Part V of Form 5472. These transactions consist of capital contributions " +
    "to, and distributions from, the disregarded entity by its foreign owner.";
  for (const line of wrapAtPx(opening, font, 10, CONTENT_W)) {
    ensureSpace(14);
    draw(line);
    y -= 13;
  }
  y -= 8;

  // ---- Table renderer ----
  const drawTableHeader = () => {
    ensureSpace(18);
    draw("Date", { x: COL_DATE_X, font: bold, size: 9 });
    draw("Description", { x: COL_DESC_X, font: bold, size: 9 });
    draw("Amount (USD)", { x: COL_AMOUNT_RIGHT, font: bold, size: 9, align: "right" });
    y -= 4;
    page.drawLine({
      start: { x: MARGIN_L, y },
      end: { x: PAGE_W - MARGIN_R, y },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 11;
  };

  const drawTableRow = (tx: ReportableTx) => {
    const dateStr = formatTxDate(tx.date);
    const amount = formatMoney(Math.abs(tx.amountCents) / 100);
    const descLines = wrapAtPx(describeTx(tx), font, 10, COL_DESC_W);
    const rowH = Math.max(14, descLines.length * 13 + 2);
    ensureSpace(rowH);
    const rowTop = y;
    draw(dateStr, { x: COL_DATE_X, size: 10 });
    for (let i = 0; i < descLines.length; i++) {
      if (i > 0) y -= 13;
      draw(descLines[i], { x: COL_DESC_X, size: 10 });
    }
    // Amount aligned to first line of description
    const savedY = y;
    y = rowTop;
    draw(amount, { x: COL_AMOUNT_RIGHT, size: 10, align: "right" });
    y = savedY - 8;
  };

  const drawTableTotal = (label: string, amountCents: number) => {
    ensureSpace(20);
    y -= 4;
    page.drawLine({
      start: { x: MARGIN_L, y },
      end: { x: PAGE_W - MARGIN_R, y },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 12;
    draw(label, { x: COL_DATE_X, font: bold, size: 10 });
    draw(formatMoney(amountCents / 100), {
      x: COL_AMOUNT_RIGHT,
      font: bold,
      size: 10,
      align: "right",
    });
    y -= 16;
  };

  // ---- Capital Contributions ----
  ensureSpace(22);
  draw("Capital Contributions from Foreign Owner", { font: bold, size: 11 });
  y -= 16;
  if (contributionsTx.length > 0) {
    drawTableHeader();
    for (const tx of contributionsTx) drawTableRow(tx);
    const sumCents = contributionsTx.reduce((s, t) => s + Math.abs(t.amountCents), 0);
    drawTableTotal(`Total Capital Contributions, Tax Year ${year}`, sumCents);
  } else {
    drawTableTotal(
      `Total Capital Contributions, Tax Year ${year}`,
      Math.round(contributionsTotal * 100),
    );
  }
  y -= 6;

  // ---- Distributions ----
  ensureSpace(22);
  draw("Distributions to Foreign Owner", { font: bold, size: 11 });
  y -= 16;
  if (distributionsTx.length > 0) {
    drawTableHeader();
    for (const tx of distributionsTx) drawTableRow(tx);
    const sumCents = distributionsTx.reduce((s, t) => s + Math.abs(t.amountCents), 0);
    drawTableTotal(`Total Distributions, Tax Year ${year}`, sumCents);
  } else {
    drawTableTotal(
      `Total Distributions, Tax Year ${year}`,
      Math.round(distributionsTotal * 100),
    );
  }
  y -= 6;

  // ---- Grand total ----
  ensureSpace(36);
  draw("Total Reportable Transactions (Part V)", { font: bold, size: 11 });
  y -= 16;
  const grandTotal = contributionsTotal + distributionsTotal;
  for (const line of wrapAtPx(
    `Total Part V reportable transactions, tax year ${year}: ${formatMoney(grandTotal)} ` +
      "(entered on Form 5472 lines 1f and 1h).",
    bold,
    10,
    CONTENT_W,
  )) {
    ensureSpace(14);
    draw(line, { font: bold });
    y -= 13;
  }
  y -= 8;

  // ---- Other transactions disclosure ----
  if (otherNote) {
    ensureSpace(20);
    draw("Other Reportable Transactions", { font: bold, size: 11 });
    y -= 16;
    for (const line of wrapAtPx(otherNote, font, 10, CONTENT_W)) {
      ensureSpace(14);
      draw(line);
      y -= 13;
    }
    y -= 6;
  }

  // ---- Closing ----
  const closing = otherNote
    ? `The transactions above (capital contributions, distributions, and the items disclosed) ` +
      `constitute all reportable transactions between the reporting corporation and the foreign ` +
      `related party for tax year ${year}.`
    : "Other than the transactions described above, there were no other reportable transactions of " +
      `the type described in Treas. Reg. § 1.482-1(i)(7) during tax year ${year}.`;
  ensureSpace(16);
  for (const line of wrapAtPx(closing, font, 10, CONTENT_W)) {
    ensureSpace(14);
    draw(line);
    y -= 13;
  }

  return pdf;
}

// Friendly per-transaction description: use the cleaner of description vs.
// counterparty, prefer combining when both add signal.
function describeTx(tx: ReportableTx): string {
  const d = (tx.description ?? "").trim();
  const c = (tx.counterparty ?? "").trim();
  if (d && c && !d.toLowerCase().includes(c.toLowerCase())) return `${d} (${c})`;
  return d || c || "(no description)";
}

function formatMoney(dollars: number): string {
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTxDate(iso: string): string {
  // Accept YYYY-MM-DD; fall back to whatever we received.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[2]}/${m[3]}/${m[1]}`;
}

// Width-based word wrap for variable-width fonts (the existing `wrap` helper
// counts characters, which leaves columns ragged on monospace and clips wide
// chars on Helvetica).
function wrapAtPx(text: string, f: import("pdf-lib").PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (f.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
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
  draw("1973 Rulon White Blvd");
  y -= 14;
  draw("M/S 6112 Attn: PIN Unit");
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
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const MARGIN_L = 50;
  const MARGIN_R = 50;
  const MARGIN_TOP = 750;
  const MARGIN_BOTTOM = 60;
  const PAGE_W = 612;
  const PAGE_H = 792;
  const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = MARGIN_TOP;

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN_BOTTOM) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = MARGIN_TOP;
    }
  };
  const drawLine = (
    text: string,
    opts: { font?: typeof font; size?: number; x?: number } = {},
  ) => {
    page.drawText(text, {
      x: opts.x ?? MARGIN_L,
      y,
      size: opts.size ?? 10,
      font: opts.font ?? font,
    });
  };
  const drawParagraph = (text: string, opts: { font?: typeof font; size?: number } = {}) => {
    const f = opts.font ?? font;
    const size = opts.size ?? 10;
    for (const line of wrapAtPx(text, f, size, CONTENT_W)) {
      ensureSpace(14);
      drawLine(line, opts);
      y -= 14;
    }
  };
  const space = (n: number) => { y -= n; };

  // ---- Header ----
  drawLine("REASONABLE CAUSE STATEMENT", { font: bold, size: 13 });
  space(16);
  drawLine(
    "(Attached to Form 5472 / Pro Forma Form 1120 submission for tax year" +
      (f.taxYears.length > 1 ? "s" : "") +
      ` ${f.taxYears.join(", ")})`,
    { size: 10 },
  );
  space(18);
  drawLine(`Reporting Corporation: ${f.llcName}`);
  space(12);
  drawLine(`EIN: ${f.llcEin}`);
  space(12);
  drawLine(`Foreign Owner: ${f.ownerName} (${f.ownerCountryTaxResidence})`);
  space(20);

  drawParagraph(
    "This statement explains the circumstances giving rise to the late filing of Form 5472 and the " +
      `accompanying pro forma Form 1120 for tax year${f.taxYears.length > 1 ? "s" : ""} ${f.taxYears.join(", ")}, ` +
      "and respectfully requests waiver of any penalty pursuant to the reasonable cause standard of " +
      "IRC § 6038A(d)(3) and Treas. Reg. § 1.6038A-4(b).",
  );
  space(10);

  // ---- 1. Background ----
  drawParagraph("1. Background", { font: bold, size: 11 });
  space(6);
  const incDateStr = f.llcDateIncorporated
    ? f.llcDateIncorporated.toISOString().slice(0, 10)
    : "(formation date on file)";
  drawParagraph(
    `${f.ownerName} ("the Owner") is a resident and citizen of ${f.ownerCountryCitizenship}. The Owner formed ${f.llcName} ` +
      `("the Company") on ${incDateStr} in ${f.llcState} as a single-member LLC. The Company is a ` +
      "foreign-owned U.S. disregarded entity for U.S. federal income tax purposes. It has at all " +
      "times been operated from outside the United States. It has no U.S. employees, no U.S. office, " +
      "no U.S. effectively connected income, and no U.S. federal income tax liability. Its only U.S. " +
      "nexus is its state-of-incorporation registration and U.S. bank account(s) used to receive " +
      "customer payments and pay vendor invoices.",
  );
  space(10);

  // ---- 2. Cause of the delinquency ----
  drawParagraph("2. Cause of the Delinquency", { font: bold, size: 11 });
  space(6);
  // Use the customer-provided narrative here when present; otherwise a
  // conservative general statement.
  const narrative = f.reasonableCauseNarrative?.trim();
  if (narrative) {
    drawParagraph(narrative);
  } else {
    drawParagraph(
      "The filing was missed due to administrative oversight. The Owner, a non-U.S. resident managing " +
        "the Company remotely from outside the United States, did not have an established compliance " +
        "calendar reminder for the April 15 federal filing deadline, which falls outside the Owner's " +
        "domestic tax calendar. The Company generated no U.S. taxable income and no U.S. tax was owed, " +
        "so no income tax filing reminder or payment obligation served as a deadline trigger. Upon " +
        "recognizing the oversight, the Owner immediately undertook to prepare the delinquent return(s) " +
        "and is filing as soon as practicable, voluntarily and prior to any contact from the Internal " +
        "Revenue Service regarding the missed return(s).",
    );
  }
  space(10);

  // ---- 3. Reasonable cause analysis ----
  drawParagraph("3. Reasonable Cause", { font: bold, size: 11 });
  space(6);
  drawParagraph(
    "Under Treas. Reg. § 1.6038A-4(b), the reasonable cause standard examines whether the taxpayer " +
      "exercised ordinary business care and prudence and was nevertheless unable to comply. The " +
      "following factors support a finding of reasonable cause:",
  );
  space(4);
  const factors = [
    `The Owner is a foreign individual, resident and tax-domiciled in ${f.ownerCountryTaxResidence}, ` +
      "managing the Company remotely without a recurring U.S. tax preparer.",
    "The Company generated no U.S. taxable income and no U.S. tax was owed, so no income tax filing " +
      "reminder or payment obligation served as a deadline trigger.",
    "Activity levels are modest, and the underlying reportable transactions consist solely of " +
      "capital contributions and distributions between the Owner and the Company, as disclosed on " +
      "the attached Part V supporting statement.",
    "The Owner moved promptly to voluntary compliance upon discovery of the lapse, without any " +
      "prior contact from the Internal Revenue Service.",
    "The reporting failure was non-willful and arose from inadvertent administrative oversight, not " +
      "from any attempt to conceal information or evade U.S. tax.",
    "Complete books and records of the Company's transactions have been maintained and are " +
      "available for inspection.",
    "No U.S. taxpayer or counterparty has been disadvantaged by the late filing.",
  ];
  for (const item of factors) {
    ensureSpace(14);
    drawLine("•", { x: MARGIN_L });
    // Indent bullet text
    for (const line of wrapAtPx(item, font, 10, CONTENT_W - 12)) {
      ensureSpace(14);
      drawLine(line, { x: MARGIN_L + 12 });
      y -= 13;
    }
    space(2);
  }
  space(8);

  // ---- 4. Voluntary compliance ----
  drawParagraph("4. Voluntary Compliance and Forward-Looking Statement", { font: bold, size: 11 });
  space(6);
  drawParagraph(
    "This submission is voluntary and is being made before any IRS contact regarding the missing " +
      `return${f.taxYears.length > 1 ? "s" : ""}. To the best of the Owner's knowledge, the Owner is not currently under civil examination, ` +
      "criminal investigation, or under examination by the IRS with respect to Form 5472 reporting. " +
      "The Owner has now established a recurring annual reminder for the April 15 filing deadline " +
      "and will retain qualified assistance as needed to ensure timely future compliance with the " +
      "Form 5472 obligation for as long as the Company remains in existence.",
  );
  space(10);

  // ---- 5. Request ----
  drawParagraph("5. Request", { font: bold, size: 11 });
  space(6);
  drawParagraph(
    "Pursuant to the foregoing, the Owner respectfully requests that any penalty under IRC § 6038A(d) " +
      "be waived in full on grounds of reasonable cause.",
  );
  space(24);

  // ---- Signature block ----
  ensureSpace(60);
  drawLine("Signed under penalties of perjury:", { font: bold });
  space(28);
  drawLine("________________________________________");
  space(14);
  drawLine(`${f.ownerName}`);
  space(12);
  drawLine(`Sole Member, ${f.llcName}`);
  space(12);
  drawLine("Date: ______________________");

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
export type SignatureLocation = {
  label: string;       // e.g. "Cover letter"
  page: number;        // 1-based page number in the merged PDF
  instruction: string; // human-readable hint about where on the page to sign
  // Exact placement in PDF points (1pt = 1/72 inch), bottom-left origin
  // (matches pdf-lib's coordinate system). The signature image is stretched
  // into this rectangle. Coords are per-form so embedSignature doesn't have
  // to guess from the label — IRS revisions move the signature line.
  x: number;
  y: number;
  width: number;
  height: number;
};

// Empirically-measured signature placements for each form in our package.
// Page 1 of US Letter (612x792 pt) → bottom-left origin.
//
// To re-measure after an IRS revision, render the unsigned form, overlay a
// colored rectangle at the candidate (x,y,w,h), open in a PDF viewer, and
// confirm it sits inside the "Sign Here" blank line and doesn't bleed into
// adjacent date/title cells.
const SIG_PLACEMENT = {
  coverLetter:  { x: 72, y: 135, width: 220, height: 50 },
  rcs:          { x: 72, y: 135, width: 220, height: 50 },
  // Form 1120 Sign Here box. The signature line sits left of the date/title
  // cells. y differs between revisions because IRS shifted the box up by
  // ~14pt in the 2025 redesign.
  f1120_2024:   { x: 90, y: 98,  width: 220, height: 24 },
  f1120_2025:   { x: 90, y: 113, width: 220, height: 24 },
} as const;

export type GeneratedPackage = {
  bytes: Uint8Array;
  signatures: SignatureLocation[];
  totalPages: number;
};

export async function generatePackage(f: Filing): Promise<GeneratedPackage> {
  const out = await PDFDocument.create();
  const signatures: SignatureLocation[] = [];

  const cover = await buildCoverLetter(f);
  await copyAll(out, cover);
  // Cover letter signature line is at the bottom of the (single) cover page.
  signatures.push({
    label: "Cover letter",
    page: out.getPageCount(),
    instruction: "Sign on the signature line above your typed name, near the bottom of the page.",
    ...SIG_PLACEMENT.coverLetter,
  });

  if (f.isDiirsp) {
    const rcs = await buildReasonableCause(f);
    await copyAll(out, rcs);
    signatures.push({
      label: "Reasonable Cause Statement",
      page: out.getPageCount(),
      instruction: 'Sign and date under "Signed under penalties of perjury" at the end of the statement.',
      ...SIG_PLACEMENT.rcs,
    });
  }

  for (const year of f.taxYears) {
    const yd = f.yearData.find((y) => y.taxYear === year);
    const line1f = (yd?.contributions ?? 0) + (yd?.distributions ?? 0);

    // Pick the IRS-published Form 1120 that matches the tax year being filed.
    // The IRS revises Form 1120 annually; using an older revision for a newer
    // year is technically incorrect and one of the most common DIIRSP gotchas.
    const f1120FormName = year >= 2025 ? "f1120--2025.pdf" : "f1120--2024.pdf";
    const f1120 = await loadBlank(f1120FormName);
    fillForm1120(f1120, f, year);
    if (f.isDiirsp) await stampDiirspHeader(f1120, "FOREIGN-OWNED U.S. DE — DIIRSP");
    else await stampDiirspHeader(f1120, "FOREIGN-OWNED U.S. DE");
    const f1120FirstPage = out.getPageCount() + 1; // 1-based, captured before merge
    await copyAll(out, f1120);
    // Form 1120's "Sign Here" box sits at the bottom of the first page.
    // 2025 revision shifted the box up ~14pt vs 2024 — use the per-revision
    // placement so the signature lands on the blank line in both cases.
    signatures.push({
      label: `Form 1120 — tax year ${year}`,
      page: f1120FirstPage,
      instruction: 'Sign and date in the "Sign Here" box at the bottom of the first page. Enter "Sole Member" as your title.',
      ...(year >= 2025 ? SIG_PLACEMENT.f1120_2025 : SIG_PLACEMENT.f1120_2024),
    });

    const f5472 = await loadBlank("f5472.pdf");
    fillForm5472(f5472, f, year, line1f);
    if (f.isDiirsp) await stampDiirspHeader(f5472, "FOREIGN-OWNED U.S. DE — DIIRSP");
    else await stampDiirspHeader(f5472, "FOREIGN-OWNED U.S. DE");
    await copyAll(out, f5472);
    // Form 5472 itself does not require a separate signature — the Form 1120
    // signature covers it (5472 is an attachment to 1120).

    const supporting = await buildSupportingStatement(f, year);
    await copyAll(out, supporting);
  }

  const bytes = await out.save();
  return { bytes, signatures, totalPages: out.getPageCount() };
}

async function copyAll(dest: PDFDocument, src: PDFDocument) {
  const pages = await dest.copyPages(src, src.getPageIndices());
  for (const p of pages) dest.addPage(p);
}
