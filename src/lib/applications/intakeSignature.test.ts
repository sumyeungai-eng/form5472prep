import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => ({
  put: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
}));

const db = vi.hoisted(() => ({
  einUpdate: vi.fn(),
  itinUpdate: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({
  put: storage.put,
  get: storage.get,
  del: storage.del,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    einApplication: { update: db.einUpdate },
    itinApplication: { update: db.itinUpdate },
  },
}));

import { INTAKE_CONSENT_VERSION } from "./intakeConsent";
import { intakeSignatureKey, storeIntakeSignature } from "./intakeSignature";

describe("intakeSignatureKey", () => {
  it("returns the expected key shape", () => {
    expect(intakeSignatureKey("ein", "ein_123")).toBe("applications/ein/ein_123/intake-signature.png");
    expect(intakeSignatureKey("itin", "itin_456")).toBe("applications/itin/itin_456/intake-signature.png");
  });
});

describe("storeIntakeSignature", () => {
  const now = new Date("2026-09-21T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    storage.put.mockReset();
    db.einUpdate.mockReset();
    db.itinUpdate.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores and updates an EIN intake signature", async () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const req = new Request("https://example.test", {
      headers: {
        "x-forwarded-for": " 203.0.113.10, 198.51.100.7 ",
        "user-agent": "A".repeat(305),
      },
    });

    await storeIntakeSignature("ein", "ein_123", bytes, "Alex Chen", req);

    expect(storage.put).toHaveBeenCalledWith("applications/ein/ein_123/intake-signature.png", bytes, "image/png");
    expect(db.einUpdate).toHaveBeenCalledWith({
      where: { id: "ein_123" },
      data: {
        intakeSignaturePngKey: "applications/ein/ein_123/intake-signature.png",
        intakeSignedAt: now,
        intakeSignerName: "Alex Chen",
        intakeSignatureIp: "203.0.113.10",
        intakeSignatureUserAgent: "A".repeat(300),
        intakeConsentVersion: INTAKE_CONSENT_VERSION,
      },
    });
    expect(db.itinUpdate).not.toHaveBeenCalled();
  });

  it("stores and updates an ITIN intake signature", async () => {
    const bytes = new Uint8Array([4, 5, 6]);
    const req = new Request("https://example.test", {
      headers: {
        "x-real-ip": " 203.0.113.11 ",
      },
    });

    await storeIntakeSignature("itin", "itin_456", bytes, "Casey Lee", req);

    expect(storage.put).toHaveBeenCalledWith("applications/itin/itin_456/intake-signature.png", bytes, "image/png");
    expect(db.itinUpdate).toHaveBeenCalledWith({
      where: { id: "itin_456" },
      data: {
        intakeSignaturePngKey: "applications/itin/itin_456/intake-signature.png",
        intakeSignedAt: now,
        intakeSignerName: "Casey Lee",
        intakeSignatureIp: "203.0.113.11",
        intakeSignatureUserAgent: null,
        intakeConsentVersion: INTAKE_CONSENT_VERSION,
      },
    });
    expect(db.einUpdate).not.toHaveBeenCalled();
  });
});
