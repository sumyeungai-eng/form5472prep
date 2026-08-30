"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Partner = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  wantsWhiteLabel: boolean;
  whiteLabelEnabled: boolean;
  brandName: string | null;
  brandReplyTo: string | null;
  active: boolean;
  filingCount: number;
  createdAt: string;
};

type SaveStatus = { kind: "ok" | "error"; text: string } | null;

export function PartnersManager({ partners }: { partners: Partner[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Could not create");
      }
      setName("");
      setEmail("");
      setCompany("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(p: Partner) {
    const msg = p.active
      ? `Deactivate ${p.name} (${p.email})? They'll lose access immediately.`
      : `Activate ${p.name} (${p.email})? We'll email them a secure sign-in link right away.`;
    if (!confirm(msg)) return;
    await fetch("/api/admin/partners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Create */}
      <form onSubmit={create} className="rounded-lg border border-slate-200 bg-white p-5">
        <p className="font-medium text-slate-900 mb-3">Add a partner</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contact / agency name"
            required
            className="text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="partner@agency.com"
            required
            className="text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company (optional)"
            className="text-sm px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-3 text-sm font-medium px-4 py-2 rounded-md bg-accent text-white hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Adding…" : "Add partner"}
        </button>
      </form>

      {/* List */}
      {partners.length === 0 ? (
        <p className="text-sm text-slate-500">No partners yet.</p>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-200">
          {partners.map((p) => (
            <PartnerRow key={p.id} partner={p} onToggleActive={toggleActive} onSaved={() => router.refresh()} />
          ))}
        </div>
      )}
    </div>
  );
}

function PartnerRow({
  partner: p,
  onToggleActive,
  onSaved,
}: {
  partner: Partner;
  onToggleActive: (partner: Partner) => Promise<void>;
  onSaved: () => void;
}) {
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(p.whiteLabelEnabled);
  const [brandName, setBrandName] = useState(p.brandName ?? "");
  const [brandReplyTo, setBrandReplyTo] = useState(p.brandReplyTo ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SaveStatus>(null);
  const showBrandWarning = whiteLabelEnabled && !brandName.trim();

  async function saveWhiteLabel() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/partners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          whiteLabelEnabled,
          brandName,
          brandReplyTo,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Save failed");
      }
      setStatus({ kind: "ok", text: "Saved ✓" });
      onSaved();
    } catch (err) {
      setStatus({ kind: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate">
            {p.name}
            {p.company ? <span className="text-slate-400 font-normal"> · {p.company}</span> : null}
            {p.wantsWhiteLabel ? (
              <span className="ml-2 align-middle text-xs font-medium rounded-full px-2 py-0.5 bg-amber-100 text-amber-800">
                White-label interest
              </span>
            ) : null}
            {p.whiteLabelEnabled ? (
              <span className="ml-2 align-middle text-xs font-medium rounded-full px-2 py-0.5 bg-indigo-100 text-indigo-800">
                White-label enabled
              </span>
            ) : null}
          </p>
          <p className="text-sm text-slate-500">
            {p.email}
            {p.phone ? <span className="text-slate-400"> · {p.phone}</span> : null}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {p.filingCount} filing{p.filingCount === 1 ? "" : "s"} · added {p.createdAt}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-none">
          <span
            className={`text-xs font-medium rounded-full px-2.5 py-1 ${
              p.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
            }`}
          >
            {p.active ? "Active" : "Inactive"}
          </span>
          <button
            type="button"
            onClick={() => onToggleActive(p)}
            className="text-sm text-slate-600 hover:text-slate-900 underline"
          >
            {p.active ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-2">
          <input
            id={`white-label-${p.id}`}
            type="checkbox"
            checked={whiteLabelEnabled}
            onChange={(e) => setWhiteLabelEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent/40"
          />
          <label htmlFor={`white-label-${p.id}`} className="text-sm font-medium text-slate-800">
            White-label
          </label>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start">
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Brand name"
            className="text-sm px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <input
            type="email"
            value={brandReplyTo}
            onChange={(e) => setBrandReplyTo(e.target.value)}
            placeholder="reply-to@partner.com"
            className="text-sm px-3 py-2 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
          />
          <button
            type="button"
            onClick={saveWhiteLabel}
            disabled={saving}
            className="text-sm font-medium px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        <div className="mt-2 min-h-5">
          {showBrandWarning ? (
            <p className="text-xs text-amber-700">Brand name required for white-label to take effect.</p>
          ) : null}
          {status ? (
            <p className={`text-xs ${status.kind === "ok" ? "text-emerald-700" : "text-red-600"}`}>
              {status.text}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
