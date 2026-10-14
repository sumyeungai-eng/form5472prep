// U.S. Social Security Number helpers (spec docs/reviews/2026-10-15-ssn-capture-spec.md, S4).
//
// Pure functions with no Node imports, so the customer portal box and the
// admin card can run the same checks in the browser before sending anything.
// Encryption lives in ./pii (server-only).
//
// NEVER log the input or the result of any of these functions.

export type SsnValidation =
  | { ok: true; ssn: string; last4: string }
  | {
      ok: false;
      code: "format" | "itin_range" | "area" | "group" | "serial";
      error: string;
    };

export const SSN_FORMAT_MESSAGE = "Enter the 9 digits of your SSN, for example 123-45-6789.";
export const SSN_ITIN_MESSAGE =
  "That looks like an ITIN — enter it in the ITIN field or contact us.";
export const SSN_INVALID_MESSAGE =
  "That isn't a valid Social Security Number. Please check it against your card.";

// Accept the usual ways people type an SSN: "123-45-6789", "123 45 6789",
// "123456789". Only spaces and dashes are removed; anything else stays in and
// fails the 9-digit check, so a typo is never silently "fixed".
export function normalizeSsn(input: string): string {
  return String(input ?? "").replace(/[\s-]/g, "");
}

// Rejects only numbers that can never be a valid SSN: not 9 digits; area 000,
// 666 or 900-999 (the 9xx range is ITINs); group 00; serial 0000. Everything
// else is accepted — the SSA has issued SSNs randomly since 2011, so no other
// rule is safe.
export function validateSsn(input: string): SsnValidation {
  const ssn = normalizeSsn(input);
  if (!/^\d{9}$/.test(ssn)) return { ok: false, code: "format", error: SSN_FORMAT_MESSAGE };
  const area = ssn.slice(0, 3);
  const group = ssn.slice(3, 5);
  const serial = ssn.slice(5);
  if (area.startsWith("9")) return { ok: false, code: "itin_range", error: SSN_ITIN_MESSAGE };
  if (area === "000" || area === "666") return { ok: false, code: "area", error: SSN_INVALID_MESSAGE };
  if (group === "00") return { ok: false, code: "group", error: SSN_INVALID_MESSAGE };
  if (serial === "0000") return { ok: false, code: "serial", error: SSN_INVALID_MESSAGE };
  return { ok: true, ssn, last4: serial };
}

// "•••-••-1234" for display. Anything that is not exactly four digits renders
// as an empty string rather than echoing it.
export function maskSsn(last4: string | null | undefined): string {
  if (!last4 || !/^\d{4}$/.test(last4)) return "";
  return `•••-••-${last4}`;
}

// The form print format: "123-45-6789". Expects a validated 9-digit SSN.
export function formatSsnForForms(ssn: string): string {
  const digits = normalizeSsn(ssn);
  if (!/^\d{9}$/.test(digits)) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}
