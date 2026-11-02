import fs from "node:fs/promises";
import path from "node:path";
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFStream,
  decodePDFRawStream,
  type PDFPage,
} from "pdf-lib";
import { AUTHORED_DOC_SIGNATURE_HEADING } from "@/config/filingPackage";
import { describePbaCode, isValidPbaCode } from "@/lib/irsCodes";
import { BUSINESS_ACTIVITIES } from "@/lib/irsCodes/presets";
import { form5472FieldMap } from "./fieldMaps";
import { form1120MapForRevision, type PackageRecord, type PackageRecordYear } from "./generatePackage";
import { US_STATE_NAMES } from "./textFormat";

// ─────────────────────────────────────────────────────────────────────────────
// Post-generation validator (generator 2.4.0, fix spec §5).
//
// Every other pre-flight check reads the PackageRecord — what the generator
// SAYS it wrote. This one opens the produced PDF bytes and reads what was
// actually drawn: the flattened widget XObjects on the IRS form pages
// (/FlatWidget-*, located by their widget rectangle in the blank form) and
// the text shows on the pages we author. That is the only way to catch a
// value that exists in the file but never renders (spec P0-1: line 8a's
// address sat below its field's clip box, so text extraction passed).
//
// The record is used only for STRUCTURE (page ranges, Form 1120 revision, tax
// period) and for INTAKE facts to compare against (LLC name, EIN, formation
// state, owner postal code). Pure pdf-lib on purpose: pdfjs-dist is a browser
// bundle here and the validator runs inside the Stripe webhook / checkout.
//
// Codes (A37/A38 and W42-W45 are reserved by the sys-p0 lane):
//   A39 clip box   A40 name/EIN/year   A41 1f/1h/Part V total   A42 PBA codes
//   A43 lines 2/3/43   A44 4a == 8a   A45 formation state   A46 1120 header
//   A47 perjury wording   A48 Part V dates   A49 foreign address   A50 FTIN
//   A51 validator could not read the package (set by the pre-flight wrapper)
//   W46 formation state missing   W47 1d text vs code description
// ─────────────────────────────────────────────────────────────────────────────

export type ValidationIssue = { id: string; message: string };
export type ValidationResult = { failures: ValidationIssue[]; warnings: ValidationIssue[] };

type Show = { y: number; text: string; font: string };
type WidgetDraw = { x: number; y: number; name: string };
export type DrawnField = { text: string; checked: boolean };

const FORMS_DIR = path.join(process.cwd(), "public", "forms");
// Form 5472 lines 43b(1)/43b(2): unmapped in fieldMaps (the generator never
// writes them); names from enumerating the blank f5472.pdf page 3 (y 384/372).
const LINE_43B_FIELDS = ["topmostSubform[0].Page3[0].f3_5[0]", "topmostSubform[0].Page3[0].f3_6[0]"];

// ── PDF reading ─────────────────────────────────────────────────────────────

function streamText(stream: unknown): string {
  if (stream instanceof PDFRawStream) return Buffer.from(decodePDFRawStream(stream).decode()).toString("latin1");
  if (stream instanceof PDFStream) return Buffer.from(stream.getContents()).toString("latin1");
  return "";
}

function pageContent(doc: PDFDocument, page: PDFPage): string {
  const contents = page.node.Contents();
  if (!contents) return "";
  const parts = contents instanceof PDFArray ? contents.asArray().map((ref) => doc.context.lookup(ref)) : [contents];
  return parts.map(streamText).join("\n");
}

let winAnsi: TextDecoder | null = null;
function decodeWinAnsi(bytes: number[]): string {
  try {
    winAnsi ??= new TextDecoder("windows-1252");
    return winAnsi.decode(Uint8Array.from(bytes));
  } catch {
    return Buffer.from(bytes).toString("latin1");
  }
}

type Token = { kind: "num"; v: number } | { kind: "str"; v: string } | { kind: "name"; v: string } | { kind: "arr"; v: Token[] } | { kind: "op"; v: string };

