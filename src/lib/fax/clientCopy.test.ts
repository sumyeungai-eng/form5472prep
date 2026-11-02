import { describe, expect, it, vi } from "vitest";

// Release gate (Codex P1): the client's emailed copy needs a release or a fax.
const storage = vi.hoisted(() => ({ get: vi.fn(async () => new Uint8Array([37, 80, 68, 70])) }));
vi.mock("@/lib/storage", () => storage);
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { loadFaxClientCopy } from "./clientCopy";

const base = { signedPdfKey: "f1_signed.pdf", faxedPdfKey: null, ownerSsnLast4: null, ownerSsnCiphertext: null };

describe("loadFaxClientCopy release gate", () => {
  it("attaches nothing when the package was neither released nor faxed", async () => {
    await expect(loadFaxClientCopy({ ...base, reviewApprovedAt: null, faxedAt: null }, true)).resolves.toBeUndefined();
    expect(storage.get).not.toHaveBeenCalled();
  });
  it("attaches the copy once faxed (offline-signed orders)", async () => {
    await expect(loadFaxClientCopy({ ...base, reviewApprovedAt: null, faxedAt: new Date() }, true)).resolves.toBeInstanceOf(Uint8Array);
  });
  it("attaches the copy once released", async () => {
    await expect(loadFaxClientCopy({ ...base, reviewApprovedAt: new Date(), faxedAt: null }, true)).resolves.toBeInstanceOf(Uint8Array);
  });
});
