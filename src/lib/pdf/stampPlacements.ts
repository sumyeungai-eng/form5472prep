import { toPdfSafe, isPdfEncodable, PDF_TEXT_MESSAGE } from "../pdfText";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";

// "signature" = the CLIENT's own drawn signature (taxpayer line).
// "preparerSignature" = the signing admin's OWN signature for the 1120
// "Paid Preparer Use Only" box. "preparerName" is the handwritten name.
// These three images are never interchangeable.
export type Placement =
  | {
      kind: "preparerSignature" | "preparerName";
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      kind: "signature";
      page: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      kind: "date";
      page: number;
      x: number;
      y: number;
      text: string;
      fontSize: number;
    }
  | {
      kind: "text";
      page: number;
      x: number;
      y: number;
      text: string;
      fontSize: number;
    };

export function parsePlacements(
  body: unknown,
  opts: { allowPreparerSignature?: boolean } = {},
): { ok: true; placements: Placement[] } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "placements array required" };
  }
  const input = body as { placements?: unknown };
  if (!Array.isArray(input.placements) || input.placements.length === 0) {
    return { ok: false, error: "placements array required" };
  }

  const placements: Placement[] = [];
  for (const raw of input.placements as unknown[]) {
    if (!raw || typeof raw !== "object") {
      return { ok: false, error: "placement entry must be an object" };
    }
    const p = raw as Record<string, unknown>;
    if ((p.kind === "preparerSignature" || p.kind === "preparerName") && !opts.allowPreparerSignature) {
      return { ok: false, error: p.kind === "preparerName" ? "preparer names are not supported here" : "preparer signatures are not supported here" };
    }
    const kind: Placement["kind"] =
      p.kind === "date"
        ? "date"
        : p.kind === "text"
          ? "text"
          : p.kind === "preparerSignature" || p.kind === "preparerName"
            ? p.kind
            : "signature";
    const page = Number(p.page);
    const x = Number(p.x);
    const y = Number(p.y);
    if (!Number.isFinite(page) || page < 1) {
      return { ok: false, error: `bad page ${p.page}` };
    }
    if ([x, y].some((n) => !Number.isFinite(n))) {
      return { ok: false, error: "x/y must be numbers" };
    }
    if (kind === "signature" || kind === "preparerSignature" || kind === "preparerName") {
      const width = Number(p.width);
      const height = Number(p.height);
      if ([width, height].some((n) => !Number.isFinite(n))) {
        return { ok: false, error: "width/height must be numbers" };
      }
      if (width <= 0 || height <= 0 || width > 612 || height > 200) {
        return { ok: false, error: "signature width/height out of range" };
      }
      placements.push({ kind, page: Math.round(page), x, y, width, height });
    } else {
      const maxLen = kind === "date" ? 60 : 200;
      const text = typeof p.text === "string" ? p.text : "";
      const fontSize = Number(p.fontSize);
      if (!text.trim()) {
        return { ok: false, error: `${kind} placement requires non-empty text` };
      }
      if (!isPdfEncodable(text)) return { ok: false, error: PDF_TEXT_MESSAGE };
      if (text.length > maxLen) {
        return { ok: false, error: `${kind} text too long (max ${maxLen} chars)` };
      }
      if (!Number.isFinite(fontSize) || fontSize < 4 || fontSize > 40) {
        return { ok: false, error: `${kind} fontSize out of range (4-40 pt)` };
      }
      placements.push({ kind, page: Math.round(page), x, y, text: text.trim(), fontSize });
    }
  }

  if (placements.length === 0) {
    return { ok: false, error: "no placements provided" };
  }

  return { ok: true, placements };
}

export async function chromaKeySignaturePng(pngBytes: Uint8Array): Promise<Uint8Array> {
  const img = sharp(Buffer.from(pngBytes)).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length);
  data.copy(out);

  const TH = 240;
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    if (r >= TH && g >= TH && b >= TH) {
      out[i + 3] = 0;
    }
  }

  return new Uint8Array(
    await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png()
      .toBuffer(),
  );
}

export async function stampPlacements(
  pdfBytes: Uint8Array,
  signaturePngBytes: Uint8Array | null,
  placements: Placement[],
  preparerSignaturePngBytes: Uint8Array | null = null,
  preparerNamePngBytes: Uint8Array | null = null,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBytes, { updateMetadata: false });
  const imageBytes = { signature: signaturePngBytes, preparerSignature: preparerSignaturePngBytes, preparerName: preparerNamePngBytes };
  const images = new Map<string, Awaited<ReturnType<PDFDocument["embedPng"]>>>();
  for (const kind of ["signature", "preparerSignature", "preparerName"] as const) {
    if (!placements.some((p) => p.kind === kind)) continue;
    const bytes = imageBytes[kind];
    if (!bytes) throw new Error(`Missing image for ${kind} placement`);
    images.set(kind, await pdf.embedPng(await chromaKeySignaturePng(bytes)));
  }
  const needsTextFont = placements.some((p) => p.kind === "date" || p.kind === "text");
  const textFont = needsTextFont ? await pdf.embedFont(StandardFonts.Helvetica) : null;

  for (const p of placements) {
    const idx = p.page - 1;
    if (idx < 0 || idx >= pdf.getPageCount()) {
      continue;
    }
    const page = pdf.getPage(idx);
    if (p.kind === "signature" || p.kind === "preparerSignature" || p.kind === "preparerName") {
      page.drawImage(images.get(p.kind)!, { x: p.x, y: p.y, width: p.width, height: p.height });
    } else if ((p.kind === "date" || p.kind === "text") && textFont) {
      page.drawText(toPdfSafe(p.text), {
        x: p.x,
        y: p.y,
        size: p.fontSize,
        font: textFont,
        color: rgb(0, 0, 0),
      });
    }
  }

  return pdf.save();
}
