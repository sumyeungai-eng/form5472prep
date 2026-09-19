import { handleGetSignedPdf } from "@/lib/applications/adminSignature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request, { params }: { params: { id: string } }) {
  return handleGetSignedPdf("ein", params.id, req);
}
