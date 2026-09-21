import { LegalLayout } from "@/components/LegalLayout";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Terms of Service",
  description:
    "Form5472 Prep Terms of Service for electronic signatures, refunds, accountant review, filing transmission, and customer responsibilities.",
  alternates: {
    canonical: "/terms",
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="2026-09-21">
      <h2>1. What this service is</h2>
      <p>
        Form5472 Prep (the &quot;Service&quot;) is a self-service tool for preparing IRS Form 5472
        and pro forma Form 1120, and for transmitting the signed package to the IRS by fax on
        the user&apos;s behalf. The Service generates documents from information the user
        provides, and acts as a courier in delivering those documents to the IRS.
      </p>

      <h2>2. Professional review and tax planning</h2>
      <p>
        Every filing is reviewed by a qualified accountant before it is submitted. We prepare and submit the forms from the information you give us; we do not provide personalised tax planning.
      </p>

      <h2>3. Electronic signatures and communications</h2>
      <p>
        By using the Service, you agree to transact with us electronically and to receive
        notices about your order by email. A signature you draw or type on the site has the
        same effect as a handwritten signature on the forms we prepare for you.
      </p>
      <p>
        To use the Service, you need a current web browser, an email address you can access,
        and the ability to open PDF files. You may request a paper copy of anything you signed
        at no charge by emailing{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>.
      </p>
      <p>
        You may withdraw consent to transact electronically by emailing{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>. If you do,
        we cannot continue preparing your forms online and will refund any work we have not
        started. We keep a record of what was signed, when it was signed, and the version of
        the form wording you signed.
      </p>

      <h2>4. Your responsibility for accuracy</h2>
      <p>
        You are solely responsible for the truthfulness, accuracy, and completeness of all
        information you submit to the Service, including financial data, identification numbers,
        and the determination of whether you are required to file Form 5472 in any given year.
        You agree to review the generated documents in full before signing and authorizing
        submission to the IRS.
      </p>

      <h2>5. Fees and payment</h2>
      <p>
        Fees are payable per filing, in advance, via our payment processor (Stripe). The
        refund policy in Section 6 explains when a payment can be refunded before or after
        preparation work has begun.
      </p>

      <h2>6. Refunds and cancellations</h2>
      <p>
        Before we begin preparing your forms, we will provide a full refund on request. After
        preparation has begun and before submission, we will refund the fee minus the value of
        work already done. After submission to the IRS, no refund is available because the
        service has been delivered.
      </p>
      <p>
        We may also cancel an order we cannot responsibly complete and refund it in full.
        Refunds are returned to the original payment method. Please raise payment concerns
        with us before starting a chargeback so we can review the order and resolve the issue.
      </p>

      <h2>7. Orders we may decline</h2>
      <p>
        We may decline or cancel an order, with a full refund, where the information provided
        is incomplete or inconsistent, where the situation is outside what the Service supports,
        or where we suspect misuse of the Service.
      </p>

      <h2>8. Filing transmission</h2>
      <p>
        We transmit completed filings to the IRS Ogden Service Center, PIN Unit, at the
        published fax number for foreign-owned U.S. disregarded entities. We retain the fax
        transmission receipt as proof of delivery. We do not guarantee that the IRS will
        process, accept, or assess any particular outcome on your filing.
      </p>

      <h2>9. Turnaround times</h2>
      <p>
        Any turnaround times quoted on the site are estimates based on normal preparation and
        IRS processing patterns. They are not guarantees. IRS processing is outside our control.
      </p>

      <h2>10. No guarantee of penalty avoidance</h2>
      <p>
        The IRS retains discretion over whether to assess or abate penalties. We do not
        guarantee that a reasonable cause statement we generate will be accepted, nor that any
        particular penalty will be avoided or reduced.
      </p>

      <h2>11. Bank account connections (optional)</h2>
      <p>
        The Service offers an optional bank account connection via{" "}
        <strong>Plaid Inc.</strong> that lets you import the tax year&apos;s transactions
        automatically. Use of this feature is governed by{" "}
        <a href="https://plaid.com/legal/#end-user-privacy-policy" target="_blank" rel="noopener noreferrer">
          Plaid&apos;s End User Privacy Policy
        </a>{" "}
        in addition to our own <a href="/privacy">Privacy Policy</a>. You may revoke the
        Plaid connection at any time from your account dashboard. The feature is provided
        for your convenience; you remain responsible for verifying that the imported and
        categorized transactions are accurate and complete before authorizing submission.
      </p>

      <h2>12. Acceptable use</h2>
      <p>
        You may not use the Service to submit false or fraudulent filings, to file on behalf of
        another person without authorization, or in violation of any applicable law.
      </p>

      <h2>13. Indemnity</h2>
      <p>
        You agree to indemnify Form5472 Prep against claims, losses, costs, and expenses
        arising from inaccurate information you supplied or from your misuse of the Service,
        except to the extent caused by our own negligence or wilful misconduct.
      </p>

      <h2>14. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, our total aggregate liability arising out of or
        relating to the Service is limited to the fees you paid us in the twelve (12) months
        preceding the event giving rise to the claim. We are not liable for any indirect,
        consequential, incidental, or special damages, including lost profits or tax penalties
        assessed by any tax authority.
      </p>

      <h2>15. Termination</h2>
      <p>
        We may suspend or terminate your access to the Service at our discretion, including for
        suspected misuse. You may stop using the Service at any time.
      </p>

      <h2>16. Disputes</h2>
      <p>
        If a dispute arises, you and Form5472 Prep agree to first try to resolve it by email
        within 30 days. If it cannot be resolved, the courts located in Wyoming have exclusive
        jurisdiction. Each party must bring claims individually and not as part of a class
        action.
      </p>
      <p>
        This does not affect any consumer rights you cannot waive under the law of your own
        country.
      </p>

      <h2>17. Governing law</h2>
      <p>
        These Terms are governed by the laws of the State of Wyoming, U.S.A., without regard to
        its conflict of laws principles.
      </p>

      <h2>18. Changes to prices</h2>
      <p>
        Prices may change at any time. The price shown when you pay is the price for that
        order.
      </p>

      <h2>19. Services we rely on</h2>
      <ul>
        <li>
          <strong>Stripe:</strong> processes payments and related payment records.
        </li>
        <li>
          <strong>Resend:</strong> sends transactional email, including sign-in links,
          receipts, reminders, and order notices.
        </li>
        <li>
          <strong>Telnyx:</strong> sends filing faxes to the IRS and receives fax responses
          on our number.
        </li>
        <li>
          <strong>Cloudflare R2:</strong> stores files needed to prepare or evidence a filing.
        </li>
        <li>
          <strong>Vercel:</strong> hosts the application and serves the website.
        </li>
        <li>
          <strong>Our database provider:</strong> stores account, order, filing, and retention
          records.
        </li>
        <li>
          <strong>Google:</strong> provides measurement and advertising tools used to
          understand site performance and ad conversions.
        </li>
        <li>
          <strong>Meta:</strong> provides advertising measurement tools when Meta advertising
          cookies are allowed.
        </li>
      </ul>

      <h2>20. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be communicated by
        email to the address associated with your account.
      </p>

      <h2>21. Contact</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>.
      </p>
    </LegalLayout>
  );
}
