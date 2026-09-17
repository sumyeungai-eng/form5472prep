// A Form 5472 filing is a relay: the partner prepares it, the client signs
// it, we fax it to the IRS. At any moment exactly one of those parties is
// holding the ball — this file names whose court it's in, from a single
// filing's status (plus the one bit of extra context, whether the client has
// already been invited, that splits DRAFT two ways).

export type Court = "you" | "client" | "irs" | "done";

export type Responsibility = { court: Court; label: string; hint: string };

// The statuses that belong to each court, for filtering (see
// src/lib/partner/filingList.ts#partnerFilingWhere). DRAFT appears under both
// "you" and "client" because responsibilityFor further splits it by whether
// the client has been invited to fill it in.
export const COURT_STATUSES: Record<Exclude<Court, "done"> | "done", string[]> = {
  you: ["DRAFT", "PAID", "PDF_GENERATED", "FAILED"],
  client: ["DRAFT", "SIGNATURE_PENDING"],
  irs: ["SIGNED_UPLOADED", "FAXED"],
  done: ["CONFIRMED"],
};

export function responsibilityFor(f: {
  status: string;
  clientInviteSentAt: Date | null;
  signedPdfKey: string | null;
}): Responsibility {
  switch (f.status) {
    case "DRAFT":
      return f.clientInviteSentAt
        ? { court: "client", label: "With your client", hint: "Filling in their details" }
        : { court: "you", label: "Needs you", hint: "Finish the details" };
    case "PAID":
    case "PDF_GENERATED":
      return { court: "you", label: "Needs you", hint: "Send the sign link" };
    case "SIGNATURE_PENDING":
      return { court: "client", label: "With your client", hint: "Waiting for their signature" };
    case "SIGNED_UPLOADED":
      return { court: "irs", label: "Filing with the IRS", hint: "Ready to fax" };
    case "FAXED":
      return { court: "irs", label: "Filing with the IRS", hint: "Faxed, waiting on confirmation" };
    case "CONFIRMED":
      return { court: "done", label: "Confirmed", hint: "Filed and confirmed" };
    case "FAILED":
      return { court: "you", label: "Needs you", hint: "Filing failed, needs attention" };
    default:
      return { court: "you", label: "Needs you", hint: "Check this filing" };
  }
}
