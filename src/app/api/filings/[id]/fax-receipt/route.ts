import { NextResponse } from "next/server";
import { getFilingAccess } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getPdf } from "@/lib/storage";

export const runtime = "nodejs";

// Re-downloads the timestamped IRS Fax Transmission Receipt PDF. Same
// receipt that's attached to the delivery email, but available anytime
// the customer comes back to the portal.
//
// Who may download it: exactly who may open /filings/[id] — the same
// getFilingAccess(id) call the page makes (the customer's account or browser,
// or the partner firm that owns the filing). Invite links are deliberately not
// a grant here, as on the page. Anyone else gets the same 404 as "no receipt".
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const access = await getFilingAccess(params.id);
  if (access.kind !== "owned") {
    return NextResponse.json({ error: "Receipt not generated yet" }, { status: 404 });
  }
  const filing = await prisma.filing.findUnique({
    where: { id: access.filing.id },
    select: { llcName: true, faxConfirmationKey: true },
  });
  if (!filing?.faxConfirmationKey) {
    return NextResponse.json({ error: "Receipt not generated yet" }, { status: 404 });
  }

  const bytes = await getPdf(filing.faxConfirmationKey);
  const safeLlc = (filing.llcName ?? "filing").replace(/[^a-zA-Z0-9-]+/g, "_");
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="IRS-fax-receipt-${safeLlc}.pdf"`,
    },
  });
}
