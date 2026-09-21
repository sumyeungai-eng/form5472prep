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
  form1120_2020FieldMap,
  form1120_2021FieldMap,
  form1120_2022FieldMap,
  form1120_2023FieldMap,
  form1120_2024FieldMap,
  form1120_2025FieldMap,
} from "./fieldMaps";
import type { PackageRecord, PackageRecordYear } from "./generatePackage";
import { isValidPbaCode } from "@/lib/irsCodes";

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
  checkA05(record, result);
  checkA06(record, result);
  checkA07(record, result);
  checkA08(record, result);
  checkA09(record, result);
  checkA10(record, result);
  checkA12(record, result);
  checkA16(record, result);
  checkA18(record, result);
  checkA19(record, result);
  checkA20(record, result);
  checkA21(record, result);
  checkA22(record, result);
  checkA23(record, result);
  checkA24(record, result);
  checkA25(record, result);
  checkA27(record, result);
  checkR02(record, result);
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

// A05: 1e and 8d codes are valid for the tax year, mirror each other, and 1d is non-empty.
function checkA05(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const activity = textValue(year.form5472.fields, form5472FieldMap["1d_businessActivity"]).trim();
    const line1e = textValue(year.form5472.fields, form5472FieldMap["1e_businessCode"]).trim();
    const line8d = textValue(year.form5472.fields, form5472FieldMap["8d_businessCode"]).trim();

    if (!activity) {
      fail(result, "A05", `Tax year ${year.taxYear}: Form 5472 line 1d business activity is blank.`);
    }
    if (!isValidPbaCode(line1e, year.taxYear)) {
      fail(result, "A05", `Tax year ${year.taxYear}: Form 5472 line 1e business code ${line1e || "(blank)"} is not on the IRS list.`);
    }
    if (!isValidPbaCode(line8d, year.taxYear)) {
      fail(result, "A05", `Tax year ${year.taxYear}: Form 5472 line 8d business code ${line8d || "(blank)"} is not on the IRS list.`);
    }
    if (line1e && line8d && line1e !== line8d) {
      fail(result, "A05", `Tax year ${year.taxYear}: Form 5472 line 1e code ${line1e} does not match line 8d code ${line8d}.`);
    }
  }
}

// A06: 1120 and 5472 header begin/end dates are both populated and identical.
function checkA06(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const m1120 = form1120MapForYear(year);
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

// A08: 1120 revision matches tax year, or short-year exception applies.
function checkA08(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const revision = Number(year.form1120Revision);
    if (revision === year.taxYear && !year.shortYearException) continue;
    if (year.shortYearException && revision === year.taxYear - 1 && (year.isInitialYear || year.isFinalYear)) continue;
    fail(result, "A08", `Tax year ${year.taxYear}: Form 1120 revision ${year.form1120Revision} does not match the tax year.`);
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
    const m1120 = form1120MapForYear(year);
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

// A18: foreign tax ID fields are a real value or exactly "None"; never blank or equal to US ID.
function checkA18(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    for (const [ftinField, usIdField] of [
      [form5472FieldMap["4b3_ftin"], form5472FieldMap["4b1_usId"]],
      [form5472FieldMap["8b3_ftin"], form5472FieldMap["8b1_usId"]],
    ] as const) {
      const ftin = textValue(year.form5472.fields, ftinField).trim();
      const usId = textValue(year.form5472.fields, usIdField).trim();
      if (!ftin || (ftin !== "None" && ftin === usId)) {
        fail(result, "A18", `Tax year ${year.taxYear}: foreign tax ID field ${ftinField} is blank or duplicates the US ID.`);
      }
    }
  }
}

// A19: reference ID is alphanumeric, at most 50 chars, and equals stored ownerReferenceId.
function checkA19(record: PackageRecord, result: MutableResult) {
  const stored = record.ownerReferenceId?.trim() ?? "";
  for (const year of record.taxYears) {
    for (const field of [form5472FieldMap["4b2_referenceId"], form5472FieldMap["8b2_referenceId"]]) {
      const value = textValue(year.form5472.fields, field).trim();
      if (!/^[A-Za-z0-9]{1,50}$/.test(value) || value !== stored) {
        fail(result, "A19", `Tax year ${year.taxYear}: reference ID field ${field} does not match the stored ownerReferenceId.`);
      }
    }
  }
}

// A20: LLC name, EIN, and address are identical wherever the generator writes them.
function checkA20(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const m1120 = form1120MapForYear(year);
    for (const field of [m1120["1a_name"], form5472FieldMap["1a_name"]]) {
      const fields = field === m1120["1a_name"] ? year.form1120.fields : year.form5472.fields;
      if (textValue(fields, field) !== record.llcName) {
        fail(result, "A20", `Tax year ${year.taxYear}: LLC name is inconsistent in ${field}.`);
      }
    }
    for (const field of [m1120.B_ein, form5472FieldMap["1b_ein"]]) {
      const fields = field === m1120.B_ein ? year.form1120.fields : year.form5472.fields;
      if (textValue(fields, field) !== record.llcEin) {
        fail(result, "A20", `Tax year ${year.taxYear}: EIN is inconsistent in ${field}.`);
      }
    }
    const street1120 = "1_street" in m1120 ? m1120["1_street"] : m1120["1_streetSuite"];
    for (const [field, fields] of [
      [street1120, year.form1120.fields],
      [form5472FieldMap["1_street"], year.form5472.fields],
    ] as const) {
      if (textValue(fields, field) !== record.llcPrintAddress.value) {
        fail(result, "A20", `Tax year ${year.taxYear}: LLC address is inconsistent in ${field}.`);
      }
    }
  }
}

