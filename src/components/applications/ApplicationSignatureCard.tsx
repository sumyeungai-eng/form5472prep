import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { formLabel, type ApplicationType, type SignState } from "@/lib/applicationSignature";

export function ApplicationSignatureCard({
  type,
  id,
  state,
  signedAt,
  signerName,
}: {
  type: ApplicationType;
  id: string;
  state: SignState;
  signedAt: Date | null;
  signerName: string | null;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const label = formLabel(type);
  const signHref = `/applications/${type}/${id}/sign`;

  if (state === "NOT_READY") {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
        <p className="text-sm text-slate-700">{t("portal.applications.preparing", { label })}</p>
      </div>
    );
  }

  if (state === "LOCKED") {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-5 py-4">
        <p className="text-sm font-medium text-slate-900">{t("portal.applications.signedOnFile", { label })}</p>
        <Link
          href={`/api/applications/${type}/${id}/document?signed=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-sm font-semibold text-blue-900 hover:underline"
        >
          {t("portal.applications.downloadSignedCopy")}
        </Link>
      </div>
    );
  }

  if (state === "SIGNED") {
    const formatted = signedAt?.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" }) ?? t("portal.applications.recordedDate");
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4">
        <p className="text-sm font-medium text-emerald-950">{t("portal.applications.signedBy", { name: signerName ?? t("portal.applications.signer"), date: formatted })}</p>
        <Link href={signHref} className="mt-3 inline-flex text-sm font-semibold text-emerald-800 hover:underline">
          {t("portal.applications.reviewOrSignAgain")}
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
      <p className="text-sm font-medium text-blue-950">{t("portal.applications.ready", { label })}</p>
      <Link
        href={signHref}
        className="mt-3 inline-flex items-center justify-center rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-950"
      >
        {t("portal.applications.reviewAndSign")}
      </Link>
    </div>
  );
}
