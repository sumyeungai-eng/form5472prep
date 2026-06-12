"use client";

import { useRouter } from "next/navigation";

export function PartnerSignOut() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/partner/sign-out", { method: "POST" });
    router.push("/partner/sign-in");
    router.refresh();
  }
  return (
    <button type="button" onClick={signOut} className="text-slate-500 hover:text-slate-900">
      Sign out
    </button>
  );
}
