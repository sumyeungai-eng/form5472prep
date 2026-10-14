import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { submitClientOwnerSsn } from "@/lib/ownerSsnSubmit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The save also re-runs pre-flight (builds the package in memory).
export const maxDuration = 60;

// POST /api/filings/[id]/ssn  { ssn: string, confirm: string }
//
// The client's secure SSN box on the order page (spec
// docs/reviews/2026-10-15-ssn-capture-spec.md). Same ownership check as the
// other customer filing routes: another user's filing is a 404. Responds with
// ONLY { ok, last4, submittedAt } or { error } — never the number. The request
// body is never logged. All logic lives in src/lib/ownerSsnSubmit.ts (a route
// file may export only handlers and route config).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const headers = { "Cache-Control": "no-store" };
  const owned = await getOwnedFiling(params.id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404, headers });

  const payload = await req.json().catch(() => null);
  const result = await submitClientOwnerSsn(owned.id, payload);
  return NextResponse.json(result.body, { status: result.status, headers });
}
