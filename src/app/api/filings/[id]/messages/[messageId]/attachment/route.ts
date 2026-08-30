import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedFiling } from "@/lib/session";
import { publicUrl } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseAs(req: Request): "admin" | "customer" | null {
  const v = new URL(req.url).searchParams.get("as");
  return v === "admin" || v === "customer" ? v : null;
}

async function canReadFiling(filingId: string, requestedAs: "admin" | "customer" | null): Promise<boolean> {
  const tryAdmin = requestedAs === null || requestedAs === "admin";
  const tryCustomer = requestedAs === null || requestedAs === "customer";

  if (tryAdmin && (await isAdmin())) {
    const filing = await prisma.filing.findUnique({
      where: { id: filingId },
      select: { id: true },
    });
    if (!filing) return false;
    return true;
  }
  if (tryCustomer) {
    const owned = await getOwnedFiling(filingId);
    if (!owned) return false;
    return true;
  }
  return false;
}

export async function GET(
  req: Request,
  { params }: { params: { id: string; messageId: string } },
) {
  if (!(await canReadFiling(params.id, parseAs(req)))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = await prisma.message.findFirst({
    where: { id: params.messageId, filingId: params.id },
  });
  if (!message?.attachmentKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.redirect(await publicUrl(message.attachmentKey), 302);
}
