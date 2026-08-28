import { mkdir, readdir } from "node:fs/promises";
import {
  sendAbandonedDraftReminderEmail,
  sendAdminLoginEmail,
  sendEinApplicationAdminEmail,
  sendEinApplicationConfirmationEmail,
  sendFaxDeliveredAdminEmail,
  sendFaxDeliveredEmail,
  sendFaxFailedAdminEmail,
  sendFaxFailedEmail,
  sendItinApplicationAdminEmail,
  sendItinApplicationConfirmationEmail,
  sendJanuaryReminderEmail,
  sendMagicLinkEmail,
  sendMarchReminderEmail,
  sendNewMessageToAdminEmail,
  sendNewMessageToCustomerEmail,
  sendNewOrderAdminEmail,
  sendOrderConfirmationEmail,
  sendPartnerApplicationAckEmail,
  sendPartnerApplicationAdminEmail,
  sendPartnerLoginEmail,
  sendWebsiteQuestionAdminEmail,
} from "../src/lib/email";

process.env.EMAIL_PREVIEW_DIR ||= "tmp-emails";

const previewDir = process.env.EMAIL_PREVIEW_DIR;
const baseUrl = "https://www.form5472prep.com";
const customerEmail = "maria.schmidt@example.com";
const adminEmail = "support@form5472prep.com";
const llcName = "Acme Ventures LLC";
const ownerName = "Maria Schmidt";
const taxYear = 2025;
const filingId = "filing_acme_2025_001";
const portalLink = `${baseUrl}/auth/sample-token`;
const adminFilingUrl = `${baseUrl}/admin/filings/${filingId}`;
const unsubscribeUrl = `${baseUrl}/api/email/unsubscribe?token=sample-unsubscribe-token`;
const proof = {
  faxId: "fax_01JABC5472PREVIEW",
  deliveredAt: "2026-03-12T14:32:00.000Z",
  pageCount: 8,
  durationSecs: 94,
  from: "+1 (307) 555-0142",
  to: "+1 (855) 887-7737",
};

