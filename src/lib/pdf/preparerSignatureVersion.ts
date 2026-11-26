// Kept free of server/image dependencies so the placement UI uses the same gate.
export const MIN_HANDWRITTEN_PREPARER_NAME_VERSION = "2.5.2";
export const LEGACY_PREPARER_NAME_MESSAGE = "This package was generated before handwritten preparer names and already has the typed name. Regenerate the PDF first, or leave the name as typed.";

export function supportsHandwrittenPreparerName(version: string | null | undefined): boolean {
  if (typeof version !== "string") return false;
  const match = version.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/);
  if (!match || match[0] !== version) return false;
  const parts = match.slice(1, 4).map(Number);
  if (!parts.every(Number.isSafeInteger)) return false;
  const prerelease = match[4];
  if (prerelease?.split(".").some((part) => /^0\d+$/.test(part))) return false;
  const minimum = MIN_HANDWRITTEN_PREPARER_NAME_VERSION.split(".").map(Number);
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] !== minimum[i]) return parts[i] > minimum[i];
  }
  // A prerelease of the minimum still predates its stable release.
  return !prerelease;
}
