import { handleGetPrepared, handleUploadPrepared } from "@/lib/applications/adminSignature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(req: Request, { params }: { params: { id: string } }) {
  return handleUploadPrepared("itin", params.id, req);
}

export function GET(req: Request, { params }: { params: { id: string } }) {
  return handleGetPrepared("itin", params.id, req);
}
