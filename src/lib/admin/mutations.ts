import { Prisma } from "@prisma/client";
import type { FilingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const FILING_STATUS_TRANSITIONS: Record<FilingStatus, FilingStatus[]> = {
  DRAFT: ["PAID", "FAILED"],
  PAID: ["PDF_GENERATED", "FAILED"],
  PDF_GENERATED: ["SIGNATURE_PENDING", "PAID", "FAILED"],
  SIGNATURE_PENDING: ["SIGNED_UPLOADED", "PDF_GENERATED", "FAILED"],
  SIGNED_UPLOADED: ["FAXED", "SIGNATURE_PENDING", "FAILED"],
  FAXED: ["CONFIRMED", "FAILED"],
  CONFIRMED: ["FAILED"],
  FAILED: [
    "PAID",
    "PDF_GENERATED",
    "SIGNATURE_PENDING",
    "SIGNED_UPLOADED",
    "FAXED",
    "CONFIRMED",
  ],
};

export function isLegalTransition(from: FilingStatus, to: FilingStatus): boolean {
  return from === to || FILING_STATUS_TRANSITIONS[from].includes(to);
}

export class TransitionError extends Error {
  readonly from: FilingStatus;
  readonly to: FilingStatus;

  constructor(from: FilingStatus, to: FilingStatus) {
    super(`Illegal filing status transition from ${from} to ${to}`);
    this.name = "TransitionError";
    this.from = from;
    this.to = to;
  }
}

export class IdempotencyConflictError extends Error {
  constructor() {
    super("An operation with this idempotency key is already in progress");
    this.name = "IdempotencyConflictError";
  }
}

type StoredResult = {
  result?: Prisma.JsonValue;
  resultWasUndefined: boolean;
};

function encodeResult(result: unknown): Prisma.InputJsonObject {
  return JSON.parse(
    JSON.stringify({ result, resultWasUndefined: result === undefined }),
  ) as Prisma.InputJsonObject;
}

function decodeResult<T>(stored: Prisma.JsonValue): T {
  const envelope = stored as StoredResult;
  return (envelope.resultWasUndefined ? undefined : envelope.result) as T;
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function withIdempotency<T>(opts: {
  key: string | null;
  scope: string;
  adminId: string | null;
  ttlSeconds?: number;
  run: () => Promise<T>;
}): Promise<{ result: T; replayed: boolean }> {
  if (opts.key === null) {
    return { result: await opts.run(), replayed: false };
  }

  const ttlSeconds = opts.ttlSeconds ?? 24 * 60 * 60;
  let reservation: { id: string };

  while (true) {
    const now = new Date();

    try {
      reservation = await prisma.idempotencyRecord.create({
        data: {
          key: opts.key,
          scope: opts.scope,
          adminId: opts.adminId,
          expiresAt: new Date(now.getTime() + ttlSeconds * 1_000),
        },
        select: { id: true },
      });
      break;
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;

      const existing = await prisma.idempotencyRecord.findUnique({
        where: { scope_key: { scope: opts.scope, key: opts.key } },
      });

      // A concurrent expiry cleanup may remove the row between the failed
      // insert and this lookup. In that case, simply retry the atomic insert.
      if (!existing) continue;

      if (existing.expiresAt <= now) {
        await prisma.idempotencyRecord.deleteMany({
          where: { id: existing.id, expiresAt: { lte: now } },
        });
        continue;
      }

      if (existing.resultJson !== null) {
        return { result: decodeResult<T>(existing.resultJson), replayed: true };
      }

      throw new IdempotencyConflictError();
    }
  }

  let result: T;
  try {
    result = await opts.run();
  } catch (error) {
    await prisma.idempotencyRecord.deleteMany({
      where: { id: reservation.id, resultJson: { equals: Prisma.DbNull } },
    });
    throw error;
  }

  // Keep the reservation if result serialization or persistence fails. The
  // operation may already have produced an external side effect, so allowing
  // an immediate retry would be unsafe.
  await prisma.idempotencyRecord.update({
    where: { id: reservation.id },
    data: { resultJson: encodeResult(result) },
  });

  return { result, replayed: false };
}

function jsonColumnValue(value: unknown) {
  if (value === undefined) return Prisma.DbNull;
  if (value === null) return Prisma.JsonNull;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function logFilingChange(opts: {
  filingId: string;
  adminId: string | null;
  source: string;
  field: string;
  before: unknown;
  after: unknown;
  reason?: string;
  tx?: unknown;
}): Promise<void> {
  const client = (opts.tx ?? prisma) as Pick<
    Prisma.TransactionClient,
    "filingChangeLog"
  >;

  await client.filingChangeLog.create({
    data: {
      filingId: opts.filingId,
      adminId: opts.adminId,
      source: opts.source,
      field: opts.field,
      beforeJson: jsonColumnValue(opts.before),
      afterJson: jsonColumnValue(opts.after),
      reason: opts.reason ?? null,
    },
  });
}
