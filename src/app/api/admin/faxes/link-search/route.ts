import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Result = {
  type: "ein" | "itin" | "filing";
  id: string;
  label: string;
  sublabel: string;
};

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 100) {
    return NextResponse.json({ results: [] });
  }

  const [ein, itin, filing] = await Promise.all([
    prisma.einApplication.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { fullName: { contains: q, mode: "insensitive" } },
          { llcName: { contains: q, mode: "insensitive" } },
          { id: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, fullName: true, llcName: true, status: true },
    }),
    prisma.itinApplication.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { fullName: { contains: q, mode: "insensitive" } },
          { id: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, fullName: true, status: true },
    }),
    prisma.filing.findMany({
      where: {
        OR: [
          { id: { contains: q, mode: "insensitive" } },
          { user: { email: { contains: q, mode: "insensitive" } } },
          { llcName: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, llcName: true, status: true, user: { select: { email: true } } },
    }),
  ]);

  const results: Result[] = [
    ...ein.map((app) => ({
      type: "ein" as const,
      id: app.id,
      label: app.fullName || app.llcName,
      sublabel: `EIN - ${app.email} - ${app.status}`,
    })),
    ...itin.map((app) => ({
      type: "itin" as const,
      id: app.id,
      label: app.fullName,
      sublabel: `ITIN - ${app.email} - ${app.status}`,
    })),
    ...filing.map((row) => ({
      type: "filing" as const,
      id: row.id,
      label: row.llcName || "(untitled filing)",
      sublabel: `Form 5472 - ${row.user?.email ?? "no account"} - ${row.status}`,
    })),
  ];

  return NextResponse.json({ results });
}
