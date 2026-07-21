"use client";

import { useEffect, useState } from "react";

// Shared client hook for the marketing header. Returns:
//   null  — still checking (render the signed-out default; it's correct for ~99%)
//   false — confirmed signed out
//   true  — signed in (swap to "My filings")
//
// Fetches /api/me on every mount with no caching. An earlier version memoized
// the result in a module-scoped promise to save one request across the desktop
// buttons + mobile menu, but that cache was never invalidated: after a
// client-side (SPA) sign-in or sign-out the header kept showing the pre-auth
// state until a hard reload, and a transient /api/me failure got cached as
// "signed out" for the life of the JS bundle. Correctness beats the one saved
// request — /api/me is a tiny httpOnly-cookie check.
export function useSignedIn(): boolean | null {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      fetch("/api/me", { credentials: "same-origin", cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { signedIn: false }))
        .then((d) => {
          if (active) setSignedIn(!!d.signedIn);
        })
        .catch(() => {
          if (active) setSignedIn(false);
        });
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    // Re-check on mount and when the tab regains focus/visibility, so a
    // sign-in/out in another tab isn't shown stale.
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return signedIn;
}
