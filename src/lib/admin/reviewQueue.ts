import { Prisma, type FilingStatus } from "@prisma/client";
import { isLegalHoliday } from "@/lib/federalHolidays";

// PR 8 — admin review queue. Targets (owner decision D2): express = 72 hours
// from payment, standard = 7 business days (Mon–Fri, skipping the DC/federal
// legal holidays in federalHolidays.ts; dates evaluated in UTC).
export const EXPRESS_DUE_HOURS = 72;
export const STANDARD_DUE_BUSINESS_DAYS = 7;
export const REVIEW_QUEUE_LIMIT = 100;

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

function isBusinessDay(d: Date): boolean {
  const dow = d.getUTCDay();
  return dow !== 0 && dow !== 6 && !isLegalHoliday(d);
}

export function addBusinessDays(from: Date, days: number): Date {
  let cursor = from;
  let left = days;
  while (left > 0) {
    cursor = new Date(cursor.getTime() + DAY_MS);
    if (isBusinessDay(cursor)) left -= 1;
  }
  return cursor;
}

export function dueAt(f: { tier: string; paidAt: Date | null }): Date | null {
  if (!f.paidAt) return null;
  return f.tier === "express"
    ? new Date(f.paidAt.getTime() + EXPRESS_DUE_HOURS * HOUR_MS)
    : addBusinessDays(f.paidAt, STANDARD_DUE_BUSINESS_DAYS);
}

// "due in 5h" / "due in 3d" / "overdue 2d"; hours under 48h so the last two
// days before an express deadline stay precise. "—" when paidAt is unknown.
export function dueLabel(due: Date | null, now: Date = new Date()): { text: string; overdue: boolean } {
  if (!due) return { text: "—", overdue: false };
  const ms = due.getTime() - now.getTime();
  const hours = Math.floor(Math.abs(ms) / HOUR_MS);
  const span = hours < 48 ? `${hours}h` : `${Math.floor(hours / 24)}d`;
  return ms >= 0 ? { text: `due in ${span}`, overdue: false } : { text: `overdue ${span}`, overdue: true };
}

// Release gate (P0-1): at or past PDF_GENERATED but staff haven't released it,
// so the client can't see the package yet.
const AT_OR_PAST_PDF: ReadonlySet<FilingStatus> = new Set<FilingStatus>([
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
  "FAILED",
]);
export function isNotReleased(f: { status: FilingStatus; reviewApprovedAt: Date | null }): boolean {
  return AT_OR_PAST_PDF.has(f.status) && !f.reviewApprovedAt;
}

// The due clock only matters until staff release the package.
export function showsDueChip(f: { status: FilingStatus; reviewApprovedAt: Date | null }): boolean {
  return f.status !== "DRAFT" && !f.reviewApprovedAt;
}

// Ordered in SQL BEFORE the LIMIT so the 100 rows shown are the 100 most
// urgent, not the newest 100 re-sorted: express first, then pre-flight
// failed, then oldest payment (unknown paidAt last), then oldest order.
// Scope = awaiting review (same rule as the "Awaiting review" filter).
export function reviewQueueSql(): Prisma.Sql {
  return Prisma.sql`
    SELECT "id" FROM "Filing"
    WHERE "status" IN ('PAID', 'PDF_GENERATED')
      AND "reviewApprovedAt" IS NULL
      AND "adminHidden" = false
      AND "supersededAt" IS NULL
    ORDER BY
      CASE WHEN "tier" = 'express' THEN 0 ELSE 1 END,
      CASE WHEN "preflightStatus" = 'failed' THEN 0 ELSE 1 END,
      "paidAt" ASC NULLS LAST,
      "createdAt" ASC
    LIMIT ${REVIEW_QUEUE_LIMIT}`;
}

export async function reviewQueueIds(db: {
  $queryRaw: <T>(query: Prisma.Sql) => Prisma.PrismaPromise<T>;
}): Promise<string[]> {
  const rows = await db.$queryRaw<{ id: string }[]>(reviewQueueSql());
  return rows.map((r) => r.id);
}

// findMany can't keep the SQL order of an `id IN (...)` list; restore it.
export function orderByIds<T extends { id: string }>(rows: T[], ids: string[]): T[] {
  const rank = new Map(ids.map((id, i) => [id, i]));
  return [...rows].sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity));
}
