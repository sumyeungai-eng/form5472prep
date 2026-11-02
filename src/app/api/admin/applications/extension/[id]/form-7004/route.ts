import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { extensionFaxedKey, extensionFormKey } from "@/lib/fax/extension";
import { form7004Warnings, generateForm7004 } from "@/lib/pdf/form7004";
import { prisma } from "@/lib/prisma";
import { get, put } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST: generate Form 7004 from the order and store it as <id>_7004.pdf.
// Missing data still generates; the warnings tell staff what to fix.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const app = await prisma.extensionApplication.findUnique({
    where: { id: params.id },
    select: { llcName: true, ein: true, llcStreet: true, llcCity: true, llcState: true, llcZip: true, taxYear: true },
  });
  if (!app) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const key = extensionFormKey(params.id);
  try {
    await put(key, await generateForm7004(app), "application/pdf");
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: `Could not generate the form: ${message}` }, { status: 500 });
  }
  // Recorded only if the printed fields are still what the PDF was built from.
  const generatedAt = new Date();
  const saved = await prisma.extensionApplication.updateMany({
    where: { id: params.id, ...app },
    data: { generatedPdfKey: key, generatedAt },
  });
  if (saved.count !== 1) {
    return NextResponse.json({ error: "The order changed while the form was being generated. Generate it again." }, { status: 409 });
  }
  return NextResponse.json({ ok: true, generatedAt: generatedAt.toISOString(), warnings: form7004Warnings(app) });
}

// GET: the generated form (default), ?doc=faxed (the exact bytes faxed) or
// ?doc=receipt (the fax transmission receipt). Admin only, never cached.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const app = await prisma.extensionApplication.findUnique({
    where: { id: params.id },
    select: { generatedPdfKey: true, faxJobId: true, faxConfirmationKey: true },
  });
  if (!app) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const doc = new URL(req.url).searchParams.get("doc");
  const key =
    doc === "receipt" ? app.faxConfirmationKey : doc === "faxed" ? (app.faxJobId ? extensionFaxedKey(params.id) : null) : app.generatedPdfKey;
  if (!key) return NextResponse.json({ error: "No such PDF on file" }, { status: 404 });

  let bytes: Uint8Array;
  try {
    bytes = await get(key);
  } catch {
    return NextResponse.json({ error: "PDF not found in storage" }, { status: 404 });
  }
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${key}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
