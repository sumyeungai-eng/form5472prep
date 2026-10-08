import { NextResponse } from "next/server";
import { getAdminPrincipal } from "@/lib/admin/auth";
import { ARCHIVABLE_STATUSES, MAX_BULK_ARCHIVE } from "@/lib/admin/archive";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Bulk archive / unarchive from the admin filings list.
// POST { ids: string[], archive: boolean }
// Archive only touches drafts and finished orders (see lib/admin/archive.ts);
// in-progress orders in the selection are skipped, never hidden. Each change
// is written to the filing's change log.
export async function POST(req: Request) {
  const principal = await getAdminPrincipal(req).catch(() => null);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { ids?: unknown; archive?: unknown } | null;
  const ids = Array.isArray(body?.ids)
    ? Array.from(new Set(body!.ids.filter((x): x is string => typeof x === "string" && x.length > 0 && x.length < 64)))
    : [];
  if (ids.length === 0) return NextResponse.json({ error: "Select at least one order." }, { status: 400 });
  if (ids.length > MAX_BULK_ARCHIVE) {
    return NextResponse.json({ error: `Select at most ${MAX_BULK_ARCHIVE} orders at a time.` }, { status: 400 });
  }
  if (typeof body?.archive !== "boolean") return NextResponse.json({ error: "invalid request" }, { status: 400 });
  const archive = body.archive;

  const eligible = await prisma.filing.findMany({
    where: archive
      ? { id: { in: ids }, adminHidden: false, status: { in: [...ARCHIVABLE_STATUSES] } }
      : { id: { in: ids }, adminHidden: true },
    select: { id: true, status: true },
  });
  // One conditional update per row inside a transaction, so only rows that
  // really changed are counted and logged (a draft that became PAID a moment
  // ago fails the status condition, stays visible, and gets no log line).
  const changed = await prisma.$transaction(async (tx) => {
    const done: { id: string; status: string }[] = [];
    for (const f of eligible) {
      const res = await tx.filing.updateMany({
        where: archive
          ? { id: f.id, adminHidden: false, status: { in: [...ARCHIVABLE_STATUSES] } }
          : { id: f.id, adminHidden: true },
        data: { adminHidden: archive },
      });
      if (res.count === 1) done.push(f);
    }
    if (done.length > 0) {
      await tx.filingChangeLog.createMany({
        data: done.map((f) => ({
          filingId: f.id,
          adminId: principal.adminId,
          source: "admin",
          field: "adminHidden",
          beforeJson: { adminHidden: !archive, status: f.status },
          afterJson: { adminHidden: archive },
          reason: archive ? "Archived from the filings list" : "Unarchived from the filings list",
        })),
      });
    }
    return done.length;
  });

  return NextResponse.json({ ok: true, updated: changed, skipped: ids.length - changed });
}
