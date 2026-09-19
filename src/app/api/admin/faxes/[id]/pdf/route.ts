import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { get } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const fax = await prisma.receivedFax.findUnique({ where: { id: params.id } });
  if (!fax?.pdfKey) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const bytes = await get(fax.pdfKey);

  const body = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(body).set(bytes);

  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="fax-${fax.id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
