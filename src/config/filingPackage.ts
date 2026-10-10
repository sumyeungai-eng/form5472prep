// Heading above the signature on the authored STATEMENTS (Part V, Part VI,
// reasonable-cause). The cover letter is only a transmittal letter, so it
// closes with COVER_LETTER_CLOSING instead (owner decision 2026-10-10); the
// Form 1120 carries its own IRS jurat.
export const AUTHORED_DOC_SIGNATURE_HEADING = "Signed under penalties of perjury:";
export const COVER_LETTER_CLOSING = "Sincerely,";
export const IRS_JURAT_UNTOUCHED = true;
export const PAID_PREPARER_BLOCK = "blank";
export const SIGNER_TITLE = "Sole Member";
export const IRS_FAX_NUMBER = "855-887-7737";
export const IRS_MAIL_ADDRESS =
  "Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112 Attn: PIN Unit, Ogden, UT 84201";
export const IRS_MAIL_ADDRESS_DISPLAY_LINES = [
  "Internal Revenue Service",
  "1973 Rulon White Blvd, M/S 6112",
  "Attn: PIN Unit",
  "Ogden, UT 84201",
] as const;
export const IRS_MAIL_ADDRESS_DISPLAY_SINGLE_LINE = `${IRS_MAIL_ADDRESS_DISPLAY_LINES[0]}, ${IRS_MAIL_ADDRESS_DISPLAY_LINES[1]} ${IRS_MAIL_ADDRESS_DISPLAY_LINES[2]}, ${IRS_MAIL_ADDRESS_DISPLAY_LINES[3]}`;
export const COVER_LETTER_ENCLOSURE_PHRASE = "pro forma Form 1120 with Form 5472 attached";
export const FAX_RENDER_DPI = 300;
// 2.1.0 (2026-10-05, review of a real 3-year package): Form 5472 lines 4a/8a
// print "Name, address" on one fitted line; header is "Foreign-owned U.S. DE"
// (no DIIRSP suffix); RCS owner nationality wording (Hong Kong / Macau
// permanent resident) and no-U.S.-income facts; per-year late treatment uses
// finalisedAt as "now"; $0 Part V statement wording; city/state display casing.
// 2.2.0 (2026-10-10): cover letter closes with "Sincerely," — no
// "Signed under penalties of perjury" heading on the cover letter (statements
// unchanged).
export const GENERATOR_VERSION = "2.2.0";
// The IRS-required marking written across the top of the pro forma Form 1120
// (Form 5472 instructions, "Foreign-owned U.S. DE"); also stamped on Form 5472.
// House position: no "DIIRSP" suffix or other procedure label on the forms.
export const FOREIGN_OWNED_DE_HEADER = "Foreign-owned U.S. DE";

export function assertIrsJuratUntouched() {
  if (IRS_JURAT_UNTOUCHED !== true) {
    throw new Error("IRS Form 1120 jurat must remain untouched");
  }
}
