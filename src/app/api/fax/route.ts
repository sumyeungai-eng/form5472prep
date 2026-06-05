import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submitFax } from "@/lib/fax";
import { publicUrl } from "@/lib/storage";
import { isAdmin } from "@/lib/admin/auth";

export const runtime = "nodejs";

// Admin-only fax submission.
//
// SECURITY: this used to be owner-accessible (getOwnedFiling), letting a
// filing owner trigger the IRS fax themselves once a signed PDF existed —
// bypassing the accountant-controlled review/submit step that's now the
// intended workflow. Faxing is driven from the admin panel
// (/api/admin/filings/[id] action "retryFax"); this route is gated to admin
// as a secondary entry point.
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filingId } = await req.json();
  const filing = await prisma.filing.findUnique({ where: { id: filingId } });
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
