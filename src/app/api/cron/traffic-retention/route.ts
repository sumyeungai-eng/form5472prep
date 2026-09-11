import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const ipCutoff = new Date(now - 30 * day);
  const deleteCutoff = new Date(now - 90 * day);

  const pageViewIpsNulled = await prisma.pageView.updateMany({
    where: { createdAt: { lt: ipCutoff }, ip: { not: null } },
    data: { ip: null },
  });
  const visitorIpsNulled = await prisma.visitor.updateMany({
    where: { lastSeenAt: { lt: ipCutoff }, ip: { not: null } },
    data: { ip: null },
  });
  const pageViewsDeleted = await prisma.pageView.deleteMany({
    where: { createdAt: { lt: deleteCutoff } },
  });
  const visitorsDeleted = await prisma.visitor.deleteMany({
    where: {
      lastSeenAt: { lt: deleteCutoff },
      userId: null,
      views: { none: {} },
    },
  });

  return NextResponse.json({
    pageViewIpsNulled: pageViewIpsNulled.count,
    visitorIpsNulled: visitorIpsNulled.count,
    pageViewsDeleted: pageViewsDeleted.count,
    visitorsDeleted: visitorsDeleted.count,
  });
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev fallback
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}
