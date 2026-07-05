import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tiny auth-state endpoint for the client header island. Returns only whether a
// valid session cookie is present — no user data, no DB query. This is what lets
// the marketing layout be statically edge-cached: the header renders signed-out
// by default, then swaps to "My filings" after this call resolves for the rare
// logged-in visitor on a marketing page.
export function GET() {
  return NextResponse.json(
    { signedIn: hasValidSession() },
    { headers: { "cache-control": "no-store" } },
  );
}
