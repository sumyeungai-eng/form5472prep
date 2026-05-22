import { LegalLayout } from "@/components/LegalLayout";

export const metadata = {
  title: "Privacy Policy",
  description:
    "form5472 Privacy Policy. We do not store your bank statements or signed PDFs. Fax confirmations and entity data are retained for 7 years to match IRS records retention.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="2026-05-20">
      <h2>1. Who we are</h2>
      <p>
        form5472 is the data controller for personal information you submit through the
        Service. We are based in the United States and process data on servers located in the
        U.S. and the European Union.
      </p>

      <h2>2. What we collect and what we discard</h2>
      <p>
        We are deliberately minimal about what we store. The following are <strong>retained</strong>:
      </p>
      <ul>
        <li>
          <strong>Account data:</strong> your email address, used for sign-in and
          notifications.
        </li>
        <li>
          <strong>Entity data:</strong> the legal name, EIN, address, and formation date of
          your LLC. We retain this so next year&apos;s filing is one click.
        </li>
        <li>
          <strong>Identity data:</strong> your full name, residential address, country of
          citizenship and tax residence, foreign tax ID (FTIN), and optionally a U.S. ITIN or
          reference identifier.
        </li>
        <li>
          <strong>Transaction totals:</strong> the aggregated contribution and distribution
          amounts per tax year. Not individual transactions.
        </li>
        <li>
          <strong>Fax transmission receipts:</strong> the proof-of-filing confirmation we
          receive from our fax provider after the package reaches the IRS.
        </li>
        <li>
          <strong>Payment metadata:</strong> handled entirely by our payment processor,
          Stripe. We never see or store your card information.
        </li>
      </ul>

      <p>
        The following are <strong>processed and discarded</strong>, never written to permanent
        storage beyond what is operationally necessary to deliver your filing:
      </p>
      <ul>
        <li>
          <strong>Bank statements:</strong> uploaded CSV/PDF files are parsed in memory to
          extract transaction totals, then deleted. The raw statement is not retained.
        </li>
        <li>
          <strong>Individual transaction rows:</strong> used to compute totals and to display
          the categorization review screen, then discarded once you confirm the totals.
        </li>
        <li>
          <strong>Signed PDFs you upload:</strong> held only long enough to fax to the IRS
          and return the fax confirmation to you, then deleted within 72 hours.
        </li>
        <li>
          <strong>Generated unsigned PDFs:</strong> regenerated on demand from your retained
          entity / owner / totals data; not stored persistently after you download them.
        </li>
      </ul>

      <h2>3. Bank account connections via Plaid</h2>
      <p>
        If you choose to connect your business bank account to import transactions
        automatically, we use <strong>Plaid Inc.</strong> as our financial data provider. Plaid
        handles the authentication directly with your financial institution — we never see,
        store, or have access to your online banking credentials.
      </p>
      <p>
        <strong>What Plaid sends us:</strong> when you authorize a Plaid connection, Plaid
        returns transaction history for the tax year(s) you are filing (date, amount,
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
        request deletion of the imported transaction data at any time; we will delete it
        within 30 days of the request (and immediately purge the access token).
      </p>
      <p>
        <strong>Plaid&apos;s own privacy practices:</strong> Plaid&apos;s use of your data is
        governed by{" "}
        <a href="https://plaid.com/legal/#end-user-privacy-policy" target="_blank" rel="noopener noreferrer">
          Plaid&apos;s End User Privacy Policy
        </a>
        . Plaid is a SOC 2 Type II and ISO 27001 certified data provider.
      </p>

      <h2>4. Why we collect it</h2>
      <p>
        We collect this information solely to prepare and transmit your IRS filings, to provide
        you with copies and proof of those filings, and to comply with our own legal
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
          hosting), our managed PostgreSQL database provider, Cloudflare R2 (encrypted file
          storage), Plaid (bank account connectivity — see Section 3), Google (optional sign-in
          via Google OAuth), Stripe (payment processing), and Resend (transactional email).
          Each is contractually bound to use your data only to provide their service to us,
          and each maintains SOC 2 Type II or equivalent independent attestation.
        </li>
      </ul>
      <p>
        We do not sell your personal information. We do not share your data with advertisers
        or analytics platforms beyond privacy-preserving aggregate usage metrics.
      </p>

      <h2>6. Where we store it</h2>
      <p>
        Personal data is stored on encrypted servers operated by our infrastructure providers
        (Vercel-hosted application, managed PostgreSQL database, Cloudflare R2 for file
        storage). All data at rest is encrypted (AES-256). All connections to our service
        and between our service and its sub-processors are encrypted in transit (TLS 1.2 or
        higher).
      </p>

      <h2>7. How long we keep it</h2>
      <p>
        We retain your fax confirmation receipts and aggregated filing totals for seven (7)
        years from the filing date, matching the IRS records retention period — so that you
        always have access to your proof of filing. Bank statements and signed PDFs are
        deleted within 72 hours of fax confirmation; we do not keep copies. See our{" "}
        <a href="/data-retention">Data Retention Policy</a> for the full schedule.
      </p>
      <p>
        You can request earlier deletion of any retained data at any time. Some account-level
        records (email address, payment history) are retained for the period required by
        applicable tax and accounting law (typically up to seven years).
      </p>

      <h2>8. Your rights</h2>
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

      <h2>9. Security</h2>
      <p>
        We use industry-standard administrative, technical, and physical safeguards. No
        method of transmission over the internet is 100% secure; we cannot guarantee absolute
        security but we work to protect your data using best practices.
      </p>

      <h2>10. Children</h2>
      <p>
        The Service is not directed to children under 16. We do not knowingly collect data
        from anyone under 16.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update this policy. Material changes will be communicated by email and via a
        notice on this page. The &quot;Last updated&quot; date at the top of this page always
        reflects the current version.
      </p>

      <h2>12. Contact</h2>
      <p>
        Privacy questions or requests:{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>.
      </p>
    </LegalLayout>
  );
}
