import { PDFDocument, PDFTextField, PDFCheckBox, rgb, StandardFonts, PDFName } from "pdf-lib";

export type PdfFieldWrite = {
  form: string;
  field: string;
  value: string | true;
};

export type PdfWriteRecorder = {
  form: string;
  writes: PdfFieldWrite[];
};

// Set a text field by name. Logs and skips if the field is missing —
// IRS PDFs occasionally rename fields between revisions, and we'd rather
// produce a slightly-incomplete PDF than crash the whole generation.
export function setText(
  form: ReturnType<PDFDocument["getForm"]>,
  name: string,
  value: string,
  recorder?: PdfWriteRecorder,
) {
  try {
    const field = form.getField(name);
    if (field instanceof PDFTextField) {
      field.setText(value);
      recorder?.writes.push({ form: recorder.form, field: name, value });
    }
  } catch {
    console.warn(`[pdf] missing text field: ${name}`);
  }
}

// Check a checkbox. PDF AcroForm checkboxes accept .check(); we
// don't need the '/1' value — pdf-lib handles export values internally.
export function check(
  form: ReturnType<PDFDocument["getForm"]>,
  name: string,
  recorder?: PdfWriteRecorder,
) {
  try {
    const field = form.getField(name);
    if (field instanceof PDFCheckBox) {
      field.check();
      recorder?.writes.push({ form: recorder.form, field: name, value: true });
    }
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

// Stamp the SHORT tax-year period just under the DIIRSP header line. A short
// year covers less than 01/01 → 12/31 — because the LLC was formed mid-year
// (initial return), dissolved mid-year (final return), or both — and the 1120
// header's own "tax year beginning / ending" cells are an unmapped AcroForm
// field, so we free-draw the period the same way stampDiirspHeader draws its
// banner. Placed ~12pt below the header (y 778 → 766) so the two stamps never
// overlap; black (not the header's red) because this is a factual period
// statement, not a filing-procedure flag.
//
// `suffix` names WHY the year is short (e.g. "(initial and final return)") so
// the stamp agrees with whichever item E boxes the caller ticked. Pass "" to
// print the period with no parenthetical.
export async function stampShortPeriod(
  pdf: PDFDocument,
  beginText: string,
  endText: string,
  suffix: string = "(final return)",
  opts?: { x?: number; y?: number },
) {
  const page = pdf.getPage(0);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const tail = suffix ? ` ${suffix}` : "";
  page.drawText(`Short tax year: ${beginText} - ${endText}${tail}`, {
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
    throw new Error(`PDF form flatten failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  const remainingFields = form.getFields().length;
  const remainingWidgets = countWidgetAnnotations(form.doc);
  if (remainingFields !== 0 || remainingWidgets !== 0) {
    throw new Error(
      `PDF form flatten incomplete: ${remainingFields} AcroForm fields and ${remainingWidgets} widget annotations remain`,
    );
  }
}

export function countWidgetAnnotations(pdf: PDFDocument): number {
  let widgets = 0;
  for (const page of pdf.getPages()) {
    const annots = page.node.Annots();
    if (!annots) continue;
    for (const annotRef of annots.asArray()) {
      const annot = pdf.context.lookup(annotRef);
      const subtype = (annot as { get?: (key: unknown) => unknown }).get?.(PDFName.of("Subtype"));
      const encodedName = (subtype as { encodedName?: string } | undefined)?.encodedName;
      if (encodedName === "/Widget") widgets++;
    }
  }
  return widgets;
}
