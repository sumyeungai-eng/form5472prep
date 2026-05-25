import Image from "next/image";

// "Here's the proof you'll get" section for /pricing. Sits between the
// pricing cards and the FAQ. Differentiates form5472prep against $49 DIY
// competitors (edetax-style "all sales final, software tool only") by
// showing the actual proof-of-filing artifact customers receive.
//
// The image is rendered once from the live generateFaxReceiptPdf() output
// — see render_sample_fax_receipt.mjs in git history. Re-render whenever
// the receipt template changes so this section stays in sync with the
// real product.

const CALLOUTS: Array<{
  n: number;
  // Percent-coord position of the badge over the image. Tuned to land on
  // the right line of text at the rendered aspect ratio.
  top: string;
  left: string;
  title: string;
  body: string;
}> = [
  {
    n: 1,
    top: "13%",
    left: "10%",
    title: "Telnyx-confirmed DELIVERED status",
    body: "Not just \"sent\" — the IRS Ogden PIN Unit's fax machine acknowledged receipt of every page. Sender-side fax services can't see this.",
  },
  {
    n: 2,
    top: "31%",
    left: "50%",
    title: "Both forms transmitted together",
    body: "Form 5472 and pro forma 1120 are faxed as one package — exactly how the IRS expects them to arrive.",
  },
  {
    n: 3,
    top: "38%",
    left: "32%",
    title: "Official IRS Ogden PIN Unit fax number",
    body: "+1-855-887-7737 is the only fax number the IRS publishes for foreign-owned LLC information returns. Wrong number = not filed.",
  },
  {
    n: 4,
    top: "46%",
    left: "40%",
    title: "Exact UTC delivery timestamp",
    body: "Down-to-the-second UTC proof of when the IRS received your filing. This is what the IRS cites if a penalty notice is ever appealed.",
  },
  {
    n: 5,
    top: "58%",
    left: "52%",
    title: "IRC § 6038A legal citation",
    body: "Receipt cites the specific federal code section governing Form 5472 — drafted to be the document you'd hand to a CPA or tax attorney in a dispute.",
  },
];

export function FaxReceiptProof() {
  return (
    <section className="bg-slate-50 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            What you actually receive
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            Real proof your filing reached the IRS
          </h2>
          <p className="mt-3 text-slate-600">
            Cheap $49 DIY tools generate forms and call it done. We deliver an
            IRS-citable fax-transmission receipt for every package we send —
            the document you can present to the IRS if a penalty notice is
            ever issued.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
          {/* Receipt image + numbered callout badges */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-slate-300/40 ring-1 ring-slate-200 bg-white">
              <Image
                src="/sample-fax-receipt.png"
                alt="Sample IRS Fax Transmission Receipt — proof-of-filing document customers receive"
                width={1240}
                height={1600}
                className="w-full h-auto block"
                priority={false}
              />
              {CALLOUTS.map((c) => (
                <span
                  key={c.n}
                  aria-hidden
                  style={{ top: c.top, left: c.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shadow-lg ring-4 ring-accent/20"
                >
                  {c.n}
                </span>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Sample receipt — actual customer data redacted.
            </p>
          </div>

          {/* Numbered legend */}
          <ol className="space-y-5">
            {CALLOUTS.map((c) => (
              <li key={c.n} className="flex gap-4">
                <span className="flex-none w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {c.n}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{c.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">{c.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Differentiator chip — directly answers "why pay $199 over $49" */}
        <div className="mt-12 max-w-3xl mx-auto rounded-xl border-2 border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 text-center">
          <strong>Every plan includes this receipt.</strong>{" "}
          DIY form generators can&apos;t issue one — they don&apos;t actually transmit to the IRS.
        </div>
      </div>
    </section>
  );
}
