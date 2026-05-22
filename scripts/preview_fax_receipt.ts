// Generates a sample IRS Fax Transmission Receipt PDF for review.
// Writes to /tmp/fax-receipt-sample.pdf — open it to inspect the layout.
import { promises as fs } from "node:fs";
import { generateFaxReceiptPdf } from "../src/lib/pdf/faxReceipt";

async function main() {
  const bytes = await generateFaxReceiptPdf({
    filingId: "cmpenzypg0001ky04wz21hfr7",
    llcName: "East West Global Technology LLC",
    llcEin: "12-3456789",
    taxYears: [2024, 2025],
    ownerName: "John Smith",
    telnyxFaxId: "2b36a6a7-ad37-4d22-baad-a1ccc890224f",
    fromFax: "+19804901874",
    toFax: "+18558877737",
    submittedAtIso: "2026-05-21T02:34:35.000Z",
    deliveredAtIso: "2026-05-21T02:47:04.000Z",
    pageCount: 23,
  });
  const out = "/tmp/fax-receipt-sample.pdf";
  await fs.writeFile(out, bytes);
  console.log(`wrote ${bytes.length} bytes → ${out}`);
  console.log(`open with:  open ${out}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
