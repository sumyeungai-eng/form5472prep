import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { getPdf } from "@/lib/storage";

export const runtime = "nodejs";

// Re-downloads the timestamped IRS Fax Transmission Receipt PDF. Same
// receipt that's attached to the delivery email, but available anytime
// the customer comes back to the portal.
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id);
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