// A21: 1120 item D equals 5472 line 1c.
function checkA21(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const m1120 = form1120MapForYear(year);
    const assets1120 = textValue(year.form1120.fields, m1120.D_totalAssets);
    const assets5472 = textValue(year.form5472.fields, form5472FieldMap["1c_totalAssets"]);
    if (!assets1120 || assets1120 !== assets5472) {
      fail(result, "A21", `Tax year ${year.taxYear}: 1120 item D does not equal 5472 line 1c.`);
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
  const timelinessScanText = [record.llcName, record.ownerName].reduce(
    (text, name) => stripLiteral(text, name),
    cover.text,
  );
  if (/\b(timely|late|delinquent|DIIRSP)\b/i.test(timelinessScanText)) {
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

// A27: every statement page carries LLC name, EIN, and tax year.
function checkA27(record: PackageRecord, result: MutableResult) {
  for (const doc of record.authoredDocuments.filter((d) => d.kind === "partVStatement")) {
    const pages = doc.pages ?? [doc.lines];
    for (let index = 0; index < pages.length; index++) {
      const text = pages[index].join("\n");
      if (
        !text.includes(record.llcName) ||
        !text.includes(record.llcEin) ||
        !text.includes(`Tax Year ${doc.taxYear}`)
      ) {
        fail(result, "A27", `Part V statement page ${index + 1} for tax year ${doc.taxYear} is missing the LLC header.`);
      }
    }
  }
}

// R02: package-level print addresses must fit their narrowest target fields.
function checkR02(record: PackageRecord, result: MutableResult) {
  for (const failure of [...record.llcPrintAddress.failures, ...record.ownerPrintAddress.failures]) {
    fail(result, "R02", failure);
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

function form1120MapForYear(year: PackageRecordYear) {
  switch (year.form1120Revision) {
    case "2020":
      return form1120_2020FieldMap;
    case "2021":
      return form1120_2021FieldMap;
    case "2022":
      return form1120_2022FieldMap;
    case "2023":
      return form1120_2023FieldMap;
    case "2024":
      return form1120_2024FieldMap;
    case "2025":
      return form1120_2025FieldMap;
    default:
      return Number(year.taxYear) >= 2025 ? form1120_2025FieldMap : form1120_2024FieldMap;
  }
}

function hasLineSequence(lines: string[], expected: readonly string[]): boolean {
  return lines.some((_, index) => expected.every((line, offset) => lines[index + offset] === line));
}

function coverLetterText(record: PackageRecord): { lines: string[]; text: string } {
  const cover = record.authoredDocuments.find((doc) => doc.kind === "coverLetter");
  const lines = cover?.lines ?? [];
  return { lines, text: lines.join("\n") };
}

function stripLiteral(text: string, literal: string): string {
  if (!literal) return text;
  return text.replace(new RegExp(escapeRegExp(literal), "gi"), "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
