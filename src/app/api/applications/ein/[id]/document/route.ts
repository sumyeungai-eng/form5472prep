import { handleDocument } from "@/lib/applications/customerSignature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  return handleDocument("ein", params.id, req);
}
