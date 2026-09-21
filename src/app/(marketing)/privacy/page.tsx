import { LegalLayout } from "@/components/LegalLayout";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How Form5472 Prep collects, uses, stores, and shares account, identity, signature, document, fax, and support data for IRS filing services.",
  alternates: {
    canonical: "/privacy",
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="2026-09-21">
      <h2>1. Who we are</h2>
      <p>
        Form5472 Prep is the data controller for personal information you submit through the
        Service. We are based in the United States and process data on servers located in the
        United States and the European Union.
      </p>

      <h2>2. What we collect and why</h2>
      <p>
        We collect the information needed to prepare, review, submit, and support your IRS
        filing:
      </p>
      <ul>
        <li>
          <strong>Full name, email, and phone:</strong> used to create your account, contact
          you about your order, and confirm who is using the Service.
        </li>
        <li>
          <strong>Company details:</strong> company name, address, state and date of formation,
          county, and number of owners are used to prepare Form 5472 and pro forma Form 1120.
        </li>
        <li>
          <strong>Owner details:</strong> owner name, date of birth, home address, citizenship,
          and country of residence are used where the IRS forms ask for owner identity data.
        </li>
        <li>
          <strong>Passport details:</strong> passport number and expiry are used when they are
          needed to support an identity or tax filing workflow.
        </li>
        <li>
          <strong>U.S. tax number:</strong> an EIN, ITIN, SSN, or other U.S. tax number is used
          where you provide one for the filing.
        </li>
        <li>
          <strong>Uploaded documents:</strong> bank statements, dissolution certificates,
          extension proof, and chat attachments are used to prepare, evidence, or support your
          filing and support requests.
        </li>
        <li>
          <strong>Signature data:</strong> the signature image you draw, the name typed beside
          it, the time, IP address, browser used, and version of the wording agreed are used to
          show what was signed and when.
        </li>
        <li>
          <strong>Prepared forms and signed copies:</strong> forms we prepare and signed copies
          are used to submit your package to the IRS and provide your records.
        </li>
        <li>
          <strong>IRS fax responses:</strong> faxes received on our number from the IRS about
          your application are used to track filing status and provide proof or follow-up.
        </li>
        <li>
          <strong>Support messages:</strong> messages you send us are used to answer questions,
          resolve account issues, and keep a record of support we provided.
        </li>
        <li>
          <strong>Payment metadata:</strong> handled by Stripe and used to confirm payment,
          receipts, refunds, and accounting records. We never see or store your card details.
        </li>
      </ul>
      <p>
        Some of this is sensitive identity information. We collect it only because the IRS forms
        or related filing workflows require it, and we never sell it.
      </p>
      <p>
        When you visit the site we record your IP address, an approximate location derived from
        it (country and city), the pages you view, the referring site and your browser type. IP
        addresses are deleted after 30 days and page-view records after 90 days. We use this
        information to keep the site secure and to understand how visitors use it.
      </p>

      <h2>3. Bank account connections via Plaid</h2>
      <p>
        If you choose to connect your business bank account to import transactions
        automatically, we use <strong>Plaid Inc.</strong> as our financial data provider. Plaid
        handles the authentication directly with your financial institution. We never see,
        store, or have access to your online banking credentials.
      </p>
      <p>
        <strong>What Plaid sends us:</strong> when you authorize a Plaid connection, Plaid
        returns transaction history for the tax year or years you are filing (date, amount,
        description, counterparty, and the institution name), along with a non-public account
        identifier and an access token scoped to your account.
      </p>
      <p>
        <strong>How we use it:</strong> solely to categorize transactions as contributions or
        distributions and pre-fill the reportable transactions section of your IRS Form 5472.
        Plaid-sourced data is never used for advertising, profiling, sold, or shared with any
        third party other than as needed to complete your filing.
      </p>
      <p>
        <strong>Your control:</strong> you can revoke the Plaid connection at any time from
        your dashboard or by emailing{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>. Revoking
        access invalidates our access token and stops any future data access. You may also
        request deletion of the imported transaction data at any time; we will delete it within
        30 days of the request and immediately purge the access token.
      </p>
      <p>
        <strong>Plaid&apos;s own privacy practices:</strong> Plaid&apos;s use of your data is
        governed by{" "}
        <a href="https://plaid.com/legal/#end-user-privacy-policy" target="_blank" rel="noopener noreferrer">
          Plaid&apos;s End User Privacy Policy
        </a>
        .
      </p>

      <h2>4. Why we collect it</h2>
      <p>
        We collect this information to prepare and transmit your IRS filings, provide you with
        copies and proof of those filings, review filings before submission, respond to support
        requests, process payment and refunds, maintain security, and comply with our own legal
        obligations.
      </p>

      <h2>5. How we share it</h2>
      <p>We share data only with:</p>
      <ul>
        <li>
          <strong>The IRS:</strong> the completed, signed filing is transmitted to the IRS
          Ogden Service Center.
        </li>
        <li>
          <strong>Service providers acting on our behalf:</strong> Vercel (application
          hosting), our managed PostgreSQL database provider, Cloudflare R2 (file storage),
          Plaid (bank account connectivity), Google (optional sign-in via Google OAuth and
          advertising measurement), Meta (optional advertising measurement when you consent),
          Stripe (payment processing), Telnyx (fax), and Resend (transactional email). Each is
          allowed to use your data only to provide its service to us.
        </li>
      </ul>
      <p>
        We do not sell your personal information. We use Google for limited advertising
        measurement and, only if you allow Meta advertising cookies, share campaign events with
        Meta. A Meta purchase event may include order value, currency, a deduplication ID, and a
        one-way hash of your email address. We never send tax IDs, filing answers, addresses,
        bank data, signatures, or documents to advertising platforms. You can decline optional
        Meta advertising cookies without affecting the service.
      </p>

      <h2>6. Marketing emails</h2>
      <p>
        We send reminders about unfinished filings and seasonal deadline reminders. Every
        marketing email has an unsubscribe link. Opting out of marketing emails does not affect
        emails about an order, payment, filing, account security, or support request.
      </p>

      <h2>7. Where we store it</h2>
      <p>
        Personal data is stored on encrypted servers operated by our infrastructure providers
        (Vercel-hosted application, managed PostgreSQL database, Cloudflare R2 for file
        storage). All data at rest is encrypted. All connections to our service and between our
        service and its sub-processors are encrypted in transit.
      </p>
      <p>
        Data may be processed in the United States and the European Union. Transfers out of the
        EEA and the UK rely on the European Commission&apos;s standard contractual clauses.
      </p>

      <h2>8. How long we keep it</h2>
      <p>
        We retain records according to the data type and purpose. See our{" "}
        <a href="/data-retention">Data Retention Policy</a> for the full schedule, including
        signature records, IRS fax responses, support attachments, and uploaded documents.
      </p>
      <p>
        You can request earlier deletion of any retained data at any time. Some account-level
        records (email address, payment history) are retained for the period required by
        applicable tax and accounting law, typically up to seven years.
      </p>

      <h2>9. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, export, or
        delete your personal information; to object to or restrict processing; and to lodge a
        complaint with your local data protection authority. To exercise any of these rights,
        contact us at{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>. We respond within 30
        days.
      </p>

      <h3>EU/UK residents (GDPR)</h3>
      <p>
        Our legal basis for processing your data is the performance of our contract with you
        (Art. 6(1)(b) GDPR) and, for retention periods beyond contract performance,
        compliance with legal obligations (Art. 6(1)(c) GDPR).
      </p>

      <h3>California residents (CCPA)</h3>
      <p>
        We do not sell personal information as defined by the CCPA, and we have not done so in
        the preceding 12 months.
      </p>

      <h2>10. Security</h2>
      <p>
        We use administrative, technical, and physical safeguards. No method of transmission
        over the internet is 100% secure, and we work to protect your data.
      </p>
      <p>
        If we confirm a breach affecting personal data, affected customers will be notified by
        email within 72 hours.
      </p>

      <h2>11. Children</h2>
      <p>
        The Service is not directed to children under 16. We do not knowingly collect data
        from anyone under 16.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update this policy. Material changes will be communicated by email and via a
        notice on this page. The &quot;Last updated&quot; date at the top of this page always
        reflects the current version.
      </p>

      <h2>13. Contact</h2>
      <p>
        Privacy questions or requests:{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>.
      </p>
    </LegalLayout>
  );
}
