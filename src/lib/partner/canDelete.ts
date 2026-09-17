// A partner may permanently delete only an unpaid draft of their own. Once a
// signed PDF exists the filing has left the "just a draft" phase in every
// way that matters to a client (they may have already reviewed/signed it),
// so deletion is refused even though the DB status might still read DRAFT in
// some odd intermediate state — this mirrors the DELETE endpoint's own
// status-only guard while adding the extra signature safety check for the UI.
export function canDeleteFiling(f: { status: string; signedPdfKey: string | null }): boolean {
  return f.status === "DRAFT" && f.signedPdfKey === null;
}
