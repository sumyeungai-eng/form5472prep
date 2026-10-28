import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { seoTitle } from "@/lib/seo-title";

// The order form is a client component and can't export metadata. Like
// /ein/apply it is a thin conversion page: noindex, absent from sitemap.ts and
// disallowed in robots.ts, but reachable from the /form-7004-extension page.
const DESCRIPTION =
  "Order Form 7004 extension filing for a foreign-owned US LLC. We prepare Form 7004 and fax it to the IRS Ogden PIN Unit.";

export const metadata: Metadata = {
  title: seoTitle("Order Form 7004 Extension"),
  description: DESCRIPTION,
  ...pageMeta({
    title: "Order Form 7004 Extension — Form5472 Prep",
    description: DESCRIPTION,
    path: "/form-7004-extension/apply",
  }),
  robots: { index: false, follow: true },
};

export default function Form7004ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
