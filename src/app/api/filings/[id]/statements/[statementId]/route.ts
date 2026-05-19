import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Remove a single uploaded bank statement from a filing.
// The user owns the filing → they can remove any of its statements.
export async function DELETE(
  _: Request,
  { params }: { params: { id: string; statementId: string } },
) {
  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Make sure the statement belongs to this filing (defence in depth — the
  // ownership check on filing already gates it, but verify the FK too).
  const stmt = await prisma.bankStatement.findFirst({
    where: {
      id: params.statementId,
      filingYearData: { filingId: filing.id },
    },
  });
  if (!stmt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.bankStatement.delete({ where: { id: stmt.id } });
  // Note: we leave the file blob in storage. Retention policy sweeps it later.
  // If you want immediate deletion, add storage.del(stmt.fileKey) here.

  return NextResponse.json({ ok: true });
}
