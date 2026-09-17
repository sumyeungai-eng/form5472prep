import { NextResponse } from "next/server";
import { getOwnedFiling, bindFilingToEmail } from "@/lib/session";
import { makeMagicLink } from "@/lib/magicLink";
import { sendResumeFilingEmail } from "@/lib/email";
import { brandForFiling } from "@/lib/partnerBrand";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export const runtime = "nodejs";

// Anonymous customer clicks "Save for later" in the wizard and gives us an
// email. We bind the (anonymous, session-owned) draft to that email exactly
// like bind-email/route.ts does, then send a magic link that deep-links back
// to the edit page — mirroring the partner sign-link flow (send-sign-link,
// sign-link routes) minus the sign-page destination and the partner-auth
// guard, since the caller here is the anonymous customer themselves.
//
// Guard order: rate limit (same per-IP helper as other public routes, e.g.
// partner/send-link) first so an abusive caller never reaches the DB; then
// ownership (getOwnedFiling — 404s for a filing this session/user/partner
// doesn't already have access to, so this can't be used to hijack someone
// else's draft); then email validation; then bind + email send.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const rl = await rateLimit("save-for-later", clientIp(req), 5, 600);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const user = await bindFilingToEmail(params.id, email);

  const baseLink = makeMagicLink(user.id);
  const sep = baseLink.includes("?") ? "&" : "?";
  const link = `${baseLink}${sep}next=${encodeURIComponent(`/filings/${params.id}/edit`)}`;

  const label = filing.llcName ?? `tax year ${filing.taxYears.join(", ")}`;
  let brand = null;
  try {
    brand = await brandForFiling(params.id);
  } catch (err) {
    console.error("[save-for-later] brand lookup failed", err);
  }

  try {
    await sendResumeFilingEmail(user.email, link, label, brand ?? undefined);
  } catch (err) {
    console.error("[save-for-later] email failed", err);
    return NextResponse.json({ error: "Could not send the email. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