// Minimal content-stream tokenizer: enough for pdf-lib's own appearance and
// drawText streams and the IRS checkbox appearances (no inline images).
function tokenize(s: string): Token[] {
  const out: Token[] = [];
  const stack: Token[][] = [];
  const push = (t: Token) => (stack.length ? stack[stack.length - 1] : out).push(t);
  let i = 0;
  const delim = /[\s()<>[\]{}/%]/;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === "%") { while (i < s.length && s[i] !== "\n" && s[i] !== "\r") i++; continue; }
    if (c === "(") {
      const bytes: number[] = [];
      let depth = 1;
      i++;
      while (i < s.length && depth > 0) {
        const ch = s[i];
        if (ch === "\\") {
          const n = s[i + 1];
          const esc: Record<string, number> = { n: 10, r: 13, t: 9, b: 8, f: 12, "(": 40, ")": 41, "\\": 92 };
          if (n in esc) { bytes.push(esc[n]); i += 2; continue; }
          const oct = /^[0-7]{1,3}/.exec(s.slice(i + 1, i + 4));
          if (oct) { bytes.push(parseInt(oct[0], 8) & 0xff); i += 1 + oct[0].length; continue; }
          i += 2; // line continuation or unknown escape
          continue;
        }
        if (ch === "(") depth++;
        if (ch === ")" && --depth === 0) { i++; break; }
        bytes.push(ch.charCodeAt(0) & 0xff);
        i++;
      }
      push({ kind: "str", v: decodeWinAnsi(bytes) });
      continue;
    }
    if (c === "<" && s[i + 1] === "<") { i += 2; continue; }
    if (c === ">" && s[i + 1] === ">") { i += 2; continue; }
    if (c === "<") {
      const end = s.indexOf(">", i);
      const hex = s.slice(i + 1, end < 0 ? s.length : end).replace(/\s+/g, "");
      const bytes: number[] = [];
      for (let k = 0; k < hex.length; k += 2) bytes.push(parseInt(hex.slice(k, k + 2).padEnd(2, "0"), 16));
      push({ kind: "str", v: decodeWinAnsi(bytes) });
      i = end < 0 ? s.length : end + 1;
      continue;
    }
    if (c === "[") { stack.push([]); i++; continue; }
    if (c === "]") { const arr = stack.pop() ?? []; push({ kind: "arr", v: arr }); i++; continue; }
    let j = i + 1;
    while (j < s.length && !delim.test(s[j])) j++;
    const word = s.slice(i, j);
    i = j;
    if (c === "/") push({ kind: "name", v: word.slice(1) });
    else if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(word)) push({ kind: "num", v: Number(word) });
    else push({ kind: "op", v: word });
  }
  return out;
}

// Every non-empty text show with the y of its text line (text space of the
// stream, i.e. the XObject's BBox space for a flattened widget).
function textShows(content: string): Show[] {
  const shows: Show[] = [];
  let operands: Token[] = [];
  let lineY = 0;
  let leading = 0;
  let font = "";
  const nums = () => operands.filter((t): t is { kind: "num"; v: number } => t.kind === "num").map((t) => t.v);
  const show = (tokens: Token[]) => {
    const text = tokens
      .flatMap((t) => (t.kind === "arr" ? t.v : [t]))
      .filter((t): t is { kind: "str"; v: string } => t.kind === "str")
      .map((t) => t.v)
      .join("");
    if (text.trim()) shows.push({ y: lineY, text, font });
  };
  for (const token of tokenize(content)) {
    if (token.kind !== "op") { operands.push(token); continue; }
    const n = nums();
    switch (token.v) {
      case "BT": lineY = 0; break;
      case "Tm": if (n.length >= 6) lineY = n[5]; break;
      case "Td": if (n.length >= 2) lineY += n[1]; break;
      case "TD": if (n.length >= 2) { lineY += n[1]; leading = -n[1]; } break;
      case "TL": if (n.length >= 1) leading = n[0]; break;
      case "T*": lineY -= leading; break;
      case "Tf": { const name = operands.find((t) => t.kind === "name"); font = name ? name.v : font; break; }
      case "Tj": case "TJ": show(operands); break;
      case "'": case '"': lineY -= leading; show(operands); break;
    }
    operands = [];
  }
  return shows;
}

function bboxOf(stream: PDFRawStream | PDFStream): [number, number, number, number] | null {
  const box = stream.dict.lookup(PDFName.of("BBox"));
  if (!(box instanceof PDFArray) || box.size() !== 4) return null;
  const v = box.asArray().map((n) => (n instanceof PDFNumber ? n.asNumber() : NaN));
  return v.some(Number.isNaN) ? null : [v[0], v[1], v[2], v[3]];
}

