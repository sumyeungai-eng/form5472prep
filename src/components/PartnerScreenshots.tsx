import Image from "next/image";

// Two framed screenshots of the partner dashboard, captured from
// /partner/screenshot-preview (sample data, no real clients). The frame
// treats each image like a browser window, matching the site's card
// language used elsewhere on /partners.
export function PartnerScreenshots() {
  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-2">
        <figure>
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)]">
            <Image
              src="/partners/dashboard.png"
              alt="The partner dashboard listing client filings grouped by who needs to act next"
              width={2560}
              height={1601}
              sizes="(min-width: 1024px) 900px, 100vw"
              className="w-full h-auto rounded-xl border border-slate-100"
              priority={false}
            />
          </div>
          <figcaption className="mt-3 text-sm text-slate-500">
            Your client filings, grouped by whose turn it is.
          </figcaption>
        </figure>

        <figure>
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)]">
            <Image
              src="/partners/filing-actions.png"
              alt="A filing row expanded to show the send sign link, invite client and archive actions"
              width={2560}
              height={1144}
              sizes="(min-width: 1024px) 900px, 100vw"
              className="w-full h-auto rounded-xl border border-slate-100"
              priority={false}
            />
          </div>
          <figcaption className="mt-3 text-sm text-slate-500">
            Send the client a sign link, or invite them to fill in the filing themselves.
          </figcaption>
        </figure>
      </div>

      <p className="mt-4 text-sm text-slate-400">Screens show sample data, not real clients.</p>
    </div>
  );
}
