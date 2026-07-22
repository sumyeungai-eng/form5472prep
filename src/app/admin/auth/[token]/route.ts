import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/auth";
import {
  makeAdminSessionToken,
  verifyAdminLoginToken,
} from "@/lib/admin/identity";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const origin = new URL(req.url).origin;
  const adminId = await verifyAdminLoginToken(decodeURIComponent(params.token));
  if (!adminId) {
    return NextResponse.redirect(`${origin}/admin/login?error=invalid_link`, { status: 303 });
  }

  await prisma.admin.update({
    where: { id: adminId },
    data: { lastLoginAt: new Date() },
  });

  const response = NextResponse.redirect(`${origin}/admin/filings`, { status: 303 });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE.name,
    value: makeAdminSessionToken(adminId),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_COOKIE.maxAge,
  });
  return response;
}
