// Shared guard for the partner-issued "client intake link" — lets a partner
// hand off a DRAFT filing to their client so the client can fill in the
// wizard and upload documents themselves, before any signing happens.
//
// This is deliberately the mirror image of the sign-link guard
// (send-sign-link/route.ts, sign-link/route.ts): that one requires the PDF
// to already exist and nothing signed yet; this one requires the filing to
// still be an untouched DRAFT — once payment happens the wizard is closed
// off and the sign link takes over.
export type InviteGuard = { ok: true } | { ok: false; status: 404 | 409; error: string };

export function checkClientInvite(
  filing: { partnerId: string | null; status: string; signedPdfKey: string | null },
  partnerId: string,
): InviteGuard {
  if (filing.partnerId !== partnerId) {
    return { ok: false, status: 404, error: "Not found" };
  }
  if (filing.status !== "DRAFT") {
    return {
      ok: false,
      status: 409,
      error: "The client intake link only works before payment. Use the sign link instead.",
    };
  }
  if (filing.signedPdfKey) {
    return {
      ok: false,
      status: 409,
      error: "The client intake link only works before payment. Use the sign link instead.",
    };
  }
  return { ok: true };
}
