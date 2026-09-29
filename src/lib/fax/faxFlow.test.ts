import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// End-to-end tests for the outbound-fax completion path: the Telnyx webhook,
// the hourly fax-status-poll backstop, and the shared finalize functions they
// both call. The DB is an in-memory fake whose updateMany does the WHERE check
// and the write in one synchronous step — the same atomicity Postgres gives a
// single UPDATE — so webhook/poll races are exercised for real. Telnyx is a
// stubbed fetch; emails, storage and PDF rendering are mocks. Nothing leaves
// the process.

type Row = {
  id: string;
  status: string;
  faxJobId: string | null;
  faxStatus: string | null;
  faxedPdfKey: string | null;
  signedPdfKey: string | null;
  faxConfirmationKey: string | null;
  preflightStatus: string | null;
  preflightOverrideBy: string | null;
  llcName: string | null;
  llcEin: string | null;
  ownerName: string | null;
  taxYears: number[];
  isFinalReturn: boolean;
  dissolvedAt: Date | null;
  faxedAt: Date | null;
  updatedAt: Date;
  userId: string | null;
  user: { id: string; email: string } | null;
};

const state = vi.hoisted(() => ({
  rows: new Map<string, Record<string, unknown>>(),
  changeLog: [] as Array<Record<string, unknown>>,
  findManyArgs: [] as unknown[],
}));

function matches(row: Record<string, unknown>, where: Record<string, unknown>): boolean {
  for (const [key, cond] of Object.entries(where)) {
    const value = row[key];
    if (cond !== null && typeof cond === "object" && !(cond instanceof Date)) {
      const c = cond as { not?: unknown; notIn?: unknown[]; in?: unknown[] };
      if ("not" in c && value === c.not) return false;
      if (c.notIn && c.notIn.includes(value)) return false;
      if (c.in && !c.in.includes(value)) return false;
    } else if (value !== cond) {
      return false;
    }
  }
  return true;
}

const db = vi.hoisted(() => ({
  findFirst: vi.fn(async (args: { where: { faxJobId: string } }) => {
    const found = Array.from(state.rows.values()).find((r) => r.faxJobId === args.where.faxJobId);
    return found ? structuredClone(found) : null;
  }),
  findMany: vi.fn(async (args: unknown) => {
    state.findManyArgs.push(args);
    // SQL-side filter approximated coarsely; lib/fax/pollCandidates.isPollable
    // is the in-process filter under test.
    return Array.from(state.rows.values())
      .filter((r) => r.faxJobId != null && r.status !== "CONFIRMED")
      .map((r) => structuredClone(r));
  }),
  updateMany: vi.fn(async (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    const row = state.rows.get(args.where.id as string);
    if (!row || !matches(row, args.where)) return { count: 0 };
    Object.assign(row, args.data, { updatedAt: new Date() });
    return { count: 1 };
  }),
  update: vi.fn(async (args: { where: { id: string }; data: Record<string, unknown> }) => {
    const row = state.rows.get(args.where.id);
    if (!row) throw new Error("not found");
    Object.assign(row, args.data, { updatedAt: new Date() });
    return { id: row.id };
  }),
  logCreate: vi.fn(async (args: { data: Record<string, unknown> }) => {
    state.changeLog.push({ changedAt: new Date(), ...args.data });
    return { id: `log_${state.changeLog.length}` };
  }),
  logFindFirst: vi.fn(async (args: { where: { filingId: string; field: string; changedAt: { gte: Date } } }) => {
    const hit = state.changeLog.find(
      (e) =>
        e.filingId === args.where.filingId &&
        e.field === args.where.field &&
        (e.changedAt as Date) >= args.where.changedAt.gte,
    );
    return hit ? { id: "log_hit" } : null;
  }),
}));

