import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedFiling } from "@/lib/session";
import { get as getStorageObject, put, putPdf } from "@/lib/storage";
import { generatePackage } from "@/lib/pdf/generatePackage";
import { embedSignatureIntoPdf } from "@/lib/pdf/embedSignature";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// PDF re-generation + embedding can take ~10–20s for the bigger filings.
export const maxDuration = 60;

// POST /api/filings/[id]/sign
//
// Accepts a data-URL encoded PNG signature drawn in the portal, embeds it
// into the unsigned generated PDF at the known signature locations, stores
// the signed bytes as `signedPdfKey`, and saves the signature image itself
// for reuse on future filings.
//
// Replaces the legacy upload-signed-PDF flow. The signed PDF lives at the
// same `signedPdfKey` field, so all downstream code (fax submission, admin
// retry, status banners) continues to work unchanged.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const owned = await getOwnedFiling(params.id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filing = await prisma.filing.findUnique({
    where: { id: owned.id },
    include: { user: true, yearData: { orderBy: { taxYear: "asc" } } },
  });
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!filing.generatedPdfKey) {
    return NextResponse.json({ error: "Filing has not been generated yet" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { pngDataUrl?: unknown };
  // Accept the canonical "data:image/png;base64,..." prefix AND tolerate the
  // less-common "data:image/png;charset=utf-8;base64,..." that some browsers
  // emit. Anything else gets rejected with a specific reason.
  const rawUrl = typeof body.pngDataUrl === "string" ? body.pngDataUrl : "";
  const commaIdx = rawUrl.indexOf(",");
  const header = commaIdx === -1 ? "" : rawUrl.slice(0, commaIdx);
  if (!header.startsWith("data:image/png") || !header.includes("base64")) {
    return NextResponse.json(
      { error: `Malformed signature image. Got header: "${header.slice(0, 60)}"` },
      { status: 400 },
    );
  }

  const pngBytes = Buffer.from(rawUrl.slice(commaIdx + 1), "base64");
  if (pngBytes.byteLength < 200) {
    return NextResponse.json(
      { error: `Signature image too small (${pngBytes.byteLength} bytes). Please draw your signature again.` },
      { status: 400 },
    );
  }

  // Pre-flight: every field below is required by generatePackage. Surfacing
  // which one is missing here is faster than letting generatePackage throw a
  // generic error inside pdf-lib (which would land as a confusing 500).
  const missing: string[] = [];
  if (!filing.llcName) missing.push("llcName");
  if (!filing.llcEin) missing.push("llcEin");
  if (!filing.llcAddress) missing.push("llcAddress");
  if (!filing.llcCity) missing.push("llcCity");
  if (!filing.llcState) missing.push("llcState");
  if (!filing.llcZip) missing.push("llcZip");
  if (!filing.llcDateIncorporated) missing.push("llcDateIncorporated");
  if (!filing.llcBusinessActivity) missing.push("llcBusinessActivity");
  if (!filing.llcBusinessCode) missing.push("llcBusinessCode");
  if (!filing.ownerName) missing.push("ownerName");
  if (!filing.ownerAddress) missing.push("ownerAddress");
  if (!filing.ownerCountryCitizenship) missing.push("ownerCountryCitizenship");
  if (!filing.ownerCountryTaxResidence) missing.push("ownerCountryTaxResidence");
  if (!filing.ownerCountryBusiness) missing.push("ownerCountryBusiness");
  if (!filing.ownerFtin) missing.push("ownerFtin");
  if (missing.length > 0) {
    console.error("[sign] missing required fields", { filingId: filing.id, missing });
    return NextResponse.json(
      {
        error: `Filing is missing required fields: ${missing.join(", ")}. Finish the wizard first, or contact support.`,
        missing,
      },
      { status: 400 },
    );
  }

  // Re-derive the signature locations from generatePackage(). The unsigned
  // PDF in storage was rendered with the same inputs, so the location
  // metadata matches what was emitted at original generation. This avoids
  // needing to persist signatures[] in the DB.
  let locations: Awaited<ReturnType<typeof generatePackage>>["signatures"];
  let unsignedBytes: Uint8Array;
  try {
    const fresh = await generatePackage({
      llcName: filing.llcName!, llcEin: filing.llcEin!, llcAddress: filing.llcAddress!,
      llcCity: filing.llcCity!, llcState: filing.llcState!, llcZip: filing.llcZip!,
      llcCountry: filing.llcCountry, llcDateIncorporated: filing.llcDateIncorporated!,
      llcBusinessActivity: filing.llcBusinessActivity!, llcBusinessCode: filing.llcBusinessCode!,
      ownerName: filing.ownerName!, ownerAddress: filing.ownerAddress!,
      ownerCountryCitizenship: filing.ownerCountryCitizenship!,
      ownerCountryTaxResidence: filing.ownerCountryTaxResidence!,
      ownerCountryBusiness: filing.ownerCountryBusiness!, ownerFtin: filing.ownerFtin!,
      ownerItin: filing.ownerItin, ownerReferenceId: filing.ownerReferenceId,
      taxYears: filing.taxYears, isDiirsp: filing.isDiirsp,
      reasonableCauseNarrative: filing.reasonableCauseNarrative,
      yearData: filing.yearData.map((y) => ({
        taxYear: y.taxYear,
        totalAssetsYearEnd: Number(y.totalAssetsYearEnd),
        contributions: Number(y.contributions),
        distributions: Number(y.distributions),
        otherTransactionsNote: y.otherTransactionsNote,
        reportableTransactions: Array.isArray(y.reportableTransactions)
          ? (y.reportableTransactions as unknown[]).filter(
              (t): t is { date: string; description: string; counterparty?: string; amountCents: number; category: string } =>
                !!t && typeof t === "object" && "date" in t && "amountCents" in t && "category" in t,
            )
          : [],
      })),
    });
    locations = fresh.signatures;
    unsignedBytes = fresh.bytes;
    console.log("[sign] regenerated package", { filingId: filing.id, signatureLocations: locations.length, bytes: unsignedBytes.byteLength });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[sign] regenerate failed", { filingId: filing.id, error: msg, stack: err instanceof Error ? err.stack : undefined });
    return NextResponse.json(
      { error: `Could not prepare PDF for signing: ${msg}` },
      { status: 500 },
    );
  }

  // Embed signature into the freshly re-generated PDF and store as signed.
  let signedBytes: Uint8Array;
  let pagesSigned: number;
  try {
    const out = await embedSignatureIntoPdf(unsignedBytes, pngBytes, locations);
    signedBytes = out.bytes;
    pagesSigned = out.pagesSigned;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[sign] embed failed", { filingId: filing.id, error: msg, stack: err instanceof Error ? err.stack : undefined });
    return NextResponse.json(
      { error: `Signature embed failed: ${msg}` },
      { status: 500 },
    );
  }

  // Persist: signed PDF + signature image (for reuse).
  const signedKey = `${filing.id}_signed.pdf`;
  await putPdf(signedKey, signedBytes);

  const signatureKey = `${filing.id}_signature.png`;
  await put(signatureKey, pngBytes, "image/png");
  // Touch unsigned key in case caller still references it.
  void getStorageObject;

  await prisma.filing.update({
    where: { id: filing.id },
    data: {
      signedPdfKey: signedKey,
      signaturePngKey: signatureKey,
      signedAt: new Date(),
      status: "SIGNED_UPLOADED",
    },
  });

  return NextResponse.json({ ok: true, pagesSigned, signedKey });
}
