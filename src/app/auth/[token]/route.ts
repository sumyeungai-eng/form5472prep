import { NextResponse } from "next/server";
import { verifyMagicLinkToken } from "@/lib/magicLink";
import { makeUserToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Click target for magic-link emails. Implemented as a Route Handler (not a
// Server Component page) because Next.js only allows cookies().set() inside
// Route Handlers and Server Actions — calling it during a page render throws
// in production.
export const dynamic = "force-dynamic";

const USER_COOKIE = "fs_user";
const USER_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function GET(req: Request, { params }: { params: { token: string } }) {
  const userId = verifyMagicLinkToken(decodeURIComponent(params.token));
  const origin = new URL(req.url).origin;

  if (!userId) {
    return NextResponse.redirect(`${origin}/sign-in?error=expired`, { status: 303 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.redirect(`${origin}/sign-in?error=not_found`, { status: 303 });
  }

  // Honor an optional ?next= deeplink so transactional emails can drop the
  // user directly onto the sign page (or any other in-app page) after auth.
  // Whitelisted to same-origin relative paths to prevent open redirects.
  const nextParam = new URL(req.url).searchParams.get("next");
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/dashboard";

  // 303 ensures the browser follows with GET (POST/PUT semantics don't apply
  // here, but Vercel's edge can otherwise be inconsistent on 307 from a GET).
  const response = NextResponse.redirect(`${origin}${safeNext}`, { status: 303 });
  response.cookies.set({
    name: USER_COOKIE,
    value: makeUserToken(user.id),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: USER_TTL_SECONDS,
  });
  return response;
}
