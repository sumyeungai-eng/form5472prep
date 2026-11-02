import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { FOREIGN_OWNED_DE_HEADER } from "@/config/filingPackage";
import { toPdfSafe } from "../pdfText";
import { flatten, setText, stampForeignOwnedDeHeader } from "./fillForm";

// Form 7004 (Rev. December 2025) for a foreign-owned U.S. disregarded entity:
// Part I line 1 = Form 1120 code 12, "Foreign-owned U.S. DE" across the top,
// calendar tax year on line 5a, Part II lines 6-8 = 0 (a pro forma 1120 has no
// tax). Boxes 2, 3, 4 and 5b stay blank; there is no signature line.
// Field map verified by rendering a filled form (docs/sessions/2026-10-30-form-7004-autogen.md).

export type Form7004Input = {
  llcName: string | null;
  ein: string | null;
  llcStreet: string | null;
  llcCity: string | null;
  llcState: string | null;
  llcZip: string | null;
  taxYear: number | null;
};

const P = "topmostSubform[0].Page1[0].";
export const F7004 = {
  name: `${P}f1_1[0]`,
  ein: `${P}f1_2[0]`, // maxLength 11
  street: `${P}f1_3[0]`,
  room: `${P}f1_4[0]`,
  city: `${P}f1_5[0]`,
  state: `${P}f1_6[0]`,
  country: `${P}f1_7[0]`,
  zip: `${P}f1_8[0]`,
  formCodeDigit1: `${P}f1_9[0]`, // comb, maxLength 1
  formCodeDigit2: `${P}f1_10[0]`, // maxLength 1
  calendarYear: `${P}f1_11[0]`, // "20__", maxLength 2
  tentativeTax: `${P}f1_16[0]`, // line 6
  totalPayments: `${P}f1_17[0]`, // line 7
  balanceDue: `${P}f1_18[0]`, // line 8
} as const;

export const FORM_1120_CODE = "12";

const clean = (value: string | null | undefined) => (value ?? "").replace(/\s+/g, " ").trim();

// "12-3456789" when the EIN has exactly 9 digits; otherwise null.
export function formatEin(ein: string | null | undefined): string | null {
  const digits = (ein ?? "").replace(/\D/g, "");
  return digits.length === 9 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : null;
}

export function form7004FieldValues(input: Form7004Input): Record<string, string> {
  // An EIN that is not 9 digits is printed as typed (cut to the field's 11
  // characters) so the admin sees it; form7004Warnings flags it and the fax
  // route refuses it.
  const ein = formatEin(input.ein) ?? clean(input.ein).slice(0, 11);
  return {
    [F7004.name]: clean(input.llcName),
    [F7004.ein]: ein,
    [F7004.street]: clean(input.llcStreet),
    [F7004.city]: clean(input.llcCity),
    [F7004.state]: clean(input.llcState),
    [F7004.zip]: clean(input.llcZip),
    [F7004.formCodeDigit1]: FORM_1120_CODE[0],
    [F7004.formCodeDigit2]: FORM_1120_CODE[1],
    [F7004.calendarYear]: input.taxYear ? String(input.taxYear % 100).padStart(2, "0") : "",
    [F7004.tentativeTax]: "0",
    [F7004.totalPayments]: "0",
    [F7004.balanceDue]: "0",
  };
}

// What staff must fix before faxing. Missing data never stops generation.
export function form7004Warnings(input: Form7004Input): string[] {
  const warnings: string[] = [];
  if (!clean(input.llcName)) warnings.push("No LLC name — line Name is blank.");
  if (!clean(input.ein)) warnings.push("No EIN — Identifying number is blank.");
  else if (!formatEin(input.ein)) warnings.push("EIN is not 9 digits — check it against the IRS EIN letter.");
  const missingAddress = [
    ["street", input.llcStreet],
    ["city", input.llcCity],
    ["state", input.llcState],
    ["ZIP", input.llcZip],
  ].filter(([, v]) => !clean(v)).map(([label]) => label);
  if (missingAddress.length) warnings.push(`Address incomplete — missing ${missingAddress.join(", ")}.`);
  if (!input.taxYear) warnings.push("No tax year — line 5a is blank.");
  return warnings;
}

export function form7004Title(input: Pick<Form7004Input, "llcName" | "taxYear">): string {
  return `Form 7004 – ${clean(input.llcName) || "LLC"} – ${input.taxYear ?? "tax year not set"}`;
}

export async function generateForm7004(input: Form7004Input): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(await fs.readFile(path.join(process.cwd(), "public", "forms", "f7004.pdf")));
  const form = pdf.getForm();
  for (const [name, value] of Object.entries(form7004FieldValues(input))) setText(form, name, value);
  form.updateFieldAppearances();
  flatten(form);
  await stampForeignOwnedDeHeader(pdf, FOREIGN_OWNED_DE_HEADER);
  pdf.setTitle(toPdfSafe(form7004Title(input)));
  pdf.setAuthor("");
  pdf.setCreator("");
  pdf.setProducer("");
  pdf.setSubject("");
  pdf.setKeywords([]);
  return pdf.save();
}
