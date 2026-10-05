import { describe, expect, it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { drawnTextWidth, fitFontSize, usableFieldWidth } from "./fitText";

async function helvetica() {
  const pdf = await PDFDocument.create();
  return pdf.embedFont(StandardFonts.Helvetica);
}

describe("fitText", () => {
  it("mirrors pdf-lib's 1pt padding plus the safety margin", () => {
    expect(usableFieldWidth(540)).toBe(537.5);
    expect(usableFieldWidth(540, 1)).toBe(535.5);
  });

  it("measures drawn width without kerning (pdf-lib draws a plain Tj)", async () => {
    const font = await helvetica();
    const text = "To Wanchai, Yau Tong, AVE";
    // pdf-lib's own measure subtracts kerning pairs, so it is narrower than what is drawn.
    expect(drawnTextWidth(font, text, 10)).toBeGreaterThan(font.widthOfTextAtSize(text, 10));
  });

  it("keeps the largest size that fits every line", async () => {
    const font = await helvetica();
    const fit = fitFontSize(
      [
        { field: "a", width: 537.5, height: 10, text: "Mei Lin Examples, Exam House, Sample Court, Yau Tong, Kowloon, Hong Kong" },
        { field: "b", width: 537.5, height: 10, text: "Short" },
      ],
      font,
      { max: 10, min: 6 },
    );
    expect(fit).toEqual({ fontSize: 10, fits: true, overflowing: [] });
  });

  it("shrinks in 0.25pt steps until the longest line fits", async () => {
    const font = await helvetica();
    const text = "x".repeat(90);
    const fit = fitFontSize([{ field: "a", width: 300, text }], font, { max: 10, min: 6 });
    expect(fit.fits).toBe(true);
    expect(fit.fontSize).toBeLessThan(10);
    expect(drawnTextWidth(font, text, fit.fontSize)).toBeLessThanOrEqual(300);
    expect(drawnTextWidth(font, text, fit.fontSize + 0.25)).toBeGreaterThan(300);
  });

  it("drops below the minimum but stays inside the field when nothing fits, naming the line", async () => {
    const font = await helvetica();
    const text = "A very long owner name and address ".repeat(8);
    const fit = fitFontSize(
      [{ field: "f2_1", label: "Form 5472 line 8a", width: 537.5, height: 10, text }],
      font,
      { max: 10, min: 6 },
    );
    expect(fit.fits).toBe(false);
    expect(fit.fontSize).toBeLessThan(6);
    expect(drawnTextWidth(font, text, fit.fontSize)).toBeLessThanOrEqual(537.5);
    expect(fit.overflowing).toEqual(["Form 5472 line 8a"]);
  });

  it("respects the field height so text is never clipped vertically", async () => {
    const font = await helvetica();
    const fit = fitFontSize([{ field: "a", width: 500, height: 6, text: "Hi" }], font, { max: 10, min: 4 });
    expect(font.heightAtSize(fit.fontSize)).toBeLessThanOrEqual(6);
  });
});
