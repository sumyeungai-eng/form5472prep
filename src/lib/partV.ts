// Part V line items (P0-4, docs/reviews/2026-10-30-system-update-plan.md).
// Pure module: imported by the wizard (client), the filing PATCH route, the
// admin actions and the package generator. Three layers:
//   (a) customer capture is permissive: toPartVRow keeps what was typed and
//       never throws, so a save, an advance or a payment is never refused;
//   (b) generator input is sanitised: a row with no valid USD amount is kept
//       and flagged (amountMissing), never silently treated as a $0 payment;
//   (c) staff findings are strict: pre-flight A38 / W43 / W44 / W45.

export const PART_V_CATEGORIES = ["contribution", "distribution", "loan_from_owner", "loan_to_owner", "other"] as const;
export const PAID_VIA = ["OWNER_PAID_PERSONALLY", "TRANSFER", "OTHER"] as const;
export type PaidVia = (typeof PAID_VIA)[number];

// One stored row (FilingYearData.reportableTransactions[i]). date/amountCents
// are the parsed values (""/null when they could not be read); the *Input
// fields are what the customer typed, kept for staff.
export type PartVRow = {
  date: string;
  description: string;
  counterparty?: string;
  amountCents: number | null;
  category: string;
  paidVia?: PaidVia;
  currency?: string;
  originalAmount?: number | null;
  dateInput?: string;
  amountInput?: string;
  originalAmountInput?: string;
  rule?: string;
};

const OUTFLOW = new Set(["distribution", "loan_to_owner"]);

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

// Decimal-aware amount parsing. "1,234.56" and "1.234,56" are both 1234.56;
// "12,50" is 12.5; "1,500" (US thousands) is 1500; "1.500" is 1.5 (and the
// decimal hint below warns about it). Currency signs, spaces and letters are
// ignored; "(12)" is -12. Returns null when no number can be read.
export function parseDecimalAmount(input: unknown): number | null {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  if (typeof input !== "string") return null;
  let s = input.trim();
  const negative = /^\(.*\)$/.test(s) || /^-/.test(s.replace(/[^\d.,()-]/g, ""));
  s = s.replace(/[^\d.,]/g, "");
  if (!/\d/.test(s)) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? "," : ".";
    s = s.split(decimal === "," ? "." : ",").join("").replace(",", ".");
  } else if (lastComma >= 0) {
    s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if (lastDot >= 0 && /^\d{1,3}(\.\d{3}){2,}$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  if ((s.match(/\./g) ?? []).length > 1) return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negative ? -Math.abs(n) : n;
}

// "1.500" / "5,000" typed for an amount that parses under $100: probably a
// thousands separator read as a decimal point (customer warning, never blocking).
export function isAmbiguousDecimal(input: string | undefined): boolean {
  const s = (input ?? "").trim().replace(/^[$\s]+/, "");
  if (!/^\d{1,3}[.,]\d{3}$/.test(s)) return false;
  const n = parseDecimalAmount(s);
  return n !== null && Math.abs(n) < 100;
}

// Layer (a)/(b): any stored or posted row → a PartVRow. Never throws.
export function toPartVRow(item: unknown): PartVRow {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return { date: "", description: "(unreadable row)", amountCents: null, category: "other" };
  }
  const r = item as Record<string, unknown>;
  const category = str(r.category, 40) || "other";
  const rawDate = str(r.date, 40);
  const dateInput = str(r.dateInput, 40) || (rawDate && !isIsoDate(rawDate) ? rawDate : "");
  const date = isIsoDate(rawDate) ? rawDate : isIsoDate(dateInput) ? dateInput : "";
  const amountInput = str(r.amountInput, 64);
  let amountCents: number | null = null;
  if (typeof r.amountCents === "number" && Number.isFinite(r.amountCents)) {
    amountCents = Math.round(r.amountCents);
  } else {
    const parsed = parseDecimalAmount(amountInput);
    if (parsed !== null) {
      const cents = Math.round(Math.abs(parsed) * 100);
      amountCents = OUTFLOW.has(category) ? -cents : cents;
    }
  }
  const originalAmountInput = str(r.originalAmountInput, 64);
  const originalAmount =
    typeof r.originalAmount === "number" && Number.isFinite(r.originalAmount)
      ? r.originalAmount
      : parseDecimalAmount(originalAmountInput);
  const currency = str(r.currency, 8).toUpperCase();
  const paidVia = (PAID_VIA as readonly string[]).includes(r.paidVia as string) ? (r.paidVia as PaidVia) : undefined;
  const counterparty = str(r.counterparty, 200);
  const rule = str(r.rule, 80);
  return {
    date,
    description: str(r.description, 2000),
    ...(counterparty ? { counterparty } : {}),
    amountCents,
    category,
    ...(paidVia ? { paidVia } : {}),
    ...(currency ? { currency } : {}),
    ...(originalAmount !== null ? { originalAmount } : {}),
    ...(dateInput ? { dateInput } : {}),
    ...(amountInput ? { amountInput } : {}),
    ...(originalAmountInput ? { originalAmountInput } : {}),
    ...(rule ? { rule } : {}),
  };
}

