"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildFlagMessage, FLAG_NOTE_MAX } from "@/lib/flagMessage";

export function DeterminationFlag({
  filingId,
  sentence,
  initialOpen = false,
  initialNote = "",
  initialState = "idle",
}: {
  filingId: string;
  sentence: string;
  /** Preview-only. Production never passes these. */
  initialOpen?: boolean;
  initialNote?: string;
  initialState?: "idle" | "sent";
}) {
  // Escape hatch: "this doesn't match my situation" posts into the existing
  // per-filing message thread the accountant already watches. The trigger
  // reveals a small panel (flagPanelOpen) where the customer can add an
  // optional note before sending; the note is advisory only and never
  // affects the determination or the step flow.
  const [flagState, setFlagState] = useState<"idle" | "sending" | "sent">(initialState);
  const [flagError, setFlagError] = useState<string | null>(null);
  const [flagPanelOpen, setFlagPanelOpen] = useState(initialOpen);
  const [flagNote, setFlagNote] = useState(initialNote);
  const flagNoteId = useId();

  // "This doesn't match my situation" — the escape hatch behind every
  // automated characterisation. Posts the exact sentence the customer was
  // shown, plus their optional note, into the filing's message thread so the
  // accountant can see what the wizard claimed and what's different, not
  // just that it was wrong.
  async function flagDetermination(sentence: string, note: string) {
    if (flagState !== "idle") return;
    setFlagState("sending");
    setFlagError(null);
    try {
      const res = await fetch(`/api/filings/${filingId}/messages?as=customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: buildFlagMessage(sentence, note) }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        setFlagError(json.error || `Could not send (${res.status})`);
        setFlagState("idle");
        return;
      }
      setFlagState("sent");
      setFlagPanelOpen(false);
    } catch {
      setFlagError("Could not send. Please try again.");
      setFlagState("idle");
    }
  }

  function cancelFlagPanel() {
    setFlagPanelOpen(false);
    setFlagNote("");
    setFlagError(null);
  }

  return (
    <div className="rounded-md bg-slate-50 border border-slate-200 p-4 text-sm">
      <p className="text-slate-700">{sentence}</p>
      <div className="mt-2">
        {flagState === "sent" ? (
          <p className="text-xs text-emerald-700">
            ✓ Thanks. We have flagged this for review and will email you before anything is
            filed.
          </p>
        ) : flagPanelOpen ? (
          <div className="space-y-2">
            <label htmlFor={flagNoteId} className="block text-xs font-medium text-slate-700">
              Tell us what is different (optional)
            </label>
            <textarea
              id={flagNoteId}
              value={flagNote}
              onChange={(e) => setFlagNote(e.target.value)}
              maxLength={FLAG_NOTE_MAX}
              rows={3}
              placeholder="For example: my accountant e-filed the 7004 on March 12, or the LLC dissolved in June."
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:bg-slate-50"
            />
            {flagNote.length > 400 && (
              <p className="text-xs text-slate-500">{flagNote.length}/500</p>
            )}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                size="sm"
                disabled={flagState === "sending"}
                onClick={() => void flagDetermination(sentence, flagNote)}
              >
                {flagState === "sending" ? "Sending…" : "Send to our team"}
              </Button>
              <button
                type="button"
                onClick={cancelFlagPanel}
                disabled={flagState === "sending"}
                className="text-xs text-slate-500 underline hover:text-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            {flagError && <p className="text-xs text-red-600 mt-1">{flagError}</p>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setFlagPanelOpen(true)}
            className="text-xs text-slate-500 underline hover:text-slate-700"
          >
            This doesn&apos;t match my situation
          </button>
        )}
      </div>
    </div>
  );
}
