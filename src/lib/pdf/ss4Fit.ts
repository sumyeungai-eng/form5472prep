import { toFormText, type Ss4Options } from "./ss4Options";

export type Ss4FitInput = { llcName: string; options: Ss4Options };

export type Ss4TextFieldKey =
  | "line1"
  | "tradeName"
  | "careOf"
  | "mailingAddressLine"
  | "mailingCityStateZip"
  | "streetAddressLine"
  | "streetCityStateZip"
  | "countyAndState"
  | "responsibleParty"
  | "responsiblePartyTin"
  | "llcMembers"
  | "corporationForm"
  | "entityOtherText"
  | "incorporationState"
  | "incorporationCountry"
  | "bankingSpecify"
  | "startedSpecify"
  | "startedSpecifyContinuation"
  | "reasonOtherSpecify"
  | "businessStartDate"
  | "closingMonth"
  | "employeesAgricultural"
  | "employeesHousehold"
  | "employeesOther"
  | "firstWagesDate"
  | "activityOtherText"
  | "principalProducts"
  | "priorEinNumber"
  | "designeeName"
  | "designeePhone"
  | "designeeAddress"
  | "designeeFax"
  | "applicantNameAndTitle"
  | "applicantPhone"
  | "applicantFax";

export const SS4_CELL_WIDTHS: Record<Ss4TextFieldKey, number> = {
  line1: 524.6,
  tradeName: 243.0,
  careOf: 279.8,
  mailingAddressLine: 243.0,
  mailingCityStateZip: 243.0,
  streetAddressLine: 279.8,
  streetCityStateZip: 279.8,
  countyAndState: 524.6,
  responsibleParty: 279.1,
  responsiblePartyTin: 243.8,
  llcMembers: 79.2,
  corporationForm: 86.4,
  entityOtherText: 180.0,
  incorporationState: 127.8,
  incorporationCountry: 171.8,
  bankingSpecify: 151.2,
  startedSpecify: 57.6,
  startedSpecifyContinuation: 208.8,
  reasonOtherSpecify: 439.2,
  businessStartDate: 273.6,
  closingMonth: 222.4,
  employeesAgricultural: 86.4,
  employeesHousehold: 86.4,
  employeesOther: 100.8,
  firstWagesDate: 180.0,
  activityOtherText: 180.0,
  principalProducts: 518.4,
  priorEinNumber: 103.7,
  designeeName: 343.9,
  designeePhone: 143.0,
  designeeAddress: 343.9,
  designeeFax: 143.0,
  applicantNameAndTitle: 280.3,
  applicantPhone: 143.0,
  applicantFax: 143.0,
};

const SS4_FIELD_MAX_LENGTHS: Partial<Record<Ss4TextFieldKey, number>> = {
  responsiblePartyTin: 11,
  priorEinNumber: 10,
};

const LABELS: Record<Ss4TextFieldKey, string> = {
  line1: "Line 1",
  tradeName: "Line 2",
  careOf: "Line 3",
  mailingAddressLine: "Line 4a",
  mailingCityStateZip: "Line 4b",
  streetAddressLine: "Line 5a",
  streetCityStateZip: "Line 5b",
  countyAndState: "Line 6",
  responsibleParty: "Line 7a",
  responsiblePartyTin: "Line 7b",
  llcMembers: "Line 8b",
  corporationForm: "Line 9a",
  entityOtherText: "Line 9a",
  incorporationState: "Line 9b",
  incorporationCountry: "Line 9b",
  bankingSpecify: "Line 10",
  startedSpecify: "Line 10",
  startedSpecifyContinuation: "Line 10",
  reasonOtherSpecify: "Line 10",
  businessStartDate: "Line 11",
  closingMonth: "Line 12",
  employeesAgricultural: "Line 13",
  employeesHousehold: "Line 13",
  employeesOther: "Line 13",
  firstWagesDate: "Line 15",
  activityOtherText: "Line 16",
  principalProducts: "Line 17",
  priorEinNumber: "Line 18",
  designeeName: "Third party designee name",
  designeePhone: "Third party designee phone",
  designeeAddress: "Third party designee address",
  designeeFax: "Third party designee fax",
  applicantNameAndTitle: "Applicant name and title",
  applicantPhone: "Applicant phone",
  applicantFax: "Applicant fax",
};

