import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { packageFilingSelect } from "@/lib/admin/filingActions";
import { generatePackage } from "@/lib/pdf/generatePackage";
import { filingToPackageInput } from "@/lib/pdf/packageInput";
import { runPreflight } from "@/lib/pdf/preflight";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type SweepResult = "passed" | "needs_review" | "failed" | "error";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const filings = await prisma.filing.findMany({
    where: {
      generatedPdfKey: { not: null },
      status: { notIn: ["SIGNED_UPLOADED", "FAXED", "CONFIRMED"] },
    },
    select: {
      id: true,
      preflightStatus: true,
      ...packageFilingSelect,
      yearData: {
        ...packageFilingSelect.yearData,
        orderBy: { taxYear: "asc" as const },
      },
    },
    take: 200,
    orderBy: { updatedAt: "asc" },
  });

  const results: Array<{
    filingId: string;
    storedPreflightStatus: string | null;
    sweepResult: SweepResult;
    failedAssertionIds: string[];
    warningIds: string[];
    errorMessage?: string;
  }> = [];

  for (const filing of filings) {
    try {
      const pkg = await generatePackage(filingToPackageInput(filing));
      const preflight = await runPreflight(pkg.record, pkg.bytes);
      results.push({
        filingId: filing.id,
        storedPreflightStatus: filing.preflightStatus,
        sweepResult: preflight.ok
          ? preflight.warnings.length > 0 ? "needs_review" : "passed"
          : "failed",
        failedAssertionIds: preflight.failures.map((issue) => issue.id),
        warningIds: preflight.warnings.map((issue) => issue.id),
      });
    } catch (error) {
      results.push({
        filingId: filing.id,
        storedPreflightStatus: filing.preflightStatus,
        sweepResult: "error",
        failedAssertionIds: [],
        warningIds: [],
        errorMessage: redactCustomerData(error instanceof Error ? error.message : "unknown error", filing),
      });
    }
  }

  return NextResponse.json(
    {
      checkedAt: new Date().toISOString(),
      totalChecked: filings.length,
      cappedAt200: filings.length === 200,
      results,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

function redactCustomerData(message: string, filing: unknown): string {
  let clean = message;
  for (const value of collectStrings(filing)) {
    const trimmed = value.trim();
    if (trimmed.length < 3) continue;
    if (/^[A-Z0-9_]+$/.test(trimmed)) continue;
    clean = clean.split(trimmed).join("[redacted]");
  }
  return clean;
}

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  if (value instanceof Date) return [];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  return Object.values(value as Record<string, unknown>).flatMap(collectStrings);
}
