import { NextResponse } from "next/server";
import {
  consumeFilingInvite,
  INVITE_COOKIE,
  inviteCookieValue,
} from "@/lib/filingInvite";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const invite = await consumeFilingInvite(decodeURIComponent(params.token));
  const origin = new URL(req.url).origin;

  if (!invite) {
    return NextResponse.redirect(`${origin}/sign-in?invite=expired`, { status: 303 });
  }

  const filing = await prisma.filing.findUnique({
    where: { id: invite.filingId },
    select: { inviteExpiresAt: true },
  });
  if (!filing?.inviteExpiresAt) {
    return NextResponse.redirect(`${origin}/sign-in?invite=expired`, { status: 303 });
  }

  const maxAge = Math.floor((filing.inviteExpiresAt.getTime() - Date.now()) / 1000);
  if (maxAge <= 0) {
    return NextResponse.redirect(`${origin}/sign-in?invite=expired`, { status: 303 });
  }

  const path = invite.scope === "edit" ? `/filings/${invite.filingId}/edit` : `/filings/${invite.filingId}/sign`;
  const response = NextResponse.redirect(`${origin}${path}`, { status: 303 });
  response.cookies.set({
    name: INVITE_COOKIE,
    value: inviteCookieValue(invite.filingId, invite.scope, filing.inviteExpiresAt),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return response;
}
