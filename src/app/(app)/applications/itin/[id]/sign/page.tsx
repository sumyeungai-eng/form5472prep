import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApplicationSignClient } from "@/components/applications/ApplicationSignClient";
import { consentText, signState } from "@/lib/applicationSignature";
import { loadOwnedApplication } from "@/lib/applications/customerSignature";
import { requireUser } from "@/lib/session";

export default async function SignItinApplicationPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const app = await loadOwnedApplication("itin", params.id, user.id);
  if (!app) notFound();

  const state = signState(app);
  if (state === "NOT_READY" || state === "LOCKED" || !app.preparedPdfSha256) {
    redirect(`/applications/itin/${app.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href={`/applications/itin/${app.id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to application
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Review and sign your Form W-7</h1>
        <ApplicationSignClient
          type="itin"
          id={app.id}
          docSha256={app.preparedPdfSha256}
          documentUrl={`/api/applications/itin/${app.id}/document`}
          consentText={consentText("itin")}
          defaultName={app.fullName}
          alreadySigned={state === "SIGNED"}
          hasIntakeSignature={app.intakeSignaturePngKey !== null}
          intakeSignerName={app.intakeSignerName}
        />
      </div>
    </div>
  );
}
