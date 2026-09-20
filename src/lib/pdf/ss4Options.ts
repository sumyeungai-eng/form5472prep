export type Ss4EntityType = "sole_proprietor" | "partnership" | "corporation" | "other";
export type Ss4Reason = "started_new_business" | "banking_purpose" | "compliance_withholding" | "hired_employees" | "other";
export type Ss4Activity = "health_care" | "wholesale_agent" | "construction" | "rental_leasing" | "transportation" | "accommodation_food" | "wholesale_other" | "retail" | "real_estate" | "manufacturing" | "finance_insurance" | "other";

export type Ss4Options = {
  tradeName: string; careOf: string;
  mailingAddressLine: string; mailingCityStateZip: string;
  streetAddressLine: string; streetCityStateZip: string;
  countyAndState: string;
  responsibleParty: string; responsiblePartyTin: string;
  isLlc: boolean; llcMembers: string; organizedInUs: boolean;
  entityType: Ss4EntityType; entityOtherText: string;
  incorporationState: string; incorporationCountry: string;
  reason: Ss4Reason; reasonSpecify: string;
  businessStartDate: string; closingMonth: string;
  employeesAgricultural: string; employeesHousehold: string; employeesOther: string;
  form944: boolean; firstWagesDate: string;
  activity: Ss4Activity; activityOtherText: string; principalProducts: string;
  priorEin: boolean; priorEinNumber: string;
  designeeEnabled: boolean; designeeName: string; designeePhone: string; designeeAddress: string; designeeFax: string;
  applicantNameAndTitle: string; applicantPhone: string; applicantFax: string;
};

export type Ss4Source = {
  fullName: string;
  phone: string | null;
  llcName: string;
  llcState: string | null;
  llcFormedDate: string | null;
  businessMailingAddress: string | null;
  businessType: string | null;
  businessPurpose: string | null;
  principalProducts: string | null;
  ownerName: string | null;
  ownerResidence: string | null;
  ownerCitizenship: string | null;
};

const FORM_TEXT_REPLACEMENTS: Record<string, string> = {
  Ł: "L",
  ł: "l",
  Ø: "O",
  ø: "o",
  Đ: "D",
  đ: "d",
  ß: "ss",
  Æ: "AE",
  æ: "ae",
  Œ: "OE",
  œ: "oe",
  ı: "i",
  Þ: "Th",
  þ: "th",
  "\u2018": "'",
  "\u2019": "'",
  "\u201A": "'",
  "\u201B": "'",
  "\u201C": '"',
  "\u201D": '"',
  "\u201E": '"',
  "\u201F": '"',
  "\u2013": "-",
  "\u2014": "-",
  "\u2212": "-",
};

const ENTITY_TYPES: readonly Ss4EntityType[] = ["sole_proprietor", "partnership", "corporation", "other"];
const REASONS: readonly Ss4Reason[] = ["started_new_business", "banking_purpose", "compliance_withholding", "hired_employees", "other"];
const ACTIVITIES: readonly Ss4Activity[] = [
  "health_care",
  "wholesale_agent",
  "construction",
  "rental_leasing",
  "transportation",
  "accommodation_food",
  "wholesale_other",
  "retail",
  "real_estate",
  "manufacturing",
  "finance_insurance",
  "other",
];

const STRING_KEYS = [
  "tradeName",
  "careOf",
  "mailingAddressLine",
  "mailingCityStateZip",
  "streetAddressLine",
  "streetCityStateZip",
  "countyAndState",
  "responsibleParty",
  "responsiblePartyTin",
  "llcMembers",
  "entityOtherText",
  "incorporationState",
  "incorporationCountry",
  "reasonSpecify",
  "businessStartDate",
  "closingMonth",
  "employeesAgricultural",
  "employeesHousehold",
  "employeesOther",
  "firstWagesDate",
  "activityOtherText",
  "principalProducts",
  "priorEinNumber",
  "designeeName",
  "designeePhone",
  "designeeAddress",
  "designeeFax",
  "applicantNameAndTitle",
  "applicantPhone",
  "applicantFax",
] as const satisfies readonly (keyof Ss4Options)[];

const STRING_LIMITS: Partial<Record<(typeof STRING_KEYS)[number], number>> = {
  mailingAddressLine: 300,
  mailingCityStateZip: 300,
  streetAddressLine: 300,
  streetCityStateZip: 300,
  reasonSpecify: 40,
  principalProducts: 300,
  designeeAddress: 300,
};

