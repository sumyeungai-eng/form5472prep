import { PDFDocument } from "pdf-lib";
import {
  AUTHORED_DOC_SIGNATURE_HEADING,
  COVER_LETTER_CLOSING,
  COVER_LETTER_ENCLOSURE_PHRASE,
  GENERATOR_VERSION,
  IRS_MAIL_ADDRESS,
} from "@/config/filingPackage";
import { countWidgetAnnotations } from "./fillForm";
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

  checkW02(record, result);
  checkA01(record, result);
  checkA02(record, result);
  checkA03(record, result);
  checkA04(record, result);
  checkA05(record, result);
  checkA06(record, result);
  checkA07(record, result);
  checkA08(record, result);
  checkA09(record, result);
  checkA10(record, result);
  checkA11(record, result);
  checkA12(record, result);
  checkA13(record, result);
  checkA14(record, result);
  checkA15(record, result);
  checkA16(record, result);
  checkA17(record, result);
  checkA18(record, result);
  checkA19(record, result);
  checkA20(record, result);
  checkA21(record, result);
  checkA22(record, result);
  checkA23(record, result);
  checkA24(record, result);
  checkA25(record, result);
  checkA26(record, result);
  checkA27(record, result);
  checkR02(record, result);
  checkA31(record, result);
  checkA32(record, result);
  checkA33(record, result);
  checkA34(record, result);
  checkA35(record, result);
  checkA36(record, result);
  checkW31(record, result);
  checkW32(record, result);
  checkW33(record, result);
  checkW34(record, result);
  checkW35(record, result);
  checkW36(record, result);
  checkW37(record, result);
  checkW39(record, result);
  checkW40(record, result);
  checkW41(record, result);
  await checkA28(pdfBytes, result);
  await checkA30(pdfBytes, record, result);

  return { ok: result.failures.length === 0, ...result };
}

