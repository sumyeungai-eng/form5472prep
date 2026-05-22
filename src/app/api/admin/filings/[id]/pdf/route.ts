import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { getPdf } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only counterpart to /api/filings/[id]/pdf (which is ownership-gated
// to the customer's session). Used by the place-signature page to render
// the unsigned PDF for click-to-place. ?signed=1 returns the signed PDF if
// one exists (for previewing after embedding).
export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    select: { generatedPdfKey: true, signedPdfKey: true },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });

  const url = new URL(req.url);
  const wantSigned = url.searchParams.get("signed") === "1";
  const key = wantSigned ? filing.signedPdfKey : filing.generatedPdfKey;
  if (!key) {
    return NextResponse.json(
      { error: wantSigned ? "no signed PDF on file" : "no unsigned PDF on file" },
      { status: 404 },
    );
  }

  const bytes = await getPdf(key);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${key}"`,
      "Cache-Control": "no-store",
    },
  });
}
