import { describe, expect, it } from "vitest";
import { abandonedDraftAudience } from "./reminders";
describe("abandonedDraftAudience", () => {
  it("excludes customers who already paid for a filing", () => {
    const where = abandonedDraftAudience();
    const none = where.user && "is" in where.user ? where.user.is?.filings?.none : undefined;
    expect(none).toBeTruthy();
    const or = (none as { OR?: unknown[] }).OR ?? [];
    expect(or).toContainEqual({ status: { in: expect.arrayContaining(["PAID", "CONFIRMED"]) } });
    expect(or).toContainEqual({ stripePaymentId: { not: null } });
  });

  it("only reminds about drafts that name a company and are still live", () => {
    const where = abandonedDraftAudience();
    expect(where.status).toBe("DRAFT");
    expect(where.llcName).toEqual({ not: null });
    expect(where.adminHidden).toBe(false);
    expect(where.supersededAt).toBeNull();
  });
});
