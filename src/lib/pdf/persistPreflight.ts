import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PreflightIssue, PreflightResult } from "./preflight";

// ONE place that turns a pre-flight result into Filing columns (spec item 1,
// orchestrator decision D11). Used by every trigger: the Stripe webhook, the
// $0 checkout tier, the customer generate-pdf route, the admin regenerate,
// resend-confirmation and re-run actions. Pre-flight is staff-only data: these
// columns are stripped from every customer API (toClientFiling).

export type PreflightColumns = {
  preflightStatus: "passed" | "failed";
  preflightFailures: Prisma.InputJsonValue;
  preflightWarnings: Prisma.InputJsonValue;
  preflightCheckedAt: Date;
};

export function preflightResultColumns(preflight: PreflightResult, checkedAt: Date = new Date()): PreflightColumns {
  return {
    preflightStatus: preflight.ok ? "passed" : "failed",
    preflightFailures: toJson(preflight.failures),
    preflightWarnings: toJson(preflight.warnings),
    preflightCheckedAt: checkedAt,
  };
}

export const CLEARED_PREFLIGHT_OVERRIDE = {
  preflightOverrideBy: null,
  preflightOverrideAt: null,
  preflightOverrideReason: null,
} as const;

// A NEW package was stored (fresh generation): its pre-flight result replaces
// the old one, and an override recorded for an earlier package never carries
// over. `data` holds the caller's other columns for the same single update
// (generatedPdfKey, status, review reset, ...).
export async function persistNewPackagePreflight(opts: {
  filingId: string;
  preflight: PreflightResult;
  record: { generatorVersion: string; commit: string };
  data?: Prisma.FilingUpdateInput;
  checkedAt?: Date;
}): Promise<void> {
  await prisma.filing.update({
    where: { id: opts.filingId },
    data: {
      ...(opts.data ?? {}),
      ...preflightResultColumns(opts.preflight, opts.checkedAt),
      ...CLEARED_PREFLIGHT_OVERRIDE,
      generatorVersion: opts.record.generatorVersion,
      generatorCommit: opts.record.commit,
    },
    select: { id: true },
  });
}

// Identity of a finding for the override rule. The message is part of it: two
// A26 findings for different years (or quoting different phrases) are
// different findings, and an override approves only what the admin saw.
export function preflightIssueKey(issue: PreflightIssue): string {
  return `${issue.id}\u0000${issue.message}`;
}

export function preflightIssues(value: unknown): PreflightIssue[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is PreflightIssue =>
      !!item &&
      typeof item === "object" &&
      typeof (item as { id?: unknown }).id === "string" &&
      typeof (item as { message?: unknown }).message === "string",
  );
}

// Override rule on a re-run (D11): a recorded "approve despite pre-flight
// failures" survives only while every current failure is one the admin
// approved when recording it. Any new or changed failure clears it.
export function overrideCoversFailures(approved: PreflightIssue[], current: PreflightIssue[]): boolean {
  const approvedKeys = new Set(approved.map(preflightIssueKey));
  return current.every((issue) => approvedKeys.has(preflightIssueKey(issue)));
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
