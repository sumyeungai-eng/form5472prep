import type { PageView, Prisma, Visitor } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TrafficFilters = {
  from?: Date;
  to?: Date;
  country?: string;
  source?: string;
  customersOnly?: boolean;
  includeBots?: boolean;
  q?: string;
};

export type LinkedOrder = {
  kind: "filing" | "ein" | "itin";
  id: string;
  label: string;
  status: string;
};

export type ViewRow = {
  id: string;
  createdAt: Date;
  path: string;
  referrer: string | null;
  ip: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  isBot: boolean;
  visitorId: string;
  source: string | null;
  medium: string | null;
  sessionId: string | null;
  userId: string | null;
  linked: LinkedOrder | null;
};

export type IpGroupRow = {
  ip: string;
  visitors: number;
  views: number;
  firstSeen: Date;
  lastSeen: Date;
  country: string | null;
  city: string | null;
  sources: string[];
  devices: string[];
  isBot: boolean;
  linked: LinkedOrder | null;
};

export type TrafficSummary = {
  visitorsToday: number;
  visitors7d: number;
  views7d: number;
  customers7d: number;
  topCountries: { country: string; count: number }[];
  topPages: { path: string; count: number }[];
  topSources: { source: string; count: number }[];
};

export type TrafficFilterOptions = {
  countries: string[];
  sources: string[];
};

const PAID_FILING_STATUSES = [
  "PAID",
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
] as const;

type EinLink = {
  id: string;
  userId: string | null;
  llcName: string;
  status: string;
  updatedAt: Date;
};

type ItinLink = {
  id: string;
  userId: string | null;
  fullName: string;
  status: string;
  updatedAt: Date;
};

type PaidCustomerKeys = {
  userIds: string[];
  sessionIds: string[];
};

type LinkedOrderWithUpdatedAt = LinkedOrder & {
  updatedAt: Date;
};

type LinkCandidate = {
  id: string;
  userId: string | null;
  sessionId: string | null;
};

