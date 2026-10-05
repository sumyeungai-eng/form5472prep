import type { PDFDocument, PDFFont } from "pdf-lib";
import { toPdfSafe } from "../pdfText";

// ─────────────────────────────────────────────────────────────────────────────
// Fit free text (names, addresses) into IRS AcroForm text fields on ONE line.
//
// pdf-lib's default single-line appearance (pdf-lib 1.17, appearances.ts)
// insets the text by the widget's border width plus 1pt of padding on every
// side, centres it vertically, and never wraps — anything wider than that inner
// box is clipped by the appearance stream's bounding box. So the measurement
// here mirrors that inset exactly, plus a small safety margin for rounding.
// ─────────────────────────────────────────────────────────────────────────────

export const FIT_FONT_STEP = 0.25;
/** Extra horizontal margin on top of pdf-lib's own 1pt padding, for rounding. */
export const FIELD_SAFETY_MARGIN = 0.5;

/** Width pdf-lib actually gives the text inside a single-line field. */
export function usableFieldWidth(rectWidth: number, borderWidth = 0): number {
  return rectWidth - 2 * (borderWidth + 1) - FIELD_SAFETY_MARGIN;
}

/** Height pdf-lib actually gives the text inside a single-line field. */
export function usableFieldHeight(rectHeight: number, borderWidth = 0): number {
  return rectHeight - 2 * (borderWidth + 1);
}

export type FieldBox = {
  field: string;
  width: number;
  height?: number;
  /** Human-readable name for pre-flight messages, e.g. "Form 5472 line 8a". */
  label?: string;
};
export type FitLine = FieldBox & { text: string };
export type FitResult = {
  /** Font size to print every line at. */
  fontSize: number;
  /** False when even `min` was too big and `fontSize` dropped below it to stay inside the field. */
  fits: boolean;
  /** Labels (or field names) of the lines that did not fit at `min`, de-duplicated (empty when `fits`). */
  overflowing: string[];
};

/**
 * Width of `text` as pdf-lib actually DRAWS it in a field appearance: the sum
 * of the glyph advances. pdf-lib's own font.widthOfTextAtSize() subtracts
 * kerning pairs (e.g. "Wa", "To", "Yo") but the appearance stream it writes is
 * a plain Tj with no kerning adjustments, so measuring with it under-states the
 * printed width (by ~0.5% on a typical address line — enough to clip the last
 * letter of a field filled edge to edge). Measuring one character at a time
 * leaves no pairs to kern.
 */
export function drawnTextWidth(font: PDFFont, text: string, size: number): number {
  let width = 0;
  for (const ch of Array.from(text)) width += font.widthOfTextAtSize(ch, size);
  return width;
}

function lineFits(line: FitLine, font: PDFFont, size: number): boolean {
  const text = toPdfSafe(line.text);
  if (drawnTextWidth(font, text, size) > line.width) return false;
  if (line.height !== undefined && font.heightAtSize(size) > line.height) return false;
  return true;
}

/**
 * Largest font size in [min, max] (in `step` increments) at which EVERY line
 * fits its field on one line. When none fits at `min`, returns the exact
 * (sub-minimum) size at which every line still stays inside its field, with
 * `fits: false` so the caller can raise a pre-flight failure — the text is
 * never allowed to overflow or be clipped.
 */
export function fitFontSize(
  lines: FitLine[],
  font: PDFFont,
  opts: { max: number; min: number; step?: number },
): FitResult {
  const step = opts.step ?? FIT_FONT_STEP;
  for (let size = opts.max; size >= opts.min - 1e-9; size -= step) {
    const rounded = Math.round(size * 100) / 100;
    if (lines.every((line) => lineFits(line, font, rounded))) {
      return { fontSize: rounded, fits: true, overflowing: [] };
    }
  }
  const overflowing = Array.from(
    new Set(lines.filter((line) => !lineFits(line, font, opts.min)).map((line) => line.label ?? line.field)),
  );
  let exact = opts.min;
  for (const line of lines) {
    const widthAtOne = drawnTextWidth(font, toPdfSafe(line.text), 1);
    if (widthAtOne > 0) exact = Math.min(exact, line.width / widthAtOne);
    const heightAtOne = font.heightAtSize(1);
    if (line.height !== undefined && heightAtOne > 0) exact = Math.min(exact, line.height / heightAtOne);
  }
  // Floor to 0.01pt so rounding can never push the text past the edge.
  return { fontSize: Math.max(0.01, Math.floor(exact * 100) / 100), fits: false, overflowing };
}

/** Usable single-line box of a named text field in a loaded PDF. */
export function measureFieldBox(pdf: PDFDocument, fieldName: string, label?: string): FieldBox {
  const field = pdf.getForm().getField(fieldName);
  const widget = field.acroField.getWidgets()[0];
  const rect = widget?.getRectangle();
  if (!widget || !rect) throw new Error(`Could not measure PDF field ${fieldName}.`);
  const borderWidth = widget.getBorderStyle()?.getWidth() ?? 0;
  return {
    field: fieldName,
    width: usableFieldWidth(rect.width, borderWidth),
    height: usableFieldHeight(rect.height, borderWidth),
    ...(label ? { label } : {}),
  };
}
