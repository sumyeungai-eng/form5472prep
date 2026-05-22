// Smoke test: regenerate the East West Global PDF locally (no R2 needed)
// and validate it with Claude. Prints the structured response.
import { prisma } from "../src/lib/prisma";
import { generatePackage } from "../src/lib/pdf/generatePackage";
import { validateFiling, type FilingSnapshot } from "../src/lib/ai/validateFiling";

const FILING_ID = "cmpenzypg0001ky04wz21hfr7";

async function main() {
  const f = await prisma.filing.findUnique({
    where: { id: FILING_ID },
    include: { yearData: { orderBy: { taxYear: "asc" } } },
  });
  if (!f) throw new Error("filing not found");

  // Require all generator inputs (matches webhook gating).
  if (!f.llcName || !f.llcEin || !f.llcAddress || !f.llcCity || !f.llcState ||
      !f.llcZip || !f.llcDateIncorporated || !f.llcBusinessActivity ||
      !f.llcBusinessCode || !f.ownerName || !f.ownerAddress ||
      !f.ownerCountryCitizenship || !f.ownerCountryTaxResidence ||
      !f.ownerCountryBusiness || !f.ownerFtin) {
    throw new Error("filing missing required generator inputs");
  }

  console.log("[test] regenerating PDF locally…");
  const pkg = await generatePackage({
    llcName: f.llcName, llcEin: f.llcEin, llcAddress: f.llcAddress,
    llcCity: f.llcCity, llcState: f.llcState, llcZip: f.llcZip,
    llcCountry: f.llcCountry, llcDateIncorporated: f.llcDateIncorporated,
    llcBusinessActivity: f.llcBusinessActivity, llcBusinessCode: f.llcBusinessCode,
    ownerName: f.ownerName, ownerAddress: f.ownerAddress,
    ownerCountryCitizenship: f.ownerCountryCitizenship,
    ownerCountryTaxResidence: f.ownerCountryTaxResidence,
    ownerCountryBusiness: f.ownerCountryBusiness, ownerFtin: f.ownerFtin,
    ownerItin: f.ownerItin, ownerReferenceId: f.ownerReferenceId,
    taxYears: f.taxYears, isDiirsp: f.isDiirsp,
    reasonableCauseNarrative: f.reasonableCauseNarrative,
    yearData: f.yearData.map((y) => ({
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
  console.log(`[test] generated PDF: ${(pkg.bytes.length / 1024).toFixed(1)} KB, ${pkg.signatures.length} signatures`);

  const snapshot: FilingSnapshot = {
    id: f.id,
    tier: f.tier,
    taxYears: f.taxYears,
    isDiirsp: f.isDiirsp,
    reasonableCauseNarrative: f.reasonableCauseNarrative,
    llcName: f.llcName, llcEin: f.llcEin, llcAddress: f.llcAddress,
    llcCity: f.llcCity, llcState: f.llcState, llcZip: f.llcZip,
    llcCountry: f.llcCountry,
    llcDateIncorporated: f.llcDateIncorporated.toISOString().split("T")[0],
    llcBusinessActivity: f.llcBusinessActivity, llcBusinessCode: f.llcBusinessCode,
    ownerName: f.ownerName, ownerAddress: f.ownerAddress,
    ownerCountryCitizenship: f.ownerCountryCitizenship,
    ownerCountryTaxResidence: f.ownerCountryTaxResidence,
    ownerCountryBusiness: f.ownerCountryBusiness,
    ownerFtin: f.ownerFtin, ownerItin: f.ownerItin, ownerReferenceId: f.ownerReferenceId,
    yearData: f.yearData.map((y) => ({
      taxYear: y.taxYear,
      totalAssetsYearEnd: y.totalAssetsYearEnd.toString(),
      contributions: y.contributions.toString(),
      distributions: y.distributions.toString(),
      otherTransactionsNote: y.otherTransactionsNote,
      reportableTransactions: y.reportableTransactions as unknown[],
    })),
  };

  console.log("[test] calling Claude…");
  const t0 = Date.now();
  const result = await validateFiling({ pdfBytes: pkg.bytes, filing: snapshot });
  console.log(`[test] done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log("---");
  console.log("status:", result.status);
  console.log("summary:", result.summary);
  console.log("issues:");
  for (const i of result.issues) {
    console.log(`  [${i.severity}] ${i.location}`);
    console.log(`    desc: ${i.description}`);
    if (i.suggested_fix) console.log(`    fix: ${i.suggested_fix}`);
    if (i.customer_question) console.log(`    ask: ${i.customer_question}`);
  }
  console.log("customer_questions:", result.customer_questions);
  if (result.errorMessage) console.log("errorMessage:", result.errorMessage);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
