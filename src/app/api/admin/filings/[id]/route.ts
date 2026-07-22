import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import {
  FilingActionError,
  runFilingAction,
  type FilingActionName,
} from "@/lib/admin/filingActions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// AI check takes 15-30s end-to-end; the regenerate-and-resend-confirmation
// case can be similar. Default 10s isn't enough.
export const maxDuration = 120;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action as string | undefined;
  if (!action) return NextResponse.json({ error: "missing action" }, { status: 400 });

  try {
    const result = await runFilingAction(
      params.id,
      action as FilingActionName,
      body,
      {
        adminId: null,
        force: true,
        reason: "legacy admin override",
      },
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof FilingActionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
