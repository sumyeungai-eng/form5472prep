import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    telnyx: { apiKey: "test-telnyx-key", connectionId: "conn", faxNumber: "+15550001111", destination: "+18558877737" },
  },
}));

import {
  submitFax,
  TelnyxSubmitAmbiguousError,
  TelnyxSubmitMissingIdError,
  TelnyxSubmitRejectedError,
} from "@/lib/fax";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("submitFax (Telnyx stubbed — nothing is sent)", () => {
  it("returns the new job id on success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: { id: "fax-new", status: "queued" } }), { status: 200 })));
    await expect(submitFax({ mediaUrl: "https://example.test/a.pdf" })).resolves.toEqual({ id: "fax-new", status: "queued" });
  });

  it.each([400, 401, 422, 429])(
    "throws TelnyxSubmitRejectedError on HTTP %i: Telnyx said no, no fax was created",
    async (status) => {
      vi.stubGlobal("fetch", vi.fn(async () => new Response("bad media", { status })));
      const err = await submitFax({ mediaUrl: "https://example.test/a.pdf" }).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(TelnyxSubmitRejectedError);
      expect(err).toMatchObject({ httpStatus: status });
    },
  );

  it.each([500, 502, 503, 504])(
    "treats HTTP %i as ambiguous (a gateway may answer after Telnyx queued the fax), never as a rejection",
    async (status) => {
      vi.stubGlobal("fetch", vi.fn(async () => new Response("Bad Gateway", { status })));
      const err = await submitFax({ mediaUrl: "https://example.test/a.pdf" }).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(TelnyxSubmitAmbiguousError);
      expect(err).not.toBeInstanceOf(TelnyxSubmitRejectedError);
      expect(err).toMatchObject({ httpStatus: status, message: expect.stringContaining("check Telnyx") });
    },
  );

  it("lets a network error or timeout surface as-is (ambiguous — not a rejection)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new TypeError("fetch failed");
    }));
    const err = await submitFax({ mediaUrl: "https://example.test/a.pdf" }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TypeError);
    expect(err).not.toBeInstanceOf(TelnyxSubmitRejectedError);
  });

  it.each([
    ["no data", {}],
    ["no id", { data: { status: "queued" } }],
    ["non-string id", { data: { id: 42 } }],
    ["empty id", { data: { id: "  " } }],
  ])("treats a 2xx with %s as ambiguous (TelnyxSubmitMissingIdError, not a rejection)", async (_label, body) => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })));
    const err = await submitFax({ mediaUrl: "https://example.test/a.pdf" }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(TelnyxSubmitMissingIdError);
    expect(err).not.toBeInstanceOf(TelnyxSubmitRejectedError);
  });
});
