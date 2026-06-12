import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makePartnerLoginLink } from "@/lib/partner/auth";
import { sendPartnerLoginEmail } from "@/lib/email";

export const runtime = "nodejs";

// Emails a partner a sign-in link IF an active Partner row exists for that
// email. Always returns success — never leaks whether an account exists or is
// active (no account enumeration). Admins create partner accounts; there is
// no self-serve signup here.
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const partner = await prisma.partner.findUnique({ where: { email: normalized } });

  if (partner && partner.active) {
    const link = makePartnerLoginLink(partner.id);
    try {
      await sendPartnerLoginEmail(partner.email, link, partner.name);
    } catch (err) {
      console.error("[partner/send-link] email send failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
