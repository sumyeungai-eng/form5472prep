// Pure classifier for the reportable-transactions checker: parses the
// shareable ?t= selection, looks up each rule and summarises the result.
// No I/O, no DOM — safe to import from server and client components.

import { SOURCES, type Source } from "./sources";
import {
  TRANSACTIONS,
  type FormPart,
  type TransactionType,
  type Verdict,
} from "./transactions";

export const QUERY_PARAM = "t";

const BY_ID = new Map(TRANSACTIONS.map((item) => [item.id, item]));
const ORDER = new Map(TRANSACTIONS.map((item, index) => [item.id, index]));
const PART_ORDER: FormPart[] = ["IV", "V", "VI"];

export function isTransactionId(value: string): boolean {
  return BY_ID.has(value);
}

export function getTransaction(id: string): TransactionType | undefined {
  return BY_ID.get(id);
}

/** Known ids only, de-duplicated, in the checker's display order. */
export function normalizeSelection(ids: Iterable<string>): string[] {
  const unique = new Set<string>();
  for (const raw of Array.from(ids)) {
    const id = raw.trim().toLowerCase();
    if (BY_ID.has(id)) unique.add(id);
  }
  return Array.from(unique).sort((a, b) => (ORDER.get(a) ?? 0) - (ORDER.get(b) ?? 0));
}

/**
 * Parse the ?t= value ("owner-paid-state-fee,loan-to-llc"). Tolerates spaces,
 * repeats, unknown ids and a URL-encoded comma; never throws.
 */
export function parseSelection(value: string | null | undefined): string[] {
  if (!value) return [];
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Malformed escape sequence — fall back to the raw string.
  }
  return normalizeSelection(decoded.split(","));
}

/** The ?t= value for a selection (canonical order; empty string for none). */
export function serializeSelection(ids: Iterable<string>): string {
  return normalizeSelection(ids).join(",");
}

/**
 * Rebuild a URL's query string with the selection in ?t=, keeping any other
 * params (utm tags etc.) and the hash. Commas are left readable.
 */
export function buildShareSearch(currentSearch: string, ids: Iterable<string>): string {
  const params = new URLSearchParams(currentSearch);
  const value = serializeSelection(ids);
  if (value) params.set(QUERY_PARAM, value);
  else params.delete(QUERY_PARAM);
  const query = params.toString().replace(/%2C/gi, ",");
  return query ? `?${query}` : "";
}

export type ClassifiedItem = {
  id: string;
  label: string;
  verdict: Verdict;
  parts: FormPart[];
  where: string;
  reason: string;
  sources: Source[];
};

export type Overall = "none" | "reportable" | "depends" | "not-reportable";

export type Classification = {
  items: ClassifiedItem[];
  counts: Record<Verdict, number>;
  /** Union of the definite parts across selected items, in form order. */
  parts: FormPart[];
  overall: Overall;
};

export function classifyTransaction(id: string): ClassifiedItem | undefined {
  const item = BY_ID.get(id);
  if (!item) return undefined;
  return {
    id: item.id,
    label: item.label,
    verdict: item.verdict,
    parts: [...item.parts],
    where: item.where,
    reason: item.reason,
    sources: item.sources.map((key) => ({ label: SOURCES[key].label, url: SOURCES[key].url })),
  };
}

/**
 * Overall answer for the year:
 * - any reportable item → the LLC files Form 5472 (with a pro forma 1120);
 * - otherwise any "depends" item → needs a closer look;
 * - otherwise (only not-reportable items) → nothing selected is reportable;
 * - nothing selected → "none".
 */
export function classify(ids: Iterable<string>): Classification {
  const selection = normalizeSelection(ids);
  const items = selection
    .map((id) => classifyTransaction(id))
    .filter((item): item is ClassifiedItem => item !== undefined);

  const counts: Record<Verdict, number> = {
    reportable: 0,
    "not-reportable": 0,
    depends: 0,
  };
  const partSet = new Set<FormPart>();
  for (const item of items) {
    counts[item.verdict] += 1;
    if (item.verdict !== "not-reportable") {
      for (const part of item.parts) partSet.add(part);
    }
  }

  let overall: Overall = "none";
  if (counts.reportable > 0) overall = "reportable";
  else if (counts.depends > 0) overall = "depends";
  else if (items.length > 0) overall = "not-reportable";

  return {
    items,
    counts,
    parts: PART_ORDER.filter((part) => partSet.has(part)),
    overall,
  };
}
