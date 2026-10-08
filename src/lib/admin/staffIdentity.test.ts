import { describe, expect, it, vi } from "vitest";

describe("displayStaffIdentity", () => {
  it("shows the team label instead of the shared login's sign-in email (old rows)", async () => {
    vi.stubEnv("ADMIN_LOGIN_EMAIL", "Owner.Personal@Gmail.com");
    vi.resetModules();
    const { displayStaffIdentity, SHARED_ADMIN_LABEL } = await import("./auth");
    expect(displayStaffIdentity("owner.personal@gmail.com")).toBe(SHARED_ADMIN_LABEL);
    expect(displayStaffIdentity("colleague@form5472prep.com")).toBe("colleague@form5472prep.com");
    expect(displayStaffIdentity(null)).toBeNull();
    vi.unstubAllEnvs();
  });
});
