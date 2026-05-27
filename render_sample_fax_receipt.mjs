// Throwaway script: generate a sample IRS fax-transmission receipt PDF using
// the exact same code that ships customers' real receipts, then rasterize
// to PNG for embedding on the marketing site. Run once with `node`, then
// delete.

import fs from "node:fs/promises";
import { execSync } from "node:child_process";

// Dynamic import so the script doesn't crash if invoked from a node
// version that hasn't transpiled the TS file yet. We run from the repo
// root where tsx/ts-node would also work, but pdf-lib is plain JS so
// importing the .ts via the build output isn't needed — we re-implement
// the call here by spawning a tiny TSX wrapper.

const tsCode = `
import { generateFaxReceiptPdf } from "./src/lib/pdf/faxReceipt";
import fs from "node:fs/promises";

(async () => {
  const bytes = await generateFaxReceiptPdf({
    filingId: "cmpdemoz000000sample",
    llcName: "East West Global Technology LLC",
    llcEin: "37-1234567",
    taxYears: [2025],
    ownerName: "Sample Customer",
    telnyxFaxId: "fax_01HZSAMPLE-DEMO-RECEIPT",
    fromFax: "+1-307-555-0100",
    toFax: "+1-855-887-7737",
    submittedAtIso: "2026-03-14T14:32:17Z",
    deliveredAtIso: "2026-03-14T14:34:52Z",
    pageCount: 9,
  });
  await fs.writeFile("/tmp/sample-fax-receipt.pdf", bytes);
  console.log("PDF written: /tmp/sample-fax-receipt.pdf, " + bytes.length + " bytes");
})();
`;

await fs.writeFile("/tmp/gen_sample.ts", tsCode);
execSync("npx tsx /tmp/gen_sample.ts", { stdio: "inherit" });

// Rasterize PDF page 1 → PNG via macOS sips (Quartz). Default DPI of 72
// looks blurry on retina; ask for a width-targeted resize for crispness.
execSync("sips -s format png -s formatOptions best -Z 1600 /tmp/sample-fax-receipt.pdf --out public/sample-fax-receipt.png", { stdio: "inherit" });

console.log("\n✓ public/sample-fax-receipt.png written");
