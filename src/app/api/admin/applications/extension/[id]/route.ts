import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { isExtensionStatus } from "@/lib/form7004";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { status, adminNotes } = body as { status?: unknown; adminNotes?: unknown };
  if (status !== undefined && !isExtensionStatus(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (adminNotes !== undefined && typeof adminNotes !== "string") {
    return NextResponse.json({ error: "Invalid notes" }, { status: 400 });
  }

  const app = await prisma.extensionApplication.update({
    where: { id: params.id },
    data: {
      ...(status ? { status } : {}),
      ...(adminNotes !== undefined ? { adminNotes: adminNotes.trim().slice(0, 5000) || null } : {}),
    },
  });

  return NextResponse.json({ ok: true, status: app.status });
}
