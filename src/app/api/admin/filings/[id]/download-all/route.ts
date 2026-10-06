import { NextResponse } from "next/server";
import { zipSync } from "fflate";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { get } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET /api/admin/filings/[id]/download-all
//
// Admin "Download customer uploads": everything the CUSTOMER uploaded for this
// filing, in one ZIP, for the accountant's review — supporting documents,
// bank statements (per tax year), files they attached in the message thread,
// Form 7004 extension proof and the dissolution certificate. Our own generated
// documents (packages, signed/faxed PDFs, receipts, signatures) are NOT
// included; those have their own buttons. A README lists what's inside.
// Files are STOREd, not deflated (PDFs/images are already compressed).

type Entry = { folder: string; key: string; fileName: string; note: string };

function safeName(value: string): string {
  return value.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_").replace(/\s+/g, " ").trim().slice(0, 120) || "file";
}

function extOf(key: string): string {
  const m = key.match(/\.([A-Za-z0-9]{2,5})$/);
  return m ? `.${m[1].toLowerCase()}` : "";
}

// Keep the customer's own file name; add the stored extension if theirs lacks one.
function displayName(original: string | null | undefined, key: string, fallback: string): string {
  const base = safeName(original?.trim() || fallback);
  return /\.[A-Za-z0-9]{2,5}$/.test(base) ? base : `${base}${extOf(key)}`;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      llcName: true,
      taxYears: true,
      extensionProofKey: true,
      dissolutionCertKey: true,
      documents: {
        where: { uploadedBy: "customer" },
        orderBy: { createdAt: "asc" },
        select: { fileKey: true, fileName: true, createdAt: true },
      },
      yearData: {
        orderBy: { taxYear: "asc" },
        select: {
          taxYear: true,
          bankStatements: {
            orderBy: { uploadedAt: "asc" },
            select: { fileKey: true, fileName: true, uploadedAt: true },
          },
        },
      },
      messages: {
        where: { fromAdmin: false, attachmentKey: { not: null } },
        orderBy: { createdAt: "asc" },
        select: { attachmentKey: true, attachmentName: true, createdAt: true },
      },
    },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });

  const day = (d: Date) => d.toISOString().slice(0, 10);
  const entries: Entry[] = [
    ...filing.documents.map((d) => ({
      folder: "Documents",
      key: d.fileKey,
      fileName: displayName(d.fileName, d.fileKey, "document"),
      note: `uploaded ${day(d.createdAt)}`,
    })),
    ...filing.yearData.flatMap((y) =>
      y.bankStatements.map((s) => ({
        folder: `Bank statements/${y.taxYear}`,
        key: s.fileKey,
        fileName: displayName(s.fileName, s.fileKey, "statement"),
        note: `tax year ${y.taxYear}, uploaded ${day(s.uploadedAt)}`,
      })),
    ),
    ...filing.messages.map((m) => ({
      folder: "Message attachments",
      key: m.attachmentKey!,
      fileName: `${day(m.createdAt)} ${displayName(m.attachmentName, m.attachmentKey!, "attachment")}`,
      note: `sent with a message on ${day(m.createdAt)}`,
    })),
    ...(filing.extensionProofKey
      ? [{ folder: "Extension proof", key: filing.extensionProofKey, fileName: displayName(null, filing.extensionProofKey, "form-7004-extension-proof"), note: "Form 7004 extension proof" }]
      : []),
    ...(filing.dissolutionCertKey
      ? [{ folder: "Dissolution certificate", key: filing.dissolutionCertKey, fileName: displayName(null, filing.dissolutionCertKey, "dissolution-certificate"), note: "certificate of dissolution/cancellation" }]
      : []),
  ];

  if (entries.length === 0) {
    return NextResponse.json({ error: "The customer hasn't uploaded any files for this filing." }, { status: 404 });
  }

  const files: Record<string, Uint8Array> = {};
  const included: string[] = [];
  const failed: string[] = [];
  for (const entry of entries) {
    // Two uploads with the same name in one folder get " (2)", " (3)"…
    let path = `${entry.folder}/${entry.fileName}`;
    for (let n = 2; files[path]; n++) {
      path = `${entry.folder}/${entry.fileName.replace(/(\.[A-Za-z0-9]{2,5})?$/, ` (${n})$1`)}`;
    }
    try {
      files[path] = await get(entry.key);
      included.push(`${path} (${entry.note})`);
    } catch {
      failed.push(`${path} (${entry.note}): file missing from storage`);
    }
  }

  const base = safeName(`${filing.llcName ?? "filing"} ${filing.taxYears.join("-")} customer uploads`).replace(/ /g, "_");
  files["README.txt"] = new TextEncoder().encode(
    [
      `Customer uploads for ${filing.llcName ?? "(no LLC name)"} — tax year(s) ${filing.taxYears.join(", ")}`,
      `Filing ID: ${filing.id}`,
      `Downloaded: ${new Date().toISOString()}`,
      "",
      `Included (${included.length}):`,
      ...included.map((l) => `  - ${l}`),
      ...(failed.length ? ["", "Could not be included:", ...failed.map((l) => `  - ${l}`)] : []),
      "",
    ].join("\n"),
  );

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
