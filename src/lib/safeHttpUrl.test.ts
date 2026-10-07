import { describe, expect, it } from "vitest";
import { safeHttpUrl } from "./safeHttpUrl";

describe("safeHttpUrl", () => {
  it("keeps http(s) links", () => {
    expect(safeHttpUrl("https://www.form5472prep.com/pricing")).toBe("https://www.form5472prep.com/pricing");
    expect(safeHttpUrl(" http://x.test/a ")).toBe("http://x.test/a");
  });
  it.each(["javascript:alert(1)", "JAVASCRIPT:alert(1)", " javascript:fetch('/x')", "data:text/html,x", "vbscript:x", "/relative", "", null, undefined])(
    "rejects %s",
    (raw) => expect(safeHttpUrl(raw)).toBeNull(),
  );
});
