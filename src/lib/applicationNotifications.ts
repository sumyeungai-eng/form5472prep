import {
  sendEinApplicationAdminEmail,
  sendEinApplicationConfirmationEmail,
  sendItinApplicationAdminEmail,
  sendItinApplicationConfirmationEmail,
} from "@/lib/email";
import { env } from "@/lib/env";
import { makeMagicLink } from "@/lib/magicLink";
import { prisma } from "@/lib/prisma";

export async function notifyApplicationPaid(type: "ein" | "itin", applicationId: string): Promise<void> {
  if (type === "ein") {
    const app = await prisma.einApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });
    if (!app) {
      console.error("[applicationNotifications] EIN application not found", { applicationId });
      return;
    }

    try {
      await sendEinApplicationAdminEmail({
        adminEmail: env.adminEmail,
        fullName: app.fullName,
        email: app.email,
        phone: app.phone ?? undefined,
        llcName: app.llcName,
        llcState: app.llcState ?? undefined,
        llcFormedDate: app.llcFormedDate ?? undefined,
        businessMailingAddress: app.businessMailingAddress ?? undefined,
        businessType: app.businessType ?? undefined,
        businessPurpose: app.businessPurpose ?? undefined,
        principalProducts: app.principalProducts ?? undefined,
        ownerName: app.ownerName ?? undefined,
        dateOfBirth: app.dateOfBirth,
        ownerHomeAddress: app.ownerHomeAddress ?? undefined,
        ownerCitizenship: app.ownerCitizenship ?? undefined,
        ownerResidence: app.ownerResidence ?? undefined,
        passportNumber: app.passportNumber ?? undefined,
        notes: app.notes ?? undefined,
        amountPaidCents: app.amountPaid,
      });
    } catch (err) {
      console.error("[applicationNotifications] EIN admin email failed", err);
    }

    if (!app.user) {
      console.error("[applicationNotifications] EIN confirmation email skipped; user missing", { applicationId });
      return;
    }

    try {
      await sendEinApplicationConfirmationEmail({
        email: app.email,
        fullName: app.fullName,
        llcName: app.llcName,
        portalLink: makeMagicLink(app.user.id),
      });
    } catch (err) {
      console.error("[applicationNotifications] EIN confirmation email failed", err);
    }
    return;
  }

  const app = await prisma.itinApplication.findUnique({
    where: { id: applicationId },
    include: { user: true },
  });
  if (!app) {
    console.error("[applicationNotifications] ITIN application not found", { applicationId });
    return;
  }

  try {
    await sendItinApplicationAdminEmail({
      adminEmail: env.adminEmail,
      fullName: app.fullName,
      email: app.email,
      phone: app.phone ?? undefined,
      dateOfBirth: app.dateOfBirth ?? undefined,
      countryOfBirth: app.countryOfBirth ?? undefined,
      citizenship: app.citizenship ?? undefined,
      countryOfResidence: app.countryOfResidence ?? undefined,
      itinReason: app.itinReason,
      taxReturnType: app.taxReturnType ?? undefined,
      usActivity: app.usActivity ?? undefined,
      passportNumber: app.passportNumber ?? undefined,
      passportExpiry: app.passportExpiry ?? undefined,
      notes: app.notes ?? undefined,
      amountPaidCents: app.amountPaid,
    });
  } catch (err) {
    console.error("[applicationNotifications] ITIN admin email failed", err);
  }

  if (!app.user) {
    console.error("[applicationNotifications] ITIN confirmation email skipped; user missing", { applicationId });
    return;
  }

  try {
    await sendItinApplicationConfirmationEmail({
      email: app.email,
      fullName: app.fullName,
      portalLink: makeMagicLink(app.user.id),
    });
  } catch (err) {
    console.error("[applicationNotifications] ITIN confirmation email failed", err);
  }
}
