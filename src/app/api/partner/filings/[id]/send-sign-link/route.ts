import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPartner } from "@/lib/partner/auth";
import { bindFilingToEmail } from "@/lib/session";
import { makeMagicLink } from "@/lib/magicLink";
import { sendMagicLinkEmail } from "@/lib/email";

export const runtime = "nodejs";

// Partner sends their client a secure link to review + sign a filing.
//
// Flow:
//   1. Verify the partner owns this filing (filing.partnerId === partner.id).
//   2. Require the unsigned PDF to exist (PAID/PDF_GENERATED) — there's nothing
//      to sign before generation.
//   3. Bind the filing to the client's email (creates/links a User), so the
//      magic link authenticates them and the sign page's ownership check passes.
//   4. Email the client a magic link that deep-links to the sign page.
//
// The client signs as themselves (their own User identity) — the partner never
// signs on the client's behalf. The partner keeps visibility via partnerId.
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
      { error: "Generate the filing PDF first (finish the wizard and pay), then send the sign link." },
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

  const label = filing.llcName ?? `tax year ${filing.taxYears.join(", ")}`;
  try {
    await sendMagicLinkEmail(user.email, signLink, label);
  } catch (err) {
    console.error("[partner send-sign-link] email failed", err);
    return NextResponse.json({ error: "Could not send the email. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, clientEmail: user.email });
}
