import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    telnyx: { apiKey: "test-telnyx-key", connectionId: "conn", faxNumber: "+15550001111", destination: "+18558877737" },
  },
}));

import { submitFax, TelnyxSubmitMissingIdError, TelnyxSubmitRejectedError } from "@/lib/fax";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("submitFax (Telnyx stubbed — nothing is sent)", () => {
  it("returns the new job id on success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data: { id: "fax-new", status: "queued" } }), { status: 200 })));
    await expect(submitFax({ mediaUrl: "https://example.test/a.pdf" })).resolves.toEqual({ id: "fax-new", status: "queued" });
  });

  it("throws TelnyxSubmitRejectedError on an HTTP error (no fax created)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("bad media", { status: 422 })));
    await expect(submitFax({ mediaUrl: "https://example.test/a.pdf" })).rejects.toBeInstanceOf(TelnyxSubmitRejectedError);
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
