import { EinStatus, FilingStatus, ItinStatus } from "@prisma/client";
import { TEST_TIER_VALUE } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";

export type DateRange = "7d" | "30d" | "90d" | "12m" | "all";
export type Bucket = "day" | "week" | "month";

export type RevenuePoint = { date: string; revenueCents: number; orders: number };
export type StatusBreakdown = { status: string; count: number };
export type SourceRow = { source: string; started: number; paid: number; confirmed: number; revenueCents: number; conversionRate: number };
export type PartnerRow = { partnerId: string; name: string | null; email: string; filings: number; paidFilings: number; revenueCents: number };
export type AttentionItem = { kind: "fax_failed" | "signature_pending" | "validation_failed" | "stale_paid"; filingId: string; llcName: string | null; ageHours: number };
export type DashboardSummary = {
  revenueCents: { period: number; previousPeriod: number; changePct: number };
  orders: { period: number; previousPeriod: number; changePct: number };
  filingsByStatus: StatusBreakdown[];
  applicationQueue: { ein: Record<string, number>; itin: Record<string, number> };
  needsAttention: AttentionItem[];
};

const PAID_STATUSES = new Set<FilingStatus>([
  FilingStatus.PAID,
  FilingStatus.PDF_GENERATED,
  FilingStatus.SIGNATURE_PENDING,
  FilingStatus.SIGNED_UPLOADED,
  FilingStatus.FAXED,
  FilingStatus.CONFIRMED,
]);

const DEFAULT_ATTENTION_LIMIT = 20;
const HOUR_MS = 60 * 60 * 1000;

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
}

function subtractMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() - months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

export function rangeToDates(range: DateRange, now: Date): { start: Date; end: Date; previousStart: Date } {
  const end = new Date(now);

  if (range === "all") {
    return { start: new Date(0), end, previousStart: new Date(0) };
  }

  const start = range === "12m"
    ? subtractMonths(end, 12)
    : subtractDays(end, Number.parseInt(range, 10));
  const previousStart = range === "12m"
    ? subtractMonths(start, 12)
    : subtractDays(start, Number.parseInt(range, 10));

  return { start, end, previousStart };
}

// A non-zero new period with no prior baseline is reported as 100% growth.
// This keeps the dashboard deterministic without dividing by zero.
export function calculateChangePct(period: number, previousPeriod: number): number {
  if (previousPeriod === 0) return period === 0 ? 0 : 100;
  return ((period - previousPeriod) / previousPeriod) * 100;
}

export function periodComparison(
  range: DateRange,
  period: number,
  previousPeriod: number,
): { period: number; previousPeriod: number; changePct: number } {
  if (range === "all") return { period, previousPeriod: 0, changePct: 0 };
  return { period, previousPeriod, changePct: calculateChangePct(period, previousPeriod) };
}

function bucketStart(date: Date, bucket: Bucket): Date {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);

  if (bucket === "week") {
    const daysSinceMonday = (result.getUTCDay() + 6) % 7;
    result.setUTCDate(result.getUTCDate() - daysSinceMonday);
  } else if (bucket === "month") {
    result.setUTCDate(1);
  }

  return result;
}

function advanceBucket(date: Date, bucket: Bucket): Date {
  const result = new Date(date);
  if (bucket === "day") result.setUTCDate(result.getUTCDate() + 1);
  if (bucket === "week") result.setUTCDate(result.getUTCDate() + 7);
  if (bucket === "month") result.setUTCMonth(result.getUTCMonth() + 1);
  return result;
}

export function bucketDate(date: Date, bucket: Bucket): string {
  return bucketStart(date, bucket).toISOString().slice(0, 10);
}

export function fillRevenueBuckets(
  start: Date,
  end: Date,
  bucket: Bucket,
  points: readonly RevenuePoint[],
): RevenuePoint[] {
  if (end.getTime() <= start.getTime()) return [];

  const byDate = new Map<string, RevenuePoint>();
  for (const point of points) {
    const current = byDate.get(point.date);
    byDate.set(point.date, {
      date: point.date,
      revenueCents: (current?.revenueCents ?? 0) + point.revenueCents,
      orders: (current?.orders ?? 0) + point.orders,
    });
  }

  const result: RevenuePoint[] = [];
  for (let cursor = bucketStart(start, bucket); cursor < end; cursor = advanceBucket(cursor, bucket)) {
    const date = cursor.toISOString().slice(0, 10);
    result.push(byDate.get(date) ?? { date, revenueCents: 0, orders: 0 });
  }
  return result;
}

