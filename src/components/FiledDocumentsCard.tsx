import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  filingId: string;
  isFiled: boolean;
  hasFiledForms: boolean;
  hasFaxedPdf: boolean;
  hasFaxReceipt: boolean;
  hasDistinctSignedCopy: boolean;
};

// Server component: pages pass availability flags, never storage keys.
export function FiledDocumentsCard({
  filingId, isFiled, hasFiledForms, hasFaxedPdf, hasFaxReceipt, hasDistinctSignedCopy,
}: Props) {
  const t = useTranslations();
  if (!isFiled) return null;

  return (
    <section id="documents" aria-labelledby="filed-documents-title" className="scroll-mt-6 rounded-lg border border-slate-200 bg-white p-5">
      <h2 id="filed-documents-title" className="text-lg font-semibold text-slate-900">{t("portal.documents.yourFiledDocuments")}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {hasFiledForms && (
          <DocumentRow
            label={hasFaxedPdf ? t("domain.documentType.faxedForms") : t("domain.documentType.signedForms")}
            description={hasFaxedPdf ? t("portal.documents.exactPackage") : t("portal.documents.savedPackage")}
            href={`/api/filings/${filingId}/faxed-pdf`}
          />
        )}
        {hasFaxReceipt ? (
          <DocumentRow
            label={t("domain.documentType.faxReceipt")}
            description={t("portal.documents.timestampedConfirmationThatYourFaxReachedTheIRS")}
            href={`/api/filings/${filingId}/fax-receipt`}
          />
        ) : (
          <p className="py-4 text-sm text-slate-600">{t("portal.documents.yourFaxReceiptWillAppearHereOnceTheIRS")}</p>
        )}
        {hasDistinctSignedCopy && (
          <DocumentRow
            label={t("domain.documentType.signedCopy")}
            description={t("portal.documents.yourSignedCopyKeptSeparatelyFromTheFaxedPackage")}
            href={`/api/filings/${filingId}/signed-pdf`}
          />
        )}
      </div>
      <p className="mt-4 text-sm text-slate-500">
        {t("portal.documents.keepTheseWithYourCompanyRecordsTheIRSDoes")}
      </p>
    </section>
  );
}

function DocumentRow({ label, description, href }: { label: string; description: string; href: string }) {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-medium text-slate-900">{label}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <a href={href} target="_blank" rel="noreferrer" className="sm:flex-none">
        <Button variant="outline" className="w-full sm:w-auto" aria-label={t("common.downloadLabel", { label })}>
          <Download className="mr-1.5 h-4 w-4" />
          {t("common.download")}
        </Button>
      </a>
    </div>
  );
}