const BOOLEAN_KEYS = [
  "isLlc",
  "organizedInUs",
  "form944",
  "priorEin",
  "designeeEnabled",
] as const satisfies readonly (keyof Ss4Options)[];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const ENCODING_WARNING_FIELDS = {
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
  entityOtherText: "Line 9a",
  incorporationState: "Line 9b",
  incorporationCountry: "Line 9b",
  reasonSpecify: "Line 10",
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
} as const satisfies Partial<Record<(typeof STRING_KEYS)[number], string>>;

export function defaultSs4Options(app: Ss4Source): Ss4Options {
  const mailing = splitAddress(app.businessMailingAddress);
  const llcMembers = defaultMemberCount(app);
  const isSingleMember = llcMembers === "1";
  const businessDescription = trimToMax(app.businessType ?? app.businessPurpose ?? "", 40);
  const businessType = clean(app.businessType ?? "");
  const principalProducts = clean(app.principalProducts ?? app.businessPurpose ?? "");
  const responsibleParty = clean(app.ownerName ?? app.fullName);
  return {
    tradeName: "",
    careOf: "",
    mailingAddressLine: mailing.line,
    mailingCityStateZip: mailing.cityStateZip,
    streetAddressLine: "",
    streetCityStateZip: "",
    countyAndState: clean(app.llcState ?? ""),
    responsibleParty,
    responsiblePartyTin: "",
    isLlc: true,
    llcMembers,
    organizedInUs: true,
    entityType: isSingleMember ? "other" : "partnership",
    entityOtherText: isSingleMember ? "Foreign-owned U.S. disregarded entity" : "",
    incorporationState: "",
    incorporationCountry: "",
    reason: "started_new_business",
    reasonSpecify: businessDescription,
    businessStartDate: normalizeUsDate(app.llcFormedDate),
    closingMonth: "December",
    employeesAgricultural: "0",
    employeesHousehold: "0",
    employeesOther: "0",
    form944: false,
    firstWagesDate: "",
    activity: "other",
    activityOtherText: businessType,
    principalProducts,
    priorEin: false,
    priorEinNumber: "",
    designeeEnabled: false,
    designeeName: "",
    designeePhone: "",
    designeeAddress: "",
    designeeFax: "",
    applicantNameAndTitle: `${responsibleParty}, Member`,
    applicantPhone: clean(app.phone ?? ""),
    applicantFax: "",
  };
}

export function parseSs4Options(raw: unknown, app: Ss4Source): Ss4Options {
  const defaults = defaultSs4Options(app);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaults;
  const input = raw as Record<string, unknown>;
  const out: Ss4Options = { ...defaults };

  for (const key of STRING_KEYS) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      out[key] = coerceBoundedString(input[key], STRING_LIMITS[key] ?? 200);
    }
  }
  for (const key of BOOLEAN_KEYS) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      out[key] = coerceBoolean(input[key], defaults[key]);
    }
  }
  if (isOneOf(input.entityType, ENTITY_TYPES)) out.entityType = input.entityType;
  if (isOneOf(input.reason, REASONS)) out.reason = input.reason;
  if (isOneOf(input.activity, ACTIVITIES)) out.activity = input.activity;
  out.closingMonth = normalizeClosingMonth(out.closingMonth);
  out.llcMembers = normalizeDigits(out.llcMembers, "1");
  out.employeesAgricultural = normalizeDigits(out.employeesAgricultural, "0");
  out.employeesHousehold = normalizeDigits(out.employeesHousehold, "0");
  out.employeesOther = normalizeDigits(out.employeesOther, "0");
  return out;
}

