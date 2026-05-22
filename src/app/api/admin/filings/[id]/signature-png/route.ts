import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { get as getStorageObject } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only: returns the customer's drawn signature PNG so the
// place-signature page can overlay it on the rendered PDF canvas.
export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    select: { signaturePngKey: true },
  });
  if (!filing?.signaturePngKey) {
    return NextResponse.json({ error: "no signature on file" }, { status: 404 });
  }
  const bytes = await getStorageObject(filing.signaturePngKey);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
