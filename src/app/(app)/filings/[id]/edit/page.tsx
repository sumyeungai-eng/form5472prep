import { notFound, redirect } from "next/navigation";
import { getFilingAccess } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FilingWizardV3 } from "@/components/wizard-v3/FilingWizardV3";
import { FilingLocked } from "@/components/FilingLocked";
import { plaidConfigured } from "@/lib/plaid";

export default async function EditFilingPage({ params }: { params: { id: string } }) {
  const access = await getFilingAccess(params.id);
  if (access.kind === "not_found") notFound();
  if (access.kind === "locked") return <FilingLocked ownerEmail={access.ownerEmail} />;
  const owned = access.filing;
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
      otherTransactionsNote: y.otherTransactionsNote ?? null,
    })),
  };

  return <FilingWizardV3 filing={serialized} plaidEnabled={plaidConfigured()} />;
}
