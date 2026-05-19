import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { submitFax } from "@/lib/fax";
import { publicUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { filingId } = await req.json();
  const filing = await getOwnedFiling(filingId);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!filing.signedPdfKey)
    return NextResponse.json({ error: "Sign and re-upload first" }, { status: 400 });

  // submitFax falls through to the sandbox stub if TELNYX_API_KEY is unset,
  // in which case the media URL is never fetched. Only resolve a real URL
  // when going to live Telnyx (which requires R2 — see storage.ts).
  let mediaUrl = "";
  try {
    mediaUrl = await publicUrl(filing.signedPdfKey);
  } catch (err) {
    if (process.env.TELNYX_API_KEY) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Storage backend not configured" },
        { status: 500 },
      );
    }
    // Sandbox mode — placeholder URL is fine.
    mediaUrl = "https://example.com/sandbox.pdf";
  }

  const job = await submitFax({ mediaUrl });

  await prisma.filing.update({
    where: { id: filing.id },
    data: { faxJobId: job.id, faxStatus: job.status, status: "FAXED" },
  });

  return NextResponse.json(job);
}
