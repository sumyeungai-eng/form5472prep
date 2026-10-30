import { NextResponse } from "next/server";
import {
  consumeFilingInvite,
  INVITE_COOKIE,
  inviteCookieValue,
} from "@/lib/filingInvite";
import { prisma } from "@/lib/prisma";
import { isPortalHost, portalOrigin } from "@/lib/partner/portalHost";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const invite = await consumeFilingInvite(decodeURIComponent(params.token));
  const url = new URL(req.url);
  const onPortal = isPortalHost(req.headers.get("host") ?? url.host);
  // req.url's origin is not reliably the requested host, and the invite
  // cookie must land on the same domain the client then browses.
  const origin = (onPortal && portalOrigin()) || url.origin;
  // On the partner portal an expired link must not land on our sign-in page.
  const expired = onPortal ? `${origin}/portal/expired` : `${origin}/sign-in?invite=expired`;

  if (!invite) {
    return NextResponse.redirect(expired, { status: 303 });
  }

  const filing = await prisma.filing.findUnique({
    where: { id: invite.filingId },
    select: { inviteExpiresAt: true, partnerId: true },
  });
  if (!filing?.inviteExpiresAt) {
    return NextResponse.redirect(expired, { status: 303 });
  }

  // Links sent before the portal existed: move partner clients onto it with
  // the same token, so the invite cookie is set on the portal domain.
  const portal = portalOrigin();
  if (filing.partnerId && portal && !onPortal) {
    return NextResponse.redirect(`${portal}/invite/${encodeURIComponent(params.token)}`, { status: 307 });
  }

  const maxAge = Math.floor((filing.inviteExpiresAt.getTime() - Date.now()) / 1000);
  if (maxAge <= 0) {
    return NextResponse.redirect(expired, { status: 303 });
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
