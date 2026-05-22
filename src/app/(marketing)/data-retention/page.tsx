import { LegalLayout } from "@/components/LegalLayout";

export const metadata = {
  title: "Data Retention Policy",
  description:
    "form5472 deliberately stores the minimum. Bank statements are processed in memory and discarded. Signed PDFs deleted within 72 hours of fax confirmation. Fax receipts retained 7 years.",
  alternates: { canonical: "/data-retention" },
  robots: { index: true, follow: true },
};

export default function DataRetentionPage() {
  return (
    <LegalLayout title="Data Retention Policy" lastUpdated="2026-05-20">
      <h2>Our principle</h2>
      <p>
        We retain the minimum amount of data needed to (a) prove that your IRS filing was
        transmitted, (b) reproduce next year&apos;s filing without you re-entering everything,
        and (c) meet our own records-retention obligations. We deliberately do not store
        copies of bank statements or signed PDFs after they have served their purpose.
      </p>

      <h2>Discarded during normal processing</h2>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table>
        <thead>
          <tr>
            <th>Data type</th>
            <th>Lifetime</th>
            <th>What happens</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Uploaded bank statement files (CSV/PDF)</td>
            <td>Processed in memory; not persisted</td>
            <td>Parsed to extract totals, then dropped without being written to disk</td>
          </tr>
          <tr>
            <td>Individual transaction rows (uploaded or imported via Plaid)</td>
            <td>Lifetime of your review session</td>
            <td>Used to display the categorization review; discarded when you confirm the totals</td>
          </tr>
          <tr>
            <td>Plaid access tokens</td>
            <td>Revoked immediately after transaction import is complete, or on user request</td>
            <td>No persistent bank connection is retained beyond the import session unless you opt to keep it</td>
          </tr>
          <tr>
            <td>Signed PDFs you upload</td>
            <td>Up to 72 hours</td>
            <td>Held only to fax to the IRS and return the receipt; deleted after fax confirmation</td>
          </tr>
          <tr>
            <td>Generated unsigned PDFs</td>
            <td>Regenerated on demand</td>
            <td>Built from your retained entity / owner / totals data; not stored after download</td>
          </tr>
        </tbody>
      </table>
      </div>

      <h2>Retained for proof and reuse</h2>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table>
        <thead>
          <tr>
            <th>Data type</th>
            <th>Retention period</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fax transmission receipts</td>
            <td>7 years from filing date</td>
            <td>Proof of filing — matches IRS records retention (26 CFR § 1.6001-1)</td>
          </tr>
          <tr>
            <td>Aggregated contribution and distribution totals per year</td>
            <td>7 years</td>
            <td>Required to reproduce or amend the filing if challenged</td>
          </tr>
          <tr>
            <td>Entity and owner identification data</td>
            <td>7 years from last filing</td>
            <td>Makes next year&apos;s filing one-click</td>
          </tr>
          <tr>
            <td>Account email and login records</td>
            <td>Active + 12 months</td>
            <td>To let you retrieve your receipts after a period of inactivity</td>
          </tr>
          <tr>
            <td>Payment records (Stripe metadata)</td>
            <td>7 years</td>
            <td>U.S. tax and accounting requirements</td>
          </tr>
          <tr>
            <td>Server access logs</td>
            <td>30 days</td>
            <td>Security and incident response</td>
          </tr>
        </tbody>
      </table>
      </div>

      <h2>Deletion process</h2>
      <p>
        Records past their retention period are deleted on a rolling monthly basis. Deletion
        is irreversible — once a filing&apos;s retention period expires we cannot retrieve it.
      </p>

      <h2>Early deletion at your request</h2>
      <p>
        You can request earlier deletion of your account and all associated data at any time
        by emailing <a href="mailto:support@form5472prep.com">support@form5472prep.com</a> from the
        email address associated with your account. We process requests within 30 days. We
        may retain a minimal record of the deletion itself (the timestamp, the requesting
        email) for audit purposes.
      </p>

      <h2>What we do not retain</h2>
      <ul>
        <li>Bank statement files — discarded immediately after parsing.</li>
        <li>Individual line-item transactions — discarded after totals are confirmed.</li>
        <li>Signed PDFs — deleted within 72 hours of fax confirmation.</li>
        <li>Payment card data — handled and stored exclusively by Stripe.</li>
        <li>Passwords — we use passwordless authentication (one-time email magic-link or Google OAuth); no passwords are ever stored.</li>
        <li>Bank login credentials — never seen or stored. Plaid handles authentication directly with your financial institution.</li>
        <li>Raw transaction data from Plaid — only the contribution/distribution totals are retained for filing reproduction; individual line items are discarded after review.</li>
      </ul>
    </LegalLayout>
  );
}
