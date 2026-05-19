import { notFound } from "next/navigation";
import Link from "next/link";
import { getOwnedFiling, getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { FilingActions } from "@/components/wizard/FilingActions";
import { TIERS } from "@/lib/pricing";

export default async function FilingDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { paid?: string };
}) {
  const owned = await getOwnedFiling(params.id);
  if (!owned) notFound();
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
          {TIERS[filing.tier as keyof typeof TIERS]?.label} · Tax years {filing.taxYears.join(", ")}
        </p>
      </div>

      <FilingActions
        filing={{
          id: filing.id,
          status: filing.status,
          generatedPdfKey: filing.generatedPdfKey,
          signedPdfKey: filing.signedPdfKey,
          faxJobId: filing.faxJobId,
          faxStatus: filing.faxStatus,
        }}
      />
    </div>
  );
}
