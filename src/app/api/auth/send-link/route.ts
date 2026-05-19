import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { makeMagicLink } from "@/lib/magicLink";
import { sendMagicLinkEmail } from "@/lib/email";

export const runtime = "nodejs";

// Returns success regardless of whether the email is known — don't leak which
// emails have an account. If we find a matching user with at least one filing,
// we email them a fresh magic link.
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalized },
    include: { filings: { select: { id: true, llcName: true, taxYears: true }, take: 1 } },
  });

  if (user && user.filings.length > 0) {
    const filing = user.filings[0];
    const label = filing.llcName ?? `tax year ${filing.taxYears.join(", ")}`;
    const link = makeMagicLink(user.id);
    try {
      await sendMagicLinkEmail(user.email, link, label);
    } catch (err) {
      console.error("[send-link] email send failed", err);
      // Don't surface the failure to the caller — they shouldn't be able to
      // probe email-deliverability for arbitrary addresses.
    }
  }

  return NextResponse.json({ ok: true });
}
