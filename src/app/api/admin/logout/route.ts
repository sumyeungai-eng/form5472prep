import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_COOKIE.name,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  res.cookies.set({
    name: ADMIN_SESSION_COOKIE.name,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
