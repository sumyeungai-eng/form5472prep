"use client";

import { useEffect, useState } from "react";
import type { AdminCounters } from "@/lib/admin/counters";

export function useAdminCounters(): AdminCounters | null {
  const [counters, setCounters] = useState<AdminCounters | null>(null);

  useEffect(() => {
    let controller: AbortController | null = null;

    async function load() {
      controller?.abort();
      controller = new AbortController();

      try {
        const res = await fetch("/api/admin/counters", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) return;
        setCounters(await res.json() as AdminCounters);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Keep the last good counter snapshot; the nav should never flash
        // zeros just because a polling request failed.
      }
    }

    function loadIfVisible() {
      if (document.visibilityState === "visible") void load();
    }

    void load();
    const interval = window.setInterval(loadIfVisible, 60_000);
    document.addEventListener("visibilitychange", loadIfVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", loadIfVisible);
      controller?.abort();
    };
  }, []);

  return counters;
}