// W02: older orders may predate explicit per-category transaction confirmations.
function checkW02(record: PackageRecord, result: MutableResult) {
  const labels = {
    contributions: "money put in",
    distributions: "money taken out",
    loansFromOwner: "loans from owner to LLC",
    loansToOwner: "loans from LLC to owner",
    ownerPaidCosts: "costs paid personally",
  } as const;
  const keys = Object.keys(labels) as Array<keyof typeof labels>;
  for (const year of record.taxYears) {
    const confirmations = year.zeroConfirmations ?? {};
    const has = {
      contributions: year.partVRows.some((row) => row.category === "contribution"),
      distributions: year.partVRows.some((row) => row.category === "distribution"),
      loansFromOwner: year.partVRows.some((row) => row.category === "loan_from_owner"),
      loansToOwner: year.partVRows.some((row) => row.category === "loan_to_owner"),
      ownerPaidCosts: year.ownerPaidCosts.length > 0,
    };
    const missing = keys.filter(
      (key) => !has[key] && confirmations[key] !== true,
    );
    if (missing.length > 0) {
      warn(
        result,
        "W02",
        `Tax year ${year.taxYear}: Some transaction categories were never confirmed (${missing.map((key) => labels[key]).join(", ")}).`,
      );
    }
  }
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

// A04: Form 5472 lines 37 through 42 are each answered where a Yes/No box exists.
function checkA04(record: PackageRecord, result: MutableResult) {
  // Lines answered on every Form 5472.
  const requiredPairs = [
    ["37", form5472FieldMap.q37_imports_yes, form5472FieldMap.q37_imports_no],
    ["39", form5472FieldMap.q39_csa_yes, form5472FieldMap.q39_csa_no],
    ["40a", form5472FieldMap.q40a_267A_yes, form5472FieldMap.q40a_267A_no],
    ["41a", form5472FieldMap.q41a_fdii_yes, form5472FieldMap.q41a_fdii_no],
    ["42a", form5472FieldMap.q42a_safeHavenInRange_yes, form5472FieldMap.q42a_safeHavenInRange_no],
    ["42b", form5472FieldMap.q42b_safeHavenOutsideRange_yes, form5472FieldMap.q42b_safeHavenOutsideRange_no],
  ] as const;
  // Lines 38a and 38c only apply "If 'Yes'" to line 37.
  const conditionalOn37 = [
    ["38a", form5472FieldMap.q38a_customsValue_yes, form5472FieldMap.q38a_customsValue_no],
    ["38c", form5472FieldMap.q38c_importDocumentation_yes, form5472FieldMap.q38c_importDocumentation_no],
  ] as const;
  for (const year of record.taxYears) {
    const fields = year.form5472.fields;
    const missing = requiredPairs
      .filter(([, yesField, noField]) => !hasChecked(fields, yesField) && !hasChecked(fields, noField))
      .map(([line]) => line);
    if (missing.length > 0) {
      fail(result, "A04", `Tax year ${year.taxYear}: Form 5472 lines ${missing.join(", ")} are not answered.`);
    }
    const line37Yes = hasChecked(fields, form5472FieldMap.q37_imports_yes);
    for (const [line, yesField, noField] of conditionalOn37) {
      const answered = hasChecked(fields, yesField) || hasChecked(fields, noField);
      if (!line37Yes && answered) {
        fail(result, "A04", `Tax year ${year.taxYear}: Form 5472 line ${line} must be blank when line 37 is No.`);
      }
      if (line37Yes && !answered) {
        fail(result, "A04", `Tax year ${year.taxYear}: Form 5472 line ${line} must be answered when line 37 is Yes.`);
      }
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
// Generator 2.3.0: the 1120 prints the beginning YEAR itself, so its "tax year
// beginning" value is MM/DD only and must equal the 5472 begin month/day.
// Under the short-year prior-revision exception the printed year is wrong, so
// that value is MM/DD/YYYY and must equal the full 5472 begin date.
function checkA06(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const m1120 = form1120MapForYear(year);
    const begin1120 = textValue(year.form1120.fields, m1120.taxYearBeginning);
    const end1120 = textValue(year.form1120.fields, m1120.taxYearEnding);
    const endYear1120 = textValue(year.form1120.fields, m1120.taxYearEndingYear2);
    const beginMonthDay5472 = textValue(year.form5472.fields, form5472FieldMap.taxYearBeginMonthDay);
    const beginYear5472 = textValue(year.form5472.fields, form5472FieldMap.taxYearBeginYear);
    const expectedBegin1120 = year.shortYearException ? `${beginMonthDay5472}/${beginYear5472}` : beginMonthDay5472;
    const beginFormatOk = year.shortYearException
      ? /^\d{2}\/\d{2}\/\d{4}$/.test(begin1120)
      : /^\d{2}\/\d{2}$/.test(begin1120);
    const end5472 = textValue(year.form5472.fields, form5472FieldMap.taxYearEndMonthDay);
    const endYear5472 = textValue(year.form5472.fields, form5472FieldMap.taxYearEndYear);
    if (
      !begin1120 ||
      !end1120 ||
      !endYear1120 ||
      !beginMonthDay5472 ||
      !beginYear5472 ||
      !end5472 ||
      !endYear5472 ||
      !beginFormatOk ||
      begin1120 !== expectedBegin1120 ||
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
    const roundedPartV = Math.floor((year.partVTotalCents + 50) / 100);
    const roundedLine1f = Math.floor((year.partVTotalCents + year.partVICentsAddedToLine1f + 50) / 100);
    if (year.partVTotalRounded !== roundedPartV || year.line1f !== roundedLine1f) {
      fail(result, "A12", `Tax year ${year.taxYear}: line 1f does not equal the rounded Part V plus Part VI total.`);
    }
    if (year.line1g !== 1) {
      fail(result, "A12", `Tax year ${year.taxYear}: line 1g does not equal the number of Forms 5472.`);
    }
    if (year.line1h !== year.line1f) {
      fail(result, "A12", `Tax year ${year.taxYear}: line 1h does not equal the sum of line 1f values.`);
    }
  }
}

// A11: signer title stays inside the measured title column and below the declaration text.
function checkA11(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const rect = year.signerTitleRect;
    const column = year.signerTitleColumnBounds;
    const declaration = year.signerDeclarationBounds;
    if (rect.left < column.left || rect.right > column.right || rect.bottom < column.bottom || rect.top > column.top) {
      fail(result, "A11", `Tax year ${year.taxYear}: signer title is outside the measured title column.`);
    }
    if (rectsOverlap(rect, declaration)) {
      fail(result, "A11", `Tax year ${year.taxYear}: signer title overlaps the 1120 declaration text region.`);
    }
  }
}

// A13: Part V box checked; every row has date in period, description, and non-zero amount.
function checkA13(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    if (!hasChecked(year.form5472.fields, form5472FieldMap.partV_attachedStatementBox)) {
      fail(result, "A13", `Tax year ${year.taxYear}: Part V attached-statement box is not checked.`);
    }
    for (const row of year.partVRows) {
      if (!row.description?.trim() || Math.abs(row.amountCents) <= 0 || !dateInsidePeriod(row.date, year.taxYear, year.periodStart, year.periodEnd)) {
        fail(result, "A13", `Tax year ${year.taxYear}: Part V row is missing a valid date, description, or amount.`);
      }
    }
  }
}

// A14: Part VI box checked iff non-cash transfers exist, and the statement exists.
function checkA14(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const hasTransfers = year.nonCashTransfers.length > 0;
    const boxChecked = hasChecked(year.form5472.fields, form5472FieldMap.partVI_attachedStatementBox);
    const hasStatement = record.authoredDocuments.some((doc) => doc.kind === "partVIStatement" && doc.taxYear === year.taxYear);
    if (boxChecked !== hasTransfers || hasStatement !== hasTransfers) {
      fail(result, "A14", `Tax year ${year.taxYear}: Part VI checkbox and statement do not match non-cash transfers.`);
    }
  }
}

// A15: 1j follows formation year plus prior-filing answer, with reviewer warnings for legacy/uncertain answers.
// W15 "An earlier year may not have been filed" is suppressed (spec item 10)
// when the EARLIEST tax year in this package contains the formation date, or
// that year's Form 5472 line 1j (initial year) is checked: then no earlier
// year exists that could have been missed.
function checkA15(record: PackageRecord, result: MutableResult) {
  const formationYear = record.formationDate ? new Date(record.formationDate).getUTCFullYear() : null;
  const earliest = record.taxYears.reduce<PackageRecordYear | null>(
    (min, year) => (min === null || year.taxYear < min.taxYear ? year : min),
    null,
  );
  const packageStartsAtFormation =
    earliest !== null &&
    (earliest.isFormationYear === true ||
      (earliest.isFormationYear === undefined && formationYear !== null && earliest.taxYear === formationYear) ||
      earliest.line1jChecked === true ||
      hasChecked(earliest.form5472.fields, form5472FieldMap["1j_initialYear"]));
  for (const year of record.taxYears) {
    const expected =
      formationYear !== null &&
      year.taxYear === formationYear &&
      (year.priorForm5472Filed == null || year.priorForm5472Filed === "no");
    const checked = hasChecked(year.form5472.fields, form5472FieldMap["1j_initialYear"]);
    if (checked !== expected || year.line1jChecked !== expected) {
      fail(result, "A15", `Tax year ${year.taxYear}: Form 5472 line 1j does not match the prior-filing answer.`);
    }
    if (year.priorForm5472Filed == null) {
      warn(result, "W15b", "Prior-filing question not answered.");
    } else if (
      formationYear !== null &&
      formationYear === year.taxYear &&
      (year.priorForm5472Filed === "yes" || year.priorForm5472Filed === "not_sure")
    ) {
      warn(result, "W15", "Formation-year prior Form 5472 answer needs reviewer confirmation.");
    } else if (
      !packageStartsAtFormation &&
      formationYear !== null &&
      formationYear < year.taxYear &&
      (year.priorForm5472Filed === "no" || year.priorForm5472Filed === "not_sure")
    ) {
      warn(result, "W15", "An earlier year may not have been filed.");
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

// A17: owner address has province/state and postal, unless no postal code was explicitly answered.
function checkA17(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const legacySingleLineOwnerAddress =
      !year.ownerAddressState &&
      !year.ownerAddressPostal &&
      year.ownerNoPostalCode === null &&
      record.ownerPrintAddress.value.trim().length > 0;
    if (legacySingleLineOwnerAddress) {
      warn(result, "W17", `Tax year ${year.taxYear}: Owner address not in structured form (older order).`);
      continue;
    }
    if (!year.ownerAddressState || (!year.ownerAddressPostal && year.ownerNoPostalCode !== true)) {
      fail(result, "A17", `Tax year ${year.taxYear}: owner address is missing state/province or postal-code confirmation.`);
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
      if (!ftin && year.ownerHasFtin == null) {
        warn(result, "W18", `Tax year ${year.taxYear}: Owner FTIN answer not in structured form (older order).`);
        continue;
      }
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
      if (!stored) {
        if (value) {
          fail(result, "A19", `Tax year ${year.taxYear}: reference ID field ${field} is not blank when no ownerReferenceId is stored.`);
        }
      } else if (!/^[A-Za-z0-9]{1,50}$/.test(value) || value !== stored) {
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
  // Names are stripped whitespace-flexibly: the cover letter wraps its body,
  // so an LLC name such as "Late Night Media LLC" can be split across two
  // lines ("...for Late Night\nMedia LLC.") and must still be recognised.
  const timelinessScanText = [record.llcName, record.ownerName].reduce(
    (text, name) => stripName(text, name),
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
  const lateSet = new Set(lateYears.map((year) => year.taxYear));
  if (rcsDocs.length !== lateYears.length) {
    fail(result, "A24", "Reasonable-cause statements do not match the late tax years one-for-one.");
  }
  for (const doc of rcsDocs) {
    if (doc.taxYear == null || !lateSet.has(doc.taxYear)) {
      fail(result, "A24", "Reasonable-cause statement is present for a non-late tax year.");
      continue;
    }
    const text = doc.lines.join("\n");
    if (!text.includes(`tax year ${doc.taxYear}`) || /tax year in question/i.test(text)) {
      fail(result, "A24", `Reasonable-cause statement for ${doc.taxYear} does not name its own tax year.`);
    }
  }
}

// A25: every authored STATEMENT carries the configured signature heading; the
// cover letter closes with COVER_LETTER_CLOSING and must NOT carry the
// penalties-of-perjury heading (generator 2.2.0).
function checkA25(record: PackageRecord, result: MutableResult) {
  for (const doc of record.authoredDocuments) {
    if (doc.kind === "coverLetter") {
      if (doc.lines.includes(AUTHORED_DOC_SIGNATURE_HEADING)) {
        fail(result, "A25", "coverLetter must not carry the penalties-of-perjury signature heading.");
      }
      if (!doc.lines.includes(COVER_LETTER_CLOSING)) {
        fail(result, "A25", "coverLetter does not use the configured closing.");
      }
      continue;
    }
    if (!doc.lines.includes(AUTHORED_DOC_SIGNATURE_HEADING)) {
      fail(result, "A25", `${doc.kind} does not use the configured signature heading.`);
    }
  }
}

// A26: RCS text must not contradict questionnaire facts (spec item 2, D8).
// Each finding names the source field, quotes every matched phrase (about 80
// characters of context each) and states the rule, so the admin can act on it.
// Since generator 2.3.0 the text that renders is the admin narrative plus our
// own template; the narrative is judged on its own (named field) and the rest
// of the statement as "generated text". The customer's explanation is never
// printed, so a match there is only context (W26b, while no admin narrative
// has been written for that year — the moment the admin is about to draft it).
const A26_RULE =
  "Rule: the reasonable cause statement must not make claims about operations, expenses, employees or " +
  "transactions that the order data does not support or contradicts.";
const A26_INCOME_RULE =
  "Rule: the reasonable cause statement must not deny U.S. income or tax when the order records U.S.-source income.";
const UNSUPPORTED_OPERATIONS =
  /\b(?:dormant|inactive|non-operating|never operated|did not operate(?: with customers or vendors)?|no customers|no vendors|customer payments|vendor invoices|(?:no|zero|without any|did not have any|didn't have any|never had any)\s+(?:operating\s+)?(?:expenses|expenditures|employees|staff|transactions|operations|business\s+activit(?:y|ies)|activit(?:y|ies)))\b/gi;
const US_INCOME_DENIAL = /\b(?:no U\.S\. income(?! tax return)|no tax owed)\b/gi;

function checkA26(record: PackageRecord, result: MutableResult) {
  for (const doc of record.authoredDocuments.filter((d) => d.kind === "reasonableCauseStatement")) {
    const year = record.taxYears.find((y) => y.taxYear === doc.taxYear);
    const rcs = year?.rcs;
    if (doc.rcsFallbackUsed) {
      warn(result, "W26", "Reasonable cause text predates the per-year questions.");
    }
    // Records from generator 2.3.0 on report a missing admin narrative as A32
    // ("RCS narrative not written for tax year X"); this generic message stays
    // only for older records that predate the narrative field.
    if (doc.rcsMissingAnswers && doc.taxYear != null && !rcs) {
      fail(result, "A26", `Reasonable cause answers missing for ${doc.taxYear}.`);
    }
    if (!year || doc.rcsFallbackUsed) continue;
    const docText = documentText(doc.lines);
    const sources: Array<{ label: string; text: string }> = [];
    if (rcs) {
      if (rcs.narrative?.trim()) {
        sources.push({ label: `Tax year ${year.taxYear} → RCS narrative (admin)`, text: rcs.narrative });
      }
      sources.push({
        label: `Tax year ${year.taxYear} → reasonable cause statement (generated text)`,
        text: removeTexts(docText, rcs.narrative ? [rcs.narrative] : []),
      });
    } else {
      sources.push({ label: `Tax year ${year.taxYear} → reasonable cause statement text`, text: docText });
    }
    const partVContext =
      year.partVTotalCents !== 0 || year.ownerPaidCosts.length > 0
        ? ` This year reports ${formatCents(Math.abs(year.partVTotalCents))} of Part V transactions.`
        : "";
    for (const source of sources) {
      const quotes = quoteMatches(source.text, UNSUPPORTED_OPERATIONS);
      if (quotes.length > 0) {
        fail(result, "A26", `${source.label}: ${quotes.join("; ")} — ${A26_RULE}${partVContext}`);
      }
      if (year.hasUsSourceIncome === true) {
        const incomeQuotes = quoteMatches(source.text, US_INCOME_DENIAL);
        if (incomeQuotes.length > 0) {
          fail(result, "A26", `${source.label}: ${incomeQuotes.join("; ")} — ${A26_INCOME_RULE}`);
        }
      }
    }
  }
  checkW26b(record, result);
}

// W26b: the customer's own explanation (never printed) makes an unsupported
// operations claim. Context for the admin while the narrative is unwritten.
function checkW26b(record: PackageRecord, result: MutableResult) {
  // One warning per distinct text: the legacy order-level message often repeats
  // a year's "why missed" word for word.
  const seen = new Set<string>();
  const report = (label: string, text: string | null | undefined, year: PackageRecordYear) => {
    if (!text?.trim()) return;
    const key = normalizeWhitespace(text).toLowerCase();
    const quotes = quoteMatches(text, UNSUPPORTED_OPERATIONS);
    if (quotes.length === 0 || seen.has(key)) return;
    seen.add(key);
    const partV =
      year.partVTotalCents !== 0 || year.ownerPaidCosts.length > 0
        ? ` The order data contradicts this: tax year ${year.taxYear} reports ${formatCents(Math.abs(year.partVTotalCents))} of Part V transactions.`
        : "";
    warn(
      result,
      "W26b",
      `${label} (customer text, never printed): ${quotes.join("; ")} — Context only: do not carry this into the RCS narrative. ${A26_RULE}${partV}`,
    );
  };
  for (const year of record.taxYears) {
    const rcs = year.rcs;
    if (!rcs || year.status !== "late" || rcs.narrativeSource !== null) continue;
    report(`Tax year ${year.taxYear} → Customer's explanation: why missed`, rcs.customerExplanation.whyMissed, year);
    report(`Tax year ${year.taxYear} → Customer's explanation: when learned`, rcs.customerExplanation.whenLearned, year);
    report(`Tax year ${year.taxYear} → Customer's reasonable-cause message (order)`, record.customerReasonableCauseNarrative, year);
  }
}

// A27: every statement page carries LLC name, EIN, and tax year.
function checkA27(record: PackageRecord, result: MutableResult) {
  for (const doc of record.authoredDocuments.filter((d) => d.kind === "partVStatement" || d.kind === "partVIStatement")) {
    const pages = doc.pages ?? [doc.lines];
    for (let index = 0; index < pages.length; index++) {
      const text = pages[index].join("\n");
      if (
        !text.includes(record.llcName) ||
        !text.includes(record.llcEin) ||
        !text.includes(`Tax Year ${doc.taxYear}`)
      ) {
        fail(result, "A27", `${doc.kind} page ${index + 1} for tax year ${doc.taxYear} is missing the LLC header.`);
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

// A31: house position — no generated page names DIIRSP (the Delinquent
// International Information Return Submission Procedures) as a live procedure:
// not the header stamps on the IRS forms and not any authored document.
function checkA31(record: PackageRecord, result: MutableResult) {
  const pattern = /\bDIIRSP\b|Delinquent International Information Return/i;
  for (const year of record.taxYears) {
    if (year.form1120.stampedTexts.some((line) => pattern.test(line))) {
      fail(result, "A31", `Tax year ${year.taxYear}: Form 1120 header stamp references DIIRSP.`);
    }
  }
  for (const doc of record.authoredDocuments) {
    const text = [record.llcName, record.ownerName].reduce(
      (acc, name) => stripName(acc, name),
      doc.lines.join("\n"),
    );
    if (pattern.test(text)) {
      fail(result, "A31", `${doc.kind}${doc.taxYear ? ` ${doc.taxYear}` : ""} references DIIRSP.`);
    }
  }
}

// A32: a late year has no admin-authored RCS narrative (spec item 3, rule H4).
// The statement then has no cause text at all; the customer's explanation is
// never used as a fallback.
function checkA32(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    if (!year.rcs || year.status !== "late" || year.rcs.narrativeSource !== null) continue;
    fail(
      result,
      "A32",
      `RCS narrative not written for tax year ${year.taxYear}. Write the cause narrative in "RCS narrative (admin)" ` +
        `for ${year.taxYear}, in the first person. The customer's explanation is never printed.`,
    );
  }
}

// A33: admin-authored or other free text that renders into an IRS-facing
// document must not carry questions or notes addressed to us (spec item 3,
// D9): a question mark, "could you", "please review", "my objective",
// "minimal cost", or a template placeholder such as "[CPA Name]".
const A33_RULE =
  'Rule: text printed on an IRS document must not contain questions or notes addressed to us ("?", "could you", ' +
  '"please review", "my objective", "minimal cost", "[CPA Name]"). Rewrite it as a first-person statement.';
const BLOCKED_PHRASES =
  /\?|\b(?:could you|can you|would you|please review|please advise|please let me know|my objective|minimal cost)\b|\[\s*CPA Name\s*\]|\[[A-Z][A-Za-z ]{1,30}\]/gi;

function checkA33(record: PackageRecord, result: MutableResult) {
  const knownSources: string[] = [];
  for (const year of record.taxYears) {
    const sources: Array<{ label: string; text: string | null | undefined }> = [
      { label: "RCS narrative (admin)", text: year.reasonableCauseIncluded ? year.rcs?.narrative : null },
      ...year.partVRows.map((row) => ({ label: "Part V transaction description", text: row.description })),
      ...year.ownerPaidCosts.map((cost) => ({ label: "Owner-paid cost note", text: cost.note })),
      ...year.nonCashTransfers.flatMap((transfer) => [
        { label: "Part VI transfer description", text: transfer.description },
        { label: "Part VI valuation method", text: transfer.valuationMethod },
      ]),
    ];
    const byLabel = new Map<string, string[]>();
    for (const source of sources) {
      if (!source.text?.trim()) continue;
      knownSources.push(source.text);
      const quotes = quoteMatches(source.text, BLOCKED_PHRASES);
      if (quotes.length === 0) continue;
      byLabel.set(source.label, [...(byLabel.get(source.label) ?? []), ...quotes]);
    }
    for (const [label, quotes] of Array.from(byLabel)) {
      fail(result, "A33", `Tax year ${year.taxYear} → ${label}: ${unique(quotes).join("; ")} — ${A33_RULE}`);
    }
  }
  // Free text with no structured source on the record (e.g. the Part V "other
  // transactions" note) is caught in the rendered statement itself, after the
  // names and every source already judged above are taken out.
  for (const doc of record.authoredDocuments) {
    if (doc.kind === "coverLetter") continue;
    const withoutNames = [record.llcName, record.ownerName].reduce(
      (acc, name) => stripName(acc, name),
      documentText(doc.lines),
    );
    const quotes = quoteMatches(removeTexts(withoutNames, knownSources), BLOCKED_PHRASES);
    if (quotes.length > 0) {
      fail(
        result,
        "A33",
        `${doc.taxYear ? `Tax year ${doc.taxYear} → ` : ""}${DOC_LABELS[doc.kind]} text: ${unique(quotes).join("; ")} — ${A33_RULE}`,
      );
    }
  }
}

const DOC_LABELS: Record<PackageRecord["authoredDocuments"][number]["kind"], string> = {
  coverLetter: "Cover letter",
  partVStatement: "Part V statement",
  partVIStatement: "Part VI statement",
  reasonableCauseStatement: "Reasonable cause statement",
};

// A34: the Part V statement's closing total ("Form 5472 lines 1f and 1h: $X.")
// equals line 1f and line 1h on the form for that year (spec item 7).
function checkA34(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    if (year.partVStatementLine1fPrinted === undefined) continue;
    const expected = Math.floor((year.partVTotalCents + year.partVICentsAddedToLine1f + 50) / 100);
    const form1f = textValue(year.form5472.fields, form5472FieldMap["1f_totalPaymentsThisForm"]);
    const form1h = textValue(year.form5472.fields, form5472FieldMap["1h_totalPaymentsAllForms"]);
    const printed = year.partVStatementLine1fPrinted;
    if (
      printed !== year.line1f ||
      year.line1f !== year.line1h ||
      year.line1f !== expected ||
      form1f !== String(printed) ||
      form1h !== String(printed)
    ) {
      fail(
        result,
        "A34",
        `Tax year ${year.taxYear}: the Part V statement total ($${printed}) must equal Form 5472 line 1f ` +
          `($${form1f || "blank"}) and line 1h ($${form1h || "blank"}); the Part V and Part VI amounts add up to $${expected}.`,
      );
    }
  }
}

// A35: paid preparer block (spec item 8). A house preparer selected with an
// incomplete config prints nothing, and a statement that says "I prepared"
// contradicts the preparer shown on Form 1120.
function checkA35(record: PackageRecord, result: MutableResult) {
  if (record.paidPreparerMode === "house" && record.housePreparer && !record.housePreparer.configComplete) {
    const parts = [
      record.housePreparer.missing.length > 0 ? `missing ${record.housePreparer.missing.join(", ")}` : null,
      record.housePreparer.invalid.length > 0 ? `invalid ${record.housePreparer.invalid.join(", ")}` : null,
    ].filter(Boolean);
    fail(
      result,
      "A35",
      `Paid preparer is set to "House preparer" but the house preparer config is incomplete (${parts.join("; ")}), ` +
        `so the Paid Preparer block is blank. Complete the HOUSE_PREPARER_* settings or set Paid preparer to None.`,
    );
  }
  if (!record.taxYears.some((year) => year.paidPreparer?.shown)) return;
  for (const doc of record.authoredDocuments) {
    if (doc.kind === "coverLetter") continue;
    const quotes = quoteMatches(documentText(doc.lines), /\bI prepared\b/gi);
    if (quotes.length > 0) {
      fail(
        result,
        "A35",
        `${doc.taxYear ? `Tax year ${doc.taxYear} → ` : ""}${DOC_LABELS[doc.kind]}: ${unique(quotes).join("; ")} — ` +
          "A paid preparer is shown on Form 1120, so no statement may say the owner prepared the returns.",
      );
    }
  }
}

// A36 (SSN capture, 2026-10-15): an SSN is on file but the package-input
// adapter could not decrypt it, so lines 4b(1)/8b(1) were filled as if there
// were none. Never quotes the number (there is none to quote).
function checkA36(record: PackageRecord, result: MutableResult) {
  if (record.ownerSsnUndecryptable !== true) return;
  fail(
    result,
    "A36",
    "SSN on file could not be decrypted — check PII_ENCRYPTION_KEY. Lines 4b(1)/8b(1) do not show the SSN in this package.",
  );
}

// W34: a late year after the first late year has no "learned of requirement
// on" date, so its RCS cannot say whether the owner was still unaware at that
// year's due date (spec item 4, D4).
function checkW34(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const rcs = year.rcs;
    if (!rcs || year.status !== "late" || !rcs.stillUnaware.needed || rcs.learnedOn !== null) continue;
    warn(
      result,
      "W34",
      `Tax year ${year.taxYear}: "Learned of requirement on" is not recorded, so the RCS does not say whether the owner ` +
        `was still unaware when the ${year.taxYear} return was due on ${rcs.dueDateProse}. Record the date if known.`,
    );
  }
}

// W35: the "No IRS notice" fact is not confirmed for a late year, so the
// sentence was left out of that year's RCS (spec item 5, rule H3).
function checkW35(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    const rcs = year.rcs;
    if (!rcs || year.status !== "late" || rcs.noticeConfirmed === true) continue;
    warn(
      result,
      "W35",
      rcs.noticeConfirmed === false
        ? `Tax year ${year.taxYear}: "No IRS notice confirmed" is No, so the RCS does not say "I have not received any IRS ` +
            "notice about this return.\" If the client received a notice, address it in the narrative."
        : `Tax year ${year.taxYear}: "No IRS notice confirmed" is not recorded, so the sentence "I have not received any IRS ` +
            "notice about this return.\" was left out of the RCS. Confirm with the client and set it to Yes if true.",
    );
  }
}

// W36: the Form 7004 answer for a year is "not sure" (spec item 14, D2). The
// package treats it as no extension; the admin confirms before upload and fax.
function checkW36(record: PackageRecord, result: MutableResult) {
  for (const year of record.taxYears) {
    if (!year.extensionUnclear) continue;
    const due = year.rcs?.dueDateProse ?? year.dueDate ?? null;
    warn(
      result,
      "W36",
      year.status === "late"
        ? `Tax year ${year.taxYear}: Extension unclear — confirm with customer before fax. The Form 7004 answer is "Not sure", ` +
            `so the package treats ${year.taxYear} as late${due ? ` (due ${due})` : ""} and includes a reasonable cause statement.`
        : `Tax year ${year.taxYear}: Extension unclear — confirm with customer before fax.`,
    );
  }
}

// W37 / W38: foreign tax ID format by country of tax residence (spec item 11).
// Warnings only: Canada SIN = 9 digits passing Luhn; Brazil CPF = 11 digits
// with two check digits; other countries get a length sanity check. W38 flags
// a Reference ID that passes the national-ID test while the FTIN does not.
const NATIONAL_ID_TESTS: Array<{ countries: RegExp; label: string; test: (digits: string) => boolean }> = [
  { countries: /^(canada|ca|can)$/i, label: "Canadian Social Insurance Number (9 digits, Luhn check)", test: isValidCanadianSin },
  { countries: /^(brazil|brasil|br|bra)$/i, label: "Brazilian CPF (11 digits with two check digits)", test: isValidBrazilianCpf },
];

function checkW37(record: PackageRecord, result: MutableResult) {
  const year = record.taxYears[0];
  if (!year) return;
  const ftin = textValue(year.form5472.fields, form5472FieldMap["4b3_ftin"]).trim();
  const referenceId = textValue(year.form5472.fields, form5472FieldMap["4b2_referenceId"]).trim();
  const residence = textValue(year.form5472.fields, form5472FieldMap["4e_taxResidence"]).trim();
  if (!ftin || /^none$/i.test(ftin)) return;
  const nationalTest = NATIONAL_ID_TESTS.find((entry) => entry.countries.test(residence));
  if (nationalTest) {
    const ftinOk = nationalTest.test(ftin);
    if (!ftinOk) {
      warn(
        result,
        "W37",
        `Owner FTIN (Form 5472 line 4b(3)) does not look like a ${nationalTest.label}, the usual tax ID for a ` +
          `tax resident of ${residence}. Confirm the number with the client.`,
      );
      if (referenceId && nationalTest.test(referenceId)) {
        warn(
          result,
          "W38",
          `Possible swapped fields: the Reference ID (line 4b(2)) passes the ${nationalTest.label} test but the FTIN ` +
            "(line 4b(3)) does not. Confirm with the client which number is their tax ID.",
        );
      }
    }
    return;
  }
  const compact = ftin.replace(/[\s\-./]/g, "");
  if (compact.length < 5 || compact.length > 20) {
    warn(
      result,
      "W37",
      `Owner FTIN (Form 5472 line 4b(3)) is ${compact.length} characters long, which is unusual for a tax ID` +
        `${residence ? ` from ${residence}` : ""}. Confirm the number with the client.`,
    );
  }
}

export function isValidCanadianSin(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  if (!/^\d{9}$/.test(digits)) return false;
  let sum = 0;
  for (let index = 0; index < 9; index++) {
    let digit = Number(digits[index]);
    if (index % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function isValidBrazilianCpf(value: string): boolean {
  const digits = value.replace(/[\s.\-/]/g, "");
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false;
  const check = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index++) sum += Number(digits[index]) * (length + 1 - index);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return check(9) === Number(digits[9]) && check(10) === Number(digits[10]);
}

// W39: owner address quality (spec item 13). The street line prints exactly as
// entered (city and region are display-cased by the generator), so flag an
// all-lowercase street and a bare trailing number with no unit label
// ("12 Main St 5"). The address is never rewritten automatically. A17 keeps
// the missing state/postal check.
const UNIT_LABEL = /^(?:apt|apartment|unit|suite|ste|flat|fl|floor|room|rm|block|blk|tower|bldg|building|no|nr|lot|box|#)\.?$/i;
const NUMBERED_ROAD = /^(?:route|rte|highway|hwy|interstate|road|rd)\.?$/i;

function checkW39(record: PackageRecord, result: MutableResult) {
  const street = record.ownerStreet?.trim();
  if (!street) return;
  const cased = Array.from(street).filter((ch) => ch.toLocaleUpperCase("en-US") !== ch.toLocaleLowerCase("en-US"));
  if (cased.length > 0 && cased.every((ch) => ch === ch.toLocaleLowerCase("en-US"))) {
    warn(
      result,
      "W39",
      `Owner street address "${street}" is all lowercase and prints that way on Form 5472. Confirm the correct ` +
        "capitalisation with the client and correct it by hand (it is never rewritten automatically).",
    );
  }
  for (const segment of street.split(",")) {
    const words = segment.trim().split(/\s+/);
    if (words.length < 3 || !/^\d+[A-Za-z]?$/.test(words[0])) continue;
    const last = words[words.length - 1];
    const before = words[words.length - 2];
    if (/^\d+[A-Za-z]?$/.test(last) && !UNIT_LABEL.test(before) && !NUMBERED_ROAD.test(before) && !/\d/.test(before)) {
      warn(
        result,
        "W39",
        `Owner street address "${street}" ends "${before} ${last}": the number ${last} has no unit label (Apt, Unit, ` +
          "Suite, Flat or #). Confirm with the client what it is and correct the address by hand.",
      );
      break;
    }
  }
}

// W40: the admin forced the small-corporation paragraph on although its
// conditions are not all met (rule H8).
function checkW40(record: PackageRecord, result: MutableResult) {
  const labels: Record<string, string> = {
    lateYear: "the year is late",
    registeredAgentOnly: "the LLC address is registered-agent-only",
    noGrossReceiptsSignal: "no gross receipts",
    notKnownBeforeDueDate: "the owner did not know of the requirement by the due date",
  };
  for (const year of record.taxYears) {
    const paragraph = year.rcs?.smallCorpParagraph;
    if (!paragraph || paragraph.setting !== true || paragraph.conditionsMet || !paragraph.rendered) continue;
    const unmet = Object.entries(paragraph.conditions)
      .filter(([, met]) => !met)
      .map(([key]) => labels[key] ?? key);
    warn(
      result,
      "W40",
      `Tax year ${year.taxYear}: the small-corporation paragraph is switched On but these conditions are not met: ` +
        `${unmet.join("; ")}. Make sure every statement in it is true.`,
    );
  }
}

// W41: paid preparer details worth a second look (spec item 8).
function checkW41(record: PackageRecord, result: MutableResult) {
  if (record.paidPreparerMode !== "house" && record.irsMayDiscussWithPreparer) {
    warn(
      result,
      "W41",
      `"May the IRS discuss with the preparer?" is set to ${record.irsMayDiscussWithPreparer === "yes" ? "Yes" : "No"} ` +
        "but no paid preparer is shown, so the boxes stay blank.",
    );
  }
  for (const year of record.taxYears) {
    const failures = year.paidPreparer?.fitFailures ?? [];
    if (failures.length === 0) continue;
    warn(
      result,
      "W41",
      `Tax year ${year.taxYear}: paid preparer ${failures.join(", ")} printed below 6pt on Form 1120; check it is legible.`,
    );
  }
}

// ── Customer-data warnings (non-blocking) ───────────────────────────────────
// The generator prints what the customer entered; these flag answers that are
// valid but often wrong, so the reviewer confirms them before faxing.

// Individual taxpayer ID names by tax-residence country, for the W31 hint.
const FTIN_EXAMPLES: Record<string, string> = {
  "hong kong": "HKID number",
  macau: "Macau resident identity card number",
  china: "Resident Identity Card number",
  taiwan: "National ID number",
  singapore: "NRIC or FIN",
  india: "PAN",
  japan: "My Number",
  "south korea": "resident registration number",
  australia: "Tax File Number",
  "new zealand": "IRD number",
  canada: "Social Insurance Number",
  "united kingdom": "National Insurance number or UTR",
  germany: "tax identification number (Steuer-ID)",
  brazil: "CPF",
  mexico: "RFC",
};

function ftinExample(residence: string): string {
  const known = FTIN_EXAMPLES[residence.trim().toLowerCase()];
  return known ? `${residence.trim()}: ${known}` : "Hong Kong: HKID number";
}

// W31: owner has no foreign tax ID — lines 4b(3) and 8b(3) print "None".
function checkW31(record: PackageRecord, result: MutableResult) {
  const noFtin = record.taxYears.find((year) => {
    const ftin = textValue(year.form5472.fields, form5472FieldMap["4b3_ftin"]).trim();
    return year.ownerHasFtin === false || /^none$/i.test(ftin);
  });
  if (!noFtin) return;
  const residence = textValue(noFtin.form5472.fields, form5472FieldMap["4e_taxResidence"]);
  warn(
    result,
    "W31",
    `Owner foreign tax ID is "None" on Form 5472 lines 4b(3) and 8b(3). Most countries issue individual tax IDs ` +
      `(e.g. ${ftinExample(residence)}); confirm with the client before filing.`,
  );
}

// W32: owner street address has no digit at all — no flat, floor, unit or
// street number — so IRS mail may not reach the owner.
function checkW32(record: PackageRecord, result: MutableResult) {
  const street = record.ownerStreet?.trim();
  if (!street || /\d/.test(street)) return;
  warn(
    result,
    "W32",
    `Owner street address "${street}" has no flat, floor, unit or street number. Confirm the flat/floor/unit ` +
      "with the client so IRS mail reaches the owner.",
  );
}

// W33: the LLC's formation year reports $0 of Part V transactions. Formation
// costs the owner paid personally are usually reportable contributions.
function checkW33(record: PackageRecord, result: MutableResult) {
  const formationYear = record.formationDate ? new Date(record.formationDate).getUTCFullYear() : null;
  if (formationYear === null || Number.isNaN(formationYear)) return;
  for (const year of record.taxYears) {
    if (year.taxYear !== formationYear || year.partVTotalCents !== 0) continue;
    warn(
      result,
      "W33",
      `Tax year ${year.taxYear} includes the LLC's formation date but reports $0 of Part V transactions. ` +
        "Formation costs the owner paid personally (state filing fee, registered agent fee) are usually " +
        "reportable capital contributions; confirm with the client.",
    );
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
    case "2018":
      return form1120_2018FieldMap;
    case "2019":
      return form1120_2019FieldMap;
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

// Remove every occurrence of a name, allowing any run of whitespace (including
// a line break from text wrapping) wherever the name has whitespace.
function stripName(text: string, name: string): string {
  const tokens = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return text;
  return text.replace(new RegExp(tokens.map(escapeRegExp).join("\\s+"), "gi"), " ");
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// Take known source texts (each paragraph) out of a rendered document's text,
// matching whitespace flexibly (the statement wraps lines), and leave a line
// break where each one was so the remaining sentences do not run together.
function removeTexts(text: string, sources: string[]): string {
  const paragraphs = sources
    .flatMap((source) => source.split(/\n\s*\n/))
    .map((paragraph) => paragraph.trim().split(/\s+/).filter(Boolean))
    .filter((tokens) => tokens.length > 0)
    .sort((a, b) => b.join(" ").length - a.join(" ").length);
  let out = text;
  for (const tokens of paragraphs) {
    out = out.replace(new RegExp(tokens.map(escapeRegExp).join("\\s+"), "g"), "\n");
  }
  return out;
}

// A rendered document as text for scanning: one line per printed line, so a
// heading or table cell never runs into the sentence after it.
function documentText(lines: string[]): string {
  return lines.join("\n");
}

const SENTENCE_END = /[.!?\n]/;
const QUOTE_MAX_CHARS = 80;

// Every match of `pattern` in `text`, quoted with its sentence for context and
// cut to about 80 characters around the match ("…" marks a cut). Line breaks
// end a quote but not a match: a phrase wrapped onto the next printed line is
// still found. Duplicates are dropped.
function quoteMatches(text: string, pattern: RegExp): string[] {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const re = new RegExp(pattern.source, flags);
  const flattened = text.replace(/\n/g, " ");
  const quotes: string[] = [];
  for (const match of Array.from(flattened.matchAll(re))) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    let sentenceStart = start;
    while (sentenceStart > 0 && !SENTENCE_END.test(text[sentenceStart - 1])) sentenceStart--;
    let sentenceEnd = end;
    if (!SENTENCE_END.test(match[0].slice(-1))) {
      while (sentenceEnd < text.length && !SENTENCE_END.test(text[sentenceEnd])) sentenceEnd++;
      if (sentenceEnd < text.length && text[sentenceEnd] !== "\n") sentenceEnd++;
    }
    const sentence = text.slice(sentenceStart, sentenceEnd);
    const matchAt = start - sentenceStart;
    let snippet: string;
    if (normalizeWhitespace(sentence).length <= QUOTE_MAX_CHARS) {
      snippet = normalizeWhitespace(sentence);
    } else {
      const room = Math.max(0, QUOTE_MAX_CHARS - match[0].length);
      let from = Math.max(0, matchAt - Math.floor(room / 2));
      const to = Math.min(sentence.length, from + QUOTE_MAX_CHARS);
      from = Math.max(0, to - QUOTE_MAX_CHARS);
      snippet = `${from > 0 ? "…" : ""}${normalizeWhitespace(sentence.slice(from, to))}${to < sentence.length ? "…" : ""}`;
    }
    const quoted = `"${snippet}"`;
    if (snippet && !quotes.includes(quoted)) quotes.push(quoted);
  }
  return quotes;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mmdd(date: Date): string {
  return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`;
}

function dateInsidePeriod(iso: string, year: number, periodStart: string, periodEnd: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const date = new Date(`${iso}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;
  const [startMonth, startDay] = periodStart.split("/").map(Number);
  const [endMonth, endDay] = periodEnd.split("/").map(Number);
  const start = new Date(Date.UTC(year, startMonth - 1, startDay));
  const end = new Date(Date.UTC(year, endMonth - 1, endDay));
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

function rectsOverlap(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
): boolean {
  return a.left < b.right && a.right > b.left && a.bottom < b.top && a.top > b.bottom;
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
