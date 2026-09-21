export const AUTHORED_DOC_SIGNATURE_HEADING = "Signed under penalties of perjury:";
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
export const GENERATOR_VERSION = "2.0.0";

export function assertIrsJuratUntouched() {
  if (IRS_JURAT_UNTOUCHED !== true) {
    throw new Error("IRS Form 1120 jurat must remain untouched");
  }
}
