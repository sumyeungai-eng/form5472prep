import { LegalLayout } from "@/components/LegalLayout";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Information Security Policy",
  description:
    "How Form5472 Prep protects customer information, including bank transaction data accessed via Plaid, government identifiers, signatures, and tax filing records.",
  alternates: {
    canonical: "/security",
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  robots: { index: true, follow: true },
};

export default function SecurityPage() {
  return (
    <LegalLayout title="Information Security Policy" lastUpdated="2026-11-24">
      <h2>Is it safe to upload my passport and LLC documents?</h2>
      <p>
        Yes. We protect the passport details and LLC documents you submit with encryption
        in transit and at rest, and use them to prepare, review and support your filing.
        Data is processed in the United States and the European Union. Retention depends
        on the record; you can request earlier deletion.
      </p>
      <ul>
        <li>
          <strong>What is stored:</strong> identity and passport details, LLC and owner
          information, uploaded bank statements and every categorized transaction row,
          supporting documents, signature records, prepared forms, fax records and payment
          metadata, according to the record type.
        </li>
        <li>
          <strong>Where:</strong> encrypted infrastructure operated by Vercel, our managed
          PostgreSQL database provider and Cloudflare R2, with processing in the United
          States and the European Union.
        </li>
        <li>
          <strong>Who uses it:</strong> our team uses it to prepare, review and support
          your filing; data is shared with the IRS and service providers acting on our
          behalf for those purposes.
        </li>
        <li>
          <strong>How long:</strong> entity and owner identification data is retained for
          7 years from the last filing. Your signed forms, the exact PDF we fax to the IRS,
          and the fax receipt are kept in your account for up to 7 years so you can download
          them; ask us and we delete them sooner. Bank statements and their transaction
          rows, supporting documents, other uploads, signature images and signing records
          (IP address, browser and consent version) are kept with your filing records;
          deleted on request. See the{" "}
          <a href="/data-retention">Data Retention Policy</a> for the full schedule.
        </li>
        <li>
          <strong>Request deletion:</strong> email{" "}
          <a href="mailto:support@form5472prep.com">support@form5472prep.com</a> from
          your account email address. Requests are processed within 30 days; some records
          must be retained for tax and accounting obligations.
        </li>
        <li>
          <strong>Service providers:</strong> Stripe handles payments, Cloudflare R2
          handles file storage, Resend handles transactional email, and Telnyx handles fax.
          We never see or store your payment card details.
        </li>
        <li><strong>Signing:</strong> only you, the client, sign your return.</li>
      </ul>

      <p className="text-sm text-slate-500">Version 1.0</p>

      <h2>1. Purpose &amp; Scope</h2>
      <p>
        This policy governs how Form5472 Prep (&ldquo;the Company&rdquo;) protects customer
        information, including bank transaction data accessed via Plaid, used in the
        preparation of IRS Form 5472 and pro forma Form 1120 filings.
      </p>

      <h2>2. Data Classification</h2>
      <ul>
        <li>
          <strong>Highly sensitive:</strong> customer banking credentials (never stored;
          Plaid handles authentication directly with the financial institution), bank
          transaction data, government identifiers (EIN, ITIN), tax filing PDFs.
        </li>
        <li>
          <strong>Sensitive:</strong> customer email, address, LLC details.
        </li>
        <li>
          <strong>Internal:</strong> application logs, infrastructure metadata.
        </li>
      </ul>

      <h2>3. Access Control</h2>
      <ul>
        <li>Production systems and data are accessible only to authorized personnel.</li>
        <li>All access to admin systems requires authentication via password and session token.</li>
        <li>
          Admin sign-in uses an email and password over an encrypted connection, and vendor
          consoles require two-factor authentication.
        </li>
        <li>
          Vendor consoles (Vercel, Cloudflare, Plaid, Stripe, Resend) are protected by strong
          unique passwords and two-factor authentication.
        </li>
        <li>
          No customer banking credentials are ever stored; Plaid handles authentication
          directly with financial institutions; we only receive scoped access tokens.
        </li>
      </ul>

      <h2>4. Encryption</h2>
      <ul>
        <li>All data in transit is encrypted via TLS 1.2+ (HTTPS enforced).</li>
        <li>
          Data at rest in our managed PostgreSQL database is encrypted (encryption-at-rest
          enabled).
        </li>
        <li>File storage (Cloudflare R2) uses server-side encryption.</li>
        <li>
          All secrets (API keys, database URLs) are stored in encrypted environment variables,
          never in source code.
        </li>
      </ul>

      <h2>5. Vendors &amp; Sub-processors</h2>
      <p>
        We use the following infrastructure and service providers to run the Service:
      </p>
      <ul>
        <li><strong>Vercel</strong> - application hosting</li>
        <li><strong>Cloudflare R2</strong> - file storage</li>
        <li><strong>Plaid</strong> - bank account connectivity</li>
        <li><strong>Stripe</strong> - payment processing</li>
        <li><strong>Resend</strong> - transactional email</li>
        <li>Managed PostgreSQL database</li>
      </ul>
      <p>
        We do not sell your data. We share limited hashed identifiers with advertising
        partners to measure ads as described in our <a href="/privacy">Privacy Policy</a>;
        we share a one-way hash of your email address with Meta only if you allow Meta
        advertising cookies.
      </p>

      <h2>6. Payment handling</h2>
      <p>
        Card details are entered with Stripe and never reach our servers. We receive payment
        status and limited payment metadata needed for receipts, refunds, and accounting.
      </p>

      <h2>7. Data Retention &amp; Deletion</h2>
      <p>
        See our <a href="/data-retention">Data Retention Policy</a> for the full schedule.
        Plaid connections and access tokens are stored; connections are not revoked
        automatically after import. Transactions are fetched for review; only rows the
        customer confirms are saved with the filing. Kept with your filing records; deleted
        on request. Customers may request deletion of their
        account and data at any time by emailing{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>.
      </p>

      <h2>8. Incident Response</h2>
      <ul>
        <li>Production errors are monitored via Vercel logs and alerting.</li>
        <li>
          In the event of a confirmed data breach, affected customers will be notified within
          72 hours via email, and relevant regulators (including Plaid, where applicable) will
          be notified per applicable law.
        </li>
        <li>
          Suspected security issues should be reported to{" "}
          <a href="mailto:security@form5472prep.com">security@form5472prep.com</a>.
        </li>
      </ul>

      <h2>9. Software Development</h2>
      <ul>
        <li>All code is version-controlled in a private repository.</li>
        <li>
          Production deployments require successful CI build (type checks, lint, tests).
        </li>
        <li>Dependencies are scanned for known vulnerabilities via the package registry.</li>
      </ul>

      <h2>10. Personnel Security</h2>
      <ul>
        <li>
          Employees and contractors with access to systems sign confidentiality agreements.
        </li>
        <li>
          Access is granted on a need-to-know basis and revoked immediately upon offboarding.
        </li>
      </ul>

      <h2>11. Policy Review</h2>
      <p>This policy is reviewed annually and updated as the business grows.</p>
    </LegalLayout>
  );
}
