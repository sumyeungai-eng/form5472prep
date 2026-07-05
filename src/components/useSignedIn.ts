"use client";

import { useEffect, useState } from "react";

// Shared client hook for the marketing header. Returns:
//   null  — still checking (render the signed-out default; it's correct for ~99%)
//   false — confirmed signed out
//   true  — signed in (swap to "My filings")
//
// The fetch to /api/me is memoized at module scope so the desktop auth buttons
// and the mobile menu share a single request per page load instead of two.
let cached: Promise<boolean> | null = null;

function fetchSignedIn(): Promise<boolean> {
  if (!cached) {
    cached = fetch("/api/me", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : { signedIn: false }))
      .then((d) => !!d.signedIn)
      .catch(() => false);
  }
  return cached;
}

export function useSignedIn(): boolean | null {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    fetchSignedIn().then((v) => {
      if (active) setSignedIn(v);
    });
    return () => {
      active = false;
    };
  }, []);
  return signedIn;
}
