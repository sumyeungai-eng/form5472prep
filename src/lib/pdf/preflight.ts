import { PDFDocument } from "pdf-lib";
import {
  AUTHORED_DOC_SIGNATURE_HEADING,
  COVER_LETTER_ENCLOSURE_PHRASE,
  GENERATOR_VERSION,
  IRS_MAIL_ADDRESS,
} from "@/config/filingPackage";
import { countWidgetAnnotations } from "./fillForm";
import {
  form5472FieldMap,
  form1120_2024FieldMap,
  form1120_2025FieldMap,
} from "./fieldMaps";
import type { PackageRecord } from "./generatePackage";

export type PreflightIssue = { id: string; message: string };
export type PreflightResult = {
  ok: boolean;
  failures: PreflightIssue[];
  warnings: PreflightIssue[];
};

type MutableResult = {
  failures: PreflightIssue[];
  warnings: PreflightIssue[];
};

const IRS_MAIL_ADDRESS_DISPLAY_LINES = [
  "Internal Revenue Service",
  "1973 Rulon White Blvd, M/S 6112",
  "Attn: PIN Unit",
  "Ogden, UT 84201",
] as const;
const IRS_MAIL_ADDRESS_DISPLAY_SINGLE_LINE = `${IRS_MAIL_ADDRESS_DISPLAY_LINES[0]}, ${IRS_MAIL_ADDRESS_DISPLAY_LINES[1]} ${IRS_MAIL_ADDRESS_DISPLAY_LINES[2]}, ${IRS_MAIL_ADDRESS_DISPLAY_LINES[3]}`;

export async function runPreflight(
  record: PackageRecord,
  pdfBytes: Uint8Array,
): Promise<PreflightResult> {
  const result: MutableResult = { failures: [], warnings: [] };

  checkA01(record, result);
  checkA02(record, result);
  checkA03(record, result);
  checkA06(record, result);
  checkA07(record, result);
  checkA09(record, result);
  checkA10(record, result);
  checkA12(record, result);
  checkA16(record, result);
  checkA22(record, result);
  checkA23(record, result);
  checkA24(record, result);
  checkA25(record, result);
  await checkA28(pdfBytes, result);
  await checkA30(pdfBytes, record, result);

  return { ok: result.failures.length === 0, ...result };
}

// A01: 5472 line 2 checked.
function checkA01(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    if (!hasChecked(year.form5472.fields, form5472FieldMap.box2_foreign50pct)) {
      fail(result, "A01", `Tax year ${year.taxYear}: Form 5472 line 2 is not checked.`);
    }
  }
}

// A02: 5472 line 3 checked.
function checkA02(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    if (!hasChecked(year.form5472.fields, form5472FieldMap.box3_foreignOwnedUsDE)) {
      fail(result, "A02", `Tax year ${year.taxYear}: Form 5472 line 3 is not checked.`);
    }
  }
}

// A03: 5472 lines 43a, 43b(1), 43b(2) have no mark and no text.
function checkA03(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const wrote43 = year.form5472.fields.some((w) =>
      w.field === form5472FieldMap.q43a_coveredDebt_no || /43b|c3_9/.test(w.field),
    );
    if (wrote43) {
      fail(result, "A03", `Tax year ${year.taxYear}: Form 5472 line 43a or 43b was written.`);
    }
  }
}

// A06: 1120 and 5472 header begin/end dates are both populated and identical.
function checkA06(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const m1120 = year.taxYear >= 2025 ? form1120_2025FieldMap : form1120_2024FieldMap;
    const begin1120 = textValue(year.form1120.fields, m1120.taxYearBeginning);
    const end1120 = textValue(year.form1120.fields, m1120.taxYearEnding);
    const endYear1120 = textValue(year.form1120.fields, m1120.taxYearEndingYear2);
    const begin5472 = `${textValue(year.form5472.fields, form5472FieldMap.taxYearBeginMonthDay)}/${textValue(
      year.form5472.fields,
      form5472FieldMap.taxYearBeginYear,
    )}`;
    const end5472 = textValue(year.form5472.fields, form5472FieldMap.taxYearEndMonthDay);
    const endYear5472 = textValue(year.form5472.fields, form5472FieldMap.taxYearEndYear);
    if (
      !begin1120 ||
      !end1120 ||
      !endYear1120 ||
      !begin5472 ||
      !end5472 ||
      !endYear5472 ||
      begin1120 !== begin5472 ||
      end1120 !== end5472 ||
      endYear1120 !== endYear5472.slice(-2)
    ) {
      fail(result, "A06", `Tax year ${year.taxYear}: 1120 and 5472 header dates do not match.`);
    }
  }
}

