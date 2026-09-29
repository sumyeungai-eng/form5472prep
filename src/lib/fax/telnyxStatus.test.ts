import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({ env: { telnyx: { destination: "+18558877737" } } }));

import { deliveryFactsFromTelnyx, fetchTelnyxFax, isRetryLabel, isTelnyxFailedStatus } from "@/lib/fax/telnyxStatus";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchTelnyxFax", () => {
  it("returns the API record on success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: { id: "fax-1", status: "delivered" } }), { status: 200 })));
    await expect(fetchTelnyxFax("fax-1", { apiKey: "k" })).resolves.toEqual({
      ok: true,
      fax: { id: "fax-1", status: "delivered" },
    });
  });

  it.each([
    ["HTTP error", () => new Response("nope", { status: 404 }), "Telnyx GET 404"],
    ["no status", () => new Response(JSON.stringify({ data: { id: "fax-1" } }), { status: 200 }), "Telnyx response missing data.status"],
    ["another fax's record", () => new Response(JSON.stringify({ data: { id: "fax-2", status: "delivered" } }), { status: 200 }), "Telnyx returned a different fax id"],
  ])("fails closed on %s", async (_label, respond, error) => {
    vi.stubGlobal("fetch", vi.fn(async () => respond()));
    await expect(fetchTelnyxFax("fax-1", { apiKey: "k" })).resolves.toMatchObject({ ok: false, error });
  });

  it("never calls Telnyx without a key or for a sandbox id", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const saved = process.env.TELNYX_API_KEY;
    delete process.env.TELNYX_API_KEY;
    try {
      await expect(fetchTelnyxFax("fax-1")).resolves.toMatchObject({ ok: false });
    } finally {
      if (saved !== undefined) process.env.TELNYX_API_KEY = saved;
    }
    await expect(fetchTelnyxFax("sandbox_1", { apiKey: "k" })).resolves.toMatchObject({ ok: false });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("status helpers", () => {
  it("classifies Telnyx failure statuses and our retry labels", () => {
    expect(isTelnyxFailedStatus("failed")).toBe(true);
    expect(isTelnyxFailedStatus("sending.failed")).toBe(true);
    expect(isTelnyxFailedStatus("sending")).toBe(false);
    expect(isRetryLabel("retry_3")).toBe(true);
    expect(isRetryLabel("retrying_1")).toBe(true);
    expect(isRetryLabel("sending.started")).toBe(false);
  });

  it("prefers the API record and only fills gaps from the payload", () => {
    const facts = deliveryFactsFromTelnyx(
      { id: "fax-1", status: "delivered", updated_at: "2026-09-20T10:03:00.000Z", page_count: 7 },
      { updated_at: "2020-01-01T00:00:00.000Z", page_count: 99, call_duration_secs: 42, created_at: "2026-09-20T10:00:00.000Z" },
    );
    expect(facts).toEqual({
      faxId: "fax-1",
      submittedAtIso: "2026-09-20T10:00:00.000Z",
      deliveredAtIso: "2026-09-20T10:03:00.000Z",
      pageCount: 7,
      durationSecs: 42,
      from: null,
      to: "+18558877737",
    });
  });
});
