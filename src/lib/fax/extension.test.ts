import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Form 7004 extension orders: the admin fax route (every guard + happy path),
// the Telnyx webhook / hourly poll branches for an extension fax job, and the
// PATCH/generate routes' stale-form protection. The DB is an in-memory fake
// whose updateMany checks WHERE and writes in one step (Postgres UPDATE
// atomicity). Telnyx, storage, email and Telegram are mocks; synthetic data only.

type Row = Record<string, unknown>;

const state = vi.hoisted(() => ({ rows: new Map<string, Record<string, unknown>>() }));

function matches(row: Row, where: Row): boolean {
  for (const [key, cond] of Object.entries(where)) {
    const value = row[key];
    if (cond !== null && typeof cond === "object" && !(cond instanceof Date)) {
      if ("not" in (cond as Row) && value === (cond as Row).not) return false;
    } else if (value !== cond) {
      return false;
    }
  }
  return true;
}

function write(row: Row, data: Row) {
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "increment" in (value as Row)) {
      row[key] = (row[key] as number) + ((value as { increment: number }).increment);
    } else {
      row[key] = value;
    }
  }
  row.updatedAt = new Date();
}

const db = vi.hoisted(() => ({
  findUnique: vi.fn(async (args: { where: { id?: string; faxJobId?: string }; select?: Record<string, boolean> }) => {
    const found = args.where.id
      ? state.rows.get(args.where.id)
      : Array.from(state.rows.values()).find((r) => r.faxJobId === args.where.faxJobId);
    if (!found) return null;
    const copy = structuredClone(found);
    return args.select ? Object.fromEntries(Object.keys(args.select).map((k) => [k, copy[k]])) : copy;
  }),
  findMany: vi.fn(async () =>
    Array.from(state.rows.values())
      .filter((r) => r.faxJobId != null && r.faxDeliveredAt == null)
      .map((r) => structuredClone(r)),
  ),
  updateMany: vi.fn(async (args: { where: Row; data: Row }) => {
    const row = state.rows.get(args.where.id as string);
    if (!row || !matches(row, args.where)) return { count: 0 };
    write(row, args.data);
    return { count: 1 };
  }),
  update: vi.fn(async (args: { where: { id: string }; data: Row }) => {
    const row = state.rows.get(args.where.id);
    if (!row) throw new Error("not found");
    write(row, args.data);
    return structuredClone(row);
  }),
}));

const email = vi.hoisted(() => ({
  sendExtensionFaxedEmail: vi.fn(async (_args: Row) => ({ id: "re_c" })),
  sendExtensionFaxDeliveredAdminEmail: vi.fn(async (_args: Row) => ({ id: "re_a" })),
  sendExtensionFaxFailedAdminEmail: vi.fn(async (_args: Row) => ({ id: "re_f" })),
}));
const storage = vi.hoisted(() => ({
  files: new Map<string, Uint8Array>(),
  get: vi.fn(async (key: string) => {
    const bytes = storage.files.get(key);
    if (!bytes) throw new Error(`missing ${key}`);
    return bytes;
  }),
  put: vi.fn(async (key: string, bytes: Uint8Array, _contentType?: string) => {
    storage.files.set(key, bytes);
    return key;
  }),
  putPdf: vi.fn(async (key: string, bytes: Uint8Array) => {
    storage.files.set(key, bytes);
    return key;
  }),
  publicUrl: vi.fn(async (key: string) => `https://storage.example.test/${key}`),
  del: vi.fn(async (key: string) => {
    storage.files.delete(key);
  }),
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
    submitFax: vi.fn(async (_opts: { mediaUrl: string; to?: string }) => ({ id: "fax-ext-1", status: "queued" })),
  };
});
const telegram = vi.hoisted(() => ({ sendAdminTelegram: vi.fn(async (_lines: string[]) => true) }));
const receipt = vi.hoisted(() => ({ generateFaxReceiptPdf: vi.fn(async (_input: Row) => new Uint8Array([82])) }));
const auth = vi.hoisted(() => ({
  isAdmin: vi.fn(async () => true),
  getAdminPrincipal: vi.fn(async (): Promise<{ adminId: string; email: string; via: "cookie" } | null> => ({ adminId: "a1", email: "staff@example.test", via: "cookie" })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    extensionApplication: db,
    filing: { findFirst: vi.fn(async () => null), findMany: vi.fn(async () => []) },
  },
}));
vi.mock("@/lib/email", () => email);
vi.mock("@/lib/storage", () => storage);
vi.mock("@/lib/fax", () => fax);
vi.mock("@/lib/telegram", () => telegram);
vi.mock("@/lib/pdf/faxReceipt", () => receipt);
vi.mock("@/lib/pdf/form7004", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/pdf/form7004")>()),
  generateForm7004: vi.fn(async () => new Uint8Array([70, 55])),
}));
vi.mock("@/lib/admin/auth", () => ({
  ...auth,
  SHARED_ADMIN_LABEL: "Form5472 Prep team (shared admin login)",
  displayStaffIdentity: (v: string | null) => v,
}));
vi.mock("@/lib/apns", () => ({ apnsConfigured: () => false, sendAdminPush: vi.fn() }));
vi.mock("@/lib/partnerBrand", () => ({ brandForFiling: vi.fn(async () => null) }));
vi.mock("@/lib/magicLink", () => ({ makeMagicLink: (id: string) => `https://example.test/magic/${id}` }));
vi.mock("@/lib/env", () => ({
  env: { appUrl: "https://example.test", adminEmail: "support@example.test", telnyx: { destination: "+18558877737" } },
}));

