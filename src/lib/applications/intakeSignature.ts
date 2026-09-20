import { prisma } from "@/lib/prisma";
import { put } from "@/lib/storage";
import { INTAKE_CONSENT_VERSION } from "./intakeConsent";
import { clientIp } from "./customerSignature";

export function intakeSignatureKey(type: "ein" | "itin", applicationId: string): string {
  return `applications/${type}/${applicationId}/intake-signature.png`;
}

export async function storeIntakeSignature(
  type: "ein" | "itin",
  applicationId: string,
  pngBytes: Uint8Array,
  signerName: string,
  req: Request,
): Promise<void> {
  const key = intakeSignatureKey(type, applicationId);
  await put(key, pngBytes, "image/png");

  const data = {
    intakeSignaturePngKey: key,
    intakeSignedAt: new Date(),
    intakeSignerName: signerName,
    intakeSignatureIp: clientIp(req.headers),
    intakeSignatureUserAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    intakeConsentVersion: INTAKE_CONSENT_VERSION,
  };

  if (type === "ein") {
    await prisma.einApplication.update({ where: { id: applicationId }, data });
    return;
  }

  await prisma.itinApplication.update({ where: { id: applicationId }, data });
}
