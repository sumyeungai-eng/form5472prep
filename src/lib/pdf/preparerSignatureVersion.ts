export const MIN_HANDWRITTEN_PREPARER_NAME_VERSION = "2.5.2";
export const LEGACY_PREPARER_NAME_MESSAGE = "This PDF still has the typed preparer name, so a handwritten name would overlap it. Regenerate the PDF, or leave the name as typed.";
export const UNKNOWN_PREPARER_NAME_MESSAGE = "We can't tell whether this PDF already has a typed preparer name. Check that line is empty before placing the handwritten name.";

function parseVersion(version: string) {
  const match = version.match(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/);
  if (!match || match[0] !== version) return null;
  const parts = match.slice(1, 4).map(Number);
  if (!parts.every(Number.isSafeInteger)) return null;
  const prerelease = match[4];
  if (prerelease?.split(".").some((part) => /^0\d+$/.test(part))) return null;
  return { parts, prerelease };
}

export function supportsHandwrittenPreparerName(version: string | null | undefined): boolean {
  const parsed = typeof version === "string" ? parseVersion(version) : null;
  if (!parsed) return false;
  const { parts, prerelease } = parsed;
  const minimum = MIN_HANDWRITTEN_PREPARER_NAME_VERSION.split(".").map(Number);
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] !== minimum[i]) return parts[i] > minimum[i];
  }
  // A prerelease of the minimum still predates its stable release.
  return !prerelease;
}

export function preparerNameStatus(version: string | null): "unknown" | "allowed" | "blocked" {
  if (version === null) return "unknown";
  return supportsHandwrittenPreparerName(version) ? "allowed" : "blocked";
}

// Call server-side with the exact bytes selected for stamping. generatePackage
// writes Producer/Creator = "generator <semver>" and space-separated Keywords
// including "version=<semver>". External editors may preserve only one field.
export async function readPdfGeneratorVersion(bytes: Uint8Array): Promise<string | null> {
  try {
    // Keep pdf-lib out of the placement client's initial bundle (it imports the messages).
    const { PDFDocument } = await import("pdf-lib");
    const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
    const versions = [pdf.getProducer(), pdf.getCreator()]
      .map((value) => value?.match(/^generator (\S+)$/)?.[1]);
    for (const match of Array.from((pdf.getKeywords() ?? "").matchAll(/(?:^|[\s,;])version=([^\s,;]+)/g))) {
      versions.push(match[1]);
    }
    const valid = new Set(versions.filter((version): version is string => !!version && !!parseVersion(version)));
    // Missing, malformed or contradictory metadata cannot identify a version.
    return valid.size === 1 ? Array.from(valid)[0] : null;
  } catch {
    return null;
  }
}