import { POST as faxRoute } from "@/app/api/admin/applications/extension/[id]/fax/route";
import { POST as generateRoute } from "@/app/api/admin/applications/extension/[id]/form-7004/route";
import { PATCH as patchRoute } from "@/app/api/admin/applications/extension/[id]/route";
import { GET as faxStatusPoll } from "@/app/api/cron/fax-status-poll/route";
import { POST as telnyxWebhook } from "@/app/api/telnyx-webhook/route";
import { EXTENSION_FAX_CLAIM } from "@/lib/fax/extension";
import { generateForm7004 } from "@/lib/pdf/form7004";

const ID = "ext_1";
const params = { params: { id: ID } };
const FAX_ID = "7d1e2f3a-aaaa-4bbb-8ccc-111122223333";

function seed(overrides: Row = {}): Row {
  const row: Row = {
    id: ID,
    status: "IN_REVIEW",
    fullName: "Alex Rivera",
    email: "alex@example.test",
    llcName: "Blue Harbor Trading LLC",
    ein: "98-7654321",
    llcStreet: "30 N Gould St",
    llcCity: "Sheridan",
    llcState: "WY",
    llcZip: "82801",
    taxYear: 2025,
    adminNotes: null,
    generatedPdfKey: `${ID}_7004.pdf`,
    generatedAt: new Date("2026-02-01T00:00:00Z"),
    faxJobId: null,
    faxStatus: null,
    faxSentAt: null,
    faxDeliveredAt: null,
    faxConfirmationKey: null,
    faxAttempts: 0,
    updatedAt: new Date("2026-02-01T00:00:00Z"),
    ...overrides,
  };
  state.rows.set(ID, row);
  storage.files.set(`${ID}_7004.pdf`, new Uint8Array([7, 0, 0, 4]));
  return row;
}
const row = () => state.rows.get(ID)!;

function faxRequest(body: Row = {}) {
  return new Request(`https://example.test/api/admin/applications/extension/${ID}/fax`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function webhook(eventType: string, payload: Row = {}) {
  return new Request("https://example.test/api/telnyx-webhook", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data: { event_type: eventType, payload: { fax_id: FAX_ID, direction: "outbound", ...payload } } }),
  });
}

