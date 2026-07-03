import { FaxReceipt } from "@/components/FaxReceipt";

// "Here's the proof you'll get" section. Sits between the pricing cards and the
// FAQ. Differentiates Form5472 Prep against $49 DIY tools (which issue no
// proof) by foregrounding the actual proof-of-filing artifact — now a crafted
// HTML receipt rather than a flat screenshot.

const PROOF_POINTS: Array<{ field: string; title: string; body: string }> = [
  {
    field: "Status: Delivered",
    title: "Carrier-confirmed delivery, not just “sent”",
    body: "The IRS Ogden PIN Unit's fax machine acknowledged receipt of every page. Sender-side fax tools can't show this.",
  },
  {
    field: "Forms",
    title: "Both forms transmitted together",
    body: "Form 5472 and pro forma 1120 are faxed as one package — exactly how the IRS expects them to arrive.",
  },
  {
    field: "Fax: +1-855-887-7737",
    title: "The official IRS Ogden PIN Unit number",
    body: "The only fax number the IRS publishes for foreign-owned LLC information returns. Wrong number means not filed.",
  },
  {
    field: "Timestamp (UTC)",
    title: "Exact delivery time, to the second",
    body: "Down-to-the-second UTC proof of when the IRS received your filing — what the IRS cites if a penalty notice is ever appealed.",
  },
  {
    field: "IRC § 6038A",
    title: "The governing legal citation",
    body: "The receipt names the federal code section behind Form 5472 — drafted to be the document you'd hand a CPA or tax attorney in a dispute.",
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
            Real proof your filing reached the IRS
          </h2>
          <p className="mt-4 text-slate-600">
            Every package ships with an IRS-citable fax-transmission receipt —
            the document you present if a penalty notice is ever issued.
          </p>
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          {/* The crafted receipt */}
          <div className="mx-auto w-full max-w-md">
            <FaxReceipt />
            <p className="mt-3 text-center font-mono text-[11px] text-slate-500">
              Sample transmission record — customer data redacted.
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

        {/* Differentiator — directly answers "why pay $199 over $49" */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-emerald-200 bg-emerald-50/70 px-6 py-5 text-center text-sm text-emerald-900">
          <strong className="font-semibold">Every plan includes this receipt.</strong>{" "}
          DIY form generators can&apos;t issue one — they never actually transmit to the IRS.
        </div>
      </div>
    </section>
  );
}