export async function main() {
await mkdir(previewDir, { recursive: true });

await sendMagicLinkEmail(customerEmail, portalLink, `${llcName} — ${taxYear}`);
await sendPartnerLoginEmail(customerEmail, `${baseUrl}/partners/auth/sample-token`, ownerName);
await sendPartnerApplicationAckEmail(customerEmail, ownerName);
await sendOrderConfirmationEmail({
  email: customerEmail,
  llcName,
  taxYears: [taxYear],
  tier: "standard",
  amountPaidCents: 14900,
  faxService: true,
  portalLink,
  receiptUrl: "https://pay.stripe.com/receipts/sample-receipt",
  filingId,
  pdfBytes: new Uint8Array([37, 80, 68, 70]),
  pdfFilename: `form5472-${taxYear}.pdf`,
  signatures: [{ label: "Owner signature", page: 2, instruction: "Sign and date Part IV" }],
  isFinalReturn: true,
  dueDateText: "April 15, 2026",
});
await sendFaxDeliveredEmail({
  email: customerEmail,
  llcName,
  taxYears: [taxYear],
  portalLink,
  proof,
  signedPdfBytes: new Uint8Array([37, 80, 68, 70]),
  receiptPdfBytes: new Uint8Array([37, 80, 68, 70]),
});
await sendNewOrderAdminEmail({
  adminEmail,
  customerEmail,
  llcName,
  taxYears: [taxYear],
  filingId,
  adminFilingUrl,
  tier: "standard",
  amountPaidCents: 14900,
  isTestOrder: false,
  pdfGenerated: true,
});
await sendFaxDeliveredAdminEmail({
  adminEmail,
  customerEmail,
  llcName,
  taxYears: [taxYear],
  filingId,
  adminFilingUrl,
  proof,
  receiptPdfBytes: new Uint8Array([37, 80, 68, 70]),
  signedPdfBytes: new Uint8Array([37, 80, 68, 70]),
});
await sendFaxFailedAdminEmail({
  adminEmail,
  customerEmail,
  llcName,
  taxYears: [taxYear],
  filingId,
  adminFilingUrl,
  faxId: "fax_01JFAILED5472",
  failureReason: "The destination line did not answer",
  deliveryAttempts: 3,
});
await sendFaxFailedEmail({ email: customerEmail, llcName, taxYears: [taxYear], portalLink });
await sendNewMessageToCustomerEmail({
  email: customerEmail,
  llcName,
  taxYears: [taxYear],
  bodyExcerpt: "Please confirm the LLC formation date shown in your filing.",
  portalLink,
});
await sendNewMessageToAdminEmail({
  adminEmail,
  customerEmail,
  llcName,
  taxYears: [taxYear],
  filingId,
  adminFilingUrl,
  bodyExcerpt: "The LLC was formed on February 14, 2025.",
});
await sendJanuaryReminderEmail({
  email: customerEmail,
  taxYearToFile: taxYear,
  previousLlcNames: [llcName],
  startLink: `${baseUrl}/start?taxYear=${taxYear}`,
  unsubscribeUrl,
});
await sendMarchReminderEmail({
  email: customerEmail,
  taxYearToFile: taxYear,
  previousLlcNames: [llcName],
  startLink: `${baseUrl}/start?taxYear=${taxYear}`,
  unsubscribeUrl,
});
await sendAbandonedDraftReminderEmail({
  email: customerEmail,
  llcName,
  resumeLink: `${baseUrl}/filings/${filingId}`,
  unsubscribeUrl,
});
await sendEinApplicationAdminEmail({
  adminEmail,
  fullName: ownerName,
  email: customerEmail,
  phone: "+49 30 5550 5472",
  llcName,
  llcState: "Wyoming",
  llcFormedDate: "2025-02-14",
  businessPurpose: "Software consulting",
  ownerName,
  ownerCitizenship: "German",
  ownerResidence: "Germany",
  passportNumber: "C01X23456",
  notes: "Applicant would like the EIN confirmation sent electronically.",
});
await sendEinApplicationConfirmationEmail({ email: customerEmail, fullName: ownerName, llcName, portalLink });
await sendItinApplicationAdminEmail({
  adminEmail,
  fullName: ownerName,
  email: customerEmail,
  phone: "+49 30 5550 5472",
  dateOfBirth: "1988-06-21",
  countryOfBirth: "Germany",
  citizenship: "German",
  countryOfResidence: "Germany",
  itinReason: "Nonresident alien filing a US federal tax return",
  taxReturnType: "Form 1040-NR",
  usActivity: "Owner of a US single-member LLC",
  passportNumber: "C01X23456",
  passportExpiry: "2031-06-20",
  notes: "Applicant prefers a morning CAA appointment.",
});
await sendItinApplicationConfirmationEmail({ email: customerEmail, fullName: ownerName, portalLink });
await sendWebsiteQuestionAdminEmail({
  adminEmail,
  name: ownerName,
  email: customerEmail,
  message: "Could you confirm whether the standard plan includes the IRS fax transmission receipt for my filing?",
  topicLabel: "Pre-sales question",
  pageUrl: `${baseUrl}/pricing`,
});
await sendAdminLoginEmail({
  email: adminEmail,
  link: `${baseUrl}/admin/v1/auth/sample-token`,
  appLink: "form5472admin://auth/sample-token",
});
await sendPartnerApplicationAdminEmail({
  adminEmail,
  name: ownerName,
  email: customerEmail,
  company: "Schmidt Tax Advisory GmbH",
  phone: "+49 30 5550 5472",
  notes: "Supports international founders with US reporting obligations.",
  adminPartnersUrl: `${baseUrl}/admin/partners`,
});

const files = (await readdir(previewDir)).filter((file) => file.endsWith(".html") || file.endsWith(".txt")).sort();
console.log(`\nWrote ${files.length} preview files to ${previewDir}:`);
for (const file of files) console.log(`- ${file}`);
}

export const previewPromise = main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
  throw error;
});
