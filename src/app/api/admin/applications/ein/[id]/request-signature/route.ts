import { handleRequestSignature } from "@/lib/applications/adminSignature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function POST(req: Request, { params }: { params: { id: string } }) {
  return handleRequestSignature("ein", params.id, req);
}
