import Link from "next/link";
import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "How Form5472 Prep researches, sources, reviews, and corrects its Form 5472 guides — primary IRS sources, a fixed review cadence, and a clear correction process.",
  alternates: { canonical: "/editorial-policy" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Editorial Policy — Form5472 Prep",
    description:
      "Primary IRS sources, a fixed review cadence, and a clear correction process behind every Form 5472 guide we publish.",
    url: "https://www.form5472prep.com/editorial-policy",
  },
};

export default function EditorialPolicyPage() {
  return (
    <LegalLayout title="Editorial Policy" lastUpdated="2026-07-05">
      <p>
        Form5472 Prep publishes guides to help foreign-owned US LLC owners understand and
        meet their IRS Form 5472 obligations. This policy explains how that content is
        researched, sourced, reviewed, and corrected, so readers know how much to trust it.
      </p>

      <h2>1. Sourcing</h2>
      <p>
        Our guides are built on <strong>primary sources</strong> first: the official{" "}
        <a href="https://www.irs.gov/instructions/i5472" rel="nofollow">IRS Instructions for Form 5472</a>,
        the <a href="https://www.irs.gov/forms-pubs/about-form-5472" rel="nofollow">IRS Form 5472 page</a>,
        the Internal Revenue Code (chiefly IRC § 6038A), and other official IRS and Treasury
        publications. Where we cite a figure — a penalty amount, a deadline, a fee — we link
        the source inline. We do not publish statistics, studies, or quotes we cannot verify.
      </p>

      <h2>2. What we do not do</h2>
      <ul>
        <li>We do not invent numbers or attribute claims to sources that don&apos;t support them.</li>
        <li>We do not present opinion as IRS guidance.</li>
        <li>We do not give personalized tax advice — Form5472 Prep is a filing and courier service, not a CPA firm. For advice specific to your situation, consult a qualified tax professional.</li>
      </ul>

      <h2>3. Review and accuracy</h2>
      <p>
        Guides covering the mechanics of a filing (deadlines, penalties, procedures) are
        reviewed against current IRS guidance before publication. Because our service prepares
        these exact filings, the same qualified tax accountant who reviews customer packages
        informs the accuracy of what we publish.
      </p>

      <h2>4. Freshness and updates</h2>
      <p>
        Tax rules and IRS procedures change. Cornerstone guides are reviewed on a regular
        cadence — at least every few months, and immediately when a relevant IRS rule changes.
        Each guide shows a visible &ldquo;Last updated&rdquo; date, and the same date is recorded in the
        page&apos;s structured data so search and AI engines can see how current it is.
      </p>

      <h2>5. Corrections</h2>
      <p>
        If you find an error in any guide, email{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>. We verify
        reported issues against the primary source and correct confirmed errors promptly,
        updating the &ldquo;Last updated&rdquo; date when we do.
      </p>

      <h2>6. Independence</h2>
      <p>
        Our guides describe how Form 5472 works whether or not you use our service. Where a
        guide mentions Form5472 Prep, it is disclosed as our own service — not presented as a
        neutral recommendation. Read more about who we are on our{" "}
        <Link href="/about">About page</Link>.
      </p>
    </LegalLayout>
  );
}
