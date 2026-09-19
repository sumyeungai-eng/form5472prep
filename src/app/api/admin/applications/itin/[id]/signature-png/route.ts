import { handleGetSignaturePng } from "@/lib/applications/adminSignature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(req: Request, { params }: { params: { id: string } }) {
  return handleGetSignaturePng("itin", params.id, req);
}
