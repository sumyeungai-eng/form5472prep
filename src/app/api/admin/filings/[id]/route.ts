import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
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

  // Draft housekeeping (archive / unarchive / destroy) lives here rather than
  // in runFilingAction: it touches no filing workflow state, sends nothing,
  // and must stay behind a status guard that the workflow actions don't share.
  if (action === "hideDraft" || action === "unhideDraft" || action === "deleteDraft") {
    return handleDraftHousekeeping(params.id, action);
  }

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

async function handleDraftHousekeeping(
  filingId: string,
  action: "hideDraft" | "unhideDraft" | "deleteDraft",
) {
  const filing = await prisma.filing.findUnique({
    where: { id: filingId },
    select: { id: true, status: true },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });

  // Hard guard for all three actions, deliberately checked once before the
  // switch so no branch can be added later that forgets it. Only abandoned
  // wizard drafts are disposable: anything past DRAFT is taxpayer data tied to
  // a payment and (often) to a fax we may have to prove we sent, so it must
  // never be hideable or destroyable — whatever the client posts.
  if (filing.status !== "DRAFT") {
    return NextResponse.json(
      { error: "only draft filings can be hidden or deleted" },
      { status: 400 },
    );
  }

  switch (action) {
    case "hideDraft":
    case "unhideDraft": {
      await prisma.filing.update({
        where: { id: filing.id },
        data: { adminHidden: action === "hideDraft" },
        select: { id: true },
      });
      return NextResponse.json({ ok: true });
    }

    case "deleteDraft": {
      // Every relation pointing at Filing (FilingYearData, PlaidConnection,
      // Message, FilingChangeLog) declares onDelete: Cascade, and BankStatement
      // cascades off FilingYearData — so one delete takes the whole subtree.
      // Wrapped in a transaction anyway so that if a non-cascading relation is
      // added later, its explicit cleanup lands atomically with the row.
      await prisma.$transaction(async (tx) => {
        await tx.filing.delete({ where: { id: filing.id } });
      });
      return NextResponse.json({ ok: true });
    }
  }
}