export function toFormText(raw: string): string {
  let replaced = "";
  for (const char of raw.split("")) replaced += FORM_TEXT_REPLACEMENTS[char] ?? char;
  return replaced
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

export function unencodableChars(raw: string): string {
  const seen = new Set<string>();
  let chars = "";
  for (const char of toFormText(raw).split("")) {
    if ((char < " " || char > "~") && !seen.has(char)) {
      seen.add(char);
      chars += char;
    }
  }
  return chars;
}

export function ss4Warnings(o: Ss4Options): string[] {
  const warnings: string[] = [];
  if (!o.countyAndState.trim()) warnings.push("County and state is blank.");
  if (!o.responsiblePartyTin.trim()) warnings.push("Responsible party TIN is blank.");
  if (!o.businessStartDate.trim()) warnings.push("Business start date is blank.");
  if (o.reason === "other" && !o.reasonSpecify.trim()) warnings.push("Reason is Other, but the specify field is blank.");
  if (o.entityType === "other" && !o.entityOtherText.trim()) warnings.push("Entity type is Other, but the specify field is blank.");
  if (o.activity === "other" && !o.activityOtherText.trim()) warnings.push("Activity is Other, but the specify field is blank.");
  for (const [key, label] of Object.entries(ENCODING_WARNING_FIELDS) as [keyof typeof ENCODING_WARNING_FIELDS, string][]) {
    const offending = unencodableChars(o[key]);
    if (offending) {
      warnings.push(`${label} contains characters the form cannot print: ${offending.split("").join(" ")}. Replace them with Latin letters.`);
    }
  }
  if (o.llcMembers !== "1") {
    warnings.push(`The form shows ${o.llcMembers} members, which changes the entity type. Confirm this with the customer.`);
  }
  const memberCount = Number(o.llcMembers);
  if ((o.llcMembers === "1" && o.entityType === "partnership") || (Number.isFinite(memberCount) && memberCount > 1 && o.entityType === "other")) {
    warnings.push("Member count and entity type disagree.");
  }
  return warnings;
}

export function splitAddress(raw: string | null): { line: string; cityStateZip: string } {
  const normalized = (raw ?? "").trim();
  if (!normalized) return { line: "", cityStateZip: "" };
  const lines = normalized.split(/\r?\n/).map(clean).filter(Boolean);
  if (lines.length <= 1) {
    // Customers usually type the whole address on one line. Peel off a US
    // "City, ST 12345" ending (optionally followed by the country) for line 4b.
    const single = clean(normalized);
    const usTail = single.match(
      /^(.*?),\s*([^,]+,\s*[A-Za-z]{2}\.?\s+\d{5}(?:-\d{4})?(?:,\s*(?:USA|U\.S\.A\.|US|United States(?: of America)?))?)$/,
    );
    if (usTail && usTail[1].trim()) return { line: usTail[1].trim(), cityStateZip: usTail[2].trim() };
    return { line: single, cityStateZip: "" };
  }

  const last = lines[lines.length - 1];
  const previous = lines[lines.length - 2];
  if (looksLikeCountry(last) && previous && looksLikeCityStateZip(previous)) {
    return {
      line: lines.slice(0, -2).join(", "),
      cityStateZip: `${previous}, ${last}`,
    };
  }
  if (looksLikeCityStateZip(last)) {
    return {
      line: lines.slice(0, -1).join(", "),
      cityStateZip: last,
    };
  }
  return { line: lines.join(", "), cityStateZip: "" };
}

export function normalizeUsDate(raw: string | null): string {
  const value = clean(raw ?? "");
  if (!value) return "";
  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return formatDateParts(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const slash = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return formatDateParts(Number(slash[3]), Number(slash[1]), Number(slash[2]));
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return formatDateParts(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, parsed.getUTCDate());
}

function defaultMemberCount(app: Ss4Source): string {
  const businessType = app.businessType ?? "";
  const explicit = businessType.match(/\b([2-9]\d*)[\s-]*member\b/i);
  if (explicit) return explicit[1];
  const word = businessType.match(/\b(two|three|four|five|six|seven|eight|nine)[\s-]*member\b/i);
  if (word) return String(WORD_NUMBERS[word[1].toLowerCase() as keyof typeof WORD_NUMBERS]);
  if (/\bmulti[\s-]*member\b/i.test(businessType)) return "2";
  return "1";
}

const WORD_NUMBERS = {
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
} as const;

function clean(value: string): string {
  return value.trim().replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ");
}

function trimToMax(value: string, max: number): string {
  const cleaned = clean(value);
  if (cleaned.length <= max) return cleaned;
  // Cut at a word boundary so a draft default never ends mid-word.
  const cut = cleaned.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut).trim();
}

function coerceBoundedString(value: unknown, max: number): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return clean(value).slice(0, max);
  if (typeof value === "number" || typeof value === "boolean") return clean(String(value)).slice(0, max);
  return "";
}

function normalizeClosingMonth(value: string): string {
  const match = MONTHS.find((month) => month.toLowerCase() === value.trim().toLowerCase());
  return match ?? "December";
}

function normalizeDigits(value: string, fallback: string): string {
  return /^\d{1,4}$/.test(value) ? value : fallback;
}

function coerceBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return fallback;
}

function isOneOf<T extends string>(value: unknown, choices: readonly T[]): value is T {
  return typeof value === "string" && choices.includes(value as T);
}

function looksLikeCityStateZip(value: string): boolean {
  return /,/.test(value) || /\d/.test(value) || /\b[A-Z]{2}\b/.test(value);
}

function looksLikeCountry(value: string): boolean {
  return /^[A-Za-z][A-Za-z .'-]{2,}$/.test(value) && !/\d/.test(value) && !/,/.test(value);
}

function formatDateParts(year: number, month: number, day: number): string {
  if (!validDateParts(year, month, day)) return "";
  return `${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}/${String(year).padStart(4, "0")}`;
}

function validDateParts(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
