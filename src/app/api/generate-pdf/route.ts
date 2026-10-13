import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generatePackage } from "@/lib/pdf/generatePackage";
import { filingToPackageInput } from "@/lib/pdf/packageInput";
import { runPreflight } from "@/lib/pdf/preflight";
import { persistNewPackagePreflight } from "@/lib/pdf/persistPreflight";
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
  // Generation is only valid from PAID (first generation) or PDF_GENERATED
  // (idempotent re-generation before signing). DRAFT = not paid (402); any
  // later state (SIGNATURE_PENDING/SIGNED_UPLOADED/FAXED/CONFIRMED/FAILED)
  // must NOT be regressed by re-generating, so reject with 409.
  // Once the accountant-reviewed PDF has been sent to the client, the
  // customer must not be able to replace it with a fresh unreviewed build.
  if (filing.reviewApprovedAt) {
    return NextResponse.json(
      { error: "Your forms have already been reviewed. Message us if something needs changing." },
      { status: 409 },
    );
  }
  if (filing.status !== "PAID" && filing.status !== "PDF_GENERATED") {
    return filing.status === "DRAFT"
      ? NextResponse.json({ error: "Not paid yet" }, { status: 402 })
      : NextResponse.json({ error: "This filing can no longer be regenerated." }, { status: 409 });
  }

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
  ];
  for (const f of requiredFields) {
    if (filing[f] == null || filing[f] === "")
      return NextResponse.json({ error: `Missing required field: ${f}` }, { status: 400 });
  }
  if (!filing.ownerFtin && filing.ownerHasFtin !== false) {
    return NextResponse.json({ error: "Missing required field: ownerFtin" }, { status: 400 });
  }

  const { bytes, signatures, record } = await generatePackage(filingToPackageInput(filing));

  const key = `${filing.id}_unsigned.pdf`;
  await putPdf(key, bytes);
  const preflight = await runPreflight(record, bytes);

  await persistNewPackagePreflight({
    filingId: filing.id,
    preflight,
    record,
    data: {
      generatedPdfKey: key,
      status: "PDF_GENERATED",
      // A new package needs a new review: an approval given for an earlier
      // package must never carry over to this one (the helper also clears
      // any pre-flight override).
      reviewApprovedAt: null,
      reviewApprovedBy: null,
    },
  });

  // Pre-flight is staff-only: the customer gets the same answer whether it
  // passed or failed (an admin reviews and fixes the package before signing).
  return NextResponse.json({ key, signatures });
}
