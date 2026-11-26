import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getAdminPrincipal: vi.fn() }));
const db = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn() }));
const storage = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/admin/auth", () => auth);
vi.mock("@/lib/prisma", () => ({ prisma: { admin: db } }));
vi.mock("@/lib/storage", () => storage);
import { GET, DELETE } from "./route";

// Both drawings use the same handlers but never the same account column.
describe.each([
  { query: "", key: "preparerSignatureKey", saved: "signature.png" },
  { query: "?kind=name", key: "preparerNameKey", saved: "name.png" },
])("saved preparer drawing $key", ({ query, key, saved }) => {
  const request = () => new Request(`https://x.test/api/admin/preparer-signature${query}`);
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getAdminPrincipal.mockResolvedValue({ adminId: "personal_1", email: "staff@example.test" });
    db.findUnique.mockResolvedValue({ preparerSignatureKey: "signature.png", preparerNameKey: "name.png" });
    storage.get.mockResolvedValue(new Uint8Array([1, 2, 3]));
  });

  it("requires authentication for GET and DELETE", async () => {
    auth.getAdminPrincipal.mockResolvedValue(null);
    expect((await GET(request())).status).toBe(401);
    expect((await DELETE(request())).status).toBe(401);
    expect(db.findUnique).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it("serves only the caller's own selected drawing without caching", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    expect(db.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "personal_1" } }));
    expect(storage.get).toHaveBeenCalledExactlyOnceWith(saved);
  });

  it("forgets only the selected drawing", async () => {
    expect((await DELETE(request())).status).toBe(200);
    expect(db.update).toHaveBeenCalledExactlyOnceWith({ where: { id: "personal_1" }, data: { [key]: null } });
  });

  it("returns 404 for an absent drawing without falling back to the other kind", async () => {
    db.findUnique.mockResolvedValue({ preparerSignatureKey: "signature.png", preparerNameKey: "name.png", [key]: null });
    expect((await GET(request())).status).toBe(404);
    expect(storage.get).not.toHaveBeenCalled();
  });

  it("returns 404 when the saved key's blob is missing", async () => {
    storage.get.mockRejectedValueOnce(Object.assign(new Error("missing blob"), { code: "ENOENT" }));
    expect((await GET(request())).status).toBe(404);
    expect(storage.get).toHaveBeenCalledExactlyOnceWith(saved);
  });

  it.each(["typo", "preparerName", ""])("rejects unknown kind=%s without reading or deleting the signature", async (kind) => {
    const unknownRequest = () => new Request(`https://x.test/api/admin/preparer-signature?kind=${kind}`);
    expect((await GET(unknownRequest())).status).toBe(400);
    expect((await DELETE(unknownRequest())).status).toBe(400);
    expect(db.findUnique).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
    expect(storage.get).not.toHaveBeenCalled();
  });

  it("shared-password sessions have nothing to reuse or forget", async () => {
    auth.getAdminPrincipal.mockResolvedValue({ adminId: null });
    expect((await GET(request())).status).toBe(404);
    expect((await DELETE(request())).status).toBe(200);
    expect(db.findUnique).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
    expect(storage.get).not.toHaveBeenCalled();
  });
});
