import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { linkData, type FaxLinkTarget } from "@/lib/inboundFax";
import { prisma } from "@/lib/prisma";
import { del } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const fax = await prisma.receivedFax.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!fax) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }
  if (!isRecord(body) || typeof body.action !== "string") {
    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  }

  if (body.action === "read") {
    await prisma.receivedFax.update({ where: { id: params.id }, data: { readAt: new Date() } });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "unread") {
    await prisma.receivedFax.update({ where: { id: params.id }, data: { readAt: null } });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "archive") {
    await prisma.receivedFax.update({ where: { id: params.id }, data: { archivedAt: new Date() } });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "unarchive") {
    await prisma.receivedFax.update({ where: { id: params.id }, data: { archivedAt: null } });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "note") {
    if (typeof body.note !== "string") {
      return NextResponse.json({ error: "invalid action" }, { status: 400 });
    }
    const note = body.note.trim();
    if (note.length > 1000) {
      return NextResponse.json({ error: "note too long" }, { status: 400 });
    }
    await prisma.receivedFax.update({ where: { id: params.id }, data: { note: note.length > 0 ? note : null } });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "link") {
    const target = parseTarget(body.target);
    if (target === undefined) {
      return NextResponse.json({ error: "invalid action" }, { status: 400 });
    }
    if (target !== null) {
      const found = await targetExists(target);
      if (!found) return NextResponse.json({ error: "record not found" }, { status: 404 });
    }
    await prisma.receivedFax.update({ where: { id: params.id }, data: linkData(target) });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "invalid action" }, { status: 400 });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const fax = await prisma.receivedFax.findUnique({
    where: { id: params.id },
    select: { id: true, pdfKey: true },
  });
  if (!fax) return NextResponse.json({ error: "not found" }, { status: 404 });

  await prisma.receivedFax.delete({ where: { id: fax.id } });
  if (fax.pdfKey) {
    try {
      await del(fax.pdfKey);
    } catch {}
  }
  return NextResponse.json({ ok: true });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTarget(value: unknown): FaxLinkTarget | undefined {
  if (value === null) return null;
  if (!isRecord(value)) return undefined;
  if (
    (value.type === "ein" || value.type === "itin" || value.type === "filing") &&
    typeof value.id === "string" &&
    value.id.trim().length > 0
  ) {
    return { type: value.type, id: value.id };
  }
  return undefined;
}

async function targetExists(target: Exclude<FaxLinkTarget, null>): Promise<boolean> {
  if (target.type === "ein") {
    const found = await prisma.einApplication.findUnique({ where: { id: target.id }, select: { id: true } });
    return !!found;
  }
  if (target.type === "itin") {
    const found = await prisma.itinApplication.findUnique({ where: { id: target.id }, select: { id: true } });
    return !!found;
  }
  const found = await prisma.filing.findUnique({ where: { id: target.id }, select: { id: true } });
  return !!found;
}
