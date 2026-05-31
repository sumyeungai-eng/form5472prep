import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import type { EinStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { status, adminNotes, ein } = body as Record<string, string>;

  const app = await prisma.einApplication.update({
    where: { id: params.id },
    data: {
      ...(status ? { status: status as EinStatus } : {}),
      ...(adminNotes !== undefined ? { adminNotes: adminNotes || null } : {}),
      ...(ein !== undefined ? { ein: ein || null } : {}),
    },
  });

  return NextResponse.json({ ok: true, status: app.status });
}
