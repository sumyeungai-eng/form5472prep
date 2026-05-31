import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import type { ItinStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { status, adminNotes, itin } = body as Record<string, string>;

  const app = await prisma.itinApplication.update({
    where: { id: params.id },
    data: {
      ...(status ? { status: status as ItinStatus } : {}),
      ...(adminNotes !== undefined ? { adminNotes: adminNotes || null } : {}),
      ...(itin !== undefined ? { itin: itin || null } : {}),
    },
  });

  return NextResponse.json({ ok: true, status: app.status });
}
