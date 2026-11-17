import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PAID_FILING_STATUSES } from "./traffic";

export type RangeKey = "7d" | "28d" | "90d";
export const CHANNEL_GROUPS = ["Google search", "Other search", "AI engines", "Paid ads", "Social", "Referral", "Direct", "Other"] as const;
export type ChannelGroup = typeof CHANNEL_GROUPS[number];

export function channelGroup(source: string | null): ChannelGroup {
  if (source === "google-organic") return "Google search";
  if (source?.endsWith("-organic")) return "Other search";
  if (source?.endsWith("-ai")) return "AI engines";
  if (source?.endsWith("-ads")) return "Paid ads";
  if (source === "meta-social") return "Social";
  if (source === "referral") return "Referral";
  if (source === "direct" || source === null) return "Direct";
  return "Other";
}

export function aiEngine(source: string | null): string | null {
  const engines: Record<string, string> = {
    "chatgpt-ai": "ChatGPT", "perplexity-ai": "Perplexity", "gemini-ai": "Gemini",
    "copilot-ai": "Copilot", "claude-ai": "Claude", "grok-ai": "Grok",
    "metaai-ai": "Meta AI", "you-ai": "You.com",
  };
  // Preserve unknown engines in the AI table without guessing their brand name.
  return engines[source ?? ""] ?? (source?.endsWith("-ai") ? "Other AI" : null);
}

export function percentChange(current: number, previous: number): number | null {
  // No finite percentage exists from zero; the UI displays this as "New".
  return previous === 0 ? (current === 0 ? null : Infinity) : (current - previous) / previous * 100;
}

type Metric = { current: number; previous: number; change: number | null };
type SourcePeriod = { source: string | null; current: boolean; visitors: number; views: number };
type FilingPeriod = { source: string | null; current: boolean; started: number; paid: number; revenue: number };
type DailySource = { day: string; source: string | null; visitors: number; views: number };
type DailyGroup = { day: string } & Record<ChannelGroup, number>;
type SourceStats = { visitors: number; prevVisitors: number; startedFilings: number; paidFilings: number };
const blankStats = (): SourceStats => ({ visitors: 0, prevVisitors: 0, startedFilings: 0, paidFilings: 0 });
const metric = (current: number, previous: number): Metric => ({ current, previous, change: percentChange(current, previous) });
const DAY = 86_400_000;

/** N UTC calendar days including today up to now; previous is the N days before
 * that UTC start. All boundaries are half-open. Previous traffic can be incomplete
 * because retention is 90 days. Traffic counts require both bot flags to be false.
 * Unlinked/expired visitor records on orders are retained; EIN/ITIN have no bot flag.
 */
