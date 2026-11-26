import { NextResponse } from "next/server";
import { getAdminPrincipal } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { get as getStorageObject } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The signed-in admin's OWN saved preparer signature (Form 1120 "Paid
// Preparer Use Only" box). GET returns the PNG (404 when none saved);
// DELETE forgets it. Scoped to the caller — one admin can't read another's.
// ?kind=name uses the same account-scoped storage path for the handwritten name.
function imageKind(req: Request) {
  const kind = new URL(req.url).searchParams.get("kind");
  if (kind === "name") return { key: "preparerNameKey" as const, label: "name" };
  if (kind === null || kind === "signature") return { key: "preparerSignatureKey" as const, label: "signature" };
  return null;
}

export async function GET(req: Request) {
  const image = imageKind(req);
  const principal = await getAdminPrincipal(req).catch(() => null);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!image) return NextResponse.json({ error: "unknown image kind" }, { status: 400 });
  if (!principal.adminId) return NextResponse.json({ error: `no saved ${image.label}` }, { status: 404 });
  const admin = await prisma.admin.findUnique({
    where: { id: principal.adminId },
    select: { preparerSignatureKey: true, preparerNameKey: true },
  });
  if (!admin?.[image.key]) return NextResponse.json({ error: `no saved ${image.label}` }, { status: 404 });
  const bytes = await getStorageObject(admin[image.key]!).catch(() => null);
  if (!bytes) return NextResponse.json({ error: `no saved ${image.label}` }, { status: 404 });
  return new NextResponse(Buffer.from(bytes), {
    headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
  });
}

export async function DELETE(req: Request) {
  const image = imageKind(req);
  const principal = await getAdminPrincipal(req).catch(() => null);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!image) return NextResponse.json({ error: "unknown image kind" }, { status: 400 });
  if (!principal.adminId) return NextResponse.json({ ok: true });
  await prisma.admin.update({ where: { id: principal.adminId }, data: { [image.key]: null } });
  return NextResponse.json({ ok: true });
}
