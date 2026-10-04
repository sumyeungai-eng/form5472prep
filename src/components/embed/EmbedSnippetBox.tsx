"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

// Read-only code box + Copy button (client: needs onFocus select and the Clipboard API).
export function EmbedSnippetBox({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      window.setTimeout(() => setState((s) => (s === "copied" ? "idle" : s)), 2500);
    } catch {
      // Clipboard API blocked — the snippet is already in a selectable textarea.
      setState("manual");
    }
  }

  return (
    <div>
      <label htmlFor="embed-snippet" className="sr-only">
        Embed code
      </label>
      <textarea
        id="embed-snippet"
        readOnly
        rows={5}
        value={text}
        onFocus={(event) => event.currentTarget.select()}
        className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-800 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
      <div className="mt-3 flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={copy} className="gap-2">
          {state === "copied" ? (
            <Check className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden />
          )}
          {state === "copied" ? "Copied" : "Copy embed code"}
        </Button>
        {state === "manual" ? (
          <span className="text-xs text-slate-600">Select the code above and copy it manually.</span>
        ) : null}
      </div>
    </div>
  );
}
