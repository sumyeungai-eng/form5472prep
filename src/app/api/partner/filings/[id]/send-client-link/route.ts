import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentPartner } from "@/lib/partner/auth";
import { bindFilingToEmail } from "@/lib/session";
import { makeMagicLink } from "@/lib/magicLink";
import { sendClientIntakeEmail } from "@/lib/email";
import { checkClientInvite } from "@/lib/partner/clientInvite";
import { brandForFiling, type EmailBrand } from "@/lib/partnerBrand";

export const runtime = "nodejs";

// Partner sends their client a secure link to fill in a DRAFT filing —
// answer the wizard questions and upload documents — while the partner
// keeps full visibility and can finish or review it afterward.
//
// Flow:
//   1. Verify the partner owns this filing (filing.partnerId === partner.id)
//      and it is still an untouched DRAFT (checkClientInvite).
//   2. Bind the filing to the client's email (creates/links a User), so the
//      magic link authenticates them and the wizard's ownership check passes.
//   3. Email the client a magic link that deep-links to the edit wizard.
//
// The client fills in their own answers as themselves (their own User
// identity) — the partner never impersonates the client.
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
  const clientLink = `${baseLink}${sep}next=${encodeURIComponent(`/filings/${filing.id}/edit`)}`;

  const label = filing.llcName ?? `tax year ${filing.taxYears.join(", ")}`;
  let brand: EmailBrand | null = null;
  try {
    brand = await brandForFiling(filing.id);
  } catch (err) {
    console.error("[partner send-client-link] brand lookup failed", err);
  }
  const preparerName = brand?.name ?? (partner.company?.trim() || partner.name);
  try {
    await sendClientIntakeEmail(user.email, clientLink, label, preparerName, brand ?? undefined);
  } catch (err) {
    console.error("[partner send-client-link] email failed", err);
    return NextResponse.json({ error: "Could not send the email. Try again." }, { status: 500 });
  }

  await prisma.filing.update({
    where: { id: filing.id },
    data: { clientInviteSentAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
