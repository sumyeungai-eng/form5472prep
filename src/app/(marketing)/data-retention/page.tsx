import { LegalLayout } from "@/components/LegalLayout";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Data Retention Policy",
  description:
    "Retention periods for filing records, signatures, IRS faxes, uploaded documents, support attachments, and payment records.",
  alternates: {
    canonical: "/data-retention",
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  robots: { index: true, follow: true },
};

export default function DataRetentionPage() {
  return (
    <LegalLayout title="Data Retention Policy" lastUpdated="2026-09-21">
      <h2>Our principle</h2>
      <p>
        We retain the minimum amount of data needed to (a) prove that your IRS filing was
        transmitted, (b) reproduce next year&apos;s filing without you re-entering everything,
        and (c) meet our own records-retention obligations. We deliberately do not store
        copies of bank statements after they have served their purpose. Your signed forms,
        the exact PDF we fax to the IRS, and the fax receipt are kept in your account for
        up to 7 years; we delete them sooner if you ask.
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
            <td>Your signed forms, the exact PDF we fax to the IRS, and the fax receipt</td>
            <td>Up to 7 years</td>
            <td>Kept in your account so you can download your filed documents; we delete them sooner if you ask</td>
          </tr>
          <tr>
            <td>Uploaded dissolution certificates and extension proof</td>
            <td>Stored with your filing</td>
            <td>Kept for review of the related filing; ask us to delete these supporting documents</td>
          </tr>
          <tr>
            <td>Generated unsigned PDFs</td>
            <td>Stored with your filing</td>
            <td>Saved for staff review and release; downloading does not delete the PDF</td>
          </tr>
          <tr>
            <td>Fax transmission receipts</td>
            <td>7 years from filing date</td>
            <td>Proof of filing; matches IRS records retention (26 CFR section 1.6001-1)</td>
          </tr>
          <tr>
            <td>Records of what was signed and when</td>
            <td>7 years from filing date</td>
            <td>Proof of the signed authorization and the version of the wording agreed</td>
          </tr>
          <tr>
            <td>IP address and browser recorded at signing</td>
            <td>7 years from filing date</td>
            <td>Kept with the signature record to show how the electronic signature was completed</td>
          </tr>
          <tr>
            <td>Faxes received from the IRS</td>
            <td>7 years from filing date</td>
            <td>Proof of IRS responses about the customer&apos;s application or filing</td>
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
            <td>Signature images</td>
            <td>Active + 12 months</td>
            <td>Used to display and support your signed filing while your account is active</td>
          </tr>
          <tr>
            <td>Support message attachments</td>
            <td>Active + 12 months, unless needed for a retained filing record</td>
            <td>Used to resolve support requests and preserve context for follow-up</td>
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
        Filing PDFs are not deleted after fax confirmation or download. If you delete a
        draft filing, we also attempt to remove its stored files. For other deletion
        requests, contact us as described below.
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
        <li>Bank statement files; discarded immediately after parsing.</li>
        <li>Individual line-item transactions; discarded after totals are confirmed.</li>
        <li>Payment card data; handled and stored exclusively by Stripe.</li>
        <li>Passwords; we use passwordless customer authentication (one-time email magic-link or Google OAuth); no customer passwords are ever stored.</li>
        <li>Bank login credentials; never seen or stored. Plaid handles authentication directly with your financial institution.</li>
        <li>Raw transaction data from Plaid; only the contribution/distribution totals are retained for filing reproduction; individual line items are discarded after review.</li>
      </ul>
    </LegalLayout>
  );
}
