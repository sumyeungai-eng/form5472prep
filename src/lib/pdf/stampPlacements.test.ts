import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { parsePlacements, stampPlacements } from "@/lib/pdf/stampPlacements";

describe("stampPlacements", () => {
  it("rejects malformed placement bodies", () => {
    expect(parsePlacements(null)).toEqual({ ok: false, error: "placements array required" });
    expect(parsePlacements({})).toEqual({ ok: false, error: "placements array required" });
    expect(parsePlacements({ placements: [] })).toEqual({ ok: false, error: "placements array required" });
    expect(parsePlacements({ placements: [null] })).toEqual({ ok: false, error: "placement entry must be an object" });
    expect(parsePlacements({ placements: [{ page: 0, x: 10, y: 10, width: 100, height: 40 }] })).toEqual({
      ok: false,
      error: "bad page 0",
    });
    expect(parsePlacements({ placements: [{ page: 1, x: "x", y: 10, width: 100, height: 40 }] })).toEqual({
      ok: false,
      error: "x/y must be numbers",
    });
    expect(parsePlacements({ placements: [{ page: 1, x: 10, y: 10, width: 0, height: 40 }] })).toEqual({
      ok: false,
      error: "signature width/height out of range",
    });
    expect(parsePlacements({ placements: [{ kind: "date", page: 1, x: 10, y: 10, text: "", fontSize: 10 }] })).toEqual({
      ok: false,
      error: "date placement requires non-empty text",
    });
  });

  it("accepts and normalizes valid placements", () => {
    expect(
      parsePlacements({
        placements: [
          { page: 1.2, x: 10, y: 20, width: 100, height: 35 },
          { kind: "date", page: 1, x: 40, y: 50, text: "  09/19/2026  ", fontSize: 11 },
          { kind: "text", page: 1, x: 60, y: 70, text: "Approved", fontSize: 9 },
        ],
      }),
    ).toEqual({
      ok: true,
      placements: [
        { kind: "signature", page: 1, x: 10, y: 20, width: 100, height: 35 },
        { kind: "date", page: 1, x: 40, y: 50, text: "09/19/2026", fontSize: 11 },
        { kind: "text", page: 1, x: 60, y: 70, text: "Approved", fontSize: 9 },
      ],
    });
  });

  it("stamps a generated PDF and keeps the page count", async () => {
    const pdf = await PDFDocument.create();
    pdf.addPage([300, 200]);
    const pdfBytes = await pdf.save();
    const pngBytes = new Uint8Array(
      await sharp({
        create: {
          width: 4,
          height: 4,
          channels: 4,
          background: { r: 20, g: 20, b: 20, alpha: 1 },
        },
      })
        .png()
        .toBuffer(),
    );

    const stamped = await stampPlacements(pdfBytes, pngBytes, [
      { kind: "signature", page: 1, x: 10, y: 20, width: 80, height: 24 },
      { kind: "date", page: 1, x: 100, y: 20, text: "09/19/2026", fontSize: 10 },
      { kind: "text", page: 2, x: 10, y: 10, text: "Skipped", fontSize: 10 },
    ]);

    const loaded = await PDFDocument.load(stamped);
    expect(loaded.getPageCount()).toBe(1);
  });
});