export async function getDashboardSummary(range: DateRange): Promise<DashboardSummary> {
  const now = new Date();
  const { start, end, previousStart } = rangeToDates(range, now);

  const [filings, einCounts, itinCounts, needsAttention] = await Promise.all([
    prisma.filing.findMany({
      where: {
        tier: { not: TEST_TIER_VALUE },
        createdAt: { gte: previousStart, lt: end },
      },
      select: { status: true, amountPaid: true, createdAt: true },
    }),
    prisma.einApplication.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.itinApplication.groupBy({ by: ["status"], _count: { _all: true } }),
    getNeedsAttentionAt(now, DEFAULT_ATTENTION_LIMIT),
  ]);

  let periodRevenue = 0;
  let previousRevenue = 0;
  let periodOrders = 0;
  let previousOrders = 0;
  const statusCounts = new Map<FilingStatus, number>();

  for (const filing of filings) {
    const inCurrentPeriod = filing.createdAt.getTime() >= start.getTime();
    if (inCurrentPeriod) {
      statusCounts.set(filing.status, (statusCounts.get(filing.status) ?? 0) + 1);
      if (PAID_STATUSES.has(filing.status)) {
        periodOrders++;
        periodRevenue += filing.amountPaid;
      }
    } else if (PAID_STATUSES.has(filing.status)) {
      previousOrders++;
      previousRevenue += filing.amountPaid;
    }
  }

  const ein: Record<string, number> = {};
  for (const status of Object.values(EinStatus)) ein[status] = 0;
  for (const row of einCounts) ein[row.status] = row._count._all;

  const itin: Record<string, number> = {};
  for (const status of Object.values(ItinStatus)) itin[status] = 0;
  for (const row of itinCounts) itin[row.status] = row._count._all;

  return {
    revenueCents: periodComparison(range, periodRevenue, previousRevenue),
    orders: periodComparison(range, periodOrders, previousOrders),
    filingsByStatus: Object.values(FilingStatus).flatMap((status) => {
      const count = statusCounts.get(status) ?? 0;
      return count > 0 ? [{ status, count }] : [];
    }),
    applicationQueue: { ein, itin },
    needsAttention,
  };
}

export async function getRevenueSeries(range: DateRange, bucket: Bucket): Promise<RevenuePoint[]> {
  const { start, end } = rangeToDates(range, new Date());
  const filings = await prisma.filing.findMany({
    where: {
      tier: { not: TEST_TIER_VALUE },
      status: { in: Array.from(PAID_STATUSES) },
      createdAt: { gte: start, lt: end },
    },
    select: { createdAt: true, amountPaid: true },
  });

  const byDate = new Map<string, RevenuePoint>();
  for (const filing of filings) {
    const date = bucketDate(filing.createdAt, bucket);
    const point = byDate.get(date) ?? { date, revenueCents: 0, orders: 0 };
    point.revenueCents += filing.amountPaid;
    point.orders++;
    byDate.set(date, point);
  }

  return fillRevenueBuckets(start, end, bucket, Array.from(byDate.values()));
}

export async function getSourceAttribution(range: DateRange): Promise<SourceRow[]> {
  const { start, end } = rangeToDates(range, new Date());

  // Volume is small (low thousands at most), Prisma groupBy typing is awkward,
  // and separate funnel queries would add needless round trips. One JS pass
  // keeps the established admin source-report logic straightforward.
  const filings = await prisma.filing.findMany({
    where: {
      tier: { not: TEST_TIER_VALUE },
      createdAt: { gte: start, lt: end },
    },
    select: { funnelSource: true, status: true, amountPaid: true },
  });

  type MutableSourceRow = Omit<SourceRow, "source" | "conversionRate"> & { source: string | null };
  const bySource = new Map<string | null, MutableSourceRow>();

  for (const filing of filings) {
    const key = filing.funnelSource;
    let row = bySource.get(key);
    if (!row) {
      row = { source: key, started: 0, paid: 0, confirmed: 0, revenueCents: 0 };
      bySource.set(key, row);
    }
    row.started++;
    if (PAID_STATUSES.has(filing.status)) {
      row.paid++;
      row.revenueCents += filing.amountPaid;
    }
    if (filing.status === FilingStatus.CONFIRMED) row.confirmed++;
  }

  const rows: SourceRow[] = Array.from(bySource.values()).map((row) => ({
    source: row.source ?? "Untagged",
    started: row.started,
    paid: row.paid,
    confirmed: row.confirmed,
    revenueCents: row.revenueCents,
    conversionRate: row.started > 0 ? row.paid / row.started : 0,
  }));

  rows.sort((a, b) =>
    b.revenueCents - a.revenueCents ||
    b.paid - a.paid ||
    b.started - a.started,
  );
  return rows;
}

