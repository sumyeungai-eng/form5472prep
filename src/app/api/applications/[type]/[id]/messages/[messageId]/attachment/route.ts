import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { getOwnedEinApplication, getOwnedItinApplication } from "@/lib/session";
import { publicUrl } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApplicationType = "ein" | "itin";

function parseType(value: string): ApplicationType | null {
  return value === "ein" || value === "itin" ? value : null;
}

function parseAs(req: Request): "admin" | "customer" | null {
  const v = new URL(req.url).searchParams.get("as");
  return v === "admin" || v === "customer" ? v : null;
}

async function applicationExists(type: ApplicationType, id: string): Promise<boolean> {
  if (type === "ein") {
    const application = await prisma.einApplication.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!application;
  }

  const application = await prisma.itinApplication.findUnique({
    where: { id },
    select: { id: true },
  });
  return !!application;
}

async function canReadApplication(
  type: ApplicationType,
  id: string,
  requestedAs: "admin" | "customer" | null,
): Promise<boolean> {
  const tryAdmin = requestedAs === null || requestedAs === "admin";
  const tryCustomer = requestedAs === null || requestedAs === "customer";

  if (tryAdmin && (await isAdmin())) {
    return applicationExists(type, id);
  }
  if (tryCustomer) {
    const owned =
      type === "ein"
        ? await getOwnedEinApplication(id)
        : await getOwnedItinApplication(id);
    if (!owned) return false;
    return true;
  }
  return false;
}

function messageWhere(type: ApplicationType, id: string, messageId: string) {
  return type === "ein"
    ? { id: messageId, einApplicationId: id }
    : { id: messageId, itinApplicationId: id };
}

export async function GET(
  req: Request,
  { params }: { params: { type: string; id: string; messageId: string } },
) {
  const type = parseType(params.type);
  if (!type || !(await canReadApplication(type, params.id, parseAs(req)))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = await prisma.message.findFirst({
    where: messageWhere(type, params.id, params.messageId),
  });
  if (!message?.attachmentKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.redirect(await publicUrl(message.attachmentKey), 302);
}
