import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendEmail, customerShell } from "@/lib/email";

export const runtime = "nodejs";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

// A partner's end client pressed "Finish and send" on the review step. The
// client never pays; tell the partner (who does) that the intake is ready.
// Same access rule as the wizard's PATCH (session, partner or edit-invite).
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id, "edit");
  if (!filing || !filing.partnerId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [partner, user] = await Promise.all([
    prisma.partner.findUnique({ where: { id: filing.partnerId }, select: { email: true, name: true } }),
    filing.userId ? prisma.user.findUnique({ where: { id: filing.userId }, select: { email: true } }) : null,
  ]);
  if (!partner) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const llc = filing.llcName ?? "their LLC";
  const client = user?.email ?? filing.inviteEmail ?? "your client";
  const url = `${env.appUrl}/filings/${filing.id}`;
  await sendEmail({
    to: partner.email,
    subject: `Your client finished the intake for ${llc}`,
    html: customerShell({
      heading: "Your client finished the intake",
      salutation: partner.name,
      bodyHtml: `<p style="margin:0 0 16px;line-height:1.6;">${esc(client)} finished the intake for ${esc(llc)}. Review it and complete payment from your dashboard.</p>`,
      cta: { label: "Open the filing", url },
    }),
    text: `${client} finished the intake for ${llc}. Review it and complete payment: ${url}`,
    log: { kind: "partner_client_finished", filingId: filing.id },
  });
  return new NextResponse(null, { status: 204 });
}
