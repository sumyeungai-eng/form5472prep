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
  if (!isFiled) return null;

  return (
    <section id="documents" aria-labelledby="filed-documents-title" className="scroll-mt-6 rounded-lg border border-slate-200 bg-white p-5">
      <h2 id="filed-documents-title" className="text-lg font-semibold text-slate-900">Your filed documents</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {hasFiledForms && (
          <DocumentRow
            label={hasFaxedPdf ? "Forms faxed to the IRS (PDF)" : "Signed forms (PDF)"}
            description={hasFaxedPdf ? "The exact package transmitted to the IRS." : "The signed package saved for this filing."}
            href={`/api/filings/${filingId}/faxed-pdf`}
          />
        )}
        {hasFaxReceipt ? (
          <DocumentRow
            label="Fax transmission receipt (proof of filing)"
            description="Timestamped confirmation that your fax reached the IRS."
            href={`/api/filings/${filingId}/fax-receipt`}
          />
        ) : (
          <p className="py-4 text-sm text-slate-600">Your fax receipt will appear here once the IRS fax line confirms delivery.</p>
        )}
        {hasDistinctSignedCopy && (
          <DocumentRow
            label="Signed copy (PDF)"
            description="Your signed copy, kept separately from the faxed package."
            href={`/api/filings/${filingId}/signed-pdf`}
          />
        )}
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Keep these with your company records. The IRS does not send an acknowledgement for faxed Form 5472 filings; the fax receipt is your proof of filing.
      </p>
    </section>
  );
}

function DocumentRow({ label, description, href }: { label: string; description: string; href: string }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-medium text-slate-900">{label}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <a href={href} target="_blank" rel="noreferrer" className="sm:flex-none">
        <Button variant="outline" className="w-full sm:w-auto" aria-label={`Download ${label}`}>
          <Download className="mr-1.5 h-4 w-4" />
          Download
        </Button>
      </a>
    </div>
  );
}
