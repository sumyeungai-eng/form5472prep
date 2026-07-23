export type BootstrapDecision =
  | { kind: "allow"; email: string }
  | { kind: "deny"; status: number; code: string; message: string };

export function decideBootstrap(input: {
  email: string;
  adminCount: number;
  configuredEmail: string | undefined;
}): BootstrapDecision {
  if (input.adminCount !== 0) {
    return {
      kind: "deny",
      status: 403,
      code: "already_bootstrapped",
      message: "An admin account already exists.",
    };
  }

  const configuredEmail = input.configuredEmail?.trim();
  if (!configuredEmail) {
    return {
      kind: "deny",
      status: 403,
      code: "bootstrap_unavailable",
      message: "Bootstrap is not configured.",
    };
  }

  if (input.email.toLowerCase() !== configuredEmail.toLowerCase()) {
    return {
      kind: "deny",
      status: 403,
      code: "email_not_permitted",
      message: "That address is not the configured admin email.",
    };
  }

  return { kind: "allow", email: input.email };
}