function stubTelnyx(status: string, extra: Row = {}) {
  const fetchMock = vi.fn(async (url: string) => {
    if (!String(url).startsWith("https://api.telnyx.com/v2/faxes/")) throw new Error(`unexpected fetch ${url}`);
    return new Response(
      JSON.stringify({
        data: {
          id: FAX_ID,
          status,
          page_count: 1,
          from: "+15550001111",
          to: "+18558877737",
          created_at: "2026-02-10T10:00:00.000Z",
          updated_at: "2026-02-10T10:02:00.000Z",
          ...extra,
        },
      }),
      { status: 200 },
    );
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  state.rows.clear();
  storage.files.clear();
  vi.clearAllMocks();
  auth.isAdmin.mockResolvedValue(true);
  auth.getAdminPrincipal.mockResolvedValue({ adminId: "a1", email: "staff@example.test", via: "cookie" });
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-02-10T09:00:00Z")); // tax year 2025 ended; due April 15, 2026
  vi.stubEnv("TELNYX_API_KEY", "test-telnyx-key");
  vi.stubEnv("TELNYX_PUBLIC_KEY", "");
  vi.stubEnv("CRON_SECRET", "cron-secret");
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/admin/applications/extension/[id]/fax — guards", () => {
  it("rejects a non-admin", async () => {
    seed();
    auth.getAdminPrincipal.mockResolvedValue(null);
    expect((await faxRoute(faxRequest(), params)).status).toBe(401);
    expect(fax.submitFax).not.toHaveBeenCalled();
  });

  it.each([
    ["order_not_active", { status: "CANCELLED" }],
    ["order_not_active", { status: "PAYMENT_PENDING" }],
    ["no_generated_pdf", { generatedPdfKey: null }],
    ["missing_llc_name", { llcName: "  " }],
    ["missing_ein", { ein: null }],
    ["missing_ein", { ein: "12-34567" }],
    ["missing_tax_year", { taxYear: null }],
    ["tax_year_not_ended", { taxYear: 2026 }],
    ["due_date_passed", { taxYear: 2024 }],
  ])("refuses %s and sends nothing", async (code, overrides) => {
    seed(overrides);
    const before = structuredClone(row());
    const res = await faxRoute(faxRequest({ reason: "a long enough reason to override" }), params);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code, needsReason: false });
    expect(fax.submitFax).not.toHaveBeenCalled();
    expect(row()).toEqual(before);
  });

  it("refuses the day after the due date but allows the due day itself (whole day, UTC)", async () => {
    seed();
    vi.setSystemTime(new Date("2026-04-16T00:00:00Z"));
    expect(await (await faxRoute(faxRequest(), params)).json()).toMatchObject({ code: "due_date_passed" });
    vi.setSystemTime(new Date("2026-04-15T23:30:00Z"));
    expect((await faxRoute(faxRequest(), params)).status).toBe(200);
  });

  it.each([
    ["delivered", { status: "COMPLETED", faxJobId: "old-fax", faxStatus: "delivered", faxDeliveredAt: new Date("2026-02-01T00:00:00Z") }],
    ["in flight", { status: "PROCESSING", faxJobId: "old-fax", faxStatus: "sending.started" }],
    ["marked completed by hand", { status: "COMPLETED" }],
    ["marked faxing by hand", { status: "PROCESSING" }],
    ["stale claim", { faxStatus: EXTENSION_FAX_CLAIM, updatedAt: new Date("2026-02-10T08:00:00Z") }],
  ])("demands a written reason when %s — and sends nothing without one", async (_label, overrides) => {
    seed(overrides);
    const res = await faxRoute(faxRequest({ reason: "too short" }), params);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ code: "reason_required", needsReason: true });
    expect(fax.submitFax).not.toHaveBeenCalled();
  });

  it("refuses a fresh in-progress send even with a reason", async () => {
    seed({ faxStatus: EXTENSION_FAX_CLAIM, updatedAt: new Date("2026-02-10T08:55:00Z") });
    const res = await faxRoute(faxRequest({ reason: "please send it again now" }), params);
    expect(await res.json()).toMatchObject({ code: "fax_in_progress" });
    expect(fax.submitFax).not.toHaveBeenCalled();
  });
});

