import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { getPdf } from "@/lib/storage";

export const runtime = "nodejs";

// Serves the unsigned generated PDF. Defaults to inline so the sign page can
// embed it in an <iframe> for review — `attachment` Content-Disposition was
// blocking the iframe render in Chrome/Firefox. Pass ?download=1 to force a
// download dialog (no current caller uses it; kept for symmetry).
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id);
  if (!filing?.generatedPdfKey)
    return NextResponse.json({ error: "Not generated yet" }, { status: 404 });

  const url = new URL(req.url);
  const wantsDownload = url.searchParams.get("download") === "1";
  const bytes = await getPdf(filing.generatedPdfKey);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${wantsDownload ? "attachment" : "inline"}; filename="form5472-${filing.id}.pdf"`,
      // Allow same-origin iframes (the sign page) to embed. X-Frame-Options
      // defaults vary by host; explicit SAMEORIGIN keeps Vercel from sending
      // DENY on a route that we explicitly want to embed.
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
