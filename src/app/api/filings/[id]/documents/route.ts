import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { makeKey, put } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const maxDuration = 30;

const MAX_DOCUMENTS = 20;
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

type Detected = { ext: "pdf" | "png" | "jpg"; contentType: string };

function detectType(bytes: Uint8Array): Detected | null {
  if (
    bytes.length > 5 &&
    bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d
  ) {
    return { ext: "pdf", contentType: "application/pdf" };
  }
  if (
    bytes.length > 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return { ext: "png", contentType: "image/png" };
  }
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  return null;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const documents = await prisma.filingDocument.findMany({
    where: { filingId: filing.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, fileName: true, size: true, createdAt: true, uploadedBy: true },
  });

  return NextResponse.json({ documents });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existingCount = await prisma.filingDocument.count({
    where: { filingId: filing.id },
  });
  if (existingCount >= MAX_DOCUMENTS) {
    return NextResponse.json({ error: "Document limit reached" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — max 10 MB` },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectType(bytes);
  if (!detected) {
    return NextResponse.json(
      { error: "Only PDF, PNG or JPG files are accepted." },
      { status: 400 },
    );
  }

  const rawFileName = (file as File).name || "document";
  const fileName = rawFileName.trim().slice(0, 200) || "document";
  const key = makeKey(["documents", filing.id, `${Date.now()}_${rawFileName}`]);

  try {
    await put(key, bytes, detected.contentType);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[documents] storage put failed", { filingId: filing.id, error: msg });
    return NextResponse.json({ error: `Failed to save document: ${msg}` }, { status: 500 });
  }

  const document = await prisma.filingDocument.create({
    data: {
      filingId: filing.id,
      fileKey: key,
      fileName,
      size: bytes.byteLength,
      contentType: detected.contentType,
      uploadedBy: "customer",
    },
    select: { id: true, fileName: true, size: true, createdAt: true },
  });

  return NextResponse.json({ document });
}
