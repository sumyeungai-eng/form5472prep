import fs from "node:fs/promises";
import path from "node:path";
import { PDFCheckBox, PDFDocument, PDFTextField } from "pdf-lib";
import { check } from "./fillForm";
import { printableFormText, startedBusinessSpecifyTarget } from "./ss4Fit";
import type { Ss4Options } from "./ss4Options";
export { SS4_CELL_WIDTHS, fitsCell, ss4FitWarnings } from "./ss4Fit";

export type Ss4FillInput = { llcName: string; options: Ss4Options };

const FORMS_DIR = path.join(process.cwd(), "public", "forms");
const PREFIX = "topmostSubform[0].Page1[0].";

const F = {
  line1: `${PREFIX}f1_2[0]`,
  tradeName: `${PREFIX}f1_3[0]`,
  careOf: `${PREFIX}f1_4[0]`,
  mailingAddressLine: `${PREFIX}Line4ReadOrder[0].f1_5[0]`,
  mailingCityStateZip: `${PREFIX}Line4ReadOrder[0].f1_6[0]`,
  streetAddressLine: `${PREFIX}f1_7[0]`,
  streetCityStateZip: `${PREFIX}f1_8[0]`,
  countyAndState: `${PREFIX}f1_9[0]`,
  responsibleParty: `${PREFIX}f1_10[0]`,
  responsiblePartyTin: `${PREFIX}f1_11[0]`,
  llcMembers: `${PREFIX}f1_12[0]`,
  corporationForm: `${PREFIX}f1_16[0]`,
  entityOtherText: `${PREFIX}f1_19[0]`,
  incorporationState: `${PREFIX}f1_21[0]`,
  incorporationCountry: `${PREFIX}f1_22[0]`,
  bankingSpecify: `${PREFIX}f1_24[0]`,
  startedSpecify: `${PREFIX}f1_25[0]`,
  startedSpecifyContinuation: `${PREFIX}f1_26[0]`,
  reasonOtherSpecify: `${PREFIX}f1_30[0]`,
  businessStartDate: `${PREFIX}f1_31[0]`,
  closingMonth: `${PREFIX}f1_32[0]`,
  employeesAgricultural: `${PREFIX}f1_33[0]`,
  employeesHousehold: `${PREFIX}f1_34[0]`,
  employeesOther: `${PREFIX}f1_35[0]`,
  firstWagesDate: `${PREFIX}f1_36[0]`,
  activityOtherText: `${PREFIX}f1_37[0]`,
  principalProducts: `${PREFIX}f1_38[0]`,
  priorEinNumber: `${PREFIX}f1_39[0]`,
  designeeName: `${PREFIX}f1_40[0]`,
  designeePhone: `${PREFIX}f1_41[0]`,
  designeeAddress: `${PREFIX}f1_42[0]`,
  designeeFax: `${PREFIX}f1_43[0]`,
  applicantNameAndTitle: `${PREFIX}f1_44[0]`,
  applicantPhone: `${PREFIX}f1_45[0]`,
  applicantFax: `${PREFIX}f1_46[0]`,
} as const;

const CHECKS = {
  isLlc: [`${PREFIX}c1_1[0]`, `${PREFIX}c1_1[1]`],
  organizedInUs: [`${PREFIX}c1_2[0]`, `${PREFIX}c1_2[1]`],
  entityType: {
    sole_proprietor: `${PREFIX}c1_3[0]`,
    partnership: `${PREFIX}c1_3[2]`,
    corporation: `${PREFIX}c1_3[4]`,
    other: `${PREFIX}c1_3[15]`,
  },
  reason: {
    started_new_business: `${PREFIX}c1_4[0]`,
    banking_purpose: `${PREFIX}c1_4[8]`,
    hired_employees: `${PREFIX}c1_4[3]`,
    compliance_withholding: `${PREFIX}c1_4[5]`,
    other: `${PREFIX}c1_4[7]`,
  },
  form944: `${PREFIX}c1_5[0]`,
  activity: {
    health_care: `${PREFIX}c1_6[0]`,
    wholesale_agent: `${PREFIX}c1_6[1]`,
    construction: `${PREFIX}c1_6[2]`,
    rental_leasing: `${PREFIX}c1_6[3]`,
    transportation: `${PREFIX}c1_6[4]`,
    accommodation_food: `${PREFIX}c1_6[5]`,
    wholesale_other: `${PREFIX}c1_6[6]`,
    retail: `${PREFIX}c1_6[7]`,
    real_estate: `${PREFIX}c1_6[8]`,
    manufacturing: `${PREFIX}c1_6[9]`,
    finance_insurance: `${PREFIX}c1_6[10]`,
    other: `${PREFIX}c1_6[11]`,
  },
  priorEin: [`${PREFIX}c1_7[0]`, `${PREFIX}c1_7[1]`],
} as const;

const EXCLUSIVE_GROUPS = [
  CHECKS.isLlc,
  CHECKS.organizedInUs,
  Object.values(CHECKS.entityType),
  Object.values(CHECKS.reason),
  Object.values(CHECKS.activity),
  CHECKS.priorEin,
] as const;

