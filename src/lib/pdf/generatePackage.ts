import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, PDFTextField, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import {
  form5472FieldMap,
  form1120_2018FieldMap,
  form1120_2019FieldMap,
  form1120_2020FieldMap,
  form1120_2021FieldMap,
  form1120_2022FieldMap,
  form1120_2023FieldMap,
  form1120_2024FieldMap,
  form1120_2025FieldMap,
} from "./fieldMaps";
import {
  setText,
  check,
  stampDiirspHeader,
  stampShortPeriod,
  flatten,
  type PdfFieldWrite,
} from "./fillForm";
import { formatDateForIrs } from "@/lib/utils";
import {
  extensionUnclear,
  isYearDelinquent,
  type ExtensionFacts,
} from "@/lib/schemas";
import {
  AUTHORED_DOC_SIGNATURE_HEADING,
  COVER_LETTER_ENCLOSURE_PHRASE,
  GENERATOR_VERSION,
  IRS_MAIL_ADDRESS,
  IRS_MAIL_ADDRESS_DISPLAY_LINES,
  IRS_MAIL_ADDRESS_DISPLAY_SINGLE_LINE,
  SIGNER_TITLE,
  assertIrsJuratUntouched,
} from "@/config/filingPackage";

// ─────────────────────────────────────────────────────────────────────────────
// Country normalization — wizard collects nationality/residence as free text
// and customers frequently type the demonym ("Canadian") rather than the
// country name ("Canada"). IRS Form 5472 instructions want the COUNTRY in
// every country field (4c, 4d, 4e, 8f, 8g, 1n, 1o), and a demonym in those
// cells reads as an internal contradiction against the supporting statement.
// Map the common demonyms and pass anything else through unchanged.
// ─────────────────────────────────────────────────────────────────────────────
const DEMONYM_TO_COUNTRY: Record<string, string> = {
  american: "United States",
  australian: "Australia",
  brazilian: "Brazil",
  british: "United Kingdom",
  canadian: "Canada",
  chinese: "China",
  dutch: "Netherlands",
  emirati: "United Arab Emirates",
  english: "United Kingdom",
  filipino: "Philippines",
  french: "France",
  german: "Germany",
  "hong konger": "Hong Kong",
  indian: "India",
  indonesian: "Indonesia",
  irish: "Ireland",
  israeli: "Israel",
  italian: "Italy",
  japanese: "Japan",
  korean: "South Korea",
  malaysian: "Malaysia",
  mexican: "Mexico",
  "new zealander": "New Zealand",
  pakistani: "Pakistan",
  polish: "Poland",
  portuguese: "Portugal",
  russian: "Russia",
  singaporean: "Singapore",
  "south african": "South Africa",
  spanish: "Spain",
  swedish: "Sweden",
  swiss: "Switzerland",
  taiwanese: "Taiwan",
  thai: "Thailand",
  turkish: "Türkiye",
  ukrainian: "Ukraine",
  vietnamese: "Vietnam",
};

function normalizeCountry(input: string | null | undefined): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";
  const mapped = DEMONYM_TO_COUNTRY[trimmed.toLowerCase()];
  return mapped ?? trimmed;
}

type Filing = {
  llcName: string;
  llcEin: string;
  llcAddress: string;
  llcCity: string;
  llcState: string;
  llcZip: string;
  llcCountry: string;
  llcCountryBusiness?: string | null;
  llcMemberCount?: number | null;
  llcAddressIsRegisteredAgentOnly?: boolean | null;
  priorForm5472Filed?: string | null;
  hasUsSourceIncome?: boolean | null;
  usTaxWithheld?: boolean | null;
  llcDateIncorporated: Date;
  llcBusinessActivity: string;
  llcBusinessCode: string;
  ownerName: string;
  ownerAddress: string;
  ownerAddressStreet?: string | null;
  ownerAddressCity?: string | null;
  ownerAddressState?: string | null;
  ownerAddressPostal?: string | null;
  ownerAddressCountry?: string | null;
  ownerHasFtin?: boolean | null;
  ownerNoPostalCode?: boolean | null;
  ownerCountryCitizenship: string;
  ownerCountryTaxResidence: string;
  ownerCountryBusiness: string;
  ownerFtin: string;
  ownerItin: string | null;
  ownerReferenceId: string | null;
  taxYears: number[];
  isDiirsp: boolean;
  // Set when the LLC was dissolved/closed and this package is its FINAL
  // (short-year) return. Optional so existing call sites that never handle a
  // final return keep compiling; absent behaves exactly as `false`.
  isFinalReturn?: boolean;
  // Date the LLC was dissolved. Only meaningful alongside isFinalReturn, and
  // it is what makes the year SHORT — see periodEndFor(). Optional/nullable so
  // the many call sites that never deal with a final return keep compiling.
  dissolvedAt?: Date | string | null;
  // Form 7004 extension facts, as answered by the customer. A 7004 covers ONE
  // tax year, so these describe max(taxYears) and nothing else — see the
  // per-year wiring in generatePackage(). Optional so call sites that predate
  // the extension gate keep compiling; absent behaves exactly as "no extension
  // was filed", i.e. the pre-gate calendar-only behaviour.
  //   extensionFiled          "yes" | "no" | "not_sure" | null (not yet asked)
  //   extensionTransmittedAt  when the 7004 was transmitted
  extensionFiled?: string | null;
  extensionTransmittedAt?: Date | string | null;
  reasonableCauseNarrative: string | null;
    yearData: {
      taxYear: number;
      totalAssetsYearEnd: number;
      contributions: number;
      distributions: number;
      otherTransactionsNote: string | null;
      reportableTransactions?: ReportableTx[];
      nonCashTransfers?: NonCashTransfer[];
      ownerPaidCosts?: OwnerPaidCost[];
      zeroConfirmations?: ZeroConfirmations;
      rcsWhyMissed?: string | null;
    rcsWhenLearned?: string | null;
    rcsNoIrsNoticeConfirmed?: boolean | null;
  }[];
};

export type PackageInput = Filing;

export type ReportableTx = {
  date: string; // YYYY-MM-DD
  description: string;
  counterparty?: string;
  amountCents: number; // signed: positive = inflow (contribution), negative = outflow (distribution)
  category: string; // "contribution" | "distribution" | other
};

export type NonCashTransfer = {
  date: string;
  direction: "in" | "out";
  description: string;
  fairMarketValueCents: number;
  valuationMethod: string;
  alsoInPartV: boolean;
};

export type OwnerPaidCost = {
  category:
    | "state_filing_fee"
    | "registered_agent"
    | "formation_or_ein_service"
    | "software_subscriptions"
    | "initial_bank_funding"
    | "other";
  date: string;
  amountCents: number;
  note?: string;
};

export type ZeroConfirmations = Partial<{
  contributions: true;
  distributions: true;
  loansFromOwner: true;
  loansToOwner: true;
  ownerPaidCosts: true;
}>;

export type AuthoredDocumentRecord = {
  kind: "coverLetter" | "partVStatement" | "partVIStatement" | "reasonableCauseStatement";
  taxYear?: number;
  lines: string[];
  pages?: string[][];
  rcsFallbackUsed?: boolean;
  rcsMissingAnswers?: boolean;
};

export type PackageRecordYear = {
  taxYear: number;
  form1120Revision: string;
  revisionUsed: string;
  shortYearException: boolean;
  periodStart: string;
  periodEnd: string;
  status: "timely" | "late" | "unresolved";
  isInitialYear: boolean;
  isFinalYear: boolean;
  line1oSource: "llc_field" | "default_us";
  line1f: number;
  line1g: number;
  line1h: number;
  partVTotalRounded: number;
  partVTotalCents: number;
    partVRows: ReportableTx[];
    nonCashTransfers: NonCashTransfer[];
    ownerPaidCosts: OwnerPaidCost[];
    zeroConfirmations: ZeroConfirmations;
    partVICentsAddedToLine1f: number;
  line1jChecked: boolean;
  priorForm5472Filed: string | null;
  ownerHasFtin: boolean | null;
  ownerAddressState: string | null;
  ownerAddressPostal: string | null;
  ownerNoPostalCode: boolean | null;
  signerTitleRect: { left: number; right: number; top: number; bottom: number };
  signerTitleColumnBounds: { left: number; right: number; top: number; bottom: number; measuredField: string };
  signerDeclarationBounds: { left: number; right: number; top: number; bottom: number; measuredFrom: string };
  trades: boolean;
  hasUsSourceIncome: boolean | null;
  form1120: { fields: PdfFieldWrite[]; stampedTexts: string[] };
  form5472: { fields: PdfFieldWrite[] };
  reasonableCauseIncluded: boolean;
};

export type PrintAddressRecord = {
  value: string;
  fontSize: number;
  abbreviated: boolean;
  checkedFieldWidths: { field: string; width: number }[];
  failures: string[];
};

export type PackagePageRecord = {
  label: string;
  taxYear?: number;
  startPage: number;
  endPage: number;
};

export type PackageRecord = {
  generatorVersion: string;
  commit: string;
  generatedAt: string;
  finalisedAt: string;
  llcName: string;
  ownerName: string;
  ownerReferenceId: string | null;
  llcEin: string;
  llcPrintAddress: PrintAddressRecord;
  ownerPrintAddress: PrintAddressRecord;
  formationDate: string | null;
  dissolutionDate: string | null;
  taxYears: PackageRecordYear[];
  authoredDocuments: AuthoredDocumentRecord[];
  pageOrder: PackagePageRecord[];
};

type SignerTitleColumnBounds = {
  left: number;
  right: number;
  baselineY: number;
  measuredField: string;
};

const SIGNER_TITLE_COLUMN_INSET = 2;
const SIGNER_TITLE_MAX_SIZE = 10;
const SIGNER_TITLE_MIN_SIZE = 7;
const ADDRESS_NORMAL_FONT_SIZE = 10;
const ADDRESS_MIN_FONT_SIZE = 6.5;
const ADDRESS_FONT_STEP = 0.25;

