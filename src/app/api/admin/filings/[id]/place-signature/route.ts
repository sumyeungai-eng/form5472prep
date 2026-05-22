import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { get as getStorageObject, putPdf } from "@/lib/storage";
import { embedSignatureIntoPdf } from "@/lib/pdf/embedSignature";
import type { SignatureLocation } from "@/lib/pdf/generatePackage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Placement = {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
};

// Admin-only: takes admin-chosen placements (one per signature), embeds the
// stored customer signature PNG into the unsigned PDF at those coords, and
// saves the result as the signed PDF. Bumps status to SIGNED_UPLOADED so
// the existing "Send fax to IRS" button enables.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    select: { id: true, generatedPdfKey: true, signaturePngKey: true },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });
  if (!filing.generatedPdfKey) {
    return NextResponse.json({ error: "no unsigned PDF on file — regenerate first" }, { status: 400 });
  }
  if (!filing.signaturePngKey) {
    return NextResponse.json({ error: "customer hasn't drawn a signature yet" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { placements?: unknown };
  if (!Array.isArray(body.placements) || body.placements.length === 0) {
    return NextResponse.json({ error: "placements array required" }, { status: 400 });
  }

  // Validate every placement before doing any work — partial application
  // would write a half-signed PDF to storage. Pages are 1-based; coords are
  // PDF points with bottom-left origin (matches pdf-lib).
  const placements: Placement[] = [];
  for (const raw of body.placements as unknown[]) {
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "placement entry must be an object" }, { status: 400 });
    }
    const p = raw as Record<string, unknown>;
    const page = Number(p.page);
    const x = Number(p.x);
    const y = Number(p.y);
    const width = Number(p.width);
    const height = Number(p.height);
    if (!Number.isFinite(page) || page < 1) {
      return NextResponse.json({ error: `bad page ${p.page}` }, { status: 400 });
    }
    if ([x, y, width, height].some((n) => !Number.isFinite(n))) {
      return NextResponse.json({ error: "x/y/width/height must be numbers" }, { status: 400 });
    }
    if (width <= 0 || height <= 0 || width > 612 || height > 200) {
      return NextResponse.json({ error: "width/height out of range" }, { status: 400 });
    }
    placements.push({
      page: Math.round(page),
      x,
      y,
      width,
      height,
      label: typeof p.label === "string" ? p.label : undefined,
    });
  }

  const [pdfBytes, pngBytes] = await Promise.all([
    getStorageObject(filing.generatedPdfKey),
    getStorageObject(filing.signaturePngKey),
  ]);

  // Reuse the existing embed library by adapting placements to its
  // SignatureLocation shape (label is required by the type but ignored
  // when coords are explicit).
  const locations: SignatureLocation[] = placements.map((p, i) => ({
    label: p.label ?? `Placement ${i + 1}`,
    page: p.page,
    instruction: "admin-placed",
    x: p.x,
    y: p.y,
    width: p.width,
    height: p.height,
  }));

  let signed;
  try {
    signed = await embedSignatureIntoPdf(pdfBytes, pngBytes, locations);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[place-signature] embed failed", { filingId: filing.id, error: msg });
    return NextResponse.json({ error: `Embed failed: ${msg}` }, { status: 500 });
  }

  const key = `${filing.id}_signed.pdf`;
  await putPdf(key, signed.bytes);
  await prisma.filing.update({
    where: { id: filing.id },
    data: {
      signedPdfKey: key,
      signedAt: new Date(),
      status: "SIGNED_UPLOADED",
    },
  });

  return NextResponse.json({
    ok: true,
    pagesSigned: signed.pagesSigned,
    signedKey: key,
    bytes: signed.bytes.length,
  });
}
