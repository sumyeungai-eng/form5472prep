import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

// Renders a one-page "IRS FAX TRANSMISSION RECEIPT" PDF that customers can
// keep as proof of on-time filing under IRC § 6038A. Layout mirrors what
// competitors offer: bold header, green DELIVERED status, two-column
// key/value rows, and a legal paragraph at the bottom citing the IRC code.
//
// Pure, dependency-light (pdf-lib only). Callers pass the proof data and
// get raw PDF bytes back — they decide where to store + attach it.

export type FaxReceiptInput = {
  // Identity
  filingId: string;
  llcName: string | null;
  llcEin: string | null;
  taxYears: number[];
  ownerName: string | null;

  // Fax transmission
  telnyxFaxId: string;
  // Fax number we sent from (rented from Telnyx) and to (IRS Ogden PIN Unit).
  fromFax: string | null;
  toFax: string | null;
  submittedAtIso: string; // when we POST-ed to Telnyx
  deliveredAtIso: string; // when Telnyx confirmed delivery
  pageCount: number | null;

  // Optional: brand line and product description below the header.
  brandLine?: string;
};

const PAGE_WIDTH = 612; // US Letter, pts
const PAGE_HEIGHT = 792;

const TONE = {
  text: rgb(0.06, 0.09, 0.16), // ~ slate-900
  muted: rgb(0.38, 0.42, 0.48), // ~ slate-500
  rule: rgb(0.85, 0.87, 0.91), // ~ slate-200
  good: rgb(0.05, 0.55, 0.27), // ~ emerald-700
};

export async function generateFaxReceiptPdf(input: FaxReceiptInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);

  // Page margins (~0.75" on all sides except a slightly wider left so the
  // key/value columns breathe).
  const margin = { left: 56, right: 56, top: 64, bottom: 64 };
  let y = PAGE_HEIGHT - margin.top;

  // ---------- Header ----------
  drawText(page, "IRS FAX TRANSMISSION RECEIPT", margin.left, y, bold, 18, TONE.text);
  y -= 22;

  drawText(
    page,
    input.brandLine ?? "form5472prep.com — IRS Direct Delivery Service",
    margin.left,
    y,
    font,
    10,
    TONE.muted,
  );
  y -= 16;

  // Horizontal rule
  page.drawLine({
    start: { x: margin.left, y },
    end: { x: PAGE_WIDTH - margin.right, y },
    thickness: 0.75,
    color: TONE.rule,
  });
  y -= 26;

  // ---------- Status ----------
  drawText(page, "STATUS: DELIVERED", margin.left, y, bold, 14, TONE.good);
  y -= 26;

  // ---------- Key/value rows ----------
  // Two-column layout: label (left-aligned at margin) + value (left-aligned
  // at xValueCol). Value rows wrap onto multiple lines if needed.
  const xLabelCol = margin.left;
  const xValueCol = margin.left + 140;
  const rowHeight = 16;

  const rows: Array<[string, string, "text" | "mono"]> = [
    ["Transmission ID", input.filingId, "mono"],
    ["Telnyx Fax ID", input.telnyxFaxId, "mono"],
    ["LLC Name", input.llcName ?? "(not provided)", "text"],
    ["EIN", input.llcEin ?? "(not provided)", "mono"],
    ["Tax Year", input.taxYears.length === 0 ? "(not provided)" : input.taxYears.join(", "), "text"],
    ["Owner / Signer", input.ownerName ?? "(not provided)", "text"],
    [
      "Forms Transmitted",
      input.taxYears.length > 1
        ? `Pro Forma Form 1120 + Form 5472 (× ${input.taxYears.length} years)`
        : "Pro Forma Form 1120 + Form 5472",
      "text",
    ],
    ["From (Sender Fax)", input.fromFax ?? "(unknown)", "mono"],
    ["To (IRS Fax)", input.toFax ?? "+1-855-887-7737", "mono"],
    ["Submitted At (UTC)", formatIsoUtc(input.submittedAtIso), "mono"],
    ["Delivered At (UTC)", formatIsoUtc(input.deliveredAtIso), "mono"],
    ["Pages Transmitted", input.pageCount != null ? String(input.pageCount) : "(unknown)", "text"],
  ];

  for (const [label, value, kind] of rows) {
    drawText(page, label, xLabelCol, y, bold, 10, TONE.text);
    drawText(page, value, xValueCol, y, kind === "mono" ? mono : font, 10, TONE.text);
    y -= rowHeight;
  }

  y -= 12;
  page.drawLine({
    start: { x: margin.left, y },
    end: { x: PAGE_WIDTH - margin.right, y },
    thickness: 0.75,
    color: TONE.rule,
  });
  y -= 24;

  // ---------- Legal paragraphs ----------
  const llcLabel = input.llcName ?? "(unnamed LLC)";
  const einLabel = input.llcEin ?? "(EIN not provided)";
  const yearsLabel = input.taxYears.length === 0 ? "(no tax years)" : input.taxYears.join(", ");
  const yearWord = input.taxYears.length > 1 ? "Tax Years" : "Tax Year";
  const toLabel = input.toFax ?? "+1-855-887-7737";

  const legal1 =
    `This receipt confirms that IRS Form 5472 and Pro Forma Form 1120 for ${llcLabel}, ` +
    `EIN: ${einLabel}, ${yearWord} ${yearsLabel} were successfully transmitted to the ` +
    `Internal Revenue Service (IRS) at ${toLabel} on ${formatIsoUtc(input.deliveredAtIso)} UTC.`;

  const legal2 =
    `This timestamped transmission receipt constitutes proof of on-time filing and may be ` +
    `presented to the IRS in the event of any penalty assessment under IRC Section 6038A.`;

  y = drawParagraph(page, legal1, margin.left, y, font, 10, TONE.text, PAGE_WIDTH - margin.left - margin.right);
  y -= 10;
  y = drawParagraph(page, legal2, margin.left, y, font, 10, TONE.text, PAGE_WIDTH - margin.left - margin.right);

  // ---------- Footer ----------
  const footerY = margin.bottom - 16;
  drawText(
    page,
    `Generated ${formatIsoUtc(new Date().toISOString())} UTC by Form5472 Prep · form5472prep.com`,
    margin.left,
    footerY,
    font,
    8,
    TONE.muted,
  );

  return pdf.save();
}

// -------- helpers --------

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
) {
  page.drawText(text, { x, y, size, font, color });
}

// Naive word-wrap. Splits on whitespace, accumulates words until the next
// would overflow `maxWidth`, then breaks. Returns the next available y.
function drawParagraph(
  page: PDFPage,
  text: string,
  x: number,
  yStart: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  maxWidth: number,
): number {
  const words = text.split(/\s+/);
  const lineHeight = size * 1.4;
  let y = yStart;
  let buffer = "";

  for (const word of words) {
    const candidate = buffer ? `${buffer} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth) {
      page.drawText(buffer, { x, y, size, font, color });
      y -= lineHeight;
      buffer = word;
    } else {
      buffer = candidate;
    }
  }
  if (buffer) {
    page.drawText(buffer, { x, y, size, font, color });
    y -= lineHeight;
  }
  return y;
}

// "2026-03-28T10:36:28.212Z" -> "2026-03-28 10:36:28 UTC"-ish ISO, kept
// verbatim to maintain the unambiguous evidentiary look.
function formatIsoUtc(iso: string): string {
  if (!iso) return "(unknown)";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toISOString();
  } catch {
    return iso;
  }
}