export function fitsCell(text: string, widthPt: number, fontSize = 9): boolean {
  return toFormText(text).length * (0.5 * fontSize) <= widthPt;
}

export function ss4FitWarnings(input: Ss4FitInput): string[] {
  const warnings: string[] = [];
  for (const { key, value } of activeTextFields(input)) {
    const width = SS4_CELL_WIDTHS[key];
    if (!width) continue;
    const text = printableFormText(value);
    const fitCount = maxFitCharacters(key, width);
    if (text.length > fitCount) {
      warnings.push(`${LABELS[key]} may be cut off on the form (about ${fitCount} characters fit). Shorten it.`);
    }
  }
  return warnings;
}

export function printableFormText(raw: string): string {
  return toFormText(raw).replace(/[^\x20-\x7E]/g, "");
}

export function startedBusinessSpecifyTarget(value: string): "startedSpecify" | "startedSpecifyContinuation" {
  if (fitsCell(value, SS4_CELL_WIDTHS.startedSpecify)) return "startedSpecify";
  return "startedSpecifyContinuation";
}

function activeTextFields({ llcName, options: o }: Ss4FitInput): { key: Ss4TextFieldKey; value: string }[] {
  const fields: { key: Ss4TextFieldKey; value: string }[] = [
    { key: "line1", value: llcName },
    { key: "tradeName", value: o.tradeName },
    { key: "careOf", value: o.careOf },
    { key: "mailingAddressLine", value: o.mailingAddressLine },
    { key: "mailingCityStateZip", value: o.mailingCityStateZip },
    { key: "streetAddressLine", value: o.streetAddressLine },
    { key: "streetCityStateZip", value: o.streetCityStateZip },
    { key: "countyAndState", value: o.countyAndState },
    { key: "responsibleParty", value: o.responsibleParty },
    { key: "responsiblePartyTin", value: o.responsiblePartyTin },
    { key: "llcMembers", value: o.isLlc ? o.llcMembers : "" },
    { key: "incorporationState", value: o.incorporationState },
    { key: "incorporationCountry", value: o.incorporationCountry },
    { key: "businessStartDate", value: o.businessStartDate },
    { key: "closingMonth", value: o.closingMonth },
    { key: "employeesAgricultural", value: o.employeesAgricultural },
    { key: "employeesHousehold", value: o.employeesHousehold },
    { key: "employeesOther", value: o.employeesOther },
    { key: "firstWagesDate", value: o.firstWagesDate },
    { key: "principalProducts", value: o.principalProducts },
    { key: "applicantNameAndTitle", value: o.applicantNameAndTitle },
    { key: "applicantPhone", value: o.applicantPhone },
    { key: "applicantFax", value: o.applicantFax },
  ];

  if (o.entityType === "corporation") fields.push({ key: "corporationForm", value: o.entityOtherText });
  if (o.entityType === "other") fields.push({ key: "entityOtherText", value: o.entityOtherText });

  if (o.reason === "started_new_business") {
    const target = startedBusinessSpecifyTarget(o.reasonSpecify);
    fields.push({ key: target, value: o.reasonSpecify });
  }
  if (o.reason === "banking_purpose") fields.push({ key: "bankingSpecify", value: o.reasonSpecify });
  if (o.reason === "other") fields.push({ key: "reasonOtherSpecify", value: o.reasonSpecify });

  if (o.activity === "other") fields.push({ key: "activityOtherText", value: o.activityOtherText });
  if (o.priorEin) fields.push({ key: "priorEinNumber", value: o.priorEinNumber });
  if (o.designeeEnabled) {
    fields.push(
      { key: "designeeName", value: o.designeeName },
      { key: "designeePhone", value: o.designeePhone },
      { key: "designeeAddress", value: o.designeeAddress },
      { key: "designeeFax", value: o.designeeFax },
    );
  }

  return fields.filter((field) => field.value.length > 0);
}

function maxFitCharacters(key: Ss4TextFieldKey, widthPt: number): number {
  const byWidth = Math.floor(widthPt / (0.5 * 9));
  const maxLength = SS4_FIELD_MAX_LENGTHS[key];
  return maxLength && maxLength > 0 ? Math.min(byWidth, maxLength) : byWidth;
}
