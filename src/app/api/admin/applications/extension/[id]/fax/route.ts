import { NextResponse } from "next/server";
import { displayStaffIdentity, getAdminPrincipal, SHARED_ADMIN_LABEL } from "@/lib/admin/auth";
import { ExtensionFaxError, faxExtensionToIrs } from "@/lib/fax/extension";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin click → fax the stored generated Form 7004 to the IRS. Every guard
// (year ended, due date, identity, duplicate) is in lib/fax/extension.ts.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminPrincipal(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { reason?: unknown } | null;
  const reason = typeof body?.reason === "string" ? body.reason : null;
  try {
    const result = await faxExtensionToIrs(params.id, {
      reason,
      actor: displayStaffIdentity(admin.email) ?? SHARED_ADMIN_LABEL,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof ExtensionFaxError) {
      return NextResponse.json({ error: err.message, code: err.code, needsReason: err.needsReason }, { status: err.status });
    }
    throw err;
  }
}