const email = vi.hoisted(() => ({
  sendFaxDeliveredEmail: vi.fn(async (_args: Record<string, unknown>) => ({ id: "re_1" })),
  sendFaxDeliveredAdminEmail: vi.fn(async (_args: Record<string, unknown>) => ({ id: "re_2" })),
  sendFaxFailedEmail: vi.fn(async (_args: Record<string, unknown>) => ({ id: "re_3" })),
  sendFaxFailedAdminEmail: vi.fn(async (_args: Record<string, unknown>) => ({ id: "re_4" })),
  sendFaxReceivedAdminEmail: vi.fn(),
  sendFaxAttentionAdminEmail: vi.fn(async (_args: Record<string, unknown>) => ({ id: "re_5" })),
}));
const storage = vi.hoisted(() => ({
  get: vi.fn(async (_key: string) => new Uint8Array([1, 2, 3])),
  put: vi.fn(),
  putPdf: vi.fn(async (_key: string, _bytes: Uint8Array) => "ok"),
  publicUrl: vi.fn(async (key: string) => `https://storage.example.test/${key}`),
}));
const receipt = vi.hoisted(() => ({
  generateFaxReceiptPdf: vi.fn(async (_input: Record<string, unknown>) => new Uint8Array([37, 80, 68, 70])),
}));
const fax = vi.hoisted(() => {
  class TelnyxSubmitRejectedError extends Error {
    readonly httpStatus: number;
    constructor(httpStatus: number, body: string) {
      super(`Telnyx fax failed: ${httpStatus} ${body}`);
      this.httpStatus = httpStatus;
    }
  }
  return {
    TelnyxSubmitRejectedError,
    submitFax: vi.fn(async (_opts: { mediaUrl: string; to?: string }) => ({ id: "fax-retry-job", status: "queued" })),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: {
      findFirst: db.findFirst,
      findMany: db.findMany,
      updateMany: db.updateMany,
      update: db.update,
    },
    filingChangeLog: { create: db.logCreate, findFirst: db.logFindFirst },
  },
}));
vi.mock("@/lib/email", () => email);
vi.mock("@/lib/storage", () => storage);
vi.mock("@/lib/pdf/faxReceipt", () => receipt);
vi.mock("@/lib/fax", () => fax);
vi.mock("@/lib/apns", () => ({ apnsConfigured: () => false, sendAdminPush: vi.fn() }));
vi.mock("@/lib/partnerBrand", () => ({ brandForFiling: vi.fn(async () => null) }));
vi.mock("@/lib/magicLink", () => ({ makeMagicLink: (id: string) => `https://example.test/magic/${id}` }));
vi.mock("@/lib/env", () => ({
  env: {
    appUrl: "https://example.test",
    adminEmail: "support@example.test",
    telnyx: { destination: "+18558877737" },
  },
}));

import { POST as telnyxWebhook } from "@/app/api/telnyx-webhook/route";
import { GET as faxStatusPoll } from "@/app/api/cron/fax-status-poll/route";
import { finalizeFaxDelivered, finalizeFaxFailed } from "@/lib/fax/finalize";
import { isPollable, pollCandidatesWhere, staleRetryClaim } from "@/lib/fax/pollCandidates";
import { isTerminalFaxStatus, type FaxDeliveryFacts } from "@/lib/fax/telnyxStatus";

const FAX_ID = "8c2f0b3e-1111-4222-8333-944455556666";

function seedFiling(overrides: Partial<Row> = {}): Row {
  const row: Row = {
    id: "filing_1",
    status: "FAXED",
    faxJobId: FAX_ID,
    faxStatus: "sending.started",
    faxedPdfKey: "filing_1_faxed.pdf",
    signedPdfKey: "filing_1_signed.pdf",
    faxConfirmationKey: null,
    preflightStatus: "passed",
    preflightOverrideBy: null,
    llcName: "Acme LLC",
    llcEin: "12-3456789",
    ownerName: "Owner One",
    taxYears: [2025],
    isFinalReturn: false,
    dissolvedAt: null,
    faxedAt: new Date(),
    updatedAt: new Date(),
    userId: "user_1",
    user: { id: "user_1", email: "owner@example.test" },
    ...overrides,
  };
  state.rows.set(row.id, row as unknown as Record<string, unknown>);
  return row;
}

function row(id = "filing_1"): Row {
  return state.rows.get(id) as unknown as Row;
}

function telnyxRecord(status: string, extra: Record<string, unknown> = {}) {
  return {
    data: {
      id: FAX_ID,
      record_type: "fax",
      status,
      page_count: 7,
      call_duration_secs: 95,
      from: "+15550001111",
      to: "+18558877737",
      created_at: "2026-09-20T10:00:00.000Z",
      updated_at: "2026-09-20T10:03:00.000Z",
      ...extra,
    },
  };
}

function stubTelnyx(respond: () => Response | Promise<Response>) {
  const fetchMock = vi.fn(async (url: string) => {
    if (!String(url).startsWith("https://api.telnyx.com/v2/faxes/")) {
      throw new Error(`unexpected fetch ${url}`);
    }
    return respond();
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function webhookRequest(eventType: string, payload: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return new Request("https://example.test/api/telnyx-webhook", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({
      data: {
        event_type: eventType,
        payload: { fax_id: FAX_ID, direction: "outbound", ...payload },
      },
    }),
  });
}

// A webhook signed the way Telnyx signs: Ed25519 over `${timestamp}|${body}`.
function signedWebhookRequest(eventType: string, payload: Record<string, unknown> = {}) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const rawPublic = publicKey.export({ format: "der", type: "spki" }).subarray(12);
  vi.stubEnv("TELNYX_PUBLIC_KEY", Buffer.from(rawPublic).toString("base64"));
  const body = JSON.stringify({
    data: { event_type: eventType, payload: { fax_id: FAX_ID, direction: "outbound", ...payload } },
  });
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = crypto.sign(null, Buffer.from(`${timestamp}|${body}`), privateKey).toString("base64");
  return new Request("https://example.test/api/telnyx-webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "telnyx-signature-ed25519": signature, "telnyx-timestamp": timestamp },
    body,
  });
}

function pollRequest(auth = "Bearer cron-secret") {
  return new Request("https://example.test/api/cron/fax-status-poll", { headers: { authorization: auth } });
}

