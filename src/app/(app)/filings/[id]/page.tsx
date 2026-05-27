import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getFilingAccess, getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FilingActions } from "@/components/wizard/FilingActions";
import { FilingStatusBanner } from "@/components/FilingStatusBanner";
import { FilingLocked } from "@/components/FilingLocked";
import { MessagesPanel } from "@/components/MessagesPanel";
import { getTiersForSource } from "@/lib/pricing";

export default async function FilingDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { paid?: string };
}) {
  const access = await getFilingAccess(params.id);
  if (access.kind === "not_found") notFound();
  if (access.kind === "locked") return <FilingLocked ownerEmail={access.ownerEmail} />;
  const owned = access.filing;
  // DRAFT filings haven't been paid yet — send the user back to the wizard so
  // they can finish filling and pay, rather than showing post-payment actions.
  // Exception: ?paid=1 means the user just returned from Stripe; the webhook
  // may not have fired yet, so let the page run and apply the optimistic bump
  // below before deciding the status is really DRAFT.
  if (owned.status === "DRAFT" && searchParams.paid !== "1") {
    redirect(`/filings/${owned.id}/edit`);
  }
  const user = await getCurrentUser();

  const filing = await prisma.filing.findUnique({
    where: { id: owned.id },
    include: { yearData: true },
  });
  if (!filing) notFound();

  // Optimistic status bump after Stripe redirect in case the webhook didn't fire.
  if (searchParams.paid === "1" && filing.status === "DRAFT") {
    await prisma.filing.update({
      where: { id: filing.id },
      data: { status: "PAID" },
    });
    filing.status = "PAID";
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div>
        {user ? (
          <Link href="/dashboard" className="text-sm text-slate-500 hover:underline">
            ← My filings
          </Link>
        ) : (
          <Link href="/" className="text-sm text-slate-500 hover:underline">
            ← Home
          </Link>
        )}
        <h1 className="text-2xl font-semibold mt-2">{filing.llcName ?? "Filing"}</h1>
        <p className="text-sm text-slate-500">
          {getTiersForSource(filing.funnelSource)[filing.tier as "single_year" | "two_year_diirsp" | "multi_year_diirsp"]?.label} · Tax years {filing.taxYears.join(", ")}
        </p>
      </div>

      <FilingStatusBanner
        filingId={filing.id}
        status={filing.status}
        updatedAt={filing.updatedAt}
      />

      <FilingActions
        filing={{
          id: filing.id,
          status: filing.status,
          generatedPdfKey: filing.generatedPdfKey,
          signaturePngKey: filing.signaturePngKey,
          signedPdfKey: filing.signedPdfKey,
          faxJobId: filing.faxJobId,
          faxStatus: filing.faxStatus,
          faxService: filing.faxService,
          faxConfirmationKey: filing.faxConfirmationKey,
        }}
      />

      {/* In-portal messaging. Visible to any owner of the filing — signed-in
          user OR anonymous session-cookie match. Anonymous owners can still
          post; admin notifications go to the filing's owner email if one
          was captured at /start (i.e. filing.user is non-null), even when
          the current browser doesn't have an active user cookie. */}
      <MessagesPanel filingId={filing.id} isAdmin={false} />
    </div>
  );
}
