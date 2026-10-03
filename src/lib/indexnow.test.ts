import { describe, expect, it, vi } from "vitest";
import { submitToIndexNow } from "./indexnow";

describe("submitToIndexNow", () => {
  it("posts deduped on-site URLs with the public key", async () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 202 })) as unknown as typeof fetch;
    const result = await submitToIndexNow(
      [
        "https://www.form5472prep.com/blog/a",
        "https://www.form5472prep.com/blog/a",
        "https://evil.example/x",
      ],
      { fetchImpl },
    );
    expect(result).toEqual({ ok: true, status: 202, submitted: 1 });
    const body = JSON.parse((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body.host).toBe("www.form5472prep.com");
    expect(body.urlList).toEqual(["https://www.form5472prep.com/blog/a"]);
    expect(body.keyLocation).toBe(`https://www.form5472prep.com/${body.key}.txt`);
  });

  it("reports failure instead of throwing", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    await expect(submitToIndexNow(["https://www.form5472prep.com/blog/a"], { fetchImpl })).resolves.toMatchObject({
      ok: false,
      error: "network down",
    });
  });

  it("skips the call when there is nothing to submit", async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    await expect(submitToIndexNow([], { fetchImpl })).resolves.toMatchObject({ ok: true, submitted: 0 });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