export async function getTrafficOverview(range: RangeKey, now = new Date()) {
  const days = Number.parseInt(range, 10);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start = new Date(today - (days - 1) * DAY);
  const previousStart = new Date(start.getTime() - days * DAY);
  const [dailyRows, trafficRows, filingRows, applicationRows, topLanding, topPages, countries, devices] = await Promise.all([
    prisma.$queryRaw<DailySource[]>`
      SELECT to_char(date_trunc('day', p."createdAt" AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
        v."attrSource" AS source, COUNT(DISTINCT p."visitorId")::int AS visitors, COUNT(*)::int AS views
      FROM "PageView" p JOIN "Visitor" v ON v.id = p."visitorId"
      WHERE p."createdAt" >= ${start} AND p."createdAt" < ${now} AND p."isBot" = false AND v."isBot" = false
      GROUP BY day, v."attrSource" ORDER BY day
    `,
    prisma.$queryRaw<SourcePeriod[]>`
      SELECT v."attrSource" AS source, (p."createdAt" >= ${start}) AS current,
        COUNT(DISTINCT p."visitorId")::int AS visitors, COUNT(*)::int AS views
      FROM "PageView" p JOIN "Visitor" v ON v.id = p."visitorId"
      WHERE p."createdAt" >= ${previousStart} AND p."createdAt" < ${now} AND p."isBot" = false AND v."isBot" = false
      GROUP BY source, current
    `,
    prisma.$queryRaw<FilingPeriod[]>`
      SELECT source, current, SUM(started)::int AS started, SUM(paid)::int AS paid, SUM(revenue)::float8 AS revenue
      FROM (
        SELECT f."attrSource" AS source, (f."createdAt" >= ${start}) AS current,
          COUNT(*)::int AS started, 0 AS paid, 0 AS revenue
        FROM "Filing" f LEFT JOIN "Visitor" v ON v.id = f."visitorId"
        WHERE f."createdAt" >= ${previousStart} AND f."createdAt" < ${now}
          AND f."linkedToFilingId" IS NULL AND (v.id IS NULL OR v."isBot" = false)
        GROUP BY source, current
        UNION ALL
        SELECT f."attrSource" AS source, (f."paidAt" >= ${start}) AS current,
          0 AS started, COUNT(*)::int AS paid, COALESCE(SUM(f."amountPaid"), 0)::float8 AS revenue
        FROM "Filing" f LEFT JOIN "Visitor" v ON v.id = f."visitorId"
        WHERE f."paidAt" >= ${previousStart} AND f."paidAt" < ${now}
          AND f."linkedToFilingId" IS NULL AND (v.id IS NULL OR v."isBot" = false)
          AND f.status::text IN (${Prisma.join([...PAID_FILING_STATUSES])})
        GROUP BY source, current
      ) orders GROUP BY source, current
    `,
    prisma.$queryRaw<{ current: boolean; paid: number; revenue: number }[]>`
      SELECT ("paidAt" >= ${start}) AS current, COUNT(*)::int AS paid,
        COALESCE(SUM("amountPaid"), 0)::float8 AS revenue
      FROM (
        SELECT "paidAt", "amountPaid" FROM "EinApplication" WHERE "paidAt" >= ${previousStart} AND "paidAt" < ${now}
        UNION ALL
        SELECT "paidAt", "amountPaid" FROM "ItinApplication" WHERE "paidAt" >= ${previousStart} AND "paidAt" < ${now}
      ) applications GROUP BY current
    `,
    prisma.$queryRaw<{ path: string; visitors: number }[]>`
      SELECT COALESCE(NULLIF(split_part("attrLanding", '?', 1), ''), '(unknown)') AS path, COUNT(*)::int AS visitors
      FROM "Visitor" WHERE "firstSeenAt" >= ${start} AND "firstSeenAt" < ${now} AND "isBot" = false
      GROUP BY path ORDER BY visitors DESC, path LIMIT 10
    `,
    prisma.$queryRaw<{ path: string; views: number; prevViews: number }[]>`
      SELECT split_part(p.path, '?', 1) AS path,
        COUNT(*) FILTER (WHERE p."createdAt" >= ${start})::int AS views,
        COUNT(*) FILTER (WHERE p."createdAt" < ${start})::int AS "prevViews"
      FROM "PageView" p JOIN "Visitor" v ON v.id = p."visitorId"
      WHERE p."createdAt" >= ${previousStart} AND p."createdAt" < ${now} AND p."isBot" = false AND v."isBot" = false
      GROUP BY split_part(p.path, '?', 1) HAVING (COUNT(*) FILTER (WHERE p."createdAt" >= ${start}))::int > 0
      ORDER BY views DESC, path LIMIT 10
    `,
    prisma.$queryRaw<{ country: string; visitors: number }[]>`
      SELECT COALESCE(v.country, '(unknown)') AS country, COUNT(DISTINCT p."visitorId")::int AS visitors
      FROM "PageView" p JOIN "Visitor" v ON v.id = p."visitorId"
      WHERE p."createdAt" >= ${start} AND p."createdAt" < ${now} AND p."isBot" = false AND v."isBot" = false
      GROUP BY v.country ORDER BY visitors DESC, country LIMIT 10
    `,
    prisma.$queryRaw<{ device: string; views: number }[]>`
      SELECT COALESCE(p.device, '(unknown)') AS device, COUNT(*)::int AS views
      FROM "PageView" p JOIN "Visitor" v ON v.id = p."visitorId"
      WHERE p."createdAt" >= ${start} AND p."createdAt" < ${now} AND p."isBot" = false AND v."isBot" = false
      GROUP BY p.device ORDER BY views DESC, device
    `,
  ]);

  const daily = Array.from({ length: days }, (_, i) => ({ day: new Date(start.getTime() + i * DAY).toISOString().slice(0, 10), visitors: 0, views: 0 }));
  const dailyByGroup: DailyGroup[] = daily.map(({ day }) => ({ day, ...Object.fromEntries(CHANNEL_GROUPS.map(group => [group, 0])) } as DailyGroup));
  const dayIndex = new Map(daily.map((row, i) => [row.day, i]));
  for (const row of dailyRows) {
    const i = dayIndex.get(row.day);
    if (i === undefined) continue;
    daily[i].visitors += Number(row.visitors);
    daily[i].views += Number(row.views);
    dailyByGroup[i][channelGroup(row.source)] += Number(row.visitors);
  }
  const groups = new Map(CHANNEL_GROUPS.map(group => [group, blankStats()]));
  const engines = new Map<string, SourceStats>();
  const statsFor = (source: string | null) => {
    const stats = [groups.get(channelGroup(source))!];
    const engine = aiEngine(source);
    if (engine) {
      if (!engines.has(engine)) engines.set(engine, blankStats());
      stats.push(engines.get(engine)!);
    }
    return stats;
  };
  const current = { visitors: 0, views: 0, startedFilings: 0, paidFilings: 0, paidEinItin: 0, revenueCents: 0 };
  const previous = { ...current };
  for (const row of trafficRows) {
    const totals = row.current ? current : previous;
    totals.visitors += Number(row.visitors);
    totals.views += Number(row.views);
    for (const stats of statsFor(row.source)) stats[row.current ? "visitors" : "prevVisitors"] += Number(row.visitors);
  }
  for (const row of filingRows) {
    const totals = row.current ? current : previous;
    totals.startedFilings += Number(row.started);
    totals.paidFilings += Number(row.paid);
    totals.revenueCents += Number(row.revenue);
    if (row.current) for (const stats of statsFor(row.source)) {
      stats.startedFilings += Number(row.started);
      stats.paidFilings += Number(row.paid);
    }
  }
  for (const row of applicationRows) {
    const totals = row.current ? current : previous;
    totals.paidEinItin += Number(row.paid);
    totals.revenueCents += Number(row.revenue);
  }
  const conversion = (totals: typeof current) => totals.visitors ? totals.paidFilings / totals.visitors : 0;
  return {
    daily, dailyByGroup,
    totals: {
      visitors: metric(current.visitors, previous.visitors), views: metric(current.views, previous.views),
      startedFilings: metric(current.startedFilings, previous.startedFilings), paidFilings: metric(current.paidFilings, previous.paidFilings),
      paidEinItin: metric(current.paidEinItin, previous.paidEinItin), revenueCents: metric(current.revenueCents, previous.revenueCents),
      conversion: metric(conversion(current), conversion(previous)),
    },
    byGroup: Array.from(groups, ([group, stats]) => ({ group, ...stats, conv: stats.visitors ? stats.paidFilings / stats.visitors : 0 })).sort((a, b) => b.visitors - a.visitors),
    aiEngines: Array.from(engines, ([engine, stats]) => ({ engine, ...stats })).sort((a, b) => b.visitors - a.visitors),
    topLanding: topLanding.map(row => ({ ...row, visitors: Number(row.visitors) })),
    topPages: topPages.map(row => ({ ...row, views: Number(row.views), prevViews: Number(row.prevViews) })),
    countries: countries.map(row => ({ ...row, visitors: Number(row.visitors) })),
    devices: devices.map(row => ({ ...row, views: Number(row.views) })),
  };
}
