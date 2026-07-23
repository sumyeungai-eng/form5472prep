import { describe, expect, it } from "vitest";
import { decideLogin } from "./logic";

describe("decideLogin", () => {
  it("denies a wrong password even when the first admin could be bootstrapped", () => {
    expect(
      decideLogin({
        adminExists: false,
        adminActive: null,
        adminCount: 0,
        passwordOk: false,
      }),
    ).toEqual({ kind: "deny" });
  });

  it("denies a wrong password for an existing active admin", () => {
    expect(
      decideLogin({
        adminExists: true,
        adminActive: true,
        adminCount: 1,
        passwordOk: false,
      }),
    ).toEqual({ kind: "deny" });
  });

  it("allows an existing active admin with the correct password", () => {
    expect(
      decideLogin({
        adminExists: true,
        adminActive: true,
        adminCount: 1,
        passwordOk: true,
      }),
    ).toEqual({ kind: "allow-existing" });
  });

  it("denies an existing inactive admin with the correct password", () => {
    expect(
      decideLogin({
        adminExists: true,
        adminActive: false,
        adminCount: 1,
        passwordOk: true,
      }),
    ).toEqual({ kind: "deny" });
  });

  it("denies an existing admin with an unknown active state", () => {
    expect(
      decideLogin({
        adminExists: true,
        adminActive: null,
        adminCount: 1,
        passwordOk: true,
      }),
    ).toEqual({ kind: "deny" });
  });

  it("bootstraps the first admin with the correct password", () => {
    expect(
      decideLogin({
        adminExists: false,
        adminActive: null,
        adminCount: 0,
        passwordOk: true,
      }),
    ).toEqual({ kind: "bootstrap" });
  });

  it("denies an unknown email once an admin already exists", () => {
    expect(
      decideLogin({
        adminExists: false,
        adminActive: null,
        adminCount: 1,
        passwordOk: true,
      }),
    ).toEqual({ kind: "deny" });
  });
});
