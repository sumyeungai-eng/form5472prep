import { LegalLayout } from "@/components/LegalLayout";

export const metadata = {
  title: "Information Security Policy",
  description:
    "How Form5472 Prep protects customer information — including bank transaction data accessed via Plaid, government identifiers, and tax filing PDFs.",
  alternates: { canonical: "/security" },
  robots: { index: true, follow: true },
};

export default function SecurityPage() {
  return (
    <LegalLayout title="Information Security Policy" lastUpdated="2026-05-20">
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
          <strong>Highly sensitive:</strong> customer banking credentials (never stored —
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
          Vendor consoles (Vercel, Cloudflare, Plaid, Stripe, Resend) are protected by strong
          unique passwords and two-factor authentication.
        </li>
        <li>
          No customer banking credentials are ever stored — Plaid handles authentication
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
        We use the following SOC 2 / ISO 27001 compliant infrastructure providers:
      </p>
      <ul>
        <li><strong>Vercel</strong> — application hosting</li>
        <li><strong>Cloudflare R2</strong> — file storage</li>
        <li><strong>Plaid</strong> — bank account connectivity</li>
        <li><strong>Stripe</strong> — payment processing</li>
        <li><strong>Resend</strong> — transactional email</li>
        <li>Managed PostgreSQL database</li>
      </ul>
      <p>
        We do not share customer data with any third party other than for the purpose of
        completing the customer&apos;s filing or processing their payment.
      </p>

      <h2>6. Data Retention &amp; Deletion</h2>
      <p>
        See our <a href="/data-retention">Data Retention Policy</a> for the full schedule.
        Bank transaction data pulled via Plaid is used solely to prepare the customer&apos;s
        filing and may be deleted on customer request. Customers may request deletion of their
        account and data at any time via the customer portal or by emailing{" "}
        <a href="mailto:support@form5472prep.com">support@form5472prep.com</a>.
      </p>

      <h2>7. Incident Response</h2>
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

      <h2>8. Software Development</h2>
      <ul>
        <li>All code is version-controlled in a private repository.</li>
        <li>
          Production deployments require successful CI build (type checks, lint, tests).
        </li>
        <li>Dependencies are scanned for known vulnerabilities via the package registry.</li>
      </ul>

      <h2>9. Personnel Security</h2>
      <ul>
        <li>
          Employees and contractors with access to systems sign confidentiality agreements.
        </li>
        <li>
          Access is granted on a need-to-know basis and revoked immediately upon offboarding.
        </li>
      </ul>

      <h2>10. Policy Review</h2>
      <p>This policy is reviewed annually and updated as the business grows.</p>
    </LegalLayout>
  );
}
