"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const EIN_STATUSES = [
  "RECEIVED",
  "IN_REVIEW",
  "DOCS_REQUESTED",
  "PAYMENT_PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
];

function formatStatus(s: string) {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function EinAdminActions({
  id,
  currentStatus,
  currentAdminNotes,
  currentEin,
}: {
  id: string;
  currentStatus: string;
  currentAdminNotes: string;
  currentEin: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [adminNotes, setAdminNotes] = useState(currentAdminNotes);
  const [ein, setEin] = useState(currentEin);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/admin/applications/ein/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes, ein }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        Update application
      </h2>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {EIN_STATUSES.map((s) => (
            <option key={s} value={s}>
              {formatStatus(s)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          EIN (once obtained)
        </label>
        <input
          value={ein}
          onChange={(e) => setEin(e.target.value)}
          placeholder="XX-XXXXXXX"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Notes to client (shown in their portal)
        </label>
        <textarea
          rows={3}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="e.g. 'We've received your documents and are filing with the IRS. EIN expected within 3 business days.'"
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
        ) : saved ? (
          "Saved ✓"
        ) : (
          "Save changes"
        )}
      </button>
    </div>
  );
}
