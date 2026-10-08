"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";

// Row tick boxes + action bar for archiving several filings at once. The
// table stays a server component: rows render <ArchiveCheckbox>, and the bar
// reads which boxes are ticked from the DOM (data-archive-id).

const SELECTOR = "input[data-archive-id]";

function checkedIds(): string[] {
  return Array.from(document.querySelectorAll<HTMLInputElement>(SELECTOR))
    .filter((el) => el.checked)
    .map((el) => el.dataset.archiveId!)
    .filter(Boolean);
}

export function ArchiveCheckbox({ filingId, label }: { filingId: string; label: string }) {
  return (
    <input
      type="checkbox"
      data-archive-id={filingId}
      aria-label={label}
      className="h-4 w-4 rounded border-slate-300 accent-accent"
      onChange={() => document.dispatchEvent(new Event("archive-selection"))}
    />
  );
}

export function ArchiveSelectAll() {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    const sync = () => {
      const boxes = Array.from(document.querySelectorAll<HTMLInputElement>(SELECTOR));
      setChecked(boxes.length > 0 && boxes.every((b) => b.checked));
    };
    document.addEventListener("archive-selection", sync);
    return () => document.removeEventListener("archive-selection", sync);
  }, []);
  return (
    <input
      type="checkbox"
      aria-label="Select all archivable orders on this page"
      checked={checked}
      className="h-4 w-4 rounded border-slate-300 accent-accent"
      onChange={(e) => {
        document.querySelectorAll<HTMLInputElement>(SELECTOR).forEach((b) => {
          b.checked = e.target.checked;
        });
        document.dispatchEvent(new Event("archive-selection"));
      }}
    />
  );
}

export function BulkArchiveBar({ archiveView }: { archiveView: boolean }) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const sync = () => setCount(checkedIds().length);
    document.addEventListener("archive-selection", sync);
    return () => document.removeEventListener("archive-selection", sync);
  }, []);

  async function run() {
    const ids = checkedIds();
    if (ids.length === 0 || busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/filings/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, archive: !archiveView }),
      });
      const data = (await res.json().catch(() => ({}))) as { updated?: number; skipped?: number; error?: string };
      if (!res.ok) {
        setMsg({ tone: "err", text: data.error ?? "Could not update the selected orders." });
        return;
      }
      const verb = archiveView ? "unarchived" : "archived";
      const skipped = data.skipped
        ? ` ${data.skipped} skipped${archiveView ? "" : " (orders still in progress can't be archived)"}.`
        : "";
      setMsg({ tone: "ok", text: `${data.updated ?? 0} order${data.updated === 1 ? "" : "s"} ${verb}.${skipped}` });
      document.querySelectorAll<HTMLInputElement>(SELECTOR).forEach((b) => {
        b.checked = false;
      });
      document.dispatchEvent(new Event("archive-selection"));
      setCount(0);
      startTransition(() => router.refresh());
    } catch {
      setMsg({ tone: "err", text: "Could not update the selected orders. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
      <button
        type="button"
        onClick={() => void run()}
        disabled={count === 0 || busy}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        {archiveView ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
        {busy ? "Working…" : `${archiveView ? "Unarchive" : "Archive"} selected${count ? ` (${count})` : ""}`}
      </button>
      <span className="text-xs text-slate-500">
        {archiveView
          ? "Unarchived orders return to the main list."
          : "Tick drafts or finished orders (confirmed or failed). Orders still in progress can't be archived."}
      </span>
      {msg ? (
        <span className={`text-xs ${msg.tone === "ok" ? "text-emerald-700" : "text-red-700"}`} role="status">
          {msg.text}
        </span>
      ) : null}
    </div>
  );
}
