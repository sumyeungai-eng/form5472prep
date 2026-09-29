import { StandardFontEmbedder } from "pdf-lib";

// Use pdf-lib's own WinAnsi repertoire, including punctuation outside Latin-1.
// This is synchronous so the wizard and server can share the same validation.
// Use the embedder's font-name type: pdf-lib's StandardFonts is a separate enum.
const winAnsi = StandardFontEmbedder.for(
  "Helvetica" as Parameters<typeof StandardFontEmbedder.for>[0],
).encoding;

export const PDF_TEXT_MESSAGE =
  "Use English letters only — as spelled in the Latin (English) letters on your passport or company documents.";

export function isPdfEncodable(text: string): boolean {
  return Array.from(text).every((char) =>
    winAnsi.canEncodeUnicodeCodePoint(char.codePointAt(0)!),
  );
}

// NFKD handles accented letters (including Ş, ğ, ő and ű). These Latin
// letters do not decompose, so provide their customary ASCII equivalents.
const LATIN_FALLBACKS: Readonly<Record<string, string>> = {
  Ł: "L", ł: "l", Đ: "D", đ: "d", ı: "i", Ħ: "H", ħ: "h",
  Ŧ: "T", ŧ: "t", Ŋ: "N", ŋ: "n", Ƶ: "Z", ƶ: "z", Ə: "E", ə: "e",
};

// Construct at runtime: this repo retains TypeScript's default compilation target.
const COMBINING_MARKS = new RegExp("\\p{M}", "gu");

/** Last-resort rendering safety for legacy/unvalidated text; never persist it. */
export function toPdfSafe(text: string): string {
  return Array.from(text.normalize("NFKD").replace(COMBINING_MARKS, ""), (char) => {
    const replacement = LATIN_FALLBACKS[char] ?? char;
    return isPdfEncodable(replacement) ? replacement : "?";
  }).join("");
}