describe("POST /api/admin/applications/extension/[id]/fax — sending", () => {
  it("snapshots the generated form, faxes it to the IRS and records the job", async () => {
    seed();
    const res = await faxRoute(faxRequest(), params);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, faxJobId: "fax-ext-1", sandbox: false });
    expect(storage.putPdf).toHaveBeenCalledWith(`${ID}_7004_faxed.pdf`, new Uint8Array([7, 0, 0, 4]));
    expect(fax.submitFax).toHaveBeenCalledTimes(1);
    expect(fax.submitFax).toHaveBeenCalledWith({ mediaUrl: `https://storage.example.test/${ID}_7004_faxed.pdf`, to: "+18558877737" });
    expect(row()).toMatchObject({ status: "PROCESSING", faxJobId: "fax-ext-1", faxStatus: "queued", faxAttempts: 1, faxDeliveredAt: null });
    expect(row().faxSentAt).toEqual(new Date("2026-02-10T09:00:00Z"));
    expect(row().adminNotes).toContain("Form 7004 faxed to the IRS (855-887-7737) by staff@example.test — Telnyx fax fax-ext-1");
  });

  it("a second click is a duplicate: needs a reason, which is logged before the re-send", async () => {
    seed();
    await faxRoute(faxRequest(), params);
    const again = await faxRoute(faxRequest(), params);
    expect(await again.json()).toMatchObject({ code: "reason_required" });
    expect(fax.submitFax).toHaveBeenCalledTimes(1);

    fax.submitFax.mockResolvedValueOnce({ id: "fax-ext-2", status: "queued" });
    const forced = await faxRoute(faxRequest({ reason: "IRS line busy all day, client asked" }), params);
    expect(forced.status).toBe(200);
    expect(row()).toMatchObject({ faxJobId: "fax-ext-2", faxAttempts: 2 });
    expect(row().adminNotes).toContain("Re-fax override (in_flight) by staff@example.test: IRS line busy all day, client asked");
  });

  it("releases the claim when Telnyx rejects the fax (nothing was sent)", async () => {
    seed();
    fax.submitFax.mockRejectedValueOnce(new fax.TelnyxSubmitRejectedError(422, "bad number"));
    const res = await faxRoute(faxRequest(), params);
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ code: "fax_submit_rejected" });
    expect(row()).toMatchObject({ faxStatus: null, faxJobId: null, status: "IN_REVIEW" });
  });

  it("keeps the claim after an ambiguous submit so nothing re-sends by itself", async () => {
    seed();
    fax.submitFax.mockRejectedValueOnce(new Error("socket hang up"));
    const res = await faxRoute(faxRequest(), params);
    expect(await res.json()).toMatchObject({ code: "fax_submit_ambiguous" });
    expect(row().faxStatus).toMatch(/^submitting:[0-9a-f-]{36}$/);
    expect(await (await faxRoute(faxRequest({ reason: "retry the fax right now" }), params)).json()).toMatchObject({
      code: "fax_in_progress",
    });
    expect(fax.submitFax).toHaveBeenCalledTimes(1);
  });

  it("re-sends after a confirmed failure without a reason", async () => {
    seed({ faxJobId: "old-fax", faxStatus: "failed:busy", faxAttempts: 1 });
    expect((await faxRoute(faxRequest(), params)).status).toBe(200);
    expect(row()).toMatchObject({ faxJobId: "fax-ext-1", faxAttempts: 2 });
  });
});

