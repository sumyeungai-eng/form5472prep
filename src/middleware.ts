// No middleware-level auth: route handlers and pages enforce their own
// access checks via getCurrentUser() / getOwnedFiling() from lib/session.
// Leaving the middleware in place would force every static asset through
// the matcher; instead we export a minimal no-op so Next still recognises
// the file (and we can hook into it later if we want logging, etc.).

import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