beforeEach(() => {
  state.rows.clear();
  state.changeLog.length = 0;
  state.findManyArgs.length = 0;
  vi.clearAllMocks();
  vi.stubEnv("TELNYX_API_KEY", "test-telnyx-key");
  vi.stubEnv("TELNYX_PUBLIC_KEY", "");
  vi.stubEnv("CRON_SECRET", "cron-secret");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("telnyx-webhook: unsigned terminal events are confirmed with the Telnyx API", () => {
  it("does NOT finalize a fax.delivered when Telnyx says the fax is still sending", async () => {
    seedFiling();
    const fetchMock = stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("sending")), { status: 200 }));

    const res = await telnyxWebhook(webhookRequest("fax.delivered", { status: "delivered" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, ignored: "status_mismatch" });
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.telnyx.com/v2/faxes/${FAX_ID}`,
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer test-telnyx-key" }) }),
    );
    expect(row().status).toBe("FAXED");
    expect(row().faxStatus).toBe("sending.started");
    expect(receipt.generateFaxReceiptPdf).not.toHaveBeenCalled();
    expect(email.sendFaxDeliveredEmail).not.toHaveBeenCalled();
    expect(email.sendFaxDeliveredAdminEmail).not.toHaveBeenCalled();
  });

  it("does NOT finalize when the Telnyx API errors — answers 503 so Telnyx can redeliver", async () => {
    seedFiling();
    stubTelnyx(() => new Response("upstream error", { status: 502 }));

    const res = await telnyxWebhook(webhookRequest("fax.delivered"));

    expect(res.status).toBe(503);
    expect(row().status).toBe("FAXED");
    expect(email.sendFaxDeliveredEmail).not.toHaveBeenCalled();
  });

  it("does NOT finalize when the Telnyx API is unreachable", async () => {
    seedFiling();
    stubTelnyx(() => {
      throw new Error("ECONNRESET");
    });

    const res = await telnyxWebhook(webhookRequest("fax.delivered"));

    expect(res.status).toBe(503);
    expect(row().status).toBe("FAXED");
    expect(email.sendFaxDeliveredEmail).not.toHaveBeenCalled();
  });

  it("answers 503 (not a silent 200) when a fax.failed cannot be confirmed — no retry, no FAILED", async () => {
    seedFiling({ faxStatus: "queued" });
    stubTelnyx(() => new Response("upstream error", { status: 500 }));

    const res = await telnyxWebhook(webhookRequest("fax.failed"));

    expect(res.status).toBe(503);
    expect(fax.submitFax).not.toHaveBeenCalled();
    expect(row()).toMatchObject({ status: "FAXED", faxStatus: "queued" });
    expect(email.sendFaxFailedEmail).not.toHaveBeenCalled();
  });

  it("does NOT trust the payload in production when TELNYX_API_KEY is missing", async () => {
    seedFiling();
    vi.stubEnv("TELNYX_API_KEY", "");
    vi.stubEnv("NODE_ENV", "production");
    const fetchMock = stubTelnyx(() => new Response("{}", { status: 200 }));

    const res = await telnyxWebhook(webhookRequest("fax.delivered"));

    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(row().status).toBe("FAXED");
  });

  it("local/dev only (no TELNYX_API_KEY, NODE_ENV != production): trusts the payload so sandbox flows work", async () => {
    seedFiling({ faxJobId: FAX_ID });
    vi.stubEnv("TELNYX_API_KEY", "");
    const fetchMock = stubTelnyx(() => new Response("{}", { status: 200 }));

    const res = await telnyxWebhook(webhookRequest("fax.delivered", { updated_at: "2026-09-20T10:03:00.000Z" }));

    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(row().status).toBe("CONFIRMED");
  });

  it("finalizes once Telnyx agrees: CONFIRMED, receipt stored, customer + admin emailed, change logged", async () => {
    seedFiling();
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("delivered")), { status: 200 }));

    // The (forgeable) payload claims 99 pages; the API record's 7 must win.
    const res = await telnyxWebhook(webhookRequest("fax.delivered", { page_count: 99 }));

    expect(await res.json()).toEqual({ ok: true });
    expect(row()).toMatchObject({
      status: "CONFIRMED",
      faxStatus: "delivered",
      faxConfirmationKey: "filing_1_fax_receipt.pdf",
    });
    expect(receipt.generateFaxReceiptPdf).toHaveBeenCalledTimes(1);
    expect(receipt.generateFaxReceiptPdf).toHaveBeenCalledWith(expect.objectContaining({
      telnyxFaxId: FAX_ID,
      pageCount: 7,
      deliveredAtIso: "2026-09-20T10:03:00.000Z",
    }));
    expect(storage.putPdf).toHaveBeenCalledWith("filing_1_fax_receipt.pdf", expect.any(Uint8Array));
    expect(email.sendFaxDeliveredEmail).toHaveBeenCalledTimes(1);
    expect(email.sendFaxDeliveredEmail).toHaveBeenCalledWith(expect.objectContaining({
      email: "owner@example.test",
      filingId: "filing_1",
      logKind: "fax_delivered",
      receiptPdfBytes: expect.any(Uint8Array),
      proof: expect.objectContaining({ faxId: FAX_ID, pageCount: 7 }),
    }));
    expect(email.sendFaxDeliveredAdminEmail).toHaveBeenCalledTimes(1);
    expect(state.changeLog).toEqual([
      expect.objectContaining({ filingId: "filing_1", source: "system", field: "status" }),
    ]);
  });

  it("unsigned webhook: receipt facts come only from the Telnyx API, never from the payload", async () => {
    seedFiling();
    // API record without pages / from / duration.
    stubTelnyx(() => new Response(JSON.stringify({ data: { id: FAX_ID, status: "delivered", updated_at: "2026-09-20T10:03:00.000Z" } }), { status: 200 }));

    await telnyxWebhook(webhookRequest("fax.delivered", { page_count: 99, from: "+19990000000", call_duration_secs: 1 }));

    expect(receipt.generateFaxReceiptPdf).toHaveBeenCalledWith(expect.objectContaining({ pageCount: null, fromFax: null }));
    expect(email.sendFaxDeliveredEmail).toHaveBeenCalledWith(expect.objectContaining({
      proof: expect.objectContaining({ pageCount: null, durationSecs: null, from: null }),
    }));
  });

  it("signed webhook: a verified payload may fill fields the API record omits", async () => {
    seedFiling();
    stubTelnyx(() => new Response(JSON.stringify({ data: { id: FAX_ID, status: "delivered", updated_at: "2026-09-20T10:03:00.000Z" } }), { status: 200 }));

    const res = await telnyxWebhook(signedWebhookRequest("fax.delivered", { page_count: 6, from: "+15550001111" }));

    expect(res.status).toBe(200);
    expect(receipt.generateFaxReceiptPdf).toHaveBeenCalledWith(expect.objectContaining({ pageCount: 6, fromFax: "+15550001111" }));
  });

  it("rejects a bad signature when TELNYX_PUBLIC_KEY is configured (existing fail-closed check kept)", async () => {
    seedFiling();
    const { publicKey } = crypto.generateKeyPairSync("ed25519");
    const raw = publicKey.export({ format: "der", type: "spki" }).subarray(12);
    vi.stubEnv("TELNYX_PUBLIC_KEY", raw.toString("base64"));
    const fetchMock = stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("delivered")), { status: 200 }));

    const res = await telnyxWebhook(
      webhookRequest("fax.delivered", {}, {
        "telnyx-signature-ed25519": Buffer.alloc(64, 1).toString("base64"),
        "telnyx-timestamp": String(Math.floor(Date.now() / 1000)),
      }),
    );

    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(row().status).toBe("FAXED");
  });

  it("gives up (FAILED + emails) only when Telnyx confirms the failure and retries are exhausted", async () => {
    seedFiling({ faxStatus: "retry_3" });
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("failed", { failure_reason: "no_answer" })), { status: 200 }));

    const res = await telnyxWebhook(webhookRequest("fax.failed"));

    expect(await res.json()).toMatchObject({ ok: true, gaveUp: true });
    expect(row()).toMatchObject({ status: "FAILED", faxStatus: "failed:no_answer" });
    expect(fax.submitFax).not.toHaveBeenCalled();
    expect(email.sendFaxFailedEmail).toHaveBeenCalledTimes(1);
    expect(email.sendFaxFailedEmail).toHaveBeenCalledWith(expect.objectContaining({ filingId: "filing_1" }));
    expect(email.sendFaxFailedAdminEmail).toHaveBeenCalledWith(expect.objectContaining({ deliveryAttempts: 3 }));
  });

  it("still re-faxes on a confirmed failure below the retry ceiling", async () => {
    seedFiling({ faxStatus: "queued" });
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("failed")), { status: 200 }));

    const res = await telnyxWebhook(webhookRequest("fax.failed"));

    expect(await res.json()).toMatchObject({ ok: true, retried: true });
    expect(fax.submitFax).toHaveBeenCalledTimes(1);
    expect(row()).toMatchObject({ status: "FAXED", faxJobId: "fax-retry-job", faxStatus: "retry_1" });
    expect(email.sendFaxFailedEmail).not.toHaveBeenCalled();
  });

  it("ignores a forged fax.failed for a fax Telnyx reports delivered", async () => {
    seedFiling();
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("delivered")), { status: 200 }));

    const res = await telnyxWebhook(webhookRequest("fax.failed", { delivery_attempts: 99 }));

    expect(await res.json()).toMatchObject({ ignored: "status_mismatch" });
    expect(row().status).toBe("FAXED");
    expect(fax.submitFax).not.toHaveBeenCalled();
    expect(email.sendFaxFailedEmail).not.toHaveBeenCalled();
  });
});

describe("telnyx-webhook: in-progress events are display-only", () => {
  it("records sending.started without calling Telnyx", async () => {
    seedFiling({ faxStatus: "queued" });
    const fetchMock = stubTelnyx(() => new Response("{}", { status: 200 }));

    await telnyxWebhook(webhookRequest("fax.sending.started"));

    expect(row().faxStatus).toBe("sending.started");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never overwrites a retry_N label (the retry ceiling is derived from it)", async () => {
    seedFiling({ faxStatus: "retry_2" });
    stubTelnyx(() => new Response("{}", { status: 200 }));

    await telnyxWebhook(webhookRequest("fax.sending.started"));

    expect(row().faxStatus).toBe("retry_2");
  });

  it("never overwrites a finalized filing", async () => {
    seedFiling({ status: "CONFIRMED", faxStatus: "delivered" });
    stubTelnyx(() => new Response("{}", { status: 200 }));

    await telnyxWebhook(webhookRequest("fax.media.processed"));

    expect(row().faxStatus).toBe("delivered");
  });
});

describe("fax-status-poll", () => {
  it("picks up in-progress statuses the webhook stores (sending.started, media.processed, null) and finalizes via the shared path", async () => {
    seedFiling({ id: "f_started", faxJobId: FAX_ID, faxStatus: "sending.started" });
    seedFiling({ id: "f_media", faxJobId: "fax-media", faxStatus: "media.processed" });
    seedFiling({ id: "f_null", faxJobId: "fax-null", faxStatus: null });
    seedFiling({ id: "f_failed", faxJobId: "fax-failed-old", faxStatus: "failed:busy", status: "FAILED" });
    seedFiling({ id: "f_sandbox", faxJobId: "sandbox_123", faxStatus: "queued" });
    const fetchMock = vi.fn(async (url: string) => {
      const id = String(url).split("/").pop();
      const status = id === FAX_ID ? "delivered" : "sending";
      return new Response(JSON.stringify({ data: { ...telnyxRecord(status).data, id } }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const res = await faxStatusPoll(pollRequest());
    const body = await res.json();

    expect(body).toMatchObject({ inFlight: 3, delivered: 1, reconciled: 1, stillSending: 2, errors: [] });
    const polled = fetchMock.mock.calls.map((c) => String(c[0]).split("/").pop()).sort();
    expect(polled).toEqual([FAX_ID, "fax-media", "fax-null"].sort());
    expect(row("f_started")).toMatchObject({ status: "CONFIRMED", faxConfirmationKey: "f_started_fax_receipt.pdf" });
    expect(row("f_media").status).toBe("FAXED");
    expect(email.sendFaxDeliveredEmail).toHaveBeenCalledTimes(1);
    expect(email.sendFaxDeliveredEmail).toHaveBeenCalledWith(expect.objectContaining({ filingId: "f_started" }));
    const args = state.findManyArgs[0] as { where: ReturnType<typeof pollCandidatesWhere>; take: number };
    expect(args.take).toBe(100);
    expect(args.where).toMatchObject({
      faxJobId: { not: null },
      status: { not: "CONFIRMED" },
      AND: pollCandidatesWhere(new Date()).AND,
    });
  });

  it("re-faxes a Telnyx-confirmed failure while retries remain (webhook missed) — no FAILED, no customer email", async () => {
    seedFiling({ faxStatus: "sending.started" });
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("failed", { failure_reason: "busy" })), { status: 200 }));

    const body = await (await faxStatusPoll(pollRequest())).json();

    expect(body).toMatchObject({ retried: 1, failed: 0 });
    expect(fax.submitFax).toHaveBeenCalledTimes(1);
    expect(fax.submitFax).toHaveBeenCalledWith({
      mediaUrl: "https://storage.example.test/filing_1_faxed.pdf",
      to: "+18558877737",
    });
    expect(row()).toMatchObject({ status: "FAXED", faxJobId: "fax-retry-job", faxStatus: "retry_1" });
    expect(email.sendFaxFailedEmail).not.toHaveBeenCalled();
    expect(state.changeLog).toEqual([expect.objectContaining({ field: "fax", source: "system" })]);
  });

  it("marks FAILED (and emails) only once retries are exhausted", async () => {
    seedFiling({ faxStatus: "retry_3" });
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("failed", { failure_reason: "busy" })), { status: 200 }));

    const body = await (await faxStatusPoll(pollRequest())).json();

    expect(body).toMatchObject({ failed: 1, reconciled: 1, retried: 0 });
    expect(row()).toMatchObject({ status: "FAILED", faxStatus: "failed:busy" });
    expect(fax.submitFax).not.toHaveBeenCalled();
    expect(email.sendFaxFailedEmail).toHaveBeenCalledTimes(1);
    expect(email.sendFaxFailedAdminEmail).toHaveBeenCalledWith(expect.objectContaining({ deliveryAttempts: 3 }));
  });

  it("emails the admin about a stale retrying_N claim once, not again within 24h, and again after", async () => {
    seedFiling({ faxStatus: "retrying_2", updatedAt: new Date(Date.now() - 60 * 60 * 1000) });
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("failed")), { status: 200 }));

    const first = await (await faxStatusPoll(pollRequest())).json();
    const second = await (await faxStatusPoll(pollRequest())).json();

    expect(first).toMatchObject({ stuckRetryClaims: ["filing_1"], stuckAlertsSent: 1 });
    expect(second).toMatchObject({ stuckRetryClaims: ["filing_1"], stuckAlertsSent: 0 });
    expect(email.sendFaxAttentionAdminEmail).toHaveBeenCalledTimes(1);
    expect(email.sendFaxAttentionAdminEmail).toHaveBeenCalledWith(expect.objectContaining({
      filingId: "filing_1",
      headline: expect.stringContaining("stuck"),
    }));
    const markers = state.changeLog.filter((e) => e.field === "faxStuckRetryAlert");
    expect(markers).toHaveLength(1);

    // 25h later the reminder goes out again.
    markers[0].changedAt = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const third = await (await faxStatusPoll(pollRequest())).json();
    expect(third).toMatchObject({ stuckAlertsSent: 1 });
    expect(email.sendFaxAttentionAdminEmail).toHaveBeenCalledTimes(2);
    expect(fax.submitFax).not.toHaveBeenCalled();
  });

  it("retries the stuck-claim email next run if sending failed (no marker written)", async () => {
    seedFiling({ faxStatus: "retrying_1", updatedAt: new Date(Date.now() - 60 * 60 * 1000) });
    stubTelnyx(() => new Response("{}", { status: 200 }));
    email.sendFaxAttentionAdminEmail.mockRejectedValueOnce(new Error("Resend down"));

    const first = await (await faxStatusPoll(pollRequest())).json();
    const second = await (await faxStatusPoll(pollRequest())).json();

    expect(first).toMatchObject({ stuckAlertsSent: 0 });
    expect(second).toMatchObject({ stuckAlertsSent: 1 });
    expect(email.sendFaxAttentionAdminEmail).toHaveBeenCalledTimes(2);
  });

  it("never touches a stale retrying_N claim (its fax may be in flight) — flags it instead", async () => {
    seedFiling({ faxStatus: "retrying_2", updatedAt: new Date(Date.now() - 60 * 60 * 1000) });
    const fetchMock = stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("failed")), { status: 200 }));

    const body = await (await faxStatusPoll(pollRequest())).json();

    expect(body).toMatchObject({ inFlight: 0, stuckRetryClaims: ["filing_1"] });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(fax.submitFax).not.toHaveBeenCalled();
    expect(row()).toMatchObject({ status: "FAXED", faxStatus: "retrying_2" });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("STUCK_RETRY_CLAIM filing=filing_1"));
  });

  it("keeps CRON_SECRET auth", async () => {
    seedFiling();
    const fetchMock = stubTelnyx(() => new Response("{}", { status: 200 }));
    const res = await faxStatusPoll(pollRequest("Bearer wrong"));
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("shared finalize is exactly-once", () => {
  it("webhook and poll racing on the same delivered fax send ONE customer email and ONE receipt", async () => {
    seedFiling({ faxStatus: "sending.started" });
    // Both callers hit Telnyx first; resolve on a later tick so they overlap.
    stubTelnyx(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(() => resolve(new Response(JSON.stringify(telnyxRecord("delivered")), { status: 200 })), 5),
        ),
    );

    const [webhookRes, pollRes] = await Promise.all([
      telnyxWebhook(webhookRequest("fax.delivered")),
      faxStatusPoll(pollRequest()),
    ]);
    const webhookBody = await webhookRes.json();
    const pollBody = await pollRes.json();

    expect(row().status).toBe("CONFIRMED");
    expect(email.sendFaxDeliveredEmail).toHaveBeenCalledTimes(1);
    expect(email.sendFaxDeliveredAdminEmail).toHaveBeenCalledTimes(1);
    expect(receipt.generateFaxReceiptPdf).toHaveBeenCalledTimes(1);
    expect(storage.putPdf).toHaveBeenCalledTimes(1);
    // Exactly one of the two paths won the claim.
    const webhookWon = webhookBody.deduplicated !== true;
    const pollWon = pollBody.delivered === 1;
    expect(webhookWon !== pollWon).toBe(true);
    if (!pollWon) expect(pollBody.alreadyFinalized).toBe(1);
  });

  it("a redelivered webhook after finalize is a no-op", async () => {
    const filing = seedFiling();
    const facts: FaxDeliveryFacts = {
      faxId: FAX_ID,
      submittedAtIso: "2026-09-20T10:00:00.000Z",
      deliveredAtIso: "2026-09-20T10:03:00.000Z",
      pageCount: 7,
      durationSecs: 95,
      from: null,
      to: null,
    };
    const first = await finalizeFaxDelivered(filing as never, facts, { source: "webhook" });
    const second = await finalizeFaxDelivered(filing as never, facts, { source: "poll" });

    expect(first.claimed).toBe(true);
    expect(second).toEqual({ claimed: false, receiptStored: false, customerEmailed: false, adminEmailed: false });
    expect(email.sendFaxDeliveredEmail).toHaveBeenCalledTimes(1);
  });
});

describe("poll candidate rules", () => {
  const now = new Date("2026-09-29T12:00:00.000Z");
  const base = { faxJobId: FAX_ID, status: "FAXED", updatedAt: new Date("2026-09-29T11:00:00.000Z") };

  it.each([
    ["queued", true],
    ["sending", true],
    ["media.processed", true],
    ["sending.started", true],
    ["retry_2", true],
    [null, true],
    ["delivered", false],
    ["failed", false],
    ["failed:no_answer", false],
  ] as const)("faxStatus %s → pollable=%s", (faxStatus, expected) => {
    expect(isPollable({ ...base, faxStatus })).toBe(expected);
    expect(isTerminalFaxStatus(faxStatus)).toBe(!expected);
  });

  it("skips CONFIRMED filings and sandbox fax ids", () => {
    expect(isPollable({ ...base, faxStatus: "queued", status: "CONFIRMED" })).toBe(false);
    expect(isPollable({ ...base, faxStatus: "queued", faxJobId: "sandbox_1" })).toBe(false);
  });

  it("never polls a retrying_N claim; flags it as stuck once it outlives the grace period", () => {
    const fresh = { ...base, faxStatus: "retrying_1", updatedAt: new Date("2026-09-29T11:55:00.000Z") };
    const stale = { ...base, faxStatus: "retrying_1", updatedAt: new Date("2026-09-29T11:00:00.000Z") };
    expect(isPollable(fresh)).toBe(false);
    expect(isPollable(stale)).toBe(false);
    expect(staleRetryClaim(fresh, now)).toBe(false);
    expect(staleRetryClaim(stale, now)).toBe(true);
  });

  it("bounds the SQL to non-CONFIRMED, non-terminal faxes touched in the last 14 days", () => {
    const where = pollCandidatesWhere(now);
    const cutoff = new Date("2026-09-15T12:00:00.000Z");
    expect(where).toEqual({
      faxJobId: { not: null },
      status: { not: "CONFIRMED" },
      OR: [{ faxedAt: { gte: cutoff } }, { updatedAt: { gte: cutoff } }],
      AND: [
        { OR: [{ faxStatus: null }, { faxStatus: { not: "delivered" } }] },
        { OR: [{ faxStatus: null }, { NOT: { faxStatus: { startsWith: "failed" } } }] },
      ],
    });
  });
});

describe("automatic retry is claim-guarded (no duplicate IRS fax)", () => {
  it("webhook retry vs poll retry racing on the same failed fax → exactly one submitFax", async () => {
    seedFiling({ faxStatus: "sending.started" });
    // Slow submit: both callers reach their claim while the winner's
    // resubmission is still in flight (faxJobId not yet replaced).
    const slowSubmit = () =>
      new Promise<{ id: string; status: string }>((resolve) =>
        setTimeout(() => resolve({ id: "fax-retry-job", status: "queued" }), 20),
      );
    fax.submitFax.mockImplementationOnce(slowSubmit).mockImplementationOnce(slowSubmit);
    stubTelnyx(
      () =>
        new Promise<Response>((resolve) =>
          setTimeout(() => resolve(new Response(JSON.stringify(telnyxRecord("failed")), { status: 200 })), 5),
        ),
    );

    const [webhookRes, pollRes] = await Promise.all([
      telnyxWebhook(webhookRequest("fax.failed")),
      faxStatusPoll(pollRequest()),
    ]);
    const webhookBody = await webhookRes.json();
    const pollBody = await pollRes.json();

    expect(fax.submitFax).toHaveBeenCalledTimes(1);
    expect(row()).toMatchObject({ status: "FAXED", faxJobId: "fax-retry-job", faxStatus: "retry_1" });
    expect(email.sendFaxFailedEmail).not.toHaveBeenCalled();
    const webhookRetried = webhookBody.retried === true;
    const pollRetried = pollBody.retried === 1;
    expect(webhookRetried !== pollRetried).toBe(true);
  });

  it("a redelivered fax.failed for the replaced job cannot re-fax again", async () => {
    seedFiling({ faxStatus: "queued" });
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("failed")), { status: 200 }));

    await telnyxWebhook(webhookRequest("fax.failed"));
    const again = await telnyxWebhook(webhookRequest("fax.failed"));

    expect(again.status).toBe(200);
    expect(fax.submitFax).toHaveBeenCalledTimes(1);
  });

  it("releases the claim when Telnyx rejects the resubmission (nothing sent) and answers 503", async () => {
    seedFiling({ faxStatus: "queued" });
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("failed")), { status: 200 }));
    fax.submitFax.mockRejectedValueOnce(new fax.TelnyxSubmitRejectedError(422, "invalid media"));

    const res = await telnyxWebhook(webhookRequest("fax.failed"));

    expect(res.status).toBe(503);
    expect(row()).toMatchObject({ status: "FAXED", faxJobId: FAX_ID, faxStatus: "queued" });
    expect(email.sendFaxAttentionAdminEmail).not.toHaveBeenCalled();
  });

  it("keeps the claim and alerts the operator when the resubmission outcome is ambiguous", async () => {
    seedFiling({ faxStatus: "queued" });
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("failed")), { status: 200 }));
    fax.submitFax.mockRejectedValueOnce(new Error("socket hang up"));

    const res = await telnyxWebhook(webhookRequest("fax.failed"));

    expect(await res.json()).toMatchObject({ ok: true, attention: "ambiguous_submit" });
    expect(row()).toMatchObject({ faxJobId: FAX_ID, faxStatus: "retrying_1" });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("AMBIGUOUS_FAX_SUBMIT filing=filing_1"),
      expect.any(Error),
    );
    expect(email.sendFaxAttentionAdminEmail).toHaveBeenCalledTimes(1);
    // A later poll must not resubmit from that claim.
    await faxStatusPoll(pollRequest());
    expect(fax.submitFax).toHaveBeenCalledTimes(1);
  });

  it("treats a 2xx submit without a fax id as ambiguous: claim kept, old job not re-armed, admin alerted", async () => {
    seedFiling({ faxStatus: "queued" });
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("failed")), { status: 200 }));
    fax.submitFax.mockResolvedValueOnce({ id: undefined as unknown as string, status: "queued" });

    const res = await telnyxWebhook(webhookRequest("fax.failed"));

    expect(await res.json()).toMatchObject({ ok: true, attention: "ambiguous_submit" });
    expect(row()).toMatchObject({ faxJobId: FAX_ID, faxStatus: "retrying_1", status: "FAXED" });
    expect(db.update).not.toHaveBeenCalled();
    expect(email.sendFaxAttentionAdminEmail).toHaveBeenCalledTimes(1);
    // And nothing automatic resubmits from that claim later.
    await faxStatusPoll(pollRequest());
    expect(fax.submitFax).toHaveBeenCalledTimes(1);
  });

  it("logs UNTRACKED_FAX_JOB with the new fax id (and alerts) when the DB write after submit fails", async () => {
    seedFiling({ faxStatus: "queued" });
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("failed")), { status: 200 }));
    db.update.mockRejectedValueOnce(new Error("db down")).mockRejectedValueOnce(new Error("db down"));

    const res = await telnyxWebhook(webhookRequest("fax.failed"));

    expect(await res.json()).toMatchObject({ retried: true, attention: "untracked_fax_job" });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/UNTRACKED_FAX_JOB filing=filing_1 newFaxId=fax-retry-job/),
    );
    expect(email.sendFaxAttentionAdminEmail).toHaveBeenCalledWith(expect.objectContaining({
      filingId: "filing_1",
      details: expect.arrayContaining([["New Telnyx fax id", "fax-retry-job"]]),
    }));
    // Claim kept: nothing automatic will re-fax this filing.
    expect(row().faxStatus).toBe("retrying_1");
  });
});

describe("finalize claims are pinned to the fax job", () => {
  const oldJobFacts: FaxDeliveryFacts = {
    faxId: FAX_ID,
    submittedAtIso: "2026-09-20T10:00:00.000Z",
    deliveredAtIso: "2026-09-20T10:03:00.000Z",
    pageCount: 7,
    durationSecs: 95,
    from: null,
    to: null,
  };

  it("a stale job's delivered result cannot confirm a filing whose newer retry is in flight", async () => {
    const filing = seedFiling({ faxJobId: "newer-retry-job", faxStatus: "retry_1" });

    const result = await finalizeFaxDelivered(filing as never, oldJobFacts, { source: "poll" });

    expect(result.claimed).toBe(false);
    expect(row()).toMatchObject({ status: "FAXED", faxJobId: "newer-retry-job", faxStatus: "retry_1" });
    expect(email.sendFaxDeliveredEmail).not.toHaveBeenCalled();
  });

  it("a stale job's failure cannot fail a filing whose newer retry is in flight", async () => {
    const filing = seedFiling({ faxJobId: "newer-retry-job", faxStatus: "retry_1" });

    const result = await finalizeFaxFailed(
      filing as never,
      { faxId: FAX_ID, failureReason: "busy", deliveryAttempts: 3 },
      { source: "webhook" },
    );

    expect(result.claimed).toBe(false);
    expect(row().status).toBe("FAXED");
    expect(email.sendFaxFailedEmail).not.toHaveBeenCalled();
  });
});

describe("customer email failure after the claim is not silent", () => {
  it("the admin delivered email and push say the customer email FAILED", async () => {
    seedFiling();
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("delivered")), { status: 200 }));
    email.sendFaxDeliveredEmail.mockRejectedValueOnce(new Error("Resend send failed: 500"));

    await telnyxWebhook(webhookRequest("fax.delivered"));

    expect(row().status).toBe("CONFIRMED");
    expect(email.sendFaxDeliveredAdminEmail).toHaveBeenCalledWith(expect.objectContaining({ customerEmailStatus: "failed" }));
  });

  it("reports sent when the customer email went out", async () => {
    seedFiling();
    stubTelnyx(() => new Response(JSON.stringify(telnyxRecord("delivered")), { status: 200 }));

    await telnyxWebhook(webhookRequest("fax.delivered"));

    expect(email.sendFaxDeliveredAdminEmail).toHaveBeenCalledWith(expect.objectContaining({ customerEmailStatus: "sent" }));
  });
});
