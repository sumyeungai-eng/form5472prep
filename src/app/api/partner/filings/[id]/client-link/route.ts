import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPartner } from "@/lib/partner/auth";
import { bindFilingToEmail } from "@/lib/session";
import { makeMagicLink } from "@/lib/magicLink";
import { checkClientInvite } from "@/lib/partner/clientInvite";

export const runtime = "nodejs";

// Partner requests the client's secure "fill in the filing" link WITHOUT
// emailing it, so the partner can paste it into their own message. Same
// auth/ownership/readiness guards as send-client-link/route.ts, minus the
// send — mirrors how sign-link/route.ts relates to send-sign-link/route.ts.
// Hands off a DRAFT filing (data entry + document upload), not a finished
// one waiting on a signature.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const partner = await getCurrentPartner();
  if (!partner) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid client email required" }, { status: 400 });
  }

  const filing = await prisma.filing.findUnique({ where: { id: params.id } });
  if (!filing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const guard = checkClientInvite(filing, partner.id);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  // Bind to the client's email so the magic link authenticates them and the
  // wizard's ownership check passes.
  const user = await bindFilingToEmail(filing.id, email);

  // Magic link that deep-links straight into the wizard after auth. The
  // /auth/[token] route whitelists same-origin ?next= paths.
  const baseLink = makeMagicLink(user.id);
  const sep = baseLink.includes("?") ? "&" : "?";
  const url = `${baseLink}${sep}next=${encodeURIComponent(`/filings/${filing.id}/edit`)}`;

  await prisma.filing.update({
    where: { id: filing.id },
    data: { clientInviteSentAt: new Date() },
  });

  return NextResponse.json({ url });
}
