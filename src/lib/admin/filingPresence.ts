import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// "Is this unfinished customer still out there?" for the admin filings list.
// A DRAFT filing links to a Visitor two ways — a direct `Filing.visitorId`
// stamped at creation time (see findOrCreateDraft.ts) and, once the customer
// has an email, `Visitor.userId === Filing.userId` — so a draft started
// anonymously and later signed into still resolves to its visit history.

export type FilingPresence = {
  visitorId: string;
  lastSeenAt: Date;
  // null when retention has cleared it (30 days) — see
  // docs/sessions/2026-09-11-traffic-tracking.md.
  ip: string | null;
  city: string | null;
  country: string | null;
  // Most recent PageView.path for that visitor, if any.
  lastPath: string | null;
};

type VisitorCandidate = {
  visitorId: string;
  lastSeenAt: Date;
  ip: string | null;
  city: string | null;
  country: string | null;
};

// Pure: picks the candidate with the max lastSeenAt. lastPath is always null
// here — callers that also want lastPath fill it in from a PageView lookup.
export function pickLatest(candidates: VisitorCandidate[]): FilingPresence | null {
  if (candidates.length === 0) return null;

  let best = candidates[0];
  for (const candidate of candidates.slice(1)) {
    if (candidate.lastSeenAt.getTime() > best.lastSeenAt.getTime()) best = candidate;
  }

  return {
    visitorId: best.visitorId,
    lastSeenAt: best.lastSeenAt,
    ip: best.ip,
    city: best.city,
    country: best.country,
    lastPath: null,
  };
}

// Two fixed queries regardless of how many filings are passed in: one
// Visitor lookup (by direct link OR by shared userId), one PageView lookup
// (most recent path per chosen visitor). Returns an empty map without
// querying when there is nothing to look up.
export async function getPresenceForFilings(
  filings: Array<{ id: string; userId: string | null; visitorId: string | null }>,
): Promise<Map<string, FilingPresence>> {
  if (filings.length === 0) return new Map();

  const visitorIds = uniqueStrings(filings.map((f) => f.visitorId));
  const userIds = uniqueStrings(filings.map((f) => f.userId));
  if (visitorIds.length === 0 && userIds.length === 0) return new Map();

  const or: Prisma.VisitorWhereInput[] = [];
  if (visitorIds.length > 0) or.push({ id: { in: visitorIds } });
  if (userIds.length > 0) or.push({ userId: { in: userIds } });

  const visitors = await prisma.visitor.findMany({
    where: { OR: or },
    select: { id: true, userId: true, lastSeenAt: true, ip: true, city: true, country: true },
  });

  const presenceByFilingId = new Map<string, FilingPresence>();
  for (const filing of filings) {
    const candidates: VisitorCandidate[] = visitors
      .filter((v) => v.id === filing.visitorId || (filing.userId != null && v.userId === filing.userId))
      .map((v) => ({ visitorId: v.id, lastSeenAt: v.lastSeenAt, ip: v.ip, city: v.city, country: v.country }));
    const presence = pickLatest(candidates);
    if (presence) presenceByFilingId.set(filing.id, presence);
  }

  const chosenVisitorIds = uniqueStrings(Array.from(presenceByFilingId.values(), (p) => p.visitorId));
  if (chosenVisitorIds.length > 0) {
    const recentViews = await prisma.pageView.findMany({
      where: { visitorId: { in: chosenVisitorIds } },
      orderBy: { createdAt: "desc" },
      distinct: ["visitorId"],
      select: { visitorId: true, path: true },
    });
    const lastPathByVisitorId = new Map(recentViews.map((v) => [v.visitorId, v.path]));
    for (const [filingId, presence] of Array.from(presenceByFilingId)) {
      const lastPath = lastPathByVisitorId.get(presence.visitorId);
      if (lastPath !== undefined) presenceByFilingId.set(filingId, { ...presence, lastPath });
    }
  }

  return presenceByFilingId;
}

// Bands: <60s "just now"; <60m "Nm ago"; <24h "Nh ago"; <30d "Nd ago"; else
// an absolute YYYY-MM-DD date.
export function timeAgo(date: Date, now: Date = new Date()): string {
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;

  return date.toISOString().slice(0, 10);
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v))));
}
