import { describe, expect, it } from "vitest";
import {
  decideBootstrap,
  type BootstrapDecision,
} from "./decide";

function expectDeniedWithoutConfiguredEmail(
  decision: BootstrapDecision,
  configuredEmail: string,
  code: string,
): void {
  expect(decision.kind).toBe("deny");
  if (decision.kind !== "deny") {
    throw new Error("Expected bootstrap to be denied");
  }

  expect(decision).toMatchObject({ status: 403, code });
  expect(decision.message).not.toContain(configuredEmail);
}

describe("decideBootstrap", () => {
  it("allows an empty table when mixed-case emails match case-insensitively", () => {
    expect(
      decideBootstrap({
        email: "First.Admin@Example.COM",
        adminCount: 0,
        configuredEmail: "fIRST.aDMIN@eXAMPLE.com",
      }),
    ).toEqual({ kind: "allow", email: "First.Admin@Example.COM" });
  });

  it("denies an already-bootstrapped table before checking a matching email", () => {
    const configuredEmail = "first.admin@example.com";
    const decision = decideBootstrap({
      email: configuredEmail,
      adminCount: 1,
      configuredEmail,
    });

    expectDeniedWithoutConfiguredEmail(
      decision,
      configuredEmail,
      "already_bootstrapped",
    );
    expect(decision).toEqual({
      kind: "deny",
      status: 403,
      code: "already_bootstrapped",
      message: "An admin account already exists.",
    });
  });

  it.each([
    ["undefined", undefined],
    ["empty", ""],
  ])(
    "denies bootstrap_unavailable when configuredEmail is %s",
    (_label, configuredEmail) => {
      expect(
        decideBootstrap({
          email: "first.admin@example.com",
          adminCount: 0,
          configuredEmail,
        }),
      ).toEqual({
        kind: "deny",
        status: 403,
        code: "bootstrap_unavailable",
        message: "Bootstrap is not configured.",
      });
    },
  );

  it("denies a configured-email mismatch without leaking the configured email", () => {
    const configuredEmail = "permitted.admin@example.com";
    const decision = decideBootstrap({
      email: "someone.else@example.com",
      adminCount: 0,
      configuredEmail,
    });

    expectDeniedWithoutConfiguredEmail(
      decision,
      configuredEmail,
      "email_not_permitted",
    );
    expect(decision).toEqual({
      kind: "deny",
      status: 403,
      code: "email_not_permitted",
      message: "That address is not the configured admin email.",
    });
  });
});
