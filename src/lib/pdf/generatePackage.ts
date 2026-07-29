import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { form5472FieldMap, form1120_2024FieldMap, form1120_2025FieldMap } from "./fieldMaps";
import { setText, check, stampDiirspHeader, stampShortPeriod, flatten } from "./fillForm";
import { formatDateForIrs } from "@/lib/utils";
import { isYearDelinquent } from "@/lib/schemas";

// ─────────────────────────────────────────────────────────────────────────────
// Country normalization — wizard collects nationality/residence as free text
// and customers frequently type the demonym ("Canadian") rather than the
// country name ("Canada"). IRS Form 5472 instructions want the COUNTRY in
// every country field (4c, 4d, 4e, 8f, 8g, 1n, 1o), and a demonym in those
// cells reads as an internal contradiction against the supporting statement.
// Map the common demonyms and pass anything else through unchanged.
// ─────────────────────────────────────────────────────────────────────────────
const DEMONYM_TO_COUNTRY: Record<string, string> = {
  american: "United States",
  australian: "Australia",
  brazilian: "Brazil",
  british: "United Kingdom",
  canadian: "Canada",
  chinese: "China",
  dutch: "Netherlands",
  emirati: "United Arab Emirates",
  english: "United Kingdom",
  filipino: "Philippines",
  french: "France",
  german: "Germany",
  "hong konger": "Hong Kong",
  indian: "India",
  indonesian: "Indonesia",
  irish: "Ireland",
  israeli: "Israel",
  italian: "Italy",
  japanese: "Japan",
  korean: "South Korea",
  malaysian: "Malaysia",
  mexican: "Mexico",
  "new zealander": "New Zealand",
  pakistani: "Pakistan",
  polish: "Poland",
  portuguese: "Portugal",
  russian: "Russia",
  singaporean: "Singapore",
  "south african": "South Africa",
  spanish: "Spain",
  swedish: "Sweden",
  swiss: "Switzerland",
  taiwanese: "Taiwan",
  thai: "Thailand",
  turkish: "Türkiye",
  ukrainian: "Ukraine",
  vietnamese: "Vietnam",
};

function normalizeCountry(input: string | null | undefined): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";
  const mapped = DEMONYM_TO_COUNTRY[trimmed.toLowerCase()];
  return mapped ?? trimmed;
}

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
  // Set when the LLC was dissolved/closed and this package is its FINAL
  // (short-year) return. Optional so existing call sites that never handle a
  // final return keep compiling; absent behaves exactly as `false`.
  isFinalReturn?: boolean;
  // Date the LLC was dissolved. Only meaningful alongside isFinalReturn, and
  // it is what makes the year SHORT — see periodEndFor(). Optional/nullable so
  // the many call sites that never deal with a final return keep compiling.
  dissolvedAt?: Date | string | null;
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

