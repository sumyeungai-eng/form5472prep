import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPartnerLoginToken,
  makePartnerSessionToken,
  PARTNER_COOKIE_NAME,
  PARTNER_SESSION_TTL_SECONDS,
} from "@/lib/partner/auth";

// Click target for partner login-link emails. Verifies the signed token,
// confirms the Partner is still active, and sets the `fs_partner` session
// cookie. Route Handler (not a page) because cookies().set() is only allowed
// here / in Server Actions.
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const origin = new URL(req.url).origin;
  const partnerId = verifyPartnerLoginToken(decodeURIComponent(params.token));
  if (!partnerId) {
    return NextResponse.redirect(`${origin}/partner/sign-in?error=expired`, { status: 303 });
  }

  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  if (!partner || !partner.active) {
    return NextResponse.redirect(`${origin}/partner/sign-in?error=inactive`, { status: 303 });
  }

  const response = NextResponse.redirect(`${origin}/partner`, { status: 303 });
  response.cookies.set({
    name: PARTNER_COOKIE_NAME,
    value: makePartnerSessionToken(partner.id),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PARTNER_SESSION_TTL_SECONDS,
  });
  return response;
}
