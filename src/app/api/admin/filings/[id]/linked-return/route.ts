import { NextResponse } from "next/server";
import { getAdminPrincipal } from "@/lib/admin/auth";
import { createLinkedReturn, LinkedReturnError, parseLinkedTaxYears } from "@/lib/admin/linkedReturn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST { taxYears: number[] } — add another return (its own review, signing
// and fax) to this paid order. See lib/admin/linkedReturn.ts.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const principal = await getAdminPrincipal(req).catch(() => null);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { taxYears?: unknown } | null;
  const taxYears = parseLinkedTaxYears(body?.taxYears);
  if (!taxYears) {
    return NextResponse.json({ error: "Pick the tax year(s) this return covers (2018 to this year)." }, { status: 400 });
  }
  try {
    const result = await createLinkedReturn({ sourceFilingId: params.id, taxYears, adminId: principal.adminId });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof LinkedReturnError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
