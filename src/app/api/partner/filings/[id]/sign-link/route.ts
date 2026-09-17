import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPartner } from "@/lib/partner/auth";
import { bindFilingToEmail } from "@/lib/session";
import { makeMagicLink } from "@/lib/magicLink";

export const runtime = "nodejs";

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
  if (filing.signaturePngKey || filing.signedPdfKey) {
    return NextResponse.json({ error: "This filing has already been signed." }, { status: 409 });
  }

  // Bind to the client's email so the magic link authenticates them and the
  // sign page's getOwnedFiling() ownership check passes.
  const user = await bindFilingToEmail(filing.id, email);

  // Magic link that deep-links straight to the sign page after auth. The
  // /auth/[token] route whitelists same-origin ?next= paths.
  const baseLink = makeMagicLink(user.id);
  const sep = baseLink.includes("?") ? "&" : "?";
  const signLink = `${baseLink}${sep}next=${encodeURIComponent(`/filings/${filing.id}/sign`)}`;

  return NextResponse.json({ url: signLink });
}
