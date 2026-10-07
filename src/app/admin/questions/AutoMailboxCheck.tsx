"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Opening the Questions pages quietly checks the support@ mailbox first (when
// the last check is older than STALE_MS), then refreshes, so customer replies
// that arrived by email show up without waiting for the 10-minute cron.
const STALE_MS = 2 * 60_000;

export function AutoMailboxCheck({ connected, lastRunAt }: { connected: boolean; lastRunAt: string | null }) {
  const router = useRouter();
  const started = useRef(false);
  const [state, setState] = useState<"idle" | "checking" | "new" | "error">("idle");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!connected || started.current) return;
    if (lastRunAt && Date.now() - new Date(lastRunAt).getTime() < STALE_MS) return;
    started.current = true;
    setState("checking");
    void (async () => {
      try {
        const res = await fetch("/api/admin/questions/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full: false }),
        });
        if (!res.ok) {
          setState("error");
          return;
        }
        const data = (await res.json()) as Record<string, number>;
        const changed =
          (data.questionsImported ?? 0) + (data.answersImported ?? 0) + (data.followUpsImported ?? 0) > 0;
        setState(changed ? "new" : "idle");
        startTransition(() => router.refresh());
      } catch {
        setState("error");
      }
    })();
  }, [connected, lastRunAt, router]);

  if (state === "idle") return null;
  const text =
    state === "checking"
      ? "Checking the support@ mailbox for new replies…"
      : state === "new"
        ? "New email replies were added."
        : "Could not check the mailbox just now. The 10-minute check will try again.";
  const tone = state === "error" ? "text-red-700" : state === "new" ? "text-emerald-700" : "text-slate-500";
  return (
    <p className={`mb-3 text-xs ${tone}`} role="status" aria-live="polite">
      {text}
    </p>
  );
}
