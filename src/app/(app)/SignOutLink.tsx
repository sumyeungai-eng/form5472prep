"use client";
import { useTranslations } from "next-intl";

import { useRouter } from "next/navigation";

export function SignOutLink() {
  const t = useTranslations();
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={signOut} className="text-slate-500 hover:text-slate-900 text-sm">
      {t("portal.layout.signOut")}
    </button>
  );
}