describe("Telnyx webhook + poll for an extension fax job", () => {
  const inFlight = { status: "PROCESSING", faxJobId: FAX_ID, faxStatus: "queued", faxSentAt: new Date("2026-02-10T08:59:00Z") };

  it("delivered: completes the order, stores the receipt, emails client (receipt + faxed form), admin and Telegram — once", async () => {
    seed(inFlight);
    storage.files.set(`${ID}_7004_faxed.pdf`, new Uint8Array([9, 9]));
    stubTelnyx("delivered");

    const res = await telnyxWebhook(webhook("fax.delivered"));
    expect(await res.json()).toEqual({ ok: true });
    expect(row()).toMatchObject({
      status: "COMPLETED",
      faxStatus: "delivered",
      faxConfirmationKey: `${ID}_7004_fax_receipt.pdf`,
      faxDeliveredAt: new Date("2026-02-10T10:02:00.000Z"),
    });
    expect(receipt.generateFaxReceiptPdf).toHaveBeenCalledWith(
      expect.objectContaining({ telnyxFaxId: FAX_ID, taxYears: [2025], formsTransmitted: expect.stringContaining("Form 7004") }),
    );
    expect(email.sendExtensionFaxedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "alex@example.test", receiptPdfBytes: new Uint8Array([82]), formPdfBytes: new Uint8Array([9, 9]) }),
    );
    expect(email.sendExtensionFaxDeliveredAdminEmail).toHaveBeenCalledWith(expect.objectContaining({ customerEmailStatus: "sent" }));
    expect(telegram.sendAdminTelegram).toHaveBeenCalledTimes(1);

    // Redelivered webhook and the hourly poll: no second email, receipt or alert.
    expect(await (await telnyxWebhook(webhook("fax.delivered"))).json()).toEqual({ ok: true, deduplicated: true });
    expect(email.sendExtensionFaxedEmail).toHaveBeenCalledTimes(1);
    expect(receipt.generateFaxReceiptPdf).toHaveBeenCalledTimes(1);
    expect(telegram.sendAdminTelegram).toHaveBeenCalledTimes(1);
  });

  it("does not act on an unconfirmed fax.delivered", async () => {
    seed(inFlight);
    stubTelnyx("sending");
    expect(await (await telnyxWebhook(webhook("fax.delivered"))).json()).toMatchObject({ ignored: "status_mismatch" });
    expect(row()).toMatchObject({ status: "PROCESSING", faxStatus: "queued" });
    expect(email.sendExtensionFaxedEmail).not.toHaveBeenCalled();
  });

  it("failed: back to IN_REVIEW, admin email + Telegram, the client gets nothing — once", async () => {
    seed(inFlight);
    stubTelnyx("failed", { failure_reason: "busy" });

    expect(await (await telnyxWebhook(webhook("fax.failed"))).json()).toEqual({ ok: true, failed: true });
    expect(row()).toMatchObject({ status: "IN_REVIEW", faxStatus: "failed:busy", faxDeliveredAt: null });
    expect(row().adminNotes).toContain(`Fax ${FAX_ID} FAILED (busy`);
    expect(email.sendExtensionFaxFailedAdminEmail).toHaveBeenCalledWith(expect.objectContaining({ failureReason: "busy" }));
    expect(telegram.sendAdminTelegram).toHaveBeenCalledTimes(1);
    expect(email.sendExtensionFaxedEmail).not.toHaveBeenCalled();
    expect(fax.submitFax).not.toHaveBeenCalled(); // no automatic retry

    expect(await (await telnyxWebhook(webhook("fax.sending.failed"))).json()).toEqual({ ok: true, deduplicated: true });
    expect(email.sendExtensionFaxFailedAdminEmail).toHaveBeenCalledTimes(1);
  });

  it("records in-progress events for display, never over the send claim", async () => {
    seed(inFlight);
    await telnyxWebhook(webhook("fax.sending.started"));
    expect(row().faxStatus).toBe("sending.started");
    seed({ ...inFlight, faxStatus: EXTENSION_FAX_CLAIM });
    await telnyxWebhook(webhook("fax.media.processed"));
    expect(row().faxStatus).toBe(EXTENSION_FAX_CLAIM);
  });

  it("the hourly poll finalizes a delivered extension fax the webhook missed", async () => {
    seed(inFlight);
    stubTelnyx("delivered");
    const res = await faxStatusPoll(new Request("https://example.test/api/cron/fax-status-poll", { headers: { authorization: "Bearer cron-secret" } }));
    const body = await res.json();
    expect(body).toMatchObject({ errors: [], extensions: { candidates: 1, delivered: 1 } });
    expect(row()).toMatchObject({ status: "COMPLETED", faxStatus: "delivered" });
    expect(email.sendExtensionFaxedEmail).toHaveBeenCalledTimes(1);
  });
});

