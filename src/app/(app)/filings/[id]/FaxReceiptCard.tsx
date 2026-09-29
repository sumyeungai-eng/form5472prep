import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// "Your IRS fax receipt is ready" card at the top of the customer's filing
// page. Render only when the filing has a stored receipt (faxConfirmationKey).
export function FaxReceiptCard({ filingId }: { filingId: string }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-emerald-900">Your IRS fax receipt is ready</p>
        <p className="mt-1 text-sm text-emerald-800">
          Timestamped proof that your forms reached the IRS. Keep it with your tax records.
        </p>
      </div>
      <a href={`/api/filings/${filingId}/fax-receipt`} target="_blank" rel="noreferrer" className="sm:flex-none">
        <Button className="w-full sm:w-auto">
          <Download className="mr-1.5 h-4 w-4" />
          Download fax receipt (PDF)
        </Button>
      </a>
    </div>
  );
}