// ─────────────────────────────────────────────────────────────────────────────
// Tax-year period end (MM/DD) for a given year in the package.
//
// A final return covers a SHORT tax year: it starts Jan 1 but ends the day the
// LLC was dissolved, NOT 12/31. Printing the full calendar year on a return
// whose item E says "Final return" is an internal contradiction, and it
// overstates the period the reported figures cover.
//
// Only the year the dissolution actually falls in is short. A multi-year
// (DIIRSP catch-up) package that ends with a final year still has ordinary,
// complete years before it, and those must keep 12/31 — hence the year match.
// Read in UTC because the stored value is a date-only instant (UTC midnight);
// local getters would slide it a day backwards on a west-of-UTC host.
// ─────────────────────────────────────────────────────────────────────────────
export function periodEndFor(f: Pick<Filing, "isFinalReturn" | "dissolvedAt">, year: number): string {
  if (!f.isFinalReturn || !f.dissolvedAt) return "12/31";
  const dissolved = f.dissolvedAt instanceof Date ? f.dissolvedAt : new Date(f.dissolvedAt);
  if (Number.isNaN(dissolved.getTime())) return "12/31";
  if (dissolved.getUTCFullYear() !== year) return "12/31";
  const mm = String(dissolved.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dissolved.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tax-year period START (MM/DD) for a given year in the package.
//
// The mirror image of periodEndFor(). An entity's FIRST tax year does not begin
// on January 1 — it begins the day the entity came into existence. An LLC formed
// 2026-04-13 and dissolved 2026-09-30 is a first-and-final filer whose only tax
// year runs 04/13/2026 – 09/30/2026; printing 01/01 would claim three and a half
// months of existence that never happened, and would contradict Form 5472 line
// 1m (date incorporated) on the same page.
//
// Only the FORMATION year gets the late start. In a multi-year DIIRSP catch-up
// the years after formation are ordinary years that really do begin Jan 1 —
// hence the year match, same shape as periodEndFor().
// Read in UTC: the stored value is a date-only instant (UTC midnight), and local
// getters would slide it a day backwards on a west-of-UTC host.
// ─────────────────────────────────────────────────────────────────────────────
export function periodStartFor(
  f: { llcDateIncorporated?: Date | string | null },
  year: number,
): string {
  if (!f.llcDateIncorporated) return "01/01";
  const formed =
    f.llcDateIncorporated instanceof Date
      ? f.llcDateIncorporated
      : new Date(f.llcDateIncorporated);
  if (Number.isNaN(formed.getTime())) return "01/01";
  if (formed.getUTCFullYear() !== year) return "01/01";
  const mm = String(formed.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(formed.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

// The LLC's formation year in UTC, or null when no formation date is on file.
function formationYearOf(f: { llcDateIncorporated?: Date | string | null }): number | null {
  if (!f.llcDateIncorporated) return null;
  const formed =
    f.llcDateIncorporated instanceof Date
      ? f.llcDateIncorporated
      : new Date(f.llcDateIncorporated);
  if (Number.isNaN(formed.getTime())) return null;
  return formed.getUTCFullYear();
}

const FORMS_DIR = path.join(process.cwd(), "public", "forms");

async function loadBlank(name: string): Promise<PDFDocument> {
  const bytes = await fs.readFile(path.join(FORMS_DIR, name));
  return PDFDocument.load(bytes);
}

function fillForm5472(pdf: PDFDocument, f: Filing, year: number, line1f: number) {
  const form = pdf.getForm();
  const m = form5472FieldMap;

  // Normalize country / nationality strings up-front. Wizard collects free
  // text; "Canadian" → "Canada", etc. See normalizeCountry() above.
  const ownerCitizenship = normalizeCountry(f.ownerCountryCitizenship);
  const ownerTaxResidence = normalizeCountry(f.ownerCountryTaxResidence);
  // 1o (principal country business conducted) and 4c/8f (principal country of
  // the owner/related party) reflect WHERE the business is operated. For a
  // foreign-owned US DE that's managed remotely by a non-resident owner, this
  // is the owner's country — NOT "United States". The RCS says explicitly
  // "operated from outside the United States", so 1o = "United States" was
  // creating a direct internal contradiction that auto-validators flag.
  const ownerBusinessCountry =
    normalizeCountry(f.ownerCountryBusiness) || ownerTaxResidence || ownerCitizenship;

  // Period bounds. The START is 01/01 except in the LLC's FORMATION year, where
  // it is the formation date (see periodStartFor()); the END is 12/31 unless
  // this is the final year, in which case it's the dissolution date (see
  // periodEndFor()). A first-and-final filer gets both at once.
  setText(form, m.taxYearBeginMonthDay, periodStartFor(f, year));
  setText(form, m.taxYearBeginYear, String(year));
  setText(form, m.taxYearEndMonthDay, periodEndFor(f, year));
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
  // 1k expects a number; we never attach Part VIII (no cost-sharing
  // arrangement applies to a sole-member DE), so explicit "0" is cleaner
  // than blank.
  setText(form, m["1k_partsVIII"], "0");
  setText(form, m["1l_countryIncorp"], "United States");
  setText(form, m["1m_dateIncorp"], formatDateForIrs(f.llcDateIncorporated));
  // 1n (tax-resident jurisdiction of the REPORTING CORP) — the LLC is a US
  // entity for US legal/tax purposes. Stays "United States".
  setText(form, m["1n_countriesTaxResident"], "United States");
  // 1o (principal country where business is CONDUCTED) — for a remotely-
  // managed foreign-owned DE, this is the owner's country. Falls back to
  // citizenship if tax-residence is missing.
  setText(form, m["1o_countriesBusinessConducted"], ownerBusinessCountry || "United States");

  check(form, m.box3_foreignOwnedUsDE);
  // Initial-year box (1j): "this is the reporting corporation's INITIAL year of
  // existence", not "the first year in this package". The old gate was
  // `year === earliest selected year && earliest >= formationYear`, which ticked
  // 1j on whichever year the customer happened to start their catch-up from —
  // so an LLC formed in 2020 that files 2022-2024 declared 2022 its initial
  // year, contradicting line 1m (date incorporated 2020) two cells away.
  // Keyed on the formation year instead: exactly one year in any package can be
  // the initial year, and only if that year is actually being filed. An LLC
  // whose formation year is missing or unparseable ticks nothing (safer than
  // asserting an initial year we can't substantiate).
  const formationYear = formationYearOf(f);
  if (formationYear !== null && year === formationYear) {
    check(form, m["1j_initialYear"]);
  }

  // Part II — direct 25% foreign shareholder (same as Part III for SMLLC)
  setText(form, m["4a_nameAddress"], `${f.ownerName}\n${f.ownerAddress}`);
  if (f.ownerItin) setText(form, m["4b1_usId"], f.ownerItin);
  if (f.ownerReferenceId) setText(form, m["4b2_referenceId"], f.ownerReferenceId);
  setText(form, m["4b3_ftin"], f.ownerFtin);
  setText(form, m["4c_principalCountry"], ownerBusinessCountry);
  setText(form, m["4d_citizenship"], ownerCitizenship);
  setText(form, m["4e_taxResidence"], ownerTaxResidence);

  // Part III — related party (same person for SMLLC)
  check(form, m.partIII_foreignPersonBox);
  check(form, m["8e_25pctShareholder"]);
  setText(form, m["8a_nameAddress"], `${f.ownerName}\n${f.ownerAddress}`);
  if (f.ownerItin) setText(form, m["8b1_usId"], f.ownerItin);
  if (f.ownerReferenceId) setText(form, m["8b2_referenceId"], f.ownerReferenceId);
  setText(form, m["8b3_ftin"], f.ownerFtin);
  setText(form, m["8c_businessActivity"], f.llcBusinessActivity);
  // 8d (related party's PBA CODE) mirrors Part I 1e for a sole-member DE
  // where the related party IS the controller of the reporting corp.
  setText(form, m["8d_businessCode"], f.llcBusinessCode);
  setText(form, m["8f_principalCountry"], ownerBusinessCountry);
  setText(form, m["8g_taxResidence"], ownerTaxResidence);

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
// Per the Form 5472 instructions for foreign-owned U.S. DEs, the income,
// deduction, and Schedule pages must NOT be completed (no tax is computed
// on a pro forma 1120). We DO populate the entity-identification fields
// (name, EIN, date incorporated, total assets) because leaving Items C
// and D blank creates a "this filing looks incomplete" question for the
// IRS reviewer and a cross-form inconsistency vs. Form 5472 line 1c
// (total assets) and 1m (date incorporated). Filling them mirrors the
// 5472 data and removes the ambiguity at zero risk.
// "Foreign-owned U.S. DE" is stamped across the top by stampDiirspHeader().
async function fillForm1120(pdf: PDFDocument, f: Filing, year: number) {
  const form = pdf.getForm();
  // Total assets at year-end — mirror Form 5472 line 1c. Pull the year that
  // matches the 1120 we're rendering; fall back to 0 if no yearData row.
  const yd = f.yearData.find((y) => y.taxYear === year);
  const totalAssets = yd ? Math.round(yd.totalAssetsYearEnd).toString() : "0";
  const dateIncorporated = formatDateForIrs(f.llcDateIncorporated);

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
    setText(form, m.C_dateIncorporated, dateIncorporated);
    setText(form, m.D_totalAssets, totalAssets);
  } else {
    const m = form1120_2024FieldMap;
    setText(form, m["1a_name"], f.llcName);
    setText(form, m["1_streetSuite"], f.llcAddress);
    setText(form, m["1_cityStateCountryZip"], `${f.llcCity}, ${f.llcState} ${f.llcZip}`);
    setText(form, m.B_ein, f.llcEin);
    setText(form, m.C_dateIncorporated, dateIncorporated);
    setText(form, m.D_totalAssets, totalAssets);
  }

  // NOTE (short year): the 1120 header's own "tax year beginning / ending" line
  // is an AcroForm field neither revision's map exposes, so rather than guess
  // its name we state the short period with a free-text stamp (stampShortPeriod,
  // applied in generatePackage just under the header stamp) for the dissolution
  // year, and Form 5472 also carries it in its mapped period cells (see
  // periodEndFor). Ordinary full years are left showing their calendar year.
  //
  // Item E "Final return" belongs ONLY to the 1120 for the SHORT (dissolution)
  // year. In a multi-year DIIRSP catch-up the earlier years are ordinary,
  // complete returns — ticking "Final return" on them would misdeclare a still-
  // live entity as closed for a year it was operating. periodEndFor() returns a
  // non-12/31 end exactly for the dissolution year, so it is the correct gate
  // (and matches the short-period stamp). Both the 2024 and 2025 field maps now
  // expose E_finalReturn (c1_7[0], verified by pdf-lib enumeration of both blank
  // PDFs); keep the key guard so any future unmapped revision skips it silently.
  const isShortYear = periodEndFor(f, year) !== "12/31";
  const itemE: typeof form1120_2025FieldMap | typeof form1120_2024FieldMap =
    year >= 2025 ? form1120_2025FieldMap : form1120_2024FieldMap;
  if (f.isFinalReturn && isShortYear) {
    if ("E_finalReturn" in itemE) check(form, itemE.E_finalReturn);
  }

  // Item E "Initial return" is the mirror flag: this is the entity's FIRST tax
  // year, so the IRS shouldn't expect a prior-year return for the same EIN. It
  // belongs to the formation year only — independent of the final-return gate
  // above, so an LLC formed and dissolved in the same year (a first-and-final
  // filer) correctly gets BOTH boxes ticked on its single 1120. Both revisions'
  // maps expose E_initialReturn (c1_6[0], probe-verified alongside c1_7[0]);
  // keep the key guard so a future unmapped revision skips it silently.
  if (formationYearOf(f) === year) {
    if ("E_initialReturn" in itemE) check(form, itemE.E_initialReturn);
  }

  flatten(form);

  // After flatten, stamp "Sole Member" into the signature-block "Title" slot.
  // We draw OUTSIDE the form field because the title field's exact AcroForm
  // name varies between IRS revisions and even between PDF generators; a
  // free-form text stamp at known coordinates is more robust than trying to
  // bind to f1_XX[0] field numbers that shift each revision. Coordinates are
  // PDF points, bottom-left origin, calibrated to land in the "Title" cell to
  // the right of the signature line on page 1's "Sign Here" block.
  await stampTitleSoleMember(pdf, year);
}

async function stampTitleSoleMember(pdf: PDFDocument, year: number) {
  const page = pdf.getPage(0);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  // Title cell sits to the right of the signature line and to the right of the
  // date cell. Y coordinate matches the signature baseline (98 on 2024 rev,
  // 113 on 2025 rev — same offset as SIG_PLACEMENT below).
  const x = 410;
  const y = year >= 2025 ? 113 : 98;
  page.drawText("Sole Member", { x, y, size: 10, font, color: rgb(0, 0, 0) });
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

async function buildCoverLetter(f: Filing, delinquentYears: number[]): Promise<PDFDocument> {
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

  // Per-year status. The DIIRSP / late-filing language must name ONLY the years
  // that are actually delinquent — the cover letter is signed, so declaring a
  // timely year late would be a false statement. Three cases:
  //   • no delinquent years  → the existing fully-timely wording (unchanged);
  //   • ALL years delinquent → the existing DIIRSP wording, VERBATIM (this is
  //     the ordinary catch-up package, kept byte-for-byte stable);
  //   • a mix                → DIIRSP for the late years + one sentence noting
  //     the timely year(s).
  const timelyYears = f.taxYears.filter((y) => !delinquentYears.includes(y));
  let statusSentence: string;
  if (delinquentYears.length === 0) {
    statusSentence = `These are timely filed for the tax year(s) indicated.`;
  } else if (timelyYears.length === 0) {
    statusSentence =
      `These filings are being submitted under the Delinquent International Information ` +
      `Return Submission Procedures (DIIRSP). A reasonable cause statement is attached.`;
  } else {
    const dPlural = delinquentYears.length > 1;
    const tPlural = timelyYears.length > 1;
    statusSentence =
      `The filing${dPlural ? "s" : ""} for tax year${dPlural ? "s" : ""} ${delinquentYears.join(", ")} ` +
      `${dPlural ? "are" : "is"} being submitted under the Delinquent International Information ` +
      `Return Submission Procedures (DIIRSP). A reasonable cause statement is attached. ` +
      `This package also includes a timely filed return for tax year${tPlural ? "s" : ""} ${timelyYears.join(", ")}.`;
  }
  const body =
    `Enclosed please find Form 5472 with attached pro forma Form 1120 for the above ` +
    `foreign-owned U.S. disregarded entity, for the tax year(s) listed. ` +
    statusSentence;

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

async function buildReasonableCause(f: Filing, delinquentYears: number[]): Promise<PDFDocument> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // The RCS explains why the LATE returns are late, so every year it names must
  // be a delinquent one — never a timely year bundled in the same package. Fall
  // back to the full set only in the defensive case of an empty delinquent list
  // (the caller renders the RCS only when isDiirsp, i.e. at least one late year,
  // so in practice `years` is exactly delinquentYears).
  const years = delinquentYears.length ? delinquentYears : f.taxYears;

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
      (years.length > 1 ? "s" : "") +
      ` ${years.join(", ")})`,
    { size: 10 },
  );
  space(18);
  drawLine(`Reporting Corporation: ${f.llcName}`);
  space(12);
  drawLine(`EIN: ${f.llcEin}`);
  space(12);
  drawLine(`Foreign Owner: ${f.ownerName} (${normalizeCountry(f.ownerCountryTaxResidence)})`);
  space(20);

  drawParagraph(
    "This statement explains the circumstances giving rise to the late filing of Form 5472 and the " +
      `accompanying pro forma Form 1120 for tax year${years.length > 1 ? "s" : ""} ${years.join(", ")}, ` +
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
  // Normalize country/nationality the same way the 5472 form fields do, so
  // the RCS prose and the form cells agree on the spelling (avoids "resident
  // and citizen of Canadian" — demonym in a country-name context).
  const rcsOwnerCitizenship = normalizeCountry(f.ownerCountryCitizenship);
  const rcsOwnerTaxResidence = normalizeCountry(f.ownerCountryTaxResidence);
  drawParagraph(
    `${f.ownerName} ("the Owner") is a resident and citizen of ${rcsOwnerCitizenship}. The Owner formed ${f.llcName} ` +
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
    `The Owner is a foreign individual, resident and tax-domiciled in ${rcsOwnerTaxResidence}, ` +
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
      `return${years.length > 1 ? "s" : ""}. To the best of the Owner's knowledge, the Owner is not currently under civil examination, ` +
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

  // Per-year delinquency. A bundled package can mix late years with a timely one
  // (e.g. a DIIRSP catch-up that ends with a final short year whose deadline
  // hasn't passed yet). The DIIRSP header stamp, the cover letter's late-filing
  // language, and the reasonable cause statement are signed under penalties of
  // perjury, so they must apply to the delinquent years ONLY — declaring a
  // timely year "delinquent" would be a false statement. Use the same shared
  // rule the server used to set isDiirsp, so the two never disagree.
  const delinquentYears = f.taxYears.filter((y) =>
    isYearDelinquent(y, f.isFinalReturn ? f.dissolvedAt : null),
  );

  const cover = await buildCoverLetter(f, delinquentYears);
  await copyAll(out, cover);
  // Cover letter signature line is at the bottom of the (single) cover page.
  signatures.push({
    label: "Cover letter",
    page: out.getPageCount(),
    instruction: "Sign on the signature line above your typed name, near the bottom of the page.",
    ...SIG_PLACEMENT.coverLetter,
  });

  if (f.isDiirsp) {
    const rcs = await buildReasonableCause(f, delinquentYears);
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
    // Per-year, not per-package: only THIS year's forms carry the DIIRSP banner,
    // and only if this year is actually late. A timely year bundled alongside
    // late ones gets the plain header.
    const yearDelinquent = delinquentYears.includes(year);

    // Pick the IRS-published Form 1120 that matches the tax year being filed.
    // The IRS revises Form 1120 annually; using an older revision for a newer
    // year is technically incorrect and one of the most common DIIRSP gotchas.
    const f1120FormName = year >= 2025 ? "f1120--2025.pdf" : "f1120--2024.pdf";
    const f1120 = await loadBlank(f1120FormName);
    await fillForm1120(f1120, f, year);
    if (yearDelinquent) await stampDiirspHeader(f1120, "FOREIGN-OWNED U.S. DE — DIIRSP");
    else await stampDiirspHeader(f1120, "FOREIGN-OWNED U.S. DE");
    // Short-period annotation. A year is short when it starts after Jan 1 (the
    // LLC was formed mid-year) OR ends before Dec 31 (it was dissolved
    // mid-year), so this stamp tracks BOTH bounds and lands exactly where at
    // least one item E box is ticked. The suffix names which case applies so the
    // stamp can never contradict the checkboxes above it.
    const periodStart = periodStartFor(f, year);
    const periodEnd = periodEndFor(f, year);
    const isInitialYear = periodStart !== "01/01";
    const isFinalYear = periodEnd !== "12/31";
    if (isInitialYear || isFinalYear) {
      const suffix =
        isInitialYear && isFinalYear
          ? "(initial and final return)"
          : isFinalYear
            ? "(final return)"
            : `(initial return — formed ${periodStart}/${year})`;
      await stampShortPeriod(f1120, `${periodStart}/${year}`, `${periodEnd}/${year}`, suffix);
    }
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
    if (yearDelinquent) await stampDiirspHeader(f5472, "FOREIGN-OWNED U.S. DE — DIIRSP");
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
