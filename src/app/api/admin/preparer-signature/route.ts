import { NextResponse } from "next/server";
import { getAdminPrincipal } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { get as getStorageObject } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The signed-in admin's OWN saved preparer signature (Form 1120 "Paid
// Preparer Use Only" box). GET returns the PNG (404 when none saved);
// DELETE forgets it. Scoped to the caller — one admin can't read another's.
export async function GET(req: Request) {
  const principal = await getAdminPrincipal(req).catch(() => null);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!principal.adminId) return NextResponse.json({ error: "no saved signature" }, { status: 404 });
  const admin = await prisma.admin.findUnique({
    where: { id: principal.adminId },
    select: { preparerSignatureKey: true },
  });
  if (!admin?.preparerSignatureKey) return NextResponse.json({ error: "no saved signature" }, { status: 404 });
  const bytes = await getStorageObject(admin.preparerSignatureKey);
  return new NextResponse(Buffer.from(bytes), {
    headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
  });
}

export async function DELETE(req: Request) {
  const principal = await getAdminPrincipal(req).catch(() => null);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!principal.adminId) return NextResponse.json({ ok: true });
  await prisma.admin.update({ where: { id: principal.adminId }, data: { preparerSignatureKey: null } });
  return NextResponse.json({ ok: true });
}
