import { NextResponse } from "next/server";
import { getFilingAccess } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getPdf } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const access = await getFilingAccess(params.id);
  if (access.kind !== "owned") {
    return NextResponse.json({ error: "Filed PDF not available yet" }, { status: 404 });
  }
  const filing = await prisma.filing.findUnique({
    where: { id: access.filing.id },
    select: { llcName: true, taxYears: true, faxedAt: true, faxedPdfKey: true, signedPdfKey: true },
  });
  // A signed or reviewed package alone is never evidence that it was faxed.
  // Older orders lack the frozen snapshot; only those use the signed copy.
  const key = filing?.faxedPdfKey ?? filing?.signedPdfKey;
  if (!filing?.faxedAt || !key) {
    return NextResponse.json({ error: "Filed PDF not available yet" }, { status: 404 });
  }

  // downloadFileName uses a different ordering and permits & and apostrophes.
  const name = (filing.llcName ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ._-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60)
    .trim() || "LLC";
  const filename = [name, "filed Form 5472 package", filing.taxYears.join(", ")].filter(Boolean).join(" - ") + ".pdf";
  const bytes = await getPdf(key);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