export function ss4FieldValues(input: Ss4FillInput): { text: Record<string, string>; check: string[] } {
  const o = input.options;
  const text: Record<string, string> = {
    [F.line1]: formText(input.llcName),
    [F.tradeName]: formText(o.tradeName),
    [F.careOf]: formText(o.careOf),
    [F.mailingAddressLine]: formText(o.mailingAddressLine),
    [F.mailingCityStateZip]: formText(o.mailingCityStateZip),
    [F.streetAddressLine]: formText(o.streetAddressLine),
    [F.streetCityStateZip]: formText(o.streetCityStateZip),
    [F.countyAndState]: formText(o.countyAndState),
    [F.responsibleParty]: formText(o.responsibleParty),
    [F.responsiblePartyTin]: formText(o.responsiblePartyTin),
    [F.llcMembers]: o.isLlc ? formText(o.llcMembers) : "",
    [F.incorporationState]: formText(o.incorporationState),
    [F.incorporationCountry]: formText(o.incorporationCountry),
    [F.businessStartDate]: formText(o.businessStartDate),
    [F.closingMonth]: formText(o.closingMonth),
    [F.employeesAgricultural]: formText(o.employeesAgricultural),
    [F.employeesHousehold]: formText(o.employeesHousehold),
    [F.employeesOther]: formText(o.employeesOther),
    [F.firstWagesDate]: formText(o.firstWagesDate),
    [F.principalProducts]: formText(o.principalProducts),
    [F.applicantNameAndTitle]: formText(o.applicantNameAndTitle),
    [F.applicantPhone]: formText(o.applicantPhone),
    [F.applicantFax]: formText(o.applicantFax),
  };
  const checkNames: string[] = [o.isLlc ? CHECKS.isLlc[0] : CHECKS.isLlc[1]];

  if (o.isLlc) checkNames.push(o.organizedInUs ? CHECKS.organizedInUs[0] : CHECKS.organizedInUs[1]);
  checkNames.push(CHECKS.entityType[o.entityType]);
  if (o.entityType === "corporation" && o.entityOtherText) text[F.corporationForm] = formText(o.entityOtherText);
  if (o.entityType === "other") text[F.entityOtherText] = formText(o.entityOtherText);

  checkNames.push(CHECKS.reason[o.reason]);
  if (o.reason === "started_new_business") {
    const target = startedBusinessSpecifyTarget(o.reasonSpecify);
    text[F.startedSpecify] = target === "startedSpecify" ? formText(o.reasonSpecify) : "";
    text[F.startedSpecifyContinuation] = target === "startedSpecifyContinuation" ? formText(o.reasonSpecify) : "";
  }
  if (o.reason === "banking_purpose") text[F.bankingSpecify] = formText(o.reasonSpecify);
  if (o.reason === "other") text[F.reasonOtherSpecify] = formText(o.reasonSpecify);

  if (o.form944) checkNames.push(CHECKS.form944);

  checkNames.push(CHECKS.activity[o.activity]);
  if (o.activity === "other") text[F.activityOtherText] = formText(o.activityOtherText);

  checkNames.push(o.priorEin ? CHECKS.priorEin[0] : CHECKS.priorEin[1]);
  if (o.priorEin) text[F.priorEinNumber] = formText(o.priorEinNumber);

  if (o.designeeEnabled) {
    text[F.designeeName] = formText(o.designeeName);
    text[F.designeePhone] = formText(o.designeePhone);
    text[F.designeeAddress] = formText(o.designeeAddress);
    text[F.designeeFax] = formText(o.designeeFax);
  }

  return { text, check: checkNames };
}

export async function generateSs4Pdf(input: Ss4FillInput): Promise<Uint8Array> {
  const pdf = await loadBlank("fss4.pdf");
  const form = pdf.getForm();
  const values = ss4FieldValues(input);
  uncheckExclusiveGroups(form);
  for (const [name, value] of Object.entries(values.text)) setTextField(form, name, value);
  for (const name of values.check) check(form, name);
  form.updateFieldAppearances();
  form.flatten();
  return pdf.save();
}

async function loadBlank(name: string): Promise<PDFDocument> {
  const bytes = await fs.readFile(path.join(FORMS_DIR, name));
  return PDFDocument.load(bytes);
}

function uncheckExclusiveGroups(form: ReturnType<PDFDocument["getForm"]>) {
  for (const group of EXCLUSIVE_GROUPS) {
    for (const name of group) {
      try {
        const field = form.getField(name);
        if (field instanceof PDFCheckBox) field.uncheck();
      } catch {
        console.warn(`[pdf] missing checkbox: ${name}`);
      }
    }
  }
}

function formText(value: string): string {
  return printableFormText(value);
}

function setTextField(form: ReturnType<PDFDocument["getForm"]>, name: string, value: string) {
  try {
    const field = form.getField(name);
    if (field instanceof PDFTextField) {
      setAutoFontSize(field, 9);
      const maxLength = field.getMaxLength();
      field.setText(maxLength && maxLength > 0 && value.length > maxLength ? value.slice(0, maxLength) : value);
    }
  } catch {
    console.warn(`[pdf] missing text field: ${name}`);
  }
}

function setAutoFontSize(field: PDFTextField, fontSize: number) {
  const current = currentFontSize(field);
  if (current !== undefined && current !== 0) return;
  try {
    field.setFontSize(fontSize);
  } catch (err) {
    console.warn(`[pdf] could not set text field font size`, err);
  }
}

function currentFontSize(field: PDFTextField): number | undefined {
  const appearance = field.acroField.getDefaultAppearance();
  if (!appearance) return undefined;
  const pattern = /\/[^\0\t\n\f\r ]+[\0\t\n\f\r ]*(\d*\.?\d+)?[\0\t\n\f\r ]+Tf/g;
  let match: RegExpExecArray | null;
  let size: string | undefined;
  while ((match = pattern.exec(appearance))) size = match[1];
  return size ? Number(size) : undefined;
}
