import sharp from "sharp";

// Decodes the preparer's drawn signature sent by the place-signature tool as a
// PNG data URL (or bare base64). Returns null for anything that isn't a
// reasonably sized PNG, so the route can reject it with a clear message.
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
export const MAX_PREPARER_SIGNATURE_BYTES = 1024 * 1024;

export function decodePngDataUrl(input: unknown): Uint8Array | null {
  if (typeof input !== "string" || input.length < 32) return null;
  const match = input.match(/^data:image\/png;base64,([\s\S]+)$/);
  const b64 = (match ? match[1] : input).replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/]+=*$/.test(b64)) return null;
  const bytes = new Uint8Array(Buffer.from(b64, "base64"));
  if (bytes.length < PNG_MAGIC.length || bytes.length > MAX_PREPARER_SIGNATURE_BYTES) return null;
  return PNG_MAGIC.every((b, i) => bytes[i] === b) ? bytes : null;
}

// The magic-byte check above can be fooled by a corrupt file; confirm sharp can
// actually read it (and that it's a sane size) so a bad upload is a 400, not a
// stamping crash.
export async function isReadablePng(bytes: Uint8Array): Promise<boolean> {
  try {
    const meta = await sharp(Buffer.from(bytes)).metadata();
    return meta.format === "png" && !!meta.width && !!meta.height && meta.width <= 4000 && meta.height <= 2000;
  } catch {
    return false;
  }
}
