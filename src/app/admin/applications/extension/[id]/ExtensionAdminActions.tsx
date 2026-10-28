"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { EXTENSION_STATUS_LABELS } from "@/lib/form7004";

export function ExtensionAdminActions({
  id,
  currentStatus,
  currentAdminNotes,
}: {
  id: string;
  currentStatus: string;
  currentAdminNotes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [adminNotes, setAdminNotes] = useState(currentAdminNotes);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/applications/extension/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes }),
    }).catch(() => null);
    setSaving(false);
    setMessage(res?.ok ? "Saved ✓" : "Could not save — try again.");
    if (res?.ok) router.refresh();
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        Update order
      </h2>

      <div>
        <label htmlFor="extension-status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
        <select
          id="extension-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {Object.entries(EXTENSION_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="extension-notes" className="block text-xs font-medium text-slate-600 mb-1">
          Internal notes (fax date, confirmation, follow-ups — not shown to the client)
        </label>
        <textarea
          id="extension-notes"
          rows={4}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="e.g. 'Faxed 2027-01-05 10:12 UTC, confirmation emailed to client.'"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full h-10 rounded-md bg-accent text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent-700 disabled:opacity-60 transition-colors"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Saving…
          </>
        ) : (
          "Save changes"
        )}
      </button>
      {message && <p role="status" className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}
