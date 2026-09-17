// Pure helper for DELETE /api/filings/[id]: given the key-bearing fields and
// relations of a filing, returns every distinct object-storage key that
// belongs to it. Used to purge R2 after the filing's rows are gone — see
// the DELETE handler in src/app/api/filings/[id]/route.ts for how the
// result is consumed.
//
// NOTE on bankStatements: BankStatement does not relate to Filing directly —
// it hangs off FilingYearData (filingYearDataId), which itself relates to
// Filing. Callers must flatten `filing.yearData[].bankStatements` into a
// single array before building this shape.
export type FilingWithKeys = {
  generatedPdfKey: string | null;
  signedPdfKey: string | null;
  faxedPdfKey: string | null;
  faxConfirmationKey: string | null;
  signaturePngKey: string | null;
  extensionProofKey: string | null;
  dissolutionCertKey: string | null;
  documents: { fileKey: string }[];
  bankStatements: { fileKey: string }[];
  messages: { attachmentKey: string | null }[];
};

// Every distinct, non-empty storage key belonging to this filing, deduplicated.
export function collectFilingStorageKeys(f: FilingWithKeys): string[] {
  const scalarKeys: (string | null)[] = [
    f.generatedPdfKey,
    f.signedPdfKey,
    f.faxedPdfKey,
    f.faxConfirmationKey,
    f.signaturePngKey,
    f.extensionProofKey,
    f.dissolutionCertKey,
  ];

  const keys: string[] = [];
  for (const key of scalarKeys) {
    if (key) keys.push(key);
  }
  for (const doc of f.documents) {
    if (doc.fileKey) keys.push(doc.fileKey);
  }
  for (const stmt of f.bankStatements) {
    if (stmt.fileKey) keys.push(stmt.fileKey);
  }
  for (const msg of f.messages) {
    if (msg.attachmentKey) keys.push(msg.attachmentKey);
  }

  return Array.from(new Set(keys));
}
