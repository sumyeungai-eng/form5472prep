import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { getPdf } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id);
  if (!filing?.generatedPdfKey)
    return NextResponse.json({ error: "Not generated yet" }, { status: 404 });

  const bytes = await getPdf(filing.generatedPdfKey);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="form5472-${filing.id}.pdf"`,
    },
  });
}
