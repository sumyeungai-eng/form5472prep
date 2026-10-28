import {
  sendEinApplicationAdminEmail,
  sendEinApplicationConfirmationEmail,
  sendExtensionApplicationAdminEmail,
  sendExtensionApplicationConfirmationEmail,
  sendItinApplicationAdminEmail,
  sendItinApplicationConfirmationEmail,
} from "@/lib/email";
import { env } from "@/lib/env";
import { makeMagicLink } from "@/lib/magicLink";
import { prisma } from "@/lib/prisma";

export async function notifyApplicationPaid(type: "ein" | "itin" | "extension", applicationId: string): Promise<void> {
  if (type === "extension") {
    await notifyExtensionPaid(applicationId);
    return;
  }
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
        amountPaidCents: app.amountPaid ?? 0,
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
      amountPaidCents: app.amountPaid ?? 0,
      portalLink: makeMagicLink(app.user.id),
    });
  } catch (err) {
    console.error("[applicationNotifications] ITIN confirmation email failed", err);
  }
}

// Form 7004 orders have no customer portal page yet (v1): the confirmation
// email carries the next steps and staff email the fax confirmation later.
async function notifyExtensionPaid(applicationId: string): Promise<void> {
  const app = await prisma.extensionApplication.findUnique({ where: { id: applicationId } });
  if (!app) {
    console.error("[applicationNotifications] Form 7004 order not found", { applicationId });
    return;
  }

  try {
    await sendExtensionApplicationAdminEmail({ ...app, adminEmail: env.adminEmail, amountPaidCents: app.amountPaid });
  } catch (err) {
    console.error("[applicationNotifications] Form 7004 admin email failed", err);
  }

  try {
    await sendExtensionApplicationConfirmationEmail({
      email: app.email,
      fullName: app.fullName,
      llcName: app.llcName,
      taxYear: app.taxYear,
      amountPaidCents: app.amountPaid,
    });
  } catch (err) {
    console.error("[applicationNotifications] Form 7004 confirmation email failed", err);
  }
}
