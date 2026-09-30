import { NextResponse } from "next/server";
import { getOwnedFiling, bindFilingToEmail, FilingAccessLostError } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Body first, THEN authorise: authorising first let a caller hold a passed
  // check open for as long as it cared to trickle the body in, while the
  // email's owner took the filing over. bindFilingToEmail re-checks at write
  // time as well; this just keeps the window to server processing time.
  const body = await req.json().catch(() => ({}));

  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  try {
    await bindFilingToEmail(params.id, email);
  } catch (err) {
    if (err instanceof FilingAccessLostError) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    throw err;
  }
  return NextResponse.json({ ok: true });
}
