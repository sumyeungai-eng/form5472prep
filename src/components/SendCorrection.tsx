"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export const CORRECTION_PREFIX = "Correction before release:";

// "Send a correction" on the In-review screen. Posts to the filing's own
// message thread (api/filings/[id]/messages), so it stays on the order and
// staff see it on the admin filing page — not the website questions inbox.
export function SendCorrection({ filingId }: { filingId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function send() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/filings/${filingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: `${CORRECTION_PREFIX}\n\n${text.trim()}` }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setMsg({ ok: false, text: err.error ?? "Could not send. Please try again." });
        return;
      }
      setText("");
      setMsg({ ok: true, text: "Sent. Our team will update your package and reply in your messages below." });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
      <h2 className="font-medium">Send a correction</h2>
      <label className="block text-sm text-slate-600">
        Tell us what needs changing. It goes to the team reviewing your package.
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={4000}
          disabled={busy}
          className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </label>
      <Button onClick={send} disabled={busy || text.trim().length < 5}>
        {busy ? "Sending…" : "Send correction"}
      </Button>
      {msg && (
        <p role="status" className={`text-sm ${msg.ok ? "text-emerald-700" : "text-red-700"}`}>
          {msg.text}
        </p>
      )}
    </section>
  );
}
