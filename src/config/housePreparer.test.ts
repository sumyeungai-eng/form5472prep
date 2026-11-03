import { describe, expect, it } from "vitest";
import {
  housePreparerConfigStatus,
  housePreparerFromEnv,
  housePreparerIrsDiscussDefault,
} from "./housePreparer";

// Synthetic values only — never real preparer data.
const BASE = {
  HOUSE_PREPARER_PTIN: "P00000001",
  HOUSE_PREPARER_FIRM_NAME: "Synthetic Preparer Firm LLC",
  HOUSE_PREPARER_FIRM_EIN: "00-0000001",
  HOUSE_PREPARER_FIRM_ADDRESS: "1 Synthetic Way, Example City, ST 00000",
};

describe("house preparer config", () => {
  it("a config without a preparer name is valid and yields a blank name", () => {
    expect(housePreparerConfigStatus(BASE)).toEqual({ complete: true, missing: [], invalid: [] });
    expect(housePreparerFromEnv(BASE)).toMatchObject({ name: "", ptin: "P00000001", phone: null });
    expect(housePreparerFromEnv({ ...BASE, HOUSE_PREPARER_NAME: "  " })?.name).toBe("");
  });

  it("still requires PTIN, firm name, firm EIN and firm address", () => {
    const status = housePreparerConfigStatus({});
    expect(status.complete).toBe(false);
    expect(status.missing).toEqual([
      "HOUSE_PREPARER_PTIN",
      "HOUSE_PREPARER_FIRM_NAME",
      "HOUSE_PREPARER_FIRM_EIN",
      "HOUSE_PREPARER_FIRM_ADDRESS",
    ]);
    expect(housePreparerConfigStatus({ ...BASE, HOUSE_PREPARER_PTIN: "12345678" }).invalid).toEqual(["HOUSE_PREPARER_PTIN"]);
    expect(housePreparerFromEnv({ ...BASE, HOUSE_PREPARER_FIRM_ADDRESS: "" })).toBeNull();
  });

  it("phone prefers HOUSE_PREPARER_FIRM_PHONE and falls back to HOUSE_PREPARER_PHONE", () => {
    const legacy = { ...BASE, HOUSE_PREPARER_PHONE: "555-0100" };
    expect(housePreparerFromEnv(legacy)?.phone).toBe("555-0100");
    expect(housePreparerFromEnv({ ...legacy, HOUSE_PREPARER_FIRM_PHONE: "555-0199" })?.phone).toBe("555-0199");
    expect(housePreparerFromEnv({ ...legacy, HOUSE_PREPARER_FIRM_PHONE: " " })?.phone).toBe("555-0100");
  });

  it("IRS_DISCUSS defaults to blank, accepts yes/no in any case, and flags anything else as invalid", () => {
    expect(housePreparerIrsDiscussDefault(BASE)).toBeNull();
    expect(housePreparerIrsDiscussDefault({ HOUSE_PREPARER_IRS_DISCUSS: "blank" })).toBeNull();
    expect(housePreparerIrsDiscussDefault({ HOUSE_PREPARER_IRS_DISCUSS: "YES" })).toBe("yes");
    expect(housePreparerIrsDiscussDefault({ HOUSE_PREPARER_IRS_DISCUSS: " no " })).toBe("no");
    const bad = { ...BASE, HOUSE_PREPARER_IRS_DISCUSS: "maybe" };
    expect(housePreparerIrsDiscussDefault(bad)).toBeNull();
    expect(housePreparerConfigStatus(bad)).toEqual({ complete: false, missing: [], invalid: ["HOUSE_PREPARER_IRS_DISCUSS"] });
  });
});
