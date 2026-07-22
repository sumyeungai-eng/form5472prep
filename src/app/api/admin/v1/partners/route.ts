import { ok, withAdminAuth } from "@/lib/admin/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withAdminAuth(async () => {
  const rows = await prisma.partner.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      company: true,
      active: true,
      createdAt: true,
      _count: { select: { filings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const items = rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    company: row.company,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    filingCount: row._count.filings,
  }));

  return ok({ items });
});
