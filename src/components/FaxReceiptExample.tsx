// Fictional transmission metadata only. Kept separate from operational receipts.
export function FaxReceiptExample() {
  return (
    <>
      <figure className="mt-6">
        <div
          role="img"
          aria-label="Illustrative fax transmission receipt with fictional data: 2026-01-15 10:42 UTC, 8 pages, destination IRS Ogden PIN Unit, status Sent, job ID EX-000000."
          className="rounded-lg border border-slate-300 bg-paper p-6 font-mono text-sm text-ink sm:p-8"
        >
          <p className="border-b border-slate-300 pb-3 font-semibold">Fax transmission receipt</p>
          <div className="mt-4 space-y-2 break-words">
            <p>Date and time: 2026-01-15 10:42 UTC</p>
            <p>Page count: 8 pages</p>
            <p>Destination: IRS Ogden PIN Unit</p>
            <p>Status: Sent</p>
            <p>Job ID: EX-000000</p>
          </div>
        </div>
        <figcaption className="mt-3 text-sm text-slate-600">
          Example only: illustrative receipt with fictional data
        </figcaption>
      </figure>
      <p className="mt-3 leading-relaxed text-slate-700">
        A fax receipt shows the package was transmitted and when; it is not an IRS acceptance notice.
      </p>
    </>
  );
}
