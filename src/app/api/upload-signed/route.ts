import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { putPdf } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const formData = await req.formData();
  const filingId = formData.get("filingId");
  const file = formData.get("file");

  if (typeof filingId !== "string" || !(file instanceof Blob))
    return NextResponse.json({ error: "filingId + file required" }, { status: 400 });

  const filing = await getOwnedFiling(filingId);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const key = `${filing.id}_signed.pdf`;
  await putPdf(key, bytes);

  await prisma.filing.update({
    where: { id: filing.id },
    data: { signedPdfKey: key, status: "SIGNED_UPLOADED" },
  });

  return NextResponse.json({ key });
}
