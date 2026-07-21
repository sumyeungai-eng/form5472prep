import { NextResponse } from "next/server";
import { ADMIN_COOKIE, makeSessionToken, verifyPassword } from "@/lib/admin/auth";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Throttle password guesses per IP (brute-force protection).
  const rl = await rateLimit("admin-login", clientIp(req), 10, 600);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);
  const { password } = await req.json().catch(() => ({}));
  if (typeof password !== "string" || !verifyPassword(password)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_COOKIE.name,
    value: makeSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE.maxAge,
  });
  return res;
}
