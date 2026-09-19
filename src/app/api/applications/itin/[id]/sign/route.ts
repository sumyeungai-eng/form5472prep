import { handleSign } from "@/lib/applications/customerSignature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  return handleSign("itin", params.id, req);
}
