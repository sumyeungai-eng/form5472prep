"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VisitPing() {
  const pathname = usePathname();
  const lastPingedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || lastPingedPath.current === pathname) return;
    lastPingedPath.current = pathname;

    const body = JSON.stringify({
      p: pathname,
      r: document.referrer || null,
      w: window.innerWidth,
    });

    const blob = new Blob([body], { type: "application/json" });
    const sent = navigator.sendBeacon?.("/api/session/ping", blob) ?? false;
    if (sent) return;

    fetch("/api/session/ping", {
      method: "POST",
      body,
      keepalive: true,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  }, [pathname]);

  return null;
}