function flatWidgetStreams(page: PDFPage): Map<string, PDFRawStream | PDFStream> {
  const out = new Map<string, PDFRawStream | PDFStream>();
  const xobjects = page.node.Resources()?.lookup(PDFName.of("XObject"));
  if (!(xobjects instanceof PDFDict)) return out;
  for (const [key, value] of xobjects.entries()) {
    const name = key.asString().replace(/^\//, "");
    if (!name.startsWith("FlatWidget")) continue;
    const stream = page.doc.context.lookup(value);
    if (stream instanceof PDFRawStream || stream instanceof PDFStream) out.set(name, stream);
  }
  return out;
}

// pdf-lib's flatten() draws each widget as "q 1 0 0 1 x y cm ... /FlatWidget-n Do Q".
function widgetDraws(content: string): WidgetDraw[] {
  const re = /1 0 0 1 (-?[\d.]+) (-?[\d.]+) cm\s+(?:1 0 0 1 0 0 cm\s+)*\/(FlatWidget-[\w.-]+) Do/g;
  return Array.from(content.matchAll(re), (m) => ({ x: Number(m[1]), y: Number(m[2]), name: m[3] }));
}

type Rect = { page: number; x: number; y: number };
const blankRects = new Map<string, Promise<Map<string, Rect>>>();

function rectsFor(fileName: string): Promise<Map<string, Rect>> {
  let pending = blankRects.get(fileName);
  if (!pending) {
    pending = (async () => {
      const blank = await PDFDocument.load(await fs.readFile(path.join(FORMS_DIR, fileName)));
      const rects = new Map<string, Rect>();
      for (const field of blank.getForm().getFields()) {
        const widget = field.acroField.getWidgets()[0];
        const pageNo = /\.Page(\d+)\[/.exec(field.getName());
        if (!widget || !pageNo) continue;
        const r = widget.getRectangle();
        rects.set(field.getName(), { page: Number(pageNo[1]), x: r.x, y: r.y });
      }
      return rects;
    })();
    pending.catch(() => blankRects.delete(fileName));
    blankRects.set(fileName, pending);
  }
  return pending;
}

class PackageReader {
  private readonly contentCache = new Map<number, string>();
  constructor(readonly doc: PDFDocument) {}

  content(pageNo: number): string {
    let text = this.contentCache.get(pageNo);
    if (text === undefined) {
      text = pageContent(this.doc, this.doc.getPage(pageNo - 1));
      this.contentCache.set(pageNo, text);
    }
    return text;
  }

  // Text lines we drew on an authored page (cover letter, statements).
  lines(pageNo: number): string[] {
    return textShows(this.content(pageNo)).map((s) => s.text);
  }

  // What the flattened widget at a blank-form rectangle actually draws.
  async field(fileName: string, formStartPage: number, fieldName: string): Promise<DrawnField | null> {
    const rect = (await rectsFor(fileName)).get(fieldName);
    if (!rect) return null;
    const pageNo = formStartPage + rect.page - 1;
    if (pageNo < 1 || pageNo > this.doc.getPageCount()) return null;
    const draw = widgetDraws(this.content(pageNo)).find(
      (d) => Math.abs(d.x - rect.x) < 0.01 && Math.abs(d.y - rect.y) < 0.01,
    );
    if (!draw) return null;
    const stream = flatWidgetStreams(this.doc.getPage(pageNo - 1)).get(draw.name);
    if (!stream) return null;
    const shows = textShows(streamText(stream));
    return {
      text: shows.filter((s) => s.font !== "ZaDb").map((s) => s.text).join("\n"),
      checked: shows.some((s) => s.font === "ZaDb"),
    };
  }
}

// ── Package-level helpers ───────────────────────────────────────────────────

function pagesFor(record: PackageRecord, label: string, taxYear?: number): number[] {
  return record.pageOrder
    .filter((p) => p.label === label && (taxYear === undefined || p.taxYear === taxYear))
    .flatMap((p) => Array.from({ length: p.endPage - p.startPage + 1 }, (_, k) => p.startPage + k));
}

function startPage(record: PackageRecord, label: string, taxYear: number): number | null {
  return record.pageOrder.find((p) => p.label === label && p.taxYear === taxYear)?.startPage ?? null;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTH_RE = "(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";

type FoundDate = { text: string; y: number; m: number; d: number | null };

// Dates written in a statement, in the shapes clients actually type:
// 10/27/2026, 27/10/2026 (day first when the first number > 12), 2026-10-27,
// Oct 27 2026, October 27, 2026, 27 Oct 2026, and month-only "Oct 2026".
export function datesIn(text: string): FoundDate[] {
  const found: FoundDate[] = [];
  const valid = (y: number, m: number, d: number | null) =>
    y >= 1900 && y <= 2200 && m >= 1 && m <= 12 && (d === null || (d >= 1 && d <= 31));
  const add = (raw: string, y: number, m: number, d: number | null) => {
    if (valid(y, m, d)) found.push({ text: raw, y, m, d });
  };
  for (const x of text.matchAll(/\b(\d{1,2})[/.](\d{1,2})[/.](\d{4})\b/g)) {
    const a = Number(x[1]);
    const b = Number(x[2]);
    if (a > 12) add(x[0], Number(x[3]), b, a);
    else add(x[0], Number(x[3]), a, b);
  }
  for (const x of text.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) add(x[0], Number(x[1]), Number(x[2]), Number(x[3]));
  const monthIndex = (s: string) => MONTHS.indexOf(s.toLowerCase().slice(0, 3)) + 1;
  const covered: Array<[number, number]> = [];
  for (const x of text.matchAll(new RegExp(`\\b${MONTH_RE}\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`, "gi"))) {
    add(x[0], Number(x[3]), monthIndex(x[1]), Number(x[2]));
    covered.push([x.index ?? 0, (x.index ?? 0) + x[0].length]);
  }
  for (const x of text.matchAll(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+${MONTH_RE},?\\s+(\\d{4})\\b`, "gi"))) {
    add(x[0], Number(x[3]), monthIndex(x[2]), Number(x[1]));
    covered.push([x.index ?? 0, (x.index ?? 0) + x[0].length]);
  }
  for (const x of text.matchAll(new RegExp(`\\b${MONTH_RE},?\\s+(\\d{4})\\b`, "gi"))) {
    const at = x.index ?? 0;
    if (covered.some(([s, e]) => at >= s && at < e)) continue;
    add(x[0], Number(x[2]), monthIndex(x[1]), null);
  }
  return found;
}

function dateOutsidePeriod(date: FoundDate, year: PackageRecordYear): boolean {
  const [sm, sd] = year.periodStart.split("/").map(Number);
  const [em, ed] = year.periodEnd.split("/").map(Number);
  const start = Date.UTC(year.taxYear, sm - 1, sd);
  const end = Date.UTC(year.taxYear, em - 1, ed);
  if (date.d === null) {
    // Month only: outside when the whole month misses the period.
    const first = Date.UTC(date.y, date.m - 1, 1);
    const last = Date.UTC(date.y, date.m, 0);
    return last < start || first > end;
  }
  const at = Date.UTC(date.y, date.m - 1, date.d);
  return at < start || at > end;
}

const PAIRING_STOPWORDS = new Set([
  "services", "service", "other", "related", "including", "activities", "activity", "general",
  "products", "product", "business", "company", "online", "with", "from", "and", "the",
]);

function significantWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !PAIRING_STOPWORDS.has(w));
}

// True when the line 1d text plausibly describes the printed code: a wizard
// preset pairing, or at least one shared meaningful word (5-letter stem).
export function activityMatchesCode(activity: string, code: string, taxYear: number): boolean {
  if (BUSINESS_ACTIVITIES.some((p) => p.activity === activity.trim() && p.code === code)) return true;
  const description = describePbaCode(code, taxYear);
  if (!description) return false;
  const stems = new Set(significantWords(description).map((w) => w.slice(0, 5)));
  return significantWords(activity).some((w) => stems.has(w.slice(0, 5)));
}

// ── The validator ───────────────────────────────────────────────────────────

export async function validatePackage(bytes: Uint8Array, record: PackageRecord): Promise<ValidationResult> {
  const result: ValidationResult = { failures: [], warnings: [] };
  const fail = (id: string, message: string) => result.failures.push({ id, message });
  const warn = (id: string, message: string) => result.warnings.push({ id, message });
  const doc = await PDFDocument.load(bytes);
  const reader = new PackageReader(doc);
  const pageCount = doc.getPageCount();

  const lastListed = Math.max(0, ...record.pageOrder.map((p) => p.endPage));
  if (lastListed > pageCount) {
    fail("A51", `The package has ${pageCount} pages but its page order lists ${lastListed}.`);
    return result;
  }

  // A39: every flattened field's text lies inside its clip box. pdf-lib clips
  // a field appearance to its BBox inset by 1pt, so a baseline outside
  // [y0+1, y1-1] is drawn into the file but never rendered.
  for (let pageNo = 1; pageNo <= pageCount; pageNo++) {
    for (const [name, stream] of Array.from(flatWidgetStreams(doc.getPage(pageNo - 1)))) {
      const box = bboxOf(stream);
      if (!box) continue;
      for (const s of textShows(streamText(stream))) {
        if (s.y < box[1] + 1 || s.y > box[3] - 1) {
          fail(
            "A39",
            `Page ${pageNo}: text "${s.text.slice(0, 40)}" in ${name} is drawn at y=${s.y.toFixed(2)}, outside its ` +
              `field's visible box (height ${(box[3] - box[1]).toFixed(2)}); it will not print.`,
          );
        }
      }
    }
  }

  const authoredText = (pages: number[]) => pages.map((p) => reader.lines(p).join(" ")).join(" ");

  // A47 (cover letter half): transmittal letter, never perjury wording.
  for (const pageNo of pagesFor(record, "Cover letter")) {
    if (/penalties of perjury/i.test(reader.lines(pageNo).join(" "))) {
      fail("A47", `Page ${pageNo}: the cover letter contains "penalties of perjury" wording.`);
    }
  }
  // A40 (authored pages): every page we write names the LLC and its EIN.
  for (const entry of record.pageOrder) {
    if (entry.label === "Form 1120" || entry.label === "Form 5472") continue;
    for (let pageNo = entry.startPage; pageNo <= entry.endPage; pageNo++) {
      const text = reader.lines(pageNo).join(" ");
      if (!text.includes(record.llcName) || !text.includes(record.llcEin)) {
        fail("A40", `Page ${pageNo} (${entry.label}) does not show the LLC name and EIN exactly as on the forms.`);
      }
      if (entry.taxYear !== undefined && !text.includes(String(entry.taxYear))) {
        fail("A40", `Page ${pageNo} (${entry.label}) does not show tax year ${entry.taxYear}.`);
      }
    }
  }

  for (const year of record.taxYears) {
    const ty = year.taxYear;
    const p1120 = startPage(record, "Form 1120", ty);
    const p5472 = startPage(record, "Form 5472", ty);
    if (p1120 === null || p5472 === null) {
      fail("A51", `Tax year ${ty}: the package has no Form 1120 or Form 5472 pages.`);
      continue;
    }
    const f1120 = `f1120--${year.revisionUsed}.pdf`;
    const m1120 = form1120MapForRevision(Number(year.revisionUsed));
    const m = form5472FieldMap;
    const read5472 = (name: string) => reader.field("f5472.pdf", p5472, name);
    const read1120 = (name: string) => reader.field(f1120, p1120, name);
    const text = (field: DrawnField | null) => field?.text.trim() ?? "";

    // A40: name, EIN and year identical on both forms.
    const nameEin: Array<[string, string, string]> = [
      ["Form 1120 name", text(await read1120(m1120["1a_name"])), record.llcName],
      ["Form 5472 line 1a", text(await read5472(m["1a_name"])), record.llcName],
      ["Form 1120 item B", text(await read1120(m1120.B_ein)), record.llcEin],
      ["Form 5472 line 1b", text(await read5472(m["1b_ein"])), record.llcEin],
      ["Form 5472 header begin year", text(await read5472(m.taxYearBeginYear)), String(ty)],
      ["Form 5472 header end year", text(await read5472(m.taxYearEndYear)), String(ty)],
    ];
    for (const [label, printed, expected] of nameEin) {
      if (printed !== expected) fail("A40", `Tax year ${ty}: ${label} prints "${printed}", expected "${expected}".`);
    }

    // A46: 1120 tax-year beginning / ending / year all printed.
    const begin = text(await read1120(m1120.taxYearBeginning));
    const end = text(await read1120(m1120.taxYearEnding));
    const yy = text(await read1120(m1120.taxYearEndingYear2));
    if (!begin || !end || !yy) {
      fail("A46", `Tax year ${ty}: the Form 1120 tax-year beginning/ending fields are blank on the printed page.`);
    } else if (yy !== String(ty).slice(-2)) {
      fail("A40", `Tax year ${ty}: Form 1120 header year prints "${yy}".`);
    }

    // A43: lines 2 and 3 ticked; 43a and 43b left blank.
    if (!(await read5472(m.box2_foreign50pct))?.checked) fail("A43", `Tax year ${ty}: Form 5472 line 2 is not ticked on the printed page.`);
    if (!(await read5472(m.box3_foreignOwnedUsDE))?.checked) fail("A43", `Tax year ${ty}: Form 5472 line 3 is not ticked on the printed page.`);
    for (const name of [m.q43a_coveredDebt_yes, m.q43a_coveredDebt_no, ...LINE_43B_FIELDS]) {
      const drawn = await read5472(name);
      if (drawn && (drawn.checked || drawn.text.trim())) {
        fail("A43", `Tax year ${ty}: Form 5472 line 43a/43b is marked on the printed page (must be blank for a DE).`);
        break;
      }
    }

    // A44 / A49: 4a and 8a print the same single line with a complete foreign address.
    const line4a = text(await read5472(m["4a_nameAddress"]));
    const line8a = text(await read5472(m["8a_nameAddress"]));
    if (!line4a || line4a !== line8a || line4a.includes("\n")) {
      fail("A44", `Tax year ${ty}: Form 5472 line 8a ("${line8a.slice(0, 60)}") does not print the same single line as 4a.`);
    }
    if (line4a) {
      const legacy = !year.ownerAddressState && !year.ownerAddressPostal && year.ownerNoPostalCode === null;
      const postal = year.ownerAddressPostal?.trim();
      if (!legacy && year.ownerNoPostalCode !== true && (!postal || !line4a.includes(postal))) {
        fail("A49", `Tax year ${ty}: the owner address on line 4a/8a has no postal code.`);
      }
      const country = line4a.split(",").pop()?.trim() ?? "";
      if (/^[A-Z]{2,3}$/.test(country) || /^([A-Z]\.){2,4}$/.test(country)) {
        fail("A49", `Tax year ${ty}: the owner address on line 4a/8a ends in "${country}"; write the country name in full.`);
      }
    }

    // A50: FTIN unspaced, and "None" only when the owner has none.
    for (const [label, name] of [["4b(3)", m["4b3_ftin"]], ["8b(3)", m["8b3_ftin"]]] as const) {
      const ftin = text(await read5472(name));
      if (/\s/.test(ftin)) fail("A50", `Tax year ${ty}: Form 5472 line ${label} FTIN contains spaces.`);
      if (/^none$/i.test(ftin) && year.ownerHasFtin === true) {
        fail("A50", `Tax year ${ty}: Form 5472 line ${label} prints "None" but the owner said they have a foreign tax ID.`);
      }
    }

    // A42 / W47: codes on the stored i1120 list; descriptions present and paired.
    const line1d = text(await read5472(m["1d_businessActivity"]));
    const line8c = text(await read5472(m["8c_businessActivity"]));
    for (const [label, name] of [["1e", m["1e_businessCode"]], ["8d", m["8d_businessCode"]]] as const) {
      const code = text(await read5472(name));
      if (!isValidPbaCode(code, ty)) {
        fail("A42", `Tax year ${ty}: Form 5472 line ${label} prints code "${code}", which is not on the IRS Form 1120 Principal Business Activity list.`);
      }
    }
    if (!line1d || !line8c) fail("A42", `Tax year ${ty}: Form 5472 line 1d or 8c business activity is blank on the printed page.`);
    const code1e = text(await read5472(m["1e_businessCode"]));
    if (line1d && isValidPbaCode(code1e, ty) && !activityMatchesCode(line1d, code1e, ty)) {
      warn(
        "W47",
        `Tax year ${ty}: line 1d "${line1d}" may not describe code ${code1e} (${describePbaCode(code1e, ty)}). ` +
          "Confirm the activity and code describe the same business (lines 8c/8d mirror them).",
      );
    }

    // A41: 1f == 1h == the Part V statement's closing total (and its schedule total).
    const line1f = text(await read5472(m["1f_totalPaymentsThisForm"]));
    const line1h = text(await read5472(m["1h_totalPaymentsAllForms"]));
    const statement = pagesFor(record, "Part V Statement", ty);
    const statementLines = statement.flatMap((p) => reader.lines(p));
    const closing = /Form 5472 lines 1f and 1h: \$([\d,]+)\./.exec(statementLines.join(" "));
    const closingDollars = closing ? closing[1].replace(/,/g, "") : null;
    if (!/^\d+$/.test(line1f) || line1f !== line1h || line1f !== closingDollars) {
      fail("A41", `Tax year ${ty}: line 1f (${line1f || "blank"}), line 1h (${line1h || "blank"}) and the Part V statement total ($${closingDollars ?? "missing"}) differ.`);
    } else if (!statementLines.some((l) => l.startsWith("Form 5472 lines 1f and 1h also include"))) {
      const totalAt = statementLines.findIndex((l) => l.startsWith("Total Part V reportable transactions"));
      const amount = totalAt >= 0 ? /^\$([\d,]+\.\d{2})$/.exec(statementLines[totalAt + 1] ?? "") : null;
      const cents = amount ? Math.round(Number(amount[1].replace(/,/g, "")) * 100) : 0;
      // Same half-up whole-dollar rounding as the generator's line 1f.
      if (amount && Math.floor((cents + 50) / 100) !== Number(line1f)) {
        fail("A41", `Tax year ${ty}: the Part V schedule total $${amount[1]} does not round to line 1f (${line1f}).`);
      }
    }

    // A48: no date in the Part V statement outside the tax period (client
    // free text is printed as typed; staff correct it, it is never rewritten).
    const outside = datesIn(statementLines.join("\n")).filter((d) => dateOutsidePeriod(d, year));
    for (const d of outside) {
      fail("A48", `Tax year ${ty}: the Part V statement mentions "${d.text}", outside the tax period ${year.periodStart}/${ty}-${year.periodEnd}/${ty}. Correct the row description.`);
    }

    // A45 / W46 / A47: the reasonable cause statement for this year.
    const rcsPages = pagesFor(record, "Reasonable Cause Statement", ty);
    if (rcsPages.length > 0) {
      const rcsText = authoredText(rcsPages);
      const formed = /I formed .+? \("the Company"\) on (.+?) as a single-member LLC/.exec(rcsText);
      const printedState = formed ? / in ([A-Z][A-Za-z ]+)$/.exec(formed[1])?.[1] ?? null : null;
      const expected = record.formationState ? US_STATE_NAMES[record.formationState] ?? null : null;
      if (!formed) {
        fail("A45", `Tax year ${ty}: the reasonable cause statement has no readable formation sentence.`);
      } else if (printedState !== expected) {
        fail("A45", `Tax year ${ty}: the reasonable cause statement says the LLC was formed in ${printedState ?? "(no state)"}, but the state of formation on file is ${expected ?? "(none)"}.`);
      } else if (!expected) {
        warn("W46", `Tax year ${ty}: no state of formation on file, so the reasonable cause statement leaves it out. Add it from the Articles of Organization (Edit filing fields).`);
      }
      const lastPage = reader.lines(rcsPages[rcsPages.length - 1]);
      if (!lastPage.includes(AUTHORED_DOC_SIGNATURE_HEADING)) {
        fail("A47", `Tax year ${ty}: the reasonable cause statement's signature block has no "${AUTHORED_DOC_SIGNATURE_HEADING}" heading.`);
      }
    }
  }
  return result;
}

// Field values as printed, for tests and diagnostics: one Form 5472/1120 per year.
export async function readPrintedFields(
  bytes: Uint8Array,
  record: PackageRecord,
  taxYear: number,
  fields: { form5472?: string[]; form1120?: string[] },
): Promise<Record<string, DrawnField | null>> {
  const reader = new PackageReader(await PDFDocument.load(bytes));
  const year = record.taxYears.find((y) => y.taxYear === taxYear);
  const p1120 = startPage(record, "Form 1120", taxYear);
  const p5472 = startPage(record, "Form 5472", taxYear);
  const out: Record<string, DrawnField | null> = {};
  if (!year || p1120 === null || p5472 === null) return out;
  for (const name of fields.form5472 ?? []) out[name] = await reader.field("f5472.pdf", p5472, name);
  for (const name of fields.form1120 ?? []) out[name] = await reader.field(`f1120--${year.revisionUsed}.pdf`, p1120, name);
  return out;
}

// Authored-page text lines, for tests and diagnostics.
export async function readPageLines(bytes: Uint8Array, pageNo: number): Promise<string[]> {
  return new PackageReader(await PDFDocument.load(bytes)).lines(pageNo);
}
