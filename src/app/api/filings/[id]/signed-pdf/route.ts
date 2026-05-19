import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { getPdf } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id);
  if (!filing?.signedPdfKey)
    return NextResponse.json({ error: "Not uploaded yet" }, { status: 404 });

  const bytes = await getPdf(filing.signedPdfKey);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="form5472-signed-${filing.id}.pdf"`,
    },
  });
}
