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
    <LegalLayout title="Data Retention Policy" lastUpdated="2026-11-24">
      <h2>Our principle</h2>
      <p>
        We keep the data needed to prepare, file and support your filing, and delete it when you ask, except records we are required to keep, such as payment records. Uploaded bank statement files
        and the transactions taken from them are stored with your filing records. Your signed forms,
        the exact PDF we fax to the IRS, and the fax receipt are kept in your account for
        up to 7 years; we delete them sooner if you ask.
      </p>

      <h2>Bank statements and Plaid connections</h2>
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
            <td>Uploaded bank statement files (CSV or Excel only)</td>
            <td>Kept with your filing records; deleted on request</td>
            <td>Stored in Cloudflare R2; not deleted automatically. Removing a statement in the wizard deletes its database record, but not the stored file</td>
          </tr>
          <tr>
            <td>Categorized transaction rows from uploaded statements</td>
            <td>Kept with your filing records; deleted on request</td>
            <td>Every categorized row is stored in the statement&apos;s database record; there is no automatic deletion</td>
          </tr>
          <tr>
            <td>Confirmed transaction rows imported via Plaid</td>
            <td>Kept with your filing records; deleted on request</td>
            <td>Transactions are fetched for review; only rows you confirm are saved with your filing</td>
          </tr>
          <tr>
            <td>Plaid bank name and import record</td>
            <td>Kept with your filing records; deleted on request</td>
            <td>For new imports, we use your Plaid connection once to import that year&apos;s transactions, then ask Plaid to disconnect it. We keep the bank&apos;s name and the transactions you confirm with your filing; we don&apos;t keep the access token.</td>
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
            <td>Kept with your filing records; deleted on request</td>
            <td>Stored for review of the related filing; deleted only on request or manually</td>
          </tr>
          <tr>
            <td>Other uploaded filing documents</td>
            <td>Kept with your filing records; deleted on request</td>
            <td>Stored with the filing; deleted only on request or manually</td>
          </tr>
          <tr>
            <td>Generated unsigned PDFs</td>
            <td>Kept with your filing records; deleted on request</td>
            <td>Saved for staff review and release; downloading does not delete the PDF</td>
          </tr>
          <tr>
            <td>Records of what was signed and when, including consent version</td>
            <td>Kept with your filing records; deleted on request</td>
            <td>Proof of the signed authorization and the version of the wording agreed</td>
          </tr>
          <tr>
            <td>IP address and browser recorded at signing</td>
            <td>Kept with your filing records; deleted on request</td>
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
            <td>Sign-in links</td>
            <td>Links expire after 7 days</td>
            <td>Reusable until they expire</td>
          </tr>
          <tr>
            <td>Signature images</td>
            <td>Kept with your filing records; deleted on request</td>
            <td>Stored with the filing to support your signed return</td>
          </tr>
          <tr>
            <td>Support message attachments</td>
            <td>Kept with your filing records; deleted on request</td>
            <td>Stored with the filing to resolve support requests; deleted only on request or manually</td>
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
        requests, contact us as described below. Removing a bank statement in the wizard
        deletes only its database record, not the uploaded file in R2.
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
        <li>Payment card data; handled and stored exclusively by Stripe.</li>
        <li>Passwords; we use passwordless customer authentication (email sign-in links that are reusable until they expire after 7 days, or Google OAuth); no customer passwords are ever stored.</li>
        <li>Bank login credentials; never seen or stored. Plaid handles authentication directly with your financial institution.</li>
      </ul>
    </LegalLayout>
  );
}
