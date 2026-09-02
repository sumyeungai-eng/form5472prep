import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { EIN_APPLICATION_FAQ } from "@/lib/einApplicationFaq";
import { pageOpenGraph } from "@/lib/seo";

// The apply page itself is a client component ("use client") and can't export
// metadata. This server layout sets it instead. The intake form is a thin
// conversion page with no standalone search value, so we keep it out of the
// index (it's also absent from sitemap.ts) while leaving it fully reachable
// from the /ein service page.
export const metadata: Metadata = {
  title: "EIN Application — Form5472 Prep",
  description:
    "Start your EIN application for a foreign-owned US LLC. We prepare Form SS-4 and obtain your EIN directly from the IRS — no SSN required.",
  alternates: { canonical: "/ein/apply" },
  openGraph: pageOpenGraph({
    title: "EIN Application — Form5472 Prep",
    description:
      "Start your EIN application for a foreign-owned US LLC. We prepare Form SS-4 and obtain your EIN directly from the IRS — no SSN required.",
    path: "/ein/apply",
  }),
  robots: { index: false, follow: true },
};

export default function EinApplyLayout({ children }: { children: React.ReactNode }) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: EIN_APPLICATION_FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd data={faqSchema} />
      {children}
    </>
  );
}
