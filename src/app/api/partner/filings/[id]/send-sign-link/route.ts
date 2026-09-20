import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPartner } from "@/lib/partner/auth";
import { bindFilingToEmail } from "@/lib/session";
import { sendMagicLinkEmail } from "@/lib/email";
import { brandForFiling, type EmailBrand } from "@/lib/partnerBrand";
import { createFilingInvite } from "@/lib/filingInvite";

export const runtime = "nodejs";

// Partner sends their client a secure link to review + sign a filing.
//
// Flow:
//   1. Verify the partner owns this filing (filing.partnerId === partner.id).
//   2. Require the unsigned PDF to exist (PAID/PDF_GENERATED) — there's nothing
//      to sign before generation.
//   3. Bind the filing to the client's email (creates/links a User) for later
//      portal access.
//   4. Email the client a filing-scoped invite link to the sign page.
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

  // Bind to the client's email for later portal access, but do not derive the
  // emailed link from that user identity.
  const user = await bindFilingToEmail(filing.id, email);
  const { url: signLink } = await createFilingInvite(filing.id, "sign", email);

  const label = filing.llcName ?? `tax year ${filing.taxYears.join(", ")}`;
  let brand: EmailBrand | null = null;
  try {
    if ("whiteLabelEnabled" in partner && "brandName" in partner && "brandReplyTo" in partner) {
      const name = partner.brandName?.trim();
      if (partner.whiteLabelEnabled && name) {
        const replyTo = partner.brandReplyTo?.trim();
        brand = replyTo && replyTo.includes("@") ? { name, replyTo } : { name };
      }
    } else {
      brand = await brandForFiling(filing.id);
    }
  } catch (err) {
    console.error("[partner send-sign-link] brand lookup failed", err);
  }
  try {
    await sendMagicLinkEmail(user.email, signLink, label, brand ?? undefined);
  } catch (err) {
    console.error("[partner send-sign-link] email failed", err);
    return NextResponse.json({ error: "Could not send the email. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, clientEmail: user.email });
}
