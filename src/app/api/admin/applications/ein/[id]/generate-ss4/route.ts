import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { isAdmin } from "@/lib/admin/auth";
import { storePreparedPdf } from "@/lib/applications/adminSignature";
import { prisma } from "@/lib/prisma";
import { generateSs4Pdf } from "@/lib/pdf/ss4";
import { ss4FitWarnings } from "@/lib/pdf/ss4Fit";
import { parseSs4Options, ss4Warnings, type Ss4Source } from "@/lib/pdf/ss4Options";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const app = await prisma.einApplication.findUnique({
    where: { id: params.id },
    select: {
      fullName: true,
      phone: true,
      llcName: true,
      llcState: true,
      llcFormedDate: true,
      businessMailingAddress: true,
      businessType: true,
      businessPurpose: true,
      principalProducts: true,
      ownerName: true,
      ownerResidence: true,
      ownerCitizenship: true,
    },
  });
  if (!app) return NextResponse.json({ error: "application not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const source: Ss4Source = {
    fullName: app.fullName,
    phone: app.phone,
    llcName: app.llcName,
    llcState: app.llcState,
    llcFormedDate: app.llcFormedDate,
    businessMailingAddress: app.businessMailingAddress,
    businessType: app.businessType,
    businessPurpose: app.businessPurpose,
    principalProducts: app.principalProducts,
    ownerName: app.ownerName,
    ownerResidence: app.ownerResidence,
    ownerCitizenship: app.ownerCitizenship,
  };
  const options = parseSs4Options(body, source);

  await prisma.einApplication.update({
    where: { id: params.id },
    data: { ss4Options: options as Prisma.InputJsonValue },
  });

  const fillInput = { llcName: app.llcName, options };
  let stored: Awaited<ReturnType<typeof storePreparedPdf>>;
  try {
    const bytes = await generateSs4Pdf(fillInput);
    stored = await storePreparedPdf("ein", params.id, bytes, "generated");
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: `Could not generate the form: ${message}` }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    sha256: stored.sha256,
    replacedSignature: stored.replacedSignature,
    warnings: [...ss4Warnings(options), ...ss4FitWarnings(fillInput)],
  });
}
