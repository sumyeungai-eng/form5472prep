import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generatePackage } from "@/lib/pdf/generatePackage";
import { putPdf } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { filingId } = await req.json();
  const owned = await getOwnedFiling(filingId);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filing = await prisma.filing.findUnique({
    where: { id: owned.id },
    include: { yearData: true },
  });
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (filing.status === "DRAFT")
    return NextResponse.json({ error: "Not paid yet" }, { status: 402 });

  const requiredFields: (keyof typeof filing)[] = [
    "llcName",
    "llcEin",
    "llcAddress",
    "llcCity",
    "llcState",
    "llcZip",
    "llcDateIncorporated",
    "llcBusinessActivity",
    "llcBusinessCode",
    "ownerName",
    "ownerAddress",
    "ownerCountryCitizenship",
    "ownerCountryTaxResidence",
    "ownerCountryBusiness",
    "ownerFtin",
  ];
  for (const f of requiredFields) {
    if (filing[f] == null || filing[f] === "")
      return NextResponse.json({ error: `Missing required field: ${f}` }, { status: 400 });
  }

  const bytes = await generatePackage({
    llcName: filing.llcName!,
    llcEin: filing.llcEin!,
    llcAddress: filing.llcAddress!,
    llcCity: filing.llcCity!,
    llcState: filing.llcState!,
    llcZip: filing.llcZip!,
    llcCountry: filing.llcCountry,
    llcDateIncorporated: filing.llcDateIncorporated!,
    llcBusinessActivity: filing.llcBusinessActivity!,
    llcBusinessCode: filing.llcBusinessCode!,
    ownerName: filing.ownerName!,
    ownerAddress: filing.ownerAddress!,
    ownerCountryCitizenship: filing.ownerCountryCitizenship!,
    ownerCountryTaxResidence: filing.ownerCountryTaxResidence!,
    ownerCountryBusiness: filing.ownerCountryBusiness!,
    ownerFtin: filing.ownerFtin!,
    ownerItin: filing.ownerItin,
    ownerReferenceId: filing.ownerReferenceId,
    taxYears: filing.taxYears,
    isDiirsp: filing.isDiirsp,
    reasonableCauseNarrative: filing.reasonableCauseNarrative,
    yearData: filing.yearData.map((y) => ({
      taxYear: y.taxYear,
      totalAssetsYearEnd: Number(y.totalAssetsYearEnd),
      contributions: Number(y.contributions),
      distributions: Number(y.distributions),
    })),
  });

  const key = `${filing.id}_unsigned.pdf`;
  await putPdf(key, bytes);

  await prisma.filing.update({
    where: { id: filing.id },
    data: { generatedPdfKey: key, status: "PDF_GENERATED" },
  });

  return NextResponse.json({ key });
}
