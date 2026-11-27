"use server";

import { I18N_ENABLED } from "@/config/i18n-switch.mjs";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { normalizeLocale } from "./locales";

export async function setLocale(locale: string): Promise<void> {
  if (!I18N_ENABLED) return;
  const normalized = normalizeLocale(locale);
  cookies().set("NEXT_LOCALE", normalized, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  try {
    const user = await getCurrentUser();
    if (user) await prisma.user.update({ where: { id: user.id }, data: { locale: normalized } });
  } catch (error) {
    console.warn("[i18n] Could not save account language", error);
  }
}
