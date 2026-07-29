import { PDFDocument, PDFTextField, PDFCheckBox, rgb, StandardFonts } from "pdf-lib";

// Set a text field by name. Logs and skips if the field is missing —
// IRS PDFs occasionally rename fields between revisions, and we'd rather
// produce a slightly-incomplete PDF than crash the whole generation.
export function setText(form: ReturnType<PDFDocument["getForm"]>, name: string, value: string) {
  try {
    const field = form.getField(name);
    if (field instanceof PDFTextField) {
      field.setText(value);
    }
  } catch {
    console.warn(`[pdf] missing text field: ${name}`);
  }
}

// Check a checkbox. PDF AcroForm checkboxes accept .check(); we
// don't need the '/1' value — pdf-lib handles export values internally.
export function check(form: ReturnType<PDFDocument["getForm"]>, name: string) {
  try {
    const field = form.getField(name);
    if (field instanceof PDFCheckBox) field.check();
  } catch {
    console.warn(`[pdf] missing checkbox: ${name}`);
  }
}

// Stamp DIIRSP header text on page 1, top of form.
export async function stampDiirspHeader(
  pdf: PDFDocument,
  text: string,
  opts?: { x?: number; y?: number },
) {
  const page = pdf.getPage(0);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  page.drawText(text, {
    x: opts?.x ?? 200,
    y: opts?.y ?? 778,
    size: 10,
    font,
    color: rgb(0.8, 0, 0),
  });
}

// Stamp the SHORT tax-year period just under the DIIRSP header line. A final
// return covers 01/01 → the dissolution date, not the printed calendar year,
// and the 1120 header's own "tax year beginning / ending" cells are an unmapped
// AcroForm field — so we free-draw the period the same way stampDiirspHeader
// draws its banner. Placed ~12pt below the header (y 778 → 766) so the two
// stamps never overlap; black (not the header's red) because this is a factual
// period statement, not a filing-procedure flag.
export async function stampShortPeriod(
  pdf: PDFDocument,
  beginText: string,
  endText: string,
  opts?: { x?: number; y?: number },
) {
  const page = pdf.getPage(0);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  // en-dash between the dates, matching typographic convention for ranges.
  page.drawText(`Short tax year: ${beginText} – ${endText} (final return)`, {
    x: opts?.x ?? 200,
    y: opts?.y ?? 766,
    size: 9,
    font,
    color: rgb(0, 0, 0),
  });
}

// Flatten the form so downstream PDF viewers (and the IRS) see the values
// as static text rather than editable fields.
export function flatten(form: ReturnType<PDFDocument["getForm"]>) {
  try {
    form.flatten();
  } catch (err) {
    console.warn("[pdf] flatten failed; leaving fields editable", err);
  }
}
