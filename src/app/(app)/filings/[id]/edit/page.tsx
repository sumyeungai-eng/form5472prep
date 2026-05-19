import { notFound, redirect } from "next/navigation";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FilingWizard } from "@/components/wizard/FilingWizard";
import { plaidConfigured } from "@/lib/plaid";

export default async function EditFilingPage({ params }: { params: { id: string } }) {
  const owned = await getOwnedFiling(params.id);
  if (!owned) notFound();
  if (owned.status !== "DRAFT") redirect(`/filings/${owned.id}`);

  const filing = await prisma.filing.findUnique({
    where: { id: owned.id },
    include: { yearData: true, user: true },
  });
  if (!filing) notFound();

  const serialized = {
    ...filing,
    email: filing.user?.email ?? null,
    llcDateIncorporated: filing.llcDateIncorporated?.toISOString() ?? null,
    yearData: filing.yearData.map((y) => ({
      taxYear: y.taxYear,
      totalAssetsYearEnd: y.totalAssetsYearEnd.toString(),
      contributions: y.contributions.toString(),
      distributions: y.distributions.toString(),
    })),
  };

  return <FilingWizard filing={serialized} plaidEnabled={plaidConfigured()} />;
}
