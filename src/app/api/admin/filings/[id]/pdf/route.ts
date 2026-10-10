import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { getPdf } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only counterpart to /api/filings/[id]/pdf (which is ownership-gated
// to the customer's session). Used by the place-signature page to render
// the unsigned PDF for click-to-place. ?signed=1 returns the signed PDF if
// one exists (for previewing after embedding). ?download=1 sends it as a
// file download with a readable name instead of opening it in the browser.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    select: { generatedPdfKey: true, signedPdfKey: true, faxedPdfKey: true, llcName: true, taxYears: true },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });

  const url = new URL(req.url);
  const wantSigned = url.searchParams.get("signed") === "1";
  const wantFaxed = url.searchParams.get("faxed") === "1";
  let key: string | null;
  let missingLabel: string;
  if (wantFaxed) {
    key = filing.faxedPdfKey;
    missingLabel = "no faxed PDF snapshot on file (faxing predates the snapshot feature, or fax hasn't been sent yet)";
  } else if (wantSigned) {
    key = filing.signedPdfKey;
    missingLabel = "no signed PDF on file";
  } else {
    key = filing.generatedPdfKey;
    missingLabel = "no unsigned PDF on file";
  }
  if (!key) {
    return NextResponse.json({ error: missingLabel }, { status: 404 });
  }

  const bytes = await getPdf(key);
  const download = url.searchParams.get("download") === "1";
  const kind = wantFaxed ? "faxed" : wantSigned ? "signed" : "unsigned";
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": download
        ? `attachment; filename="${downloadFileName(filing.llcName, filing.taxYears, kind)}"`
        : `inline; filename="${key}"`,
      "Cache-Control": "no-store",
    },
  });
}

// e.g. "Form5472_Acme-Holdings-LLC_2024-2025_unsigned.pdf" — ASCII only, so
// the header is always valid whatever the LLC name contains.
export function downloadFileName(llcName: string | null, taxYears: number[], kind: string): string {
  const name = (llcName ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // drop accents: "Ñ" → "N", not "N-"
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const years = taxYears.length > 0 ? taxYears.join("-") : "";
  return ["Form5472", name || "filing", years, kind].filter(Boolean).join("_") + ".pdf";
}
