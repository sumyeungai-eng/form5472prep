import { LegalLayout } from "@/components/LegalLayout";

export const metadata = {
  title: "Terms of Service",
  description:
    "Form5472 Prep Terms of Service. We prepare and transmit IRS Form 5472 filings — we are not a CPA firm and do not provide tax advice.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="2026-05-20">
      <h2>1. What this service is</h2>
      <p>
        Form5472 Prep (the &quot;Service&quot;) is a self-service tool for preparing IRS Form 5472
        and pro forma Form 1120, and for transmitting the signed package to the IRS by fax on
        the user&apos;s behalf. The Service generates documents from information the user
        provides, and acts as a courier in delivering those documents to the IRS.
      </p>

      <h2>2. We are not a CPA firm or tax advisor</h2>
      <p>
        The Service is <strong>not</strong> a tax preparation service, a Certified Public
        Accountant firm, an Enrolled Agent, or a tax advisor. We do not review your particular
        facts and circumstances, render opinions on your tax positions, or prepare any return
        that calculates tax. No attorney-client, accountant-client, or fiduciary relationship
        is formed by your use of the Service.
      </p>

      <h2>3. Your responsibility for accuracy</h2>
      <p>
        You are solely responsible for the truthfulness, accuracy, and completeness of all
        information you submit to the Service, including financial data, identification numbers,
        and the determination of whether you are required to file Form 5472 in any given year.
        You agree to review the generated documents in full before signing and authorizing
        submission to the IRS.
      </p>

      <h2>4. Fees and payment</h2>
      <p>
        Fees are payable per filing, in advance, via our payment processor (Stripe). All fees
        are non-refundable once a PDF has been generated, except as expressly stated (e.g., if
        we are unable to transmit your filing to the IRS after three attempts).
      </p>

      <h2>5. Filing transmission</h2>
      <p>
        We transmit completed filings to the IRS Ogden Service Center, PIN Unit, at the
        published fax number for foreign-owned U.S. disregarded entities. We retain the fax
        transmission receipt as proof of delivery. We do not guarantee that the IRS will
        process, accept, or assess any particular outcome on your filing.
      </p>

      <h2>6. No guarantee of penalty avoidance</h2>
      <p>
        The IRS retains discretion over whether to assess or abate penalties. We do not
        guarantee that a reasonable cause statement we generate will be accepted, nor that any
        particular penalty will be avoided or reduced.
      </p>

      <h2>7. Bank account connections (optional)</h2>
      <p>
        The Service offers an optional bank account connection via{" "}
        <strong>Plaid Inc.</strong> that lets you import the tax year&apos;s transactions
        automatically. Use of this feature is governed by{" "}
        <a href="https://plaid.com/legal/#end-user-privacy-policy" target="_blank" rel="noopener noreferrer">
          Plaid&apos;s End User Privacy Policy
        </a>{" "}
        in addition to our own <a href="/privacy">Privacy Policy</a>. You may revoke the
        Plaid connection at any time from your account dashboard. The feature is provided
        for your convenience — you remain responsible for verifying that the imported and
        categorized transactions are accurate and complete before authorizing submission.
      </p>

      <h2>8. Acceptable use</h2>
      <p>
        You may not use the Service to submit false or fraudulent filings, to file on behalf of
        another person without authorization, or in violation of any applicable law.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, our total aggregate liability arising out of or
        relating to the Service is limited to the fees you paid us in the twelve (12) months
        preceding the event giving rise to the claim. We are not liable for any indirect,
        consequential, incidental, or special damages, including lost profits or tax penalties
        assessed by any tax authority.
      </p>

      <h2>10. Termination</h2>
      <p>
        We may suspend or terminate your access to the Service at our discretion, including for
        suspected misuse. You may stop using the Service at any time.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Wyoming, U.S.A., without regard to
        its conflict of laws principles.
      </p>

      <h2>12. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be communicated by
        email to the address associated with your account.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>.
      </p>
    </LegalLayout>
  );
}
