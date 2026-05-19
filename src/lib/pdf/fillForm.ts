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

// Flatten the form so downstream PDF viewers (and the IRS) see the values
// as static text rather than editable fields.
export function flatten(form: ReturnType<PDFDocument["getForm"]>) {
  try {
    form.flatten();
  } catch (err) {
    console.warn("[pdf] flatten failed; leaving fields editable", err);
  }
}
