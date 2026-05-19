import type { ParsedTransaction } from "./types";

// What we report on Form 5472 Part V vs everything else.
export type Category =
  | "contribution"     // owner -> LLC : reportable (Part V)
  | "distribution"     // LLC -> owner : reportable (Part V)
  | "revenue"          // customer -> LLC : not reportable
  | "vendor_expense"   // LLC -> third party : not reportable
  | "card_reimbursement" // LLC -> credit card issuer : not reportable
  | "internal_transfer"  // LLC account A <-> LLC account B : not reportable
  | "unknown";

export type CategorizedTransaction = ParsedTransaction & {
  category: Category;
  rule: string; // which rule fired, for the user-visible explanation
  // Optional: which BankStatement these came from (set client-side after upload).
  bankStatementId?: string;
};

// Owner identity hints — passed in by the caller. We match against
// counterparty text. Be permissive: matching "Smith" handles "Jane Smith",
// "J Smith", etc.
export type OwnerIdentity = {
  fullName: string;
  // Free-form aliases the user types in — Wise account names, personal bank
  // labels like "My Chase ...", etc.
  aliases?: string[];
};

const REVENUE_PROCESSORS = [
  "stripe",
  "paypal",
  "square",
  "shopify",
  "amazon payments",
  "wise",          // inbound from a third party via Wise
  "transferwise",
];

const CARD_ISSUERS = [
  "american express",
  "amex",
  "chase card",
  "citi card",
  "citibank",
  "capital one",
  "discover",
  "bank of america credit",
  "wells fargo card",
];

function containsAny(haystack: string, needles: string[]): string | null {
  const h = haystack.toLowerCase();
  for (const n of needles) if (h.includes(n)) return n;
  return null;
}

function matchesOwner(text: string, owner: OwnerIdentity): boolean {
  const t = text.toLowerCase();
  const parts: string[] = [];
  if (owner.fullName) parts.push(...owner.fullName.toLowerCase().split(/\s+/).filter((p) => p.length >= 3));
  if (owner.aliases) parts.push(...owner.aliases.map((a) => a.toLowerCase()));
  return parts.some((p) => p && t.includes(p));
}

function looksLikeInternalTransfer(text: string): boolean {
  // Mercury labels internal moves between sub-accounts with "Transfer" or
  // explicit "Mercury Checking → Mercury Treasury" patterns.
  const t = text.toLowerCase();
  return (
    /\btransfer\b/.test(t) &&
    (t.includes("→") || t.includes("->") || t.includes("between accounts") ||
      t.includes("mercury checking") || t.includes("mercury treasury") ||
      t.includes("from checking") || t.includes("from savings"))
  );
}

export function categorize(tx: ParsedTransaction, owner: OwnerIdentity): CategorizedTransaction {
  const text = `${tx.description} ${tx.counterparty}`;
  const inflow = tx.amountCents > 0;

  // Rule order matters — first match wins.

  // 1. Internal transfer
  if (looksLikeInternalTransfer(text)) {
    return { ...tx, category: "internal_transfer", rule: "Internal transfer between LLC accounts" };
  }

  // 2. Owner-named counterparty: contribution or distribution
  if (matchesOwner(text, owner)) {
    return inflow
      ? { ...tx, category: "contribution", rule: "From owner — capital contribution (Part V)" }
      : { ...tx, category: "distribution", rule: "To owner — distribution (Part V)" };
  }

  // 3. Credit card issuer payment (outflow only)
  if (!inflow) {
    const issuer = containsAny(text, CARD_ISSUERS);
    if (issuer)
      return {
        ...tx,
        category: "card_reimbursement",
        rule: `Payment to credit card issuer (${issuer})`,
      };
  }

  // 4. Revenue from common payment processors (inflow only)
  if (inflow) {
    const processor = containsAny(text, REVENUE_PROCESSORS);
    if (processor)
      return {
        ...tx,
        category: "revenue",
        rule: `Customer revenue via ${processor}`,
      };
  }

  // 5. Unmatched outflows default to vendor expense; inflows to unknown
  if (!inflow) {
    return { ...tx, category: "vendor_expense", rule: "Outflow to third party — assumed vendor expense" };
  }

  return { ...tx, category: "unknown", rule: "Unrecognised — please categorise manually" };
}

export function categorizeAll(
  txs: ParsedTransaction[],
  owner: OwnerIdentity,
): CategorizedTransaction[] {
  return txs.map((t) => categorize(t, owner));
}

export type Totals = {
  contributions: number;   // dollars, positive
  distributions: number;   // dollars, positive
  revenue: number;
  vendorExpense: number;
  cardReimbursement: number;
  internalTransfer: number;
  unknown: number;
};

export function totals(txs: CategorizedTransaction[]): Totals {
  const t: Totals = {
    contributions: 0,
    distributions: 0,
    revenue: 0,
    vendorExpense: 0,
    cardReimbursement: 0,
    internalTransfer: 0,
    unknown: 0,
  };
  for (const tx of txs) {
    const dollars = Math.abs(tx.amountCents) / 100;
    switch (tx.category) {
      case "contribution": t.contributions += dollars; break;
      case "distribution": t.distributions += dollars; break;
      case "revenue": t.revenue += dollars; break;
      case "vendor_expense": t.vendorExpense += dollars; break;
      case "card_reimbursement": t.cardReimbursement += dollars; break;
      case "internal_transfer": t.internalTransfer += dollars; break;
      case "unknown": t.unknown += dollars; break;
    }
  }
  return t;
}
