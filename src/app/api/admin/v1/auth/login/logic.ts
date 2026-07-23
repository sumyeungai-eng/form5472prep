export type LoginDecision =
  | { kind: "allow-existing" }
  | { kind: "bootstrap" }
  | { kind: "deny" };

export function decideLogin(input: {
  adminExists: boolean;
  adminActive: boolean | null;
  adminCount: number;
  passwordOk: boolean;
}): LoginDecision {
  if (!input.passwordOk) {
    return { kind: "deny" };
  }

  if (input.adminExists) {
    return input.adminActive
      ? { kind: "allow-existing" }
      : { kind: "deny" };
  }

  return input.adminCount === 0
    ? { kind: "bootstrap" }
    : { kind: "deny" };
}