export async function getRecentViews(
  f: TrafficFilters,
  page: number,
  pageSize = 50,
): Promise<{ rows: ViewRow[]; total: number }> {
  const where = await buildPageViewWhere(f);
  const safePage = Math.max(1, Math.floor(page) || 1);

  const [views, total] = await Promise.all([
    prisma.pageView.findMany({
      where,
      include: { visitor: { select: { attrSource: true, attrMedium: true } } },
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.pageView.count({ where }),
  ]);

  const linked = await resolveLinkedOrders(views);

  return {
    rows: views.map((view) => ({
      id: view.id,
      createdAt: view.createdAt,
      path: view.path,
      referrer: view.referrer,
      ip: view.ip,
      country: view.country,
      city: view.city,
      device: view.device,
      isBot: view.isBot,
      visitorId: view.visitorId,
      source: view.visitor.attrSource,
      medium: view.visitor.attrMedium,
      sessionId: view.sessionId,
      userId: view.userId,
      linked: linked.get(view.id) ?? null,
    })),
    total,
  };
}

export async function getIpGroups(
  f: TrafficFilters,
  page: number,
  pageSize = 50,
): Promise<{ rows: IpGroupRow[]; total: number; ungroupedViews: number }> {
  const where = await buildPageViewWhere(f);
  const groupedWhere = andPageViewWhere(where, { ip: { not: null } });
  const safePage = Math.max(1, Math.floor(page) || 1);

  const [groups, totalGroups, ungroupedViews] = await Promise.all([
    prisma.pageView.groupBy({
      by: ["ip"],
      where: groupedWhere,
      _count: { _all: true },
      _min: { createdAt: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.pageView.groupBy({
      by: ["ip"],
      where: groupedWhere,
      _count: { _all: true },
    }),
    prisma.pageView.count({ where: andPageViewWhere(where, { ip: null }) }),
  ]);

  const ips = groups.map((group) => group.ip).filter((ip): ip is string => Boolean(ip));
  if (ips.length === 0) {
    return { rows: [], total: totalGroups.length, ungroupedViews };
  }

  const pageWhere = andPageViewWhere(where, { ip: { in: ips } });
  const [visitorGroups, countryGroups, cityGroups, deviceGroups, linkKeyGroups] = await Promise.all([
    prisma.pageView.groupBy({
      by: ["ip", "visitorId"],
      where: pageWhere,
      _count: { _all: true },
    }),
    prisma.pageView.groupBy({
      by: ["ip", "country"],
      where: andPageViewWhere(pageWhere, { country: { not: null } }),
      _max: { createdAt: true },
    }),
    prisma.pageView.groupBy({
      by: ["ip", "city"],
      where: andPageViewWhere(pageWhere, { city: { not: null } }),
      _max: { createdAt: true },
    }),
    prisma.pageView.groupBy({
      by: ["ip", "device"],
      where: andPageViewWhere(pageWhere, { device: { not: null } }),
      _count: { _all: true },
    }),
    prisma.pageView.groupBy({
      by: ["ip", "userId", "sessionId"],
      where: pageWhere,
      _count: { _all: true },
    }),
  ]);

  const visitorIds = uniqueStrings(visitorGroups.map((group) => group.visitorId));
  const visitors = await prisma.visitor.findMany({
    where: { id: { in: visitorIds } },
    select: { id: true, attrSource: true, isBot: true },
  });

  const visitorById = new Map(visitors.map((visitor) => [visitor.id, visitor]));
  const groupVisitorIds = new Map<string, Set<string>>();
  for (const group of visitorGroups) {
    if (!group.ip) continue;
    const set = groupVisitorIds.get(group.ip) ?? new Set<string>();
    set.add(group.visitorId);
    groupVisitorIds.set(group.ip, set);
  }

  const sourcesByIp = new Map<string, string[]>();
  const botByIp = new Map<string, boolean>();
  for (const [ip, ids] of Array.from(groupVisitorIds.entries())) {
    const groupVisitors = Array.from(ids)
      .map((id) => visitorById.get(id))
      .filter((visitor): visitor is NonNullable<typeof visitor> => Boolean(visitor));
    const sources = uniqueStrings(groupVisitors.map((visitor) => visitor.attrSource)).sort().slice(0, 3);
    sourcesByIp.set(ip, sources);
    botByIp.set(ip, groupVisitors.length > 0 && groupVisitors.every((visitor) => visitor.isBot));
  }

  const linkedByIp = await resolveIpGroupLinks(linkKeyGroups);
  const countryByIp = mostRecentValueByIp(countryGroups, "country");
  const cityByIp = mostRecentValueByIp(cityGroups, "city");
  const devicesByIp = new Map<string, string[]>();
  for (const group of deviceGroups) {
    if (!group.ip || !group.device) continue;
    const devices = devicesByIp.get(group.ip) ?? [];
    devices.push(group.device);
    devicesByIp.set(group.ip, devices);
  }

  return {
    rows: groups.map((group) => ({
      ip: group.ip!,
      visitors: groupVisitorIds.get(group.ip!)?.size ?? 0,
      views: group._count._all,
      firstSeen: group._min.createdAt ?? group._max.createdAt ?? new Date(0),
      lastSeen: group._max.createdAt ?? group._min.createdAt ?? new Date(0),
      country: countryByIp.get(group.ip!) ?? null,
      city: cityByIp.get(group.ip!) ?? null,
      sources: sourcesByIp.get(group.ip!) ?? [],
      devices: uniqueStrings(devicesByIp.get(group.ip!) ?? []).sort(),
      isBot: botByIp.get(group.ip!) ?? false,
      linked: linkedByIp.get(group.ip!) ?? null,
    })),
    total: totalGroups.length,
    ungroupedViews,
  };
}

export async function getIpGroupDetail(ip: string): Promise<{
  ip: string;
  visitors: {
    id: string;
    firstSeenAt: Date;
    lastSeenAt: Date;
    pageViews: number;
    isBot: boolean;
    device: string | null;
    userAgent: string | null;
    source: string | null;
    medium: string | null;
    userId: string | null;
  }[];
  views: { id: string; createdAt: Date; path: string; referrer: string | null; visitorId: string; device: string | null }[];
  orders: LinkedOrder[];
  country: string | null;
  city: string | null;
} | null> {
  const visitorGroups = await prisma.pageView.groupBy({
    by: ["visitorId"],
    where: { ip },
    _count: { _all: true },
    _min: { createdAt: true },
    _max: { createdAt: true },
    orderBy: { _max: { createdAt: "desc" } },
  });
  if (visitorGroups.length === 0) return null;

  const visitorIds = visitorGroups.map((group) => group.visitorId);
  const [visitors, deviceGroups, views, countryGroups, cityGroups, linkKeyGroups] = await Promise.all([
    prisma.visitor.findMany({
      where: { id: { in: visitorIds } },
      select: {
        id: true,
        isBot: true,
        userAgent: true,
        attrSource: true,
        attrMedium: true,
        userId: true,
        lastSessionId: true,
      },
    }),
    prisma.pageView.groupBy({
      by: ["visitorId", "device"],
      where: { ip, device: { not: null } },
      _max: { createdAt: true },
    }),
    prisma.pageView.findMany({
      where: { ip },
      select: { id: true, createdAt: true, path: true, referrer: true, visitorId: true, device: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.pageView.groupBy({
      by: ["ip", "country"],
      where: { ip, country: { not: null } },
      _max: { createdAt: true },
    }),
    prisma.pageView.groupBy({
      by: ["ip", "city"],
      where: { ip, city: { not: null } },
      _max: { createdAt: true },
    }),
    prisma.pageView.groupBy({
      by: ["userId", "sessionId"],
      where: { ip },
      _count: { _all: true },
    }),
  ]);

  const visitorById = new Map(visitors.map((visitor) => [visitor.id, visitor]));
  const deviceByVisitorId = mostRecentDeviceByVisitor(deviceGroups);
  const linkCandidates: LinkCandidate[] = [
    ...linkKeyGroups.map((group, index) => ({
      id: `view-key-${index}`,
      userId: group.userId,
      sessionId: group.sessionId,
    })),
    ...visitors.map((visitor) => ({
      id: `visitor-key-${visitor.id}`,
      userId: visitor.userId,
      sessionId: visitor.lastSessionId,
    })),
  ];
  const orders = dedupeLinkedOrders(Array.from((await resolveLinkedOrdersWithUpdatedAt(linkCandidates)).values()));

  return {
    ip,
    visitors: visitorGroups.map((group) => {
      const visitor = visitorById.get(group.visitorId);
      return {
        id: group.visitorId,
        firstSeenAt: group._min.createdAt ?? group._max.createdAt ?? new Date(0),
        lastSeenAt: group._max.createdAt ?? group._min.createdAt ?? new Date(0),
        pageViews: group._count._all,
        isBot: visitor?.isBot ?? false,
        device: deviceByVisitorId.get(group.visitorId) ?? null,
        userAgent: visitor?.userAgent ?? null,
        source: visitor?.attrSource ?? null,
        medium: visitor?.attrMedium ?? null,
        userId: visitor?.userId ?? null,
      };
    }),
    views,
    orders,
    country: mostRecentValueByIp(countryGroups, "country").get(ip) ?? null,
    city: mostRecentValueByIp(cityGroups, "city").get(ip) ?? null,
  };
}

export async function getIpVisitorCounts(
  f: TrafficFilters,
  ips: string[],
): Promise<Map<string, number>> {
  const uniqueIps = uniqueStrings(ips);
  if (uniqueIps.length === 0) return new Map();

  const where = await buildPageViewWhere(f);
  const groups = await prisma.pageView.groupBy({
    by: ["ip", "visitorId"],
    where: andPageViewWhere(where, { ip: { in: uniqueIps } }),
    _count: { _all: true },
  });

  const visitorsByIp = new Map<string, Set<string>>();
  for (const group of groups) {
    if (!group.ip) continue;
    const set = visitorsByIp.get(group.ip) ?? new Set<string>();
    set.add(group.visitorId);
    visitorsByIp.set(group.ip, set);
  }

  return new Map(Array.from(visitorsByIp, ([ip, visitorIds]) => [ip, visitorIds.size]));
}

export async function getTrafficSummary(f: TrafficFilters): Promise<TrafficSummary> {
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const start7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [todayWhere, last7dWhere, rangeWhere, customer7dWhere] = await Promise.all([
    buildPageViewWhere({ ...f, from: startToday, to: now, customersOnly: false }),
    buildPageViewWhere({ ...f, from: start7d, to: now, customersOnly: false }),
    buildPageViewWhere(f),
    buildPageViewWhere({ ...f, from: start7d, to: now, customersOnly: true }),
  ]);

  const [
    visitorsToday,
    visitors7d,
    views7d,
    customers7d,
    countryGroups,
    pageGroups,
    sourceGroups,
  ] = await Promise.all([
    prisma.pageView.findMany({ where: todayWhere, distinct: ["visitorId"], select: { visitorId: true } }),
    prisma.pageView.findMany({ where: last7dWhere, distinct: ["visitorId"], select: { visitorId: true } }),
    prisma.pageView.count({ where: last7dWhere }),
    prisma.pageView.findMany({ where: customer7dWhere, distinct: ["visitorId"], select: { visitorId: true } }),
    prisma.pageView.groupBy({
      by: ["country"],
      where: { AND: [rangeWhere, { country: { not: null } }] },
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
      take: 5,
    }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: rangeWhere,
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 5,
    }),
    prisma.visitor.groupBy({
      by: ["attrSource"],
      where: buildVisitorWhereFromFilters(f),
      _count: { _all: true },
      orderBy: { _count: { attrSource: "desc" } },
      take: 5,
    }),
  ]);

  return {
    visitorsToday: visitorsToday.length,
    visitors7d: visitors7d.length,
    views7d,
    customers7d: customers7d.length,
    topCountries: countryGroups
      .filter((row) => row.country)
      .map((row) => ({ country: row.country!, count: row._count._all })),
    topPages: pageGroups.map((row) => ({ path: row.path, count: row._count._all })),
    topSources: sourceGroups
      .filter((row) => row.attrSource)
      .map((row) => ({ source: row.attrSource!, count: row._count._all })),
  };
}

export async function getTrafficFilterOptions(f: TrafficFilters): Promise<TrafficFilterOptions> {
  const base = { ...f, country: undefined, source: undefined, customersOnly: false };
  const pageViewWhere = await buildPageViewWhere(base);

  const [countries, sources] = await Promise.all([
    prisma.pageView.findMany({
      where: { AND: [pageViewWhere, { country: { not: null } }] },
      distinct: ["country"],
      select: { country: true },
      orderBy: { country: "asc" },
    }),
    prisma.visitor.findMany({
      where: buildVisitorWhereFromFilters(base),
      distinct: ["attrSource"],
      select: { attrSource: true },
      orderBy: { attrSource: "asc" },
    }),
  ]);

  return {
    countries: countries.map((row) => row.country).filter((country): country is string => Boolean(country)),
    sources: sources.map((row) => row.attrSource).filter((source): source is string => Boolean(source)),
  };
}

export async function getVisitorDetail(visitorId: string): Promise<{
  visitor: Visitor;
  views: PageView[];
  filings: { id: string; llcName: string | null; status: string; updatedAt: Date }[];
  applications: { kind: "ein" | "itin"; id: string; label: string; status: string }[];
} | null> {
  const visitor = await prisma.visitor.findFirst({
    where: { id: visitorId },
  });
  if (!visitor) return null;

  const views = await prisma.pageView.findMany({
    where: { visitorId },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  const sessionIds = uniqueStrings([visitor.lastSessionId, ...views.map((view) => view.sessionId)]);
  const filingWhere: Prisma.FilingWhereInput | null =
    visitor.userId || sessionIds.length > 0
      ? {
          OR: [
            ...(visitor.userId ? [{ userId: visitor.userId }] : []),
            ...(sessionIds.length > 0 ? [{ sessionId: { in: sessionIds } }] : []),
          ],
        }
      : null;

  const [filings, einApplications, itinApplications] = await Promise.all([
    filingWhere
      ? prisma.filing.findMany({
          where: filingWhere,
          select: { id: true, llcName: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
        })
      : Promise.resolve([]),
    visitor.userId
      ? prisma.einApplication.findMany({
          where: { userId: visitor.userId },
          select: { id: true, llcName: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
        })
      : Promise.resolve([]),
    visitor.userId
      ? prisma.itinApplication.findMany({
          where: { userId: visitor.userId },
          select: { id: true, fullName: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const applications = [
    ...einApplications.map((app) => ({
      kind: "ein" as const,
      id: app.id,
      label: app.llcName,
      status: app.status,
    })),
    ...itinApplications.map((app) => ({
      kind: "itin" as const,
      id: app.id,
      label: app.fullName,
      status: app.status,
    })),
  ];

  return { visitor, views, filings, applications };
}

async function buildPageViewWhere(f: TrafficFilters): Promise<Prisma.PageViewWhereInput> {
  const and: Prisma.PageViewWhereInput[] = [];

  if (!f.includeBots) and.push({ isBot: false });
  if (f.from || f.to) {
    and.push({ createdAt: { ...(f.from ? { gte: f.from } : {}), ...(f.to ? { lte: f.to } : {}) } });
  }
  if (f.country) and.push({ country: f.country });
  if (f.source) and.push({ visitor: { attrSource: f.source } });
  if (f.q?.trim()) {
    const q = f.q.trim();
    and.push({
      OR: [
        { path: { contains: q, mode: "insensitive" } },
        { ip: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (f.customersOnly) {
    const keys = await getPaidCustomerKeys();
    const customerOr: Prisma.PageViewWhereInput[] = [];
    if (keys.userIds.length > 0) customerOr.push({ userId: { in: keys.userIds } });
    if (keys.sessionIds.length > 0) customerOr.push({ sessionId: { in: keys.sessionIds } });
    and.push(customerOr.length > 0 ? { OR: customerOr } : { id: { in: [] } });
  }

  return and.length > 0 ? { AND: and } : {};
}

function buildVisitorWhereFromFilters(f: TrafficFilters): Prisma.VisitorWhereInput {
  const and: Prisma.VisitorWhereInput[] = [];

  if (!f.includeBots) and.push({ isBot: false });
  if (f.country) and.push({ country: f.country });
  if (f.source) and.push({ attrSource: f.source });
  if (f.q?.trim()) {
    const q = f.q.trim();
    and.push({
      OR: [
        { ip: { contains: q, mode: "insensitive" } },
        { views: { some: { path: { contains: q, mode: "insensitive" } } } },
      ],
    });
  }
  if (f.from || f.to) {
    and.push({
      views: {
        some: {
          createdAt: { ...(f.from ? { gte: f.from } : {}), ...(f.to ? { lte: f.to } : {}) },
          ...(f.includeBots ? {} : { isBot: false }),
        },
      },
    });
  }

  return and.length > 0 ? { AND: and } : {};
}

async function getPaidCustomerKeys(): Promise<PaidCustomerKeys> {
  const [filings, einApplications, itinApplications] = await Promise.all([
    prisma.filing.findMany({
      where: {
        OR: [
          { status: { in: [...PAID_FILING_STATUSES] } },
          { stripePaymentId: { not: null } },
        ],
      },
      select: { userId: true, sessionId: true },
    }),
    prisma.einApplication.findMany({
      where: {
        OR: [
          { paidAt: { not: null } },
          { stripePaymentId: { not: null } },
          { amountPaid: { gt: 0 } },
        ],
      },
      select: { userId: true },
    }),
    prisma.itinApplication.findMany({
      where: {
        OR: [
          { paidAt: { not: null } },
          { stripePaymentId: { not: null } },
          { amountPaid: { gt: 0 } },
        ],
      },
      select: { userId: true },
    }),
  ]);

  const userIds = new Set<string>();
  const sessionIds = new Set<string>();

  for (const filing of filings) {
    if (filing.userId) userIds.add(filing.userId);
    if (filing.sessionId) sessionIds.add(filing.sessionId);
  }
  for (const app of einApplications) {
    if (app.userId) userIds.add(app.userId);
  }
  for (const app of itinApplications) {
    if (app.userId) userIds.add(app.userId);
  }

  return { userIds: Array.from(userIds), sessionIds: Array.from(sessionIds) };
}

async function resolveIpGroupLinks(
  groups: { ip: string | null; userId: string | null; sessionId: string | null }[],
): Promise<Map<string, LinkedOrder>> {
  const candidates = groups
    .filter((group): group is { ip: string; userId: string | null; sessionId: string | null } => Boolean(group.ip))
    .map((group, index) => ({
      id: `ip-link-${index}`,
      ip: group.ip,
      userId: group.userId,
      sessionId: group.sessionId,
    }));
  const resolved = await resolveLinkedOrdersWithUpdatedAt(candidates);
  const byIp = new Map<string, LinkedOrderWithUpdatedAt>();

  for (const candidate of candidates) {
    const linked = resolved.get(candidate.id);
    if (!linked) continue;
    const current = byIp.get(candidate.ip);
    if (!current || linked.updatedAt > current.updatedAt) byIp.set(candidate.ip, linked);
  }

  return new Map(
    Array.from(byIp, ([ip, linked]) => [
      ip,
      { kind: linked.kind, id: linked.id, label: linked.label, status: linked.status },
    ]),
  );
}

async function resolveLinkedOrders(views: LinkCandidate[]): Promise<Map<string, LinkedOrder>> {
  const linkedWithDates = await resolveLinkedOrdersWithUpdatedAt(views);
  return new Map(
    Array.from(linkedWithDates, ([id, linked]) => [
      id,
      { kind: linked.kind, id: linked.id, label: linked.label, status: linked.status },
    ]),
  );
}

async function resolveLinkedOrdersWithUpdatedAt(views: LinkCandidate[]): Promise<Map<string, LinkedOrderWithUpdatedAt>> {
  const userIds = uniqueStrings(views.map((view) => view.userId));
  const sessionIds = uniqueStrings(views.map((view) => view.sessionId));

  if (userIds.length === 0 && sessionIds.length === 0) return new Map();

  const [filings, einApplications, itinApplications] = await Promise.all([
    prisma.filing.findMany({
      where: {
        OR: [
          ...(userIds.length > 0 ? [{ userId: { in: userIds } }] : []),
          ...(sessionIds.length > 0 ? [{ sessionId: { in: sessionIds } }] : []),
        ],
      },
      select: { id: true, userId: true, sessionId: true, llcName: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    userIds.length > 0
      ? prisma.einApplication.findMany({
          where: { userId: { in: userIds } },
          select: { id: true, userId: true, llcName: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
        })
      : Promise.resolve([]),
    userIds.length > 0
      ? prisma.itinApplication.findMany({
          where: { userId: { in: userIds } },
          select: { id: true, userId: true, fullName: true, status: true, updatedAt: true },
          orderBy: { updatedAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const filingByUser = firstBy(filings, (filing) => filing.userId);
  const filingBySession = firstBy(filings, (filing) => filing.sessionId);
  const einByUser = firstBy(einApplications, (app) => app.userId);
  const itinByUser = firstBy(itinApplications, (app) => app.userId);

  const linked = new Map<string, LinkedOrderWithUpdatedAt>();
  for (const view of views) {
    const filing = (view.userId ? filingByUser.get(view.userId) : undefined)
      ?? (view.sessionId ? filingBySession.get(view.sessionId) : undefined);
    if (filing) {
      linked.set(view.id, {
        kind: "filing",
        id: filing.id,
        label: filing.llcName || "Filing",
        status: filing.status,
        updatedAt: filing.updatedAt,
      });
      continue;
    }

    const app = mostRecentApplication(
      view.userId ? einByUser.get(view.userId) : undefined,
      view.userId ? itinByUser.get(view.userId) : undefined,
    );
    if (app) linked.set(view.id, app);
  }

  return linked;
}

function andPageViewWhere(...clauses: Prisma.PageViewWhereInput[]): Prisma.PageViewWhereInput {
  return { AND: clauses };
}

function mostRecentValueByIp<K extends "country" | "city">(
  groups: ({ ip: string | null; _max: { createdAt: Date | null } } & Record<K, string | null>)[],
  key: K,
): Map<string, string> {
  const out = new Map<string, { value: string; createdAt: Date }>();
  for (const group of groups) {
    const ip = group.ip;
    const value = group[key];
    const createdAt = group._max.createdAt;
    if (!ip || !value || !createdAt) continue;
    const current = out.get(ip);
    if (!current || createdAt > current.createdAt) out.set(ip, { value, createdAt });
  }
  return new Map(Array.from(out, ([ip, row]) => [ip, row.value]));
}

function mostRecentDeviceByVisitor(
  groups: { visitorId: string; device: string | null; _max: { createdAt: Date | null } }[],
): Map<string, string> {
  const out = new Map<string, { value: string; createdAt: Date }>();
  for (const group of groups) {
    if (!group.device || !group._max.createdAt) continue;
    const current = out.get(group.visitorId);
    if (!current || group._max.createdAt > current.createdAt) {
      out.set(group.visitorId, { value: group.device, createdAt: group._max.createdAt });
    }
  }
  return new Map(Array.from(out, ([visitorId, row]) => [visitorId, row.value]));
}

function dedupeLinkedOrders(orders: LinkedOrderWithUpdatedAt[]): LinkedOrder[] {
  const deduped = new Map<string, LinkedOrderWithUpdatedAt>();
  for (const order of orders.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())) {
    const key = `${order.kind}:${order.id}`;
    if (!deduped.has(key)) deduped.set(key, order);
  }
  return Array.from(deduped.values()).map((order) => ({
    kind: order.kind,
    id: order.id,
    label: order.label,
    status: order.status,
  }));
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function firstBy<T>(rows: T[], key: (row: T) => string | null | undefined): Map<string, T> {
  const map = new Map<string, T>();
  for (const row of rows) {
    const value = key(row);
    if (value && !map.has(value)) map.set(value, row);
  }
  return map;
}

function mostRecentApplication(ein?: EinLink, itin?: ItinLink): LinkedOrderWithUpdatedAt | null {
  if (!ein && !itin) return null;
  if (ein && (!itin || ein.updatedAt >= itin.updatedAt)) {
    return { kind: "ein", id: ein.id, label: ein.llcName, status: ein.status, updatedAt: ein.updatedAt };
  }
  return { kind: "itin", id: itin!.id, label: itin!.fullName, status: itin!.status, updatedAt: itin!.updatedAt };
}
