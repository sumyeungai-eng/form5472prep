import { NextResponse } from "next/server";
import { getOwnedFiling } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseBankCsv, parseBankExcel } from "@/lib/bank/parsers";
import { categorizeAll } from "@/lib/bank/categorize";
import { put, makeKey } from "@/lib/storage";

export const runtime = "nodejs";

export const maxDuration = 30;

const MAX_FILES_PER_YEAR = 13;
const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB

// Upload a bank statement (CSV or PDF) for one tax year of a filing.
// Returns the parsed + categorized transactions for client-side review.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const filing = await getOwnedFiling(params.id);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  const taxYearRaw = form.get("taxYear");
  if (!(file instanceof Blob) || typeof taxYearRaw !== "string")
    return NextResponse.json({ error: "file + taxYear required" }, { status: 400 });
  const taxYear = Number(taxYearRaw);
  if (!Number.isFinite(taxYear))
    return NextResponse.json({ error: "Invalid taxYear" }, { status: 400 });

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — max 15 MB` },
      { status: 413 },
    );
  }

  // Ensure the year-data row exists, then check the per-year statement count.
  const yd = await prisma.filingYearData.upsert({
    where: { filingId_taxYear: { filingId: filing.id, taxYear } },
    update: {},
    create: { filingId: filing.id, taxYear },
  });

  const existingCount = await prisma.bankStatement.count({
    where: { filingYearDataId: yd.id },
  });
  if (existingCount >= MAX_FILES_PER_YEAR) {
    return NextResponse.json(
      {
        error: `Already uploaded ${MAX_FILES_PER_YEAR} statements for ${taxYear}. Remove one before uploading another.`,
      },
      { status: 409 },
    );
  }

  const fileName = (file as File).name ?? "statement";
  const lower = fileName.toLowerCase();
  const isExcel =
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel" ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".xls");
  const isCsv =
    file.type === "text/csv" || lower.endsWith(".csv") || (!isExcel && file.type === "");

  if (!isCsv && !isExcel) {
    return NextResponse.json(
      { error: "Only CSV or Excel (.xlsx / .xls) files are accepted." },
      { status: 415 },
    );
  }

  // Parse based on the file type. CSV uses Papa Parse; Excel uses SheetJS to
  // convert the first sheet to CSV text, then reuses the same pipeline.
  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = isExcel
    ? parseBankExcel(buffer)
    : parseBankCsv(buffer.toString("utf8"));

  // Drop transactions outside the requested tax year.
  const filtered = parsed.transactions.filter((t) => t.date.startsWith(String(taxYear)));

  // Year-mismatch UX: when the parser found transactions but the year filter
  // dropped them all, tell the user clearly which year(s) the statement
  // actually covers so they know to re-upload or change the tax year.
  if (parsed.transactions.length > 0 && filtered.length === 0) {
    const years = Array.from(
      new Set(parsed.transactions.map((t) => t.date.slice(0, 4)).filter(Boolean)),
    ).sort();
    const yearLabel =
      years.length === 1 ? `tax year ${years[0]}` : `years ${years.join(", ")}`;
    // Replace the previous "Parsed N transactions..." warning with a clearer
    // one — the count is misleading once we filter to zero.
    parsed.warnings = [
      `This statement covers ${yearLabel}, but the filing is for ${taxYear}. ${parsed.transactions.length} transactions were extracted but skipped. Upload a statement for ${taxYear} instead, or change the tax year on the previous step.`,
    ];
  }

  const categorized = categorizeAll(filtered, {
    fullName: filing.ownerName ?? "",
    aliases: [],
  });

  // Persist the raw file to storage for audit.
  const key = makeKey(`statements/${filing.id}/${taxYear}/${Date.now()}_${fileName}`);
  const contentType = isExcel
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv";
  await put(key, new Uint8Array(buffer), contentType);

  const stmt = await prisma.bankStatement.create({
    data: {
      filingYearDataId: yd.id,
      fileKey: key,
      fileName,
      bankProvider: parsed.provider,
      parseResult: { transactions: categorized, warnings: parsed.warnings },
    },
  });

  return NextResponse.json({
    statementId: stmt.id,
    provider: parsed.provider,
    warnings: parsed.warnings,
    transactions: categorized,
    fileName,
    fileType: isExcel ? "excel" : "csv",
    uploadedCount: existingCount + 1,
    limit: MAX_FILES_PER_YEAR,
  });
}
