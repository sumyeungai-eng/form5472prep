import type { Metadata } from "next";

// The apply page itself is a client component ("use client") and can't export
// metadata. This server layout sets it instead. The intake form is a thin
// conversion page with no standalone search value, so we keep it out of the
// index (it's also absent from sitemap.ts) while leaving it fully reachable
// from the /ein service page.
export const metadata: Metadata = {
  title: "EIN Application — Form5472 Prep",
  description:
    "Start your EIN application for a foreign-owned US LLC. We prepare Form SS-4 and obtain your EIN directly from the IRS — no SSN required.",
  alternates: { canonical: "https://www.form5472prep.com/ein/apply" },
  robots: { index: false, follow: true },
};

export default function EinApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
