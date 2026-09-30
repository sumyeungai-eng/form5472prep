import { notFound, redirect } from "next/navigation";
import { toClientFiling, getFilingAccess, partnerOwnsFiling, getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FilingWizardV3 } from "@/components/wizard-v3/FilingWizardV3";
import { FilingLocked } from "@/components/FilingLocked";
import { PartnerFilingBar } from "@/components/PartnerFilingBar";
import { plaidConfigured } from "@/lib/plaid";
import { saveForLaterMode } from "@/lib/saveForLater";

export default async function EditFilingPage({ params }: { params: { id: string } }) {
  const access = await getFilingAccess(params.id, "edit");
  if (access.kind === "not_found") notFound();
  if (access.kind === "locked") return <FilingLocked ownerEmail={access.ownerEmail} />;
  const owned = access.filing;
  if (owned.status !== "DRAFT") redirect(`/filings/${owned.id}`);

  const filing = await prisma.filing.findUnique({
    where: { id: owned.id },
    include: { yearData: true, user: { select: { email: true } } },
  });
  if (!filing) notFound();

  const owningPartner = await partnerOwnsFiling(filing.id);

  // Signed-in test for the wizard's "Save for later" control: only true when
  // the current viewer IS the user this filing is bound to — a signed-in
  // customer looking at (or a partner impersonating access to) somebody
  // else's filing should not be told "save and exit to your dashboard".
  const currentUser = await getCurrentUser();
  const isSignedIn = Boolean(currentUser && filing.userId && currentUser.id === filing.userId);

  // The full-row read above can overlap owner takeover. Do not serialize
  // newly entered owner data to a browser whose earlier grant has expired.
  const currentAccess = await getFilingAccess(filing.id, "edit");
  if (currentAccess.kind === "not_found") notFound();
  if (currentAccess.kind === "locked") return <FilingLocked ownerEmail={currentAccess.ownerEmail} />;

  // The wizard needs only the account email, not its row or filing delivery /
  // payment metadata. Keep these server-only fields out of client props.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, createdAt, inviteEmail, inviteTokenHash, stripeSessionId, ...clientFiling } = filing;
  const serialized = {
    ...toClientFiling(clientFiling),
    email: user?.email ?? null,
    llcDateIncorporated: filing.llcDateIncorporated?.toISOString() ?? null,
    yearData: filing.yearData.map((y) => ({
      taxYear: y.taxYear,
      totalAssetsYearEnd: y.totalAssetsYearEnd.toString(),
      contributions: y.contributions.toString(),
      distributions: y.distributions.toString(),
      otherTransactionsNote: y.otherTransactionsNote ?? null,
      noReportableTransactions: y.noReportableTransactions,
    })),
  };

  return (
    <>
      {owningPartner && (
        <PartnerFilingBar
          filingId={filing.id}
          partnerName={owningPartner.name}
          llcName={filing.llcName}
        />
      )}
      <FilingWizardV3
        filing={serialized}
        plaidEnabled={plaidConfigured()}
        saveForLater={saveForLaterMode({ isPartnerFiling: owningPartner !== null, isSignedIn })}
        defaultEmail={user?.email ?? null}
      />
    </>
  );
}