export class NeedsReviewError extends Error {
  readonly name = "NeedsReviewError";
  constructor(message: string) {
    super(message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tax-year period end (MM/DD) for a given year in the package.
//
// A final return covers a SHORT tax year: it starts Jan 1 but ends the day the
// LLC was dissolved, NOT 12/31. Printing the full calendar year on a return
// whose item E says "Final return" is an internal contradiction, and it
// overstates the period the reported figures cover.
//
// Only the year the dissolution actually falls in is short. A multi-year
// (DIIRSP catch-up) package that ends with a final year still has ordinary,
// complete years before it, and those must keep 12/31 — hence the year match.
// Read in UTC because the stored value is a date-only instant (UTC midnight);
// local getters would slide it a day backwards on a west-of-UTC host.
// ─────────────────────────────────────────────────────────────────────────────
export function periodEndFor(f: Pick<Filing, "isFinalReturn" | "dissolvedAt">, year: number): string {
  if (!f.isFinalReturn || !f.dissolvedAt) return "12/31";
  const dissolved = f.dissolvedAt instanceof Date ? f.dissolvedAt : new Date(f.dissolvedAt);
  if (Number.isNaN(dissolved.getTime())) return "12/31";
  if (dissolved.getUTCFullYear() !== year) return "12/31";
  const mm = String(dissolved.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dissolved.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tax-year period START (MM/DD) for a given year in the package.
//
// The mirror image of periodEndFor(). An entity's FIRST tax year does not begin
// on January 1 — it begins the day the entity came into existence. An LLC formed
// 2026-04-13 and dissolved 2026-09-30 is a first-and-final filer whose only tax
// year runs 04/13/2026 – 09/30/2026; printing 01/01 would claim three and a half
// months of existence that never happened, and would contradict Form 5472 line
// 1m (date incorporated) on the same page.
//
// Only the FORMATION year gets the late start. In a multi-year DIIRSP catch-up
// the years after formation are ordinary years that really do begin Jan 1 —
// hence the year match, same shape as periodEndFor().
// Read in UTC: the stored value is a date-only instant (UTC midnight), and local
// getters would slide it a day backwards on a west-of-UTC host.
// ─────────────────────────────────────────────────────────────────────────────
export function periodStartFor(
  f: { llcDateIncorporated?: Date | string | null },
  year: number,
): string {
  if (!f.llcDateIncorporated) return "01/01";
  const formed =
    f.llcDateIncorporated instanceof Date
      ? f.llcDateIncorporated
      : new Date(f.llcDateIncorporated);
  if (Number.isNaN(formed.getTime())) return "01/01";
  if (formed.getUTCFullYear() !== year) return "01/01";
  const mm = String(formed.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(formed.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}`;
}

// The LLC's formation year in UTC, or null when no formation date is on file.
function formationYearOf(f: { llcDateIncorporated?: Date | string | null }): number | null {
  if (!f.llcDateIncorporated) return null;
  const formed =
    f.llcDateIncorporated instanceof Date
      ? f.llcDateIncorporated
      : new Date(f.llcDateIncorporated);
  if (Number.isNaN(formed.getTime())) return null;
  return formed.getUTCFullYear();
}

function partVRowsForYear(f: Filing, year: number): ReportableTx[] {
  const yd = f.yearData.find((y) => y.taxYear === year);
  if (!yd) return [];
  const rows = (yd.reportableTransactions ?? []).filter((t) =>
    ["contribution", "distribution", "loan_from_owner", "loan_to_owner"].includes(t.category),
  );
  const hasContributionRows = rows.some((t) => t.category === "contribution");
  const hasDistributionRows = rows.some((t) => t.category === "distribution");
  const [periodEndMonth, periodEndDay] = periodEndFor(f, year).split("/");
  const periodEndIso = `${year}-${periodEndMonth}-${periodEndDay}`;
  if (!hasContributionRows && yd.contributions > 0) {
    rows.push({
      date: periodEndIso,
      description: "Capital contribution total entered by customer",
      counterparty: f.ownerName,
      amountCents: Math.round(yd.contributions * 100),
      category: "contribution",
    });
  }
  if (!hasDistributionRows && yd.distributions > 0) {
    rows.push({
      date: periodEndIso,
      description: "Distribution total entered by customer",
      counterparty: f.ownerName,
      amountCents: -Math.round(yd.distributions * 100),
      category: "distribution",
    });
  }
  for (const cost of yd.ownerPaidCosts ?? []) {
    rows.push({
      date: cost.date,
      description: ownerPaidCostDescription(cost),
      counterparty: f.ownerName,
      amountCents: Math.abs(cost.amountCents),
      category: "contribution",
    });
  }
  return rows;
}

function nonCashTransfersForYear(f: Filing, year: number): NonCashTransfer[] {
  const yd = f.yearData.find((y) => y.taxYear === year);
  return yd?.nonCashTransfers ?? [];
}

function partVTotalCents(rows: ReportableTx[]): number {
  return rows.reduce((sum, tx) => sum + Math.abs(tx.amountCents), 0);
}

function ownerPaidCostDescription(cost: OwnerPaidCost): string {
  if (cost.category === "other") {
    return (cost.note ?? "").trim() || "Cost paid personally by owner";
  }
  const label: Record<OwnerPaidCost["category"], string> = {
    state_filing_fee: "State filing fee paid personally by owner",
    registered_agent: "Registered agent fee paid personally by owner",
    formation_or_ein_service: "Formation or EIN service paid personally by owner",
    software_subscriptions: "Software or subscription cost paid personally by owner",
    initial_bank_funding: "Initial bank funding paid personally by owner",
    other: "Cost paid personally by owner",
  };
  return label[cost.category];
}

export function roundedPartVTotalDollars(rows: ReportableTx[]): number {
  return roundedCentsToDollars(partVTotalCents(rows));
}

function roundedCentsToDollars(cents: number): number {
  return Math.floor((cents + 50) / 100);
}

function nonCashCentsForLine1f(transfers: NonCashTransfer[]): number {
  return transfers
    .filter((transfer) => transfer.alsoInPartV === false)
    .reduce((sum, transfer) => sum + Math.abs(transfer.fairMarketValueCents), 0);
}

function line1oCountry(f: Filing): { value: string; source: "llc_field" | "default_us" } {
  const llcCountryBusiness = normalizeCountry(f.llcCountryBusiness);
  return llcCountryBusiness
    ? { value: llcCountryBusiness, source: "llc_field" }
    : { value: "United States", source: "default_us" };
}

function structuredOwnerAddress(f: Filing): string | null {
  const parts = [
    f.ownerAddressStreet,
    f.ownerAddressCity,
    f.ownerAddressState,
    f.ownerAddressPostal,
    f.ownerAddressCountry,
  ].map((part) => part?.trim()).filter((part): part is string => !!part);
  return parts.length > 0 ? parts.join(", ") : null;
}

function ownerAddressForForms(f: Filing): string {
  return structuredOwnerAddress(f) ?? f.ownerAddress;
}

function hasStructuredOwnerAddress(f: Filing): boolean {
  return [
    f.ownerAddressStreet,
    f.ownerAddressCity,
    f.ownerAddressState,
    f.ownerAddressPostal,
    f.ownerAddressCountry,
  ].some((part) => !!part?.trim());
}

function ownerStreetForForms(f: Filing): string {
  if (!hasStructuredOwnerAddress(f)) return f.ownerAddress;
  return f.ownerAddressStreet?.trim() || "";
}

function llcStreetAddressSource(f: Filing): string {
  return f.llcAddressIsRegisteredAgentOnly === true ? ownerStreetForForms(f) : f.llcAddress;
}

function llcCityForForms(f: Filing): string {
  return f.llcAddressIsRegisteredAgentOnly === true
    ? (f.ownerAddressCity?.trim() || "")
    : f.llcCity;
}

function llcStateForForms(f: Filing): string {
  return f.llcAddressIsRegisteredAgentOnly === true
    ? (f.ownerAddressState?.trim() || "")
    : f.llcState;
}

function llcZipForForms(f: Filing): string {
  return f.llcAddressIsRegisteredAgentOnly === true
    ? (f.ownerAddressPostal?.trim() || "")
    : f.llcZip;
}

function llcCountryForForms(f: Filing): string {
  return f.llcAddressIsRegisteredAgentOnly === true
    ? (f.ownerAddressCountry?.trim() || normalizeCountry(f.ownerCountryTaxResidence) || f.llcCountry || "USA")
    : (f.llcCountry || "USA");
}

function llcCityStateZipForForms(f: Filing): string {
  const city = llcCityForForms(f);
  const state = llcStateForForms(f);
  const zip = llcZipForForms(f);
  const country = llcCountryForForms(f);
  return [city, [state, zip].filter(Boolean).join(" "), country].filter(Boolean).join(", ");
}

function ownerStateForA17(f: Filing): string | null {
  return f.ownerAddressState?.trim() || null;
}

function ownerPostalForA17(f: Filing): string | null {
  return f.ownerAddressPostal?.trim() || null;
}

function ownerFtinForForms(f: Filing): string {
  return f.ownerHasFtin === false ? "None" : f.ownerFtin;
}

function shouldCheckLine1j(f: Filing, year: number): boolean {
  const formationYear = formationYearOf(f);
  if (formationYear === null || year !== formationYear) return false;
  if (f.priorForm5472Filed === null || f.priorForm5472Filed === undefined) return true;
  return f.priorForm5472Filed === "no";
}

function cleanSentence(value: string | null | undefined): string {
  const cleaned = (value ?? "").trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  const capitalized = cleaned[0].toUpperCase() + cleaned.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function stateNameForProse(value: string): string {
  const states: Record<string, string> = {
    AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
    CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
    HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
    KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
    MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
    MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
    NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
    ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
    RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
    TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
    WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
  };
  return states[value.toUpperCase()] ?? value;
}

function yearTrades(f: Filing, year: number): boolean {
  const yd = f.yearData.find((y) => y.taxYear === year);
  const haystack = [
    yd?.otherTransactionsNote,
    ...(yd?.reportableTransactions ?? []).map((tx) => `${tx.category} ${tx.description} ${tx.counterparty ?? ""}`),
  ].join(" ").toLowerCase();
  return /\b(customer|client|vendor|invoice|sale|sales|merchant|processor|stripe|paypal)\b/.test(haystack);
}

function operationsParagraph(f: Filing): string {
  const activity = cleanSentence(`The Company's business activity is ${f.llcBusinessActivity}`);
  if (f.hasUsSourceIncome === true || f.llcBusinessCode === "523900") {
    return `${activity} The Company was used for holding or investment activity during the tax year.`;
  }
  return activity;
}

const FORMS_DIR = path.join(process.cwd(), "public", "forms");
type Form1120Revision = 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025;
type LegacyForm1120FieldMap = {
  readonly taxYearBeginning: string;
  readonly taxYearEnding: string;
  readonly taxYearEndingYear2: string;
  readonly "1a_name": string;
  readonly "1_streetSuite": string;
  readonly "1_cityStateCountryZip": string;
  readonly B_ein: string;
  readonly C_dateIncorporated: string;
  readonly D_totalAssets: string;
  readonly D_totalAssetsCents?: string;
  readonly E_initialReturn: string;
  readonly E_finalReturn: string;
  readonly E_nameChange: string;
  readonly E_addressChange: string;
};
type SplitForm1120FieldMap = {
  readonly taxYearBeginning: string;
  readonly taxYearEnding: string;
  readonly taxYearEndingYear2: string;
  readonly "1a_name": string;
  readonly "1_street": string;
  readonly "1_roomSuite": string;
  readonly "1_city": string;
  readonly "1_state": string;
  readonly "1_country": string;
  readonly "1_zip": string;
  readonly B_ein: string;
  readonly C_dateIncorporated: string;
  readonly D_totalAssets: string;
  readonly E_initialReturn: string;
  readonly E_finalReturn: string;
  readonly E_nameChange: string;
  readonly E_addressChange: string;
};
type Form1120FieldMap = LegacyForm1120FieldMap | SplitForm1120FieldMap;

const FORM1120_MAPS: Record<Form1120Revision, Form1120FieldMap> = {
  2018: form1120_2018FieldMap,
  2019: form1120_2019FieldMap,
  2020: form1120_2020FieldMap,
  2021: form1120_2021FieldMap,
  2022: form1120_2022FieldMap,
  2023: form1120_2023FieldMap,
  2024: form1120_2024FieldMap,
  2025: form1120_2025FieldMap,
};

async function loadBlank(name: string): Promise<PDFDocument> {
  const bytes = await fs.readFile(path.join(FORMS_DIR, name));
  return PDFDocument.load(bytes);
}

async function formExists(year: number): Promise<boolean> {
  try {
    await fs.access(path.join(FORMS_DIR, `f1120--${year}.pdf`));
    return true;
  } catch {
    return false;
  }
}

function isKnown1120Revision(year: number): year is Form1120Revision {
  return Object.prototype.hasOwnProperty.call(FORM1120_MAPS, year);
}

function form1120MapForRevision(revision: number): Form1120FieldMap {
  if (!isKnown1120Revision(revision)) {
    throw new Error(`No Form 1120 field map for revision ${revision}.`);
  }
  return FORM1120_MAPS[revision];
}

function form1120StreetField(map: Form1120FieldMap): string {
  return "1_street" in map ? map["1_street"] : map["1_streetSuite"];
}

function setTextWithRecordedFontSize(
  form: ReturnType<PDFDocument["getForm"]>,
  name: string,
  value: string,
  recorder: { form: string; writes: PdfFieldWrite[] },
  fontSize: number,
) {
  const before = recorder.writes.length;
  setText(form, name, value, recorder, { fontSize });
  for (const write of recorder.writes.slice(before)) {
    (write as PdfFieldWrite & { fontSize?: number }).fontSize = fontSize;
  }
}

async function selectForm1120Revision(
  f: Filing,
  year: number,
): Promise<{ revision: Form1120Revision; fileName: string; shortYearException: boolean }> {
  if (isKnown1120Revision(year) && await formExists(year)) {
    return { revision: year, fileName: `f1120--${year}.pdf`, shortYearException: false };
  }

  const isShortYear = periodStartFor(f, year) !== "01/01" || periodEndFor(f, year) !== "12/31";
  const priorYear = year - 1;
  if (isShortYear && isKnown1120Revision(priorYear) && await formExists(priorYear)) {
    return { revision: priorYear, fileName: `f1120--${priorYear}.pdf`, shortYearException: true };
  }

  throw new Error(`No blank Form 1120 PDF is available for tax year ${year}.`);
}

function relatedPartyCount(f: Filing): number {
  return f.llcMemberCount ?? 1;
}

export function assertRelatedPartyCount(count: number) {
  if (count > 1) {
    throw new NeedsReviewError("More than one related party: route to a reviewer.");
  }
}

async function fieldWidth(pdfName: string, fieldName: string): Promise<number> {
  const pdf = await loadBlank(pdfName);
  const field = pdf.getForm().getField(fieldName);
  const rect = field.acroField.getWidgets()[0]?.getRectangle();
  if (!rect) throw new Error(`Could not measure PDF field ${fieldName} in ${pdfName}.`);
  return rect.width;
}

async function computePrintAddress(
  rawAddress: string,
  widths: { field: string; width: number }[],
  font: PDFFont,
  prefix: string = "",
): Promise<PrintAddressRecord> {
  const original = rawAddress.trim().replace(/\s+/g, " ");
  const firstPass = fittingFontSize(addressMeasureValue(original, prefix), widths, font);
  if (firstPass !== null) {
    return { value: original, fontSize: firstPass, abbreviated: false, checkedFieldWidths: widths, failures: [] };
  }

  const abbreviated = abbreviateAddress(original);
  const secondPass = fittingFontSize(addressMeasureValue(abbreviated, prefix), widths, font);
  if (secondPass !== null) {
    return { value: abbreviated, fontSize: secondPass, abbreviated: abbreviated !== original, checkedFieldWidths: widths, failures: [] };
  }

  const narrowest = [...widths].sort((a, b) => a.width - b.width)[0];
  return {
    value: abbreviated,
    fontSize: ADDRESS_MIN_FONT_SIZE,
    abbreviated: abbreviated !== original,
    checkedFieldWidths: widths,
    failures: [`${narrowest.field} cannot fit address at ${ADDRESS_MIN_FONT_SIZE}pt`],
  };
}

function addressMeasureValue(address: string, prefix: string): string {
  const cleanPrefix = prefix.trim();
  return cleanPrefix ? `${cleanPrefix} ${address}` : address;
}

function fittingFontSize(
  value: string,
  widths: { field: string; width: number }[],
  font: PDFFont,
): number | null {
  const minWidth = Math.min(...widths.map((w) => w.width));
  for (let size = ADDRESS_NORMAL_FONT_SIZE; size >= ADDRESS_MIN_FONT_SIZE; size -= ADDRESS_FONT_STEP) {
    const rounded = Math.round(size * 100) / 100;
    if (font.widthOfTextAtSize(value, rounded) <= minWidth) return rounded;
  }
  return null;
}

function abbreviateAddress(value: string): string {
  const replacements: Array<[RegExp, string]> = [
    [/\bStreet\b/g, "St"],
    [/\bAvenue\b/g, "Ave"],
    [/\bBoulevard\b/g, "Blvd"],
    [/\bRoad\b/g, "Rd"],
    [/\bSuite\b/g, "Ste"],
    [/\bApartment\b/g, "Apt"],
    [/\bBuilding\b/g, "Bldg"],
    [/\bFloor\b/g, "Fl"],
    [/\bNorth\b/g, "N"],
    [/\bSouth\b/g, "S"],
    [/\bEast\b/g, "E"],
    [/\bWest\b/g, "W"],
  ];
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

function fillForm5472(
  pdf: PDFDocument,
  f: Filing,
  year: number,
  line1f: number,
  printAddresses: { llc: PrintAddressRecord; owner: PrintAddressRecord },
  recorder: { form: string; writes: PdfFieldWrite[] },
): { line1oSource: "llc_field" | "default_us" } {
  const form = pdf.getForm();
  const m = form5472FieldMap;

  // Normalize country / nationality strings up-front. Wizard collects free
  // text; "Canadian" → "Canada", etc. See normalizeCountry() above.
  const ownerCitizenship = normalizeCountry(f.ownerCountryCitizenship);
  const ownerTaxResidence = normalizeCountry(f.ownerCountryTaxResidence);
  const ownerBusinessCountry =
    normalizeCountry(f.ownerCountryBusiness) || ownerTaxResidence || ownerCitizenship;
  const llcBusinessCountry = line1oCountry(f);

  // Period bounds. The START is 01/01 except in the LLC's FORMATION year, where
  // it is the formation date (see periodStartFor()); the END is 12/31 unless
  // this is the final year, in which case it's the dissolution date (see
  // periodEndFor()). A first-and-final filer gets both at once.
  setText(form, m.taxYearBeginMonthDay, periodStartFor(f, year), recorder);
  setText(form, m.taxYearBeginYear, String(year), recorder);
  setText(form, m.taxYearEndMonthDay, periodEndFor(f, year), recorder);
  setText(form, m.taxYearEndYear, String(year), recorder);

  // Part I — reporting corp
  setText(form, m["1a_name"], f.llcName, recorder);
  setText(form, m["1_street"], printAddresses.llc.value, recorder, { fontSize: printAddresses.llc.fontSize });
  setText(form, m["1_cityStateZip"], llcCityStateZipForForms(f), recorder);
  setText(form, m["1b_ein"], f.llcEin, recorder);
  const yearData = f.yearData.find((y) => y.taxYear === year);
  setText(form, m["1c_totalAssets"], yearData ? yearData.totalAssetsYearEnd.toFixed(0) : "0", recorder);
  setText(form, m["1d_businessActivity"], f.llcBusinessActivity, recorder);
  setText(form, m["1e_businessCode"], f.llcBusinessCode, recorder);
  setText(form, m["1f_totalPaymentsThisForm"], line1f.toFixed(0), recorder);
  setText(form, m["1g_numberOfForms"], "1", recorder);
  setText(form, m["1h_totalPaymentsAllForms"], line1f.toFixed(0), recorder);
  // 1k expects a number; we never attach Part VIII (no cost-sharing
  // arrangement applies to a sole-member DE), so explicit "0" is cleaner
  // than blank.
  setText(form, m["1k_partsVIII"], "0", recorder);
  setText(form, m["1l_countryIncorp"], "United States", recorder);
  setText(form, m["1m_dateIncorp"], formatDateForIrs(f.llcDateIncorporated), recorder);
  // 1n (tax-resident jurisdiction of the REPORTING CORP) — the LLC is a US
  // entity for US legal/tax purposes. Stays "United States".
  setText(form, m["1n_countriesTaxResident"], "United States", recorder);
  setText(form, m["1o_countriesBusinessConducted"], llcBusinessCountry.value, recorder);

  check(form, m.box2_foreign50pct, recorder);
  check(form, m.box3_foreignOwnedUsDE, recorder);
  // Initial-year box (1j): "this is the reporting corporation's INITIAL year of
  // existence", not "the first year in this package". The old gate was
  // `year === earliest selected year && earliest >= formationYear`, which ticked
  // 1j on whichever year the customer happened to start their catch-up from —
  // so an LLC formed in 2020 that files 2022-2024 declared 2022 its initial
  // year, contradicting line 1m (date incorporated 2020) two cells away.
  // Keyed on the formation year instead: exactly one year in any package can be
  // the initial year, and only if that year is actually being filed. An LLC
  // whose formation year is missing or unparseable ticks nothing (safer than
  // asserting an initial year we can't substantiate).
  if (shouldCheckLine1j(f, year)) {
    check(form, m["1j_initialYear"], recorder);
  }

  // Part II — direct 25% foreign shareholder (same as Part III for SMLLC)
  setText(form, m["4a_nameAddress"], `${f.ownerName}\n${printAddresses.owner.value}`, recorder, {
    fontSize: printAddresses.owner.fontSize,
  });
  if (f.ownerItin) setText(form, m["4b1_usId"], f.ownerItin, recorder);
  if (f.ownerReferenceId) setText(form, m["4b2_referenceId"], f.ownerReferenceId, recorder);
  setText(form, m["4b3_ftin"], ownerFtinForForms(f), recorder);
  setText(form, m["4c_principalCountry"], ownerBusinessCountry, recorder);
  setText(form, m["4d_citizenship"], ownerCitizenship, recorder);
  setText(form, m["4e_taxResidence"], ownerTaxResidence, recorder);

  // Part III — related party (same person for SMLLC)
  check(form, m.partIII_foreignPersonBox, recorder);
  check(form, m["8e_25pctShareholder"], recorder);
  setText(form, m["8a_nameAddress"], `${f.ownerName}\n${printAddresses.owner.value}`, recorder, {
    fontSize: printAddresses.owner.fontSize,
  });
  if (f.ownerItin) setText(form, m["8b1_usId"], f.ownerItin, recorder);
  if (f.ownerReferenceId) setText(form, m["8b2_referenceId"], f.ownerReferenceId, recorder);
  setText(form, m["8b3_ftin"], ownerFtinForForms(f), recorder);
  setText(form, m["8c_businessActivity"], f.llcBusinessActivity, recorder);
  // 8d (related party's PBA CODE) mirrors Part I 1e for a sole-member DE
  // where the related party IS the controller of the reporting corp.
  setText(form, m["8d_businessCode"], f.llcBusinessCode, recorder);
  setText(form, m["8f_principalCountry"], ownerBusinessCountry, recorder);
  setText(form, m["8g_taxResidence"], ownerTaxResidence, recorder);

  // Part IV totals — zero (no inventory/services with the owner)
  setText(form, m.line22_totalReceived, "0", recorder);
  setText(form, m.line36_totalPaid, "0", recorder);

  // Part V — supporting statement attached
  check(form, m.partV_attachedStatementBox, recorder);
  if (nonCashTransfersForYear(f, year).length > 0) {
    check(form, m.partVI_attachedStatementBox, recorder);
  }

  // Part VII negatives
  check(form, m.q37_imports_no, recorder);
  // Lines 38a and 38c are conditional ("If 'Yes' [to line 37]"). Line 37 is answered No for every
  // package this product produces, so 38a and 38c stay blank, like 43a/43b.
  check(form, m.q39_csa_no, recorder);
  check(form, m.q40a_267A_no, recorder);
  check(form, m.q41a_fdii_no, recorder);
  check(form, m.q42a_safeHavenInRange_no, recorder);
  check(form, m.q42b_safeHavenOutsideRange_no, recorder);

  flatten(form);
  return { line1oSource: llcBusinessCountry.source };
}

// Form 1120 is filed PRO FORMA — purely as a transmittal for Form 5472.
// Per the Form 5472 instructions for foreign-owned U.S. DEs, the income,
// deduction, and Schedule pages must NOT be completed (no tax is computed
// on a pro forma 1120). We DO populate the entity-identification fields
// (name, EIN, date incorporated, total assets) because leaving Items C
// and D blank creates a "this filing looks incomplete" question for the
// IRS reviewer and a cross-form inconsistency vs. Form 5472 line 1c
// (total assets) and 1m (date incorporated). Filling them mirrors the
// 5472 data and removes the ambiguity at zero risk.
// "Foreign-owned U.S. DE" is stamped across the top by stampDiirspHeader().
async function fillForm1120(
  pdf: PDFDocument,
  f: Filing,
  year: number,
  revision: Form1120Revision,
  llcPrintAddress: PrintAddressRecord,
  recorder: { form: string; writes: PdfFieldWrite[] },
): Promise<{
  signerTitleRect: PackageRecordYear["signerTitleRect"];
  signerTitleColumnBounds: PackageRecordYear["signerTitleColumnBounds"];
  signerDeclarationBounds: PackageRecordYear["signerDeclarationBounds"];
}> {
  const form = pdf.getForm();
  // Total assets at year-end — mirror Form 5472 line 1c. Pull the year that
  // matches the 1120 we're rendering; fall back to 0 if no yearData row.
  const yd = f.yearData.find((y) => y.taxYear === year);
  const totalAssets = yd ? Math.round(yd.totalAssetsYearEnd).toString() : "0";
  const dateIncorporated = formatDateForIrs(f.llcDateIncorporated);
  const m = form1120MapForRevision(revision);

  if ("1_street" in m) {
    setText(form, m.taxYearBeginning, `${periodStartFor(f, year)}/${year}`, recorder);
    setText(form, m.taxYearEnding, periodEndFor(f, year), recorder);
    setText(form, m.taxYearEndingYear2, String(year).slice(-2), recorder);
    setTextWithRecordedFontSize(form, m["1a_name"], f.llcName, recorder, llcPrintAddress.fontSize);
    // Split address into the structured 2025 fields when possible; otherwise
    // dump the full street into the street box.
    setTextWithRecordedFontSize(form, m["1_street"], llcPrintAddress.value, recorder, llcPrintAddress.fontSize);
    setTextWithRecordedFontSize(form, m["1_city"], llcCityForForms(f), recorder, llcPrintAddress.fontSize);
    setTextWithRecordedFontSize(form, m["1_state"], llcStateForForms(f), recorder, llcPrintAddress.fontSize);
    setTextWithRecordedFontSize(form, m["1_country"], llcCountryForForms(f), recorder, llcPrintAddress.fontSize);
    setTextWithRecordedFontSize(form, m["1_zip"], llcZipForForms(f), recorder, llcPrintAddress.fontSize);
    setText(form, m.B_ein, f.llcEin, recorder);
    setText(form, m.C_dateIncorporated, dateIncorporated, recorder);
    setText(form, m.D_totalAssets, totalAssets, recorder);
  } else {
    setText(form, m.taxYearBeginning, `${periodStartFor(f, year)}/${year}`, recorder);
    setText(form, m.taxYearEnding, periodEndFor(f, year), recorder);
    setText(form, m.taxYearEndingYear2, String(year).slice(-2), recorder);
    setTextWithRecordedFontSize(form, m["1a_name"], f.llcName, recorder, llcPrintAddress.fontSize);
    setTextWithRecordedFontSize(form, m["1_streetSuite"], llcPrintAddress.value, recorder, llcPrintAddress.fontSize);
    setTextWithRecordedFontSize(form, m["1_cityStateCountryZip"], llcCityStateZipForForms(f), recorder, llcPrintAddress.fontSize);
    setText(form, m.B_ein, f.llcEin, recorder);
    setText(form, m.C_dateIncorporated, dateIncorporated, recorder);
    setText(form, m.D_totalAssets, totalAssets, recorder);
    if (m.D_totalAssetsCents) setText(form, m.D_totalAssetsCents, "00", recorder);
  }

  // Item E "Final return" belongs ONLY to the 1120 for the SHORT (dissolution)
  // year. In a multi-year DIIRSP catch-up the earlier years are ordinary,
  // complete returns — ticking "Final return" on them would misdeclare a still-
  // live entity as closed for a year it was operating. periodEndFor() returns a
  // non-12/31 end exactly for the dissolution year, so it is the correct gate
  // (and matches the short-period stamp). Both the 2024 and 2025 field maps now
  // expose E_finalReturn (c1_7[0], verified by pdf-lib enumeration of both blank
  // PDFs); keep the key guard so any future unmapped revision skips it silently.
  const isShortYear = periodEndFor(f, year) !== "12/31";
  const itemE = m;
  if (f.isFinalReturn && isShortYear) {
    if ("E_finalReturn" in itemE) check(form, itemE.E_finalReturn, recorder);
  }

  // Item E "Initial return" is the mirror flag: this is the entity's FIRST tax
  // year, so the IRS shouldn't expect a prior-year return for the same EIN. It
  // belongs to the formation year only — independent of the final-return gate
  // above, so an LLC formed and dissolved in the same year (a first-and-final
  // filer) correctly gets BOTH boxes ticked on its single 1120. Both revisions'
  // maps expose E_initialReturn (c1_6[0], probe-verified alongside c1_7[0]);
  // keep the key guard so a future unmapped revision skips it silently.
  if (formationYearOf(f) === year) {
    if ("E_initialReturn" in itemE) check(form, itemE.E_initialReturn, recorder);
  }

  const signerTitleBounds = deriveSignerTitleColumnBounds(pdf, revision);

  flatten(form);

  // After flatten, stamp the configured signer title into the signature-block
  // "Title" slot. We draw outside the field because the title field's AcroForm
  // name shifts between IRS revisions; its widget rectangle is stable page
  // geometry and gives us the true left/right edges.
  const signerTitleRect = await stampTitleSoleMember(pdf, signerTitleBounds);
  const signerDeclarationBounds = deriveSignerDeclarationBounds(signerTitleBounds);
  return {
    signerTitleRect,
    signerTitleColumnBounds: {
      left: signerTitleBounds.left,
      right: signerTitleBounds.right,
      bottom: signerTitleBounds.baselineY,
      top: signerTitleBounds.baselineY + 14,
      measuredField: signerTitleBounds.measuredField,
    },
    signerDeclarationBounds,
  };
}

export function deriveSignerTitleColumnBounds(pdf: PDFDocument, year: number): SignerTitleColumnBounds {
  const page = pdf.getPage(0);
  const baselineY = year >= 2025 ? 90 : 108;
  const candidates = pdf
    .getForm()
    .getFields()
    .flatMap((field) => {
      if (!(field instanceof PDFTextField)) return [];
      return field.acroField.getWidgets().flatMap((widget) => {
        const widgetPage = widget.P();
        if (widgetPage && widgetPage !== page.ref) return [];
        const rect = widget.getRectangle();
        if (
          Math.abs(rect.y - baselineY) > 0.5 ||
          rect.x < 250 ||
          rect.x > 500 ||
          rect.width < 50 ||
          rect.height > 20
        ) {
          return [];
        }
        return [{ fieldName: field.getName(), rect }];
      });
    })
    .sort((a, b) => a.rect.x - b.rect.x);

  if (candidates.length !== 1) {
    throw new Error(`Could not derive Form 1120 signer title column for ${year}; found ${candidates.length} candidates.`);
  }

  const { fieldName, rect } = candidates[0];
  return {
    left: rect.x,
    right: rect.x + rect.width,
    baselineY,
    measuredField: fieldName,
  };
}

export function signerTitleStampPlacement(
  bounds: SignerTitleColumnBounds,
  font: PDFFont,
  title: string,
) {
  const x = bounds.left + SIGNER_TITLE_COLUMN_INSET;
  const maxWidth = bounds.right - bounds.left - 2 * SIGNER_TITLE_COLUMN_INSET;
  const naturalWidth = font.widthOfTextAtSize(title, SIGNER_TITLE_MAX_SIZE);
  const size =
    naturalWidth <= maxWidth
      ? SIGNER_TITLE_MAX_SIZE
      : Math.max(SIGNER_TITLE_MIN_SIZE, (SIGNER_TITLE_MAX_SIZE * maxWidth) / naturalWidth);
  const width = font.widthOfTextAtSize(title, size);
  if (width > maxWidth) {
    throw new Error(`Configured signer title does not fit the Form 1120 title column at ${SIGNER_TITLE_MIN_SIZE}pt.`);
  }
  return { x, y: bounds.baselineY, size, width, height: size, right: bounds.right };
}

async function stampTitleSoleMember(pdf: PDFDocument, bounds: SignerTitleColumnBounds) {
  const page = pdf.getPage(0);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const placement = signerTitleStampPlacement(bounds, font, SIGNER_TITLE);
  page.drawText(SIGNER_TITLE, {
    x: placement.x,
    y: placement.y,
    size: placement.size,
    font,
    color: rgb(0, 0, 0),
  });
  return {
    left: placement.x,
    right: placement.x + placement.width,
    bottom: placement.y,
    top: placement.y + placement.height,
  };
}

function deriveSignerDeclarationBounds(bounds: SignerTitleColumnBounds): PackageRecordYear["signerDeclarationBounds"] {
  return {
    left: bounds.left,
    right: bounds.right,
    bottom: bounds.baselineY + 16,
    top: bounds.baselineY + 58,
    measuredFrom: bounds.measuredField,
  };
}

// Build a brand-new PDF with the Part V supporting statement table.
async function buildSupportingStatement(
  f: Filing,
  year: number,
  authoredDocuments: AuthoredDocumentRecord[],
): Promise<PDFDocument> {
  const yd = f.yearData.find((y) => y.taxYear === year);
  const otherNote = (yd?.otherTransactionsNote ?? "").trim();
  const allTx = partVRowsForYear(f, year);
  const contributionsTx = allTx.filter((t) => t.category === "contribution");
  const distributionsTx = allTx.filter((t) => t.category === "distribution");
  const loansFromOwnerTx = allTx.filter((t) => t.category === "loan_from_owner");
  const loansToOwnerTx = allTx.filter((t) => t.category === "loan_to_owner");
  const drawnLines: string[] = [];
  const pageLines: string[][] = [[]];
  let currentPageLines = pageLines[0];

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  // Layout constants
  const PAGE_W = 612;
  const PAGE_H = 792;
  const MARGIN_L = 50;
  const MARGIN_R = 50;
  const MARGIN_TOP = 750;
  const MARGIN_BOTTOM = 60;
  const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R; // 512
  // Date | Description | Amount column layout
  const COL_DATE_X = MARGIN_L;
  const COL_DATE_W = 70;
  const COL_DESC_X = COL_DATE_X + COL_DATE_W + 8;
  const COL_AMOUNT_RIGHT = PAGE_W - MARGIN_R;
  const COL_AMOUNT_W = 80;
  const COL_DESC_W = COL_AMOUNT_RIGHT - COL_AMOUNT_W - COL_DESC_X - 8;

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = MARGIN_TOP;

  const drawStatementHeader = () => {
    y = MARGIN_TOP;
    draw("SUPPORTING STATEMENT TO FORM 5472", { font: bold, size: 13 });
    y -= 16;
    draw(`Tax Year ${year}`, { font: bold, size: 11 });
    y -= 14;
    draw(`Reporting Corporation: ${f.llcName}, EIN ${f.llcEin}`);
    y -= 22;
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN_BOTTOM) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      currentPageLines = [];
      pageLines.push(currentPageLines);
      drawStatementHeader();
    }
  };

  const draw = (
    text: string,
    opts: { x?: number; size?: number; font?: typeof font; align?: "left" | "right" } = {},
  ) => {
    const size = opts.size ?? 10;
    const f = opts.font ?? font;
    let x = opts.x ?? MARGIN_L;
    if (opts.align === "right") {
      const w = f.widthOfTextAtSize(text, size);
      x = x - w;
    }
    page.drawText(text, { x, y, size, font: f, color: rgb(0, 0, 0) });
    drawnLines.push(text);
    currentPageLines.push(text);
  };

  // ---- Header ----
  drawStatementHeader();
  draw("Pursuant to Treas. Reg. sec. 1.6038A-2(b)(3) and Part V instructions", { font: italic, size: 9 });
  y -= 22;

  // ---- Opening paragraph ----
  const opening =
    "The following reportable transactions of the foreign-owned U.S. disregarded entity are " +
    "reported pursuant to Part V of Form 5472. These transactions include capital contributions, " +
    "distributions, loans, and owner-paid costs between the disregarded entity and its foreign owner.";
  for (const line of wrapAtPx(opening, font, 10, CONTENT_W)) {
    ensureSpace(14);
    draw(line);
    y -= 13;
  }
  y -= 8;

  // ---- Table renderer ----
  const drawTableHeader = () => {
    ensureSpace(18);
    draw("Date", { x: COL_DATE_X, font: bold, size: 9 });
    draw("Description", { x: COL_DESC_X, font: bold, size: 9 });
    draw("Amount (USD)", { x: COL_AMOUNT_RIGHT, font: bold, size: 9, align: "right" });
    y -= 4;
    page.drawLine({
      start: { x: MARGIN_L, y },
      end: { x: PAGE_W - MARGIN_R, y },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 11;
  };

  const drawTableRow = (tx: ReportableTx) => {
    const dateStr = formatTxDate(tx.date);
    const amount = formatMoney(Math.abs(tx.amountCents) / 100);
    const descLines = wrapAtPx(describeTx(tx), font, 10, COL_DESC_W);
    const rowH = Math.max(14, descLines.length * 13 + 2);
    ensureSpace(rowH);
    const rowTop = y;
    draw(dateStr, { x: COL_DATE_X, size: 10 });
    for (let i = 0; i < descLines.length; i++) {
      if (i > 0) y -= 13;
      draw(descLines[i], { x: COL_DESC_X, size: 10 });
    }
    // Amount aligned to first line of description
    const savedY = y;
    y = rowTop;
    draw(amount, { x: COL_AMOUNT_RIGHT, size: 10, align: "right" });
    y = savedY - 8;
  };

  const drawTableTotal = (label: string, amountCents: number) => {
    ensureSpace(20);
    y -= 4;
    page.drawLine({
      start: { x: MARGIN_L, y },
      end: { x: PAGE_W - MARGIN_R, y },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 12;
    draw(label, { x: COL_DATE_X, font: bold, size: 10 });
    draw(formatMoney(amountCents / 100), {
      x: COL_AMOUNT_RIGHT,
      font: bold,
      size: 10,
      align: "right",
    });
    y -= 16;
  };

  const drawTransactionSection = (heading: string, totalLabel: string, rows: ReportableTx[]) => {
    ensureSpace(22);
    draw(heading, { font: bold, size: 11 });
    y -= 16;
    drawTableHeader();
    for (const tx of rows) drawTableRow(tx);
    const sumCents = rows.reduce((s, t) => s + Math.abs(t.amountCents), 0);
    drawTableTotal(totalLabel, sumCents);
    y -= 6;
  };

  if (contributionsTx.length > 0) {
    drawTransactionSection(
      "Capital Contributions from Foreign Owner",
      `Total Capital Contributions, Tax Year ${year}`,
      contributionsTx,
    );
  }
  if (distributionsTx.length > 0) {
    drawTransactionSection(
      "Distributions to Foreign Owner",
      `Total Distributions, Tax Year ${year}`,
      distributionsTx,
    );
  }
  if (loansFromOwnerTx.length > 0) {
    drawTransactionSection(
      "Loans from Foreign Owner to LLC",
      `Total Loans from Foreign Owner, Tax Year ${year}`,
      loansFromOwnerTx,
    );
  }
  if (loansToOwnerTx.length > 0) {
    drawTransactionSection(
      "Loans from LLC to Foreign Owner",
      `Total Loans to Foreign Owner, Tax Year ${year}`,
      loansToOwnerTx,
    );
  }
  if (allTx.length === 0) {
    drawTableTotal(`Total Part V Rows, Tax Year ${year}`, 0);
  }

  // ---- Grand total ----
  ensureSpace(36);
  draw("Total Reportable Transactions (Part V)", { font: bold, size: 11 });
  y -= 16;
  const grandTotal = partVTotalCents(allTx) / 100;
  for (const line of wrapAtPx(
    `Total Part V reportable transactions, tax year ${year}: ${formatMoney(grandTotal)} ` +
      "(entered on Form 5472 lines 1f and 1h).",
    bold,
    10,
    CONTENT_W,
  )) {
    ensureSpace(14);
    draw(line, { font: bold });
    y -= 13;
  }
  y -= 8;

  // ---- Other transactions disclosure ----
  if (otherNote) {
    ensureSpace(20);
    draw("Other Reportable Transactions", { font: bold, size: 11 });
    y -= 16;
    for (const line of wrapAtPx(otherNote, font, 10, CONTENT_W)) {
      ensureSpace(14);
      draw(line);
      y -= 13;
    }
    y -= 6;
  }

  // ---- Closing ----
  const closing = otherNote
    ? `The transactions above (capital contributions, distributions, and the items disclosed) ` +
      `constitute all reportable transactions between the reporting corporation and the foreign ` +
      `related party for tax year ${year}.`
    : "Other than the transactions described above, there were no other reportable transactions of " +
      `the type described in Treas. Reg. sec. 1.482-1(i)(7) during tax year ${year}.`;
  ensureSpace(16);
  for (const line of wrapAtPx(closing, font, 10, CONTENT_W)) {
    ensureSpace(14);
    draw(line);
    y -= 13;
  }

  y -= 18;
  ensureSpace(70);
  draw(AUTHORED_DOC_SIGNATURE_HEADING, { font: bold });
  y -= 28;
  draw("________________________________________");
  y -= 14;
  draw(f.ownerName);
  y -= 14;
  draw(SIGNER_TITLE);

  authoredDocuments.push({ kind: "partVStatement", taxYear: year, lines: drawnLines, pages: pageLines });
  return pdf;
}

async function buildPartVIStatement(
  f: Filing,
  year: number,
  transfers: NonCashTransfer[],
  authoredDocuments: AuthoredDocumentRecord[],
): Promise<PDFDocument> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const drawnLines: string[] = [];
  const pageLines: string[][] = [[]];
  let currentPageLines = pageLines[0];

  const PAGE_W = 612;
  const PAGE_H = 792;
  const MARGIN_L = 50;
  const MARGIN_R = 50;
  const MARGIN_TOP = 750;
  const MARGIN_BOTTOM = 60;
  const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;
  const COL_DATE_X = MARGIN_L;
  const COL_DATE_W = 70;
  const COL_DIRECTION_X = COL_DATE_X + COL_DATE_W + 8;
  const COL_DIRECTION_W = 48;
  const COL_DESC_X = COL_DIRECTION_X + COL_DIRECTION_W + 8;
  const COL_AMOUNT_RIGHT = PAGE_W - MARGIN_R;
  const COL_AMOUNT_W = 82;
  const COL_DESC_W = COL_AMOUNT_RIGHT - COL_AMOUNT_W - COL_DESC_X - 8;

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = MARGIN_TOP;

  const draw = (
    text: string,
    opts: { x?: number; size?: number; font?: typeof font; align?: "left" | "right" } = {},
  ) => {
    const size = opts.size ?? 10;
    const fnt = opts.font ?? font;
    let x = opts.x ?? MARGIN_L;
    if (opts.align === "right") x -= fnt.widthOfTextAtSize(text, size);
    page.drawText(text, { x, y, size, font: fnt, color: rgb(0, 0, 0) });
    drawnLines.push(text);
    currentPageLines.push(text);
  };
  const drawHeader = () => {
    y = MARGIN_TOP;
    draw("PART VI STATEMENT TO FORM 5472", { font: bold, size: 13 });
    y -= 16;
    draw(`Tax Year ${year}`, { font: bold, size: 11 });
    y -= 14;
    draw(`Reporting Corporation: ${f.llcName}, EIN ${f.llcEin}`);
    y -= 22;
  };
  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN_BOTTOM) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      currentPageLines = [];
      pageLines.push(currentPageLines);
      drawHeader();
    }
  };
  const drawParagraph = (text: string, opts: { font?: typeof font; size?: number } = {}) => {
    const fnt = opts.font ?? font;
    const size = opts.size ?? 10;
    for (const line of wrapAtPx(text, fnt, size, CONTENT_W)) {
      ensureSpace(14);
      draw(line, opts);
      y -= 13;
    }
  };

  drawHeader();
  drawParagraph("The following non-cash transfers between the foreign owner and the disregarded entity are reported for Part VI of Form 5472.", { font: italic, size: 9 });
  y -= 14;

  ensureSpace(18);
  draw("Date", { x: COL_DATE_X, font: bold, size: 9 });
  draw("In/Out", { x: COL_DIRECTION_X, font: bold, size: 9 });
  draw("Description and valuation method", { x: COL_DESC_X, font: bold, size: 9 });
  draw("FMV (USD)", { x: COL_AMOUNT_RIGHT, font: bold, size: 9, align: "right" });
  y -= 4;
  page.drawLine({ start: { x: MARGIN_L, y }, end: { x: PAGE_W - MARGIN_R, y }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });
  y -= 11;

  for (const transfer of transfers) {
    const note = transfer.alsoInPartV ? " Also appears in the Part V statement; value is not counted again on line 1f." : "";
    const desc = `${transfer.description}. Valuation method: ${transfer.valuationMethod}.${note}`;
    const descLines = wrapAtPx(desc, font, 10, COL_DESC_W);
    const rowH = Math.max(14, descLines.length * 13 + 2);
    ensureSpace(rowH);
    const rowTop = y;
    draw(formatTxDate(transfer.date), { x: COL_DATE_X });
    draw(transfer.direction === "in" ? "In" : "Out", { x: COL_DIRECTION_X });
    for (let i = 0; i < descLines.length; i++) {
      if (i > 0) y -= 13;
      draw(descLines[i], { x: COL_DESC_X });
    }
    const savedY = y;
    y = rowTop;
    draw(formatWholeDollars(transfer.fairMarketValueCents), { x: COL_AMOUNT_RIGHT, align: "right" });
    y = savedY - 8;
  }

  y -= 18;
  ensureSpace(70);
  draw(AUTHORED_DOC_SIGNATURE_HEADING, { font: bold });
  y -= 28;
  draw("________________________________________");
  y -= 14;
  draw(f.ownerName);
  y -= 14;
  draw(SIGNER_TITLE);

  authoredDocuments.push({ kind: "partVIStatement", taxYear: year, lines: drawnLines, pages: pageLines });
  return pdf;
}

// Friendly per-transaction description: use the cleaner of description vs.
// counterparty, prefer combining when both add signal.
function describeTx(tx: ReportableTx): string {
  const d = (tx.description ?? "").trim();
  const c = (tx.counterparty ?? "").trim();
  if (d && c && !d.toLowerCase().includes(c.toLowerCase())) return `${d} (${c})`;
  return d || c || "(no description)";
}

function formatMoney(dollars: number): string {
  return `$${dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatWholeDollars(cents: number): string {
  const dollars = roundedCentsToDollars(Math.abs(cents));
  return `$${dollars.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatTxDate(iso: string): string {
  // Accept YYYY-MM-DD; fall back to whatever we received.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[2]}/${m[3]}/${m[1]}`;
}

function formatFinalisedDate(date: Date): string {
  const mm = String(date.getUTCMonth() + 1);
  const dd = String(date.getUTCDate());
  const yyyy = String(date.getUTCFullYear());
  return `${mm}/${dd}/${yyyy}`;
}

// Width-based word wrap for variable-width fonts (the existing `wrap` helper
// counts characters, which leaves columns ragged on monospace and clips wide
// chars on Helvetica).
function wrapAtPx(text: string, f: import("pdf-lib").PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (f.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function formatTaxYearList(taxYears: number[]): string {
  const years = taxYears.map(String);
  if (years.length <= 2) return years.join(" and ");
  return `${years.slice(0, -1).join(", ")} and ${years[years.length - 1]}`;
}

function taxYearLabel(taxYears: number[]): "Tax year" | "Tax years" {
  return taxYears.length === 1 ? "Tax year" : "Tax years";
}

function taxYearNoun(taxYears: number[]): "tax year" | "tax years" {
  return taxYears.length === 1 ? "tax year" : "tax years";
}

async function buildCoverLetter(
  f: Filing,
  finalisedAt: Date,
  authoredDocuments: AuthoredDocumentRecord[],
): Promise<PDFDocument> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const drawnLines: string[] = [];

  let y = 750;
  const draw = (text: string, opts: { font?: typeof font; size?: number } = {}) => {
    page.drawText(text, { x: 50, y, size: opts.size ?? 10, font: opts.font ?? font });
    drawnLines.push(text);
  };

  if (IRS_MAIL_ADDRESS_DISPLAY_SINGLE_LINE !== IRS_MAIL_ADDRESS) {
    throw new Error("Cover letter IRS address block no longer matches IRS_MAIL_ADDRESS.");
  }
  for (const line of IRS_MAIL_ADDRESS_DISPLAY_LINES) {
    draw(line, { font: bold });
    y -= 14;
  }
  y -= 14;

  draw(`Date: ${formatFinalisedDate(finalisedAt)}`);
  y -= 28;

  draw(`Re: ${COVER_LETTER_ENCLOSURE_PHRASE} for ${f.llcName}`, { font: bold });
  y -= 14;
  draw(`EIN: ${f.llcEin}`);
  y -= 14;
  const taxYearList = formatTaxYearList(f.taxYears);
  draw(`${taxYearLabel(f.taxYears)}: ${taxYearList}`);
  y -= 28;

  const body = [
    `Enclosed please find ${COVER_LETTER_ENCLOSURE_PHRASE} for ${f.llcName}.`,
    `The entity's EIN is ${f.llcEin}.`,
    `The package covers ${taxYearNoun(f.taxYears)} ${taxYearList}.`,
  ]
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .join(" ");

  for (const line of wrap(body, 85)) {
    draw(line);
    y -= 14;
  }
  y -= 28;

  draw(AUTHORED_DOC_SIGNATURE_HEADING, { font: bold });
  y -= 28;
  draw("________________________________________");
  y -= 14;
  draw(f.ownerName);
  y -= 14;
  draw(SIGNER_TITLE);

  authoredDocuments.push({ kind: "coverLetter", lines: drawnLines });
  return pdf;
}

async function buildReasonableCause(
  f: Filing,
  year: number,
  authoredDocuments: AuthoredDocumentRecord[],
): Promise<PDFDocument> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const MARGIN_L = 50;
  const MARGIN_R = 50;
  const MARGIN_TOP = 750;
  const MARGIN_BOTTOM = 60;
  const PAGE_W = 612;
  const PAGE_H = 792;
  const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let y = MARGIN_TOP;
  const drawnLines: string[] = [];

  const ensureSpace = (needed: number) => {
    if (y - needed < MARGIN_BOTTOM) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = MARGIN_TOP;
    }
  };
  const drawLine = (
    text: string,
    opts: { font?: typeof font; size?: number; x?: number } = {},
  ) => {
    page.drawText(text, {
      x: opts.x ?? MARGIN_L,
      y,
      size: opts.size ?? 10,
      font: opts.font ?? font,
    });
    drawnLines.push(text);
  };
  const drawParagraph = (text: string, opts: { font?: typeof font; size?: number } = {}) => {
    const f = opts.font ?? font;
    const size = opts.size ?? 10;
    for (const line of wrapAtPx(text, f, size, CONTENT_W)) {
      ensureSpace(14);
      drawLine(line, opts);
      y -= 14;
    }
  };
  const space = (n: number) => { y -= n; };
  const yd = f.yearData.find((row) => row.taxYear === year);
  const why = cleanSentence(yd?.rcsWhyMissed);
  const learned = cleanSentence(yd?.rcsWhenLearned);
  const hasPerYearAnswers = !!why || !!learned;
  const fallback = !hasPerYearAnswers ? f.reasonableCauseNarrative?.trim() ?? "" : "";
  const missingAnswers = !hasPerYearAnswers && !fallback;

  // ---- Header ----
  drawLine("REASONABLE CAUSE STATEMENT", { font: bold, size: 13 });
  space(16);
  drawLine(`(Attached to Form 5472 / Pro Forma Form 1120 submission for tax year ${year})`, { size: 10 });
  space(18);
  drawLine(`Reporting Corporation: ${f.llcName}`);
  space(12);
  drawLine(`EIN: ${f.llcEin}`);
  space(12);
  drawLine(`Foreign Owner: ${f.ownerName} (${normalizeCountry(f.ownerCountryTaxResidence)})`);
  space(20);

  drawParagraph(
    "This statement explains the circumstances giving rise to the late filing of Form 5472 and the " +
      `accompanying pro forma Form 1120 for tax year ${year}.`,
  );
  space(10);

  // ---- 1. Background ----
  drawParagraph("1. Background", { font: bold, size: 11 });
  space(6);
  // Prose date, e.g. "January 1, 2020" (UTC so a midnight-UTC date never shifts a day).
  const incDateStr = f.llcDateIncorporated
    ? f.llcDateIncorporated.toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "(formation date on file)";
  // Normalize country/nationality the same way the 5472 form fields do, so
  // the RCS prose and the form cells agree on the spelling (avoids "resident
  // and citizen of Canadian" — demonym in a country-name context).
  const rcsOwnerCitizenship = normalizeCountry(f.ownerCountryCitizenship);
  const rcsOwnerTaxResidence = normalizeCountry(f.ownerCountryTaxResidence);
  const stateName = stateNameForProse(f.llcState);
  drawParagraph(
    `${f.ownerName} ("the Owner") is a resident and citizen of ${rcsOwnerCitizenship}. The Owner formed ${f.llcName} ` +
      `("the Company") on ${incDateStr} in ${stateName} as a single-member LLC. The Company is a ` +
      "foreign-owned U.S. disregarded entity for U.S. federal income tax purposes. " +
      operationsParagraph(f),
  );
  if (f.hasUsSourceIncome === true && f.usTaxWithheld === true) {
    drawParagraph(
      "The Company received U.S.-source income for which no U.S. income tax return was required, and U.S. tax on that U.S.-source income was satisfied by withholding at source.",
    );
  }
  space(10);

  // ---- 2. Cause of the delinquency ----
  drawParagraph("2. Cause of the Delinquency", { font: bold, size: 11 });
  space(6);
  if (fallback) {
    drawParagraph(fallback);
  } else if (missingAnswers) {
    drawParagraph(`Reasonable cause answers missing for ${year}.`);
  } else {
    if (why) drawParagraph(why);
    if (learned) {
      space(6);
      drawParagraph(learned);
    }
  }
  space(10);

  // ---- 3. Reasonable cause analysis ----
  drawParagraph("3. Filing History and Notice Status", { font: bold, size: 11 });
  space(6);
  drawParagraph(
    `The Owner is tax-domiciled in ${rcsOwnerTaxResidence} and is submitting the tax year ${year} return with the accompanying Form 5472 package.`,
  );
  if (yd?.rcsNoIrsNoticeConfirmed === true) {
    drawParagraph("No IRS notice has been received regarding this return.");
  }
  space(8);

  // ---- 4. Voluntary compliance ----
  drawParagraph("4. Voluntary Compliance and Forward-Looking Statement", { font: bold, size: 11 });
  space(6);
  drawParagraph(
    "The Owner has arranged this submission and will retain qualified assistance as needed for future Form 5472 obligations while the Company remains in existence.",
  );
  space(10);

  // ---- Signature block ----
  ensureSpace(60);
  drawLine(AUTHORED_DOC_SIGNATURE_HEADING, { font: bold });
  space(28);
  drawLine("________________________________________");
  space(14);
  drawLine(`${f.ownerName}`);
  space(12);
  drawLine(`${SIGNER_TITLE}, ${f.llcName}`);
  space(12);
  drawLine("Date: ______________________");

  authoredDocuments.push({
    kind: "reasonableCauseStatement",
    taxYear: year,
    lines: drawnLines,
    rcsFallbackUsed: !!fallback,
    rcsMissingAnswers: missingAnswers,
  });
  return pdf;
}

function wrap(text: string, width: number): string[] {
  // Preserve blank-line paragraph breaks by wrapping each paragraph separately
  // and joining with empty strings (the caller advances y for each entry).
  const paragraphs = text.split(/\n\s*\n/);
  const out: string[] = [];
  paragraphs.forEach((p, i) => {
    if (i > 0) out.push("");
    out.push(...wrapParagraph(p, width));
  });
  return out;
}

function wrapParagraph(text: string, width: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > width) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// Build the full filing package as a single PDF Uint8Array.
// Order: cover letter, RCS (if DIIRSP), then per year: 1120, 5472, supporting statement.
export type SignatureLocation = {
  label: string;       // e.g. "Cover letter"
  page: number;        // 1-based page number in the merged PDF
  instruction: string; // human-readable hint about where on the page to sign
  // Exact placement in PDF points (1pt = 1/72 inch), bottom-left origin
  // (matches pdf-lib's coordinate system). The signature image is stretched
  // into this rectangle. Coords are per-form so embedSignature doesn't have
  // to guess from the label — IRS revisions move the signature line.
  x: number;
  y: number;
  width: number;
  height: number;
};

// Empirically-measured signature placements for each form in our package.
// Page 1 of US Letter (612x792 pt) → bottom-left origin.
//
// To re-measure after an IRS revision, render the unsigned form, overlay a
// colored rectangle at the candidate (x,y,w,h), open in a PDF viewer, and
// confirm it sits inside the "Sign Here" blank line and doesn't bleed into
// adjacent date/title cells.
const SIG_PLACEMENT = {
  coverLetter:  { x: 72, y: 135, width: 220, height: 50 },
  rcs:          { x: 72, y: 135, width: 220, height: 50 },
  // Form 1120 Sign Here box. The signature line sits left of the date/title
  // cells. y differs between revisions because IRS shifted the box up by
  // ~14pt in the 2025 redesign.
  f1120_2024:   { x: 90, y: 98,  width: 220, height: 24 },
  f1120_2025:   { x: 90, y: 113, width: 220, height: 24 },
} as const;

export type GeneratedPackage = {
  bytes: Uint8Array;
  signatures: SignatureLocation[];
  totalPages: number;
  record: PackageRecord;
};

export async function generatePackage(
  f: Filing,
  finalisedAt: Date = new Date(),
): Promise<GeneratedPackage> {
  assertIrsJuratUntouched();
  assertRelatedPartyCount(relatedPartyCount(f));
  const out = await PDFDocument.create();
  const signatures: SignatureLocation[] = [];
  const authoredDocuments: AuthoredDocumentRecord[] = [];
  const pageOrder: PackagePageRecord[] = [];
  const recordYears: PackageRecordYear[] = [];
  const generatedAt = new Date();
  const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? "local";
  const selected1120 = new Map<number, Awaited<ReturnType<typeof selectForm1120Revision>>>();
  for (const year of f.taxYears) {
    selected1120.set(year, await selectForm1120Revision(f, year));
  }
  const measurePdf = await PDFDocument.create();
  const measureFont = await measurePdf.embedFont(StandardFonts.Helvetica);
  const llcAddressWidths: { field: string; width: number }[] = [
    { field: form5472FieldMap["1_street"], width: await fieldWidth("f5472.pdf", form5472FieldMap["1_street"]) },
  ];
  for (const selected of Array.from(selected1120.values())) {
    const map = form1120MapForRevision(selected.revision);
    const field = form1120StreetField(map);
    llcAddressWidths.push({ field, width: await fieldWidth(selected.fileName, field) });
  }
  const ownerAddressWidths = [
    { field: form5472FieldMap["4a_nameAddress"], width: await fieldWidth("f5472.pdf", form5472FieldMap["4a_nameAddress"]) },
    { field: form5472FieldMap["8a_nameAddress"], width: await fieldWidth("f5472.pdf", form5472FieldMap["8a_nameAddress"]) },
  ];
  const ownerAddress = ownerAddressForForms(f);
  const llcPrintAddress = await computePrintAddress(llcStreetAddressSource(f), llcAddressWidths, measureFont);
  const ownerPrintAddress = await computePrintAddress(ownerAddress, ownerAddressWidths, measureFont, f.ownerName);

  // Per-year delinquency. A bundled package can mix late years with a timely one
  // (e.g. a DIIRSP catch-up that ends with a final short year whose deadline
  // hasn't passed yet). The DIIRSP header stamp, the cover letter's late-filing
  // language, and the reasonable cause statement are signed under penalties of
  // perjury, so they must apply to the delinquent years ONLY — declaring a
  // timely year "delinquent" would be a false statement. Use the same shared
  // rule the server used to set isDiirsp, so the two never disagree.
  //
  // Form 7004 gate: a timely extension moves a year's deadline six months, so
  // an extended year is NOT delinquent even though the calendar says its
  // original date has passed. One 7004 covers ONE tax year, and on a multi-year
  // catch-up the only year it can still rescue is the latest one — so the facts
  // are passed for max(taxYears) and null for every earlier year.
  const dissolvedForDeadline = f.isFinalReturn ? f.dissolvedAt : null;
  const maxTaxYear = f.taxYears.length > 0 ? Math.max(...f.taxYears) : null;
  const extension: ExtensionFacts = {
    filed: f.extensionFiled ?? null,
    transmittedAt: f.extensionTransmittedAt ?? null,
  };
  const delinquentYears = f.taxYears.filter((y) =>
    isYearDelinquent(y, dissolvedForDeadline, y === maxTaxYear ? extension : null),
  );

  // "Not sure" about a Form 7004 asserts NEITHER timeliness nor delinquency.
  // isYearDelinquent() already keeps such a year out of delinquentYears; this
  // names it so the cover letter can also keep it out of the TIMELY wording,
  // which it would otherwise fall into by default. Only the latest year can
  // carry extension facts, so only it can ever be unresolved.
  const unresolvedYear =
    maxTaxYear != null && extensionUnclear(extension, maxTaxYear, dissolvedForDeadline) ? maxTaxYear : null;

  const cover = await buildCoverLetter(f, finalisedAt, authoredDocuments);
  const coverStartPage = out.getPageCount() + 1;
  await copyAll(out, cover);
  pageOrder.push({ label: "Cover letter", startPage: coverStartPage, endPage: out.getPageCount() });
  // Cover letter signature line is at the bottom of the (single) cover page.
  signatures.push({
    label: "Cover letter",
    page: out.getPageCount(),
    instruction: "Sign on the signature line above your typed name, near the bottom of the page.",
    ...SIG_PLACEMENT.coverLetter,
  });

  for (const year of f.taxYears) {
    const yd = f.yearData.find((row) => row.taxYear === year);
    const partVRows = partVRowsForYear(f, year);
    const nonCashTransfers = nonCashTransfersForYear(f, year);
    const partVCents = partVTotalCents(partVRows);
    const partVICentsAddedToLine1f = nonCashCentsForLine1f(nonCashTransfers);
    const line1f = roundedCentsToDollars(partVCents + partVICentsAddedToLine1f);
    // Per-year, not per-package: only THIS year's forms carry the DIIRSP banner,
    // and only if this year is actually late. A timely year bundled alongside
    // late ones gets the plain header.
    const yearDelinquent = delinquentYears.includes(year);

    const form1120Selection = selected1120.get(year);
    if (!form1120Selection) throw new Error(`Missing Form 1120 selection for tax year ${year}.`);
    const f1120 = await loadBlank(form1120Selection.fileName);
    const f1120Writes: PdfFieldWrite[] = [];
    const f1120Meta = await fillForm1120(f1120, f, year, form1120Selection.revision, llcPrintAddress, {
      form: `1120-${year}`,
      writes: f1120Writes,
    });
    if (yearDelinquent) await stampDiirspHeader(f1120, "FOREIGN-OWNED U.S. DE — DIIRSP");
    else await stampDiirspHeader(f1120, "FOREIGN-OWNED U.S. DE");
    // Short-period annotation. A year is short when it starts after Jan 1 (the
    // LLC was formed mid-year) OR ends before Dec 31 (it was dissolved
    // mid-year), so this stamp tracks BOTH bounds and lands exactly where at
    // least one item E box is ticked. The suffix names which case applies so the
    // stamp can never contradict the checkboxes above it.
    const periodStart = periodStartFor(f, year);
    const periodEnd = periodEndFor(f, year);
    const isInitialYear = periodStart !== "01/01";
    const isFinalYear = periodEnd !== "12/31";
    if (isInitialYear || isFinalYear) {
      const suffix =
        isInitialYear && isFinalYear
          ? "(initial and final return)"
          : isFinalYear
            ? "(final return)"
            : `(initial return - formed ${periodStart}/${year})`;
      await stampShortPeriod(f1120, `${periodStart}/${year}`, `${periodEnd}/${year}`, suffix);
    }
    const f1120FirstPage = out.getPageCount() + 1; // 1-based, captured before merge
    await copyAll(out, f1120);
    pageOrder.push({
      label: "Form 1120",
      taxYear: year,
      startPage: f1120FirstPage,
      endPage: out.getPageCount(),
    });
    // Form 1120's "Sign Here" box sits at the bottom of the first page.
    // 2025 revision shifted the box up ~14pt vs 2024 — use the per-revision
    // placement so the signature lands on the blank line in both cases.
    signatures.push({
      label: `Form 1120 — tax year ${year}`,
      page: f1120FirstPage,
      instruction: `Sign and date in the "Sign Here" box at the bottom of the first page. Enter "${SIGNER_TITLE}" as your title.`,
      ...(form1120Selection.revision >= 2025 ? SIG_PLACEMENT.f1120_2025 : SIG_PLACEMENT.f1120_2024),
    });

    const f5472 = await loadBlank("f5472.pdf");
    const f5472Writes: PdfFieldWrite[] = [];
    const f5472Result = fillForm5472(f5472, f, year, line1f, {
      llc: llcPrintAddress,
      owner: ownerPrintAddress,
    }, {
      form: `5472-${year}`,
      writes: f5472Writes,
    });
    if (yearDelinquent) await stampDiirspHeader(f5472, "FOREIGN-OWNED U.S. DE — DIIRSP");
    else await stampDiirspHeader(f5472, "FOREIGN-OWNED U.S. DE");
    const f5472StartPage = out.getPageCount() + 1;
    await copyAll(out, f5472);
    pageOrder.push({
      label: "Form 5472",
      taxYear: year,
      startPage: f5472StartPage,
      endPage: out.getPageCount(),
    });
    // Form 5472 itself does not require a separate signature — the Form 1120
    // signature covers it (5472 is an attachment to 1120).

    const supporting = await buildSupportingStatement(f, year, authoredDocuments);
    const supportingStartPage = out.getPageCount() + 1;
    await copyAll(out, supporting);
    pageOrder.push({
      label: "Part V Statement",
      taxYear: year,
      startPage: supportingStartPage,
      endPage: out.getPageCount(),
    });

    if (nonCashTransfers.length > 0) {
      const partVI = await buildPartVIStatement(f, year, nonCashTransfers, authoredDocuments);
      const partVIStartPage = out.getPageCount() + 1;
      await copyAll(out, partVI);
      pageOrder.push({
        label: "Part VI Statement",
        taxYear: year,
        startPage: partVIStartPage,
        endPage: out.getPageCount(),
      });
    }

    const reasonableCauseIncluded = yearDelinquent;
    if (reasonableCauseIncluded) {
      const rcs = await buildReasonableCause(f, year, authoredDocuments);
      const rcsStartPage = out.getPageCount() + 1;
      await copyAll(out, rcs);
      pageOrder.push({
        label: "Reasonable Cause Statement",
        taxYear: year,
        startPage: rcsStartPage,
        endPage: out.getPageCount(),
      });
      signatures.push({
        label: `Reasonable Cause Statement — tax year ${year}`,
        page: out.getPageCount(),
        instruction: "Sign and date the statement in the signature block at the end.",
        ...SIG_PLACEMENT.rcs,
      });
    }

    recordYears.push({
      taxYear: year,
      form1120Revision: String(form1120Selection.revision),
      revisionUsed: String(form1120Selection.revision),
      shortYearException: form1120Selection.shortYearException,
      periodStart,
      periodEnd,
      status: unresolvedYear === year ? "unresolved" : yearDelinquent ? "late" : "timely",
      isInitialYear,
      isFinalYear,
      line1oSource: f5472Result.line1oSource,
      line1f,
      line1g: 1,
      line1h: line1f,
      partVTotalRounded: roundedCentsToDollars(partVCents),
      partVTotalCents: partVCents,
      partVRows,
      nonCashTransfers,
      ownerPaidCosts: yd?.ownerPaidCosts ?? [],
      zeroConfirmations: yd?.zeroConfirmations ?? {},
      partVICentsAddedToLine1f,
      line1jChecked: shouldCheckLine1j(f, year),
      priorForm5472Filed: f.priorForm5472Filed ?? null,
      ownerHasFtin: f.ownerHasFtin ?? null,
      ownerAddressState: ownerStateForA17(f),
      ownerAddressPostal: ownerPostalForA17(f),
      ownerNoPostalCode: f.ownerNoPostalCode ?? null,
      signerTitleRect: f1120Meta.signerTitleRect,
      signerTitleColumnBounds: f1120Meta.signerTitleColumnBounds,
      signerDeclarationBounds: f1120Meta.signerDeclarationBounds,
      trades: yearTrades(f, year),
      hasUsSourceIncome: f.hasUsSourceIncome ?? null,
      form1120: {
        fields: f1120Writes,
        stampedTexts: [
          yearDelinquent ? "FOREIGN-OWNED U.S. DE — DIIRSP" : "FOREIGN-OWNED U.S. DE",
          ...(isInitialYear || isFinalYear
            ? [
                `Short tax year: ${periodStart}/${year} - ${periodEnd}/${year} ${
                  isInitialYear && isFinalYear
                    ? "(initial and final return)"
                    : isFinalYear
                      ? "(final return)"
                      : `(initial return - formed ${periodStart}/${year})`
                }`,
              ]
            : []),
        ],
      },
      form5472: { fields: f5472Writes },
      reasonableCauseIncluded,
    });
  }

  out.setTitle("Form 5472 package");
  out.setProducer(`form5472prep generator ${GENERATOR_VERSION}`);
  out.setKeywords([
    `version=${GENERATOR_VERSION}`,
    `commit=${commit}`,
    `generatedAt=${generatedAt.toISOString()}`,
  ]);
  const bytes = await out.save();
  return {
    bytes,
    signatures,
    totalPages: out.getPageCount(),
    record: {
      generatorVersion: GENERATOR_VERSION,
      commit,
      generatedAt: generatedAt.toISOString(),
      finalisedAt: finalisedAt.toISOString(),
      llcName: f.llcName,
      ownerName: f.ownerName,
      ownerReferenceId: f.ownerReferenceId,
      llcEin: f.llcEin,
      llcPrintAddress,
      ownerPrintAddress,
      formationDate: f.llcDateIncorporated ? new Date(f.llcDateIncorporated).toISOString() : null,
      dissolutionDate: f.isFinalReturn && f.dissolvedAt ? new Date(f.dissolvedAt).toISOString() : null,
      taxYears: recordYears,
      authoredDocuments,
      pageOrder,
    },
  };
}

async function copyAll(dest: PDFDocument, src: PDFDocument) {
  const pages = await dest.copyPages(src, src.getPageIndices());
  for (const p of pages) dest.addPage(p);
}
