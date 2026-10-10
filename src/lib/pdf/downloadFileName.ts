// e.g. "Form5472_Acme-Holdings-LLC_2024-2025_unsigned.pdf" — ASCII only, so
// the header is always valid whatever the LLC name contains.
export function downloadFileName(llcName: string | null, taxYears: number[], kind: string): string {
  const name = (llcName ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // drop accents: "Ñ" → "N", not "N-"
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const years = taxYears.length > 0 ? taxYears.join("-") : "";
  return ["Form5472", name || "filing", years, kind].filter(Boolean).join("_") + ".pdf";
}
