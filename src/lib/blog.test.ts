import { describe, expect, it } from "vitest";
import { isPubliclyAvailable } from "./blog";

describe("isPubliclyAvailable", () => {
  const now = new Date("2026-07-27T13:00:00.000Z");

  it("keeps drafts private even after their release time", () => {
    expect(
      isPubliclyAvailable(
        { draft: true, publishAt: "2026-07-27T09:00:00-04:00" },
        now,
      ),
    ).toBe(false);
  });

  it("keeps a scheduled post private before its release time", () => {
    expect(
      isPubliclyAvailable(
        { draft: false, publishAt: "2026-07-27T09:00:01-04:00" },
        now,
      ),
    ).toBe(false);
  });

  it("publishes at the exact scheduled instant", () => {
    expect(
      isPubliclyAvailable(
        { draft: false, publishAt: "2026-07-27T09:00:00-04:00" },
        now,
      ),
    ).toBe(true);
  });

  it("continues to publish older posts without a schedule", () => {
    expect(isPubliclyAvailable({ draft: false }, now)).toBe(true);
  });
});
