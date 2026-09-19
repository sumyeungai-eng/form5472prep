import { describe, expect, it, vi } from "vitest";
import {
  FAX_PDF_MAX_BYTES,
  downloadFaxPdf,
  formatFaxNumber,
  inboundFaxAllowed,
  linkData,
  parseInboundFaxEvent,
  validateFaxPdf,
} from "./inboundFax";

describe("parseInboundFaxEvent", () => {
  it("parses a realistic fax.received payload", () => {
    const evt = parseInboundFaxEvent({
      data: {
        event_type: "fax.received",
        occurred_at: "2026-09-19T10:00:00.000Z",
        payload: {
          fax_id: "fax_123",
          from: "+14155550123",
          to: "+18005550100",
          page_count: 2,
          media_url: "https://api.telnyx.com/media/fax_123.pdf",
          created_at: "2026-09-19T10:01:00.000Z",
          updated_at: "2026-09-19T10:02:00.000Z",
        },
      },
    });

    expect(evt).toEqual({
      faxId: "fax_123",
      fromNumber: "+14155550123",
      toNumber: "+18005550100",
      pageCount: 2,
      mediaUrl: "https://api.telnyx.com/media/fax_123.pdf",
      receivedAt: new Date("2026-09-19T10:02:00.000Z"),
    });
  });

  it("returns null for a different event type", () => {
    expect(parseInboundFaxEvent({ data: { event_type: "fax.delivered", payload: { fax_id: "fax_123" } } })).toBeNull();
  });

  it("returns null when fax_id is missing", () => {
    expect(parseInboundFaxEvent({ data: { event_type: "fax.received", payload: {} } })).toBeNull();
  });

  it("returns null for malformed inputs without throwing", () => {
    expect(parseInboundFaxEvent(null)).toBeNull();
    expect(parseInboundFaxEvent("nope")).toBeNull();
    expect(parseInboundFaxEvent([])).toBeNull();
  });

  it("falls back to now when dates are unparseable", () => {
    const before = Date.now();
    const evt = parseInboundFaxEvent({
      data: {
        event_type: "fax.received",
        occurred_at: "bad",
        payload: { fax_id: "fax_123", created_at: "also bad", updated_at: "still bad" },
      },
    });
    const after = Date.now();
    expect(evt).not.toBeNull();
    expect(evt!.receivedAt.getTime()).toBeGreaterThanOrEqual(before - 2000);
    expect(evt!.receivedAt.getTime()).toBeLessThanOrEqual(after + 2000);
  });
});

describe("inboundFaxAllowed", () => {
  it("allows production when the public key is set", () => {
    expect(inboundFaxAllowed({ publicKeySet: true, nodeEnv: "production" })).toBe(true);
  });

  it("blocks production when the public key is missing", () => {
    expect(inboundFaxAllowed({ publicKeySet: false, nodeEnv: "production" })).toBe(false);
  });

  it("allows non-production when the public key is set", () => {
    expect(inboundFaxAllowed({ publicKeySet: true, nodeEnv: "test" })).toBe(true);
  });

  it("allows non-production when the public key is missing", () => {
    expect(inboundFaxAllowed({ publicKeySet: false, nodeEnv: "development" })).toBe(true);
  });
});

describe("validateFaxPdf", () => {
  it("accepts PDF bytes", () => {
    expect(validateFaxPdf(new TextEncoder().encode("%PDF-1.7"))).toEqual({ ok: true });
  });

  it("rejects non-PDF bytes", () => {
    expect(validateFaxPdf(new TextEncoder().encode("hello")).ok).toBe(false);
  });

  it("rejects empty bytes", () => {
    expect(validateFaxPdf(new Uint8Array()).ok).toBe(false);
  });

  it("rejects oversized bytes", () => {
    expect(validateFaxPdf(new Uint8Array(FAX_PDF_MAX_BYTES + 1)).ok).toBe(false);
  });
});

describe("formatFaxNumber", () => {
  it("formats a US E.164 fax number", () => {
    expect(formatFaxNumber("+14155550123")).toBe("+1 (415) 555-0123");
  });

  it("handles null", () => {
    expect(formatFaxNumber(null)).toBe("Unknown sender");
  });

  it("trims and returns malformed numbers unchanged otherwise", () => {
    expect(formatFaxNumber("  555-0123  ")).toBe("555-0123");
  });
});

describe("linkData", () => {
  it("sets filing only", () => {
    expect(linkData({ type: "filing", id: "filing_1" })).toEqual({
      filingId: "filing_1",
      einApplicationId: null,
      itinApplicationId: null,
    });
  });

  it("sets EIN only", () => {
    expect(linkData({ type: "ein", id: "ein_1" })).toEqual({
      filingId: null,
      einApplicationId: "ein_1",
      itinApplicationId: null,
    });
  });

  it("sets ITIN only", () => {
    expect(linkData({ type: "itin", id: "itin_1" })).toEqual({
      filingId: null,
      einApplicationId: null,
      itinApplicationId: "itin_1",
    });
  });

  it("clears all links for null", () => {
    expect(linkData(null)).toEqual({
      filingId: null,
      einApplicationId: null,
      itinApplicationId: null,
    });
  });
});

describe("downloadFaxPdf", () => {
  it("rejects http URLs before fetching", async () => {
    const fetchImpl = vi.fn();
    await expect(downloadFaxPdf("http://example.com/fax.pdf", fetchImpl as unknown as typeof fetch)).rejects.toThrow("https");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("throws on non-2xx responses", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("no", { status: 404 }));
    await expect(downloadFaxPdf("https://example.com/fax.pdf", fetchImpl as unknown as typeof fetch)).rejects.toThrow("404");
  });

  it("rejects oversized content-length before consuming the body", async () => {
    const getReader = vi.fn();
    const arrayBuffer = vi.fn();
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ "content-length": String(FAX_PDF_MAX_BYTES + 1) }),
      body: { getReader },
      arrayBuffer,
    } as unknown as Response);
    await expect(downloadFaxPdf("https://example.com/fax.pdf", fetchImpl as unknown as typeof fetch)).rejects.toThrow("25 MB");
    expect(getReader).not.toHaveBeenCalled();
    expect(arrayBuffer).not.toHaveBeenCalled();
  });

  it("downloads a small PDF response", async () => {
    const bytes = new TextEncoder().encode("%PDF-1.7\n");
    const fetchImpl = vi.fn().mockResolvedValue(new Response(bytes));
    await expect(downloadFaxPdf("https://example.com/fax.pdf", fetchImpl as unknown as typeof fetch)).resolves.toEqual(bytes);
  });
});
