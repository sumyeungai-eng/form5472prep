import { nextBusinessDay } from "@/lib/federalHolidays";
import { form1120StatutoryDue } from "@/lib/form1120DueDate";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Original Form 1120 due date (UTC midnight) for a full calendar tax year: the
// same value as filingDueDateUtc(taxYear) in schemas.ts (pinned by a test), built
// from the shared rule directly so the client order page does not bundle
// schemas.ts (zod + pdf-lib, ~190 kB).
export function extensionDueDateUtc(taxYear: number): number {
  const due = form1120StatutoryDue(`${String(taxYear).padStart(4, "0")}-01-01`, taxYear, 12);
  return nextBusinessDay(new Date(due.originalStatutoryUtc)).getTime();
}

// "April 15, 2027" — same output as formatDueDate in schemas.ts.
export function formatExtensionDate(utcMs: number): string {
  return new Date(utcMs).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
}

// Tax years a Form 7004 extension can still be ordered for: calendar years Y
// up to the current year whose ORIGINAL return due date (15 April of Y+1,
// rolled past weekends/DC holidays) has not passed. A 7004 is only valid when
// filed by that date, and is timely through the whole due day (same +1-day
// convention as isYearDelinquent in schemas.ts). Only Y-1 and Y can ever
// qualify; the current year always does, so the list is never empty.
export function openExtensionTaxYears(now: Date = new Date()): number[] {
  const year = now.getUTCFullYear();
  return [year - 1, year].filter((y) => now.getTime() < extensionDueDateUtc(y) + ONE_DAY_MS);
}

// Statuses staff use for a 7004 order (reusing EinStatus), with admin labels.
export const EXTENSION_STATUS_LABELS = {
  PAYMENT_PENDING: "Payment pending",
  IN_REVIEW: "In review (paid, not started)",
  PROCESSING: "Faxing",
  COMPLETED: "Completed (faxed, confirmation emailed)",
  CANCELLED: "Cancelled",
} as const;
export type ExtensionStatus = keyof typeof EXTENSION_STATUS_LABELS;

export function isExtensionStatus(value: unknown): value is ExtensionStatus {
  return typeof value === "string" && Object.hasOwn(EXTENSION_STATUS_LABELS, value);
}
