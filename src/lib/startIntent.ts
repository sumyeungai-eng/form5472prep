// Decides what a Google sign-in on /start (or /file) should do for this
// account. Extracted from the auth route so the decision itself is a pure,
// independently testable function.
//
// The bug this fixes: a returning customer clicking "Start filing" in the
// header and signing in with Google always got a brand-new DRAFT filing
// (findOrCreateDraftFiling was called whenever they had no existing DRAFT),
// even when they already had one or more non-draft filings. That littered
// their account, and the admin filings list, with empty "Unnamed filing"
// drafts. Signing in must never create a filing for someone who already has
// one — first-time customers (zero filings, no draft) are unaffected.
export type StartOutcome =
  | { action: "open-draft"; reason: "existing-draft" } // reuse the draft they already have
  | { action: "create-draft"; reason: "new-customer" } // first-timer: unchanged funnel
  | { action: "go-to-filings"; reason: "returning-customer" }; // has filings, no draft: never auto-create

export function decideStartOutcome(input: {
  hasDraft: boolean;
  filingCount: number;
}): StartOutcome {
  if (input.hasDraft) return { action: "open-draft", reason: "existing-draft" };
  if (input.filingCount > 0) return { action: "go-to-filings", reason: "returning-customer" };
  return { action: "create-draft", reason: "new-customer" };
}
