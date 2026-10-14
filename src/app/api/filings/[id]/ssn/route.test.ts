import crypto from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// POST /api/filings/[id]/ssn end to end with the REAL validation, encryption,
// change-log write and admin email template; only the database, the session
// lookup, the rate limiter, the pre-flight re-run and Resend's HTTP API are
// stubbed. Synthetic SSN only (123-45-6789), never a real one.

const SSN = "123-45-6789";
const DIGITS = "123456789";

type Row = Record<string, unknown> & { id: string; status: string };

const state = vi.hoisted(() => ({
  filings: new Map<string, Record<string, unknown>>(),
  changeLog: [] as Array<Record<string, unknown>>,
  owned: null as null | { id: string },
}));

const prismaMock = vi.hoisted(() => {
  const pick = (row: Record<string, unknown>, select?: Record<string, unknown>) => {
    if (!select) return { ...row };
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(select)) out[key] = row[key];
    return out;
  };
  const filing = {
    findUnique: vi.fn(async ({ where, select }: { where: { id: string }; select?: Record<string, unknown> }) => {
      const row = state.filings.get(where.id);
      return row ? pick(row, select) : null;
    }),
    updateMany: vi.fn(
      async ({ where, data }: { where: { id: string; status?: { notIn?: string[] } }; data: Record<string, unknown> }) => {
        const row = state.filings.get(where.id);
        if (!row) return { count: 0 };
        if (where.status?.notIn?.includes(row.status as string)) return { count: 0 };
        Object.assign(row, data);
        return { count: 1 };
      },
    ),
  };
  const filingChangeLog = {
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      state.changeLog.push({ ...data, changedAt: new Date() });
      return { id: `log_${state.changeLog.length}` };
    }),
    count: vi.fn(async ({ where }: { where: { filingId: string; field: string; source: string } }) =>
      state.changeLog.filter((r) => r.filingId === where.filingId && r.field === where.field && r.source === where.source).length,
    ),
  };
  const client = {
    filing,
    filingChangeLog,
    emailLog: { create: vi.fn(async () => ({ id: "email_log_1" })) },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(client)),
  };
  return client;
});

const rerun = vi.hoisted(() => ({
  rerunPreflightAfterOwnerSsnChange: vi.fn(async (..._args: unknown[]) => ({ ran: true, status: "passed" })),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/session", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/session")>();
  return { ...actual, getOwnedFiling: vi.fn(async () => state.owned) };
});
vi.mock("@/lib/rateLimit", () => ({ rateLimit: vi.fn(async () => ({ ok: true, retryAfterSec: 0 })) }));
vi.mock("@/lib/admin/filingActions", () => rerun);
vi.mock("@/lib/env", () => ({
  env: { appUrl: "https://example.test", adminEmail: "admin@example.test", supportEmail: "support@example.test" },
}));

import { POST } from "./route";
import { decryptPii } from "@/lib/crypto/pii";
import { toClientFiling } from "@/lib/session";

const sentEmails: Array<{ to: unknown; subject: string; html: string; text: string }> = [];
const realFetch = globalThis.fetch;

beforeAll(() => {
  process.env.RESEND_API_KEY = "re_test_dummy";
  globalThis.fetch = vi.fn(async (_url: unknown, init?: RequestInit) => {
    sentEmails.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ id: "resend_1" }), { status: 200 });
  }) as typeof fetch;
});
afterAll(() => {
  globalThis.fetch = realFetch;
  delete process.env.RESEND_API_KEY;
});

function seed(status: string, extra: Record<string, unknown> = {}): Row {
  const row: Row = {
    id: "filing_1",
    status,
    llcName: "Test Widgets LLC",
    taxYears: [2025],
    sessionId: "sess_secret",
    ownerItin: null,
    ownerSsnCiphertext: null,
    ownerSsnLast4: null,
    ownerSsnSubmittedAt: null,
    ownerSsnSubmittedBy: null,
    ownerSsnRequestedAt: null,
    ...extra,
  };
  state.filings.set(row.id, row);
  state.owned = { id: row.id };
  return row;
}

const post = (body: unknown, id = "filing_1") =>
  POST(new Request(`http://localhost/api/filings/${id}/ssn`, { method: "POST", body: JSON.stringify(body) }), {
    params: { id },
  });

beforeEach(() => {
  state.filings.clear();
  state.changeLog.length = 0;
  state.owned = null;
  sentEmails.length = 0;
  rerun.rerunPreflightAfterOwnerSsnChange.mockClear();
  prismaMock.filing.updateMany.mockClear();
  process.env.PII_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
});