export function toPartVRows(value: unknown): PartVRow[] {
  return Array.isArray(value) ? value.slice(0, 500).map(toPartVRow) : [];
}

// A row in a currency other than USD (or with an original amount typed).
export function isForeignCurrencyRow(row: { currency?: string; originalAmount?: number | null; originalAmountInput?: string }): boolean {
  return (!!row.currency && row.currency !== "USD") || row.originalAmount != null || !!row.originalAmountInput?.trim();
}

// The FX sentence for one row, or null. Only for a set 3-letter non-USD
// currency, a finite positive original amount and a USD amount, so NaN or
// Infinity can never reach the PDF. Rate = USD / original, 4 decimals.
export function fxSentence(row: {
  description: string;
  amountCents: number | null;
  amountMissing?: boolean;
  currency?: string;
  originalAmount?: number | null;
}): string | null {
  const currency = row.currency ?? "";
  const original = row.originalAmount;
  if (!/^[A-Z]{3}$/.test(currency) || currency === "USD") return null;
  if (typeof original !== "number" || !Number.isFinite(original) || original <= 0) return null;
  if (row.amountMissing || row.amountCents === null || row.amountCents === 0) return null;
  const usd = Math.abs(row.amountCents) / 100;
  const rate = usd / original;
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const what = row.description.trim() || "This payment";
  return `${what}: ${money(original)} ${currency} converted to $${money(usd)} at ${rate.toFixed(4)} USD per ${currency}.`;
}

// W45: a foreign-currency row whose currency or original amount is missing,
// zero or malformed (so no FX sentence prints).
export function hasFxProblem(row: Parameters<typeof fxSentence>[0] & { originalAmountInput?: string }): boolean {
  return isForeignCurrencyRow(row) && !row.amountMissing && row.amountCents !== null && fxSentence(row) === null;
}

// Customer-side warnings for one row (never blocking).
export function partVRowWarnings(row: PartVRow, taxYear: number, formationDate?: string | null): string[] {
  const out: string[] = [];
  if (row.date) {
    if (!row.date.startsWith(`${taxYear}-`)) out.push(`The date is outside ${taxYear}.`);
    else if (formationDate && isIsoDate(formationDate) && row.date < formationDate) out.push("The date is before the LLC was formed.");
  } else if (row.dateInput) {
    out.push("We could not read the date.");
  }
  if (row.amountCents === null) out.push("Enter the amount in US dollars.");
  if (isForeignCurrencyRow(row) && (!/^[A-Z]{3}$/.test(row.currency ?? "") || row.currency === "USD" || !(typeof row.originalAmount === "number" && row.originalAmount > 0))) {
    out.push("For a payment in another currency, enter the currency and the original amount.");
  }
  if (isAmbiguousDecimal(row.amountInput)) {
    out.push(`Check the amount "${row.amountInput}": it reads as under $100. If you meant thousands, type it without the separator.`);
  }
  return out;
}