// A07: first-year begin date equals formation date; final-year end date equals dissolution date.
function checkA07(record: PackageRecord, result: MutableResult) {
  const formation = record.formationDate ? new Date(record.formationDate) : null;
  const dissolution = record.dissolutionDate ? new Date(record.dissolutionDate) : null;
  for (const year of record.taxYears) {
    if (formation && formation.getUTCFullYear() === year.taxYear) {
      const expected = mmdd(formation);
      if (year.periodStart !== expected) {
        fail(result, "A07", `Tax year ${year.taxYear}: first-year period begins ${year.periodStart}, expected ${expected}.`);
      }
    }
    if (dissolution && dissolution.getUTCFullYear() === year.taxYear) {
      const expected = mmdd(dissolution);
      if (year.periodEnd !== expected) {
        fail(result, "A07", `Tax year ${year.taxYear}: final-year period ends ${year.periodEnd}, expected ${expected}.`);
      }
    }
  }
}

// A09: "Foreign-owned U.S. DE" text is drawn on 1120 page 1.
function checkA09(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    if (!year.form1120.stampedTexts.some((line) => line.includes("Foreign-owned U.S. DE") || line.includes("FOREIGN-OWNED U.S. DE"))) {
      fail(result, "A09", `Tax year ${year.taxYear}: 1120 foreign-owned U.S. DE stamp is missing.`);
    }
  }
}

// A10: 1120 item E(1)/E(2) checked exactly when first/final.
function checkA10(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const m1120 = year.taxYear >= 2025 ? form1120_2025FieldMap : form1120_2024FieldMap;
    const initialChecked = hasChecked(year.form1120.fields, m1120.E_initialReturn);
    const finalChecked = hasChecked(year.form1120.fields, m1120.E_finalReturn);
    if (initialChecked !== year.isInitialYear || finalChecked !== year.isFinalYear) {
      fail(result, "A10", `Tax year ${year.taxYear}: 1120 item E boxes do not match first/final status.`);
    }
  }
}

// A12: 1f equals rounded Part V total; 1h equals sum of 1f; 1g equals number of Forms 5472.
function checkA12(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const cents = year.partVRows.reduce((sum, row) => sum + Math.abs(row.amountCents), 0);
    const rounded = Math.floor((cents + 50) / 100);
    if (year.partVTotalRounded !== rounded || year.line1f !== rounded) {
      fail(result, "A12", `Tax year ${year.taxYear}: line 1f does not equal the rounded Part V total.`);
    }
    if (year.line1g !== 1) {
      fail(result, "A12", `Tax year ${year.taxYear}: line 1g does not equal the number of Forms 5472.`);
    }
    if (year.line1h !== year.line1f) {
      fail(result, "A12", `Tax year ${year.taxYear}: line 1h does not equal the sum of line 1f values.`);
    }
  }
}

// A16: 1o source is llc_field or default_us; default_us is warning W16.
function checkA16(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    if (year.line1oSource !== "llc_field" && year.line1oSource !== "default_us") {
      fail(result, "A16", `Tax year ${year.taxYear}: line 1o source is invalid.`);
    } else if (year.line1oSource === "default_us") {
      warn(result, "W16", `Tax year ${year.taxYear}: line 1o defaulted to United States.`);
    }
  }
}

// A22: cover letter enclosure phrase, no reversed phrase, no timeliness words.
function checkA22(record: PackageRecord, result: MutableResult) {
  const cover = coverLetterText(record);
  const reLine = cover.lines.find((line) => line.startsWith("Re:")) ?? "";
  const bodyHasPhrase = cover.lines.some((line) => !line.startsWith("Re:") && line.includes(COVER_LETTER_ENCLOSURE_PHRASE));
  if (!reLine.includes(COVER_LETTER_ENCLOSURE_PHRASE) || !bodyHasPhrase) {
    fail(result, "A22", "Cover letter does not contain the exact enclosure phrase in both Re line and body.");
  }
  if (/Form 5472 with attached pro forma/i.test(cover.text)) {
    fail(result, "A22", "Cover letter contains the reversed enclosure phrase.");
  }
  if (/\b(timely|late|delinquent|DIIRSP)\b/i.test(cover.text)) {
    fail(result, "A22", "Cover letter contains removed timeliness or DIIRSP wording.");
  }
}

