import { NextResponse } from "next/server";
import { FilingStatus, type Prisma } from "@prisma/client";
import { isAdmin } from "@/lib/admin/auth";
import { packageFilingSelect } from "@/lib/admin/filingActions";
import { generatePackage } from "@/lib/pdf/generatePackage";
import { filingToPackageInput, type PackageFilingRow } from "@/lib/pdf/packageInput";
import { runPreflight } from "@/lib/pdf/preflight";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

type SweepResult = "passed" | "needs_review" | "failed" | "error";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;
const SWEEP_TIME_BUDGET_MS = 100_000;
const POSSIBLE_ZERO_TOTAL_SINCE = new Date("2026-09-21T21:12:00.000Z");

type SweepFiling = PackageFilingRow & { id: string; preflightStatus: string | null };

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const startedAt = Date.now();
  const limit = parseLimit(req);
  const firstSectionWhere: Prisma.FilingWhereInput = {
    generatedPdfKey: { not: null },
    status: {
      notIn: [
        FilingStatus.SIGNED_UPLOADED,
        FilingStatus.FAXED,
        FilingStatus.CONFIRMED,
      ],
    },
  };
  const candidateCount = await prisma.filing.count({ where: firstSectionWhere });
  const filings = await prisma.filing.findMany({
    where: firstSectionWhere,
    select: {
      id: true,
      preflightStatus: true,
      ...packageFilingSelect,
      yearData: {
        ...packageFilingSelect.yearData,
        orderBy: { taxYear: "asc" as const },
      },
    },
    take: limit,
    orderBy: { updatedAt: "asc" },
  }) as SweepFiling[];

  const results: Array<{
    filingId: string;
    storedPreflightStatus: string | null;
    sweepResult: SweepResult;
    failedAssertionIds: string[];
    warningIds: string[];
    errorMessage?: string;
  }> = [];

  let skippedForTime = 0;
  for (let index = 0; index < filings.length; index += 1) {
    if (Date.now() - startedAt > SWEEP_TIME_BUDGET_MS) {
      skippedForTime = filings.length - index;
      break;
    }
    const filing = filings[index];
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

  const possibleZeroTotalSince = await possibleZeroTotalReport(limit);

  return NextResponse.json(
    {
      checkedAt: new Date().toISOString(),
      limit,
      candidatesFound: candidateCount,
      processed: results.length,
      skippedForLimit: Math.max(0, candidateCount - filings.length),
      skippedForTime,
      totalChecked: results.length,
      cappedAt200: limit === 200 && filings.length === 200,
      results,
      possibleZeroTotalSince,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

function parseLimit(req: Request): number {
  const raw = new URL(req.url).searchParams.get("limit");
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_LIMIT;
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

async function possibleZeroTotalReport(limit: number) {
  const where = {
    generatedPdfKey: { not: null },
    preflightCheckedAt: { gte: POSSIBLE_ZERO_TOTAL_SINCE },
  };
  const candidateCount = await prisma.filing.count({ where });
  const filings = await prisma.filing.findMany({
    where,
    select: {
      id: true,
      status: true,
      yearData: {
        select: {
          taxYear: true,
          contributions: true,
          distributions: true,
          reportableTransactions: true,
          ownerPaidCosts: true,
        },
        orderBy: { taxYear: "asc" as const },
      },
    },
    take: limit,
    orderBy: { preflightCheckedAt: "asc" },
  });

  const results = filings.flatMap((filing) => {
    const affectedYears = filing.yearData
      .map((year) => possibleZeroTotalYear(year))
      .filter((year): year is NonNullable<ReturnType<typeof possibleZeroTotalYear>> => year !== null);
    if (affectedYears.length === 0) return [];
    return [{
      filingId: filing.id,
      status: filing.status,
      affectedYears,
    }];
  });

  return {
    since: POSSIBLE_ZERO_TOTAL_SINCE.toISOString(),
    limit,
    candidatesFound: candidateCount,
    processed: filings.length,
    skippedForLimit: Math.max(0, candidateCount - filings.length),
    results,
  };
}

function possibleZeroTotalYear(year: {
  taxYear: number;
  contributions: unknown;
  distributions: unknown;
  reportableTransactions: unknown;
  ownerPaidCosts: unknown;
}) {
  const transactions = Array.isArray(year.reportableTransactions) ? year.reportableTransactions : [];
  const ownerPaidCosts = Array.isArray(year.ownerPaidCosts) ? year.ownerPaidCosts : [];
  const contributions = Number(year.contributions);
  const distributions = Number(year.distributions);
  const missingContributionRows =
    contributions > 0 &&
    !transactions.some((row) => transactionCategory(row) === "contribution") &&
    ownerPaidCosts.length === 0;
  const missingDistributionRows =
    distributions > 0 &&
    !transactions.some((row) => transactionCategory(row) === "distribution");

  if (!missingContributionRows && !missingDistributionRows) return null;
  return {
    taxYear: year.taxYear,
    storedLine1f: null,
    storedContributions: Number.isFinite(contributions) ? contributions : null,
    storedDistributions: Number.isFinite(distributions) ? distributions : null,
    missingContributionRows,
    missingDistributionRows,
  };
}

function transactionCategory(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const category = (value as { category?: unknown }).category;
  return typeof category === "string" ? category : null;
}

function redactCustomerData(message: string, filing: unknown): string {
  let clean = message;
  for (const value of collectStrings(filing)) {
    const trimmed = value.trim();
    if (trimmed.length < 3) continue;
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
