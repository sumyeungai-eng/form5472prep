import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { del, publicUrl } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string; docId: string } },
) {
  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = await prisma.filingDocument.findFirst({
    where: { id: params.docId, filingId: filing.id },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.redirect(await publicUrl(doc.fileKey), 302);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; docId: string } },
) {
  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = await prisma.filingDocument.findFirst({
    where: { id: params.docId, filingId: filing.id },
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.uploadedBy !== "customer") {
    return NextResponse.json({ error: "Only customer-uploaded documents can be removed" }, { status: 403 });
  }

  await prisma.filingDocument.delete({ where: { id: doc.id } });

  try {
    await del(doc.fileKey);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[documents] storage delete failed", { filingId: filing.id, documentId: doc.id, error: msg });
  }

  return NextResponse.json({ ok: true });
}
