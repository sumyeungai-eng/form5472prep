import { FaxReceipt } from "@/components/FaxReceipt";

// Explains provider transmission evidence and its limits; not IRS acceptance.

const PROOF_POINTS: Array<{ field: string; title: string; body: string }> = [
  {
    field: "Status: Delivered",
    title: "Provider-reported completed transmission",
    body: "A final delivery status records the fax provider's result. It does not establish IRS account processing or acceptance of the return.",
  },
  {
    field: "Forms",
    title: "Both forms transmitted together",
    body: "Form 5472 and pro forma 1120 are faxed as one package — exactly how the IRS expects them to arrive.",
  },
  {
    field: "Fax: +1-855-887-7737",
    title: "The official IRS Ogden PIN Unit number",
    body: "Compare the destination with the current Form 5472 instructions for foreign-owned U.S. disregarded entities before sending.",
  },
  {
    field: "Timestamp (UTC)",
    title: "A timestamp with a clear time zone",
    body: "Keep the provider's completion timestamp with the exact submitted PDF. It is useful transmission evidence, not a legal determination of timely filing.",
  },
  {
    field: "Confirmation",
    title: "Connect the record to the submitted package",
    body: "Keep the provider reference with the exact PDF and supporting correspondence. This provider-derived record is not IRS-issued and does not guarantee penalty relief.",
  },
];

export function FaxReceiptProof() {
  return (
    <section className="border-y border-paper-edge bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
            What you actually receive
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Keep a record of your filing transmission
          </h2>
          <p className="mt-4 text-slate-600">
            Your fax-transmission receipt belongs with the complete submitted package.
            It records the provider&apos;s result, not IRS processing or acceptance.
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          {/* The crafted receipt */}
          <div className="mx-auto w-full max-w-md">
            <FaxReceipt />
            <p className="mt-3 text-center font-mono text-[11px] text-slate-500">
              Illustrative provider-derived record — dummy data, not an IRS document.
            </p>
          </div>

          {/* What each part proves */}
          <ul className="space-y-6">
            {PROOF_POINTS.map((p) => (
              <li key={p.field} className="border-l-2 border-paper-edge pl-5">
                <p className="font-mono text-[11px] uppercase tracking-wide text-accent">
                  {p.field}
                </p>
                <h3 className="mt-1.5 font-semibold text-ink">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Differentiator — directly answers "why pay $149 over $49" */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50/70 px-6 py-5 text-center text-sm text-emerald-900">
          <strong className="font-semibold">Every plan includes this receipt.</strong>{" "}
          Keep it with your signed package and any IRS correspondence. Learn{" "}
          <a href="/blog/form-5472-irs-receipt-confirmation-status" className="underline">what a fax receipt can and cannot establish</a>.
        </div>
      </div>
    </section>
  );
}