describe("POST /api/filings/[id]/ssn", () => {
  it("returns 404 for a filing the caller does not own (another user's filing)", async () => {
    seed("PAID");
    state.owned = null;
    const res = await post({ ssn: SSN, confirm: SSN });
    expect(res.status).toBe(404);
    expect(prismaMock.filing.updateMany).not.toHaveBeenCalled();
    expect(state.filings.get("filing_1")?.ownerSsnCiphertext).toBeNull();
  });

  it.each(["FAXED", "CONFIRMED"])("refuses once the filing is %s", async (status) => {
    seed(status);
    const res = await post({ ssn: SSN, confirm: SSN });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      error: "This filing has already been sent to the IRS — please contact support.",
    });
    expect(state.filings.get("filing_1")?.ownerSsnCiphertext).toBeNull();
  });

  it("refuses an unpaid draft (the box lives on the order page)", async () => {
    seed("DRAFT");
    const res = await post({ ssn: SSN, confirm: SSN });
    expect(res.status).toBe(409);
    expect(state.filings.get("filing_1")?.ownerSsnCiphertext).toBeNull();
  });

  it("rejects a confirm that does not match", async () => {
    seed("PDF_GENERATED");
    const res = await post({ ssn: SSN, confirm: "123-45-6788" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "The two numbers don't match. Please type your SSN again in both boxes.",
    });
    expect(state.filings.get("filing_1")?.ownerSsnCiphertext).toBeNull();
  });

  it("rejects an ITIN-range number with the ITIN hint", async () => {
    seed("PAID");
    const res = await post({ ssn: "912-34-5678", confirm: "912-34-5678" });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("looks like an ITIN");
  });

  it("returns 503 with the friendly message when PII_ENCRYPTION_KEY is missing", async () => {
    seed("PAID");
    delete process.env.PII_ENCRYPTION_KEY;
    const res = await post({ ssn: SSN, confirm: SSN });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      error: "Secure entry is temporarily unavailable — please contact support.",
    });
  });

  it("stores ciphertext (never plaintext), last4, a masked change log, emails the admin without digits, and re-runs pre-flight", async () => {
    seed("PDF_GENERATED");
    const res = await post({ ssn: SSN, confirm: "123 45 6789" });
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(["last4", "ok", "submittedAt"]);
    expect(body).toMatchObject({ ok: true, last4: "6789" });

    const row = state.filings.get("filing_1")!;
    expect(String(row.ownerSsnCiphertext)).toMatch(/^v1:/);
    expect(String(row.ownerSsnCiphertext)).not.toContain(DIGITS);
    expect(decryptPii(String(row.ownerSsnCiphertext))).toBe(DIGITS);
    expect(row.ownerSsnLast4).toBe("6789");
    expect(row.ownerSsnSubmittedBy).toBe("client");
    expect(row.ownerSsnSubmittedAt).toBeInstanceOf(Date);

    expect(state.changeLog).toHaveLength(1);
    const log = state.changeLog[0];
    expect(log).toMatchObject({ field: "ownerSsn", source: "customer", adminId: null });
    const logText = JSON.stringify(log);
    expect(logText).toContain("•••-••-6789");
    expect(logText).not.toContain(DIGITS);
    expect(logText).not.toContain("123-45");
    expect(logText).not.toContain("v1:");

    expect(sentEmails).toHaveLength(1);
    const mail = sentEmails[0];
    expect(mail.to).toBe("admin@example.test");
    expect(mail.subject).toContain("the client added their SSN — regenerate the package");
    for (const part of [mail.subject, mail.html, mail.text]) {
      expect(part).not.toContain("6789");
      expect(part).not.toContain("123-45");
      expect(part).not.toContain(DIGITS);
    }

    expect(rerun.rerunPreflightAfterOwnerSsnChange).toHaveBeenCalledWith("filing_1", {
      adminId: null,
      changeSource: "customer",
    });
  });

  it("replaces an SSN already on file and logs the masked before/after", async () => {
    seed("PAID");
    await post({ ssn: SSN, confirm: SSN });
    const res = await post({ ssn: "234-56-7891", confirm: "234-56-7891" });
    expect(res.status).toBe(200);
    expect(state.filings.get("filing_1")?.ownerSsnLast4).toBe("7891");
    const last = state.changeLog.at(-1)!;
    expect(last.beforeJson).toEqual({ ssn: "•••-••-6789" });
    expect(last.afterJson).toEqual({ ssn: "•••-••-7891", submittedBy: "client" });
    // Throttled: one admin email per filing per 10 minutes.
    expect(sentEmails).toHaveLength(1);
  });

  it("never lets the ciphertext or the digits reach a customer payload (toClientFiling)", async () => {
    seed("PAID");
    await post({ ssn: SSN, confirm: SSN });
    const client = toClientFiling(state.filings.get("filing_1") as { sessionId?: unknown });
    const json = JSON.stringify(client);
    expect(json).not.toContain("ownerSsnCiphertext");
    expect(json).not.toContain("ownerSsnSubmittedBy");
    expect(json).not.toContain("sess_secret");
    expect(json).not.toContain(DIGITS);
    expect(json).not.toContain("v1:");
    expect(client).toMatchObject({ ownerSsnLast4: "6789" });
  });
});
