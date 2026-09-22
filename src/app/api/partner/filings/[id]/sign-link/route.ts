import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPartner } from "@/lib/partner/auth";
import { bindFilingToEmail } from "@/lib/session";
import { createFilingInvite } from "@/lib/filingInvite";

export const runtime = "nodejs";

const REVIEW_PENDING_MESSAGE = "Your forms are still being reviewed. We will email you when they are ready to sign.";
const REVIEW_GATE_GRANDFATHERED_STATUSES = new Set([
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
  "FAILED",
]);

// Partner requests the client's secure sign link WITHOUT emailing it, so the
// partner can paste it into their own message to the client. Same auth,
// ownership and readiness guards as send-sign-link/route.ts, minus the send.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const partner = await getCurrentPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid client email required" }, { status: 400 });
  }

  const filing = await prisma.filing.findUnique({ where: { id: params.id } });
  if (!filing || filing.partnerId !== partner.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!filing.generatedPdfKey) {
    return NextResponse.json(
      { error: "Generate the filing PDF first (finish the wizard and pay), then copy the sign link." },
      { status: 409 },
    );
  }
  if (!filing.reviewApprovedAt && !REVIEW_GATE_GRANDFATHERED_STATUSES.has(filing.status)) {
    return NextResponse.json({ error: REVIEW_PENDING_MESSAGE }, { status: 409 });
  }
  if (filing.signaturePngKey || filing.signedPdfKey) {
    return NextResponse.json({ error: "This filing has already been signed." }, { status: 409 });
  }

  // Keep the client bound to this filing for later portal access, but the
  // copied link itself is scoped to this one filing and purpose.
  await bindFilingToEmail(filing.id, email);
  const { url } = await createFilingInvite(filing.id, "sign", email);

  return NextResponse.json({ url });
}
