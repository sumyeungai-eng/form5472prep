import { describe, expect, it } from "vitest";
import { RCS_TEXT_MAX } from "@/lib/schemas";
import { generatePackage } from "./generatePackage";
import { F5, finalisedAt } from "./__fixtures__/filings";

// The per-year answer cap is 20,000 characters (2026-10-10). The statement page
// must wrap and paginate an answer that long rather than overflow or throw.
describe("reasonable-cause statement with a maximum-length answer", () => {
  it("flows a near-cap answer onto additional pages", async () => {
    const sentence = "the owner relied on a formation agent who did not explain the annual information return obligation. ";
    const longWhy = sentence.repeat(Math.floor((RCS_TEXT_MAX - 100) / sentence.length)).trim();
    expect(longWhy.length).toBeGreaterThan(RCS_TEXT_MAX - 200);
    expect(longWhy.length).toBeLessThanOrEqual(RCS_TEXT_MAX);

    const base = await generatePackage(F5, finalisedAt);
    const long = await generatePackage(
      {
        ...F5,
        yearData: F5.yearData.map((row) => (row.taxYear === 2024 ? { ...row, rcsWhyMissed: longWhy } : row)),
      },
      finalisedAt,
    );
    expect(long.totalPages).toBeGreaterThanOrEqual(base.totalPages + 3);
  }, 60_000);
});
