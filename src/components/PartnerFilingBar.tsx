import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Full-width accent strip shown at the very top of a client filing page
// (edit / detail / confirmation) whenever the current viewer is the PARTNER
// who created that filing (see partnerOwnsFiling in @/lib/session). It exists
// purely to make it obvious this is not the client's own portal experience —
// a normal customer never sees this bar.
export function PartnerFilingBar({
  filingId,
  partnerName,
  llcName,
}: {
  filingId: string;
  partnerName: string;
  llcName?: string | null;
}) {
  return (
    <div id={`partner-filing-bar-${filingId}`} className="border-b border-accent/20 bg-accent-50 text-sm">
      <div className="mx-auto max-w-5xl px-6 py-3 flex items-center justify-between gap-4">
        <span className="text-slate-700">
          Partner filing · {partnerName}
          {llcName ? <span className="text-slate-500"> — {llcName}</span> : null}
        </span>
        <Link
          href="/partner"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-white text-sm font-medium hover:bg-accent/90"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to partner dashboard
        </Link>
      </div>
    </div>
  );
}