describe("order edits never leave a stale form to fax", () => {
  function patch(body: Row) {
    return patchRoute(
      new Request(`https://example.test/api/admin/applications/extension/${ID}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
      params,
    );
  }

  it("changing a printed field clears the generated form and logs the change", async () => {
    seed({ adminNotes: "called client" });
    expect((await patch({ ein: "12-3456789", fullName: "Alex Rivera" })).status).toBe(200);
    expect(row()).toMatchObject({ ein: "12-3456789", generatedPdfKey: null, generatedAt: null });
    expect(row().adminNotes).toMatch(/^called client\n\[2026-02-10 09:00 UTC\] Order details edited by admin — ein: "98-7654321" → "12-3456789" \(generated Form 7004 cleared\)$/);
    expect(await (await faxRoute(faxRequest(), params)).json()).toMatchObject({ code: "no_generated_pdf" });
  });

  it("contact-only edits keep the generated form; bad input is rejected", async () => {
    seed();
    expect((await patch({ email: "new@example.test" })).status).toBe(200);
    expect(row()).toMatchObject({ email: "new@example.test", generatedPdfKey: `${ID}_7004.pdf` });
    expect((await patch({ email: "not-an-email" })).status).toBe(400);
    expect((await patch({ taxYear: 1999 })).status).toBe(400);
    expect((await patch({ taxYear: "20x6" })).status).toBe(400);
    expect(row().taxYear).toBe(2025);
  });

  it("refuses to change printed fields while a fax is in flight", async () => {
    seed({ status: "PROCESSING", faxJobId: FAX_ID, faxStatus: "queued" });
    expect((await patch({ llcName: "Other LLC" })).status).toBe(409);
    expect(row().llcName).toBe("Blue Harbor Trading LLC");
  });

  it("generate stores <id>_7004.pdf and returns the missing-field warnings", async () => {
    seed({ generatedPdfKey: null, generatedAt: null, llcZip: null });
    const res = await generateRoute(new Request("https://example.test/x", { method: "POST" }), params);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, warnings: ["Address incomplete — missing ZIP."] });
    const [key, bytes, type] = storage.put.mock.calls[0];
    expect(key).toMatch(/^ext_1_7004_\d+_[0-9a-f]{8}\.pdf$/);
    expect([bytes, type]).toEqual([new Uint8Array([70, 55]), "application/pdf"]);
    expect(row()).toMatchObject({ generatedPdfKey: key });
  });
});

// Races found by the Codex review of ccfded6: each interleaving is forced with
// gated mocks so the test fails on the old code path.
describe("races", () => {
  const readRow = db.findUnique.getMockImplementation()!;
  function patchReq(body: Row) {
    return new Request(`https://example.test/api/admin/applications/extension/${ID}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("race 1: two reasoned re-sends of the same stale claim send ONE fax", async () => {
    seed({ faxStatus: EXTENSION_FAX_CLAIM, updatedAt: new Date("2026-02-10T08:00:00Z") });
    // Both requests read the stale claim before either writes.
    let arrived = 0;
    let bothRead!: () => void;
    const barrier = new Promise<void>((resolve) => (bothRead = resolve));
    const gatedRead = async (args: Parameters<typeof readRow>[0]) => {
      const found = await readRow(args);
      if (++arrived === 2) bothRead();
      await barrier;
      return found;
    };
    db.findUnique.mockImplementationOnce(gatedRead).mockImplementationOnce(gatedRead);

    const reason = { reason: "checked Telnyx, nothing went out" };
    const [a, b] = await Promise.all([faxRoute(faxRequest(reason), params), faxRoute(faxRequest(reason), params)]);

    expect([a.status, b.status].sort()).toEqual([200, 409]);
    expect(fax.submitFax).toHaveBeenCalledTimes(1);
    expect(row()).toMatchObject({ faxJobId: "fax-ext-1", faxAttempts: 1, status: "PROCESSING" });
  });

  it("race 2: a generation that lost to a newer edit cannot overwrite the published PDF", async () => {
    seed({ generatedPdfKey: null, generatedAt: null });
    const gen = vi.mocked(generateForm7004);
    let aReading!: () => void;
    const aRead = new Promise<void>((resolve) => (aReading = resolve));
    let openA!: () => void;
    const gateA = new Promise<void>((resolve) => (openA = resolve));
    gen.mockImplementationOnce(async () => {
      aReading();
      await gateA;
      return new Uint8Array([0x0a]); // built from the OLD EIN
    });
    const post = () => generateRoute(new Request("https://example.test/x", { method: "POST" }), params);

    const a = post(); // A has read the old EIN and is generating
    await aRead;
    expect((await patchRoute(patchReq({ ein: "12-3456789" }), params)).status).toBe(200);
    gen.mockImplementationOnce(async () => new Uint8Array([0x0b])); // B: the corrected EIN
    expect((await post()).status).toBe(200);
    openA();
    expect((await a).status).toBe(409);

    const key = row().generatedPdfKey as string;
    expect(key).toBeTruthy();
    expect(storage.files.get(key)).toEqual(new Uint8Array([0x0b]));
    // The loser's own upload is cleaned up; nothing it wrote is published.
    expect(Array.from(storage.files.values())).not.toContainEqual(new Uint8Array([0x0a]));
  });

  it("race 3: a printed-field edit that read an idle order cannot commit after a fax claimed it", async () => {
    seed();
    let patchReading!: () => void;
    const patchRead = new Promise<void>((resolve) => (patchReading = resolve));
    let openPatch!: () => void;
    const gate = new Promise<void>((resolve) => (openPatch = resolve));
    db.findUnique.mockImplementationOnce(async (args) => {
      const found = await readRow(args);
      patchReading();
      await gate;
      return found;
    });

    const p = patchRoute(patchReq({ ein: "12-3456789" }), params);
    await patchRead;
    expect((await faxRoute(faxRequest(), params)).status).toBe(200);
    openPatch();

    expect((await p).status).toBe(409);
    expect(row()).toMatchObject({ ein: "98-7654321", generatedPdfKey: `${ID}_7004.pdf`, faxJobId: "fax-ext-1" });
  });
});
