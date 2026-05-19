import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { BankProvider, ParseResult, ParsedTransaction } from "./types";

// Detect a bank format by inspecting the header row. Falls back to "generic"
// (which then needs user column mapping — Phase 5 stretch).
export function detectProvider(headers: string[]): BankProvider {
  const lower = headers.map((h) => h.trim().toLowerCase());
  const has = (...needles: string[]) => needles.every((n) => lower.includes(n));

  // Mercury (downloaded from mercury.com -> Statements -> Export CSV)
  if (has("date", "description", "amount", "status", "source account")) return "mercury";
  if (has("date (utc)", "amount", "currency", "source", "target")) return "wise";
  // Relay export uses similar columns to Mercury but with "memo" instead of "description"
  if (has("date", "memo", "amount", "account name")) return "relay";
  // Brex CSV
  if (has("date", "merchant", "amount", "card user")) return "brex";
  return "generic";
}

function toCents(s: string | number | undefined | null): number {
  if (s == null) return 0;
  const cleaned = String(s).replace(/[$,\s]/g, "");
  if (cleaned === "" || cleaned === "-") return 0;
  const n = Number(cleaned);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

function isoDate(s: string | undefined): string {
  if (!s) return "";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toISOString().slice(0, 10);
}

function parseMercury(rows: Record<string, string>[]): ParsedTransaction[] {
  return rows
    .filter((r) => (r["Status"] ?? "").toLowerCase() !== "failed")
    .map((r) => ({
      date: isoDate(r["Date"]),
      description: r["Description"] ?? "",
      counterparty: r["Description"] ?? "",
      amountCents: toCents(r["Amount"]),
      bankRef: r["Reference"] || undefined,
    }));
}

function parseWise(rows: Record<string, string>[]): ParsedTransaction[] {
  return rows.map((r) => {
    // Wise represents direction by sign on Amount.
    const counterparty = r["Target"] || r["Source"] || "";
    return {
      date: isoDate(r["Date (UTC)"]),
      description: `${r["Description"] ?? ""} ${counterparty}`.trim(),
      counterparty,
      amountCents: toCents(r["Amount"]),
      bankRef: r["TransferWise ID"] || undefined,
    };
  });
}

function parseRelay(rows: Record<string, string>[]): ParsedTransaction[] {
  return rows.map((r) => ({
    date: isoDate(r["Date"]),
    description: r["Memo"] ?? "",
    counterparty: r["Memo"] ?? "",
    amountCents: toCents(r["Amount"]),
  }));
}

function parseBrex(rows: Record<string, string>[]): ParsedTransaction[] {
  return rows.map((r) => ({
    date: isoDate(r["Date"]),
    description: r["Merchant"] ?? "",
    counterparty: r["Merchant"] ?? "",
    amountCents: toCents(r["Amount"]),
  }));
}

function parseGeneric(rows: Record<string, string>[]): ParsedTransaction[] {
  // Best-effort: scan for common column names case-insensitively.
  return rows.map((r) => {
    const get = (...names: string[]) => {
      for (const n of names) {
        const key = Object.keys(r).find((k) => k.trim().toLowerCase() === n.toLowerCase());
        if (key && r[key] != null && r[key] !== "") return r[key];
      }
      return "";
    };
    const desc = get("description", "memo", "merchant", "narrative", "details");
    return {
      date: isoDate(get("date", "transaction date", "posted date", "date (utc)")),
      description: desc,
      counterparty: desc,
      amountCents: toCents(get("amount", "amount (usd)", "value")),
    };
  });
}

export function parseBankCsv(csvText: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const warnings: string[] = result.errors
    .filter((e) => e.code !== "TooFewFields")
    .slice(0, 5)
    .map((e) => `${e.code}: ${e.message}`);

  const headers = result.meta.fields ?? [];
  const provider = detectProvider(headers);

  let transactions: ParsedTransaction[];
  switch (provider) {
    case "mercury":
      transactions = parseMercury(result.data);
      break;
    case "wise":
      transactions = parseWise(result.data);
      break;
    case "relay":
      transactions = parseRelay(result.data);
      break;
    case "brex":
      transactions = parseBrex(result.data);
      break;
    default:
      transactions = parseGeneric(result.data);
  }

  // Drop empty rows.
  transactions = transactions.filter((t) => t.date && t.amountCents !== 0);

  if (provider === "generic") {
    warnings.unshift(
      "Unrecognised bank format — parsed using generic column detection. Please review each transaction's category carefully.",
    );
  }

  return { provider, transactions, warnings };
}

// Excel uploads: read the first sheet, convert to CSV text, then reuse the
// CSV pipeline so every bank-specific parser still applies.
export function parseBankExcel(buffer: Buffer): ParseResult {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch (err) {
    return {
      provider: "generic",
      transactions: [],
      warnings: [
        `Couldn't read the Excel file (${
          err instanceof Error ? err.message : "unknown error"
        }). Try saving it as CSV from Excel and uploading again.`,
      ],
    };
  }
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return {
      provider: "generic",
      transactions: [],
      warnings: ["The Excel file has no sheets. Please upload a CSV instead."],
    };
  }
  const csvText = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
  return parseBankCsv(csvText);
}
