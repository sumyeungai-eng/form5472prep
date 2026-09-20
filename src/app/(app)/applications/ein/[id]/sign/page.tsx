import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApplicationSignClient } from "@/components/applications/ApplicationSignClient";
import { consentText, signState } from "@/lib/applicationSignature";
import { loadOwnedApplication } from "@/lib/applications/customerSignature";
import { requireUser } from "@/lib/session";

export default async function SignEinApplicationPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const app = await loadOwnedApplication("ein", params.id, user.id);
  if (!app) notFound();

  const state = signState(app);
  if (state === "NOT_READY" || state === "LOCKED" || !app.preparedPdfSha256) {
    redirect(`/applications/ein/${app.id}`);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href={`/applications/ein/${app.id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to application
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">Review and sign your Form SS-4</h1>
        <ApplicationSignClient
          type="ein"
          id={app.id}
          docSha256={app.preparedPdfSha256}
          documentUrl={`/api/applications/ein/${app.id}/document`}
          consentText={consentText("ein")}
          defaultName={app.fullName}
          alreadySigned={state === "SIGNED"}
          hasIntakeSignature={app.intakeSignaturePngKey !== null}
          intakeSignerName={app.intakeSignerName}
        />
      </div>
    </div>
  );
}
