import type { Metadata } from "next";

// The apply page itself is a client component ("use client") and can't export
// metadata. This server layout sets it instead. The intake form is a thin
// conversion page with no standalone search value, so we keep it out of the
// index (it's also absent from sitemap.ts) while leaving it fully reachable
// from the /itin service page.
export const metadata: Metadata = {
  title: "ITIN Application — Form5472 Prep",
  description:
    "Start your ITIN application. As an IRS Certifying Acceptance Agent we certify your identity documents and submit Form W-7 — no passport mailing required.",
  alternates: { canonical: "https://www.form5472prep.com/itin/apply" },
  robots: { index: false, follow: true },
};

export default function ItinApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