export async function getPartnerPerformance(range: DateRange): Promise<PartnerRow[]> {
  const { start, end } = rangeToDates(range, new Date());
  const filingWhere = {
    tier: { not: TEST_TIER_VALUE },
    createdAt: { gte: start, lt: end },
  };
  const partners = await prisma.partner.findMany({
    where: { filings: { some: filingWhere } },
    select: {
      id: true,
      name: true,
      email: true,
      filings: {
        where: filingWhere,
        select: { status: true, amountPaid: true },
      },
    },
  });

  const rows = partners.map((partner) => {
    let paidFilings = 0;
    let revenueCents = 0;
    for (const filing of partner.filings) {
      if (!PAID_STATUSES.has(filing.status)) continue;
      paidFilings++;
      revenueCents += filing.amountPaid;
    }
    return {
      partnerId: partner.id,
      name: partner.name,
      email: partner.email,
      filings: partner.filings.length,
      paidFilings,
      revenueCents,
    };
  });

  rows.sort((a, b) =>
    b.revenueCents - a.revenueCents ||
    b.paidFilings - a.paidFilings ||
    b.filings - a.filings,
  );
  return rows;
}

async function getNeedsAttentionAt(now: Date, limit: number): Promise<AttentionItem[]> {
  const signatureCutoff = new Date(now.getTime() - 48 * HOUR_MS);
  const paidCutoff = new Date(now.getTime() - 24 * HOUR_MS);
  const filings = await prisma.filing.findMany({
    where: {
      tier: { not: TEST_TIER_VALUE },
      OR: [
        { status: FilingStatus.FAILED },
        { faxStatus: { contains: "fail", mode: "insensitive" } },
        { status: FilingStatus.SIGNATURE_PENDING, updatedAt: { lt: signatureCutoff } },
        { validationStatus: { in: ["needs_input", "error"] } },
        { status: FilingStatus.PAID, generatedPdfKey: null, updatedAt: { lt: paidCutoff } },
      ],
    },
    select: {
      id: true,
      llcName: true,
      status: true,
      faxStatus: true,
      validationStatus: true,
      generatedPdfKey: true,
      updatedAt: true,
    },
  });

  const items: AttentionItem[] = [];
  for (const filing of filings) {
    const ageHours = (now.getTime() - filing.updatedAt.getTime()) / HOUR_MS;
    const add = (kind: AttentionItem["kind"]) => {
      items.push({ kind, filingId: filing.id, llcName: filing.llcName, ageHours });
    };

    if (filing.status === FilingStatus.FAILED || filing.faxStatus?.toLowerCase().includes("fail")) {
      add("fax_failed");
    }
    if (filing.status === FilingStatus.SIGNATURE_PENDING && filing.updatedAt < signatureCutoff) {
      add("signature_pending");
    }
    if (filing.validationStatus === "needs_input" || filing.validationStatus === "error") {
      add("validation_failed");
    }
    if (filing.status === FilingStatus.PAID && filing.generatedPdfKey === null && filing.updatedAt < paidCutoff) {
      add("stale_paid");
    }
  }

  items.sort((a, b) =>
    b.ageHours - a.ageHours ||
    a.filingId.localeCompare(b.filingId) ||
    a.kind.localeCompare(b.kind),
  );
  return items.slice(0, Math.max(0, Math.floor(limit)));
}

export async function getNeedsAttention(limit = DEFAULT_ATTENTION_LIMIT): Promise<AttentionItem[]> {
  return getNeedsAttentionAt(new Date(), limit);
}
