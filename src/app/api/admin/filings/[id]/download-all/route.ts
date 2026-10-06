import { NextResponse } from "next/server";
import { zipSync } from "fflate";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { get } from "@/lib/storage";
import { faxReceiptKey } from "@/lib/fax/finalize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/admin/filings/[id]/download-all
//
// Admin "Download all": every stored document for one filing in a single ZIP —
// the current package, the signed PDF, the exact bytes faxed, the fax receipt,
// the client's signature, any extension proof / dissolution certificate, and
// files attached to the filing's message thread. A README lists what is
// included and what was not on file. Read-only: nothing is regenerated.
// Files are STOREd, not deflated (PDFs/images are already compressed).

type Entry = { label: string; key: string | null | undefined; name: string };

function safePart(value: string): string {
  return value.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80) || "file";
}

function extOf(key: string, fallback: string): string {
  const m = key.match(/\.([A-Za-z0-9]{2,5})$/);
  return m ? m[1].toLowerCase() : fallback;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      llcName: true,
      taxYears: true,
      generatedPdfKey: true,
      signedPdfKey: true,
      faxedPdfKey: true,
      signaturePngKey: true,
      extensionProofKey: true,
      dissolutionCertKey: true,
      messages: {
        where: { attachmentKey: { not: null } },
        orderBy: { createdAt: "asc" },
        select: { attachmentKey: true, attachmentName: true, createdAt: true, fromAdmin: true },
      },
    },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });

  const entries: Entry[] = [
    { label: "Filing package (current, unsigned/reviewed)", key: filing.generatedPdfKey, name: "01_package_unsigned" },
    { label: "Signed package", key: filing.signedPdfKey, name: "02_package_signed" },
    { label: "Faxed package (exact bytes sent to the IRS)", key: filing.faxedPdfKey, name: "03_package_faxed" },
    { label: "IRS fax transmission receipt", key: faxReceiptKey(filing.id), name: "04_fax_receipt" },
    { label: "Client signature", key: filing.signaturePngKey, name: "05_client_signature" },
    { label: "Form 7004 extension proof", key: filing.extensionProofKey, name: "06_extension_proof" },
    { label: "Dissolution certificate", key: filing.dissolutionCertKey, name: "07_dissolution_certificate" },
    ...filing.messages.map((m, i) => ({
      label: `Message attachment from ${m.fromAdmin ? "admin" : "client"} (${m.createdAt.toISOString().slice(0, 10)})`,
      key: m.attachmentKey,
      name: `08_attachment_${String(i + 1).padStart(2, "0")}_${safePart((m.attachmentName ?? "file").replace(/\.[A-Za-z0-9]{2,5}$/, ""))}`,
    })),
  ];

  const files: Record<string, Uint8Array> = {};
  const included: string[] = [];
  const missing: string[] = [];
  for (const entry of entries) {
    if (!entry.key) {
      missing.push(`${entry.label}: not on file`);
      continue;
    }
    try {
      const bytes = await get(entry.key);
      const fileName = `${entry.name}.${extOf(entry.key, "bin")}`;
      files[fileName] = bytes;
      included.push(`${fileName} — ${entry.label}`);
    } catch {
      // The fax receipt key is derived, so "not stored yet" lands here too.
      missing.push(`${entry.label}: not found in storage`);
    }
  }

  const base = safePart(`${filing.llcName ?? "filing"}_${filing.taxYears.join("-")}_${filing.id}`);
  const readme = [
    `Documents for ${filing.llcName ?? "(no LLC name)"} — tax year(s) ${filing.taxYears.join(", ")}`,
    `Filing ID: ${filing.id}`,
    `Downloaded: ${new Date().toISOString()}`,
    "",
    "Included:",
    ...(included.length ? included.map((l) => `  - ${l}`) : ["  (none)"]),
    "",
    "Not included:",
    ...(missing.length ? missing.map((l) => `  - ${l}`) : ["  (nothing missing)"]),
    "",
  ].join("\n");
  files["README.txt"] = new TextEncoder().encode(readme);

  const zip = zipSync(
    Object.fromEntries(Object.entries(files).map(([name, bytes]) => [`${base}/${name}`, [bytes, { level: 0 }]])),
  );

  return new NextResponse(Buffer.from(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${base}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
