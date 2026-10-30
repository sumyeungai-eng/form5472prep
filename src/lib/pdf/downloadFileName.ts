// e.g. "Acme Holdings LLC - Form 5472 - 2024, 2025 - signed.pdf". Neutral (no
// brand), ASCII only and free of quotes/slashes/semicolons, so it is safe in a
// Content-Disposition header, a MIME attachment name and on any file system.
export function downloadFileName(
  llcName: string | null | undefined,
  taxYears: number[] | null | undefined,
  kind: string,
): string {
  const clean = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "") // drop accents: "Ñ" -> "N"
      .replace(/[^A-Za-z0-9 &'-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const name = clean(llcName ?? "").slice(0, 60).trim() || "LLC";
  const years = (taxYears ?? []).join(", ");
  return [name, "Form 5472", years, clean(kind)].filter(Boolean).join(" - ") + ".pdf";
}
