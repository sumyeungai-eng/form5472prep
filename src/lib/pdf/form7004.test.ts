import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { F7004, form7004FieldValues, form7004Warnings, generateForm7004, type Form7004Input } from "./form7004";

// Synthetic test data only.
const order: Form7004Input = {
  llcName: "Blue Harbor Trading LLC",
  ein: "987654321",
  llcStreet: "30 N Gould St Ste 1234",
  llcCity: "Sheridan",
  llcState: "WY",
  llcZip: "82801",
  taxYear: 2026,
};
const blank: Form7004Input = { llcName: null, ein: null, llcStreet: null, llcCity: null, llcState: null, llcZip: null, taxYear: null };

// PDF generation is CPU-bound; keep generous timeouts so a loaded CI box doesn't flake.
const SLOW = { timeout: 60_000 };

async function pageText(bytes: Uint8Array): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: false }).promise;
  const content = await (await doc.getPage(1)).getTextContent();
  return content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
}

describe("form7004FieldValues", () => {
  it("maps the order to the verified AcroForm fields", () => {
    const values = form7004FieldValues(order);
    expect(values[F7004.name]).toBe("Blue Harbor Trading LLC");
    expect(values[F7004.ein]).toBe("98-7654321");
    expect(values[F7004.street]).toBe("30 N Gould St Ste 1234");
    expect(values[F7004.city]).toBe("Sheridan");
    expect(values[F7004.state]).toBe("WY");
    expect(values[F7004.zip]).toBe("82801");
    // Part I line 1: Form 1120 = code 12, one digit per box.
    expect(values[F7004.formCodeDigit1]).toBe("1");
    expect(values[F7004.formCodeDigit2]).toBe("2");
    // Line 5a: "calendar year 20__".
    expect(values[F7004.calendarYear]).toBe("26");
    expect(values[F7004.tentativeTax]).toBe("0");
    expect(values[F7004.totalPayments]).toBe("0");
    expect(values[F7004.balanceDue]).toBe("0");
    // Room, country and the fiscal-year/short-year fields stay blank.
    expect(values).not.toHaveProperty(F7004.room);
    expect(values).not.toHaveProperty(F7004.country);
  });

  it("leaves blanks blank and never invents an EIN", () => {
    const values = form7004FieldValues(blank);
    expect(values[F7004.name]).toBe("");
    expect(values[F7004.ein]).toBe("");
    expect(values[F7004.calendarYear]).toBe("");
    expect(form7004FieldValues({ ...order, ein: "EIN 12 345" })[F7004.ein]).toBe("EIN 12 345");
  });
});

describe("form7004Warnings", () => {
  it("is empty for a complete order", () => {
    expect(form7004Warnings(order)).toEqual([]);
  });

  it("flags every missing field and a malformed EIN", () => {
    expect(form7004Warnings(blank)).toEqual([
      "No LLC name — line Name is blank.",
      "No EIN — Identifying number is blank.",
      "Address incomplete — missing street, city, state, ZIP.",
      "No tax year — line 5a is blank.",
    ]);
    expect(form7004Warnings({ ...order, ein: "12-34567" })).toEqual([
      "EIN is not 9 digits — check it against the IRS EIN letter.",
    ]);
  });
});

describe("generateForm7004", () => {
  it("fills, stamps and flattens a 1-page form with scrubbed metadata", SLOW, async () => {
    const bytes = await generateForm7004(order);
    const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getForm().getFields()).toHaveLength(0);
    expect(pdf.getTitle()).toBe("Form 7004 – Blue Harbor Trading LLC – 2026");
    expect(pdf.getAuthor() ?? "").toBe("");
    expect(pdf.getCreator() ?? "").toBe("");
    expect(pdf.getProducer() ?? "").toBe("");

    const text = await pageText(bytes);
    expect(text).toContain("Foreign-owned U.S. DE");
    for (const value of ["Blue Harbor Trading LLC", "98-7654321", "30 N Gould St Ste 1234", "Sheridan", "82801"]) {
      expect(text).toContain(value);
    }
  });

  it("still generates (stamped, flattened) when every order field is blank", SLOW, async () => {
    const bytes = await generateForm7004(blank);
    const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
    expect(pdf.getForm().getFields()).toHaveLength(0);
    expect(await pageText(bytes)).toContain("Foreign-owned U.S. DE");
  });

  it("does not throw on text the form font cannot encode", SLOW, async () => {
    const bytes = await generateForm7004({ ...order, llcName: "Łódź Trading 李明 LLC", llcCity: "São Paulo" });
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
  });
});
