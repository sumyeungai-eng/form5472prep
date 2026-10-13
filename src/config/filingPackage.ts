// Heading above the signature on the authored STATEMENTS (Part V, Part VI,
// reasonable-cause). The cover letter is only a transmittal letter, so it
// closes with COVER_LETTER_CLOSING instead and never carries perjury wording
// (spec house rule 2, 2026-10-13: "Signed:" replaces the 2026-10-10
// "Sincerely,"); the Form 1120 carries its own IRS jurat.
export const AUTHORED_DOC_SIGNATURE_HEADING = "Signed under penalties of perjury:";
export const COVER_LETTER_CLOSING = "Signed:";
export const IRS_JURAT_UNTOUCHED = true;
// The Form 1120 paid preparer block is per order since generator 2.3.0
// (Filing.paidPreparerMode; details in src/config/housePreparer.ts).
export const SIGNER_TITLE = "Sole Member";
// Date line under the signature on the reasonable cause statement.
export const AUTHORED_DOC_DATE_LINE = "Date: ______________________";
// Heading citation of the Part V supporting statement (orchestrator decision
// D6, 2026-10-13): (b)(3)(xi) is "any other transaction" of a foreign-owned
// disregarded entity, including contributions to and distributions from it.
export const PART_V_STATEMENT_CITATION = "Treas. Reg. sec. 1.6038A-2(b)(3)(xi)";
// Optional reasonable-cause paragraph (spec item 5, verbatim; rules doc H8).
export const SMALL_CORPORATION_PARAGRAPH =
  "The LLC is a small corporation for purposes of Treas. Reg. sec. 1.6038A-4(b)(2)(ii): it has no gross " +
  "receipts, its only presence in the United States is its registered agent, and I had no knowledge of the " +
  "requirements of section 6038A. I acted in good faith throughout and will respond promptly and fully to any " +
  "IRS request relating to these filings.";
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
// 2.3.0 (2026-10-13, docs/reviews/2026-10-13-preflight-generator-spec.md):
// first-person RCS/Part V/Part VI; RCS cause text only from the admin
// narrative (customer text never renders); one RCS per late year incl. a
// "not sure" Form 7004 year; cover letter "Signed:"; Part V citation
// (b)(3)(xi) and "Form 5472 lines 1f and 1h: $X." ending; optional house paid
// preparer block; 1120 "tax year beginning" prints MM/DD only.
export const GENERATOR_VERSION = "2.3.0";
// The IRS-required marking written across the top of the pro forma Form 1120
// (Form 5472 instructions, "Foreign-owned U.S. DE"); also stamped on Form 5472.
// House position: no "DIIRSP" suffix or other procedure label on the forms.
export const FOREIGN_OWNED_DE_HEADER = "Foreign-owned U.S. DE";

export function assertIrsJuratUntouched() {
  if (IRS_JURAT_UNTOUCHED !== true) {
    throw new Error("IRS Form 1120 jurat must remain untouched");
  }
}