// A23: addressee equals config address; letter date equals finalisedAt.
function checkA23(record: PackageRecord, result: MutableResult) {
  const cover = coverLetterText(record);
  const expectedDate = formatFinalisedDate(new Date(record.finalisedAt));
  if (!hasLineSequence(cover.lines, IRS_MAIL_ADDRESS_DISPLAY_LINES) || IRS_MAIL_ADDRESS_DISPLAY_SINGLE_LINE !== IRS_MAIL_ADDRESS) {
    fail(result, "A23", "Cover letter addressee does not match the configured IRS address.");
  }
  if (!cover.lines.includes(`Date: ${expectedDate}`)) {
    fail(result, "A23", "Cover letter date does not match finalisedAt.");
  }
}

// A24: reasonable-cause statement present iff at least one recorded status is late.
function checkA24(record: PackageRecord, result: MutableResult) {
  const lateYears = record.taxYears.filter((year) => year.status === "late");
  const rcsDocs = record.authoredDocuments.filter((doc) => doc.kind === "reasonableCauseStatement");
  if (lateYears.length === 0 && rcsDocs.length > 0) {
    fail(result, "A24", "Reasonable-cause statement is present but no tax year is late.");
  }
  if (lateYears.length > 0 && rcsDocs.length === 0) {
    fail(result, "A24", "At least one tax year is late but no reasonable-cause statement is present.");
  }
}

// A25: authored-document signature heading equals config value.
function checkA25(record: PackageRecord, result: MutableResult) {
  for (const doc of record.authoredDocuments.filter((d) => d.kind !== "partVStatement")) {
    if (!doc.lines.includes(AUTHORED_DOC_SIGNATURE_HEADING)) {
      fail(result, "A25", `${doc.kind} does not use the configured signature heading.`);
    }
  }
}

// A28: final PDF has zero remaining form fields and zero widget annotations.
async function checkA28(pdfBytes: Uint8Array, result: MutableResult) {
  const pdf = await PDFDocument.load(pdfBytes, { updateMetadata: false });
  const fieldCount = pdf.getForm().getFields().length;
  const widgetCount = countWidgetAnnotations(pdf);
  if (fieldCount !== 0 || widgetCount !== 0) {
    fail(result, "A28", `Final PDF has ${fieldCount} AcroForm fields and ${widgetCount} widget annotations.`);
  }
}

// A30: PDF metadata carries generator version and commit hash.
async function checkA30(pdfBytes: Uint8Array, record: PackageRecord, result: MutableResult) {
  const pdf = await PDFDocument.load(pdfBytes, { updateMetadata: false });
  const producer = pdf.getProducer() ?? "";
  const rawKeywords = pdf.getKeywords() ?? "";
  const keywords = Array.isArray(rawKeywords) ? rawKeywords.join(" ") : rawKeywords;
  if (pdf.getTitle() !== "Form 5472 package" || !producer.includes(GENERATOR_VERSION)) {
    fail(result, "A30", "PDF title or producer metadata is missing the generator version.");
  }
  for (const needle of [
    `version=${record.generatorVersion}`,
    `commit=${record.commit}`,
    `generatedAt=${record.generatedAt}`,
  ]) {
    if (!keywords.includes(needle)) fail(result, "A30", `PDF keywords missing ${needle}.`);
  }
}

function hasChecked(fields: { field: string; value: string | true }[], field: string): boolean {
  return fields.some((write) => write.field === field && write.value === true);
}

function textValue(fields: { field: string; value: string | true }[], field: string): string {
  const write = fields.find((w) => w.field === field && typeof w.value === "string");
  return typeof write?.value === "string" ? write.value : "";
}

function hasLineSequence(lines: string[], expected: readonly string[]): boolean {
  return lines.some((_, index) => expected.every((line, offset) => lines[index + offset] === line));
}

function coverLetterText(record: PackageRecord): { lines: string[]; text: string } {
  const cover = record.authoredDocuments.find((doc) => doc.kind === "coverLetter");
  const lines = cover?.lines ?? [];
  return { lines, text: lines.join("\n") };
}

function mmdd(date: Date): string {
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`;
}

function formatFinalisedDate(date: Date): string {
  return `${String(date.getUTCMonth() + 1)}/${String(date.getUTCDate())}/${date.getUTCFullYear()}`;
}

function fail(result: MutableResult, id: string, message: string) {
  result.failures.push({ id, message });
}

function warn(result: MutableResult, id: string, message: string) {
  result.warnings.push({ id, message });
}
