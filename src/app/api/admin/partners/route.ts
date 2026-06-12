import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { makePartnerLoginLink } from "@/lib/partner/auth";
import { sendPartnerLoginEmail } from "@/lib/email";

export const runtime = "nodejs";

// Create a partner (reseller/agency) account. Admin-only. The partner can then
// sign in at /partner/sign-in with this email (magic link).
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
  }

  const existing = await prisma.partner.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: `A partner with email ${email} already exists` }, { status: 409 });
  }

  const partner = await prisma.partner.create({
    data: { name, email, company: company || null, notes: notes || null },
  });
  return NextResponse.json({ id: partner.id });
}

// Toggle active / edit a partner. Admin-only.
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.company === "string") data.company = body.company.trim() || null;
  if (typeof body.notes === "string") data.notes = body.notes.trim() || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Read prior state so we can detect an inactive → active transition and
  // auto-send the partner their sign-in link the moment they're approved.
  const before = await prisma.partner.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const partner = await prisma.partner.update({ where: { id }, data });

  const justActivated = before.active === false && partner.active === true;
  if (justActivated) {
    try {
      const link = makePartnerLoginLink(partner.id);
      await sendPartnerLoginEmail(partner.email, link, partner.name);
    } catch (err) {
      // Non-blocking: activation still succeeds even if the email fails. The
      // partner can always request a fresh link at /partner/sign-in.
      console.error("[admin/partners] activation login-link email failed", err);
    }
  }

  return NextResponse.json({ ok: true, activated: justActivated });
}
