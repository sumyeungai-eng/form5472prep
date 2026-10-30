// A partner's END CLIENT (opened the partner's invite link) is a fourth
// audience, ranked just below the partner: no email form, no API call — their
// way back is the same invite link, so the control only saves the step.
// Pure derivation of what the wizard's "Save for later" control should show
// and do, based on who is looking at the filing. Three mutually exclusive
// audiences, checked in priority order: a PARTNER working on a client filing
// always gets sent back to their own dashboard (even if the filing happens to
// also be bound to a signed-in user's email — the partner is the one
// currently driving the wizard); a signed-in customer goes to their
// dashboard; everyone else is anonymous and gets offered an email link back
// to the draft instead of a destination to click to right now.
export type SaveForLaterMode =
  | { kind: "partner"; href: "/partner"; label: "Save and back to dashboard" }
  | { kind: "client"; label: "Save for later" }
  | { kind: "user"; href: "/dashboard"; label: "Save and exit" }
  | { kind: "anonymous"; label: "Save for later" };

export function saveForLaterMode(input: {
  isPartnerFiling: boolean;
  isSignedIn: boolean;
  isClient?: boolean;
}): SaveForLaterMode {
  if (input.isPartnerFiling) {
    return { kind: "partner", href: "/partner", label: "Save and back to dashboard" };
  }
  if (input.isClient) {
    return { kind: "client", label: "Save for later" };
  }
  if (input.isSignedIn) {
    return { kind: "user", href: "/dashboard", label: "Save and exit" };
  }
  return { kind: "anonymous", label: "Save for later" };
}
